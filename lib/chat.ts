const MAX_ROOM_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const PAGE_SIZE = 100;

export interface ChatStatement {
  bind(...values: unknown[]): ChatStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results?: T[] }>;
  run(): Promise<unknown>;
}

export interface ChatDatabase {
  prepare(sql: string): ChatStatement;
  batch(statements: ChatStatement[]): Promise<Array<{ meta?: { last_row_id?: number } }>>;
}

interface R2ObjectBody {
  body: ReadableStream;
  size: number;
  etag: string;
  range?: { offset: number; length: number };
  writeHttpMetadata(headers: Headers): void;
}

export interface ChatMediaBucket {
  put(key: string, value: ReadableStream, options: {
    httpMetadata: { contentType: string };
    customMetadata: Record<string, string>;
  }): Promise<unknown>;
  get(key: string, options?: { range?: Headers }): Promise<R2ObjectBody | null>;
}

type ChatRow = {
  id: number;
  room_slug: string;
  device_id: string;
  nickname: string;
  avatar_seed: string;
  kind: "text" | "image" | "video";
  content: string;
  media_key: string | null;
  media_type: string | null;
  media_name: string | null;
  media_size: number | null;
  created_at: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function decodeSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function validRoom(value: string) {
  return value.length > 0 && value.length <= MAX_ROOM_LENGTH && value !== "." && value !== "..";
}

function readChatRoute(request: Request) {
  const path = new URL(request.url).pathname;
  const upload = path.match(/^\/api\/c\/([^/]+)\/upload\/?$/);
  if (upload) {
    const room = decodeSegment(upload[1]);
    return validRoom(room) ? { room, action: "upload" as const } : null;
  }
  const messages = path.match(/^\/api\/c\/([^/]+)\/messages\/?$/);
  if (messages) {
    const room = decodeSegment(messages[1]);
    return validRoom(room) ? { room, action: "messages" as const } : null;
  }
  return null;
}

function cleanIdentity(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function mediaUrlForKey(key: string) {
  if (key.startsWith("r2/")) {
    const publicKey = key.slice(3);
    return `https://r.xxf.app/${publicKey.split("/").map(encodeURIComponent).join("/")}`;
  }
  return `/api/c/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function mapMessage(row: ChatRow) {
  return {
    id: row.id,
    room: row.room_slug,
    deviceId: row.device_id,
    nickname: row.nickname,
    avatarSeed: row.avatar_seed,
    kind: row.kind,
    content: row.content,
    media: row.media_key ? {
      key: row.media_key,
      url: mediaUrlForKey(row.media_key),
      type: row.media_type,
      name: row.media_name,
      size: row.media_size,
    } : null,
    createdAt: row.created_at,
  };
}

async function listMessages(request: Request, db: ChatDatabase, room: string) {
  const rawAfter = new URL(request.url).searchParams.get("after");
  const after = rawAfter ? Number.parseInt(rawAfter, 10) : 0;
  if (rawAfter && (!Number.isSafeInteger(after) || after < 0)) return json({ error: "Invalid message cursor." }, 400);

  if (after > 0) {
    const result = await db.prepare(`
      SELECT id, room_slug, device_id, nickname, avatar_seed, kind, content,
             media_key, media_type, media_name, media_size, created_at
      FROM chat_messages
      WHERE room_slug = ?1 AND id > ?2
      ORDER BY id ASC
      LIMIT ?3
    `).bind(room, after, PAGE_SIZE).all<ChatRow>();
    return json({ room, messages: (result.results ?? []).map(mapMessage) });
  }

  const result = await db.prepare(`
    SELECT id, room_slug, device_id, nickname, avatar_seed, kind, content,
           media_key, media_type, media_name, media_size, created_at
    FROM chat_messages
    WHERE room_slug = ?1
    ORDER BY id DESC
    LIMIT ?2
  `).bind(room, PAGE_SIZE).all<ChatRow>();
  return json({ room, messages: (result.results ?? []).reverse().map(mapMessage) });
}

async function createMessage(request: Request, db: ChatDatabase, room: string) {
  const body = await request.json() as Record<string, unknown>;
  const deviceId = cleanIdentity(body.deviceId, 80);
  const nickname = cleanIdentity(body.nickname, 40);
  const avatarSeed = cleanIdentity(body.avatarSeed, 80);
  const kind = body.kind === "image" || body.kind === "video" ? body.kind : "text";
  const content = typeof body.content === "string" ? body.content.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  const mediaKey = cleanIdentity(body.mediaKey, 240) || null;
  const mediaType = cleanIdentity(body.mediaType, 100) || null;
  const mediaName = cleanIdentity(body.mediaName, 160) || null;
  const mediaSize = typeof body.mediaSize === "number" && Number.isSafeInteger(body.mediaSize) ? body.mediaSize : null;

  if (!deviceId || !nickname || !avatarSeed) return json({ error: "Device identity is required." }, 400);
  if (kind === "text" && !content) return json({ error: "Message text is required." }, 400);
  if (kind !== "text" && (!mediaKey || !mediaType || !mediaName || !mediaSize)) return json({ error: "Media details are incomplete." }, 400);
  const legacyPrefix = `chat/${encodeURIComponent(room)}/`;
  const publicR2Prefix = `r2/${legacyPrefix}`;
  if (mediaKey && !mediaKey.startsWith(legacyPrefix) && !mediaKey.startsWith(publicR2Prefix)) {
    return json({ error: "Media does not belong to this room." }, 400);
  }

  const recent = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM chat_messages
    WHERE device_id = ?1 AND created_at >= datetime('now', '-1 minute')
  `).bind(deviceId).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 30) return json({ error: "You are sending messages too quickly. Try again in a moment." }, 429);

  if (mediaKey && !mediaKey.startsWith("r2/")) {
    const upload = await db.prepare(`
      SELECT media_key
      FROM chat_uploads
      WHERE media_key = ?1 AND room_slug = ?2 AND device_id = ?3
    `).bind(mediaKey, room, deviceId).first<{ media_key: string }>();
    if (!upload) return json({ error: "This upload is not available to attach." }, 400);
  }

  const results = await db.batch([
    db.prepare(`
      INSERT INTO chat_profiles (device_id, nickname, avatar_seed, updated_at)
      VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
      ON CONFLICT(device_id) DO UPDATE SET
        nickname = excluded.nickname,
        avatar_seed = excluded.avatar_seed,
        updated_at = CURRENT_TIMESTAMP
    `).bind(deviceId, nickname, avatarSeed),
    db.prepare(`
      INSERT INTO chat_messages (
        room_slug, device_id, nickname, avatar_seed, kind, content,
        media_key, media_type, media_name, media_size, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, CURRENT_TIMESTAMP)
    `).bind(room, deviceId, nickname, avatarSeed, kind, content, mediaKey, mediaType, mediaName, mediaSize),
  ]);

  const messageId = results[1]?.meta?.last_row_id;
  const row = messageId ? await db.prepare(`
    SELECT id, room_slug, device_id, nickname, avatar_seed, kind, content,
           media_key, media_type, media_name, media_size, created_at
    FROM chat_messages
    WHERE id = ?1
  `).bind(messageId).first<ChatRow>() : null;
  return json({ message: row ? mapMessage(row) : null }, 201);
}

async function uploadMedia(request: Request, db: ChatDatabase, bucket: ChatMediaBucket, room: string) {
  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const allowed = contentType.startsWith("image/") || contentType.startsWith("video/");
  const size = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (!allowed) return json({ error: "Only images and videos can be uploaded." }, 415);
  if (!request.body) return json({ error: "The upload is empty." }, 400);
  if (!Number.isFinite(size) || size <= 0) return json({ error: "The upload size is required." }, 411);
  if (size > MAX_UPLOAD_BYTES) return json({ error: "Files are limited to 50 MB." }, 413);

  const deviceId = cleanIdentity(request.headers.get("x-device-id"), 80);
  if (!deviceId) return json({ error: "Device identity is required." }, 400);
  const recent = await db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(media_size), 0) AS bytes
    FROM chat_uploads
    WHERE device_id = ?1 AND created_at >= datetime('now', '-10 minutes')
  `).bind(deviceId).first<{ count: number; bytes: number }>();
  if ((recent?.count ?? 0) >= 8 || (recent?.bytes ?? 0) + size > 200 * 1024 * 1024) {
    return json({ error: "Upload limit reached. Try again in a few minutes." }, 429);
  }

  const originalName = decodeSegment(request.headers.get("x-file-name") ?? "") || "upload";
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "upload";
  const key = `chat/${encodeURIComponent(room)}/${crypto.randomUUID()}-${safeName}`;
  await bucket.put(key, request.body, {
    httpMetadata: { contentType },
    customMetadata: { room: room.slice(0, MAX_ROOM_LENGTH), originalName: originalName.slice(0, 160) },
  });
  await db.prepare(`
    INSERT INTO chat_uploads (media_key, room_slug, device_id, media_type, media_name, media_size, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP)
  `).bind(key, room, deviceId, contentType, originalName.slice(0, 160), size).run();
  return json({
    key,
    url: `/api/c/media/${key.split("/").map(encodeURIComponent).join("/")}`,
    type: contentType,
    name: originalName.slice(0, 160),
    size,
  }, 201);
}

export async function handleChatRequest(request: Request, db?: ChatDatabase, bucket?: ChatMediaBucket) {
  const route = readChatRoute(request);
  if (!route) return json({ error: "Invalid chat room." }, 400);
  if (!db) return json({ error: "Chat storage is unavailable." }, 503);

  try {
    if (route.action === "messages" && request.method === "GET") return listMessages(request, db, route.room);
    if (route.action === "messages" && request.method === "POST") return createMessage(request, db, route.room);
    if (route.action === "upload" && request.method === "POST") {
      if (!bucket) return json({ error: "Media storage is unavailable." }, 503);
      return uploadMedia(request, db, bucket, route.room);
    }
    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("chat request failed", error);
    return json({ error: "The chat is temporarily unavailable." }, 500);
  }
}

export async function handleChatMediaRequest(request: Request, bucket?: ChatMediaBucket) {
  if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "Method not allowed." }, 405);
  if (!bucket) return json({ error: "Media storage is unavailable." }, 503);
  const path = new URL(request.url).pathname;
  const match = path.match(/^\/api\/c\/media\/(chat\/[^?#]+)$/);
  if (!match) return json({ error: "Invalid media path." }, 400);
  const key = match[1].split("/").map(decodeSegment).join("/");
  if (!/^chat\/[^/]+\/[^/]+$/.test(key)) return json({ error: "Invalid media path." }, 400);

  try {
    const object = await bucket.get(key, request.headers.has("range") ? { range: request.headers } : undefined);
    if (!object) return json({ error: "Media not found." }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.etag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    if (object.range) {
      headers.set("Content-Range", `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
      headers.set("Content-Length", String(object.range.length));
    } else {
      headers.set("Content-Length", String(object.size));
    }
    return new Response(request.method === "HEAD" ? null : object.body, { status: object.range ? 206 : 200, headers });
  } catch (error) {
    console.error("chat media request failed", error);
    return json({ error: "Unable to load this media." }, 500);
  }
}
