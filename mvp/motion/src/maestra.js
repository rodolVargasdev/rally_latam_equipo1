/* Línea de tiempo maestra, HUD, transiciones y controles. */
const $ = id => document.getElementById(id);
const scenesEl = $('scenes'), wipe = $('wipe'), world = $('world'), stage = $('stage');
const UI = {userPaused: false, started: false, cur: -1, waiting: -1, rtok: 0, ended: false};
const RENDER = window.__RENDER__ || null;
if (RENDER) document.documentElement.classList.add('render');
const master = gsap.timeline({paused: true});
const voiceSpan = i => { const d = RENDER && RENDER.voz && RENDER.voz[i]; return d ? 0.3 + d.reduce((a, b) => a + b, 0) + 0.42 * (d.length - 1) + 0.35 : 0; };
gsap.set(wipe, {x: -1920});

function transition(i, tr, T) {
  const s = SC[i], p = SC[i - 1];
  if (tr === 'wipe') {
    master.fromTo(wipe, {x: -1920, backgroundColor: s.bg}, {x: 0, duration: 0.28, ease: 'snap', immediateRender: false}, T);
    master.to(wipe, {x: 1920, duration: 0.28, ease: 'snap'}, T + 0.28);
    master.call(() => A.whoosh(), null, T);
  } else if (tr === 'whip') {
    master.set(scenesEl, {filter: 'url(#mblur)'}, T);
    master.to(p.root, {x: -420, duration: 0.2, ease: 'power2.in'}, T);
    master.fromTo('#mbx', {attr: {stdDeviation: '0 0'}}, {attr: {stdDeviation: '48 0'}, duration: 0.2, immediateRender: false}, T);
    master.fromTo(s.root, {x: 420}, {x: 0, duration: 0.3, ease: 'expo.out', immediateRender: false}, T + 0.2);
    master.to('#mbx', {attr: {stdDeviation: '0 0'}, duration: 0.3}, T + 0.2);
    master.set(scenesEl, {filter: 'none'}, T + 0.52);
    master.call(() => A.whoosh(), null, T);
  } else if (tr === 'fade') {
    master.fromTo(s.root, {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power2.out', immediateRender: false}, T + 0.001);
  } else if (tr === 'rgb') {
    master.set(scenesEl, {filter: 'url(#rgb)'}, T);
    master.fromTo('#rgbR', {attr: {dx: -28}}, {attr: {dx: 0}, duration: 0.4, ease: 'power3.out', immediateRender: false}, T);
    master.fromTo('#rgbB', {attr: {dx: 28}}, {attr: {dx: 0}, duration: 0.4, ease: 'power3.out', immediateRender: false}, T);
    master.set(scenesEl, {filter: 'none'}, T + 0.42);
    master.call(() => A.glitch(), null, T);
  }
}

let T = 0;
const ACTS = {};
SC.forEach((s, i) => {
  s.root = document.createElement('section');
  s.root.className = 'scene' + (s.light ? ' light' : '');
  s.root.style.background = s.bg; s.root.style.color = s.ink;
  scenesEl.appendChild(s.root);
  s.loops = [];
  const tl = gsap.timeline();
  s.build(s.root, tl, s);
  const tr = RM || i === 0 ? 'cut' : s.trans;
  const cover = {cut: 0, rgb: 0, wipe: 0.28, whip: 0.2, fade: 0}[tr];
  s.start = T;
  s.cover = cover;
  let len = Math.ceil((cover + Math.max(tl.duration(), 2, voiceSpan(i))) / B) * B;
  transition(i, tr, T);
  master.set(s.root, {autoAlpha: 1}, T + cover);
  if (i > 0) master.set(SC[i - 1].root, {autoAlpha: 0, x: 0}, T + cover);
  master.add(tl, T + cover);
  if (!RENDER) master.addPause(T + len - 0.02, () => onScenePause(i));
  s.len = len;
  const a = ACTS[s.act] || (ACTS[s.act] = {t0: T, t1: T + len});
  a.t1 = T + len;
  T += len;
});
gsap.set(SC.map(s => s.root), {autoAlpha: 0});
const TOTAL_BEATS = Math.ceil(master.duration() / B);

function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (SC[i].start <= t + 1e-4) k = i; return k; }

function onScenePause(i) {
  UI.waiting = i;
  if (V.done[i] || !UI.started) resumeOnBeat();
}
function onVoiceDone(i) { if (UI.waiting === i) resumeOnBeat(); }
function resumeOnBeat() {
  const i = UI.waiting, tok = ++UI.rtok, nx = SC[i + 1];
  if (!nx) { endReached(); return; }
  const newAct = nx.act !== SC[i].act;
  let d = A.untilBeat();
  if (newAct && A.ctx) { const rl = 2 * B; A.riser(rl, d); d += rl; }
  setTimeout(() => {
    if (tok !== UI.rtok || UI.userPaused) return;
    UI.waiting = -1;
    master.play();
    if (newAct) A.hit(1.1);
  }, d * 1000);
}
function endReached() {
  UI.ended = true;
  $('playBtn').innerHTML = 'Ver de nuevo<small>desde el acto 1</small>';
  $('playOv').hidden = false;
}

const hud = $('hud'), cap = $('cap'), subs = $('subs'), chap = $('chap');
SC.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = s.label || s.id; b.title = s.name;
  b.addEventListener('click', () => jump(i));
  chap.appendChild(b);
});
UI.subAt = (i, k) => qa(subs, 'span').forEach((x, j) => { x.classList.toggle('now', j === k); x.classList.toggle('past', j < k); });
function renderSubs(i) {
  subs.innerHTML = '';
  SC[i].narr.forEach(t => { const sp = document.createElement('span'); sp.textContent = t + ' '; subs.appendChild(sp); });
}
function setCaption(text) {
  cap.innerHTML = '';
  [...text].forEach(ch => { const s = document.createElement('span'); if (ch === ' ') s.style.width = '.55em'; else s.textContent = ch; cap.appendChild(s); });
  if (RENDER) return;
  gsap.fromTo(cap.children, {opacity: 0, y: RM ? 0 : 24}, {opacity: 1, y: 0, duration: 0.3, stagger: RM ? 0 : 0.012, ease: 'back.out(1.7)', delay: 0.3});
}
function activate(i) {
  UI.cur = i;
  const s = SC[i];
  A.act = s.act;
  hud.style.color = s.ink; cap.style.color = s.ink;
  $('hAct').textContent = `0${Math.min(s.act, 8)} - ${ACTN[s.act]}`;
  const bits = s.act.toString(2).padStart(4, '0');
  qa($('hSq'), 'b').forEach((b, j) => b.classList.toggle('on', bits[j] === '1'));
  qa(chap, 'button').forEach((b, j) => b.setAttribute('aria-current', j === i ? 'true' : 'false'));
  setCaption(s.cap);
  renderSubs(i);
  SC.forEach((x, j) => x.loops.forEach(l => (j === i && !RM) ? l.play() : l.pause()));
  if (s.onEnter) s.onEnter();
  if (s.onSentence) s.onSentence(0);
  if (UI.started && !UI.userPaused) narrate(i, 0);
  else { V.stop(); V.scene = i; V.idx = 0; V.done[i] = false; }
}

/* Grano de película y partículas en un solo lienzo. */
const fx = $('fx'), g = fx.getContext('2d');
g.setTransform(0.5, 0, 0, 0.5, 0, 0);
const GR = [];
if (!RM) for (let n = 0; n < 4; n++) {
  const c = document.createElement('canvas'); c.width = 480; c.height = 270;
  const cg = c.getContext('2d'), im = cg.createImageData(480, 270);
  for (let p = 0; p < im.data.length; p += 4) { const v = Math.random() < 0.5 ? 0 : 255; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; }
  cg.putImageData(im, 0, 0); GR.push(c);
}
let fr = 0, last = performance.now(), tc = 0;
const pad = (n, l = 2) => String(n).padStart(l, '0');
function frame(nowMs) {
  const dt = (nowMs - last) / 1000; last = nowMs;
  if (UI.started && !UI.userPaused) tc += dt;
  const idx = sceneAt(master.time());
  if (idx !== UI.cur) activate(idx);
  paint(nowMs / 1000, tc);
  requestAnimationFrame(frame);
}
function paint(nowS, tcv) {
  const t = master.time();
  const s = SC[UI.cur];
  const nowMs = nowS * 1000; tc = tcv;
  if (s.frame) s.frame(nowMs / 1000);
  for (const b of BOUND) {
    const v = b.fn();
    if (v !== b.last) { b.el.textContent = v; if (b.tick && b.last !== null && (master.isActive() || RENDER)) A.tick(); b.last = v; }
  }
  const HFPS = RENDER ? 30 : 60, ff = Math.floor(tc * HFPS) % HFPS, ss = Math.floor(tc) % 60, mm = Math.floor(tc / 60) % 60, hh = Math.floor(tc / 3600);
  $('hTC').textContent = `TC ${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  $('hBeat').textContent = `${pad(Math.min(TOTAL_BEATS, Math.floor(t / B) + 1), 3)}/${TOTAL_BEATS}`;
  const a = ACTS[s.act];
  $('hProg').style.width = Math.max(0, Math.min(1, (t - a.t0) / (a.t1 - a.t0))) * 100 + '%';
  if (A.ctx && !RENDER) while (A.qs.length && A.qs[0] <= A.ctx.currentTime) { A.qs.shift(); if (!RM) gsap.fromTo(qa($('hSq'), 'b.on'), {scale: 1.45}, {scale: 1, duration: 0.25, ease: 'power2.out'}); }
  g.clearRect(0, 0, 1920, 1080);
  if (s.draw) s.draw(g, nowMs / 1000);
  if (!RM && GR.length) {
    if (fr++ % 2 === 0) GR.push(GR.shift());
    g.globalAlpha = 0.05; g.imageSmoothingEnabled = false;
    g.drawImage(GR[0], 0, 0, 1920, 1080); g.globalAlpha = 1;
  }
}

function fit() { world.style.transform = `scale(${stage.clientWidth / 1920})`; }
new ResizeObserver(fit).observe(stage); fit();

function start(i) {
  A.init(); A.start(); A.setMute(A.muted);
  UI.started = true; UI.ended = false; UI.userPaused = false;
  $('playOv').hidden = true; $('bPause').textContent = 'Pausa';
  if (HAS_TTS) speechSynthesis.cancel();
  UI.rtok++; UI.waiting = -1;
  master.seek(SC[i].start + 0.001, true);
  UI.cur = -1; activate(sceneAt(master.time()));
  master.play();
}
function jump(i) {
  if (!UI.started || UI.ended) { start(i); return; }
  UI.rtok++; UI.waiting = -1; V.stop();
  master.seek(SC[i].start + 0.001, true);
  UI.cur = -1; activate(sceneAt(master.time()));
  if (!UI.userPaused) master.play();
}
function togglePause() {
  if (!UI.started) { start(0); return; }
  UI.userPaused = !UI.userPaused;
  if (UI.userPaused) {
    UI.rtok++; V.stop(); gsap.globalTimeline.pause(); A.stop(); if (A.ctx) A.ctx.suspend();
    $('bPause').textContent = 'Reanudar';
  } else {
    gsap.globalTimeline.resume(); A.start();
    $('bPause').textContent = 'Pausa';
    if (!V.done[UI.cur]) narrate(UI.cur, V.idx);
    else if (UI.waiting === UI.cur) resumeOnBeat();
  }
}
$('playBtn').addEventListener('click', () => start(0));
$('bPause').addEventListener('click', togglePause);
$('bRestart').addEventListener('click', () => jump(0));
$('bMute').addEventListener('click', () => {
  A.setMute(!A.muted);
  $('bMute').textContent = A.muted ? 'Activar sonido' : 'Silenciar';
  if (A.muted && HAS_TTS) speechSynthesis.cancel();
});
$('vSel').addEventListener('change', e => {
  V.picked = true;
  if (e.target.value === 'none') { V.none = true; if (HAS_TTS) speechSynthesis.cancel(); }
  else { V.none = false; V.voice = V.list[+e.target.value] || null; }
  try { localStorage.setItem('pocketnode-video-voz', V.none ? 'none' : (V.voice ? V.voice.name : '')); } catch (err) { /* sin almacenamiento */ }
});
$('bTest').addEventListener('click', probarVoz);
document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); togglePause(); } });
if (HAS_TTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
else { $('vSel').innerHTML = '<option>Este navegador no tiene voz sintética</option>'; $('vNote').hidden = false; }

/* Cuadro de reposo antes de reproducir: DE NOCHE con la luna. */
if (!RENDER) { master.seek(SC[0].start + 3.6, true); requestAnimationFrame(frame); }
else { gsap.ticker.sleep(); $('playOv').hidden = true; $('hBR').firstChild.textContent = '1920x1080 | 30FPS | BEAT '; }

/* Modo de grabación: cada cuadro en un tiempo exacto, y el audio mezclado fuera de tiempo real. */
if (RENDER) {
  const LOG = [], ORIG = {};
  const SFX = ['hit', 'tick', 'chime', 'thud', 'bell', 'bell3', 'whoosh', 'glitch', 'riser'];
  let RT = 0, rSent = '';
  SFX.forEach(n => { ORIG[n] = A[n]; A[n] = (...a) => LOG.push({t: RT, n, a}); });
  const voiceTimes = () => {
    const out = [];
    SC.forEach((s, i) => {
      let t = s.start + s.cover + 0.3;
      ((RENDER.voz && RENDER.voz[i]) || []).forEach((d, k) => { out.push({i, k, t, d, texto: s.narr[k]}); t += d + 0.42; });
    });
    return out;
  };
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
  window.RENDER_API = {
    duration: () => master.duration(),
    textos: () => SC.map(s => s.narr.map(pron)),
    voiceTimes,
    log: () => LOG,
    frame(t) {
      RT = t;
      master.seek(t, false);
      const idx = sceneAt(t);
      if (idx !== UI.cur) activate(idx);
      const s = SC[UI.cur];
      s.loops.forEach(l => {
        if (l.__base == null) l.__base = l.totalTime();
        l.pause();
        if (!RM) l.totalTime(l.__base + Math.max(0, t - s.start));
      });
      const vt = voiceTimes().filter(v => v.i === UI.cur && v.t <= t);
      const k = vt.length ? vt[vt.length - 1].k : -1, key = UI.cur + ':' + k;
      if (key !== rSent) { rSent = key; if (k >= 0 && s.onSentence) s.onSentence(k); }
      paint(t, t);
    },
    async audio(voces) {
      const sr = 44100, dur = master.duration() + 1.5;
      const oc = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
      A.build(A.ctx = oc);
      SFX.forEach(n => { A[n] = ORIG[n]; });
      UI.started = true; UI.userPaused = false;
      for (let t = 0.05, st = 0; t < dur - 0.4; t += B / 4, st = (st + 1) % 16) { A.act = SC[sceneAt(t)].act; A.playStep(st, t); }
      SC.forEach((s, i) => {
        if (i && s.act !== SC[i - 1].act) {
          LOG.push({t: Math.max(0, s.start - 1.2), n: 'riser', a: [1.2, 0]});
          LOG.push({t: s.start, n: 'hit', a: [1.1]});
        }
      });
      LOG.sort((a, b) => a.t - b.t).forEach(e => { A.tOv = e.t; try { A[e.n](...e.a); } catch (err) { /* efecto omitido */ } });
      A.tOv = null;
      const vg = oc.createGain(); vg.gain.value = 1.15; vg.connect(A.master);
      for (const v of voces) {
        const buf = await oc.decodeAudioData(b64(v.b64));
        const src = oc.createBufferSource(); src.buffer = buf; src.connect(vg); src.start(v.t);
        A.duckG.gain.setTargetAtTime(0.3, v.t, 0.08);
        A.duckG.gain.setTargetAtTime(1, v.t + buf.duration, 0.2);
      }
      const out = await oc.startRendering();
      const n = out.length, L = out.getChannelData(0), R = out.getChannelData(1);
      const bytes = new Uint8Array(44 + n * 4), dv = new DataView(bytes.buffer);
      const w = (o, s) => [...s].forEach((c, j) => dv.setUint8(o + j, c.charCodeAt(0)));
      w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true);
      dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true);
      dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
      for (let j = 0; j < n; j++) {
        dv.setInt16(44 + j * 4, Math.max(-1, Math.min(1, L[j])) * 32767, true);
        dv.setInt16(46 + j * 4, Math.max(-1, Math.min(1, R[j])) * 32767, true);
      }
      window.__WAV = bytes;
      return bytes.length;
    },
    wavChunk(off, len) {
      const sl = window.__WAV.subarray(off, off + len);
      let s = '';
      for (let j = 0; j < sl.length; j += 32768) s += String.fromCharCode.apply(null, sl.subarray(j, j + 32768));
      return btoa(s);
    }
  };
}
