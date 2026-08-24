"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

const coreBaseUrl = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
const maxBytes = 500 * 1024 * 1024;
const acceptedExtensions = /\.(mp4|webm|mov|mkv|avi|m4v|mpeg|mpg)$/i;

type ConversionOutput = {
  zipUrl: string;
  playlistUrl: string;
  zipName: string;
  playlistName: string;
  segments: number;
  size: number;
  playlist: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function safeBaseName(name: string) {
  return (name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "video").slice(0, 80);
}

function isVideoFile(file: File) {
  return file.type.startsWith("video/") || acceptedExtensions.test(file.name);
}

export function VideoToM3u8Workbench() {
  const inputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadPromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const outputUrlsRef = useRef<string[]>([]);
  const [source, setSource] = useState<File | null>(null);
  const [segmentDuration, setSegmentDuration] = useState("6");
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isEngineLoaded, setIsEngineLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Choose a video to create an HLS package.");
  const [error, setError] = useState("");
  const [output, setOutput] = useState<ConversionOutput | null>(null);

  useEffect(() => () => {
    outputUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    ffmpegRef.current?.terminate();
  }, []);

  function clearOutput() {
    outputUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    outputUrlsRef.current = [];
    setOutput(null);
  }

  function selectFile(file: File | undefined) {
    if (!file) return;
    setError("");
    clearOutput();
    if (!isVideoFile(file)) {
      setSource(null);
      setError("Choose a video file such as MP4, WebM, MOV, MKV or AVI.");
      return;
    }
    if (file.size > maxBytes) {
      setSource(null);
      setError("For browser conversion, choose a video smaller than 500 MB.");
      return;
    }
    setSource(file);
    setProgress(0);
    setStatus("Ready · choose Convert to M3U8 when you are ready.");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function getEngine() {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    if (loadPromiseRef.current) return loadPromiseRef.current;

    const promise = (async () => {
      setStatus("Loading the local conversion engine…");
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`${coreBaseUrl}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${coreBaseUrl}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      setIsEngineLoaded(true);
      return ffmpeg;
    })().catch((loadError) => {
      loadPromiseRef.current = null;
      throw loadError;
    });
    loadPromiseRef.current = promise;
    return promise;
  }

  async function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source || isConverting) return;
    setIsConverting(true);
    setProgress(1);
    setError("");
    clearOutput();

    try {
      const [{ fetchFile }, { default: JSZip }] = await Promise.all([
        import("@ffmpeg/util"),
        import("jszip"),
      ]);
      const ffmpeg = await getEngine();
      const extension = source.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "mp4";
      const inputName = `input.${extension}`;
      const existingFiles = await ffmpeg.listDir(".");
      await Promise.all(existingFiles
        .filter((file) => !file.isDir && (file.name === "playlist.m3u8" || /^segment-\d+\.ts$/.test(file.name) || file.name === inputName))
        .map((file) => ffmpeg.deleteFile(file.name)));
      await ffmpeg.writeFile(inputName, await fetchFile(source));
      setStatus("Converting video to HLS segments…");
      const exitCode = await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-f", "hls",
        "-hls_time", segmentDuration,
        "-hls_playlist_type", "vod",
        "-hls_flags", "independent_segments",
        "-hls_segment_filename", "segment-%03d.ts",
        "playlist.m3u8",
      ]);
      if (exitCode !== 0) throw new Error("FFmpeg could not convert this video. Try a smaller or standard video file.");

      const playlistData = await ffmpeg.readFile("playlist.m3u8", "utf8");
      const playlist = typeof playlistData === "string" ? playlistData : new TextDecoder().decode(playlistData);
      const segmentFiles = (await ffmpeg.listDir("."))
        .filter((file) => !file.isDir && /^segment-\d+\.ts$/.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      if (!segmentFiles.length) throw new Error("No HLS segments were created. Try another video file.");

      const zip = new JSZip();
      zip.file("playlist.m3u8", playlist);
      for (const segment of segmentFiles) zip.file(segment.name, await ffmpeg.readFile(segment.name));
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      const baseName = safeBaseName(source.name);
      const playlistName = `${baseName}.m3u8`;
      const zipName = `${baseName}-hls.zip`;
      const zipUrl = URL.createObjectURL(zipBlob);
      const playlistUrl = URL.createObjectURL(new Blob([playlist], { type: "application/vnd.apple.mpegurl" }));
      outputUrlsRef.current = [zipUrl, playlistUrl];
      setOutput({ zipUrl, playlistUrl, zipName, playlistName, segments: segmentFiles.length, size: zipBlob.size, playlist });
      setProgress(100);
      setStatus("Done · your HLS package is ready.");
    } catch (conversionError) {
      setProgress(0);
      setError(conversionError instanceof Error ? conversionError.message : "The video could not be converted.");
      setStatus("Conversion stopped.");
    } finally {
      setIsConverting(false);
    }
  }

  function clearWorkspace() {
    setSource(null);
    clearOutput();
    setError("");
    setProgress(0);
    setStatus("Choose a video to create an HLS package.");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="video-converter-workbench" aria-label="Video to M3U8 workspace">
      <header className="utility-workbench__hero">
        <div>
          <h1>Video to M3U8</h1>
          <p>Convert a local video into an M3U8 playlist and HLS segments directly in your browser.</p>
        </div>
        <span className="video-converter__engine">{isEngineLoaded ? "ENGINE READY" : "LOCAL WASM"}</span>
      </header>

      <form onSubmit={convert}>
        <div className="video-converter__layout">
          <label
            className={`video-converter__dropzone${isDragging ? " is-dragging" : ""}`}
            htmlFor="video-to-m3u8-file"
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
            onDrop={handleDrop}
          >
            <input ref={inputRef} id="video-to-m3u8-file" type="file" accept="video/*,.mkv,.avi" onChange={handleFileChange} />
            <span className="video-converter__drop-icon" aria-hidden="true">↓</span>
            <b>{source ? source.name : "Drop a video here"}</b>
            <small>{source ? `${formatBytes(source.size)} · ready to convert` : "or click to choose MP4, WebM, MOV, MKV or AVI"}</small>
          </label>
          <aside className="video-converter__settings">
            <span className="video-converter__settings-label">HLS settings</span>
            <label htmlFor="hls-segment-duration">Segment duration</label>
            <select id="hls-segment-duration" value={segmentDuration} onChange={(event) => setSegmentDuration(event.target.value)} disabled={isConverting}>
              <option value="4">4 seconds · low latency</option>
              <option value="6">6 seconds · balanced</option>
              <option value="10">10 seconds · fewer files</option>
            </select>
            <p>Output uses H.264 video, AAC audio and MPEG-TS segments for broad HLS compatibility.</p>
          </aside>
        </div>
        <div className="video-converter__actions">
          <button type="submit" className="primary-button" disabled={!source || isConverting}>{isConverting ? `Converting ${progress}%` : "Convert to M3U8"}</button>
          <button type="button" className="ghost-button" onClick={clearWorkspace} disabled={isConverting}>Clear</button>
          <span>Runs locally · nothing is uploaded · max 500 MB</span>
        </div>
      </form>

      <div className="video-converter__status" role="status" aria-live="polite">
        <span className={error ? "is-error" : ""}>{error || status}</span>
        <span>{progress > 0 && isConverting ? `${progress}%` : "M3U8 + .ts output"}</span>
      </div>

      {output && (
        <section className="video-converter__result" aria-label="M3U8 conversion result">
          <div className="video-converter__result-head">
            <div><span className="utility-workbench__eyebrow">Conversion complete</span><h2>{output.segments} HLS segments ready</h2></div>
            <span>{formatBytes(output.size)}</span>
          </div>
          <div className="video-converter__result-actions">
            <a className="primary-button" href={output.zipUrl} download={output.zipName}>Download HLS package</a>
            <a className="ghost-button" href={output.playlistUrl} download={output.playlistName}>Download M3U8</a>
          </div>
          <textarea className="video-converter__playlist" readOnly value={output.playlist} aria-label="Generated M3U8 playlist" />
        </section>
      )}

      <p className="video-converter__note">The ZIP contains the playlist and every referenced segment. Upload the extracted files to the same folder on your server or CDN before using the M3U8 URL.</p>
    </section>
  );
}
