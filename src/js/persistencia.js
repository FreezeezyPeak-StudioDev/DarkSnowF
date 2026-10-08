/**
 * Persistencia reforzada de DarkSnowF.
 *
 * Limite honesto del navegador: Firefox elimina `localStorage` y
 * `chrome.storage.local` al desinstalar la extension. Ningun codigo
 * puede impedir ese borrado. Este modulo reduce al maximo la perdida:
 * - Espejo automatico de las claves criticas en `chrome.storage.local`
 *   cuando esta disponible (sobrevive a actualizaciones y reinicios).
 * - Restauracion automatica desde el espejo si el `localStorage` amanece
 *   vacio tras una actualizacion.
 * - Respaldo JSON manual (Ajustes > Guardar) como unica via que sobrevive
 *   a una desinstalacion: el archivo vive fuera del navegador.
 *
 * Instalacion temporal (`about:debugging`): nunca persiste ni se actualiza
 * sola. Para persistencia y actualizacion automatica instalar el XPI firmado
 * desde AMO con `about:addons > Actualizar automaticamente = Activado`.
 *
 * @module DSPersistencia
 */
(function (global) {
  'use strict';

  /** Claves base que siempre se espejan. */
  var CLAVES_BASE = [
    'darkSnowFConfig', 'wallpaper', 'wallpaperSize', 'wallpaperWidth',
    'wallpaperHeight', 'wallpaperPool', 'wallpaperAnimated',
    'profiles', 'activeProfile', 'startupProfile', 'profilesMigrated',
    'preferredSearchEngine', 'ds_profile_cfg', 'ds_build', 'ds_onboarded'
  ];

  /**
   * Indica si `chrome.storage.local` esta disponible.
   * @returns {boolean} Verdadero si se puede usar el espejo.
   */
  function hayEspejo() {
    try {
      return !!(global.chrome && chrome.storage && chrome.storage.local);
    } catch (e) {
      return false;
    }
  }

  /**
   * Recoge todas las claves criticas actuales (base + dinamicas por perfil).
   * @returns {Object} Mapa clave -> valor texto.
   */
  function recogerCriticas() {
    var datos = {};
    var dinamicas = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('shortcuts_') === 0 || k.indexOf('shortcutCategories_') === 0 || k.indexOf('selectedCat_') === 0)) {
          dinamicas.push(k);
        }
      }
    } catch (e) {}
    CLAVES_BASE.concat(dinamicas).forEach(function (k) {
      try {
        var v = localStorage.getItem(k);
        if (v !== null) datos[k] = v;
      } catch (e) {}
    });
    return datos;
  }

  var temporizador = 0;

  /**
   * Espeja las claves criticas a `chrome.storage.local` (debounced).
   * Nunca borra el `localStorage`; solo crea una segunda copia.
   */
  function espejarPronto() {
    try {
      clearTimeout(temporizador);
    } catch (e) {}
    temporizador = setTimeout(function () {
      if (!hayEspejo()) return;
      try {
        var datos = recogerCriticas();
        datos.ds_mirror_ts = String(Date.now());
        chrome.storage.local.set(datos, function () {
          try {
            if (chrome.runtime && chrome.runtime.lastError) return;
          } catch (e2) {}
        });
      } catch (e) {}
    }, 800);
  }

  /**
   * Restaura desde el espejo cuando el `localStorage` esta vacio.
   * Solo rellena claves ausentes; jamas sobrescribe datos existentes.
   * @param {function(boolean)} done Callback con verdadero si restauro algo.
   */
  function restaurarDesdeEspejo(done) {
    var fin = function (v) { try { if (typeof done === 'function') done(v); } catch (e) {} };
    if (!hayEspejo()) { fin(false); return; }
    var hayDatos = false;
    try {
      hayDatos = !!localStorage.getItem('profiles') || !!localStorage.getItem('shortcuts_personal');
    } catch (e) {}
    if (hayDatos) { fin(false); return; }
    try {
      chrome.storage.local.get(null, function (items) {
        try {
          if (chrome.runtime && chrome.runtime.lastError) { fin(false); return; }
          if (!items || typeof items !== 'object') { fin(false); return; }
          var restauro = false;
          Object.keys(items).forEach(function (k) {
            if (k === 'ds_mirror_ts') return;
            try {
              if (localStorage.getItem(k) === null && typeof items[k] === 'string') {
                localStorage.setItem(k, items[k]);
                restauro = true;
              }
            } catch (e) {}
          });
          fin(restauro);
        } catch (e) {
          fin(false);
        }
      });
    } catch (e) {
      fin(false);
    }
  }

  // Espejo inicial diferido + restauracion al arrancar.
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        restaurarDesdeEspejo(function () { espejarPronto(); });
      });
    } else {
      restaurarDesdeEspejo(function () { espejarPronto(); });
    }
  } catch (e) {}

  // Re-espejar ante cambios entre contextos (otra pestana guardo algo).
  try {
    window.addEventListener('storage', function () { espejarPronto(); });
  } catch (e) {}

  global.DSPersistencia = {
    espejarPronto: espejarPronto,
    restaurarDesdeEspejo: restaurarDesdeEspejo,
    hayEspejo: hayEspejo
  };
})(window);
