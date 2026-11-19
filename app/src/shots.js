// shots.js — screenshot scenes for Vice Cover Studio.
//
// The capture script (see shots.json at the repo root) opens the app
// with a query string such as:
//
//   ?shot=cover&layout=hero-collage&grade=vice-sunset&divider=cream
//     &lettering=sunset&title=NEON%20VICE&photos=neon-woman,sunset-car
//     &leak=1&punch=1.3&export=1920x1080
//
// shot=cover  — the UI chrome hides and the cover alone fills the
//               viewport, rendered at the requested export size.
// shot=editor — the full studio, with the scene loaded and one panel
//               selected, exactly as a user would see it mid-edit.
//
// Nothing here runs during a normal visit: without ?shot= the parser
// returns null and the studio starts with its friendly defaults.

export const SAMPLES = [
  { key: 'neon-woman', src: 'samples/neon-woman.webp', label: 'Neon Portrait' },
  { key: 'sunset-car', src: 'samples/sunset-car.webp', label: 'Sunset Ride' },
  { key: 'yacht-man', src: 'samples/yacht-man.webp', label: 'Yacht Day' },
];

export function sampleByKey(key) {
  return SAMPLES.find((sample) => sample.key === key) || SAMPLES[0];
}

function num(params, name, fallback) {
  const raw = params.get(name);
  if (raw == null || raw === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function flag(params, name, fallback) {
  const raw = params.get(name);
  if (raw == null) return fallback;
  return raw === '1' || raw === 'true' || raw === 'on';
}

// Parse the query string into a scene description, or null when this
// is an ordinary visit. Every field is optional and falls back to
// the studio defaults, so a hand-typed URL still produces a cover.
export function shotConfig(search) {
  const params = new URLSearchParams(search || '');
  const mode = params.get('shot');
  if (mode !== 'cover' && mode !== 'editor') return null;

  let exportW = 1080;
  let exportH = 1080;
  const exportParam = params.get('export');
  if (exportParam && exportParam.includes('x')) {
    const [w, h] = exportParam.split('x').map(Number);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      exportW = Math.round(w);
      exportH = Math.round(h);
    }
  }

  const photoKeys = (params.get('photos') || 'neon-woman,sunset-car,yacht-man')
    .split(',')
    .map((key) => key.trim())
    .filter((key) => SAMPLES.some((sample) => sample.key === key));

  return {
    mode,
    layout: params.get('layout') || 'hero-collage',
    grade: params.get('grade') || 'vice-sunset',
    divider: params.get('divider') || 'cream',
    lettering: params.get('lettering') || 'sunset',
    title: params.get('title') ?? 'NEON VICE',
    subtitle: params.get('subtitle') ?? 'A VICE CITY STORY',
    captionPos: params.get('pos') || 'top',
    photoKeys,
    punch: num(params, 'punch', 1),
    leak: flag(params, 'leak', false),
    halftone: num(params, 'halftone', 0.35),
    selected: Math.max(0, Math.floor(num(params, 'selected', 0))),
    exportW,
    exportH,
  };
}
