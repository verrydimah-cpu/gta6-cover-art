# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** is a fully offline web app that turns a photo and a caption into bold, poster-style cover art. One renderer (`renderCover` in `app/src/render.js`) powers both the live preview and the PNG export, so the art you download is exactly what you saw. It offers six multi-panel collage layouts with angled dividers in four stroke styles, per-panel photo punch (zoom plus focal point), four colour grades — Vice Sunset, Neon Night, Golden Hour and Coral Dawn — three caption styles in vendored Anton lettering with a glowing spaced-caps subtitle, canvas-drawn palm / sun / star / wave decor, a film finish (grain and vignette), an in-app Sharp finish unsharp step, and a Surprise Me button with nine preset recipes. Four bundled sample photos are included as starting points, or drop in your own photo. Exports: 1080×1080, 1080×1350 and 1920×1080 PNG. No network, no build step, no dependencies.

## Run it

```sh
node serve.ts
```

Then open the printed local address in a browser. (`main.ts` is the grading entrypoint: it copies `app/` and `screenshots/` into the output directory and writes the make.fun dossier.)

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
