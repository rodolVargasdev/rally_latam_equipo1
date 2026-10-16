"""Graba pocketnode-motion.html como MP4: voz natural (edge-tts), cuadro a cuadro en Edge sin ventana y audio mezclado fuera de tiempo real.

Uso:
  python render_mp4.py --prueba   cuadros sueltos en PNG y errores de la pagina, sin grabar
  python render_mp4.py            el MP4 completo
"""
import asyncio
import base64
import json
import os
import tempfile
import math
import subprocess
import sys
import time
from pathlib import Path

import edge_tts
from playwright.async_api import async_playwright

HTML = Path(__file__).parent / "pocketnode-motion.html"
# Todo lo generado vive fuera del repositorio (los MP4 pesan cientos de MB).
D = Path(os.environ.get("RENDER_WORK", Path(tempfile.gettempdir()) / "pnr" / "work"))
D.mkdir(parents=True, exist_ok=True)
WRAP = D / "_render.html"
VOZDIR = D / "voz"
OUT = D / "pocketnode-explicativo.mp4"
VOZ_PREFERIDAS = ["es-MX-DaliaNeural", "es-SV-LorenaNeural"]
PITCH = "+8Hz"  # tono algo más alto: voz más animada (elegida por el equipo, 2026-10-16)
RATE = "+26%"
FPS = 30


def envolver():
    cuerpo = HTML.read_text(encoding="utf-8")
    WRAP.write_text('<!doctype html><html lang="es"><head><meta charset="utf-8">'
                    '<meta name="viewport" content="width=1920">'
                    # Mismo reinicio que el esqueleto del Artifact: sin el, una prueba pasa aqui
                    # y la pagina publicada se deforma (img{max-width:100%}, 2026-10-04).
                    '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}'
                    '[hidden]{display:none!important}</style></head><body>' + cuerpo + "</body></html>",
                    encoding="utf-8")


async def abrir(pw, init):
    nav = await pw.chromium.launch(channel="msedge", headless=True)
    pag = await nav.new_page(viewport={"width": 1920, "height": 1080})
    errores = []
    pag.on("pageerror", lambda e: errores.append("pageerror: " + str(e)))
    pag.on("console", lambda m: errores.append("console: " + m.text) if m.type == "error" else None)
    await pag.add_init_script("window.__RENDER__ = " + json.dumps(init) + ";")
    await pag.goto(WRAP.as_uri())
    await pag.wait_for_function("window.RENDER_API !== undefined", timeout=60000)
    await pag.evaluate("document.fonts.ready.then(() => true)")
    return nav, pag, errores


def duracion(mp3):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


async def voces(textos):
    disponibles = {v["ShortName"] for v in await edge_tts.list_voices()}
    voz = next((v for v in VOZ_PREFERIDAS if v in disponibles), None)
    if not voz:
        sys.exit("No hay voz natural latina disponible en edge-tts")
    VOZDIR.mkdir(exist_ok=True)
    dur = []
    for i, frases in enumerate(textos):
        fila = []
        for k, t in enumerate(frases):
            mp3 = VOZDIR / f"{i:02d}_{k}.mp3"
            if not mp3.exists() or mp3.stat().st_size == 0:
                await edge_tts.Communicate(t, voz, rate=RATE, pitch=PITCH).save(str(mp3))
            fila.append(round(duracion(mp3), 3))
        dur.append(fila)
    return voz, dur


def srt(tiempos, ruta):
    def fmt(x):
        h, r = divmod(x, 3600)
        m, s = divmod(r, 60)
        return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
    lineas = []
    for n, v in enumerate(tiempos, 1):
        lineas += [str(n), f"{fmt(v['t'])} --> {fmt(v['t'] + v['d'])}", v["texto"], ""]
    ruta.write_text("\n".join(lineas), encoding="utf-8")


async def main():
    prueba = "--prueba" in sys.argv
    envolver()
    async with async_playwright() as pw:
        nav, pag, errores = await abrir(pw, {"fase": "textos"})
        textos = await pag.evaluate("RENDER_API.textos()")
        await nav.close()
        voz, dur = await voces(textos)
        print("voz:", voz, "| frases:", sum(len(x) for x in dur))
        nav, pag, errores = await abrir(pw, {"voz": dur})
        total = await pag.evaluate("RENDER_API.duration()")
        tiempos = await pag.evaluate("RENDER_API.voiceTimes()")
        inicios = await pag.evaluate("SC.map(s => [s.id, s.start])")
        print(f"duracion: {total:.1f} s | escenas: {len(inicios)}")
        if prueba:
            (D / "cuadros").mkdir(exist_ok=True)
            for sid, t0 in inicios:
                for dt in (1.5, 6.0):
                    t = t0 + dt
                    for f in range(int(t * FPS) - 45, int(t * FPS) + 1, 15):
                        await pag.evaluate(f"RENDER_API.frame({max(0, f) / FPS})")
                    await pag.screenshot(path=str(D / "cuadros" / f"{sid}_{dt:.0f}.png"))
            print("errores de la pagina:", errores or "ninguno")
            await nav.close()
            return
        cuadros = math.ceil(total * FPS)
        vid = D / "_video.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS),
                               "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
                               "-pix_fmt", "yuv420p", str(vid)], stdin=subprocess.PIPE)
        t0 = time.time()
        for f in range(cuadros):
            await pag.evaluate(f"RENDER_API.frame({f / FPS})")
            ff.stdin.write(await pag.screenshot(type="jpeg", quality=90))
            if f % 900 == 0:
                print(f"cuadro {f}/{cuadros} | {time.time() - t0:.0f} s", flush=True)
        ff.stdin.close()
        ff.wait()
        lista = [{"t": v["t"], "b64": base64.b64encode((VOZDIR / f"{v['i']:02d}_{v['k']}.mp3").read_bytes()).decode()}
                 for v in tiempos]
        n = await pag.evaluate("voces => RENDER_API.audio(voces)", lista)
        wav = bytearray()
        paso = 3_000_000
        for off in range(0, n, paso):
            wav += base64.b64decode(await pag.evaluate(f"RENDER_API.wavChunk({off}, {paso})"))
        (D / "_audio.wav").write_bytes(bytes(wav))
        srt(tiempos, D / "_subtitulos.srt")
        print("errores de la pagina:", errores or "ninguno")
        await nav.close()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(vid), "-i", str(D / "_audio.wav"),
                    "-i", str(D / "_subtitulos.srt"), "-map", "0:v", "-map", "1:a", "-map", "2", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-c:s", "mov_text", "-metadata:s:s:0", "language=spa",
                    "-t", f"{total:.2f}", "-movflags", "+faststart", str(OUT)], check=True)
    print("listo:", OUT, f"{OUT.stat().st_size / 1e6:.1f} MB")


asyncio.run(main())
