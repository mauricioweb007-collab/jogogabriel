/* =====================================================================
   arcade/jogos.js — OS 6 JOGOS BÔNUS DO ARCADE DO EXPRESSO (Inglês).
   Cópias adaptadas do Arcade de Geografia (docs/MINIGAMES-CODIGO.md):
   a mecânica é a mesma (física, colisões, pontos, dificuldade, vidas);
   mudam só o tema, os nomes, os ícones, o cenário e os textos.
   Sem perguntas: são prêmios só para jogar.
     Mundo 1 — Cidade Cósmica: Quebra-Galáxias (Quebra-Mosaico),
               Invasores Cósmicos (Invasores da Poluição)
     Mundo 2 — Aeroporto: Táxi para o Aeroporto (Estrada Brasil),
               Voo do Avião (Voo da Arara)
     Mundo 3 — Laboratório: Colunas do Laboratório (Colunas do
               Mosaico), Empilha o Bairro (Empilha-Prédios)
   Gerado a partir dos arquivos de Geografia; edite AQUI (Geografia
   continua igual). Contrato: PQ.register(def, maker) — arcade/runtime.js.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ QUEBRA-GALÁXIAS (base: Quebra-Mosaico, Arkanoid) */
  const GLX_LEVELS = [
    ['....PPPP....', '..PPBBBBPP..', '.PBBWWWWBBP.', 'PBBWWYYWWBBP', '.PBBWWWWBBP.', '..PPBBBBPP..', '....PPPP....'], // galáxia
    ['..........YY', '........OYYY', '......ROOYY.', '....RROO....', '..PPRR......', 'BBPP........', 'SS..........'], // cometa
    ['.....YY.....', '....YYYY....', 'YYYYYYYYYYYY', '.YYYYSSYYYY.', '..YYYYYYYY..', '.YYYY..YYYY.', 'YYY......YYY'] // estrela
  ];
  const GLX_BC = { G: '#2fae5a', Y: '#ffd23f', B: '#2e5bd8', W: '#f4f4ff', R: '#e5484d', O: '#ff9a3d', P: '#b07bff', S: '#a9b0c4' };
  PQ.register({ id: 'e1_galaxias', world: 1, ref: 'Arkanoid', title: 'Quebra-Galáxias', icon: 'estrela_brilho', c1: '#7b5cff', c2: '#1a1350', music: 'festa', medals: [600, 1400, 2400], unit: 'pts',
    desc: 'Rebata o cometa com o carrinho voador e quebre as galáxias da Cidade Cósmica! Pegue os poderes que caem.',
    how: 'Mova o **carrinho voador** com **← →** (ou o mouse/dedo). **Espaço** ou toque lança a bolinha. Pegue os poderes: **prancha grande**, **3 bolinhas**, **bola lenta** e **vida**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const BW = 28, BH = 9, BX0 = 22, BY0 = 30;
    const pad = { x: 200, w: 50, wide: 0 };
    let balls = [], bricks = [], caps = [], lvl = 0, playing = false, stuck = true, slow = 0, time = 0, mouseX = null;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointermove: (lx) => { mouseX = lx; }, pointerdown: (lx) => { mouseX = lx; if (stuck && playing) launch(); } });
    function load() {
      bricks = []; GLX_LEVELS[lvl % GLX_LEVELS.length].forEach((row, r) => row.split('').forEach((ch, i) => { if (ch === '.') return; bricks.push({ x: BX0 + i * (BW + 2), y: BY0 + r * (BH + 2), col: GLX_BC[ch], hp: ch === 'S' ? 2 : 1, cap: Math.random() < 0.12 ? U.pick(['wide', 'multi', 'slow', 'wide', 'life']) : null, r }); }));
      api.goal('Galáxia ' + (lvl + 1) + ': ' + ['Galáxia espiral', 'Cometa', 'Estrela'][lvl % 3]);
      reset();
    }
    function reset() { balls = [{ x: pad.x, y: 196, vx: 0, vy: 0 }]; stuck = true; }
    function launch() { stuck = false; const sp = 150 + lvl * 12; balls.forEach((b) => { b.vx = sp * 0.5; b.vy = -sp; }); GG.audio.sfx('shoot'); }
    sc.begin = () => { playing = true; load(); };
    sc.click = () => { if (stuck && playing) launch(); };
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(180 - time)) + 's');
      if (pad.wide > 0) pad.wide -= dt; if (slow > 0) slow -= dt;
      pad.w = pad.wide > 0 ? 78 : 50;
      const ax = I.axisX(); if (ax) { pad.x += ax * 230 * dt; mouseX = null; } else if (mouseX != null) pad.x += (mouseX - pad.x) * Math.min(1, dt * 14);
      pad.x = U.clamp(pad.x, 10 + pad.w / 2, E.W - 10 - pad.w / 2);
      if (stuck) { balls[0].x = pad.x; balls[0].y = 196; if (I.pressed('jump') || I.pressed('act') || I.pressed('up')) launch(); return; }
      const k = slow > 0 ? 0.6 : 1;
      balls.forEach((b) => {
        for (let s = 0; s < 2; s++) {
          b.x += b.vx * dt * k / 2; b.y += b.vy * dt * k / 2;
          if (b.x < 12 || b.x > E.W - 12) { b.vx *= -1; b.x = U.clamp(b.x, 12, E.W - 12); GG.audio.note('A5', 0.03); }
          if (b.y < 20) { b.vy = Math.abs(b.vy); }
          if (b.vy > 0 && b.y > 199 && b.y < 206 && Math.abs(b.x - pad.x) < pad.w / 2 + 3) {
            const off = (b.x - pad.x) / (pad.w / 2), sp = Math.hypot(b.vx, b.vy) * 1.01; const a = off * 1.05;
            b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; GG.audio.note('C5', 0.05); if (X()) X().ring(b.x, 203, '#9ff2ff', 12);
          }
          for (const br of bricks) {
            if (br.dead || b.x < br.x - 3 || b.x > br.x + BW + 3 || b.y < br.y - 3 || b.y > br.y + BH + 3) continue;
            const fromSide = Math.min(Math.abs(b.x - br.x), Math.abs(b.x - br.x - BW)) < Math.min(Math.abs(b.y - br.y), Math.abs(b.y - br.y - BH));
            if (fromSide) b.vx *= -1; else b.vy *= -1;
            br.hp--; if (br.hp <= 0) {
              br.dead = true; api.add(10 + (7 - br.r) * 2); GG.audio.note(['C6', 'B5', 'A5', 'G5', 'F5', 'E5', 'D5'][br.r] || 'C5', 0.07);
              if (X()) X().sparkle(br.x + BW / 2, br.y + BH / 2, br.col, 3); E.fx.burst(br.x + BW / 2, br.y + BH / 2, br.col, 6, 70);
              if (br.cap) caps.push({ k: br.cap, x: br.x + BW / 2, y: br.y });
            } else GG.audio.note('G6', 0.04);
            break;
          }
        }
      });
      balls = balls.filter((b) => b.y < E.H + 10);
      if (!balls.length) { api.lives--; api.refresh(); GG.audio.sfx('hit'); if (X()) X().flash('#ff4d4d', 0.3); if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Galáxias quebradas: ' + lvl + '.'), 600); return; } reset(); }
      caps.forEach((cp) => { cp.y += 60 * dt; if (!cp.got && cp.y > 196 && cp.y < 210 && Math.abs(cp.x - pad.x) < pad.w / 2 + 6) { cp.got = true; GG.audio.sfx('power'); api.add(15);
        if (cp.k === 'wide') pad.wide = 12; if (cp.k === 'slow') slow = 8; if (cp.k === 'life') { api.lives = Math.min(5, api.lives + 1); api.maxLives = Math.max(api.maxLives, api.lives); api.refresh(); }
        if (cp.k === 'multi') { const b0 = balls[0]; if (b0) [-0.5, 0.5].forEach((d) => balls.push({ x: b0.x, y: b0.y, vx: b0.vx * Math.cos(d) - b0.vy * Math.sin(d), vy: b0.vx * Math.sin(d) + b0.vy * Math.cos(d) })); }
        if (X()) X().pop(cp.x, 186, { wide: 'PRANCHA GRANDE!', slow: 'BOLA LENTA!', life: '+1 VIDA!', multi: '3 BOLINHAS!' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.got && cp.y < E.H);
      if (bricks.every((br) => br.dead)) { lvl++; api.add(200); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 50); caps = []; load(); }
      if (time >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo esgotado! Galáxias quebradas: ' + lvl + '.'), 500); }
    };
    const CAPI = { wide: 'estrela', multi: 'foguete', slow: 'tartaruga', life: 'coracao' };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'torre', sc.t * 6, 0, sc.t, { horizon: 260 }))) { c.fillStyle = '#12173a'; c.fillRect(0, 0, E.W, E.H); }
      c.strokeStyle = 'rgba(255,210,63,.6)'; c.lineWidth = 2; c.strokeRect(9, 17, E.W - 18, E.H - 12);
      bricks.forEach((br) => {
        if (br.dead) return;
        const gr = c.createLinearGradient(0, br.y, 0, br.y + BH); gr.addColorStop(0, br.col); gr.addColorStop(1, GG.pixel.shade(br.col, -55));
        c.fillStyle = gr; c.fillRect(br.x, br.y, BW, BH); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(br.x, br.y, BW, 2);
        if (br.hp > 1) { c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(br.x + 1, br.y + 1, BW - 2, BH - 2); }
        if (br.cap) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(br.x + BW / 2 - 1, br.y + 3, 2, 3); }
      });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, CAPI[cp.k], cp.x, cp.y, 13, { rot: Math.sin(sc.t * 5) * 0.2 }); } else g.circle(cp.x, cp.y, 5, '#9ff2ff'); });
      // carrinho voador (a prancha) e cometas (as bolinhas)
      const pw = pad.w; if (x) x.glow(c, pad.x, 212, pw / 2, '#9ff2ff', 0.5);
      c.fillStyle = '#6a4cff'; c.fillRect(pad.x - pw / 2, 203, pw, 6); c.fillStyle = '#b9a8ff'; c.fillRect(pad.x - pw / 2, 203, pw, 2);
      c.fillStyle = '#9ff2ff'; c.fillRect(pad.x - 6, 199, 12, 4); c.fillStyle = '#ffd23f'; c.fillRect(pad.x - pw / 2 - 3, 204, 4, 5); c.fillRect(pad.x + pw / 2 - 1, 204, 4, 5);
      balls.forEach((b) => { if (x) { x.glow(c, b.x - b.vx * 0.03, b.y - b.vy * 0.03, 10, slow > 0 ? '#7bff8f' : '#ff9a3d', 0.6); x.glow(c, b.x, b.y, 8, '#ffffff', 0.7); } g.circle(b.x, b.y, 3, '#fff'); });
      if (stuck && playing) g.text('ESPAÇO / TOQUE PARA LANÇAR', E.W / 2, 170, { size: 6, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; stuck = false; balls = []; } };
    return sc;
  });

  /* ================================================================ INVASORES CÓSMICOS (base: Invasores da Poluição, Galaga) */
  PQ.register({ id: 'e1_invasores', world: 1, ref: 'Galaga / Space Invaders', title: 'Invasores Cósmicos', icon: 'foguete', c1: '#3a2168', c2: '#0b0826', music: 'chefe', medals: [800, 1800, 3200], unit: 'pts',
    desc: 'Meteoros e robôs invadem a galáxia! Pilote o foguete do Expresso e proteja a Cidade Cósmica.',
    how: '**← →** movem o foguete, **Espaço** (ou toque) dispara. Meteoros descem em formação e algumas **mergulham**! Pegue **raio** (tiro triplo), **escudo** e **coração**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ship = { x: 200, y: 200, inv: 0, triple: 0, shield: 0 };
    let foes = [], shots = [], drops = [], caps = [], wave = 0, playing = false, cool = 0, clean = 0, time = 0, touchX = null, firing = false, waveAnn = 0;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointerdown: (lx) => { touchX = lx; firing = true; }, pointermove: (lx, ly, ev) => { if (firing || ev.pointerType === 'mouse') touchX = lx; }, pointerup: () => { firing = false; } });
    function newWave() {
      wave++; waveAnn = 2; foes = [];
      const rows = Math.min(5, 3 + Math.floor(wave / 2));
      for (let r = 0; r < rows; r++) for (let q = 0; q < 8; q++) foes.push({ hx: 60 + q * 38, hy: 36 + r * 20, x: 60 + q * 38, y: -30 - r * 20 - q * 6, k: r === 0 ? 'robo' : r % 2 ? 'meteoro' : 'ovni', hp: r === 0 ? 2 : 1, dive: 0, enter: 1 });
      api.goal('Onda ' + wave + ': proteja a galáxia!');
    }
    sc.begin = () => { playing = true; newWave(); };
    function hit() {
      if (ship.inv > 0) return;
      if (ship.shield > 0) { ship.shield = 0; ship.inv = 1; GG.audio.sfx('shield'); return; }
      api.lives--; api.refresh(); ship.inv = 2; GG.audio.sfx('hit'); E.shake(5, 0.3); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ondas vencidas: ' + (wave - 1) + '. Galáxia ' + Math.round(clean * 100) + '% protegida!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (waveAnn > 0) waveAnn -= dt;
      if (!playing) return;
      time += dt; api.extra('estrela_brilho', 'Onda ' + wave);
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
        f.dead = true; const v = (f.dive > 0 ? 30 : 10) * (f.k === 'robo' ? 2 : 1); api.add(v); clean = Math.min(1, clean + 0.012); GG.audio.sfx('boom');
        if (X()) { X().sparkle(f.x, f.y, '#ffffff', 4); X().pop(f.x, f.y - 8, '+' + v, '#e8f7ff', 7); X().puff(f.x, f.y, 2); }
        if (Math.random() < 0.08) caps.push({ k: U.pick(['raio', 'escudo', 'raio', 'coracao']), x: f.x, y: f.y });
      }
      shots = shots.filter((s) => !s.used); foes = foes.filter((f) => !f.dead);
      drops.forEach((d) => { d.y += d.vy * dt; if (Math.abs(d.x - ship.x) < 9 && Math.abs(d.y - ship.y) < 8) { d.used = true; hit(); } }); drops = drops.filter((d) => !d.used && d.y < E.H + 5);
      caps.forEach((cp) => { cp.y += 50 * dt; if (Math.abs(cp.x - ship.x) < 12 && Math.abs(cp.y - ship.y) < 12) { cp.used = true; GG.audio.sfx('power'); api.add(20); if (cp.k === 'raio') ship.triple = 9; if (cp.k === 'escudo') ship.shield = 10; if (cp.k === 'coracao') { api.lives = Math.min(api.maxLives, api.lives + 1); api.refresh(); } if (X()) X().pop(cp.x, cp.y - 10, { raio: 'TIRO TRIPLO!', escudo: 'ESCUDO!', coracao: '+1 VIDA' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.used && cp.y < E.H);
      if (!foes.length) { api.add(150); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); newWave(); }
      if (time >= 170) { playing = false; setTimeout(() => api.end(api.score, 'Tempo! Ondas vencidas: ' + (wave - 1) + '.'), 500); }
    };
    function smog(c, x, f) {
      if (f.k === 'robo' && x && x.ilus(c, 'robo', f.x, f.y, 18)) { if (f.hp > 1) x.glow(c, f.x, f.y, 12, '#ff5d6c', 0.35); return; }
      if (f.k === 'ovni') { c.fillStyle = '#9ff2ff'; c.beginPath(); c.arc(f.x, f.y - 2, 5, Math.PI, 0); c.fill(); c.fillStyle = '#8a8fb0'; c.beginPath(); c.ellipse(f.x, f.y + 1, 10, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffd23f'; [-6, 0, 6].forEach((d) => c.fillRect(f.x + d - 1, f.y + 1, 2, 2)); return; }
      c.fillStyle = f.hp > 1 ? '#6b5a4a' : '#8a7a6a'; [[-5, 1, 6], [1, -2, 6], [5, 2, 5]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(f.x + dx, f.y + dy, r, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(f.x + 2, f.y + 2, 2, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(f.x - 4, f.y - 1, 1.5, 0, Math.PI * 2); c.fill();
      if (x) x.glow(c, f.x + 8, f.y - 6, 6, '#ff9a3d', 0.4);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // espaço: a galáxia fica mais brilhante a cada onda vencida
      if (!(x && x.sky(g, 'mosaico', sc.t * 8, 0, sc.t, { horizon: 250 }))) { c.fillStyle = '#120a2e'; c.fillRect(0, 0, E.W, E.H); }
      if (x) x.glow(c, 330, 50, 28 + clean * 30, '#b07bff', 0.3 + clean * 0.5);
      // Cidade Cósmica no fundo
      for (let i = 0; i < 16; i++) { const h = 24 + (i * 37) % 44, w = 22; c.fillStyle = '#2c1b6b'; c.fillRect(i * 26, E.H - h, w, h); c.fillStyle = 'rgba(159,242,255,.7)'; for (let yy = E.H - h + 5; yy < E.H - 4; yy += 7) c.fillRect(i * 26 + 5, yy, 3, 3); }
      foes.forEach((f) => smog(c, x, f));
      drops.forEach((d) => { c.fillStyle = '#3a3440'; c.beginPath(); c.arc(d.x, d.y, 3, 0, Math.PI * 2); c.fill(); });
      shots.forEach((s) => { if (x) x.glow(c, s.x, s.y, 7, '#fff27a', 0.8); g.rect(s.x - 1, s.y - 5, 2, 8, '#fff6b0'); });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, cp.k, cp.x, cp.y, 14); } });
      if (!(ship.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        if (ship.shield > 0) { c.strokeStyle = 'rgba(159,242,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(ship.x, ship.y, 16, 0, Math.PI * 2); c.stroke(); }
        if (x) x.glow(c, ship.x, ship.y + 8, 10, '#ffb040', 0.8);
        if (!(x && x.ilus(c, 'foguete', ship.x, ship.y - 2, 24, { rot: -0.78 }))) { c.fillStyle = '#e5484d'; c.beginPath(); c.moveTo(ship.x, ship.y - 12); c.lineTo(ship.x + 10, ship.y + 8); c.lineTo(ship.x - 10, ship.y + 8); c.closePath(); c.fill(); }
      }
      g.rect(8, 8, 80, 5, 'rgba(0,0,0,.4)'); g.rect(8, 8, 80 * clean, 5, '#7bff8f'); g.text('GALÁXIA PROTEGIDA ' + Math.round(clean * 100) + '%', 8, 15, { size: 4, color: '#fff' });
      if (waveAnn > 0) g.text('ONDA ' + wave, E.W / 2, 100, { size: 14, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; ship.inv = 0; ship.shield = 0; hit(); } };
    return sc;
  });

  /* ================================================================ TÁXI PARA O AEROPORTO (base: Estrada Brasil, Road Fighter)
     Estilo Road Fighter (NES), pedido do usuário (24/09/2026): visão de cima, a estrada
     serpenteia e estreita; o recurso é o COMBUSTÍVEL (não há tempo extra por checkpoint).
     Bater num carro = rodar e explodir; raspar na beira freia e gasta um pouco (perde combustível e recomeça
     parado). Carros amarelos mudam de faixa na sua frente; manchas de óleo fazem rodar;
     galões na pista devolvem combustível. Dificuldade média: sobe a cada zona e volta. */
  const TX_ZONES = [
    { name: 'Neighborhood', side: ['#7cc47e', '#6fb872'], edge: '#3f8f52', rumble: ['#e5484d', '#fff'], road: '#5d626e', hw: 74, props: ['house1', 'houseSmall1', 'tree'], traffic: 1 },
    { name: 'Street', side: ['#8a95a3', '#7f8a98'], edge: '#4a4f5c', rumble: ['#ffd23f', '#fff'], road: '#45495a', hw: 64, props: ['house2', 'tower', 'houseAlt1'], traffic: 1.3 },
    { name: 'Airport', side: ['#a9b0c4', '#9aa2b8'], edge: '#2f9be0', rumble: ['#3ec1ff', '#fff'], road: '#3a3f52', hw: 58, props: ['tower', 'tower', 'fence'], traffic: 1.6 }
  ];
  PQ.register({ id: 'e2_taxi', world: 2, ref: 'Road Fighter (NES)', title: 'Táxi para o Aeroporto', icon: 'carro', c1: '#ffd23f', c2: '#5a4200', music: 'corrida', medals: [900, 1900, 3200], unit: 'pts',
    desc: 'Você é o taxi driver! Leve John e Linda do bairro ao aeroporto: desvie do trânsito e cuide do combustível.',
    how: '**← →** desviam. O carro acelera sozinho; segure **↑** para a **marcha rápida** e **↓** para frear. O **TURBO** carrega sozinho: quando piscar **TURBO PRONTO**, aperte **Espaço** (ou toque no botão). O combustível **acaba rápido**: pegue os **galões** ⛽! **Bater** tira muito combustível e zera o turbo; os carros **rosa** e **laranjas** tentam **fechar** você; o **óleo** faz rodar.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const PY = 176, ZL = 7200, CRUISE = 215, FAST = 300;
    const car = { x: 200, v: 0, crash: 0, spin: 0, inv: 0, spinDir: 1 };
    const TURBO = 390, TCHARGE = 8; // turbo: carrega em 8 s, dura 2,5 s
    let turbo = 0, boost = 0;
    let dist = 0, fuel = 100, playing = false, traffic = [], items = [], spawnT = 1.2, itemT = 5, zone = 0, lap = 0, zoneAnn = 0, over = 0, passed = 0, crashes = 0, mouseX = null, lastZoneIdx = 0;
    const Z = () => TX_ZONES[zone];
    const level = () => Math.min(4, zone + lap * 3); // 0..4 (limitado: o fim não vira parede de carros)
    const center = (d) => 200 + 52 * Math.sin(d / 900) + 22 * Math.sin(d / 370 + 1);
    const zmod = (d) => ((Math.floor(d / ZL) % 3) + 3) % 3;
    const half = (d) => { const zi = zmod(d), zz = TX_ZONES[zi]; let h = zz.hw + 12 * Math.sin(d / 1300); if (Math.sin(d / 2100 + zi) > 0.82) h -= 20 + Math.min(8, lap * 4); return Math.max(36, h - lap * 4); };
    const zoneAt = zmod;
    // só segue o mouse/dedo ENQUANTO está apertado (antes o mouse parado puxava o carro para o lado)
    PQ.pointer(sc, { pointerdown: (lx, ly) => { if (lx > E.W - 70 && ly > 186) { useTurbo(); return; } mouseX = lx; }, pointermove: (lx) => { if (mouseX != null) mouseX = lx; }, pointerup: () => { mouseX = null; }, pointercancel: () => { mouseX = null; } });
    sc.begin = () => { playing = true; zoneAnn = 2.5; api.goal('Zona: Neighborhood — rumo ao airport!'); };
    const sy = (d) => PY - (d - dist);
    function useTurbo() {
      if (!playing || turbo < 1 || car.crash > 0 || boost > 0) return;
      turbo = 0; boost = 2.5; GG.audio.sfx('boost'); if (X()) { X().flash('#9ff2ff', 0.25); X().pop(car.x, PY - 30, 'TURBO!', '#9ff2ff', 10); }
    }
    function spawnCar() {
      const d = dist + 300, lv = level(), r = Math.random();
      const kind = r < 0.14 + lv * 0.02 ? 'oil' : r < 0.28 + lv * 0.04 ? 'zig' : r < 0.4 + lv * 0.02 ? 'truck' : r < 0.62 ? 'block' : 'car';
      // nunca fechar a pista toda: no máximo 2 carros (1 se a pista estiver estreita) na mesma altura
      const near = traffic.filter((o) => o.k !== 'oil' && Math.abs(o.d - d) < 120);
      const narrow = half(d) < 52;
      if (kind !== 'oil' && near.length >= (narrow ? 1 : 2)) return;
      const lanes = [-0.55, 0, 0.55].filter((l) => !near.some((o) => Math.abs(o.off - l) < 0.3));
      const lane = U.pick(lanes.length ? lanes : [0]);
      if (kind === 'oil') { traffic.push({ k: 'oil', d, off: lane, v: 0, w: 18, h: 12 }); return; }
      traffic.push({ k: kind, d, off: lane, toOff: lane, v: kind === 'truck' ? 80 + lv * 6 : 110 + Math.random() * 45 + lv * 7, w: kind === 'truck' ? 18 : 14, h: kind === 'truck' ? 38 : 24,
        col: kind === 'zig' ? '#ff5d8f' : kind === 'block' ? '#ff9a3d' : kind === 'truck' ? '#e8e8f0' : U.pick(['#3ec1ff', '#35e07a', '#b07bff']), swerved: false });
    }
    function crash(why) {
      if (car.crash > 0 || car.inv > 0) return;
      car.crash = 1.5; car.spinDir = Math.random() < 0.5 ? -1 : 1; crashes++;
      fuel = Math.max(0, fuel - 15); api.add(-80); turbo = 0; boost = 0; // erro custa caro: combustível, pontos e o turbo
      GG.audio.sfx('boom'); E.shake(6, 0.45); E.fx.burst(car.x, PY, '#ff9a3d', 14, 90);
      if (X()) { X().flash('#ff4d4d', 0.35); X().puff(car.x, PY, 6); X().pop(car.x, PY - 30, why + ' -15 combustível', '#ff8f8f', 8); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (zoneAnn > 0) zoneAnn -= dt;
      if (!playing) return;
      if (car.inv > 0) car.inv -= dt; if (car.spin > 0) car.spin -= dt;
      // combustível: gasta sempre; mais rápido na marcha rápida
      const fast = I.down('up');
      if (I.pressed('jump')) useTurbo();
      if (boost > 0) boost -= dt; else if (car.crash <= 0) turbo = Math.min(1, turbo + dt / TCHARGE);
      // combustível acaba rápido (~55 s sem galões): é preciso pegar os galões
      fuel -= dt * (boost > 0 ? 2.4 : fast ? 2.05 : 1.75);
      api.extra('bateria', Math.max(0, Math.ceil(fuel)) + '% ⛽');
      if (car.crash > 0) {
        car.crash -= dt; car.v = Math.max(0, car.v - 400 * dt); dist += car.v * dt;
        if (car.crash <= 0) { car.x = center(dist); car.v = 0; car.inv = 1.6; car.spin = 0; }
      } else {
        const top = boost > 0 ? TURBO : I.down('down') ? 0 : fast ? FAST : CRUISE;
        car.v += (top - car.v) * Math.min(1, dt * (car.v < top ? 0.9 : 3));
        let steer = I.axisX();
        if (!steer && mouseX != null) steer = Math.abs(mouseX - car.x) < 3 ? 0 : U.clamp((mouseX - car.x) / 18, -1, 1);
        if (car.spin > 0) steer = car.spinDir * 0.6;
        car.x += steer * dt * (90 + car.v * 0.3);
        dist += car.v * dt;
        const c0 = center(dist), h0 = half(dist), lim = h0 - 7;
        if (Math.abs(car.x - c0) > lim) {
          // raspou na beira: volta para a pista, perde velocidade e um pouco de combustível (sem explodir)
          car.x = c0 + Math.sign(car.x - c0) * (lim - 2); car.v *= 0.5; fuel -= 2.5; boost = 0; car.scrape = 0.3;
          if (!car.warned) { car.warned = 1.2; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'Cuidado com a beira!', '#ffd23f', 7); }
          if (X() && Math.random() < 0.5) X().sparkle(car.x + Math.sign(car.x - c0) * 7, PY, '#ffd23f', 2);
        }
        if (car.warned > 0) car.warned = Math.max(0, car.warned - dt);
      }
      if (Math.floor(dist / 25) !== Math.floor((dist - car.v * dt) / 25)) api.add(1);
      // zonas (sem tempo extra: só um pouco de combustível e bônus)
      const zi = Math.floor(dist / ZL);
      if (zi !== lastZoneIdx) {
        lastZoneIdx = zi; zone = zi % 3; lap = Math.floor(zi / 3); zoneAnn = 2.5;
        api.add(250); fuel = Math.min(100, fuel + 10); GG.audio.sfx('win');
        if (X()) { X().flash('#fff6c0', 0.25); X().pop(200, 70, 'ZONA CONCLUÍDA! +250 e +10 de combustível', '#7bff8f', 9); }
        api.goal('Zona: ' + Z().name + (lap ? ' (volta ' + (lap + 1) + ', mais rápida!)' : ''));
      }
      // trânsito
      spawnT -= dt;
      if (spawnT <= 0 && car.v > 40) { spawnCar(); spawnT = Math.max(0.7, (1.9 - level() * 0.1) / Z().traffic) * (0.7 + Math.random() * 0.6) * (CRUISE / Math.max(120, car.v)); }
      itemT -= dt; if (itemT <= 0 && car.v > 40) { itemT = 4.2 + Math.random() * 2.2 + level() * 0.35; items.push({ d: dist + 300, off: U.pick([-0.5, 0, 0.5]) }); }
      const cbox = { x: car.x - 7, y: PY - 12, w: 14, h: 24 };
      traffic.forEach((o) => {
        o.d += o.v * dt;
        const cx0 = center(o.d), hh = half(o.d);
        // amarelo (zig): muda de faixa para a SUA frente; laranja (block): vai fechando devagar enquanto você se aproxima
        const gap = o.d - dist, pOff = (car.x - cx0) / hh;
        if (o.k === 'zig' && !o.swerved && gap < 150 && gap > 45) { o.swerved = true; o.toOff = U.clamp(pOff, -0.6, 0.6); }
        if (o.k === 'block' && gap < 170 && gap > 30) o.toOff = U.clamp(o.off + U.clamp(pOff - o.off, -0.35, 0.35), -0.6, 0.6);
        if (o.toOff != null) o.off += U.clamp(o.toOff - o.off, -dt * (o.k === 'zig' ? 1.6 : 0.55), dt * (o.k === 'zig' ? 1.6 : 0.55));
        o.x = cx0 + o.off * hh; o.y = sy(o.d);
        if (car.crash > 0 || car.inv > 0 || o.hitDone) return;
        if (E.overlap(cbox, { x: o.x - o.w / 2 + 1, y: o.y - o.h / 2 + 1, w: o.w - 2, h: o.h - 2 })) {
          if (o.k === 'oil') { o.hitDone = true; car.spin = 0.6; car.spinDir = Math.random() < 0.5 ? -1 : 1; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'ÓLEO!', '#ffd23f', 8); }
          else { o.hitDone = true; crash('Batida!'); }
        }
        if (!o.passed && o.k !== 'oil' && o.y > PY + 20) { o.passed = true; passed++; api.add(o.k === 'zig' || o.k === 'block' ? 25 : 15); }
      });
      traffic = traffic.filter((o) => o.y < E.H + 50 && o.d < dist + 400);
      items.forEach((it) => { const cx0 = center(it.d); it.x = cx0 + it.off * half(it.d); it.y = sy(it.d); if (!it.got && car.crash <= 0 && Math.abs(it.x - car.x) < 13 && Math.abs(it.y - PY) < 16) { it.got = true; fuel = Math.min(100, fuel + 20); api.add(30); GG.audio.sfx('power'); if (X()) { X().sparkle(it.x, it.y, '#7bff8f', 6); X().pop(it.x, it.y - 12, '+20 combustível', '#7bff8f', 8); } } });
      items = items.filter((it) => !it.got && it.y < E.H + 20);
      if (fuel <= 0) { fuel = 0; playing = false; over = 1; GG.audio.sfx('bad'); setTimeout(() => api.end(api.score, 'Combustível acabou! Corridas até o aeroporto: ' + Math.floor(lastZoneIdx / 3) + ' • distância: ' + (dist / 1000).toFixed(1) + ' km • zonas: ' + lastZoneIdx + ' • ultrapassagens: ' + passed + ' • batidas: ' + crashes + '.'), 1100); }
    };
    function drawCar(c, x, y, w, h, col, rot) {
      c.save(); c.translate(x, y); if (rot) c.rotate(rot);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      c.fillStyle = '#15152a'; c.fillRect(-w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(-w / 2 - 1.5, h / 2 - 9, 3, 6); c.fillRect(w / 2 - 1.5, h / 2 - 9, 3, 6);
      c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-w / 2, -h / 2, w, 2);
      c.fillStyle = 'rgba(20,30,60,.85)'; c.fillRect(-w / 2 + 2, -h / 2 + h * 0.22, w - 4, h * 0.18); c.fillRect(-w / 2 + 2, h / 2 - h * 0.28, w - 4, h * 0.12);
      c.restore();
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // laterais (areia/terra/calçada) em faixas que rolam
      for (let yy = 0; yy < E.H; yy += 8) {
        const d = dist + (PY - yy), zi = zoneAt(d), zz = TX_ZONES[zi], alt = Math.floor(d / 24) % 2;
        const cx0 = center(d), hh = half(d);
        c.fillStyle = zz.side[alt]; c.fillRect(0, yy, E.W, 8);
        if (zi === 2) { c.fillStyle = zz.edge; c.fillRect(Math.min(E.W, cx0 + hh + 60), yy, E.W, 8); } // pista de pouso à direita no aeroporto
        c.fillStyle = zz.rumble[alt]; c.fillRect(cx0 - hh - 5, yy, 5, 8); c.fillRect(cx0 + hh, yy, 5, 8);
        c.fillStyle = zz.road; c.fillRect(cx0 - hh, yy, hh * 2, 8);
        if (Math.floor(d / 20) % 2) { c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(cx0 - hh * 0.28 - 1, yy, 2, 8); c.fillRect(cx0 + hh * 0.28 - 1, yy, 2, 8); }
        if (Math.floor(d / ZL) !== Math.floor((d - 8) / ZL)) { for (let k = 0; k < hh * 2; k += 8) { c.fillStyle = (k / 8) % 2 ? '#fff' : '#15152a'; c.fillRect(cx0 - hh + k, yy, 8, 6); } }
      }
      // enfeites na beira
      if (x) {
        const step = 70, first = Math.floor((dist - 60) / step);
        for (let k = first; k < first + 6; k++) {
          const d = k * step, yy = sy(d); if (yy < -40 || yy > E.H + 40) continue;
          const zz = TX_ZONES[zoneAt(d)], im = x.img[zz.props[((k % 3) + 3) % 3]]; if (!im) continue;
          const side = k % 2 ? -1 : 1, cx0 = center(d), hh = half(d), xx = cx0 + side * (hh + 30 + (k % 3) * 8), h = 34, w = h * im.width / im.height;
          if (xx > -20 && xx < E.W + 20) x.hd(c, () => c.drawImage(im, xx - w / 2, yy - h, w, h));
        }
      }
      items.forEach((it) => { if (x) x.glow(c, it.x, it.y, 12, '#7bff8f', 0.6); c.fillStyle = '#e5484d'; c.fillRect(it.x - 5, it.y - 6, 10, 12); c.fillStyle = '#8a1020'; c.fillRect(it.x - 3, it.y - 9, 6, 3); c.fillStyle = '#ffd23f'; c.fillRect(it.x - 3, it.y - 2, 6, 3); });
      traffic.forEach((o) => {
        if (o.k === 'oil') { c.fillStyle = 'rgba(15,15,30,.85)'; c.beginPath(); c.ellipse(o.x, o.y, 9, 6, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(140,90,255,.35)'; c.beginPath(); c.ellipse(o.x - 2, o.y - 1, 4, 2, 0.3, 0, Math.PI * 2); c.fill(); return; }
        drawCar(c, o.x, o.y, o.w, o.h, o.col, 0);
        if (o.k === 'zig' && !o.swerved && o.y > -10 && Math.floor(sc.t * 6) % 2) g.text('!', o.x, o.y - o.h / 2 - 9, { size: 7, color: '#ffd23f', align: 'center' });
      });
      // jogador
      if (!(car.inv > 0 && Math.floor(sc.t * 14) % 2)) {
        const rot = car.crash > 0 ? car.spinDir * (1.3 - car.crash) * 9 : car.spin > 0 ? car.spinDir * (0.9 - car.spin) * 7 : IN().axisX() * 0.12;
        if (boost > 0 && x) { x.glow(c, car.x - 4, PY + 15, 7, '#ff9a3d', 0.9); x.glow(c, car.x + 4, PY + 15, 7, '#ff9a3d', 0.9); if (!E.reduced && Math.random() < 0.6) x.puff(car.x, PY + 14, 1, 0); }
        drawCar(c, car.x, PY, 14, 24, '#ffd23f', rot);
        if (car.crash <= 0) { g.rect(car.x - 5, PY - 2, 10, 5, '#15152a'); g.text('TAXI', car.x, PY - 2, { size: 3, color: '#ffd23f', align: 'center', shadow: false }); }
        if (car.crash > 0 && x) x.glow(c, car.x, PY, 22 * car.crash, '#ff9a3d', 0.7);
      }
      // painel: combustível, velocidade e zona
      g.panel(6, 30, 20, 120, 'rgba(15,18,38,.85)', '#3a4290');
      const fh = 108 * fuel / 100, fc = fuel < 25 ? (Math.floor(sc.t * 4) % 2 ? '#ff5d6c' : '#8a1020') : fuel < 50 ? '#ffd23f' : '#35e07a';
      g.rect(10, 34 + 108 - fh, 12, fh, fc); g.text('COMB.', 16, 152, { size: 4, color: '#fff', align: 'center' });
      // painel/botão do turbo (tocar aqui também aciona)
      const ready = turbo >= 1 && boost <= 0;
      g.panel(E.W - 66, 188, 60, 32, ready && Math.floor(sc.t * 4) % 2 ? 'rgba(20,70,110,.95)' : 'rgba(15,18,38,.85)', ready ? '#9ff2ff' : '#3a4290');
      g.text(Math.round(car.v * 0.6) + ' km/h', E.W - 36, 191, { size: 5, color: '#fff', align: 'center' });
      g.rect(E.W - 60, 201, 48, 5, 'rgba(0,0,0,.5)'); g.rect(E.W - 60, 201, 48 * (boost > 0 ? boost / 2.5 : turbo), 5, boost > 0 ? '#ff9a3d' : ready ? '#9ff2ff' : '#3a7ab0');
      g.text(boost > 0 ? 'TURBO!' : ready ? 'TURBO PRONTO (Espaço)' : 'turbo carregando…', E.W - 36, 209, { size: 3.5, color: ready || boost > 0 ? '#ffd23f' : '#9ff2ff', align: 'center' });
      const zp = (dist % ZL) / ZL; g.rect(120, 6, 160, 4, 'rgba(0,0,0,.4)'); g.rect(120, 6, 160 * zp, 4, '#ffd23f'); g.text(Z().name + (lap ? ' • volta ' + (lap + 1) : ''), 200, 12, { size: 5, color: '#fff', align: 'center' });
      if (zoneAnn > 0) g.text('ZONA: ' + Z().name.toUpperCase(), E.W / 2, 40, { size: 10, color: '#fff', align: 'center' });
      if (x && zone === 2) { const ax = (E.W + 60) - ((sc.t * 50) % (E.W + 120)); x.ilus(c, 'aviao', ax, 70 + Math.sin(sc.t) * 6, 26); }
      if (fuel < 20 && playing && Math.floor(sc.t * 3) % 2) g.text('POUCO COMBUSTÍVEL!', E.W / 2, 58, { size: 7, color: '#ff8f8f', align: 'center' });
      if (over) g.text('ACABOU O COMBUSTÍVEL!', E.W / 2, 90, { size: 11, color: '#ff5d6c', align: 'center' });
    };
    sc.dbg = { end() { fuel = 0; }, car, center, half, get traffic() { return traffic; }, get items() { return items; }, get dist() { return dist; }, get fuel() { return fuel; }, set fuel(v) { fuel = v; }, get crashes() { return crashes; } };
    return sc;
  });

  /* ================================================================ VOO DO AVIÃO (base: Voo da Arara, estilo Flappy) — a viagem de John e Linda até Orlando */
  const VOO_ST = [
    { t: 'Airport', sky: 'cidadeDia', fruit: ['estrela', 'moeda', 'presente'], bg: 'Decolagem!', tree: ['tower', 'house2', 'tower', 'houseAlt1'] },
    { t: 'Clouds', sky: 'sul', fruit: ['estrela', 'moeda', 'balao'], bg: 'Acima das nuvens', tree: ['tower', 'treeLong', 'tree', 'house2'] },
    { t: 'Ocean', sky: 'estrada', fruit: ['estrela', 'moeda', 'peixe'], bg: 'Sobre o mar', tree: ['treePalm', 'treePalm', 'tree', 'treePalm'] },
    { t: 'Sunset', sky: 'festival', fruit: ['estrela', 'moeda', 'presente'], bg: 'Pôr do sol', tree: ['treePalm', 'tree', 'houseSmall1', 'treePalm'] },
    { t: 'Orlando', sky: 'interior', fruit: ['estrela', 'coracao', 'presente'], bg: 'Grandma e grandpa esperam!', tree: ['house1', 'treePalm', 'houseSmall1', 'tree'] }
  ];
  PQ.register({ id: 'e2_voo', world: 2, ref: 'Flappy Bird', title: 'Voo do Avião', icon: 'aviao', c1: '#3ec1ff', c2: '#0b3a5c', music: 'oceano', medals: [150, 300, 480], unit: 'pts',
    desc: 'Voe by plane até Orlando, como John e Linda! Passe entre as nuvens de tempestade e pegue as estrelas.',
    how: 'Toque na tela ou aperte **Espaço** para o avião subir. Passe **entre** as nuvens de tempestade e os prédios. Voe pelas **5 etapas** até **Orlando**! **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const RT = 20; // segundos por região
    const b = { x: 90, y: 100, vy: 0, inv: 0, flap: 0 };
    let dist = 0, playing = false, spawnT = 0.6, obs = [], items = [], ri = 0, rt = 0, prevSky = null, fadeT = 0, speed = 72, regionPop = 0, started = false;
    api.lives = 3; api.refresh();
    api.goal('Etapa: ' + VOO_ST[0].t + ' — ' + VOO_ST[0].bg); api.extra('aviao', VOO_ST[0].t);
    sc.begin = () => { playing = true; started = true; regionPop = 1.8; };
    const flap = () => { if (!playing) return; b.vy = -165; b.flap = 0.25; GG.audio.sfx('jump'); if (X()) X().puff(b.x - 8, b.y + 4, 1, -1); };
    sc.click = () => flap();
    function spawn() {
      const gap = 86 - Math.min(16, ri * 4), cy = 62 + Math.random() * 104;
      obs.push({ x: E.W + 30, top: cy - gap / 2, bot: cy + gap / 2, w: 26, passed: false, tree: VOO_ST[ri].tree[Math.floor(Math.random() * 4)] });
      if (Math.random() < 0.85) items.push({ x: E.W + 43, y: cy + (Math.random() - 0.5) * gap * 0.4, k: Math.random() < 0.18 ? 'frag' : U.pick(VOO_ST[ri].fruit.filter((f) => !X() || X().has(f))) || 'estrela', got: false });
    }
    function hit() {
      if (b.inv > 0 || !playing) return; b.inv = 1.6; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(3, 0.25); if (X()) X().flash('#ff4d4d', 0.3);
      b.vy = -120;
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Você voou até: ' + VOO_ST[ri].bg + '. Tente de novo para chegar a Orlando!'), 700); }
    }
    sc.update = function (dt) {
      sc.t += dt; if (b.inv > 0) b.inv -= dt; if (b.flap > 0) b.flap -= dt; if (regionPop > 0) regionPop -= dt; if (fadeT > 0) fadeT -= dt;
      const IN = GG.input;
      if (IN.pressed('jump') || IN.pressed('up') || IN.pressed('act')) flap();
      if (IN.pressed('pause')) PQ.pause();
      if (!playing) { if (!started) b.y = 100 + Math.sin(sc.t * 3) * 6; return; }
      b.vy = Math.min(b.vy + 430 * dt, 240); b.y += b.vy * dt;
      if (b.y < 14) { b.y = 14; b.vy = 20; }
      if (b.y > 206) { b.y = 206; b.vy = -140; }
      speed = 72 + ri * 6; dist += speed * dt;
      rt += dt;
      if (rt >= RT) {
        rt = 0; api.add(50); GG.audio.sfx('ok');
        if (ri === VOO_ST.length - 1) { playing = false; if (X()) X().flash('#ffffff', 0.4); E.fx.confetti(E.W / 2, 50, 60); setTimeout(() => api.end(api.score + 100, 'Você chegou a Orlando! Grandma e grandpa estão felizes. (+100 de bônus)'), 900); return; }
        prevSky = VOO_ST[ri].sky; fadeT = 1.2; ri++; regionPop = 2.2; api.goal('Etapa: ' + VOO_ST[ri].t + ' — ' + VOO_ST[ri].bg); api.extra('aviao', VOO_ST[ri].t);
      }
      spawnT -= dt; if (spawnT <= 0 && rt < RT - 2.2) { spawn(); spawnT = 1.9 - Math.min(0.5, ri * 0.1); }
      const bx = b.x - 9, by = b.y - 7, bw = 18, bh = 13;
      obs.forEach((o) => {
        o.x -= speed * dt;
        if (!o.passed && o.x + o.w < b.x) { o.passed = true; api.add(5); }
        if (bx + bw > o.x + 3 && bx < o.x + o.w - 3 && (by < o.top || by + bh > o.bot)) hit();
      });
      obs = obs.filter((o) => o.x > -40);
      items.forEach((it) => { it.x -= speed * dt; if (!it.got && Math.hypot(it.x - b.x, it.y - b.y) < 15) { it.got = true; const v = it.k === 'frag' ? 25 : 10; api.add(v); GG.audio.sfx(it.k === 'frag' ? 'frag' : 'coin'); if (X()) { X().sparkle(it.x, it.y, it.k === 'frag' ? '#ffe39a' : '#ffffff', 5); X().pop(it.x, it.y - 10, '+' + v, '#ffe27a', 8); } } });
      items = items.filter((it) => it.x > -20 && !it.got);
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X(), R = VOO_ST[ri];
      if (x) {
        x.sky(g, R.sky, dist * 3, 0, sc.t, { horizon: 190 });
        if (fadeT > 0 && prevSky) { c.save(); c.globalAlpha = fadeT / 1.2; x.sky(g, prevSky, dist * 3, 0, sc.t, { horizon: 190 }); c.restore(); }
      } else { c.fillStyle = '#6cc0f0'; c.fillRect(0, 0, E.W, E.H); }
      obs.forEach((o) => {
        if (x) {
          for (let y = o.top - 16, n = 0; y > -30; y -= 22, n++) x.ilus(c, n === 0 ? 'tempestade' : 'nuvem', o.x + o.w / 2, y, 34);
          if (Math.floor(sc.t * 3 + o.x * 0.1) % 7 === 0) { c.strokeStyle = '#fff6a0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(o.x + 12, o.top - 4); c.lineTo(o.x + 8, o.top + 6); c.lineTo(o.x + 14, o.top + 6); c.lineTo(o.x + 10, o.top + 16); c.stroke(); }
          const im = x.img[o.tree]; if (im) x.hd(c, () => { const h = E.H - o.bot + 10, w = Math.max(o.w + 10, h * im.width / im.height * 0.55); c.drawImage(im, o.x + o.w / 2 - w / 2, o.bot - 4, w, h); });
        } else { g.rect(o.x, 0, o.w, o.top, '#555'); g.rect(o.x, o.bot, o.w, E.H - o.bot, '#3a7a3a'); }
      });
      items.forEach((it) => { const bob = Math.sin(sc.t * 4 + it.x * 0.1) * 2; if (x) { x.glow(c, it.x, it.y + bob, 12, '#fff3b0', 0.5); if (it.k === 'frag') g.img(GG.pixel.fragmento(Math.floor(sc.t * 4) % 2), it.x - 6, it.y - 6 + bob); else x.ilus(c, it.k, it.x, it.y + bob, 16); } else g.circle(it.x, it.y, 5, '#ffd23f'); });
      if (!(b.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        const rot = Math.max(-0.5, Math.min(0.7, b.vy / 300));
        if (x) x.ilus(c, 'aviao', b.x, b.y, 28, { rot: rot - 0.6, sy: b.flap > 0 ? 0.8 + (0.25 - b.flap) : 1 });
        else g.circle(b.x, b.y, 8, '#e5484d');
      }
      g.panel(110, 4, 180, 12, 'rgba(15,18,38,.8)', '#3a4290');
      VOO_ST.forEach((r, i) => { const w = 36; g.rect(110 + i * w, 4, w - 1, 12, i < ri ? 'rgba(61,220,132,.5)' : i === ri ? 'rgba(255,210,63,.35)' : 'rgba(0,0,0,0)'); g.text(r.t, 110 + i * w + w / 2, 7, { size: 4, color: '#fff', align: 'center', maxW: w - 2 }); });
      g.rect(110 + ri * 36, 15, 35 * Math.min(1, rt / RT), 2, '#ffd23f');
      if (regionPop > 0 && started) { const k = Math.min(1, (2.2 - regionPop) * 3); c.save(); c.globalAlpha = Math.min(1, regionPop); c.translate(E.W / 2, 64); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); g.text('Flying: ' + R.t, 0, 0, { size: 10, color: '#ffd23f', align: 'center' }); g.text(R.bg, 0, 16, { size: 6, color: '#fff', align: 'center' }); c.restore(); }
    };
    sc.dbg = { b, skipRegion() { rt = RT; }, win() { ri = VOO_ST.length - 1; rt = RT; } };
    return sc;
  });

  /* ================================================================ COLUNAS DO LABORATÓRIO (base: Colunas do Mosaico, Columns) */
  const GEM = [{ c: '#e5484d', i: 'microbio' }, { c: '#3ec1ff', i: 'gota' }, { c: '#35e07a', i: 'folha' }, { c: '#ffd23f', i: 'lampada' }, { c: '#b07bff', i: 'diamante' }];
  PQ.register({ id: 'e3_colunas', world: 3, ref: 'Columns (Mega Drive) / Puyo Puyo', title: 'Colunas do Laboratório', icon: 'microbio', c1: '#e0287a', c2: '#3a0a24', music: 'labirinto', medals: [800, 2000, 4000], unit: 'pts',
    desc: 'Tubos de experiência caem em colunas de 3 no Laboratório dos Sonhos. Junte 3 ou mais iguais!',
    how: '**← →** movem a coluna, **↑ / Espaço** trocam a ordem das cores, **↓** desce rápido. Junte **3 iguais** (em pé, deitado ou na diagonal). A **estrela** limpa todas as peças da cor onde cair! A cada **6 combinações** sobe o **nível** e as peças caem mais rápido (como no Tetris). Tabuleiro cheio tira **1 das 3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const COLS = 6, ROWS = 12, CS = 15, BX = 155, BY = 24;
    let grid = [], piece = null, next = null, fallT = 0, playing = false, lvl = 1, cleared = 0, clearing = null, chain = 0, time = 0, moveT = 0, combos = 0, lostT = 0;
    api.lives = 3; api.refresh();
    const fresh = () => { grid = []; for (let y = 0; y < ROWS; y++) grid.push(new Array(COLS).fill(-1)); };
    const newPiece = () => ({ x: 2, y: -3, g: Math.random() < 0.05 ? [9, 9, 9] : [0, 0, 0].map(() => Math.floor(Math.random() * GEM.length)) });
    fresh(); next = newPiece();
    function spawn() { piece = next; next = newPiece(); piece.x = 2; piece.y = -3; if (grid[0][2] !== -1) lose(); }
    // Tabuleiro cheio = perde 1 das 3 vidas: o jogo PARA 2 s com o aviso, limpa só a metade de cima e continua.
    function lose() {
      if (lostT > 0) return;
      api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(5, 0.4); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; piece = null; setTimeout(() => api.end(api.score, 'Experiências feitas: ' + cleared + ' • nível ' + lvl + '. Dica: planeje as diagonais!'), 700); return; }
      piece = null; lostT = 2;
      for (let y = 0; y < ROWS / 2; y++) grid[y].fill(-1);
      api.goal('Tabuleiro cheio! Vida perdida — restam ' + api.lives + '. A parte de cima foi limpa.');
    }
    sc.begin = () => { playing = true; spawn(); api.goal('Junte 3 ou mais iguais no laboratório!'); };
    const cellFree = (x, y) => x >= 0 && x < COLS && y < ROWS && (y < 0 || grid[y][x] === -1);
    const canPlace = (x, y) => [0, 1, 2].every((i) => cellFree(x, y + i));
    function lock() {
      piece.g.forEach((v, i) => { const y = piece.y + i; if (y >= 0) grid[y][piece.x] = v; });
      GG.audio.sfx('stomp');
      if (piece.g[0] === 9) { // estrela mágica: limpa a cor de baixo
        const below = piece.y + 3 < ROWS ? grid[piece.y + 3][piece.x] : -1; const mark = new Set();
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] === 9 || (below >= 0 && grid[y][x] === below)) mark.add(y * COLS + x);
        piece = null; startClear(mark); return;
      }
      piece = null; chain = 0; resolve();
    }
    function findMatches() {
      const mark = new Set();
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const v = grid[y][x]; if (v < 0 || v === 9) continue;
        [[1, 0], [0, 1], [1, 1], [1, -1]].forEach(([dx, dy]) => {
          let n = 1; while (grid[y + dy * n] && grid[y + dy * n][x + dx * n] === v) n++;
          if (n >= 3) for (let k = 0; k < n; k++) mark.add((y + dy * k) * COLS + (x + dx * k));
        });
      }
      return mark;
    }
    function resolve() { const m = findMatches(); if (m.size) { chain++; startClear(m); } else spawn(); }
    function startClear(mark) {
      clearing = { mark, t: 0.35 }; combos++;
      const pts = mark.size * 10 * chain * lvl; api.add(pts); cleared += mark.size;
      GG.audio.sfx(chain > 1 ? 'frag' : 'ok');
      mark.forEach((k) => { const x = k % COLS, y = Math.floor(k / COLS); if (X()) X().sparkle(BX + x * CS + CS / 2, BY + y * CS + CS / 2, GEM[grid[y][x]] ? GEM[grid[y][x]].c : '#fff', 2); });
      if (X()) X().pop(BX + COLS * CS / 2, BY + 60, (chain > 1 ? 'CORRENTE x' + chain + '  ' : '') + '+' + pts, '#ffe27a', 9);
      const nl = 1 + Math.floor(combos / 6); // pedido do usuário: a cada 6 combinações, sobe o nível e a peça cai mais rápido
      if (nl > lvl) { lvl = nl; GG.audio.sfx('power'); if (X()) X().pop(BX + COLS * CS / 2, BY + 90, 'NÍVEL ' + lvl + '! MAIS RÁPIDO', '#9ff2ff', 9); }
    }
    function collapse() {
      for (let x = 0; x < COLS; x++) { const col = []; for (let y = ROWS - 1; y >= 0; y--) if (grid[y][x] !== -1) col.push(grid[y][x]); for (let y = ROWS - 1, i = 0; y >= 0; y--, i++) grid[y][x] = i < col.length ? col[i] : -1; }
    }
    sc.click = function (lx) { if (!piece || !playing) return; if (lx < BX - 4) move(-1); else if (lx > BX + COLS * CS + 4) move(1); else rotate(); };
    const move = (d) => { if (piece && canPlace(piece.x + d, piece.y)) { piece.x += d; GG.audio.sfx('click'); } };
    const rotate = () => { if (piece) { piece.g.unshift(piece.g.pop()); GG.audio.sfx('click'); } };
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('estrela', 'Nível ' + lvl);
      if (lostT > 0) { lostT -= dt; if (lostT <= 0) { collapse(); spawn(); } return; }
      if (clearing) { clearing.t -= dt; if (clearing.t <= 0) { clearing.mark.forEach((k) => { grid[Math.floor(k / COLS)][k % COLS] = -1; }); clearing = null; collapse(); resolve(); } return; }
      if (!piece) return;
      if (I.pressed('left')) { move(-1); moveT = 0.22; } else if (I.pressed('right')) { move(1); moveT = 0.22; }
      else if (I.down('left') || I.down('right')) { moveT -= dt; if (moveT <= 0) { move(I.down('left') ? -1 : 1); moveT = 0.07; } }
      if (I.pressed('up') || I.pressed('jump')) rotate();
      if (I.pressed('act')) { while (canPlace(piece.x, piece.y + 1)) piece.y++; if (piece.y < 0) lose(); else lock(); return; }
      fallT += dt * (I.down('down') ? 12 : 1);
      const iv = Math.max(0.12, 0.85 * Math.pow(0.86, lvl - 1));
      if (fallT >= iv) { fallT = 0; if (canPlace(piece.x, piece.y + 1)) piece.y++; else if (piece.y < 0) lose(); else lock(); }
      if (time >= 180) { playing = false; piece = null; setTimeout(() => api.end(api.score, 'Tempo esgotado! Peças limpas: ' + cleared + '.'), 500); }
    };
    function tile(c, x, v, px, py, s) {
      if (v === 9) { if (x) x.glow(c, px + s / 2, py + s / 2, s, '#ffd23f', 0.8); if (!(x && x.ilus(c, 'estrela_brilho', px + s / 2, py + s / 2, s))) { c.fillStyle = '#ffd23f'; c.fillRect(px, py, s, s); } return; }
      const G = GEM[v]; const gr = c.createLinearGradient(px, py, px, py + s); gr.addColorStop(0, G.c); gr.addColorStop(1, GG.pixel.shade(G.c, -60));
      c.fillStyle = gr; c.fillRect(px + 0.5, py + 0.5, s - 1, s - 1); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(px + 1, py + 1, s - 2, 2);
      if (x) x.ilus(c, G.i, px + s / 2, py + s / 2 + 0.5, s - 4);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'sombra', sc.t * 10, 0, sc.t, { horizon: 240 }))) { c.fillStyle = '#1a1030'; c.fillRect(0, 0, E.W, E.H); }
      g.panel(BX - 4, BY - 4, COLS * CS + 8, ROWS * CS + 8, 'rgba(10,8,30,.85)', '#ffd23f');
      for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) {
        const v = grid[y][xx]; if (v < 0) continue;
        if (clearing && clearing.mark.has(y * COLS + xx) && Math.floor(sc.t * 20) % 2) { c.fillStyle = '#fff'; c.fillRect(BX + xx * CS, BY + y * CS, CS, CS); continue; }
        tile(c, x, v, BX + xx * CS, BY + y * CS, CS);
      }
      if (piece) {
        let gy = piece.y; while (canPlace(piece.x, gy + 1)) gy++;
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.strokeRect(BX + piece.x * CS + 0.5, BY + gy * CS + 0.5, CS - 1, CS * 3 - 1);
        piece.g.forEach((v, i) => { const y = piece.y + i; if (y >= 0) tile(c, x, v, BX + piece.x * CS, BY + y * CS, CS); });
      }
      g.panel(BX + COLS * CS + 16, BY, 44, 64, 'rgba(10,8,30,.85)', '#3a4290'); g.text('PRÓXIMA', BX + COLS * CS + 38, BY + 4, { size: 4, color: '#ffd23f', align: 'center' });
      if (next) next.g.forEach((v, i) => tile(c, x, v, BX + COLS * CS + 31, BY + 14 + i * CS, CS));
      g.text('NÍVEL ' + lvl + ' • próximo em ' + (6 - combos % 6) + ' combinações', BX + COLS * CS / 2, BY - 12, { size: 4.5, color: '#9ff2ff', align: 'center' });
      if (lostT > 0) { g.panel(BX - 30, BY + 60, COLS * CS + 60, 44, 'rgba(40,8,20,.92)', '#ff5d6c'); g.text('TABULEIRO CHEIO!', BX + COLS * CS / 2, BY + 66, { size: 8, color: '#ff8f8f', align: 'center' }); g.text('Vida perdida — restam ' + api.lives, BX + COLS * CS / 2, BY + 82, { size: 6, color: '#fff', align: 'center' }); g.text('continua em ' + Math.ceil(lostT) + '…', BX + COLS * CS / 2, BY + 93, { size: 5, color: '#ffd23f', align: 'center' }); }
      g.text('←→ mover  ↑ trocar  ↓ descer', BX + COLS * CS / 2, BY + ROWS * CS + 8, { size: 4, color: '#b9bde6', align: 'center' });
      if (x) { x.ilus(c, 'lupa', 60, 80 + Math.sin(sc.t) * 4, 34); x.ilus(c, 'livros', 70, 140 + Math.sin(sc.t + 1) * 4, 30); x.ilus(c, 'microbio', 330, 150 + Math.sin(sc.t + 2) * 4, 30); }
    };
    sc.dbg = { end() { api.lives = 1; lose(); } };
    return sc;
  });

  /* ================================================================ EMPILHA O BAIRRO (base: Empilha-Prédios, Tower Bloxx) */
  PQ.register({ id: 'e3_bairro', world: 3, ref: 'Tower Bloxx / Stack', title: 'Empilha o Bairro', icon: 'predio', c1: '#3ec1ff', c2: '#0b2a4a', music: 'cidade', medals: [15, 30, 50], unit: 'andares',
    desc: 'O office dos sonhos vai crescer no neighborhood! Solte cada andar na hora certa e suba até as estrelas.',
    how: 'Aperte **Espaço** ou toque para **soltar** o andar. Quanto mais alinhado, melhor: **PERFEITO** não perde nada e faz combo. O que ficar para fora cai! Errar o prédio inteiro tira 1 vida (**3 vidas**).' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const FH = 16, BASEY = 205;
    let floors = [{ x: 170, w: 60, col: '#8a8f9e' }], hook = { t: 0 }, drop = null, playing = false, perfect = 0, pieces = [], camY = 0, time = 0;
    const COLS = ['#e8744f', '#3ec1ff', '#ffd23f', '#35e07a', '#b07bff', '#ff4d6d', '#f39c12'];
    api.lives = 3; api.refresh(); api.goal('Empilhe os andares do office dos sonhos!');
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
          if (api.lives <= 0) { playing = false; setTimeout(() => api.end(floors.length - 1, 'O office dos sonhos ficou com ' + (floors.length - 1) + ' andares!'), 900); } return; }
        const off = Math.abs(drop.x - t.x);
        let nx = l, nw = ov;
        if (off <= 3) { nx = t.x; nw = Math.min(90, t.w + (perfect >= 2 ? 6 : 0)); perfect++; GG.audio.sfx('frag'); if (X()) { X().pop(200, landY - camY - 30, perfect > 1 ? 'PERFEITO x' + perfect + '!' : 'PERFEITO!', '#7bff8f', 10); X().ring(nx + nw / 2, landY - FH / 2, '#7bff8f', 40); } api.add(0); }
        else { perfect = 0; GG.audio.sfx('stomp'); const cutL = drop.x < t.x, cw = drop.w - ov; pieces.push({ x: cutL ? drop.x : r, y: landY - FH, w: cw, col: drop.col, vy: 0, vr: cutL ? -4 : 4, rot: 0 }); }
        floors.push({ x: nx, w: nw, col: drop.col });
        drop = null; E.shake(1.5, 0.1); if (X()) X().puff(nx + nw / 2, landY, 3);
        api.score = floors.length - 1; api.refresh(); api.extra('predio', (floors.length - 1) + ' andares');
        if (floors.length % 10 === 1) { GG.audio.sfx('win'); E.fx.confetti(200, 60, 40); }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Tempo! O office ficou com ' + (floors.length - 1) + ' andares.'), 500); }
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
