/**
 * Exportación e importación de enlaces de DarkSnowF.
 *
 * Formatos:
 * - TXT: una línea por enlace con forma `Nombre - URL`. Solo lectura,
 *   pensado para compartir o respaldar en texto simple.
 * - JSON: estructura versionada con perfiles, accesos, categorías,
 *   selección y ajustes gráficos. Es el formato reimportable entre equipos.
 *
 * Esquema JSON (v2):
 * {
 *   app: 'darksnowf', version: 2, fecha: ISO,
 *   perfiles: [{ idOriginal, nombre, icono, accesos, categorias,
 *                 categoriaSeleccionada, tema, motor }],
 *   ajustes: { darkSnowFConfig }, fondo: { wallpaper, wallpaperSize, ... }
 * }
 *
 * Modos de importación:
 * - `fusionar`: suma los enlaces sin borrar los existentes.
 * - `reemplazar`: sustituye los enlaces del perfil destino.
 * - `nuevo`: crea un perfil nuevo con el contenido importado.
 *
 * @module DSRespaldo
 */
(function (global) {
  'use strict';

  /** Identificador de aplicación esperado en los JSON válidos. */
  var APP_ID = 'darksnowf';

  /**
   * Normaliza una URL para comparar duplicados.
   * @param {string} url URL original.
   * @returns {string} URL en minúsculas sin barra final.
   */
  function normalizarUrl(url) {
    try {
      var u = String(url || '').trim();
      return u.replace(/\/+$/, '').toLowerCase();
    } catch (err) {
      return '';
    }
  }

  /**
   * Lee el ajuste global de configuración.
   * @returns {Object} Configuración `darkSnowFConfig`.
   */
  function leerAjustes() {
    try {
      return JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}') || {};
    } catch (err) {
      return {};
    }
  }

  /**
   * Obtiene el tema y motor guardados de un perfil.
   * @param {string} perfilId Identificador del perfil.
   * @returns {{tema:string, motor:string}} Tema y motor.
   */
  function temaMotorDe(perfilId) {
    try {
      if (global.DSPf && typeof global.DSPf.get === 'function') {
        var cfg = global.DSPf.get(perfilId);
        return { tema: cfg.theme || 'dark', motor: cfg.engine || 'duckduckgo' };
      }
    } catch (err) {}
    return { tema: 'dark', motor: 'duckduckgo' };
  }

  /**
   * Construye el objeto exportable de un perfil.
   * @param {string} perfilId Identificador del perfil.
   * @param {boolean} incluirAjustes Si se incluyen tema, motor y fondo.
   * @returns {Object|null} Perfil exportable o nulo si no existe.
   */
  function construirPerfil(perfilId, incluirAjustes) {
    var perfiles = [];
    try {
      perfiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    } catch (err) {
      perfiles = [];
    }
    var perfil = (Array.isArray(perfiles) ? perfiles : []).find(function (p) { return p && p.id === perfilId; });
    if (!perfil) return null;
    var atajos = [];
    var categorias = [];
    var seleccion = 'general';
    try {
      atajos = JSON.parse(localStorage.getItem('shortcuts_' + perfilId) || '[]') || [];
    } catch (err) {
      atajos = [];
    }
    try {
      categorias = JSON.parse(localStorage.getItem('shortcutCategories_' + perfilId) || '[]') || [];
    } catch (err) {
      categorias = [];
    }
    try {
      seleccion = localStorage.getItem('selectedCat_' + perfilId) || 'general';
    } catch (err) {
      seleccion = 'general';
    }
    var tm = incluirAjustes ? temaMotorDe(perfilId) : { tema: undefined, motor: undefined };
    return {
      idOriginal: perfilId,
      nombre: perfil.name || perfil.nombre || 'Perfil',
      icono: perfil.icon || perfil.icono || '',
      accesos: (Array.isArray(atajos) ? atajos : []).map(function (a) {
        return {
          nombre: a.name !== undefined ? a.name : (a.nombre || ''),
          url: a.url || '',
          icono: a.icon !== undefined ? a.icon : (a.icono || ''),
          categoria: a.catId || 'general'
        };
      }).filter(function (a) { return typeof a.url === 'string' && a.url.trim(); }),
      categorias: (Array.isArray(categorias) ? categorias : []).map(function (c) {
        return { id: c.id, nombre: c.name !== undefined ? c.name : (c.nombre || c.id) };
      }),
      categoriaSeleccionada: seleccion,
      tema: tm.tema,
      motor: tm.motor
    };
  }

  /**
   * Genera el contenido TXT de uno o varios perfiles.
   * @param {Array<string>} perfilIds Identificadores a incluir.
   * @returns {string} Texto con una línea por enlace.
   */
  function generarTXT(perfilIds) {
    var lineas = [];
    (perfilIds || []).forEach(function (pid) {
      var datos = construirPerfil(pid, false);
      if (!datos) return;
      lineas.push('# Perfil: ' + datos.nombre);
      datos.accesos.forEach(function (a) {
        var nombre = (a.nombre || '').trim() || a.url;
        lineas.push(nombre + ' - ' + a.url);
      });
      lineas.push('');
    });
    return lineas.join('\n');
  }

  /**
   * Genera el objeto JSON exportable.
   * @param {Array<string>} perfilIds Identificadores a incluir.
   * @param {boolean} incluirAjustes Si se adjuntan ajustes y fondo.
   * @returns {Object} Documento listo para descargar.
   */
  function generarJSON(perfilIds, incluirAjustes) {
    var perfiles = (perfilIds || [])
      .map(function (pid) { return construirPerfil(pid, incluirAjustes); })
      .filter(Boolean);
    var fondo = null;
    if (incluirAjustes) {
      try {
        fondo = {
          wallpaper: localStorage.getItem('wallpaper'),
          wallpaperSize: localStorage.getItem('wallpaperSize'),
          wallpaperWidth: localStorage.getItem('wallpaperWidth'),
          wallpaperHeight: localStorage.getItem('wallpaperHeight')
        };
      } catch (err) {
        fondo = null;
      }
    }
    return {
      app: APP_ID,
      version: 2,
      fecha: new Date().toISOString(),
      perfiles: perfiles,
      ajustes: incluirAjustes ? leerAjustes() : undefined,
      fondo: fondo
    };
  }

  /**
   * Descarga un texto como archivo.
   * @param {string} nombre Nombre del archivo.
   * @param {string} contenido Texto a guardar.
   * @param {string} tipo Tipo MIME.
   */
  function descargar(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo || 'text/plain;charset=utf-8' });
    var enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    setTimeout(function () {
      try {
        URL.revokeObjectURL(enlace.href);
        enlace.remove();
      } catch (err) {}
    }, 1000);
  }

  /**
   * Valida y normaliza un JSON importado.
   * Acepta formato v2 propio y el respaldo completo v1 (`{app, v:1, data}`).
   * @param {*} documento JSON parseado.
   * @returns {{valido:boolean, perfiles:Array, motivo:string}} Resultado.
   */
  function validarImportacion(documento) {
    if (!documento || typeof documento !== 'object') {
      return { valido: false, perfiles: [], motivo: 'Documento vacío.' };
    }
    if (documento.app === APP_ID && Array.isArray(documento.perfiles)) {
      var perfiles = documento.perfiles.filter(function (p) {
        return p && Array.isArray(p.accesos);
      });
      if (perfiles.length === 0) return { valido: false, perfiles: [], motivo: 'El JSON no contiene perfiles con accesos.' };
      return { valido: true, perfiles: perfiles, motivo: '' };
    }
    if (documento.app === APP_ID && documento.v === 1 && documento.data && typeof documento.data === 'object') {
      return { valido: true, perfiles: [], motivo: '', legado: documento.data };
    }
    return { valido: false, perfiles: [], motivo: 'Archivo inválido: no es un respaldo de DarkSnowF.' };
  }

  /**
   * Fusiona accesos evitando duplicados por URL.
   * @param {Array} actuales Accesos existentes.
   * @param {Array} nuevos Accesos importados (formato exportación).
   * @returns {Array} Lista combinada en formato interno.
   */
  function fusionarAccesos(actuales, nuevos) {
    var vistos = {};
    (actuales || []).forEach(function (a) {
      if (a && a.url) vistos[normalizarUrl(a.url)] = true;
    });
    var combinados = (actuales || []).slice();
    (nuevos || []).forEach(function (a) {
      var url = String(a.url || '').trim();
      if (!url) return;
      if (vistos[normalizarUrl(url)]) return;
      vistos[normalizarUrl(url)] = true;
      combinados.push({
        id: Date.now() + Math.floor(Math.random() * 1000000),
        name: String(a.nombre || a.name || url),
        url: url,
        icon: typeof a.icono === 'string' && a.icono ? a.icono : (typeof a.icon === 'string' ? a.icon : ''),
        catId: a.categoria || a.catId || 'general'
      });
    });
    return combinados;
  }

  /**
   * Convierte accesos exportados a formato interno.
   * @param {Array} accesos Accesos en formato de exportación.
   * @returns {Array} Accesos en formato interno.
   */
  function aFormatoInterno(accesos) {
    return (accesos || []).map(function (a) {
      var url = String(a.url || '').trim();
      return {
        id: Date.now() + Math.floor(Math.random() * 1000000),
        name: String(a.nombre !== undefined ? a.nombre : (a.name || url)),
        url: url,
        icon: typeof a.icono === 'string' && a.icono ? a.icono : (typeof a.icon === 'string' ? a.icon : ''),
        catId: a.categoria || a.catId || 'general'
      };
    }).filter(function (a) { return a.url; });
  }

  /**
   * Aplica perfiles importados según el modo elegido.
   * @param {Array} perfilesExportados Perfiles validados del JSON.
   * @param {{modo:string, destinoId:string}} opciones Modo (`fusionar`, `reemplazar`, `nuevo`) y perfil destino.
   * @returns {{importados:number, perfilesCreados:number}} Resumen.
   */
  function aplicarImportacion(perfilesExportados, opciones) {
    var modo = (opciones && opciones.modo) || 'fusionar';
    var destinoId = opciones && opciones.destinoId;
    var importados = 0;
    var creados = 0;
    var listaPerfiles = [];
    try {
      listaPerfiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (!Array.isArray(listaPerfiles) || listaPerfiles.length === 0) {
        listaPerfiles = [{ id: 'personal', name: 'Personal' }];
      }
    } catch (err) {
      listaPerfiles = [{ id: 'personal', name: 'Personal' }];
    }

    perfilesExportados.forEach(function (pexp) {
      var destino = null;
      if (modo === 'nuevo' || !destinoId) {
        var nuevoId = 'p' + Date.now() + Math.floor(Math.random() * 1000);
        destino = { id: nuevoId, name: String(pexp.nombre || 'Importado').slice(0, 20), icon: pexp.icono || '' };
        listaPerfiles.push(destino);
        creados += 1;
      } else {
        destino = listaPerfiles.find(function (p) { return p.id === destinoId; });
        if (!destino) return;
      }
      var claveAtajos = 'shortcuts_' + destino.id;
      var claveCats = 'shortcutCategories_' + destino.id;
      var actuales = [];
      try {
        actuales = JSON.parse(localStorage.getItem(claveAtajos) || '[]') || [];
      } catch (err) {
        actuales = [];
      }
      var resultado = (modo === 'reemplazar' && (perfilesExportados.length === 1 || !destinoId || true))
        ? (destinoId && perfilesExportados.length > 1 && modo === 'reemplazar' && !opciones.porPerfil
          ? fusionarAccesos([], pexp.accesos)
          : aFormatoInterno(pexp.accesos))
        : null;
      // `reemplazar` sustituye solo cuando hay un único perfil importado por destino;
      // con varios perfiles cada uno va a su propio destino en modo `nuevo`.
      if (modo === 'reemplazar' && destinoId) {
        resultado = aFormatoInterno(pexp.accesos);
      } else if (modo === 'fusionar' && destinoId) {
        resultado = fusionarAccesos(Array.isArray(actuales) ? actuales : [], pexp.accesos);
      } else if (!destinoId || modo === 'nuevo') {
        resultado = aFormatoInterno(pexp.accesos);
      }
      try {
        localStorage.setItem(claveAtajos, JSON.stringify(resultado || []));
        importados += (pexp.accesos || []).length;
      } catch (err) {}
      // Categorías: se fusionan por identificador.
      try {
        var actualesCats = JSON.parse(localStorage.getItem(claveCats) || '[]') || [];
        var mapa = {};
        (Array.isArray(actualesCats) ? actualesCats : []).forEach(function (c) {
          if (c && c.id) mapa[c.id] = { id: c.id, name: c.name || c.nombre || c.id };
        });
        (pexp.categorias || []).forEach(function (c) {
          if (c && c.id && !mapa[c.id]) mapa[c.id] = { id: c.id, name: (c.nombre || c.name || c.id) };
        });
        var lista = Object.keys(mapa).map(function (k) { return mapa[k]; });
        if (lista.length === 0) lista = [{ id: 'general', name: 'General' }];
        if (!lista.some(function (c) { return c.id === 'general'; })) {
          lista.unshift({ id: 'general', name: 'General' });
        }
        localStorage.setItem(claveCats, JSON.stringify(lista));
        if (pexp.categoriaSeleccionada && lista.some(function (c) { return c.id === pexp.categoriaSeleccionada; })) {
          localStorage.setItem('selectedCat_' + destino.id, pexp.categoriaSeleccionada);
        }
      } catch (err) {}
      // Tema y motor del perfil, si el respaldo los incluye.
      try {
        if ((pexp.tema || pexp.motor) && global.DSPf && typeof global.DSPf.set === 'function') {
          var parche = {};
          if (pexp.tema) parche.theme = pexp.tema;
          if (pexp.motor) parche.engine = pexp.motor;
          global.DSPf.set(destino.id, parche);
        }
      } catch (err) {}
    });

    try {
      localStorage.setItem('profiles', JSON.stringify(listaPerfiles));
    } catch (err) {}
    return { importados: importados, perfilesCreados: creados };
  }

  global.DSRespaldo = {
    generarTXT: generarTXT,
    generarJSON: generarJSON,
    descargar: descargar,
    validarImportacion: validarImportacion,
    aplicarImportacion: aplicarImportacion,
    construirPerfil: construirPerfil
  };
})(window);
