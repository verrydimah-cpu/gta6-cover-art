// Screenshot scenes for VICE COVER STUDIO. The editor reads `?shot=` from the page URL: when present,
// main.js builds the fixed scene described here instead of the empty studio, so a headless browser can
// photograph the app and its exported covers exactly as a person would make them. `shot=cover` shows
// the cover alone at the requested pixel size; `shot=editor` shows the studio with a scene loaded.
// The sample photos named here are the studio's own AI-made samples, free to use.

/** The studio's sample photos: a key, the button label and the file under app/. */
export const SAMPLE_PHOTOS = [
  { key: 'woman', label: 'Neon Portrait', src: 'samples/neon-woman.webp' },
  { key: 'car', label: 'Sunset Supercar', src: 'samples/sunset-car.webp' },
  { key: 'man', label: 'Yacht Captain', src: 'samples/yacht-man.webp' },
];

/** The sample photo with the given key, or null. */
export function sampleByKey(key) {
  return SAMPLE_PHOTOS.find((sample) => sample.key === key) ?? null;
}

/** Splits a comma list query value into trimmed items, or returns null when absent. */
function listParam(query, name) {
  const raw = query.get(name);
  if (!raw) return null;
  return raw.split(',').map((item) => item.trim());
}

/** Splits a comma list query value into numbers, or returns null when absent. */
function numberListParam(query, name) {
  const list = listParam(query, name);
  if (!list) return null;
  return list.map((item) => Number.parseFloat(item) || 0);
}

/** Reads one numeric query value, or undefined when absent or not a number. */
function numberParam(query, name) {
  const raw = query.get(name);
  if (raw === null) return undefined;
  const value = Number.parseFloat(raw);
  return Number.isNaN(value) ? undefined : value;
}

/** Reads a 0/1 flag query value, or undefined when absent. */
function flagParam(query, name) {
  const raw = query.get(name);
  if (raw === null) return undefined;
  return raw !== '0';
}

/**
 * Reads the shot scene from the URL, or returns null for the normal studio. The scene names the layout,
 * grade, divider and caption styles, the caption and its tuning (outline weight, subtitle scale), the
 * film finish (grain, light leak, halftone), the sharp finish (sharp, sharpamt), the panel assignments
 * (sample keys, in panel order) and per-panel zoom, pan and punch values.
 */
export function readShotSetup() {
  const query = new URLSearchParams(location.search);
  const mode = query.get('shot');
  if (!mode) return null;
  return {
    mode,
    width: Number.parseInt(query.get('w') ?? '', 10) || 0,
    height: Number.parseInt(query.get('h') ?? '', 10) || 0,
    layout: query.get('layout') ?? undefined,
    grade: query.get('grade') ?? undefined,
    dividerStyle: query.get('divider') ?? undefined,
    captionStyle: query.get('cstyle') ?? undefined,
    title: query.get('title') ?? undefined,
    subtitle: query.get('subtitle') ?? undefined,
    captionPos: query.get('pos') ?? undefined,
    outlineWeight: numberParam(query, 'outline'),
    subtitleScale: numberParam(query, 'subscale'),
    grain: flagParam(query, 'grain'),
    lightLeak: flagParam(query, 'leak'),
    halftone: numberParam(query, 'halftone'),
    sharp: flagParam(query, 'sharp'),
    sharpAmount: numberParam(query, 'sharpamt'),
    assign: listParam(query, 'assign'),
    zooms: numberListParam(query, 'zoom'),
    dxs: numberListParam(query, 'dx'),
    dys: numberListParam(query, 'dy'),
    punches: numberListParam(query, 'punch'),
    selected: Number.parseInt(query.get('selected') ?? '', 10),
  };
}
