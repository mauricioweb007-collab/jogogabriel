/* =====================================================================
   scenes/arcade4.js — MAIS DOIS JOGOS DO ARCADE (pedido do usuário,
   24/09/2026). Registrados com GEO.parque.register, liberados pelo
   chefe do mundo, como os outros:
   • Travessia do Rio (Mundo 1) — atravesse a estrada de terra e o rio
     pulando em troncos, canoas e tartarugas até as ocas da outra margem
     (jogabilidade no estilo Frogger). 3 vidas, 30 s por travessia.
   • Pinball da Floresta (Mundo 3) — mesa de pinball na mata: rebatedores,
     cogumelos-pára-choque, bichos presos para resgatar e Sementes Mágicas
     (jogabilidade no estilo Sonic Spinball). 3 bolas, 3 minutos.
   Nenhum sprite, nome ou fase de jogos comerciais foi copiado.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, C = GEO.common, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ TRAVESSIA DO RIO */
  const CELL = 16, COLS = 25, Y0 = 13, ROWS = 13;
  const OCAS = [2, 7, 12, 17, 22];
  // faixas: y = linha; k = tipo; v = velocidade (px/s; + direita); objs = [início (em células), tamanho (células)]
  const LANES = [
    { row: 1, k: 'tronco', v: 38, objs: [[0, 4], [9, 3], [17, 4]] },
    { row: 2, k: 'tartaruga', v: -34, objs: [[1, 3], [8, 3], [15, 3], [22, 2]], dive: true },
    { row: 3, k: 'canoa', v: 56, objs: [[0, 3], [11, 3], [20, 2]] },
    { row: 4, k: 'jacare', v: -30, objs: [[2, 3], [12, 4], [20, 3]], croc: [0] },
    { row: 5, k: 'tartaruga', v: 44, objs: [[0, 2], [7, 2], [13, 2], [19, 2]], dive: true },
    { row: 7, k: 'caminhao', v: -36, objs: [[0, 2], [12, 2]], road: true },
    { row: 8, k: 'carro', v: 62, objs: [[2, 1], [10, 1], [18, 1]], road: true },
    { row: 9, k: 'bicicleta', v: -48, objs: [[1, 1], [8, 1], [15, 1], [21, 1]], road: true },
    { row: 10, k: 'onibus', v: 30, objs: [[4, 2], [16, 2]], road: true },
    { row: 11, k: 'carro', v: -72, objs: [[3, 1], [13, 1]], road: true }
  ];
  const PERIOD = 480; // os objetos dão a volta na tela
  PQ.register({ id: 'w1_travessia', world: 1, boss: 'c1s5', ref: 'Frogger', title: 'Travessia do Rio', icon: 'jacare', c1: '#2f9be0', c2: '#0b3a5c', music: 'oceano', medals: [600, 1400, 2400], unit: 'pts',
    desc: 'Atravesse a estrada de terra e o rio pulando em troncos, canoas e tartarugas até as ocas da outra margem!',
    how: 'Use as **setas** (ou toque para o lado que quer pular). Na **estrada**, desvie dos veículos. No **rio**, só pise em **troncos, canoas e tartarugas** — as tartarugas **mergulham** e a **boca do jacaré** morde! Leve o Gabriel às **5 ocas**. **3 vidas** e **30 s** por travessia.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const pl = { col: 12, row: 12, x: 12 * CELL, hop: 0, dir: 'up', dead: 0, best: 12 };
    let playing = false, T = 0, cross = 30, total = 0, filled = [false, false, false, false, false], level = 0, bonusOca = -1, bonusT = 6;
    api.lives = 3; api.refresh(); api.goal('Leve o Gabriel às 5 ocas do outro lado do rio!');
    const rowY = (r) => Y0 + r * CELL;
    const spd = () => 1 + level * 0.18;
    sc.begin = () => { playing = true; };
    const objX = (L, o) => { const p = ((o[0] * CELL + L.v * spd() * T) % PERIOD + PERIOD) % PERIOD; return p - (PERIOD - 400); };
    function diving(L, i) { if (!L.dive || i % 2) return 0; const s = Math.sin(T * 0.9 + i * 1.7 + L.row); return s > 0.55 ? (s > 0.8 ? 2 : 1) : 0; } // 1 afundando, 2 embaixo d'água
    function move(dx, dy) {
      if (!playing || pl.dead > 0 || pl.hop > 0) return;
      const nr = U.clamp(pl.row + dy, 0, ROWS - 1), nx = U.clamp(pl.x + dx * CELL, 0, (COLS - 1) * CELL);
      pl.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      pl.row = nr; pl.x = nx; pl.hop = 0.12; GG.audio.sfx('jump');
      if (nr < pl.best) { pl.best = nr; api.add(10); }
    }
    PQ.pointer(sc, { pointerdown: (lx, ly) => { const dx = lx - (pl.x + 8), dy = ly - (rowY(pl.row) + 8); if (Math.abs(dy) > Math.abs(dx)) move(0, dy < 0 ? -1 : 1); else move(dx < 0 ? -1 : 1, 0); } });
    function die(why) {
      if (pl.dead > 0) return;
      pl.dead = 1; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(3, 0.25);
      if (X()) { X().flash('#ff4d4d', 0.25); X().pop(pl.x + 8, rowY(pl.row) - 4, why, '#ff8f8f', 8); if (why === 'Caiu na água!') X().ring(pl.x + 8, rowY(pl.row) + 8, '#9ff2ff', 18); }
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ocas alcançadas: ' + total + ' • nível ' + (level + 1) + '. Espere o tronco chegar antes de pular!'), 900); }
    }
    function respawn() { pl.col = 12; pl.row = 12; pl.x = 12 * CELL; pl.best = 12; pl.dir = 'up'; cross = 30; }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      T += dt; if (pl.hop > 0) pl.hop -= dt;
      bonusT -= dt; if (bonusT <= 0) { bonusT = 7; const free = OCAS.map((_, i) => i).filter((i) => !filled[i]); bonusOca = Math.random() < 0.6 && free.length ? U.pick(free) : -1; }
      if (pl.dead > 0) { pl.dead -= dt; if (pl.dead <= 0 && playing) respawn(); return; }
      if (I.pressed('up') || I.pressed('jump')) move(0, -1); else if (I.pressed('down')) move(0, 1); else if (I.pressed('left')) move(-1, 0); else if (I.pressed('right')) move(1, 0);
      cross -= dt; api.extra('cronometro', Math.max(0, Math.ceil(cross)) + 's');
      if (cross <= 0) { die('O tempo acabou!'); return; }
      const L = LANES.find((l) => l.row === pl.row), px = pl.x + 3, pw = 10;
      if (L && L.road) {
        L.objs.forEach((o) => { const ox = objX(L, o), ow = o[1] * CELL; if (px + pw > ox + 2 && px < ox + ow - 2) die('Cuidado com a estrada!'); });
      } else if (L) {
        let on = null;
        L.objs.forEach((o, i) => { const ox = objX(L, o), ow = o[1] * CELL; if (pl.x + 8 > ox && pl.x + 8 < ox + ow && diving(L, i) < 2) on = { ox, ow, i }; });
        if (!on) { die('Caiu na água!'); return; }
        if (L.croc) { const head = L.v < 0 ? on.ox : on.ox + on.ow - CELL; if (pl.x + 8 > head && pl.x + 8 < head + CELL) { die('O jacaré mordeu!'); return; } }
        if (pl.hop <= 0) pl.x += L.v * spd() * dt;
        if (pl.x < -4 || pl.x > (COLS - 1) * CELL + 4) { die('A correnteza levou!'); return; }
      }
      if (pl.row === 0 && pl.hop <= 0) {
        const oi = OCAS.findIndex((c) => Math.abs(pl.x - c * CELL) < 9);
        if (oi < 0 || filled[oi]) { die(oi < 0 ? 'Mata fechada! Mire na oca' : 'Essa oca já tem gente!'); return; }
        filled[oi] = true; total++; const tb = Math.ceil(cross) * 3 + (bonusOca === oi ? 150 : 0); api.add(50 + tb); GG.audio.sfx(bonusOca === oi ? 'frag' : 'win');
        if (X()) { X().sparkle(OCAS[oi] * CELL + 8, rowY(0) + 8, '#fff0a0', 8); X().pop(OCAS[oi] * CELL + 8, rowY(1), '+' + (50 + tb) + (bonusOca === oi ? ' PEIXE!' : ''), '#ffe27a', 8); }
        if (bonusOca === oi) bonusOca = -1;
        if (filled.every(Boolean)) { level++; filled = filled.map(() => false); api.add(500); E.fx.confetti(E.W / 2, 40, 50); if (X()) X().pop(E.W / 2, 80, 'TODAS AS OCAS! +500 — nível ' + (level + 1), '#7bff8f', 11); api.goal('Nível ' + (level + 1) + ': tudo mais rápido!'); }
        respawn();
      }
      if (T >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo total esgotado! Ocas alcançadas: ' + total + '.'), 500); }
    };
    function drawObj(c, g, x, L, ox, len, i) {
      const y = rowY(L.row), w = len * CELL, d = diving(L, i);
      if (L.k === 'tronco') { c.fillStyle = '#6b3f1d'; c.fillRect(ox, y + 3, w, 10); c.fillStyle = '#8a5a2e'; c.fillRect(ox, y + 3, w, 3); c.fillStyle = '#a0683a'; c.beginPath(); c.ellipse(ox + w, y + 8, 2.5, 5, 0, 0, Math.PI * 2); c.fill(); return; }
      if (L.k === 'canoa') { c.fillStyle = '#b5652a'; c.beginPath(); c.moveTo(ox, y + 5); c.lineTo(ox + w, y + 5); c.lineTo(ox + w - 5, y + 13); c.lineTo(ox + 5, y + 13); c.closePath(); c.fill(); c.fillStyle = '#7a3f15'; c.fillRect(ox + 4, y + 6, w - 8, 3); c.fillStyle = '#e5484d'; c.fillRect(ox + w / 2 - 1, y + 6, 2, 6); return; }
      if (L.k === 'tartaruga') { for (let k = 0; k < len; k++) { c.save(); c.globalAlpha = d === 2 ? 0.15 : d === 1 ? 0.55 : 1; if (!(x && x.ilus(c, 'tartaruga', ox + k * CELL + 8, y + 8, 15, { flip: L.v < 0 }))) { c.fillStyle = '#2e9e6a'; c.fillRect(ox + k * CELL + 2, y + 3, 12, 10); } c.restore(); } return; }
      if (L.k === 'jacare') { c.fillStyle = '#3f7a3a'; c.fillRect(ox, y + 4, w, 9); c.fillStyle = '#2e5a2a'; for (let k = 4; k < w; k += 6) c.fillRect(ox + k, y + 3, 3, 2); const hx = L.v < 0 ? ox : ox + w - CELL; c.fillStyle = '#5aa04f'; c.fillRect(hx, y + 3, CELL, 11); c.fillStyle = '#fff'; c.fillRect(hx + (L.v < 0 ? 2 : 10), y + 4, 3, 3); c.fillStyle = '#e5484d'; c.fillRect(hx + (L.v < 0 ? 0 : 12), y + 9, 4, 2); return; }
      const ic = { caminhao: 'caminhao', carro: 'carro', bicicleta: 'bicicleta', onibus: 'onibus' }[L.k];
      if (!(x && x.ilus(c, ic, ox + w / 2, y + 8, L.k === 'bicicleta' ? 15 : w > CELL ? 26 : 16, { flip: L.v > 0 }))) { c.fillStyle = '#ffd23f'; c.fillRect(ox + 1, y + 3, w - 2, 10); }
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      c.fillStyle = '#0b1a2a'; c.fillRect(0, 0, E.W, E.H);
      // margens, rio e estrada
      c.fillStyle = '#2e7d3a'; c.fillRect(0, rowY(0), E.W, CELL); // mata da outra margem
      const rio = c.createLinearGradient(0, rowY(1), 0, rowY(6)); rio.addColorStop(0, '#1f78c8'); rio.addColorStop(1, '#2f9be0'); c.fillStyle = rio; c.fillRect(0, rowY(1), E.W, CELL * 5);
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let r = 1; r <= 5; r++) for (let k = 0; k < 8; k++) c.fillRect(((k * 57 + T * 20 * (r % 2 ? 1 : -1)) % 420 + 420) % 420 - 10, rowY(r) + 7 + (k % 2) * 4, 8, 1);
      c.fillStyle = '#c9a36a'; c.fillRect(0, rowY(6), E.W, CELL); c.fillStyle = '#7a8a3a'; for (let k = 0; k < 25; k++) c.fillRect(k * 16 + 3, rowY(6) + 2 + (k % 3), 2, 3);
      c.fillStyle = '#8a6a44'; c.fillRect(0, rowY(7), E.W, CELL * 5); c.fillStyle = 'rgba(255,240,200,.25)'; for (let r = 7; r < 11; r++) for (let k = 0; k < E.W; k += 24) c.fillRect(k, rowY(r) + 15, 12, 1);
      c.fillStyle = '#6aa84f'; c.fillRect(0, rowY(12), E.W, CELL);
      // ocas
      OCAS.forEach((col, i) => { const ox = col * CELL; c.fillStyle = '#1f4a2a'; c.fillRect(ox - 2, rowY(0), CELL + 4, CELL); if (x) x.ilus(c, 'cabana', ox + 8, rowY(0) + 7, 16, { alpha: filled[i] ? 1 : 0.55 }); if (filled[i]) g.img(C.gabrielTop(GEO.eco.look(), 'down', false, 0), ox + 1, rowY(0) - 3); else if (bonusOca === i && x) x.ilus(c, 'peixe', ox + 8, rowY(0) + 8, 12); });
      LANES.forEach((L) => L.objs.forEach((o, i) => drawObj(c, g, x, L, objX(L, o), o[1], i)));
      // Gabriel
      if (!(pl.dead > 0 && Math.floor(sc.t * 12) % 2)) {
        const lift = pl.hop > 0 ? Math.sin((0.12 - pl.hop) / 0.12 * Math.PI) * 4 : 0;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(pl.x + 8, rowY(pl.row) + 14, 5, 2, 0, 0, Math.PI * 2); c.fill();
        g.img(C.gabrielTop(GEO.eco.look(), pl.dir, pl.hop > 0, sc.t), pl.x + 1, rowY(pl.row) - 4 - lift, { flip: pl.dir === 'left' });
      }
      // barra de tempo da travessia
      g.rect(0, 222, E.W, 3, 'rgba(0,0,0,.5)'); g.rect(0, 222, E.W * Math.max(0, cross) / 30, 3, cross < 8 ? '#ff5d6c' : '#ffd23f');
      g.text('Ocas: ' + filled.filter(Boolean).length + '/5 • nível ' + (level + 1), 4, 2, { size: 5, color: '#fff' });
    };
    sc.dbg = { end() { api.lives = 1; pl.dead = 0; die('fim'); }, pl, get filled() { return filled; }, fillAll() { filled = [true, true, true, true, false]; pl.row = 1; pl.x = OCAS[4] * CELL; pl.best = 1; } };
    return sc;
  });

  /* ================================================================ PINBALL DA FLORESTA */
  // mesa: paredes como segmentos [x1, y1, x2, y2]
  const WALLS = [
    [110, 60, 122, 30], [122, 30, 150, 14], [150, 14, 200, 8], [200, 8, 250, 14], [250, 14, 285, 26], [285, 26, 302, 45], // arco de cima
    [110, 60, 110, 162], [110, 162, 156, 194], // esquerda + rampa do rebatedor
    [290, 62, 290, 162], [290, 162, 244, 194], // direita + rampa
    [302, 45, 302, 222], [290, 162, 290, 222], // canaleta do lançador
    [290, 212, 302, 212] // chão do lançador
  ];
  const SLINGS = [[128, 132, 150, 166], [272, 132, 250, 166]]; // estilingues (chutam forte)
  const BUMPERS = [{ x: 170, y: 72, r: 11 }, { x: 230, y: 72, r: 11 }, { x: 200, y: 104, r: 11 }];
  const TARGETS = [{ x: 172, k: 'arara' }, { x: 196, k: 'macaco' }, { x: 220, k: 'preguica' }];
  const SEED_SPOTS = [[140, 110], [260, 110], [200, 44], [150, 70], [250, 70]];
  const FL = [{ px: 158, py: 196, rest: 0.5, up: -0.5, key: 'left' }, { px: 242, py: 196, rest: Math.PI - 0.5, up: Math.PI + 0.5, key: 'right' }];
  const FLEN = 31, BR = 4;
  PQ.register({ id: 'w3_pinball', world: 3, boss: 'c3s6', ref: 'Sonic Spinball (Mega Drive)', title: 'Pinball da Floresta', icon: 'arvore', c1: '#2ecc71', c2: '#0f3a1f', music: 'festa', medals: [3000, 7000, 12000], unit: 'pts',
    desc: 'Pinball na mata! Rebata a bola, acerte os cogumelos, liberte os bichos presos e junte as Sementes Mágicas para a floresta renascer.',
    how: '**←** rebatedor da esquerda e **→** da direita (ou toque na metade esquerda/direita). **Espaço** (ou toque) lança a bola. Acerte os **3 bichos presos** para o **RESGATE** (multiplicador sobe!) e pegue as **Sementes Mágicas**: 3 sementes = bola extra. **3 bolas**, 3 minutos.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ball = { x: 296, y: 207, vx: 0, vy: 0, inLane: true };
    const fl = FL.map((f) => ({ ...f, a: f.rest, w: 0 }));
    let playing = false, time = 0, mult = 1, targets = [false, false, false], resetT = 0, seed = null, seeds = 0, saveT = 0, hold = { left: false, right: false }, flash = {}, bumpT = [0, 0, 0], green = 0;
    api.lives = 3; api.refresh(); api.goal('Liberte os bichos e junte as Sementes Mágicas!');
    sc.begin = () => { playing = true; newSeed(); };
    function newSeed() { const s = U.pick(SEED_SPOTS); seed = { x: s[0], y: s[1] }; }
    function launch() { if (!playing || !ball.inLane) return; ball.inLane = false; ball.vy = -560 - Math.random() * 40; ball.vx = 0; saveT = 5; GG.audio.sfx('shoot'); }
    PQ.pointer(sc, {
      pointerdown: (lx) => { if (ball.inLane) { launch(); return; } hold[lx < E.W / 2 ? 'left' : 'right'] = true; },
      pointerup: () => { hold.left = hold.right = false; }, pointercancel: () => { hold.left = hold.right = false; }
    });
    function collideSeg(x1, y1, x2, y2, e, kick) {
      const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
      let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / L2; t = U.clamp(t, 0, 1);
      const cx = x1 + t * dx, cy = y1 + t * dy, ox = ball.x - cx, oy = ball.y - cy, d = Math.hypot(ox, oy);
      if (d >= BR || d === 0) return false;
      const nx = ox / d, ny = oy / d; ball.x = cx + nx * BR; ball.y = cy + ny * BR;
      const vn = ball.vx * nx + ball.vy * ny;
      if (vn < 0) { ball.vx -= (1 + e) * vn * nx; ball.vy -= (1 + e) * vn * ny; if (kick) { ball.vx += nx * kick; ball.vy += ny * kick; } }
      return true;
    }
    function lose() {
      if (saveT > 0) { ball.inLane = true; ball.x = 296; ball.y = 207; ball.vx = ball.vy = 0; if (X()) X().pop(200, 120, 'BOLA SALVA!', '#9ff2ff', 10); GG.audio.sfx('check'); return; }
      api.lives--; api.refresh(); GG.audio.sfx('hit'); if (X()) X().flash('#ff4d4d', 0.25); mult = 1;
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Bichos resgatados e sementes: ' + seeds + ' semente(s). Segure o rebatedor para “segurar” a bola e mirar!'), 700); return; }
      ball.inLane = true; ball.x = 296; ball.y = 207; ball.vx = ball.vy = 0;
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(180 - time)) + 's');
      if (I.pressed('jump') || I.pressed('up')) launch();
      if (saveT > 0) saveT -= dt; if (resetT > 0) { resetT -= dt; if (resetT <= 0) targets = [false, false, false]; }
      bumpT = bumpT.map((v) => Math.max(0, v - dt)); if (green > 0) green -= dt * 0.1;
      fl.forEach((f) => {
        const down = f.key === 'left' ? (I.down('left') || hold.left) : (I.down('right') || hold.right);
        const target = down ? f.up : f.rest, prev = f.a, sp = 20 * dt;
        f.a += U.clamp(target - f.a, -sp, sp); f.w = (f.a - prev) / dt;
        if (down && Math.abs(prev - f.up) > 0.05 && Math.abs(f.a - f.up) < 0.05) GG.audio.note('C4', 0.03);
      });
      if (ball.inLane) { ball.x = 296; ball.y = 207; return; }
      const N = 6, h = dt / N;
      for (let s = 0; s < N; s++) {
        ball.vy += 330 * h; ball.x += ball.vx * h; ball.y += ball.vy * h;
        const sp = Math.hypot(ball.vx, ball.vy); if (sp > 600) { ball.vx *= 600 / sp; ball.vy *= 600 / sp; }
        WALLS.forEach((w) => collideSeg(w[0], w[1], w[2], w[3], 0.45, 0));
        SLINGS.forEach((w, i) => { if (collideSeg(w[0], w[1], w[2], w[3], 0.6, 140)) { api.add(20 * mult); flash['s' + i] = 0.15; GG.audio.note('G5', 0.04); } });
        BUMPERS.forEach((b, i) => {
          const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
          if (d < b.r + BR && d > 0) { const nx = dx / d, ny = dy / d; ball.x = b.x + nx * (b.r + BR); ball.y = b.y + ny * (b.r + BR); const v = Math.max(260, Math.hypot(ball.vx, ball.vy)); ball.vx = nx * v; ball.vy = ny * v; bumpT[i] = 0.15; api.add(50 * mult); GG.audio.sfx('spring'); if (X()) X().ring(b.x, b.y, '#ffd23f', 16); }
        });
        TARGETS.forEach((t, i) => {
          if (targets[i]) return;
          if (ball.x > t.x - 7 && ball.x < t.x + 7 && ball.y > 30 && ball.y < 40) {
            targets[i] = true; ball.vy = Math.abs(ball.vy) * 0.8 + 40; api.add(150 * mult); GG.audio.sfx('coin');
            if (X()) { X().sparkle(t.x, 34, '#fff0a0', 6); X().pop(t.x, 48, 'LIVRE!', '#7bff8f', 7); }
            if (targets.every(Boolean)) { api.add(600 * mult); mult = Math.min(5, mult + 1); resetT = 1.5; GG.audio.sfx('win'); green = 1; E.fx.confetti(200, 40, 30); if (X()) X().pop(200, 90, 'RESGATE! +' + 600 * (mult - 1) + '  multiplicador x' + mult, '#ffd23f', 10); }
          }
        });
        fl.forEach((f) => {
          const tx = f.px + Math.cos(f.a) * FLEN, ty = f.py + Math.sin(f.a) * FLEN;
          const dx = tx - f.px, dy = ty - f.py, L2 = dx * dx + dy * dy;
          let t = ((ball.x - f.px) * dx + (ball.y - f.py) * dy) / L2; t = U.clamp(t, 0, 1);
          const cx = f.px + t * dx, cy = f.py + t * dy, ox = ball.x - cx, oy = ball.y - cy, d = Math.hypot(ox, oy), rr = BR + 3;
          if (d < rr && d > 0) {
            const nx = ox / d, ny = oy / d; ball.x = cx + nx * rr; ball.y = cy + ny * rr;
            const rx = cx - f.px, ry = cy - f.py, svx = -f.w * ry, svy = f.w * rx; // velocidade da superfície do rebatedor
            const rvx = ball.vx - svx, rvy = ball.vy - svy, vn = rvx * nx + rvy * ny;
            if (vn < 0) { ball.vx = svx + rvx - 1.4 * vn * nx; ball.vy = svy + rvy - 1.4 * vn * ny; }
          }
        });
        if (seed && Math.hypot(ball.x - seed.x, ball.y - seed.y) < 9) {
          seeds++; api.add(300 * mult); GG.audio.sfx('frag'); if (X()) { X().sparkle(seed.x, seed.y, '#7bff8f', 10); X().pop(seed.x, seed.y - 10, 'SEMENTE MÁGICA!', '#7bff8f', 8); }
          seed = null; setTimeout(() => { if (playing) newSeed(); }, 1200);
          if (seeds % 3 === 0) { api.add(1000); api.lives = Math.min(5, api.lives + 1); api.maxLives = Math.max(api.maxLives, api.lives); api.refresh(); green = 1; if (X()) X().pop(200, 110, 'A FLORESTA RENASCEU! +1000 e BOLA EXTRA', '#7bff8f', 10); GG.audio.sfx('power'); }
        }
        if (ball.y > E.H + 8) { lose(); return; }
        if (ball.x > 290 && ball.y > 200 && Math.abs(ball.vy) < 30) { ball.inLane = true; return; }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo esgotado! Sementes Mágicas: ' + seeds + ' • multiplicador x' + mult + '.'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'floresta', sc.t * 4, 0, sc.t, { horizon: 240 }))) { c.fillStyle = '#12301c'; c.fillRect(0, 0, E.W, E.H); }
      // mesa
      c.fillStyle = 'rgba(8,30,16,.88)'; c.beginPath(); c.moveTo(110, 225); c.lineTo(110, 60); c.lineTo(122, 30); c.lineTo(150, 14); c.lineTo(200, 8); c.lineTo(250, 14); c.lineTo(285, 26); c.lineTo(302, 45); c.lineTo(302, 225); c.closePath(); c.fill();
      if (green > 0) { c.save(); c.globalAlpha = Math.min(0.35, green * 0.35); c.fillStyle = '#35e07a'; c.fill(); c.restore(); }
      c.strokeStyle = '#c9a24d'; c.lineWidth = 2; WALLS.forEach((w) => { c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke(); });
      SLINGS.forEach((w, i) => { c.strokeStyle = flash['s' + i] > 0 ? '#fff' : '#ff9a3d'; c.lineWidth = 3; c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke(); if (flash['s' + i] > 0) flash['s' + i] -= 1 / 60; });
      BUMPERS.forEach((b, i) => { const k = bumpT[i] > 0 ? 1.2 : 1; if (x) { x.glow(c, b.x, b.y, b.r * 1.6, '#ffd23f', bumpT[i] > 0 ? 0.9 : 0.35); x.ilus(c, 'girassol', b.x, b.y, b.r * 2 * k); } else g.circle(b.x, b.y, b.r, '#ffd23f'); });
      TARGETS.forEach((t, i) => { if (targets[i]) { if (x) x.ilus(c, t.k, t.x, 22 - (sc.t * 30 % 8), 12); return; } c.fillStyle = '#6b4f2a'; c.fillRect(t.x - 7, 30, 14, 10); if (x) x.ilus(c, t.k, t.x, 35, 10); c.strokeStyle = '#cfcfcf'; c.lineWidth = 1; for (let k = -5; k <= 5; k += 3) { c.beginPath(); c.moveTo(t.x + k, 30); c.lineTo(t.x + k, 40); c.stroke(); } });
      if (seed) { if (x) { x.glow(c, seed.x, seed.y, 12, '#7bff8f', 0.7 + Math.sin(sc.t * 6) * 0.2); x.ilus(c, 'muda', seed.x, seed.y, 13); } else g.circle(seed.x, seed.y, 5, '#7bff8f'); }
      fl.forEach((f) => { const tx = f.px + Math.cos(f.a) * FLEN, ty = f.py + Math.sin(f.a) * FLEN; c.strokeStyle = '#15152a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(f.px, f.py); c.lineTo(tx, ty); c.stroke(); c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.stroke(); c.lineCap = 'butt'; g.circle(f.px, f.py, 2.5, '#e5484d'); });
      // bola (uma semente-bola girando, como o herói do Spinball)
      if (x) x.glow(c, ball.x, ball.y, 8, '#9ff2ff', 0.6);
      c.save(); c.translate(ball.x, ball.y); c.rotate(sc.t * 12); g.circle(0, 0, BR, '#e8f6ff'); c.fillStyle = '#3ec1ff'; c.fillRect(-BR, -1, BR * 2, 2); c.restore();
      if (ball.inLane && playing) g.text('ESPAÇO / TOQUE = LANÇAR', 200, 130, { size: 6, color: '#ffd23f', align: 'center' });
      // painel lateral
      g.panel(8, 20, 92, 70, 'rgba(10,20,14,.85)', '#2e9e6a');
      g.text('MULTIPLICADOR', 54, 24, { size: 4, color: '#9fe8b0', align: 'center' }); g.text('x' + mult, 54, 32, { size: 12, color: '#ffd23f', align: 'center' });
      g.text('Sementes: ' + seeds + ' (' + (3 - seeds % 3) + ' p/ bola extra)', 54, 56, { size: 4, color: '#fff', align: 'center', maxW: 88 });
      g.text('Bichos: ' + targets.filter(Boolean).length + '/3', 54, 68, { size: 5, color: '#fff', align: 'center' });
      if (saveT > 0 && !ball.inLane) g.text('bola salva: ' + Math.ceil(saveT) + 's', 54, 80, { size: 4, color: '#9ff2ff', align: 'center' });
      g.text('← rebatedor   → rebatedor', 200, 214, { size: 4, color: '#b9e6c4', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; saveT = 0; lose(); }, ball, get seeds() { return seeds; }, get mult() { return mult; } };
    return sc;
  });
})();
