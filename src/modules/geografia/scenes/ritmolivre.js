/* =====================================================================
   scenes/ritmolivre.js — SALA BÔNUS "RITMO LIVRE": BATALHA DE RITMO
   contra o GeoBot (inspirada nos jogos de ritmo de sucesso: setas que
   sobem até os alvos, "vez do rival / sua vez", barra de disputa,
   combos, notas longas e modo especial).
   • 4 setas (← ↓ ↑ →, ou A S W D, ou tocar na pista).
   • Cada rodada: o GeoBot canta uma frase (as setas dele à esquerda)
     e você responde com a SUA frase (à direita). Acertos puxam a barra
     para o seu lado; erros para o dele.
   • Notas LONGAS (segure a tecla), notas DOURADAS (valem o dobro),
     combo que sobe o multiplicador e o MODO CARNAVAL (combo 25): tela
     em festa, confete, notas brilhando e pontos em dobro.
   • 3 rodadas cada vez mais rápidas: Frevo, Samba e Carnaval.
   Sem questões (sala bônus). Música e passos originais.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const DIRN = ['left', 'down', 'up', 'right'];
  const ARROW = ['←', '↓', '↑', '→'];
  const COL = ['#c24bff', '#3ec1ff', '#35e07a', '#ff4d6d'];
  const PX = [262, 294, 326, 358], BX = [28, 52, 76, 100]; // pistas do jogador / do GeoBot
  const RY = 40; // linha dos alvos (as setas sobem até aqui)
  const ROUNDS = [
    { name: 'Frevo', bpm: 118, speed: 105, bars: 4, dens: 0.45, holds: 0.08, song: 'rl_frevo', color: '#ff9f1c' },
    { name: 'Samba', bpm: 132, speed: 125, bars: 4, dens: 0.6, holds: 0.12, song: 'rl_samba', color: '#35e07a' },
    { name: 'Carnaval', bpm: 146, speed: 145, bars: 5, dens: 0.72, holds: 0.15, chords: 0.12, song: 'rl_carnaval', color: '#ff4d6d' }
  ];
  // músicas originais para a batalha (sintetizadas)
  GG.audio.addSong('rl_frevo', { bpm: 118, wave: 'square', lead: 'G5 G5 A5 G5 E5 - C5 D5 E5 E5 G5 E5 D5 - - - G5 G5 A5 B5 C6 - B5 A5 G5 E5 D5 E5 C5 - - -', bass: 'C3 - G2 - C3 - G2 - F2 - C3 - G2 - B2 -', drums: 'k h s h k k s h' });
  GG.audio.addSong('rl_samba', { bpm: 132, wave: 'square', lead: 'E5 - G5 A5 - G5 E5 D5 - E5 - C5 D5 - - - E5 - G5 A5 - C6 A5 G5 - E5 - D5 C5 - - -', bass: 'A2 A2 - A2 E2 - E2 E2 D2 D2 - D2 E2 - E2 -', drums: 'k s h s k h s s' });
  GG.audio.addSong('rl_carnaval', { bpm: 146, wave: 'square', lead: 'C6 A5 G5 A5 C6 - D6 C6 A5 G5 E5 G5 A5 - - - C6 A5 G5 A5 C6 D6 E6 D6 C6 A5 G5 E5 D5 C5 - -', bass: 'F2 F2 C3 F2 A#2 A#2 F2 A#2 C3 C3 G2 C3 F2 C3 F2 -', drums: 'k h s h k s s h' });

  GEO.scenes.ritmolivre = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let ri = 0, phase = 'intro', notes = [], songT = 0, busy = false, finished = false, playing = false;
    let bar = 0.5, combo = 0, best = 0, mult = 1, fever = 0, score = 0, hits = { p: 0, g: 0, b: 0, m: 0 }, total = 0, wins = 0;
    let press = [0, 0, 0, 0], botPress = [0, 0, 0, 0], judge = null, pose = { me: -1, bot: -1, meT: 0, botT: 0 }, holding = [null, null, null, 0];
    ctx.actionMax = 150; ctx.learnMax = 100;
    sc.noVignette = false;

    /* ------------------------------------------------ partitura (vez do GeoBot + sua vez) */
    function chart(R) {
      const beat = 60 / R.bpm, out = [], bars = R.bars;
      let t = 2.2;
      for (let turn = 0; turn < 4; turn++) {
        const who = turn % 2 === 0 ? 'bot' : 'me';
        const phrase = [];
        if (who === 'bot') {
          for (let s = 0; s < bars * 4; s++) { // semicolcheias em colcheias
            if (Math.random() < R.dens || s % 4 === 0) {
              const lane = Math.floor(Math.random() * 4), hold = Math.random() < R.holds && s % 2 === 0 ? beat * (1 + Math.floor(Math.random() * 2)) : 0;
              phrase.push({ s, lane, hold, gold: Math.random() < 0.08, chord: R.chords && Math.random() < R.chords ? (lane + 2) % 4 : -1 });
            }
          }
          sc._last = phrase;
        }
        const src = who === 'bot' ? phrase : sc._last.map((n) => Object.assign({}, n, { lane: Math.random() < 0.25 ? (n.lane + 1) % 4 : n.lane })); // resposta parecida, com variações
        src.forEach((n) => {
          const nt = t + n.s * beat / 2;
          out.push({ who, t: nt, lane: n.lane, hold: n.hold, gold: n.gold, judged: false, held: 0 });
          if (n.chord >= 0 && who === 'me') out.push({ who, t: nt, lane: n.chord, hold: 0, gold: false, judged: false, held: 0 });
        });
        t += bars * 2 * beat + beat * 2; // pausa curta entre as vezes
      }
      return out.sort((a, b) => a.t - b.t);
    }
    sc.begin = async function () {
      await ctx.say('gaia', ['**Batalha de Ritmo** contra o GeoBot! Ele canta primeiro (setas da esquerda); depois é a **sua vez** (direita).', 'Use **← ↓ ↑ →** (ou **A S W D**) quando a seta encostar no alvo. **Segure** nas notas longas. Faça **combo 25** para ligar o **Modo Carnaval**!']);
      startRound();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function startRound() {
      const R = ROUNDS[ri];
      notes = chart(R); total += notes.filter((n) => n.who === 'me').length;
      songT = -0.2; playing = true; bar = 0.5; phase = 'play';
      GG.audio.music(R.song);
      ctx.setGoal('Rodada ' + (ri + 1) + '/3 — ' + R.name + ': vença a disputa!');
      if (X()) X().banner({ id: 'rl', icon: ['tambor', 'maracas', 'fogos'][ri], title: 'Rodada ' + (ri + 1) + ': ' + R.name, style: R.bpm + ' batidas por minuto' }, 'BATALHA DE RITMO');
    }
    async function endRound() {
      playing = false; GG.audio.stopMusic();
      const won = bar >= 0.5; if (won) wins++;
      GG.audio.sfx(won ? 'win' : 'bad');
      if (won) { E.fx.confetti(E.W / 2, 60, 50); if (X()) X().flash('#fff6c0', 0.35); }
      await run(() => ctx.say(won ? 'gaia' : 'geobot', [won ? 'Você venceu a rodada **' + ROUNDS[ri].name + '**! Combo máximo: ' + best + '.' : 'O GeoBot levou a rodada **' + ROUNDS[ri].name + '**… mas a próxima é sua!']));
      ri++;
      if (ri >= ROUNDS.length) { finish(); return; }
      startRound();
    }
    function finish() {
      finished = true;
      const acc = (hits.p + hits.g * 0.75 + hits.b * 0.4) / Math.max(1, total);
      ctx.learnPts = Math.round(Math.min(1, acc * 0.8 + wins * 0.1) * 100);
      ctx.actionPts = Math.round(score / 40);
      run(async () => {
        const grade = acc > 0.92 ? 'S' : acc > 0.8 ? 'A' : acc > 0.6 ? 'B' : 'C';
        await ctx.say('gaia', ['Fim da batalha! Rodadas vencidas: **' + wins + ' de 3**. Nota: **' + grade + '** (' + Math.round(acc * 100) + '% de acerto). Pontos: **' + score + '**.']);
        await ctx.finish({ geobot: { won: wins >= 2 } });
      });
    }

    /* ------------------------------------------------ julgamento */
    function hit(lane) {
      press[lane] = 0.12; pose.me = lane; pose.meT = 0.25;
      const cand = notes.filter((n) => n.who === 'me' && !n.judged && n.lane === lane && Math.abs(n.t - songT) < 0.22).sort((a, b) => Math.abs(a.t - songT) - Math.abs(b.t - songT))[0];
      if (!cand) return;
      const d = Math.abs(cand.t - songT);
      const r = d < 0.05 ? ['PERFEITO!', '#7bff8f', 1, 'p', 0.045] : d < 0.1 ? ['ÓTIMO!', '#3ec1ff', 0.8, 'g', 0.03] : ['BOM', '#ffd23f', 0.5, 'b', 0.015];
      cand.judged = true; cand.hit = true; hits[r[3]]++; combo++; best = Math.max(best, combo);
      mult = Math.min(4, 1 + Math.floor(combo / 10));
      if (combo === 25 && !fever) { fever = 8; if (X()) { X().flash('#ffd23f', 0.4); } GG.audio.sfx('power'); }
      const pts = Math.round(100 * r[2] * mult * (cand.gold ? 2 : 1) * (fever > 0 ? 2 : 1)); score += pts;
      bar = Math.min(1, bar + r[4] * (cand.gold ? 1.5 : 1));
      judge = { t: r[0], c: r[1], at: sc.t, lane };
      GG.audio.sfx(['drum', 'shaker', 'bell', 'clap'][lane]);
      if (X()) { X().sparkle(PX[lane], RY, COL[lane], cand.gold ? 8 : 4); X().ring(PX[lane], RY, cand.gold ? '#ffd23f' : COL[lane], 22); if (mult > 1 || cand.gold) X().pop(PX[lane], RY + 18, '+' + pts, cand.gold ? '#ffd23f' : '#fff', 7); }
      if (cand.hold) holding[lane] = cand;
    }
    function miss(n) { n.judged = true; hits.m++; combo = 0; mult = 1; bar = Math.max(0, bar - 0.05); judge = { t: 'ERROU', c: '#ff6b6b', at: sc.t, lane: n.lane }; pose.me = -2; pose.meT = 0.3; }
    sc.click = function (x) { if (!playing || busy) return; const lane = PX.findIndex((lx) => Math.abs(x - lx) < 16); if (lane >= 0) hit(lane); };

    sc.update = function (dt) {
      sc.t += dt; press = press.map((v) => Math.max(0, v - dt)); botPress = botPress.map((v) => Math.max(0, v - dt));
      pose.meT -= dt; pose.botT -= dt; if (fever > 0) fever -= dt;
      if (busy || finished || !playing) return;
      ctx.tick(dt); songT += dt;
      const IN = GG.input;
      if (IN.pressed('left')) hit(0); if (IN.pressed('down')) hit(1); if (IN.pressed('up') || IN.pressed('jump')) hit(2); if (IN.pressed('right')) hit(3);
      // notas longas: segurar
      holding.forEach((n, lane) => {
        if (!n) return;
        const down = IN.down(DIRN[lane]) || (lane === 2 && IN.down('jump'));
        if (down && songT < n.t + n.hold) { n.held += dt; score += Math.round(60 * dt * mult); bar = Math.min(1, bar + dt * 0.02); if (X() && Math.random() < 0.3) X().sparkle(PX[lane], RY, COL[lane], 1); }
        else holding[lane] = null;
      });
      // GeoBot canta sozinho as notas dele
      notes.forEach((n) => {
        if (n.judged) return;
        if (n.who === 'bot' && songT >= n.t) { n.judged = true; botPress[n.lane] = 0.15 + n.hold; pose.bot = n.lane; pose.botT = 0.25 + n.hold; GG.audio.note(['C4', 'E4', 'G4', 'C5'][n.lane], 0.12 + n.hold, 'square'); bar = Math.max(0, bar - 0.006); }
        else if (n.who === 'me' && songT - n.t > 0.22) miss(n);
      });
      const last = notes[notes.length - 1];
      if (!last || songT > last.t + last.hold + 1) endRound();
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    /* ------------------------------------------------ desenho */
    function arrowShape(c, x, y, lane, s, fill, stroke) {
      c.save(); c.translate(x, y); c.rotate([Math.PI / 2 * 2, Math.PI / 2, -Math.PI / 2, 0][lane] || 0); const k = s / 12;
      c.beginPath(); c.moveTo(12 * k, 0); c.lineTo(0, -10 * k); c.lineTo(0, -5 * k); c.lineTo(-11 * k, -5 * k); c.lineTo(-11 * k, 5 * k); c.lineTo(0, 5 * k); c.lineTo(0, 10 * k); c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.6; c.stroke(); } c.restore();
    }
    function drawLanes(c, g, xs, who) {
      const x = X(), R = ROUNDS[Math.min(ri, 2)];
      xs.forEach((lx, lane) => {
        const pr = who === 'me' ? press[lane] : botPress[lane];
        if (pr > 0 && x) x.glow(c, lx, RY, 20, COL[lane], 0.8);
        arrowShape(c, lx, RY, lane, who === 'me' ? 12 : 9, pr > 0 ? COL[lane] : 'rgba(20,24,50,.75)', pr > 0 ? '#fff' : 'rgba(255,255,255,.5)');
      });
      notes.forEach((n) => {
        if (n.who !== who) return;
        if (n.judged && !(n.hit && n.hold && holding[n.lane] === n)) return;
        const y = RY + (n.t - songT) * R.speed; if (y > E.H + 20 || (y < RY - 30 && !n.hold)) return;
        const lx = xs[n.lane], s = who === 'me' ? 12 : 9;
        if (n.hold) { const y2 = RY + (n.t + n.hold - songT) * R.speed; c.fillStyle = COL[n.lane] + 'aa'; c.fillRect(lx - s * 0.3, Math.max(RY, y), s * 0.6, Math.max(0, y2 - Math.max(RY, y))); }
        if (n.judged) return;
        if (x) x.glow(c, lx, y, s * 1.4, n.gold || fever > 0 ? '#ffd23f' : COL[n.lane], 0.5);
        arrowShape(c, lx, y, n.lane, s, n.gold ? '#ffd23f' : fever > 0 ? 'hsl(' + ((sc.t * 400 + n.lane * 90) % 360) + ',90%,60%)' : COL[n.lane], '#fff');
      });
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X(), R = ROUNDS[Math.min(ri, 2)];
      const beat = playing ? Math.abs(Math.sin(songT * Math.PI * R.bpm / 60)) : 0;
      // palco com luzes
      const bg = c.createLinearGradient(0, 0, 0, E.H); bg.addColorStop(0, fever > 0 ? '#3a0a4a' : '#1a0c33'); bg.addColorStop(1, fever > 0 ? '#7a1a3a' : '#3a1440'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H);
      if (x) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { const bx = 130 + i * 45, a = Math.sin(sc.t * (1 + i * 0.3) + i) * 0.5; const gr = c.createLinearGradient(bx, 0, bx + Math.sin(a) * 160, 190); gr.addColorStop(0, COL[i] + '55'); gr.addColorStop(1, COL[i] + '00'); c.fillStyle = gr; c.globalAlpha = 0.5 + beat * 0.4; c.beginPath(); c.moveTo(bx - 2, 0); c.lineTo(bx + 2, 0); c.lineTo(bx + Math.sin(a) * 160 + 26, 190); c.lineTo(bx + Math.sin(a) * 160 - 26, 190); c.closePath(); c.fill(); }
        c.restore();
        if (fever > 0 && !E.reduced) { c.save(); c.globalAlpha = 0.25 + 0.15 * beat; c.fillStyle = 'hsl(' + (sc.t * 200 % 360) + ',80%,55%)'; c.fillRect(0, 0, E.W, E.H); c.restore(); if (Math.random() < 0.3) E.fx.confetti(U.rand(40, 360), -5, 3); }
      }
      // chão do palco e alto-falantes
      c.fillStyle = '#2a1a10'; c.fillRect(0, 186, E.W, 39); c.fillStyle = '#5a3a20'; c.fillRect(0, 182, E.W, 5);
      if (x) { [[118, 162], [282, 162]].forEach(([sx, sy]) => x.ilus(c, 'caixa_som', sx, sy + beat * -2, 30 + beat * 4, { shadow: true })); x.ilus(c, 'globo_disco', 200, 50 + Math.sin(sc.t) * 2, 20, { rot: sc.t }); }
      // plateia
      P.crowd().slice(0, 10).forEach((pp, i) => g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 4 + i) % 2 })), 118 + i * 17, 196 - beat * (i % 2 ? 5 : 2)));
      // GeoBot e Gabriel dançando
      const bp = pose.botT > 0 ? pose.bot : -1, mp = pose.meT > 0 ? pose.me : -1;
      const off = (l) => (l === 0 ? [-3, 0] : l === 1 ? [0, 3] : l === 2 ? [0, -5] : l === 3 ? [3, 0] : [0, 0]);
      const ob = off(bp), om = off(mp);
      g.img(P.geobot(bp >= 0 ? 3 : Math.floor(sc.t * 4) % 3), 150 + ob[0], 150 - beat * 3 + ob[1], { scale: 1.6 });
      g.img(C.gabrielSide(ctx.look, mp === -2 ? 'idle' : mp >= 0 ? 'jump' : 'run', sc.t), 222 + om[0], 150 - beat * 3 + om[1], { scale: 1.6, flip: true });
      if (mp === -2) g.text('?', 236, 136, { size: 8, color: '#ff6b6b' });
      // pistas
      g.rect(10, 26, 112, 150, 'rgba(0,0,0,.25)'); g.rect(242, 26, 136, 190, 'rgba(0,0,0,.3)');
      drawLanes(c, g, BX, 'bot'); drawLanes(c, g, PX, 'me');
      g.text('GEOBOT', 64, 14, { size: 6, color: '#9aa7c7', align: 'center' }); g.text('VOCÊ', 310, 14, { size: 6, color: '#ffd23f', align: 'center' });
      // barra de disputa
      g.panel(130, 6, 140, 10, '#15152a', '#15152a'); g.rect(132, 8, 136, 6, '#9aa7c7'); g.rect(132 + 136 * (1 - bar), 8, 136 * bar, 6, '#ffd23f');
      if (x) { x.ilus(c, 'robo', 132 + 136 * (1 - bar) - 7, 11, 14); x.ilus(c, 'estrela', 132 + 136 * (1 - bar) + 7, 11, 12); }
      // placar
      g.text(String(score), E.W - 8, 186, { size: 8, color: '#fff', align: 'right' });
      if (combo > 2) g.text('COMBO ' + combo + (mult > 1 ? '  x' + mult : ''), E.W - 8, 198, { size: 6, color: fever > 0 ? '#ffd23f' : '#9ff2ff', align: 'right' });
      if (fever > 0) g.text('MODO CARNAVAL!', 200, 64, { size: 9, color: 'hsl(' + (sc.t * 300 % 360) + ',90%,65%)', align: 'center' });
      const nxtMe = notes.find((n) => n.who === 'me' && !n.judged), nxtBot = notes.find((n) => n.who === 'bot' && !n.judged);
      if (playing && nxtBot && (!nxtMe || nxtBot.t < nxtMe.t) && nxtBot.t - songT < 1.2) g.text('VEZ DO GEOBOT', 200, 28, { size: 6, color: '#9aa7c7', align: 'center' });
      else if (playing && nxtMe && nxtMe.t - songT < 1.4 && (!nxtBot || nxtMe.t < nxtBot.t)) g.text('SUA VEZ!', 200, 26, { size: 8, color: '#ffd23f', align: 'center' });
      if (judge && sc.t - judge.at < 0.5) { const k = (sc.t - judge.at) / 0.5; c.save(); c.globalAlpha = 1 - k; g.text(judge.t, 310, 64 - k * 8, { size: 8, color: judge.c, align: 'center' }); c.restore(); }
      if (playing && songT < 1.6) g.text(songT < 0.5 ? '3' : songT < 1 ? '2' : '1', 310, 110, { size: 16, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { busy: () => busy, playing: () => playing, autoplay() { notes.forEach((n) => { if (!n.judged) { n.judged = true; if (n.who === 'me') { n.hit = true; hits.p++; score += 100; } } }); bar = 1; songT = 999; }, state: () => ({ ri, bar, combo, score, fever, total, hits, wins }), peek: () => ({ songT, notes }) };
    return sc;
  };
})();
