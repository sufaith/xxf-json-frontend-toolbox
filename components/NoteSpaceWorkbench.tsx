"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = { spaceName: string };
type SaveState = "loading" | "saved" | "saving" | "error";

function spaceApiUrl(spaceName: string) {
  return `/api/n/${encodeURIComponent(spaceName)}`;
}

export function NoteSpaceWorkbench({ spaceName }: Props) {
  const [activeSpaceName, setActiveSpaceName] = useState(spaceName);
  const [routeResolved, setRouteResolved] = useState(false);
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const isLoaded = useRef(false);
  const skipNextSave = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef(Promise.resolve());
  const changeVersion = useRef(0);

  const save = useCallback((value: string, version: number) => {
    saveQueue.current = saveQueue.current.then(async () => {
      const response = await fetch(spaceApiUrl(activeSpaceName), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
      if (!response.ok) throw new Error("Unable to save this space.");
      if (version === changeVersion.current) {
        setSaveState("saved");
        setError("");
      }
    }).catch((saveError: unknown) => {
      if (version === changeVersion.current) {
        setSaveState("error");
        setError(saveError instanceof Error ? saveError.message : "Unable to save this space.");
      }
    });
  }, [activeSpaceName]);

  const saveNow = useCallback(() => {
    if (!isLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const version = ++changeVersion.current;
    setSaveState("saving");
    save(content, version);
  }, [content, save]);

  useEffect(() => {
    const pathSlug = window.location.pathname.match(/^\/n\/([^/]+)\/?$/)?.[1];
    let nextSpaceName = spaceName;
    if (pathSlug) {
      try {
        nextSpaceName = decodeURIComponent(pathSlug);
      } catch {
        nextSpaceName = spaceName;
      }
    }
    const frame = window.requestAnimationFrame(() => {
      setActiveSpaceName(nextSpaceName);
      setRouteResolved(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [spaceName]);

  useEffect(() => {
    if (!routeResolved) return;
    let cancelled = false;
    fetch(spaceApiUrl(activeSpaceName), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to open this space.");
        return response.json() as Promise<{ content?: unknown }>;
      })
      .then((data) => {
        if (cancelled) return;
        isLoaded.current = true;
        skipNextSave.current = true;
        setContent(typeof data.content === "string" ? data.content : "");
        setSaveState("saved");
        setError("");
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setSaveState("error");
        setError(loadError instanceof Error ? loadError.message : "Unable to open this space.");
      });
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    };
  }, [activeSpaceName, routeResolved]);

  useEffect(() => {
    if (!isLoaded.current || !routeResolved) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const version = ++changeVersion.current;
    saveTimer.current = setTimeout(() => save(content, version), 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, routeResolved, save]);

  async function copySpaceLink() {
    await navigator.clipboard.writeText(window.location.href);
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    setCopied(true);
    copyResetTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="note-space" aria-label={`${activeSpaceName} shared space`}>
      <textarea
        className="note-space__editor"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setSaveState("saving");
          setError("");
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            saveNow();
          }
        }}
        placeholder="Start writing…"
        aria-label={`Write in ${activeSpaceName}`}
        spellCheck
      />
      <footer className="note-space__hint">
        <div className="note-space__identity">
          <span className="note-space__space-id">/n/{activeSpaceName}</span>
          <button
            type="button"
            className={`note-space__copy-icon${copied ? " note-space__copy-icon--copied" : ""}`}
            onClick={copySpaceLink}
            aria-label={copied ? "Copied" : "Copy space link"}
            title={copied ? "Copied" : "Copy space link"}
          >
            {copied ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="9" width="10" height="10" rx="2" />
                <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              </svg>
            )}
          </button>
        </div>
        <div className="note-space__meta">
          <span>{content.length.toLocaleString()} characters</span>
          {saveState === "error" ? (
            <>
              <span className="sr-only" role="status" aria-live="polite">{error || "Save failed"}</span>
              <button type="button" className="note-space__save" onClick={saveNow} title={error || "Retry saving"}>Save</button>
            </>
          ) : saveState === "loading" ? null : (
            <span className={`note-space__status note-space__status--${saveState}`} role="status" aria-live="polite">
              {saveState === "saving" ? "Saving" : "Saved"}
            </span>
          )}
        </div>
      </footer>
    </section>
  );
}
