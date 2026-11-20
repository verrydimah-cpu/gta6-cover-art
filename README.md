# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

VICE COVER STUDIO is a static, fully offline web app that turns photos into original sunset-poster cover art. One canvas renderer drives both the live preview and the PNG exports at exactly 1080×1080, 1080×1350 and 1920×1080. It offers 7 layouts (the default is a 10-panel Ensemble Poster around one dominant central portrait, THE DRIVER, with THE GETAWAY, THE RIDE, THE FIXER, THE RACER, THE CAPTAIN, THE MUSCLE, THE INSIDER, THE RIDER and THE LOOKOUT), 4 colour grades (Vice Sunset, Neon Night, Golden Hour, Ocean Drive), 3 caption styles, gold and other divider styles, per-panel crop, zoom and punch, editable per-panel role tags, film grain and vignette, an in-app Sharp finish (default 0.62), a Surprise Me button with 9 recipes, and upload of your own photo. All poster furniture — five gold stars and a review line, a VOL. 1 corner box, retro-chrome title, neon script subtitle, gold-bordered ribbon tagline, COMING SOON block, fictional billing block, gold BEST CAST seal and barcode — is original text drawn by the renderer. No network references anywhere in the app; the Anton font is vendored locally under its open license.

## Run it

```sh
node main.ts
```

That copies the app and screenshots to the output directory (or `$MAKEFUN_OUTPUT_DIR`) and writes the dossier. To try the app itself, serve the `app/` folder with any static file server (for example `node serve.ts`) and open it in a browser — no build step and no network needed.

---

Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
