// main.ts — hand-in program for VICE COVER STUDIO (gta6-cover-art-01)
// Copies the static app and screenshots into the output directory and
// builds the submission dossier. The output directory itself is a grader
// mount, so it is cleared entry-by-entry and never removed.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-ignore — vendored kit helper, plain TypeScript run by Node 22
import { buildDossier } from "./vendor/makefun-app.ts";

const root = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}
cpSync(join(root, "app"), join(out, "app"), { recursive: true });
cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, "dossier.json"), dossier);
console.log("dossier bytes:", dossier.length ?? dossier.byteLength ?? "written");
