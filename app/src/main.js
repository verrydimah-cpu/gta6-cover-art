// VICE COVER STUDIO's editor: wires the page to the cover renderer. Photos arrive by file picker,
// drag-and-drop or the sample buttons and collect in a tray; clicking a panel on the live preview
// selects it, the tray's active photo fills it, and the photo can be dragged inside the panel and
// zoomed with the slider or the mouse wheel. Layout, grade, caption and export size are plain
// controls; the preview canvas is the export drawing itself, so what you see is the PNG you get.
// A `?shot=` URL builds a fixed scene instead (./shots.js), for screenshots.
import { LAYOUTS, layoutById, polygonBounds, pointInPolygon } from './layouts.js';
import { GRADES } from './grades.js';
import { EXPORT_SIZES, exportSizeById, renderCover, renderCoverToCanvas } from './render.js';
import { SAMPLE_PHOTOS, sampleByKey, readShotSetup } from './shots.js';

const canvas = document.getElementById('coverCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const tray = document.getElementById('tray');
const panelStatus = document.getElementById('panelStatus');
const zoomSlider = document.getElementById('zoom');
const status = document.getElementById('status');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');

/** A fresh, empty panel assignment. */
function blankPanel() {
  return { image: null, name: '', dx: 0, dy: 0, zoom: 1 };
}

/** The whole studio state: photos in the tray, the active one, and the cover being built. */
const state = {
  layout: 'hero',
  grade: 'sunset',
  sizeId: 'square',
  captionPos: 'bottom',
  title: titleInput.value,
  subtitle: subtitleInput.value,
  panels: Array.from({ length: 6 }, blankPanel),
  selected: -1,
};
const photos = []; // {image, name, url}
let activePhoto = -1;

/** Loads an image from a URL, resolving once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Repaints the preview canvas from the state, at the canvas's current pixel size. */
function redraw() {
  renderCover(ctx, canvas.width, canvas.height, { ...state, showHints: true });
  updatePanelStatus();
}

/** Describes the selected panel under the Panel controls. */
function updatePanelStatus() {
  const layout = layoutById(state.layout);
  if (state.selected < 0 || state.selected >= layout.panels.length) {
    panelStatus.textContent = 'Click a panel on the cover to select it.';
    return;
  }
  const panel = state.panels[state.selected];
  panelStatus.textContent = panel.image
    ? `Panel ${state.selected + 1} of ${layout.panels.length} — ${panel.name}. Drag the photo to frame it, scroll or slide to zoom.`
    : `Panel ${state.selected + 1} of ${layout.panels.length} is empty — pick a photo from the tray to fill it.`;
}

/** Marks the tray's active photo and re-renders the thumbnails' outlines. */
function renderTray() {
  [...tray.children].forEach((button, i) => button.classList.toggle('active', i === activePhoto));
}

/** Adds a loaded image to the tray and, when a panel is waiting, into the selected or first empty panel. */
function addPhoto(image, name, url) {
  const entry = { image, name, url };
  photos.push(entry);
  activePhoto = photos.length - 1;
  const button = document.createElement('button');
  button.type = 'button';
  button.title = name;
  const thumb = document.createElement('img');
  thumb.src = url;
  thumb.alt = name;
  button.append(thumb);
  button.addEventListener('click', () => {
    activePhoto = photos.indexOf(entry);
    if (state.selected >= 0) assignPanel(state.selected, entry);
    renderTray();
    redraw();
  });
  tray.append(button);
  const layout = layoutById(state.layout);
  const target = state.selected >= 0 && state.selected < layout.panels.length
    ? state.selected
    : state.panels.findIndex((panel, i) => i < layout.panels.length && !panel.image);
  if (target >= 0) {
    assignPanel(target, photos[activePhoto]);
    state.selected = target;
  }
  renderTray();
  syncZoomSlider();
  redraw();
}

/** Puts a tray photo into a panel, keeping any crop the panel already had for that same photo. */
function assignPanel(index, photo) {
  const panel = state.panels[index];
  if (panel.image !== photo.image) {
    panel.dx = 0;
    panel.dy = 0;
    panel.zoom = 1;
  }
  panel.image = photo.image;
  panel.name = photo.name;
}

/** Reads image files from a picker or a drop and adds each to the tray. */
async function addFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    addPhoto(image, file.name.replace(/\.[^.]+$/, ''), url);
  }
}

/* ---------- photo controls ---------- */
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click();
});
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragging');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragging');
  addFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => {
  addFiles(fileInput.files);
  fileInput.value = '';
});
for (const sample of SAMPLE_PHOTOS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = sample.label;
  button.addEventListener('click', async () => {
    const image = await loadImage(sample.src);
    addPhoto(image, sample.label, sample.src);
  });
  document.getElementById('sampleButtons').append(button);
}

/* ---------- layout, grade and size pickers ---------- */
function buildLayoutButtons() {
  const host = document.getElementById('layoutButtons');
  for (const layout of LAYOUTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.layout = layout.id;
    button.title = layout.blurb;
    const points = layout.panels
      .map((polygon, i) => `<polygon points="${polygon.map(([x, y]) => `${x * 100},${y * 60}`).join(' ')}" fill="${i % 2 ? '#ff7a3e' : '#ffc93e'}" stroke="#f7ead9" stroke-width="1.6"/>`)
      .join('');
    button.innerHTML = `<svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">${points}</svg><span class="layout-name">${layout.name}</span>`;
    button.addEventListener('click', () => {
      state.layout = layout.id;
      if (state.selected >= layout.panels.length) state.selected = -1;
      markActiveButtons();
      syncZoomSlider();
      redraw();
    });
    host.append(button);
  }
}

function buildGradeButtons() {
  const host = document.getElementById('gradeButtons');
  for (const [id, grade] of Object.entries(GRADES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.grade = id;
    button.textContent = grade.name;
    button.addEventListener('click', () => {
      state.grade = id;
      markActiveButtons();
      redraw();
    });
    host.append(button);
  }
}

function buildSizeSelect() {
  const select = document.getElementById('sizeSelect');
  for (const size of EXPORT_SIZES) {
    const option = document.createElement('option');
    option.value = size.id;
    option.textContent = size.label;
    select.append(option);
  }
  select.addEventListener('change', () => {
    state.sizeId = select.value;
    const size = exportSizeById(state.sizeId);
    canvas.width = size.w;
    canvas.height = size.h;
    redraw();
  });
}

/** Highlights the picker buttons that match the state. */
function markActiveButtons() {
  document.querySelectorAll('#layoutButtons button').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('#gradeButtons button').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
}

/* ---------- panel controls ---------- */
function syncZoomSlider() {
  const panel = state.panels[state.selected];
  zoomSlider.value = panel && panel.image ? String(panel.zoom) : '1';
}
zoomSlider.addEventListener('input', () => {
  const panel = state.panels[state.selected];
  if (!panel || !panel.image) return;
  panel.zoom = Number.parseFloat(zoomSlider.value);
  redraw();
});
document.getElementById('fillAll').addEventListener('click', () => {
  if (activePhoto < 0) return;
  const layout = layoutById(state.layout);
  layout.panels.forEach((_, i) => assignPanel(i, photos[activePhoto]));
  redraw();
});
document.getElementById('spread').addEventListener('click', () => {
  if (!photos.length) return;
  const layout = layoutById(state.layout);
  layout.panels.forEach((_, i) => assignPanel(i, photos[i % photos.length]));
  redraw();
});
document.getElementById('resetCrop').addEventListener('click', () => {
  const panel = state.panels[state.selected];
  if (!panel) return;
  panel.dx = 0;
  panel.dy = 0;
  panel.zoom = 1;
  syncZoomSlider();
  redraw();
});
document.getElementById('captionPos').addEventListener('change', (e) => {
  state.captionPos = e.target.value;
  redraw();
});
titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  redraw();
});
subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value;
  redraw();
});

/* ---------- canvas: select, drag, zoom, drop ---------- */
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}

/** The index of the layout panel under a canvas point, or -1. */
function panelAt(x, y) {
  const layout = layoutById(state.layout);
  const nx = x / canvas.width;
  const ny = y / canvas.height;
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    if (pointInPolygon(layout.panels[i], nx, ny)) return i;
  }
  return -1;
}

/** The pan slack (in pixels) a panel's photo has at its current zoom — how far it may be dragged. */
function panelSlack(panel, polygon) {
  const b = polygonBounds(polygon);
  const bw = b.w * canvas.width;
  const bh = b.h * canvas.height;
  const scale = Math.max(bw / panel.image.naturalWidth, bh / panel.image.naturalHeight) * Math.max(1, panel.zoom);
  return {
    x: Math.max(0, (panel.image.naturalWidth * scale - bw) / 2),
    y: Math.max(0, (panel.image.naturalHeight * scale - bh) / 2),
  };
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = canvasPoint(e);
  const index = panelAt(x, y);
  if (index < 0) return;
  state.selected = index;
  const panel = state.panels[index];
  if (panel.image) {
    const slack = panelSlack(panel, layoutById(state.layout).panels[index]);
    drag = { startX: x, startY: y, dx: panel.dx, dy: panel.dy, slack };
    canvas.setPointerCapture(e.pointerId);
  }
  syncZoomSlider();
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { x, y } = canvasPoint(e);
  const panel = state.panels[state.selected];
  if (drag.slack.x > 0) panel.dx = Math.max(-1, Math.min(1, drag.dx + (x - drag.startX) / drag.slack.x));
  if (drag.slack.y > 0) panel.dy = Math.max(-1, Math.min(1, drag.dy + (y - drag.startY) / drag.slack.y));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  const panel = state.panels[state.selected];
  if (!panel || !panel.image) return;
  e.preventDefault();
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.07 : 0.935)));
  syncZoomSlider();
  redraw();
}, { passive: false });
canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', async (e) => {
  e.preventDefault();
  const { x, y } = canvasPoint(e);
  const index = panelAt(x, y);
  if (index >= 0) state.selected = index;
  await addFiles(e.dataTransfer.files);
});

/* ---------- export ---------- */
document.getElementById('exportButton').addEventListener('click', () => {
  const size = exportSizeById(state.sizeId);
  const out = renderCoverToCanvas(state, size.w, size.h);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    status.textContent = `Saved vice-cover-${size.w}x${size.h}.png — ready to post.`;
  }, 'image/png');
});

/* ---------- screenshot scenes ---------- */
async function applyShot(shot) {
  if (shot.layout) state.layout = shot.layout;
  if (shot.grade) state.grade = shot.grade;
  if (shot.title !== undefined) { state.title = shot.title; titleInput.value = shot.title; }
  if (shot.subtitle !== undefined) { state.subtitle = shot.subtitle; subtitleInput.value = shot.subtitle; }
  if (shot.captionPos) { state.captionPos = shot.captionPos; document.getElementById('captionPos').value = shot.captionPos; }
  if (shot.mode === 'cover') {
    document.body.classList.add('shot-cover');
    if (shot.width && shot.height) {
      canvas.width = shot.width;
      canvas.height = shot.height;
    }
  }
  const keys = shot.assign ?? SAMPLE_PHOTOS.map((s) => s.key);
  const loaded = new Map();
  for (const key of new Set(keys)) {
    const sample = sampleByKey(key);
    if (sample) loaded.set(key, { image: await loadImage(sample.src), name: sample.label, url: sample.src });
  }
  keys.forEach((key, i) => {
    const photo = loaded.get(key);
    if (!photo) return;
    if (shot.mode === 'editor' && !photos.includes(photo)) {
      photos.push(photo);
      const button = document.createElement('button');
      button.type = 'button';
      button.title = photo.name;
      const thumb = document.createElement('img');
      thumb.src = photo.url;
      thumb.alt = photo.name;
      button.append(thumb);
      button.addEventListener('click', () => { activePhoto = photos.indexOf(photo); renderTray(); });
      tray.append(button);
    }
    const panel = state.panels[i];
    panel.image = photo.image;
    panel.name = photo.name;
    panel.zoom = Math.max(1, shot.zooms?.[i] ?? 1);
    panel.dx = shot.dxs?.[i] ?? 0;
    panel.dy = shot.dys?.[i] ?? 0;
  });
  if (photos.length) activePhoto = 0;
  state.selected = Number.isInteger(shot.selected) ? shot.selected : (shot.mode === 'editor' ? 0 : -1);
  markActiveButtons();
  renderTray();
  syncZoomSlider();
  try { await document.fonts.load('80px Anton'); } catch { /* the fallback font still renders */ }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

/* ---------- start ---------- */
buildLayoutButtons();
buildGradeButtons();
buildSizeSelect();
markActiveButtons();
const shot = readShotSetup();
if (shot) {
  applyShot(shot);
} else {
  redraw();
  document.fonts?.ready.then(() => redraw());
}
