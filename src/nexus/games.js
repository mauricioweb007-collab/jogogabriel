/* =====================================================================
   src/nexus/games.js — JOGOS RECREATIVOS DO NEXUS (sem conteúdo escolar).
   Corrida Nexótica (corrida lateral), Chuva de Estrelas (pegar itens),
   Pula-Gelatina (plataforma vertical) e Rali das Montanhas (corrida
   contra o computador). É AQUI que os poderes da equipe funcionam:
     combo_window, shield, speed_boost, magnet, extra_jump, bounce_boost,
     ghost_run, slow_obstacles, round_delay, race_accel, combo_bar.
   Resultado: pontuação 0–100 (recorde, Medalhas de Fliperama). Nunca
   gera pontos de estudo nem moedas.
   Controles: teclado (setas/WASD, Espaço), mouse/toque (tocar, arrastar,
   botões grandes na tela). Esc/P pausa.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui;
  const G = (NX.games = {});
  const W = 960, H = 540;
  const gabImg = new Image(); gabImg.src = 'assets/gabriel.png';
  const imgCache = {};
  const img = (src) => { if (!imgCache[src]) { const i = new Image(); i.src = src; imgCache[src] = i; } return imgCache[src]; };

  /* ---------------- poderes ---------------- */
  function powers(p) {
    const S = (t, k) => GG.powers.sum(p, t, k) | 0;
    return {
      combo: 2 + S('combo_window', 'seconds'),
      shield: S('shield', 'hits'),
      speed: 1 + S('speed_boost', 'percent') / 100,
      magnet: S('magnet', 'radius'),
      jumps: 1 + S('extra_jump', 'jumps'),
      bounce: 1 + S('bounce_boost', 'percent') / 100,
      ghost: GG.powers.has(p, 'ghost_run'),
      slowPct: S('slow_obstacles', 'percent') / 100, slowSec: S('slow_obstacles', 'seconds'),
      countdown: Math.max(1, 3 - S('round_delay', 'seconds')),
      accel: 1 + S('race_accel', 'percent') / 100,
      bar: GG.powers.has(p, 'combo_bar'),
      team: GG.powers.team(p)
    };
  }

  /* ---------------- definição dos jogos ---------------- */
  G.list = [
    { minigameId: 'nexus_corrida', title: 'Corrida Nexótica', icon: '🏃', genre: 'Corrida lateral', level: 1, pad: 'jump', desc: 'Corra pelas ilhas, pule obstáculos e junte estrelas em combo.', controls: 'Espaço/↑/toque para pular', make: runner },
    { minigameId: 'nexus_estrelas', title: 'Chuva de Estrelas', icon: '🌠', genre: 'Pegar itens', level: 2, pad: 'lr', desc: 'Pegue estrelas e cristais que caem; desvie das nuvens de chuva.', controls: '◀ ▶ / A D / arrastar', make: catcher },
    { minigameId: 'nexus_gelatina', title: 'Pula-Gelatina', icon: '🟣', genre: 'Plataforma vertical', level: 3, pad: 'lrj', desc: 'Quique de plataforma em plataforma até o céu do Nexus.', controls: '◀ ▶ para mover • Espaço: salto extra', make: jelly },
    { minigameId: 'nexus_rali', title: 'Rali das Montanhas', icon: '🏁', genre: 'Corrida contra o computador', level: 4, pad: 'lr', desc: 'Troque de faixa, desvie das pedras e vença três pilotos do computador.', controls: '◀ ▶ / A D / tocar nos lados', make: rally }
  ];
  G.list.forEach((g) => GG.unlocks.registerNative({
    minigameId: g.minigameId, module: 'nexus', title: g.title, description: g.desc, genre: g.genre, controls: g.controls, icon: g.icon, level: g.level,
    entry: { type: 'native' }, unlockText: 'Chegue ao Nível ' + g.level + ' do Nexus.', freePlay: true, parentTest: true, records: true,
    assets: 'Desenho em canvas + Nexóticos da equipe', deps: 'src/nexus/games.js',
    rule: (p) => GG.FR.levelFor(p.careerPoints).level >= g.level
  }));
  G.get = (id) => G.list.find((g) => g.minigameId === id);

  /* ================================================================ EXECUTOR COMUM */
  /** Roda um jogo. Retorna Promise<{score, ghost, stats}> ou null se saiu. */
  G.run = function (id, opts) {
    const def = G.get(id); if (!def) return Promise.resolve(null);
    opts = opts || {};
    const p = NX.p, pw = powers(p);
    const sec = document.getElementById('nxGame'), cv = document.getElementById('nxGameCv'), hud = document.getElementById('nxGameHud'), pad = document.getElementById('nxGamePad');
    sec.classList.remove('hide');
    const ctx = cv.getContext('2d');
    let sc = 1, ox = 0, oy = 0;
    function fit() { const dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; sc = Math.min(innerWidth / W, innerHeight / H); ox = (innerWidth - W * sc) / 2; oy = (innerHeight - H * sc) / 2; ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy); }
    fit(); window.addEventListener('resize', fit);
    const input = { l: false, r: false, jump: false, jumpPressed: false, tx: null };
    const kd = (ev) => { const c = ev.code; if (['ArrowLeft', 'KeyA'].includes(c)) input.l = true; if (['ArrowRight', 'KeyD'].includes(c)) input.r = true; if (['Space', 'ArrowUp', 'KeyW', 'KeyK'].includes(c)) { if (!input.jump) input.jumpPressed = true; input.jump = true; ev.preventDefault(); } if (c === 'Escape' || c === 'KeyP') { ev.preventDefault(); pause(); } };
    const ku = (ev) => { const c = ev.code; if (['ArrowLeft', 'KeyA'].includes(c)) input.l = false; if (['ArrowRight', 'KeyD'].includes(c)) input.r = false; if (['Space', 'ArrowUp', 'KeyW', 'KeyK'].includes(c)) input.jump = false; };
    const toLogic = (ev) => ({ x: (ev.clientX - ox) / sc, y: (ev.clientY - oy) / sc });
    const pd = (ev) => { if (ev.target !== cv) return; const q = toLogic(ev); if (def.pad === 'jump') input.jumpPressed = true; else if (def.pad === 'lrj' && q.y < H * 0.35) input.jumpPressed = true; input.tx = q.x; input.drag = true; };
    const pm = (ev) => { if (input.drag) input.tx = toLogic(ev).x; };
    const pu = () => { input.drag = false; input.tx = null; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); cv.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu);
    // botões grandes na tela
    pad.innerHTML = '';
    const pb = (t, on, off, label) => { const b = U.el('button', { type: 'button', 'aria-label': label }, t); b.addEventListener('pointerdown', (e) => { e.preventDefault(); on(); }); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); return b; };
    const left = U.el('div', { class: 'grp' }), right = U.el('div', { class: 'grp' });
    if (def.pad !== 'jump') { left.appendChild(pb('◀', () => { input.l = true; }, () => { input.l = false; }, 'Esquerda')); left.appendChild(pb('▶', () => { input.r = true; }, () => { input.r = false; }, 'Direita')); }
    if (def.pad === 'jump' || def.pad === 'lrj') right.appendChild(pb('⤒', () => { input.jumpPressed = true; input.jump = true; }, () => { input.jump = false; }, 'Pular'));
    pad.appendChild(left); pad.appendChild(right);
    const rec = (p.arcade.records || {})[id];
    const state = { t: 0, dur: def.minigameId === 'nexus_gelatina' ? 60 : 45, over: false, paused: false, count: pw.countdown, shield: pw.shield, combo: 0, comboT: 0, best: 0, hits: 0, ghostRec: [], ghost: pw.ghost && rec && rec.ghost ? rec.ghost : null, slowT: 0, slowNext: 0.5, celebrate: 0, msg: '', msgT: 0 };
    const game = def.make(state, pw, input, opts);
    // HUD
    function drawHud() {
      const combo = state.comboT > 0 ? state.comboT / pw.combo : 0;
      hud.innerHTML = '';
      hud.appendChild(U.el('span', { class: 'gh' }, def.icon + ' ' + def.title));
      hud.appendChild(U.el('span', { class: 'gh' }, '⭐ ' + Math.round(game.points())));
      hud.appendChild(U.el('span', { class: 'gh' }, '⏱ ' + Math.max(0, Math.ceil(state.dur - state.t))));
      if (!game.noCombo) hud.appendChild(U.el('span', { class: 'gh combo' + (pw.bar ? ' clear' : '') }, ['Combo x' + (1 + Math.floor(state.combo / 5)) + (pw.bar ? ' • ' + state.combo : ''), U.el('div', { class: 'cb' }, U.el('i', { style: { width: Math.round(combo * 100) + '%' } }))]));
      if (pw.shield) hud.appendChild(U.el('span', { class: 'gh' }, '🫧 ' + state.shield));
      if (state.slowT > 0) hud.appendChild(U.el('span', { class: 'gh' }, '🐌 Gravidade Leve'));
      pw.team.forEach((c) => { if (['nexus_replay', 'nexus_arcade', 'nexus_ui'].includes(c.power.scope)) hud.appendChild(U.el('span', { class: 'gh', title: c.power.description }, '✨ ' + c.power.name)); });
      const pz = U.el('button', { type: 'button', class: 'btn small gh-pause', 'aria-label': 'Pausar' }, 'Pausa'); pz.addEventListener('click', pause); hud.appendChild(pz);
    }
    let hudT = 0;
    function pause() {
      if (state.over || state.paused) return; state.paused = true;
      const m = UI.modal({ title: '⏸ Pausado', cls: 'small', noClose: true });
      m.body.appendChild(U.el('p', null, 'Respire, beba água e continue quando quiser.'));
      m.setActions([btn('🚪 Sair do jogo', 'ghost', () => { m.close(); finish(true); }), btn('▶ Continuar', 'pri', () => { m.close(); state.paused = false; last = performance.now(); })]);
    }
    const btn = UI.btn;
    // combo comum
    state.addCombo = function (n) {
      state.combo += n || 1; state.comboT = pw.combo; state.best = Math.max(state.best, state.combo);
      if (pw.bar && state.combo % 5 === 0) { state.celebrate = 0.8; NX.sfx('coin', 'combo ' + state.combo + '!'); }
    };
    state.hit = function () {
      if (state.shield > 0) { state.shield--; NX.sfx('shield'); state.msg = '🫧 Bolha Protetora!'; state.msgT = 1; return false; }
      state.hits++; state.combo = 0; state.comboT = 0; NX.sfx('hit'); state.msg = 'Ops! Continue!'; state.msgT = 0.9; return true;
    };
    state.slowFactor = () => (state.slowT > 0 ? 1 - pw.slowPct : 1);
    let last = performance.now(), raf = 0, resolveFn;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!state.paused && !state.over) {
        if (state.count > 0) { state.count -= dt; if (state.count <= 0) NX.sfx('ok', 'valendo!'); }
        else {
          state.t += dt;
          if (state.comboT > 0) { state.comboT -= dt; if (state.comboT <= 0) state.combo = 0; }
          if (pw.slowPct) { state.slowNext -= dt; if (state.slowNext <= 0) { state.slowT = pw.slowSec; state.slowNext = 12; } if (state.slowT > 0) state.slowT -= dt; }
          if (state.msgT > 0) state.msgT -= dt; if (state.celebrate > 0) state.celebrate -= dt;
          game.update(dt);
          input.jumpPressed = false;
          if (state.t >= state.dur || game.done) finish(false);
        }
      }
      ctx.save(); ctx.clearRect(-ox / sc, -oy / sc, cv.width, cv.height); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      game.draw(ctx);
      if (state.count > 0) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = '900 120px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(Math.ceil(state.count)), W / 2, H / 2 + 40); ctx.font = '900 26px Nunito, system-ui'; ctx.fillText(def.controls, W / 2, H / 2 + 100); ctx.textAlign = 'left'; }
      if (state.msgT > 0) { ctx.fillStyle = '#fff'; ctx.font = '900 32px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.fillText(state.msg, W / 2, 110); ctx.textAlign = 'left'; }
      if (state.celebrate > 0) { ctx.font = '900 44px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd23f'; ctx.fillText('📊 COMBO ' + state.combo + '!', W / 2, 170); ctx.textAlign = 'left'; }
      ctx.restore();
      if ((hudT += dt) > 0.2) { hudT = 0; drawHud(); }
      if (!state.over) raf = requestAnimationFrame(frame);
    }
    function cleanup() {
      cancelAnimationFrame(raf); window.removeEventListener('resize', fit); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); cv.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu);
      sec.classList.add('hide'); hud.innerHTML = ''; pad.innerHTML = '';
    }
    function finish(quit) {
      if (state.over) return; state.over = true;
      cleanup();
      if (quit) { resolveFn(null); return; }
      NX.sfx('win');
      resolveFn({ score: Math.max(0, Math.min(100, Math.round(game.score()))), ghost: state.ghostRec.length ? state.ghostRec : null, stats: { hits: state.hits, bestCombo: state.best, points: Math.round(game.points()) } });
    }
    drawHud(); raf = requestAnimationFrame(frame);
    return new Promise((res) => { resolveFn = res; });
  };

  /* ---------------- desenho de apoio ---------------- */
  function sky(g, top, bot) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  function drawImg(g, im, x, y, h, flip, alpha) { if (!im.complete || !im.naturalWidth) return; const w = h * im.naturalWidth / im.naturalHeight; g.save(); if (alpha != null) g.globalAlpha = alpha; g.translate(x, y); if (flip) g.scale(-1, 1); g.drawImage(im, -w / 2, -h, w, h); g.restore(); }
  function emoji(g, e, x, y, s) { g.font = s + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, x, y); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; }
  function islands(g, t, speed) { g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 6; i++) { const x = ((i * 220 - t * speed * 0.2) % (W + 200) + W + 200) % (W + 200) - 100; g.beginPath(); g.ellipse(x, 80 + (i % 3) * 50, 60, 16, 0, 0, 7); g.fill(); } }

  /* ================================================================ 1) CORRIDA NEXÓTICA */
  function runner(S, pw) {
    const GY = 440, pl = { x: 200, y: GY, vy: 0, jumps: 0, inv: 0 };
    const ob = [], st = [], pads = [];
    let scroll = 0, spawnO = 1.2, spawnS = 0.6, spawnP = 6, starsSpawned = 0, stars = 0, pts = 0, gT = 0;
    const comp = pw.team[0] ? img(pw.team[0].assetUrl) : null;
    return {
      update(dt) {
        const base = (340 + S.t * 5) * pw.speed; scroll += base * dt;
        const slow = S.slowFactor();
        // pulo
        if (S.inputJump || this.inp.jumpPressed) { if (pl.y >= GY - 0.5) { pl.vy = -860; pl.jumps = 1; NX.sfx('jump', null); } else if (pl.jumps < pw.jumps) { pl.vy = -760; pl.jumps++; NX.sfx('jump', 'salto extra'); } }
        pl.vy += 2300 * dt; pl.y += pl.vy * dt; if (pl.y > GY) { pl.y = GY; pl.vy = 0; pl.jumps = 0; }
        if (pl.inv > 0) pl.inv -= dt;
        // spawns
        if ((spawnO -= dt) <= 0) { spawnO = U.rand(1.0, 1.7); ob.push({ x: W + 40, k: U.pick(['🚧', '📦', '🪨']) }); }
        if ((spawnS -= dt) <= 0) { spawnS = U.rand(0.9, 1.5); const hgt = U.pick([0, 0, 90, 150]); for (let i = 0; i < 4; i++) { st.push({ x: W + 40 + i * 50, y: GY - 40 - hgt - Math.sin(i / 3 * Math.PI) * 30 }); starsSpawned++; } }
        if ((spawnP -= dt) <= 0) { spawnP = U.rand(6, 9); pads.push({ x: W + 60 }); for (let i = 0; i < 5; i++) { st.push({ x: W + 90 + i * 45, y: GY - 260 - i * 6, hi: true }); starsSpawned++; } }
        const mv = base * dt;
        ob.forEach((o) => { o.x -= mv * slow; }); st.forEach((s) => { s.x -= mv; }); pads.forEach((q) => { q.x -= mv; });
        // colisões
        ob.forEach((o) => { if (!o.done && Math.abs(o.x - pl.x) < 34 && pl.y > GY - 46 && pl.inv <= 0) { o.done = true; if (S.hit()) pl.inv = 1; } });
        pads.forEach((q) => { if (!q.used && Math.abs(q.x - pl.x) < 40 && pl.y >= GY - 4) { q.used = true; pl.vy = -900 * pw.bounce * 1.15; pl.jumps = 1; NX.sfx('spring'); } });
        st.forEach((s) => {
          if (s.got) return;
          const dx = s.x - pl.x, dy = s.y - (pl.y - 50), d = Math.hypot(dx, dy);
          if (pw.magnet && d < pw.magnet + 40) { s.x -= dx * 0.18; s.y -= dy * 0.18; }
          if (d < 44) { s.got = true; stars++; S.addCombo(); pts += 10 * (1 + Math.floor(S.combo / 5)); if (stars % 5 === 0) NX.sfx('coin', null); }
        });
        for (const a of [ob, st, pads]) { for (let i = a.length - 1; i >= 0; i--) if (a[i].x < -60 || a[i].got) a.splice(i, 1); }
        if ((gT += dt) > 0.1) { gT = 0; S.ghostRec.push(Math.round(pl.y)); }
      },
      draw(g) {
        sky(g, '#6ec8ff', '#d9f3ff'); islands(g, scroll, 1);
        g.fillStyle = '#5cc36b'; g.fillRect(0, GY + 6, W, H - GY); g.fillStyle = '#3f9e4f'; for (let x = -(scroll % 40); x < W; x += 40) g.fillRect(x, GY + 6, 20, 6);
        pads.forEach((q) => { g.fillStyle = '#c14bff'; g.beginPath(); g.ellipse(q.x, GY + 2, 38, 12, 0, 0, 7); g.fill(); emoji(g, '🟣', q.x, GY - 8, 26); });
        st.forEach((s) => emoji(g, s.hi ? '💎' : '⭐', s.x, s.y, 32));
        ob.forEach((o) => { g.globalAlpha = o.done ? 0.3 : 1; emoji(g, o.k, o.x, GY - 18, 46); g.globalAlpha = 1; });
        if (S.ghost) { const gy = S.ghost[Math.min(S.ghost.length - 1, Math.floor(S.t * 10))]; if (gy) drawImg(g, gabImg, pl.x - 70, gy + 6, 120, false, 0.3); }
        if (comp) drawImg(g, comp, pl.x - 80, pl.y + 4, 70, false);
        g.globalAlpha = pl.inv > 0 && Math.floor(pl.inv * 10) % 2 ? 0.4 : 1;
        drawImg(g, gabImg, pl.x, pl.y + 6, 130, false);
        g.globalAlpha = 1;
        if (S.shield > 0) { g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 4; g.beginPath(); g.arc(pl.x, pl.y - 62, 70, 0, 7); g.stroke(); }
      },
      points: () => pts,
      score: () => (starsSpawned ? stars / starsSpawned * 72 : 0) + Math.max(0, 28 - S.hits * 7),
      inp: null
    };
  }
  /* ================================================================ 2) CHUVA DE ESTRELAS */
  function catcher(S, pw, inp) {
    const pl = { x: W / 2, stun: 0 }; const items = []; let spawn = 0.3, good = 0, got = 0, pts = 0;
    const comp = pw.team[0] ? img(pw.team[0].assetUrl) : null;
    return {
      update(dt) {
        const sp = 520 * pw.speed;
        if (pl.stun > 0) pl.stun -= dt;
        else { if (inp.l) pl.x -= sp * dt; if (inp.r) pl.x += sp * dt; if (inp.tx != null) pl.x += Math.max(-sp * dt, Math.min(sp * dt, inp.tx - pl.x)); }
        pl.x = Math.max(50, Math.min(W - 50, pl.x));
        if ((spawn -= dt) <= 0) { spawn = U.rand(0.28, 0.55) - Math.min(0.15, S.t / 300); const r = Math.random(); const k = r < 0.62 ? 'star' : r < 0.77 ? 'gem' : 'cloud'; items.push({ x: U.rand(40, W - 40), y: -30, k, v: U.rand(180, 260) + S.t * 3 }); if (k !== 'cloud') good++; }
        const slow = S.slowFactor();
        items.forEach((it) => {
          it.y += it.v * dt * (it.k === 'cloud' ? slow : 1);
          if (it.k !== 'cloud' && pw.magnet && Math.abs(it.x - pl.x) < pw.magnet + 30 && it.y > H - 260) it.x += (pl.x - it.x) * 0.12;
          if (!it.done && it.y > H - 140 && it.y < H - 60 && Math.abs(it.x - pl.x) < 56) {
            it.done = true;
            if (it.k === 'cloud') { if (S.hit()) pl.stun = 0.8; }
            else { got++; S.addCombo(); pts += (it.k === 'gem' ? 30 : 10) * (1 + Math.floor(S.combo / 5)); NX.sfx(it.k === 'gem' ? 'frag' : 'coin', null); }
          }
        });
        for (let i = items.length - 1; i >= 0; i--) if (items[i].y > H + 40 || items[i].done) items.splice(i, 1);
      },
      draw(g) {
        sky(g, '#1a1f5c', '#6b4bd8'); g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53 + S.t * 20) % H, 2, 2);
        items.forEach((it) => emoji(g, it.k === 'star' ? '⭐' : it.k === 'gem' ? '💎' : '🌧️', it.x, it.y, it.k === 'cloud' ? 52 : 38));
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(pl.x, H - 30, 60, 12, 0, 0, 7); g.fill();
        if (comp) drawImg(g, comp, pl.x + 70, H - 30, 70, true);
        drawImg(g, gabImg, pl.x, H - 26, 130, false, pl.stun > 0 ? 0.5 : 1);
        if (pw.magnet) { g.strokeStyle = 'rgba(255,210,63,.35)'; g.setLineDash([6, 8]); g.beginPath(); g.arc(pl.x, H - 90, pw.magnet + 30, Math.PI, 0); g.stroke(); g.setLineDash([]); }
        if (S.shield > 0) { g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 4; g.beginPath(); g.arc(pl.x, H - 90, 70, 0, 7); g.stroke(); }
      },
      points: () => pts,
      score: () => (good ? got / good * 78 : 0) + Math.max(0, 22 - S.hits * 6)
    };
  }
  /* ================================================================ 3) PULA-GELATINA */
  function jelly(S, pw, inp) {
    const pl = { x: W / 2, y: H - 80, vy: -700, air: 0 }; let camY = 0, maxH = 0, stars = 0, pts = 0, rescue = pw.shield;
    const plats = []; let topY = H - 40;
    function addPlat(y) { const r = Math.random(); plats.push({ x: U.rand(80, W - 80), y, w: 130, k: r < 0.22 ? 'jelly' : r < 0.36 ? 'move' : 'n', d: Math.random() < 0.5 ? 1 : -1, star: Math.random() < 0.45 }); }
    plats.push({ x: W / 2, y: H - 40, w: 300, k: 'n' });
    while (topY > -H * 2) { topY -= U.rand(80, 120); addPlat(topY); }
    const comp = pw.team[0] ? img(pw.team[0].assetUrl) : null;
    return {
      noCombo: false,
      update(dt) {
        const sp = 480 * pw.speed; const slow = S.slowFactor();
        if (inp.l) pl.x -= sp * dt; if (inp.r) pl.x += sp * dt; if (inp.tx != null) pl.x += Math.max(-sp * dt, Math.min(sp * dt, inp.tx - pl.x));
        if (pl.x < -20) pl.x = W + 20; if (pl.x > W + 20) pl.x = -20;
        if (inp.jumpPressed && pl.air < pw.jumps - 1) { pl.vy = -760; pl.air++; NX.sfx('jump', 'salto extra'); }
        pl.vy += 1500 * dt; pl.y += pl.vy * dt;
        plats.forEach((q) => { if (q.k === 'move') { q.x += q.d * 90 * dt * slow; if (q.x < 70 || q.x > W - 70) q.d *= -1; } });
        if (pl.vy > 0) plats.forEach((q) => {
          if (Math.abs(pl.x - q.x) < q.w / 2 + 10 && pl.y > q.y - 8 && pl.y < q.y + 14) {
            pl.y = q.y - 8; pl.air = 0;
            if (q.k === 'jelly') { pl.vy = -1020 * pw.bounce; NX.sfx('spring', 'boing de gelatina'); } else { pl.vy = -780; NX.sfx('jump', null); }
            if (q.star) { q.star = false; stars++; S.addCombo(); pts += 10 * (1 + Math.floor(S.combo / 5)); }
          }
        });
        const target = pl.y - H * 0.45; if (target < camY) camY = target;
        maxH = Math.max(maxH, Math.round((H - 80 - pl.y) / 10));
        while (topY > camY - H) { topY -= U.rand(80, 125) + Math.min(40, maxH / 60); addPlat(topY); }
        for (let i = plats.length - 1; i >= 0; i--) if (plats[i].y > camY + H + 60) plats.splice(i, 1);
        if (pl.y > camY + H + 40) {
          if (rescue > 0) { rescue--; S.shield = rescue; pl.vy = -1100; pl.y = camY + H - 10; NX.sfx('shield', 'bolha salvou!'); S.msg = '🫧 A bolha te salvou!'; S.msgT = 1.2; }
          else { this.done = true; }
        }
      },
      draw(g) {
        const hgt = Math.min(1, maxH / 900);
        sky(g, 'rgb(' + Math.round(110 - hgt * 90) + ',' + Math.round(200 - hgt * 160) + ',' + Math.round(255 - hgt * 120) + ')', '#ffe2f4');
        g.save(); g.translate(0, -camY);
        plats.forEach((q) => { g.fillStyle = q.k === 'jelly' ? '#c14bff' : q.k === 'move' ? '#3ec1ff' : '#5cc36b'; g.beginPath(); g.roundRect ? g.roundRect(q.x - q.w / 2, q.y, q.w, 16, 8) : g.rect(q.x - q.w / 2, q.y, q.w, 16); g.fill(); if (q.k === 'jelly') emoji(g, '🟣', q.x, q.y - 4, 18); if (q.star) emoji(g, '⭐', q.x, q.y - 34, 30); });
        if (comp) drawImg(g, comp, pl.x - 60, pl.y + 30, 60, false, 0.9);
        drawImg(g, gabImg, pl.x, pl.y + 8, 110, inp.l);
        if (S.shield > 0) { g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 4; g.beginPath(); g.arc(pl.x, pl.y - 50, 60, 0, 7); g.stroke(); }
        g.restore();
        g.fillStyle = '#fff'; g.font = '900 24px Nunito, system-ui'; g.fillText('Altura: ' + maxH + ' m', 16, H - 20);
      },
      points: () => pts + maxH,
      score: () => Math.min(100, maxH / 900 * 82 + stars * 1.2)
    };
  }
  /* ================================================================ 4) RALI DAS MONTANHAS */
  function rally(S, pw, inp) {
    const LANES = [W / 2 - 150, W / 2, W / 2 + 150], FIN = 7000;
    const pl = { lane: 1, x: LANES[1], v: 0, dist: 0 }; const obs = []; let spawn = 0.8, lastLR = 0, place = 0, finT = 0;
    const cpu = [{ n: 'Zeca Turbo', c: '#ff5d8f', v: 300, dist: 0 }, { n: 'Lola Faísca', c: '#ffd23f', v: 285, dist: 0 }, { n: 'Bento Bip', c: '#3ddc84', v: 270, dist: 0 }];
    const vmax = 340 * pw.speed, acc = 120 * pw.accel;
    const comp = pw.team[0] ? img(pw.team[0].assetUrl) : null;
    return {
      noCombo: true,
      update(dt) {
        const want = inp.l ? -1 : inp.r ? 1 : inp.tx != null ? (inp.tx < W / 2 - 60 ? -1 : inp.tx > W / 2 + 60 ? 1 : 0) : 0;
        if (want && S.t - lastLR > 0.22) { pl.lane = Math.max(0, Math.min(2, pl.lane + want)); lastLR = S.t; if (inp.tx != null) inp.tx = null; }
        pl.x += (LANES[pl.lane] - pl.x) * Math.min(1, dt * 12);
        pl.v = Math.min(vmax, pl.v + acc * dt); pl.dist += pl.v * dt;
        cpu.forEach((c, i) => { c.dist += (c.v + Math.sin(S.t * (0.6 + i * 0.2)) * 25) * dt; });
        if ((spawn -= dt) <= 0) { spawn = U.rand(0.55, 0.95); obs.push({ lane: U.irand(0, 2), y: -40, k: Math.random() < 0.8 ? 'rock' : 'boost' }); }
        obs.forEach((o) => { o.y += pl.v * dt * 1.4; if (!o.done && o.y > H - 170 && o.y < H - 90 && o.lane === pl.lane) { o.done = true; if (o.k === 'boost') { pl.v = Math.min(vmax * 1.25, pl.v + 120); NX.sfx('boost'); } else if (S.hit()) pl.v *= 0.4; } });
        for (let i = obs.length - 1; i >= 0; i--) if (obs[i].y > H + 40) obs.splice(i, 1);
        if (pl.dist >= FIN && !place) { place = 1 + cpu.filter((c) => c.dist >= FIN).length; finT = S.t; this.done = true; }
      },
      draw(g) {
        sky(g, '#7a5c3c', '#b38b5d');
        g.fillStyle = '#3a3a44'; g.fillRect(W / 2 - 230, 0, 460, H);
        g.fillStyle = '#fff'; const off = (pl.dist * 1.4) % 60; for (let y = -60 + off; y < H; y += 60) { g.fillRect(W / 2 - 78, y, 6, 30); g.fillRect(W / 2 + 72, y, 6, 30); }
        g.fillStyle = '#5a8f3a'; g.fillRect(0, 0, W / 2 - 230, H); g.fillRect(W / 2 + 230, 0, W / 2 - 230, H);
        for (let i = 0; i < 8; i++) { const y = ((i * 90 + pl.dist * 1.4) % (H + 90)) - 45; emoji(g, '⛰️', 70 + (i % 2) * 60, y, 48); emoji(g, '🌲', W - 90 - (i % 2) * 50, y + 30, 42); }
        obs.forEach((o) => emoji(g, o.k === 'rock' ? '🪨' : '⚡', LANES[o.lane], o.y, 50));
        if (comp) drawImg(g, comp, pl.x + 46, H - 70, 56, true);
        g.fillStyle = '#29e7ff'; g.beginPath(); g.roundRect ? g.roundRect(pl.x - 34, H - 170, 68, 100, 14) : g.rect(pl.x - 34, H - 170, 68, 100); g.fill();
        drawImg(g, gabImg, pl.x, H - 110, 80, false);
        if (S.shield > 0) { g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 4; g.beginPath(); g.arc(pl.x, H - 125, 62, 0, 7); g.stroke(); }
        // placar da corrida
        const all = cpu.map((c) => ({ n: c.n, c: c.c, d: c.dist })).concat([{ n: NX.name(), c: '#29e7ff', d: pl.dist, me: true }]).sort((a, b) => b.d - a.d);
        g.font = '900 18px Nunito, system-ui';
        all.forEach((r, i) => { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(W - 250, 70 + i * 30, 234, 26); g.fillStyle = r.c; g.fillRect(W - 250, 70 + i * 30, 8, 26); g.fillStyle = r.me ? '#ffd23f' : '#fff'; g.fillText((i + 1) + 'º ' + r.n, W - 236, 89 + i * 30); });
        g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(20, H - 40, 300, 16); g.fillStyle = '#ffd23f'; g.fillRect(20, H - 40, 300 * Math.min(1, pl.dist / FIN), 16);
      },
      points: () => Math.round(pl.dist / 10),
      score() {
        if (!place) { const ahead = cpu.filter((c) => c.dist > pl.dist).length; return Math.min(60, pl.dist / FIN * 60) - ahead * 5; }
        return [0, 96, 76, 58, 42][place] + Math.max(0, 4 - S.hits) - Math.max(0, finT - 22) * 0.4;
      }
    };
  }
  // liga a entrada no jogo de corrida (usa input.jumpPressed)
  const _runner = runner;
  G.list[0].make = function (S, pw, inp) { const r = _runner(S, pw); r.inp = inp; return r; };
})();
