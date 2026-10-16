# pocketNode v2: red de nodos, ganado, métricas, paleta y modelo 3D

Objetivo: segunda versión de la propuesta y del MVP. Rama: main (repositorio
de propuesta, sin PR). Entrega: un commit por tarea. Pruebas: revisión visual
con Playwright (no hay suite automatizada).

## Specs

- S1: "una visual en la que pueda verse como desde arriba el funcionamiento en un terreno amplio, es decir, para ver la red de nodos, cómo se comportaría". Se conserva "el ejemplo que mostraste viéndolo desde abajo".
- S2: "en la aplicación me gustaría ver cuál sería el apartado de eh, métricas y todo eso que sean realizadas de manera sencilla".
- S3: "estará orientado también para la agricultura y también para el, el ganado. Entonces, para ese lado sí necesito que lo tengas integrado". Supuesto (sin respuesta del usuario): robo nocturno, depredadores, animal en apuros o cerco caído.
- S4: "se compartiré la paleta de colores para que la incluyas": blanco, verde claro, verde bosque, verde lima, café rojizo, café oscuro.
- S5: "utilcies la skjill de motion graphics y agregues utilizando playwright un modelo del dispositivo utilzianod three.js". Prototipo: imagen del poste con panel de 10 W, caja IP65 y despiece.
- S6: plagas, umbrales y filtrado del texto del usuario (broca, cogollero, elotero, escarabajos; más de 50 eventos por hora; validación microclimática; descarte de lluvia, fauna no dañina y ruido humano).

## Tasks

| id | specs | ruta | estado | commit |
|---|---|---|---|---|
| T1 | S3, S6 | inline | hecho | docs: modos, plagas, red y paleta |
| T2 | S1, S2, S3, S4 | inline | pendiente | |
| T3 | S4, S5 | inline | pendiente | |

## Log

- L1 (2026-10-16): pedido original del usuario, citado en S1 a S5.
- L2: texto de plagas del usuario, resumido en S6. Advertencia dada: la detección de la broca por aire no está verificada; se presenta como hipótesis. El ruido humano se filtra en modo cultivo y es señal en modo ganado.
