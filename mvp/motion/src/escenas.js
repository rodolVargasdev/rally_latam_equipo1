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
  /* Esquema de despliegue: terreno en metros, nodos simplificados con el mismo modelo y cúpulas de cobertura. */
  const F = {};
  function nodeMini() {
    const g = new THREE.Group(), top = new THREE.Group();
    ['case', 'lid', 'phone', 'panel', 'cable', 'mem'].forEach(k => { const c = P[k].clone(true); c.position.copy(P[k].userData.home); top.add(c); });
    top.scale.setScalar(0.3); top.position.y = 2.25; g.add(top);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 16), phys(0x84441a, {roughness: 0.85, clearcoat: 0}));
    post.position.set(0, 1.25, -0.2); g.add(post);
    return g;
  }
  function buildField(mode) {
    if (F[mode]) return F[mode];
    const s2 = new THREE.Scene();
    s2.fog = new THREE.Fog(0x070b09, 110, 190);
    s2.add(new THREE.HemisphereLight(0xf2f6ea, 0x3a2a1a, 0.95));
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.5); sun.position.set(-40, 60, 30); s2.add(sun);
    const W2 = mode === 'flat' ? 150 : 190, D2 = 90;
    const h = mode === 'flat' ? () => 0 : (x, z) => 0.24 * x + 2.2 * Math.sin(z * 0.07) + 1.1 * Math.sin(x * 0.12 + z * 0.05);
    const geo = new THREE.PlaneGeometry(W2, D2, 160, 70); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = [];
    const cA = new THREE.Color(mode === 'flat' ? 0x5b4a30 : 0x6b5434), cB = new THREE.Color(mode === 'flat' ? 0x6d5a3a : 0x84653c);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = h(x, z); pos.setY(i, y);
      const c = cA.clone().lerp(cB, 0.5 + 0.5 * Math.sin(x * 0.3) * Math.sin(z * 0.2)).convertSRGBToLinear(); col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    s2.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1})));
    const dummy = new THREE.Object3D();
    if (mode === 'flat') {
      const n = 2600, im = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 2.3, 5), new THREE.MeshStandardMaterial({color: new THREE.Color(0x8fae4a).convertSRGBToLinear(), roughness: 0.9}), n);
      for (let i = 0; i < n; i++) {
        const row = i % 26, x = -70 + Math.floor(i / 26) * 1.4, z = -26 + row * 2 + Math.sin(i) * 0.2;
        dummy.position.set(x, 1.15, z); dummy.rotation.set(0, i, Math.sin(i * 3) * 0.08); dummy.scale.setScalar(0.85 + 0.3 * Math.abs(Math.sin(i * 7))); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
      }
      s2.add(im);
    } else {
      const solve = (L, z) => { let a = -80, b = 80; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; (h(m, z) < L) ? (a = m) : (b = m); } return a; };
      const spots = [];
      for (let L = -15; L <= 19; L += 2.5) for (let z = -33; z <= 33; z += 2.4) { const x = solve(L + 1.2, z); if (x > -78 && x < 78) spots.push([x, z]); }
      const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.85, 1), new THREE.MeshStandardMaterial({color: new THREE.Color(0x2f5d2c).convertSRGBToLinear(), roughness: 0.95}), spots.length);
      spots.forEach(([x, z], i) => { dummy.position.set(x, h(x, z) + 0.75, z); dummy.scale.set(1, 1.25, 1); dummy.rotation.set(0, i, 0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
      s2.add(im);
      const lm = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.6});
      for (let L = -16; L <= 18; L += 2.5) {
        const pts = [];
        for (let z = -34; z <= 34; z += 1) {
          let a = -80, b = 80;
          for (let k = 0; k < 30; k++) { const m = (a + b) / 2; (h(m, z) < L) ? (a = m) : (b = m); }
          pts.push(new THREE.Vector3(a, h(a, z) + 0.08, z));
        }
        s2.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
      }
    }
    const xs = mode === 'flat' ? [-46, -23, 0, 23, 46] : [-61, -20.5, 20.5, 61];
    const zs = mode === 'flat' ? [0, 0, 0, 0, 0] : [6, 0, -4, 2];
    const nodes = xs.map((x, i) => { const z = zs[i], g = nodeMini(); g.position.set(x, h(x, z), z); g.scale.setScalar(3.4); s2.add(g); return g; });
    const domeM = new THREE.MeshBasicMaterial({color: 0xcbdb7c, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide});
    const ringMat = new THREE.MeshBasicMaterial({color: 0xcbdb7c, transparent: true, opacity: 0.55});
    const domes = nodes.map(nd => {
      const d = new THREE.Group();
      d.add(new THREE.Mesh(new THREE.SphereGeometry(30, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), domeM));
      const rg = new THREE.Mesh(new THREE.TorusGeometry(30, 0.18, 8, 160), ringMat); rg.rotation.x = Math.PI / 2; d.add(rg);
      d.position.copy(nd.position); s2.add(d); return d;
    });
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), new THREE.MeshBasicMaterial({color: 0xcbdb7c, toneMapped: false}));
    s2.add(pulse);
    const cam2 = new THREE.PerspectiveCamera(34, W / H, 0.5, 400);
    return (F[mode] = {s2, cam2, nodes, domes, pulse, h});
  }
  function field(root, s) {
    if (r.domElement.parentNode !== root) root.insertBefore(r.domElement, root.firstChild);
    const f = buildField(s.mode);
    f.cam2.position.set(s.cx, s.cy, s.cz); f.cam2.lookAt(s.lx, s.ly, s.lz);
    f.domes.forEach((d, i) => { const k = Math.min(1, Math.max(0, (s.domes || 0) * f.domes.length - i)); d.visible = k > 0.01; d.scale.setScalar(Math.max(0.01, k)); });
    const p = s.pulse || 0, seg = Math.min(f.nodes.length - 2, Math.floor(p * (f.nodes.length - 1)));
    f.pulse.visible = p > 0.001 && p < 0.999;
    if (f.pulse.visible) {
      const a = f.nodes[seg].position, b = f.nodes[seg + 1].position, u = p * (f.nodes.length - 1) - seg;
      f.pulse.position.lerpVectors(a, b, u); f.pulse.position.y += 6.5 + Math.sin(u * Math.PI) * 3;
    }
    r.render(f.s2, f.cam2);
  }
  function fieldAt(mode, v3) { const f = buildField(mode); v.copy(v3); v.project(f.cam2); return {x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H}; }
  function fieldNodes(mode) { return buildField(mode).nodes.map(n => n.position.clone()); }
  return {render, at, field, fieldAt, fieldNodes};
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
  return items.map(([k, a, b, side, dy = 0]) => {
    const e = add(r, `<div class="co" style="${side === 'l' ? 'flex-direction:row-reverse' : ''}"><i></i><b></b><span>${a}<small>${b}</small></span></div>`);
    gsap.set(e, {opacity: 0});
    return {k, el: e, side, dy};
  });
}
function placeCallouts(list) {
  list.forEach(l => {
    const p = T3.at(l.k), w = l.el.offsetWidth;
    l.el.style.left = (l.side === 'l' ? p.x - w + 5 : p.x - 5) + 'px';
    l.el.style.top = (p.y - l.el.offsetHeight / 2 + l.dy) + 'px';
  });
}

/* Versión de 1:30. Una idea por escena; toda cifra viene de docs/deteccion-tecnica.md y docs/costos.md. */
function fieldLabels(r, mode, spacing) {
  const ns = T3.fieldNodes(mode);
  const gaps = ns.slice(1).map(() => { const e = add(r, `<div class="tagx" style="color:#fff;background:rgba(5,8,7,.55)">${spacing}</div>`); gsap.set(e, {opacity: 0, xPercent: -50, yPercent: -50}); return e; });
  const cov = add(r, `<div class="abs" style="text-align:center;color:#CBDB7C"><div style="font:800 46px Urbanist">30 m de escucha</div><div class="est" style="opacity:.8">supuesto, se mide en el piloto</div></div>`);
  gsap.set(cov, {opacity: 0, xPercent: -50, yPercent: -100});
  return {ns, gaps, cov};
}
function placeField(mode, L) {
  L.gaps.forEach((e, i) => { const a = L.ns[i], b = L.ns[i + 1], m = a.clone().add(b).multiplyScalar(0.5); m.y += 3; const p = T3.fieldAt(mode, m); e.style.left = p.x + 'px'; e.style.top = p.y + 'px'; });
  const c = L.ns[1].clone(); c.y += 31; const p = T3.fieldAt(mode, c); L.cov.style.left = p.x + 'px'; L.cov.style.top = p.y + 'px';
}
function ani(name) { return `<div class="ani">${ANI[name] || ""}</div>`; }

scene({id:'1', label:'Apertura', act:1, name:'pocketNode', bg:'#000', ink:K.ink, trans:'cut',
  cap:'pocketnode',
  narr:['pocketNode: escucha, detecta, protege.'],
  build(r, tl) {
    const lg = add(r, `<div class="abs" style="left:960px;top:470px;width:520px">__LOGO_BLANCO__</div>`);
    gsap.set(lg, {xPercent: -50, yPercent: -50, opacity: 0});
    const w = ['Escucha.', 'Detecta.', 'Protege.'].map((x, i) => txt(r, x, 660 + i * 300, 860, 'kt sm', i === 2 ? `color:${K.lime}` : ''));
    tl.fromTo(lg, {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 1.2 * M, ease: 'power2.out'}, 0.1);
    w.forEach((e, i) => { show(tl, e, 1.1 + i * 0.4, {d: 0.6}); sfx(tl, 'tick', 1.1 + i * 0.4); });
    tl.set({}, {}, 3.4);
  }});

scene({id:'2', label:'Problema', act:1, name:'El problema', bg:K.paper, ink:K.dark, light:true, trans:'fade',
  cap:'el problema',
  narr:['Plagas y depredadores atacan de noche.', 'El productor se entera de día, cuando el daño ya está hecho.'],
  build(r, tl) {
    const a = txt(r, 'Atacan de noche.', 960, 420, 'kt');
    const b = txt(r, 'Se descubre de día.', 960, 600, 'kt', `color:${K.alarm}`);
    show(tl, a, 0.2, {d: 0.6}); show(tl, b, 2.2, {d: 0.6});
    tl.to(a, {opacity: 0.2, duration: 0.4}, 2.2);
    tl.set({}, {}, 4.6);
  }});

scene({id:'3', label:'El nodo', act:2, name:'El nodo', bg:K.black, ink:K.ink, trans:'fade',
  cap:'el nodo',
  narr:['Un celular reciclado, en una caja sellada, con panel solar de diez vatios y batería de respaldo.'],
  build(r, tl, S) {
    const st = S.st = {e: 0, ry: 0.35, rx: 0.12, cz: 17, gx: -0.4, ly: 0.4, ring: 0, moths: 0, noTrap: true};
    S.co = callouts(r, [['panel', 'Panel solar', '10 W, salida USB 5 V', 'r'], ['phone', 'Celular en desuso', 'Android 5 o superior', 'r'],
      ['bank', 'Batería de respaldo', '10.000 mAh, pass-through', 'l'], ['lid', 'Caja IP67', 'contra lluvia y polvo', 'l', -170],
      ['mem', 'Membrana acústica', 'pasa el sonido, no el agua', 'r']]);
    tl.to(st, {e: 1, duration: 1.6 * M, ease: 'power3.inOut'}, 0.2);
    tl.to(st, {ry: -0.25, duration: 10, ease: 'none'}, 0);
    S.co.forEach((c, i) => { tl.to(c.el, {opacity: 1, duration: 0.3}, 1.2 + i * 0.3); sfx(tl, 'tick', 1.2 + i * 0.3); });
    tl.to(S.co.map(c => c.el), {opacity: 0, duration: 0.4}, 5.2);
    tl.to(st, {e: 0, duration: 1.0 * M, ease: 'power3.inOut'}, 5.3);
    tl.to(st, {ring: 1, duration: 0.5}, 6.2);
    tl.set({}, {}, 7.2);
  },
  frame(n) { T3.render(this.root, this.st, localT(this, n)); placeCallouts(this.co); }});

scene({id:'4', label:'Escucha', act:3, name:'Cómo escucha', bg:K.black, ink:K.ink, trans:'fade',
  cap:'cómo escucha',
  narr:['Graba el sonido, lo convierte en un espectrograma, y un modelo abierto de Google lo clasifica dentro del celular, sin internet.'],
  build(r, tl, S) {
    add(r, q3('Cómo escucha', 'Del sonido al aviso'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const wv = add(r, `<canvas class="abs" width="1600" height="160" style="left:160px;top:340px;width:1600px;height:160px"></canvas>`);
    const sp = add(r, `<canvas class="abs" width="900" height="320" style="left:160px;top:560px;width:900px;height:320px;border-radius:14px"></canvas>`);
    S.wv = wv; S.sp = sp; gsap.set([wv, sp], {opacity: 0});
    const l2 = add(r, `<div class="abs" style="left:160px;top:900px;font:600 24px Urbanist;opacity:0">16 kHz | 0,96 s | 64 bandas | YAMNet, 521 clases</div>`);
    const cls = [['Perro', 0.91], ['Vaca', 0.04], ['Lluvia', 0.03]];
    const box = add(r, `<div class="abs" style="left:1160px;top:580px;width:600px;display:grid;gap:22px">
      ${cls.map(([n]) => `<div class="row2"><span style="width:150px">${n}</span><div style="flex:1;background:rgba(255,255,255,.1);border-radius:9px"><div class="bar2" style="transform:scaleX(0)"></div></div><span class="v" style="width:90px;text-align:right">0,00</span></div>`).join('')}
      <div class="est">ilustrativo</div></div>`);
    const sms = txt(r, 'SMS', 1460, 470, 'kt', `color:${K.lime}`);
    gsap.set(box, {opacity: 0});
    tl.to(qq, {opacity: 1, duration: 0.5, stagger: 0.1}, 0.1);
    tl.to(wv, {opacity: 1, duration: 0.4}, 0.6);
    tl.to(sp, {opacity: 1, duration: 0.4}, 2.2); tl.to(l2, {opacity: 0.7, duration: 0.4}, 2.4);
    tl.to(box, {opacity: 1, duration: 0.4}, 4.4);
    qa(box, '.row2').forEach((row, i) => {
      const p = {v: 0};
      tl.to(q(row, '.bar2'), {scaleX: cls[i][1], duration: 0.9, ease: 'power3.out'}, 4.6 + i * 0.1);
      tl.to(p, {v: cls[i][1], duration: 0.9, ease: 'power3.out'}, 4.6 + i * 0.1);
      bind(q(row, '.v'), () => p.v.toFixed(2).replace('.', ','));
    });
    tl.to(q(box, '.row2'), {color: K.lime, duration: 0.3}, 5.6); sfx(tl, 'chime', 5.6);
    show(tl, sms, 6.4, {d: 0.5}); sfx(tl, 'hit', 6.5, 0.6);
    tl.set({}, {}, 7.6);
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
        s.fillStyle = `rgb(${Math.round(lerp(5, 203, v))},${Math.round(lerp(12, 219, v))},${Math.round(lerp(10, 124, v))})`;
        s.fillRect(c * cw, 320 - (k + 1) * bh, cw + 0.5, bh + 0.5);
      }
    }
  }});

scene({id:'5', label:'Animales', act:3, name:'Qué detecta', bg:K.black, ink:K.ink, trans:'fade',
  cap:'qué detecta',
  narr:['Perros, vacas y cerdos: el modelo ya los conoce.', 'Aves, tacuazín, mapache, zorro y cotusa se entrenan en el piloto.',
    'Los insectos siguen en investigación.'],
  build(r, tl) {
    const G3 = [['Alta confianza', K.lime, [['perro', 'Perro'], ['vaca', 'Vaca'], ['porcino', 'Cerdo']]],
      ['A entrenar en el piloto', K.leaf, [['ave', 'Aves'], ['tacuazin', 'Tacuazín'], ['mapache', 'Mapache'], ['zorro', 'Zorro'], ['cotusa', 'Cotusa']]],
      ['En investigación', '#e9c445', [['polilla', 'Polilla'], ['plaga_voladora', 'Plaga voladora'], ['gusano', 'Gusano'], ['escarabajo', 'Escarabajo'], ['broca', 'Broca']]]];
    const rows = G3.map(([h, c, items], i) => add(r, `<div class="abs arow" style="left:150px;top:${120 + i * 310}px;width:1620px;color:${c}">
      <div class="ah">${h}</div><div class="ag">${items.map(([k, n]) => `<div class="ai">${ani(k)}<span>${n}</span></div>`).join('')}</div></div>`));
    rows.forEach(rw => gsap.set(qa(rw, '.ah, .ai'), {opacity: 0}));
    [0.2, 2.6, 5.6].forEach((t, i) => {
      tl.fromTo(q(rows[i], '.ah'), {opacity: 0, x: -30}, {opacity: 1, x: 0, duration: 0.4}, t);
      tl.fromTo(qa(rows[i], '.ai'), {opacity: 0, y: 30, scale: 0.85}, {opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.12}, t + 0.2);
      sfx(tl, 'tick', t + 0.2);
    });
    tl.set({}, {}, 7.8);
  }});

scene({id:'6', label:'Celular', act:4, name:'El aviso en el celular', bg:K.black, ink:K.ink, trans:'fade',
  cap:'el aviso',
  narr:['El SMS y el WhatsApp solo informan: qué detectó, con qué confianza y en qué zona.', 'La app agrega el semáforo, la lectura en voz alta y el mapa de la zona.'],
  build(r, tl) {
    const ph = (x, label, inner, bg) => add(r, `<div class="abs pux" style="left:${x}px;top:150px">
      <div class="puxl">${label}</div><div class="puxf"><div class="puxs" style="background:${bg}">${inner}</div></div></div>`);
    const msg = '<b>pocketNode | AVISO</b>Perros detectados<br>Confianza: 87 %<br>Zona: corral norte, nodo 3<br>Hora: 2:14';
    const a = ph(190, 'SMS, sin datos', `<div class="pt">2:16</div><div class="pd">viernes</div><div class="pn">${msg}</div>`, '#0d1512');
    const b = ph(760, 'La app', `<div class="pbar"><span>2:16</span><span>74%</span></div>
      <div class="pbig" style="padding-bottom:14px"><svg viewBox="0 0 64 64" width="80" height="80"><circle cx="32" cy="32" r="30" fill="#fff"/><path d="M32 14 v22 M32 44 v4" stroke="#C0392B" stroke-width="8" stroke-linecap="round"/></svg>
      <b>Perros cerca<br>del corral</b><span>Confianza 87 % | 2:14</span></div>
      <div class="pmap"><i class="z"></i><i class="n"></i><span>corral norte, nodo 3</span></div>
      <div class="pbtn spk">Escuchar</div><div class="pbtn yes">Ver la zona</div>`, '#C0392B');
    const c = ph(1330, 'WhatsApp', `<div class="pwh">pocketNode</div>
      <div class="pbub"><b>AVISO</b><br>Perros detectados cerca del corral.<br>Confianza: 87 %<br>Zona: corral norte, unos 30 m alrededor del nodo 3<br>Hora: 2:14</div>
      <div class="pinfo">Mensaje informativo: no requiere respuesta</div>`, '#e9ddd0');
    const wave = add(r, `<div class="abs" style="left:1176px;top:688px;display:flex;gap:6px;align-items:center;opacity:0">${[18, 34, 52, 30, 44, 22].map(h => `<i style="display:block;width:7px;height:${h}px;border-radius:4px;background:${K.lime}"></i>`).join('')}</div>`);
    const tap = add(r, `<div class="abs" style="left:960px;top:797px;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:4px solid #fff;opacity:0"></div>`);
    [a, b, c].forEach(e => gsap.set(e, {opacity: 0}));
    const pin = q(b, '.pmap .z'); gsap.set(pin, {scale: 0.2, opacity: 0});
    show(tl, a, 0.2, {d: 0.6}); sfx(tl, 'chime', 0.5);
    tl.fromTo(q(a, '.pn'), {y: -60, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.6)'}, 0.6);
    show(tl, c, 1.8, {d: 0.6});
    tl.fromTo(q(c, '.pbub'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.4}, 2.2); sfx(tl, 'tick', 2.2);
    show(tl, b, 4.2, {d: 0.6});
    tl.to(wave, {opacity: 1, duration: 0.3}, 5.2);
    tl.fromTo(qa(wave, 'i'), {scaleY: 0.3}, {scaleY: 1, duration: 0.25, yoyo: true, repeat: 5, stagger: 0.05, ease: 'sine.inOut'}, 5.2);
    tl.to(tap, {opacity: 1, duration: 0.1}, 6.6); tl.fromTo(tap, {scale: 1.4}, {scale: 0.8, duration: 0.35, immediateRender: false}, 6.6);
    tl.to(tap, {opacity: 0, duration: 0.3}, 7.1); sfx(tl, 'tick', 6.7);
    tl.to(pin, {opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)'}, 6.9);
    tl.set({}, {}, 8.2);
  }});

scene({id:'7', label:'Hectárea', act:4, name:'Seis nodos por hectárea', bg:K.black, ink:K.ink, trans:'fade',
  cap:'seis por hectárea',
  narr:['Seis nodos por hectárea, a unos cuarenta y un metros: con treinta metros de escucha, la cobertura queda justa.'],
  build(r, tl, S) {
    S.st = {mode: 'slope', cx: -80, cy: 40, cz: 95, lx: -5, ly: 2, lz: 0, domes: 0, pulse: 0};
    const t1 = txt(r, '6 nodos por hectárea', 960, 110, 'kt sm');
    S.L = fieldLabels(r, 'slope', '41 m');
    show(tl, t1, 0.2, {d: 0.6});
    tl.to(S.st, {cx: 30, cy: 52, cz: 105, lx: 6, ly: 6, duration: 8, ease: 'power1.inOut'}, 0);
    tl.to(S.L.gaps, {opacity: 1, duration: 0.3, stagger: 0.2}, 1.2);
    tl.to(S.st, {domes: 1, duration: 1.8, ease: 'power2.out'}, 2.6);
    tl.to(S.L.cov, {opacity: 1, duration: 0.4}, 3.6);
    tl.to(S.st, {pulse: 1, duration: 2.4, ease: 'none'}, 4.8);
    [0, 1, 2].forEach(i => sfx(tl, 'tick', 4.8 + i * 0.8));
    sfx(tl, 'chime', 7.2);
    tl.set({}, {}, 7.8);
  },
  frame() { T3.field(this.root, this.st); placeField('slope', this.L); }});

scene({id:'8', label:'Precio', act:5, name:'Precio por nodo', bg:K.paper, ink:K.dark, light:true, trans:'fade',
  cap:'precio',
  narr:['Cada nodo cuesta entre treinta y seis y sesenta y dos dólares, con el celular donado.', 'Y puede bajar: una entidad que use los datos del campo subsidia parte del costo.'],
  build(r, tl) {
    add(r, q3('Precio por nodo', 'USD 36 a 62'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const items = [['Celular', '0', 0, 0], ['Panel 10 W USB', '12 a 20', 12, 20], ['Batería 10.000 mAh', '12 a 25', 12, 25], ['Caja IP67', '7 a 9', 7, 9], ['Cables, aislamiento, SIM', '5 a 7,5', 5, 7.5]];
    const sx = 18;
    const rows = items.map(([n, l, a, b], i) => add(r, `<div class="abs" style="left:160px;top:${370 + i * 92}px;display:flex;align-items:center;gap:28px">
      <div style="width:380px;font:700 32px Urbanist">${n}</div>
      <div style="position:relative;width:${25 * sx}px;height:30px"><div class="f" style="position:absolute;left:0;top:0;height:30px;border-radius:15px;background:${K.green};width:${Math.max(a, 0.4) * sx}px;transform-origin:0 50%;transform:scaleX(0)"></div>
      <div class="g" style="position:absolute;left:0;top:0;height:30px;border-radius:15px;background:${K.green};opacity:.3;width:${Math.max(b, 0.4) * sx}px;transform-origin:0 50%;transform:scaleX(0)"></div></div>
      <div style="font:600 30px Urbanist;opacity:.7">${i === 0 ? 'donado' : 'USD ' + l}</div></div>`));
    gsap.set(rows, {opacity: 0});
    const ha = add(r, `<div class="abs" style="left:1380px;top:120px;width:400px;padding:30px;border-radius:24px;background:${K.green};color:#fff">
      <div class="est" style="opacity:.8;color:${K.lime}">6 nodos por hectárea</div><div style="font:800 64px/1.1 Urbanist;margin-top:10px">USD 216<br>a 369</div><div style="font:500 22px Urbanist;opacity:.75;margin-top:14px">más el saldo de SMS</div></div>`);
    const note = add(r, `<div class="abs est" style="left:160px;top:960px;opacity:0">referencias de tienda consultadas el 16-10-2026; detalle y fuentes en docs/costos.md</div>`);
    const sub = add(r, `<div class="abs" style="left:1380px;top:520px;width:400px;padding:30px;border-radius:24px;background:${K.lime};color:${K.dark}">
      <div class="est" style="opacity:.8">con subsidio por datos</div><div style="font:800 54px/1.1 Urbanist;margin-top:10px">USD 18 a 31</div><div style="font:500 22px Urbanist;opacity:.75;margin-top:14px">por nodo, si la entidad cubre el 50 % (ejemplo)</div></div>`);
    gsap.set([ha, sub], {opacity: 0});
    tl.to(qq, {opacity: 1, duration: 0.5, stagger: 0.1}, 0.1);
    rows.forEach((e, i) => { show(tl, e, 0.6 + i * 0.3, {d: 0.4}); tl.to(qa(e, '.f, .g'), {scaleX: 1, duration: 0.6, ease: 'power3.out'}, 0.8 + i * 0.3); });
    tl.to(note, {opacity: 0.55, duration: 0.4}, 2.8);
    show(tl, ha, 3.6, {d: 0.6});
    show(tl, sub, 5.6, {d: 0.6}); sfx(tl, 'chime', 5.8);
    tl.set({}, {}, 9.2);
  }});

scene({id:'8a', label:'Tablero', act:5, name:'Tablero para la entidad aliada', bg:K.black, ink:K.ink, trans:'fade',
  cap:'tablero',
  narr:['A cambio, la entidad recibe un tablero con datos agregados y con permiso del productor: eventos por zona, especies y estado de la red.'],
  build(r, tl) {
    add(r, q3('Para la entidad aliada', 'Datos del campo'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const heat = [[300, 210, 70, 0.75], [520, 320, 50, 0.5], [700, 180, 40, 0.35], [380, 420, 36, 0.3], [760, 400, 60, 0.6]];
    let nodes = '';
    for (let i = 0; i < 18; i++) nodes += `<circle cx="${120 + (i % 6) * 140}" cy="${110 + Math.floor(i / 6) * 160}" r="7" fill="#CBDB7C"/>`;
    const map = add(r, `<div class="abs dpan" style="left:160px;top:300px;width:900px;height:560px">
      <div class="dt">Eventos por zona | esta semana</div>
      <svg width="900" height="500" viewBox="0 0 900 500"><rect x="20" y="10" width="860" height="470" rx="18" fill="#122a21"/>
      <path d="M40 260 C 240 200 420 300 860 230" stroke="#2a5a4a" stroke-width="3" fill="none"/><path d="M40 360 C 300 330 520 400 860 340" stroke="#2a5a4a" stroke-width="3" fill="none"/>
      ${heat.map(([x, y, rr, o]) => `<circle class="h" cx="${x}" cy="${y}" r="${rr}" fill="#C0392B" opacity="${o}"/>`).join('')}${nodes}</svg></div>`);
    const kpi = [['Nodos activos', '42 de 42'], ['Fincas', '7'], ['Eventos esta semana', '318'], ['Más frecuente', 'Perros']];
    const cards = kpi.map(([t, v], i) => add(r, `<div class="abs dk" style="left:${1120 + (i % 2) * 330}px;top:${300 + Math.floor(i / 2) * 170}px"><span>${t}</span><b>${v}</b></div>`));
    const nights = [22, 41, 35, 68, 52, 47, 53];
    const chart = add(r, `<div class="abs dpan" style="left:1120px;top:650px;width:640px;height:210px">
      <div class="dt">Eventos por noche</div><div class="dbars">${nights.map(v => `<i style="height:${v * 2}px"></i>`).join('')}</div></div>`);
    const chip = add(r, `<div class="abs est" style="left:160px;top:900px;color:${K.lime};opacity:0">datos de ejemplo | agregados y con permiso del productor</div>`);
    gsap.set([map, ...cards, chart], {opacity: 0});
    gsap.set(qa(map, '.h'), {scale: 0, transformOrigin: '50% 50%'});
    tl.to(qq, {opacity: 1, duration: 0.5, stagger: 0.1}, 0.1);
    show(tl, map, 0.5, {d: 0.6});
    tl.to(qa(map, '.h'), {scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.6)'}, 1.0);
    cards.forEach((e, i) => { show(tl, e, 1.8 + i * 0.25, {d: 0.4}); sfx(tl, 'tick', 1.8 + i * 0.25); });
    show(tl, chart, 3.0, {d: 0.5});
    tl.fromTo(qa(chart, '.dbars i'), {scaleY: 0}, {scaleY: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', transformOrigin: '50% 100%'}, 3.2);
    tl.to(chip, {opacity: 0.85, duration: 0.4}, 4.4);
    tl.set({}, {}, 7.2);
  }});

scene({id:'8b', label:'Socios', act:5, name:'Socios clave', bg:K.black, ink:K.ink, trans:'fade',
  cap:'socios clave',
  narr:['Socios por convocar: MAG, CENTA, PROCAFE, cooperativas, operadoras y donantes.'],
  build(r, tl) {
    add(r, q3('Socios clave', 'Quién lo hace posible'));
    const qq = qa(r, '.kq, .kt.md'); gsap.set(qq, {opacity: 0});
    const S6 = [['MAG', 'alcance a productores'], ['CENTA', 'validación agronómica'], ['PROCAFE', 'piloto en fincas de café'],
      ['Cooperativas', 'instalan y dan soporte'], ['Operadoras', 'SIM y envío de SMS'], ['Donantes y recicladores', 'celulares en desuso']];
    const cards = S6.map(([n, d], i) => add(r, `<div class="abs soc" style="left:${160 + (i % 3) * 540}px;top:${360 + Math.floor(i / 3) * 250}px">
      <b>${n}</b><span>${d}</span></div>`));
    gsap.set(cards, {opacity: 0});
    const note = add(r, `<div class="abs est" style="left:160px;top:900px;opacity:0;color:${K.lime}">propuestos, sin acuerdo firmado</div>`);
    tl.to(qq, {opacity: 1, duration: 0.5, stagger: 0.1}, 0.1);
    cards.forEach((e, i) => { show(tl, e, 0.5 + i * 0.55, {d: 0.45}); sfx(tl, 'tick', 0.5 + i * 0.55); });
    tl.to(note, {opacity: 0.85, duration: 0.4}, 4);
    tl.set({}, {}, 6.2);
  }});

scene({id:'9', label:'Cierre', act:6, name:'Cierre', bg:'#000', ink:K.ink, trans:'fade',
  cap:'cierre',
  narr:['Escucha. Detecta. Protege.'],
  build(r, tl) {
    const lg = add(r, `<div class="abs" style="left:960px;top:440px;width:460px">__LOGO_BLANCO__</div>`);
    gsap.set(lg, {xPercent: -50, yPercent: -50, opacity: 0});
    const w = ['Escucha.', 'Detecta.', 'Protege.'].map((x, i) => txt(r, x, 660 + i * 300, 820, 'kt sm', i === 2 ? `color:${K.lime}` : ''));
    tl.fromTo(lg, {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 1.2 * M, ease: 'power2.out'}, 0.1);
    w.forEach((e, i) => { show(tl, e, 0.6 + i * 0.4, {d: 0.5}); sfx(tl, 'tick', 0.6 + i * 0.4); });
    sfx(tl, 'bell3', 1.8);
    tl.set({}, {}, 4.2);
  }});
