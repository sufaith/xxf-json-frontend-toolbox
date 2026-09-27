"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type KeyboardEvent } from "react";

type Props = { roomName: string };
type Identity = { deviceId: string; nickname: string; avatarSeed: string };
type ChatMedia = { key: string; url: string; type: string; name: string; size: number };
type ChatMessage = {
  id: number;
  room: string;
  deviceId: string;
  nickname: string;
  avatarSeed: string;
  kind: "text" | "image" | "video";
  content: string;
  media: ChatMedia | null;
  createdAt: string;
};

const DEVICE_KEY = "xxf-chat-device-v1";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const nicknameFirst = ["Quiet", "Silver", "Mellow", "Bright", "Little", "Lucky", "Amber", "Velvet", "Cosmic", "Gentle", "Indigo", "Sunny"];
const nicknameSecond = ["Otter", "Panda", "Robin", "Fox", "Koala", "Whale", "Finch", "Gecko", "Moth", "Lynx", "Badger", "Turtle"];
const avatarColors = ["#c8ff4d", "#c9d7ff", "#ffc7b8", "#d8caff", "#bee8da", "#ffe49a", "#bdd9ff", "#f2c7df"];

function hashNumber(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function profileFor(deviceId: string): Identity {
  const first = hashNumber(`${deviceId}:first`);
  const second = hashNumber(`${deviceId}:second`);
  return {
    deviceId,
    nickname: `${nicknameFirst[first % nicknameFirst.length]} ${nicknameSecond[second % nicknameSecond.length]}`,
    avatarSeed: deviceId,
  };
}

function readDeviceFromIndexedDb(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!("indexedDB" in window)) return resolve(null);
    const request = indexedDB.open("xxf-chat", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("identity");
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const transaction = request.result.transaction("identity", "readonly");
      const get = transaction.objectStore("identity").get(DEVICE_KEY);
      get.onsuccess = () => resolve(typeof get.result === "string" ? get.result : null);
      get.onerror = () => resolve(null);
    };
  });
}

function writeDeviceToIndexedDb(deviceId: string) {
  if (!("indexedDB" in window)) return;
  const request = indexedDB.open("xxf-chat", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("identity");
  request.onsuccess = () => {
    const transaction = request.result.transaction("identity", "readwrite");
    transaction.objectStore("identity").put(deviceId, DEVICE_KEY);
  };
}

async function getDeviceIdentity() {
  const localId = window.localStorage.getItem(DEVICE_KEY);
  const indexedId = await readDeviceFromIndexedDb();
  const deviceId = indexedId || localId || `device_${crypto.randomUUID()}`;
  window.localStorage.setItem(DEVICE_KEY, deviceId);
  writeDeviceToIndexedDb(deviceId);
  return profileFor(deviceId);
}

function roomMessagesUrl(room: string, after?: number) {
  const base = `/api/c/${encodeURIComponent(room)}/messages`;
  return after ? `${base}?after=${after}` : base;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function avatarStyle(seed: string) {
  const primary = avatarColors[hashNumber(seed) % avatarColors.length];
  const secondary = avatarColors[hashNumber(`${seed}:alt`) % avatarColors.length];
  return { background: `linear-gradient(145deg, ${primary}, ${secondary})` };
}

function formatTime(value: string) {
  const date = new Date(value.endsWith("Z") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return "now";
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function PaperclipIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20.5 11.5-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.7 9.7a2 2 0 1 1-2.8-2.8l8.9-8.9" /></svg>;
}

function SendIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Z" /><path d="M7 12h14" /></svg>;
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" /><path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg>;
}

export function ChatRoomWorkbench({ roomName }: Props) {
  const [activeRoom, setActiveRoom] = useState(roomName);
  const [routeResolved, setRouteResolved] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const afterId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pathSlug = window.location.pathname.match(/^\/c\/([^/]+)\/?$/)?.[1];
    let nextRoom = roomName;
    if (pathSlug) {
      try { nextRoom = decodeURIComponent(pathSlug); } catch { nextRoom = roomName; }
    }
    const frame = window.requestAnimationFrame(() => {
      setActiveRoom(nextRoom);
      setRouteResolved(true);
      getDeviceIdentity().then(setIdentity).catch(() => setError("Unable to create a device identity."));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [roomName]);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]));
      incoming.forEach((message) => byId.set(message.id, message));
      const next = [...byId.values()].sort((a, b) => a.id - b.id).slice(-300);
      afterId.current = next.at(-1)?.id ?? afterId.current;
      return next;
    });
  }, []);

  const loadMessages = useCallback(async (initial = false) => {
    if (!routeResolved) return;
    try {
      const response = await fetch(roomMessagesUrl(activeRoom, initial ? undefined : afterId.current), { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to reach this room.");
      const data = await response.json() as { messages?: ChatMessage[] };
      mergeMessages(Array.isArray(data.messages) ? data.messages : []);
      setError("");
    } catch (loadError) {
      if (initial) setError(loadError instanceof Error ? loadError.message : "Unable to reach this room.");
    } finally {
      if (initial) setLoading(false);
    }
  }, [activeRoom, mergeMessages, routeResolved]);

  useEffect(() => {
    if (!routeResolved) return;
    afterId.current = 0;
    const initialTimer = window.setTimeout(() => loadMessages(true), 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadMessages(false);
    }, 2000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [activeRoom, loadMessages, routeResolved]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto", block: "end" });
  }, [messages.length]);

  async function postMessage(payload: Partial<ChatMessage> & { kind: ChatMessage["kind"] }) {
    if (!identity) throw new Error("Device identity is not ready.");
    const response = await fetch(roomMessagesUrl(activeRoom), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...identity, ...payload }),
    });
    const data = await response.json() as { message?: ChatMessage; error?: string };
    if (!response.ok) throw new Error(data.error || "Message could not be sent.");
    if (data.message) mergeMessages([data.message]);
  }

  async function sendText(event?: FormEvent) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    setError("");
    try {
      await postMessage({ kind: "text", content });
    } catch (sendError) {
      setDraft(content);
      setError(sendError instanceof Error ? sendError.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function uploadFiles(files: File[]) {
    if (!identity) return setError("Device identity is not ready yet.");
    const accepted = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/")).slice(0, 4);
    if (!accepted.length) return setError("Choose an image or video.");
    if (accepted.some((file) => file.size > MAX_FILE_BYTES)) return setError("Each file must be 50 MB or smaller.");
    setSending(true);
    setError("");
    try {
      for (const file of accepted) {
        const upload = await fetch(`/api/c/${encodeURIComponent(activeRoom)}/upload`, {
          method: "POST",
          headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name), "X-Device-Id": identity.deviceId },
          body: file,
        });
        const media = await upload.json() as ChatMedia & { error?: string };
        if (!upload.ok) throw new Error(media.error || "Upload failed.");
        await postMessage({
          kind: file.type.startsWith("video/") ? "video" : "image",
          content: "",
          mediaKey: media.key,
          mediaType: media.type,
          mediaName: media.name,
          mediaSize: media.size,
        } as Partial<ChatMessage> & { kind: ChatMessage["kind"] });
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setSending(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(event.target.files ?? []));
  }

  function dropFiles(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    uploadFiles(Array.from(event.dataTransfer.files));
  }

  async function copyRoomLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  const roomLabel = useMemo(() => `/c/${activeRoom}`, [activeRoom]);

  return (
    <section
      className={`chat-room${dragging ? " chat-room--dragging" : ""}`}
      aria-label={`${activeRoom} chat room`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={dropFiles}
    >
      <header className="chat-room__header">
        <div className="chat-room__title">
          <span className="chat-room__live" aria-hidden="true" />
          <h1>{roomLabel}</h1>
          <button type="button" onClick={copyRoomLink} aria-label={copied ? "Room link copied" : "Copy room link"} title={copied ? "Copied" : "Copy room link"} className={copied ? "is-copied" : ""}><LinkIcon /></button>
        </div>
        {identity ? (
          <div className="chat-room__profile" title="This profile belongs to this browser device">
            <span style={avatarStyle(identity.avatarSeed)}>{initials(identity.nickname)}</span>
            <small>{identity.nickname}</small>
          </div>
        ) : <span className="chat-room__profile-loading">Creating profile…</span>}
      </header>

      <div className="chat-room__messages" aria-live="polite">
        {loading ? (
          <div className="chat-room__empty"><span className="chat-room__loader" /><p>Opening room…</p></div>
        ) : messages.length === 0 ? (
          <div className="chat-room__empty"><b>It’s quiet here.</b><p>Send the first message to start this room.</p></div>
        ) : messages.map((message) => {
          const own = message.deviceId === identity?.deviceId;
          return (
            <article className={`chat-message${own ? " chat-message--own" : ""}`} key={message.id}>
              {!own && <span className="chat-message__avatar" style={avatarStyle(message.avatarSeed)}>{initials(message.nickname)}</span>}
              <div className="chat-message__body">
                {!own && <span className="chat-message__name">{message.nickname}</span>}
                <div className={`chat-message__bubble chat-message__bubble--${message.kind}`}>
                  {message.kind === "text" ? <p>{message.content}</p> : message.kind === "image" && message.media ? (
                    <a href={message.media.url} target="_blank" rel="noreferrer" title={`Open ${message.media.name}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={message.media.url} alt={message.media.name} loading="lazy" decoding="async" />
                    </a>
                  ) : message.media ? (
                    <video controls playsInline preload="metadata" src={message.media.url} aria-label={message.media.name} />
                  ) : null}
                </div>
                <div className="chat-message__meta">
                  {message.media && <span>{formatBytes(message.media.size)}</span>}
                  <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
                </div>
              </div>
            </article>
          );
        })}
        <div ref={messageEnd} />
      </div>

      <div className="chat-room__composer-wrap">
        {error && <button type="button" className="chat-room__error" onClick={() => setError("")} title="Dismiss">{error}<span>×</span></button>}
        <form className="chat-room__composer" onSubmit={sendText}>
          <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={chooseFiles} />
          <button type="button" className="chat-room__attach" onClick={() => fileInput.current?.click()} disabled={!identity || sending} aria-label="Add image or video" title="Add image or video"><PaperclipIcon /></button>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 4000))}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendText(); }
            }}
            rows={1}
            placeholder="Message this room…"
            aria-label="Message"
            disabled={!identity || sending}
          />
          <button type="submit" className="chat-room__send" disabled={!draft.trim() || !identity || sending} aria-label="Send message" title="Send"><SendIcon /></button>
        </form>
        <p>Enter to send · Shift + Enter for a new line · images and videos up to 50 MB</p>
      </div>
      {dragging && <div className="chat-room__drop"><b>Drop to share</b><span>Images and videos stay in this room</span></div>}
    </section>
  );
}
