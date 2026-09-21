import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("../dist/", import.meta.url);
const OUT = new URL("./worker.generated.js", import.meta.url);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function walk(dir, prefix = "") {
  const output = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      Object.assign(output, walk(absolute, relative));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    output["/" + relative] = {
      base64: fs.readFileSync(absolute).toString("base64"),
      type: types.get(ext) || "application/octet-stream",
    };
  }
  return output;
}

const files = walk(path.fileURLToPath(ROOT));
if (!files["/index.html"]) throw new Error("dist/index.html is required");

const worker = `const FILES = ${JSON.stringify(files)};

function decode(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function responseHeaders(type, immutable) {
  return {
    "Content-Type": type,
    "Cache-Control": immutable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json(
        { ok: true, service: "xmlvalidatoronline", runtime: "cloudflare-worker" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const file = FILES[url.pathname] || FILES["/index.html"];
    const immutable = url.pathname.startsWith("/assets/");
    return new Response(
      request.method === "HEAD" ? null : decode(file.base64),
      { status: 200, headers: responseHeaders(file.type, immutable) },
    );
  },
};
`;

fs.writeFileSync(OUT, worker);
console.log(`Generated ${path.fileURLToPath(OUT)} (${Buffer.byteLength(worker)} bytes)`);
