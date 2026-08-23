import { NextResponse } from "next/server";

const userAgentHeaders: Record<string, string> = {
  default: "XXF Redirect Checker/1.0",
  "mac-chrome": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
  "windows-chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36",
};

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  return host.includes(":") || host === "localhost" || host === "0.0.0.0" || host === "169.254.169.254" || host === "metadata.google.internal" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

function isAllowedUrl(url: URL) {
  return /^https?:$/.test(url.protocol) && !url.username && !url.password && !isBlockedHost(url.hostname);
}

function parseTarget(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Enter a URL to check.");
  const url = new URL(value.trim());
  if (!isAllowedUrl(url)) throw new Error("Only public HTTP and HTTPS URLs can be checked.");
  return url;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { url?: unknown; userAgent?: unknown };
    let current = parseTarget(body.url);
    const userAgent = typeof body.userAgent === "string" && body.userAgent in userAgentHeaders ? body.userAgent : "default";
    const results: Array<{ url: string; status: number | string }> = [];
    const visited = new Set<string>();

    for (let hop = 0; hop < 10; hop += 1) {
      const currentUrl = current.toString();
      if (visited.has(currentUrl)) {
        results.push({ url: currentUrl, status: "Loop" });
        break;
      }
      visited.add(currentUrl);
      const response = await fetch(currentUrl, { redirect: "manual", headers: { "user-agent": userAgentHeaders[userAgent], accept: "*/*" }, signal: AbortSignal.timeout(10000) });
      results.push({ url: currentUrl, status: response.status });
      if (response.status < 300 || response.status >= 400) break;
      const location = response.headers.get("location");
      if (!location) break;
      const next = new URL(location, currentUrl);
      if (!isAllowedUrl(next)) {
        results.push({ url: next.toString(), status: "Blocked target" });
        break;
      }
      current = next;
    }

    if (results.length === 10 && typeof results.at(-1)?.status === "number") results.push({ url: current.toString(), status: "Max hops" });
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unable to check this URL.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
