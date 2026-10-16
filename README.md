# pocketNode

Equipo pocketNode en el Rally Centroamericano. Repositorio del equipo. Aquí se documentan los
desafíos propuestos, la evaluación de las candidatas y la solución que se
desarrolle.

## Estado

| fase | estado |
|---|---|
| Lectura de desafíos | hecho |
| Preselección | 02, 04 y 05 |
| Elección final | 02 - Sensores al servicio de la comunidad |
| Enfoque | agricultura, con celulares reciclados y software propio |
| Solución | detección temprana de plagas nocturnas |
| Propuesta de software | [docs/propuesta-software.md](docs/propuesta-software.md) |

## Candidatas

### 02 - Sensores al servicio de la comunidad

Millones de celulares en desuso siguen funcionando y cada uno trae sensores de
movimiento y orientación (acelerómetro, giroscopio, magnetómetro), cámara,
micrófono, GPS y conectividad.

**Desafío:** identificar un problema local o regional donde esos sensores
aporten información útil y proponer cómo convertir el dispositivo en una
solución real: qué mide, dónde se instala, cómo se alimenta y se comunica, y
quién usa la información para decidir.

### 04 - Manejo ecológico de residuos de poda y biomasa vegetal urbana

Grandes volúmenes de biomasa vegetal urbana se tratan como desecho o se queman.

**Desafío:** definir una alternativa de reuso accesible, práctica y económica
para un municipio o sector urbano específico que reintegre la biomasa a los
ciclos locales (suelos, biodiversidad, regulación térmica o insumos), con base
en su viabilidad operativa, su impacto ambiental y la participación de los
actores clave.

### 05 - Monitoreo inteligente e infraestructura verde en reservorios pluviales

Los reservorios pluviales en zonas vulnerables sufren anegamientos recurrentes,
acumulación de sedimentos y falta de monitoreo en tiempo real.

**Desafío:** identificar una comunidad urbana o periurbana expuesta a riesgos
hídricos y diseñar una propuesta que combine monitoreo de agua con
infraestructura verde, explicando cómo mejora la respuesta de drenaje, la
calidad ambiental y la articulación con la gestión comunitaria e institucional.

## Matriz de decisión

Escala de 1 a 5. Se completa en equipo.

| criterio | 02 Sensores | 04 Biomasa | 05 Reservorios |
|---|---|---|---|
| Viabilidad técnica | | | |
| Impacto social o ambiental | | | |
| Costo y acceso a materiales | | | |
| Capacidad de prototipar en el plazo | | | |
| Afinidad con el equipo | | | |
| **Total** | | | |

Nota: 02 y 05 pueden combinarse (celulares en desuso como sensores de nivel y
vibración en reservorios), lo que conviene evaluar como opción propia.

## Desafíos completos

La lista íntegra de los nueve desafíos está en
[docs/desafios.md](docs/desafios.md).

## MVP animado

Dos simulaciones de una noche, con datos de ejemplo:

| página | qué muestra | video |
|---|---|---|
| [mvp/index.html](mvp/index.html) | la finca desde arriba: red de nodos, relevo sin señal, plaga en el maíz, robo en el corral y "Mis números" | [video/pocketnode-red.webm](video/pocketnode-red.webm) |
| [mvp/vista-cercana.html](mvp/vista-cercana.html) | un nodo de cerca: sensores en vivo, ratas y aviso por SMS y WhatsApp | [video/pocketnode-vista-cercana.webm](video/pocketnode-vista-cercana.webm) |

## Explicativo de 1:30

[mvp/motion/pocketnode-motion.html](mvp/motion/pocketnode-motion.html): unos 85 segundos con voz, en nueve escenas: el problema, el nodo en 3D, cómo escucha, qué animales detecta y con qué confianza, los cuatro filtros, 6 nodos por hectárea en ladera, el precio y el cierre. Se edita en `mvp/motion/src/` y se ensambla con `python mvp/motion/build.py`; el MP4 se graba con `mvp/motion/render_mp4.py` y se guarda fuera del repositorio. El sustento de cada cifra está en [docs/deteccion-tecnica.md](docs/deteccion-tecnica.md) y [docs/costos.md](docs/costos.md).

Grabar el video con Docker (vía principal):

```bash
docker build -t pocketnode-mvp .
docker run --rm --ipc=host -v "$PWD/video:/work/video" pocketnode-mvp
```

Atajo local: `npm ci`, luego `npm run record`. Si Playwright no puede descargar
su navegador, `PW_CHANNEL=msedge npm run record` usa el Edge instalado.
