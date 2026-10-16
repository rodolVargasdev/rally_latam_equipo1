"""Ensambla pocketnode-motion.html desde las piezas de src/ (cabecera, nucleo, escenas, linea maestra)."""
from pathlib import Path

D = Path(__file__).parent
S = D / "src"
html = (S / "cabecera.html").read_text(encoding="utf-8") + "<script>\n" + "\n".join(
    (S / f).read_text(encoding="utf-8") for f in ("nucleo.js", "escenas.js", "maestra.js")) + "</script>\n"
(D / "pocketnode-motion.html").write_text(html, encoding="utf-8")
print("pocketnode-motion.html", len(html.encode("utf-8")), "bytes")
