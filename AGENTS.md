# Instrucciones del proyecto

## Versión actual

- Extensión: **DarkSnowF 1.1.3**
- ID: `darksnowf@freezeezy.peak`
- Paquete: `versions/DarkSnowF-V1.1.3.xpi`
- Fecha de compilación: 30/10/2026

## Al finalizar cada cambio

Incluir siempre al final 3 bloques separados, en texto plano y listos para copiar en un cuadro de texto. Presentar cada bloque dentro de su propio bloque de código.

1. **Título del commit**: una sola línea en español, de 50 caracteres o menos. Debe resumir el cambio principal.
2. **Descripción del commit**: una sola línea en español, de 50 caracteres o menos. Debe resumir el alcance del cambio.
3. **Actualización**: lista de lo que se hizo y se agregó, no una lista de instrucciones para el usuario. Redactar en pasado y usar categorías profesionales cuando apliquen:
   - Implementación: funcionalidades o archivos nuevos.
   - Corrección: errores solucionados.
   - Limpieza: archivos, recursos o código eliminado.
   - Documentación: README, comentarios o configuración.
   - Verificación: compilación, pruebas o ejecutable probado.
   - Respaldo: cambios relacionados con la subida a GitHub.
   - Exclusión: archivos que no se subieron.

Mencionar solo cambios reales y verificables. La sección **Actualización** no debe contener instrucciones de subida, Supabase, `Ctrl+F5` ni SQL; esas indicaciones van en la respuesta normal o en la sección de publicación.

## Compilación

- Generar el XPI desde la raíz del proyecto (`DarkSnowF/`).
- Incluir `manifest.json`, `Index.html`, `popup.html`, `pages/`, `src/`, `themes/`, `utils/` y `assets/`.
- Excluir `versions/`, `.vscode/`, `AGENTS.md`, `README.md` y archivos `.rar`/`.zip`.
- `manifest.json` debe quedar en la raíz del XPI, sin carpeta contenedora.
- Nombre del paquete: `versions/DarkSnowF-V<versión>.xpi`.
- Verificar la sintaxis de los JS con `node --check` y que el manifest sea JSON válido.

## Publicación

- El proyecto no está en Git local; el usuario sube los archivos manualmente a GitHub.
- No hacer commit ni push salvo que el usuario lo pida explícitamente.
- Recordar al usuario hacer `Ctrl+F5` después de subir cambios de JavaScript para evitar caché.
- Para cambios de frontend, no actualizar ni ejecutar nada en Supabase.
- Si el cambio requiere SQL o una migración, indicarlo explícitamente como excepción.
- AMO: subir el XPI sin firmar desde `versions/`; AMO devuelve el XPI firmado para distribución.
- GitHub: subir el código fuente, `AGENTS.md`, `README.md` y el XPI firmado en `versions/`.
