// VICE COVER STUDIO — hand-in program for make.fun's gta6-cover-art-01.
// Copies app/ and screenshots/ into the output directory and writes the
// dossier the scorer expects, byte for byte what buildDossier produces.
// Two things are load-bearing here: every source path is resolved from
// this file's own directory (the grader sets no working directory), and
// the output directory itself is never removed — it is a mounted volume,
// so only its contents are cleared, entry by entry.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

// The caps are the gate's own, passed through so this program refuses
// exactly where the scorer would rather than handing in a bad entry.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`vice-cover-studio: dossier written to ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
