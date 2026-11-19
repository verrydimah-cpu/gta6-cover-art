// main.js — the Vice Cover Studio editor.
//
// Owns the cover state, the photo tray, every control in the side
// panel, and the pointer/keyboard editing on the canvas. Painting is
// delegated to render.js: this file never draws cover art itself, it
// only decides what the state is and asks for a repaint.

import { GRADES, GRADE_ORDER } from './grades.js';
import { LAYOUTS, LAYOUT_ORDER, panelArea, panelAt } from './layouts.js';
import { EXPORT_SIZES, renderCover } from './render.js';
import { SAMPLES, SHOT_SCENES } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('coverCanvas');
const ctx = canvas.getContext('2d');

const photos = new Map(); // id -> { id, name, src, img }
let photoSeq = 0;

const blankPanel = () => ({ photo: null, dx: 0, dy: 0, zoom: 1, punch: 1 });

const state = {
  layout: 'hero',
  grade: 'vice',
  divider: 'cream',
  captionStyle: 'sunset',
  captionPos: 'bottom',
  title: 'NEON VICE',
  subtitle: 'VICE COVER STUDIO',
  outline: 1,
  subSize: 1,
  grain: true,
  leak: false,
  halftone: 0,
  sharp: true,
  sharpAmt: 0.6,
  size: 'square',
  panels: Array.from({ length: 6 }, blankPanel),
};
let selected = 0;

// ---------- painting ----------

function repaint() {
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  // preview at a friendly resolution with the export's aspect ratio
  const scale = Math.min(1, 980 / size.w);
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  renderCover(ctx, state, canvas.width, canvas.height, photos);
  markSelectedPanel();
}

function markSelectedPanel() {
  $('panelName').textContent = `Panel ${selected + 1}`;
  const p = state.panels[selected];
  $('punchRange').value = String(p.punch ?? 1);
  $('punchVal').textContent = `${(p.punch ?? 1).toFixed(2)}×`;
  document.querySelectorAll('.tray figure').forEach((fig) => {
    fig.classList.toggle('active', fig.dataset.photo === p.photo);
  });
}

// ---------- photos ----------

function addPhoto(id, name, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      photos.set(id, { id, name, src, img });
      buildTray();
      resolve(id);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadSample(id) {
  if (photos.has(id)) return id;
  const sample = SAMPLES.find((s) => s.id === id);
  if (!sample) return null;
  return addPhoto(sample.id, sample.name, sample.src);
}

function buildTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  for (const photo of photos.values()) {
    const fig = document.createElement('figure');
    fig.dataset.photo = photo.id;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;
    const cap = document.createElement('figcaption');
    cap.textContent = photo.name;
    fig.append(img, cap);
    fig.title = 'Click to place in the selected panel';
    fig.addEventListener('click', () => {
      state.panels[selected].photo = photo.id;
      repaint();
    });
    tray.append(fig);
  }
  markSelectedPanel();
}

async function handleFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const src = URL.createObjectURL(file);
    const id = `upload-${++photoSeq}`;
    await addPhoto(id, file.name.replace(/\.[^.]+$/, ''), src);
    if (!state.panels[selected].photo) state.panels[selected].photo = id;
  }
  repaint();
}

// ---------- panel arrangement ----------

function panelCount() {
  return LAYOUTS[state.layout].panels.length;
}

function fillAll() {
  const first = state.panels[selected].photo || [...photos.keys()][0];
  if (!first) return;
  for (let i = 0; i < panelCount(); i++) state.panels[i].photo = first;
  repaint();
}

function spread() {
  const ids = [...photos.keys()];
  if (!ids.length) return;
  for (let i = 0; i < panelCount(); i++) state.panels[i].photo = ids[i % ids.length];
  repaint();
}

function autoArrange() {
  // biggest panels (by polygon area) receive the biggest photos
  const layout = LAYOUTS[state.layout];
  const order = layout.panels
    .map((poly, i) => ({ i, area: panelArea(poly) }))
    .sort((a, b) => b.area - a.area);
  const bySize = [...photos.values()]
    .map((p) => ({ id: p.id, area: (p.img.naturalWidth || 1) * (p.img.naturalHeight || 1) }))
    .sort((a, b) => b.area - a.area);
  if (!bySize.length) return;
  order.forEach((slot, k) => {
    state.panels[slot.i].photo = bySize[k % bySize.length].id;
  });
  repaint();
}

function swapWithNext() {
  const n = panelCount();
  const j = (selected + 1) % n;
  const a = state.panels[selected], b = state.panels[j];
  state.panels[selected] = b;
  state.panels[j] = a;
  selected = j;
  repaint();
}

function resetCrop() {
  const p = state.panels[selected];
  p.dx = 0; p.dy = 0; p.zoom = 1;
  repaint();
}

// ---------- Surprise Me recipes ----------

const P = (photo, dx = 0, dy = 0, zoom = 1, punch = 1) => ({ photo, dx, dy, zoom, punch });
const RECIPES = [
  { name: 'Neon Vice', layout: 'hero', grade: 'vice', divider: 'cream', captionStyle: 'sunset', title: 'NEON VICE', subtitle: 'VICE COVER STUDIO', leak: true,
    panels: [P('neon', 0, -0.04, 1.12, 1.3), P('sunset', 0.05, 0, 1.2, 1.15), P('yacht', -0.04, 0.02, 1.18, 1.1), P('sunset', -0.1, 0.05, 1.35, 1.05), P(null)] },
  { name: 'Midnight Run', layout: 'filmstrip', grade: 'neon', divider: 'chrome', captionStyle: 'chrome', title: 'MIDNIGHT RUN', subtitle: 'AFTER DARK ON THE BOULEVARD', leak: false,
    panels: [P('sunset', 0, -0.02, 1.1, 1.25), P('neon', 0, 0, 1.15, 1.1), P('yacht', 0.03, 0, 1.2, 1.05), P('sunset', -0.06, 0.03, 1.3, 1), P('neon', -0.05, -0.03, 1.25, 1.1)] },
  { name: 'Neon Palms', layout: 'magazine', grade: 'golden', divider: 'cream', captionStyle: 'sunset', title: 'NEON PALMS', subtitle: 'GOLDEN HOUR EDITION', leak: true,
    panels: [P('neon', 0, -0.03, 1.08, 1.2), P('yacht', -0.02, 0.01, 1.12, 1.05)] },
  { name: 'Chrome Heat', layout: 'trio', grade: 'neon', divider: 'neon', captionStyle: 'neon', title: 'CHROME HEAT', subtitle: 'THE CITY NEVER COOLS', leak: true,
    panels: [P('neon', 0, -0.02, 1.14, 1.25), P('sunset', 0.04, 0, 1.22, 1.1), P('yacht', -0.03, 0.02, 1.18, 1.05)] },
  { name: 'Six Ways In', layout: 'grid', grade: 'vice', divider: 'cream', captionStyle: 'sunset', title: 'SIX WAYS IN', subtitle: 'ONE WAY OUT', leak: false,
    panels: [P('neon', 0, 0, 1.15, 1.2), P('sunset', 0.03, 0, 1.2, 1.1), P('yacht', -0.02, 0, 1.18, 1.05), P('sunset', -0.08, 0.04, 1.3, 1), P('neon', -0.04, -0.02, 1.22, 1.1), P('yacht', 0.05, -0.03, 1.26, 1)] },
  { name: 'Spotlight Star', layout: 'spotlight', grade: 'vice', divider: 'neon', captionStyle: 'neon', title: 'SPOTLIGHT', subtitle: 'EVERYBODY WATCHES THE STAR', leak: true,
    panels: [P('neon', 0, -0.05, 1.1, 1.3), P('sunset', 0, 0, 1.3, 1), P('yacht', 0, 0, 1.3, 1)] },
  { name: 'Daylight Confession', layout: 'magazine', grade: 'clean', divider: 'cream', captionStyle: 'sunset', title: 'DAYLIGHT', subtitle: 'NOTHING TO HIDE AT NOON', leak: false,
    panels: [P('yacht', 0, -0.02, 1.1, 1.1), P('sunset', -0.03, 0.01, 1.14, 1)] },
  { name: 'Amber Coast', layout: 'hero', grade: 'golden', divider: 'cream', captionStyle: 'sunset', title: 'AMBER COAST', subtitle: 'LAST LIGHT, FIRST MOVE', leak: true,
    panels: [P('sunset', 0, -0.03, 1.12, 1.25), P('neon', 0.04, 0, 1.2, 1.1), P('yacht', -0.04, 0.02, 1.16, 1.05), P('neon', -0.08, 0.04, 1.3, 1), P(null)] },
  { name: 'Teal & Amber', layout: 'spotlight', grade: 'golden', divider: 'chrome', captionStyle: 'chrome', title: 'TEAL & AMBER', subtitle: 'SHADOWS AT GOLDEN HOUR', leak: false,
    panels: [P('yacht', 0, -0.04, 1.1, 1.2), P('neon', 0, 0, 1.3, 1), P('sunset', 0, 0, 1.3, 1)] },
];
let recipeCursor = -1;

async function surprise() {
  for (const s of SAMPLES) await loadSample(s.id);
  recipeCursor = (recipeCursor + 1 + Math.floor(Math.random() * RECIPES.length)) % RECIPES.length;
  const r = RECIPES[recipeCursor];
  applyScene(r);
  const toast = $('recipeToast');
  toast.textContent = `🎲 Surprise Me: ${r.name}`;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2600);
}

function applyScene(scene) {
  Object.assign(state, {
    layout: scene.layout || state.layout,
    grade: scene.grade || state.grade,
    divider: scene.divider || 'cream',
    captionStyle: scene.captionStyle || 'sunset',
    captionPos: scene.captionPos || 'bottom',
    title: scene.title ?? state.title,
    subtitle: scene.subtitle ?? state.subtitle,
    outline: scene.outline ?? 1,
    subSize: scene.subSize ?? 1,
    grain: scene.grain ?? true,
    leak: scene.leak ?? false,
    halftone: scene.halftone ?? 0,
    sharp: scene.sharp ?? true,
    sharpAmt: scene.sharpAmt ?? 0.6,
    size: scene.size || state.size,
  });
  state.panels = Array.from({ length: 6 }, (_, i) => ({ ...blankPanel(), ...(scene.panels?.[i] || {}) }));
  selected = 0;
  syncControls();
  repaint();
}

function syncControls() {
  $('layoutSel').value = state.layout;
  $('gradeSel').value = state.grade;
  $('dividerSel').value = state.divider;
  $('captionStyleSel').value = state.captionStyle;
  $('captionPosSel').value = state.captionPos;
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('outlineRange').value = String(state.outline);
  $('outlineVal').textContent = Number(state.outline).toFixed(1);
  $('subSizeRange').value = String(state.subSize);
  $('subSizeVal').textContent = Number(state.subSize).toFixed(2).replace(/0$/, '');
  $('grainChk').checked = state.grain;
  $('leakChk').checked = state.leak;
  $('halftoneRange').value = String(state.halftone);
  $('halftoneVal').textContent = String(state.halftone);
  $('sharpChk').checked = state.sharp;
  $('sharpRange').value = String(state.sharpAmt);
  $('sharpVal').textContent = String(state.sharpAmt);
  $('sizeSel').value = state.size;
}

// ---------- export ----------

function exportPng() {
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  renderCover(off.getContext('2d'), state, size.w, size.h, photos);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(state.title || 'vice-cover').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

// ---------- canvas pointer editing ----------

function canvasPoint(ev) {
  const rect = canvas.getBoundingClientRect();
  return {
    nx: (ev.clientX - rect.left) / rect.width,
    ny: (ev.clientY - rect.top) / rect.height,
  };
}

let drag = null;
canvas.addEventListener('pointerdown', (ev) => {
  const { nx, ny } = canvasPoint(ev);
  const hit = panelAt(LAYOUTS[state.layout], nx, ny);
  if (hit >= 0) selected = hit;
  drag = { x: ev.clientX, y: ev.clientY };
  canvas.setPointerCapture(ev.pointerId);
  repaint();
});
canvas.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const p = state.panels[selected];
  p.dx = clamp(p.dx - (ev.clientX - drag.x) / rect.width * 0.9, -0.5, 0.5);
  p.dy = clamp(p.dy - (ev.clientY - drag.y) / rect.height * 0.9, -0.5, 0.5);
  drag = { x: ev.clientX, y: ev.clientY };
  repaint();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('dblclick', () => resetCrop());
canvas.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const p = state.panels[selected];
  p.zoom = clamp(p.zoom * (ev.deltaY < 0 ? 1.07 : 0.93), 1, 4);
  repaint();
}, { passive: false });

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

window.addEventListener('keydown', (ev) => {
  const tag = (ev.target?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  const step = (ev.shiftKey ? 5 : 1) * 0.01;
  const p = state.panels[selected];
  if (ev.key === 'ArrowLeft') p.dx = clamp(p.dx + step, -0.5, 0.5);
  else if (ev.key === 'ArrowRight') p.dx = clamp(p.dx - step, -0.5, 0.5);
  else if (ev.key === 'ArrowUp') p.dy = clamp(p.dy + step, -0.5, 0.5);
  else if (ev.key === 'ArrowDown') p.dy = clamp(p.dy - step, -0.5, 0.5);
  else return;
  ev.preventDefault();
  repaint();
});

// ---------- wiring ----------

function fillSelect(sel, order, table) {
  for (const id of order) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = table[id].name;
    sel.append(opt);
  }
}

async function init() {
  fillSelect($('layoutSel'), LAYOUT_ORDER, LAYOUTS);
  fillSelect($('gradeSel'), GRADE_ORDER, GRADES);

  $('fileInput').addEventListener('change', (ev) => handleFiles([...ev.target.files]));
  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = await loadSample(btn.dataset.sample);
      if (id && !state.panels[selected].photo) state.panels[selected].photo = id;
      repaint();
    });
  });
  window.addEventListener('dragover', (ev) => { ev.preventDefault(); document.body.classList.add('dragging'); });
  window.addEventListener('dragleave', () => document.body.classList.remove('dragging'));
  window.addEventListener('drop', (ev) => {
    ev.preventDefault();
    document.body.classList.remove('dragging');
    if (ev.dataTransfer?.files?.length) handleFiles([...ev.dataTransfer.files]);
  });

  $('fillAllBtn').addEventListener('click', fillAll);
  $('spreadBtn').addEventListener('click', spread);
  $('autoArrangeBtn').addEventListener('click', autoArrange);
  $('swapBtn').addEventListener('click', swapWithNext);
  $('resetCropBtn').addEventListener('click', resetCrop);
  $('surpriseBtn').addEventListener('click', surprise);
  $('exportBtn').addEventListener('click', exportPng);
  $('exportBtn2').addEventListener('click', exportPng);

  $('layoutSel').addEventListener('change', (ev) => { state.layout = ev.target.value; selected = 0; repaint(); });
  $('gradeSel').addEventListener('change', (ev) => { state.grade = ev.target.value; repaint(); });
  $('dividerSel').addEventListener('change', (ev) => { state.divider = ev.target.value; repaint(); });
  $('captionStyleSel').addEventListener('change', (ev) => { state.captionStyle = ev.target.value; repaint(); });
  $('captionPosSel').addEventListener('change', (ev) => { state.captionPos = ev.target.value; repaint(); });
  $('sizeSel').addEventListener('change', (ev) => { state.size = ev.target.value; repaint(); });
  $('titleInput').addEventListener('input', (ev) => { state.title = ev.target.value; repaint(); });
  $('subtitleInput').addEventListener('input', (ev) => { state.subtitle = ev.target.value; repaint(); });
  $('punchRange').addEventListener('input', (ev) => {
    state.panels[selected].punch = Number(ev.target.value);
    $('punchVal').textContent = `${Number(ev.target.value).toFixed(2)}×`;
    repaint();
  });
  $('outlineRange').addEventListener('input', (ev) => { state.outline = Number(ev.target.value); $('outlineVal').textContent = state.outline.toFixed(1); repaint(); });
  $('subSizeRange').addEventListener('input', (ev) => { state.subSize = Number(ev.target.value); $('subSizeVal').textContent = String(state.subSize); repaint(); });
  $('halftoneRange').addEventListener('input', (ev) => { state.halftone = Number(ev.target.value); $('halftoneVal').textContent = String(state.halftone); repaint(); });
  $('sharpRange').addEventListener('input', (ev) => { state.sharpAmt = Number(ev.target.value); $('sharpVal').textContent = String(state.sharpAmt); repaint(); });
  $('grainChk').addEventListener('change', (ev) => { state.grain = ev.target.checked; repaint(); });
  $('leakChk').addEventListener('change', (ev) => { state.leak = ev.target.checked; repaint(); });
  $('sharpChk').addEventListener('change', (ev) => { state.sharp = ev.target.checked; repaint(); });

  // shot scenes for the screenshot driver
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot && SHOT_SCENES[shot]) {
    for (const s of SAMPLES) await loadSample(s.id);
    applyScene(SHOT_SCENES[shot]);
    if (shot !== 'editor') document.body.classList.add('shot');
    if (shot === 'editor') { selected = 0; repaint(); }
  } else {
    for (const s of SAMPLES) await loadSample(s.id);
    spread();
  }
  try { await document.fonts.load('80px Anton'); } catch { /* fallback face */ }
  repaint();
  document.body.dataset.ready = '1';
}

init();
