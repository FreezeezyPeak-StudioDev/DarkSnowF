/**
 * Servicio de fondo de DarkSnowF (Firefox MV3 con `background.scripts`).
 *
 * - La actualizacion automatica la gestiona Firefox/AMO (cada ~24 h si en
 *   `about:addons` esta activada). El codigo no puede forzarla; solo puede
 *   reaccionar cuando ya ocurrio y pedir recarga si el navegador la ofrece.
 * - Jamas borra datos de usuario al instalar o actualizar; la desinstalacion
 *   si la ordena el navegador y solo sobrevive el respaldo JSON manual.
 *
 * @module Fondo
 */

// Clic en el icono solo si no hay popup (con popup el navegador lo abre solo).
try {
  if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener(async () => {
      try {
        await chrome.tabs.create({ url: chrome.runtime.getURL('Index.html') });
      } catch (e) {}
    });
  }
} catch (e) {}

// Instalacion y actualizacion: abrir inicio una vez y marcar version.
try {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(async (details) => {
      try {
        if (details && (details.reason === 'install' || details.reason === 'update')) {
          await chrome.tabs.create({ url: chrome.runtime.getURL('Index.html') });
        }
      } catch (e) {}
    });
  }
} catch (e) {}

// Actualizacion lista (Chrome): recargar para aplicarla cuanto antes.
try {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onUpdateAvailable) {
    chrome.runtime.onUpdateAvailable.addListener(() => {
      try {
        chrome.runtime.reload();
      } catch (e) {}
    });
  }
} catch (e) {}
