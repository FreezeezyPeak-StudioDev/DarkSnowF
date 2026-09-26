/**
 * rotate.js - Rotación de varios fondos (presets + agregados por el usuario).
 * Lista en localStorage: wallpaperPool (solo URLs http(s), máx 30).
 * Ajustes en darkSnowFConfig: rotateWallpaper (bool), rotateInterval
 * ('tab' = cada pestaña, o minutos '5'/'15'/'30'/'60').
 * Sin dependencias. Cargar antes de index-app.js y config-loader.js.
 */

function getWallpaperPool() {
  try {
    const p = JSON.parse(localStorage.getItem('wallpaperPool') || '[]');
    if (!Array.isArray(p)) return [];
    return p.filter((u) => typeof u === 'string' && (/^https?:/i.test(u) || /^assets\//i.test(u)));
  } catch (e) {
    return [];
  }
}

function saveWallpaperPool(pool) {
  try {
    localStorage.setItem('wallpaperPool', JSON.stringify(pool.slice(0, 30)));
  } catch (e) {}
}

function trackWallpaper(url) {
  if (!url || url === 'default') return;
  if (!/^https?:/i.test(url) && !/^assets\//i.test(url)) return;
  const pool = getWallpaperPool();
  if (pool.indexOf(url) === -1) {
    pool.push(url);
    saveWallpaperPool(pool);
  }
}

// Resuelve rutas locales (assets/...) según la página (home o pages/)
function resolveWp(url) {
  if (!url || !/^assets\//i.test(url)) return url;
  const p = window.location.pathname.replace(/\\/g, '/');
  return p.indexOf('/pages/') !== -1 ? '../' + url : url;
}

function getRotatedWallpaper() {
  let cfg = {};
  try {
    cfg = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
  } catch (e) {
    cfg = {};
  }
  if (!cfg.rotateWallpaper) return null;
  const pool = getWallpaperPool();
  if (pool.length === 0) return null;
  const iv = cfg.rotateInterval || 'tab';
  if (iv === 'tab') return pool[Math.floor(Math.random() * pool.length)];
  const mins = parseInt(iv, 10);
  if (!mins || mins <= 0) return pool[0];
  const slot = Math.floor(Date.now() / (mins * 60000));
  return pool[slot % pool.length];
}

// Fondo nevado por defecto (cuando no hay nada guardado)
const DEFAULT_WALLPAPER = 'assets/Texturas/backgrounds/paisaje-nevado.jpg';

function defaultWallpaper() {
  return DEFAULT_WALLPAPER;
}
