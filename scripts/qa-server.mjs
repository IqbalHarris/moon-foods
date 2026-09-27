// Local validation harness only. Never included in dist or deployed.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/__qa/reduced/" || url.pathname === "/__qa/no-js/") {
    let html = readFileSync(resolve(root, "index.html"), "utf8");
    if (url.pathname.includes("no-js"))
      res.setHeader("Content-Security-Policy", "script-src 'none'");
    else {
      // Simulate the OS preference before any application code runs.
      // CSS overrides exercise the same static appearance without changing the user's OS.
      html = html.replace(
        "<head>",
        `<head><script>const actualMatchMedia=window.matchMedia.bind(window);window.matchMedia=(q)=>{const m=actualMatchMedia(q);if(q.includes('prefers-reduced-motion'))Object.defineProperty(m,'matches',{value:!q.includes('no-preference')});return m;};</script><style>html{scroll-behavior:auto!important}*,*::before,*::after{transition:none!important;animation:none!important}.scene-progress{display:none!important}</style>`,
      );
    }
    res.writeHead(200, { "Content-Type": types[".html"] });
    res.end(html);
    return;
  }
  let path;
  try {
    path = resolve(
      root,
      decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html",
    );
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (!path.startsWith(root + sep) || !existsSync(path)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, {
    "Content-Type": types[extname(path)] || "application/octet-stream",
  });
  res.end(readFileSync(path));
}).listen(4322, "127.0.0.1", () =>
  console.log(
    "Production QA: http://127.0.0.1:4322/ (reduced-motion fixture: /__qa/reduced/, scripts disabled: /__qa/no-js/)",
  ),
);
