# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**VICE COVER STUDIO** — a static, fully offline web app that turns a photo and a caption into GTA-poster-style cover art: a multi-panel ensemble collage with gold frames and angled cast panels, retro-chrome headline lettering, a neon script line, and a Vice City sunset grade, exported as a PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.

Cast the built-in ensemble (ten AI-made portraits and scenes, plus two real garage photos the entrant supplied, and a painted sunset sky) or upload your own photo — photos never leave your machine. Every panel can be re-cropped by dragging on the cover, re-balanced with punch and zoom sliders, and re-tagged with its own cast role. Seven layouts, four colour grades, three caption voices, three divider styles, a deterministic film finish (unsharp, grain, vignette) and nine Surprise Me recipes are all drawn by one canvas renderer shared by the preview and the export, so what you see is byte-for-byte what you share. No Rockstar artwork, logos or fonts: the headline face is Anton, shipped under the SIL Open Font License (see `app/fonts/OFL.txt`).

## Run it

Hand the entry in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`):

```sh
node main.ts
```

Or open the studio itself in a browser — it is plain static files, no build step:

```sh
node serve.ts   # then visit http://localhost:8371
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
