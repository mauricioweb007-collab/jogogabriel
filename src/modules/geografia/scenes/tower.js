/* =====================================================================
   scenes/tower.js — TORRE DA POPULAÇÃO (Fase 3-4): plataforma VERTICAL.
   Cada andar é um ano da tabela do material (1950 → 2022) com painel e
   barra crescendo; depois vêm o andar das faixas etárias e o topo com
   o gráfico de composição de 2022. Questões GEO-C3-Q01, Q11 e Q12.
   Plataformas de mão única (pula-se por baixo), molas, plataformas
   móveis e Névoas. Checkpoint a cada andar.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common, T = C.T;
  const POP = [[1950, 51944397], [1960, 70992343], [1970, 94508583], [1980, 121150573], [1991, 146917459], [2000, 169872856], [2010, 190755799], [2022, 203080756]];
  const W = 19, H = 100, GAP = 9; // 19 colunas: a torre inteira cabe na tela ao lado do altímetro
  const floorY = (k) => 95 - GAP * k;

  GEO.scenes.tower = function (ctx) {
    const CAMX = -6; // desloca a torre: ela ocupa x 6–348 e o altímetro fica à direita, sem cobrir nada
    const sc = { cam: { x: CAMX, y: (H * T) - E.H }, t: 0 };
    const L = C.level(W, H);
    L.fill(0, 96, W - 1, H - 1, 'D'); L.fill(0, 95, W - 1, 95, 'N');
    L.fill(0, 0, 0, H - 1, 'B'); L.fill(W - 1, 0, W - 1, H - 1, 'B');
    /* Cada andar tem um desafio diferente, do mais fácil ao mais difícil. O pulo alcança
       ~3,5 blocos de altura e ~3 de distância: degraus a cada 3 blocos e vãos de no máximo 2.
       s = degraus [deslocamento acima do andar de baixo, x0, x1]; m = plataforma móvel;
       sp = mola; coins = moedas-guia (a trilha mostra o caminho); fr = fragmento opcional. */
    const DESIGN = [
      null,
      { name: 'Escadinha', s: [[3, 3, 7], [6, 9, 13]], coins: [[5, 4], [11, 7]], fr: [15, 5] },
      { name: 'Zigue-zague', s: [[3, 11, 15], [6, 5, 9]], coins: [[13, 4], [7, 7]], fr: [2, 8] },
      { name: 'Plataforma que anda', s: [[3, 2, 5]], m: { y: 6, x: 9, range: 48, speed: 1.1 }, coins: [[3, 4], [9, 8]], fr: [16, 7] },
      { name: 'Mola', s: [[3, 12, 15]], sp: [14, 3], coins: [[13, 4], [14, 7]], fr: [4, 7] },
      { name: 'Degraus estreitos', s: [[3, 3, 5], [6, 8, 10], [6, 14, 15]], coins: [[4, 4], [9, 7]], fr: [14.5, 7] },
      { name: 'Elevador', s: [[3, 13, 15]], m: { y: 5, x: 7, axis: 'y', range: 30, speed: 1.2 }, coins: [[14, 5], [8, 8]], fr: [2, 5] },
      { name: 'Ponte partida', s: [[3, 14, 16], [6, 9, 11], [6, 2, 4]], coins: [[15, 4], [10, 7]], fr: [3, 7] },
      { name: 'Plataforma rápida', s: [[3, 2, 4]], m: { y: 6, x: 10, range: 60, speed: 1.5 }, sp: [3, 3], coins: [[3, 4], [10, 8]], fr: [16, 8] },
      { name: 'Reta final', s: [[3, 12, 14], [6, 6, 8], [6, 15, 16]], coins: [[13, 4], [7, 7]], fr: [15.5, 7] }
    ];
    const coins = [], fragPos = [];
    for (let k = 1; k <= 9; k++) {
      const y = floorY(k), base = floorY(k - 1), D = DESIGN[k];
      L.plat(1, W - 2, y);
      D.s.forEach(([up, x0, x1]) => L.plat(x0, x1, base - up));
      if (D.m) { const my = (base - D.m.y) * T; L.movers.push({ x0: D.m.x * T, y0: my, x: D.m.x * T, y: my, w: 3 * T, h: 8, range: D.m.range, speed: D.m.speed, axis: D.m.axis }); }
      if (D.sp) L.springs.push({ x: D.sp[0] * T + 1, y: (base - D.sp[1]) * T - 12, power: 500 });
      D.coins.forEach(([cx, up]) => coins.push({ x: cx * T + 3, y: (base - up) * T - 16, got: false }));
      fragPos.push([D.fr[0], base - D.fr[1] - 1]);
    }
    const labels = POP.map((pp, k) => ({ k, year: pp[0], pop: pp[1] })).concat([{ k: 8, title: 'Faixas etárias' }, { k: 9, title: 'Composição 2022' }]);
    const totems = [{ k: 7, x: 16, q: 'GEO-C3-Q01', label: '2022: a população mudou?' }, { k: 8, x: 14, q: 'GEO-C3-Q11', label: 'Envelhecimento' }, { k: 9, x: 16, q: 'GEO-C3-Q12', label: 'Gráfico de 2022' }];
    totems.forEach((t) => { t.done = ctx.qDone(t.q); });
    const notes = [{ k: 2, lines: ['**1970**: **94.508.583** brasileiros. Guarde este número — ele volta lá em cima!'], done: false }, { k: 5, lines: ['A população **cresceu muito no século XX**: imigração, famílias numerosas e melhor saúde, com menos mortes de recém-nascidos.'], done: false }];
    // Névoas patrulham alguns andares, cada vez um pouco mais rápidas
    const foes = [[3, 60, 22], [5, 70, 28], [7, 90, 34], [9, 90, 40]].map(([k, range, v]) => ({ k, x: 9 * T, y: (floorY(k) - 3) * T, x0: 9 * T, dir: 1, range, v }));
    const frags = [fragPos[1], fragPos[3], fragPos[4], fragPos[6], fragPos[8]].map((f) => ({ x: f[0], y: f[1], got: false }));
    const p = C.body(3 * T, 93 * T, 12, 20);
    let busy = false, finished = false, lastCp = { x: p.x, y: p.y }, reached = 0;
    ctx.fragTotal = frags.length; ctx.actionMax = frags.length * 10 + 80;
    const pet = ctx.pet ? C.pet() : null;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.k) { reached = ctx.resume.data.k; p.y = (floorY(reached) - 2) * T; p.x = 10 * T; lastCp = { x: p.x, y: p.y }; notes.forEach((n) => { if (n.k <= reached) n.done = true; }); sc.cam.y = U.clamp(p.y - E.H * 0.5, 0, H * T - E.H); }
    sc.begin = function () { if (!ctx.resume) ctx.checkpoint({ k: 0 }); ctx.setGoal('Suba andar por andar: pule por baixo das plataformas.'); };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    const floorOf = (py) => { for (let k = 9; k >= 0; k--) if (py + 20 <= floorY(k) * T + 2) return k; return 0; };

    sc.update = function (dt) {
      sc.t += dt; C.updateMovers(L, dt, sc.t);
      if (busy || finished) return;
      ctx.tick(dt);
      C.physics(L, p, dt, { speed: 105 * ctx.speed, jumpV: 345 });
      if (p.y > H * T) { p.x = lastCp.x; p.y = lastCp.y; }
      const k = p.onGround ? floorOf(p.y) : -1;
      if (k > reached) { reached = k; lastCp = { x: p.x, y: p.y }; ctx._quietCp = true; ctx.checkpoint({ k }); E.fx.float(p.x, p.y - 10, labels[k] ? (labels[k].year || labels[k].title) : '', '#9ff2ff'); GG.audio.sfx('check'); }
      for (const n of notes) if (!n.done && reached >= n.k) { n.done = true; run(() => ctx.say('gaia', n.lines)); return; }
      for (const t of totems) {
        if (t.done) continue;
        if (Math.abs(p.x - t.x * T) < 18 && Math.abs(p.y + 20 - floorY(t.k) * T) < 6) {
          t.done = true; ctx.fxX = t.x * T; ctx.fxY = floorY(t.k) * T - 30;
          run(async () => { await ctx.q(t.q); E.fx.confetti(t.x * T, floorY(t.k) * T - 30, 30); if (t.k === 9) { finished = true; if (!ctx.damage) ctx.addAction(40); await ctx.say('gaia', ['Topo da Torre! Você leu a tabela, as faixas etárias e o gráfico.']); await ctx.finish(); } });
          return;
        }
      }
      coins.forEach((cn) => { if (!cn.got && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: cn.x, y: cn.y, w: 12, h: 14 })) { cn.got = true; ctx.coin(cn.x + 6, cn.y + 6); } });
      frags.forEach((f) => { if (!f.got && (E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: f.x * T, y: f.y * T, w: 14, h: 14 }) || (ctx.magnet && Math.hypot(f.x * T - p.x, f.y * T - p.y) < 50))) { f.got = true; ctx.fragment(f.x * T + 6, f.y * T + 6); } });
      foes.forEach((f) => {
        f.x += f.dir * f.v * dt; if (Math.abs(f.x - f.x0) > f.range) f.dir *= -1;
        const fy = f.y + Math.sin(sc.t * 2 + f.k) * 6;
        if (p.inv <= 0 && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: f.x + 2, y: fy + 2, w: 18, h: 12 })) { p.inv = 1.3; p.vy = -150; if (ctx.hurt()) { p.x = lastCp.x; p.y = lastCp.y; } }
      });
      if (pet) pet.update(p.x - p.face * 14, p.y - 4, dt);
      if (ctx.trail && Math.abs(p.vx) > 20) C.trail(p.x + 6, p.y + 18);
      // câmera mais baixa: mostra mais do que vem por cima; torre centralizada à esquerda do altímetro
      const ty = U.clamp(p.y - E.H * 0.62, 0, H * T - E.H);
      sc.cam.y += (ty - sc.cam.y) * Math.min(1, dt * 6); sc.cam.x = CAMX;
      if (GG.input.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };
    sc.draw = function (g) {
      C.sky(g, 'torre', 0, sc.cam.y, sc.t);
      g.world(sc.cam);
      // parede da torre
      const c = g.ctx(); c.fillStyle = 'rgba(40,52,110,.55)'; c.fillRect(T, 0, (W - 2) * T, H * T);
      for (let y = Math.floor(sc.cam.y / 36) * 36; y < sc.cam.y + E.H; y += 36) for (let x = T + 10; x < (W - 1) * T; x += 60) { c.fillStyle = 'rgba(255,240,180,.12)'; c.fillRect(x, y + 8, 14, 18); }
      // painéis dos andares (desenhados ANTES das plataformas, para nunca escondê-las)
      labels.forEach((lb) => {
        const y = floorY(lb.k) * T;
        if (y < sc.cam.y - 60 || y > sc.cam.y + E.H + 80) return;
        // painel no vão livre logo acima do andar (os degraus do próximo andar começam 3 blocos acima)
        const py = y - 32;
        if (lb.year) {
          g.panel(T + 6, py, 150, 26, '#fff8e6', '#15152a');
          g.text(String(lb.year), T + 12, py + 3, { size: 8, color: '#6d4c8f', shadow: false });
          g.text(U.fmtInt(lb.pop), T + 12, py + 15, { size: 7, color: '#2a2233', shadow: false });
          g.rect(T + 90, py + 8, 60, 6, '#e9dcff'); g.rect(T + 90, py + 8, 60 * lb.pop / 203080756, 6, lb.year === 1970 || lb.year === 2022 ? '#f39c12' : '#5b8def');
        } else {
          g.panel(T + 6, py, 170, 26, '#e9f7ff', '#15152a'); g.text(lb.title, T + 12, py + 3, { size: 7, color: '#1f6f9a', shadow: false });
          if (lb.k === 8) { g.text('0-14 anos', T + 12, py + 15, { size: 5, color: '#2a2233', shadow: false }); g.rect(T + 70, py + 15, 40, 5, '#5b8def'); g.text('idosos', T + 115, py + 15, { size: 5, color: '#2a2233', shadow: false }); g.rect(T + 145, py + 15, 25, 5, '#e8744f'); }
          else { [[45.3, '#c98e62'], [42.8, '#f1d7b7'], [10.6, '#6b4128'], [1.3, '#8e7cc3']].forEach((b, i) => g.rect(T + 12 + i * 40, py + 15, b[0] * 0.7, 6, b[1])); }
        }
      });
      C.drawTiles(g, L, sc.cam, 'torre'); C.drawMovers(g, L); C.drawSprings(g, L);
      // nome do desafio de cada andar
      for (let k = 1; k <= 9; k++) { const y = floorY(k - 1) * T; if (y < sc.cam.y - 20 || y > sc.cam.y + E.H + 20 || k <= reached || totems.some((t) => t.k === k - 1 && !t.done)) continue; g.text('Andar ' + k + ': ' + DESIGN[k].name, (W - 2) * T - 2, y - 30, { size: 5, color: 'rgba(255,255,255,.7)', align: 'right', maxW: 150 }); }
      coins.forEach((cn) => { if (!cn.got) g.spr('plat', Math.floor(sc.t * 6 + cn.x) % 4 === 0 ? 152 : 151, cn.x - 3, cn.y); });
      totems.forEach((t) => { const y = floorY(t.k) * T; g.img(P.totem(t.done), t.x * T - 8, y - 32); if (!t.done) C.sign(g, t.x * T, y - 48, t.label); });
      frags.forEach((f) => { if (!f.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), f.x * T + 2, f.y * T + 2 + Math.sin(sc.t * 3 + f.x) * 2); });
      foes.forEach((f) => g.img(P.nevoa(Math.floor(sc.t * 3) % 2), f.x, f.y + Math.sin(sc.t * 2 + f.k) * 6, { flip: f.dir < 0 }));
      if (pet) pet.draw(g, sc.t);
      C.drawGabriel(g, ctx, p, sc.t);
      g.end();
      // altímetro
      g.panel(E.W - 44, 30, 40, 150, 'rgba(15,18,38,.85)', '#3a4290');
      labels.forEach((lb) => { const yy = 170 - lb.k * 14; g.text(lb.year ? String(lb.year) : lb.k === 8 ? 'Idades' : 'Topo', E.W - 24, yy, { size: 5, color: lb.k <= reached ? '#ffd23f' : '#8088c0', align: 'center', maxW: 36 }); });
      const pk = Math.max(0, Math.min(9, (floorY(0) * T - (p.y + p.h)) / (GAP * T))); g.rect(E.W - 42, 172 - pk * 14, 3, 3, '#7bff8f');
      if (ctx.arrow) { const t = totems.find((z) => !z.done); if (t) C.arrow(g, sc.cam, t.x * T, floorY(t.k) * T - 20); }
    };
    sc.dbg = { p, busy: () => busy, next() { const t = totems.find((z) => !z.done); if (t && (Math.abs(p.y + 20 - floorY(t.k) * T) > 8 || Math.abs(p.x - t.x * T) > 70)) { p.x = t.x * T - 40; p.y = floorY(t.k) * T - 20; p.vy = 0; p.vx = 0; } return t; } };
    return sc;
  };
})();
