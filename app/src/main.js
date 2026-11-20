// main.js — the VICE COVER STUDIO editor. It owns the cover state, loads
// the sample photographs, wires every control to that state and redraws
// the live preview through the same renderCover the exports use. Photos a
// visitor uploads are read on their own machine and never leave it.

import { SAMPLES, EXPORT_SIZES, RECIPES, sampleById } from './shots.js';
import { GRADES, DEFAULT_FINISH } from './grades.js';
import { LAYOUTS, panelsFor } from './layouts.js';
import { renderCover, DEFAULT_TITLE, DEFAULT_REVIEW } from './render.js';

const state = {
  layout: 'ensemble',
  grade: 'vice-sunset',
  style: 'chrome',
  title: DEFAULT_TITLE,
  subtitle: 'the whole crew',
  tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  review: DEFAULT_REVIEW,
  assign: {},
  panels: {},
  roles: {},
  finish: { ...DEFAULT_FINISH },
};

const images = {};
let selectedPanel = 'THE DRIVER';
let recipeCursor = 0;

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

function drawPreview() {
  renderCover(pctx, preview.width, preview.height, state, images);
}

let renderQueued = false;
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; drawPreview(); });
}

function loadSamples() {
  for (const sample of SAMPLES) {
    if (!sample.file) continue;
    const img = new Image();
    img.onload = () => { images[sample.id] = img; requestRender(); };
    img.src = sample.file;
  }
}

function panelTrim(key) {
  if (!state.panels[key]) state.panels[key] = { zoom: 1, ox: 0, oy: 0, punch: 0 };
  return state.panels[key];
}

function fillSelect(select, options, value) {
  select.innerHTML = '';
  for (const opt of options) {
    const el = document.createElement('option');
    el.value = opt.id;
    el.textContent = opt.name || opt.label;
    select.appendChild(el);
  }
  select.value = value;
}

function buildStrip() {
  const strip = $('strip');
  strip.innerHTML = '';
  for (const sample of SAMPLES) {
    const btn = document.createElement('button');
    btn.className = 'strip-item';
    btn.title = `${sample.name} — click to place in the selected panel`;
    if (sample.file) {
      const img = document.createElement('img');
      img.src = sample.file;
      img.alt = sample.name;
      btn.appendChild(img);
    } else {
      const sky = document.createElement('span');
      sky.className = 'strip-sky';
      btn.appendChild(sky);
    }
    const label = document.createElement('span');
    label.textContent = sample.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state.assign[selectedPanel] = sample.id;
      syncPanelList();
      requestRender();
    });
    strip.appendChild(btn);
  }
}

function buildPanelList() {
  const list = $('panels');
  list.innerHTML = '';
  const aspect = preview.width / preview.height;
  for (const p of panelsFor(state.layout, aspect)) {
    const row = document.createElement('div');
    row.className = 'panel-row' + (p.key === selectedPanel ? ' selected' : '');
    const roleInput = document.createElement('input');
    roleInput.className = 'role-input';
    roleInput.value = state.roles[p.key] || sampleById((state.assign[p.key] || p.sample)).role;
    roleInput.addEventListener('input', () => { state.roles[p.key] = roleInput.value; requestRender(); });
    roleInput.addEventListener('focus', () => selectPanel(p.key));
    const sampleSelect = document.createElement('select');
    sampleSelect.className = 'sample-select';
    fillSelect(sampleSelect, SAMPLES, state.assign[p.key] || p.sample);
    sampleSelect.addEventListener('change', () => {
      state.assign[p.key] = sampleSelect.value;
      selectPanel(p.key);
      requestRender();
    });
    const zoom = document.createElement('input');
    zoom.type = 'range'; zoom.min = '1'; zoom.max = '2.4'; zoom.step = '0.01';
    zoom.value = String(panelTrim(p.key).zoom);
    zoom.className = 'zoom-slider';
    zoom.title = 'Panel zoom';
    zoom.addEventListener('input', () => { panelTrim(p.key).zoom = Number(zoom.value); requestRender(); });
    const punch = document.createElement('input');
    punch.type = 'range'; punch.min = '-0.15'; punch.max = '0.15'; punch.step = '0.005';
    punch.value = String(panelTrim(p.key).punch);
    punch.className = 'punch-slider';
    punch.title = 'Panel punch — this panel’s contrast and saturation trim';
    punch.addEventListener('input', () => { panelTrim(p.key).punch = Number(punch.value); requestRender(); });
    row.append(roleInput, sampleSelect, zoom, punch);
    row.addEventListener('click', () => selectPanel(p.key));
    list.appendChild(row);
  }
}

function syncPanelList() { buildPanelList(); }

function selectPanel(key) {
  selectedPanel = key;
  document.querySelectorAll('.panel-row').forEach((row, i) => {
    const panels = panelsFor(state.layout, preview.width / preview.height);
    row.classList.toggle('selected', panels[i] && panels[i].key === key);
  });
}

function setPreviewSize(sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[1];
  const scale = size.id === 'wide' ? 720 / size.w : 540 / size.w;
  preview.width = Math.round(size.w * scale);
  preview.height = Math.round(size.h * scale);
  buildPanelList();
  requestRender();
}

function exportPNG(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas.getContext('2d'), size.w, size.h, state, images);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

function wireControls() {
  fillSelect($('layout'), LAYOUTS, state.layout);
  fillSelect($('grade'), GRADES, state.grade);
  fillSelect($('style'), [
    { id: 'chrome', name: 'Chrome Poster' },
    { id: 'neon', name: 'Neon Script' },
    { id: 'bold', name: 'Bold Block' },
  ], state.style);
  fillSelect($('size'), EXPORT_SIZES.map((s) => ({ id: s.id, name: s.label })), 'portrait');
  $('layout').addEventListener('change', (e) => { state.layout = e.target.value; buildPanelList(); requestRender(); });
  $('grade').addEventListener('change', (e) => { state.grade = e.target.value; requestRender(); });
  $('style').addEventListener('change', (e) => { state.style = e.target.value; requestRender(); });
  $('size').addEventListener('change', (e) => setPreviewSize(e.target.value));
  $('title').addEventListener('input', (e) => { state.title = e.target.value.toUpperCase() || DEFAULT_TITLE; requestRender(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; requestRender(); });
  $('tagline').addEventListener('input', (e) => { state.tagline = e.target.value.toUpperCase(); requestRender(); });
  $('sharp').addEventListener('input', (e) => { state.finish.sharp = Number(e.target.value); requestRender(); });
  $('grain').addEventListener('input', (e) => { state.finish.grain = Number(e.target.value); requestRender(); });
  $('surprise').addEventListener('click', () => {
    const recipe = RECIPES[recipeCursor % RECIPES.length];
    recipeCursor += 1;
    Object.assign(state, {
      layout: recipe.layout, grade: recipe.grade, style: recipe.style,
      title: recipe.title, subtitle: recipe.subtitle, tagline: recipe.tagline,
    });
    $('layout').value = state.layout; $('grade').value = state.grade; $('style').value = state.style;
    $('title').value = state.title; $('subtitle').value = state.subtitle; $('tagline').value = state.tagline;
    $('recipe-name').textContent = recipe.name;
    buildPanelList();
    requestRender();
  });
  $('upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      images.upload = img;
      if (!SAMPLES.some((s) => s.id === 'upload')) {
        SAMPLES.push({ id: 'upload', file: null, name: 'Your Photo', role: 'THE STAR', punch: 1, focus: { x: 0.5, y: 0.5 } });
      }
      state.assign[selectedPanel] = 'upload';
      buildStrip();
      buildPanelList();
      requestRender();
    };
    img.src = URL.createObjectURL(file);
  });
  for (const size of EXPORT_SIZES) {
    $(`export-${size.id}`).addEventListener('click', () => exportPNG(size));
  }
  wirePreviewDrag();
}

// Dragging on the preview nudges the selected panel's crop: the offset is
// stored as a fraction of the panel so it survives a change of size.
function wirePreviewDrag() {
  let dragging = null;
  preview.addEventListener('pointerdown', (e) => {
    dragging = { x: e.clientX, y: e.clientY };
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const trim = panelTrim(selectedPanel);
    trim.ox = Math.min(0.45, Math.max(-0.45, trim.ox - (e.clientX - dragging.x) / preview.width));
    trim.oy = Math.min(0.45, Math.max(-0.45, trim.oy - (e.clientY - dragging.y) / preview.height));
    dragging = { x: e.clientX, y: e.clientY };
    requestRender();
  });
  preview.addEventListener('pointerup', () => { dragging = null; });
}

loadSamples();
wireControls();
buildStrip();
buildPanelList();
drawPreview();

window.__vcs = { state, images, renderCover };
