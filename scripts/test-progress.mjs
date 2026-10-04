import ts from "typescript";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const build = mkdtempSync(join(tmpdir(), "bushido-progress-"));
try {
  const program = ts.createProgram([resolve("lib/dojo-progress.ts"), resolve("lib/dojo-routes.ts")], { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, rootDir: process.cwd(), outDir: build, resolveJsonModule: true, esModuleInterop: true, strict: true, skipLibCheck: true, types: ["node"] });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: path => path, getCurrentDirectory: () => process.cwd(), getNewLine: () => "\n" }));
  program.emit();
  const result = spawnSync(process.execPath, ["--test", "tests/dojo-progress.test.cjs"], { stdio: "inherit", env: { ...process.env, BUSHIDO_PROGRESS_TEST_MODULE: join(build, "lib/dojo-progress.js"), BUSHIDO_ENGINE_TEST_MODULE: join(build, "lib/course-engine.js"), BUSHIDO_CATALOG_TEST_MODULE: join(build, "lib/course-catalog.js"), BUSHIDO_ROUTES_TEST_MODULE: join(build, "lib/dojo-routes.js") } });
  process.exitCode = result.status ?? 1;
} finally { rmSync(build, { recursive: true, force: true }); }
