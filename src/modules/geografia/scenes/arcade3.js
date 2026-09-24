/* =====================================================================
   scenes/arcade3.js — ARCADE DO MUNDO 3 (O Brasil que Muda)
   Recompensa depois do chefe Vírus da Desigualdade. Jogos curtos, sem
   perguntas, com tempo/vidas e recorde:
   • Estrada Brasil — corrida em pseudo-3D pela estrada (litoral,
     cerrado e cidade), ultrapassando carros e pegando checkpoints
     (estilo Top Gear do Super Nintendo / OutRun)
   • Invasores da Poluição — nave solar limpa nuvens de fumaça que
     descem em formação e mergulham (estilo Galaga / Space Invaders);
     a cada fumaça limpa o céu da cidade fica mais azul
   • Empilha-Prédios — o guindaste balança; solte o andar na hora
     certa e faça a cidade crescer (estilo Tower Bloxx / Stack)
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ ESTRADA BRASIL */
  const ZONES = [
    { name: 'Litoral', sky: 'estrada', grass: ['#3fae52', '#37a049'], rumble: ['#e5484d', '#fff'], road: ['#6b6f7a', '#666a75'], prop: ['treePalm', 'treePalm', 'house1'] },
    { name: 'Cerrado', sky: 'interior', grass: ['#c98f4d', '#bd8444'], rumble: ['#ffd23f', '#fff'], road: ['#7a6b5a', '#746553'], prop: ['treeOrange', 'cactus2', 'tree'] },
    { name: 'Cidade', sky: 'cidadeDia', grass: ['#7f8a96', '#77828e'], rumble: ['#3ec1ff', '#fff'], road: ['#4a4f5c', '#454a57'], prop: ['house2', 'tower', 'houseAlt1'] }
  ];
  PQ.register({ id: 'w3_estrada', world: 3, boss: 'c3s6', ref: 'Top Gear (SNES) / OutRun', title: 'Estrada Brasil', icon: 'carro_corrida', c1: '#ff4d6d', c2: '#4a0a1a', music: 'corrida', medals: [1500, 3000, 5000], unit: 'pts',
    desc: 'Corrida pela estrada do litoral ao interior e à cidade! Ultrapasse carros e alcance os checkpoints antes do tempo acabar.',
    how: 'O carro acelera sozinho. **← →** fazem a curva, **↓** freia e **Espaço** usa o **turbo** (3 cargas). Fora da pista o carro fica lento! Cada **checkpoint** dá mais tempo.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const SEG = 200, RW = 2000, CAMH = 1000, DRAW = 110, N = 1500;
    const segs = [];
    for (let i = 0; i < N; i++) {
      const zi = Math.floor(i / (N / 3));
      const curve = Math.sin(i / 37) * 3.2 * (Math.sin(i / 173) > -0.2 ? 1 : 0) + (i % 300 > 240 ? 4 * Math.sign(Math.sin(i / 60)) : 0);
      const hill = Math.sin(i / 55) * 1600 + Math.sin(i / 19) * 300;
      segs.push({ i, curve, y: hill, zone: zi, prop: i % 9 === 0 ? { side: (i / 9) % 2 ? -1 : 1, off: 1.4 + (i % 4) * 0.25, k: ZONES[zi].prop[i % 3] } : null, cp: i % 250 === 0 && i > 0 });
    }
    let pos = 0, px = 0, speed = 0, time = 45, playing = false, turbo = 3, boost = 0, dist = 0, over = 0, lastCp = 0, zoneAnn = 0, crash = 0;
    const MAX = 12000;
    const cars = [];
    for (let i = 0; i < 26; i++) cars.push({ z: 3000 + i * 11000 + Math.random() * 4000, x: U.pick([-0.5, 0, 0.5]), speed: 5000 + Math.random() * 3000, col: U.pick(['#3ec1ff', '#ffd23f', '#35e07a', '#b07bff', '#ff9a3d', '#f4f4f4']), passed: false });
    sc.begin = () => { playing = true; api.goal('Zona: Litoral — chegue aos checkpoints!'); };
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time -= dt; api.extra('cronometro', Math.max(0, Math.ceil(time)) + 's');
      if (crash > 0) crash -= dt; if (boost > 0) boost -= dt; if (zoneAnn > 0) zoneAnn -= dt;
      if (I.pressed('jump') && turbo > 0 && boost <= 0) { turbo--; boost = 2.5; GG.audio.sfx('boost'); if (X()) X().flash('#9ff2ff', 0.2); }
      const off = Math.abs(px) > 1.05;
      const top = (boost > 0 ? MAX * 1.35 : MAX) * (off ? 0.45 : 1);
      if (crash > 0) speed = Math.max(speed - MAX * 2 * dt, MAX * 0.2);
      else if (I.down('down')) speed = Math.max(0, speed - MAX * 1.2 * dt);
      else speed += (top - speed) * Math.min(1, dt * (speed < top ? 0.55 : 2));
      const seg = segs[Math.floor(pos / SEG) % N];
      px -= seg.curve * 0.0006 * speed * dt * 0.018; // força centrífuga das curvas
      px += I.axisX() * dt * 2.4 * (speed / MAX + 0.25);
      px = U.clamp(px, -2.2, 2.2);
      pos += speed * dt; dist += speed * dt;
      if (off && speed > MAX * 0.5 && Math.random() < 0.3 && X()) X().puff(200 + U.rand(-10, 10), 206, 1);
      const si = Math.floor(pos / SEG);
      if (segs[si % N].cp && si !== lastCp) { lastCp = si; time += 22; api.add(300); GG.audio.sfx('win'); if (X()) { X().flash('#fff6c0', 0.25); X().pop(200, 70, 'CHECKPOINT! +22 s', '#7bff8f', 11); } }
      const zi = segs[si % N].zone; if (zi !== sc._zone) { sc._zone = zi; zoneAnn = 2.5; api.goal('Zona: ' + ZONES[zi].name); }
      cars.forEach((cr) => {
        cr.z += cr.speed * dt;
        const dz = ((cr.z - pos) % (N * SEG) + N * SEG) % (N * SEG);
        if (dz < 300 && dz > 0 && Math.abs(cr.x - px) < 0.45 && crash <= 0) { crash = 1; speed *= 0.4; GG.audio.sfx('hit'); E.shake(5, 0.4); if (X()) X().flash('#ff4d4d', 0.3); api.add(-50); }
        if (!cr.passed && dz > N * SEG - 400) { cr.passed = true; api.add(60); if (X()) X().pop(200, 130, 'ULTRAPASSOU! +60', '#ffd23f', 8); }
        if (dz > 2000 && dz < N * SEG - 2000) cr.passed = false;
      });
      if (Math.floor(dist / 1000) !== Math.floor((dist - speed * dt) / 1000)) api.add(5);
      if (time <= 0) { playing = false; over = 1; GG.audio.sfx('bad'); setTimeout(() => api.end(api.score, 'Distância: ' + (dist / 20000).toFixed(1) + ' km. Use o turbo nas retas!'), 900); }
    };
    function quad(c, x1, y1, w1, x2, y2, w2, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x1 - w1, y1); c.lineTo(x2 - w2, y2); c.lineTo(x2 + w2, y2); c.lineTo(x1 + w1, y1); c.closePath(); c.fill(); }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      const base = Math.floor(pos / SEG), frac = (pos % SEG) / SEG;
      const Z = ZONES[segs[base % N].zone];
      if (!(x && x.sky(g, Z.sky, base * 4 + px * 30, 0, sc.t, { horizon: 112 }))) { c.fillStyle = '#7fd4ff'; c.fillRect(0, 0, E.W, E.H); }
      const camY = CAMH + segs[base % N].y + (segs[(base + 1) % N].y - segs[base % N].y) * frac;
      let dx = -segs[base % N].curve * frac, xc = 0, maxY = E.H;
      const proj = [];
      for (let n = 0; n < DRAW; n++) {
        const s = segs[(base + n) % N], z = (n + 1 - frac) * SEG + 1;
        const scale = 0.9 / z * 180;
        xc += dx; dx += s.curve;
        const sx = E.W / 2 + (-px * RW * scale) + xc * scale * 1.5, sy = 112 + (camY - s.y) * scale * 0.9, sw = RW * scale;
        proj.push({ s, sx, sy, sw, scale });
      }
      for (let n = DRAW - 1; n > 0; n--) {
        const a = proj[n - 1], b = proj[n], s = b.s, zc = ZONES[s.zone], alt = Math.floor((base + n) / 3) % 2;
        if (a.sy <= b.sy) continue;
        c.fillStyle = zc.grass[alt]; c.fillRect(0, b.sy, E.W, a.sy - b.sy + 1);
        quad(c, a.sx, a.sy, a.sw * 1.15, b.sx, b.sy, b.sw * 1.15, zc.rumble[alt]);
        quad(c, a.sx, a.sy, a.sw, b.sx, b.sy, b.sw, zc.road[alt]);
        if (alt) quad(c, a.sx, a.sy, a.sw * 0.03, b.sx, b.sy, b.sw * 0.03, '#fff');
        if (s.cp) { quad(c, a.sx, a.sy, a.sw, b.sx, b.sy, b.sw, Math.floor(sc.t * 6) % 2 ? '#fff' : '#15152a'); }
      }
      // objetos na beira e carros (de trás para frente)
      for (let n = DRAW - 1; n > 0; n--) {
        const b = proj[n], s = b.s;
        if (s.prop && x) { const im = x.img[s.prop.k]; if (im) { const h = 900 * b.scale * (s.prop.k === 'tower' ? 1.5 : 1), w = h * im.width / im.height, xx = b.sx + s.prop.side * b.sw * s.prop.off; if (h > 1.5) x.hd(c, () => c.drawImage(im, xx - w / 2, b.sy - h, w, h)); } }
        if (s.cp && n < 60) { const h = 500 * b.scale; c.fillStyle = '#15152a'; c.fillRect(b.sx - b.sw * 1.1, b.sy - h, 3, h); c.fillRect(b.sx + b.sw * 1.1, b.sy - h, 3, h); c.fillStyle = '#ffd23f'; c.fillRect(b.sx - b.sw * 1.1, b.sy - h, b.sw * 2.2, h * 0.25); if (h > 20) g.text('CHECKPOINT', b.sx, b.sy - h + 1, { size: Math.max(4, h * 0.14), color: '#15152a', align: 'center', shadow: false }); }
        cars.forEach((cr) => {
          const dz = ((cr.z - pos) % (N * SEG) + N * SEG) % (N * SEG), cn = Math.floor(dz / SEG);
          if (cn !== n) return;
          const w = 360 * b.scale, h = w * 0.55, cx = b.sx + cr.x * b.sw;
          c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(cx - w / 2, b.sy - h * 0.1, w, h * 0.15);
          c.fillStyle = cr.col; c.fillRect(cx - w / 2, b.sy - h, w, h * 0.8); c.fillStyle = 'rgba(20,30,60,.7)'; c.fillRect(cx - w * 0.35, b.sy - h * 1.1, w * 0.7, h * 0.35);
          c.fillStyle = '#ff3b3b'; c.fillRect(cx - w / 2 + 1, b.sy - h * 0.55, w * 0.15, h * 0.12); c.fillRect(cx + w / 2 - 1 - w * 0.15, b.sy - h * 0.55, w * 0.15, h * 0.12);
          c.fillStyle = '#15152a'; c.fillRect(cx - w / 2, b.sy - h * 0.2, w * 0.2, h * 0.2); c.fillRect(cx + w * 0.3, b.sy - h * 0.2, w * 0.2, h * 0.2);
        });
      }
      // carro do jogador (visto de trás)
      const bump = Math.sin(sc.t * 30) * (speed / MAX) * 0.8 + (crash > 0 ? Math.sin(sc.t * 40) * 3 : 0), steer = IN().axisX(), cx = 200, cy = 200 + bump;
      if (boost > 0 && x) { x.glow(c, cx - 14, cy + 4, 12, '#6fe8ff', 0.9); x.glow(c, cx + 14, cy + 4, 12, '#6fe8ff', 0.9); }
      c.save(); c.translate(cx, cy); c.rotate(steer * 0.06);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-30, 4, 60, 6);
      c.fillStyle = '#c0182a'; c.fillRect(-28, -14, 56, 18); c.fillStyle = '#e5484d'; c.fillRect(-24, -26, 48, 13);
      c.fillStyle = '#1a2a4a'; c.fillRect(-19, -24, 38, 9); c.fillStyle = '#ffd23f'; c.fillRect(-26, -9, 10, 4); c.fillRect(16, -9, 10, 4);
      c.fillStyle = '#15152a'; c.fillRect(-30, -4, 10, 10); c.fillRect(20, -4, 10, 10); c.fillStyle = '#fff'; c.fillRect(-6, -8, 12, 5); g.text('BR', 0, -8, { size: 4, color: '#15152a', align: 'center', shadow: false });
      c.fillStyle = '#8a1020'; c.fillRect(-30, -30, 60, 4);
      c.restore();
      // painel
      g.panel(8, 186, 70, 30, 'rgba(15,18,38,.85)', '#3a4290');
      g.text(Math.round(speed / MAX * 180) + ' km/h', 43, 190, { size: 6, color: '#fff', align: 'center' });
      for (let i = 0; i < 3; i++) g.rect(18 + i * 16, 204, 12, 6, i < turbo ? '#6fe8ff' : '#333a66'); g.text('TURBO', 43, 210, { size: 3, color: '#9ff2ff', align: 'center' });
      g.text(Math.max(0, Math.ceil(time)) + '', E.W / 2, 8, { size: 14, color: time < 10 && Math.floor(sc.t * 4) % 2 ? '#ff5d6c' : '#ffd23f', align: 'center' });
      if (zoneAnn > 0) g.text('ZONA: ' + ZONES[segs[base % N].zone].name.toUpperCase(), E.W / 2, 34, { size: 9, color: '#fff', align: 'center' });
      if (over) g.text('TEMPO ESGOTADO!', E.W / 2, 90, { size: 12, color: '#ff5d6c', align: 'center' });
    };
    sc.dbg = { end() { time = -999; } };
    return sc;
  });

  /* ================================================================ INVASORES DA POLUIÇÃO */
  PQ.register({ id: 'w3_invasores', world: 3, boss: 'c3s6', ref: 'Galaga / Space Invaders', title: 'Invasores da Poluição', icon: 'fabrica', c1: '#5a6b8a', c2: '#1a2233', music: 'chefe', medals: [800, 1800, 3200], unit: 'pts',
    desc: 'Nuvens de fumaça invadem a cidade! Pilote a nave solar e limpe o céu com raios de energia limpa.',
    how: '**← →** movem a nave solar, **Espaço** (ou toque) dispara. Fumaças descem em formação e algumas **mergulham**! Pegue **raio** (tiro triplo), **escudo** e **coração**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ship = { x: 200, y: 200, inv: 0, triple: 0, shield: 0 };
    let foes = [], shots = [], drops = [], caps = [], wave = 0, playing = false, cool = 0, clean = 0, time = 0, touchX = null, firing = false, waveAnn = 0;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointerdown: (lx) => { touchX = lx; firing = true; }, pointermove: (lx, ly, ev) => { if (firing || ev.pointerType === 'mouse') touchX = lx; }, pointerup: () => { firing = false; } });
    function newWave() {
      wave++; waveAnn = 2; foes = [];
      const rows = Math.min(5, 3 + Math.floor(wave / 2));
      for (let r = 0; r < rows; r++) for (let q = 0; q < 8; q++) foes.push({ hx: 60 + q * 38, hy: 36 + r * 20, x: 60 + q * 38, y: -30 - r * 20 - q * 6, k: r === 0 ? 'fabrica' : r % 2 ? 'fumaca' : 'lixo', hp: r === 0 ? 2 : 1, dive: 0, enter: 1 });
      api.goal('Onda ' + wave + ': limpe o céu!');
    }
    sc.begin = () => { playing = true; newWave(); };
    function hit() {
      if (ship.inv > 0) return;
      if (ship.shield > 0) { ship.shield = 0; ship.inv = 1; GG.audio.sfx('shield'); return; }
      api.lives--; api.refresh(); ship.inv = 2; GG.audio.sfx('hit'); E.shake(5, 0.3); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ondas limpas: ' + (wave - 1) + '. O céu ficou ' + Math.round(clean * 100) + '% mais limpo!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (waveAnn > 0) waveAnn -= dt;
      if (!playing) return;
      time += dt; api.extra('sol', 'Onda ' + wave);
      if (ship.inv > 0) ship.inv -= dt; if (ship.triple > 0) ship.triple -= dt; if (ship.shield > 0) ship.shield -= dt;
      const ax = I.axisX(); if (ax) { ship.x += ax * 170 * dt; touchX = null; } else if (touchX != null) ship.x += U.clamp(touchX - ship.x, -170 * dt, 170 * dt);
      ship.x = U.clamp(ship.x, 14, E.W - 14);
      cool -= dt;
      if ((I.down('jump') || I.down('act') || firing) && cool <= 0) { cool = 0.28; (ship.triple > 0 ? [-0.25, 0, 0.25] : [0]).forEach((a) => shots.push({ x: ship.x, y: ship.y - 10, vx: Math.sin(a) * 260, vy: -Math.cos(a) * 260 })); GG.audio.sfx('shoot'); }
      shots.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; }); shots = shots.filter((s) => s.y > -10);
      const sway = Math.sin(sc.t * 0.8) * 24, sp = 1 + wave * 0.12;
      foes.forEach((f) => {
        if (f.enter > 0) { f.x += (f.hx + sway - f.x) * Math.min(1, dt * 3); f.y += (f.hy - f.y) * Math.min(1, dt * 3); if (Math.abs(f.y - f.hy) < 2) f.enter = 0; return; }
        if (f.dive > 0) { f.dive += dt; f.x += Math.sin(f.dive * 3) * 120 * dt + (ship.x - f.x) * dt * 0.8; f.y += 90 * sp * dt; if (f.y > E.H + 20) { f.dive = 0; f.y = -20; f.enter = 1; } }
        else { f.x = f.hx + sway; f.y = f.hy + Math.sin(sc.t * 2 + f.hx) * 2; if (Math.random() < dt * 0.05 * sp) f.dive = 0.01; if (Math.random() < dt * 0.1 * sp) drops.push({ x: f.x, y: f.y + 6, vy: 80 + wave * 8 }); }
        if (Math.abs(f.x - ship.x) < 12 && Math.abs(f.y - ship.y) < 10) { f.dead = true; hit(); }
      });
      for (const s of shots) for (const f of foes) if (!f.dead && !s.used && Math.abs(s.x - f.x) < 11 && Math.abs(s.y - f.y) < 9) {
        s.used = true; f.hp--; if (f.hp > 0) { GG.audio.note('G6', 0.04); continue; }
        f.dead = true; const v = (f.dive > 0 ? 30 : 10) * (f.k === 'fabrica' ? 2 : 1); api.add(v); clean = Math.min(1, clean + 0.012); GG.audio.sfx('boom');
        if (X()) { X().sparkle(f.x, f.y, '#ffffff', 4); X().pop(f.x, f.y - 8, '+' + v, '#e8f7ff', 7); X().puff(f.x, f.y, 2); }
        if (Math.random() < 0.08) caps.push({ k: U.pick(['raio', 'escudo', 'raio', 'coracao']), x: f.x, y: f.y });
      }
      shots = shots.filter((s) => !s.used); foes = foes.filter((f) => !f.dead);
      drops.forEach((d) => { d.y += d.vy * dt; if (Math.abs(d.x - ship.x) < 9 && Math.abs(d.y - ship.y) < 8) { d.used = true; hit(); } }); drops = drops.filter((d) => !d.used && d.y < E.H + 5);
      caps.forEach((cp) => { cp.y += 50 * dt; if (Math.abs(cp.x - ship.x) < 12 && Math.abs(cp.y - ship.y) < 12) { cp.used = true; GG.audio.sfx('power'); api.add(20); if (cp.k === 'raio') ship.triple = 9; if (cp.k === 'escudo') ship.shield = 10; if (cp.k === 'coracao') { api.lives = Math.min(api.maxLives, api.lives + 1); api.refresh(); } if (X()) X().pop(cp.x, cp.y - 10, { raio: 'TIRO TRIPLO!', escudo: 'ESCUDO!', coracao: '+1 VIDA' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.used && cp.y < E.H);
      if (!foes.length) { api.add(150); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); newWave(); }
      if (time >= 170) { playing = false; setTimeout(() => api.end(api.score, 'Tempo! Ondas limpas: ' + (wave - 1) + '.'), 500); }
    };
    function smog(c, x, f) {
      if (f.k === 'lixo') { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, f.y - 7, 12, 14); c.fillStyle = '#9aa0ab'; c.fillRect(f.x - 7, f.y - 8, 14, 3); c.fillStyle = '#ff5d6c'; c.fillRect(f.x - 3, f.y - 2, 2, 2); c.fillRect(f.x + 1, f.y - 2, 2, 2); return; }
      const col = f.k === 'fabrica' ? '#4a4450' : '#8a8494';
      c.fillStyle = col; [[-6, 1, 6], [0, -3, 7], [6, 1, 6], [0, 3, 6]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(f.x + dx, f.y + dy, r, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = f.hp > 1 ? '#ffd23f' : '#ff5d6c'; c.fillRect(f.x - 4, f.y - 2, 2, 2); c.fillRect(f.x + 2, f.y - 2, 2, 2); c.fillStyle = '#2a2233'; c.fillRect(f.x - 3, f.y + 3, 6, 1);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // céu poluído que vai clareando
      const sky = c.createLinearGradient(0, 0, 0, E.H);
      const mix = (a, b) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * clean)).join(',') + ')';
      sky.addColorStop(0, mix([90, 80, 70], [60, 150, 240])); sky.addColorStop(1, mix([150, 130, 110], [200, 235, 255]));
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (x && clean > 0.3) x.glow(c, 340, 40, 30 + clean * 20, '#fff2a0', clean);
      // cidade no fundo
      for (let i = 0; i < 16; i++) { const h = 30 + (i * 37) % 50, w = 24; c.fillStyle = mix([60, 55, 60], [90, 110, 150]); c.fillRect(i * 26, E.H - h, w, h); c.fillStyle = 'rgba(255,230,150,.6)'; for (let yy = E.H - h + 5; yy < E.H - 4; yy += 7) c.fillRect(i * 26 + 5, yy, 3, 3); }
      foes.forEach((f) => smog(c, x, f));
      drops.forEach((d) => { c.fillStyle = '#3a3440'; c.beginPath(); c.arc(d.x, d.y, 3, 0, Math.PI * 2); c.fill(); });
      shots.forEach((s) => { if (x) x.glow(c, s.x, s.y, 7, '#fff27a', 0.8); g.rect(s.x - 1, s.y - 5, 2, 8, '#fff6b0'); });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, cp.k, cp.x, cp.y, 14); } });
      if (!(ship.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        if (ship.shield > 0) { c.strokeStyle = 'rgba(159,242,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(ship.x, ship.y, 16, 0, Math.PI * 2); c.stroke(); }
        if (x) x.glow(c, ship.x, ship.y + 8, 10, '#ffb040', 0.8);
        c.fillStyle = '#2e5bd8'; c.beginPath(); c.moveTo(ship.x, ship.y - 12); c.lineTo(ship.x + 12, ship.y + 8); c.lineTo(ship.x - 12, ship.y + 8); c.closePath(); c.fill();
        c.fillStyle = '#1a2a6a'; for (let i = -1; i <= 1; i++) c.fillRect(ship.x + i * 7 - 3, ship.y, 6, 6); c.fillStyle = '#9ff2ff'; c.fillRect(ship.x - 2, ship.y - 6, 4, 4);
        if (x) x.ilus(c, 'sol', ship.x, ship.y - 2, 10);
      }
      g.rect(8, 8, 80, 5, 'rgba(0,0,0,.4)'); g.rect(8, 8, 80 * clean, 5, '#7bff8f'); g.text('CÉU LIMPO ' + Math.round(clean * 100) + '%', 8, 15, { size: 4, color: '#fff' });
      if (waveAnn > 0) g.text('ONDA ' + wave, E.W / 2, 100, { size: 14, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; ship.inv = 0; ship.shield = 0; hit(); } };
    return sc;
  });

  /* ================================================================ EMPILHA-PRÉDIOS */
  PQ.register({ id: 'w3_predios', world: 3, boss: 'c3s6', ref: 'Tower Bloxx / Stack', title: 'Empilha-Prédios', icon: 'predio', c1: '#3ec1ff', c2: '#0b2a4a', music: 'cidade', medals: [15, 30, 50], unit: 'andares',
    desc: 'O guindaste balança um andar! Solte na hora certa e faça o prédio crescer até as nuvens.',
    how: 'Aperte **Espaço** ou toque para **soltar** o andar. Quanto mais alinhado, melhor: **PERFEITO** não perde nada e faz combo. O que ficar para fora cai! Errar o prédio inteiro tira 1 vida (**3 vidas**).' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const FH = 16, BASEY = 205;
    let floors = [{ x: 170, w: 60, col: '#8a8f9e' }], hook = { t: 0 }, drop = null, playing = false, perfect = 0, pieces = [], camY = 0, time = 0;
    const COLS = ['#e8744f', '#3ec1ff', '#ffd23f', '#35e07a', '#b07bff', '#ff4d6d', '#f39c12'];
    api.lives = 3; api.refresh(); api.goal('Empilhe os andares! Cada andar = +1.200 moradores.');
    sc.begin = () => { playing = true; };
    const top = () => floors[floors.length - 1];
    function hookPos() { const h = floors.length, amp = Math.min(150, 70 + h * 3), sp = 1.4 + Math.min(1.6, h * 0.05); return { x: 200 + Math.sin(hook.t * sp) * amp, y: camY + 28 }; }
    const release = () => { if (!playing || drop) return; const hp = hookPos(); drop = { x: hp.x - top().w / 2, y: hp.y + 20, w: top().w, vy: 0, col: COLS[floors.length % COLS.length] }; GG.audio.sfx('click'); };
    sc.click = release;
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; hook.t += dt;
      if (I.pressed('jump') || I.pressed('act') || I.pressed('down')) release();
      const targetCam = Math.min(0, BASEY - floors.length * FH - 120);
      camY += (targetCam - camY) * Math.min(1, dt * 3);
      pieces.forEach((p) => { p.vy += 500 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }); pieces = pieces.filter((p) => p.y < camY + E.H + 60);
      if (!drop) return;
      drop.vy += 700 * dt; drop.y += drop.vy * dt;
      const landY = BASEY - floors.length * FH;
      if (drop.y + FH >= landY) {
        const t = top(), l = Math.max(drop.x, t.x), r = Math.min(drop.x + drop.w, t.x + t.w), ov = r - l;
        if (ov < 6) { pieces.push({ x: drop.x, y: landY - FH, w: drop.w, col: drop.col, vy: 0, vr: (drop.x < t.x ? -3 : 3), rot: 0 }); drop = null; perfect = 0; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(4, 0.3); if (X()) X().flash('#ff4d4d', 0.3);
          if (api.lives <= 0) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Prédio com ' + (floors.length - 1) + ' andares: ' + U.fmtInt((floors.length - 1) * 1200) + ' moradores!'), 900); } return; }
        const off = Math.abs(drop.x - t.x);
        let nx = l, nw = ov;
        if (off <= 3) { nx = t.x; nw = Math.min(90, t.w + (perfect >= 2 ? 6 : 0)); perfect++; GG.audio.sfx('frag'); if (X()) { X().pop(200, landY - camY - 30, perfect > 1 ? 'PERFEITO x' + perfect + '!' : 'PERFEITO!', '#7bff8f', 10); X().ring(nx + nw / 2, landY - FH / 2, '#7bff8f', 40); } api.add(0); }
        else { perfect = 0; GG.audio.sfx('stomp'); const cutL = drop.x < t.x, cw = drop.w - ov; pieces.push({ x: cutL ? drop.x : r, y: landY - FH, w: cw, col: drop.col, vy: 0, vr: cutL ? -4 : 4, rot: 0 }); }
        floors.push({ x: nx, w: nw, col: drop.col });
        drop = null; E.shake(1.5, 0.1); if (X()) X().puff(nx + nw / 2, landY, 3);
        api.score = floors.length - 1; api.refresh(); api.extra('abraco', U.fmtInt((floors.length - 1) * 1200) + ' moradores');
        if (floors.length % 10 === 1) { GG.audio.sfx('win'); E.fx.confetti(200, 60, 40); }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Tempo! Prédio com ' + (floors.length - 1) + ' andares.'), 500); }
    };
    function floorDraw(c, f, y, alpha) {
      c.fillStyle = f.col; c.fillRect(f.x, y, f.w, FH); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(f.x, y, f.w, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(f.x, y + FH - 2, f.w, 2);
      c.fillStyle = 'rgba(255,240,170,' + (alpha || 0.85) + ')'; for (let wx = f.x + 4; wx < f.x + f.w - 5; wx += 9) c.fillRect(wx, y + 5, 5, 6);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      const h = floors.length, k = Math.min(1, h / 60);
      const sky = c.createLinearGradient(0, 0, 0, E.H); sky.addColorStop(0, 'rgb(' + Math.round(80 - 70 * k) + ',' + Math.round(160 - 140 * k) + ',' + Math.round(240 - 180 * k) + ')'); sky.addColorStop(1, 'rgb(' + Math.round(190 - 140 * k) + ',' + Math.round(225 - 170 * k) + ',255)');
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (k > 0.5) for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,' + ((k - 0.5) * 1.6).toFixed(2) + ')'; c.fillRect((i * 83) % E.W, (i * 47) % E.H, 1, 1); }
      if (x) X().hd(c, () => { for (let i = 0; i < 5; i++) { const im = x.img[['cloud1', 'cloud3', 'cloud5'][i % 3]]; if (!im) continue; const cy = ((i * 170 - camY * 0.5) % 500) - 60; c.globalAlpha = 0.8; c.drawImage(im, (i * 97 + sc.t * 6) % (E.W + 80) - 60, cy, 70, 42); } c.globalAlpha = 1; });
      c.save(); c.translate(0, -camY);
      // cidade e chão
      for (let i = 0; i < 16; i++) { const bh = 30 + (i * 29) % 60; c.fillStyle = '#5c6f8f'; c.fillRect(i * 26, BASEY - bh, 22, bh); }
      c.fillStyle = '#3fae52'; c.fillRect(0, BASEY, E.W, 60);
      floors.forEach((f, i) => { if (i === 0) { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, BASEY - FH, f.w + 12, FH); return; } floorDraw(c, f, BASEY - (i + 1) * FH); });
      pieces.forEach((p) => { c.save(); c.translate(p.x + p.w / 2, p.y + FH / 2); c.rotate(p.rot); c.translate(-p.w / 2, -FH / 2); floorDraw(c, { x: 0, w: p.w, col: p.col }, 0, 0.4); c.restore(); });
      if (drop) floorDraw(c, drop, drop.y);
      // guindaste
      const hp = hookPos();
      c.fillStyle = '#ffd23f'; c.fillRect(0, camY + 10, E.W, 5); c.fillStyle = '#c99a1e'; for (let i = 0; i < E.W; i += 10) c.fillRect(i, camY + 10, 5, 5);
      c.strokeStyle = '#2a2a33'; c.lineWidth = 1; c.beginPath(); c.moveTo(hp.x, camY + 15); c.lineTo(hp.x, hp.y + 20); c.stroke();
      c.fillStyle = '#2a2a33'; c.fillRect(hp.x - 4, camY + 12, 8, 6);
      if (!drop && playing) floorDraw(c, { x: hp.x - top().w / 2, w: top().w, col: COLS[floors.length % COLS.length] }, hp.y + 20);
      c.restore();
      g.text(String(h - 1), E.W - 12, 24, { size: 16, color: '#fff', align: 'right' }); g.text('ANDARES', E.W - 12, 42, { size: 5, color: '#ffd23f', align: 'right' });
    };
    sc.dbg = { end() { api.lives = 1; drop = { x: -500, y: -1000, w: 10, vy: 0, col: '#fff' }; } };
    return sc;
  });
})();
