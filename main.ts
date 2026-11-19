// Vice Cover Studio — the hand-in program for gta6-cover-art-01.
//
// The entry itself is the static web app under app/ (plain files a
// browser loads offline; try it with `node serve.ts`). This program
// copies app/ and screenshots/ into the output directory and writes
// dossier.json there with the vendored make.fun library, exactly as
// the scorer will rebuild it. Node's standard library only, erasable
// TypeScript, no build step:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(repoDir, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate: the text budget shapes the dossier
// bytes; the rest refuse anything the scorer would refuse anyway (over
// four screenshots, a screenshot over 256 KiB, an oversized app tree).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Vice Cover Studio: app, screenshots and dossier.json written to ${outputDir}`);
