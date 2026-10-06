/**
 * Gestión de iconos personalizados de DarkSnowF.
 *
 * Permite que cada acceso rápido y cada perfil utilice un icono propio
 * mediante URL o archivo local, con opción de restablecer al favicon
 * automático de Google S2. Los archivos se redimensionan a 128 px y se
 * comprimen para no superar la cuota de `localStorage`.
 *
 * @module DSIconos
 */
(function (global) {
  'use strict';

  /** Tamaño máximo del icono procesado, en píxeles. */
  var TAMANO_MAXIMO = 128;

  /** Calidad JPEG aplicada al comprimir archivos locales. */
  var CALIDAD_JPEG = 0.82;

  /** Icono genérico cuando no se puede resolver ninguno. */
  var ICONO_VACIO = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%2270%22 font-size=%2270%22%3EW%3C/text%3E%3C/svg%3E';

  /**
   * Genera la URL del favicon automático para un sitio.
   * Utiliza el servicio Google S2 a partir del dominio.
   * @param {string} url URL del sitio.
   * @returns {string} URL del favicon o icono genérico.
   */
  function faviconAutomatico(url) {
    try {
      var dominio = new URL(url).hostname;
      if (!dominio) return ICONO_VACIO;
      return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(dominio) + '&sz=64';
    } catch (err) {
      return ICONO_VACIO;
    }
  }

  /**
   * Comprueba si una cadena es una URL de icono aceptable.
   * Acepta `http(s)`, `data:image`, `blob:` y rutas `assets/`.
   * @param {string} valor Texto a validar.
   * @returns {boolean} Verdadero si puede usarse como icono.
   */
  function esUrlIconoValida(valor) {
    if (typeof valor !== 'string') return false;
    var texto = valor.trim();
    if (!texto) return false;
    return /^(https?:|data:image\/|blob:|assets\/)/i.test(texto);
  }

  /**
   * Lee un archivo de imagen y lo devuelve como `dataURL` optimizada.
   * Redimensiona a un máximo de 128 px manteniendo la proporción.
   * @param {File} archivo Archivo de imagen seleccionado.
   * @returns {Promise<string>} `dataURL` lista para guardar.
   */
  function archivoADataUrl(archivo) {
    return new Promise(function (resolve, reject) {
      if (!archivo || typeof archivo.type !== 'string' || archivo.type.indexOf('image/') !== 0) {
        reject(new Error('El archivo no es una imagen válida.'));
        return;
      }
      if (archivo.size > 4 * 1024 * 1024) {
        reject(new Error('La imagen supera los 4 MB permitidos.'));
        return;
      }
      var lector = new FileReader();
      lector.onload = function () {
        var img = new Image();
        img.onload = function () {
          try {
            var escala = Math.min(1, TAMANO_MAXIMO / Math.max(img.width || 1, img.height || 1));
            var ancho = Math.max(1, Math.round((img.width || TAMANO_MAXIMO) * escala));
            var alto = Math.max(1, Math.round((img.height || TAMANO_MAXIMO) * escala));
            var lienzo = document.createElement('canvas');
            lienzo.width = ancho;
            lienzo.height = alto;
            var ctx = lienzo.getContext('2d');
            ctx.clearRect(0, 0, ancho, alto);
            ctx.drawImage(img, 0, 0, ancho, alto);
            var salida = lienzo.toDataURL('image/png');
            // Si el PNG supera 200 KB se reintenta en JPEG.
            if (salida.length > 200 * 1024) {
              salida = lienzo.toDataURL('image/jpeg', CALIDAD_JPEG);
            }
            resolve(salida);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = function () {
          reject(new Error('No se pudo leer la imagen.'));
        };
        img.src = lector.result;
      };
      lector.onerror = function () {
        reject(new Error('No se pudo leer el archivo.'));
      };
      lector.readAsDataURL(archivo);
    });
  }

  /**
   * Resuelve el icono efectivo de un acceso.
   * Prioridad: personalizado válido, automático por URL, genérico.
   * @param {string} iconoPersonalizado Icono guardado por el usuario.
   * @param {string} urlSitio URL del sitio del acceso.
   * @returns {string} Icono a mostrar.
   */
  function resolverIconoAcceso(iconoPersonalizado, urlSitio) {
    if (esUrlIconoValida(iconoPersonalizado)) return iconoPersonalizado.trim();
    if (typeof urlSitio === 'string' && urlSitio.trim()) return faviconAutomatico(urlSitio.trim());
    return ICONO_VACIO;
  }

  /**
   * Resuelve el avatar efectivo de un perfil.
   * @param {string} iconoPersonalizado Icono guardado del perfil.
   * @param {string} alternativo Ruta del icono por defecto.
   * @returns {string} Avatar a mostrar.
   */
  function resolverAvatarPerfil(iconoPersonalizado, alternativo) {
    if (esUrlIconoValida(iconoPersonalizado)) return iconoPersonalizado.trim();
    return alternativo || '../assets/Texturas/UI/Usuario.svg';
  }

  global.DSIconos = {
    faviconAutomatico: faviconAutomatico,
    esUrlIconoValida: esUrlIconoValida,
    archivoADataUrl: archivoADataUrl,
    resolverIconoAcceso: resolverIconoAcceso,
    resolverAvatarPerfil: resolverAvatarPerfil,
    ICONO_VACIO: ICONO_VACIO,
    TAMANO_MAXIMO: TAMANO_MAXIMO
  };
})(window);
