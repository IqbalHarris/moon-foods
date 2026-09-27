import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
const base = (process.argv[2] || "").replace(/\/$/, "");
const html = readFileSync("dist/index.html", "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate HTML/SVG IDs");
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (url.startsWith("#"))
    assert(ids.includes(url.slice(1)), `Missing anchor ${url}`);
  else if (url.startsWith("/") && !url.startsWith("//")) {
    assert(url.startsWith(`${base}/`), `Missing repository prefix: ${url}`);
    const file = url.slice(base.length).split("?")[0];
    assert(
      existsSync(`dist${file === "/" ? "/index.html" : file}`),
      `Missing file ${file}`,
    );
  }
}
for (const [, set] of html.matchAll(/srcset="([^"]+)"/g))
  for (const entry of set.split(",")) {
    const url = entry.trim().split(" ")[0];
    assert(url.startsWith(`${base}/`), `Srcset missing base: ${url}`);
    assert(
      existsSync(`dist${url.slice(base.length)}`),
      `Missing srcset image: ${url}`,
    );
  }
assert.equal(
  [...html.matchAll(/<h1\b/g)].length,
  1,
  "Exactly one main heading",
);
assert(!html.includes('target="_blank"'), "Ordering must use the same tab");
assert(
  !html.includes("[SQUARE_ORDERING_URL]"),
  "Placeholder must not become a broken URL",
);
for (const file of readdirSync("dist/_astro")) {
  if (!file.endsWith(".css")) continue;
  const css = readFileSync(join("dist/_astro", file), "utf8");
  for (const [, url] of css.matchAll(/url\(["']?([^\)"']+)["']?\)/g))
    if (url.startsWith("/")) {
      assert(url.startsWith(`${base}/`), `CSS URL missing base: ${url}`);
      assert(
        existsSync(`dist${url.slice(base.length)}`),
        `Missing CSS asset ${url}`,
      );
    }
}
console.log(
  `Output valid at ${base || "/"}: all internal links, images, srcsets, fonts and stylesheet references exist.`,
);
console.log(`HTML: ${(gzipSync(html).length / 1024).toFixed(1)} KB gzip.`);
for (const name of readdirSync("dist/_astro").filter((n) =>
  /\.(js|css|webp)$/.test(n),
))
  console.log(
    `${name}: ${(statSync(join("dist/_astro", name)).size / 1024).toFixed(1)} KB raw`,
  );
