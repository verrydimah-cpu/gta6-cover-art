# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** turns a photo and a caption into bold GTA-poster-style cover art: multi-panel collages with angled dividers, sunset and neon colour grades, drawn palm-and-sun decor, and big Anton poster lettering. It runs fully offline as static files — your photos are read on your own machine and never uploaded — and exports a share-ready PNG in the common post sizes.

Features of the studio:

- **6 layouts** — Vice Quad, Fan Five, Skyline Bands, Diamond Center, Twin Slash and Grand Six, all with diagonal panel dividers (neon glow, chrome double line, or torn white edge)
- **4 colour grades** — Vice Sunset, Neon Night, Chrome Dusk and Golden Hour, each treating photos and empty panels as one unified scene
- **Any photo, per panel** — upload or drag in your own photo, mix it with the 4 bundled samples, and punch every panel in with zoom and focal-point sliders
- **Captions three ways** — stacked block, diagonal banner or bottom bar, with a letter-spaced subtitle accent line
- **Film finish** — per-grade grain and vignette plus an in-app Sharp slider (default 0.6)
- **Surprise Me** — nine curated recipes cycling layout, grade, caption and dividers in one click
- **Exports** — Square 1080×1080, Portrait 1080×1350 and Wide 1920×1080 PNGs, rendered by the exact code path as the live preview

The `screenshots/` folder shows the studio at work: the hero cover export using all four bundled samples, the editor with photos loaded, and portrait and square exports in other grades.

## Run it

```sh
node serve.ts   # serves the studio at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry dossier in ./out
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
