// Vice Cover Studio — entry program.
// Hands the app in: copies app/ and screenshots/ from this repository
// into the output directory and writes the dossier the scorer checks,
// using the kit's own buildDossier so the bytes match by construction.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = import.meta.dirname;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Start from a clean output so a stale file can never leak into a run
// and break the byte-for-byte dossier comparison.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log('Vice Cover Studio handed in: dossier.json is ' + dossier.length + ' bytes at ' + outputDir);
console.log('Re-running main.ts must produce a byte-identical dossier.json.');
