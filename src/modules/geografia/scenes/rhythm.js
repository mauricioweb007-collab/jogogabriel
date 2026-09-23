/* =====================================================================
   scenes/rhythm.js — JOGO DE RITMO (Fase 2-3 Ritmos do Brasil e Sala
   bônus 2). Três músicas curtas e ORIGINAIS com instrumentos citados no
   material: Festa do Divino (tambores e sinos; origem portuguesa),
   Samba de roda (palmas, pandeiro/chocalho, berimbau; influência
   africana) e Toré (chocalhos e tambor; comunidades indígenas).
   Antes de cada música, cartão curto da Gaia; depois, checagem de
   origem. Ao final, a atividade do livro (GEO-C2-Q04).
   Pistas: ← ↓ → (ou tocar na pista).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const ok = (t, fb) => ({ t, ok: true, fb }), no = (t, fb) => ({ t, ok: false, fb });
  const LX = [262, 300, 338], HIT = 188, SPEED = 120;
  const SONGS = [
    { id: 'divino', card: 'divino', name: 'Festa do Divino', bpm: 96, beats: 44, pat: [[0, 'drum'], [2, 'bell'], [4, 'drum'], [5, 'drum'], [6, 'bell']], len: 8, color: '#e5484d', deco: 'bandeiras',
      check: { prompt: 'A **Festa do Divino** tem origem…', options: [ok('portuguesa'), no('africana', 'O samba de roda é que tem forte influência africana.'), no('indígena', 'O toré é que é das comunidades indígenas.')] } },
    { id: 'samba', card: 'samba', name: 'Samba de roda', bpm: 112, beats: 52, pat: [[0, 'drum'], [1, 'clap'], [2, 'shaker'], [3, 'clap'], [4, 'drum'], [5, 'string'], [6, 'clap'], [7, 'shaker']], len: 8, color: '#f39c12', deco: 'roda',
      check: { prompt: 'O **samba de roda** surgiu na Bahia com forte influência…', options: [ok('africana'), no('portuguesa', 'A Festa do Divino é que tem origem portuguesa.'), no('japonesa', 'O livro fala em forte influência africana.')] } },
    { id: 'tore', card: 'tore', name: 'Toré', bpm: 88, beats: 40, pat: [[0, 'drum'], [1, 'shaker'], [2, 'shaker'], [3, 'shaker'], [4, 'drum'], [6, 'shaker']], len: 8, color: '#2ecc71', deco: 'chocalhos',
      check: { prompt: 'O **toré** é uma manifestação cultural de…', options: [ok('comunidades indígenas'), no('origem portuguesa', 'A Festa do Divino é portuguesa.'), no('imigrantes europeus', 'O toré é das comunidades indígenas.')] } }
  ];
  const LANE_OF = { drum: 1, bell: 0, clap: 0, shaker: 2, string: 1 };

  GEO.scenes.rhythm = function (ctx) {
    const def = ctx.def, bonus = !!def.bonus;
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let si = 0, notes = [], songT = 0, playing = false, busy = false, finished = false, hits = { p: 0, g: 0, m: 0 }, combo = 0, press = [0, 0, 0], lastJudge = null;
    ctx.actionMax = 150;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.si != null) si = ctx.resume.data.si;
    function buildChart(S) {
      const spb = 60 / S.bpm / 2, out = [];
      for (let b = 0; b < S.beats; b++) S.pat.forEach(([o, ins]) => { const step = b * S.len + o; if (step % 2 === 0 || S.id === 'samba') { const t = 2 + (b * S.len + o) * spb; if (t < 2 + S.beats * spb * 2) out.push({ t, lane: LANE_OF[ins], ins, hit: false, judged: false }); } });
      return out.filter((n, i) => i % (S.id === 'samba' ? 3 : 2) === 0).slice(0, 40);
    }
    sc.begin = async function () { if (!ctx.resume) ctx.checkpoint({ si: 0 }); await next(); };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    async function next() {
      if (si >= SONGS.length) {
        finished = true;
        await run(async () => {
          if (!bonus) await ctx.q('GEO-C2-Q04');
          if (!ctx.damage) ctx.addAction(20);
          await ctx.finish();
        });
        return;
      }
      const S = SONGS[si];
      await run(async () => { if (!bonus) await ctx.cards(S.card); await ctx.say('gaia', ['Música: **' + S.name + '**. Aperte **←**, **↓** ou **→** quando a nota chegar na linha. Toque na pista também vale!']); });
      notes = buildChart(S); songT = 0; playing = true; hits = { p: 0, g: 0, m: 0 }; combo = 0;
      ctx.setGoal('Tocando: ' + S.name + ' (' + notes.length + ' notas)');
    }
    async function songEnd() {
      playing = false;
      const S = SONGS[si];
      const acc = (hits.p + hits.g * 0.6) / Math.max(1, notes.length);
      ctx.addAction(Math.round(acc * 40));
      GG.audio.sfx('win');
      await run(async () => {
        await ctx.say('gaia', ['Fim de **' + S.name + '**! Perfeitas: ' + hits.p + ', boas: ' + hits.g + ', perdidas: ' + hits.m + '.']);
        if (!bonus) {
          const r = await GG.quiz.quick({ prompt: S.check.prompt, type: 'mc', options: S.check.options }, { title: 'Origem do ritmo', subject: 'Geografia', chips: [S.name], doneLabel: 'Próximo ritmo ▶' });
          const okk = r.attempts === 1; GEO.campaign.recordCheck(okk, 'Festas e ritmos'); ctx.learnPts += okk ? 25 : 10; ctx.learnMax += 25; ctx.hud();
        }
      });
      si++; ctx.checkpoint({ si });
      await next();
    }
    function judge(lane) {
      press[lane] = 0.12;
      const n = notes.filter((x) => !x.judged && x.lane === lane).sort((a, b) => Math.abs(a.t - songT) - Math.abs(b.t - songT))[0];
      if (!n) return;
      const d = Math.abs(n.t - songT);
      if (d < 0.1) { n.judged = n.hit = true; hits.p++; combo++; lastJudge = { t: 'PERFEITO!', c: '#7bff8f', at: sc.t }; GG.audio.sfx(n.ins); E.fx.burst(LX[lane], HIT, SONGS[si].color, 8, 80); }
      else if (d < 0.2) { n.judged = n.hit = true; hits.g++; combo++; lastJudge = { t: 'BOM', c: '#ffd23f', at: sc.t }; GG.audio.sfx(n.ins); }
    }
    sc.click = function (x) { if (!playing || busy) return; const lane = LX.findIndex((lx) => Math.abs(x - lx) < 20); if (lane >= 0) judge(lane); };
    sc.update = function (dt) {
      sc.t += dt; press = press.map((v) => Math.max(0, v - dt));
      if (busy || finished || !playing) return;
      ctx.tick(dt);
      songT += dt;
      const IN = GG.input;
      if (IN.pressed('left')) judge(0); if (IN.pressed('down') || IN.pressed('up') || IN.pressed('jump')) judge(1); if (IN.pressed('right')) judge(2);
      // batida guia suave
      const S = SONGS[si], spb = 60 / S.bpm;
      if (Math.floor(songT / spb) !== Math.floor((songT - dt) / spb) && songT < 2) GG.audio.sfx('click');
      notes.forEach((n) => { if (!n.judged && songT - n.t > 0.25) { n.judged = true; hits.m++; combo = 0; lastJudge = { t: 'ERROU', c: '#ff8f8f', at: sc.t }; } });
      if (notes.every((n) => n.judged) && songT > notes[notes.length - 1].t + 0.6) songEnd();
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };
    sc.draw = function (g) {
      const S = SONGS[Math.min(si, SONGS.length - 1)], c = g.ctx();
      const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#2a1640'); gr.addColorStop(1, '#5a2a3a'); c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
      // palco
      c.fillStyle = '#6b3f22'; c.fillRect(0, 170, 240, 55); c.fillStyle = '#8b5a2b'; c.fillRect(0, 166, 240, 6);
      if (S.deco === 'bandeiras') for (let i = 0; i < 6; i++) { g.rect(20 + i * 36, 60, 2, 50, '#6b4f2a'); g.rect(22 + i * 36, 60, 18, 12, i % 2 ? '#e5484d' : '#fff'); }
      if (S.deco === 'roda') { c.strokeStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(120, 150, 90, 18, 0, 0, Math.PI * 2); c.stroke(); g.line(30, 160, 44, 110, '#3b220b', 2); g.circle(33, 152, 5, '#c98b45'); }
      if (S.deco === 'chocalhos') for (let i = 0; i < 5; i++) { g.circle(40 + i * 40, 100 + Math.sin(sc.t * 6 + i) * 3, 6, '#c98b45'); g.rect(39 + i * 40, 106, 2, 12, '#6b4f2a'); }
      const beat = playing ? Math.abs(Math.sin(songT * Math.PI * S.bpm / 60)) : 0;
      P.crowd().slice(0, 8).forEach((pp, i) => g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 4 + i) % 2 })), 12 + i * 27, 140 - beat * (i % 2 ? 6 : 3)));
      g.img(C.gabrielSide(ctx.look, playing && beat > 0.6 ? 'jump' : 'idle', sc.t), 200, 138 - beat * 4);
      g.text(S.name.toUpperCase(), 120, 20, { size: 9, color: S.color, align: 'center' });
      g.text('Música ' + (Math.min(si, 2) + 1) + '/3', 120, 34, { size: 6, color: '#fff', align: 'center' });
      // pistas
      g.rect(240, 0, 120, E.H, 'rgba(0,0,0,.35)');
      LX.forEach((lx, i) => { g.rect(lx - 16, 0, 32, E.H, i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.08)'); });
      g.rect(240, HIT - 2, 120, 4, '#ffffff');
      LX.forEach((lx, i) => { g.circle(lx, HIT, 14, press[i] > 0 ? S.color : 'rgba(255,255,255,.25)', press[i] > 0 ? 0 : 2); g.text(['←', '↓', '→'][i], lx, HIT + 18, { size: 8, color: '#fff', align: 'center' }); });
      notes.forEach((n) => { if (n.judged) return; const y = HIT - (n.t - songT) * SPEED; if (y < -20 || y > E.H) return; g.circle(LX[n.lane], y, 11, S.color); g.circle(LX[n.lane], y, 6, '#fff'); g.text({ drum: 'T', bell: 'S', clap: 'P', shaker: 'C', string: 'B' }[n.ins], LX[n.lane], y - 4, { size: 6, color: '#2a2233', align: 'center', shadow: false }); });
      if (lastJudge && sc.t - lastJudge.at < 0.6) g.text(lastJudge.t, 300, 110, { size: 9, color: lastJudge.c, align: 'center' });
      if (combo > 2) g.text('combo ' + combo, 300, 126, { size: 6, color: '#fff', align: 'center' });
      g.text('T tambor  S sino  P palmas', 300, 4, { size: 4, color: '#ccc', align: 'center' }); g.text('C chocalho  B berimbau', 300, 12, { size: 4, color: '#ccc', align: 'center' });
    };
    sc.dbg = { busy: () => busy, playing: () => playing, autoplay() { notes.forEach((n) => { n.judged = n.hit = true; hits.p++; }); songT = 999; } };
    return sc;
  };
})();
