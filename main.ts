// main.ts — hands the Vice Cover Studio entry to the grader.
//
// Round 6 fix: the app and screenshots are resolved from this file's own
// location, never from the process working directory. Round 5 copied from
// bare relative paths ('app', 'screenshots'), which only worked when the
// caller's cwd happened to be the repository root; the grader sets no
// working directory, so those copies found nothing. Every path below is
// anchored at `root`, the directory this file lives in.
//
// The output directory is treated as a mount: it is created if missing
// and then emptied entry by entry, but never removed itself — removing a
// mount point fails on the grader with "Device or resource busy".

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = dirname(fileURLToPath(import.meta.url));

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

// One line for the maker's own runs, so a hand-off can be checked at a
// glance; the grader ignores stdout entirely.
console.log(`vice-cover-studio: dossier written to ${join(out, 'dossier.json')}`);
