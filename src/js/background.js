/**
 * background.js - Service Worker (MV3)
 * Abre DarkSnowF al hacer clic en el icono y en la instalación.
 */

// Clic en el icono de la toolbar -> abrir DarkSnowF en nueva pestaña
chrome.action.onClicked.addListener(async () => {
  await chrome.tabs.create({ url: chrome.runtime.getURL('Index.html') });
});

// Al instalar -> abrir página de inicio personalizada una vez
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.tabs.create({ url: chrome.runtime.getURL('Index.html') });
  }
});
