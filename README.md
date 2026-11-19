# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — a static, fully offline web app that turns your photos and a caption into GTA-poster-style cover art: multi-panel collages with angled dividers, bold Anton caption lettering, and a Vice City sunset/neon grade. Six layouts (Hero Collage, Diagonal Trio, Grid Six, Spotlight, Hero + Filmstrip, Magazine Split), four colour grades (Vice Sunset, Neon Night, Clean Daylight, Golden Hour), three divider and lettering styles, per-panel crop/zoom/punch editing, film finish (grain, light leak, halftone), a canvas "Sharp finish", nine one-click Surprise Me recipes, and PNG export at 1080×1080, 1080×1350 and 1920×1080. Three AI-generated sample photos are bundled so anyone can try it instantly. No build step and no network loads — everything ships under `app/`.

## Run it

```sh
node main.ts
```

That copies `app/` and `screenshots/` to `/output` and writes the entry dossier. To use the studio itself, serve the `app/` folder with any static file server (for example `python3 -m http.server -d app 8080`) and open it in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
