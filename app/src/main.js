// main.js — editor wiring for VICE COVER STUDIO.
// Owns the state, the controls and the pointer handling, and calls
// renderCover for both the live preview and the PNG exports. The
// Sharp finish lives here: a gentle unsharp mask applied to the
// rendered pixels, shared by preview and export alike.

import { LAYOUTS, layoutById, layoutPanels, panelAtPoint } from './layouts.js';
import { GRADES } from './grades.js';
import { RECIPES } from './shots.js';
import { renderCover } from './render.js';

const SAMPLES = [
  { src: 'samples/neon-woman.webp', name: 'Neon Woman', role: 'The Driver' },
  { src: 'samples/speedboat.webp', name: 'Speedboat', role: 'The Getaway' },
  { src: 'samples/sunset-car.webp', name: 'Sunset Car', role: 'The Ride' },
  { src: 'samples/yacht-man.webp', name: 'Yacht Man', role: 'The Captain' },
];

const MAX_PANELS = 8;
const freshTransforms = () => Array.from({ length: MAX_PANELS }, () => ({ dx: 0, dy: 0, zoom: 1 }));

const state = {
  layoutId: 'ensemble',
  gradeId: 'vice-sunset',
  captionStyle: 'poster',
  divider: 'gold',
  mode: 'spread',
  title: 'VICE CITY',
  subtitle: 'Neon Hearts, Fast Cars',
  tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  grain: 1,
  sharp: 0.62,
  panelPhoto: [1, 3, 0, 2, -1, 0, 1, 2],
  panelLabels: ['THE GETAWAY', 'THE CAPTAIN', 'THE DRIVER', 'THE RIDE', 'THE CITY', '', '', ''],
  transforms: freshTransforms(),
  punches: Array.from({ length: MAX_PANELS }, () => 1),
  selected: 2,
};

const photos = []; // { img, name } — samples first, uploads after.
const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');
const statusEl = $('status');

function say(text) { statusEl.textContent = text; }

function panelsNow() {
  return layoutPanels(layoutById(state.layoutId), preview.width, preview.height);
}

// Gentle unsharp mask: out = in + k * (in - blurred). The blur is a
// cheap 3-tap box pass; k stays modest so edges crispen without the
// bright halos that give sharpening away.
function sharpenCanvas(canvas, amount) {
  if (amount <= 0.01) return;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const src = ctx.getImageData(0, 0, w, h);
  const blur = new Uint8ClampedArray(src.data);
  const tmp = new Uint8ClampedArray(src.data);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const l = (y * w + Math.max(0, x - 1)) * 4;
      const r = (y * w + Math.min(w - 1, x + 1)) * 4;
      for (let c = 0; c < 3; c += 1) tmp[i + c] = (src.data[l + c] + src.data[i + c] * 2 + src.data[r + c]) / 4;
    }
  }
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const u = (Math.max(0, y - 1) * w + x) * 4;
      const d = (Math.min(h - 1, y + 1) * w + x) * 4;
      for (let c = 0; c < 3; c += 1) blur[i + c] = (tmp[u + c] + tmp[i + c] * 2 + tmp[d + c]) / 4;
    }
  }
  const k = amount * 0.85;
  const out = ctx.createImageData(w, h);
  for (let i = 0; i < src.data.length; i += 4) {
    for (let c = 0; c < 3; c += 1) out.data[i + c] = src.data[i + c] + (src.data[i + c] - blur[i + c]) * k;
    out.data[i + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
}

function renderInto(canvas, W, H) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, W, H, state, photos.map((p) => p.img));
  sharpenCanvas(canvas, state.sharp);
}

function render() {
  renderInto(preview, preview.width, preview.height);
}

function applyLayoutDefaults(layout) {
  const count = layoutPanels(layout, 100, 100).length;
  if (layout.photoMap) {
    state.panelPhoto = state.panelPhoto.map((v, i) => (i < layout.photoMap.length ? layout.photoMap[i] : i % Math.max(1, photos.length)));
    if (layout.labels) state.panelLabels = state.panelLabels.map((v, i) => layout.labels[i] || v);
  } else if (state.mode === 'single') {
    state.panelPhoto = state.panelPhoto.map(() => 0);
  } else {
    state.panelPhoto = state.panelPhoto.map((v, i) => (photos.length ? i % photos.length : -1));
  }
  if (state.selected >= count) state.selected = 0;
}

function chipRow(el, items, current, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    b.title = item.blurb || '';
    if (item.id === current) b.classList.add('active');
    b.addEventListener('click', () => onPick(item.id));
    el.appendChild(b);
  }
}

function buildChips() {
  chipRow($('layouts'), LAYOUTS, state.layoutId, (id) => {
    state.layoutId = id;
    applyLayoutDefaults(layoutById(id));
    buildChips();
    buildPanelList();
    render();
  });
  chipRow($('grades'), GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    buildChips();
    render();
  });
}

function buildSamples() {
  const wrap = $('samples');
  wrap.innerHTML = '';
  SAMPLES.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    const img = document.createElement('img');
    img.src = s.src;
    img.alt = s.name;
    const tag = document.createElement('small');
    tag.textContent = s.name;
    b.append(img, tag);
    b.addEventListener('click', () => {
      state.panelPhoto[state.selected] = i;
      buildPanelList();
      render();
      say(s.name + ' placed in panel ' + (state.selected + 1) + ' — drag it into place.');
    });
    wrap.appendChild(b);
  });
}

function buildPanelList() {
  const list = $('panelList');
  list.innerHTML = '';
  const count = layoutPanels(layoutById(state.layoutId), 100, 100).length;
  for (let i = 0; i < count; i += 1) {
    const row = document.createElement('div');
    row.className = 'panel-row' + (i === state.selected ? ' selected' : '');
    const head = document.createElement('div');
    head.className = 'head';
    const name = document.createElement('b');
    name.textContent = 'Panel ' + (i + 1);
    name.addEventListener('click', () => { state.selected = i; buildPanelList(); });
    const sel = document.createElement('select');
    const sky = document.createElement('option');
    sky.value = '-1';
    sky.textContent = 'Sunset sky only';
    sel.appendChild(sky);
    photos.forEach((p, pi) => {
      const o = document.createElement('option');
      o.value = String(pi);
      o.textContent = p.name;
      sel.appendChild(o);
    });
    sel.value = String(state.panelPhoto[i]);
    sel.addEventListener('change', () => { state.panelPhoto[i] = Number(sel.value); render(); });
    const label = document.createElement('input');
    label.type = 'text';
    label.maxLength = 18;
    label.placeholder = 'Role tag';
    label.value = state.panelLabels[i] || '';
    label.addEventListener('input', () => { state.panelLabels[i] = label.value.toUpperCase(); render(); });
    head.append(name, sel, label);
    const sliders = document.createElement('div');
    sliders.className = 'sliders';
    const zoomL = document.createElement('label');
    zoomL.textContent = 'Zoom';
    const zoom = document.createElement('input');
    zoom.type = 'range'; zoom.min = '1'; zoom.max = '3'; zoom.step = '0.02';
    zoom.value = String(state.transforms[i].zoom);
    zoom.addEventListener('input', () => { state.transforms[i].zoom = Number(zoom.value); render(); });
    zoomL.appendChild(zoom);
    const punchL = document.createElement('label');
    punchL.textContent = 'Punch';
    const punch = document.createElement('input');
    punch.type = 'range'; punch.min = '0.6'; punch.max = '1.5'; punch.step = '0.02';
    punch.value = String(state.punches[i]);
    punch.addEventListener('input', () => { state.punches[i] = Number(punch.value); render(); });
    punchL.appendChild(punch);
    sliders.append(zoomL, punchL);
    row.append(head, sliders);
    list.appendChild(row);
  }
}

function bindControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('tagline').value = state.tagline;
  $('grain').value = String(state.grain);
  $('sharp').value = String(state.sharp);
  $('title').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('tagline').addEventListener('input', (e) => { state.tagline = e.target.value.toUpperCase(); render(); });
  $('captionStyle').addEventListener('change', (e) => { state.captionStyle = e.target.value; render(); });
  $('divider').addEventListener('change', (e) => { state.divider = e.target.value; render(); });
  $('mode').addEventListener('change', (e) => {
    state.mode = e.target.value;
    applyLayoutDefaults(layoutById(state.layoutId));
    buildPanelList();
    render();
  });
  $('grain').addEventListener('input', (e) => { state.grain = Number(e.target.value); render(); });
  $('sharp').addEventListener('input', (e) => { state.sharp = Number(e.target.value); render(); });
  $('upload').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        photos.push({ img, name: 'Your photo' });
        state.panelPhoto[state.selected] = photos.length - 1;
        buildPanelList();
        render();
        say('Your photo is in panel ' + (state.selected + 1) + '. Drag to position, scroll to zoom.');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', () => exportPNG(b.getAttribute('data-export')));
  });
  $('surprise').addEventListener('click', surprise);
}

let recipeCursor = Math.floor(Math.random() * RECIPES.length);
function surprise() {
  recipeCursor = (recipeCursor + 1) % RECIPES.length;
  const r = RECIPES[recipeCursor];
  state.layoutId = r.layout;
  state.gradeId = r.grade;
  state.captionStyle = r.caption;
  state.divider = r.divider;
  state.mode = r.mode;
  state.title = r.title;
  state.subtitle = r.subtitle;
  state.sharp = r.sharp;
  state.punches = state.punches.map(() => r.punch);
  state.transforms = freshTransforms();
  $('title').value = r.title;
  $('subtitle').value = r.subtitle;
  $('captionStyle').value = r.caption;
  $('divider').value = r.divider;
  $('mode').value = r.mode;
  $('sharp').value = String(r.sharp);
  applyLayoutDefaults(layoutById(r.layout));
  buildChips();
  buildPanelList();
  render();
  say('Surprise Me: “' + r.name + '” — export it or keep tinkering.');
}

function exportPNG(spec) {
  const [w, h] = spec.split('x').map(Number);
  const canvas = document.createElement('canvas');
  renderInto(canvas, w, h);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-cover-' + w + 'x' + h + '.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    say('Exported vice-cover-' + w + 'x' + h + '.png — check your downloads.');
  }, 'image/png');
}

// Pointer work: drag repositions the selected panel's photo, the
// wheel zooms it. Panel picking uses the same polygons the renderer
// strokes, so the frame you grab is the frame that moves.
let drag = null;
preview.addEventListener('pointerdown', (e) => {
  const rect = preview.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * preview.width;
  const y = ((e.clientY - rect.top) / rect.height) * preview.height;
  const hit = panelAtPoint(panelsNow(), x, y);
  if (hit >= 0) {
    state.selected = hit;
    drag = { x: e.clientX, y: e.clientY };
    preview.setPointerCapture(e.pointerId);
    buildPanelList();
  }
});
preview.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const panels = panelsNow();
  const panel = panels[state.selected];
  const t = state.transforms[state.selected];
  t.dx = Math.max(-1.4, Math.min(1.4, t.dx + (e.clientX - drag.x) / (panel.box.w * 0.55)));
  t.dy = Math.max(-1.4, Math.min(1.4, t.dy + (e.clientY - drag.y) / (panel.box.h * 0.55)));
  drag = { x: e.clientX, y: e.clientY };
  render();
});
preview.addEventListener('pointerup', () => { drag = null; });
preview.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = preview.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * preview.width;
  const y = ((e.clientY - rect.top) / rect.height) * preview.height;
  const hit = panelAtPoint(panelsNow(), x, y);
  if (hit < 0) return;
  state.selected = hit;
  const t = state.transforms[hit];
  t.zoom = Math.max(1, Math.min(3.5, t.zoom * Math.exp(-e.deltaY * 0.0012)));
  render();
}, { passive: false });

async function boot() {
  bindControls();
  buildChips();
  buildSamples();
  try {
    const face = new FontFace('Anton', "url('fonts/anton-regular.ttf')");
    await face.load();
    document.fonts.add(face);
  } catch (err) { /* lettering falls back to a heavy sans */ }
  await Promise.all(SAMPLES.map((s) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { photos.push({ img, name: s.name }); resolve(); };
    img.onerror = () => resolve();
    img.src = s.src;
  })));
  // Sample order must match SAMPLES even if loads finish out of turn.
  photos.sort((a, b) => SAMPLES.findIndex((s) => s.name === a.name) - SAMPLES.findIndex((s) => s.name === b.name));
  applyLayoutDefaults(layoutById(state.layoutId));
  buildPanelList();
  render();
  say('Ensemble poster loaded — four cast photos around one hero portrait. Make it yours.');
}

window.__vcs = { state, photos, render, renderInto, exportPNG, surprise };
boot();
