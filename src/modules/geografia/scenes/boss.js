/* =====================================================================
   scenes/boss.js — BATALHAS DE CHEFE (Generalizador, Sombra do
   Preconceito e Vírus da Desigualdade). Cada escudo segue os passos:
     1. sobreviver a um trecho de ação (ataques com AVISO antes);
     2. atingir PLACAS com afirmações FALSAS (as verdadeiras não!);
     3. responder a atividade do livro (a ação para, sem cronômetro);
     4. a resposta correta quebra o escudo;
     5. fase final: o chefe fica vulnerável e reage com mais força.
   Versão "arcade" (pedido do usuário, set/2026):
   • ao surgir as placas o jogo PAUSA num cartão para ler as frases
     (qualquer tecla continua); dá para reler pelo botão "📜 Placas";
   • as 3 placas ficam na frente do chefe, uma em cada altura
     (chão, plataformas do meio e plataforma de cima): suba para mirar;
     ao mirar, a frase da placa aparece embaixo da tela;
   • padrões de ataque variados com aviso (tiro triplo, chuva, onda no
     chão, investida), mais fortes na fase final;
   • cada placa VERDADEIRA atingida por engano dispara uma surpresa
     diferente (chuva de rótulos, chefe furioso, terremoto, apagão,
     placas embaralhadas) — muda o jogo, mas nunca faz perder a fase.
   Chefes são ideias erradas personificadas — nunca pessoas ou povos.
   A Sombra é vencida por empatia: ela se transforma em luz.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common, T = C.T;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);

  function plan(def) {
    const qs = def.questions;
    if (def.boss === 'sombra') {
      const steps = [];
      qs.forEach((id, i) => { steps.push({ k: 'survive', t: 7 }); if (i % 2 === 0) steps.push({ k: 'plates' }); steps.push({ k: 'q', id, confirm: i === 0 || i === qs.length - 1 }); });
      steps.push({ k: 'final' });
      return steps;
    }
    if (def.boss === 'virus') return [{ k: 'survive', t: 10 }, { k: 'plates' }, { k: 'survive', t: 8 }, { k: 'plates' }, { k: 'q', id: qs[0] }, { k: 'check' }, { k: 'final' }];
    return [{ k: 'survive', t: 10 }, { k: 'plates' }, { k: 'q', id: qs[0], confirm: true }, { k: 'plates' }, { k: 'final' }];
  }
  // alturas em que o tiro sai: chão, plataformas do meio (linha 8) e plataforma de cima (linha 5)
  const LEVELS = [{ y: 186, name: 'chão' }, { y: 132, name: 'meio' }, { y: 78, name: 'alto' }];
  const PLATE_X = 222, PLATE_W = 46, PLATE_H = 24;
  const SURPRISES = [
    { id: 'chuva', t: 'CHUVA DE RÓTULOS!', d: 'Rótulos caem do céu por alguns segundos.' },
    { id: 'furia', t: 'CHEFE FURIOSO!', d: 'Ele dispara em todas as direções!' },
    { id: 'terremoto', t: 'TERREMOTO!', d: 'Ondas correm pelo chão: pule!' },
    { id: 'apagao', t: 'APAGÃO!', d: 'Tudo escureceu… só a sua luz ilumina.' },
    { id: 'embaralha', t: 'PLACAS EMBARALHADAS!', d: 'As placas trocaram de lugar!' }
  ];

  GEO.scenes.boss = function (ctx) {
    const def = ctx.def;
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const L = C.level(23, 13);
    L.ground(0, 22, 11, def.theme === 'sombra' ? 'N' : 'G', 'D');
    L.plat(3, 6, 8); L.plat(8, 11, 5);
    const p = C.body(3 * T, 9 * T, 12, 20);
    const boss = { x: 300, y: 70, hp: 100, t: 0, hurt: 0, calm: false, gone: false, dash: 0, fury: 0 };
    const shots = [], hazards = [], plates = [], warns = [];
    const steps = plan(def);
    const layers = steps.filter((s) => s.k === 'q' || s.k === 'check').length || 1;
    const hard = def.boss === 'virus' ? 1.25 : def.boss === 'sombra' ? 1.1 : 1;
    let si = 0, stepT = 0, busy = false, finished = false, cool = 0, shieldLeft = layers, atkT = 1.5, atkN = 0, dark = 0, rainT = 0, banner = null;
    ctx.actionMax = 120;
    ctx.learnMax += steps.filter((s) => s.k === 'plates').length * 50 + steps.filter((s) => s.k === 'check').length * 25;
    let btn = null, shuffleN = 0;
    const pet = ctx.pet ? C.pet() : null;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.si) { si = ctx.resume.data.si; shieldLeft = layers - steps.slice(0, si).filter((s) => s.k === 'q' || s.k === 'check').length; }
    sc.exit = () => { if (btn) btn.remove(); };
    sc.begin = async function () {
      if (!ctx.resume) { ctx.checkpoint({ si: 0 }); await ctx.say('gaia', [def.bossName + ': “' + def.bossLine + '”', 'Pulsos: tecla **B / E / J** (ou botão B). Pule com **Espaço / A**. Fique de olho nos **avisos vermelhos**: eles mostram de onde vem o ataque!']); }
      startStep();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    const cur = () => steps[si];
    function say(t, d, col) { banner = { t, d, col: col || '#ffd23f', at: sc.t }; }
    function startStep() {
      stepT = 0; atkT = 1.2; const s = cur(); if (!s) return;
      if (s.k === 'survive') { ctx.setGoal('Desvie dos ataques! (' + s.t + ' s)'); say('SOBREVIVA!', s.t + ' segundos'); }
      if (s.k === 'plates') spawnPlates();
      if (s.k === 'final') { ctx.setGoal('O escudo caiu! Dispare pulsos para ' + (def.boss === 'sombra' ? 'transformar a Sombra em luz' : 'vencer ' + def.bossName) + '.'); say('ATAQUE FINAL!', 'O escudo caiu: dispare no chefe!', '#ff5d6c'); }
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
    function breakShield() { shieldLeft = Math.max(0, shieldLeft - 1); GG.audio.sfx('shield'); E.shake(5, 0.4); E.fx.burst(boss.x + 48, boss.y + 48, ['#9ff2ff', '#fff', '#ffd23f'], 40, 160); boss.hurt = 0.6; if (X()) { X().flash('#9ff2ff', 0.4); X().ring(boss.x + 48, boss.y + 48, '#9ff2ff', 90); } say('ESCUDO QUEBRADO!', shieldLeft ? 'Faltam ' + shieldLeft : 'Agora ele está vulnerável!', '#9ff2ff'); }
    function next() { si++; ctx.checkpoint({ si }); ctx._quietCp = true; hazards.length = 0; warns.length = 0; startStep(); }

    /* ---------------------------------------------------------------- placas */
    function spawnPlates() {
      const sts = ctx.statements(1, 2);
      plates.length = 0;
      const lv = U.shuffle([0, 1, 2]);
      sts.forEach((s, i) => plates.push({ s, lv: lv[i], letter: String.fromCharCode(65 + i), alive: true, flash: 0, x: PLATE_X, y: LEVELS[lv[i]].y - PLATE_H / 2 }));
      ctx.setGoal('Atinja SÓ as placas com afirmações FALSAS. Suba nas plataformas para mirar em cada altura.');
      showBtn();
      run(readPlates);
    }
    function readPlates() {
      const lines = plates.filter((pl) => pl.alive).map((pl) => '**' + pl.letter + '** (' + LEVELS[pl.lv].name + ') — ' + pl.s.t);
      if (!X() || !X().readCard) return ctx.say('gaia', ['Placas do escudo! Acerte com pulsos **só as FALSAS**.'].concat(lines.slice(0, 2)));
      return X().readCard({ kicker: '🛡️ PLACAS DO ESCUDO', icon: 'escudo', title: 'Destrua só as FALSAS!', lines: lines.concat(['Placa verdadeira atingida = **surpresa** do chefe!']), color: '#9ff2ff', cls: 'plates' });
    }
    function showBtn() {
      if (btn) btn.remove();
      btn = U.el('button', { type: 'button', class: 'btn small info boss-read', onclick: () => { if (!busy && plates.length) run(readPlates); } }, '📜 Reler placas');
      document.body.appendChild(btn);
    }
    function platesDone() { return plates.every((pl) => !pl.alive || pl.s.v); }
    function hitPlate(pl) {
      if (pl.s.v) {
        pl.flash = 0.8; GG.audio.sfx('bad'); ctx.learnPts = Math.max(0, ctx.learnPts - 5);
        GEO.campaign.recordCheck(false, 'Placas de chefe — ' + def.title);
        GG.ui.toast('A placa ' + pl.letter + ' é VERDADEIRA! Não destrua o que está certo.', '', 2400);
        surprise(); return;
      }
      pl.alive = false; GG.audio.sfx('boom'); E.fx.burst(pl.x + 20, pl.y + 10, ['#e74c3c', '#fff'], 20, 110); E.shake(3, 0.2);
      if (X()) { X().sparkle(pl.x + PLATE_W / 2, pl.y + PLATE_H / 2, '#ffd23f', 8); X().pop(pl.x + PLATE_W / 2, pl.y - 4, 'FALSA!', '#7bff8f', 9); }
      boss.hurt = 0.3; ctx.learnPts += 25; GEO.campaign.recordCheck(true, 'Placas de chefe — ' + def.title); GEO.eco.award(20, 2, 'Placa falsa', GEO.eco.replayFactor(def.id));
      if (pl.s.fb) GG.ui.toast('✔ Corrigido: ' + pl.s.fb, 'ok', 3200);
      ctx.hud();
      if (platesDone()) { plates.length = 0; if (btn) { btn.remove(); btn = null; } run(async () => { await ctx.say('gaia', ['Placas falsas destruídas! O escudo trincou.']); next(); }); }
    }
    /** Surpresa diferente a cada erro: muda o jogo por alguns segundos, sem fazer perder a fase. */
    function surprise() {
      const S = SURPRISES[shuffleN++ % SURPRISES.length];
      say(S.t, S.d, '#ff8f3d'); E.shake(4, 0.3); if (X()) X().flash('#ff8f3d', 0.3);
      if (S.id === 'chuva') rainT = 3.5;
      if (S.id === 'furia') { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; hazards.push({ x: boss.x + 48, y: boss.y + 48, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, t: 0, k: 'orb' }); } boss.fury = 1; }
      if (S.id === 'terremoto') { [0, 0.9].forEach((dl) => warns.push({ k: 'wave', t: -dl, at: 0.8 })); }
      if (S.id === 'apagao') dark = 4.5;
      if (S.id === 'embaralha') { const lv = U.shuffle(plates.map((pl) => pl.lv)); plates.forEach((pl, i) => { pl.lv = lv[i]; pl.y = LEVELS[pl.lv].y - PLATE_H / 2; }); }
    }

    /* ---------------------------------------------------------------- ataques com aviso */
    function attack(final) {
      const kinds = final ? ['triplo', 'chuva', 'onda', 'investida', 'triplo'] : ['triplo', 'chuva', 'onda'].concat(def.boss !== 'generalizador' ? ['investida'] : []);
      const k = kinds[atkN++ % kinds.length];
      if (k === 'triplo') { warns.push({ k: 'aim', t: 0, at: 0.55 }); }
      if (k === 'chuva') { for (let i = 0; i < 3 + (final ? 2 : 0); i++) warns.push({ k: 'drop', x: U.clamp(p.x + U.rand(-90, 90), 10, 380), t: -i * 0.25, at: 0.7 }); }
      if (k === 'onda') warns.push({ k: 'wave', t: 0, at: 0.8 });
      if (k === 'investida') warns.push({ k: 'dash', y: U.pick([110, 150, 185]), t: 0, at: 0.9 });
    }
    function fire(w) {
      const bx = boss.x + 40, by = boss.y + 48;
      if (w.k === 'aim') { const a = Math.atan2(p.y + 10 - by, p.x - bx); [-0.22, 0, 0.22].forEach((o) => hazards.push({ x: bx, y: by, vx: Math.cos(a + o) * 110 * hard, vy: Math.sin(a + o) * 110 * hard, t: 0, k: 'orb' })); GG.audio.sfx('shoot'); }
      if (w.k === 'drop') hazards.push({ x: w.x, y: -10, vx: 0, vy: 150 * hard, t: 0, k: 'drop' });
      if (w.k === 'wave') { hazards.push({ x: 400, y: 11 * T - 8, vx: -140 * hard, vy: 0, t: 0, k: 'wave' }); GG.audio.sfx('stomp'); }
      if (w.k === 'dash') { boss.dash = 1.3; boss.dashY = w.y; GG.audio.sfx('boost'); }
    }

    sc.update = function (dt) {
      sc.t += dt; boss.t += dt;
      if (boss.hurt > 0) boss.hurt -= dt;
      plates.forEach((pl) => { if (pl.flash > 0) pl.flash -= dt; });
      if (busy || finished) return;
      ctx.tick(dt);
      const s = cur();
      C.physics(L, p, dt, { speed: 115 * ctx.speed, jumpV: 330 });
      p.x = U.clamp(p.x, 0, 22 * T - p.w);
      if (dark > 0) dark -= dt;
      if (boss.fury > 0) boss.fury -= dt;
      // disparo
      cool -= dt;
      if (GG.input.down('act') && cool <= 0) { shots.push({ x: p.x + (p.face > 0 ? 12 : -6), y: p.y + 8, vx: p.face * 270 }); cool = 0.2; GG.audio.sfx('shoot'); p.state = 'shoot'; }
      shots.forEach((sh) => { sh.x += sh.vx * dt; });
      // movimento do chefe (investida atravessa a tela e volta)
      if (boss.dash > 0) { boss.dash -= dt; const k = 1 - boss.dash / 1.3; boss.x = 320 - Math.sin(k * Math.PI) * 330; boss.y = boss.dashY - 48; }
      else { boss.x = 318 + Math.sin(boss.t * 0.9) * 22; boss.y = 40 + Math.sin(boss.t * 1.7) * 18; }
      // ataques: calmos durante as placas, fortes no final
      const calm = s && s.k === 'plates';
      atkT -= dt * (calm ? 0.35 : 1);
      if (atkT <= 0 && s && (s.k === 'survive' || s.k === 'final' || calm)) { attack(s.k === 'final'); atkT = (s.k === 'final' ? 1.5 : 2.1) / hard * (boss.hp < 50 && s.k === 'final' ? 0.8 : 1); }
      if (rainT > 0) { rainT -= dt; if (Math.random() < dt * 5) hazards.push({ x: U.rand(10, 390), y: -10, vx: 0, vy: 130, t: 0, k: 'drop' }); }
      for (let i = warns.length - 1; i >= 0; i--) { const w = warns[i]; w.t += dt; if (w.t >= w.at) { fire(w); warns.splice(i, 1); } }
      hazards.forEach((h) => { h.x += h.vx * dt; h.y += h.vy * dt; h.t += dt; });
      const hitMe = () => { p.inv = 1.3; if (X()) X().flash('#ff4d4d', 0.25); if (ctx.hurt()) { p.x = 3 * T; p.y = 9 * T; } };
      for (let i = hazards.length - 1; i >= 0; i--) {
        const h = hazards[i];
        const box = h.k === 'wave' ? { x: h.x - 8, y: h.y - 8, w: 16, h: 16 } : { x: h.x - 5, y: h.y - 5, w: 10, h: 10 };
        if (h.t > 6 || h.x < -30 || h.x > E.W + 30 || h.y > E.H + 10) hazards.splice(i, 1);
        else if (p.inv <= 0 && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, box)) { hazards.splice(i, 1); hitMe(); }
      }
      if (boss.dash > 0 && p.inv <= 0 && E.overlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: boss.x + 14, y: boss.y + 14, w: 68, h: 68 })) hitMe();
      // tiros atingem placas / chefe
      for (let i = shots.length - 1; i >= 0; i--) {
        const sh = shots[i]; let used = false;
        for (const pl of plates) if (pl.alive && E.overlap({ x: sh.x, y: sh.y, w: 8, h: 4 }, { x: pl.x, y: pl.y, w: PLATE_W, h: PLATE_H })) { hitPlate(pl); used = true; break; }
        if (!used && E.overlap({ x: sh.x, y: sh.y, w: 8, h: 4 }, { x: boss.x + 10, y: boss.y + 10, w: 76, h: 76 })) {
          used = true;
          if (s && s.k === 'final') { boss.hp -= 8; boss.hurt = 0.12; GG.audio.sfx('stomp'); E.fx.burst(sh.x, sh.y, ['#fff', '#ffd23f'], 8, 90); ctx.addAction(4); if (X()) X().pop(sh.x, sh.y - 8, '-8', '#ffd23f', 7); if (boss.hp < 50 && !boss.enraged) { boss.enraged = true; say('FÚRIA!', 'Metade da vida: ataques mais rápidos!', '#ff5d6c'); } }
          else { E.fx.burst(sh.x, sh.y, '#9ff2ff', 5, 60); }
        }
        if (used || sh.x < -10 || sh.x > E.W + 10) shots.splice(i, 1);
      }
      if (s && s.k === 'survive') { stepT += dt; if (stepT >= s.t) next(); }
      if (s && s.k === 'final' && boss.hp <= 0 && !finished) {
        finished = true; boss.calm = true; hazards.length = 0; warns.length = 0;
        run(async () => {
          GG.audio.sfx('win'); E.fx.confetti(boss.x + 48, boss.y + 48, 80); E.shake(6, 0.5); if (X()) { X().flash('#ffffff', 0.6); X().ring(boss.x + 48, boss.y + 48, '#ffd23f', 120); }
          if (!ctx.damage) ctx.addAction(50); ctx.addAction(30);
          await ctx.say('gaia', [def.boss === 'sombra' ? 'Com **empatia e respeito**, a Sombra do Preconceito virou luz!' : def.boss === 'virus' ? 'Informações corrigidas! **Serviços e direitos** restaurados no Atlas.' : 'O Generalizador perdeu o rótulo: cada pessoa voltou a ter suas cores!']);
          await ctx.finish();
        });
      }
      if (pet) pet.update(p.x - p.face * 14, p.y - 4, dt);
      if (GG.input.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    /** Placa que o jogador está mirando agora (mesma altura do tiro). */
    function aimed() { const sy = p.y + 8; return plates.find((pl) => pl.alive && sy >= pl.y - 2 && sy <= pl.y + PLATE_H + 2 && p.face > 0); }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      C.sky(g, def.theme, 0, 0, sc.t);
      C.drawTiles(g, L, sc.cam, def.theme);
      // avisos de ataque
      warns.forEach((w) => {
        const a = 0.35 + 0.35 * Math.abs(Math.sin(sc.t * 20)); if (w.t < 0) return;
        c.save(); c.globalAlpha = a; c.fillStyle = '#ff3b3b'; c.strokeStyle = '#ff3b3b';
        if (w.k === 'drop') { c.fillRect(w.x - 6, 11 * T - 3, 12, 3); g.text('!', w.x, 11 * T - 16, { size: 8, color: '#ff5d6c', align: 'center' }); }
        if (w.k === 'wave') { c.fillRect(0, 11 * T - 4, E.W, 4); g.text('PULE!', 360, 11 * T - 18, { size: 7, color: '#ff5d6c', align: 'center' }); }
        if (w.k === 'dash') { c.fillRect(0, w.y - 24, E.W, 2); c.fillRect(0, w.y + 24, E.W, 2); g.text('⚠ INVESTIDA', 60, w.y - 6, { size: 6, color: '#ff5d6c', font: 'sans-serif' }); }
        if (w.k === 'aim') { c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(boss.x + 40, boss.y + 48); c.lineTo(p.x + 6, p.y + 10); c.stroke(); c.setLineDash([]); }
        c.restore();
      });
      // placas (na frente do chefe, uma por altura)
      const aim = aimed();
      plates.forEach((pl) => {
        if (!pl.alive) return;
        const bob = Math.sin(sc.t * 2 + pl.lv) * 2, yy = pl.y + bob;
        if (x) x.glow(c, pl.x + PLATE_W / 2, yy + PLATE_H / 2, 26, pl.flash > 0 ? '#7bff8f' : pl === aim ? '#ffd23f' : '#9ff2ff', pl === aim ? 0.8 : 0.4);
        g.panel(pl.x, yy, PLATE_W, PLATE_H, pl.flash > 0 ? '#9dff9d' : pl === aim ? '#fff0a0' : '#fff3d1', '#15152a');
        g.text(pl.letter, pl.x + 13, yy + 6, { size: 12, color: '#6d4c8f', align: 'center', shadow: false });
        if (!(x && x.ilus(c, pl.flash > 0 ? 'check' : 'pergaminho', pl.x + 34, yy + 12, 16))) g.text('?', pl.x + 34, yy + 7, { size: 8, color: '#2a2233', align: 'center', shadow: false });
        if (pl.flash > 0) g.text('VERDADEIRA', pl.x + PLATE_W / 2, yy - 10, { size: 5, color: '#7bff8f', align: 'center' });
        c.strokeStyle = 'rgba(159,242,255,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(pl.x + PLATE_W, yy + PLATE_H / 2); c.lineTo(boss.x + 30, boss.y + 48); c.stroke();
      });
      // chefe
      if (!boss.gone) {
        const im = boss.calm && def.boss === 'sombra' ? P.sombra(Math.floor(sc.t * 3) % 2, true) : P.chefe(def.boss, Math.floor(sc.t * 3) % 2, boss.hurt > 0);
        if (x && (boss.fury > 0 || boss.enraged)) x.glow(c, boss.x + 48, boss.y + 48, 70, '#ff4d4d', 0.35 + 0.2 * Math.sin(sc.t * 10));
        if (boss.dash > 0 && x) for (let i = 1; i < 4; i++) g.img(im, boss.x + i * 18, boss.y, { scale: 2, alpha: 0.25 / i });
        g.img(im, boss.x, boss.y, { scale: boss.calm && def.boss === 'sombra' ? 6 : 2, alpha: boss.calm ? 0.8 : 1 });
        if (shieldLeft > 0) { c.strokeStyle = 'rgba(159,242,255,' + (0.5 + 0.3 * Math.sin(sc.t * 6)) + ')'; c.lineWidth = 2 + shieldLeft; c.beginPath(); c.arc(boss.x + 48, boss.y + 48, 58, 0, Math.PI * 2); c.stroke(); }
      }
      hazards.forEach((h) => {
        const col = def.boss === 'virus' ? '#6ad16f' : def.boss === 'sombra' ? '#b07bff' : '#f7c948';
        if (h.k === 'wave') { if (x) x.glow(c, h.x, h.y, 16, '#ff8f3d', 0.7); c.fillStyle = '#ff8f3d'; c.beginPath(); c.moveTo(h.x - 10, h.y + 8); c.quadraticCurveTo(h.x, h.y - 14, h.x + 10, h.y + 8); c.fill(); return; }
        if (x) x.glow(c, h.x, h.y, 10, col, 0.6);
        g.panel(h.x - 6, h.y - 5, 12, 10, col, '#15152a'); g.text(def.boss === 'virus' ? '$' : '!', h.x, h.y - 3, { size: 6, color: '#15152a', align: 'center', shadow: false });
      });
      shots.forEach((sh) => { if (x) x.glow(c, sh.x + 4, sh.y + 1, 7, '#6fe8ff', 0.7); g.rect(sh.x, sh.y, 8, 3, '#9ff2ff'); g.rect(sh.x + (sh.vx > 0 ? 5 : 0), sh.y - 1, 3, 5, '#fff'); });
      if (pet) pet.draw(g, sc.t);
      C.drawGabriel(g, ctx, p, sc.t);
      // apagão: só um círculo de luz em volta do Gabriel
      if (dark > 0) { const r = 55; c.save(); c.fillStyle = 'rgba(4,2,12,' + Math.min(0.92, dark) + ')'; c.beginPath(); c.rect(0, 0, E.W, E.H); c.arc(p.x + 6, p.y + 10, r, 0, Math.PI * 2, true); c.fill('evenodd'); c.restore(); }
      // mira: frase da placa mirada
      if (aim) {
        g.panel(8, E.H - 30, E.W - 16, 24, 'rgba(15,18,38,.92)', '#ffd23f');
        g.text('🎯 Placa ' + aim.letter + ':', 14, E.H - 26, { size: 6, color: '#ffd23f', font: 'sans-serif', bold: true });
        g.wrap(aim.s.t, 60, E.H - 26, E.W - 80, { size: 6, lh: 8, color: '#fff', font: "'Nunito', sans-serif", bold: true, shadow: false });
      } else if (plates.length) g.text('Suba e mire nas placas (chão • meio • alto) — a frase aparece aqui', E.W / 2, E.H - 12, { size: 5, color: 'rgba(255,255,255,.75)', align: 'center' });
      // barra do chefe
      g.panel(110, 4, 180, 18, 'rgba(15,18,38,.9)', '#3a4290');
      g.text(def.bossName, 200, 7, { size: 6, color: '#ffd23f', align: 'center' });
      for (let i = 0; i < layers; i++) g.rect(116 + i * 12, 16, 10, 3, i < shieldLeft ? '#9ff2ff' : '#333a66');
      const s = cur(); if (s && s.k === 'final') { g.rect(190, 16, 94, 3, '#333a66'); g.rect(190, 16, 94 * Math.max(0, boss.hp) / 100, 3, boss.hp < 50 ? '#ff3b3b' : '#ff5d6c'); }
      if (s && s.k === 'survive') g.text('Desvie! ' + Math.max(0, Math.ceil(s.t - stepT)), E.W / 2, 30, { size: 8, color: '#fff', align: 'center' });
      // faixa de anúncio (surpresas, fases)
      if (banner && sc.t - banner.at < 2.2) {
        const k = (sc.t - banner.at) / 2.2, sx = k < 0.12 ? 1 - k / 0.12 : k > 0.85 ? -(k - 0.85) / 0.15 : 0;
        c.save(); c.translate(sx * E.W, 0); c.fillStyle = 'rgba(10,8,24,.85)'; c.fillRect(0, 52, E.W, 30);
        c.fillStyle = banner.col; c.fillRect(0, 52, E.W, 2); c.fillRect(0, 80, E.W, 2);
        g.text(banner.t, E.W / 2, 56, { size: 10, color: banner.col, align: 'center' });
        g.text(banner.d, E.W / 2, 70, { size: 5, color: '#fff', align: 'center' }); c.restore();
      }
    };
    sc.dbg = { step: () => cur(), p, boss, plates, busy: () => busy, hit: (pl) => hitPlate(pl), skipSurvive() { const s = cur(); if (s && s.k === 'survive') stepT = s.t; }, killBoss() { boss.hp = 0; }, surprise };
    return sc;
  };
})();
