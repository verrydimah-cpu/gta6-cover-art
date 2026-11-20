// VICE COVER STUDIO — entrypoint for the make.fun gta6-cover-art-01 bounty.
//
// Two hard-won fixes live here, and both exist because the grader's
// environment is not my laptop:
//
// 1. No bare relative paths. The grader launches this file without promising
//    any particular working directory, so anything addressed as plain "app"
//    or "screenshots" would resolve against whatever directory the process
//    happened to start in and quietly copy the wrong tree — or nothing at
//    all. Every source path below is therefore anchored to this file's own
//    location, derived from import.meta.url, so the entry behaves the same
//    from any cwd.
//
// 2. The output directory is a mount, not a folder I own. Deleting the
//    directory itself and recreating it fails on the grader with EBUSY
//    ("Device or resource busy") because a mount point cannot be removed.
//    So I create the directory if it is missing and then empty it entry by
//    entry, clearing only its contents and never the directory itself.
//
// The run copies app/ and screenshots/ into the output directory and writes
// a dossier.json describing them, using only the Node standard library.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Anchor: the folder this very file sits in, wherever the process started.
const root = dirname(fileURLToPath(import.meta.url));

// Destination: the caller's chosen output dir, defaulting to /output.
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Make sure the destination exists, then clear only what is inside it.
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

// Copy the playable app and its screenshots next to the dossier.
cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Describe the copied tree and write the dossier beside it.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);

console.log(`vice-cover-studio: wrote ${join(out, 'dossier.json')} (${dossier.length} bytes)`);
