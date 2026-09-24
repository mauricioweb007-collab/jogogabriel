/* =====================================================================
   scenes/race.js — CORRIDA CONTRA O GEOBOT (Fase 1-4 Caminhos da
   Imigração, Fase 3-1 Do Litoral ao Interior e Sala bônus 1).
   Visão lateral com 3 pistas (↑/↓ troca de pista, pular obstáculos).
   Portais de rota: a corrida PAUSA, Gabriel escolhe a pista com a
   afirmação correta; acerto de primeira = turbo. Erro não encerra a
   corrida: Gaia explica e aparece uma ROTA DE RECUPERAÇÃO (turbo menor).
   Postos da Gaia trazem as questões do livro. GeoBot é um rival
   amistoso, com ritmo justo (não trapaceia). Medalhas por tempo e
   precisão, sem bloquear a campanha.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const ok = (t, fb) => ({ t, ok: true, fb }), no = (t, fb) => ({ t, ok: false, fb });
  const LANES = [118, 152, 186];

  const TRACKS = {
    c1s4: {
      len: 9200, map: false,
      gates: [
        { at: 0.1, prompt: 'Qual grupo foi o principal a vir **voluntariamente** durante grande parte do período colonial?', options: [ok('Portugueses'), no('Japoneses', 'Os japoneses chegaram bem depois, para trabalhar no café, na indústria e no comércio.'), no('Venezuelanos', 'Venezuelanos fazem parte da imigração atual.')] },
        { at: 0.28, prompt: 'Por volta de **1820**, começaram a chegar grupos numerosos de…', options: [ok('chineses, suíços e alemães'), no('venezuelanos e cubanos', 'Esses fazem parte da imigração atual.'), no('nenhum outro país', 'O livro cita chineses, suíços e alemães.')] },
        { at: 0.55, prompt: '**Turcos, sírios e libaneses** atuaram principalmente…', options: [ok('no comércio e na pequena indústria'), no('só na pesca', 'O livro cita comércio e pequena indústria.'), no('em nenhum trabalho', 'Eles atuaram no comércio e na pequena indústria.')] },
        { at: 0.72, prompt: 'No **Sul**, destacaram-se…', options: [ok('alemães e italianos, além de suíços, poloneses, russos e ucranianos'), no('somente japoneses', 'No Sul, o livro destaca alemães e italianos, entre outros europeus.'), no('somente venezuelanos', 'Venezuelanos são da imigração atual.')] },
        { at: 0.88, prompt: 'O trabalho semelhante à escravidão deve ser combatido com…', options: [ok('denúncia e consumo responsável'), no('silêncio', 'O livro diz que deve ser combatido com denúncia e consumo responsável.'), no('promessas falsas e dívidas', 'Promessas falsas e dívidas são justamente parte desse tipo de exploração.')] }
      ],
      posts: [{ at: 0.42, q: 'GEO-C1-Q14', label: 'Posto da Gaia' }, { at: 0.8, card: 'escravidao', label: 'Placa da Gaia' }],
      finishQ: 'GEO-C1-Q15'
    },
    c3s1: {
      len: 9600, map: true,
      gates: [
        { at: 0.12, prompt: 'A colonização ocupou principalmente…', options: [ok('o litoral'), no('o interior, primeiro', 'O interior foi ocupado depois; a colonização começou pelo litoral.'), no('somente o Sul', 'A colonização concentrou-se no litoral.')] },
        { at: 0.36, prompt: 'No **século XX**, o governo estimulou a ocupação de…', options: [ok('Centro-Oeste e Norte'), no('somente o litoral', 'O estímulo foi para o interior: Centro-Oeste e Norte.'), no('nenhuma região', 'O governo estimulou o Centro-Oeste e o Norte.')] },
        { at: 0.62, prompt: 'Máquinas agrícolas e industrialização contribuíram para…', options: [ok('a migração do campo para a cidade'), no('todos se mudarem para o campo', 'Foi o contrário: muitos foram para as cidades.'), no('o fim das cidades', 'As cidades cresceram.')] },
        { at: 0.76, prompt: 'Até a década de **1960**, a maior parte das pessoas vivia…', options: [ok('no campo'), no('nas cidades', 'Até 1960, a maioria vivia no campo.'), no('fora do Brasil', 'A maioria vivia no campo.')] },
        { at: 0.9, prompt: 'Segundo o livro, hoje quase ___ da população vive nas cidades.', options: [ok('61%'), no('10%', 'O livro diz quase 61%.'), no('1%', 'O livro diz quase 61%.')] }
      ],
      posts: [{ at: 0.24, q: 'GEO-C3-Q04', label: 'Posto do Litoral' }, { at: 0.5, q: 'GEO-C3-Q05', label: 'Posto do Interior' }, { at: 0.84, q: 'GEO-C3-Q06', label: 'Posto do Sudeste' }],
      finishQ: null
    }
  };

  function bonusTrack() {
    const all = [1, 2, 3].map((ch) => GEO.data.statements[ch]).flat();
    const rng = U.rng(Date.now() & 0xffff);
    const gates = [0.12, 0.3, 0.48, 0.66, 0.84].map((at) => {
      const t = U.shuffle(all.filter((s) => s.v))[0], f = U.shuffle(all.filter((s) => !s.v)).slice(0, 2);
      return { at, prompt: 'Qual afirmação está **correta**?', options: U.shuffle([ok(t.t)].concat(f.map((x) => no(x.t, x.fb)))) };
    });
    void rng;
    return { len: 8000, map: false, gates, posts: [], finishQ: null };
  }

  GEO.scenes.race = function (ctx) {
    const def = ctx.def, TR = def.bonus ? bonusTrack() : TRACKS[def.id];
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const V0 = 150;
    const p = { x: 40, lane: 1, y: LANES[1], jy: 0, jv: 0, boost: 0, slow: 0, stumble: 0, inv: 0 };
    const bot = { x: 40, lane: 0, y: LANES[0], jy: 0, jv: 0 };
    const gates = TR.gates.map((g) => Object.assign({ x: g.at * TR.len, done: false }, g));
    const posts = TR.posts.map((q) => Object.assign({ x: q.at * TR.len, done: false }, q));
    const obst = [], pads = [], items = [];
    const rng = U.rng(def.id === 'c1s4' ? 5 : 9);
    for (let x = 500; x < TR.len - 300; x += 260 + Math.floor(rng() * 200)) {
      if (gates.some((g) => Math.abs(g.x - x) < 260) || posts.some((q) => Math.abs(q.x - x) < 220)) continue;
      obst.push({ x, lane: Math.floor(rng() * 3), hit: false });
      if (rng() < 0.5) items.push({ x: x + 120, lane: Math.floor(rng() * 3), k: rng() < 0.35 ? 'frag' : 'coin', got: false });
    }
    ctx.fragTotal = items.filter((i) => i.k === 'frag').length;
    ctx.actionMax = ctx.fragTotal * 10 + items.filter((i) => i.k === 'coin').length + 90;
    ctx.learnMax += gates.length * 25;
    let busy = false, finished = false, started = false, countdown = 2.5, correct = 0;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.x) { p.x = ctx.resume.data.x; bot.x = ctx.resume.data.bx || p.x; gates.forEach((g) => { if (g.x < p.x) g.done = true; }); posts.forEach((q) => { if (q.x < p.x) q.done = true; }); }
    sc.begin = async function () {
      if (!ctx.resume) ctx.checkpoint({ x: p.x, bx: bot.x });
      if (def.geobot && !ctx.resume) await ctx.say('geobot', def.geobot.start);
      ctx.setGoal('↑/↓ trocam de pista • Espaço pula obstáculos • Portais certos dão turbo!');
      started = true;
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function speedOf(e) { return V0 * ctx.speed * (e.boost > 0 ? 1.6 : 1) * (e.slow > 0 ? 0.6 : 1) * (e.stumble > 0 ? 0.35 : 1); }
    async function gate(gt) {
      let firstOk = null;
      const res = await GG.quiz.quick({ prompt: gt.prompt, type: 'mc', keepOrder: true, options: gt.options, recap: 'Leia de novo: qual pista leva à afirmação correta?', hint2: 'Pense no que a Gaia explicou neste capítulo.' }, {
        title: 'Portal de rota', subject: 'Geografia', chips: ['Corrida'], doneLabel: 'Correr! ▶', onEvent: (k, v) => { if (k === 'attempt' && firstOk === null) firstOk = v.ok; }
      });
      void res;
      const lane = gt.options.findIndex((o) => o.ok);
      p.lane = Math.min(2, lane); GEO.campaign.recordCheck(!!firstOk, 'Portais de rota — ' + def.title);
      ctx.learnPts += firstOk ? 25 : 10;
      if (firstOk) { correct++; p.boost = 3; GG.audio.sfx('boost'); E.fx.float(p.x, p.y - 30, 'TURBO!', '#ffd23f'); GEO.eco.award(25, 2, 'Portal de rota', GEO.eco.replayFactor(def.id)); }
      else { p.slow = 1.2; pads.push({ x: p.x + 700, lane: (p.lane + 1) % 3, used: false }); ctx.hud(); await ctx.say('gaia', ['Sem problema! Criei uma **rota de recuperação**: passe pela seta brilhante para ganhar velocidade.']); }
      ctx.hud();
    }

    sc.update = function (dt) {
      sc.t += dt;
      if (busy || finished) return;
      if (!started) return;
      if (countdown > 0) { countdown -= dt; if (countdown <= 0) GG.audio.sfx('boost'); return; }
      ctx.tick(dt);
      const IN = GG.input;
      if (IN.pressed('up')) p.lane = Math.max(0, p.lane - 1);
      if (IN.pressed('down')) p.lane = Math.min(2, p.lane + 1);
      if (IN.pressed('jump') && p.jy === 0) { p.jv = -260; GG.audio.sfx('jump'); }
      p.jv += 900 * dt; p.jy = Math.min(0, p.jy + p.jv * dt); if (p.jy === 0) p.jv = 0;
      p.y += (LANES[p.lane] - p.y) * Math.min(1, dt * 12);
      ['boost', 'slow', 'stumble', 'inv'].forEach((k) => { if (p[k] > 0) p[k] -= dt; });
      p.x += speedOf(p) * dt;
      // GeoBot: ritmo justo com leve equilíbrio (sem trapacear)
      const gap = bot.x - p.x;
      const bs = V0 * (gap > 450 ? 0.9 : gap < -450 ? 1.12 : 1.06);
      bot.x += bs * dt; bot.y += (LANES[bot.lane] - bot.y) * Math.min(1, dt * 8);
      if (Math.floor(sc.t * 0.5) % 3 === 0 && rng() < 0.01) bot.lane = Math.floor(rng() * 3);
      // obstáculos, itens, rotas de recuperação
      obst.forEach((o) => { if (!o.hit && o.lane === p.lane && Math.abs(o.x - (p.x + 6)) < 10 && p.jy > -10) { o.hit = true; p.stumble = 0.8; GG.audio.sfx('hit'); E.shake(2, 0.15); } });
      items.forEach((it) => { if (!it.got && (it.lane === p.lane || ctx.magnet) && Math.abs(it.x - p.x) < 14) { it.got = true; if (it.k === 'frag') ctx.fragment(it.x, LANES[it.lane] - 20); else ctx.coin(it.x, LANES[it.lane] - 20); } });
      pads.forEach((pd) => { if (!pd.used && pd.lane === p.lane && Math.abs(pd.x - p.x) < 16) { pd.used = true; p.boost = 2; p.slow = 0; GG.audio.sfx('boost'); E.fx.float(p.x, p.y - 30, 'Recuperação!', '#7bff8f'); } });
      if (ctx.trail) C.trail(p.x, p.y - 4);
      // portais e postos (pausam a corrida)
      for (const gt of gates) if (!gt.done && p.x > gt.x - 150) { gt.done = true; run(() => gate(gt)); return; }
      for (const q of posts) if (!q.done && p.x > q.x - 60) {
        q.done = true; ctx.fxX = p.x; ctx.fxY = p.y - 30;
        run(async () => { if (q.card) await ctx.cards(q.card); if (q.q) await ctx.q(q.q); ctx.checkpoint({ x: p.x, bx: bot.x }); });
        return;
      }
      if (p.x >= TR.len) {
        finished = true;
        const won = p.x >= bot.x;
        run(async () => {
          ctx.addAction(won ? 50 : 20); if (!ctx.damage) ctx.addAction(20);
          ctx.addAction(Math.max(0, correct * 5));
          GG.audio.sfx(won ? 'win' : 'check');
          if (def.geobot) await ctx.say('geobot', won ? def.geobot.win : def.geobot.lose);
          else await ctx.say('geobot', [won ? 'Você venceu o desafio relâmpago!' : 'Foi por pouco! Tente de novo quando quiser.']);
          if (TR.finishQ) await ctx.q(TR.finishQ);
          await ctx.finish({ geobot: { won } });
        });
        return;
      }
      sc.cam.x = p.x - 90;
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    sc.draw = function (g) {
      const c = g.ctx(), th = def.theme === 'interior' ? 'interior' : 'estrada';
      C.sky(g, th, sc.cam.x * 2, 0, sc.t, { horizon: 100 });
      // pista
      const ty = 96;
      c.fillStyle = th === 'interior' ? '#c98f4d' : '#5aa04a'; c.fillRect(0, ty, E.W, E.H - ty);
      LANES.forEach((ly, i) => { c.fillStyle = i % 2 ? '#8a6a44' : '#9b7a50'; c.fillRect(0, ly - 12, E.W, 26); c.fillStyle = 'rgba(255,255,255,.5)'; for (let x = -((sc.cam.x) % 40); x < E.W; x += 40) c.fillRect(x, ly + 13, 18, 2); });
      g.world({ x: sc.cam.x, y: 0 });
      // árvores e casas ao fundo
      for (let x = Math.floor(sc.cam.x / 90) * 90; x < sc.cam.x + E.W + 90; x += 90) g.spr('town', ((x / 90) % 3 === 0) ? 16 : 4, x, 84);
      pads.forEach((pd) => { if (!pd.used) { g.rect(pd.x - 10, LANES[pd.lane] - 4, 22, 10, '#7bff8f'); g.text('»', pd.x + 1, LANES[pd.lane] - 3, { size: 8, color: '#0a3a1a', align: 'center', shadow: false }); } });
      obst.forEach((o) => { if (o.x > sc.cam.x - 30 && o.x < sc.cam.x + E.W + 30) g.spr('plat', o.hit ? 29 : 26, o.x - 9, LANES[o.lane] - 16); });
      items.forEach((it) => { if (!it.got) { if (it.k === 'frag') g.img(P.fragmento(Math.floor(sc.t * 4) % 2), it.x - 6, LANES[it.lane] - 24); else g.spr('plat', 151, it.x - 9, LANES[it.lane] - 28); } });
      gates.forEach((gt) => {
        if (gt.x < sc.cam.x - 40 || gt.x > sc.cam.x + E.W + 40) return;
        gt.options.forEach((o, i) => { const ly = LANES[i]; g.rect(gt.x - 2, ly - 34, 4, 34, '#6d4c8f'); g.rect(gt.x - 14, ly - 38, 28, 10, gt.done ? (o.ok ? '#3ddc84' : '#6b6b7a') : '#ffd23f'); g.text(String.fromCharCode(65 + i), gt.x, ly - 36, { size: 7, color: '#2a2233', align: 'center', shadow: false }); });
        C.sign(g, gt.x, 58, 'PORTAL DE ROTA');
      });
      posts.forEach((q) => { if (q.x > sc.cam.x - 40 && q.x < sc.cam.x + E.W + 40) { g.img(P.totem(q.done), q.x - 8, LANES[0] - 40); C.sign(g, q.x, 58, q.label); } });
      // chegada
      if (TR.len < sc.cam.x + E.W + 20) { for (let i = 0; i < 12; i++) g.rect(TR.len - 4 + (i % 2) * 4, 100 + i * 9, 4, 9, i % 2 ? '#111' : '#fff'); C.sign(g, TR.len, 58, 'CHEGADA'); }
      // corredores (ordem por pista)
      const drawBot = () => { g.img(P.geobot(Math.floor(sc.t * 10) % 2 ? 1 : 2), bot.x - 9, bot.y - 24 + bot.jy); g.text('GeoBot', bot.x, bot.y - 34, { size: 5, color: '#fff', align: 'center' }); };
      const drawMe = () => { if (!(p.stumble > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielSide(ctx.look, p.jy < 0 ? 'jump' : 'run', sc.t), p.x - 9, p.y - 24 + p.jy); if (p.boost > 0) for (let i = 1; i < 4; i++) g.img(C.gabrielSide(ctx.look, 'run', sc.t), p.x - 9 - i * 10, p.y - 24 + p.jy, { alpha: 0.25 / i }); if (ctx.pet) g.img(P.geobot(0), p.x - 24, p.y - 34 + Math.sin(sc.t * 5) * 2, { scale: 0.5 }); };
      if (bot.y < p.y) { drawBot(); drawMe(); } else { drawMe(); drawBot(); }
      g.end();
      // barra de corrida
      g.panel(8, 6, 180, 20, 'rgba(15,18,38,.85)', '#3a4290');
      g.rect(14, 16, 168, 4, '#0a0c1c');
      g.rect(14 + 168 * Math.min(1, bot.x / TR.len) - 2, 11, 4, 12, '#9aa7c7'); g.rect(14 + 168 * Math.min(1, p.x / TR.len) - 2, 11, 4, 12, '#ffd23f');
      g.text('Você', 14, 7, { size: 5, color: '#ffd23f' }); g.text('GeoBot', 182, 7, { size: 5, color: '#9aa7c7', align: 'right' });
      if (TR.map) {
        const k = Math.min(1, p.x / TR.len);
        const coast = ['ce', 'rn', 'pb', 'pe', 'al', 'se', 'ba', 'es', 'rj', 'sp', 'pr', 'sc', 'rs'], mid = ['mg', 'go', 'df', 'ms', 'ma', 'pi'], far = ['mt', 'to', 'pa', 'ro', 'am', 'ac', 'rr', 'ap'];
        g.panel(E.W - 96, 28, 90, 94, 'rgba(255,248,230,.95)', '#15152a');
        GG.maps.drawCanvas(g.ctx(), E.W - 94, 30, 86, (s) => (coast.includes(s.id) || (k > 0.35 && mid.includes(s.id)) || (k > 0.7 && far.includes(s.id)) ? '#e8744f' : '#f3e6c4'), 'rgba(0,0,0,.2)');
        g.text('ocupação', E.W - 51, 114, { size: 5, color: '#2a2233', align: 'center', shadow: false });
      }
      if (countdown > 0 && started) g.text(countdown > 1.6 ? 'PRONTOS?' : countdown > 0.8 ? 'ATENÇÃO…' : 'JÁ!', E.W / 2, 80, { size: 16, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { p, bot, busy: () => busy, skip(x) { p.x = x; } };
    return sc;
  };
})();
