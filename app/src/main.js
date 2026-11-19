// Vice Cover Studio — the studio wiring.
// Owns the editable state, builds the per-panel controls, loads the
// bundled samples and any photo the visitor drops in, and renders the
// preview through the same renderCover the exports use. Photos are read
// on this machine only: uploads go through a FileReader into memory and
// are never sent anywhere.

'use strict';

const vcsState = {
  layoutId: 'vice-quad',
  gradeId: 'vice-sunset',
  caption: 'VICE HEAT',
  subtitle: 'One city, no brakes',
  captionStyle: 'stacked',
  divider: 'neon',
  sharp: 0.6,
  // One slot per panel of the largest layout; each picks a photo source
  // ('gradient', a sample id, or 'upload') and its punch settings.
  panels: [],
};

const vcsSampleImages = {}; // sample id -> HTMLImageElement once loaded
let vcsUploadImage = null; // the visitor's own photo, in memory only
let vcsRecipeIndex = -1;

const vcsEls = {};
function vcsEl(id) {
  if (!vcsEls[id]) vcsEls[id] = document.getElementById(id);
  return vcsEls[id];
}

function vcsDefaultPanel(index) {
  return { source: 'gradient', zoom: 1.2, fx: 0.5, fy: 0.45 };
}

function vcsEnsurePanels() {
  while (vcsState.panels.length < 6) {
    vcsState.panels.push(vcsDefaultPanel(vcsState.panels.length));
  }
}

function vcsPhotoFor(slot) {
  if (!slot || slot.source === 'gradient') return null;
  if (slot.source === 'upload') return vcsUploadImage;
  return vcsSampleImages[slot.source] || null;
}

// The plain render state renderCover consumes: photos resolved to
// image elements, punch values copied per panel of the active layout.
function vcsRenderState() {
  const layout = vcsLayoutById(vcsState.layoutId);
  return {
    layoutId: vcsState.layoutId,
    gradeId: vcsState.gradeId,
    caption: vcsState.caption,
    subtitle: vcsState.subtitle,
    captionStyle: vcsState.captionStyle,
    divider: vcsState.divider,
    sharp: vcsState.sharp,
    panels: layout.panels.map(function (_, index) {
      const slot = vcsState.panels[index] || vcsDefaultPanel(index);
      return {
        photo: vcsPhotoFor(slot),
        zoom: slot.zoom,
        fx: slot.fx,
        fy: slot.fy,
      };
    }),
  };
}

function vcsRender() {
  const canvas = vcsEl('preview');
  const ctx = canvas.getContext('2d');
  renderCover(ctx, canvas.width, canvas.height, vcsRenderState());
}

// ------------------------------------------------------------------
// Per-panel controls: a photo picker plus punch sliders (zoom and the
// two focal axes) for every panel of the active layout.

function vcsBuildPanelControls() {
  const layout = vcsLayoutById(vcsState.layoutId);
  const host = vcsEl('panelControls');
  host.innerHTML = '';
  layout.panels.forEach(function (panel, index) {
    const slot = vcsState.panels[index];
    const row = document.createElement('div');
    row.className = 'panel-row';

    const head = document.createElement('div');
    head.className = 'panel-head';
    const title = document.createElement('span');
    title.className = 'panel-name';
    title.textContent = 'Panel ' + (index + 1) + ' · ' + panel.name;
    head.appendChild(title);

    const pick = document.createElement('select');
    pick.className = 'photo-pick';
    pick.setAttribute('aria-label', 'Photo for panel ' + (index + 1));
    const options = [{ value: 'gradient', label: 'Gradient + decor' }]
      .concat(VCS_SAMPLES.map(function (s) { return { value: s.id, label: s.name }; }))
      .concat([{ value: 'upload', label: 'Your photo' }]);
    for (const opt of options) {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.label;
      pick.appendChild(el);
    }
    pick.value = slot.source;
    pick.addEventListener('change', function () {
      slot.source = pick.value;
      vcsRender();
      vcsSetStatus('Panel ' + (index + 1) + ' now shows ' + pick.options[pick.selectedIndex].text + '.');
    });
    head.appendChild(pick);
    row.appendChild(head);

    const sliders = document.createElement('div');
    sliders.className = 'panel-sliders';
    const fields = [
      { key: 'zoom', label: 'Punch', min: 1, max: 2.4, step: 0.01 },
      { key: 'fx', label: 'Focus X', min: 0, max: 1, step: 0.01 },
      { key: 'fy', label: 'Focus Y', min: 0, max: 1, step: 0.01 },
    ];
    for (const field of fields) {
      const wrap = document.createElement('label');
      wrap.className = 'mini-slider';
      const name = document.createElement('span');
      name.textContent = field.label;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
      input.value = slot[field.key];
      input.addEventListener('input', function () {
        slot[field.key] = parseFloat(input.value);
        vcsRender();
      });
      wrap.appendChild(name);
      wrap.appendChild(input);
      sliders.appendChild(wrap);
    }
    row.appendChild(sliders);
    host.appendChild(row);
  });
}

// ------------------------------------------------------------------
// Pickers built from the data files, so the UI can never drift from
// what the renderer knows.

function vcsBuildPickers() {
  const layoutPicker = vcsEl('layoutPicker');
  for (const layout of VCS_LAYOUTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick-btn';
    btn.dataset.layoutId = layout.id;
    btn.innerHTML = '<strong></strong><small></small>';
    btn.querySelector('strong').textContent = layout.name;
    btn.querySelector('small').textContent = layout.blurb;
    btn.addEventListener('click', function () {
      vcsState.layoutId = layout.id;
      vcsSyncPickers();
      vcsBuildPanelControls();
      vcsRender();
    });
    layoutPicker.appendChild(btn);
  }
  const gradePicker = vcsEl('gradePicker');
  for (const grade of VCS_GRADES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick-btn grade-btn';
    btn.dataset.gradeId = grade.id;
    btn.innerHTML = '<span class="swatch"></span><span class="grade-text"><strong></strong><small></small></span>';
    btn.querySelector('.swatch').style.background =
      'linear-gradient(180deg,' + grade.skyStops.map(function (s) { return s[1]; }).join(',') + ')';
    btn.querySelector('strong').textContent = grade.name;
    btn.querySelector('small').textContent = grade.blurb;
    btn.addEventListener('click', function () {
      vcsState.gradeId = grade.id;
      vcsSyncPickers();
      vcsRender();
    });
    gradePicker.appendChild(btn);
  }
}

function vcsSyncPickers() {
  document.querySelectorAll('#layoutPicker .pick-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.layoutId === vcsState.layoutId);
  });
  document.querySelectorAll('#gradePicker .pick-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.gradeId === vcsState.gradeId);
  });
  vcsEl('captionInput').value = vcsState.caption;
  vcsEl('subtitleInput').value = vcsState.subtitle;
  vcsEl('captionStyle').value = vcsState.captionStyle;
  vcsEl('dividerStyle').value = vcsState.divider;
  vcsEl('sharpRange').value = vcsState.sharp;
  vcsEl('sharpValue').textContent = Number(vcsState.sharp).toFixed(1);
}

// ------------------------------------------------------------------
// Photos: bundled samples, the visitor's upload, drag and drop.

function vcsLoadSamples() {
  const strip = vcsEl('sampleStrip');
  for (const sample of VCS_SAMPLES) {
    const img = new Image();
    img.src = sample.file;
    img.alt = sample.name;
    img.addEventListener('load', function () {
      vcsSampleImages[sample.id] = img;
      vcsRender();
    });
    const figure = document.createElement('figure');
    figure.className = 'sample-thumb';
    const thumb = document.createElement('img');
    thumb.src = sample.file;
    thumb.alt = sample.name;
    const caption = document.createElement('figcaption');
    caption.textContent = sample.name;
    figure.appendChild(thumb);
    figure.appendChild(caption);
    figure.title = 'Assign ' + sample.name + ' to the first gradient panel';
    figure.addEventListener('click', function () {
      const layout = vcsLayoutById(vcsState.layoutId);
      for (let i = 0; i < layout.panels.length; i++) {
        if (vcsState.panels[i].source === 'gradient') {
          vcsState.panels[i].source = sample.id;
          vcsBuildPanelControls();
          vcsRender();
          vcsSetStatus(sample.name + ' assigned to panel ' + (i + 1) + '.');
          return;
        }
      }
      vcsSetStatus('Every panel already has a photo. Clear one to gradient first.');
    });
    strip.appendChild(figure);
  }
}

function vcsHandlePhotoFile(file) {
  if (!file || !file.type || file.type.indexOf('image/') !== 0) {
    vcsSetStatus('That file is not an image. Try a JPG or PNG photo.');
    return;
  }
  const reader = new FileReader();
  reader.addEventListener('load', function () {
    const img = new Image();
    img.addEventListener('load', function () {
      vcsUploadImage = img;
      const layout = vcsLayoutById(vcsState.layoutId);
      let placed = false;
      for (let i = 0; i < layout.panels.length; i++) {
        if (vcsState.panels[i].source === 'gradient') {
          vcsState.panels[i].source = 'upload';
          placed = true;
          break;
        }
      }
      if (!placed) vcsState.panels[0].source = 'upload';
      vcsBuildPanelControls();
      vcsRender();
      vcsSetStatus('Your photo is in. Punch it in per panel, or spread it around.');
    });
    img.src = reader.result;
  });
  reader.readAsDataURL(file);
}

// ------------------------------------------------------------------
// Surprise Me and exports.

function vcsSurprise() {
  vcsRecipeIndex = (vcsRecipeIndex + 1) % VCS_RECIPES.length;
  const recipe = VCS_RECIPES[vcsRecipeIndex];
  vcsState.layoutId = recipe.layoutId;
  vcsState.gradeId = recipe.gradeId;
  vcsState.caption = recipe.caption;
  vcsState.subtitle = recipe.subtitle;
  vcsState.captionStyle = recipe.captionStyle;
  vcsState.divider = recipe.divider;
  // Fill any gradient panels with bundled samples, rotating the order
  // per recipe so repeated surprises keep looking new.
  const layout = vcsLayoutById(recipe.layoutId);
  layout.panels.forEach(function (_, index) {
    const slot = vcsState.panels[index];
    if (slot.source === 'gradient') {
      slot.source = VCS_SAMPLES[(index + vcsRecipeIndex) % VCS_SAMPLES.length].id;
      slot.zoom = 1.18 + ((index * 7 + vcsRecipeIndex * 3) % 10) / 60;
    }
  });
  vcsSyncPickers();
  vcsBuildPanelControls();
  vcsRender();
  vcsEl('recipeName').textContent = 'Recipe: ' + recipe.name;
  vcsSetStatus('Surprise served: ' + recipe.name + '. Hit it again for the next of nine.');
}

function vcsExportPng(sizeId) {
  const size = VCS_EXPORT_SIZES.find(function (s) { return s.id === sizeId; });
  if (!size) return;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas.getContext('2d'), size.w, size.h, vcsRenderState());
  canvas.toBlob(function (blob) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vice-cover-' + size.id + '.png';
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    vcsSetStatus('Exported a ' + size.w + ' × ' + size.h + ' PNG. Post it anywhere.');
  }, 'image/png');
}

function vcsSetStatus(message) {
  vcsEl('statusLine').textContent = message;
}

// ------------------------------------------------------------------
// Screenshot and automation surface: rebuild any named shot state and
// hand back an export without going through the download path.

function vcsApplyPlainState(plain) {
  vcsState.layoutId = plain.layoutId;
  vcsState.gradeId = plain.gradeId;
  vcsState.caption = plain.caption || '';
  vcsState.subtitle = plain.subtitle || '';
  vcsState.captionStyle = plain.captionStyle || 'stacked';
  vcsState.divider = plain.divider || 'neon';
  vcsState.sharp = typeof plain.sharp === 'number' ? plain.sharp : 0.6;
  plain.panels.forEach(function (p, index) {
    vcsState.panels[index] = {
      source: p.sample || 'gradient',
      zoom: p.zoom || 1.2,
      fx: typeof p.fx === 'number' ? p.fx : 0.5,
      fy: typeof p.fy === 'number' ? p.fy : 0.45,
    };
  });
  vcsSyncPickers();
  vcsBuildPanelControls();
  vcsRender();
}

window.VCS = {
  state: vcsState,
  applyShot: function (name) {
    const shot = VCS_SHOT_STATES.find(function (s) { return s.shot === name; });
    if (shot) vcsApplyPlainState(shot.state);
    return !!shot;
  },
  applyPlainState: vcsApplyPlainState,
  exportDataURL: function (sizeId) {
    const size = VCS_EXPORT_SIZES.find(function (s) { return s.id === sizeId; });
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    renderCover(canvas.getContext('2d'), size.w, size.h, vcsRenderState());
    return canvas.toDataURL('image/png');
  },
  surprise: vcsSurprise,
  render: vcsRender,
};

// ------------------------------------------------------------------
// Wiring.

function vcsInit() {
  vcsEnsurePanels();
  // A friendly starting cover: the car and the yacht in the big panels.
  vcsState.panels[0].source = 'sunset-car';
  vcsState.panels[1].source = 'yacht-man';
  vcsBuildPickers();
  vcsBuildPanelControls();
  vcsLoadSamples();
  vcsSyncPickers();

  vcsEl('captionInput').addEventListener('input', function (e) {
    vcsState.caption = e.target.value;
    vcsRender();
  });
  vcsEl('subtitleInput').addEventListener('input', function (e) {
    vcsState.subtitle = e.target.value;
    vcsRender();
  });
  vcsEl('captionStyle').addEventListener('change', function (e) {
    vcsState.captionStyle = e.target.value;
    vcsRender();
  });
  vcsEl('dividerStyle').addEventListener('change', function (e) {
    vcsState.divider = e.target.value;
    vcsRender();
  });
  vcsEl('sharpRange').addEventListener('input', function (e) {
    vcsState.sharp = parseFloat(e.target.value);
    vcsEl('sharpValue').textContent = vcsState.sharp.toFixed(1);
    vcsRender();
  });
  vcsEl('uploadInput').addEventListener('change', function (e) {
    vcsHandlePhotoFile(e.target.files[0]);
    e.target.value = '';
  });
  vcsEl('surpriseBtn').addEventListener('click', vcsSurprise);
  document.querySelectorAll('.export-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { vcsExportPng(btn.dataset.size); });
  });

  // A double-click on the stage exports the square post straight away.
  vcsEl('stage').addEventListener('dblclick', function () { vcsExportPng('square'); });

  const stage = vcsEl('stage');
  ['dragenter', 'dragover'].forEach(function (name) {
    stage.addEventListener(name, function (e) {
      e.preventDefault();
      stage.classList.add('dragging');
    });
  });
  ['dragleave', 'drop'].forEach(function (name) {
    stage.addEventListener(name, function (e) {
      e.preventDefault();
      stage.classList.remove('dragging');
    });
  });
  stage.addEventListener('drop', function (e) {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    vcsHandlePhotoFile(file);
  });

  vcsRender();
  if (document.fonts && document.fonts.load) {
    document.fonts.load('80px "Vice Anton"').then(function () { vcsRender(); });
    document.fonts.ready.then(function () { vcsRender(); });
  }
  window.__VCS_READY = true;
}

document.addEventListener('DOMContentLoaded', vcsInit);
