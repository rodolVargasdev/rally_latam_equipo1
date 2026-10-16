# pocketNode: propuesta de software

Detección temprana de plagas nocturnas con celulares reciclados. Este documento
describe cómo funciona el software: qué hace cada sensor, cómo se decide una
alerta y cómo llega al productor.

Alcance del Rally: propuesta y MVP virtual. No se construye hardware.

## Pregunta que responde

- ¿Cómo proteger las cosechas de las plagas nocturnas a tiempo y con tecnología
  accesible?
- ¿Por qué el productor se entera solo cuando la plaga ya devoró el cultivo?

## Piezas del sistema

| pieza | dónde corre | qué hace |
|---|---|---|
| App Nodo | celular reciclado en la parcela (Android 5.0, API 21) | escucha, mide, decide y avisa; funciona sin internet |
| App Productor | celular del productor | mapa de nodos, alertas, audio del evento, estado del nodo |
| Avisos | SMS desde la SIM del nodo; WhatsApp desde el servidor | alerta para quien no usa apps |
| Servidor y tablero | nube | guarda eventos, envía WhatsApp, tablero para cooperativa o técnico agrícola |

La regla de diseño: **el SMS sale del propio nodo.** Si no hay datos móviles ni
servidor, la alerta llega igual. WhatsApp, la app y el tablero son capas
encima, no requisitos.

## Integración de sensores

Cada sensor tiene un papel. Ninguno decide solo: el motor de reglas cruza las
señales para bajar las falsas alarmas.

| sensor | papel en pocketNode | señal que produce |
|---|---|---|
| Sensor de luz | interruptor del modo noche; antirrobo de la caja | `noche` (bajo 10 lux); `caja_abierta` si hay luz de golpe de noche |
| Micrófono | detector principal | aleteo de insectos (banda de 100 a 600 Hz), roedores y animales (chillidos, pisadas, roer) |
| Acelerómetro | vibración del poste o estaca | `contacto` cuando un animal roza o trepa; `viento` para descartar ruido |
| Giroscopio | inclinación del nodo | `nodo_caido` si el poste se inclina o cae |
| Magnetómetro | orientación fija desde la instalación | `nodo_movido` si alguien gira o se lleva el equipo |
| GPS | ubicación fijada al instalar | coordenadas de cada evento; confirma que el nodo sigue en su sitio |
| Barómetro (si existe) | contexto del clima | `tormenta`: sube el umbral de audio (lluvia y viento) y suma riesgo de hongos |
| Temperatura de batería | autodiagnóstico | `sobrecalentamiento`: baja el trabajo del nodo |
| Wi-Fi y Bluetooth | conexión y vecinos | sube datos cuando hay red; detecta otros nodos cercanos |

Sobre hongos: el celular no mide humedad. El riesgo de hongos es una
**estimación** (noches con lluvia detectada por audio y barómetro, más
temperatura) y así se presenta, no como detección.

## Motor de reglas en el nodo

Cada evento sale con un nivel y una confianza.

| nivel | cuándo | canal |
|---|---|---|
| Informativo | una señal aislada | solo queda en el resumen de la mañana |
| Alerta | audio de plaga sostenido por más de 2 minutos | app y WhatsApp |
| Urgente | audio de plaga más vibración del poste, o un evento repetido en la misma noche | SMS inmediato, app y WhatsApp |
| Equipo | caja abierta, nodo movido o caído, batería baja | SMS al responsable del nodo |

## Flujo de trabajo

```mermaid
flowchart TD
  A[Instalacion: QR, numero del productor, GPS y 10 min de ruido base] --> B[Dia: carga solar y ahorro]
  B --> C{Sensor de luz bajo 10 lux}
  C -- no --> B
  C -- si --> D[Modo noche: escucha en ventanas de 5 s]
  D --> E{Algo fuera del ruido base}
  E -- no --> D
  E -- si --> F[Clasificador en el nodo: insecto, roedor, animal, lluvia]
  F --> G[Cruce con acelerometro, barometro y repeticion]
  G --> H{Nivel}
  H -- informativo --> I[Guardar para el resumen]
  H -- alerta o urgente --> J[SMS desde la SIM del nodo]
  J --> K[Si hay datos: servidor, WhatsApp y app]
  K --> L[Productor actua y marca: confirmada o falsa alarma]
  L --> M[La respuesta ajusta los umbrales del nodo]
  I --> N[Amanecer: resumen de la noche por WhatsApp]
  M --> N
```

## App Productor: experiencia de uso

Público: personas mayores y productores con poca experiencia en tecnología. La
app se diseña para que se entienda sin leer instrucciones.

### Principios

| principio | en la práctica |
|---|---|
| Una pregunta por pantalla | el inicio responde solo "¿está bien mi cultivo?" |
| Semáforo con palabra y dibujo | verde "Todo tranquilo", amarillo "Ojo", rojo "Vaya a ver"; nunca solo color |
| Palabras del campo | "ratas", "gusanos", "animal grande"; nada de "roedor" ni porcentajes: "Seguro" o "Puede ser" |
| Letra y botones grandes | texto de 20 px como mínimo; botones a lo ancho de 64 px de alto |
| Todo se puede escuchar | botón "Escuchar" que lee el aviso en voz alta (voz del propio Android, sin internet) |
| Dos botones como máximo | cada aviso se responde con "Ya fui a ver" o "No era nada" |
| Sin contraseñas | la cooperativa o el técnico instala con un código QR; se entra con el número de teléfono |
| Ayuda a un toque | botón fijo "Llamar al técnico" |
| Avisos distintos | el urgente suena y vibra diferente, incluso con el celular bloqueado |
| Lo mismo fuera de la app | WhatsApp y SMS repiten el aviso y aceptan la respuesta 1 o 2, o una nota de voz |

### Pantallas

1. **Inicio:** semáforo grande de la parcela y una frase.
2. **Aviso:** dibujo grande de la plaga, dónde está, qué hacer, botón
   "Escuchar" y las dos respuestas.
3. **Mis aparatos:** cada nodo con una sola palabra de estado (Bien, Poca
   batería, Movido).
4. **WhatsApp y SMS:** el mismo aviso para quien no abre la app.

## Ejemplo de mensaje

```text
pocketNode: VAYA A VER
Ratas en la orilla norte de Los Naranjos (aparato 2).
Desde las 2:14 de la madrugada. Seguro.
Responda 1 si ya fue a ver, 2 si no era nada.
```

## Tecnología propuesta

Se propone, todavía no se instala nada. Cada dependencia se confirmará y se
registrará en `docs/STACK_TECNOLOGICO.md` antes de entrar.

| capa | propuesta |
|---|---|
| App Nodo | Android nativo en Kotlin con minSdk 21; clasificador de audio TensorFlow Lite en el dispositivo |
| App Productor | Android; modo simple con botones grandes |
| Servidor | API, base de datos y cola de avisos, contenerizado con Docker |
| WhatsApp | WhatsApp Business Cloud API (necesita cuenta de Meta y plantillas aprobadas) |
| SMS | API de SMS de Android desde la SIM del nodo |

## MVP virtual

Una simulación animada en el navegador de una noche completa: el anochecer
activa el nodo, aparece una plaga, los sensores reaccionan, el nodo decide y la
alerta llega al celular del productor por app, SMS y WhatsApp. Se grabará con
Playwright una vez aprobada la propuesta visual.
