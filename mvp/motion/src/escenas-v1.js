/* Modelo 3D del nodo (three.js r128): un solo lienzo que se monta en la escena activa. */
const T3 = (() => {
  const W = 1920, H = 1080;
  const r = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.domElement.className = 'abs';
  r.domElement.style.cssText = 'left:0;top:0;width:1920px;height:1080px';
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  cam.position.set(2.6, 0.9, 9.5); cam.lookAt(0, 0.4, 0);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x42271a, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.95); sun.position.set(5, 7, 6); sc.add(sun);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.55, metalness: 0.08, ...o});
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const G = new THREE.Group(); sc.add(G);
  const P = {};
  const part = (name, obj, home, dir) => { obj.userData = {home: new THREE.Vector3(...home), dir: new THREE.Vector3(...dir)}; P[name] = obj; G.add(obj); return obj; };

  part('post', box(0.5, 8, 0.5, mat(0x84441a, {roughness: 0.9})), [0, -1.4, -0.62], [0, 0, -0.8]);
  const shell = new THREE.Group();
  const gray = mat(0xdfe3e1);
  [[1.7, 2.2, 0.08, 0, 0, -0.3], [0.08, 2.2, 0.6, -0.81, 0, 0], [0.08, 2.2, 0.6, 0.81, 0, 0], [1.7, 0.08, 0.6, 0, 1.06, 0], [1.7, 0.08, 0.6, 0, -1.06, 0]]
    .forEach(([w, h, d, x, y, z]) => { const m = box(w, h, d, gray); m.position.set(x, y, z); shell.add(m); });
  [-0.45, 0.45].forEach(x => { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 16), mat(0x42271a)); g.position.set(x, -1.18, 0); shell.add(g); });
  part('case', shell, [0, 0, 0], [0, 0, 0]);
  part('lid', box(1.72, 2.22, 0.06, mat(0xbfd3cf, {transparent: true, opacity: 0.32, roughness: 0.1})), [0, 0, 0.33], [0, 0, 2.6]);
  const ph = new THREE.Group();
  ph.add(box(0.78, 1.5, 0.09, mat(0x161616, {roughness: 0.3})));
  const scr = box(0.7, 1.38, 0.01, mat(0x074736, {emissive: 0x074736, emissiveIntensity: 0.9})); scr.position.z = 0.05; ph.add(scr);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), mat(0xcbdb7c, {emissive: 0xcbdb7c, emissiveIntensity: 1})); dot.position.set(0, 0.25, 0.056); ph.add(dot);
  part('phone', ph, [0, 0.22, 0.08], [1.9, 0.3, 1.6]);
  part('bank', box(0.62, 0.95, 0.18, mat(0x8a9399, {metalness: 0.3})), [0, -0.5, -0.14], [-1.9, -0.2, 1.1]);
  const mem = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32), mat(0xcbdb7c)); mem.rotation.x = Math.PI / 2;
  part('mem', mem, [0, -0.72, 0.37], [0.4, -0.8, 3.4]);
  const pan = new THREE.Group();
  pan.add(box(2.1, 0.07, 1.45, mat(0xd0d6da)));
  const cells = box(1.95, 0.02, 1.3, mat(0x1d3557, {metalness: 0.5, roughness: 0.25})); cells.position.y = 0.045; pan.add(cells);
  for (let i = 1; i < 6; i++) { const l = box(0.012, 0.03, 1.3, mat(0x8aa0b8)); l.position.set(-0.975 + i * 0.325, 0.06, 0); pan.add(l); }
  pan.rotation.x = 0.75;
  part('panel', pan, [0, 2.35, 0.25], [0, 0.9, 1.4]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6, 1.85, 0.2), new THREE.Vector3(0.95, 1.5, 0.15), new THREE.Vector3(0.75, 1.1, 0.05)]), 30, 0.035, 8), mat(0x111111));
  part('cable', cable, [0, 0, 0], [0, 0, 0]);
  [1.35, -1.45].forEach((y, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 32), mat(0xb8bfc4, {metalness: 0.7})); t.rotation.x = Math.PI / 2; part('clamp' + i, t, [0, y, -0.62], [0, 0, -0.8]); });

  const all = Object.keys(P);
  const v = new THREE.Vector3();
  function render(root, s) {
    if (r.domElement.parentNode !== root) root.insertBefore(r.domElement, root.firstChild);
    all.forEach(k => {
      const o = P[k], u = o.userData;
      o.visible = s.only ? s.only.includes(k) : true;
      o.position.copy(u.home).addScaledVector(u.dir, s.e || 0);
    });
    P.cable.visible = P.cable.visible && (s.e || 0) < 0.05;
    P.lid.material.opacity = 0.32 * (s.lid ?? 1);
    G.position.set(s.gx || 0, s.gy || 0, 0);
    G.rotation.set(s.rx || 0, s.ry || 0, 0);
    G.scale.setScalar(s.sc || 1);
    r.render(sc, cam);
  }
  function at(k) {
    G.updateMatrixWorld();
    P[k].getWorldPosition(v); v.project(cam);
    return {x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H};
  }
  return {render, at};
})();
const localT = (s, nowS) => (window.__RENDER__ ? master.time() - s.start : nowS);

/* Acto 1: el problema. */
scene({id:'1.1', act:1, name:'La plaga llega de noche', bg:C.blk, ink:C.crm, trans:'cut',
  cap:'la plaga llega de noche',
  narr:['Cada noche, plagas como el gusano cogollero llegan a la parcela.',
    'El productor suele enterarse de día, cuando el daño ya se ve.'],
  build(r, tl, S) {
    let stalks = '';
    for (let i = 0; i < 16; i++) { const x = 120 + i * 112; stalks += `<path d="M${x} 1080 L${x} 760 M${x} 860 q-40 -30 -70 -10 M${x} 800 q40 -30 70 -12" stroke="${C.lime}" stroke-width="7" fill="none" stroke-linecap="round"/>`; }
    const sv = add(r, `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080"><circle class="moon" cx="1560" cy="230" r="90" fill="${C.lime}"/><circle cx="1600" cy="205" r="78" fill="${C.blk}"/><g class="st">${stalks}</g></svg>`);
    const moths = add(r, `<div class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>`);
    for (let i = 0; i < 9; i++) {
      const m = add(moths, `<svg class="abs" width="44" height="30" viewBox="0 0 44 30"><path d="M22 15 C6 0 0 12 8 22 C14 28 20 22 22 17 Z M22 15 C38 0 44 12 36 22 C30 28 24 22 22 17 Z" fill="${C.lime}"/></svg>`);
      const y0 = 260 + (i * 61) % 380;
      const lp = gsap.fromTo(m, {x: -80, y: y0}, {x: 2000, y: y0 + 260, duration: 6 + (i % 3), ease: 'none', repeat: -1, paused: true});
      lp.progress(i / 9); S.loops.push(lp);
      S.loops.push(gsap.to(m, {scaleY: 0.4, duration: 0.09, yoyo: true, repeat: -1, paused: true}));
    }
    const w = kw(r, 'DE NOCHE', {size: 230, x: 960, y: 470, acc: {3: C.lime}});
    const e = echo(r, 'DE NOCHE', {size: 230, x: 960, y: 470, stroke: C.crm});
    const hr = add(r, `<div class="abs M" style="left:960px;top:640px;font:800 64px 'JetBrains Mono';letter-spacing:.1em">00:00</div>`);
    gsap.set(hr, {xPercent: -50, opacity: 0});
    tl.fromTo(qa(sv, '.st path'), {scaleY: 0, transformOrigin: '50% 100%'}, {scaleY: 1, duration: 0.5 * M, ease: 'back.out(1.7)', stagger: 0.04}, 0);
    tl.fromTo(moths, {opacity: 0}, {opacity: 1, duration: 0.6}, 0.8);
    inK(tl, w, 1.4); echoIn(tl, e, 1.7);
    tl.to(hr, {opacity: 1, duration: 0.3}, 2.6);
    counter(tl, hr, 0, 134, 2.6, 2.4, v => `0${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`);
    tl.set({}, {}, 7.5);
  }});

scene({id:'1.2', act:1, name:'Se oye antes de que se vea', bg:'#D1E3B3', ink:'#42271A', light:true, trans:'wipe',
  cap:'se oye antes de que se vea',
  narr:['Esperar a ver el daño es llegar tarde.', 'Pero la plaga se oye antes de que se vea.'],
  build(r, tl) {
    const a = kw(r, 'SE VE', {size: 200, x: 960, y: 360});
    const b = kw(r, 'DE DÍA', {size: 200, x: 960, y: 580});
    const strike = add(r, `<div class="abs" style="left:300px;top:568px;width:1320px;height:26px;background:${C.red};transform-origin:0 50%;transform:scaleX(0)"></div>`);
    const band = add(r, `<div class="abs" style="left:0;top:360px;width:1920px;height:360px;background:${C.blk};transform:scaleY(0)"></div>`);
    const o = kw(r, 'SE OYE', {size: 260, x: 960, y: 540, color: C.lime});
    const eo = echo(r, 'SE OYE', {size: 260, x: 960, y: 540, stroke: '#42271A'}, 1);
    let bars = '';
    for (let i = 0; i < 48; i++) bars += `<rect x="${240 + i * 30}" y="0" width="16" height="10" rx="4" fill="${C.lime}"/>`;
    const wave = add(r, `<svg class="abs" style="left:0;top:820px" width="1920" height="160" viewBox="0 0 1920 160"><g>${bars}</g></svg>`);
    gsap.set(o.L, {opacity: 0}); gsap.set(wave, {opacity: 0});
    inK(tl, a, 0); inK(tl, b, 0.4, {silent: true});
    tl.to(strike, {scaleX: 1, duration: 0.5 * M, ease: 'snap'}, 1.6); sfx(tl, 'thud', 1.7);
    tl.to([a.el, b.el, strike], {y: '+=60', opacity: 0, duration: 0.35, ease: 'power3.in'}, 2.8);
    tl.to(band, {scaleY: 1, duration: 0.45 * M, ease: 'expo.out'}, 3.0);
    inK(tl, o, 3.2); echoIn(tl, eo, 3.5); sfx(tl, 'chime', 3.6);
    tl.to(wave, {opacity: 1, duration: 0.2}, 3.8);
    qa(wave, 'rect').forEach((x, i) => tl.to(x, {attr: {height: 30 + ((i * 37) % 110), y: 0}, duration: 0.3, ease: 'back.out(2)'}, 3.8 + i * 0.02));
    tl.set({}, {}, 6.6);
  }});

/* Acto 2: el dispositivo. */
scene({id:'2.1', act:2, name:'Un celular en desuso', bg:'#42271A', ink:C.crm, trans:'whip',
  cap:'un celular en desuso',
  narr:['El corazón es un celular en desuso, con la pantalla rota o la batería cansada.',
    'Todavía trae micrófono, acelerómetro, sensor de luz, GPS y conexión.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: -0.9, rx: 0.15, gx: -1.5, gy: 0.1, sc: 2.4, only: ['phone']};
    const w = kw(r, 'SEGUNDA VIDA', {size: 120, x: 1280, y: 230, acc: {0: C.lime, 1: C.lime, 2: C.lime, 3: C.lime, 4: C.lime, 5: C.lime}});
    const tags = ['MICRÓFONO', 'ACELERÓMETRO', 'GIROSCOPIO', 'SENSOR DE LUZ', 'GPS', 'WI-FI Y BLUETOOTH', 'SIM PARA SMS'];
    const box = add(r, `<div class="abs" style="left:1000px;top:380px;width:780px">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`);
    const tg = qa(box, '.tag'); gsap.set(tg, {opacity: 0});
    const rec = add(r, `<div class="abs M" style="left:1000px;top:800px;font:700 22px 'JetBrains Mono';letter-spacing:.14em;color:${C.lime}">ANDROID 5.0 O SUPERIOR | PANTALLA ROTA: NO IMPORTA</div>`);
    gsap.set(rec, {opacity: 0});
    tl.fromTo(st, {sc: 0.4}, {sc: 2.4, duration: 0.9 * M, ease: 'back.out(1.4)'}, 0.2);
    inK(tl, w, 0.6);
    tl.to(st, {ry: 5.4, duration: 9, ease: 'none'}, 0.2);
    tg.forEach((t, i) => { tl.fromTo(t, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)'}, 3.4 + i * 0.35); sfx(tl, 'tick', 3.4 + i * 0.35); });
    tl.to(rec, {opacity: 1, duration: 0.4}, 6.2);
    tl.set({}, {}, 9.2);
  },
  frame() { T3.render(this.root, this.st); }});

scene({id:'2.2', act:2, name:'El nodo armado', bg:C.blk, ink:C.crm, trans:'cut',
  cap:'el nodo pocketnode',
  narr:['Se arma dentro de una caja sellada contra lluvia y polvo, con una membrana que deja pasar el sonido.',
    'Un panel solar de diez vatios y una batería de respaldo lo mantienen encendido día y noche.',
    'Se fija a un poste, en la parcela o en el corral.'],
  build(r, tl, S) {
    const st = S.st = {e: 1, ry: -0.5, rx: 0.12, gx: -1.2, gy: -0.75, sc: 0.78, lid: 1};
    const L = [['panel', 'PANEL SOLAR 10 W'], ['lid', 'TAPA IP65'], ['mem', 'MEMBRANA ACÚSTICA'], ['phone', 'CELULAR EN DESUSO'], ['bank', 'BATERÍA DE RESPALDO'], ['post', 'POSTE Y ABRAZADERAS']];
    S.labels = L.map(([k, t]) => {
      const el = add(r, `<div class="abs lab"><i></i><span>${t}</span></div>`);
      gsap.set(el, {opacity: 0});
      return {k, el};
    });
    const title = kw(r, 'POCKETNODE', {size: 96, x: 1440, y: 140, acc: {6: C.lime, 7: C.lime, 8: C.lime, 9: C.lime}});
    tl.fromTo(st, {sc: 0.3}, {sc: 0.78, duration: 0.8 * M, ease: 'expo.out'}, 0);
    inK(tl, title, 0.3);
    S.labels.forEach((l, i) => { tl.to(l.el, {opacity: 1, duration: 0.3}, 1.0 + i * 0.45); sfx(tl, 'tick', 1.0 + i * 0.45); });
    tl.to(st, {ry: 0.5, duration: 13, ease: 'none'}, 0);
    tl.to(st, {e: 0, duration: 3.2 * M, ease: 'power3.inOut'}, 5.2);
    sfx(tl, 'hit', 8.4, 0.8);
    tl.to(S.labels.map(l => l.el), {opacity: 0.25, duration: 0.4}, 8.4);
    tl.set({}, {}, 13.5);
  },
  frame() {
    T3.render(this.root, this.st);
    this.labels.forEach(l => { const p = T3.at(l.k); l.el.style.left = (p.x + 30) + 'px'; l.el.style.top = (p.y - 18) + 'px'; });
  }});

scene({id:'2.3', act:2, name:'Escucha, siente y decide', bg:C.blk, ink:C.crm, trans:'rgb',
  cap:'escucha, siente y decide',
  narr:['Al caer la luz, el nodo despierta y escucha.',
    'El micrófono reconoce el aleteo de la plaga, y el acelerómetro siente si algo roza el poste o abre el portón.',
    'Todo se decide dentro del celular, sin internet.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: 0.3, rx: 0.1, gx: -2.1, gy: -0.55, sc: 0.85};
    const rings = add(r, `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
      <circle class="r1" cx="560" cy="560" r="300" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round"/>
      <circle class="r2" cx="560" cy="560" r="360" fill="none" stroke="${C.lime}" stroke-width="5" stroke-dasharray="160 2100"/>
      <circle class="r3" cx="560" cy="560" r="420" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1 11" opacity=".5"/></svg>`);
    S.loops.push(gsap.to(q(rings, '.r1'), {rotation: 360, svgOrigin: '560 560', duration: 30, ease: 'none', repeat: -1, paused: true}));
    S.loops.push(gsap.to(q(rings, '.r2'), {rotation: -360, svgOrigin: '560 560', duration: 6, ease: 'none', repeat: -1, paused: true}));
    S.loops.push(gsap.to(q(rings, '.r3'), {rotation: 360, svgOrigin: '560 560', duration: 60, ease: 'none', repeat: -1, paused: true}));
    const rows = [['SENSOR DE LUZ', 'modo noche'], ['MICRÓFONO', 'aleteo de plagas'], ['ACELERÓMETRO', 'roce y portón'], ['MAGNETÓMETRO', 'nodo movido'], ['BARÓMETRO', 'noche húmeda']];
    const list = add(r, `<div class="abs" style="left:1080px;top:250px;display:grid;gap:22px">${rows.map(([a, b]) => `<div class="sr"><span class="pill" style="background:${C.lime};color:${C.blk}">${a}</span><span class="M" style="font:700 26px 'JetBrains Mono'">-> ${b}</span></div>`).join('')}</div>`);
    const it = qa(list, '.sr'); gsap.set(it, {opacity: 0});
    const edge = kw(r, 'SIN INTERNET', {size: 92, x: 1430, y: 900, acc: {0: C.lime, 1: C.lime, 2: C.lime}});
    gsap.set(edge.L, {opacity: 0}); gsap.set(rings, {opacity: 0});
    tl.to(rings, {opacity: 1, duration: 0.5}, 0.4);
    tl.to(st, {ry: 2.2, duration: 14, ease: 'none'}, 0);
    it.forEach((x, i) => { tl.fromTo(x, {opacity: 0, x: 60}, {opacity: 1, x: 0, duration: 0.4 * M, ease: 'expo.out'}, 1.6 + i * 1.3); sfx(tl, 'tick', 1.6 + i * 1.3); });
    inK(tl, edge, 9.4); sfx(tl, 'chime', 9.6);
    tl.set({}, {}, 12.5);
  },
  frame() { T3.render(this.root, this.st); }});

/* Acto 3: la red. */
scene({id:'3.1', act:3, name:'Una red que se confirma sola', bg:'#D1E3B3', ink:'#074736', light:true, trans:'wipe',
  cap:'una red que se confirma sola',
  narr:['Varios nodos cubren la finca y se hablan entre ellos.',
    'Si dos vecinos oyen la misma plaga, la alerta se confirma: aquí, sesenta y cuatro eventos por hora.',
    'Si uno no tiene señal, el vecino lleva el aviso hasta la antena.'],
  build(r, tl) {
    const N = [[300, 300], [620, 520], [980, 260], [1360, 220], [1250, 600], [860, 820]];
    const E = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 4], [4, 5], [1, 5]];
    const ant = [1560, 860];
    const sv = add(r, `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
      ${E.map(([a, b]) => `<line class="ed" x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="#074736" stroke-width="5" stroke-dasharray="10 12"/>`).join('')}
      <path class="rel" d="M${N[3][0]} ${N[3][1]} L${N[4][0]} ${N[4][1]} L${ant[0]} ${ant[1]}" fill="none" stroke="#84441A" stroke-width="12" stroke-linecap="round" stroke-dasharray="1200" stroke-dashoffset="1200"/>
      <path d="M${ant[0] - 40} ${ant[1] + 120} L${ant[0]} ${ant[1]} L${ant[0] + 40} ${ant[1] + 120} Z" fill="none" stroke="#42271A" stroke-width="8" class="an"/>
      ${N.map(([x, y], i) => `<g class="nd"><circle class="hl" cx="${x}" cy="${y}" r="40" fill="none" stroke="#84441A" stroke-width="6" opacity="0"/><circle class="cr" cx="${x}" cy="${y}" r="34" fill="#074736" stroke="#fff" stroke-width="6"/></g>`).join('')}
    </svg>`);
    const nds = qa(sv, '.nd'), eds = qa(sv, '.ed'), hl = qa(sv, '.hl'), cr = qa(sv, '.cr');
    const ns = add(r, `<div class="abs M" style="left:1440px;top:150px;font:800 26px 'JetBrains Mono';color:#84441A">SIN SEÑAL</div>`);
    const cnt = add(r, `<div class="abs" style="left:150px;top:840px"><div class="M" style="font:800 120px 'JetBrains Mono'"><span class="n">0</span><span style="font-size:48px"> / HORA</span></div><div class="lbl">ilustrativo</div></div>`);
    gsap.set([ns, cnt, q(sv, '.an')], {opacity: 0});
    tl.fromTo(nds, {scale: 0, transformOrigin: '50% 50%'}, {scale: 1, duration: 0.4 * M, ease: 'back.out(1.7)', stagger: 0.15}, 0.2);
    nds.forEach((_, i) => sfx(tl, 'tick', 0.2 + i * 0.15));
    tl.fromTo(eds, {opacity: 0}, {opacity: 0.7, duration: 0.4, stagger: 0.12}, 1.2);
    tl.to(q(sv, '.an'), {opacity: 1, duration: 0.3}, 1.8);
    tl.to([cr[3], cr[4]], {fill: '#84441A', duration: 0.2}, 4.2);
    tl.fromTo([hl[3], hl[4]], {attr: {r: 40}, opacity: 1}, {attr: {r: 120}, opacity: 0, duration: 1, repeat: 3, ease: 'power2.out'}, 4.2);
    tl.to(cnt, {opacity: 1, duration: 0.3}, 4.6);
    counter(tl, q(cnt, '.n'), 0, 64, 4.6, 2.2, v => String(Math.round(v)));
    sfx(tl, 'bell3', 7.0);
    tl.to(ns, {opacity: 1, duration: 0.3}, 9.2);
    tl.to(q(sv, '.rel'), {strokeDashoffset: 0, duration: 1.4 * M, ease: 'snap'}, 9.6); sfx(tl, 'whoosh', 9.6);
    tl.set({}, {}, 13);
  }});

scene({id:'3.2', act:3, name:'Cultivo y ganado', bg:'#84441A', ink:C.crm, trans:'whip',
  cap:'cultivo y ganado',
  narr:['En modo cultivo, las voces y los motores se descartan como ruido.',
    'En modo ganado, esas mismas voces de noche junto al corral son la alarma.'],
  build(r, tl) {
    const div = add(r, `<div class="abs" style="left:958px;top:120px;width:4px;height:840px;background:${C.crm};opacity:.5;transform:scaleY(0)"></div>`);
    const a = kw(r, 'CULTIVO', {size: 120, x: 480, y: 260, color: C.lime});
    const b = kw(r, 'GANADO', {size: 120, x: 1440, y: 260, color: C.lime});
    const mk = (x, cls) => add(r, `<div class="abs ${cls}" style="left:${x}px;top:470px;width:620px;text-align:center"><span class="pill ol" style="color:${C.crm};font-size:34px;position:relative">VOCES Y MOTORES<i class="st"></i></span></div>`);
    const va = mk(170, 'va'), vb = mk(1130, 'vb');
    const ra = add(r, `<div class="abs M" style="left:480px;top:640px;font:800 40px 'JetBrains Mono';letter-spacing:.08em">= RUIDO</div>`);
    const rb = add(r, `<div class="abs M" style="left:1440px;top:640px;font:800 40px 'JetBrains Mono';letter-spacing:.08em;color:${C.crm}"><span style="background:${C.red};padding:6px 18px;border-radius:10px">= ALARMA</span></div>`);
    gsap.set([ra, rb], {xPercent: -50, opacity: 0}); gsap.set([va, vb], {opacity: 0});
    tl.to(div, {scaleY: 1, duration: 0.5 * M, ease: 'expo.out'}, 0);
    inK(tl, a, 0.2); inK(tl, b, 0.5, {silent: true});
    tl.to(va, {opacity: 1, duration: 0.3}, 1.3);
    tl.to(q(va, '.st'), {scaleX: 1, duration: 0.45 * M, ease: 'snap'}, 2.2); sfx(tl, 'thud', 2.3);
    tl.to(ra, {opacity: 1, duration: 0.3}, 2.6);
    tl.to(va, {opacity: 0.45, duration: 0.4}, 3.2);
    tl.to(vb, {opacity: 1, duration: 0.3}, 4.6);
    tl.to(rb, {opacity: 1, duration: 0.3}, 5.4); sfx(tl, 'chime', 5.4);
    tl.fromTo(rb, {scale: 0.6}, {scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false}, 5.4);
    tl.set({}, {}, 8.5);
  }});

/* Acto 4: el aviso. */
scene({id:'4.1', act:4, name:'Un aviso que cualquiera entiende', bg:C.blk, ink:C.crm, trans:'cut',
  cap:'un aviso que cualquiera entiende',
  narr:['El aviso sale como SMS desde la propia SIM del nodo, aunque no haya internet.',
    'Palabras sencillas, letra grande y dos respuestas: ya fui a ver, o no era nada.'],
  build(r, tl) {
    const ph = add(r, `<div class="abs" style="left:1200px;top:96px;width:410px;height:800px;border-radius:56px;background:#05100c;border:4px solid ${C.lime};padding:18px;box-sizing:border-box">
      <div style="height:100%;border-radius:40px;background:#FFFFFF;color:#42271A;display:flex;flex-direction:column;gap:20px;padding:30px 26px;box-sizing:border-box;font-family:'JetBrains Mono',monospace">
        <div style="font:700 18px 'JetBrains Mono';opacity:.6">SMS | 1:32</div>
        <div style="background:#D1E3B3;border-radius:22px;padding:22px;font:700 25px/1.45 'JetBrains Mono'"><b style="color:#C0392B">VAYA A VER</b><br><span class="ty"></span></div>
        <div class="bt" style="margin-top:auto;background:#074736;color:#fff;border-radius:18px;padding:24px;text-align:center;font:800 26px 'JetBrains Mono'">1 YA FUI A VER</div>
        <div class="bt" style="background:#D1E3B3;color:#074736;border-radius:18px;padding:24px;text-align:center;font:800 26px 'JetBrains Mono'">2 NO ERA NADA</div>
      </div></div>`);
    const w = kw(r, 'SMS', {size: 300, x: 560, y: 400, color: C.lime});
    const s2 = kw(r, 'SIN INTERNET', {size: 92, x: 560, y: 640});
    const fly = add(r, `<div class="abs" style="left:760px;top:380px;width:60px;height:42px;border:5px solid ${C.lime};border-radius:6px"></div>`);
    gsap.set(fly, {opacity: 0}); gsap.set(qa(ph, '.bt'), {opacity: 0});
    tl.fromTo(ph, {x: 520, opacity: 0}, {x: 0, opacity: 1, duration: 0.7 * M, ease: 'expo.out'}, 0.2);
    inK(tl, w, 0.6);
    tl.fromTo(fly, {opacity: 1, x: 0, y: 0}, {x: 560, y: -80, opacity: 0, duration: 1 * M, ease: 'power2.in'}, 1.6); sfx(tl, 'whoosh', 1.6);
    typeIn(tl, q(ph, '.ty'), 'Gusano cogollero en el maíz, lado norte. Desde la 1:20.', 2.4, 2.2);
    inK(tl, s2, 3.2, {hv: 0.7});
    tl.to(qa(ph, '.bt'), {opacity: 1, duration: 0.3, stagger: 0.35}, 6.6); sfx(tl, 'tick', 6.6); sfx(tl, 'tick', 6.95);
    tl.to(q(ph, '.bt'), {scale: 0.94, duration: 0.15, yoyo: true, repeat: 1}, 8.6); sfx(tl, 'chime', 8.7);
    tl.set({}, {}, 10);
  }});

/* Acto 5: cierre. */
scene({id:'5', act:5, name:'Escucha, confirma, avisa, aprende', bg:'#CBDB7C', ink:'#074736', light:true, trans:'wipe',
  cap:'pocketnode',
  narr:['Escucha, confirma, avisa y aprende de cada respuesta.',
    'pocketNode: un celular olvidado que cuida la cosecha y el ganado.'],
  build(r, tl) {
    const steps = ['ESCUCHA', 'CONFIRMA', 'AVISA', 'APRENDE'];
    const xs = [360, 760, 1160, 1560];
    const sv = add(r, `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
      <line class="pl" x1="360" y1="420" x2="1560" y2="420" stroke="#074736" stroke-width="10" stroke-dasharray="1200" stroke-dashoffset="1200"/>
      ${xs.map(x => `<circle class="nd" cx="${x}" cy="420" r="44" fill="#074736"/>`).join('')}</svg>`);
    const labs = steps.map((t, i) => { const e = add(r, `<div class="abs M" style="left:${xs[i]}px;top:500px;font:800 34px 'JetBrains Mono';letter-spacing:.08em">${t}</div>`); gsap.set(e, {xPercent: -50, opacity: 0}); return e; });
    const brand = kw(r, 'POCKETNODE', {size: 200, x: 960, y: 760, acc: {6: '#84441A', 7: '#84441A', 8: '#84441A', 9: '#84441A'}});
    gsap.set(brand.L, {opacity: 0});
    tl.to(q(sv, '.pl'), {strokeDashoffset: 0, duration: 2.4 * M, ease: 'none'}, 0.4);
    qa(sv, '.nd').forEach((c, i) => {
      const t = 0.4 + i * 0.8 * M;
      tl.fromTo(c, {scale: 0, svgOrigin: `${xs[i]} 420`}, {scale: 1, svgOrigin: `${xs[i]} 420`, duration: 0.35, ease: 'back.out(1.7)'}, t);
      tl.to(labs[i], {opacity: 1, duration: 0.2}, t);
      sfx(tl, 'tick', t);
    });
    inK(tl, brand, 4.4); sfx(tl, 'bell3', 4.8);
    tl.set({}, {}, 8);
  }});
