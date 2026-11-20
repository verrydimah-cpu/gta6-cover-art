// VICE COVER STUDIO — hand-in program for make.fun's "Make GTA 6 Cover Art".
// Copies the studio (app/) and its screenshots into the output directory,
// then writes the dossier the scorer rebuilds from those same files and
// compares byte for byte.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/* The studio lives beside this file, wherever the grader mounts the repo —
   never trust the process's working directory to be the repository. */
const root = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/* On the grader the output directory is a mounted volume: it must be
   created when missing and emptied entry by entry — removing the
   directory itself fails against the mount. */
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });

/* The caps are the bounty's own, passed whole so this program refuses
   exactly where the scorer would. */
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`vice-cover-studio: dossier written to ${join(out, 'dossier.json')} (${dossier.length} bytes)`);
