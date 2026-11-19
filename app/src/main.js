// VICE COVER STUDIO — editor wiring: photo slots, controls, live preview,
// Surprise Me and PNG export. Everything runs locally; photos never upload.
import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';
import { SIZES, CAPTION_STYLES, DIVIDERS, RECIPES, sizeById } from './shots.js';
import { renderCover, exportCover } from './render.js';

const SAMPLES = [
  { src: 'samples/neon-woman.webp', label: 'Neon portrait' },
  { src: 'samples/speedboat.webp', label: 'Speedboat' },
  { src: 'samples/sunset-car.webp', label: 'Sunset car' },
  { src: 'samples/yacht-man.webp', label: 'Yacht day' },
];
const state = {
  layout: 'hero-trio', grade: 'vice-sunset', caption: 'poster', divider: 'neon',
  title: 'VICE COVER', subtitle: 'one night in leonida',
  size: 'square', grain: 0.45, sharp: 0.6, activeSlot: 0,
  photos: [0, 1, 2, 3].map(() => ({ img: null, dx: 0, dy: 0, zoom: 1, punch: 0.4 })),
};
const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

function drawPreview() {
  const size = sizeById(state.size);
  const scale = Math.min(560 / size.w, 560 / size.h);
  preview.width = Math.round(size.w * scale);
  preview.height = Math.round(size.h * scale);
  renderCover(pctx, state, preview.width, preview.height);
}
function fillSelect(id, items, value) {
  const el = $(id);
  el.innerHTML = '';
  for (const it of items) {
    const o = document.createElement('option');
    o.value = it.id;
    o.textContent = it.name;
    el.appendChild(o);
  }
  el.value = value;
}
function loadIntoSlot(slot, src) {
  const img = new Image();
  img.onload = () => {
    state.photos[slot].img = img;
    state.activeSlot = slot;
    markActiveSlot();
    drawPreview();
  };
  img.src = src;
}
function markActiveSlot() {
  document.querySelectorAll('.slot-btn').forEach((b, i) => {
    b.classList.toggle('active', i === state.activeSlot);
  });
  const s = state.photos[state.activeSlot];
  $('pos-x').value = s.dx;
  $('pos-y').value = s.dy;
  $('zoom').value = s.zoom;
  $('punch').value = s.punch;
}
function buildSlots() {
  const wrap = $('slots');
  SAMPLES.forEach((sample, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot-btn';
    b.textContent = `Panel ${i + 1} · ${sample.label}`;
    b.addEventListener('click', () => loadIntoSlot(i, sample.src));
    wrap.appendChild(b);
  });
}
function surprise() {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  Object.assign(state, { layout: r.layout, grade: r.grade, caption: r.caption,
    divider: r.divider, grain: r.grain, sharp: r.sharp });
  $('layout').value = r.layout;
  $('grade').value = r.grade;
  $('caption-style').value = r.caption;
  $('divider').value = r.divider;
  $('grain').value = r.grain;
  $('sharp').value = r.sharp;
  drawPreview();
}
function exportPng() {
  const size = sizeById(state.size);
  const c = exportCover(state, size);
  const a = document.createElement('a');
  a.download = `vice-cover-${size.id}.png`;
  a.href = c.toDataURL('image/png');
  a.click();
  $('status').textContent = `Exported ${size.w}×${size.h} PNG — check your downloads. Post it!`;
}
function bind() {
  fillSelect('layout', LAYOUTS, state.layout);
  fillSelect('grade', GRADES, state.grade);
  fillSelect('caption-style', CAPTION_STYLES, state.caption);
  fillSelect('divider', DIVIDERS, state.divider);
  fillSelect('size', SIZES, state.size);
  $('layout').addEventListener('change', (e) => { state.layout = e.target.value; drawPreview(); });
  $('grade').addEventListener('change', (e) => { state.grade = e.target.value; drawPreview(); });
  $('caption-style').addEventListener('change', (e) => { state.caption = e.target.value; drawPreview(); });
  $('divider').addEventListener('change', (e) => { state.divider = e.target.value; drawPreview(); });
  $('size').addEventListener('change', (e) => { state.size = e.target.value; drawPreview(); });
  $('title').addEventListener('input', (e) => { state.title = e.target.value; drawPreview(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; drawPreview(); });
  $('grain').addEventListener('input', (e) => { state.grain = Number(e.target.value); drawPreview(); });
  $('sharp').addEventListener('input', (e) => { state.sharp = Number(e.target.value); drawPreview(); });
  const slotCtl = (id, key) => $(id).addEventListener('input', (e) => {
    state.photos[state.activeSlot][key] = Number(e.target.value);
    drawPreview();
  });
  slotCtl('pos-x', 'dx');
  slotCtl('pos-y', 'dy');
  slotCtl('zoom', 'zoom');
  slotCtl('punch', 'punch');
  $('upload').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    loadIntoSlot(state.activeSlot, url);
    $('status').textContent = `Loaded your photo into panel ${state.activeSlot + 1} — it never leaves this machine.`;
  });
  $('sample-all').addEventListener('click', () => {
    SAMPLES.forEach((s, i) => loadIntoSlot(i, s.src));
    $('status').textContent = 'All four sample photos loaded, one per panel.';
  });
  $('surprise').addEventListener('click', surprise);
  $('export').addEventListener('click', exportPng);
}
buildSlots();
bind();
markActiveSlot();
loadIntoSlot(0, SAMPLES[2].src);
loadIntoSlot(1, SAMPLES[0].src);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPreview);
drawPreview();
window.__viceStudio = { state, drawPreview, surprise, exportPng, loadIntoSlot };
