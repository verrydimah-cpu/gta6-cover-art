// VICE COVER STUDIO — editor wiring.
//
// This module owns the state, the controls and the preview loop. All
// painting is delegated to renderCover in render.js; this file only decides
// WHAT the cover currently is: which layout, grade and words, which photo
// sits in which panel, and how each panel is cropped. Uploaded photographs
// join the same image pool as the bundled samples, so a user's own picture
// can fill any panel through exactly the same path.

import { GRADES } from './grades.js';
import { LAYOUTS, freshPanels, layoutById } from './layouts.js';
import { CAPTION_STYLES, DIVIDER_STYLES, renderCover } from './render.js';
import { DEFAULT_TEXT } from './decor.js';
import { RECIPES, SAMPLES } from './shots.js';

const ASPECTS = [
  { id: '1080x1350', name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: '1080x1080', name: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: '1920x1080', name: 'Wide 1920×1080', w: 1920, h: 1080 },
];

const state = {
  layoutId: 'ensemble',
  gradeId: 'vice-sunset',
  captionId: 'chrome-block',
  dividerId: 'gold',
  aspectId: '1080x1350',
  sharp: 0.62,
  panels: freshPanels('ensemble'),
  selected: 0,
  text: { ...DEFAULT_TEXT },
};

// Image pool: sample id -> HTMLImageElement (or null while loading).
const images = {};
let uploadCount = 0;

const $ = (sel) => document.querySelector(sel);
const preview = $('#preview');
const status = $('#status');

function setStatus(msg) {
  status.textContent = msg;
}

function currentAspect() {
  return ASPECTS.find((a) => a.id === state.aspectId) || ASPECTS[0];
}

function draw() {
  const aspect = currentAspect();
  // Preview at a working resolution with the same aspect as the export;
  // renderCover is resolution-independent, so this is a faithful preview.
  const scale = Math.min(1, 620 / aspect.w);
  preview.width = Math.round(aspect.w * scale);
  preview.height = Math.round(aspect.h * scale);
  renderCover(preview, state, images);
}

function loadSample(sample) {
  if (!sample.src) return; // the gradient needs no image
  const img = new Image();
  img.onload = () => {
    images[sample.id] = img;
    draw();
  };
  img.onerror = () => setStatus(`Could not load ${sample.name}`);
  img.src = sample.src;
}

function buildSampleStrip() {
  const strip = $('#sample-strip');
  strip.innerHTML = '';
  for (const sample of SAMPLES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample-btn';
    btn.dataset.sample = sample.id;
    btn.title = sample.name;
    if (sample.src) {
      const thumb = document.createElement('img');
      thumb.src = sample.src;
      thumb.alt = sample.name;
      btn.appendChild(thumb);
    } else {
      const swatch = document.createElement('span');
      swatch.className = 'sample-gradient';
      btn.appendChild(swatch);
    }
    const label = document.createElement('span');
    label.textContent = sample.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      const p = state.panels[state.selected];
      if (!p) return;
      p.sample = sample.id;
      setStatus(`${sample.name} → panel “${p.tag}”`);
      draw();
      refreshPanelList();
    });
    strip.appendChild(btn);
  }
}

function refreshPanelList() {
  const list = $('#panel-list');
  list.innerHTML = '';
  state.panels.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-btn' + (i === state.selected ? ' active' : '');
    btn.textContent = `${i + 1}. ${p.tag || 'Untitled'}`;
    btn.addEventListener('click', () => {
      state.selected = i;
      syncPanelControls();
      refreshPanelList();
    });
    list.appendChild(btn);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const p = state.panels[state.selected];
  if (!p) return;
  $('#panel-tag').value = p.tag || '';
  $('#panel-x').value = Math.round((p.ox ?? 0.5) * 100);
  $('#panel-y').value = Math.round((p.oy ?? 0.5) * 100);
  $('#panel-zoom').value = Math.round((p.zoom || 1) * 100);
  $('#panel-punch').value = Math.round((p.punch ?? 0.35) * 100);
}

function bindPanelControls() {
  const p = () => state.panels[state.selected];
  $('#panel-tag').addEventListener('input', (e) => {
    if (p()) p().tag = e.target.value.toUpperCase();
    draw();
    refreshPanelListLabelsOnly();
  });
  const bindSlider = (sel, fn) => {
    $(sel).addEventListener('input', (e) => {
      if (p()) fn(p(), Number(e.target.value) / 100);
      draw();
    });
  };
  bindSlider('#panel-x', (panel, v) => (panel.ox = v));
  bindSlider('#panel-y', (panel, v) => (panel.oy = v));
  bindSlider('#panel-zoom', (panel, v) => (panel.zoom = Math.max(0.4, v)));
  bindSlider('#panel-punch', (panel, v) => (panel.punch = v));
}

function refreshPanelListLabelsOnly() {
  document.querySelectorAll('.panel-btn').forEach((btn, i) => {
    btn.textContent = `${i + 1}. ${state.panels[i].tag || 'Untitled'}`;
  });
}

function buildSelect(sel, options, value, onChange) {
  const el = $(sel);
  el.innerHTML = '';
  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt.id;
    o.textContent = opt.name;
    el.appendChild(o);
  }
  el.value = value;
  el.addEventListener('change', () => onChange(el.value));
}

function bindTextInputs() {
  const map = {
    '#text-title-top': 'titleTop',
    '#text-title-bottom': 'titleBottom',
    '#text-subtitle': 'subtitle',
    '#text-tagline': 'tagline',
    '#text-review': 'review',
  };
  for (const [sel, key] of Object.entries(map)) {
    const el = $(sel);
    el.value = state.text[key];
    el.addEventListener('input', () => {
      state.text[key] = key.startsWith('title') || key === 'tagline'
        ? el.value.toUpperCase()
        : el.value;
      draw();
    });
  }
}

function exportPng(w, h, filename) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas, state, images);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setStatus(`Exported ${filename} (${w}×${h})`);
  }, 'image/png');
}

function bindExports() {
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [w, h] = btn.dataset.export.split('x').map(Number);
      exportPng(w, h, `vice-cover-${w}x${h}.png`);
    });
  });
}

function bindUpload() {
  $('#upload-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          uploadCount += 1;
          const id = `upload-${uploadCount}`;
          images[id] = img;
          const p = state.panels[state.selected];
          if (p) p.sample = id;
          addUploadThumb(id, img, file.name);
          setStatus(`Loaded your photo ${file.name}`);
          draw();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  });
}

function addUploadThumb(id, img, name) {
  const strip = $('#sample-strip');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sample-btn';
  btn.title = name;
  const thumb = document.createElement('img');
  thumb.src = img.src;
  thumb.alt = name;
  btn.appendChild(thumb);
  const label = document.createElement('span');
  label.textContent = 'Your photo';
  btn.appendChild(label);
  btn.addEventListener('click', () => {
    const p = state.panels[state.selected];
    if (!p) return;
    p.sample = id;
    draw();
  });
  strip.appendChild(btn);
}

function bindSurprise() {
  $('#surprise-btn').addEventListener('click', () => {
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    applyRecipe(recipe);
    setStatus(`Surprise Me → ${recipe.name}`);
  });
  const list = $('#recipe-list');
  for (const recipe of RECIPES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'recipe-btn';
    btn.textContent = recipe.name;
    btn.addEventListener('click', () => {
      applyRecipe(recipe);
      setStatus(`Recipe → ${recipe.name}`);
    });
    list.appendChild(btn);
  }
}

function applyRecipe(recipe) {
  state.layoutId = recipe.layoutId;
  state.gradeId = recipe.gradeId;
  state.captionId = recipe.captionId;
  state.dividerId = recipe.dividerId;
  state.text.titleTop = recipe.titleTop;
  state.text.titleBottom = recipe.titleBottom;
  state.text.tagline = recipe.tagline;
  // Keep the user's photographs; only re-tag panels whose sample vanished.
  const oldSamples = state.panels.map((p) => p.sample);
  state.panels = freshPanels(recipe.layoutId);
  state.panels.forEach((p, i) => {
    if (oldSamples[i] && (images[oldSamples[i]] || oldSamples[i] === 'sunset-gradient')) {
      p.sample = oldSamples[i];
    }
  });
  state.selected = 0;
  $('#layout-select').value = state.layoutId;
  $('#grade-select').value = state.gradeId;
  $('#caption-select').value = state.captionId;
  $('#divider-select').value = state.dividerId;
  $('#text-title-top').value = state.text.titleTop;
  $('#text-title-bottom').value = state.text.titleBottom;
  $('#text-tagline').value = state.text.tagline;
  refreshPanelList();
  draw();
}

function init() {
  buildSelect('#layout-select', LAYOUTS, state.layoutId, (v) => {
    state.layoutId = v;
    state.panels = freshPanels(v);
    state.selected = 0;
    refreshPanelList();
    draw();
    setStatus(`Layout → ${layoutById(v).name}`);
  });
  buildSelect('#grade-select', GRADES, state.gradeId, (v) => {
    state.gradeId = v;
    draw();
  });
  buildSelect('#caption-select', CAPTION_STYLES, state.captionId, (v) => {
    state.captionId = v;
    draw();
  });
  buildSelect('#divider-select', DIVIDER_STYLES, state.dividerId, (v) => {
    state.dividerId = v;
    draw();
  });
  buildSelect('#aspect-select', ASPECTS, state.aspectId, (v) => {
    state.aspectId = v;
    draw();
  });
  $('#sharp-slider').value = Math.round(state.sharp * 100);
  $('#sharp-slider').addEventListener('input', (e) => {
    state.sharp = Number(e.target.value) / 100;
    draw();
  });
  bindTextInputs();
  bindPanelControls();
  bindExports();
  bindUpload();
  bindSurprise();
  buildSampleStrip();
  refreshPanelList();
  for (const sample of SAMPLES) loadSample(sample);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => draw());
  }
  draw();
  setStatus('Ensemble Poster loaded — ten panels, starring THE RIDER. Pick a panel, then cast a photo.');
}

init();
