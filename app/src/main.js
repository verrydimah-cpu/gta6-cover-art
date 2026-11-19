// main.js — the Vice Cover Studio editor.
//
// Wires the page to the renderer: a photo tray (file picker, drag &
// drop, and the three bundled samples), six layouts, four grades,
// per-panel crops with drag / wheel / arrow-key control, captions,
// film finish, and PNG export at the three share sizes. The cover
// itself is always painted by renderCover (src/render.js); this file
// only owns state and events.

import { LAYOUTS, layoutById, pointInPanel, panelBounds } from './layouts.js';
import { GRADES } from './grades.js';
import { renderCover, EXPORT_SIZES, DIVIDERS, LETTERING } from './render.js';
import { SAMPLES, sampleByKey, shotConfig } from './shots.js';

// Nine house recipes for Surprise Me: layout + grade + caption +
// divider combinations that are known to sit well together.
export const RECIPES = [
  { name: 'Neon Vice', title: 'NEON VICE', subtitle: 'A VICE CITY STORY', layout: 'hero-collage', grade: 'vice-sunset', divider: 'cream', lettering: 'sunset', pos: 'top', leak: true, halftone: 0.3, punch: 1.25 },
  { name: 'Midnight Run', title: 'MIDNIGHT RUN', subtitle: 'OCEAN DRIVE AFTER DARK', layout: 'diagonal-trio', grade: 'neon-night', divider: 'neon', lettering: 'neon', pos: 'bottom', leak: false, halftone: 0.45, punch: 1.15 },
  { name: 'Chrome Hearts', title: 'CHROME HEARTS', subtitle: 'SHINE LIKE YOU MEAN IT', layout: 'spotlight', grade: 'clean-daylight', divider: 'chrome', lettering: 'chrome', pos: 'top', leak: false, halftone: 0.15, punch: 1 },
  { name: 'Neon Palms', title: 'NEON PALMS', subtitle: 'WHERE THE PALMS GLOW', layout: 'magazine-split', grade: 'golden-hour', divider: 'cream', lettering: 'sunset', pos: 'top', leak: true, halftone: 0.25, punch: 1.1 },
  { name: 'Sunset Heist', title: 'SUNSET HEIST', subtitle: 'ONE LAST SCORE', layout: 'hero-filmstrip', grade: 'vice-sunset', divider: 'cream', lettering: 'sunset', pos: 'bottom', leak: true, halftone: 0.35, punch: 1.3 },
  { name: 'Grid Lock', title: 'GRID LOCK', subtitle: 'SIX FRAMES OF TROUBLE', layout: 'grid-six', grade: 'neon-night', divider: 'neon', lettering: 'neon', pos: 'top', leak: false, halftone: 0.5, punch: 1.2 },
  { name: 'Amber Coast', title: 'AMBER COAST', subtitle: 'GOLD ON THE WATER', layout: 'hero-collage', grade: 'golden-hour', divider: 'cream', lettering: 'sunset', pos: 'top', leak: true, halftone: 0.2, punch: 1.05 },
  { name: 'Teal & Amber', title: 'TEAL & AMBER', subtitle: 'LAST LIGHT, FIRST MOVE', layout: 'spotlight', grade: 'golden-hour', divider: 'chrome', lettering: 'chrome', pos: 'bottom', leak: false, halftone: 0.3, punch: 1.1 },
  { name: 'Daylight Confidential', title: 'DAYLIGHT', subtitle: 'CONFIDENTIAL', layout: 'magazine-split', grade: 'clean-daylight', divider: 'chrome', lettering: 'chrome', pos: 'top', leak: false, halftone: 0.1, punch: 0.95 },
];

const $ = (id) => document.getElementById(id);

const els = {
  stage: $('stage'),
  tray: $('tray'),
  fileInput: $('file-input'),
  layoutSel: $('layout-select'),
  gradeSel: $('grade-select'),
  dividerSel: $('divider-select'),
  letteringSel: $('lettering-select'),
  posSel: $('pos-select'),
  titleInput: $('title-input'),
  subtitleInput: $('subtitle-input'),
  outlineRange: $('outline-range'),
  subSizeRange: $('subsize-range'),
  punchRange: $('punch-range'),
  halftoneRange: $('halftone-range'),
  sharpRange: $('sharp-range'),
  leakCheck: $('leak-check'),
  grainCheck: $('grain-check'),
  sharpCheck: $('sharp-check'),
  decorCheck: $('decor-check'),
  aspectSel: $('aspect-select'),
  selectedLabel: $('selected-label'),
  status: $('status'),
};

const state = {
  layout: 'hero-collage',
  grade: 'vice-sunset',
  divider: 'cream',
  lettering: 'sunset',
  title: 'NEON VICE',
  subtitle: 'A VICE CITY STORY',
  captionPos: 'top',
  outline: 0.55,
  subSize: 0.34,
  halftone: 0.3,
  leak: true,
  grain: true,
  decor: true,
  sharp: true,
  sharpAmount: 0.6,
  seed: 7,
  panels: [],
  selected: 0,
};

const photos = []; // { img, name } — images[i] below mirrors img order
const images = [];

function freshPanels(count) {
  return Array.from({ length: count }, () => ({
    photo: null, dx: 0, dy: 0, zoom: 1, punch: 1,
  }));
}
state.panels = freshPanels(layoutById(state.layout).panels.length);

function setStatus(text) {
  if (els.status) els.status.textContent = text;
}

// --- rendering ---------------------------------------------------------

const PREVIEW = { square: [920, 920], portrait: [880, 1100], wide: [1180, 664] };

function render() {
  renderCover(els.stage, state, images);
  // The selection overlay is editor chrome: in a cover screenshot
  // scene the cover must appear exactly as it would export.
  if (!document.body.classList.contains('shot-cover')) drawSelection();
  els.selectedLabel.textContent = `Panel ${state.selected + 1} of ${state.panels.length}`;
  els.punchRange.value = String(state.panels[state.selected]?.punch ?? 1);
}

// The editor-only overlay: a dashed outline + corner tag on the
// selected panel. Drawn after renderCover so it never reaches an
// export (exports render onto their own fresh canvas).
function drawSelection() {
  const layout = layoutById(state.layout);
  const points = layout.panels[state.selected];
  if (!points) return;
  const ctx = els.stage.getContext('2d');
  const W = els.stage.width;
  const H = els.stage.height;
  ctx.save();
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x * W, p.y * H);
    else ctx.lineTo(p.x * W, p.y * H);
  });
  ctx.closePath();
  ctx.setLineDash([10, 7]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#22d3ee';
  ctx.stroke();
  ctx.setLineDash([]);
  const b = panelBounds(points);
  ctx.fillStyle = '#22d3ee';
  const tagW = 92; const tagH = 26;
  ctx.fillRect(b.minX * W + 6, b.minY * H + 6, tagW, tagH);
  ctx.fillStyle = '#082f3a';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`PANEL ${state.selected + 1}`, b.minX * W + 14, b.minY * H + 24);
  ctx.restore();
}

function setAspect(aspect) {
  const [w, h] = PREVIEW[aspect] || PREVIEW.square;
  els.stage.width = w;
  els.stage.height = h;
  render();
}

// --- photos --------------------------------------------------------------

function addPhoto(img, name) {
  photos.push({ img, name });
  images.push(img);
  const idx = photos.length - 1;
  // First photo fills panel 1; later photos claim the next empty
  // panel, so dropping three photos builds a cover immediately.
  const empty = state.panels.findIndex((p) => p.photo == null);
  if (empty !== -1) state.panels[empty].photo = idx;
  buildTray();
  render();
  return idx;
}

function loadImageFromSrc(src, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(addPhoto(img, name));
    img.onerror = reject;
    img.src = src;
  });
}

function loadSample(key) {
  const sample = sampleByKey(key);
  return loadImageFromSrc(sample.src, sample.label);
}

function buildTray() {
  els.tray.innerHTML = '';
  photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tray-item';
    button.title = `${photo.name} — click to put it in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    const caption = document.createElement('span');
    caption.textContent = photo.name;
    button.append(thumb, caption);
    button.addEventListener('click', () => {
      state.panels[state.selected].photo = i;
      render();
      setStatus(`${photo.name} is in panel ${state.selected + 1}.`);
    });
    els.tray.append(button);
  });
}

// Spread: deal the photos across the panels in order, wrapping when
// there are fewer photos than panels.
function spreadPhotos() {
  if (!photos.length) return;
  state.panels.forEach((panel, i) => { panel.photo = i % photos.length; });
}

// --- panel editing ---------------------------------------------------------

function canvasPoint(event) {
  const rect = els.stage.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

function panelAt(x, y) {
  const layout = layoutById(state.layout);
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    if (pointInPanel(layout.panels[i], x, y)) return i;
  }
  return -1;
}

let drag = null;

els.stage.addEventListener('pointerdown', (event) => {
  const pt = canvasPoint(event);
  const hit = panelAt(pt.x, pt.y);
  if (hit !== -1) state.selected = hit;
  drag = { x: event.clientX, y: event.clientY };
  els.stage.setPointerCapture(event.pointerId);
  render();
});

els.stage.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const panel = state.panels[state.selected];
  if (!panel || panel.photo == null) return;
  const rect = els.stage.getBoundingClientRect();
  const dxPx = event.clientX - drag.x;
  const dyPx = event.clientY - drag.y;
  drag = { x: event.clientX, y: event.clientY };
  // Convert the pointer travel into crop units: one panel-width of
  // travel is roughly one full crop range at zoom 1.
  const bounds = panelBounds(layoutById(state.layout).panels[state.selected]);
  panel.dx = clamp(panel.dx + dxPx / (rect.width * bounds.w) * 0.6, -1, 1);
  panel.dy = clamp(panel.dy + dyPx / (rect.height * bounds.h) * 0.6, -1, 1);
  render();
});

els.stage.addEventListener('pointerup', () => { drag = null; });

els.stage.addEventListener('wheel', (event) => {
  event.preventDefault();
  const panel = state.panels[state.selected];
  if (!panel) return;
  const step = event.deltaY < 0 ? 1.07 : 1 / 1.07;
  panel.zoom = clamp((panel.zoom || 1) * step, 0.35, 4);
  render();
}, { passive: false });

els.stage.addEventListener('keydown', (event) => {
  const panel = state.panels[state.selected];
  if (!panel) return;
  const step = event.shiftKey ? 0.12 : 0.03;
  const moves = {
    ArrowLeft: [-step, 0], ArrowRight: [step, 0],
    ArrowUp: [0, -step], ArrowDown: [0, step],
  };
  const move = moves[event.key];
  if (!move) return;
  event.preventDefault();
  panel.dx = clamp(panel.dx + move[0], -1, 1);
  panel.dy = clamp(panel.dy + move[1], -1, 1);
  render();
});

function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value));
}

// --- controls ---------------------------------------------------------------

function fillSelect(select, items, value) {
  select.innerHTML = '';
  for (const item of items) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  }
  select.value = value;
}

function syncControls() {
  els.layoutSel.value = state.layout;
  els.gradeSel.value = state.grade;
  els.dividerSel.value = state.divider;
  els.letteringSel.value = state.lettering;
  els.posSel.value = state.captionPos;
  els.titleInput.value = state.title;
  els.subtitleInput.value = state.subtitle;
  els.outlineRange.value = String(state.outline);
  els.subSizeRange.value = String(state.subSize);
  els.halftoneRange.value = String(state.halftone);
  els.leakCheck.checked = state.leak;
  els.grainCheck.checked = state.grain !== false;
  els.sharpCheck.checked = state.sharp;
  els.sharpRange.value = String(state.sharpAmount);
  els.decorCheck.checked = state.decor !== false;
}

function changeLayout(id) {
  const previous = state.panels;
  state.layout = id;
  const count = layoutById(id).panels.length;
  state.panels = freshPanels(count);
  previous.forEach((panel, i) => {
    if (i < count) state.panels[i] = { ...panel };
  });
  if (!photos.length) { render(); return; }
  const anyAssigned = state.panels.some((p) => p.photo != null);
  if (!anyAssigned) spreadPhotos();
  state.selected = Math.min(state.selected, count - 1);
  render();
}

function wireControls() {
  fillSelect(els.layoutSel, LAYOUTS, state.layout);
  fillSelect(els.gradeSel, GRADES, state.grade);
  fillSelect(els.dividerSel, DIVIDERS, state.divider);
  fillSelect(els.letteringSel, LETTERING, state.lettering);

  els.layoutSel.addEventListener('change', () => changeLayout(els.layoutSel.value));
  els.gradeSel.addEventListener('change', () => { state.grade = els.gradeSel.value; render(); });
  els.dividerSel.addEventListener('change', () => { state.divider = els.dividerSel.value; render(); });
  els.letteringSel.addEventListener('change', () => { state.lettering = els.letteringSel.value; render(); });
  els.posSel.addEventListener('change', () => { state.captionPos = els.posSel.value; render(); });
  els.titleInput.addEventListener('input', () => { state.title = els.titleInput.value.toUpperCase(); render(); });
  els.subtitleInput.addEventListener('input', () => { state.subtitle = els.subtitleInput.value.toUpperCase(); render(); });
  els.outlineRange.addEventListener('input', () => { state.outline = Number(els.outlineRange.value); render(); });
  els.subSizeRange.addEventListener('input', () => { state.subSize = Number(els.subSizeRange.value); render(); });
  els.halftoneRange.addEventListener('input', () => { state.halftone = Number(els.halftoneRange.value); render(); });
  els.punchRange.addEventListener('input', () => {
    state.panels[state.selected].punch = Number(els.punchRange.value);
    render();
  });
  els.leakCheck.addEventListener('change', () => { state.leak = els.leakCheck.checked; render(); });
  els.grainCheck.addEventListener('change', () => { state.grain = els.grainCheck.checked; render(); });
  els.decorCheck.addEventListener('change', () => { state.decor = els.decorCheck.checked; render(); });
  els.sharpCheck.addEventListener('change', () => { state.sharp = els.sharpCheck.checked; render(); });
  els.sharpRange.addEventListener('input', () => { state.sharpAmount = Number(els.sharpRange.value); render(); });
  els.aspectSel.addEventListener('change', () => setAspect(els.aspectSel.value));

  $('fill-all-btn').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    if (!panel || panel.photo == null) { setStatus('Pick a photo for this panel first.'); return; }
    state.panels.forEach((p) => { p.photo = panel.photo; });
    render();
    setStatus('Every panel now shows the selected photo.');
  });
  $('spread-btn').addEventListener('click', () => { spreadPhotos(); render(); setStatus('Photos spread across the panels.'); });
  $('reset-crop-btn').addEventListener('click', () => {
    state.panels.forEach((p) => { p.dx = 0; p.dy = 0; p.zoom = 1; });
    render();
    setStatus('All crops reset.');
  });
  $('swap-btn').addEventListener('click', () => {
    const n = state.panels.length;
    const next = (state.selected + 1) % n;
    [state.panels[state.selected], state.panels[next]] = [state.panels[next], state.panels[state.selected]];
    state.selected = next;
    render();
    setStatus(`Swapped with panel ${next + 1}.`);
  });
  $('arrange-btn').addEventListener('click', () => {
    if (photos.length) spreadPhotos();
    state.panels.forEach((panel, i) => {
      panel.dx = 0; panel.dy = 0;
      panel.zoom = 1 + (i % 3) * 0.06;
    });
    render();
    setStatus('Auto-arranged: photos dealt in order, crops centred.');
  });
  $('surprise-btn').addEventListener('click', () => surprise());

  els.fileInput.addEventListener('change', async () => {
    for (const file of els.fileInput.files) await loadFile(file);
    els.fileInput.value = '';
  });

  const dropZone = $('drop-zone');
  dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
  dropZone.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropZone.classList.remove('over');
    for (const file of event.dataTransfer.files) await loadFile(file);
  });

  document.querySelectorAll('[data-sample]').forEach((button) => {
    button.addEventListener('click', async () => {
      await loadSample(button.dataset.sample);
      setStatus(`${sampleByKey(button.dataset.sample).label} added to the tray.`);
    });
  });

  document.querySelectorAll('[data-export]').forEach((button) => {
    button.addEventListener('click', () => exportPNG(button.dataset.export));
  });
}

function loadFile(file) {
  if (!file.type.startsWith('image/')) return Promise.resolve();
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { addPhoto(img, file.name.replace(/\.[^.]+$/, '')); resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  });
}

// Surprise Me: pick a recipe that is not the current one, apply it
// whole, and make sure some photos are on the board to enjoy it.
async function surprise() {
  if (!photos.length) {
    for (const sample of SAMPLES) await loadSample(sample.key);
  }
  const current = RECIPES.findIndex((r) => r.title === state.title && r.layout === state.layout);
  let pick = Math.floor(Math.random() * RECIPES.length);
  if (pick === current) pick = (pick + 1) % RECIPES.length;
  const recipe = RECIPES[pick];
  state.title = recipe.title;
  state.subtitle = recipe.subtitle;
  state.grade = recipe.grade;
  state.divider = recipe.divider;
  state.lettering = recipe.lettering;
  state.captionPos = recipe.pos;
  state.leak = recipe.leak;
  state.halftone = recipe.halftone;
  state.seed = 7 + pick * 13;
  changeLayout(recipe.layout);
  spreadPhotos();
  state.panels.forEach((panel) => { panel.punch = recipe.punch; });
  syncControls();
  render();
  setStatus(`Surprise: ${recipe.name}.`);
  return recipe;
}

// --- export ------------------------------------------------------------------

export function exportPNG(sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas, state, images);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vice-cover-${size.w}x${size.h}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus(`Exported ${size.w} x ${size.h} PNG.`);
      resolve(blob);
    }, 'image/png');
  });
}

// --- start-up -----------------------------------------------------------------

async function init() {
  wireControls();
  syncControls();
  setAspect('square');

  const shot = shotConfig(window.location.search);
  if (shot) await applyShot(shot);

  // A handle for the smoke test (and curious users in devtools).
  window.__viceStudio = {
    state, photos, images, render, surprise, exportPNG,
    loadSample, spreadPhotos, changeLayout,
  };
  render();
}

async function applyShot(shot) {
  state.layout = shot.layout;
  state.grade = shot.grade;
  state.divider = shot.divider;
  state.lettering = shot.lettering;
  state.title = shot.title;
  state.subtitle = shot.subtitle;
  state.captionPos = shot.captionPos;
  state.leak = shot.leak;
  state.halftone = shot.halftone;
  state.panels = freshPanels(layoutById(shot.layout).panels.length);
  for (const key of shot.photoKeys) await loadSample(key);
  spreadPhotos();
  state.panels.forEach((panel) => { panel.punch = shot.punch; });
  state.selected = Math.min(shot.selected, state.panels.length - 1);
  syncControls();

  if (shot.mode === 'cover') {
    document.body.classList.add('shot-cover');
    els.stage.width = shot.exportW;
    els.stage.height = shot.exportH;
  } else {
    document.body.classList.add('shot-editor');
    // The editor scene frames best with a portrait canvas beside
    // the control rail — and the aspect selector must agree with
    // the canvas it describes.
    els.aspectSel.value = 'portrait';
    setAspect('portrait');
  }
  try { await document.fonts.load('80px Anton'); await document.fonts.ready; } catch { /* offline font fallback */ }
  render();
  window.__shotReady = true;
}

init();
