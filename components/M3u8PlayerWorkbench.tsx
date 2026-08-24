"use client";

import { useEffect, useRef, useState } from "react";

const sampleStream = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export function M3u8PlayerWorkbench() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [input, setInput] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [status, setStatus] = useState("Paste an M3U8 URL to start.");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    const media = video;
    let cancelled = false;
    const clearPlayer = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      media.removeAttribute("src");
      media.load();
    };

    async function attachStream() {
      setIsLoading(true);
      setError("");
      setStatus("Preparing stream…");
      clearPlayer();

      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        media.crossOrigin = "anonymous";

        // Chromium can report "maybe" for HLS even though it cannot play an
        // M3U8 URL directly. Use MSE/Hls.js first, then fall back to native
        // HLS for Safari and other browsers that genuinely support it.
        if (Hls.isSupported()) {
          const player = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90 });
          hlsRef.current = player;
          player.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!cancelled) {
              setIsLoading(false);
              setStatus("Ready · press play");
            }
          });
          player.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal || cancelled) return;
            setIsLoading(false);
            setError(data.type === Hls.ErrorTypes.NETWORK_ERROR ? "The stream could not be reached. Check the URL and CORS settings." : "This HLS stream could not be decoded by the browser.");
            player.destroy();
            hlsRef.current = null;
          });
          player.loadSource(streamUrl);
          player.attachMedia(media);
          return;
        }

        if (media.canPlayType("application/vnd.apple.mpegurl")) {
          media.src = streamUrl;
          media.load();
          if (!cancelled) setStatus("Waiting for native HLS…");
          return;
        }

        throw new Error("This browser cannot play HLS streams.");
      } catch (loadError) {
        if (!cancelled) {
          setIsLoading(false);
          setError(loadError instanceof Error ? loadError.message : "HLS playback is not available in this browser.");
        }
      }
    }

    void attachStream();
    return () => {
      cancelled = true;
      clearPlayer();
    };
  }, [streamUrl]);

  function loadStream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsed = new URL(input.trim());
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Use a public HTTP or HTTPS M3U8 URL.");
      setStreamUrl(parsed.toString());
      setStatus("Preparing stream…");
    } catch (loadError) {
      setStreamUrl("");
      setError(loadError instanceof Error ? loadError.message : "Enter a valid M3U8 URL.");
      setStatus("Waiting for a valid stream URL.");
    }
  }

  function clearStream() {
    setInput("");
    setStreamUrl("");
    setError("");
    setStatus("Paste an M3U8 URL to start.");
  }

  return (
    <section className="video-player-workbench" aria-label="M3U8 Video Player workspace">
      <header className="utility-workbench__hero">
        <div><h1>M3U8 Video Player</h1><p>Play public M3U8 / HLS video streams with a clean browser-based player.</p></div>
      </header>
      <form className="video-player__form" onSubmit={loadStream}>
        <label htmlFor="m3u8-url">M3U8 stream URL</label>
        <div className="video-player__input-row"><input id="m3u8-url" value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com/playlist.m3u8" spellCheck={false} /><button type="submit" className="primary-button" disabled={!input.trim() || isLoading}>{isLoading ? "Loading…" : "Load stream"}</button></div>
        <div className="video-player__actions"><button type="button" className="ghost-button" onClick={() => setInput(sampleStream)}>Use public test stream</button><button type="button" className="ghost-button" onClick={clearStream}>Clear</button><span>Playback stays in your browser · no upload</span></div>
      </form>
      <div className="video-player__stage">
        {streamUrl ? <video ref={videoRef} controls playsInline preload="metadata" crossOrigin="anonymous" onError={(event) => { setIsLoading(false); setError(event.currentTarget.error?.code === 4 ? "The browser could not decode this HLS stream." : "The video element could not load this stream."); }} onLoadedMetadata={() => { setIsLoading(false); setStatus("Ready · press play"); }} /> : <div className="video-player__placeholder"><span aria-hidden="true">▶</span><b>Your stream will appear here</b><small>Paste a public .m3u8 URL above to begin.</small></div>}
      </div>
      <div className="video-player__status" role="status" aria-live="polite"><span className={error ? "is-error" : ""}>{error || status}</span><span>Hls.js + Native HLS fallback</span></div>
      <p className="video-player__note">The stream host must allow browser playback with CORS headers. DRM-protected, private or region-locked streams may not work.</p>
    </section>
  );
}
