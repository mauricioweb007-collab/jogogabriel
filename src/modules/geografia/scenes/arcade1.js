/* =====================================================================
   scenes/arcade1.js — ARCADE DO MUNDO 1 (O Mosaico do Povo Brasileiro)
   Recompensa depois do chefe Generalizador: jogos curtos (2–3 min),
   sem perguntas, com 3 vidas e recorde. Inspirados em jogabilidades
   clássicas de 16 bits (nenhum sprite, nome ou fase copiados):
   • Jangada Radical — corrida automática que acelera sem parar, com
     pulo, pulo duplo e abaixar (estilo carrinho de mina de Donkey Kong
     Country / Sonic e o dinossauro do Chrome);
   • Colunas do Mosaico — peças de 3 caem; alinhe 3+ iguais
     (estilo Columns do Mega Drive / Puyo Puyo);
   • Quebra-Mosaico — raquete e bolinha que quebram um mosaico
     (estilo Arkanoid), com poderes que caem dos tijolos.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, C = GEO.common, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ JANGADA RADICAL */
  PQ.register({ id: 'w1_jangada', world: 1, boss: 'c1s5', ref: 'Donkey Kong Country / Sonic', title: 'Jangada Radical', icon: 'veleiro', c1: '#1f8fd0', c2: '#0b3a5c', music: 'corrida', medals: [300, 700, 1200], unit: 'pts',
    desc: 'Surfe com a jangada pelo litoral: pule pedras, troncos e ondas gigantes e pegue peixes e fragmentos!',
    how: 'A jangada anda sozinha e fica **cada vez mais rápida**. **Espaço / ↑** (ou toque em cima) = **pular**; no ar, de novo = **pulo duplo**. **↓** (ou toque embaixo) = **abaixar** para passar debaixo das **redes de pesca** e das gaivotas em rasante. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const SEA = 172, J = { x: 86, y: SEA, vy: 0, air: false, jumps: 0, inv: 0, star: 0, duck: 0 };
    let dist = 0, speed = 140, gear = 0, playing = false, spawnT = 1.2, itemT = 0.6, time = 0, obs = [], items = [], dead = false;
    api.lives = 3; api.refresh(); api.goal('Chegue ao porto (2 min 30 s) sem perder as 3 vidas!');
    sc.begin = () => { playing = true; };
    const jump = () => {
      if (!playing) return;
      if (!J.air) { J.vy = -330; J.air = true; J.jumps = 1; GG.audio.sfx('jump'); if (X()) X().puff(J.x, SEA + 4, 3); }
      else if (J.jumps < 2) { J.vy = -290; J.jumps = 2; GG.audio.sfx('spring'); if (X()) X().sparkle(J.x, J.y, '#9ff2ff', 4); }
    };
    const duck = () => { if (!playing) return; J.duck = 0.55; if (J.air) J.vy = Math.max(J.vy, 420); };
    sc.click = (lx, ly) => { if (ly > 150) duck(); else jump(); };
    function spawn() {
      const lvl = Math.min(1, time / 120), r = Math.random();
      const k = r < 0.26 ? 'pedra' : r < 0.44 ? 'tronco' : r < 0.58 ? 'ave' : r < 0.7 ? 'onda' : r < 0.86 + lvl * 0.04 ? 'rede' : 'rasante';
      const o = { k, x: E.W + 30 };
      if (k === 'pedra') Object.assign(o, { w: 22, h: 20, y: SEA - 18 });
      if (k === 'tronco') Object.assign(o, { w: 34, h: 10, y: SEA - 8 });
      if (k === 'onda') Object.assign(o, { w: 30, h: 44, y: SEA - 42 });
      if (k === 'ave') Object.assign(o, { w: 18, h: 12, y: SEA - 88 - Math.random() * 20 });
      if (k === 'rede') Object.assign(o, { w: 26, h: SEA - 22, y: 0 }); // píer com rede: só passa abaixado
      if (k === 'rasante') Object.assign(o, { w: 20, h: 14, y: SEA - 42 }); // gaivota em voo baixo
      obs.push(o);
    }
    function hurt() {
      if (J.inv > 0 || J.star > 0) return;
      api.lives--; api.refresh(); J.inv = 1.6; GG.audio.sfx('hit'); E.shake(4, 0.3); if (X()) X().flash('#ff4d4d', 0.3);
      if (api.lives <= 0) { playing = false; dead = true; setTimeout(() => api.end(api.score, 'Distância: ' + Math.round(dist / 10) + ' m. Pule mais cedo nas ondas gigantes (pulo duplo)!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt;
      const I = IN();
      if (I.pressed('jump') || I.pressed('up') || I.pressed('act')) jump();
      if (I.down('down')) duck();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      // como o dinossauro do Chrome: acelera sem parar e dá um "tranco" a cada 20 s
      time += dt; speed = Math.min(360, 140 + time * 1.45);
      const ng = Math.floor(time / 20); if (ng > gear) { gear = ng; GG.audio.sfx('boost'); if (X()) X().pop(E.W / 2, 60, 'MAIS RÁPIDO!', '#9ff2ff', 11); }
      if (J.duck > 0) J.duck -= dt; dist += speed * dt; api.extra('cronometro', Math.max(0, Math.ceil(150 - time)) + 's');
      if (Math.floor(dist / 100) !== Math.floor((dist - speed * dt) / 100)) api.add(2);
      J.vy += 900 * dt; J.y += J.vy * dt;
      const surf = SEA + Math.sin(sc.t * 3) * 1.5;
      if (J.y >= surf) { if (J.air && J.vy > 150 && X()) X().puff(J.x, SEA + 4, 4); J.y = surf; J.vy = 0; J.air = false; J.jumps = 0; }
      if (J.inv > 0) J.inv -= dt; if (J.star > 0) J.star -= dt;
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = (Math.max(0.62, 1.55 - time * 0.006) + Math.random() * 0.5) * Math.min(1, 200 / speed + 0.25); }
      itemT -= dt; if (itemT <= 0) { itemT = 0.9 + Math.random() * 0.8; const r = Math.random(); items.push({ k: r < 0.08 ? 'estrela_brilho' : r < 0.25 ? 'frag' : r < 0.6 ? 'peixe' : 'coco', x: E.W + 20, y: SEA - 30 - Math.random() * 70 }); }
      obs.forEach((o) => { o.x -= speed * dt * (o.k === 'ave' || o.k === 'rasante' ? 1.2 : 1); });
      items.forEach((it) => { it.x -= speed * dt; });
      const box = J.duck > 0 && !J.air ? { x: J.x - 16, y: J.y - 16, w: 30, h: 14 } : { x: J.x - 16, y: J.y - 34, w: 30, h: 32 };
      obs.forEach((o) => { if (!o.hit && E.overlap(box, { x: o.x + 3, y: o.y + 2, w: o.w - 6, h: o.h - 3 })) { o.hit = true; if (J.star > 0) { api.add(30); if (X()) X().pop(o.x, o.y, '+30', '#ffd23f', 8); } else hurt(); } });
      items.forEach((it) => {
        if (it.got || Math.hypot(it.x - J.x, it.y - (J.y - 18)) > 20) return;
        it.got = true; const v = it.k === 'frag' ? 25 : it.k === 'peixe' ? 10 : it.k === 'coco' ? 5 : 20;
        if (it.k === 'estrela_brilho') { J.star = 5; GG.audio.sfx('power'); if (X()) X().flash('#ffd23f', 0.3); }
        api.add(v); GG.audio.sfx(it.k === 'frag' ? 'frag' : 'coin'); if (X()) { X().sparkle(it.x, it.y, '#fff0a0', 4); X().pop(it.x, it.y - 8, '+' + v, '#ffe27a', 7); }
      });
      obs = obs.filter((o) => o.x > -60); items = items.filter((it) => it.x > -30 && !it.got);
      if (time >= 150 && !dead) { playing = false; api.add(250); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 50, 60); setTimeout(() => api.end(api.score, 'Você chegou ao porto! +250 de bônus.'), 900); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'estrada', dist * 0.6, 0, sc.t, { horizon: 128 }))) { c.fillStyle = '#7fd4ff'; c.fillRect(0, 0, E.W, E.H); }
      // mar com ondas em camadas
      const sea = c.createLinearGradient(0, 128, 0, E.H); sea.addColorStop(0, '#2f9be0'); sea.addColorStop(1, '#0b4a86'); c.fillStyle = sea; c.fillRect(0, 128, E.W, E.H - 128);
      for (let row = 0; row < 6; row++) { const y = 136 + row * 16, sp = 0.3 + row * 0.25; c.fillStyle = 'rgba(255,255,255,' + (0.1 + row * 0.04) + ')'; for (let xx = -((dist * sp) % 48) - 48; xx < E.W; xx += 48) c.fillRect(xx + (row % 2) * 24, y + Math.sin(sc.t * 2 + row) * 1.5, 18, 2); }
      obs.forEach((o) => {
        if (o.k === 'pedra') { c.fillStyle = '#6b6f7a'; c.beginPath(); c.moveTo(o.x, o.y + o.h); c.lineTo(o.x + 4, o.y + 4); c.lineTo(o.x + o.w / 2, o.y); c.lineTo(o.x + o.w - 3, o.y + 6); c.lineTo(o.x + o.w, o.y + o.h); c.fill(); c.fillStyle = '#9aa0ab'; c.fillRect(o.x + 6, o.y + 5, 5, 3); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(o.x - 3, o.y + o.h - 2, o.w + 6, 3); }
        if (o.k === 'tronco') { c.fillStyle = '#7a4a26'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = '#a0683a'; c.beginPath(); c.ellipse(o.x + o.w, o.y + o.h / 2, 3, o.h / 2, 0, 0, Math.PI * 2); c.fill(); }
        if (o.k === 'onda') { const gr = c.createLinearGradient(0, o.y, 0, o.y + o.h); gr.addColorStop(0, '#e8fbff'); gr.addColorStop(0.3, '#6fd0ff'); gr.addColorStop(1, '#1f78c8'); c.fillStyle = gr; c.beginPath(); c.moveTo(o.x - 6, o.y + o.h); c.quadraticCurveTo(o.x, o.y - 4, o.x + o.w, o.y + 4); c.quadraticCurveTo(o.x + o.w - 8, o.y + 14, o.x + o.w + 8, o.y + o.h); c.fill(); g.text('!', o.x + 12, o.y - 14, { size: 7, color: '#ff5d6c' }); }
        if (o.k === 'rede') { c.fillStyle = '#7a4a26'; c.fillRect(o.x - 6, 0, o.w + 12, 10); c.fillStyle = '#a0683a'; c.fillRect(o.x - 6, 8, o.w + 12, 3); c.fillRect(o.x - 4, 0, 4, o.h + 10); c.fillRect(o.x + o.w, 0, 4, o.h + 10);
          c.strokeStyle = 'rgba(240,240,220,.85)'; c.lineWidth = 1; for (let k = 0; k <= o.w; k += 5) { c.beginPath(); c.moveTo(o.x + k, 11); c.lineTo(o.x + k, o.h); c.stroke(); } for (let yy = 14; yy < o.h; yy += 6) { c.beginPath(); c.moveTo(o.x, yy); c.lineTo(o.x + o.w, yy); c.stroke(); }
          if (o.x > J.x + 20 && Math.floor(sc.t * 6) % 2) g.text('↓ ABAIXE!', o.x + o.w / 2, o.h + 4, { size: 6, color: '#ffd23f', align: 'center' }); }
        if (o.k === 'rasante') { const f = Math.sin(sc.t * 18 + o.x) * 5; c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(o.x, o.y + 5 - f); c.quadraticCurveTo(o.x + 5, o.y, o.x + 10, o.y + 7); c.quadraticCurveTo(o.x + 15, o.y, o.x + 20, o.y + 5 - f); c.stroke(); c.fillStyle = '#ffb02e'; c.fillRect(o.x - 3, o.y + 6, 4, 2); if (o.x > J.x + 20 && Math.floor(sc.t * 6) % 2) g.text('↓', o.x + 10, o.y - 10, { size: 7, color: '#ffd23f', align: 'center' }); }
        if (o.k === 'ave') { const f = Math.sin(sc.t * 14 + o.x) * 4; c.strokeStyle = '#f4f4f4'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(o.x, o.y + 4 - f); c.quadraticCurveTo(o.x + 5, o.y, o.x + 9, o.y + 6); c.quadraticCurveTo(o.x + 13, o.y, o.x + 18, o.y + 4 - f); c.stroke(); c.fillStyle = '#ffb02e'; c.fillRect(o.x + 8, o.y + 6, 3, 2); }
      });
      items.forEach((it) => { const bob = Math.sin(sc.t * 5 + it.x * 0.05) * 2; if (x) x.glow(c, it.x, it.y + bob, 10, '#fff3b0', 0.5); if (it.k === 'frag') g.img(GG.pixel.fragmento(Math.floor(sc.t * 4) % 2), it.x - 6, it.y - 6 + bob); else if (!(x && x.ilus(c, it.k, it.x, it.y + bob, 15))) g.circle(it.x, it.y, 5, '#ffd23f'); });
      // jangada + Gabriel
      if (!(J.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        const tilt = J.air ? Math.max(-0.35, Math.min(0.35, J.vy / 900)) : Math.sin(sc.t * 3) * 0.04;
        c.save(); c.translate(J.x, J.y); c.rotate(tilt);
        const ducking = J.duck > 0 && !J.air;
        if (J.star > 0) { const hue = sc.t * 400 % 360; c.strokeStyle = 'hsl(' + hue + ',95%,60%)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, -18, 30, 26, 0, 0, Math.PI * 2); c.stroke(); if (x && !E.reduced && Math.random() < 0.5) x.sparkle(J.x + U.rand(-24, 24), J.y - 18 + U.rand(-20, 20), 'hsl(' + hue + ',95%,70%)', 1); }
        c.fillStyle = '#6b3f1d'; for (let i = 0; i < 4; i++) c.fillRect(-20, -5 + i * 0 - (i % 2), 40, 5 - (i % 2)); c.fillStyle = '#8a5a2e'; c.fillRect(-20, -6, 40, 3);
        const mh = ducking ? 18 : 40;
        c.fillStyle = '#5a3a1a'; c.fillRect(-2, -4 - mh, 2, mh);
        c.fillStyle = '#fff8e6'; c.beginPath(); c.moveTo(0, -4 - mh); c.lineTo(20, -12 + (ducking ? 4 : 0)); c.lineTo(0, -10 + (ducking ? 4 : 0)); c.closePath(); c.fill(); c.fillStyle = '#e5484d'; c.fillRect(2, ducking ? -14 : -30, 10, 3);
        if (ducking) { c.save(); c.translate(0, -4); c.scale(1.1, 0.5); c.drawImage(C.gabrielSide(GEO.eco.look(), 'idle', sc.t), -16, -26); c.restore(); }
        else c.drawImage(C.gabrielSide(GEO.eco.look(), J.air ? 'jump' : 'idle', sc.t), -16, -30);
        c.restore();
        if (!J.air && playing && Math.random() < 0.4 && x) x.puff(J.x - 22, SEA + 2, 1, -1);
      }
      if (J.star > 0) g.text('INVENCÍVEL ' + Math.ceil(J.star), E.W / 2, 22, { size: 7, color: '#ffd23f', align: 'center' });
      g.text(Math.round(speed / 3.6) + ' nós', E.W - 30, 14, { size: 5, color: '#fff', align: 'center' });
      g.rect(100, 6, 200, 4, 'rgba(0,0,0,.35)'); g.rect(100, 6, 200 * Math.min(1, time / 150), 4, '#ffd23f'); if (x) x.ilus(c, 'veleiro', 100 + 200 * Math.min(1, time / 150), 8, 12);
    };
    sc.dbg = { J, star() { J.star = 5; }, end() { api.lives = 1; J.inv = 0; J.star = 0; hurt(); } };
    return sc;
  });

  /* ================================================================ COLUNAS DO MOSAICO */
  const GEM = [{ c: '#e5484d', i: 'pena' }, { c: '#3ec1ff', i: 'pomba' }, { c: '#35e07a', i: 'girassol' }, { c: '#ffd23f', i: 'atabaque' }, { c: '#b07bff', i: 'maracas' }];
  PQ.register({ id: 'w1_colunas', world: 1, boss: 'c1s5', ref: 'Columns (Mega Drive) / Puyo Puyo', title: 'Colunas do Mosaico', icon: 'diamante', c1: '#8a3fd0', c2: '#2e1250', music: 'labirinto', medals: [800, 2000, 4000], unit: 'pts',
    desc: 'Peças do mosaico caem em colunas de 3. Junte 3 ou mais iguais em linha, coluna ou diagonal!',
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
      if (api.lives <= 0) { playing = false; piece = null; setTimeout(() => api.end(api.score, 'Peças limpas: ' + cleared + ' • nível ' + lvl + '. Dica: planeje as diagonais!'), 700); return; }
      piece = null; lostT = 2;
      for (let y = 0; y < ROWS / 2; y++) grid[y].fill(-1);
      api.goal('Tabuleiro cheio! Vida perdida — restam ' + api.lives + '. A parte de cima foi limpa.');
    }
    sc.begin = () => { playing = true; spawn(); api.goal('Junte 3 ou mais peças iguais!'); };
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
      if (!(x && x.sky(g, 'mosaico', sc.t * 10, 0, sc.t, { horizon: 240 }))) { c.fillStyle = '#1a1030'; c.fillRect(0, 0, E.W, E.H); }
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
      if (x) { x.ilus(c, 'pena', 60, 80 + Math.sin(sc.t) * 4, 34); x.ilus(c, 'atabaque', 70, 140 + Math.sin(sc.t + 1) * 4, 30); x.ilus(c, 'pomba', 330, 150 + Math.sin(sc.t + 2) * 4, 30); }
    };
    sc.dbg = { end() { api.lives = 1; lose(); } };
    return sc;
  });

  /* ================================================================ QUEBRA-MOSAICO */
  const LEVELS = [
    ['GGGGGGGGGGGG', 'GGGGGYYGGGGG', 'GGGYYBBYYGGG', 'GYYBBWWBBYYG', 'GGGYYBBYYGGG', 'GGGGGYYGGGGG', 'GGGGGGGGGGGG'], // bandeira
    ['RROOYYGGBBPP', 'RROOYYGGBBPP', 'SS..SSSS..SS', 'PPBBGGYYOORR', 'PPBBGGYYOORR', '............', 'WWWWWWWWWWWW'], // mosaico
    ['..RR....RR..', '.RRRR..RRRR.', 'RRRRRRRRRRRR', 'RRRRRRRRRRRR', '.RRRRRRRRRR.', '..RRRRRRRR..', '....RRRR....'] // coração
  ];
  const BC = { G: '#2fae5a', Y: '#ffd23f', B: '#2e5bd8', W: '#f4f4ff', R: '#e5484d', O: '#ff9a3d', P: '#b07bff', S: '#a9b0c4' };
  PQ.register({ id: 'w1_quebra', world: 1, boss: 'c1s5', ref: 'Arkanoid', title: 'Quebra-Mosaico', icon: 'paleta', c1: '#e8456b', c2: '#4a1030', music: 'festa', medals: [600, 1400, 2400], unit: 'pts',
    desc: 'Rebata a bolinha e quebre os mosaicos coloridos: bandeira, arte e coração! Pegue os poderes que caem.',
    how: 'Mova a prancha com **← →** (ou o mouse/dedo). **Espaço** ou toque lança a bolinha. Pegue os poderes: **prancha grande**, **3 bolinhas**, **bola lenta** e **vida**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const BW = 28, BH = 9, BX0 = 22, BY0 = 30;
    const pad = { x: 200, w: 50, wide: 0 };
    let balls = [], bricks = [], caps = [], lvl = 0, playing = false, stuck = true, slow = 0, time = 0, mouseX = null;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointermove: (lx) => { mouseX = lx; }, pointerdown: (lx) => { mouseX = lx; if (stuck && playing) launch(); } });
    function load() {
      bricks = []; LEVELS[lvl % LEVELS.length].forEach((row, r) => row.split('').forEach((ch, i) => { if (ch === '.') return; bricks.push({ x: BX0 + i * (BW + 2), y: BY0 + r * (BH + 2), col: BC[ch], hp: ch === 'S' ? 2 : 1, cap: Math.random() < 0.12 ? U.pick(['wide', 'multi', 'slow', 'wide', 'life']) : null, r }); }));
      api.goal('Mosaico ' + (lvl + 1) + ': ' + ['Bandeira do Brasil', 'Mosaico colorido', 'Coração'][lvl % 3]);
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
      if (!balls.length) { api.lives--; api.refresh(); GG.audio.sfx('hit'); if (X()) X().flash('#ff4d4d', 0.3); if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Mosaicos completos: ' + lvl + '.'), 600); return; } reset(); }
      caps.forEach((cp) => { cp.y += 60 * dt; if (!cp.got && cp.y > 196 && cp.y < 210 && Math.abs(cp.x - pad.x) < pad.w / 2 + 6) { cp.got = true; GG.audio.sfx('power'); api.add(15);
        if (cp.k === 'wide') pad.wide = 12; if (cp.k === 'slow') slow = 8; if (cp.k === 'life') { api.lives = Math.min(5, api.lives + 1); api.maxLives = Math.max(api.maxLives, api.lives); api.refresh(); }
        if (cp.k === 'multi') { const b0 = balls[0]; if (b0) [-0.5, 0.5].forEach((d) => balls.push({ x: b0.x, y: b0.y, vx: b0.vx * Math.cos(d) - b0.vy * Math.sin(d), vy: b0.vx * Math.sin(d) + b0.vy * Math.cos(d) })); }
        if (X()) X().pop(cp.x, 186, { wide: 'PRANCHA GRANDE!', slow: 'BOLA LENTA!', life: '+1 VIDA!', multi: '3 BOLINHAS!' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.got && cp.y < E.H);
      if (bricks.every((br) => br.dead)) { lvl++; api.add(200); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 50); caps = []; load(); }
      if (time >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo esgotado! Mosaicos completos: ' + lvl + '.'), 500); }
    };
    const CAPI = { wide: 'estrela', multi: 'balao', slow: 'tartaruga', life: 'coracao' };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.photo(c, 'satDia', sc.t, 'rgba(10,12,40,.72)'))) { c.fillStyle = '#12173a'; c.fillRect(0, 0, E.W, E.H); }
      c.strokeStyle = 'rgba(255,210,63,.6)'; c.lineWidth = 2; c.strokeRect(9, 17, E.W - 18, E.H - 12);
      bricks.forEach((br) => {
        if (br.dead) return;
        const gr = c.createLinearGradient(0, br.y, 0, br.y + BH); gr.addColorStop(0, br.col); gr.addColorStop(1, GG.pixel.shade(br.col, -55));
        c.fillStyle = gr; c.fillRect(br.x, br.y, BW, BH); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(br.x, br.y, BW, 2);
        if (br.hp > 1) { c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(br.x + 1, br.y + 1, BW - 2, BH - 2); }
        if (br.cap) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(br.x + BW / 2 - 1, br.y + 3, 2, 3); }
      });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, CAPI[cp.k], cp.x, cp.y, 13, { rot: Math.sin(sc.t * 5) * 0.2 }); } else g.circle(cp.x, cp.y, 5, '#9ff2ff'); });
      // prancha (jangada) e bolinhas
      const pw = pad.w; c.fillStyle = '#6b3f1d'; c.fillRect(pad.x - pw / 2, 203, pw, 6); c.fillStyle = '#a0683a'; c.fillRect(pad.x - pw / 2, 203, pw, 2);
      c.fillStyle = '#ffd23f'; c.fillRect(pad.x - pw / 2 - 3, 202, 4, 8); c.fillRect(pad.x + pw / 2 - 1, 202, 4, 8);
      balls.forEach((b) => { if (x) x.glow(c, b.x, b.y, 9, slow > 0 ? '#7bff8f' : '#ffffff', 0.7); g.circle(b.x, b.y, 3, '#fff'); });
      if (stuck && playing) g.text('ESPAÇO / TOQUE PARA LANÇAR', E.W / 2, 170, { size: 6, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; balls = []; } };
    return sc;
  });
})();
