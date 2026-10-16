/* Núcleo: constantes, utilidades, audio generado y voz. */
gsap.registerPlugin(CustomEase, MotionPathPlugin);
CustomEase.create('snap', 'M0,0 C0.7,0 0.2,1 1,1');
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const M = RM ? 0.2 : 1;
const B = 60 / 100;
/* Paleta del equipo pocketNode; el rojo es solo para alarma. */
const C = {blk:'#074736', crm:'#FFFFFF', lime:'#CBDB7C', blue:'#84441A', team:'#D1E3B3', ok:'#074736', red:'#C0392B', amb:'#84441A', gry:'#8A99A8', vio:'#8B5CF6', cyan:'#D1E3B3', navy:'#42271A'};
const LV = {
  dx:{n:'Diagnosticado', c:C.ok, t:'#FFFFFF'},
  alta:{n:'Alta', c:C.red, t:'#FFFFFF'},
  media:{n:'Media', c:C.amb, t:C.blk},
  baja:{n:'Baja', c:C.crm, t:C.blk},
  di:{n:'Descartado', c:C.gry, t:C.blk}
};
const ACTN = {1:'EL PROBLEMA', 2:'EL NODO', 3:'CÓMO ESCUCHA', 4:'CÓMO DECIDE', 5:'LO QUE PUEDE Y LO QUE NO', 6:'CIERRE'};
const SC = [];
const BOUND = [];
const scene = d => SC.push(d);
const q = (r, s) => r.querySelector(s);
const qa = (r, s) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function add(root, html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  const nodes = [...t.content.children];
  nodes.forEach(n => root.appendChild(n));
  return nodes.length === 1 ? nodes[0] : nodes;
}
function kw(root, text, o) {
  const d = document.createElement('div');
  d.className = 'K';
  d.style.cssText = `font-size:${o.size}px;left:${o.x}px;top:${o.y}px;color:${o.color || 'currentColor'};` + (o.css || '');
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    if (ch === ' ') s.className = 'sp'; else s.textContent = ch;
    if (o.acc && o.acc[i]) s.style.color = o.acc[i];
    d.appendChild(s);
  });
  root.appendChild(d);
  gsap.set(d, {xPercent: o.ax ?? -50, yPercent: o.ay ?? -50});
  return {el: d, L: [...d.children].filter(s => s.className !== 'sp'), size: o.size};
}
function echo(root, text, o, n = 2) {
  const arr = [];
  for (let k = -n; k <= n; k++) {
    if (!k) continue;
    const e = kw(root, text, {...o, acc: null, color: 'transparent', css: `-webkit-text-stroke:2px ${o.stroke || 'currentColor'};`});
    e.k = k;
    gsap.set(e.el, {opacity: 0});
    arr.push(e);
  }
  return arr;
}
function inK(tl, w, t, o = {}) {
  const d = (o.d || 0.55) * M;
  tl.fromTo(w.L, {yPercent: RM ? 0 : 120, scaleY: RM ? 1 : 1.9, opacity: 0},
    {yPercent: 0, scaleY: 1, opacity: 1, duration: d, ease: RM ? 'none' : 'back.out(1.7)', stagger: (o.st || 0.04) * M}, t);
  if (!o.silent) sfx(tl, 'hit', t + d * 0.5, o.hv || 1);
}
function outK(tl, w, t) {
  tl.to(w.L, {yPercent: RM ? 0 : -120, opacity: 0, duration: 0.3 * M + 0.05, ease: 'power3.in', stagger: 0.02 * M}, t);
}
function echoIn(tl, es, t) {
  es.forEach(e => tl.fromTo(e.el, {y: 0, opacity: 0}, {y: e.k * e.size * 0.84, opacity: 0.6 - Math.abs(e.k) * 0.2, duration: 0.6 * M, ease: 'expo.out'}, t + Math.abs(e.k) * 0.05));
}
function echoOut(tl, es, t) { es.forEach(e => tl.to(e.el, {y: 0, opacity: 0, duration: 0.3 * M}, t)); }
function sfx(tl, name, t, ...args) { tl.call(() => A[name] && A[name](...args), null, t); }
function bind(el, fn, tick) { BOUND.push({el, fn, tick, last: null}); }
function win(title, style, body = '', cls = '') {
  return `<div class="win ${cls}" style="${style}"><div class="bar"><i></i><i></i><i></i><span>${title}</span></div><div class="wb">${body}</div></div>`;
}
function lvPill(key, light, extra = '') {
  const L = LV[key];
  let bg = L.c, fg = L.t;
  if (key === 'baja' && light) { bg = C.blk; fg = C.crm; }
  return `<span class="pill" style="background:${bg};color:${fg};${extra}">${L.n}</span>`;
}
function typeIn(tl, el, str, t, dur) {
  const p = {n: 0};
  tl.to(p, {n: str.length, duration: dur, ease: 'none'}, t);
  bind(el, () => str.slice(0, Math.round(p.n)), true);
}
function counter(tl, el, from, to, t, dur, fmt, ease = 'power2.out') {
  const p = {v: from};
  tl.to(p, {v: to, duration: dur, ease}, t);
  bind(el, () => fmt(p.v), true);
  return p;
}

/* Audio: todo sintetizado con Web Audio, sin archivos. */
const A = {ctx: null, muted: false, act: 1, step: 0, nt: 0, lastQ: 0, qs: [], timer: null, lastTick: 0};
A.init = function () {
  if (A.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  A.build(A.ctx = new AC());
};
A.build = function (c) {
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
  A.master = c.createGain(); A.master.gain.value = 0.9;
  A.master.connect(comp); comp.connect(c.destination);
  A.duckG = c.createGain(); A.duckG.connect(A.master);
  A.music = c.createGain(); A.music.gain.value = 0.5; A.music.connect(A.duckG);
  A.fx = c.createGain(); A.fx.gain.value = 0.7; A.fx.connect(A.master);
  const len = c.sampleRate * 1.5, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  A.noise = buf;
};
A.start = function () {
  if (!A.ctx) return;
  A.ctx.resume();
  if (A.timer) return;
  A.nt = A.ctx.currentTime + 0.05; A.step = 0; A.lastQ = A.nt;
  A.timer = setInterval(A.sched, 25);
};
A.stop = function () { clearInterval(A.timer); A.timer = null; A.qs.length = 0; };
A.untilBeat = function () {
  if (!A.ctx || !A.timer) return 0;
  const now = A.ctx.currentTime;
  const next = A.lastQ + B * Math.max(0, Math.ceil((now - A.lastQ) / B - 1e-6));
  return Math.max(0, next - now);
};
const PAT = {
  1:{k:'x.......x.......', h:'....x.......x...', c:'................', b:'x.........x.....'},
  2:{k:'x...x...x...x...', h:'..x...x...x...x.', c:'....x.......x...', b:'x..x....x..x....'},
  3:{k:'x.....x.x.......', h:'x.x.x.x.x.x.x.x.', c:'........x.......', b:'x.....x.x.....x.'},
  4:{k:'x...x...x...x...', h:'.xx..xx..xx..xx.', c:'....x.......x...', b:'x.x...x.x.x...x.'},
  5:{k:'x.......x.......', h:'..x...x...x...x.', c:'................', b:'x.......x...x...'},
  6:{k:'x..x..x...x..x..', h:'x.x.x.x.x.x.x.x.', c:'....x.......x...', b:'x..x..x...x..x..'},
  7:{k:'x...x...x...x...', h:'..x...x...x...x.', c:'........x.......', b:'x...x...x...x...'},
  8:{k:'x...............', h:'................', c:'................', b:'x...............'}
};
const ROOT = {1:55, 2:49, 3:43.65, 4:55, 5:65.41, 6:49, 7:55, 8:41.2};
A.playStep = function (s, t) {
  const p = PAT[A.act] || PAT[1];
  if (p.k[s] === 'x') A.kick(t, 1, A.music);
  if (p.h[s] === 'x') A.nz(t, {f: 8000, peak: 0.08, dec: 0.045});
  if (p.c[s] === 'x') A.nz(t, {type: 'bandpass', f: 1600, q: 0.8, peak: 0.22, dec: 0.14});
  if (p.b[s] === 'x') A.bass(t, ROOT[A.act] * [1, 1, 1.5, 1.335][(s >> 2) % 4]);
};
A.sched = function () {
  const c = A.ctx;
  while (A.nt < c.currentTime + 0.12) {
    const p = PAT[A.act] || PAT[1], s = A.step, t = A.nt;
    if (p.k[s] === 'x') A.kick(t, 1, A.music);
    if (p.h[s] === 'x') A.nz(t, {f: 8000, peak: 0.08, dec: 0.045});
    if (p.c[s] === 'x') A.nz(t, {type: 'bandpass', f: 1600, q: 0.8, peak: 0.22, dec: 0.14});
    if (p.b[s] === 'x') A.bass(t, ROOT[A.act] * [1, 1, 1.5, 1.335][(s >> 2) % 4]);
    if (s % 4 === 0) { A.qs.push(t); A.lastQ = t; }
    A.nt += B / 4; A.step = (s + 1) % 16;
  }
};
function env(g, t, a, peak, dec) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
}
A.kick = function (t, v = 1, dest = A.fx) {
  const c = A.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  env(g, t, 0.003, 0.9 * v, 0.32); o.connect(g).connect(dest); o.start(t); o.stop(t + 0.4);
};
A.nz = function (t, {type = 'highpass', f = 8000, q = 1, peak = 0.12, dec = 0.05, dest = A.music, f2} = {}) {
  const c = A.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = A.noise; fl.type = type; fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dec);
  fl.Q.value = q; env(g, t, 0.002, peak, dec);
  s.connect(fl).connect(g).connect(dest); s.start(t, Math.random()); s.stop(t + dec + 0.06);
};
A.tone = function (t, f, {type = 'sine', peak = 0.15, dec = 0.5, a = 0.004, dest = A.fx, f2} = {}) {
  const c = A.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dec);
  env(g, t, a, peak, dec); o.connect(g).connect(dest); o.start(t); o.stop(t + a + dec + 0.05);
};
A.bass = function (t, f) {
  A.tone(t, f, {peak: 0.3, dec: 0.28, dest: A.music});
  A.tone(t, f * 2, {type: 'triangle', peak: 0.05, dec: 0.18, dest: A.music});
};
const ok = () => A.ctx && !UI.userPaused;
const now = () => (A.tOv != null ? A.tOv : A.ctx.currentTime) + 0.005;
A.hit = function (v = 1) { if (!ok()) return; const t = now(); A.kick(t, 1.1 * v); A.nz(t, {type: 'lowpass', f: 1400, peak: 0.3 * v, dec: 0.2, dest: A.fx}); A.tone(t, 55, {peak: 0.3 * v, dec: 0.5}); };
A.tick = function () { if (!ok()) return; const t = A.tOv != null ? A.tOv : A.ctx.currentTime; if (t - A.lastTick < 0.035) return; A.lastTick = t; A.tone(t + 0.003, 2400, {peak: 0.05, dec: 0.03}); };
A.chime = function () { if (!ok()) return; const t = now(); A.tone(t, 880, {peak: 0.16, dec: 0.7}); A.tone(t + 0.09, 1318.5, {peak: 0.14, dec: 0.8}); };
A.thud = function () { if (!ok()) return; const t = now(); A.tone(t, 90, {peak: 0.7, dec: 0.3, f2: 38}); A.nz(t, {type: 'lowpass', f: 1400, f2: 120, peak: 0.28, dec: 0.35, dest: A.fx}); };
A.bell = function (d = 0) { if (!ok()) return; const t = now() + d; A.tone(t, 1046.5, {peak: 0.14, dec: 1.4}); A.tone(t, 2888, {peak: 0.04, dec: 0.6}); A.tone(t, 5650, {peak: 0.015, dec: 0.3}); };
A.bell3 = function () { A.bell(0); A.bell(0.16); A.bell(0.32); };
A.whoosh = function () { if (!ok()) return; A.nz(now(), {type: 'bandpass', f: 400, f2: 3200, q: 1.2, peak: 0.22, dec: 0.35, dest: A.fx}); };
A.glitch = function () { if (!ok()) return; const t = now(); for (let i = 0; i < 7; i++) A.tone(t + i * 0.045, 200 + Math.random() * 1800, {type: 'square', peak: 0.04, dec: 0.03}); };
A.riser = function (dur, delay = 0) {
  if (!ok()) return;
  const c = A.ctx, t = now() + delay;
  const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = A.noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 2;
  fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(6000, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.04);
  s.connect(fl).connect(g).connect(A.fx); s.start(t); s.stop(t + dur + 0.1);
  A.tone(t, 110, {type: 'sawtooth', peak: 0.03, dec: dur, a: dur * 0.8, f2: 880});
};
A.duck = function (on) { if (A.ctx) A.duckG.gain.setTargetAtTime(on ? 0.3 : 1, A.ctx.currentTime, 0.08); };
A.setMute = function (m) { A.muted = m; if (A.ctx) A.master.gain.setTargetAtTime(m ? 0 : 0.9, A.ctx.currentTime, 0.05); };

/* Voz: Web Speech API, una frase por enunciado. */
const V = {list: [], voice: null, none: false, picked: false, tok: 0, scene: -1, idx: 0, done: {}, keep: [], speaking: false};
const HAS_TTS = 'speechSynthesis' in window;
const PAIS = {SV:'El Salvador', MX:'México', US:'Estados Unidos', '419':'Latinoamérica', CO:'Colombia', AR:'Argentina', CL:'Chile', PE:'Perú', VE:'Venezuela', EC:'Ecuador', GT:'Guatemala', HN:'Honduras', NI:'Nicaragua', CR:'Costa Rica', PA:'Panamá', DO:'República Dominicana', PR:'Puerto Rico', CU:'Cuba', BO:'Bolivia', PY:'Paraguay', UY:'Uruguay', ES:'España'};
const LATAM = Object.keys(PAIS).filter(k => k !== 'ES');
const region = v => ((v.lang || '').replace('_', '-').split('-')[1] || '').toUpperCase();
const esNatural = v => /natural|neural|online/i.test(v.name);
function scoreVoice(v) {
  if (!/^es/i.test(v.lang || '')) return -1000;
  const reg = region(v);
  let s = 0;
  if (LATAM.includes(reg)) s += 100;
  if (reg === 'ES') s -= 100;
  if (esNatural(v)) s += 200;
  if (reg === 'SV') s += 30;
  else if (reg === 'MX' || reg === 'US' || reg === '419') s += 10;
  if (/google/i.test(v.name)) s += 5;
  return s;
}
function voiceLabel(v) {
  const m = v.name.match(/Microsoft\s+(\S+)/);
  const nombre = m ? m[1] : v.name.replace(/\s*\(.*$/, '');
  return `${nombre} | ${PAIS[region(v)] || v.lang}${esNatural(v) ? ' | natural' : ''}`;
}
const PRON = [
  [/pocketNode/gi, 'póket nóud'], [/SMS/g, 'ese eme ese'], [/SIM/g, 'sim'], [/GPS/g, 'ge pe ese'], [/Wi-Fi/g, 'uai fai'], [/YAMNet/g, 'iam net'], [/LiteRT/g, 'lait ar ti'], [/TensorFlow Lite/g, 'ténsor flou lait'], [/IP65/g, 'i pe sesenta y cinco']
];
const pron = s => PRON.reduce((a, [re, r]) => a.replace(re, r), s);
function loadVoices() {
  if (!HAS_TTS) return;
  const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => scoreVoice(b) - scoreVoice(a) || a.name.localeCompare(b.name));
  V.list = vs;
  if (!V.picked) {
    let saved = null;
    try { saved = localStorage.getItem('pocketnode-video-voz'); } catch (e) { saved = null; }
    const hit = saved && vs.find(v => v.name === saved);
    V.voice = hit || vs[0] || null; V.none = saved === 'none' || !vs.length;
  }
  const sel = document.getElementById('vSel');
  const grupos = [['Voces naturales latinas', v => esNatural(v) && LATAM.includes(region(v))],
    ['Otras voces latinas', v => !esNatural(v) && LATAM.includes(region(v))],
    ['Otras voces en español', v => !LATAM.includes(region(v))]];
  sel.innerHTML = '';
  grupos.forEach(([t, f]) => {
    const items = vs.map((v, i) => [v, i]).filter(([v]) => f(v));
    if (!items.length) return;
    const og = document.createElement('optgroup'); og.label = `${t} (${items.length})`;
    items.forEach(([v, i]) => { const o = document.createElement('option'); o.value = String(i); o.textContent = voiceLabel(v); og.appendChild(o); });
    sel.appendChild(og);
  });
  const o = document.createElement('option'); o.value = 'none'; o.textContent = 'Sin voz, solo subtítulos'; sel.appendChild(o);
  sel.value = V.none ? 'none' : String(Math.max(0, vs.indexOf(V.voice)));
  const nat = vs.filter(v => esNatural(v) && LATAM.includes(region(v))).length;
  const note = document.getElementById('vNote');
  note.hidden = nat > 0;
  document.getElementById('vCount').textContent = nat ? `${nat} voces naturales latinas disponibles` : '';
}
function probarVoz() {
  if (!HAS_TTS || V.none || !V.voice) return;
  V.stop();
  const u = new SpeechSynthesisUtterance('Así sonará la narración de pocketNode.');
  u.voice = V.voice; u.lang = V.voice.lang; u.rate = 1.1;
  V.keep.push(u); speechSynthesis.speak(u);
}
V.stop = function () { V.tok++; if (HAS_TTS) speechSynthesis.cancel(); V.speaking = false; A.duck(false); };
function estMs(txt) { return txt.length * 74 + 600; }
function narrate(i, from = 0) {
  const s = SC[i], tok = ++V.tok;
  if (HAS_TTS) speechSynthesis.cancel();
  V.scene = i; V.idx = from; V.done[i] = false;
  const next = () => {
    if (tok !== V.tok) return;
    if (V.idx >= s.narr.length) { V.done[i] = true; onVoiceDone(i); return; }
    const k = V.idx, txt = s.narr[k];
    UI.subAt(i, k);
    if (s.onSentence) s.onSentence(k);
    let fired = false, to;
    const finish = () => {
      if (fired || tok !== V.tok) return;
      fired = true; clearTimeout(to); V.speaking = false; A.duck(false);
      V.idx++; setTimeout(next, 420);
    };
    const canSpeak = HAS_TTS && !V.none && V.voice && !A.muted;
    if (canSpeak) {
      const u = new SpeechSynthesisUtterance(pron(txt));
      u.voice = V.voice; u.lang = V.voice.lang; u.rate = 1.1;
      u.onstart = () => { if (tok === V.tok) { V.speaking = true; A.duck(true); } };
      u.onend = finish; u.onerror = finish;
      V.keep.push(u); if (V.keep.length > 12) V.keep.shift();
      speechSynthesis.speak(u);
      to = setTimeout(finish, estMs(txt) * 1.8 + 3000);
    } else {
      to = setTimeout(finish, estMs(txt));
    }
  };
  next();
}
