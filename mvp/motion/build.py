"""Ensambla pocketnode-motion.html desde src/: cabecera, estilo keynote, nucleo, escenas y linea maestra."""
import re
from pathlib import Path

D = Path(__file__).parent
S = D / "src"
logo = (D.parent.parent / "assets" / "logo" / "logo-blanco.svg").read_text(encoding="utf-8")
logo = re.sub(r"<\?xml.*?\?>|<!--.*?-->", "", logo, flags=re.S).strip()
logo = logo.replace("<svg ", '<svg class="logo" ', 1)
escenas = (S / "escenas.js").read_text(encoding="utf-8").replace("__LOGO_BLANCO__", logo.replace("`", "").replace("\n", " "))
import json
ani = {}
for f in sorted((D.parent.parent / "assets" / "animales").glob("*.svg")):
    svg = re.sub(r"<\?xml.*?\?>|<!--.*?-->", "", f.read_text(encoding="utf-8"), flags=re.S).strip()
    ani[f.stem.replace("-", "_")] = re.sub(r'\s(id|data-name)="[^"]*"', "", svg, count=2).replace("\n", " ")
escenas = "const ANI = " + json.dumps(ani, ensure_ascii=False) + ";\n" + escenas
html = ((S / "cabecera.html").read_text(encoding="utf-8")
        + "<style>\n" + (S / "keynote.css").read_text(encoding="utf-8") + "</style>\n<script>\n"
        + (S / "nucleo.js").read_text(encoding="utf-8") + "\n" + escenas + "\n"
        + (S / "maestra.js").read_text(encoding="utf-8") + "</script>\n")
(D / "pocketnode-motion.html").write_text(html, encoding="utf-8")
print("pocketnode-motion.html", len(html.encode("utf-8")), "bytes")
