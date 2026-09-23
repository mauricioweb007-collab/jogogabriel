/* =====================================================================
   scenes/platform.js — PLATAFORMA LATERAL (Fase 1-1 Festival da
   Diversidade e Fase 2-2 Cordel em Movimento).
   Correr, pular, plataformas móveis e molas; Fragmentos do Atlas;
   Blocos do Erro que só quebram escolhendo a afirmação correta;
   totens da Gaia com as questões do livro; checkpoints frequentes;
   caminhos alternativos com colecionáveis (conteúdo obrigatório sempre
   no caminho principal). Nenhum trecho passa de ~8 s sem objetivo.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common, T = C.T;

  /* ------------------------------------------------ construtores de fase */
  const BUILD = {};
  BUILD.c1s1 = function () {
    const L = C.level(186, 14), o = L.objs;
    L.ground(0, 22, 10);
    o.push({ k: 'card', x: 3, key: 'palco' });
    o.push({ k: 'frag', x: 9, y: 8 }, { k: 'coin', x: 12, y: 8 }, { k: 'coin', x: 13, y: 7 }, { k: 'coin', x: 14, y: 8 });
    o.push({ k: 'totem', x: 18, q: 'GEO-C1-Q01', label: 'Telão do palco' });
    o.push({ k: 'cp', x: 21, n: 1 });
    L.ground(25, 42, 10);
    o.push({ k: 'enemy', t: 'nevoa', x: 30, y: 7, range: 50 });
    L.plat(27, 30, 7); o.push({ k: 'frag', x: 28, y: 5 });
    L.fill(33, 9, 34, 9, 'B'); o.push({ k: 'coin', x: 33, y: 7 }, { k: 'coin', x: 34, y: 7 });
    o.push({ k: 'gate', x: 39, y0: 3, y1: 9 });
    L.ground(43, 62, 10);
    o.push({ k: 'card', x: 45, key: 'mistura' });
    L.springs.push({ x: 49 * T + 1, y: 10 * T - 12, power: 480 });
    L.plat(51, 55, 4); o.push({ k: 'frag', x: 53, y: 2 }, { k: 'coin', x: 52, y: 3 }, { k: 'coin', x: 54, y: 3 });
    o.push({ k: 'enemy', t: 'bloco', x: 54, y: 9, range: 60 });
    o.push({ k: 'totem', x: 59, q: 'GEO-C1-Q02', label: 'Público do festival' });
    o.push({ k: 'cp', x: 61, n: 2 });
    L.movers.push({ x0: 64 * T, y0: 9 * T, x: 64 * T, y: 9 * T, w: 3 * T, h: 8, range: 44, speed: 1.2 });
    o.push({ k: 'coin', x: 67, y: 7 }, { k: 'coin', x: 68, y: 6 });
    L.ground(71, 98, 10); L.ground(77, 81, 8); L.ground(84, 86, 6, 'G', 'D');
    o.push({ k: 'frag', x: 85, y: 4 }, { k: 'enemy', t: 'nevoa', x: 88, y: 6, range: 40 });
    o.push({ k: 'totem', x: 94, q: 'GEO-C1-Q03', label: 'Barraca da escola' });
    o.push({ k: 'cp', x: 96, n: 3 });
    L.movers.push({ x0: 100 * T, y0: 8 * T, x: 100 * T, y: 8 * T, w: 2 * T, h: 8, range: 30, speed: 1.4, axis: 'y' });
    L.ground(104, 128, 10);
    o.push({ k: 'enemy', t: 'bloco', x: 108, y: 9, range: 50 });
    o.push({ k: 'gate', x: 114, y0: 3, y1: 9 });
    o.push({ k: 'card', x: 119, key: 'leis' }, { k: 'cp', x: 121, n: 4 });
    L.set(125, 9, '^'); L.set(126, 9, '^');
    L.ground(129, 186, 10); L.plat(131, 134, 7); o.push({ k: 'frag', x: 132, y: 5 });
    for (let i = 0; i < 6; i++) o.push({ k: 'coin', x: 138 + i, y: 8 });
    o.push({ k: 'enemy', t: 'nevoa', x: 145, y: 7, range: 40 }, { k: 'frag', x: 150, y: 6 });
    o.push({ k: 'crowd', x: 155, n: 9 });
    o.push({ k: 'totem', x: 166, q: 'GEO-C1-Q04', label: 'Placa do Instituto' });
    o.push({ k: 'finish', x: 176 });
    return L;
  };
  BUILD.c2s2 = function () {
    const L = C.level(196, 14), o = L.objs;
    L.ground(0, 20, 10, 'S', 'D');
    o.push({ k: 'card', x: 3, key: 'folclore' });
    o.push({ k: 'frag', x: 8, y: 8 }, { k: 'coin', x: 11, y: 8 }, { k: 'coin', x: 12, y: 8 });
    o.push({ k: 'totem', x: 16, q: 'GEO-C2-Q01', label: 'Feira do Cordel' });
    o.push({ k: 'cp', x: 19, n: 1 });
    L.plat(22, 26, 8); L.plat(28, 32, 6); L.plat(34, 38, 8);
    o.push({ k: 'frag', x: 30, y: 4 }, { k: 'coin', x: 24, y: 7 }, { k: 'coin', x: 36, y: 7 });
    L.ground(40, 64, 10, 'S', 'D');
    o.push({ k: 'enemy', t: 'nevoa', x: 46, y: 7, range: 40 });
    o.push({ k: 'totem', x: 52, q: 'GEO-C2-Q02', label: 'Entrada da Mata' });
    o.push({ k: 'cp', x: 54, n: 2 });
    o.push({ k: 'gate', x: 60, y0: 3, y1: 9 });
    L.ground(65, 92, 10, 'S', 'D');
    o.push({ k: 'totem', x: 68, q: 'GEO-C2-Q03', label: 'Portão da Mata' });
    o.push({ k: 'cp', x: 70, n: 3 });
    L.springs.push({ x: 74 * T + 1, y: 10 * T - 12, power: 480 });
    L.plat(76, 80, 4); o.push({ k: 'frag', x: 78, y: 2 });
    o.push({ k: 'enemy', t: 'bloco', x: 84, y: 9, range: 60 });
    L.movers.push({ x0: 94 * T, y0: 9 * T, x: 94 * T, y: 9 * T, w: 3 * T, h: 8, range: 40, speed: 1.1 });
    L.ground(101, 128, 10, 'S', 'D');
    o.push({ k: 'coin', x: 104, y: 8 }, { k: 'coin', x: 105, y: 8 }, { k: 'enemy', t: 'nevoa', x: 110, y: 6, range: 50 });
    o.push({ k: 'totem', x: 118, q: 'GEO-C2-Q16', label: 'Oficina do Xilogravador' });
    o.push({ k: 'cp', x: 120, n: 4 });
    o.push({ k: 'gate', x: 125, y0: 3, y1: 9 });
    L.plat(130, 133, 8); L.plat(136, 139, 6); L.plat(142, 145, 8);
    o.push({ k: 'frag', x: 137, y: 4 });
    L.ground(147, 196, 10, 'S', 'D');
    o.push({ k: 'enemy', t: 'bloco', x: 152, y: 9, range: 50 }, { k: 'frag', x: 158, y: 7 });
    for (let i = 0; i < 5; i++) o.push({ k: 'coin', x: 162 + i, y: 8 });
    o.push({ k: 'press', x: 176, q: 'GEO-C2-Q17', label: 'Prensa gigante' });
    o.push({ k: 'finish', x: 186 });
    return L;
  };

  /* ------------------------------------------------ cena */
  GEO.scenes.platform = function (ctx) {
    const def = ctx.def, theme = def.theme;
    const L = BUILD[def.id]();
    const sc = { cam: { x: 0, y: 0 }, t: 0, paused: false };
    const p = C.body(2 * T, 7 * T, 12, 20);
    const pet = ctx.pet ? C.pet() : null;
    let busy = false, lastCp = { x: 2 * T, y: 7 * T }, printed = null, ended = false;
    ctx.fragTotal = L.objs.filter((o) => o.k === 'frag').length;
    ctx.actionMax = ctx.fragTotal * 10 + L.objs.filter((o) => o.k === 'coin').length + L.objs.filter((o) => o.k === 'enemy').length * 5 + 60;
    ctx.learnMax = def.questions.length * 120 + L.objs.filter((o) => o.k === 'gate').length * 25;
    L.objs.forEach((o) => { o.done = false; if (o.k === 'enemy') { o.x0 = o.x * T; o.px = o.x0; o.py = o.y * T; o.dir = 1; o.alive = true; } });
    // retomada
    if (ctx.resume && ctx.resume.data) {
      const n = ctx.resume.data.cp || 0;
      L.objs.forEach((o) => {
        if ((o.k === 'totem' || o.k === 'press') && ctx.qDone(o.q)) o.done = true;
        if (o.k === 'cp' && o.n <= n) { o.done = true; lastCp = { x: o.x * T, y: 7 * T }; }
        if ((o.k === 'gate' || o.k === 'card') && o.x < (lastCp.x / T)) o.done = true;
      });
      p.x = lastCp.x; p.y = lastCp.y;
    }
    // Blocos do Erro: colunas sólidas até a checagem
    L.objs.filter((o) => o.k === 'gate' && !o.done).forEach((o) => { for (let y = o.y0; y <= o.y1; y++) L.set(o.x, y, 'X'); });
    let origPlat = null;
    sc.init = function () { if (C.theme(theme).sepia) { origPlat = E.img.plat; const s = C.sepiaSheet('plat'); if (s) E.img.plat = s; } };
    sc.exit = function () { if (origPlat) E.img.plat = origPlat; };
    sc.begin = function () { if (!ctx.resume) ctx.checkpoint({ cp: 0 }); };

    function nextObjective() { return L.objs.find((o) => !o.done && (o.k === 'totem' || o.k === 'gate' || o.k === 'press' || o.k === 'finish')); }
    function respawn() { p.x = lastCp.x; p.y = lastCp.y - 10; p.vx = 0; p.vy = 0; p.inv = 1.2; }
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }

    sc.update = function (dt) {
      sc.t += dt; ctx.tick(dt);
      C.updateMovers(L, dt, sc.t);
      if (busy || ended) return;
      C.physics(L, p, dt, { speed: 105 * ctx.speed });
      if (p.x < 0) p.x = 0;
      if (p.y > L.h * T + 40) { ctx.hurt(); respawn(); }
      // ímã
      L.objs.forEach((o) => {
        if (o.done) return;
        const ox = o.x * T + 9, oy = (o.y || 0) * T + 9;
        if ((o.k === 'frag' || o.k === 'coin') && ctx.magnet && Math.hypot(ox - (p.x + 6), oy - (p.y + 10)) < 60) { o.x += ((p.x + 6 - ox) / T) * dt * 5; o.y += ((p.y + 10 - oy) / T) * dt * 5; }
      });
      const pb = { x: p.x, y: p.y, w: p.w, h: p.h };
      for (const o of L.objs) {
        if (o.done) continue;
        if (o.k === 'frag' || o.k === 'coin') {
          if (E.overlap(pb, { x: o.x * T + 2, y: o.y * T + 2, w: 14, h: 14 })) { o.done = true; if (o.k === 'frag') ctx.fragment(o.x * T + 9, o.y * T + 9); else ctx.coin(o.x * T + 9, o.y * T + 9); }
        } else if (o.k === 'card') {
          if (p.x > o.x * T) { o.done = true; run(() => ctx.cards(o.key)); return; }
        } else if (o.k === 'cp') {
          if (p.x > o.x * T) { o.done = true; lastCp = { x: o.x * T, y: p.y }; ctx.checkpoint({ cp: o.n }); E.fx.burst(o.x * T + 9, 9 * T, ['#7bff8f', '#fff'], 12, 70); }
        } else if (o.k === 'totem' || o.k === 'press') {
          if (E.overlap(pb, { x: o.x * T - 4, y: 8 * T, w: 26, h: 36 })) {
            o.done = true; ctx.fxX = o.x * T; ctx.fxY = 7 * T;
            run(async () => {
              await ctx.q(o.q);
              E.fx.confetti(o.x * T + 8, 8 * T, 24);
              if (o.k === 'press') printed = sc.t;
            });
            return;
          }
        } else if (o.k === 'gate') {
          if (p.x + p.w >= o.x * T - 2 && p.x < o.x * T + T && p.y + p.h > o.y0 * T) {
            o.done = true;
            run(async () => {
              await ctx.say('gaia', ['Um **Bloco do Erro**! Ele só quebra com a **afirmação correta**.']);
              const r = await ctx.check();
              for (let y = o.y0; y <= o.y1; y++) { L.set(o.x, y, '.'); E.fx.burst(o.x * T + 9, y * T + 9, ['#e74c3c', '#fff', '#ffd23f'], 8, 110); }
              GG.audio.sfx('boom'); E.shake(4, 0.3);
              if (r.ok) E.fx.float(o.x * T + 9, o.y0 * T, 'CERTO!', '#7bff8f');
            });
            return;
          }
        } else if (o.k === 'enemy' && o.alive) {
          o.px += o.dir * (o.t === 'nevoa' ? 22 : 28) * dt;
          if (Math.abs(o.px - o.x0) > o.range) o.dir *= -1;
          const ey = o.t === 'nevoa' ? o.py + Math.sin(sc.t * 2 + o.x0) * 8 : o.py;
          const eb = { x: o.px + 2, y: ey + 2, w: o.t === 'nevoa' ? 18 : 14, h: 12 };
          if (E.overlap(pb, eb)) {
            if (p.vy > 60 && p.y + p.h - 6 < eb.y + 4) { o.alive = false; o.done = true; p.vy = -240; GG.audio.sfx('stomp'); E.fx.burst(eb.x + 8, eb.y + 6, o.t === 'nevoa' ? ['#c9c3e6', '#fff'] : ['#e74c3c', '#fff'], 14, 90); ctx.addAction(5); E.fx.float(eb.x + 8, eb.y - 4, '+5', '#fff'); }
            else if (p.inv <= 0) { p.inv = 1.2; p.vx = (p.x < eb.x ? -1 : 1) * 160; p.vy = -180; if (ctx.hurt()) respawn(); }
          }
        } else if (o.k === 'finish') {
          if (p.x > o.x * T) {
            o.done = true; ended = true;
            run(async () => {
              if (L.objs.some((x) => (x.k === 'totem' || x.k === 'press') && !x.done)) { /* segurança: nunca deveria ocorrer */ }
              E.fx.confetti(p.x, p.y - 20, 50); GG.audio.sfx('win');
              if (!ctx.damage) ctx.addAction(40);
              ctx.addAction(Math.max(0, 20 - Math.floor(ctx.time / 30)));
              await ctx.say('gaia', [def.id === 'c1s1' ? 'O mosaico do festival está completo! Todos diferentes, todos juntos.' : 'Sua xilogravura virou a capa do cordel da feira!']);
              await ctx.finish();
            });
            return;
          }
        }
      }
      if (pet) pet.update(p.x - p.face * 14, p.y - 4, dt);
      if (ctx.trail && Math.abs(p.vx) > 20) C.trail(p.x + 6, p.y + 18);
      // câmera
      const tx = U.clamp(p.x - E.W * 0.4, 0, L.w * T - E.W), ty = U.clamp(p.y - E.H * 0.55, 0, L.h * T - E.H);
      sc.cam.x += (tx - sc.cam.x) * Math.min(1, dt * 8); sc.cam.y += (ty - sc.cam.y) * Math.min(1, dt * 6);
      if (GG.input.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    sc.draw = function (g) {
      C.sky(g, theme, sc.cam.x, sc.cam.y, sc.t);
      g.world(sc.cam);
      C.drawTiles(g, L, sc.cam, theme); C.drawMovers(g, L); C.drawSprings(g, L);
      const sep = C.theme(theme).sepia;
      L.objs.forEach((o) => {
        const x = o.x * T;
        if (x < sc.cam.x - 60 || x > sc.cam.x + E.W + 60) return;
        if (o.k === 'frag' && !o.done) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), x + 3, o.y * T + 3 + Math.sin(sc.t * 3 + o.x) * 2);
        else if (o.k === 'coin' && !o.done) g.spr('plat', Math.floor(sc.t * 6 + o.x) % 4 === 0 ? 152 : 151, x, o.y * T);
        else if (o.k === 'totem' || o.k === 'press') {
          if (o.k === 'press') { g.rect(x - 14, 7 * T, 46, 3 * T, '#5a3a1a'); g.rect(x - 10, 7 * T + 6, 38, 12, printed ? '#efe1bf' : '#3a2410'); if (printed) g.text('BRASIL', x + 9, 7 * T + 9, { size: 6, color: '#2a2233', align: 'center', shadow: false }); }
          g.img(P.totem(o.done), x + 1, 10 * T - 32);
          if (!o.done) { g.text('?', x + 9, 10 * T - 46 + Math.sin(sc.t * 4) * 3, { size: 10, color: '#ffd23f', align: 'center' }); C.sign(g, x + 9, 10 * T - 62, o.label); }
        } else if (o.k === 'gate' && !o.done) {
          for (let y = o.y0; y <= o.y1; y++) g.img(P.bloco(Math.floor(sc.t * 2 + y) % 2), x + 1, y * T + 1, { scale: 1 });
          C.sign(g, x + 9, o.y0 * T - 18, 'BLOCO DO ERRO', '#ffd0d0');
        } else if (o.k === 'cp') { g.spr('plat', 131, x, 9 * T); g.spr('plat', o.done ? 112 : 111, x, 8 * T); }
        else if (o.k === 'finish') { g.spr('plat', 131, x, 9 * T); g.spr('plat', 131, x, 8 * T); g.spr('plat', 111, x, 7 * T); C.sign(g, x + 9, 6 * T - 4, def.id === 'c1s1' ? 'PALCO FINAL' : 'FIM DA FEIRA', '#d9ffd9'); }
        else if (o.k === 'crowd') {
          P.crowd().slice(0, o.n).forEach((pp, i) => { const bob = Math.abs(Math.sin(sc.t * 5 + i)) * (ended ? 6 : 2); g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 4 + i) % 2 })), x + i * 22, 10 * T - 20 - bob); });
        } else if (o.k === 'enemy' && o.alive) {
          const ey = o.t === 'nevoa' ? o.py + Math.sin(sc.t * 2 + o.x0) * 8 : o.py;
          g.img(o.t === 'nevoa' ? P.nevoa(Math.floor(sc.t * 3) % 2) : P.bloco(Math.floor(sc.t * 3) % 2), o.px, ey, { flip: o.dir < 0 });
        }
      });
      if (pet) pet.draw(g, sc.t);
      C.drawGabriel(g, ctx, p, sc.t);
      g.end();
      if (sep) { const c = g.ctx(); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(240,220,170,.35)'; c.fillRect(0, 0, E.W, E.H); c.restore(); }
      if (ctx.arrow) { const n = nextObjective(); if (n) C.arrow(g, sc.cam, n.x * T + 9, 9 * T); }
    };
    sc.dbg = { player: p, level: L, next: () => { const n = nextObjective(); if (n) { p.x = n.k === 'finish' ? n.x * T + 4 : n.x * T - 14; p.y = 7 * T; p.vx = 0; p.vy = 0; lastCp = { x: p.x, y: p.y }; } return n; }, busy: () => busy };
    return sc;
  };
})();
