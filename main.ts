// Vice Cover Studio — entry program for gta6-cover-art-01.
//
// Copies the finished studio (app/, static files a desktop browser
// loads offline) and the screenshot set (screenshots/) into the
// output directory, then writes dossier.json with the kit's own
// buildDossier, byte for byte the scorer's library, so the dossier
// handed in is exactly the one the scorer would write itself.
//
// Run locally the same way the grader runs it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// MAKEFUN_OUTPUT_DIR stands in for /output outside the grader.
// The program is deterministic: the same repository always produces
// the same output tree, dossier included.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps: only text_max_bytes shapes the dossier's bytes;
// the rest refuse an entry the scorer would refuse — more than four
// screenshots or one over 256 KiB, more than 993 files or 48 MiB
// under app/, or a path under app/ longer than 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
