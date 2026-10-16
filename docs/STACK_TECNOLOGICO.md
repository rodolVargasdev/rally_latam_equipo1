# Stack tecnológico

| dependencia | versión | para qué | alternativa descartada | auditoría |
|---|---|---|---|---|
| playwright (npm, desarrollo) | 1.63.0 | grabar en video el MVP animado | grabar la pantalla a mano: no se puede repetir igual | `npm audit`: 0 vulnerabilidades (2026-10-16) |
| Imagen `mcr.microsoft.com/playwright` | v1.63.0-noble | grabar el video dentro de Docker | instalar navegadores en cada máquina | misma versión que el paquete |

El MVP (`mvp/index.html`) no usa librerías: HTML, CSS y JavaScript propios.
La tecnología de la app real (Kotlin, TensorFlow Lite, WhatsApp Business Cloud
API) está propuesta en `docs/propuesta-software.md` y entrará aquí cuando se
incorpore.
