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

      let settled = false;
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          done(null);
        }
      };
      
      const cleanup = () => {
        try { document.removeEventListener('keydown', escHandler, true); } catch (e) {}
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
      };

      const done = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      
      cancelBtn.addEventListener('click', () => {
        done(false);
      });
      
      confirmBtn.addEventListener('click', () => {
        done(true);
      });
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          done(null);
        }
      });
      
      document.addEventListener('keydown', escHandler, true);
      
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
        cancelText = 'Cancelar',
        allowUpload = false,
        uploadText = 'Subir imagen',
        emojiPool = []
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

      let settled = false;
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          done(null);
        }
      };
      
      const cleanup = () => {
        try { document.removeEventListener('keydown', escHandler, true); } catch (e) {}
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
      };

      const done = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      
      // Aceptar devuelve el texto tal cual ("" = vacío).
      // Solo Cancelar / ESC / clic fuera devuelven null.
      const submit = () => {
        done(input.value.trim());
      };

      const readFileAsDataUrl = (archivo) => {
        return new Promise((res, rej) => {
          try {
            if (typeof DSIconos !== 'undefined' && DSIconos.archivoADataUrl) {
              DSIconos.archivoADataUrl(archivo).then(res, rej);
              return;
            }
          } catch (e) {}
          const lector = new FileReader();
          lector.onload = () => res(lector.result);
          lector.onerror = () => rej(new Error('No se pudo leer.'));
          lector.readAsDataURL(archivo);
        });
      };
      
      cancelBtn.addEventListener('click', () => {
        done(null);
      });
      
      confirmBtn.addEventListener('click', submit);
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
        if (e.key === 'Escape') {
          e.stopPropagation();
        }
      });
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          done(null);
        }
      });
      
      document.addEventListener('keydown', escHandler, true);

      modal.appendChild(titleEl);
      modal.appendChild(messageEl);
      actions.appendChild(cancelBtn);
      let uploadBtn = null;
      let fileInput = null;
      if (allowUpload) {
        uploadBtn = document.createElement('button');
        uploadBtn.className = 'ds-confirm-btn secondary';
        uploadBtn.textContent = uploadText;
        uploadBtn.type = 'button';
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async () => {
          const archivo = fileInput.files && fileInput.files[0];
          if (!archivo) return;
          uploadBtn.disabled = true;
          uploadBtn.textContent = 'Cargando...';
          try {
            const dataUrl = await readFileAsDataUrl(archivo);
            done(dataUrl);
          } catch (err) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = uploadText;
            input.placeholder = (err && err.message) ? err.message : 'Imagen no válida';
          }
        });
      }
      modal.appendChild(input);
      if (fileInput) modal.appendChild(fileInput);
      // Mini-menú selector de emojis (clic = rellenar el campo)
      if (Array.isArray(emojiPool) && emojiPool.length > 0) {
        const pickLabel = document.createElement('p');
        pickLabel.className = 'ds-emoji-label';
        pickLabel.textContent = '😊 Elige un emoji:';
        const grid = document.createElement('div');
        grid.className = 'ds-emoji-grid';
        emojiPool.forEach((em) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'ds-emoji-btn';
          b.textContent = em;
          b.title = em;
          b.addEventListener('click', () => {
            input.value = em;
            input.focus();
          });
          grid.appendChild(b);
        });
        modal.appendChild(pickLabel);
        modal.appendChild(grid);
      }
      modal.appendChild(actions);
      if (uploadBtn) actions.appendChild(uploadBtn);
      actions.appendChild(confirmBtn);
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
