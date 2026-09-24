/* =====================================================================
   scenes/kitchen.js — COZINHA DOS POVOS (Fase 2-4): quebra-cabeça de
   sílabas em ação. Sílabas caem devagar; Gabriel move a panela (←/→)
   e pega as sílabas NA ORDEM para montar ACARAJÉ, TAPIOCA e SARAPATEL
   (atividades GEO-C2-Q12/13/14). Depois, a pergunta de origem abre
   (a ação para). Por fim, a classificação dos seis pratos (Q15).
   Sílaba errada só volta para cima — sem perder energia.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const WORDS = [
    { q: 'GEO-C2-Q12', pieces: ['A', 'CA', 'RA', 'JÉ'], extra: ['TA', 'PO', 'LI'], pot: 'Panela Africana', color: '#f39c12' },
    { q: 'GEO-C2-Q13', pieces: ['TA', 'PI', 'O', 'CA'], extra: ['RA', 'JÉ', 'BU'], pot: 'Panela Indígena', color: '#2ecc71' },
    { q: 'GEO-C2-Q14', pieces: ['SA', 'RA', 'PA', 'TEL'], extra: ['CA', 'PI', 'DA'], pot: 'Panela Portuguesa', color: '#3ec1ff' }
  ];

  GEO.scenes.kitchen = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const pot = { x: 190, w: 40 };
    let wi = 0, built = [], drops = [], spawnT = 0, busy = false, finished = false, playing = false, wrongs = 0, streak = 0;
    ctx.actionMax = 100;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.wi != null) wi = ctx.resume.data.wi;
    sc.begin = async function () {
      if (!ctx.resume) { ctx.checkpoint({ wi: 0 }); await run(() => ctx.cards('quadro')); }
      startWord();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function startWord() {
      if (wi >= WORDS.length) { classify(); return; }
      built = []; drops = []; spawnT = 0.3; playing = true; wrongs = 0;
      ctx.setGoal('Pegue as sílabas na ordem: ' + WORDS[wi].pieces.map(() => '_').join(' + '));
    }
    function wordDone() {
      playing = false;
      const W = WORDS[wi];
      GG.audio.sfx('win'); E.fx.confetti(pot.x + 20, 170, 40);
      ctx.addAction(Math.max(5, 20 - wrongs * 3));
      run(async () => {
        ctx.fxX = pot.x; ctx.fxY = 150;
        await ctx.q(W.q, { chips: ['Cozinha dos Povos'] , patch: { prebuilt: true } });
        wi++; ctx.checkpoint({ wi });
      }).then(startWord);
    }
    function classify() {
      finished = true;
      run(async () => {
        await ctx.say('gaia', ['Os três pratos estão prontos! Agora organize o **quadro completo** da culinária.']);
        await ctx.q('GEO-C2-Q15');
        if (!ctx.damage) ctx.addAction(20);
        await ctx.finish();
      });
    }
    function nextNeeded() { return WORDS[wi].pieces[built.length]; }
    sc.update = function (dt) {
      sc.t += dt;
      if (busy || finished || !playing) return;
      ctx.tick(dt);
      const IN = GG.input;
      pot.x = U.clamp(pot.x + IN.axisX() * 150 * ctx.speed * dt, 10, E.W - 60);
      spawnT -= dt;
      const W = WORDS[wi];
      if (spawnT <= 0) {
        spawnT = 0.9;
        const need = nextNeeded();
        const hasNeed = drops.some((d) => d.s === need);
        const s = !hasNeed && Math.random() < 0.7 ? need : U.pick(W.pieces.concat(W.extra));
        drops.push({ s, x: 20 + Math.random() * (E.W - 80), y: -12, vy: 34 + Math.random() * 12, spin: Math.random() * 6 });
      }
      drops.forEach((d) => { d.y += d.vy * dt; });
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.y > 168 && d.y < 190 && d.x + 16 > pot.x && d.x < pot.x + pot.w + 8) {
          drops.splice(i, 1);
          if (d.s === nextNeeded()) {
            built.push(d.s); streak++; GG.audio.sfx('coin'); E.fx.burst(pot.x + 20, 172, W.color, 10, 80);
            ctx.setGoal('Montando: ' + built.join(' + ') + (built.length < W.pieces.length ? ' + _' : ''));
            if (built.length === W.pieces.length) { wordDone(); return; }
          } else {
            wrongs++; streak = 0; GG.audio.sfx('bad'); E.fx.float(pot.x + 20, 160, 'Ainda não!', '#ff8f8f');
            if (wrongs === 3) run(() => ctx.say('gaia', ['Dica: leia a palavra em voz alta. Depois de **' + (built.length ? built.join('') : 'nada') + '**, vem **' + nextNeeded() + '**.']));
          }
        } else if (d.y > E.H + 10) drops.splice(i, 1);
      }
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };
    sc.draw = function (g) {
      const c = g.ctx(), W = WORDS[Math.min(wi, WORDS.length - 1)];
      const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#ffd8a8'); gr.addColorStop(1, '#f6a96b'); c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
      // cozinha: azulejos e fogão
      for (let y = 30; y < 150; y += 16) for (let x = (y / 16 % 2) * 8; x < E.W; x += 16) { c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x, y, 14, 14); }
      const X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      if (X) {
        // janela com o céu da tarde, prateleiras com ingredientes e luz quente
        c.fillStyle = '#5a3418'; c.fillRect(8, 74, 70, 54); const wg = c.createLinearGradient(0, 78, 0, 124); wg.addColorStop(0, '#6fc3ff'); wg.addColorStop(1, '#ffe2a8'); c.fillStyle = wg; c.fillRect(12, 78, 62, 46);
        X.glow(c, 58, 92, 22, '#fff0b0', 0.8); c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(58, 92, 6, 0, Math.PI * 2); c.fill();
        X.hd(c, () => { const pm = X.img.treePalm; if (pm) c.drawImage(pm, 14, 92, 24, 32); });
        c.fillStyle = '#5a3418'; c.fillRect(42, 78, 2, 46); c.fillRect(12, 100, 62, 2);
        [[300, 80], [300, 118]].forEach(([sx, sy]) => { c.fillStyle = '#7a4b1f'; c.fillRect(sx, sy + 12, 92, 4); c.fillStyle = '#4a2a10'; c.fillRect(sx, sy + 16, 92, 2); });
        ['coco', 'milho', 'pimenta', 'cebola', 'alho', 'banana', 'feijao', 'abacaxi', 'peixe', 'mandioca', 'queijo', 'pao'].filter((n) => X.has(n)).slice(0, 10).forEach((n, i) => X.ilus(c, n, 310 + (i % 5) * 18, (i < 5 ? 84 : 122) + Math.sin(sc.t * 2 + i) * 0.6, 15));
        X.rays(c, 58, 92, 120, '#fff0c0', sc.t, 6);
      }
      c.fillStyle = '#6b3f22'; c.fillRect(0, 196, E.W, 29); c.fillStyle = '#8b5a2b'; c.fillRect(0, 192, E.W, 6);
      if (X) { for (let x = 0; x < E.W; x += 22) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x, 198, 1, 27); } }
      // três panelas de origem ao fundo
      [['Portuguesa', '#3ec1ff'], ['Africana', '#f39c12'], ['Indígena', '#2ecc71']].forEach((o, i) => {
        if (X) { X.glow(c, 70 + i * 120, 58, 26, o[1], 0.35); X.ilus(c, 'panela', 70 + i * 120, 58, 34, { shadow: true }); g.panel(40 + i * 120, 74, 60, 11, 'rgba(20,12,4,.8)', o[1]); g.text(o[0], 70 + i * 120, 77, { size: 5, color: '#fff', align: 'center' }); return; }
        g.rect(40 + i * 120, 40, 60, 26, '#3a2410'); g.rect(44 + i * 120, 36, 52, 6, o[1]); g.text(o[0], 70 + i * 120, 52, { size: 5, color: '#fff', align: 'center' });
      });
      // sílabas caindo (plaquinhas de madeira com sombra)
      drops.forEach((d) => { if (X) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(d.x + 3, d.y + 4, 24, 16); } g.panel(d.x, d.y, 24, 16, '#7a4b1f', '#3b220b'); if (X) g.rect(d.x, d.y, 24, 3, '#9a6630'); g.text(d.s, d.x + 12, d.y + 4, { size: 7, color: '#fff5dc', align: 'center', shadow: false }); });
      // panela do jogador
      g.rect(pot.x - 2, 180, pot.w + 12, 14, '#2a2a33'); g.rect(pot.x, 176, pot.w + 8, 6, W.color); g.rect(pot.x - 6, 182, 6, 4, '#2a2a33'); g.rect(pot.x + pot.w + 8, 182, 6, 4, '#2a2a33');
      if (X) X.glow(c, pot.x + pot.w / 2 + 4, 194, 20, '#ff8a2a', 0.5 + 0.2 * Math.sin(sc.t * 12));
      if (!E.reduced) for (let i = 0; i < 3; i++) { const k = ((sc.t * 0.8 + i / 3) % 1), im = X && X.img['puff' + Math.floor(k * 7)]; if (im) { c.save(); c.globalAlpha = 0.5 * (1 - k); X.hd(c, () => c.drawImage(im, pot.x + 4 + i * 12 - 6, 168 - k * 26, 12 + k * 8, 12 + k * 8)); c.restore(); } else g.circle(pot.x + 10 + i * 12, 170 - ((sc.t * 20 + i * 10) % 20), 3, 'rgba(255,255,255,.5)'); }
      g.img(C.gabrielSide(ctx.look, 'idle', sc.t), pot.x + 14, 158, { scale: 0.8 });
      // palavra sendo montada
      g.panel(110, 8, 180, 22, '#1d2247', '#0a0c1c');
      g.text(finished ? 'Quadro da culinária' : W.pieces.map((s, i) => (i < built.length ? s : '_')).join(' + '), 200, 15, { size: 8, color: '#ffd23f', align: 'center' });
      g.text(W.pot, 200, 34, { size: 5, color: '#2a2233', align: 'center', shadow: false });
    };
    sc.dbg = { busy: () => busy, playing: () => playing, complete() { if (!playing) return; built = WORDS[wi].pieces.slice(); wordDone(); } };
    return sc;
  };
})();
