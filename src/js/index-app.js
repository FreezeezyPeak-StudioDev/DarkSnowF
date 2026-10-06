/**
 * Aplicación principal de la página de inicio DarkSnowF.
 *
 * Gestiona fondos, categorías, accesos rápidos, perfiles, buscador,
 * barra lateral y modales. Todo el estado persistente se guarda en
 * `localStorage` por perfil y se verifica tras cada escritura para
 * evitar pérdidas de datos.
 *
 * Estructura por perfil:
 * - `shortcuts_<id>`: accesos `{ id, name, url, icon, catId }`.
 *   `icon` es opcional; vacío significa favicon automático.
 * - `shortcutCategories_<id>`: categorías `{ id, name }`.
 * - `selectedCat_<id>`: categoría seleccionada.
 * - `profiles`: lista `{ id, name, icon }`. `icon` es el avatar.
 *
 * @module IndexApp
 */
Clock.init('[data-clock]');

// ==================== FONDOS DE PANTALLA ====================

const wallpaperModal = document.querySelector('[data-wallpaper-modal]');
const wallpaperForm = document.querySelector('[data-wallpaper-form]');
const wallpaperBtn = document.querySelector('[data-wallpaper-btn]');
const wallpaperCancel = document.querySelector('[data-wallpaper-cancel]');
const wallpaperReset = document.querySelector('[data-wallpaper-reset]');
const wallpaperPreset = document.querySelector('[data-wallpaper-preset]');
const wallpaperUrl = document.getElementById('wallpaper-url');
const wallpaperFile = document.getElementById('wallpaper-file');
const wallpaperSize = document.querySelector('[data-wallpaper-size]');
const wallpaperWidth = document.getElementById('wallpaper-width');
const wallpaperHeight = document.getElementById('wallpaper-height');
const customSizeGroup = document.getElementById('custom-size-group');
const wallpaperPreview = document.querySelector('[data-wallpaper-preview]');
const previewContainer = document.getElementById('preview-container');
const fileNameDisplay = document.getElementById('file-name');

// Cargar fondo guardado (o rotado)
function loadWallpaper() {
  let saved = null;
  try {
    if (typeof getRotatedWallpaper === 'function') {
      saved = getRotatedWallpaper();
    }
  } catch (e) {
    saved = null;
  }
  if (!saved) saved = localStorage.getItem('wallpaper');
  if (!saved && typeof defaultWallpaper === 'function') saved = defaultWallpaper();
  const savedSize = localStorage.getItem('wallpaperSize') || 'cover';
  const savedWidth = localStorage.getItem('wallpaperWidth');
  const savedHeight = localStorage.getItem('wallpaperHeight');

  if (saved && saved !== 'default') {
    const full = (typeof resolveWp === 'function') ? resolveWp(saved) : saved;
    document.body.style.backgroundImage = `url('${full}')`;
    document.body.style.backgroundSize = savedSize;
    
    if (savedSize === 'custom' && savedWidth && savedHeight) {
      document.body.style.backgroundSize = `${savedWidth}px ${savedHeight}px`;
    }
  }
}

/**
 * Guarda el fondo de pantalla con verificación.
 * @param {string} url URL del fondo o `default`.
 * @param {string} size Modo de tamaño (`cover`, `contain`, `auto`, `custom`).
 * @param {string|null} width Ancho en px para modo personalizado.
 * @param {string|null} height Alto en px para modo personalizado.
 * @returns {boolean} Verdadero si se verificó el guardado.
 */
function saveWallpaper(url, size, width, height) {
  try {
    if (url === 'default') {
      localStorage.removeItem('wallpaper');
      localStorage.removeItem('wallpaperSize');
      localStorage.removeItem('wallpaperWidth');
      localStorage.removeItem('wallpaperHeight');
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = 'cover';
      return true;
    }
    const guardar = (typeof DSAlmacen !== 'undefined' && DSAlmacen.guardarTexto)
      ? (k, v) => DSAlmacen.guardarTexto(k, v)
      : (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
    const ok1 = guardar('wallpaper', url);
    const ok2 = guardar('wallpaperSize', size);
    const full = (typeof resolveWp === 'function') ? resolveWp(url) : url;
    document.body.style.backgroundImage = `url('${full}')`;
    document.body.style.backgroundSize = size;

    if (size === 'custom' && width && height) {
      guardar('wallpaperWidth', width);
      guardar('wallpaperHeight', height);
      document.body.style.backgroundSize = `${width}px ${height}px`;
    }
    return ok1 && ok2;
  } catch (e) {
    return false;
  }
}

// Preguntar si quitar la nieve para mejorar el ambiente del fondo
async function afterWallpaperApplied() {
  let snowOn = true;
  try {
    const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    snowOn = s.snow !== false;
  } catch (e) {}
  if (snowOn) {
  const msg = (typeof t === 'function') ? t('snowAsk') : '¿Quitar la nieve para mejorar el ambiente del fondo?';
  let yes = false;
  try {
    if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
      yes = await DSDialogs.confirm(msg, {
        title: (typeof t === 'function') ? t('wpTitle') : 'Fondo de pantalla',
        confirmText: (typeof t === 'function') ? t('yesBtn') : 'Sí',
        cancelText: (typeof t === 'function') ? t('noBtn') : 'No'
      });
    } else {
      yes = confirm(msg);
    }
  } catch (e) {
    yes = false;
  }
  if (yes) {
    try {
      const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      s.snow = false;
      localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
    } catch (e) {}
    const canvas = document.getElementById('snow-canvas');
    if (canvas) canvas.remove();
  }
  }
  // Aviso centrado de confirmación
  try {
    const doneMsg = (typeof t === 'function') ? t('wpDone') : 'Fondo aplicado correctamente.';
    const okText = (typeof t === 'function') ? t('infoOk') : 'Entendido';
    const doneTitle = (typeof t === 'function') ? t('wpTitle') : 'Fondo de pantalla';
    if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
      await DSDialogs.confirm(doneMsg, { title: doneTitle, confirmText: okText });
    }
  } catch (e) {}
  acceptReload();
}

// Abrir modal de fondos
wallpaperBtn.addEventListener('click', () => {
  wallpaperModal.classList.add('active');
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  
  // Cargar valores guardados
  const savedSize = localStorage.getItem('wallpaperSize') || 'cover';
  const savedWidth = localStorage.getItem('wallpaperWidth') || '1920';
  const savedHeight = localStorage.getItem('wallpaperHeight') || '1080';
  
  wallpaperSize.value = savedSize;
  wallpaperWidth.value = savedWidth;
  wallpaperHeight.value = savedHeight;
  
  if (savedSize === 'custom') {
    customSizeGroup.style.display = 'block';
  }
});

// Cerrar modal de fondos
wallpaperCancel.addEventListener('click', () => {
  wallpaperModal.classList.remove('active');
  wallpaperForm.reset();
  previewContainer.style.display = 'none';
  customSizeGroup.style.display = 'none';
});

// Restaurar fondo predeterminado
wallpaperReset.addEventListener('click', async () => {
  const msg = (typeof t === 'function') ? t('confirmWallpaper') : '¿Restaurar fondo predeterminado?';
  const confirmed = await DSDialogs.confirm(msg, {
    title: (typeof t === 'function') ? t('wpTitle') : 'Fondo de pantalla',
    confirmText: (typeof t === 'function') ? t('wpReset') : 'Restaurar',
    isDanger: true
  });
  if (confirmed) {
    saveWallpaper('default', 'cover', null, null);
    wallpaperModal.classList.remove('active');
    wallpaperForm.reset();
    previewContainer.style.display = 'none';
    customSizeGroup.style.display = 'none';
  }
});

// Mostrar/ocultar tamaño personalizado
wallpaperSize.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    customSizeGroup.style.display = 'block';
  } else {
    customSizeGroup.style.display = 'none';
  }
});

// Vista previa al seleccionar preset
  wallpaperPreset.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value && value !== 'default') {
      const full = (typeof resolveWp === 'function') ? resolveWp(value) : value;
      wallpaperPreview.style.backgroundImage = `url('${full}')`;
    previewContainer.style.display = 'block';
  } else {
    previewContainer.style.display = 'none';
  }
  wallpaperUrl.value = '';
  wallpaperFile.value = '';
  fileNameDisplay.textContent = '';
});

// Vista previa al escribir URL
wallpaperUrl.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  if (value) {
    const full = (typeof resolveWp === 'function') ? resolveWp(value) : value;
    wallpaperPreview.style.backgroundImage = `url('${full}')`;
    previewContainer.style.display = 'block';
    wallpaperPreset.value = '';
    wallpaperFile.value = '';
    fileNameDisplay.textContent = '';
  }
});

// Vista previa al seleccionar archivo
wallpaperFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      wallpaperPreview.style.backgroundImage = `url('${event.target.result}')`;
      previewContainer.style.display = 'block';
      fileNameDisplay.textContent = `Archivo: ${file.name}`;
    };
    reader.readAsDataURL(file);
    wallpaperPreset.value = '';
    wallpaperUrl.value = '';
  }
});

// Aplicar fondo
wallpaperForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let wallpaperToApply = '';
  const size = wallpaperSize.value;
  const width = wallpaperWidth.value || '1920';
  const height = wallpaperHeight.value || '1080';
  
  if (wallpaperPreset.value) {
    wallpaperToApply = wallpaperPreset.value;
  } else if (wallpaperUrl.value.trim()) {
    wallpaperToApply = wallpaperUrl.value.trim();
  } else if (wallpaperFile.files[0]) {
    const reader = new FileReader();
    reader.onload = (event) => {
      saveWallpaper(event.target.result, size, width, height);
      try {
        if (typeof trackWallpaper === 'function') trackWallpaper(event.target.result);
      } catch (e) {}
      afterWallpaperApplied();
      wallpaperModal.classList.remove('active');
      wallpaperForm.reset();
      previewContainer.style.display = 'none';
      customSizeGroup.style.display = 'none';
    };
    reader.readAsDataURL(wallpaperFile.files[0]);
    return;
  }
  
  if (wallpaperToApply) {
    saveWallpaper(wallpaperToApply, size, width, height);
    try {
      if (typeof trackWallpaper === 'function') trackWallpaper(wallpaperToApply);
    } catch (e) {}
    afterWallpaperApplied();
    wallpaperModal.classList.remove('active');
    wallpaperForm.reset();
    previewContainer.style.display = 'none';
    customSizeGroup.style.display = 'none';
  }
});

// Cerrar modal al hacer click fuera
wallpaperModal.addEventListener('click', (e) => {
  if (e.target === wallpaperModal) {
    wallpaperModal.classList.remove('active');
    wallpaperForm.reset();
    previewContainer.style.display = 'none';
    customSizeGroup.style.display = 'none';
  }
});

// Cargar fondo al iniciar
loadWallpaper();

// ==================== ACCESOS RÁPIDOS ====================

let shortcuts = [];
let editingShortcutId = null;
let draggedShortcutId = null;
let shortcutWasDragged = false;
let categories = [];
let selectedCat = 'general';
let lastDropTarget = null;

// ==================== CATEGORÍAS ====================

function defaultCatName() {
  return (typeof t === 'function') ? t('catGeneral') : 'General';
}

/**
 * Guarda las categorías del perfil activo con verificación.
 * @returns {boolean} Verdadero si el guardado se verificó.
 */
function saveCategories() {
  try {
    if (typeof DSAlmacen !== 'undefined' && DSAlmacen.guardarJSON) {
      return DSAlmacen.guardarJSON(DSAlmacen.claves.categoriasDe(activeProfile), categories);
    }
  } catch (e) {}
  try {
    localStorage.setItem(catKey(), JSON.stringify(categories));
    return localStorage.getItem(catKey()) !== null;
  } catch (e) {
    return false;
  }
}

function catKey() {
  return 'shortcutCategories_' + activeProfile;
}

function selKey() {
  return 'selectedCat_' + activeProfile;
}

function loadCategories() {
  categories = [];
  try {
    const saved = localStorage.getItem(catKey());
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) categories = parsed;
    }
  } catch (e) {
    categories = [];
  }
  // Migrar categorías globales antiguas a este perfil (una vez por perfil)
  if (categories.length === 0) {
    try {
      const legacy = localStorage.getItem('shortcutCategories');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          categories = parsed;
          saveCategories();
        }
      }
    } catch (e) {}
  }
  if (categories.length === 0) {
    categories = [{ id: 'general', name: defaultCatName() }];
    saveCategories();
  }
  // Migrar accesos sin categoría válida a General
  let changed = false;
  shortcuts.forEach((s) => {
    if (!s.catId || !categories.some((c) => c.id === s.catId)) {
      s.catId = 'general';
      changed = true;
    }
  });
  if (changed) saveShortcuts();
  // General siempre existe y va primera
  if (!categories.some((c) => c.id === 'general')) {
    categories.unshift({ id: 'general', name: defaultCatName() });
    saveCategories();
  }
  try {
    const sel = localStorage.getItem(selKey());
    selectedCat = (sel && categories.some((c) => c.id === sel)) ? sel : categories[0].id;
    if (!sel) {
      try {
        const legacySel = localStorage.getItem('selectedCat');
        if (legacySel && categories.some((c) => c.id === legacySel)) {
          selectedCat = legacySel;
          localStorage.setItem(selKey(), legacySel);
        }
      } catch (e2) {}
    }
  } catch (e) {
    selectedCat = categories[0].id;
  }
}

function setSelectedCat(id) {
  if (!categories.some((c) => c.id === id)) return;
  selectedCat = id;
  try {
    localStorage.setItem(selKey(), id);
  } catch (e) {}
  renderCats();
  renderShortcuts();
}

function stepCat(dir) {
  const i = categories.findIndex((c) => c.id === selectedCat);
  if (i < 0) return;
  const n = (i + dir + categories.length) % categories.length;
  setSelectedCat(categories[n].id);
}

function renderCats() {
  const bar = document.querySelector('[data-cats]');
  if (!bar) return;
  bar.innerHTML = '';

  const prev = document.createElement('button');
  prev.className = 'cats-arrow';
  prev.type = 'button';
  prev.textContent = '<';
  prev.title = (typeof t === 'function') ? t('catPrev') : 'Anterior';
  prev.addEventListener('click', () => stepCat(-1));

  const tabs = document.createElement('div');
  tabs.className = 'cats-tabs';

  categories.forEach((cat) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cat-tab' + (cat.id === selectedCat ? ' active' : '');
    const name = document.createElement('span');
    name.textContent = cat.name;
    tab.appendChild(name);

    const rn = document.createElement('img');
    rn.src = 'assets/Texturas/UI/Editar.svg';
    rn.alt = '';
    rn.className = 'cat-mini';
    rn.title = (typeof t === 'function') ? t('catRenameTitle') : 'Renombrar';
    rn.addEventListener('click', (e) => {
      e.stopPropagation();
      renameCategory(cat.id);
    });
    tab.appendChild(rn);

    if (cat.id !== 'general' && categories.length > 1) {
      const del = document.createElement('img');
      del.src = 'assets/Texturas/UI/BasureroCerrado.svg';
      del.alt = '';
      del.className = 'cat-mini';
      del.title = (typeof t === 'function') ? t('catDeleteTitle') : 'Eliminar';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCategory(cat.id);
      });
      tab.appendChild(del);
    }

    tab.addEventListener('click', () => setSelectedCat(cat.id));
    // Soltar un acceso encima mueve el acceso a esa categoría
    tab.addEventListener('dragover', (e) => {
      if (!draggedShortcutId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      tab.classList.add('drag-target');
    });
    tab.addEventListener('dragleave', () => {
      tab.classList.remove('drag-target');
    });
    tab.addEventListener('drop', (e) => {
      if (!draggedShortcutId) return;
      e.preventDefault();
      tab.classList.remove('drag-target');
      const sc = shortcuts.find((s) => s.id === draggedShortcutId);
      if (sc && (sc.catId || 'general') !== cat.id) {
        sc.catId = cat.id;
        saveShortcuts();
      }
      lastDropTarget = null;
      setSelectedCat(cat.id);
    });
    tabs.appendChild(tab);
  });

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'cat-tab add';
  add.textContent = '+';
  add.title = (typeof t === 'function') ? t('catCreate') : 'Nueva categoría';
  add.addEventListener('click', createCategory);
  tabs.appendChild(add);

  const next = document.createElement('button');
  next.className = 'cats-arrow';
  next.type = 'button';
  next.textContent = '>';
  next.title = (typeof t === 'function') ? t('catNext') : 'Siguiente';
  next.addEventListener('click', () => stepCat(1));

  bar.appendChild(prev);
  bar.appendChild(tabs);
  bar.appendChild(next);

  const active = tabs.querySelector('.cat-tab.active');
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}

async function createCategory() {
  const msg = (typeof t === 'function') ? t('catCreate') : 'Nombre de la categoría:';
  const name = await DSDialogs.prompt(msg, {
    title: (typeof t === 'function') ? t('catCreate') : 'Nueva categoría',
    placeholder: (typeof t === 'function') ? t('catGeneral') : 'General'
  });
  if (!name || !name.trim()) return;
  const id = 'c' + Date.now();
  categories.push({ id, name: name.trim().slice(0, 24) });
  saveCategories();
  setSelectedCat(id);
  acceptReload();
}

async function renameCategory(id) {
  const cat = categories.find((c) => c.id === id);
  if (!cat) return;
  const msg = (typeof t === 'function') ? t('catRename') : 'Nuevo nombre:';
  const name = await DSDialogs.prompt(msg, {
    title: (typeof t === 'function') ? t('catRename') : 'Renombrar categoría',
    defaultValue: cat.name
  });
  if (!name || !name.trim()) return;
  cat.name = name.trim().slice(0, 24);
  saveCategories();
  renderCats();
  acceptReload();
}

async function deleteCategory(id) {
  const cat = categories.find((c) => c.id === id);
  if (!cat || cat.id === 'general' || categories.length <= 1) return;
  const items = shortcuts.filter((s) => s.catId === id);

  if (items.length === 0) {
    const msg = ((typeof t === 'function') ? t('catDelete') : '¿Eliminar la categoría "{name}"?').replace('{name}', cat.name);
    const confirmed = await DSDialogs.confirm(msg, {
      title: (typeof t === 'function') ? t('catDeleteTitle') : 'Eliminar categoría',
      confirmText: (typeof t === 'function') ? t('delete') : 'Eliminar',
      isDanger: true
    });
    if (!confirmed) return;
    categories = categories.filter((c) => c.id !== id);
  } else {
    const msg = ((typeof t === 'function') ? t('catDeleteWith') : 'La categoría "{name}" tiene {n} accesos. Aceptar = eliminarlos también. Cancelar = moverlos a otra categoría.').replace('{name}', cat.name).replace('{n}', items.length);
    const confirmed = await DSDialogs.confirm(msg, {
      title: (typeof t === 'function') ? t('catDeleteTitle') : 'Eliminar categoría',
      confirmText: (typeof t === 'function') ? t('deleteAll') : 'Eliminar todo',
      cancelText: (typeof t === 'function') ? t('move') : 'Mover',
      isDanger: true
    });
    
    if (confirmed) {
      categories = categories.filter((c) => c.id !== id);
      shortcuts = shortcuts.filter((s) => s.catId !== id);
      saveShortcuts();
    } else {
      const others = categories.filter((c) => c.id !== id);
      const list = others.map((c) => c.name).join(', ');
      const target = await DSDialogs.prompt(((typeof t === 'function') ? t('catMoveTo') : 'Mover accesos a ({list}):').replace('{list}', list), {
        title: (typeof t === 'function') ? t('moveTitle') : 'Mover a categoría',
        defaultValue: others[0].name,
        placeholder: others[0].name
      });
      if (!target) return;
      const dest = others.find((c) => c.name.toLowerCase() === target.trim().toLowerCase());
      if (!dest) return;
      items.forEach((s) => { s.catId = dest.id; });
      categories = categories.filter((c) => c.id !== id);
      saveShortcuts();
    }
  }

  saveCategories();
  if (selectedCat === id) {
    selectedCat = categories[0].id;
    try {
      localStorage.setItem(selKey(), selectedCat);
    } catch (e) {}
  }
  renderCats();
  renderShortcuts();
  acceptReload();
}

const shortcutsContainer = document.querySelector('[data-shortcuts]');
const modalOverlay = document.querySelector('[data-modal-overlay]');
const modalTitle = document.querySelector('[data-modal-title]');
const shortcutForm = document.querySelector('[data-shortcut-form]');
const modalCancel = document.querySelector('[data-modal-cancel]');
const urlInput = document.getElementById('shortcut-url');
const nameInput = document.getElementById('shortcut-name');

// ==================== PERFILES ====================
// Cada perfil tiene sus propios enlaces. Al abrir el navegador se usa
// el perfil de inicio; dentro de la sesión se usa el seleccionado.

let activeProfile = 'personal';

/**
 * Obtiene la lista de perfiles normalizada.
 * Garantiza al menos el perfil Personal y la forma `{ id, name, icon }`.
 * @returns {Array<{id:string, name:string, icon:string}>} Perfiles.
 */
function getProfiles() {
  try {
    if (typeof DSAlmacen !== 'undefined' && DSAlmacen.obtenerPerfiles) {
      const raw = DSAlmacen.obtenerPerfiles();
      return raw.map((p) => ({ id: p.id, name: p.nombre, icon: p.icono || '' }));
    }
  } catch (e) {}
  try {
    const p = JSON.parse(localStorage.getItem('profiles') || '[]');
    if (Array.isArray(p) && p.length > 0) {
      return p.map((x) => ({
        id: String(x.id),
        name: String(x.name || x.nombre || 'Personal').slice(0, 20),
        icon: typeof (x.icon || x.icono) === 'string' ? (x.icon || x.icono) : ''
      }));
    }
  } catch (e) {}
  return [{ id: 'personal', name: 'Personal', icon: '' }];
}

/**
 * Guarda la lista de perfiles con verificación.
 * @param {Array} profiles Perfiles a persistir.
 * @returns {boolean} Verdadero si se verificó.
 */
function saveProfiles(profiles) {
  try {
    if (typeof DSAlmacen !== 'undefined' && DSAlmacen.guardarPerfiles) {
      return DSAlmacen.guardarPerfiles((profiles || []).map((p) => ({
        id: p.id, nombre: p.name, icono: p.icon || ''
      })));
    }
  } catch (e) {}
  try {
    localStorage.setItem('profiles', JSON.stringify(profiles));
    return true;
  } catch (e) {
    return false;
  }
}

function shortcutsKey() {
  return 'shortcuts_' + activeProfile;
}

function loadProfiles() {
  let profiles = getProfiles();
  if (profiles.length === 0) {
    profiles = [{ id: 'personal', name: 'Personal' }];
  }
  saveProfiles(profiles);

  // Migración de accesos globales al perfil Personal (idempotente: solo si falta)
  try {
    const old = localStorage.getItem('shortcuts');
    if (old && !localStorage.getItem('shortcuts_personal')) {
      localStorage.setItem('shortcuts_personal', old);
    }
    localStorage.setItem('profilesMigrated', '1');
  } catch (e) {}

  let startup = null;
  try {
    startup = localStorage.getItem('startupProfile');
  } catch (e) {}
  if (!startup || !profiles.some((p) => p.id === startup)) {
    startup = profiles[0].id;
    try {
      localStorage.setItem('startupProfile', startup);
    } catch (e) {}
  }

  // Arranque fresco del navegador → perfil de inicio
  let fresh = true;
  try {
    fresh = !sessionStorage.getItem('ds_session_started');
  } catch (e) {}
  let current = null;
  try {
    current = localStorage.getItem('activeProfile');
  } catch (e) {}
  if (fresh || !current || !profiles.some((p) => p.id === current)) {
    current = startup;
    try {
      localStorage.setItem('activeProfile', current);
    } catch (e) {}
  }
  try {
    sessionStorage.setItem('ds_session_started', '1');
  } catch (e) {}
  activeProfile = current;
}

function setActiveProfile(id) {
  const profiles = getProfiles();
  if (!profiles.some((p) => p.id === id)) return;
  let oldTheme = null;
  let newTheme = null;
  try {
    if (typeof window.DSPf !== 'undefined' && window.DSPf.get) {
      oldTheme = window.DSPf.get(activeProfile).theme;
      newTheme = window.DSPf.get(id).theme;
    }
  } catch (e) {}
  activeProfile = id;
  try {
    localStorage.setItem('activeProfile', id);
  } catch (e) {}
  loadShortcuts();
  // Otro tema/motor en ese perfil: recargar para aplicarlo.
  if (oldTheme !== null && newTheme !== null && oldTheme !== newTheme) {
    acceptReload();
  }
}

async function askText(msg, def) {
  try {
    if (typeof DSDialogs !== 'undefined' && DSDialogs.prompt) {
      const v = await DSDialogs.prompt(msg, { defaultValue: def || '' });
      return v === null || v === undefined ? null : String(v);
    }
  } catch (e) {}
  const v = prompt(msg, def || '');
  return v === null ? null : String(v);
}

async function askYesNo(msg, title) {
  try {
    if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
      return await DSDialogs.confirm(msg, { title: title || '' });
    }
  } catch (e) {}
  return confirm(msg);
}

/**
 * Resuelve el avatar visible de un perfil.
 * @param {{icon:string}} pf Perfil.
 * @param {string} base Ruta base del icono por defecto.
 * @returns {string} Avatar a mostrar.
 */
function avatarDe(pf, base) {
  try {
    if (typeof DSIconos !== 'undefined' && DSIconos.resolverAvatarPerfil) {
      return DSIconos.resolverAvatarPerfil(pf.icon || '', base);
    }
  } catch (e) {}
  return (pf.icon && pf.icon.trim()) ? pf.icon : base;
}

/**
 * Pide al usuario el icono de un perfil (URL, archivo o automático).
 * @param {string} actual Icono actual.
 * @returns {Promise<{valor:string, archivo:File|null, automatico:boolean}|null>} Elección o nulo si cancela.
 */
async function pedirIconoPerfil(actual) {
  const t2 = (typeof t === 'function') ? t : ((k) => k);
  const msg = t2('pfIconMsg') !== 'pfIconMsg' ? t2('pfIconMsg') : 'URL del icono del perfil (vacío = automático). Escribe ARCHIVO para subir desde el PC o AUTO para restablecer:';
  let entrada = null;
  try {
    if (typeof DSDialogs !== 'undefined' && DSDialogs.prompt) {
      entrada = await DSDialogs.prompt(msg, { title: 'Perfil', defaultValue: actual || '' });
    } else {
      entrada = prompt(msg, actual || '');
    }
  } catch (e) {
    entrada = null;
  }
  if (entrada === null || entrada === undefined) return null;
  const texto = String(entrada).trim();
  if (texto.toUpperCase() === 'AUTO' || texto === '') return { valor: '', archivo: null, automatico: true };
  if (texto.toUpperCase() === 'ARCHIVO') {
    const archivo = await elegirArchivoImagen();
    if (!archivo) return null;
    try {
      const dataUrl = await DSIconos.archivoADataUrl(archivo);
      return { valor: dataUrl, archivo: null, automatico: false };
    } catch (e) {
      return null;
    }
  }
  return { valor: texto, archivo: null, automatico: false };
}

/**
 * Abre un selector de archivo de imagen.
 * @returns {Promise<File|null>} Archivo elegido o nulo.
 */
function elegirArchivoImagen() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files && input.files[0] ? input.files[0] : null);
    input.oncancel = () => resolve(null);
    input.click();
    setTimeout(() => resolve(null), 60000);
  });
}

function renderProfiles() {
  const profiles = getProfiles();
  const t2 = (typeof t === 'function') ? t : ((k) => k);

  const bar = document.querySelector('[data-profiles]');
  if (bar) {
    bar.innerHTML = '';
    const uimg = document.createElement('img');
    uimg.src = 'assets/Texturas/UI/Usuario.svg';
    uimg.alt = '';
    uimg.className = 'sidebar-icon';
    uimg.style.pointerEvents = 'none';
    bar.appendChild(uimg);
    const tabs = document.createElement('div');
    tabs.className = 'cats-tabs';
    profiles.forEach((pf) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'cat-tab' + (pf.id === activeProfile ? ' active' : '');
      const avatar = document.createElement('img');
      avatar.src = avatarDe(pf, 'assets/Texturas/UI/Usuario.svg');
      avatar.alt = '';
      avatar.className = 'cat-mini';
      avatar.style.width = '18px';
      avatar.style.height = '18px';
      avatar.style.borderRadius = '50%';
      avatar.style.objectFit = 'cover';
      tab.appendChild(avatar);
      const name = document.createElement('span');
      name.textContent = pf.name;
      tab.appendChild(name);
      const ic = document.createElement('img');
      ic.src = 'assets/Texturas/UI/EditarFondo.svg';
      ic.alt = '';
      ic.className = 'cat-mini';
      ic.title = (typeof t === 'function') ? t('pfIconTitle') : 'Icono';
      ic.addEventListener('click', (e) => {
        e.stopPropagation();
        editProfileIcon(pf.id);
      });
      tab.appendChild(ic);
      const rn = document.createElement('img');
      rn.src = 'assets/Texturas/UI/Editar.svg';
      rn.alt = '';
      rn.className = 'cat-mini';
      rn.title = t2('pfRenameTitle');
      rn.addEventListener('click', (e) => {
        e.stopPropagation();
        renameProfile(pf.id);
      });
      tab.appendChild(rn);
      if (profiles.length > 1) {
        const del = document.createElement('img');
        del.src = 'assets/Texturas/UI/BasureroCerrado.svg';
        del.alt = '';
        del.className = 'cat-mini';
        del.title = t2('pfDeleteTitle');
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteProfile(pf.id);
        });
        tab.appendChild(del);
      }
      tab.addEventListener('click', () => setActiveProfile(pf.id));
      tabs.appendChild(tab);
    });
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'cat-tab add';
    add.textContent = '+';
    add.title = t2('pfCreate');
    add.addEventListener('click', createProfile);
    tabs.appendChild(add);
    bar.appendChild(tabs);
  }

  const side = document.querySelector('[data-side-profiles]');
  if (side) {
    side.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'side-pf-list';
    profiles.forEach((pf) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-tab' + (pf.id === activeProfile ? ' active' : '');
      b.style.flex = '1';
      const avatar = document.createElement('img');
      avatar.src = avatarDe(pf, 'assets/Texturas/UI/Usuario.svg');
      avatar.alt = '';
      avatar.style.width = '20px';
      avatar.style.height = '20px';
      avatar.style.borderRadius = '50%';
      avatar.style.objectFit = 'cover';
      b.appendChild(avatar);
      const s = document.createElement('span');
      s.textContent = pf.name;
      b.appendChild(s);
      b.addEventListener('click', () => {
        setActiveProfile(pf.id);
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      });
      row.appendChild(b);
    });
    side.appendChild(row);
  }
}

async function createProfile() {
  const t2 = (typeof t === 'function') ? t : ((k) => k);
  const name = await askText(t2('pfCreate'), '');
  if (!name || !name.trim()) return;
  const profiles = getProfiles();
  const id = 'p' + Date.now();
  profiles.push({ id, name: name.trim().slice(0, 20), icon: '' });
  if (!saveProfiles(profiles)) {
    await askYesNo(t2('quotaMsg') || 'No se pudo guardar.', 'DarkSnowF');
    return;
  }
  setActiveProfile(id);
  // El perfil nuevo elige su tema y motor con el tutorial (tras recargar).
  try { localStorage.setItem('ds_onboard_step', '1'); } catch (e) {}
  acceptReload();
}

/**
 * Edita el avatar de un perfil (URL, archivo o automático).
 * @param {string} id Identificador del perfil.
 */
async function editProfileIcon(id) {
  const profiles = getProfiles();
  const pf = profiles.find((p) => p.id === id);
  if (!pf) return;
  const eleccion = await pedirIconoPerfil(pf.icon || '');
  if (!eleccion) return;
  pf.icon = eleccion.automatico ? '' : eleccion.valor;
  if (!saveProfiles(profiles)) {
    const t2 = (typeof t === 'function') ? t : ((k) => k);
    await askYesNo(t2('quotaMsg') || 'No se pudo guardar.', 'DarkSnowF');
    return;
  }
  renderProfiles();
  acceptReload();
}

async function renameProfile(id) {
  const t2 = (typeof t === 'function') ? t : ((k) => k);
  const profiles = getProfiles();
  const pf = profiles.find((p) => p.id === id);
  if (!pf) return;
  const name = await askText(t2('pfRename'), pf.name);
  if (!name || !name.trim()) return;
  pf.name = name.trim().slice(0, 20);
  saveProfiles(profiles);
  renderProfiles();
  acceptReload();
}

async function deleteProfile(id) {
  const t2 = (typeof t === 'function') ? t : ((k) => k);
  let profiles = getProfiles();
  if (profiles.length <= 1) return;
  const pf = profiles.find((p) => p.id === id);
  if (!pf) return;
  const ok = await askYesNo(t2('pfDelete').replace('{name}', pf.name), pf.name);
  if (!ok) return;
  profiles = profiles.filter((p) => p.id !== id);
  saveProfiles(profiles);
  try {
    localStorage.removeItem('shortcuts_' + id);
    localStorage.removeItem('shortcutCategories_' + id);
    localStorage.removeItem('selectedCat_' + id);
    if (localStorage.getItem('activeProfile') === id) {
      localStorage.setItem('activeProfile', profiles[0].id);
    }
    if (localStorage.getItem('startupProfile') === id) {
      localStorage.setItem('startupProfile', profiles[0].id);
    }
  } catch (e) {}
  setActiveProfile(profiles[0].id);
  acceptReload();
}

function loadShortcuts() {
  loadProfiles();
  const saved = localStorage.getItem(shortcutsKey());
  if (saved) {
    shortcuts = JSON.parse(saved);
  } else {
    shortcuts = [
      {
        id: Date.now() + 1,
        name: 'Google',
        url: 'https://www.google.com',
        icon: 'https://www.google.com/favicon.ico'
      },
      {
        id: Date.now() + 2,
        name: 'YouTube',
        url: 'https://www.youtube.com',
        icon: 'https://www.youtube.com/favicon.ico'
      },
      {
        id: Date.now() + 3,
        name: 'GitHub',
        url: 'https://www.github.com',
        icon: 'https://www.github.com/favicon.ico'
      }
    ];
    saveShortcuts();
  }
  loadCategories();
  renderProfiles();
  renderCats();
  renderShortcuts();
}

// Si otra pestaña/ventana (p. ej. el panel) cambia el perfil, recargar aquí
window.addEventListener('storage', (e) => {
  if (!e.key || e.key === 'activeProfile' || e.key === 'startupProfile' || e.key === 'profiles') {
    try {
      if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
      else window.location.reload();
    } catch (err) {}
  }
});

/**
 * Guarda los accesos del perfil activo con verificación de escritura.
 * Si no hay cuota suficiente, informa al usuario sin perder el estado en memoria.
 * @returns {boolean} Verdadero si el guardado se verificó.
 */
function saveShortcuts() {
  try {
    if (typeof DSAlmacen !== 'undefined' && DSAlmacen.guardarAtajos) {
      const ok = DSAlmacen.guardarAtajos(activeProfile, shortcuts);
      if (!ok && typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        const msg = (typeof t === 'function') ? t('quotaMsg') : 'No se pudo guardar: almacenamiento lleno. Prueba con iconos más pequeños.';
        DSDialogs.confirm(msg, { title: 'DarkSnowF', confirmText: 'OK' }).catch(() => {});
      }
      return ok;
    }
  } catch (e) {}
  try {
    localStorage.setItem(shortcutsKey(), JSON.stringify(shortcuts));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Obtiene la URL del favicon automático para un sitio.
 * @param {string} url URL del sitio.
 * @returns {string} URL del favicon o icono genérico.
 */
function getFaviconUrl(url) {
  try {
    if (typeof DSIconos !== 'undefined' && DSIconos.faviconAutomatico) {
      return DSIconos.faviconAutomatico(url);
    }
  } catch (e) {}
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch (e) {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">W</text></svg>';
  }
}

function getNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1).split('.')[0];
  } catch (e) {
    return 'Sitio web';
  }
}

const fallbackShortcutIcon = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%2270%22 font-size=%2270%22%3EW%3C/text%3E%3C/svg%3E';

function renderShortcuts() {
  shortcutsContainer.innerHTML = '';

  shortcuts
    .filter((shortcut) => (shortcut.catId || 'general') === selectedCat)
    .forEach(shortcut => {
    const card = document.createElement('div');
    card.className = 'shortcut-card';
    card.draggable = true;
    card.dataset.shortcutId = shortcut.id;

    const actions = document.createElement('div');
    actions.className = 'shortcut-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'shortcut-btn edit';
    editBtn.dataset.edit = shortcut.id;
    editBtn.title = 'Editar';
    editBtn.innerHTML = '<img src="assets/Texturas/UI/Editar.svg" alt="Editar">';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shortcut-btn delete';
    deleteBtn.dataset.delete = shortcut.id;
    deleteBtn.title = 'Eliminar';
    deleteBtn.innerHTML = '<img class="icon-closed" src="assets/Texturas/UI/BasureroCerrado.svg" alt="Eliminar"><img class="icon-open" src="assets/Texturas/UI/BasureroAbierto.svg" alt="Eliminar">';

    actions.append(editBtn, deleteBtn);

    const icon = document.createElement('img');
    try {
      icon.src = (typeof DSIconos !== 'undefined' && DSIconos.resolverIconoAcceso)
        ? DSIconos.resolverIconoAcceso(shortcut.icon || '', shortcut.url)
        : (shortcut.icon || fallbackShortcutIcon);
    } catch (e) {
      icon.src = shortcut.icon || fallbackShortcutIcon;
    }
    icon.alt = shortcut.name;
    icon.className = 'shortcut-icon';
    icon.onerror = () => {
      icon.onerror = null;
      icon.src = fallbackShortcutIcon;
    };

    const title = document.createElement('div');
    title.className = 'shortcut-title';
    title.textContent = shortcut.name;

    card.append(actions, icon, title);

    card.addEventListener('click', (e) => {
      if (shortcutWasDragged) {
        shortcutWasDragged = false;
        return;
      }
      if (!e.target.closest('.shortcut-actions')) {
        window.location.href = shortcut.url;
      }
    });

    card.addEventListener('dragstart', (e) => {
      if (e.target.closest('.shortcut-actions')) {
        e.preventDefault();
        return;
      }

      draggedShortcutId = shortcut.id;
      shortcutWasDragged = true;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(shortcut.id));
    });

    card.addEventListener('dragend', () => {
      draggedShortcutId = null;
      lastDropTarget = null;
      document.querySelectorAll('.shortcut-card.dragging, .shortcut-card.drag-over').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
      });

      setTimeout(() => {
        shortcutWasDragged = false;
      }, 150);
    });

    shortcutsContainer.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'shortcut-card add-new';
  const addTitle = (typeof t === 'function') ? t('addTitle') : 'Agregar';
  const plus = document.createElement('div');
  plus.style.fontSize = '1.5rem';
  plus.style.color = 'var(--accent)';
  plus.textContent = '+';
  const addName = document.createElement('div');
  addName.className = 'shortcut-title';
  addName.textContent = addTitle;
  addCard.appendChild(plus);
  addCard.appendChild(addName);
  addCard.addEventListener('click', () => openModal());
  shortcutsContainer.appendChild(addCard);

  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.edit);
      editShortcut(id);
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.delete);
      deleteShortcut(id);
    });
  });
}

function getDragAfterShortcut(container, x, y) {
  const cards = [...container.querySelectorAll('.shortcut-card:not(.dragging):not(.add-new)')];

  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const sameRow = y >= box.top && y <= box.bottom;
    const offset = sameRow ? x - box.left - box.width / 2 : y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function saveShortcutOrderFromDom() {
  const orderedIds = [...shortcutsContainer.querySelectorAll('.shortcut-card:not(.add-new)')]
    .map(card => Number(card.dataset.shortcutId));

  const ordered = orderedIds
    .map(id => shortcuts.find(shortcut => shortcut.id === id))
    .filter(Boolean);

  // Reordenar solo dentro de la categoría visible, conservar el resto
  let i = 0;
  shortcuts = shortcuts.map((s) => {
    if ((s.catId || 'general') === selectedCat && i < ordered.length) {
      return ordered[i++];
    }
    return s;
  });

  saveShortcuts();
}

shortcutsContainer.addEventListener('dragover', (e) => {
  if (!draggedShortcutId) return;

  e.preventDefault();
  const draggingCard = shortcutsContainer.querySelector('.shortcut-card.dragging');
  const addCard = shortcutsContainer.querySelector('.shortcut-card.add-new');
  const afterElement = getDragAfterShortcut(shortcutsContainer, e.clientX, e.clientY);

  if (!draggingCard) return;

  // Solo mover si el destino cambió (evita el temblor)
  const target = afterElement || addCard;
  if (target === lastDropTarget) return;
  lastDropTarget = target;
  shortcutsContainer.insertBefore(draggingCard, target);
});

shortcutsContainer.addEventListener('drop', (e) => {
  if (!draggedShortcutId) return;

  e.preventDefault();
  lastDropTarget = null;
  saveShortcutOrderFromDom();
});

/**
 * Icono temporal elegido en el modal (URL o dataURL). Vacío = automático.
 * @type {string}
 */
let iconoTemporalAcceso = '';

/**
 * Actualiza la vista previa del icono en el modal.
 * @param {string} icono Icono a previsualizar.
 * @param {string} urlSitio URL del sitio para el modo automático.
 */
function actualizarVistaPreviaIcono(icono, urlSitio) {
  const vista = document.getElementById('shortcut-icon-preview');
  if (!vista) return;
  try {
    if (icono && typeof DSIconos !== 'undefined' && DSIconos.esUrlIconoValida && DSIconos.esUrlIconoValida(icono)) {
      vista.src = icono;
      return;
    }
  } catch (e) {}
  try {
    vista.src = getFaviconUrl(urlSitio || (urlInput && urlInput.value) || 'https://ejemplo.com');
  } catch (e) {
    vista.src = fallbackShortcutIcon;
  }
}

function openModal(shortcut = null) {
  editingShortcutId = shortcut ? shortcut.id : null;
  iconoTemporalAcceso = (shortcut && typeof shortcut.icon === 'string') ? shortcut.icon : '';

  if (shortcut) {
    modalTitle.textContent = (typeof t === 'function') ? t('modalEdit') : 'Editar acceso rápido';
    urlInput.value = shortcut.url;
    nameInput.value = shortcut.name;
  } else {
    modalTitle.textContent = (typeof t === 'function') ? t('modalAdd') : 'Agregar acceso rápido';
    urlInput.value = '';
    nameInput.value = '';
  }

  const iconUrlInput = document.getElementById('shortcut-icon-url');
  const iconFileInput = document.getElementById('shortcut-icon-file');
  const iconName = document.getElementById('shortcut-icon-name');
  if (iconUrlInput) iconUrlInput.value = iconoTemporalAcceso && iconoTemporalAcceso.indexOf('data:') !== 0 ? iconoTemporalAcceso : '';
  if (iconFileInput) iconFileInput.value = '';
  if (iconName) iconName.textContent = '';
  actualizarVistaPreviaIcono(iconoTemporalAcceso, urlInput.value);

  modalOverlay.classList.add('active');
  urlInput.focus();

  const catSelect = document.getElementById('shortcut-cat');
  if (catSelect) {
    catSelect.innerHTML = '';
    categories.forEach((cat) => {
      const o = document.createElement('option');
      o.value = cat.id;
      o.textContent = cat.name;
      catSelect.appendChild(o);
    });
    catSelect.value = shortcut ? (shortcut.catId || selectedCat) : selectedCat;
  }
}

function closeModal() {
  modalOverlay.classList.remove('active');
  editingShortcutId = null;
  shortcutForm.reset();
}

function editShortcut(id) {
  const shortcut = shortcuts.find(s => s.id === id);
  if (shortcut) {
    openModal(shortcut);
  }
}

async function deleteShortcut(id) {
  const msg = (typeof t === 'function') ? t('confirmDelete') : '¿Estás seguro de eliminar este acceso rápido?';
  const confirmed = await DSDialogs.confirm(msg, {
    title: (typeof t === 'function') ? t('deleteTitle') : 'Eliminar acceso',
    confirmText: (typeof t === 'function') ? t('delete') : 'Eliminar',
    isDanger: true
  });
  if (confirmed) {
    shortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts();
    renderShortcuts();
    acceptReload();
  }
}

shortcutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();
  if (!url) return;
  let name = nameInput.value.trim();

  if (!name) {
    name = getNameFromUrl(url);
  }

  const iconUrlInput = document.getElementById('shortcut-icon-url');
  const urlManual = iconUrlInput ? iconUrlInput.value.trim() : '';
  let icon = '';
  if (iconoTemporalAcceso && iconoTemporalAcceso.indexOf('data:') === 0) {
    icon = iconoTemporalAcceso;
  } else if (urlManual) {
    icon = urlManual;
  } else if (iconoTemporalAcceso) {
    icon = iconoTemporalAcceso;
  } else {
    icon = '';
  }
  const catSelect = document.getElementById('shortcut-cat');
  const catId = (catSelect && catSelect.value) ? catSelect.value : selectedCat;

  if (editingShortcutId) {
    const shortcut = shortcuts.find(s => s.id === editingShortcutId);
    if (shortcut) {
      shortcut.url = url;
      shortcut.name = name;
      shortcut.icon = icon;
      shortcut.catId = catId;
    }
  } else {
    shortcuts.push({
      id: Date.now(),
      name,
      url,
      icon,
      catId
    });
  }

  if (!saveShortcuts()) {
    return;
  }
  renderShortcuts();
  iconoTemporalAcceso = '';
  closeModal();
  acceptReload();
});

modalCancel.addEventListener('click', closeModal);

/**
 * Enlaza los controles de icono personalizado del modal de accesos.
 * Permite URL manual, subida de archivo y restablecimiento automático.
 */
(function enlazarControlesIconoAcceso() {
  const iconUrlInput = document.getElementById('shortcut-icon-url');
  const iconFileInput = document.getElementById('shortcut-icon-file');
  const iconFileBtn = document.querySelector('[data-icon-file-btn]');
  const iconAutoBtn = document.querySelector('[data-icon-auto-btn]');
  const iconName = document.getElementById('shortcut-icon-name');
  if (iconUrlInput) {
    iconUrlInput.addEventListener('input', () => {
      iconoTemporalAcceso = iconUrlInput.value.trim();
      if (iconName) iconName.textContent = '';
      actualizarVistaPreviaIcono(iconoTemporalAcceso, urlInput.value);
    });
  }
  if (iconFileBtn && iconFileInput) {
    iconFileBtn.addEventListener('click', () => iconFileInput.click());
  }
  if (iconFileInput) {
    iconFileInput.addEventListener('change', async () => {
      const archivo = iconFileInput.files && iconFileInput.files[0];
      if (!archivo) return;
      try {
        const dataUrl = await DSIconos.archivoADataUrl(archivo);
        iconoTemporalAcceso = dataUrl;
        if (iconUrlInput) iconUrlInput.value = '';
        if (iconName) iconName.textContent = 'Archivo: ' + archivo.name;
        actualizarVistaPreviaIcono(dataUrl, urlInput.value);
      } catch (err) {
        if (iconName) iconName.textContent = err && err.message ? err.message : 'Imagen no válida.';
      }
    });
  }
  if (iconAutoBtn) {
    iconAutoBtn.addEventListener('click', () => {
      iconoTemporalAcceso = '';
      if (iconUrlInput) iconUrlInput.value = '';
      if (iconFileInput) iconFileInput.value = '';
      if (iconName) iconName.textContent = '';
      actualizarVistaPreviaIcono('', urlInput.value);
    });
  }
  if (typeof urlInput !== 'undefined' && urlInput) {
    urlInput.addEventListener('input', () => {
      if (!iconoTemporalAcceso) actualizarVistaPreviaIcono('', urlInput.value);
    });
  }
})();

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('active')) {
      closeModal();
    }
    if (wallpaperModal.classList.contains('active')) {
      wallpaperModal.classList.remove('active');
      wallpaperForm.reset();
      previewContainer.style.display = 'none';
    }
  }
});

urlInput.addEventListener('blur', () => {
  if (urlInput.value && !nameInput.value) {
    nameInput.placeholder = getNameFromUrl(urlInput.value);
  }
});

loadShortcuts();

// ==================== MOTOR DE BÃšSQUEDA ====================

let currentEngine = (typeof window.DSPf !== 'undefined' && window.DSPf.get) ? (window.DSPf.get().engine || 'duckduckgo') : 'duckduckgo';

const searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  chatgpt: 'https://chat.openai.com/?q=',
  wikipedia: 'https://es.wikipedia.org/wiki/Special:Search?search=',
  perplexity: 'https://www.perplexity.ai/search?q=',
  claude: 'https://claude.ai/new?q=',
  mistral: 'https://chat.mistral.ai/chat',
  gemini: 'https://www.google.com/search?udm=50&q='
};

const engineNames = {
  google: 'Google',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
  chatgpt: 'ChatGPT',
  wikipedia: 'Wikipedia ES',
  perplexity: 'Perplexity IA',
  claude: 'Claude',
  mistral: 'Mistral',
  gemini: 'Gemini'
};

const searchInput = document.querySelector('[data-search]');
const searchContainer = document.querySelector('.search-container');
const engineToggle = document.querySelector('[data-engine-toggle]');
const engineDropdown = document.querySelector('[data-engine-dropdown]');
const engineNameSpan = document.querySelector('[data-engine-name]');
const engineOptions = document.querySelectorAll('[data-engine]');
const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

engineToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  engineDropdown.classList.toggle('active');
  searchContainer.classList.toggle('engine-open', engineDropdown.classList.contains('active'));
});

document.addEventListener('click', () => {
  engineDropdown.classList.remove('active');
  searchContainer.classList.remove('engine-open');
});

engineDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
});

engineOptions.forEach(option => {
  option.addEventListener('click', () => {
    const engine = option.dataset.engine;
    currentEngine = engine;
    
    engineOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    engineNameSpan.textContent = engineNames[engine];
    
    searchInput.placeholder = `${((typeof t === 'function') ? t('searchWith') : 'Buscar con ')}${engineNames[engine]}`;
    
    engineDropdown.classList.remove('active');
    searchContainer.classList.remove('engine-open');
    
    localStorage.setItem('preferredSearchEngine', engine);
    try {
      if (typeof window.DSPf !== 'undefined' && window.DSPf.set) window.DSPf.set(activeProfile, { engine });
    } catch (e) {}
  });
});

const savedEngine = localStorage.getItem('preferredSearchEngine');
if (savedEngine && searchEngines[savedEngine]) {
  currentEngine = savedEngine;
  engineNameSpan.textContent = engineNames[savedEngine];
  searchInput.placeholder = `${((typeof t === 'function') ? t('searchWith') : 'Buscar con ')}${engineNames[savedEngine]}`;
  engineOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.engine === savedEngine);
  });
}

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
      const urlPattern = /^(https?:\/\/)|(www\.)/i;
      if (urlPattern.test(query)) {
        const url = query.startsWith('http') ? query : 'https://' + query;
        window.location.href = url;
      } else if (currentEngine === 'mistral') {
        // Mistral no acepta la pregunta por URL: se copia y se abre el chat.
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(query).catch(() => {});
          }
        } catch (e) {}
        window.location.href = searchEngines.mistral;
      } else {
        const searchUrl = searchEngines[currentEngine] + encodeURIComponent(query);
        window.location.href = searchUrl;
      }
    }
  }
});

// ==================== SIDEBAR ====================

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
});

sidebar.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
});

// La página actual no se puede volver a seleccionar
(function markCurrentNav() {
  const here = (window.location.pathname.replace(/\\/g, '/').split('/').pop() || 'Index.html').toLowerCase();
  sidebar.querySelectorAll('a[href]').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop().toLowerCase();
    if (href && href === here) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
      a.addEventListener('click', (e) => e.preventDefault());
    }
  });
})();

// ==================== RECARGA AUTOMÁTICA ====================

// Recarga automática tras aceptar un cambio
function acceptReload() {
  setTimeout(() => {
    try {
      if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
      else window.location.reload();
    } catch (e) {}
  }, 350);
}

function refreshSearchPlaceholder() {
  if (!searchInput) return;
  const prefix = (typeof t === 'function') ? t('searchWith') : 'Buscar con ';
  const name = engineNames[currentEngine] || currentEngine;
  searchInput.placeholder = `${prefix}${name}`;
}

// ==================== MODAL AYUDA ====================

const helpModal = document.querySelector('[data-help-modal]');
const helpBtn = document.querySelector('[data-help-btn]');
const helpClose = document.querySelector('[data-help-close]');

if (helpBtn && helpModal) {
  helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

if (helpClose && helpModal) {
  helpClose.addEventListener('click', () => {
    helpModal.classList.remove('active');
  });
}

if (helpModal) {
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('active');
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && helpModal && helpModal.classList.contains('active')) {
    helpModal.classList.remove('active');
  }
});

// Abrir ayuda directa con ../Index.html#ayuda y fondo con #fondo
if (helpModal && window.location.hash === '#ayuda') {
  helpModal.classList.add('active');
  try {
    history.replaceState(null, '', window.location.pathname);
  } catch (e) {}
}

if (wallpaperModal && window.location.hash === '#fondo') {
  wallpaperModal.classList.add('active');
  try {
    history.replaceState(null, '', window.location.pathname);
  } catch (e) {}
}

// ==================== RELOJ: internet o PC + zona horaria ====================

(function syncClock() {
  let cfg = {};
  try {
    cfg = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
  } catch (e) {
    cfg = {};
  }

  if (typeof Clock !== 'undefined') {
    if (cfg.clockTz && cfg.clockTz !== 'local') Clock.setTz(cfg.clockTz);
    if (cfg.syncTime === false) return;
    fetch('https://worldtimeapi.org/api/ip')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.datetime) {
          const serverMs = new Date(d.datetime).getTime();
          if (!isNaN(serverMs)) Clock.setOffset(serverMs - Date.now());
        }
      })
      .catch(() => {
        // Sin conexión: se usa la hora del PC
      });
  }
})();

// ==================== BOTÃ“N IDIOMA ====================

const langBtn = document.querySelector('[data-lang-btn]');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    if (typeof toggleLang === 'function') toggleLang();
  });
}

// Aviso de función próxima para enlaces pendientes del sidebar
document.addEventListener('click', (e) => {
  const link = e.target && e.target.closest ? e.target.closest('[data-coming-soon]') : null;
  if (!link) return;
  e.preventDefault();
  if (link.blur) link.blur();
  try {
    const msg = (typeof t === 'function') ? t('soonMsg') : '404 — Muy pronto, mantente al tanto.';
    const title = (typeof t === 'function') ? t('soonTitle') : 'Próximamente';
    const ok = (typeof t === 'function') ? t('infoOk') : 'Entendido';
    if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
      DSDialogs.confirm(msg, { title: title, confirmText: ok });
    }
  } catch (err) {}
});

// ==================== FLECHAS ENTRE CATEGORÍAS ====================

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
  if (typeof stepCat !== 'function') return;
  stepCat(e.key === 'ArrowRight' ? 1 : -1);
});

// ==================== COMPATIBILIDAD MV3 (sin manejadores en línea) ====================

const wallpaperFileBtn = document.querySelector('[data-wallpaper-file-btn]');
if (wallpaperFileBtn && wallpaperFile) {
  wallpaperFileBtn.addEventListener('click', () => {
    wallpaperFile.click();
  });
}
