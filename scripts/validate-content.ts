import { readFile } from "node:fs/promises";
import { validateCloudCatalog } from "../lib/cloud-catalog";

const file = process.argv[2] ?? "content/pilot-catalog.json";
try {
  const catalog = validateCloudCatalog(JSON.parse(await readFile(file, "utf8")));
  console.log(`Valid catalog: ${catalog.courses.length} courses; ${catalog.courses.filter(course => course.availability === "available").length} available. Test content: ${catalog.courses.some(course => course.testContent) ? "yes" : "no"}.`);
} catch (error) { console.error((error as Error).message); process.exitCode = 1; }
