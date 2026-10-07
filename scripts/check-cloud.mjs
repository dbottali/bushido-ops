import { spawnSync } from "node:child_process";
import { readFileSync,existsSync,mkdirSync } from "node:fs";
import { join } from "node:path";

const commands=[
  ["node_modules/typescript/bin/tsc","--noEmit","--incremental","false"],
  ["scripts/test-progress.mjs"],
  ["--import","tsx","--test","tests/cloud-database.test.ts","tests/cloud-api.test.ts","tests/cloud-guest.test.ts"],
  ["--import","tsx","scripts/validate-content.ts"],
  ["node_modules/vite/bin/vite.js","build","--config","vite.cloud.config.ts"],
];
for(const args of commands){const result=spawnSync(process.execPath,args,{stdio:"inherit"});if(result.status!==0)process.exit(result.status??1);}
const html=readFileSync("dist-cloud/index.html","utf8");
const refs=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match=>match[1].slice(1));
if(refs.length!==2||refs.some(ref=>!existsSync(join("dist-cloud",ref))))throw new Error("Cloud build references must match its emitted assets.");
for(const file of ["art/dojo-reference.png","art/dojo-background-clean.png","art/fighters/ryu-frames.png","art/fighters/boxer-frames.png","art/fighters/quiz-frames.png","fonts/vt323.ttf","fonts/press-start-2p.ttf","_headers","_routes.json"]){if(!existsSync(join("dist-cloud",file)))throw new Error(`Missing cloud asset: ${file}`);}
for(const ref of refs.filter(ref=>ref.endsWith(".js"))){const source=readFileSync(join("dist-cloud",ref),"utf8");if(/sb_secret_|sk_test_|whsec_|dojo_apply_event\(/.test(source))throw new Error("A server credential or mutation implementation reached the browser bundle.");}
mkdirSync(".qa",{recursive:true});
const compiled=spawnSync(process.execPath,["node_modules/wrangler/bin/wrangler.js","pages","functions","build","--outdir",".qa/functions","--compatibility-date=2026-10-07","--compatibility-flags=nodejs_compat"],{stdio:"inherit"});
if(compiled.status!==0)process.exit(compiled.status??1);
console.log("Cloud release checks passed: types, local progress, Postgres/RLS, API, preview, content validation, frontend assets and Cloudflare Functions bundle.");
