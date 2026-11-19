// Vice Cover Studio — editor wiring.
// One state object drives the panel picker, the look controls and
// the export buttons; every change repaints through renderCover so
// the preview never drifts from the downloaded PNG. Uploaded photos
// live only in this page's memory as data URLs.

import { LAYOUT_ORDER, LAYOUT_LABELS, getLayout } from './layouts.js';
import { GRADE_ORDER, GRADE_LABELS } from './grades.js';
import { renderCover, sharpenCanvas, EXPORT_SIZES } from './render.js';
import { parseShotState, SAMPLE_FILES, SAMPLE_ORDER, shotExportPixels } from './shots.js';

const $ = (id) => document.getElementById(id);

const state = {
  layout: 'hero-collage',
  grade: 'vice-sunset',
  divider: 'cream',
  lettering: 'sunset',
  title: 'NEON VICE',
  subtitle: 'A VICE CITY STORY',
  pos: 'top',
  punch: 1.2,
  halftone: 0.25,
  leak: 1,
  sharp: 0.6,
  exportSize: '1920x1080',
  selected: 0,
  photos: ['neon-woman', 'speedboat', 'sunset-car', 'yacht-man'],
};

// Nine house recipes for the Surprise Me button: each one is a full
// look — layout, grade, lettering, photo cast and finish together.
const RECIPES = [
  { layout: 'hero-collage', grade: 'vice-sunset', divider: 'cream', lettering: 'sunset', photos: ['neon-woman', 'speedboat', 'sunset-car', 'yacht-man'], title: 'NEON VICE', subtitle: 'A VICE CITY STORY', pos: 'top', punch: 1.3, halftone: 0.3, leak: 1 },
  { layout: 'hero-filmstrip', grade: 'neon-night', divider: 'chrome', lettering: 'chrome', photos: ['yacht-man', 'neon-woman', 'speedboat', 'sunset-car'], title: 'MIDNIGHT RUN', subtitle: 'OCEAN DRIVE AFTER DARK', pos: 'bottom', punch: 1.15, halftone: 0.4, leak: 0 },
  { layout: 'magazine-split', grade: 'golden-hour', divider: 'cream', lettering: 'sunset', photos: ['sunset-car', 'neon-woman', 'yacht-man'], title: 'NEON PALMS', subtitle: 'WHERE THE PALMS GLOW', pos: 'top', punch: 1.1, halftone: 0.2, leak: 1 },
  { layout: 'triptych', grade: 'teal-haze', divider: 'neon', lettering: 'neon', photos: ['speedboat', 'yacht-man', 'neon-woman'], title: 'HARBOUR HEAT', subtitle: 'FAST BOATS SLOW SUNSETS', pos: 'top', punch: 1.2, halftone: 0.25, leak: 0 },
  { layout: 'quad-grid', grade: 'vice-sunset', divider: 'neon', lettering: 'neon', photos: ['sunset-car', 'yacht-man', 'neon-woman', 'speedboat'], title: 'FOUR CORNERS', subtitle: 'ONE CITY NO BRAKES', pos: 'bottom', punch: 1.25, halftone: 0.35, leak: 1 },
  { layout: 'duo-slash', grade: 'neon-night', divider: 'chrome', lettering: 'neon', photos: ['neon-woman', 'sunset-car'], title: 'SLASH CITY', subtitle: 'TWO SIDES OF THE STRIP', pos: 'top', punch: 1.2, halftone: 0.3, leak: 0 },
  { layout: 'hero-collage', grade: 'golden-hour', divider: 'cream', lettering: 'chrome', photos: ['yacht-man', 'sunset-car', 'speedboat', 'neon-woman'], title: 'GOLDEN MILE', subtitle: 'CHROME AT SUNDOWN', pos: 'bottom', punch: 1.05, halftone: 0.15, leak: 1 },
  { layout: 'magazine-split', grade: 'teal-haze', divider: 'chrome', lettering: 'chrome', photos: ['speedboat', 'neon-woman', 'yacht-man'], title: 'LAGOON DRIFT', subtitle: 'SALT AIR NEON HEART', pos: 'top', punch: 1.15, halftone: 0.2, leak: 0 },
  { layout: 'hero-filmstrip', grade: 'vice-sunset', divider: 'cream', lettering: 'sunset', photos: ['neon-woman', 'sunset-car', 'speedboat', 'yacht-man'], title: 'VICE REEL', subtitle: 'EVERY FRAME A POSTER', pos: 'top', punch: 1.3, halftone: 0.45, leak: 1 },
];

const imageCache = new Map();

function loadImage(key) {
  if (imageCache.has(key)) return imageCache.get(key);
  const promise = new Promise((resolve) => {
    if (key.startsWith('upload:')) {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = uploads.get(key);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = SAMPLE_FILES[key] || SAMPLE_FILES['neon-woman'];
  });
  imageCache.set(key, promise);
  return promise;
}

const uploads = new Map();
let uploadCount = 0;

async function currentImages() {
  const panels = getLayout(state.layout);
  const needed = new Set();
  panels.forEach((p, i) => needed.add(state.photos[p.slot] || state.photos[i] || state.photos[0]));
  const map = {};
  await Promise.all([...needed].map(async (key) => { map[key] = await loadImage(key); }));
  const bySlot = [];
  panels.forEach((p, i) => {
    const key = state.photos[p.slot] || state.photos[i] || state.photos[0];
    bySlot[p.slot] = map[key];
    if (!bySlot[i]) bySlot[i] = map[key];
  });
  return bySlot;
}

const preview = $('preview');
const pctx = preview.getContext('2d');

async function paintPreview() {
  const [ew, eh] = EXPORT_SIZES[state.exportSize] || EXPORT_SIZES['1920x1080'];
  preview.width = ew;
  preview.height = eh;
  const images = await currentImages();
  renderCover(pctx, state, images, ew, eh);
  markSelectedPanel();
}

function markSelectedPanel() {
  document.querySelectorAll('.panel-chip').forEach((el, i) => {
    el.classList.toggle('active', i === state.selected);
  });
}

function buildPanelChips() {
  const wrap = $('panels');
  wrap.innerHTML = '';
  const panels = getLayout(state.layout);
  panels.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-chip' + (i === state.selected ? ' active' : '');
    btn.textContent = 'Panel ' + (i + 1) + ' · ' + photoLabel(state.photos[p.slot] || state.photos[i]);
    btn.addEventListener('click', () => { state.selected = i; buildPanelChips(); });
    wrap.appendChild(btn);
  });
}

function photoLabel(key) {
  if (!key) return 'gradient';
  if (key.startsWith('upload:')) return 'your photo';
  return key.replace(/-/g, ' ');
}

function buildPhotoStrip() {
  const strip = $('photo-strip');
  strip.innerHTML = '';
  const keys = [...SAMPLE_ORDER, ...uploads.keys()];
  for (const key of keys) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-chip';
    btn.textContent = photoLabel(key);
    btn.addEventListener('click', () => {
      const panels = getLayout(state.layout);
      const slot = panels[state.selected] ? panels[state.selected].slot : state.selected;
      state.photos[slot] = key;
      if (!state.photos[state.selected]) state.photos[state.selected] = key;
      buildPanelChips();
      paintPreview();
    });
    strip.appendChild(btn);
  }
}

function fillSelect(id, order, labels) {
  const sel = $(id);
  sel.innerHTML = '';
  for (const key of order) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = labels[key];
    sel.appendChild(opt);
  }
  sel.value = state[id.replace('-select', '')] || sel.value;
}

function syncControls() {
  $('layout-select').value = state.layout;
  $('grade-select').value = state.grade;
  $('divider-select').value = state.divider;
  $('lettering-select').value = state.lettering;
  $('pos-select').value = state.pos;
  $('title-input').value = state.title;
  $('subtitle-input').value = state.subtitle;
  $('punch-range').value = state.punch;
  $('halftone-range').value = state.halftone;
  $('leak-range').value = state.leak;
  $('sharp-range').value = state.sharp;
}

function bindControls() {
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('layout-select', 'change', (e) => { state.layout = e.target.value; state.selected = 0; buildPanelChips(); paintPreview(); });
  on('grade-select', 'change', (e) => { state.grade = e.target.value; paintPreview(); });
  on('divider-select', 'change', (e) => { state.divider = e.target.value; paintPreview(); });
  on('lettering-select', 'change', (e) => { state.lettering = e.target.value; paintPreview(); });
  on('pos-select', 'change', (e) => { state.pos = e.target.value; paintPreview(); });
  on('title-input', 'input', (e) => { state.title = e.target.value.toUpperCase(); paintPreview(); });
  on('subtitle-input', 'input', (e) => { state.subtitle = e.target.value.toUpperCase(); paintPreview(); });
  on('punch-range', 'input', (e) => { state.punch = Number(e.target.value); paintPreview(); });
  on('halftone-range', 'input', (e) => { state.halftone = Number(e.target.value); paintPreview(); });
  on('leak-range', 'input', (e) => { state.leak = Number(e.target.value); paintPreview(); });
  on('sharp-range', 'input', (e) => { state.sharp = Number(e.target.value); });
  on('upload-input', 'change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadCount += 1;
      const key = 'upload:' + uploadCount;
      uploads.set(key, String(reader.result));
      imageCache.delete(key);
      const panels = getLayout(state.layout);
      const slot = panels[state.selected] ? panels[state.selected].slot : state.selected;
      state.photos[slot] = key;
      buildPhotoStrip();
      buildPanelChips();
      paintPreview();
    };
    reader.readAsDataURL(file);
  });
  on('surprise-btn', 'click', () => {
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    Object.assign(state, JSON.parse(JSON.stringify(recipe)));
    state.selected = 0;
    syncControls();
    buildPanelChips();
    paintPreview();
  });
  document.querySelectorAll('.export-btn').forEach((btn) => {
    btn.addEventListener('click', () => exportPng(btn.dataset.size));
  });
}

async function exportPng(sizeKey) {
  const [ew, eh] = EXPORT_SIZES[sizeKey] || EXPORT_SIZES['1080x1080'];
  const canvas = document.createElement('canvas');
  canvas.width = ew;
  canvas.height = eh;
  const images = await currentImages();
  renderCover(canvas.getContext('2d'), { ...state, exportSize: sizeKey }, images, ew, eh);
  if (state.sharp > 0) sharpenCanvas(canvas, state.sharp);
  const link = document.createElement('a');
  link.download = 'vice-cover-' + sizeKey + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function bootShotMode(shot) {
  Object.assign(state, {
    layout: shot.layout, grade: shot.grade, divider: shot.divider,
    lettering: shot.lettering, title: shot.title, subtitle: shot.subtitle,
    pos: shot.pos, punch: shot.punch, halftone: shot.halftone,
    leak: shot.leak, sharp: shot.sharp, exportSize: shot.exportSize,
    selected: shot.selected, photos: [...shot.photos],
  });
  if (shot.mode === 'cover') {
    document.body.classList.add('shot-cover');
    const { w, h } = shotExportPixels(shot);
    preview.width = w;
    preview.height = h;
    const images = await currentImages();
    renderCover(pctx, state, images, w, h);
    if (state.sharp > 0) sharpenCanvas(preview, state.sharp);
  } else {
    syncControls();
    buildPanelChips();
    buildPhotoStrip();
    await paintPreview();
    if (state.sharp > 0) sharpenCanvas(preview, state.sharp);
  }
  document.body.dataset.ready = '1';
}

async function boot() {
  fillSelect('layout-select', LAYOUT_ORDER, LAYOUT_LABELS);
  fillSelect('grade-select', GRADE_ORDER, GRADE_LABELS);
  try {
    const face = new FontFace('Anton', "url('fonts/anton-regular.ttf')");
    await face.load();
    document.fonts.add(face);
  } catch (err) {
    // The bundled Anton file is local; if it cannot load the canvas
    // simply falls back to a heavy sans for the lettering pass.
  }
  const shot = parseShotState(window.location.search);
  bindControls();
  if (shot) {
    await bootShotMode(shot);
    return;
  }
  syncControls();
  buildPanelChips();
  buildPhotoStrip();
  await paintPreview();
  document.body.dataset.ready = '1';
}

boot();
