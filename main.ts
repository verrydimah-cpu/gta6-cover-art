// main.ts — VICE COVER STUDIO entrypoint for the make.fun grader.
//
// The grader runs `node /bot/main.ts` (Node 22) with the repository
// mounted READ-ONLY at /bot and the output directory as a MOUNTED
// volume (MAKEFUN_OUTPUT_DIR, default /output). A mounted volume's
// root directory itself cannot be removed — rmSync(out) dies with
// EBUSY — so we create the directory if needed and then clear only
// its CONTENTS, entry by entry, never the directory itself.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Create the output directory first (a no-op when the mount exists).
mkdirSync(out, { recursive: true });

// Clear only the contents, entry by entry — never rmSync(out) itself,
// because out is a mount point and removing it fails with EBUSY.
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
// buildDossier returns the finished dossier bytes — write them as-is.
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`VICE COVER STUDIO dossier written: ${dossier.byteLength} bytes -> ${join(out, 'dossier.json')}`);
