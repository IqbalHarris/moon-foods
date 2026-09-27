import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const run = (file, args, extra = {}) => {
  const result = spawnSync(process.execPath, [file, ...args], {
    stdio: "inherit",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", ...extra },
  });
  if (result.status !== 0)
    throw new Error(`Check failed: ${file} ${args.join(" ")}`);
};
// Test a real production build at a repository subpath, then restore the local build.
const env = { SITE_URL: "https://example.github.io", BASE_PATH: "/moon-foods" };
mkdirSync("test-results", { recursive: true });
try {
  run("node_modules/astro/bin/astro.mjs", ["build"], env);
  run("scripts/check-output.mjs", ["/moon-foods"], env);
  const html = readFileSync("dist/index.html", "utf8");
  assert(
    html.includes("https://example.github.io/moon-foods/"),
    "Canonical URL must include repository base",
  );
  writeFileSync(
    "test-results/subpath.txt",
    "PASS: production build, internal anchors, image srcsets, fonts, assets and canonical URL at /moon-foods.\n",
  );
} finally {
  run("node_modules/astro/bin/astro.mjs", ["build"], {
    SITE_URL: "http://localhost:4321",
    BASE_PATH: "/",
  });
  run("scripts/check-output.mjs", []);
}
