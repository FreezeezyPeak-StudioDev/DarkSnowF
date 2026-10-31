"""DarkSnowF v1.1.3 - FreezeezyPeak.

Empaqueta DarkSnowF en .xpi con rutas `/` para Firefox.
Incluye solo los archivos de la extension; excluye versiones, editor,
README, AGENTS.md y archivos comprimidos.
"""
import json
import zipfile
from pathlib import Path

root = Path(__file__).parent
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
out = root / "versions" / f"DarkSnowF-V{manifest['version']}.xpi"

files = ["manifest.json", "Index.html", "popup.html"]
for folder in ["pages", "src", "themes", "utils", "assets"]:
    files += sorted(
        p.relative_to(root).as_posix()
        for p in (root / folder).rglob("*")
        if p.is_file()
    )

out.parent.mkdir(exist_ok=True)
try:
    if out.exists():
        out.unlink()
except PermissionError:
    i = 1
    while True:
        alt = out.with_name(f"{out.stem}-{i}{out.suffix}")
        if not alt.exists():
            out = alt
            break
        try:
            alt.unlink()
            out = alt
            break
        except PermissionError:
            i += 1
    print("AVISO: original bloqueado, usando:", out.name)

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in files:
        z.write(root / f, f)

print("OK:", out, out.stat().st_size, "bytes")
with zipfile.ZipFile(out) as z:
    bad = z.testzip()
    if bad:
        raise SystemExit("ZIP corrupto en: " + bad)
    print("Archivos:", len(z.namelist()))
