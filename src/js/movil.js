/**
 * Adaptación móvil de DarkSnowF.
 *
 * Detecta teléfono o tableta por agente de usuario, puntero grueso y
 * pantalla pequeña. Añade la clase `ds-movil` a `<html>` para activar
 * los ajustes táctiles (objetivos grandes, rejilla compacta, modales a
 * pantalla completa) y corrige el arrastre en pantallas sin ratón.
 *
 * @module DSMovil
 */
(function (global) {
  'use strict';

  /**
   * Indica si el dispositivo actual es móvil.
   * Combina agente de usuario, tacto y tamaño para evitar falsos positivos.
   * @returns {boolean} Verdadero en móvil o tableta.
   */
  function esMovil() {
    try {
      var ua = String(navigator.userAgent || '');
      if (/Android|iPhone|iPad|iPod|Mobile|Fennec|Firefox.*Mobile/i.test(ua)) return true;
    } catch (e) {}
    try {
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && Math.min(screen.width || 9999, screen.height || 9999) < 820) return true;
    } catch (e) {}
    try {
      if (global.matchMedia && matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 820) return true;
    } catch (e) {}
    return false;
  }

  /**
   * Aplica la clase móvil y ajustes iniciales.
   * @returns {boolean} Verdadero si se activó el modo móvil.
   */
  function aplicar() {
    var movil = esMovil();
    try {
      document.documentElement.classList.toggle('ds-movil', movil);
      document.documentElement.classList.toggle('ds-pc', !movil);
    } catch (e) {}
    try {
      if (movil) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', '#070b12');
      }
    } catch (e) {}
    return movil;
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', aplicar);
    } else {
      aplicar();
    }
  } catch (e) {}
  try {
    window.addEventListener('resize', function () {
      try {
        clearTimeout(window.__dsMovilT);
      } catch (e) {}
      window.__dsMovilT = setTimeout(aplicar, 250);
    });
  } catch (e) {}

  global.DSMovil = { esMovil: esMovil, aplicar: aplicar };
})(window);
