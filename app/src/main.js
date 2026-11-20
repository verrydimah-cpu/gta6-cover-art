'use strict';
/* VICE COVER STUDIO — the studio floor.
   Loads the cast photos, wires every control to the one state object and
   re-renders through the single renderer. Exports are the same render at
   print size, written out as PNG. */
(function () {
  const state = VCS.defaultState();
  const images = {};
  let selectedPanel = 'driver';
  let aspect = 'portrait';
  const ASPECTS = { portrait: [900, 1125], square: [1000, 1000], wide: [1280, 720] };
  const EXPORTS = { '1080 × 1350': [1080, 1350], '1080 × 1080': [1080, 1080], '1920 × 1080': [1920, 1080] };

  const $ = (id) => document.getElementById(id);
  const canvas = $('stage');

  function render() {
    const [w, h] = ASPECTS[aspect];
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    VCS.renderCover(canvas, state, images);
  }

  /* ---- cast photos -------------------------------------------------- */
  for (const s of VCS.SAMPLES) {
    if (!s.file) continue;
    const img = new Image();
    img.onload = render;
    img.src = s.file;
    images[s.id] = img;
  }

  /* ---- sample strip ------------------------------------------------- */
  const strip = $('strip');
  function addStripButton(sample) {
    const btn = document.createElement('button');
    btn.className = 'thumb';
    btn.title = sample.label;
    if (sample.file) {
      const img = document.createElement('img');
      img.src = sample.file; img.alt = sample.label;
      btn.appendChild(img);
    } else {
      btn.classList.add('sky-thumb');
      btn.textContent = 'SKY';
    }
    const cap = document.createElement('span');
    cap.textContent = sample.label;
    btn.appendChild(cap);
    btn.addEventListener('click', () => {
      panelCfg().sample = sample.id;
      syncPanelEditor();
      render();
    });
    strip.appendChild(btn);
  }
  VCS.SAMPLES.forEach(addStripButton);

  $('upload').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const id = `upload-${Date.now()}`;
        const sample = { id, file: null, label: file.name.slice(0, 18) || 'Your photo', role: 'THE STAR', punch: 1, fx: 0.5, fy: 0.5 };
        VCS.SAMPLES.push(sample);
        images[id] = img;
        addStripButton({ ...sample, file: String(reader.result) });
        panelCfg().sample = id;
        syncPanelEditor();
        render();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  /* ---- panel editor ------------------------------------------------- */
  function panelCfg() {
    if (!state.panels[selectedPanel]) {
      state.panels = VCS.freshPanels(state.layout);
      selectedPanel = VCS.layoutById(state.layout).panels[0].id;
    }
    return state.panels[selectedPanel];
  }

  const panelSelect = $('panel-select');
  function rebuildPanelSelect() {
    panelSelect.innerHTML = '';
    for (const p of VCS.layoutById(state.layout).panels) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.role} — ${VCS.sampleById((state.panels[p.id] || p).sample || p.sample).label}`;
      panelSelect.appendChild(opt);
    }
    panelSelect.value = selectedPanel;
  }
  panelSelect.addEventListener('change', () => { selectedPanel = panelSelect.value; syncPanelEditor(); });

  /* the panel's photo can also be swapped from the editor's own dropdown */
  const photoSelect = $('photo-select');
  function rebuildPhotoSelect() {
    photoSelect.innerHTML = '';
    for (const s of VCS.SAMPLES) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.label;
      photoSelect.appendChild(opt);
    }
  }
  rebuildPhotoSelect();
  photoSelect.addEventListener('change', () => { panelCfg().sample = photoSelect.value; render(); });

  function syncPanelEditor() {
    const cfg = panelCfg();
    photoSelect.value = cfg.sample;
    $('role-input').value = cfg.role || '';
    $('punch').value = cfg.punch;
    $('zoom').value = cfg.zoom;
    $('focus-x').value = cfg.fx;
    $('focus-y').value = cfg.fy;
    rebuildPanelSelect();
  }
  $('role-input').addEventListener('input', (e) => { panelCfg().role = e.target.value.toUpperCase(); render(); });
  $('punch').addEventListener('input', (e) => { panelCfg().punch = Number(e.target.value); render(); });
  $('zoom').addEventListener('input', (e) => { panelCfg().zoom = Number(e.target.value); render(); });
  $('focus-x').addEventListener('input', (e) => { panelCfg().fx = Number(e.target.value); render(); });
  $('focus-y').addEventListener('input', (e) => { panelCfg().fy = Number(e.target.value); render(); });

  /* drag on the cover itself re-crops the selected panel */
  let dragging = false;
  function canvasPos(ev) {
    const r = canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
  }
  canvas.addEventListener('pointerdown', (ev) => {
    const [fx, fy] = canvasPos(ev);
    for (const p of VCS.layoutById(state.layout).panels) {
      if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) {
        selectedPanel = p.id;
        syncPanelEditor();
        dragging = true;
        canvas.setPointerCapture(ev.pointerId);
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const [fx, fy] = canvasPos(ev);
    const cfg = panelCfg();
    cfg.fx = Math.min(1, Math.max(0, fx));
    cfg.fy = Math.min(1, Math.max(0, fy));
    $('focus-x').value = cfg.fx; $('focus-y').value = cfg.fy;
    render();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });

  /* ---- look controls ------------------------------------------------ */
  function bindSelect(id, key, after) {
    $(id).addEventListener('change', (e) => { state[key] = e.target.value; if (after) after(); render(); });
  }
  bindSelect('layout-select', 'layout', () => {
    state.panels = VCS.freshPanels(state.layout);
    selectedPanel = VCS.layoutById(state.layout).panels[0].id;
    syncPanelEditor();
  });
  bindSelect('grade-select', 'grade');
  bindSelect('caption-select', 'caption');
  bindSelect('divider-select', 'divider');
  for (const [id, key] of [['title-input', 'title'], ['subtitle-input', 'subtitle'], ['tagline-input', 'tagline'], ['review-input', 'review']]) {
    $(id).addEventListener('input', (e) => { state[key] = e.target.value; render(); });
  }
  $('sharp').addEventListener('input', (e) => { state.sharp = Number(e.target.value); render(); });
  $('grain').addEventListener('input', (e) => { state.grain = Number(e.target.value); render(); });
  for (const btn of document.querySelectorAll('[data-aspect]')) {
    btn.addEventListener('click', () => { aspect = btn.getAttribute('data-aspect'); render(); });
  }

  /* ---- surprise me --------------------------------------------------- */
  let recipeAt = 0;
  $('surprise').addEventListener('click', () => {
    const r = VCS.RECIPES[recipeAt % VCS.RECIPES.length];
    recipeAt++;
    state.layout = r.layout; state.grade = r.grade; state.caption = r.caption;
    state.divider = r.divider; state.title = r.title;
    state.panels = VCS.freshPanels(r.layout);
    selectedPanel = VCS.layoutById(r.layout).panels[0].id;
    $('layout-select').value = r.layout;
    $('grade-select').value = r.grade;
    $('caption-select').value = r.caption;
    $('divider-select').value = r.divider;
    $('title-input').value = r.title;
    $('recipe-name').textContent = r.name;
    syncPanelEditor();
    render();
  });

  /* ---- export --------------------------------------------------------- */
  for (const btn of document.querySelectorAll('[data-export]')) {
    btn.addEventListener('click', () => {
      const [w, h] = EXPORTS[btn.getAttribute('data-export')];
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      VCS.renderCover(out, state, images);
      out.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `vice-cover-${w}x${h}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, 'image/png');
    });
  }

  /* a handle for the screenshot harness and the curious */
  window.__vcs = { state, images, renderCover: VCS.renderCover, render };

  syncPanelEditor();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
  render();
})();
