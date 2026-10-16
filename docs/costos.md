# Costo de un nodo pocketNode

Precios de referencia consultados el 2026-10-16. Son anuncios de tienda en
distintos países y monedas: sirven para el orden de magnitud, no como
cotización. Antes de comprar se cotiza con un proveedor local.

## Por qué cambió la tabla original

La tabla del equipo daba USD 30 a 38. Al revisar sus enlaces:

| componente original | problema verificado |
|---|---|
| Panel Renogy 10 W 12 V | cuesta [USD 39,99](https://www.lithiumion-batteries.com/products/product/renogy-10w-12v-flexible-monocrystalline-solar-panel-%E2%80%93-ultra-lightweight-bendable-power-for-small-scale-rv-marine-and-off-grid-applications), es flexible (no de aluminio), trabaja a 18 V con conector MC4 y no tiene salida USB: no carga un celular sin regulador |
| Anker PowerCore 10.000 (A1263) | [la página de Anker](https://www.anker.com/eu-en/products/a1263) dice que no admite carga pass-through |
| Caja Daier BG595935T | [interior de 5,1 x 5,1 x 3,3 pulgadas](https://www.chinadaier.com/es/bg595935t-ip67-rated-nema-outdoor-electrical-box/) (unos 130 x 130 x 84 mm): no cabe un celular de 142 mm |

## Tabla corregida

| componente | elección equivalente | costo (USD) | fuente | clase |
|---|---|---|---|---|
| Celular Android 5 o superior, con conector de audífonos | donado (e-waste) | 0 | | |
| Panel solar 10 W con salida USB 5 V, IP65 | panel monocristalino genérico con USB | 12 a 20 | [anuncio en eBay, unas £9](https://www.ebay.de/itm/167268124345) (cerrado, sin certificación) | estimado |
| Batería de respaldo 10.000 mAh **con pass-through** | Deltaco PB-C1005 o Beetel PB10 | 12 a 25 | [Deltaco, €23,18](https://www.proshop.nl/Powerbank/Deltaco-PB-C1005-Powerbank-Wit-10000-mAh/3201821); [Beetel, ₹1.025](https://www.pricebefore.com/beetel-volte-series-pb10-10000mah-power-p914275.html) | referencia |
| Caja IP67 donde cabe el celular | ABS 200 x 120 x 75 mm | 7 a 9 | [USD 6,60](https://www.opcinamilna.hr/products/watertight-junction-box-ip67-waterproof-project-box-durable/241801387/) | referencia |
| Cables USB para exterior | 1 m reforzado | 1,5 a 2,5 | tabla del equipo | sin verificar |
| Aislamiento antivibración | silentblocks M4 y cuna de neopreno | 2 a 3 | tabla del equipo | sin verificar |
| SIM prepago y abrazaderas | Tigo, Claro, Digicel o Movistar | 1,5 a 2 | tabla del equipo | sin verificar |
| **Total por nodo** | | **36 a 62** | | |

Con 6 nodos por hectárea, el equipo por hectárea cuesta entre **USD 216 y 369**,
más el saldo de SMS.

## Cómo abaratar el nodo, y qué se pierde

De más a menos ahorro:

| medida | ahorro | consecuencia |
|---|---|---|
| **Subsidio por datos** (ver abajo) | depende del acuerdo; ejemplo con 50 %: el productor paga USD 18 a 31 por nodo | hay que firmar un acuerdo y pedir permiso al productor |
| SIM solo en 1 o 2 nodos por finca | la SIM y el saldo de los demás nodos | los otros nodos dependen del relevo por Wi-Fi o Bluetooth, cuyo alcance a unos 41 m se mide en el piloto |
| Batería de respaldo solo donde haga falta | USD 12 a 25 por nodo (queda en 24 a 37) | según el balance de energía (deteccion-tecnica.md, pregunta 6), en días nublados el nodo puede apagarse de noche |
| Compra por volumen a través de cooperativas | sin cifra todavía | hay que cotizar; los paneles más baratos por volumen no tienen calidad probada a la intemperie |
| Armado en talleres comunitarios | mano de obra | requiere capacitación y una guía de armado |

## Subsidio a cambio de datos del campo

Una entidad que necesita información del campo (por ejemplo una cooperativa,
una aseguradora agrícola, una agroindustria o una institución pública) paga
parte del costo de los nodos. A cambio recibe un tablero con:

- eventos por zona y por semana (qué se detectó y dónde, a nivel de zona);
- especies más frecuentes;
- estado de la red (nodos activos, batería, señal).

Condiciones que la propuesta exige:

- **Permiso explícito del productor** antes de compartir sus datos.
- **Datos agregados:** la entidad ve zonas y conteos, no el nombre ni el número
  de teléfono del productor, ni los audios.
- Un acuerdo escrito que diga qué datos se comparten, para qué y por cuánto
  tiempo.

El 50 % del ejemplo es ilustrativo: el porcentaje real depende del acuerdo con
cada entidad.
