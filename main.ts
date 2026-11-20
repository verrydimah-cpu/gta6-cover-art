// main.ts — hand-in program for VICE COVER STUDIO (gta6-cover-art-01).
// Copies the static app and the screenshots into the output directory
// and writes the entry dossier next to them. All sources resolve from
// this file's own directory, never from the caller's working folder,
// and the output directory itself is never removed — on the grader it
// is a mount point, so only its contents are cleared, entry by entry.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore — vendored kit helper, kept byte-unchanged.
import { buildDossier } from './vendor/makefun-app.ts';

const root = dirname(fileURLToPath(import.meta.url));
// The grader may run this from any working directory; root above is
// the only path anchor used below.
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
