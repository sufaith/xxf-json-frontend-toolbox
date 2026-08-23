"use client";

/* eslint-disable @next/next/no-img-element */

import { useDeferredValue, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";

type OutputFormat = "smart" | "original" | "image/webp" | "image/jpeg" | "image/png";
type SourceImage = { id: string; file: File; url: string };
type CompressionResult = {
  blob: Blob;
  fileName: string;
  mime: string;
  width: number;
  height: number;
};
type ItemResult =
  | { status: "processing" }
  | { status: "ready"; data: CompressionResult }
  | { status: "error"; message: string };

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFiles = 20;
const maxBytes = 25 * 1024 * 1024;
const formatOptions: Array<{ value: OutputFormat; label: string }> = [
  { value: "smart", label: "Smart" },
  { value: "original", label: "Keep type" },
  { value: "image/webp", label: "WebP" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function extensionFor(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

function outputName(name: string, mime: string) {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}-compressed.${extensionFor(mime)}`;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be decoded by your browser."));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("The compressed image could not be created.")),
      mime,
      quality,
    );
  });
}

async function encodeCandidate(image: HTMLImageElement, width: number, height: number, mime: string, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  if (mime === "image/png" && quality < .99) {
    const pixels = context.getImageData(0, 0, width, height);
    const step = Math.max(2, Math.round((1 - quality) * 28));
    for (let index = 0; index < pixels.data.length; index += 4) {
      pixels.data[index] = Math.round(pixels.data[index] / step) * step;
      pixels.data[index + 1] = Math.round(pixels.data[index + 1] / step) * step;
      pixels.data[index + 2] = Math.round(pixels.data[index + 2] / step) * step;
    }
    context.putImageData(pixels, 0, 0);
  }

  return canvasToBlob(canvas, mime, quality);
}

async function compressImage(source: SourceImage, format: OutputFormat, qualityPercent: number, maxDimension: number): Promise<CompressionResult> {
  const image = await loadImage(source.url);
  const scale = maxDimension > 0
    ? Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const quality = qualityPercent / 100;
  const originalMime = acceptedTypes.has(source.file.type) ? source.file.type : "image/webp";
  const candidateMimes = format === "smart"
    ? source.file.type === "image/png"
      ? ["image/webp", "image/png"]
      : ["image/webp", "image/jpeg"]
    : [format === "original" ? originalMime : format];

  const candidates = await Promise.all(candidateMimes.map(async (mime) => ({
    mime,
    blob: await encodeCandidate(image, width, height, mime, quality),
  })));

  if ((format === "smart" || format === "original") && scale === 1) {
    candidates.push({ mime: originalMime, blob: source.file });
  }

  const selected = format === "smart" || format === "original"
    ? candidates.reduce((smallest, candidate) => candidate.blob.size < smallest.blob.size ? candidate : smallest)
    : candidates[0];

  return {
    blob: selected.blob,
    fileName: outputName(source.file.name, selected.mime),
    mime: selected.mime,
    width,
    height,
  };
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ImageCompressorWorkbench() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const sourcesRef = useRef<SourceImage[]>([]);
  const [sources, setSources] = useState<SourceImage[]>([]);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [format, setFormat] = useState<OutputFormat>("smart");
  const [quality, setQuality] = useState(78);
  const deferredQuality = useDeferredValue(quality);
  const [maxDimension, setMaxDimension] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [message, setMessage] = useState("Drop images to begin.");

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  useEffect(() => () => {
    sourcesRef.current.forEach((source) => URL.revokeObjectURL(source.url));
  }, []);

  useEffect(() => {
    if (!sources.length) {
      setResults({});
      return;
    }
    let cancelled = false;
    setResults(Object.fromEntries(sources.map((source) => [source.id, { status: "processing" }])));

    async function run() {
      for (const source of sources) {
        if (cancelled) return;
        try {
          const data = await compressImage(source, format, deferredQuality, maxDimension);
          if (!cancelled) setResults((current) => ({ ...current, [source.id]: { status: "ready", data } }));
        } catch (error) {
          if (!cancelled) setResults((current) => ({
            ...current,
            [source.id]: { status: "error", message: error instanceof Error ? error.message : "Compression failed." },
          }));
        }
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [deferredQuality, format, maxDimension, sources]);

  const readyItems = useMemo(() => sources.flatMap((source) => {
    const result = results[source.id];
    return result?.status === "ready" ? [{ source, result: result.data }] : [];
  }), [results, sources]);
  const originalTotal = sources.reduce((total, source) => total + source.file.size, 0);
  const compressedTotal = readyItems.reduce((total, item) => total + item.result.blob.size, 0);
  const allReady = sources.length > 0 && readyItems.length === sources.length;
  const totalSavings = allReady && originalTotal > 0 ? Math.max(0, Math.round((1 - compressedTotal / originalTotal) * 100)) : 0;

  function addFiles(fileList: FileList | File[]) {
    const available = Math.max(0, maxFiles - sources.length);
    const files = Array.from(fileList);
    const valid = files.filter((file) => acceptedTypes.has(file.type) && file.size <= maxBytes).slice(0, available);
    if (!valid.length) {
      setMessage(available ? "Choose PNG, JPEG or WebP files up to 25 MB each." : `You can process up to ${maxFiles} images at once.`);
      return;
    }
    const additions = valid.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
    setSources((current) => [...current, ...additions]);
    const skipped = files.length - valid.length;
    setMessage(skipped ? `${valid.length} image${valid.length === 1 ? "" : "s"} added · ${skipped} skipped.` : `${valid.length} image${valid.length === 1 ? "" : "s"} added. Compressing locally…`);
  }

  function removeImage(id: string) {
    setSources((current) => {
      const removed = current.find((source) => source.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((source) => source.id !== id);
    });
    setResults((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function clearAll() {
    sources.forEach((source) => URL.revokeObjectURL(source.url));
    setSources([]);
    setResults({});
    setMessage("Drop images to begin.");
    if (uploadRef.current) uploadRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function openPicker(event?: KeyboardEvent<HTMLDivElement>) {
    if (event && event.key !== "Enter" && event.key !== " ") return;
    event?.preventDefault();
    uploadRef.current?.click();
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  async function downloadAll() {
    if (!allReady) return;
    setIsZipping(true);
    setMessage("Building your ZIP locally…");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      readyItems.forEach(({ result }, index) => zip.file(`${String(index + 1).padStart(2, "0")}-${result.fileName}`, result.blob));
      const archive = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(archive, "xxf-compressed-images.zip");
      setMessage(`${readyItems.length} compressed images downloaded.`);
    } catch {
      setMessage("The ZIP could not be created. Download images individually instead.");
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <section className="image-compressor-workbench" aria-label="Image Compressor workspace">
      <header className="compressor-topbar">
        <div className="compressor-brand"><span>IC</span><div><h1>Image Compressor</h1><small>Compress PNG, JPEG &amp; WebP locally</small></div></div>
        <div className="compressor-topbar__status"><i /> Browser-local processing</div>
        <div className="compressor-topbar__actions">
          {sources.length > 0 && <button type="button" onClick={clearAll}>Clear</button>}
          <button className="is-primary" type="button" onClick={() => uploadRef.current?.click()}>Add images</button>
        </div>
      </header>

      <div className="compressor-layout">
        <aside className="compressor-settings" aria-label="Compression settings">
          <div className="compressor-settings__head"><span>Settings</span><b>{sources.length}/{maxFiles}</b></div>
          <fieldset className="compressor-field">
            <legend>Output format</legend>
            <div className="compressor-format-grid">
              {formatOptions.map((option) => <button type="button" key={option.value} className={format === option.value ? "is-active" : ""} onClick={() => setFormat(option.value)}>{option.label}</button>)}
            </div>
            <small>Smart automatically keeps the smallest result.</small>
          </fieldset>
          <label className="compressor-field compressor-quality">
            <span>Quality <b>{quality}%</b></span>
            <input type="range" min="40" max="95" step="1" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
            <small>78% balances clean detail with a smaller file.</small>
          </label>
          <label className="compressor-field">
            <span>Maximum dimension</span>
            <select value={maxDimension} onChange={(event) => setMaxDimension(Number(event.target.value))}>
              <option value="0">Keep original size</option>
              <option value="2560">2560 px</option>
              <option value="1920">1920 px</option>
              <option value="1280">1280 px</option>
              <option value="960">960 px</option>
            </select>
          </label>
          <div className="compressor-private-note"><span>◎</span><div><b>Nothing is uploaded</b><p>Your images stay in this browser tab and disappear when you close it.</p></div></div>
        </aside>

        <section className="compressor-queue" aria-label="Compression queue">
          <div
            className={`compressor-dropzone ${sources.length ? "is-compact" : ""} ${isDragging ? "is-dragging" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => openPicker()}
            onKeyDown={openPicker}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <span className="compressor-dropzone__icon">⇧</span>
            <div><b>{sources.length ? "Drop more images" : "Drop images here"}</b><small>PNG, JPEG or WebP · up to 20 files · 25 MB each</small></div>
            <em>Choose files</em>
          </div>

          {sources.length > 0 && (
            <div className="compressor-results">
              <div className="compressor-results__head"><span>Compression queue</span><small>{readyItems.length} of {sources.length} ready</small></div>
              <div className="compressor-card-grid">
                {sources.map((source) => {
                  const result = results[source.id];
                  const ready = result?.status === "ready" ? result.data : null;
                  const savings = ready ? Math.round((1 - ready.blob.size / source.file.size) * 100) : 0;
                  return (
                    <article className="compressor-card" key={source.id}>
                      <div className="compressor-card__preview"><img src={source.url} alt="" /><span>{extensionFor(source.file.type).toUpperCase()}</span></div>
                      <div className="compressor-card__body">
                        <div className="compressor-card__title"><div><h3 title={source.file.name}>{source.file.name}</h3><small>{formatBytes(source.file.size)}</small></div><button type="button" aria-label={`Remove ${source.file.name}`} onClick={() => removeImage(source.id)}>×</button></div>
                        {result?.status === "error" ? <p className="compressor-card__error">{result.message}</p> : (
                          <div className="compressor-card__result">
                            <span>{result?.status === "processing" || !result ? "Compressing…" : `${formatBytes(ready!.blob.size)} · ${ready!.mime.replace("image/", "").toUpperCase()}`}</span>
                            {ready && <b className={savings > 0 ? "is-saving" : ""}>{savings > 0 ? `−${savings}%` : "Best kept"}</b>}
                          </div>
                        )}
                        <div className={`compressor-progress ${ready ? "is-ready" : ""}`}><span /></div>
                        <div className="compressor-card__foot"><small>{ready ? `${ready.width} × ${ready.height}` : "Processing locally"}</small><button type="button" disabled={!ready} onClick={() => ready && downloadBlob(ready.blob, ready.fileName)}>Download ⇩</button></div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className="compressor-summary">
        <span className="compressor-summary__message" role="status" aria-live="polite">{message}</span>
        <div className="compressor-summary__totals">
          {sources.length > 0 && <><span><small>Original</small><b>{formatBytes(originalTotal)}</b></span><i>→</i><span><small>Compressed</small><b>{allReady ? formatBytes(compressedTotal) : "…"}</b></span><em>{allReady ? `${totalSavings}% saved` : "Working"}</em></>}
          <button type="button" disabled={!allReady || isZipping} onClick={() => void downloadAll()}>{isZipping ? "Building ZIP…" : "Download all"}</button>
        </div>
      </footer>

      <input ref={uploadRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} />
    </section>
  );
}
