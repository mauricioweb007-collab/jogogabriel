/* =====================================================================
   scenes/shmup.js — NAVE-CARTOGRÁFICA (Fase 1-3 Rotas pelo Atlântico).
   Rolagem horizontal sobre o oceano. Os "pulsos de conhecimento" só
   atingem obstáculos ABSTRATOS: Névoas da Confusão, documentos falsos
   e correntes simbólicas — nunca pessoas. Ilhas-Atlas param a nave para
   estudar (a pergunta pausa toda a ação). Trecho de MEMÓRIA sobre a
   escravidão: a nave desacelera, os disparos são desligados, sem
   inimigos, música calma e texto respeitoso.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;

  GEO.scenes.shmup = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const SPEED = 58;
    const islands = [
      { d: 1050, id: 'i1', title: 'Ilha-Atlas da Planta', run: async () => { await ctx.q('GEO-C1-Q09'); } },
      { d: 1900, id: 'i2', title: 'Porto do Cartógrafo', run: async () => { await ctx.cards('portugal'); await ctx.q('GEO-C1-Q10'); } },
      { d: 3250, id: 'i3', title: 'Ilha da Arte', run: async () => { await ctx.q('GEO-C1-Q11'); await ctx.q('GEO-C1-Q12'); } }
    ];
    const MEM0 = 2050, MEM1 = 2600, END = 3500;
    let d = 0, busy = false, finished = false, cool = 0;
    const ship = { x: 60, y: 110, w: 22, h: 10, inv: 0 };
    const shots = [], foes = [], items = [], bolts = [];
    const skin = GEO.eco.has('ship') ? '#ffd23f' : '#3ec1ff';
    const rng = U.rng(7);
    // roteiro de inimigos e coletáveis (distância → evento)
    const spawns = [];
    for (let x = 250; x < END - 200; x += 70) {
      if ((x > MEM0 - 100 && x < MEM1 + 60) || islands.some((i) => Math.abs(i.d - x) < 120)) continue;
      const r = rng();
      spawns.push({ d: x, k: r < 0.45 ? 'nevoa' : r < 0.8 ? 'doc' : 'corrente', y: 30 + Math.floor(rng() * 150) });
      if (rng() < 0.45) spawns.push({ d: x + 30, k: rng() < 0.4 ? 'frag' : 'coin', y: 30 + Math.floor(rng() * 150) });
    }
    ctx.fragTotal = spawns.filter((s) => s.k === 'frag').length;
    ctx.actionMax = ctx.fragTotal * 10 + spawns.filter((s) => s.k !== 'frag' && s.k !== 'coin').length * 3 + 60;
    let spawnI = 0, memTold = false, cardTold = false;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.d) { d = ctx.resume.data.d; islands.forEach((i) => { if (i.d <= d) i.done = true; }); while (spawnI < spawns.length && spawns[spawnI].d < d) spawnI++; memTold = d > MEM0; cardTold = true; }
    const mem = () => d > MEM0 && d < MEM1;
    sc.begin = function () { if (!ctx.resume) ctx.checkpoint({ d: 0 }); ctx.setGoal('Pilote até as Ilhas-Atlas. Setas movem, B/E/J disparam pulsos.'); };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }

    sc.update = function (dt) {
      sc.t += dt;
      if (busy || finished) return;
      ctx.tick(dt);
      const speed = SPEED * (mem() ? 0.55 : 1) * ctx.speed;
      d += speed * dt;
      if (!cardTold && d > 120) { cardTold = true; run(() => ctx.cards('colonia')); return; }
      if (!memTold && d > MEM0) {
        memTold = true; GG.audio.music('calma'); foes.length = 0; bolts.length = 0;
        run(async () => { await ctx.cards('memoria'); ctx.setGoal('Momento de memória: a nave segue devagar, sem disparos.'); });
        return;
      }
      if (d > MEM1 && GG.audio.current() === 'calma') { GG.audio.music('oceano'); ctx.setGoal('Siga até a Ilha da Arte e o porto final.'); }
      // ilhas
      for (const i of islands) {
        if (!i.done && d >= i.d) {
          i.done = true; ctx.fxX = ship.x; ctx.fxY = ship.y;
          run(async () => { await ctx.say('gaia', ['Pouso na **' + i.title + '**!']); await i.run(); ctx.checkpoint({ d: i.d + 1 }); E.fx.confetti(ship.x + 40, ship.y, 20); });
          return;
        }
      }
      if (d >= END) { finished = true; run(async () => { GG.audio.sfx('win'); if (!ctx.damage) ctx.addAction(40); await ctx.say('gaia', ['Chegamos ao porto! As rotas do Atlântico estão no Atlas.']); await ctx.finish(); }); return; }
      // spawns
      while (spawnI < spawns.length && spawns[spawnI].d <= d + E.W) {
        const s = spawns[spawnI++];
        if (s.k === 'frag' || s.k === 'coin') items.push({ k: s.k, x: E.W + 10, y: s.y });
        else foes.push({ k: s.k, x: E.W + 10, y: s.y, y0: s.y, hp: s.k === 'corrente' ? 3 : s.k === 'nevoa' ? 2 : 1, t: 0, flash: 0 });
      }
      // nave
      const IN = GG.input;
      ship.x = U.clamp(ship.x + IN.axisX() * 120 * dt, 4, E.W - 120);
      ship.y = U.clamp(ship.y + IN.axisY() * 110 * dt, 20, E.H - 20);
      if (ship.inv > 0) ship.inv -= dt;
      cool -= dt;
      if ((IN.down('act') || IN.down('jump')) && cool <= 0 && !mem()) { shots.push({ x: ship.x + 24, y: ship.y + 7 }); cool = 0.2; GG.audio.sfx('shoot'); }
      shots.forEach((s) => { s.x += 280 * dt; }); for (let i = shots.length - 1; i >= 0; i--) if (shots[i].x > E.W + 10) shots.splice(i, 1);
      foes.forEach((f) => {
        f.t += dt; f.x -= (speed + (f.k === 'doc' ? 30 : 10)) * dt;
        if (f.k === 'nevoa') f.y = f.y0 + Math.sin(f.t * 2) * 18;
        if (f.flash > 0) f.flash -= dt;
        if (f.k === 'doc' && Math.random() < 0.004) bolts.push({ x: f.x, y: f.y + 6 });
      });
      bolts.forEach((b) => { b.x -= 120 * dt; });
      items.forEach((it) => { it.x -= speed * dt; if (ctx.magnet && Math.hypot(it.x - ship.x, it.y - ship.y) < 70) { it.x += (ship.x - it.x) * dt * 4; it.y += (ship.y - it.y) * dt * 4; } });
      // colisões
      for (let i = foes.length - 1; i >= 0; i--) {
        const f = foes[i], fb = { x: f.x, y: f.y, w: f.k === 'corrente' ? 16 : 20, h: f.k === 'corrente' ? 30 : 14 };
        for (let j = shots.length - 1; j >= 0; j--) { const s = shots[j]; if (E.overlap({ x: s.x, y: s.y, w: 8, h: 3 }, fb)) { shots.splice(j, 1); f.hp--; f.flash = 0.1; if (f.hp <= 0) { foes.splice(i, 1); GG.audio.sfx('boom'); E.fx.burst(f.x + 10, f.y + 8, f.k === 'doc' ? ['#fff', '#e74c3c'] : f.k === 'corrente' ? ['#9aa7c7', '#fff'] : ['#c9c3e6', '#fff'], 16, 100); ctx.addAction(3); E.fx.float(f.x + 10, f.y, f.k === 'doc' ? 'Falso!' : '+3', '#fff'); } break; } }
        if (foes[i] === f && ship.inv <= 0 && E.overlap({ x: ship.x + 2, y: ship.y + 3, w: 20, h: 10 }, fb)) { ship.inv = 1.5; ctx.hurt(); foes.splice(i, 1); E.fx.burst(f.x + 10, f.y + 8, '#fff', 10, 80); }
        else if (f.x < -40) foes.splice(i, 1);
      }
      for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; if (ship.inv <= 0 && E.overlap({ x: ship.x + 2, y: ship.y + 3, w: 20, h: 10 }, { x: b.x, y: b.y, w: 6, h: 6 })) { ship.inv = 1.5; ctx.hurt(); bolts.splice(i, 1); } else if (b.x < -10) bolts.splice(i, 1); }
      for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; if (E.overlap({ x: ship.x, y: ship.y, w: 24, h: 14 }, { x: it.x, y: it.y, w: 12, h: 12 })) { items.splice(i, 1); if (it.k === 'frag') ctx.fragment(it.x + 6, it.y + 6); else ctx.coin(it.x + 6, it.y + 6); } else if (it.x < -20) items.splice(i, 1); }
      if (ctx.trail) C.trail(ship.x, ship.y + 8);
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    function drawDoc(g, x, y, fl) { g.rect(x, y, 14, 18, fl ? '#fff' : '#f3ecd8'); g.frame(x, y, 14, 18, '#2a2233'); for (let i = 0; i < 4; i++) g.rect(x + 2, y + 3 + i * 3, 10, 1, '#9a8f7a'); g.line(x + 2, y + 2, x + 12, y + 16, '#e5484d', 2); g.line(x + 12, y + 2, x + 2, y + 16, '#e5484d', 2); }
    function drawChain(g, x, y, fl) { for (let i = 0; i < 4; i++) { g.circle(x + 8, y + 4 + i * 7, 4, fl ? '#fff' : '#7d8597', 2); } }
    sc.draw = function (g) {
      const c = g.ctx(), dusk = mem();
      const gr = c.createLinearGradient(0, 0, 0, E.H);
      gr.addColorStop(0, dusk ? '#3a2a55' : '#5ec8ff'); gr.addColorStop(0.35, dusk ? '#6b4a6b' : '#9fe0ff'); gr.addColorStop(0.36, dusk ? '#2a3d6b' : '#2b7bd1'); gr.addColorStop(1, dusk ? '#16213f' : '#134a8a');
      c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
      for (let y = 90; y < E.H; y += 12) { const off = -((d * (0.6 + y / 400)) % 40); for (let x = off; x < E.W; x += 40) { c.fillStyle = 'rgba(255,255,255,' + (dusk ? 0.08 : 0.18) + ')'; c.fillRect(x + (y % 20), y, 12, 1); } }
      for (let i = 0; i < 5; i++) { const x = ((i * 120 - d * 0.2) % (E.W + 80) + E.W + 80) % (E.W + 80) - 60; c.fillStyle = 'rgba(255,255,255,' + (dusk ? 0.15 : 0.7) + ')'; c.beginPath(); c.ellipse(x, 22 + (i % 3) * 14, 26, 7, 0, 0, Math.PI * 2); c.fill(); }
      // costa distante (litoral)
      c.fillStyle = dusk ? '#2d4a3a' : '#3c9a5b'; for (let x = 0; x < E.W; x += 4) { const h = 6 + Math.sin((x + d * 0.3) / 30) * 3; c.fillRect(x, 78 - h, 4, h); }
      // ilhas
      islands.forEach((i) => {
        const x = 300 + (i.d - d) * 1;
        if (x < -120 || x > E.W + 120) return;
        c.fillStyle = '#e8d49a'; c.beginPath(); c.ellipse(x, 180, 70, 22, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5bb04b'; c.beginPath(); c.ellipse(x, 174, 52, 14, 0, 0, Math.PI * 2); c.fill();
        g.spr('town', 16, x - 30, 150); g.spr('town', 4, x + 16, 152);
        g.rect(x - 6, 150, 18, 18, '#8b5a2b'); g.rect(x - 8, 146, 22, 5, '#c0392b');
        C.sign(g, x, 196, i.title, i.done ? '#d9ffd9' : '#fff8e6');
      });
      if (d > END - 400) { const x = 300 + (END - d); g.rect(x, 120, 90, 80, '#8b5a2b'); g.rect(x - 4, 116, 98, 6, '#6b4f2a'); C.sign(g, x + 45, 100, 'PORTO FINAL', '#d9ffd9'); }
      items.forEach((it) => { if (it.k === 'frag') g.img(P.fragmento(Math.floor(sc.t * 4) % 2), it.x, it.y); else g.spr('plat', 151, it.x - 3, it.y - 3); });
      foes.forEach((f) => { if (f.k === 'nevoa') g.img(P.nevoa(Math.floor(sc.t * 3) % 2), f.x, f.y, { alpha: f.flash > 0 ? 0.5 : 1 }); else if (f.k === 'doc') drawDoc(g, f.x, f.y, f.flash > 0); else drawChain(g, f.x, f.y, f.flash > 0); });
      bolts.forEach((b) => g.text('×', b.x, b.y, { size: 8, color: '#e5484d' }));
      shots.forEach((s) => { g.rect(s.x, s.y, 8, 3, '#9ff2ff'); g.rect(s.x + 5, s.y - 1, 3, 5, '#fff'); });
      if (!(ship.inv > 0 && Math.floor(sc.t * 20) % 2)) { g.img(P.nave(skin, Math.floor(sc.t * 10) % 2), ship.x, ship.y); g.img(C.gabrielSide(ctx.look, 'idle', sc.t), ship.x + 8, ship.y - 14, { scale: 0.6 }); }
      if (ctx.pet) g.img(P.geobot(0), ship.x - 14, ship.y - 4 + Math.sin(sc.t * 4) * 2, { scale: 0.5 });
      // barra de progresso da rota
      g.rect(100, 4, 200, 5, 'rgba(0,0,0,.4)'); g.rect(100, 4, 200 * Math.min(1, d / END), 5, '#ffd23f');
      islands.forEach((i) => g.rect(100 + 200 * i.d / END - 1, 2, 2, 9, '#fff'));
      if (dusk) g.text('Momento de memória', E.W / 2, 14, { size: 6, color: '#ffe9a8', align: 'center' });
    };
    sc.dbg = { skipTo(nd) { d = nd; }, d: () => d, busy: () => busy };
    return sc;
  };
})();
