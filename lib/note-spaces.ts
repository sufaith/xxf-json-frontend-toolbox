import { noteSpacesSchema } from "@/db/schema";

const MAX_SLUG_LENGTH = 120;
const MAX_CONTENT_BYTES = 1_000_000;

export interface NoteSpaceStatement {
  bind(...values: unknown[]): NoteSpaceStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface NoteSpaceDatabase {
  prepare(sql: string): NoteSpaceStatement;
}

type NoteSpaceRecord = { slug: string; content: string; updated_at: string };

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function readSlug(request: Request) {
  const match = new URL(request.url).pathname.match(/^\/api\/n\/([^/]+)\/?$/);
  if (!match) return null;
  let slug = "";
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return null;
  }
  if (!slug || slug.length > MAX_SLUG_LENGTH || slug === "." || slug === "..") return null;
  return slug;
}

async function ensureSchema(db: NoteSpaceDatabase) {
  await db.prepare(noteSpacesSchema).run();
}

export async function handleNoteSpaceRequest(request: Request, db?: NoteSpaceDatabase) {
  const slug = readSlug(request);
  if (!slug) return json({ error: "Invalid space name." }, 400);
  if (!db) return json({ error: "Persistent storage is unavailable." }, 503);

  try {
    await ensureSchema(db);
    if (request.method === "GET") {
      const record = await db.prepare("SELECT slug, content, updated_at FROM note_spaces WHERE slug = ?1").bind(slug).first<NoteSpaceRecord>();
      return json({ slug, content: record?.content ?? "", updatedAt: record?.updated_at ?? null });
    }

    if (request.method === "PUT") {
      const body = await request.json() as { content?: unknown };
      if (typeof body.content !== "string") return json({ error: "Content must be text." }, 400);
      if (new TextEncoder().encode(body.content).byteLength > MAX_CONTENT_BYTES) return json({ error: "This space is limited to 1 MB of text." }, 413);
      await db.prepare("INSERT INTO note_spaces (slug, content, updated_at) VALUES (?1, ?2, CURRENT_TIMESTAMP) ON CONFLICT(slug) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP").bind(slug, body.content).run();
      return json({ slug, content: body.content, updatedAt: new Date().toISOString() });
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("note-space request failed", error);
    return json({ error: "Unable to load or save this space right now." }, 500);
  }
}
