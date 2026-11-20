// main.js — VICE COVER STUDIO application logic.
// State holds one slot per panel: an image (bundled sample or an
// uploaded photo), a role tag, crop offsets, zoom and punch. The same
// renderCover call paints the preview and every export size.

import { renderCover } from './render.js';
import { getLayout } from './layouts.js';
import { SAMPLES, RECIPES, sampleForPanel } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('stage');
const ctx = canvas.getContext('2d');

const state = {
  layout: 'ensemble',
  grade: 'sunset',
  caption: 'chrome',
  divider: 'gold',
  aspect: '1080x1350',
  sharp: 0.62,
  title1: 'VICE',
  title2: 'COVER',
  subtitle: 'Sunset City Stories',
  ribbon: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  review: 'PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR',
  slots: [],
  uploads: [],
  selected: 0,
  recipeIndex: -1,
};

const sampleImages = new Map();
function loadSample(i) {
  if (sampleImages.has(i)) return sampleImages.get(i);
  const img = new Image();
  img.src = SAMPLES[i].file;
  img.onload = () => draw();
  sampleImages.set(i, img);
  return img;
}

function resetSlots() {
  const panels = getLayout(state.layout).build(1080, 1350);
  state.slots = panels.map((p, i) => {
    const s = sampleForPanel(i, panels.length);
    return {
      kind: 'sample', sample: s, img: loadSample(s),
      role: p.role, x: 0, y: 0, zoom: 1, punch: SAMPLES[s].punch,
      focusX: 0.5, focusY: SAMPLES[s].focusY,
    };
  });
  state.selected = Math.min(state.selected, state.slots.length - 1);
  buildCastList();
}

function draw() {
  const [w, h] = state.aspect.split('x').map(Number);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  renderCover(ctx, w, h, state);
}

function setStatus(msg) { $('status').textContent = msg; }

/* ---------- cast list + per-panel editor ---------- */
function buildCastList() {
  const list = $('castList');
  list.innerHTML = '';
  state.slots.forEach((slot, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cast-item' + (i === state.selected ? ' active' : '');
    b.textContent = `${i + 1}. ${slot.role || 'UNTAGGED'}`;
    b.addEventListener('click', () => { state.selected = i; syncPanelEditor(); buildCastList(); });
    list.appendChild(b);
  });
  syncPanelEditor();
}

function photoOptions() {
  const opts = [{ v: 'none', t: 'No photo (gradient)' }];
  SAMPLES.forEach((s, i) => opts.push({ v: `sample:${i}`, t: `Sample — ${s.name}` }));
  state.uploads.forEach((u, i) => opts.push({ v: `upload:${i}`, t: `Upload — ${u.name}` }));
  return opts;
}

function syncPanelEditor() {
  const slot = state.slots[state.selected];
  if (!slot) return;
  $('panelTitle').textContent = `Panel ${state.selected + 1} of ${state.slots.length}`;
  const sel = $('photoSel');
  sel.innerHTML = '';
  for (const o of photoOptions()) {
    const el = document.createElement('option');
    el.value = o.v; el.textContent = o.t;
    sel.appendChild(el);
  }
  sel.value = slot.kind === 'none' ? 'none' : `${slot.kind}:${slot.kind === 'sample' ? slot.sample : slot.upload}`;
  $('roleInput').value = slot.role || '';
  $('zoomRange').value = slot.zoom;
  $('xRange').value = slot.x;
  $('yRange').value = slot.y;
  $('punchRange').value = slot.punch;
}

function applyPhotoChoice() {
  const slot = state.slots[state.selected];
  const v = $('photoSel').value;
  if (v === 'none') { slot.kind = 'none'; slot.img = null; }
  else if (v.startsWith('sample:')) {
    slot.kind = 'sample'; slot.sample = Number(v.slice(7));
    slot.img = loadSample(slot.sample); slot.punch = SAMPLES[slot.sample].punch;
    slot.focusY = SAMPLES[slot.sample].focusY; slot.focusX = 0.5;
    $('punchRange').value = slot.punch;
  } else {
    slot.kind = 'upload'; slot.upload = Number(v.slice(7));
    slot.img = state.uploads[slot.upload].img;
    slot.focusX = 0.5; slot.focusY = 0.5;
  }
  draw(); buildCastListSoft();
}
function buildCastListSoft() {
  const items = $('castList').children;
  for (let i = 0; i < items.length; i++) {
    items[i].textContent = `${i + 1}. ${state.slots[i].role || 'UNTAGGED'}`;
    items[i].classList.toggle('active', i === state.selected);
  }
}

/* ---------- uploads ---------- */
function handleFiles(files) {
  let pending = files.length;
  if (!pending) return;
  for (const f of files) {
    const img = new Image();
    img.onload = () => {
      state.uploads.push({ name: f.name, img });
      if (--pending === 0) {
        // Fill the selected panel first, then any empty ones in order.
        let ui = state.uploads.length - files.length;
        const targets = [state.selected, ...state.slots.map((_, i) => i)];
        for (const t of targets) {
          if (ui >= state.uploads.length) break;
          const slot = state.slots[t];
          if (t === state.selected || slot.kind === 'none') {
            slot.kind = 'upload'; slot.upload = ui; slot.img = state.uploads[ui].img; ui++;
          }
        }
        syncPanelEditor(); buildCastListSoft(); draw();
        setStatus(`${files.length} photo(s) loaded — cast them from the panel editor.`);
      }
    };
    img.src = URL.createObjectURL(f);
  }
}

/* ---------- surprise me ---------- */
function surprise() {
  state.recipeIndex = (state.recipeIndex + 1) % RECIPES.length;
  const r = RECIPES[state.recipeIndex];
  Object.assign(state, {
    layout: r.layout, grade: r.grade, caption: r.caption, divider: r.divider,
    title1: r.title1, title2: r.title2, subtitle: r.subtitle, ribbon: r.ribbon, review: r.review,
  });
  $('layoutSel').value = r.layout; $('gradeSel').value = r.grade;
  $('captionSel').value = r.caption; $('dividerSel').value = r.divider;
  $('title1').value = r.title1; $('title2').value = r.title2;
  $('subtitle').value = r.subtitle; $('ribbon').value = r.ribbon; $('review').value = r.review;
  resetSlots(); draw();
  setStatus(`Surprise Me — ${r.name}: ${r.layout} layout, ${r.grade} grade.`);
}

/* ---------- exports ---------- */
function exportPng(w, h) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  renderCover(off.getContext('2d'), w, h, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setStatus(`Exported PNG at exactly ${w} × ${h} px.`);
  }, 'image/png');
}

/* ---------- wiring ---------- */
function bind() {
  $('layoutSel').addEventListener('change', (e) => { state.layout = e.target.value; resetSlots(); draw(); setStatus(`${e.target.selectedOptions[0].text} loaded — pick a panel, then cast a photo.`); });
  $('gradeSel').addEventListener('change', (e) => { state.grade = e.target.value; draw(); });
  $('captionSel').addEventListener('change', (e) => { state.caption = e.target.value; draw(); });
  $('dividerSel').addEventListener('change', (e) => { state.divider = e.target.value; draw(); });
  $('aspectSel').addEventListener('change', (e) => { state.aspect = e.target.value; draw(); });
  $('sharpRange').addEventListener('input', (e) => { state.sharp = Number(e.target.value); draw(); });
  for (const id of ['title1', 'title2', 'subtitle', 'ribbon', 'review']) {
    $(id).addEventListener('input', (e) => { state[id] = e.target.value; draw(); });
  }
  $('photoSel').addEventListener('change', applyPhotoChoice);
  $('roleInput').addEventListener('input', (e) => { state.slots[state.selected].role = e.target.value.toUpperCase(); buildCastListSoft(); draw(); });
  $('zoomRange').addEventListener('input', (e) => { state.slots[state.selected].zoom = Number(e.target.value); draw(); });
  $('xRange').addEventListener('input', (e) => { state.slots[state.selected].x = Number(e.target.value); draw(); });
  $('yRange').addEventListener('input', (e) => { state.slots[state.selected].y = Number(e.target.value); draw(); });
  $('punchRange').addEventListener('input', (e) => { state.slots[state.selected].punch = Number(e.target.value); draw(); });
  $('fileInput').addEventListener('change', (e) => handleFiles([...e.target.files]));
  $('surpriseBtn').addEventListener('click', surprise);
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', () => { const [w, h] = b.dataset.export.split('x').map(Number); exportPng(w, h); });
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
    const panels = getLayout(state.layout).build(canvas.width, canvas.height);
    const hit = panels.findIndex((p) => nx >= p.x && nx <= p.x + p.w && ny >= p.y && ny <= p.y + p.h);
    if (hit >= 0) { state.selected = hit; syncPanelEditor(); buildCastListSoft(); }
  });
}

resetSlots();
bind();
draw();
// Fonts can land a beat after the first paint; redraw once they are
// ready so the chrome title is never screenshotted in a fallback face.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
setStatus('Ensemble Poster loaded — ten panels, starring THE RIDER. Pick a panel, then cast a photo.');
