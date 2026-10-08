/**
 * i18n.js - Idiomas ES/EN para DarkSnowF (localStorage: darkSnowFConfig.lang)
 * Sin dependencias. Debe cargarse antes de index-app.js
 */

const I18N_STRINGS = {
  es: {
    navMenu: 'Menú de navegación',
    home: 'Inicio',
    wallpaper: 'Cambiar fondo',
    settings: 'Configuración',
    credits: 'Créditos',
    license: 'Licencia',
    profileSettings: 'Perfil ajustes',
    help: 'Ayuda',
    networks: 'Redes',
    searchPh: 'Buscar o introducir dirección',
    searchWith: 'Buscar con ',
    addTitle: 'Agregar',
    modalAdd: 'Agregar acceso rápido',
    modalEdit: 'Editar acceso rápido',
    urlLabel: 'URL *',
    urlHint: 'La URL completa del sitio web',
    nameLabel: 'Nombre (opcional)',
    namePh: 'Se detectará automáticamente',
    nameHint: 'Si no lo escribes, se obtendrá del sitio web',
    iconLabel: 'Icono personalizado (opcional)',
    iconPh: 'https://ejemplo.com/icono.png',
    iconHint: 'Pega la URL de una imagen o sube una desde tu PC. Vacío = automático.',
    iconFileBtn: 'Subir imagen',
    iconAutoBtn: 'Automático',
    quotaMsg: 'No se pudo guardar: almacenamiento lleno. Prueba con iconos más pequeños.',
    pfIconTitle: 'Icono',
    pfIconMsg: 'URL del icono del perfil (vacío = automático). Escribe ARCHIVO para subir desde el PC o AUTO para restablecer:',
    cancelBtn: 'Cancelar',
    saveBtn: 'Guardar',
    wpTitle: 'Cambiar fondo de pantalla',
    wpPreset: 'Fondos predeterminados',
    wpSelect: 'Seleccionar fondo...',
    wpDefault: 'Degradado oscuro (predeterminado)',
    wpMountains: 'Montañas nocturnas',
    wpAurora: 'Aurora boreal',
    wpSnow: 'Montañas nevadas',
    wpSpace: 'Paisaje nevado',
    wpEarth: 'Tierra desde el espacio',
    wpStarry: 'Noche estrellada',
    wpLake: 'Lago y montaña',
    wpBmw: 'BMW M4',
    wpAnimated: 'Fondos animados',
    wpNoAnim: 'Sin animación',
    wpStars: 'Estrellas cayendo',
    wpNebula: 'Nébula espacial',
    wpWaves: 'Olas animadas',
    wpAnimHint: 'Los fondos animados se combinan con el fondo seleccionado',
    wpUrlLabel: 'O introduce una URL',
    wpUrlHint: 'URL de una imagen desde internet',
    wpUpload: 'O sube desde tu PC',
    wpChooseFile: 'Seleccionar archivo',
    wpSize: 'Tamaño de la imagen',
    wpCover: 'Cubrir pantalla (predeterminado)',
    wpContain: 'Ajustar a pantalla',
    wpOriginal: 'Tamaño original',
    wpCustom: 'Personalizado',
    wpCustomSize: 'Tamaño personalizado (ancho x alto en px)',
    wpCustomHint: 'Ejemplo: 700 × 200 px (predeterminado: 1920 × 1080)',
    wpPreview: 'Vista previa',
    wpReset: 'Restaurar predeterminado',
    wpApply: 'Aplicar',
    helpTitle: 'Ayuda',
    helpH1: '1. Buscador: escribe y pulsa Enter; cambia de motor arriba.',
    helpH2: '2. Accesos: + agrega, arrastra para ordenar, edita o borra.',
    helpH3: '3. Categorías: pestañas, flechas < >, suelta encima, crea o borra.',
    helpH4: '4. Perfiles: cambia en menú, ajustes o popup; cada uno sus enlaces.',
    helpH5: '5. Fondo: predefinidos, URL o archivo; pueden rotar; pregunta por la nieve.',
    helpH6: '6. Reloj: internet o PC, zona horaria y formato en ajustes.',
    helpH7: '7. Idioma: cambia ES/EN desde el menú o ajustes.',
    helpH8: '8. Ajustes: los cambios se guardan y aplican solos.',
    help1: 'Escribe en el buscador y pulsa Enter para buscar o ir a una dirección.',
    help2: 'Pulsa + para agregar accesos rápidos a tus sitios favoritos.',
    help3: 'Arrastra los accesos para reordenarlos.',
    help4: 'Desde el menú puedes cambiar el fondo, el idioma y ver la configuración.',
    helpClose: 'Entendido',
    helpGuide: 'Ver guía inicial',
    obTitle: 'Bienvenido a DarkSnowF',
    obStep1: '1. Elige tu tema recomendado',
    obDark: 'Oscuro (por defecto)',
    obDarkDesc: 'Poco blanco: grises, negro y blanco.',
    obDef: 'Por defecto (recomendado)',
    obDefDesc: 'El aspecto actual de DarkSnowF.',
    obOsc: 'Oscuro',
    obOscDesc: 'Negro profundo, poco blanco.',
    obLight: 'Claro',
    obLightDesc: 'Más luminoso: blancos y grises claros.',
    obChoose: 'Escojo este',
    obThemeLater: 'Podrás cambiarlo cuando quieras desde Ajustes.',
    obStep2: '2. Elige tu motor de búsqueda',
    obEngineRec: 'Se recomienda DuckDuckGo: mayor seguridad y privacidad.',
    obEngineLater: 'Puedes cambiarlo más adelante desde el selector del buscador.',
    obContinue: 'Continuar',
    obSkipAll: 'Omitir todo',
    obSkip: 'Omitir',
    obStep3: '3. Qué puede hacer',
    obF1: 'Buscador con predicciones y 9 motores, incluidos Claude, Mistral y Gemini.',
    obF2: 'Temas por defecto, oscuro y claro, intercambiables desde Ajustes.',
    obF3: 'Perfiles con sus propios enlaces y categorías.',
    obF4: 'Fondos rotativos y cursores de gato con CatCursorF.',
    obF5: 'Todo se guarda en tu equipo. Ajustes y Ayuda en el menú.',
    obStart: 'Empezar',
    confirmDelete: '¿Estás seguro de eliminar este acceso rápido?',
    confirmWallpaper: '¿Restaurar fondo predeterminado?',
    snowAsk: '¿Quitar la nieve para mejorar el ambiente del fondo?',
    wpDone: 'Fondo aplicado correctamente.',
    infoOk: 'Entendido',
    soonTitle: 'Próximamente',
    soonMsg: '404 — Muy pronto, mantente al tanto.',
    yesBtn: 'Sí',
    noBtn: 'No',
    catGeneral: 'General',
    catLabel: 'Categoría',
    catCreate: 'Nombre de la categoría:',
    catRename: 'Nuevo nombre:',
    catRenameTitle: 'Renombrar',
    catDelete: '¿Eliminar la categoría "{name}"?',
    catDeleteTitle: 'Eliminar',
    catDeleteWith: 'La categoría "{name}" tiene {n} accesos. Aceptar = eliminarlos también. Cancelar = moverlos a otra categoría.',
    catMoveTo: 'Mover accesos a ({list}):',
    catPrev: 'Anterior',
    catNext: 'Siguiente',
    pfTitle: 'Perfiles',
    pfCreate: 'Nombre del perfil:',
    pfRename: 'Nuevo nombre:',
    pfRenameTitle: 'Renombrar',
    pfDelete: '¿Eliminar el perfil "{name}" y todos sus enlaces?',
    pfDeleteTitle: 'Eliminar'
  },
  en: {
    navMenu: 'Navigation menu',
    home: 'Home',
    wallpaper: 'Change background',
    settings: 'Settings',
    credits: 'Credits',
    license: 'License',
    profileSettings: 'Profile settings',
    help: 'Help',
    networks: 'Socials',
    searchPh: 'Search or enter address',
    searchWith: 'Search with ',
    addTitle: 'Add',
    modalAdd: 'Add shortcut',
    modalEdit: 'Edit shortcut',
    urlLabel: 'URL *',
    urlHint: 'The full website URL',
    nameLabel: 'Name (optional)',
    namePh: 'Will be detected automatically',
    nameHint: 'If left empty, it will be taken from the website',
    iconLabel: 'Custom icon (optional)',
    iconPh: 'https://example.com/icon.png',
    iconHint: 'Paste an image URL or upload one from your PC. Empty = automatic.',
    iconFileBtn: 'Upload image',
    iconAutoBtn: 'Automatic',
    quotaMsg: 'Could not save: storage is full. Try smaller icons.',
    pfIconTitle: 'Icon',
    pfIconMsg: 'Profile icon URL (empty = automatic). Type FILE to upload from PC or AUTO to reset:',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    wpTitle: 'Change wallpaper',
    wpPreset: 'Preset backgrounds',
    wpSelect: 'Select background...',
    wpDefault: 'Dark gradient (default)',
    wpMountains: 'Night mountains',
    wpAurora: 'Northern lights',
    wpSnow: 'Snowy mountains',
    wpSpace: 'Snowy landscape',
    wpEarth: 'Earth from space',
    wpStarry: 'Starry night',
    wpLake: 'Mountain lake',
    wpBmw: 'BMW M4',
    wpAnimated: 'Animated backgrounds',
    wpNoAnim: 'No animation',
    wpStars: 'Falling stars',
    wpNebula: 'Space nebula',
    wpWaves: 'Animated waves',
    wpAnimHint: 'Animated backgrounds blend with the selected background',
    wpUrlLabel: 'Or enter a URL',
    wpUrlHint: 'URL of an image from the internet',
    wpUpload: 'Or upload from your PC',
    wpChooseFile: 'Choose file',
    wpSize: 'Image size',
    wpCover: 'Cover screen (default)',
    wpContain: 'Fit to screen',
    wpOriginal: 'Original size',
    wpCustom: 'Custom',
    wpCustomSize: 'Custom size (width x height in px)',
    wpCustomHint: 'Example: 700 × 200 px (default: 1920 × 1080)',
    wpPreview: 'Preview',
    wpReset: 'Restore default',
    wpApply: 'Apply',
    helpTitle: 'Help',
    helpH1: '1. Search: type and press Enter; switch engine above.',
    helpH2: '2. Shortcuts: + adds, drag to reorder, edit or delete.',
    helpH3: '3. Categories: tabs, < > arrows, drop onto a tab, create or delete.',
    helpH4: '4. Profiles: switch in menu, settings or popup; each keeps its links.',
    helpH5: '5. Background: presets, URL or file; can rotate; asks about snow.',
    helpH6: '6. Clock: internet or PC, timezone and format in settings.',
    helpH7: '7. Language: switch ES/EN from menu or settings.',
    helpH8: '8. Settings: changes save and apply on their own.',
    help1: 'Type in the search bar and press Enter to search or go to an address.',
    help2: 'Press + to add shortcuts to your favorite sites.',
    help3: 'Drag shortcuts to reorder them.',
    help4: 'From the menu you can change the background, language and open settings.',
    helpClose: 'Got it',
    helpGuide: 'View start guide',
    obTitle: 'Welcome to DarkSnowF',
    obStep1: '1. Choose your recommended theme',
    obDark: 'Dark (default)',
    obDarkDesc: 'Little white: grays, black and white.',
    obDef: 'Default (recommended)',
    obDefDesc: 'The current DarkSnowF look.',
    obOsc: 'Dark',
    obOscDesc: 'Deep black, little white.',
    obLight: 'Light',
    obLightDesc: 'Brighter: whites and light grays.',
    obChoose: 'Pick this one',
    obThemeLater: 'You can change it anytime from Settings.',
    obStep2: '2. Choose your search engine',
    obEngineRec: 'DuckDuckGo is recommended: more security and privacy.',
    obEngineLater: 'You can change it later from the search selector.',
    obContinue: 'Continue',
    obSkipAll: 'Skip all',
    obSkip: 'Skip',
    obStep3: '3. What it can do',
    obF1: 'Search with predictions and 9 engines, including Claude, Mistral and Gemini.',
    obF2: 'Default, dark and light themes, switchable from Settings.',
    obF3: 'Profiles with their own links and categories.',
    obF4: 'Rotating wallpapers and cat cursors with CatCursorF.',
    obF5: 'Everything is stored on your device. Settings and Help in the menu.',
    obStart: 'Start',
    confirmDelete: 'Are you sure you want to delete this shortcut?',
    confirmWallpaper: 'Restore default background?',
    snowAsk: 'Remove the snow to improve the background mood?',
    wpDone: 'Background applied successfully.',
    infoOk: 'Got it',
    soonTitle: 'Coming soon',
    soonMsg: '404 — Coming soon, stay tuned.',
    yesBtn: 'Yes',
    noBtn: 'No',
    catGeneral: 'General',
    catLabel: 'Category',
    catCreate: 'Category name:',
    catRename: 'New name:',
    catRenameTitle: 'Rename',
    catDelete: 'Delete the "{name}" category?',
    catDeleteTitle: 'Delete',
    catDeleteWith: 'The "{name}" category has {n} shortcuts. OK = delete them too. Cancel = move them to another category.',
    catMoveTo: 'Move shortcuts to ({list}):',
    catPrev: 'Previous',
    catNext: 'Next',
    pfTitle: 'Profiles',
    pfCreate: 'Profile name:',
    pfRename: 'New name:',
    pfRenameTitle: 'Rename',
    pfDelete: 'Delete the "{name}" profile and all its links?',
    pfDeleteTitle: 'Delete'
  }
};

function getLang() {
  try {
    const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    if (s.lang === 'en' || s.lang === 'es') return s.lang;
  } catch (e) {}
  // Sin elección guardada: idioma del equipo.
  if (typeof window.dsSysLang === 'function') return window.dsSysLang();
  return 'es';
}

function t(key) {
  const lang = getLang();
  if (I18N_STRINGS[lang] && I18N_STRINGS[lang][key] !== undefined) {
    return I18N_STRINGS[lang][key];
  }
  return I18N_STRINGS.es[key] !== undefined ? I18N_STRINGS.es[key] : key;
}

function applyLang() {
  const lang = getLang();
  const dict = I18N_STRINGS[lang] || I18N_STRINGS.es;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  const langLabel = document.querySelector('[data-lang-label]');
  if (langLabel) langLabel.textContent = lang === 'en' ? 'Language: EN' : 'Idioma: ES';
}

function toggleLang() {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
  } catch (e) {
    settings = {};
  }
  settings.lang = getLang() === 'en' ? 'es' : 'en';
  localStorage.setItem('darkSnowFConfig', JSON.stringify(settings));
  applyLang();
  if (typeof renderCats === 'function') renderCats();
  if (typeof renderShortcuts === 'function') renderShortcuts();
  if (typeof refreshSearchPlaceholder === 'function') refreshSearchPlaceholder();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyLang);
} else {
  applyLang();
}
