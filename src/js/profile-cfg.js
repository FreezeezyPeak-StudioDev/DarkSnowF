/**
 * Ajustes por perfil de DarkSnowF (tema y motor de búsqueda).
 *
 * Cada perfil conserva su tema y motor en `ds_profile_cfg`. La primera
 * ejecución migra los valores globales previos al perfil activo para
 * no perder la configuración existente.
 *
 * @module PerfilConfig
 */
(function profileCfg() {
  const KEY = 'ds_profile_cfg';
  const DONE = 'ds_pfcfg_migrated';
  const DEFAULTS = { theme: 'dark', engine: 'duckduckgo' };

  const readAll = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) {
      return {};
    }
  };
  const writeAll = (all) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {}
  };

  const activeId = () => {
    try {
      const id = localStorage.getItem('activeProfile');
      if (id) return id;
      const p = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (Array.isArray(p) && p.length) return p[0].id;
    } catch (e) {}
    return 'personal';
  };

  const migrateOnce = () => {
    try {
      if (localStorage.getItem(DONE) === '1') return;
      const all = readAll();
      const pid = activeId();
      if (!all[pid]) {
        const patch = {};
        try {
          const g = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
          if (g.theme) patch.theme = g.theme;
        } catch (e) {}
        try {
          const e = localStorage.getItem('preferredSearchEngine');
          if (e) patch.engine = e;
        } catch (e2) {}
        if (patch.theme || patch.engine) {
          all[pid] = patch;
          writeAll(all);
        }
      }
      localStorage.setItem(DONE, '1');
    } catch (e) {}
  };
  migrateOnce();

  const legacy = (k, gk) => {
    try {
      if (k === 'theme') {
        const g = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        if (g.theme) return g.theme;
      } else {
        const e = localStorage.getItem('preferredSearchEngine');
        if (e) return e;
      }
    } catch (e) {}
    return DEFAULTS[k];
  };

  // Idioma del equipo (la extensión solo habla ES/EN).
  window.dsSysLang = function dsSysLang() {
    try {
      const nav = String(navigator.language || navigator.userLanguage || '').toLowerCase();
      if (!nav) return 'es';
      if (nav.indexOf('es') === 0) return 'es';
      return 'en';
    } catch (e) {
      return 'es';
    }
  };

  window.DSPf = {    defaults: DEFAULTS,
    activeId,
    get(pid) {
      const id = pid || activeId();
      const all = readAll();
      const own = (all[id] && typeof all[id] === 'object') ? all[id] : {};
      return {
        theme: own.theme || legacy('theme'),
        engine: own.engine || legacy('engine')
      };
    },
    set(pid, patch) {
      const id = pid || activeId();
      const all = readAll();
      const cur = (all[id] && typeof all[id] === 'object') ? all[id] : {};
      all[id] = Object.assign({}, cur, patch || {});
      writeAll(all);
      // Espejo global para compatibilidad con lecturas viejas.
      try {
        if (patch && patch.theme) {
          const g = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
          g.theme = patch.theme;
          localStorage.setItem('darkSnowFConfig', JSON.stringify(g));
        }
        if (patch && patch.engine) {
          localStorage.setItem('preferredSearchEngine', patch.engine);
        }
      } catch (e) {}
    }
  };
})();
