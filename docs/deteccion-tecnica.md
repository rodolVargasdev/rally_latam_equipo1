# pocketNode: cómo detecta, con rigor

Este documento responde las preguntas que un jurado técnico hará. Cada
afirmación lleva su clase:

| clase | significa |
|---|---|
| **verificado** | comprobado en una fuente citada (fecha de consulta: 2026-10-16) |
| **estimado** | cálculo propio o dato del equipo, todavía sin medir en campo |
| **hipótesis** | plausible, pero hay que probarlo en el piloto antes de prometerlo |

## Corrección respecto a la versión anterior

La propuesta decía que el aleteo de los insectos estaba "entre 100 y 600 Hz".
Para las polillas que buscamos es falso. En las noctuidas (la familia del
gusano cogollero y del elotero), el aleteo tiene una fundamental de **30 a 50
Hz** con **hasta 17 armónicos** (verificado, [Entomological Review,
Springer](https://link.springer.com/article/10.1134/S0013873807090035)). Ese
error llevó a rediseñar la detección de plagas (pregunta 3).

## Pregunta 1: ¿qué hace el celular con el sonido?

| paso | detalle | clase |
|---|---|---|
| Captura | micrófono a 16 kHz, mono | verificado: es la entrada que exige YAMNet ([README de YAMNet](https://github.com/tensorflow/models/blob/master/research/audioset/yamnet/README.md)) |
| Disparador barato | se compara la energía de cada ventana con el ruido base aprendido en esa parcela; solo si lo supera se despierta el modelo | estimado: ahorra cálculo y batería, a medir |
| Espectrograma | ventana de 25 ms y paso de 10 ms; 64 bandas mel entre 125 y 7.500 Hz; bloques de 0,96 s | verificado (README de YAMNet) |
| Clasificador base | YAMNet: MobileNet v1, unos 3,7 millones de pesos, 521 clases de AudioSet | verificado (README de YAMNet) |
| Capa propia | se reutiliza el vector de 1.024 valores que YAMNet produce y se entrena encima una capa pequeña con las clases de pocketNode | práctica estándar de transferencia; precisión **hipótesis** hasta tener datos propios |
| Motor en el celular | TensorFlow Lite (LiteRT), API Interpreter, que admite Android 5 (minSdk 21) | verificado en la tabla de versiones de [LiteRT para Android](https://developers.google.com/edge/litert/android); conviene confirmar la versión exacta al compilar |

Clases de YAMNet que pocketNode aprovecha tal cual (verificado en
[yamnet_class_map.csv](https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv)):

- Fauna y ganado: Dog, Bark, Whimper (dog), Cattle bovinae, Moo, Pig, Oink,
  Bird, Pigeon dove, Crow, Rodents rats mice, Insect.
- Personas y vehículos (alarma en modo ganado): Speech, Walk footsteps,
  Vehicle, Engine, Engine starting.
- Ruido a descartar: Rain, Raindrop, Wind, Thunder, Rustling leaves, Cricket,
  Frog.

Sin clase propia en YAMNet: tacuazín, mapache, zorro gris, cotusa y zanate. Esas
requieren grabaciones propias (pregunta 7).

## Pregunta 2: ¿cómo evita las falsas alarmas?

Un aviso exige pasar cuatro filtros, en orden:

1. **Persistencia:** la clase aparece en al menos 3 de 5 ventanas seguidas. Un
   ruido aislado no avisa. (estimado: el 3 de 5 se calibra en el piloto)
2. **Contexto:** sensor de luz y hora (de noche o de día), barómetro (noche
   húmeda), modo del nodo (cultivo o ganado). En modo cultivo, voces y motores
   se descartan; en modo ganado, son la alarma.
3. **Movimiento:** el acelerómetro confirma si algo trepó o rozó el poste o
   abrió el portón. Es la principal señal para animales casi silenciosos.
4. **Vecino:** si otro nodo cercano detecta lo mismo, sube la confianza.

Después del aviso, la respuesta del productor (1: era real, 2: no era nada)
etiqueta el clip de 5 segundos. Esos clips sirven para reentrenar la capa
propia y ajustar el umbral de ese nodo.

Métricas que el piloto debe medir y reportar: precisión y exhaustividad por
clase, y falsas alarmas por nodo y por noche. Hoy no hay cifras: no se
publicará ninguna antes de medirla.

## Pregunta 3: ¿cómo detecta polillas si el micrófono no oye su aleteo?

Tres hechos verificados obligan a cambiar el enfoque:

- La fundamental del aleteo de las noctuidas está entre 30 y 50 Hz (Springer,
  arriba).
- El espectrograma de YAMNet empieza en 125 Hz: la fundamental queda fuera; solo
  entran los armónicos.
- La norma de compatibilidad de Android solo exige al micrófono, por debajo de
  100 Hz, estar dentro de ±20 dB respecto a la banda media
  ([CDD 5.11](https://os.unplugged.com/werunplugged/unplugged-vendor/raw/branch/main/compatibility/cdd/5_multimedia/5_11_unprocessed-audio.md)):
  cada modelo de celular puede atenuar mucho esa zona.

Conclusión: oír una polilla volando a metros de distancia con un celular es una
**hipótesis débil** y no se promete.

**Solución: el nodo trabaja junto a una trampa de feromona.**

- La feromona sexual atrae sobre todo a los machos de la especie buscada (por
  ejemplo, el cogollero). Es el método habitual de monitoreo de esta plaga.
- La polilla entra por el embudo, a centímetros del micrófono: ahí sí se captan
  sus armónicos (hipótesis a validar, mucho más fuerte que a distancia).
- Al amanecer, la cámara del celular fotografía el vaso colector y un modelo de
  visión **cuenta las capturas**. Ese principio ya funciona en campo: 20 trampas
  digitales de feromona en zonas rurales de Kenia
  ([Rothamsted](https://repository.rothamsted.ac.uk/item/98149/smart-armyworm-surveillance-project-technical-report)),
  la trampa con cámara Tarvos en Brasil
  ([FAPESP](https://agencia.fapesp.br/smart-traps-monitor-caterpillar-infestation-of-crops/35197))
  y una red de trampas electrónicas con conteo por aprendizaje profundo en maíz
  en Colombia
  ([Universidad Distrital](https://revistas.udistrital.edu.co/index.php/visele/article/download/22140/20923/150497)).
- El aviso sale cuando el conteo diario cruza el umbral que defina el técnico
  agrícola para ese cultivo.

Lo nuevo de pocketNode frente a esas trampas: el "cerebro" es un celular
reciclado en lugar de una placa nueva, y el mismo nodo vigila además fauna y
ganado.

Broca del café: el monitoreo habitual también usa trampas con atrayente, y la
cámara puede contar capturas igual. La detección acústica por el aire queda
descartada: no encontramos ningún trabajo que la respalde.

## Pregunta 4: ¿qué detecta, con qué confianza?

| objetivo | cómo | horario | viabilidad |
|---|---|---|---|
| Perros ferales o callejeros | audio (Dog, Bark) | noche | **alta**: clase existente |
| Ganado vacuno o porcino extraviado | audio (Moo, Oink) | día y noche | **alta**: clase existente |
| Personas o vehículos en el corral | audio (Speech, Footsteps, Engine) más acelerómetro en el portón | noche | **alta** |
| Gusano cogollero y elotero | trampa de feromona más conteo con cámara | conteo al amanecer | **alta** para el conteo (método probado); el audio en el embudo es hipótesis |
| Broca del café | trampa con atrayente más conteo con cámara | conteo diario | **media**: a validar con el técnico de café |
| Palomas y zanates (clarineros) | audio (Bird, Pigeon dove, Crow) | **de día**: exige modo diurno y más batería | **media** |
| Tacuazín, mapache, zorro gris, cotusa | acelerómetro (trepa o roza el poste) más audio de roce; confirmación con foto con flash | noche | **media**: son casi silenciosos y no tienen clase en YAMNet |
| Escarabajos masticando | audio (Chewing) | noche | **hipótesis**: solo se oiría muy cerca |
| Zompopo | ninguno | | **fuera de alcance**: es una hormiga cortadora, no un ave, y su sonido es demasiado débil |

## Pregunta 5: ¿funciona sin internet?

- El modelo corre dentro del celular (pregunta 1): no necesita conexión.
- El aviso sale como **SMS desde la SIM del nodo**: basta con señal celular, sin
  datos móviles.
- Restricción verificada: Google Play solo permite enviar SMS a la app que es la
  manejadora predeterminada de SMS del teléfono
  ([política de Google Play](https://support.google.com/googleplay/android-developer/answer/9047303)).
  Por eso **la app del nodo no se publica en Play**: la cooperativa la instala
  directamente al preparar cada nodo, y en ese celular dedicado puede ser la app
  de SMS predeterminada. La app del productor sí puede ir en Play, porque no
  envía SMS.

## Pregunta 6: ¿cuánta energía necesita?

| dato | valor | clase |
|---|---|---|
| Batería típica de un celular (3.000 mAh a 3,85 V) | unos 11,5 Wh | estimado |
| Consumo del nodo escuchando y procesando | 0,8 a 1,5 W, es decir 19 a 36 Wh por día | **estimado por el equipo; hay que medirlo** |
| Horas sol pico en El Salvador | entre 5,8 y 7,2 según la estación y el lugar | estimado de NASA POWER vía [profilesolar](https://profilesolar.com/locations/El-Salvador/Santa-Elena/); conviene confirmarlo en el Global Solar Atlas |
| Energía de un panel de 10 W | 10 W x 5,8 h x 0,6 = unos 35 Wh por día | estimado: el 0,6 es una suposición de pérdidas de carga, sombra y suciedad |

Lectura: en el peor caso de consumo (36 Wh) el panel de 10 W queda justo, sin
margen. Por eso se proponen tres medidas: escuchar por ciclos (el disparador
barato de la pregunta 1), la batería de respaldo de 5.000 a 10.000 mAh y, si la
medición lo pide, un panel de 15 W.

## Pregunta 7: ¿de dónde salen los datos para entrenar?

- La base (YAMNet) ya está entrenada con AudioSet.
- La capa propia necesita grabaciones locales etiquetadas. Hoy **no existe** un
  banco de sonidos de tacuazín, cotusa o zanate de El Salvador: se construye en
  el piloto, con las respuestas 1 o 2 de los productores y con apoyo técnico
  agrícola.
- El conteo de polillas necesita fotos etiquetadas de capturas. El trabajo de
  Kenia reporta buena precisión con más de 100 imágenes de entrenamiento por
  especie (Rothamsted, arriba).

## Lo que pocketNode no hace

- No identifica la especie de un insecto por su vuelo a distancia.
- No reemplaza la inspección del técnico: avisa dónde y cuándo mirar.
- No detecta zompopos.
- No tiene cifras de precisión hasta terminar el piloto.
