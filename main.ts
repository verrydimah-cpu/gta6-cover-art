// main.ts — hand-in program for VICE COVER STUDIO (gta6-cover-art-01).
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with the kit's buildDossier, byte for byte as the
// grader will rebuild it. Runs on Node 22, standard library only.
//
// Mount fix: on the grader the output directory is a mount point, so
// it must never be removed itself. We create it if needed, then clear
// only its contents, entry by entry, before copying fresh files in.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';
// Round 5 note: the clearing below is deliberately entry-by-entry —
// removing `out` itself fails on the grader's mount with EBUSY.

mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync('app', join(out, 'app'), { recursive: true });
cpSync('screenshots', join(out, 'screenshots'), { recursive: true });

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
