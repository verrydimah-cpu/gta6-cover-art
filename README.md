# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** is a static, fully offline web app that turns your photos and a caption into GTA-poster-style cover art: a multi-panel collage with angled dividers, bold Anton caption lettering, and a Vice sunset or neon colour grade, exported as a share-ready PNG. One canvas render function drives both the live preview and the export, so the poster you see is exactly the poster you download.

Features:

- Six panel layouts (Hero Collage, Hero Filmstrip, Magazine Split, Triptych, Quad Grid, Duo Slash) with angled dividers in cream, chrome or neon.
- A different photo per panel: upload your own photo or mix the four built-in samples (neon portrait, sunset car, yacht, speedboat). Photos are read locally and never uploaded.
- Four colour grades — Vice Sunset, Neon Night, Golden Hour, Teal Haze — plus film finish controls: punch, halftone dots, light leak, grain, vignette and a convolution Sharp finish.
- Bold Anton title lettering in sunset, chrome or neon styles, an optional title position, and a glowing spaced small-caps subtitle accent line under the title.
- Tasteful low-opacity palm and sparkle corner decor on photo panels, with full sun, palm, wave and bird motifs on gradient panels.
- Surprise Me: nine curated recipes that shuffle layout, grade, lettering, photo cast and finish in one tap.
- One-tap PNG export at 1080×1080, 1080×1350 and 1920×1080. No build step, no network requests — every script, font and sample ships inside `app/`.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

Any static file server works just as well, for example `npx serve app`. To hand the entry in the way the grader does: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`. The screenshots in `screenshots/` were captured from this app's own screenshot mode (`shots.json` lists each capture's state), then sharpened — never composited or borrowed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
