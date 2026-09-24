/* =====================================================================
   scenes/rhythm.js — FASE 2-3 "RITMOS DO BRASIL": BATALHA DE RITMO.
   Refeita a pedido do usuário (24/09/2026) no mesmo estilo do Ritmo
   Livre (scenes/ritmolivre.js): setas que sobem até os alvos, "vez do
   GeoBot / sua vez", barra de disputa, combos, notas longas, notas
   douradas e o MODO FESTA (combo 20).
   O conteúdo do material continua igual: três ritmos, três influências
   — Festa do Divino (portuguesa: tambores e sinos), Samba de roda
   (africana: palmas, chocalho, pandeiro, berimbau) e Toré (indígena:
   chocalhos e tambor). Antes de cada música, o cartão da Gaia; depois,
   a checagem de origem; no fim, a atividade do livro (GEO-C2-Q04).
   Controles: ← ↓ ↑ → (ou A S W D, ou tocar na pista). Não dá para
   "perder" a fase: perder a disputa só dá menos pontos.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const ok = (t, fb) => ({ t, ok: true, fb }), no = (t, fb) => ({ t, ok: false, fb });
  const DIRN = ['left', 'down', 'up', 'right'];
  const COL = ['#c24bff', '#3ec1ff', '#35e07a', '#ff4d6d'];
  const PX = [262, 294, 326, 358], BX = [28, 52, 76, 100]; // pistas do jogador / do GeoBot
  const RY = 40; // linha dos alvos
  const SONGS = [
    { id: 'divino', card: 'divino', name: 'Festa do Divino', origin: 'origem portuguesa', bpm: 100, speed: 95, bars: 4, dens: 0.38, holds: 0.1, color: '#e5484d', song: 'rt_divino',
      ins: [['tambor', 'drum'], ['sino', 'bell'], ['atabaque', 'drum'], ['sino', 'bell']], deco: 'bandeiras',
      check: { prompt: 'A **Festa do Divino** tem origem…', options: [ok('portuguesa'), no('africana', 'O samba de roda é que tem forte influência africana.'), no('indígena', 'O toré é que é das comunidades indígenas.')] } },
    { id: 'samba', card: 'samba', name: 'Samba de roda', origin: 'influência africana', bpm: 112, speed: 110, bars: 4, dens: 0.5, holds: 0.1, color: '#f39c12', song: 'rt_samba',
      ins: [['palmas', 'clap'], ['maracas', 'shaker'], ['tambor', 'drum'], ['violao', 'string']], deco: 'roda',
      check: { prompt: 'O **samba de roda** surgiu na Bahia com forte influência…', options: [ok('africana'), no('portuguesa', 'A Festa do Divino é que tem origem portuguesa.'), no('japonesa', 'O livro fala em forte influência africana.')] } },
    { id: 'tore', card: 'tore', name: 'Toré', origin: 'comunidades indígenas', bpm: 120, speed: 122, bars: 4, dens: 0.58, holds: 0.12, chords: 0.08, color: '#2ecc71', song: 'rt_tore',
      ins: [['maracas', 'shaker'], ['tambor', 'drum'], ['maracas', 'shaker'], ['pena', 'drum']], deco: 'chocalhos',
      check: { prompt: 'O **toré** é uma manifestação cultural de…', options: [ok('comunidades indígenas'), no('origem portuguesa', 'A Festa do Divino é portuguesa.'), no('imigrantes europeus', 'O toré é das comunidades indígenas.')] } }
  ];
  // músicas originais (sintetizadas) no clima de cada festa
  GG.audio.addSong('rt_divino', { bpm: 100, wave: 'triangle', lead: 'D5 - F#5 A5 - F#5 E5 D5 - E5 F#5 G5 F#5 - E5 - D5 - F#5 A5 - B5 A5 F#5 - E5 D5 E5 D5 - - -', bass: 'D3 - A2 - D3 - A2 - G2 - D3 - A2 - D3 -', drums: 'k - h - k k h -' });
  GG.audio.addSong('rt_samba', { bpm: 112, wave: 'square', lead: 'A4 - C5 E5 - D5 C5 A4 - C5 - E5 D5 - - - A4 - C5 E5 - G5 E5 D5 - C5 - D5 A4 - - -', bass: 'A2 A2 - A2 E2 - E2 E2 D2 D2 - D2 E2 - E2 -', drums: 'k s h s k h s s' });
  GG.audio.addSong('rt_tore', { bpm: 120, wave: 'triangle', lead: 'E5 E5 G5 E5 D5 - E5 - E5 E5 G5 A5 G5 - E5 - D5 D5 E5 D5 B4 - D5 - E5 G5 E5 D5 E5 - - -', bass: 'E2 - E2 - B2 - E2 - E2 - E2 - B2 - E2 -', drums: 'k h h h k h h h' });

  GEO.scenes.rhythm = function (ctx) {
    const def = ctx.def, bonus = !!def.bonus;
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let si = 0, notes = [], songT = 0, busy = false, finished = false, playing = false;
    let bar = 0.5, combo = 0, best = 0, mult = 1, fever = 0, score = 0, hits = { p: 0, g: 0, b: 0, m: 0 }, total = 0, wins = 0, songHits = null, songTotal = 0;
    let press = [0, 0, 0, 0], botPress = [0, 0, 0, 0], judge = null, pose = { me: -1, bot: -1, meT: 0, botT: 0 }, holding = [null, null, null, null];
    ctx.actionMax = 150;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.si != null) si = ctx.resume.data.si;

    /* ------------------------------------------------ partitura: vez do GeoBot + sua vez (resposta parecida) */
    function chart(S) {
      const beat = 60 / S.bpm, out = [];
      let t = 2.2, last = null;
      for (let turn = 0; turn < 6; turn++) { // 3 trocas: GeoBot canta, você responde
        const who = turn % 2 === 0 ? 'bot' : 'me';
        if (who === 'bot') {
          last = [];
          for (let s = 0; s < S.bars * 4; s++) {
            if (Math.random() < S.dens || s % 4 === 0) {
              const lane = Math.floor(Math.random() * 4), hold = Math.random() < S.holds && s % 2 === 0 ? beat * (1 + Math.floor(Math.random() * 2)) : 0;
              last.push({ s, lane, hold, gold: Math.random() < 0.08, chord: S.chords && Math.random() < S.chords ? (lane + 2) % 4 : -1 });
            }
          }
        }
        const src = who === 'bot' ? last : last.map((n) => Object.assign({}, n, { lane: Math.random() < 0.2 ? (n.lane + 1) % 4 : n.lane }));
        src.forEach((n) => {
          const nt = t + n.s * beat / 2;
          out.push({ who, t: nt, lane: n.lane, hold: n.hold, gold: n.gold, judged: false, held: 0 });
          if (n.chord >= 0 && who === 'me') out.push({ who, t: nt, lane: n.chord, hold: 0, gold: false, judged: false, held: 0 });
        });
        t += S.bars * 2 * beat + beat * 2;
      }
      return out.sort((a, b) => a.t - b.t);
    }

    sc.begin = async function () { if (!ctx.resume) ctx.checkpoint({ si: 0 }); await next(); };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    async function next() {
      if (si >= SONGS.length) {
        finished = true;
        await run(async () => {
          const grade = (() => { const acc = (hits.p + hits.g * 0.75 + hits.b * 0.4) / Math.max(1, total); return acc > 0.92 ? 'S' : acc > 0.8 ? 'A' : acc > 0.6 ? 'B' : 'C'; })();
          await ctx.say('gaia', ['Fim do show! Você venceu **' + wins + ' de 3** disputas contra o GeoBot. Nota do ritmo: **' + grade + '**. Pontos: **' + score + '**.']);
          if (!bonus) await ctx.q('GEO-C2-Q04');
          if (!ctx.damage) ctx.addAction(20);
          await ctx.finish(); // sem {geobot}: isto não é corrida contra o GeoBot (não entra no placar de corridas)
        });
        return;
      }
      const S = SONGS[si];
      await run(async () => {
        if (!bonus) await ctx.cards(S.card);
        await ctx.say('gaia', ['Batalha de ritmo: **' + S.name + '** (' + S.origin + ')! O **GeoBot** toca primeiro (setas da esquerda); depois é a **sua vez** (direita).', 'Aperte **← ↓ ↑ →** (ou **A S W D**) quando a seta encostar no alvo. **Segure** nas notas longas. **Combo 20** liga o **Modo Festa**!']);
      });
      notes = chart(S); songTotal = notes.filter((n) => n.who === 'me').length; total += songTotal;
      songHits = { p: 0, g: 0, b: 0, m: 0 };
      songT = -0.2; playing = true; bar = 0.5; combo = 0; mult = 1;
      GG.audio.music(S.song);
      ctx.setGoal('Música ' + (si + 1) + '/3 — ' + S.name + ': vença a disputa com o GeoBot!');
      if (X()) X().banner({ id: 'rt' + si, icon: S.ins[0][0], title: S.name, style: S.origin + ' • ' + S.bpm + ' batidas por minuto' }, 'RITMOS DO BRASIL');
    }
    async function songEnd() {
      playing = false; GG.audio.stopMusic();
      const S = SONGS[si], won = bar >= 0.5; if (won) wins++;
      const acc = (songHits.p + songHits.g * 0.75 + songHits.b * 0.4) / Math.max(1, songTotal);
      ctx.addAction(Math.round(acc * 36 + (won ? 4 : 0)));
      GG.audio.sfx(won ? 'win' : 'bad');
      if (won) { E.fx.confetti(E.W / 2, 60, 50); if (X()) X().flash('#fff6c0', 0.35); }
      await run(async () => {
        await ctx.say(won ? 'gaia' : 'geobot', [(won ? 'Você venceu a disputa do **' + S.name + '**!' : 'O GeoBot levou a disputa do **' + S.name + '**… na próxima é você!') + ' Perfeitas: ' + songHits.p + ', boas: ' + (songHits.g + songHits.b) + ', perdidas: ' + songHits.m + '. Combo máximo: ' + best + '.']);
        if (!bonus) {
          const r = await GG.quiz.quick({ prompt: S.check.prompt, type: 'mc', options: S.check.options }, { title: 'Origem do ritmo', subject: 'Geografia', chips: [S.name], doneLabel: si < SONGS.length - 1 ? 'Próximo ritmo ▶' : 'Continuar ▶' });
          const okk = r.attempts === 1; GEO.campaign.recordCheck(okk, 'Festas e ritmos'); ctx.learnPts += okk ? 25 : 10; ctx.learnMax += 25; ctx.hud();
        }
      });
      si++; ctx.checkpoint({ si });
      await next();
    }

    /* ------------------------------------------------ julgamento */
    function hit(lane) {
      press[lane] = 0.12; pose.me = lane; pose.meT = 0.25;
      const cand = notes.filter((n) => n.who === 'me' && !n.judged && n.lane === lane && Math.abs(n.t - songT) < 0.24).sort((a, b) => Math.abs(a.t - songT) - Math.abs(b.t - songT))[0];
      if (!cand) return;
      const d = Math.abs(cand.t - songT), S = SONGS[si];
      const r = d < 0.06 ? ['PERFEITO!', '#7bff8f', 1, 'p', 0.045] : d < 0.12 ? ['ÓTIMO!', '#3ec1ff', 0.8, 'g', 0.03] : ['BOM', '#ffd23f', 0.5, 'b', 0.015];
      cand.judged = true; cand.hit = true; hits[r[3]]++; songHits[r[3]]++; combo++; best = Math.max(best, combo);
      mult = Math.min(4, 1 + Math.floor(combo / 10));
      if (combo === 20 && !fever) { fever = 8; if (X()) X().flash('#ffd23f', 0.4); GG.audio.sfx('power'); }
      const pts = Math.round(100 * r[2] * mult * (cand.gold ? 2 : 1) * (fever > 0 ? 2 : 1)); score += pts;
      bar = Math.min(1, bar + r[4] * (cand.gold ? 1.5 : 1));
      judge = { t: r[0], c: r[1], at: sc.t, lane };
      GG.audio.sfx(S.ins[lane][1]);
      if (X()) { X().sparkle(PX[lane], RY, COL[lane], cand.gold ? 8 : 4); X().ring(PX[lane], RY, cand.gold ? '#ffd23f' : COL[lane], 22); if (mult > 1 || cand.gold) X().pop(PX[lane], RY + 18, '+' + pts, cand.gold ? '#ffd23f' : '#fff', 7); }
      if (cand.hold) holding[lane] = cand;
    }
    function miss(n) { n.judged = true; hits.m++; songHits.m++; combo = 0; mult = 1; bar = Math.max(0, bar - 0.05); judge = { t: 'ERROU', c: '#ff6b6b', at: sc.t, lane: n.lane }; pose.me = -2; pose.meT = 0.3; }
    sc.click = function (x) { if (!playing || busy) return; const lane = PX.findIndex((lx) => Math.abs(x - lx) < 16); if (lane >= 0) hit(lane); };

    sc.update = function (dt) {
      sc.t += dt; press = press.map((v) => Math.max(0, v - dt)); botPress = botPress.map((v) => Math.max(0, v - dt));
      pose.meT -= dt; pose.botT -= dt; if (fever > 0) fever -= dt;
      if (busy || finished || !playing) return;
      ctx.tick(dt); songT += dt;
      const IN = GG.input;
      if (IN.pressed('left')) hit(0); if (IN.pressed('down')) hit(1); if (IN.pressed('up') || IN.pressed('jump')) hit(2); if (IN.pressed('right')) hit(3);
      holding.forEach((n, lane) => {
        if (!n) return;
        const down = IN.down(DIRN[lane]) || (lane === 2 && IN.down('jump'));
        if (down && songT < n.t + n.hold) { n.held += dt; score += Math.round(60 * dt * mult); bar = Math.min(1, bar + dt * 0.02); if (X() && Math.random() < 0.3) X().sparkle(PX[lane], RY, COL[lane], 1); }
        else holding[lane] = null;
      });
      const S = SONGS[si];
      notes.forEach((n) => {
        if (n.judged) return;
        if (n.who === 'bot' && songT >= n.t) { n.judged = true; botPress[n.lane] = 0.15 + n.hold; pose.bot = n.lane; pose.botT = 0.25 + n.hold; GG.audio.sfx(S.ins[n.lane][1]); bar = Math.max(0, bar - 0.006); }
        else if (n.who === 'me' && songT - n.t > 0.24) miss(n);
      });
      const last = notes[notes.length - 1];
      if (!last || songT > last.t + last.hold + 1) songEnd();
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    /* ------------------------------------------------ desenho */
    function arrowShape(c, x, y, lane, s, fill, stroke) {
      c.save(); c.translate(x, y); c.rotate([Math.PI, Math.PI / 2, -Math.PI / 2, 0][lane] || 0); const k = s / 12;
      c.beginPath(); c.moveTo(12 * k, 0); c.lineTo(0, -10 * k); c.lineTo(0, -5 * k); c.lineTo(-11 * k, -5 * k); c.lineTo(-11 * k, 5 * k); c.lineTo(0, 5 * k); c.lineTo(0, 10 * k); c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.6; c.stroke(); } c.restore();
    }
    function drawLanes(c, g, xs, who) {
      const x = X(), S = SONGS[Math.min(si, 2)];
      xs.forEach((lx, lane) => {
        const pr = who === 'me' ? press[lane] : botPress[lane];
        if (pr > 0 && x) x.glow(c, lx, RY, 20, COL[lane], 0.8);
        arrowShape(c, lx, RY, lane, who === 'me' ? 12 : 9, pr > 0 ? COL[lane] : 'rgba(20,24,50,.75)', pr > 0 ? '#fff' : 'rgba(255,255,255,.5)');
        if (who === 'me' && x) x.ilus(c, S.ins[lane][0], lx, 212, 13, { alpha: 0.85 }); // instrumento de cada seta
      });
      notes.forEach((n) => {
        if (n.who !== who) return;
        if (n.judged && !(n.hit && n.hold && holding[n.lane] === n)) return;
        const y = RY + (n.t - songT) * S.speed; if (y > E.H + 20 || (y < RY - 30 && !n.hold)) return;
        const lx = xs[n.lane], s = who === 'me' ? 12 : 9;
        if (n.hold) { const y2 = RY + (n.t + n.hold - songT) * S.speed; c.fillStyle = COL[n.lane] + 'aa'; c.fillRect(lx - s * 0.3, Math.max(RY, y), s * 0.6, Math.max(0, y2 - Math.max(RY, y))); }
        if (n.judged) return;
        if (x) x.glow(c, lx, y, s * 1.4, n.gold || fever > 0 ? '#ffd23f' : COL[n.lane], 0.5);
        arrowShape(c, lx, y, n.lane, s, n.gold ? '#ffd23f' : fever > 0 ? 'hsl(' + ((sc.t * 400 + n.lane * 90) % 360) + ',90%,60%)' : COL[n.lane], '#fff');
      });
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X(), S = SONGS[Math.min(si, 2)];
      const beat = playing ? Math.abs(Math.sin(songT * Math.PI * S.bpm / 60)) : 0;
      const bg = c.createLinearGradient(0, 0, 0, E.H); bg.addColorStop(0, fever > 0 ? '#3a0a4a' : '#1a0c33'); bg.addColorStop(1, fever > 0 ? '#7a1a3a' : GG.pixel.shade(S.color, -120)); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H);
      if (x) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { const bx = 130 + i * 45, a = Math.sin(sc.t * (1 + i * 0.3) + i) * 0.5; const gr = c.createLinearGradient(bx, 0, bx + Math.sin(a) * 160, 190); gr.addColorStop(0, COL[i] + '55'); gr.addColorStop(1, COL[i] + '00'); c.fillStyle = gr; c.globalAlpha = 0.5 + beat * 0.4; c.beginPath(); c.moveTo(bx - 2, 0); c.lineTo(bx + 2, 0); c.lineTo(bx + Math.sin(a) * 160 + 26, 190); c.lineTo(bx + Math.sin(a) * 160 - 26, 190); c.closePath(); c.fill(); }
        c.restore();
        if (fever > 0 && !E.reduced) { c.save(); c.globalAlpha = 0.22 + 0.15 * beat; c.fillStyle = 'hsl(' + (sc.t * 200 % 360) + ',80%,55%)'; c.fillRect(0, 0, E.W, E.H); c.restore(); if (Math.random() < 0.3) E.fx.confetti(U.rand(40, 360), -5, 3); }
      }
      // enfeites de cada festa
      if (S.deco === 'bandeiras') { c.strokeStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(126, 34); c.quadraticCurveTo(200, 54, 240, 34); c.stroke(); for (let i = 0; i < 7; i++) { const fx = 132 + i * 15, fy = 36 + Math.sin((i + 0.5) / 7 * Math.PI) * 9; g.rect(fx, fy, 8, 9, i % 2 ? '#e5484d' : '#fff'); } }
      if (S.deco === 'roda') { c.strokeStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(200, 176, 64, 10, 0, 0, Math.PI * 2); c.stroke(); }
      if (S.deco === 'chocalhos' && x) for (let i = 0; i < 4; i++) x.ilus(c, 'maracas', 140 + i * 40, 42 + Math.sin(sc.t * 6 + i) * 3, 14);
      c.fillStyle = '#2a1a10'; c.fillRect(0, 186, E.W, 39); c.fillStyle = '#5a3a20'; c.fillRect(0, 182, E.W, 5);
      if (x) { [[118, 162], [282, 162]].forEach(([sx, sy]) => x.ilus(c, S.ins[0][0], sx, sy + beat * -2, 26 + beat * 4, { shadow: true })); }
      P.crowd().slice(0, 10).forEach((pp, i) => g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 4 + i) % 2 })), 118 + i * 17, 196 - beat * (i % 2 ? 5 : 2)));
      const bp = pose.botT > 0 ? pose.bot : -1, mp = pose.meT > 0 ? pose.me : -1;
      const off = (l) => (l === 0 ? [-3, 0] : l === 1 ? [0, 3] : l === 2 ? [0, -5] : l === 3 ? [3, 0] : [0, 0]);
      const ob = off(bp), om = off(mp);
      g.img(P.geobot(bp >= 0 ? 3 : Math.floor(sc.t * 4) % 3), 150 + ob[0], 150 - beat * 3 + ob[1], { scale: 1.6 });
      g.img(C.gabrielSide(ctx.look, mp === -2 ? 'idle' : mp >= 0 ? 'jump' : 'run', sc.t), 222 + om[0], 150 - beat * 3 + om[1], { scale: 1.6, flip: true });
      if (mp === -2) g.text('?', 236, 136, { size: 8, color: '#ff6b6b' });
      g.rect(10, 26, 112, 150, 'rgba(0,0,0,.25)'); g.rect(242, 26, 136, 196, 'rgba(0,0,0,.3)');
      drawLanes(c, g, BX, 'bot'); drawLanes(c, g, PX, 'me');
      g.text('GEOBOT', 64, 14, { size: 6, color: '#9aa7c7', align: 'center' }); g.text('VOCÊ', 310, 14, { size: 6, color: '#ffd23f', align: 'center' });
      g.panel(130, 6, 140, 10, '#15152a', '#15152a'); g.rect(132, 8, 136, 6, '#9aa7c7'); g.rect(132 + 136 * (1 - bar), 8, 136 * bar, 6, '#ffd23f');
      if (x) { x.ilus(c, 'robo', 132 + 136 * (1 - bar) - 7, 11, 14); x.ilus(c, 'estrela', 132 + 136 * (1 - bar) + 7, 11, 12); }
      g.text(S.name.toUpperCase(), 64, 184, { size: 6, color: S.color, align: 'center' }); g.text('Música ' + (Math.min(si, 2) + 1) + '/3 • ' + S.origin, 64, 194, { size: 4, color: '#fff', align: 'center' });
      g.text(String(score), 238, 186, { size: 8, color: '#fff', align: 'right' });
      if (combo > 2) g.text('COMBO ' + combo + (mult > 1 ? '  x' + mult : ''), 238, 198, { size: 6, color: fever > 0 ? '#ffd23f' : '#9ff2ff', align: 'right' });
      if (fever > 0) g.text('MODO FESTA!', 200, 64, { size: 9, color: 'hsl(' + (sc.t * 300 % 360) + ',90%,65%)', align: 'center' });
      const nxtMe = notes.find((n) => n.who === 'me' && !n.judged), nxtBot = notes.find((n) => n.who === 'bot' && !n.judged);
      if (playing && nxtBot && (!nxtMe || nxtBot.t < nxtMe.t) && nxtBot.t - songT < 1.2) g.text('VEZ DO GEOBOT', 200, 28, { size: 6, color: '#9aa7c7', align: 'center' });
      else if (playing && nxtMe && nxtMe.t - songT < 1.4 && (!nxtBot || nxtMe.t < nxtBot.t)) g.text('SUA VEZ!', 200, 26, { size: 8, color: '#ffd23f', align: 'center' });
      if (judge && sc.t - judge.at < 0.5) { const k = (sc.t - judge.at) / 0.5; c.save(); c.globalAlpha = 1 - k; g.text(judge.t, 310, 64 - k * 8, { size: 8, color: judge.c, align: 'center' }); c.restore(); }
      if (playing && songT < 1.6) g.text(songT < 0.5 ? '3' : songT < 1 ? '2' : '1', 310, 110, { size: 16, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { busy: () => busy, playing: () => playing, autoplay() { notes.forEach((n) => { if (!n.judged) { n.judged = true; if (n.who === 'me') { n.hit = true; hits.p++; songHits.p++; score += 100; } } }); bar = 1; songT = 999; }, state: () => ({ si, bar, combo, score, fever, total, hits, wins }), peek: () => ({ songT, notes }) };
    return sc;
  };
})();
