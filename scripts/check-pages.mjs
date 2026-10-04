import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

for (const args of [["node_modules/typescript/bin/tsc", "--noEmit", "--incremental", "false"], ["scripts/test-progress.mjs"], ["node_modules/vite/bin/vite.js", "build", "--config", "vite.pages.config.ts"]]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const html = readFileSync("dist-pages/index.html", "utf8");
const refs = [...html.matchAll(/(?:src|href)="(\/bushido-ops\/assets\/[^\"]+)"/g)].map(match => match[1].replace("/bushido-ops/", ""));
if (refs.length !== 2 || refs.some(ref => !existsSync(join("dist-pages", ref)))) throw Error("Pages index must reference its emitted JavaScript and CSS.");
for (const asset of ["art/dojo-reference.png", "art/dojo-background-clean.png", "art/fighters/ryu-frames.png", "art/fighters/boxer-frames.png", "art/fighters/quiz-frames.png", "fonts/press-start-2p.ttf", "fonts/vt323.ttf"]) {
  if (!existsSync(join("dist-pages", asset))) throw Error("Missing Pages asset: " + asset);
}
console.log("Pages release checks passed: types, learning engine, progress, routes and compiled assets.");
