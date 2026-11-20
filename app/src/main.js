// main.js — the Vice Cover Studio editor.
//
// This module owns the state the renderer draws from: the photo pool (the
// eight shipped samples plus whatever the maker uploads — read locally,
// never sent anywhere), the per-panel casting and framing adjustments, and
// every control in the panel on the right. Each change re-renders the live
// preview through the same renderCover the export uses.

import { GRADES, gradeById } from './grades.js';
import { LAYOUTS, layoutById } from './layouts.js';
import { CAPTION_STYLES, DIVIDER_STYLES, EXPORT_SIZES, renderCover } from './render.js';
import { installShotsHooks } from './shots.js';

const SAMPLE_DEFS = [
  { name: 'Neon Woman', src: 'samples/neon-woman.webp' },
  { name: 'Speedboat', src: 'samples/speedboat.webp' },
  { name: 'Sunset Car', src: 'samples/sunset-car.webp' },
  { name: 'Yacht Man', src: 'samples/yacht-man.webp' },
  { name: 'Silver Fixer', src: 'samples/silver-fixer.webp' },
  { name: 'Street Racer', src: 'samples/street-racer.webp' },
  { name: 'Bodyguard', src: 'samples/bodyguard.webp' },
  { name: 'Glamour Insider', src: 'samples/glamour-insider.webp' },
];

// Nine house recipes for Surprise Me: a layout, a grade and a full set of
// words that belong together, so one click always lands on a finished
// poster rather than a random pile of settings.
export const RECIPES = [
  { layoutId: 'ensemble-poster', gradeId: 'vice-sunset', title: 'VICE CITY', subtitle: 'Neon Hearts, Fast Cars', tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET', captionStyle: 'chrome', dividers: 'gold' },
  { layoutId: 'vice-classic', gradeId: 'neon-night', title: 'NEON HARBOR', subtitle: 'Midnight Runs on Empty Boulevards', tagline: 'THE CITY NEVER SLEEPS, IT GLOWS', captionStyle: 'neon', dividers: 'neon' },
  { layoutId: 'quad-grid', gradeId: 'golden-hour', title: 'GOLDEN MILE', subtitle: 'One Last Run Before Dark', tagline: 'EVERY SUNSET HAS A PRICE', captionStyle: 'chrome', dividers: 'gold' },
  { layoutId: 'story-strips', gradeId: 'ocean-drive', title: 'OCEAN DRIVE', subtitle: 'Salt Air and Bad Decisions', tagline: 'RIDE THE BLUE HOUR', captionStyle: 'caps', dividers: 'white' },
  { layoutId: 'duo-feature', gradeId: 'vice-sunset', title: 'TWO OF US', subtitle: 'Partners in Paradise', tagline: 'TRUST NO ONE AFTER DARK', captionStyle: 'chrome', dividers: 'slash' },
  { layoutId: 'mosaic-six', gradeId: 'neon-night', title: 'SIX WAYS HOME', subtitle: 'Every Panel a Different Life', tagline: 'PICK A LIFE, ANY LIFE', captionStyle: 'neon', dividers: 'gold' },
  { layoutId: 'top-strip', gradeId: 'golden-hour', title: 'PALM ROYALE', subtitle: 'Champagne at Golden Hour', tagline: 'LUXURY IS THE BEST DISGUISE', captionStyle: 'caps', dividers: 'gold' },
  { layoutId: 'ensemble-poster', gradeId: 'ocean-drive', title: 'VICE CITY', subtitle: 'Neon Hearts, Fast Cars', tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET', captionStyle: 'chrome', dividers: 'gold' },
  { layoutId: 'vice-classic', gradeId: 'vice-sunset', title: 'SUNSET SYNDICATE', subtitle: 'Family Business, Beach Address', tagline: 'BLOOD IS THICKER THAN SALT WATER', captionStyle: 'chrome', dividers: 'slash' },
];

const state = {
  layoutId: 'ensemble-poster',
  gradeId: 'vice-sunset',
  title: 'VICE CITY',
  subtitle: 'Neon Hearts, Fast Cars',
  tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  captionStyle: 'chrome',
  dividers: 'gold',
  fillMode: 'multi',
  sharp: 0.6,
  showTags: true,
  focusPhoto: 0,
  selectedPanel: -1,
  cast: {}, // "layoutId:index" -> pool index, the maker's recasting
  framing: {}, // "layoutId:index" -> {ox, oy, zoom} drag/zoom adjustments
};

const pool = []; // {name, src, img} — samples first, uploads appended

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

function cellKey(index) {
  return `${state.layoutId}:${index}`;
}

// Which photograph belongs in a panel: the maker's recast if there is one,
// else the fill mode's rule — one photo per panel in cast order, or the
// focus photo filling every panel.
function panelPhoto(panel, index) {
  const castKey = cellKey(index);
  if (castKey in state.cast) {
    const chosen = pool[state.cast[castKey]];
    return chosen ? chosen.img : null;
  }
  if (state.fillMode === 'single') {
    const focus = pool[state.focusPhoto] || pool[0];
    return focus ? focus.img : null;
  }
  if (panel.sample < 0) return null;
  const entry = pool[panel.sample];
  return entry ? entry.img : null;
}

function buildView() {
  const layout = layoutById(state.layoutId);
  return {
    layout,
    grade: gradeById(state.gradeId),
    title: state.title,
    subtitle: state.subtitle,
    tagline: state.tagline,
    captionStyle: state.captionStyle,
    dividers: state.dividers,
    sharp: state.sharp,
    showTags: state.showTags,
    panels: layout.panels.map((panel, i) => {
      const adj = state.framing[cellKey(i)] || { ox: 0, oy: 0, zoom: 1 };
      return { img: panelPhoto(panel, i), ox: adj.ox, oy: adj.oy, zoom: adj.zoom };
    }),
  };
}

function renderPreview() {
  renderCover(pctx, preview.width, preview.height, buildView());
  preview.classList.toggle('has-selection', state.selectedPanel >= 0);
}

function setStatus(text) {
  $('status-line').textContent = text;
}

// --- Controls -----------------------------------------------------------

function buildChipRow(el, items, currentId, onPick) {
  el.innerHTML = '';
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (item.id === currentId ? ' active' : '');
    btn.textContent = item.name;
    btn.addEventListener('click', () => onPick(item.id));
    el.appendChild(btn);
  });
}

function refreshChips() {
  buildChipRow($('layout-row'), LAYOUTS, state.layoutId, (id) => {
    state.layoutId = id;
    state.selectedPanel = -1;
    refreshChips();
    renderPreview();
  });
  buildChipRow($('grade-row'), GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    refreshChips();
    renderPreview();
  });
}

function renderThumbs() {
  const row = $('sample-row');
  row.innerHTML = '';
  pool.forEach((entry, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (i === state.focusPhoto ? ' focus' : '');
    const img = document.createElement('img');
    img.src = entry.src;
    img.alt = entry.name;
    const label = document.createElement('span');
    label.textContent = entry.name;
    btn.appendChild(img);
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state.focusPhoto = i;
      if (state.selectedPanel >= 0) {
        state.cast[cellKey(state.selectedPanel)] = i;
        setStatus(`Panel ${state.selectedPanel + 1} is now played by ${entry.name}.`);
      } else if (state.fillMode === 'single') {
        setStatus(`${entry.name} now fills every panel.`);
      } else {
        setStatus(`${entry.name} selected — click a panel first to recast it, or just enjoy the cast as set.`);
      }
      renderThumbs();
      renderPreview();
    });
    row.appendChild(btn);
  });
}

function syncTextInputs() {
  $('title-input').value = state.title;
  $('subtitle-input').value = state.subtitle;
  $('tagline-input').value = state.tagline;
  $('caption-style').value = state.captionStyle;
  $('divider-style').value = state.dividers;
  $('fill-mode').value = state.fillMode;
  $('sharp-range').value = String(state.sharp);
  $('sharp-value').textContent = state.sharp.toFixed(1);
}

function applyPatch(patch) {
  Object.assign(state, patch);
  syncTextInputs();
  refreshChips();
  renderThumbs();
  renderPreview();
}

function applyRecipe(n) {
  const recipe = RECIPES[(n - 1 + RECIPES.length) % RECIPES.length];
  applyPatch({ ...recipe });
  setStatus(`Surprise Me dealt recipe ${((n - 1) % RECIPES.length) + 1} of ${RECIPES.length}: ${recipe.title} in ${gradeById(recipe.gradeId).name}.`);
}

// --- Export -------------------------------------------------------------

function renderExportCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas.getContext('2d'), w, h, buildView());
  return canvas;
}

function exportPNG(w, h) {
  const canvas = renderExportCanvas(w, h);
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setStatus(`Exported vice-cover-${w}x${h}.png — check your downloads.`);
  }, 'image/png');
}

// --- Photo loading --------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

async function loadSamples() {
  for (const def of SAMPLE_DEFS) {
    const img = await loadImage(def.src);
    pool.push({ name: def.name, src: def.src, img });
  }
}

function handleUploads(files) {
  let added = 0;
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) return;
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      pool.push({ name: file.name.replace(/\.[^.]+$/, ''), src, img });
      state.focusPhoto = pool.length - 1;
      if (added === 0) {
        // A fresh upload stars in the lead panel straight away.
        const layout = layoutById(state.layoutId);
        const lead = layout.ensemble ? 1 : 0;
        state.cast[`${state.layoutId}:${lead}`] = state.focusPhoto;
      }
      added += 1;
      renderThumbs();
      renderPreview();
      setStatus('Your photo is in the cast — drag it in its panel to frame it, scroll to zoom.');
    };
    img.src = src;
  });
}

// --- Panel framing by hand ------------------------------------------------

function panelAt(unitX, unitY) {
  const layout = layoutById(state.layoutId);
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    const p = layout.panels[i];
    if (unitX >= p.x && unitX <= p.x + p.w && unitY >= p.y && unitY <= p.y + p.h) return i;
  }
  return -1;
}

function canvasUnit(evt) {
  const rect = preview.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) / rect.width,
    y: (evt.clientY - rect.top) / rect.height,
  };
}

let drag = null;
preview.addEventListener('pointerdown', (evt) => {
  const at = canvasUnit(evt);
  const index = panelAt(at.x, at.y);
  state.selectedPanel = index;
  if (index >= 0) {
    const key = cellKey(index);
    if (!state.framing[key]) state.framing[key] = { ox: 0, oy: 0, zoom: 1 };
    drag = { index, lastX: at.x, lastY: at.y, moved: false };
    preview.setPointerCapture(evt.pointerId);
  }
  renderPreview();
});
preview.addEventListener('pointermove', (evt) => {
  if (!drag) return;
  const at = canvasUnit(evt);
  const layout = layoutById(state.layoutId);
  const p = layout.panels[drag.index];
  const adj = state.framing[cellKey(drag.index)];
  adj.ox += (at.x - drag.lastX) / Math.max(p.w, 0.05);
  adj.oy += (at.y - drag.lastY) / Math.max(p.h, 0.05);
  adj.ox = Math.max(-0.6, Math.min(0.6, adj.ox));
  adj.oy = Math.max(-0.6, Math.min(0.6, adj.oy));
  drag.lastX = at.x;
  drag.lastY = at.y;
  drag.moved = true;
  renderPreview();
});
preview.addEventListener('pointerup', () => { drag = null; });
preview.addEventListener('wheel', (evt) => {
  const at = canvasUnit(evt);
  const index = panelAt(at.x, at.y);
  if (index < 0) return;
  evt.preventDefault();
  const key = `${state.layoutId}:${index}`;
  if (!state.framing[key]) state.framing[key] = { ox: 0, oy: 0, zoom: 1 };
  const adj = state.framing[key];
  adj.zoom = Math.max(0.8, Math.min(2.6, adj.zoom * Math.exp(-evt.deltaY * 0.0012)));
  state.selectedPanel = index;
  renderPreview();
}, { passive: false });

// --- Wiring ---------------------------------------------------------------

function wireControls() {
  $('upload-btn').addEventListener('click', () => $('upload-input').click());
  $('upload-input').addEventListener('change', (evt) => handleUploads(evt.target.files));
  $('fill-mode').addEventListener('change', (evt) => {
    state.fillMode = evt.target.value;
    renderPreview();
  });
  $('title-input').addEventListener('input', (evt) => { state.title = evt.target.value; renderPreview(); });
  $('subtitle-input').addEventListener('input', (evt) => { state.subtitle = evt.target.value; renderPreview(); });
  $('tagline-input').addEventListener('input', (evt) => { state.tagline = evt.target.value; renderPreview(); });
  $('caption-style').addEventListener('change', (evt) => { state.captionStyle = evt.target.value; renderPreview(); });
  $('divider-style').addEventListener('change', (evt) => { state.dividers = evt.target.value; renderPreview(); });
  $('tags-toggle').addEventListener('change', (evt) => { state.showTags = evt.target.checked; renderPreview(); });
  $('sharp-range').addEventListener('input', (evt) => {
    state.sharp = Number(evt.target.value);
    $('sharp-value').textContent = state.sharp.toFixed(1);
    renderPreview();
  });
  $('reset-framing').addEventListener('click', () => {
    if (state.selectedPanel >= 0) delete state.framing[cellKey(state.selectedPanel)];
    renderPreview();
    setStatus('Panel framing reset to the tuned house punch.');
  });
  $('surprise-btn').addEventListener('click', () => {
    applyRecipe(1 + Math.floor(Math.random() * RECIPES.length));
  });
  document.querySelectorAll('.export-btn').forEach((btn) => {
    btn.addEventListener('click', () => exportPNG(Number(btn.dataset.w), Number(btn.dataset.h)));
  });
  // Fill the two selects from the renderer's own lists, so the menus can
  // never drift away from what the renderer can actually draw.
  CAPTION_STYLES.forEach((style) => {
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = style.name;
    $('caption-style').appendChild(opt);
  });
  DIVIDER_STYLES.forEach((style) => {
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = style.name;
    $('divider-style').appendChild(opt);
  });
  EXPORT_SIZES.forEach((size) => {
    const btn = document.querySelector(`.export-btn[data-size="${size.id}"]`);
    if (btn) btn.textContent = `${size.name} ${size.w} × ${size.h}`;
  });
}

// --- Boot -----------------------------------------------------------------
// Boot order matters: controls first (so the page is never dead), then the
// samples, then the Anton display face, and only then the first render —
// a poster drawn before its lettering arrives would flash the wrong face.

const ready = (async () => {
  wireControls();
  syncTextInputs();
  refreshChips();
  await loadSamples();
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.ready;
  } catch (err) {
    // The poster still draws with the fallback stack if fonts lag.
  }
  renderThumbs();
  renderPreview();
  setStatus('The cast is loaded — make it yours, then export a PNG.');
})();

installShotsHooks({
  ready,
  getState: () => ({ ...state, poolSize: pool.length }),
  applyPatch,
  applyRecipe,
  exportDataURL: (w, h) => renderExportCanvas(w, h).toDataURL('image/png'),
});
