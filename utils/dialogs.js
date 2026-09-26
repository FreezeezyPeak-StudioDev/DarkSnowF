/**
 * dialogs.js - Sistema de diálogos personalizados
 * Reemplaza confirm() y prompt() con modales HTML
 */

const DSDialogs = {
  /**
   * Mostrar un diálogo de confirmación
   * @param {string} message - Mensaje a mostrar
   * @param {object} options - Opciones: title, confirmText, cancelText, isDanger
   * @returns {Promise<boolean>} - true si confirma, false si cancela
   */
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmar',
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        isDanger = false
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'ds-confirm-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'ds-confirm-modal';
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'ds-confirm-title';
      titleEl.textContent = title;
      
      const messageEl = document.createElement('p');
      messageEl.className = 'ds-confirm-message';
      messageEl.textContent = message;
      
      const actions = document.createElement('div');
      actions.className = 'ds-confirm-actions';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'ds-confirm-btn secondary';
      cancelBtn.textContent = cancelText;
      cancelBtn.type = 'button';
      
      const confirmBtn = document.createElement('button');
      confirmBtn.className = `ds-confirm-btn ${isDanger ? 'danger' : 'primary'}`;
      confirmBtn.textContent = confirmText;
      confirmBtn.type = 'button';
      
      const cleanup = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
      };
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      confirmBtn.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(false);
        }
      });
      
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
          document.removeEventListener('keydown', escHandler);
        }
      });
      
      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      modal.appendChild(titleEl);
      modal.appendChild(messageEl);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        confirmBtn.focus();
      });
    });
  },

  /**
   * Mostrar un diálogo de entrada de texto
   * @param {string} message - Mensaje a mostrar
   * @param {object} options - Opciones: title, defaultValue, placeholder, confirmText, cancelText
   * @returns {Promise<string|null>} - valor ingresado o null si cancela
   */
  prompt(message, options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Entrada',
        defaultValue = '',
        placeholder = '',
        confirmText = 'Aceptar',
        cancelText = 'Cancelar'
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'ds-confirm-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'ds-confirm-modal';
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'ds-confirm-title';
      titleEl.textContent = title;
      
      const messageEl = document.createElement('p');
      messageEl.className = 'ds-confirm-message';
      messageEl.textContent = message;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ds-confirm-input';
      input.value = defaultValue;
      input.placeholder = placeholder;
      
      const actions = document.createElement('div');
      actions.className = 'ds-confirm-actions';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'ds-confirm-btn secondary';
      cancelBtn.textContent = cancelText;
      cancelBtn.type = 'button';
      
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'ds-confirm-btn primary';
      confirmBtn.textContent = confirmText;
      confirmBtn.type = 'button';
      
      const cleanup = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
      };
      
      const submit = () => {
        const value = input.value.trim();
        cleanup();
        resolve(value || null);
      };
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
      
      confirmBtn.addEventListener('click', submit);
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      });
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(null);
        }
      });
      
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          cleanup();
          resolve(null);
          document.removeEventListener('keydown', escHandler);
        }
      });
      
      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      modal.appendChild(titleEl);
      modal.appendChild(messageEl);
      modal.appendChild(input);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        input.focus();
        input.select();
      });
    });
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.DSDialogs = DSDialogs;
}
