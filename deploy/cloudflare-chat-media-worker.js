const PUBLIC_ORIGIN = "https://r.xxf.app";
const ALLOWED_ORIGINS = new Set([
  "https://xxf.app",
  "https://www.xxf.app",
  "https://xxf-json-frontend-tools.xxfapp.chatgpt.site",
]);
const MAX_BYTES = 50 * 1024 * 1024;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://xxf.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-File-Name, X-Device-Id, X-Room",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, origin) {
  return Response.json(data, {
    status,
    headers: { ...cors(origin), "Cache-Control": "no-store" },
  });
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function sameSecret(received, expected) {
  if (!received || !expected || received.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < received.length; index += 1) {
    mismatch |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

async function deleteObjects(request, env, origin) {
  if (!sameSecret(request.headers.get("x-internal-key") || "", env.CHAT_MEDIA_ADMIN_SECRET || "")) {
    return json({ error: "Unauthorized." }, 401, origin);
  }
  const payload = await request.json().catch(() => null);
  const keys = Array.isArray(payload?.keys) ? payload.keys : [];
  if (!keys.length || keys.length > 200 || keys.some((key) => typeof key !== "string" || !/^chat\/[^/]+\/[^/]+$/.test(key))) {
    return json({ error: "Invalid object keys." }, 400, origin);
  }
  await env.MEDIA.delete(keys);
  return json({ deleted: keys.length }, 200, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";

    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method === "POST" && url.pathname === "/delete") {
      return deleteObjects(request, env, origin);
    }
    if (request.method !== "POST" || url.pathname !== "/upload") {
      return json({ error: "Not found." }, 404, origin);
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "Origin not allowed." }, 403, origin);
    }

    const room = decode(request.headers.get("x-room") || "").trim().slice(0, 80);
    const deviceId = (request.headers.get("x-device-id") || "").trim().slice(0, 80);
    const type = (request.headers.get("content-type") || "").split(";")[0].toLowerCase();
    const size = Number.parseInt(request.headers.get("content-length") || "0", 10);

    if (!room || !deviceId) return json({ error: "Missing room or device identity." }, 400, origin);
    if (!type.startsWith("image/") && !type.startsWith("video/")) {
      return json({ error: "Only images and videos are allowed." }, 415, origin);
    }
    if (!request.body || !Number.isFinite(size) || size <= 0) {
      return json({ error: "Upload size required." }, 411, origin);
    }
    if (size > MAX_BYTES) return json({ error: "Files are limited to 50 MB." }, 413, origin);

    const originalName = decode(request.headers.get("x-file-name") || "") || "upload";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "upload";
    const objectKey = `chat/${encodeURIComponent(room)}/${crypto.randomUUID()}-${safeName}`;

    await env.MEDIA.put(objectKey, request.body, {
      httpMetadata: { contentType: type },
      customMetadata: { room, deviceId, originalName: originalName.slice(0, 160) },
    });

    const publicUrl = `${PUBLIC_ORIGIN}/${objectKey.split("/").map(encodeURIComponent).join("/")}`;
    return json({
      key: `r2/${objectKey}`,
      url: publicUrl,
      type,
      name: originalName.slice(0, 160),
      size,
    }, 201, origin);
  },
};
