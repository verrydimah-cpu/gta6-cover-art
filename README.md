# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — a static, offline cover-art maker. Load your own photos, cast them into a multi-panel ensemble poster, crop and position every panel, retitle the cast with editable role tags, pick a photographic colour grade, and export a finished poster PNG at 1080×1080, 1080×1350 or 1920×1080. One canvas renderer drives both the live preview and the exports, so what you edit is exactly what ships.

The default Ensemble Poster casts ten panels around a dominant central portrait — and this round it stars a genuine newcomer: **THE RIDER**, a real photograph of a weathered cruiser motorcycle in a graffiti-walled garage, shot on the editor's own camera roll and stretched wide beneath the hero. Around it sit THE DRIVER, THE GETAWAY, THE RIDE, THE FIXER, THE RACER, THE CAPTAIN, THE MUSCLE, THE INSIDER and THE LOOKOUT. Seven layouts, four grades (Vice Sunset, Neon Night, Golden Hour, Ocean Drive), three caption styles, gold/neon/chrome dividers, per-panel crop, zoom and punch, nine Surprise Me recipes, and a shared Sharp finish (default 0.62) complete the studio. The sample strip offers ten photographs for any panel — eight studio samples plus the two real garage shots — and the upload button adds your own photos to the same strip, through the same casting path. All poster furniture — the five-star review line, retro-chrome title, neon script subtitle, gold ribbon tagline, VOL. 1 box, BEST CAST seal, billing block and barcode — is original and drawn by the app itself. No build step, no network: everything loads from the `app/` folder.

## Run it

```sh
node main.ts && node serve.ts
```

Then open http://localhost:4173 — or simply serve the `app/` folder with any static file server. `node main.ts` copies `app/` and `screenshots/` into the output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`) and writes its `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
