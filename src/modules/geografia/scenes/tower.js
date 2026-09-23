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
  const W = 22, H = 100, GAP = 9;
  const floorY = (k) => 95 - GAP * k;

  GEO.scenes.tower = function (ctx) {
    const sc = { cam: { x: 0, y: (H * T) - E.H }, t: 0 };
    const L = C.level(W, H);
    L.fill(0, 96, W - 1, H - 1, 'D'); L.fill(0, 95, W - 1, 95, 'N');
    L.fill(0, 0, 0, H - 1, 'B'); L.fill(W - 1, 0, W - 1, H - 1, 'B');
    const floors = [];
    for (let k = 1; k <= 9; k++) {
      const y = floorY(k);
      L.plat(1, W - 2, y);
      const left = k % 2 === 0;
      L.plat(left ? 2 : 13, left ? 7 : 18, y + 6); L.plat(left ? 12 : 4, left ? 16 : 8, y + 3);
      floors.push(k);
    }
    L.movers.push({ x0: 8 * T, y0: floorY(4) + 4 * T, x: 8 * T, y: floorY(4) + 4 * T, w: 3 * T, h: 8, range: 50, speed: 1.1 });
    L.springs.push({ x: 18 * T, y: floorY(6) * T - 12, power: 480 });
    const labels = POP.map((pp, k) => ({ k, year: pp[0], pop: pp[1] })).concat([{ k: 8, title: 'Faixas etárias' }, { k: 9, title: 'Composição 2022' }]);
    const totems = [{ k: 7, x: 16, q: 'GEO-C3-Q01', label: '2022: a população mudou?' }, { k: 8, x: 5, q: 'GEO-C3-Q11', label: 'Envelhecimento' }, { k: 9, x: 16, q: 'GEO-C3-Q12', label: 'Gráfico de 2022' }];
    totems.forEach((t) => { t.done = ctx.qDone(t.q); });
    const notes = [{ k: 2, lines: ['**1970**: **94.508.583** brasileiros. Guarde este número — ele volta lá em cima!'], done: false }, { k: 5, lines: ['A população **cresceu muito no século XX**: imigração, famílias numerosas e melhor saúde, com menos mortes de recém-nascidos.'], done: false }];
    const foes = [3, 5, 7].map((k) => ({ k, x: 6 * T, y: (floorY(k) - 5) * T, x0: 6 * T, dir: 1 }));
    const frags = [[4, floorY(1) - 4], [17, floorY(3) - 4], [10, floorY(5) - 7], [3, floorY(7) - 4], [18, floorY(9) - 4]].map((f) => ({ x: f[0], y: f[1], got: false }));
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
      frags.forEach((f) => { if (!f.got && (E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: f.x * T, y: f.y * T, w: 14, h: 14 }) || (ctx.magnet && Math.hypot(f.x * T - p.x, f.y * T - p.y) < 50))) { f.got = true; ctx.fragment(f.x * T + 6, f.y * T + 6); } });
      foes.forEach((f) => {
        f.x += f.dir * 30 * dt; if (Math.abs(f.x - f.x0) > 110) f.dir *= -1;
        const fy = f.y + Math.sin(sc.t * 2 + f.k) * 6;
        if (p.inv <= 0 && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: f.x + 2, y: fy + 2, w: 18, h: 12 })) { p.inv = 1.3; p.vy = -150; if (ctx.hurt()) { p.x = lastCp.x; p.y = lastCp.y; } }
      });
      if (pet) pet.update(p.x - p.face * 14, p.y - 4, dt);
      if (ctx.trail && Math.abs(p.vx) > 20) C.trail(p.x + 6, p.y + 18);
      const ty = U.clamp(p.y - E.H * 0.55, 0, H * T - E.H);
      sc.cam.y += (ty - sc.cam.y) * Math.min(1, dt * 6); sc.cam.x = 0;
      if (GG.input.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };
    sc.draw = function (g) {
      C.sky(g, 'torre', 0, sc.cam.y, sc.t);
      g.world(sc.cam);
      // parede da torre
      const c = g.ctx(); c.fillStyle = 'rgba(40,52,110,.55)'; c.fillRect(T, 0, (W - 2) * T, H * T);
      for (let y = Math.floor(sc.cam.y / 36) * 36; y < sc.cam.y + E.H; y += 36) for (let x = T + 10; x < (W - 1) * T; x += 60) { c.fillStyle = 'rgba(255,240,180,.12)'; c.fillRect(x, y + 8, 14, 18); }
      C.drawTiles(g, L, sc.cam, 'torre'); C.drawMovers(g, L); C.drawSprings(g, L);
      // painéis dos andares
      labels.forEach((lb) => {
        const y = floorY(lb.k) * T;
        if (y < sc.cam.y - 60 || y > sc.cam.y + E.H + 80) return;
        if (lb.year) {
          g.panel(T + 6, y - 58, 150, 30, '#fff8e6', '#15152a');
          g.text(String(lb.year), T + 12, y - 54, { size: 8, color: '#6d4c8f', shadow: false });
          g.text(U.fmtInt(lb.pop), T + 12, y - 42, { size: 7, color: '#2a2233', shadow: false });
          g.rect(T + 90, y - 50, 60, 6, '#e9dcff'); g.rect(T + 90, y - 50, 60 * lb.pop / 203080756, 6, lb.year === 1970 || lb.year === 2022 ? '#f39c12' : '#5b8def');
        } else {
          g.panel(T + 6, y - 58, 170, 30, '#e9f7ff', '#15152a'); g.text(lb.title, T + 12, y - 54, { size: 7, color: '#1f6f9a', shadow: false });
          if (lb.k === 8) { g.text('0-14 anos', T + 12, y - 42, { size: 5, color: '#2a2233', shadow: false }); g.rect(T + 70, y - 42, 40, 5, '#5b8def'); g.text('idosos', T + 115, y - 42, { size: 5, color: '#2a2233', shadow: false }); g.rect(T + 145, y - 42, 25, 5, '#e8744f'); }
          else { [[45.3, '#c98e62'], [42.8, '#f1d7b7'], [10.6, '#6b4128'], [1.3, '#8e7cc3']].forEach((b, i) => g.rect(T + 12 + i * 40, y - 42, b[0] * 0.7, 6, b[1])); }
        }
      });
      totems.forEach((t) => { const y = floorY(t.k) * T; g.img(P.totem(t.done), t.x * T - 8, y - 32); if (!t.done) C.sign(g, t.x * T, y - 48, t.label); });
      frags.forEach((f) => { if (!f.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), f.x * T + 2, f.y * T + 2 + Math.sin(sc.t * 3 + f.x) * 2); });
      foes.forEach((f) => g.img(P.nevoa(Math.floor(sc.t * 3) % 2), f.x, f.y + Math.sin(sc.t * 2 + f.k) * 6, { flip: f.dir < 0 }));
      if (pet) pet.draw(g, sc.t);
      C.drawGabriel(g, ctx, p, sc.t);
      g.end();
      // altímetro
      g.panel(E.W - 58, 30, 50, 150, 'rgba(15,18,38,.85)', '#3a4290');
      labels.forEach((lb) => { const yy = 170 - lb.k * 14; g.text(lb.year ? String(lb.year) : lb.k === 8 ? 'Idades' : 'Topo', E.W - 33, yy, { size: 5, color: lb.k <= reached ? '#ffd23f' : '#8088c0', align: 'center' }); });
      if (ctx.arrow) { const t = totems.find((z) => !z.done); if (t) C.arrow(g, sc.cam, t.x * T, floorY(t.k) * T - 20); }
    };
    sc.dbg = { p, busy: () => busy, next() { const t = totems.find((z) => !z.done); if (t && (Math.abs(p.y + 20 - floorY(t.k) * T) > 8 || Math.abs(p.x - t.x * T) > 70)) { p.x = t.x * T - 40; p.y = floorY(t.k) * T - 20; p.vy = 0; p.vx = 0; } return t; } };
    return sc;
  };
})();
