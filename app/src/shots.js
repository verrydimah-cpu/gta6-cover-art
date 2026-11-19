// Screenshot-mode state parsing for Vice Cover Studio.
// When the page URL carries a shot parameter, main.js boots straight
// into the described cover or editor state at full viewport so the
// maker can capture honest screenshots of the real app. Unknown
// sample names are dropped, never guessed, so a stale spec fails
// visibly instead of silently swapping in the wrong photograph.

export const SAMPLE_FILES = {
  'neon-woman': 'samples/neon-woman.webp',
  'sunset-car': 'samples/sunset-car.webp',
  'yacht-man': 'samples/yacht-man.webp',
  'speedboat': 'samples/speedboat.webp',
};

export const SAMPLE_ORDER = ['neon-woman', 'sunset-car', 'yacht-man', 'speedboat'];

const EXPORT_RE = /^\d{3,4}x\d{3,4}$/;

export function parseShotState(search) {
  const q = new URLSearchParams(search || '');
  if (!q.has('shot')) return null;
  const num = (key, fallback) => {
    const v = Number(q.get(key));
    return Number.isFinite(v) ? v : fallback;
  };
  const photos = (q.get('photos') || 'neon-woman')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => SAMPLE_FILES[s]);
  const exp = q.get('export') || '';
  return {
    mode: q.get('shot') === 'editor' ? 'editor' : 'cover',
    layout: q.get('layout') || 'hero-collage',
    grade: q.get('grade') || 'vice-sunset',
    divider: q.get('divider') || 'cream',
    lettering: q.get('lettering') || 'sunset',
    title: q.get('title') || 'NEON VICE',
    subtitle: q.get('subtitle') || '',
    pos: q.get('pos') || 'top',
    photos: photos.length ? photos : ['neon-woman'],
    punch: num('punch', 1.15),
    halftone: num('halftone', 0.25),
    leak: num('leak', 1),
    sharp: num('sharp', 0.6),
    exportSize: EXPORT_RE.test(exp) ? exp : '1920x1080',
    selected: Math.max(0, Math.floor(num('selected', 0))),
  };
}

export function shotExportPixels(state) {
  const [w, h] = state.exportSize.split('x').map(Number);
  return { w: w || 1920, h: h || 1080 };
}
