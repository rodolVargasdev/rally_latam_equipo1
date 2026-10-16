# Stack tecnológico

| dependencia | versión | para qué | alternativa descartada | auditoría |
|---|---|---|---|---|
| playwright (npm, desarrollo) | 1.63.0 | grabar en video el MVP animado | grabar la pantalla a mano: no se puede repetir igual | `npm audit`: 0 vulnerabilidades (2026-10-16) |
| Imagen `mcr.microsoft.com/playwright` | v1.63.0-noble | grabar el video dentro de Docker | instalar navegadores en cada máquina | misma versión que el paquete |
| three.js (CDN cdnjs, en el explicativo) | r128 | modelo 3D del nodo | dibujarlo en SVG: no permite girarlo ni desarmarlo | OSV sin avisos para 0.128.0 (2026-10-16) |
| GSAP con CustomEase y MotionPathPlugin (CDN cdnjs, en el explicativo) | 3.12.5 | línea de tiempo del motion graphics | animar a mano con requestAnimationFrame | versión del motor de referencia de la skill |
| edge-tts (Python, solo para grabar el MP4) | 7.3.1 | voz natural salvadoreña es-SV-LorenaNeural | voz local de Windows (España, robótica) | `pip-audit`: sin avisos (2026-10-16). Se subió desde 7.2.8 porque el servicio de voz la rechaza con un 403 |
| playwright (Python, solo para grabar el MP4) | 1.63.0 | mover Edge cuadro a cuadro | grabar en tiempo real (pierde cuadros) | `pip-audit`: sin avisos (2026-10-16) |
| pip-audit (Python, solo para grabar el MP4) | la instalada el 2026-10-16 | auditar el entorno de render | ninguna | |

El entorno de Python del render vive fuera del repositorio (`%TEMP%\pnr`).

El MVP (`mvp/index.html`) no usa librerías: HTML, CSS y JavaScript propios.
La tecnología de la app real (Kotlin, TensorFlow Lite, WhatsApp Business Cloud
API) está propuesta en `docs/propuesta-software.md` y entrará aquí cuando se
incorpore.
