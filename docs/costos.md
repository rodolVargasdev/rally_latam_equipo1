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
| Micrófono externo electret con conector TRRS (para la trampa) | cápsula electret y cable de 3,5 mm | 2 a 5 | | estimado, sin fuente |
| Cables USB para exterior | 1 m reforzado | 1,5 a 2,5 | tabla del equipo | sin verificar |
| Aislamiento antivibración | silentblocks M4 y cuna de neopreno | 2 a 3 | tabla del equipo | sin verificar |
| SIM prepago y abrazaderas | Tigo, Claro, Digicel o Movistar | 1,5 a 2 | tabla del equipo | sin verificar |
| **Total por nodo** | | **38 a 67** | | |
| Trampa de feromona y cebo | | por cotizar | | pendiente |

Con 6 nodos por hectárea, el equipo por hectárea cuesta entre **USD 228 y 399**,
más las trampas y el saldo de SMS.

## Cómo bajar el costo, y qué se pierde

- **Sin batería de respaldo** (resta 12 a 25): el nodo queda en 26 a 42 USD, pero
  según el balance de energía (deteccion-tecnica.md, pregunta 6) el panel queda
  justo y en días nublados el nodo se apagaría de noche.
- **Compra por volumen:** los paneles con USB se ofrecen por menos de una libra
  la unidad en pedidos promocionales de 1.000 piezas, pero esa calidad no está
  probada para estar a la intemperie todo el año.
