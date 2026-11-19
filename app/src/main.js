// main.js — UI wiring for VICE COVER STUDIO.
// Owns the cover state, loads the bundled sample photos, builds the
// control panel, and drives renderCover() for preview and export.
// Preview renders are coalesced through requestAnimationFrame.

import { LAYOUTS, DIVIDER_STYLES, getLayout } from './layouts.js';
import { GRADES } from './grades.js';
import { renderCover, applySharpFinish } from './render.js';
import { SAMPLES, CAPTION_STYLES, RECIPES, recipeToState, SHOT_STATES } from './shots.js';

const $ = (id) => document.getElementById(id);
const previewCanvas = $('preview');
const previewCtx = previewCanvas.getContext('2d');

let state = recipeToState(RECIPES[0]);
let sampleImages = [];
let customImage = null; // user's own photo, index SAMPLES.length when set
let punchPanelIndex = 0;

function allImages() {
  const imgs = [...sampleImages];
  if (customImage) imgs[SAMPLES.length] = customImage;
  return imgs;
}

function currentSize() {
  const [w, h] = $('exportSize').value.split('x').map(Number);
  return { w, h };
}

function renderPreview() {
  const { w, h } = currentSize();
  const scale = 540 / w;
  previewCanvas.width = 540;
  previewCanvas.height = Math.round(h * scale);
  renderCover(previewCtx, previewCanvas.width, previewCanvas.height, state, allImages());
}

let renderQueued = false;
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; renderPreview(); });
}

function fillSelect(select, items, value) {
  select.innerHTML = '';
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name;
    select.appendChild(opt);
  }
  select.value = value;
}

function photoOptions() {
  const opts = [{ id: '-1', name: 'Gradient + decor' }];
  SAMPLES.forEach((s, i) => opts.push({ id: String(i), name: s.name }));
  if (customImage) opts.push({ id: String(SAMPLES.length), name: 'Your photo' });
  return opts;
}

function buildPanelControls() {
  const layout = getLayout(state.layoutId);
  const wrap = $('panelControls');
  wrap.innerHTML = '';
  const punchSel = $('punchPanel');
  punchSel.innerHTML = '';
  layout.panels.forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row';
    const label = document.createElement('span');
    label.textContent = `Panel ${i + 1}`;
    const sel = document.createElement('select');
    fillSelect(sel, photoOptions(), String(state.panelPhotos[i] != null ? state.panelPhotos[i] : i % SAMPLES.length));
    sel.addEventListener('change', () => {
      state.panelPhotos[i] = Number(sel.value);
      requestRender();
    });
    row.appendChild(label);
    row.appendChild(sel);
    wrap.appendChild(row);
    const po = document.createElement('option');
    po.value = String(i);
    po.textContent = `Panel ${i + 1}`;
    punchSel.appendChild(po);
  });
  // Normalise state arrays to the layout's panel count.
  while (state.panelPhotos.length < layout.panels.length) state.panelPhotos.push(state.panelPhotos.length % SAMPLES.length);
  while (state.punches.length < layout.panels.length) state.punches.push({ zoom: 1.1, fx: 0.5, fy: 0.45 });
  punchSel.value = String(Math.min(punchPanelIndex, layout.panels.length - 1));
  syncPunchControls();
}

function syncPunchControls() {
  const p = state.punches[punchPanelIndex] || { zoom: 1.1, fx: 0.5, fy: 0.45 };
  $('punchZoom').value = p.zoom;
  $('punchFx').value = p.fx;
  $('punchFy').value = p.fy;
}

function syncControlsFromState() {
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('captionStyle').value = state.captionStyle;
  $('layoutSelect').value = state.layoutId;
  $('gradeSelect').value = state.gradeId;
  $('dividerSelect').value = state.divider;
  $('sharpRange').value = state.sharp;
  buildPanelControls();
}

function applyState(next) {
  state = next;
  syncControlsFromState();
  requestRender();
}

function loadSample(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildSampleRow() {
  const row = $('sampleRow');
  row.innerHTML = '';
  SAMPLES.forEach((sample, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample-btn';
    const img = document.createElement('img');
    img.src = sample.src;
    img.alt = sample.name;
    const cap = document.createElement('span');
    cap.textContent = sample.name;
    btn.appendChild(img);
    btn.appendChild(cap);
    btn.title = `Put ${sample.name} in the selected punch panel`;
    btn.addEventListener('click', () => {
      state.panelPhotos[punchPanelIndex] = i;
      buildPanelControls();
      requestRender();
    });
    row.appendChild(btn);
  });
}

function setCustomPhoto(img) {
  customImage = img;
  state.panelPhotos[punchPanelIndex] = SAMPLES.length;
  buildPanelControls();
  requestRender();
}

function loadCustomFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => setCustomPhoto(img);
  img.src = url;
}

async function exportPng() {
  const { w, h } = currentSize();
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  renderCover(ctx, w, h, state, allImages());
  applySharpFinish(out, Number(state.sharp) || 0);
  const blob = await new Promise((res) => out.toBlob(res, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vice-cover-${w}x${h}.png`;
  a.click();
  $('exportPreview').src = url;
  $('exportFigure').hidden = false;
  return url;
}

function wireControls() {
  fillSelect($('captionStyle'), CAPTION_STYLES, state.captionStyle);
  fillSelect($('layoutSelect'), LAYOUTS, state.layoutId);
  fillSelect($('gradeSelect'), GRADES, state.gradeId);
  fillSelect($('dividerSelect'), DIVIDER_STYLES, state.divider);
  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value; requestRender(); });
  $('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; requestRender(); });
  $('captionStyle').addEventListener('change', (e) => { state.captionStyle = e.target.value; requestRender(); });
  $('layoutSelect').addEventListener('change', (e) => { state.layoutId = e.target.value; buildPanelControls(); requestRender(); });
  $('gradeSelect').addEventListener('change', (e) => { state.gradeId = e.target.value; requestRender(); });
  $('dividerSelect').addEventListener('change', (e) => { state.divider = e.target.value; requestRender(); });
  $('sharpRange').addEventListener('input', (e) => { state.sharp = Number(e.target.value); });
  $('punchPanel').addEventListener('change', (e) => { punchPanelIndex = Number(e.target.value); syncPunchControls(); });
  const punch = (key) => (e) => {
    if (!state.punches[punchPanelIndex]) state.punches[punchPanelIndex] = { zoom: 1.1, fx: 0.5, fy: 0.45 };
    state.punches[punchPanelIndex][key] = Number(e.target.value);
    requestRender();
  };
  $('punchZoom').addEventListener('input', punch('zoom'));
  $('punchFx').addEventListener('input', punch('fx'));
  $('punchFy').addEventListener('input', punch('fy'));
  $('exportSize').addEventListener('change', requestRender);
  $('exportBtn').addEventListener('click', () => { exportPng(); });
  $('surpriseBtn').addEventListener('click', () => {
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    applyState(recipeToState(recipe));
  });
  $('fileInput').addEventListener('change', (e) => loadCustomFile(e.target.files[0]));
  const zone = $('dropZone');
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    loadCustomFile(e.dataTransfer.files[0]);
  });
}

// Screenshot harness hook: shots.json names a state, the capture
// script applies it through here so screenshots are genuine renders.
window.__viceStudio = {
  applyShot(name) {
    const shot = SHOT_STATES[name];
    if (!shot) throw new Error(`unknown shot ${name}`);
    $('exportSize').value = shot.exportSize;
    applyState(recipeToState(RECIPES[shot.recipe]));
    document.body.classList.toggle('showcase', shot.view === 'showcase');
    if (shot.view === 'export') return exportPng();
    return null;
  },
  exportPng,
  getState: () => state,
};

async function init() {
  wireControls();
  buildSampleRow();
  sampleImages = await Promise.all(SAMPLES.map((s) => loadSample(s.src)));
  await document.fonts.load('80px Anton');
  syncControlsFromState();
  renderPreview();
}

init();
