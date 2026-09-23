/* =====================================================================
   scenes/boss.js — BATALHAS DE CHEFE (Generalizador, Sombra do
   Preconceito e Vírus da Desigualdade). Cada escudo segue os passos:
     1. sobreviver a um trecho curto de ação;
     2. atingir PLACAS com afirmações FALSAS (as verdadeiras não!);
     3. responder a atividade do livro (a ação para, sem cronômetro);
     4. a resposta correta quebra o escudo;
     5. explicação + aplicar o conceito uma segunda vez.
   Chefes são ideias erradas personificadas — nunca pessoas ou povos.
   A Sombra é vencida por empatia: ela se transforma em luz.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common, T = C.T;

  function plan(def) {
    const qs = def.questions;
    if (def.boss === 'sombra') {
      const steps = [];
      qs.forEach((id, i) => { steps.push({ k: 'survive', t: 6 }); if (i % 2 === 0) steps.push({ k: 'plates' }); steps.push({ k: 'q', id, confirm: i === 0 || i === qs.length - 1 }); });
      steps.push({ k: 'final' });
      return steps;
    }
    if (def.boss === 'virus') return [{ k: 'survive', t: 9 }, { k: 'plates' }, { k: 'survive', t: 7 }, { k: 'plates' }, { k: 'q', id: qs[0] }, { k: 'check' }, { k: 'final' }];
    return [{ k: 'survive', t: 10 }, { k: 'plates' }, { k: 'q', id: qs[0], confirm: true }, { k: 'plates' }, { k: 'final' }];
  }

  GEO.scenes.boss = function (ctx) {
    const def = ctx.def;
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const L = C.level(23, 13);
    L.ground(0, 22, 11, def.theme === 'sombra' ? 'N' : 'G', 'D');
    L.plat(3, 6, 8); L.plat(15, 18, 8); L.plat(9, 12, 5);
    const p = C.body(3 * T, 9 * T, 12, 20);
    const boss = { x: 300, y: 70, hp: 100, t: 0, hurt: 0, calm: false, gone: false };
    const shots = [], hazards = [], plates = [];
    const steps = plan(def);
    const layers = steps.filter((s) => s.k === 'q' || s.k === 'check').length || 1;
    let si = 0, stepT = 0, busy = false, finished = false, cool = 0, shieldLeft = layers;
    ctx.actionMax = 120;
    ctx.learnMax += steps.filter((s) => s.k === 'plates').length * 50 + steps.filter((s) => s.k === 'check').length * 25;
    let panel = null;
    const pet = ctx.pet ? C.pet() : null;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.si) { si = ctx.resume.data.si; shieldLeft = layers - steps.slice(0, si).filter((s) => s.k === 'q' || s.k === 'check').length; }
    sc.exit = () => { if (panel) panel.remove(); };
    sc.begin = async function () {
      if (!ctx.resume) { ctx.checkpoint({ si: 0 }); await ctx.say('gaia', [def.bossName + ': “' + def.bossLine + '”', 'Pulsos: tecla **B / E / J** (ou botão B). Pule com **Espaço / A**.']); }
      startStep();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    const cur = () => steps[si];
    function startStep() {
      stepT = 0; const s = cur(); if (!s) return;
      if (s.k === 'survive') ctx.setGoal('Desvie dos ataques! (' + s.t + ' s)');
      if (s.k === 'plates') spawnPlates();
      if (s.k === 'final') ctx.setGoal('O escudo caiu! Dispare pulsos para ' + (def.boss === 'sombra' ? 'transformar a Sombra em luz' : 'vencer ' + def.bossName) + '.');
      if (s.k === 'q') run(async () => {
        await ctx.say('gaia', ['O escudo está fraco! Responda para quebrá-lo.']);
        ctx.fxX = boss.x; ctx.fxY = boss.y;
        await ctx.q(s.id, { forceConfirm: !!s.confirm, doneLabel: 'Quebrar o escudo! ▶' });
        breakShield(); next();
      });
      if (s.k === 'check') run(async () => {
        await ctx.say('gaia', ['Agora aplique o que aprendeu mais uma vez!']);
        await ctx.check({ title: 'Aplicar de novo', prompt: 'Qual afirmação está **correta**? Use-a para enfraquecer o Vírus!' });
        breakShield(); next();
      });
    }
    function breakShield() { shieldLeft = Math.max(0, shieldLeft - 1); GG.audio.sfx('shield'); E.shake(5, 0.4); E.fx.burst(boss.x + 48, boss.y + 48, ['#9ff2ff', '#fff', '#ffd23f'], 40, 160); boss.hurt = 0.6; }
    function next() { si++; ctx.checkpoint({ si }); ctx._quietCp = true; startStep(); }
    function spawnPlates() {
      const sts = ctx.statements(1, 2);
      const pos = [[70, 60], [175, 34], [120, 110]];
      plates.length = 0;
      sts.forEach((s, i) => plates.push({ s, x: pos[i][0], y: pos[i][1], alive: true, letter: String.fromCharCode(65 + i), flash: 0 }));
      ctx.setGoal('Atinja SÓ as placas com afirmações FALSAS (leia abaixo).');
      showPanel();
      run(() => ctx.say('gaia', ['Placas do escudo! Leia as frases abaixo e acerte com pulsos **só as FALSAS**.']));
    }
    function showPanel() {
      if (panel) panel.remove();
      panel = U.el('div', { class: 'boss-panel', role: 'region', 'aria-label': 'Placas do escudo' }, plates.map((pl) => U.el('div', { class: 'bp-row' + (pl.alive ? '' : ' gone'), dataset: { l: pl.letter } }, [U.el('b', { class: 'pix' }, pl.letter), ' ' + pl.s.t, U.el('button', { type: 'button', class: 'btn small ghost', 'aria-label': 'Ouvir placa ' + pl.letter, onclick: () => GG.tts.speak('Placa ' + pl.letter + ': ' + pl.s.t) }, '🔊')])));
      document.body.appendChild(panel);
    }
    function platesDone() { return plates.every((pl) => !pl.alive || pl.s.v); }
    function hitPlate(pl) {
      if (pl.s.v) {
        pl.flash = 0.6; GG.audio.sfx('bad'); ctx.learnPts = Math.max(0, ctx.learnPts - 5);
        GEO.campaign.recordCheck(false, 'Placas de chefe — ' + def.title);
        GG.ui.toast('A placa ' + pl.letter + ' é VERDADEIRA! Não destrua o que está certo.', '', 2400); return;
      }
      pl.alive = false; GG.audio.sfx('boom'); E.fx.burst(pl.x + 20, pl.y + 10, ['#e74c3c', '#fff'], 20, 110);
      ctx.learnPts += 25; GEO.campaign.recordCheck(true, 'Placas de chefe — ' + def.title); GEO.eco.award(20, 2, 'Placa falsa', GEO.eco.replayFactor(def.id));
      if (pl.s.fb) GG.ui.toast('✔ Corrigido: ' + pl.s.fb, 'ok', 3200);
      showPanel(); ctx.hud();
      if (platesDone()) { plates.length = 0; if (panel) { panel.remove(); panel = null; } run(async () => { await ctx.say('gaia', ['Placas falsas destruídas! O escudo trincou.']); next(); }); }
    }

    sc.update = function (dt) {
      sc.t += dt; boss.t += dt;
      if (boss.hurt > 0) boss.hurt -= dt;
      plates.forEach((pl) => { if (pl.flash > 0) pl.flash -= dt; });
      if (busy || finished) return;
      ctx.tick(dt);
      const s = cur();
      C.physics(L, p, dt, { speed: 110 * ctx.speed });
      p.x = U.clamp(p.x, 0, 22 * T - p.w);
      // disparo
      cool -= dt;
      if (GG.input.down('act') && cool <= 0) { shots.push({ x: p.x + (p.face > 0 ? 12 : -6), y: p.y + 8, vx: p.face * 260 }); cool = 0.22; GG.audio.sfx('shoot'); p.state = 'shoot'; }
      shots.forEach((sh) => { sh.x += sh.vx * dt; });
      // chefe se move e ataca (mais calmo durante as placas)
      const calm = s && s.k === 'plates';
      boss.x = 290 + Math.sin(boss.t * 0.8) * 40; boss.y = 40 + Math.sin(boss.t * 1.6) * 16;
      const rate = calm ? 0.004 : s && s.k === 'final' ? 0.02 : 0.03;
      if (Math.random() < rate) { const a = Math.atan2(p.y - (boss.y + 48), p.x - (boss.x + 30)); hazards.push({ x: boss.x + 30, y: boss.y + 48, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, t: 0 }); }
      hazards.forEach((h) => { h.x += h.vx * dt; h.y += h.vy * dt; h.t += dt; });
      for (let i = hazards.length - 1; i >= 0; i--) { const h = hazards[i]; if (h.t > 5 || h.x < -20 || h.x > E.W + 20 || h.y > E.H) hazards.splice(i, 1); else if (p.inv <= 0 && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: h.x - 5, y: h.y - 5, w: 10, h: 10 })) { hazards.splice(i, 1); p.inv = 1.3; if (ctx.hurt()) { p.x = 3 * T; p.y = 9 * T; } } }
      // tiros atingem placas / chefe
      for (let i = shots.length - 1; i >= 0; i--) {
        const sh = shots[i]; let used = false;
        for (const pl of plates) if (pl.alive && E.overlap({ x: sh.x, y: sh.y, w: 8, h: 4 }, { x: pl.x, y: pl.y, w: 40, h: 22 })) { hitPlate(pl); used = true; break; }
        if (!used && E.overlap({ x: sh.x, y: sh.y, w: 8, h: 4 }, { x: boss.x + 10, y: boss.y + 10, w: 76, h: 76 })) {
          used = true;
          if (s && s.k === 'final') { boss.hp -= 12; boss.hurt = 0.12; GG.audio.sfx('stomp'); E.fx.burst(sh.x, sh.y, ['#fff', '#ffd23f'], 8, 90); ctx.addAction(4); }
          else { E.fx.burst(sh.x, sh.y, '#9ff2ff', 5, 60); }
        }
        if (used || sh.x < -10 || sh.x > E.W + 10) shots.splice(i, 1);
      }
      if (s && s.k === 'survive') { stepT += dt; if (stepT >= s.t) next(); }
      if (s && s.k === 'final' && boss.hp <= 0 && !finished) {
        finished = true; boss.calm = true;
        run(async () => {
          GG.audio.sfx('win'); E.fx.confetti(boss.x + 48, boss.y + 48, 80); E.shake(6, 0.5);
          if (!ctx.damage) ctx.addAction(50); ctx.addAction(30);
          await ctx.say('gaia', [def.boss === 'sombra' ? 'Com **empatia e respeito**, a Sombra do Preconceito virou luz!' : def.boss === 'virus' ? 'Informações corrigidas! **Serviços e direitos** restaurados no Atlas.' : 'O Generalizador perdeu o rótulo: cada pessoa voltou a ter suas cores!']);
          await ctx.finish();
        });
      }
      if (pet) pet.update(p.x - p.face * 14, p.y - 4, dt);
      if (GG.input.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    sc.draw = function (g) {
      C.sky(g, def.theme, 0, 0, sc.t);
      C.drawTiles(g, L, sc.cam, def.theme);
      // placas
      plates.forEach((pl) => {
        if (!pl.alive) return;
        const col = pl.flash > 0 ? '#9dff9d' : '#fff3d1';
        g.panel(pl.x, pl.y + Math.sin(sc.t * 2 + pl.x) * 3, 40, 22, col, '#15152a');
        g.text(pl.letter, pl.x + 20, pl.y + 5 + Math.sin(sc.t * 2 + pl.x) * 3, { size: 12, color: '#6d4c8f', align: 'center', shadow: false });
      });
      // chefe
      if (!boss.gone) {
        const im = boss.calm && def.boss === 'sombra' ? P.sombra(Math.floor(sc.t * 3) % 2, true) : P.chefe(def.boss, Math.floor(sc.t * 3) % 2, boss.hurt > 0);
        g.img(im, boss.x, boss.y, { scale: boss.calm && def.boss === 'sombra' ? 6 : 2, alpha: boss.calm ? 0.8 : 1 });
        if (shieldLeft > 0) { const c = g.ctx(); c.strokeStyle = 'rgba(159,242,255,' + (0.5 + 0.3 * Math.sin(sc.t * 6)) + ')'; c.lineWidth = 2 + shieldLeft; c.beginPath(); c.arc(boss.x + 48, boss.y + 48, 58, 0, Math.PI * 2); c.stroke(); }
      }
      hazards.forEach((h) => { g.panel(h.x - 6, h.y - 5, 12, 10, def.boss === 'virus' ? '#6ad16f' : def.boss === 'sombra' ? '#b07bff' : '#f7c948', '#15152a'); g.text(def.boss === 'virus' ? '$' : '!', h.x, h.y - 3, { size: 6, color: '#15152a', align: 'center', shadow: false }); });
      shots.forEach((sh) => { g.rect(sh.x, sh.y, 8, 3, '#9ff2ff'); g.rect(sh.x + (sh.vx > 0 ? 5 : 0), sh.y - 1, 3, 5, '#fff'); });
      if (pet) pet.draw(g, sc.t);
      C.drawGabriel(g, ctx, p, sc.t);
      // barra do chefe
      g.panel(110, 4, 180, 18, 'rgba(15,18,38,.9)', '#3a4290');
      g.text(def.bossName, 200, 7, { size: 6, color: '#ffd23f', align: 'center' });
      for (let i = 0; i < layers; i++) g.rect(116 + i * 12, 16, 10, 3, i < shieldLeft ? '#9ff2ff' : '#333a66');
      const s = cur(); if (s && s.k === 'final') { g.rect(190, 16, 94, 3, '#333a66'); g.rect(190, 16, 94 * Math.max(0, boss.hp) / 100, 3, '#ff5d6c'); }
      if (s && s.k === 'survive') g.text('Desvie! ' + Math.max(0, Math.ceil(s.t - stepT)), E.W / 2, 30, { size: 8, color: '#fff', align: 'center' });
    };
    sc.dbg = { step: () => cur(), p, boss, plates, busy: () => busy, hit: (pl) => hitPlate(pl), skipSurvive() { const s = cur(); if (s && s.k === 'survive') stepT = s.t; }, killBoss() { boss.hp = 0; } };
    return sc;
  };
})();
