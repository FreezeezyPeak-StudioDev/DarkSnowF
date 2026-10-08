/**
 * Almacenamiento seguro de DarkSnowF.
 *
 * Centraliza la lectura y escritura en `localStorage` con validación,
 * valores por defecto y control de cuota. Todo el guardado de perfiles,
 * accesos rápidos, categorías y ajustes pasa por estas utilidades para
 * garantizar que ningún cambio se pierda por un error de serialización
 * o por falta de espacio.
 *
 * Claves utilizadas:
 * - `profiles`, `activeProfile`, `startupProfile`
 * - `shortcuts_<perfil>`, `shortcutCategories_<perfil>`, `selectedCat_<perfil>`
 * - `darkSnowFConfig`, `ds_profile_cfg`
 * - `wallpaper`, `wallpaperSize`, `wallpaperWidth`, `wallpaperHeight`, `wallpaperPool`
 *
 * @module DSAlmacen
 */
(function (global) {
  'use strict';

  /** Prefijo de claves por perfil. */
  var PREFIJO_ATAJOS = 'shortcuts_';
  var PREFIJO_CATEGORIAS = 'shortcutCategories_';
  var PREFIJO_SELECCION = 'selectedCat_';

  /**
   * Lee un valor JSON del almacenamiento.
   * @param {string} clave Clave de `localStorage`.
   * @param {*} defecto Valor devuelto si no existe o está corrupto.
   * @returns {*} Valor parseado o el defecto.
   */
  function leerJSON(clave, defecto) {
    try {
      var crudo = localStorage.getItem(clave);
      if (crudo === null || crudo === undefined) return defecto;
      return JSON.parse(crudo);
    } catch (err) {
      return defecto;
    }
  }

  /**
   * Lee un texto plano del almacenamiento.
   * @param {string} clave Clave de `localStorage`.
   * @param {string} defecto Valor por defecto.
   * @returns {string} Texto guardado o el defecto.
   */
  function leerTexto(clave, defecto) {
    try {
      var valor = localStorage.getItem(clave);
      return valor === null || valor === undefined ? defecto : valor;
    } catch (err) {
      return defecto;
    }
  }

  /**
   * Avisa al modulo de persistencia para espejar a `chrome.storage.local`.
   */
  function avisarEspejo() {
    try {
      if (typeof window !== 'undefined' && window.DSPersistencia && window.DSPersistencia.espejarPronto) {
        window.DSPersistencia.espejarPronto();
      }
    } catch (e) {}
  }

  /**
   * Guarda un valor en el almacenamiento verificando la escritura.
   * Relee la clave para confirmar que el dato quedó persistido.
   * @param {string} clave Clave de `localStorage`.
   * @param {string} valorTexto Valor ya serializado a texto.
   * @returns {boolean} Verdadero si la escritura se verificó.
   */
  function guardarTextoVerificado(clave, valorTexto) {
    try {
      localStorage.setItem(clave, valorTexto);
    } catch (err) {
      return false;
    }
    try {
      var ok = localStorage.getItem(clave) === valorTexto;
      if (ok) avisarEspejo();
      return ok;
    } catch (err) {
      return false;
    }
  }

  /**
   * Guarda un objeto como JSON con verificación.
   * @param {string} clave Clave de `localStorage`.
   * @param {*} valor Objeto serializable.
   * @returns {boolean} Verdadero si se guardó y verificó.
   */
  function guardarJSON(clave, valor) {
    var texto;
    try {
      texto = JSON.stringify(valor);
    } catch (err) {
      return false;
    }
    return guardarTextoVerificado(clave, texto);
  }

  /**
   * Indica si un error es por falta de cuota.
   * @param {*} err Error capturado.
   * @returns {boolean} Verdadero si es `QuotaExceededError`.
   */
  function esErrorCuota(err) {
    if (!err) return false;
    var nombre = err.name || '';
    var codigo = err.code;
    return nombre === 'QuotaExceededError' || nombre === 'NS_ERROR_DOM_QUOTA_REACHED' || codigo === 22;
  }

  /**
   * Obtiene la lista de perfiles con estructura garantizada.
   * Cada perfil tiene forma `{ id, nombre, icono }`.
   * @returns {Array<{id:string, nombre:string, icono:string}>} Perfiles normalizados.
   */
  function obtenerPerfiles() {
    var lista = leerJSON('profiles', null);
    if (!Array.isArray(lista) || lista.length === 0) {
      return [{ id: 'personal', nombre: 'Personal', icono: '' }];
    }
    return lista.map(function (p) {
      return {
        id: String(p && p.id ? p.id : 'personal'),
        nombre: String(p && p.name !== undefined ? p.name : p.nombre !== undefined ? p.nombre : 'Personal').slice(0, 20),
        icono: typeof (p && (p.icon || p.icono)) === 'string' ? (p.icon || p.icono) : ''
      };
    });
  }

  /**
   * Guarda la lista de perfiles.
   * @param {Array} perfiles Lista de perfiles.
   * @returns {boolean} Verdadero si se verificó el guardado.
   */
  function guardarPerfiles(perfiles) {
    var normalizados = (Array.isArray(perfiles) ? perfiles : []).map(function (p) {
      return {
        id: String(p.id),
        name: String(p.nombre !== undefined ? p.nombre : p.name !== undefined ? p.name : 'Perfil').slice(0, 20),
        icon: typeof (p.icono !== undefined ? p.icono : p.icon) === 'string' ? (p.icono !== undefined ? p.icono : p.icon) : ''
      };
    });
    // Se conservan las claves `name` e `icon` por compatibilidad con el resto del código.
    return guardarJSON('profiles', normalizados);
  }

  /**
   * Obtiene los accesos rápidos de un perfil.
   * @param {string} perfilId Identificador del perfil.
   * @returns {Array} Lista de accesos normalizados.
   */
  function obtenerAtajos(perfilId) {
    var lista = leerJSON(PREFIJO_ATAJOS + perfilId, null);
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (a) {
      return a && typeof a.url === 'string';
    }).map(function (a) {
      return {
        id: typeof a.id === 'number' ? a.id : Date.now() + Math.floor(Math.random() * 100000),
        name: String(a.name !== undefined ? a.name : a.nombre !== undefined ? a.nombre : ''),
        url: String(a.url),
        icon: typeof a.icon === 'string' ? a.icon : (typeof a.icono === 'string' ? a.icono : ''),
        catId: typeof a.catId === 'string' ? a.catId : 'general'
      };
    });
  }

  /**
   * Guarda los accesos rápidos de un perfil con verificación.
   * @param {string} perfilId Identificador del perfil.
   * @param {Array} atajos Lista de accesos.
   * @returns {boolean} Verdadero si se verificó el guardado.
   */
  function guardarAtajos(perfilId, atajos) {
    return guardarJSON(PREFIJO_ATAJOS + perfilId, Array.isArray(atajos) ? atajos : []);
  }

  /**
   * Obtiene las categorías de un perfil.
   * @param {string} perfilId Identificador del perfil.
   * @param {string} nombreGeneral Nombre localizado para la categoría base.
   * @returns {Array<{id:string, name:string, icon:string}>} Categorías garantizadas.
   */
  /** Iconos aleatorios para categorías nuevas (incluida la primera). */
  var ICONOS_CATEGORIA = ['📁','⭐','🎮','🎨','💼','📚','🎵','🎬','💻','🌐','⚽','🛠️','💡','📷','🍔','✈️','🎓','💰','❤️','🐱','🚗','🏠','🌙','☀️','❄️','🔥','🌊','🍕','🎧','📝','🎯','🧩','🚀','🎭','🏆','🌈'];
  function iconoCategoriaAlAzar() {
    try {
      return ICONOS_CATEGORIA[Math.floor(Math.random() * ICONOS_CATEGORIA.length)];
    } catch (err) {
      return '📁';
    }
  }

  function obtenerCategorias(perfilId, nombreGeneral) {
    var lista = leerJSON(PREFIJO_CATEGORIAS + perfilId, null);
    var base = nombreGeneral || 'General';
    if (!Array.isArray(lista) || lista.length === 0) {
      var inicial = [{ id: 'general', name: base, icon: iconoCategoriaAlAzar() }];
       guardarJSON(PREFIJO_CATEGORIAS + perfilId, inicial);
       return inicial;
     }
    var normalizadas = lista.filter(function (c) {
      return c && typeof c.id === 'string';
    }).map(function (c) {
      return {
        id: c.id,
        name: String(c.name !== undefined ? c.name : c.nombre !== undefined ? c.nombre : base).slice(0, 24),
        icon: typeof (c.icon !== undefined ? c.icon : c.icono) === 'string' ? (c.icon !== undefined ? c.icon : c.icono) : ''
      };
    });
    if (!normalizadas.some(function (c) { return c.id === 'general'; })) {
      normalizadas.unshift({ id: 'general', name: base, icon: iconoCategoriaAlAzar() });
    }
    return normalizadas;
  }

  /**
   * Verifica la integridad del guardado de un perfil.
   * Comprueba que perfiles, accesos, categorías y selección existan y sean legibles.
   * @param {string} perfilId Identificador del perfil a verificar.
   * @returns {{correcto:boolean, detalles:Object}} Resultado de la verificación.
   */
  function verificarPerfil(perfilId) {
    var detalles = {
      perfiles: false,
      atajos: false,
      categorias: false,
      seleccion: false
    };
    try {
      var perfiles = obtenerPerfiles();
      detalles.perfiles = perfiles.some(function (p) { return p.id === perfilId; });
      var atajos = leerJSON(PREFIJO_ATAJOS + perfilId, null);
      detalles.atajos = Array.isArray(atajos);
      var cats = leerJSON(PREFIJO_CATEGORIAS + perfilId, null);
      detalles.categorias = Array.isArray(cats);
      var sel = leerTexto(PREFIJO_SELECCION + perfilId, '');
      detalles.seleccion = true;
      if (!sel && Array.isArray(cats) && cats.length > 0) {
        guardarTextoVerificado(PREFIJO_SELECCION + perfilId, cats[0].id);
      }
    } catch (err) {
      return { correcto: false, detalles: detalles };
    }
    var correcto = detalles.perfiles && detalles.atajos && detalles.categorias && detalles.seleccion;
    return { correcto: correcto, detalles: detalles };
  }

  global.DSAlmacen = {
    leerJSON: leerJSON,
    leerTexto: leerTexto,
    guardarJSON: guardarJSON,
    guardarTexto: guardarTextoVerificado,
    esErrorCuota: esErrorCuota,
    obtenerPerfiles: obtenerPerfiles,
    guardarPerfiles: guardarPerfiles,
    obtenerAtajos: obtenerAtajos,
    guardarAtajos: guardarAtajos,
    obtenerCategorias: obtenerCategorias,
    verificarPerfil: verificarPerfil,
    claves: {
      atajosDe: function (perfilId) { return PREFIJO_ATAJOS + perfilId; },
      categoriasDe: function (perfilId) { return PREFIJO_CATEGORIAS + perfilId; },
      seleccionDe: function (perfilId) { return PREFIJO_SELECCION + perfilId; }
    }
  };
})(window);
