/* Explicativo pocketNode, estilo keynote. Modelo 3D en three.js r128 con luz de estudio. */
const K = {black: 'radial-gradient(ellipse at 50% 42%, #10201a 0%, #050807 62%)', ink: '#FFFFFF', paper: '#F5F5F2', dark: '#111111',
  green: '#074736', brown: '#84441A', lime: '#CBDB7C', leaf: '#D1E3B3', alarm: '#C0392B'};

const T3 = (() => {
  const W = 1920, H = 1080;
  const r = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.outputEncoding = THREE.sRGBEncoding;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.domElement.className = 'abs';
  r.domElement.style.cssText = 'left:0;top:0;width:1920px;height:1080px';
  const sc = new THREE.Scene();

  // Estudio fotográfico: un cuarto oscuro con cajas de luz, convertido en mapa de reflejos.
  const pm = new THREE.PMREMGenerator(r);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), new THREE.MeshBasicMaterial({color: 0x15181a, side: THREE.BackSide})));
  const soft = (w, h, x, y, z, c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide}));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  soft(10, 3, 0, 6.5, 3, 0xffffff, 3); soft(3, 8, -10, 1, 4, 0xffffff, 2.2); soft(3, 8, 10, 1, -4, 0xd1e3b3, 1.6); soft(8, 2, 0, -2, 10, 0xffffff, 0.8);
  sc.environment = pm.fromScene(env, 0.035).texture;

  const cam = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 7); sc.add(key);
  const rim = new THREE.DirectionalLight(0xcbdb7c, 1.6); rim.position.set(-6, 3, -6); sc.add(rim);
  sc.add(new THREE.AmbientLight(0xffffff, 0.12));

  const phys = (c, o = {}) => new THREE.MeshPhysicalMaterial({color: c, roughness: 0.45, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4, ...o});
  function rr(w, h, rad) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad);
    s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
    return s;
  }
  function rbox(w, h, d, rad, m, bev = 0.02) {
    const g = new THREE.ExtrudeGeometry(rr(w - 2 * bev, h - 2 * bev, Math.max(0.005, rad - bev)), {depth: Math.max(0.005, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10});
    g.center(); return new THREE.Mesh(g, m);
  }
  function frameBox(w, h, d, rad, t, m) {
    const s = rr(w, h, rad); s.holes.push(rr(w - 2 * t, h - 2 * t, Math.max(0.005, rad - t)));
    const g = new THREE.ExtrudeGeometry(s, {depth: d, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 10});
    g.center(); return new THREE.Mesh(g, m);
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    const api = {tex: t, set(mode) { if (api.mode === mode) return; api.mode = mode; draw(c.getContext('2d'), w, h, mode); t.needsUpdate = true; }};
    return api;
  }

  const G = new THREE.Group(); sc.add(G);
  const P = {};
  const part = (name, obj, home, dir) => { obj.userData = {home: new THREE.Vector3(...home), dir: new THREE.Vector3(...dir)}; P[name] = obj; G.add(obj); return obj; };

  part('post', new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 11, 32), phys(0x84441a, {roughness: 0.85, clearcoat: 0})), [0, -2.2, -0.62], [0, 0, -0.9]);
  [1.35, -1.45].forEach((y, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.03, 12, 48), phys(0xc9cfd2, {metalness: 0.9, roughness: 0.25})); t.rotation.x = Math.PI / 2; part('clamp' + i, t, [0, y, -0.62], [0, 0, -0.9]); });

  const caseM = phys(0xe8ebe7, {roughness: 0.5, clearcoat: 0.15});
  const shell = new THREE.Group();
  const back = rbox(1.7, 2.2, 0.06, 0.16, caseM); back.position.z = -0.28; shell.add(back);
  const walls = frameBox(1.7, 2.2, 0.56, 0.16, 0.07, caseM); shell.add(walls);
  [[-0.88, 0.6], [-0.88, -0.6], [0.88, 0.6], [0.88, -0.6]].forEach(([x, y]) => { const l = rbox(0.06, 0.22, 0.12, 0.02, phys(0xd5dadc, {metalness: 0.9, roughness: 0.2})); l.position.set(x, y, 0.2); shell.add(l); });
  [-0.45, 0.45].forEach(x => { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.2, 24), phys(0x1c1c1c, {roughness: 0.6})); g.position.set(x, -1.18, -0.02); shell.add(g); });
  part('case', shell, [0, 0, 0], [0, 0, 0]);
  part('lid', rbox(1.72, 2.22, 0.05, 0.17, phys(0xffffff, {transparent: true, opacity: 0.22, roughness: 0.04, clearcoat: 1, metalness: 0})), [0, 0, 0.33], [0, 0, 2.8]);

  const screen = canvasTex(360, 740, (g, w, h, mode) => {
    const alert = mode === 'alert', sms = mode === 'sms';
    g.fillStyle = alert ? '#C0392B' : '#074736'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '600 26px Urbanist, sans-serif'; g.textAlign = 'center';
    g.fillText('pocketnode', w / 2, 70);
    g.font = '800 44px Urbanist, sans-serif'; g.fillStyle = '#fff';
    g.fillText(alert ? 'Aviso' : sms ? 'SMS enviado' : 'Escuchando', w / 2, 330);
    g.strokeStyle = '#CBDB7C'; g.lineWidth = 6; g.beginPath();
    for (let x = 30; x <= w - 30; x += 4) { const y = 450 + Math.sin(x * 0.09) * 26 * Math.sin(x * 0.013); x === 30 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.font = '500 24px Urbanist, sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)';
    g.fillText(alert ? 'cogollero | 14 capturas' : sms ? 'sin datos móviles' : 'modo noche', w / 2, 560);
  });
  const ph = new THREE.Group();
  ph.add(rbox(0.76, 1.52, 0.085, 0.1, phys(0x1b1d20, {metalness: 0.65, roughness: 0.3, clearcoat: 0.8})));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.4), new THREE.MeshBasicMaterial({map: screen.tex, toneMapped: false}));
  scr.position.z = 0.0435; ph.add(scr);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), phys(0x050505, {metalness: 0.2, roughness: 0.05, clearcoat: 1}));
  lens.rotation.x = Math.PI / 2; lens.position.set(-0.22, 0.6, -0.05); ph.add(lens);
  part('phone', ph, [0, 0.2, 0.06], [2.1, 0.3, 1.7]);
  part('bank', rbox(0.6, 0.95, 0.18, 0.07, phys(0x9aa3a8, {metalness: 0.55, roughness: 0.35})), [0, -0.52, -0.15], [-2.1, -0.2, 1.1]);
  const mem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 48), phys(0xcbdb7c, {roughness: 0.8, clearcoat: 0}));
  mem.rotation.x = Math.PI / 2;
  part('mem', mem, [0, -0.78, 0.37], [0.5, -0.6, 3.4]);

  const cells = canvasTex(512, 352, g => {
    g.fillStyle = '#0d1b33'; g.fillRect(0, 0, 512, 352);
    g.strokeStyle = 'rgba(190,205,225,.55)'; g.lineWidth = 2;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * 512 / 6, 0); g.lineTo(i * 512 / 6, 352); g.stroke(); }
    for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(0, j * 352 / 4); g.lineTo(512, j * 352 / 4); g.stroke(); }
    g.strokeStyle = 'rgba(190,205,225,.18)'; g.lineWidth = 1;
    for (let x = 0; x < 512; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 352); g.stroke(); }
  });
  cells.set('on');
  const pan = new THREE.Group();
  pan.add(rbox(2.1, 1.45, 0.06, 0.05, phys(0xd8dde0, {metalness: 0.85, roughness: 0.28})));
  const cm = new THREE.Mesh(new THREE.PlaneGeometry(1.98, 1.34), new THREE.MeshPhysicalMaterial({map: cells.tex, metalness: 0.4, roughness: 0.15, clearcoat: 1}));
  cm.position.z = 0.032; pan.add(cm);
  pan.rotation.x = -0.85;
  part('panel', pan, [0, 2.4, 0.15], [0, 1.0, 1.3]);
  part('cable', new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.75, 2.0, 0.1), new THREE.Vector3(1.1, 1.55, 0.05), new THREE.Vector3(0.75, 1.12, 0)]), 40, 0.03, 10), phys(0x111111, {roughness: 0.6})), [0, 0, 0], [0, 0, 0]);

  // Trampa de embudo con feromona: techo, embudo amarillo y vaso colector.
  const trap = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 64), phys(0x074736, {roughness: 0.5})); roof.position.y = 0.6; trap.add(roof);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), phys(0x074736)); s.position.set(Math.cos(a) * 0.6, 0.38, Math.sin(a) * 0.6); trap.add(s); }
  const lure = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16), phys(0xc0392b)); lure.position.y = 0.42; trap.add(lure);
  const fun = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.12, 0.5, 64, 1, true), phys(0xe9c445, {side: THREE.DoubleSide, roughness: 0.4})); fun.position.y = 0.12; trap.add(fun);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.52, 0.85, 64, 1, true), phys(0xf4f4f0, {side: THREE.DoubleSide, transparent: true, opacity: 0.55, roughness: 0.2, clearcoat: 1})); cup.position.y = -0.45; trap.add(cup);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(0.52, 64), phys(0xf4f4f0)); bot.rotation.x = -Math.PI / 2; bot.position.y = -0.87; trap.add(bot);
  part('trap', trap, [0, -2.3, 0.1], [0, -1.5, 0.8]);

  // Polillas que vuelan hacia el embudo y anillos de sonido que salen de la membrana.
  const mothM = new THREE.MeshStandardMaterial({color: 0x8a6b4a, roughness: 0.8, transparent: true, side: THREE.DoubleSide});
  const wingS = new THREE.Shape(); wingS.moveTo(0, 0); wingS.quadraticCurveTo(0.12, 0.1, 0.16, -0.02); wingS.quadraticCurveTo(0.08, -0.08, 0, 0);
  const moths = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Group();
    const wl = new THREE.Mesh(new THREE.ShapeGeometry(wingS), mothM), wr = wl.clone(); wr.scale.x = -1;
    m.add(wl, wr); m.userData = {wl, wr}; G.add(m); moths.push(m);
  }
  const ringM = [0, 1, 2].map(() => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 64), new THREE.MeshBasicMaterial({color: 0xcbdb7c, transparent: true, toneMapped: false})); G.add(t); return t; });

  const all = Object.keys(P);
  const v = new THREE.Vector3();
  function render(root, s, t) {
    if (r.domElement.parentNode !== root) root.insertBefore(r.domElement, root.firstChild);
    all.forEach(k => {
      const o = P[k], u = o.userData;
      o.visible = s.only ? s.only.includes(k) : true;
      o.position.copy(u.home).addScaledVector(u.dir, s.e || 0);
    });
    if (s.noTrap) P.trap.visible = false;
    P.cable.visible = P.cable.visible && (s.e || 0) < 0.05;
    screen.set(s.screen || 'listen');
    G.position.set(s.gx || 0, s.gy || 0, 0);
    G.rotation.set(s.rx || 0, s.ry || 0, 0);
    G.scale.setScalar(s.sc || 1);
    cam.position.set(s.cx ?? 0, s.cy ?? 0, s.cz ?? 15);
    cam.lookAt(s.lx ?? 0, s.ly ?? -0.4, 0);
    const trapTop = P.trap.position.clone().add(new THREE.Vector3(0, 0.4, 0));
    moths.forEach((m, i) => {
      const a = s.moths || 0;
      m.visible = a > 0.01;
      if (!m.visible) return;
      const p = (t * 0.16 + i / moths.length) % 1, ang = i * 2.399;
      const start = new THREE.Vector3(Math.cos(ang) * 3.4, -1.2 + (i % 3) * 0.5, Math.sin(ang) * 2.2);
      m.position.lerpVectors(start, trapTop, Math.pow(p, 1.4));
      m.position.y += Math.sin(p * 9 + i) * 0.12 * (1 - p);
      m.lookAt(trapTop);
      const f = Math.sin(t * 38 + i) * 0.9;
      m.userData.wl.rotation.y = f; m.userData.wr.rotation.y = -f;
      mothM.opacity = a;
      m.scale.setScalar(p > 0.92 ? 0.001 : 1.4);
    });
    const mp = P.mem.position;
    ringM.forEach((g, i) => {
      const p = (t * 0.7 + i / 3) % 1;
      g.visible = (s.ring || 0) > 0.01 && P.mem.visible;
      g.position.set(mp.x, mp.y, mp.z + 0.03);
      g.scale.setScalar(1 + p * 4);
      g.material.opacity = (1 - p) * (s.ring || 0) * 0.9;
    });
    r.render(sc, cam);
  }
  function at(k) { G.updateMatrixWorld(); P[k].getWorldPosition(v); v.project(cam); return {x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H}; }
  return {render, at};
})();

const localT = (s, nowS) => (window.__RENDER__ ? master.time() - s.start : nowS);
function txt(r, html, x, y, cls, css = '') {
  const e = add(r, `<div class="${cls}" style="left:${x}px;top:${y}px;${css}">${html}</div>`);
  gsap.set(e, {xPercent: -50, yPercent: -50, opacity: 0});
  return e;
}
function show(tl, e, t, o = {}) { tl.fromTo(e, {opacity: 0, y: o.y ?? 30}, {opacity: 1, y: 0, duration: (o.d ?? 0.9) * M, ease: 'power3.out'}, t); }
function hide(tl, e, t) { tl.to(e, {opacity: 0, y: -24, duration: 0.5 * M, ease: 'power2.in'}, t); }
function q3(tag, title) {
  return `<div class="kq" style="left:160px;top:120px">${tag}</div><div class="kt md" style="left:160px;top:160px">${title}</div>`;
}
function callouts(r, items) {
  return items.map(([k, a, b, side]) => {
    const e = add(r, `<div class="co" style="${side === 'l' ? 'flex-direction:row-reverse' : ''}"><i></i><b></b><span>${a}<small>${b}</small></span></div>`);
    gsap.set(e, {opacity: 0});
    return {k, el: e, side};
  });
}
function placeCallouts(list) {
  list.forEach(l => {
    const p = T3.at(l.k), w = l.el.offsetWidth;
    l.el.style.left = (l.side === 'l' ? p.x - w + 5 : p.x - 5) + 'px';
    l.el.style.top = (p.y - l.el.offsetHeight / 2) + 'px';
  });
}

/* Acto 1: el problema. */
scene({id:'1', label:'Apertura', act:1, name:'pocketNode', bg:'#000', ink:K.ink, trans:'cut',
  cap:'pocketnode',
  narr:['pocketNode.', 'Escucha. Detecta. Protege.'],
  build(r, tl) {
    const lg = add(r, `<div class="abs" style="left:960px;top:470px;width:520px">__LOGO_BLANCO__</div>`);
    gsap.set(lg, {xPercent: -50, yPercent: -50, opacity: 0});
    const w = ['Escucha.', 'Detecta.', 'Protege.'].map((x, i) => txt(r, x, 660 + i * 300, 860, 'kt sm', i === 2 ? `color:${K.lime}` : ''));
    tl.fromTo(lg, {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 2 * M, ease: 'power2.out'}, 0.3);
    w.forEach((e, i) => { show(tl, e, 2.4 + i * 0.7); sfx(tl, 'tick', 2.4 + i * 0.7); });
    tl.set({}, {}, 6);
  }});

scene({id:'2', label:'Problema', act:1, name:'El problema', bg:K.paper, ink:K.dark, light:true, trans:'fade',
  cap:'el problema',
  narr:['La plaga trabaja de noche.', 'El productor la descubre de día.', 'Y cuando el daño se ve, ya es tarde.'],
  build(r, tl, S) {
    const a = txt(r, 'La plaga trabaja de noche.', 960, 380, 'kt');
    const b = txt(r, 'El productor la descubre de día.', 960, 540, 'kt', 'color:#9a9a96');
    const c = txt(r, 'Cuando el daño se ve, ya es tarde.', 960, 700, 'kt', `color:${K.alarm}`);
    S.onSentence = k => [a, b, c].forEach((e, j) => gsap[window.__RENDER__ ? 'set' : 'to'](e, {opacity: j === k ? 1 : (j < k ? 0.18 : 0), y: 0, duration: 0.5}));
    show(tl, a, 0.3); show(tl, b, 2.4); show(tl, c, 4.6);
    tl.to(a, {opacity: 0.18, duration: 0.5}, 2.4); tl.to(b, {opacity: 0.18, duration: 0.5}, 4.6);
    tl.set({}, {}, 7.5);
  }});

/* Acto 2: el nodo. */
scene({id:'3', label:'El nodo', act:2, name:'El nodo', bg:K.black, ink:K.ink, trans:'fade',
  cap:'el nodo',
  narr:['Este es el nodo pocketNode.', 'Un celular reciclado dentro de una caja sellada, con un panel solar de diez vatios y una trampa de feromona.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: -0.9, rx: 0.08, cz: 22, cy: 0.4, ly: -0.3, gx: 2.2, ring: 0};
    const t1 = txt(r, 'pocketNode', 560, 470, 'kt');
    const t2 = txt(r, 'Un oído que no duerme.', 560, 590, 'ks');
    tl.to(st, {cz: 15.5, duration: 6 * M, ease: 'power2.out'}, 0);
    tl.to(st, {ry: 0.7, duration: 11, ease: 'none'}, 0);
    show(tl, t1, 1.2); show(tl, t2, 4.2);
    tl.to(st, {ring: 1, duration: 1}, 5.5);
    tl.set({}, {}, 10.5);
  },
  frame(n) { T3.render(this.root, this.st, localT(this, n)); }});

scene({id:'4', label:'Piezas', act:2, name:'Cada pieza, una tarea', bg:K.black, ink:K.ink, trans:'fade',
  cap:'cada pieza, una tarea',
  narr:['Cada pieza tiene una sola tarea.', 'El panel carga, y la batería de respaldo cubre la noche y los días nublados.',
    'La membrana deja pasar el sonido y detiene el agua y el polvo.', 'Y el celular hace todo el cálculo.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: 0.35, rx: 0.12, cz: 17, gx: -0.4, ly: -0.5};
    S.co = callouts(r, [['panel', 'Panel solar', '10 W, monocristalino', 'r'], ['phone', 'Celular en desuso', 'Android 5 o superior', 'r'],
      ['bank', 'Batería de respaldo', '5.000 a 10.000 mAh', 'l'], ['mem', 'Membrana acústica', 'pasa el sonido, no el agua', 'r'],
      ['lid', 'Caja IP65', 'sellada contra lluvia y polvo', 'l'], ['trap', 'Trampa de feromona', 'atrae a la plaga al micrófono', 'l']]);
    tl.to(st, {e: 1, duration: 2.4 * M, ease: 'power3.inOut'}, 0.4);
    tl.to(st, {ry: -0.25, duration: 16, ease: 'none'}, 0);
    S.co.forEach((c, i) => { tl.to(c.el, {opacity: 1, duration: 0.5}, 2.6 + i * 0.5); sfx(tl, 'tick', 2.6 + i * 0.5); });
    tl.to(S.co.map(c => c.el), {opacity: 0, duration: 0.5}, 13.2);
    tl.to(st, {e: 0, duration: 2 * M, ease: 'power3.inOut'}, 13.4);
    sfx(tl, 'hit', 15.2, 0.6);
    tl.set({}, {}, 16);
  },
  frame(n) { T3.render(this.root, this.st, localT(this, n)); placeCallouts(this.co); }});

/* Acto 3: cómo escucha. */
scene({id:'5', label:'Escucha', act:3, name:'¿Cómo escucha?', bg:K.black, ink:K.ink, trans:'fade',
  cap:'cómo escucha',
  narr:['¿Cómo escucha?', 'El micrófono graba dieciséis mil muestras por segundo.',
    'Cada segundo de sonido se convierte en un espectrograma: una imagen de sesenta y cuatro bandas de frecuencia.',
    'Un modelo abierto de Google, YAMNet, que distingue quinientas veintiuna clases de sonidos, la lee dentro del celular.',
    'Encima entrenamos nuestras propias clases. Aquí reconoce un perro.'],
  build(r, tl, S) {
    add(r, q3('Pregunta 1', '¿Cómo escucha?'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const wv = add(r, `<canvas class="abs" width="1600" height="160" style="left:160px;top:340px;width:1600px;height:160px"></canvas>`);
    const sp = add(r, `<canvas class="abs" width="900" height="320" style="left:160px;top:560px;width:900px;height:320px;border-radius:14px"></canvas>`);
    S.wv = wv; S.sp = sp; gsap.set([wv, sp], {opacity: 0});
    const l1 = txt(r, '16.000 muestras por segundo', 1560, 300, 'tagx');
    const l2 = add(r, `<div class="abs" style="left:160px;top:900px;font:600 24px Urbanist;opacity:0">0,96 s | 64 bandas | 125 a 7.500 Hz</div>`);
    const cls = [['Perro', 0.91], ['Ganado', 0.04], ['Lluvia', 0.03], ['Voces', 0.02]];
    const box = add(r, `<div class="abs" style="left:1160px;top:560px;width:600px;display:grid;gap:22px">
      <div style="font:700 26px Urbanist;letter-spacing:.14em;color:${K.lime}">YAMNET + CLASES POCKETNODE</div>
      ${cls.map(([n]) => `<div class="row2"><span style="width:170px">${n}</span><div style="flex:1;background:rgba(255,255,255,.1);border-radius:9px"><div class="bar2" style="transform:scaleX(0)"></div></div><span class="v" style="width:90px;text-align:right">0,00</span></div>`).join('')}
      <div class="est">ilustrativo</div></div>`);
    gsap.set(box, {opacity: 0});
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    tl.to(wv, {opacity: 1, duration: 0.6}, 2.2); show(tl, l1, 2.4);
    tl.to(sp, {opacity: 1, duration: 0.6}, 5.2); tl.to(l2, {opacity: 0.7, duration: 0.6}, 5.6);
    tl.to(box, {opacity: 1, duration: 0.6}, 10.5);
    qa(box, '.row2').forEach((row, i) => {
      const p = {v: 0};
      tl.to(q(row, '.bar2'), {scaleX: cls[i][1], duration: 1.2, ease: 'power3.out'}, 15 + i * 0.15);
      tl.to(p, {v: cls[i][1], duration: 1.2, ease: 'power3.out'}, 15 + i * 0.15);
      bind(q(row, '.v'), () => p.v.toFixed(2).replace('.', ','));
    });
    tl.to(q(box, '.row2'), {color: K.lime, duration: 0.3}, 16.3); sfx(tl, 'chime', 16.3);
    tl.set({}, {}, 20);
  },
  frame(n) {
    const t = localT(this, n);
    const hn = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
    const bark = tc => { const ph = ((tc % 0.9) + 0.9) % 0.9; return ph < 0.22 ? Math.sin(ph / 0.22 * Math.PI) : 0; };
    const g = this.wv.getContext('2d');
    g.clearRect(0, 0, 1600, 160); g.strokeStyle = K.lime; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x < 1600; x += 2) {
      const tc = t - (1600 - x) / 600, a = 0.12 + 0.85 * bark(tc);
      const y = 80 + (hn(Math.floor(tc * 4000), 1) - 0.5) * 140 * a;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    const s = this.sp.getContext('2d'), cols = 150, cw = 900 / cols, bh = 320 / 64;
    for (let c = 0; c < cols; c++) {
      const tc = t - (cols - c) * 0.03, b = bark(tc), ci = Math.floor(tc / 0.03);
      for (let k = 0; k < 64; k++) {
        let v = 0.08 + hn(ci, k) * 0.12;
        if (b > 0) for (let h = 1; h < 6; h++) v += b * Math.exp(-Math.pow(k - 9 * h, 2) / 3) * (1 - h * 0.13);
        v = Math.min(1, v);
        const rr = Math.round(lerp(5, 203, v)), gg = Math.round(lerp(12, 219, v)), bb = Math.round(lerp(10, 124, v));
        s.fillStyle = `rgb(${rr},${gg},${bb})`;
        s.fillRect(c * cw, 320 - (k + 1) * bh, cw + 0.5, bh + 0.5);
      }
    }
  }});

scene({id:'6', label:'Polillas', act:3, name:'¿Y las polillas?', bg:K.paper, ink:K.dark, light:true, trans:'fade',
  cap:'y las polillas',
  narr:['¿Y las polillas?', 'Una polilla como el gusano cogollero bate las alas entre treinta y cincuenta veces por segundo.',
    'Ese tono es tan grave que queda por debajo de lo que el modelo escucha, y muchos micrófonos de celular lo atenúan.',
    'Oírla volar a varios metros no es confiable. Por eso no lo prometemos.'],
  build(r, tl) {
    add(r, q3('Pregunta 2', '¿Y las polillas?'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const X = f => 220 + f * 1.45;
    let h = '';
    for (let k = 1; k <= 17; k++) { const f = 40 * k, hgt = 300 * Math.pow(0.84, k - 1); h += `<rect class="hb" x="${X(f) - 6}" y="${820 - hgt}" width="12" height="${hgt}" rx="4" fill="${k === 1 ? K.brown : K.green}"/>`; }
    const sv = add(r, `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
      <rect class="z1" x="${X(0)}" y="420" width="${X(125) - X(0)}" height="400" fill="${K.alarm}" opacity=".12"/>
      <line x1="${X(0)}" y1="820" x2="${X(1000)}" y2="820" stroke="#111" stroke-width="3"/>
      ${[0, 100, 200, 400, 600, 800, 1000].map(f => `<text x="${X(f)}" y="862" font-family="Urbanist" font-size="24" text-anchor="middle" fill="#555">${f}</text>`).join('')}
      <text x="${X(1000)}" y="900" font-family="Urbanist" font-size="22" text-anchor="end" fill="#555">Hz</text>
      ${h}</svg>`);
    const z1 = q(sv, '.z1'), hb = qa(sv, '.hb');
    gsap.set([z1, ...hb], {opacity: 0});
    const f0 = txt(r, '30 a 50 Hz', X(40) + 40, 470, 'tagx', `color:${K.brown};transform-origin:0 50%`);
    const hm = txt(r, 'hasta 17 armónicos', 1150, 560, 'tagx', `color:${K.green}`);
    const zl = txt(r, 'bajo 125 Hz: el modelo no mira | bajo 100 Hz: el micrófono puede atenuar', 900, 960, 'ks', `font-size:28px;color:${K.alarm};opacity:1`);
    const no = txt(r, 'Oírla volar a metros', 1260, 220, 'kt sm');
    const st = add(r, `<div class="abs" style="left:950px;top:214px;width:620px;height:10px;background:${K.alarm};transform-origin:0 50%;transform:scaleX(0)"></div>`);
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    tl.to(hb[0], {opacity: 1, duration: 0.4}, 2.2); show(tl, f0, 2.4);
    tl.to(hb.slice(1), {opacity: 1, duration: 0.25, stagger: 0.08}, 3.4); show(tl, hm, 4.2);
    tl.to(z1, {opacity: 1, duration: 0.6}, 7.4); show(tl, zl, 7.6);
    tl.to(hb[0], {opacity: 0.25, duration: 0.6}, 8.4);
    show(tl, no, 12.2); tl.to(st, {scaleX: 1, duration: 0.5 * M, ease: 'snap'}, 13.4); sfx(tl, 'thud', 13.5);
    tl.set({}, {}, 15.5);
  }});

scene({id:'7', label:'Trampa', act:3, name:'La trampa', bg:K.black, ink:K.ink, trans:'fade',
  cap:'la trampa',
  narr:['La solución es llevar la polilla al micrófono.', 'La feromona de la trampa atrae a los machos de la especie, y entran por el embudo, a pocos centímetros del celular.',
    'Al amanecer, la cámara fotografía la trampa y cuenta las capturas.', 'Así funcionan ya trampas inteligentes en Kenia, Brasil y Colombia. Aquí, el cerebro es un celular reciclado.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: 0.5, rx: 0.15, cz: 17, ly: 0.4, moths: 0, ring: 0};
    const t1 = txt(r, 'La solución: una trampa de feromona.', 960, 110, 'kt sm');
    const n = add(r, `<div class="abs" style="left:1500px;top:640px"><div class="est" style="color:${K.lime}">capturas de esta noche</div><div class="kn">0</div><div class="est">ilustrativo</div></div>`);
    gsap.set(n, {opacity: 0});
    const flags = ['Kenia', 'Brasil', 'Colombia'].map((c, i) => txt(r, c, 760 + i * 200, 980, 'tagx'));
    show(tl, t1, 0.3); hide(tl, t1, 1.3);
    tl.to(st, {cz: 9.5, cy: -1.1, ly: -1.9, ry: -0.2, duration: 5 * M, ease: 'power2.inOut'}, 1.5);
    tl.to(st, {moths: 1, duration: 1}, 3.5);
    tl.to(st, {ring: 1, duration: 1}, 5);
    tl.to(n, {opacity: 1, duration: 0.5}, 9.5);
    counter(tl, q(n, '.kn'), 0, 14, 9.5, 3, v => String(Math.round(v)));
    tl.to(st, {cz: 17, cy: 0, ly: 0.4, ry: 0.6, duration: 4 * M, ease: 'power2.inOut'}, 14);
    flags.forEach((f, i) => { show(tl, f, 15 + i * 0.4); sfx(tl, 'tick', 15 + i * 0.4); });
    tl.set({}, {}, 20);
  },
  frame(n) { T3.render(this.root, this.st, localT(this, n)); }});

/* Acto 4: cómo decide. */
scene({id:'8', label:'Falsas alarmas', act:4, name:'¿Cómo evita falsas alarmas?', bg:K.black, ink:K.ink, trans:'fade',
  cap:'falsas alarmas',
  narr:['¿Cómo evita las falsas alarmas?', 'Ningún sonido aislado dispara un aviso: debe repetirse en tres de cinco ventanas.',
    'Luego se revisa el contexto: la hora, la luz, la humedad y el modo del nodo.',
    'El acelerómetro confirma si algo tocó el poste, y un nodo vecino puede confirmar lo mismo.',
    'Y cada respuesta del productor le enseña al nodo qué era real.'],
  build(r, tl) {
    add(r, q3('Pregunta 3', '¿Cómo evita falsas alarmas?'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const G4 = [['3/5', 'Persistencia', 'tres de cinco ventanas'], ['', 'Contexto', 'hora, luz, humedad, modo'], ['', 'Movimiento', 'acelerómetro en el poste'], ['2', 'Vecino', 'otro nodo lo confirma']];
    const xs = [330, 690, 1050, 1410];
    const gates = G4.map((g, i) => add(r, `<div class="gate" style="left:${xs[i] - 115}px;top:430px"><div class="c">${i + 1}</div><p>${g[1]}</p><small>${g[2]}</small></div>`));
    gsap.set(gates, {opacity: 0});
    const line = add(r, `<div class="abs" style="left:330px;top:489px;width:1440px;height:3px;background:rgba(255,255,255,.18);transform-origin:0 50%;transform:scaleX(0)"></div>`);
    const out = txt(r, 'Aviso', 1760, 490, 'kt sm', `color:${K.lime}`);
    const dot = add(r, `<div class="abs" style="left:250px;top:478px;width:24px;height:24px;border-radius:50%;background:${K.lime};box-shadow:0 0 24px ${K.lime};opacity:0"></div>`);
    const fb = txt(r, 'Respuesta 1 o 2 del productor: el nodo aprende', 960, 860, 'ks');
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    tl.to(line, {scaleX: 1, duration: 1.2 * M, ease: 'power2.out'}, 1.6);
    gates.forEach((g, i) => { show(tl, g, 2 + i * 0.3); });
    tl.to(dot, {opacity: 1, duration: 0.2}, 3.6);
    const T0 = [3.8, 9, 14, 16.5];
    gates.forEach((g, i) => {
      tl.to(dot, {left: xs[i] - 12, duration: 1 * M, ease: 'power2.inOut'}, T0[i]);
      tl.to(q(g, '.c'), {borderColor: K.lime, color: K.lime, duration: 0.3}, T0[i] + 0.9);
      sfx(tl, 'tick', T0[i] + 0.9);
    });
    tl.to(dot, {left: 1690, duration: 0.8, ease: 'power2.in'}, 18.4);
    show(tl, out, 19); sfx(tl, 'chime', 19);
    show(tl, fb, 20.5);
    tl.set({}, {}, 24);
  }});

scene({id:'9', label:'Sin internet', act:4, name:'¿Y sin internet?', bg:K.black, ink:K.ink, trans:'fade',
  cap:'sin internet',
  narr:['¿Y sin internet?', 'Todo el cálculo ocurre dentro del celular, con TensorFlow Lite, que todavía funciona en Android cinco.',
    'El aviso sale como SMS: solo necesita señal celular, no datos móviles.',
    'Google Play solo permite enviar SMS a la app de mensajes del teléfono. Por eso la app del nodo la instala directamente la cooperativa.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: -0.5, rx: 0.1, cz: 9, cy: 0.5, ly: 0.1, gx: -1.6, noTrap: true, ring: 0, screen: 'listen'};
    add(r, `<div class="kq" style="left:1040px;top:250px">Pregunta 4</div><div class="kt md" style="left:1040px;top:290px">¿Y sin internet?</div>`);
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const rows = [['Modelo en el celular', 'LiteRT, desde Android 5'], ['Aviso por SMS', 'solo señal celular'], ['App del nodo fuera de Play', 'la instala la cooperativa']];
    const items = rows.map(([a, b], i) => add(r, `<div class="abs" style="left:1040px;top:${470 + i * 130}px"><div style="font:800 42px Urbanist">${a}</div><div style="font:500 28px Urbanist;opacity:.6">${b}</div></div>`));
    gsap.set(items, {opacity: 0});
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    tl.to(st, {ry: 0.25, duration: 18, ease: 'none'}, 0);
    show(tl, items[0], 2.6);
    show(tl, items[1], 9); tl.set(st, {screen: 'sms'}, 9); tl.to(st, {ring: 1, duration: 0.6}, 9); sfx(tl, 'chime', 9.2);
    show(tl, items[2], 13.5);
    tl.set({}, {}, 19);
  },
  frame(n) { T3.render(this.root, this.st, localT(this, n)); }});

/* Acto 5: lo que puede y lo que no. */
scene({id:'10', label:'Energía', act:5, name:'¿Le alcanza la energía?', bg:K.paper, ink:K.dark, light:true, trans:'fade',
  cap:'energía',
  narr:['¿Le alcanza la energía?', 'Según nuestra estimación, el nodo consume entre diecinueve y treinta y seis vatios hora al día.',
    'Con casi seis horas de sol pico, un panel de diez vatios entrega unos treinta y cinco, si se aprovecha el sesenta por ciento.',
    'En el peor caso queda justo. Por eso escucha por ciclos, lleva batería de respaldo y, si la medición lo pide, sube a quince vatios.'],
  build(r, tl) {
    add(r, q3('Pregunta 5', '¿Le alcanza la energía?'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const sx = 18;
    const rows = [['Batería del celular', 11.5, 11.5, '11,5 Wh', '#9a9a96'], ['Consumo por día', 19, 36, '19 a 36 Wh', K.brown], ['Panel de 10 W por día', 35, 35, 'unos 35 Wh', K.green]];
    const els = rows.map(([n, a, b, l, c], i) => add(r, `<div class="abs" style="left:160px;top:${420 + i * 150}px;width:1600px">
      <div style="font:700 32px Urbanist;margin-bottom:14px">${n} <span style="font-weight:500;opacity:.55">${l}</span></div>
      <div style="position:relative;height:44px;background:rgba(0,0,0,.06);border-radius:22px;width:${40 * sx}px">
        <div class="f" style="position:absolute;left:0;top:0;height:44px;border-radius:22px;background:${c};width:${a * sx}px;transform-origin:0 50%;transform:scaleX(0)"></div>
        ${b > a ? `<div class="g" style="position:absolute;left:0;top:0;height:44px;border-radius:22px;background:${c};opacity:.3;width:${b * sx}px;transform-origin:0 50%;transform:scaleX(0)"></div>` : ''}
      </div></div>`));
    gsap.set(els, {opacity: 0});
    const calc = txt(r, '10 W x 5,8 h x 0,6 = 34,8 Wh', 1400, 735, 'tagx', `color:${K.green}`);
    const note = add(r, `<div class="abs est" style="left:160px;top:900px;opacity:0">estimado: consumo del equipo sin medir; sol pico de NASA POWER; 0,6 es una suposición de pérdidas</div>`);
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    els.forEach((e, i) => {
      const t = [2.4, 2.4, 9.5][i];
      show(tl, e, t);
      tl.to(q(e, '.f'), {scaleX: 1, duration: 1.2, ease: 'power3.out'}, t + 0.3);
      if (q(e, '.g')) tl.to(q(e, '.g'), {scaleX: 1, duration: 1.4, ease: 'power3.out'}, t + 0.6);
    });
    show(tl, calc, 10.5);
    tl.to(note, {opacity: 0.55, duration: 0.6}, 11);
    tl.to(q(els[1], '.g'), {opacity: 0.6, duration: 0.3, yoyo: true, repeat: 3}, 17.5); sfx(tl, 'thud', 17.5);
    tl.set({}, {}, 23);
  }});

scene({id:'11', label:'Alcance', act:5, name:'¿Qué detecta?', bg:K.black, ink:K.ink, trans:'fade',
  cap:'qué detecta',
  narr:['¿Qué detecta?', 'Con alta confianza: perros, ganado extraviado, personas y vehículos, y el conteo de polillas en la trampa.',
    'A validar en el piloto: aves de día y animales casi silenciosos, como el tacuazín.',
    'Y fuera de alcance, lo decimos claro: polillas volando a distancia y zompopos.'],
  build(r, tl) {
    add(r, q3('Pregunta 6', '¿Qué detecta?'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const C3 = [['Alta confianza', K.lime, ['Perros ferales', 'Ganado extraviado', 'Personas y vehículos', 'Polillas contadas en trampa']],
      ['A validar', K.leaf, ['Palomas y zanates, de día', 'Tacuazín, mapache, zorro, cotusa', 'Broca del café en trampa']],
      ['Fuera de alcance', '#ff8a7a', ['Polillas volando a distancia', 'Zompopos']]];
    const cols = C3.map(([h, c, it], i) => add(r, `<div class="col3" style="left:${160 + i * 560}px;color:${c}"><h3>${h}</h3>${it.map(x => `<p style="color:#fff">${x}</p>`).join('')}</div>`));
    cols.forEach(c => gsap.set(qa(c, 'h3, p'), {opacity: 0}));
    tl.to(qq, {opacity: 1, duration: 0.6, stagger: 0.15}, 0.2);
    [2.2, 11, 16.5].forEach((t, i) => { tl.fromTo(qa(cols[i], 'h3, p'), {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5, stagger: 0.25}, t); sfx(tl, 'tick', t); });
    tl.set({}, {}, 21);
  }});

scene({id:'12', label:'Cierre', act:6, name:'Cierre', bg:'#000', ink:K.ink, trans:'fade',
  cap:'cierre',
  narr:['pocketNode convierte un celular olvidado en el oído de la parcela.', 'Escucha. Detecta. Protege.'],
  build(r, tl) {
    const lg = add(r, `<div class="abs" style="left:960px;top:440px;width:460px">__LOGO_BLANCO__</div>`);
    gsap.set(lg, {xPercent: -50, yPercent: -50, opacity: 0});
    const w = ['Escucha.', 'Detecta.', 'Protege.'].map((x, i) => txt(r, x, 660 + i * 300, 820, 'kt sm', i === 2 ? `color:${K.lime}` : ''));
    tl.fromTo(lg, {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 2 * M, ease: 'power2.out'}, 0.3);
    w.forEach((e, i) => { show(tl, e, 4.2 + i * 0.7); sfx(tl, 'tick', 4.2 + i * 0.7); });
    sfx(tl, 'bell3', 6.4);
    tl.set({}, {}, 9);
  }});
