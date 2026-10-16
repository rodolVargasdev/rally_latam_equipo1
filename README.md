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

Simulación de una noche completa: el nodo entra en modo noche, detecta ratas,
envía SMS y WhatsApp, y el productor responde.

- Página: [mvp/index.html](mvp/index.html) (abrir en el navegador y pulsar Reproducir)
- Video: [video/pocketnode-mvp.webm](video/pocketnode-mvp.webm)

Grabar el video con Docker (vía principal):

```bash
docker build -t pocketnode-mvp .
docker run --rm --ipc=host -v "$PWD/video:/work/video" pocketnode-mvp
```

Atajo local: `npm ci`, luego `npm run record`. Si Playwright no puede descargar
su navegador, `PW_CHANNEL=msedge npm run record` usa el Edge instalado.
