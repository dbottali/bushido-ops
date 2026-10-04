import ts from "typescript";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const build = mkdtempSync(join(tmpdir(), "bushido-progress-"));
try {
  const program = ts.createProgram([resolve("lib/dojo-progress.ts")], { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, outDir: build, strict: true, skipLibCheck: true, types: ["node"] });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: path => path, getCurrentDirectory: () => process.cwd(), getNewLine: () => "\n" }));
  program.emit();
  const result = spawnSync(process.execPath, ["--test", "tests/dojo-progress.test.cjs"], { stdio: "inherit", env: { ...process.env, BUSHIDO_PROGRESS_TEST_MODULE: join(build, "dojo-progress.js") } });
  process.exitCode = result.status ?? 1;
} finally { rmSync(build, { recursive: true, force: true }); }
