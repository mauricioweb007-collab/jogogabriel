/* =====================================================================
   scenes/arcade2.js — ARCADE DO MUNDO 2 (Culturas que se Encontram)
   Recompensa depois do chefe Sombra do Preconceito. Jogos curtos, sem
   perguntas, com vidas/metas e recorde:
   • Feira Ninja — frutas brasileiras voam; corte deslizando o dedo ou
     o mouse (ou mova o facão com as setas e segure Espaço). Não corte
     a pimenta! (estilo Fruit Ninja)
   • Quermesse Tiro ao Alvo — barraca de festa junina com alvos em
     esteiras; mire e atire rolhas; bata a meta de cada rodada
     (estilo Duck Hunt / Yoshi's Safari)
   • Pega-Névoa no Arraial — as Névoas da Confusão saem das panelas de
     barro; capture rápido e não acerte os amigos (estilo "acerte a
     toupeira" dos jogos de festa)
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  function arraial(g, c, x, t, night) {
    const bg = c.createLinearGradient(0, 0, 0, E.H); bg.addColorStop(0, night ? '#0b1030' : '#ff9a6b'); bg.addColorStop(1, night ? '#3a1a4a' : '#ffd29a'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H);
    if (night) for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(t * 2 + i)).toFixed(2) + ')'; c.fillRect((i * 97) % E.W, (i * 41) % 90, 1, 1); }
    for (let r = 0; r < 2; r++) { const yy = 14 + r * 16; c.strokeStyle = '#5a3d2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(E.W / 2, yy + 10, E.W, yy); c.stroke();
      for (let i = 0; i < 20; i++) { const bx = i * 21 + r * 10, by = yy + Math.sin(i / 20 * Math.PI) * 9; c.fillStyle = ['#e5484d', '#3ec1ff', '#2ecc71', '#f1c40f', '#9b59b6'][(i + r) % 5]; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 5, by + 9 + Math.sin(t * 3 + i) * 1); c.lineTo(bx + 10, by); c.fill(); } }
  }

  /* ================================================================ FEIRA NINJA */
  const FRUITS = [['abacaxi', '#ffd23f'], ['manga', '#ff9a3d'], ['banana', '#ffe066'], ['coco', '#f4f4f4'], ['melancia', '#ff4d6d'], ['morango', '#e5484d'], ['uva', '#9b59b6'], ['limao', '#9ee35a'], ['abacate', '#7bc043']];
  PQ.register({ id: 'w2_ninja', world: 2, boss: 'c2s5', ref: 'Fruit Ninja', title: 'Feira Ninja', icon: 'abacaxi', c1: '#2ecc71', c2: '#0f4a28', music: 'festa', medals: [250, 600, 1000], unit: 'pts',
    desc: 'As frutas da feira voam pelo ar! Corte todas deslizando o dedo — mas NÃO corte a pimenta ardida.',
    how: '**Deslize** o dedo ou o mouse sobre as frutas para cortar. No teclado: mova o facão com as **setas** e **segure Espaço** para cortar. Deixar fruta cair ou cortar **pimenta** tira 1 vida (**3 vidas**). Corte 3 de uma vez = **combo**!' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let fr = [], halves = [], trail = [], playing = false, waveT = 1, time = 0, down = false, slowmo = 0, combo = [], lastCut = 0;
    const blade = { x: 200, y: 110 };
    api.lives = 3; api.refresh(); api.goal('Corte as frutas! Não corte a pimenta.');
    PQ.pointer(sc, { pointerdown: (lx, ly) => { down = true; trail = [{ x: lx, y: ly, t: sc.t }]; }, pointermove: (lx, ly) => { if (down) trail.push({ x: lx, y: ly, t: sc.t }); }, pointerup: () => { down = false; } });
    sc.begin = () => { playing = true; };
    function launch() {
      const n = 1 + Math.floor(Math.random() * Math.min(4, 1 + time / 25));
      for (let i = 0; i < n; i++) {
        const r = Math.random(), k = r < 0.12 + Math.min(0.08, time / 1500) ? 'pimenta' : r < 0.16 ? 'estrela_brilho' : null;
        const F = k ? [k, k === 'pimenta' ? '#e5484d' : '#ffd23f'] : U.pick(FRUITS);
        const x0 = 60 + Math.random() * 280;
        fr.push({ k: F[0], col: F[1], x: x0, y: E.H + 16, vx: (200 - x0) * 0.35 + (Math.random() - 0.5) * 40, vy: -250 - Math.random() * 60, rot: 0, vr: (Math.random() - 0.5) * 5, r: 13 });
      }
      GG.audio.sfx('jump');
    }
    function cut(f) {
      f.cut = true;
      if (f.k === 'pimenta') { api.lives--; api.refresh(); GG.audio.sfx('boom'); E.shake(5, 0.4); if (X()) { X().flash('#ff4d4d', 0.45); X().pop(f.x, f.y, 'ARDEU!', '#ff6b6b', 12); } if (api.lives <= 0) over(); return; }
      if (f.k === 'estrela_brilho') { slowmo = 3.5; api.add(50); GG.audio.sfx('power'); if (X()) { X().flash('#ffd23f', 0.3); X().pop(f.x, f.y, 'FRENESI! +50', '#ffd23f', 10); } return; }
      api.add(10); GG.audio.sfx('stomp'); combo.push(sc.t); lastCut = sc.t;
      E.fx.burst(f.x, f.y, f.col, 14, 110);
      [-1, 1].forEach((s) => halves.push({ k: f.k, x: f.x, y: f.y, vx: f.vx * 0.4 + s * 50, vy: -60, rot: f.rot, vr: s * 6, side: s, t: 0 }));
    }
    function over() { playing = false; setTimeout(() => api.end(api.score, 'Tempo: ' + Math.round(time) + ' s. Dica: corte várias frutas num só movimento!'), 800); }
    function segHit(ax, ay, bx, by, f) { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1; let k = ((f.x - ax) * dx + (f.y - ay) * dy) / L; k = Math.max(0, Math.min(1, k)); return Math.hypot(ax + dx * k - f.x, ay + dy * k - f.y) < f.r; }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      trail = trail.filter((p) => sc.t - p.t < 0.15);
      if (!playing) return;
      const k = slowmo > 0 ? 0.45 : 1; if (slowmo > 0) slowmo -= dt;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(150 - time)) + 's');
      // facão pelo teclado
      const ax = I.axisX(), ay = I.axisY();
      if (ax || ay) { blade.x = U.clamp(blade.x + ax * 260 * dt, 0, E.W); blade.y = U.clamp(blade.y + ay * 260 * dt, 0, E.H); }
      if (I.down('jump') || I.down('act')) trail.push({ x: blade.x, y: blade.y, t: sc.t });
      waveT -= dt * k; if (waveT <= 0) { launch(); waveT = Math.max(0.9, 1.9 - time * 0.008); }
      fr.forEach((f) => { f.vy += 300 * dt * k; f.x += f.vx * dt * k; f.y += f.vy * dt * k; f.rot += f.vr * dt; });
      for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i]; fr.forEach((f) => { if (!f.cut && segHit(a.x, a.y, b.x, b.y, f)) cut(f); }); }
      fr.forEach((f) => { if (!f.cut && f.vy > 0 && f.y > E.H + 20) { f.gone = true; if (f.k !== 'pimenta' && f.k !== 'estrela_brilho' && playing) { api.lives--; api.refresh(); GG.audio.sfx('bad'); if (X()) X().pop(f.x, E.H - 20, 'CAIU!', '#ff8f8f', 8); if (api.lives <= 0) over(); } } });
      fr = fr.filter((f) => !f.cut && !f.gone);
      halves.forEach((h) => { h.t += dt; h.vy += 400 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; }); halves = halves.filter((h) => h.y < E.H + 30);
      combo = combo.filter((t) => sc.t - t < 0.3);
      if (combo.length >= 3 && sc.t - lastCut < 0.02) { const b = combo.length * 10; api.add(b); if (X()) X().pop(200, 60, 'COMBO ' + combo.length + '! +' + b, '#ffd23f', 12); GG.audio.sfx('ok'); combo = []; }
      if (time >= 150) { playing = false; setTimeout(() => api.end(api.score, 'Você sobreviveu à feira inteira! Parabéns, ninja!'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, false);
      c.fillStyle = '#8b5a2b'; c.fillRect(0, 196, E.W, 29); c.fillStyle = '#6b3f1d'; for (let i = 0; i < E.W; i += 24) c.fillRect(i, 196, 1, 29);
      if (slowmo > 0) { c.fillStyle = 'rgba(255,220,120,.18)'; c.fillRect(0, 0, E.W, E.H); }
      fr.forEach((f) => { if (f.k === 'pimenta' && x) x.glow(c, f.x, f.y, 18, '#ff3b3b', 0.5 + 0.3 * Math.sin(sc.t * 12)); if (!(x && x.ilus(c, f.k, f.x, f.y, 28, { rot: f.rot }))) g.circle(f.x, f.y, 12, f.col); });
      halves.forEach((h) => { if (!x) return; c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.beginPath(); c.rect(h.side < 0 ? -16 : 0, -16, 16, 32); c.clip(); c.globalAlpha = Math.max(0, 1 - h.t / 1.2); x.ilus(c, h.k, 0, 0, 28); c.restore(); });
      if (trail.length > 1) { c.save(); c.lineCap = 'round'; for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i], k = 1 - (sc.t - b.t) / 0.15; c.strokeStyle = 'rgba(255,255,255,' + k.toFixed(2) + ')'; c.lineWidth = 1 + k * 4; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } c.restore(); }
      if (!down) { c.save(); c.translate(blade.x, blade.y); c.rotate(-0.6); c.fillStyle = '#d9dde8'; c.fillRect(-2, -12, 4, 12); c.fillStyle = '#6b3f1d'; c.fillRect(-2, 0, 4, 6); c.restore(); }
      if (slowmo > 0) g.text('FRENESI!', E.W / 2, 40, { size: 10, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; fr.push({ k: 'pimenta', x: 0, y: 0 }); cut(fr[fr.length - 1]); } };
    return sc;
  });

  /* ================================================================ QUERMESSE TIRO AO ALVO */
  PQ.register({ id: 'w2_quermesse', world: 2, boss: 'c2s5', ref: 'Duck Hunt / Yoshi\'s Safari', title: 'Quermesse Tiro ao Alvo', icon: 'alvo', c1: '#e5484d', c2: '#5a1020', music: 'festa', medals: [300, 700, 1200], unit: 'pts',
    desc: 'Barraca da festa junina: acerte os alvos das esteiras com a espingarda de rolha. Bata a meta de cada rodada!',
    how: 'Mire com o **mouse/dedo** (toque atira) ou com as **setas** e **Espaço** para atirar. São **8 rolhas** por carga (recarrega com **E**). **Não acerte** a placa da **Gaia**, os **presentes** nem as **pombas**: cada erro tira **2 segundos**! Cada rodada tem **menos tempo para sobrar**, mais alvos e mais rápidos.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ROWS = [72, 112, 152];
    const aim = { x: 200, y: 112 };
    let targets = [], round = 0, roundT = 0, hits = 0, ammo = 8, reload = 0, playing = false, spawnT = 0, flash = 0, laugh = 0, between = 0;
    // pedido do usuário: rodada de 25 s; meta e alvos na esteira +1 por rodada; alvos errados cada vez mais comuns (−2 s)
    const RT = 25, meta = () => 7 + round, BAD = ['bussola', 'presente', 'pomba'];
    const badChance = () => Math.min(0.45, 0.16 + round * 0.06);
    PQ.pointer(sc, { pointermove: (lx, ly) => { aim.x = lx; aim.y = ly; }, pointerdown: (lx, ly) => { aim.x = lx; aim.y = ly; shoot(); } });
    function startRound() { roundT = RT; hits = 0; targets = []; between = 0; api.goal('Rodada ' + (round + 1) + ': acerte ' + meta() + ' alvos em ' + RT + ' s! Errado = −2 s'); if (X()) X().banner({ id: 'qm', icon: 'alvo', title: 'Rodada ' + (round + 1), style: 'Meta: ' + meta() + ' alvos' }, 'QUERMESSE'); }
    sc.begin = () => { playing = true; startRound(); };
    function shoot() {
      if (!playing || between > 0 || reload > 0) return;
      if (ammo <= 0) { reload = 0.9; GG.audio.sfx('click'); return; }
      ammo--; flash = 0.08; GG.audio.sfx('shoot');
      const t = targets.slice().reverse().find((tg) => !tg.hit && Math.abs(tg.x - aim.x) < tg.r && Math.abs(tg.y - aim.y) < tg.r);
      if (!t) { if (X()) X().puff(aim.x, aim.y, 1); return; }
      t.hit = true; t.fall = 0;
      if (BAD.includes(t.k)) { api.add(-30); roundT -= 2; GG.audio.sfx('bad'); E.shake(3, 0.2); if (X()) { X().pop(t.x, t.y - 10, 'NÃO! -2 s', '#ff6b6b', 9); X().flash('#ff4d4d', 0.15); } return; }
      const v = t.k === 'estrela_brilho' ? 50 : t.k === 'balao' ? 10 : t.k === 'lata' ? 15 : 20; hits++; api.add(v * (1 + round * 0.25) | 0);
      GG.audio.sfx(t.k === 'balao' ? 'boom' : 'coin'); if (X()) { X().sparkle(t.x, t.y, '#fff0a0', 5); X().pop(t.x, t.y - 12, '+' + (v * (1 + round * 0.25) | 0), '#ffe27a', 8); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (flash > 0) flash -= dt; if (laugh > 0) laugh -= dt;
      if (!playing) return;
      const ax = I.axisX(), ay = I.axisY(); if (ax || ay) { aim.x = U.clamp(aim.x + ax * 200 * dt, 10, E.W - 10); aim.y = U.clamp(aim.y + ay * 200 * dt, 30, 200); }
      if (I.pressed('jump')) shoot(); if (I.pressed('act') && ammo < 8) reload = 0.9;
      if (reload > 0) { reload -= dt; if (reload <= 0) { ammo = 8; GG.audio.sfx('check'); } }
      if (between > 0) { between -= dt; if (between <= 0) { if (laugh > 0 || api._over) return; startRound(); } return; }
      roundT -= dt; api.extra('alvo', hits + '/' + meta() + ' • ' + Math.max(0, Math.ceil(roundT)) + 's');
      spawnT -= dt;
      const live = targets.filter((t) => !t.hit && !BAD.includes(t.k)).length;
      if (spawnT <= 0 && live < 4 + round) {
        spawnT = Math.max(0.3, 0.85 - round * 0.1);
        const row = Math.floor(Math.random() * 3), dir = row % 2 ? -1 : 1, r = Math.random(), bc = badChance();
        const k = r < bc ? U.pick(BAD.slice(0, Math.min(3, 1 + round))) : r < bc + 0.07 ? 'estrela_brilho' : r < bc + 0.35 ? 'balao' : r < bc + 0.6 ? 'lata' : 'pato';
        targets.push({ k, row, x: dir > 0 ? -16 : E.W + 16, y: ROWS[row], vx: dir * (50 + round * 14 + row * 8) * (k === 'estrela_brilho' ? 2 : 1), r: k === 'balao' ? 11 : 12, bob: Math.random() * 6 });
      }
      targets.forEach((t) => { if (t.hit) { t.fall += dt; t.y += 160 * dt; } else { t.x += t.vx * dt; if (t.k === 'balao') t.y = ROWS[t.row] - 6 + Math.sin(sc.t * 3 + t.bob) * 4; } });
      targets = targets.filter((t) => t.x > -30 && t.x < E.W + 30 && (!t.hit || t.fall < 0.6));
      if (roundT <= 0) {
        const mt = meta();
        if (hits >= mt) { round++; api.add(100); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); between = 2; api.goal('Meta batida! Próxima rodada…'); }
        else { playing = false; laugh = 3; api._over = true; GG.audio.sfx('bad'); api.goal('O GeoBot ri da barraca… faltou pouco!'); setTimeout(() => api.end(api.score, 'Rodadas vencidas: ' + round + '. Meta da última rodada: ' + mt + ' alvos (você fez ' + hits + ').'), 2200); }
      }
    };
    function drawTarget(c, g, x, t) {
      if (t.k === 'pato') { c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(t.x, t.y + 2, 10, 7, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(t.x + 7 * Math.sign(t.vx), t.y - 6, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff8a2a'; c.fillRect(t.x + 11 * Math.sign(t.vx) - 2, t.y - 6, 4, 2); c.fillStyle = '#15152a'; c.fillRect(t.x + 8 * Math.sign(t.vx), t.y - 8, 1.5, 1.5); c.fillStyle = '#8a6a2a'; c.fillRect(t.x - 1, t.y + 9, 2, 10); return; }
      if (t.k === 'lata') { c.fillStyle = '#c0c6d6'; c.fillRect(t.x - 7, t.y - 10, 14, 20); c.fillStyle = '#e5484d'; c.fillRect(t.x - 7, t.y - 4, 14, 8); c.fillStyle = '#fff'; c.fillRect(t.x - 4, t.y - 2, 8, 3); c.fillStyle = '#8a6a2a'; c.fillRect(t.x - 1, t.y + 10, 2, 9); return; }
      if (BAD.includes(t.k)) { g.panel(t.x - 11, t.y - 11, 22, 22, '#ffe0e0', '#e5484d'); if (x) x.ilus(c, t.k, t.x, t.y, 16); c.strokeStyle = '#e5484d'; c.lineWidth = 1.5; c.beginPath(); c.arc(t.x, t.y, 13, 0, Math.PI * 2); c.moveTo(t.x - 9, t.y - 9); c.lineTo(t.x + 9, t.y + 9); c.stroke(); return; }
      if (t.k === 'estrela_brilho' && x) x.glow(c, t.x, t.y, 16, '#ffd23f', 0.8);
      if (!(x && x.ilus(c, t.k, t.x, t.y, 22))) g.circle(t.x, t.y, 10, '#ff4d6d');
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, true);
      // barraca: cortinas e prateleiras de prêmios
      for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#c0392b' : '#fff1e0'; c.fillRect(i * 30, 36, 30, 12); }
      c.fillStyle = '#5a2a10'; c.fillRect(0, 48, E.W, 4);
      ROWS.forEach((y, i) => { c.fillStyle = '#6b3f1d'; c.fillRect(0, y + 18, E.W, 5); c.fillStyle = '#3a220b'; for (let xx = -((sc.t * 40 * (i % 2 ? -1 : 1)) % 12 + 12) % 12; xx < E.W; xx += 12) c.fillRect(xx, y + 19, 4, 3); });
      targets.forEach((t) => { c.save(); if (t.hit) { c.translate(t.x, t.y); c.rotate(t.fall * 4); c.translate(-t.x, -t.y); c.globalAlpha = 1 - t.fall / 0.6; } drawTarget(c, g, x, t); c.restore(); });
      c.fillStyle = '#4a2a10'; c.fillRect(0, 196, E.W, 29);
      if (x) ['trofeu', 'presente', 'balao', 'pipa'].forEach((n, i) => x.ilus(c, n, 40 + i * 110, 210, 18));
      // mira
      const col = flash > 0 ? '#ffffff' : '#ff3b3b';
      c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.arc(aim.x, aim.y, 8, 0, Math.PI * 2); c.moveTo(aim.x - 12, aim.y); c.lineTo(aim.x - 4, aim.y); c.moveTo(aim.x + 4, aim.y); c.lineTo(aim.x + 12, aim.y); c.moveTo(aim.x, aim.y - 12); c.lineTo(aim.x, aim.y - 4); c.moveTo(aim.x, aim.y + 4); c.lineTo(aim.x, aim.y + 12); c.stroke();
      if (flash > 0 && x) x.glow(c, aim.x, aim.y, 14, '#ffffff', 0.9);
      // rolhas
      for (let i = 0; i < 8; i++) { c.fillStyle = i < ammo ? '#c98b45' : 'rgba(255,255,255,.15)'; c.fillRect(8 + i * 8, 204, 5, 9); }
      if (reload > 0) g.text('RECARREGANDO…', 80, 206, { size: 5, color: '#ffd23f' }); else if (ammo === 0) g.text('SEM ROLHAS! (E)', 80, 206, { size: 5, color: '#ff8f8f' });
      if (laugh > 0) { g.img(P.geobot(Math.floor(sc.t * 8) % 3), E.W / 2 - 18, 120 - Math.abs(Math.sin(sc.t * 10)) * 10, { scale: 2 }); g.text('HA HA!', E.W / 2, 104, { size: 10, color: '#fff', align: 'center' }); }
    };
    sc.dbg = { end() { roundT = 0; hits = -99; } };
    return sc;
  });

  /* ================================================================ PEGA-NÉVOA NO ARRAIAL */
  PQ.register({ id: 'w2_nevoa', world: 2, boss: 'c2s5', ref: 'acerte a toupeira (jogos de festa)', title: 'Pega-Névoa no Arraial', icon: 'fogo', c1: '#ff7a2a', c2: '#5a1a08', music: 'corrida', medals: [300, 650, 1000], unit: 'pts',
    desc: 'As Névoas da Confusão saem das panelas de barro do arraial! Capture rápido, mas não acerte os amigos.',
    how: 'Toque/clique na **Névoa** que aparecer. No teclado: **Q W E / A S D / Z X C** (ou setas + Espaço). A **Névoa dourada** vale muito! Acertar um **amigo** tira 1 vida (**3 vidas**). **90 segundos**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const POTS = []; for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) POTS.push({ x: 110 + q * 90, y: 92 + r * 46, up: 0, who: null, life: 0, hit: 0 });
    const KEYS = ['KeyQ', 'KeyW', 'KeyE', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX', 'KeyC'], NUM = ['Numpad7', 'Numpad8', 'Numpad9', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad1', 'Numpad2', 'Numpad3'];
    let playing = false, time = 0, spawnT = 0.8, cursor = 4, combo = 0, hammer = { i: -1, t: 0 };
    api.lives = 3; api.refresh();
    const onKey = (ev) => { if (GG.ui.blocking() || E.scene !== sc) return; let i = KEYS.indexOf(ev.code); if (i < 0) i = NUM.indexOf(ev.code); if (i >= 0) { cursor = i; whack(i); } };
    window.addEventListener('keydown', onKey);
    sc.exit = () => window.removeEventListener('keydown', onKey);
    PQ.pointer(sc, { pointerdown: (lx, ly) => { const i = POTS.findIndex((p) => Math.abs(lx - p.x) < 34 && ly > p.y - 40 && ly < p.y + 14); if (i >= 0) { cursor = i; whack(i); } } });
    sc.begin = () => { playing = true; api.goal('Capture as Névoas! Não acerte os amigos.'); };
    function whack(i) {
      if (!playing) return;
      const p = POTS[i]; hammer = { i, t: 0.18 }; GG.audio.sfx('stomp');
      if (!p.who || p.up < 0.4 || p.hit) { combo = 0; return; }
      p.hit = 0.35;
      if (p.who === 'amigo') { api.lives--; api.refresh(); GG.audio.sfx('bad'); E.shake(3, 0.2); if (X()) { X().flash('#ff4d4d', 0.3); X().pop(p.x, p.y - 40, 'É AMIGO!', '#ff8f8f', 9); } combo = 0; if (api.lives <= 0) over(); return; }
      combo++; const v = (p.who === 'ouro' ? 50 : 10) + Math.min(20, combo * 2); api.add(v);
      GG.audio.sfx(p.who === 'ouro' ? 'frag' : 'coin'); if (X()) { X().puff(p.x, p.y - 20, 4); X().sparkle(p.x, p.y - 24, p.who === 'ouro' ? '#ffd23f' : '#c8b8ff', 5); X().pop(p.x, p.y - 44, 'POF! +' + v, '#ffe27a', 8); }
    }
    function over() { playing = false; setTimeout(() => api.end(api.score, 'Tempo: ' + Math.round(time) + ' s. Maior sequência vale mais!'), 700); }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (hammer.t > 0) hammer.t -= dt;
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(90 - time)) + 's');
      if (I.pressed('left')) cursor = cursor % 3 ? cursor - 1 : cursor; if (I.pressed('right')) cursor = cursor % 3 < 2 ? cursor + 1 : cursor;
      if (I.pressed('up')) cursor = cursor >= 3 ? cursor - 3 : cursor; if (I.pressed('down')) cursor = cursor < 6 ? cursor + 3 : cursor;
      if (I.pressed('jump') || I.pressed('act')) whack(cursor);
      const stay = Math.max(0.55, 1.2 - time * 0.008);
      spawnT -= dt;
      if (spawnT <= 0) { spawnT = Math.max(0.28, 0.8 - time * 0.006); const free = POTS.filter((p) => !p.who); if (free.length) { const p = U.pick(free), r = Math.random(); p.who = r < 0.07 ? 'ouro' : r < 0.25 + Math.min(0.1, time / 900) ? 'amigo' : 'nevoa'; p.friend = U.pick(['menina_medium', 'menino_dark', 'pomba', 'crianca_medium_light', 'idoso_dark']); p.life = stay; p.up = 0; p.hit = 0; } }
      POTS.forEach((p) => {
        if (!p.who) return;
        if (p.hit > 0) { p.hit -= dt; p.up = Math.max(0, p.up - dt * 4); if (p.hit <= 0) p.who = null; return; }
        p.life -= dt; p.up = p.life > 0.15 ? Math.min(1, p.up + dt * 6) : Math.max(0, p.up - dt * 7);
        if (p.life <= 0 && p.up <= 0) { if (p.who === 'nevoa' || p.who === 'ouro') combo = 0; p.who = null; }
      });
      if (time >= 90) { playing = false; api.add(api.lives * 50); setTimeout(() => api.end(api.score, 'Fim da festa! Bônus de vidas: +' + api.lives * 50 + '.'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, true);
      // fogueira e chão
      c.fillStyle = '#3a2410'; c.fillRect(0, 60, E.W, E.H - 60); c.fillStyle = '#4a3018'; for (let i = 0; i < 40; i++) c.fillRect((i * 53) % E.W, 64 + (i * 37) % 150, 3, 2);
      if (x) { x.glow(c, 30, 190, 40, '#ff8a2a', 0.7 + 0.2 * Math.sin(sc.t * 12)); x.ilus(c, 'fogo', 30, 184 + Math.sin(sc.t * 9), 34); x.glow(c, 370, 190, 40, '#ff8a2a', 0.7 + 0.2 * Math.sin(sc.t * 11)); x.ilus(c, 'fogo', 370, 184 + Math.sin(sc.t * 8), 34); }
      POTS.forEach((p, i) => {
        // quem sai da panela (desenhado antes da boca da panela para "entrar" nela)
        if (p.who) {
          c.save(); c.beginPath(); c.rect(p.x - 30, p.y - 60, 60, 60); c.clip();
          const yy = p.y - 6 - p.up * 26;
          if (p.who === 'amigo') { if (x) x.ilus(c, p.friend, p.x, yy, 30); }
          else { if (x && p.who === 'ouro') x.glow(c, p.x, yy, 22, '#ffd23f', 0.9); const im = P.nevoa(Math.floor(sc.t * 4) % 2); c.save(); if (p.who === 'ouro') c.filter = 'sepia(1) saturate(4) brightness(1.2)'; c.drawImage(im, p.x - 22, yy - 16, 44, 32); c.restore(); if (p.hit > 0) g.text('×_×', p.x, yy - 6, { size: 6, color: '#fff', align: 'center' }); }
          c.restore();
        }
        // panela de barro
        c.fillStyle = '#7a3a1a'; c.beginPath(); c.ellipse(p.x, p.y + 4, 28, 12, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#a0522d'; c.beginPath(); c.ellipse(p.x, p.y, 28, 7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#2a120a'; c.beginPath(); c.ellipse(p.x, p.y, 22, 4.5, 0, 0, Math.PI * 2); c.fill();
        if (i === cursor) { c.strokeStyle = 'rgba(255,230,120,' + (0.5 + 0.4 * Math.sin(sc.t * 8)).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y + 2, 32, 14, 0, 0, Math.PI * 2); c.stroke(); }
        g.text(['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'][i], p.x + 30, p.y + 4, { size: 5, color: 'rgba(255,255,255,.5)' });
      });
      // colher de pau (martelo)
      const hp = POTS[hammer.i >= 0 && hammer.t > 0 ? hammer.i : cursor];
      c.save(); c.translate(hp.x + 18, hp.y - 30); c.rotate(hammer.t > 0 ? -0.2 : -0.9); c.fillStyle = '#c98b45'; c.fillRect(-3, 0, 6, 26); c.beginPath(); c.ellipse(0, -2, 8, 6, 0, 0, Math.PI * 2); c.fill(); c.restore();
      if (combo > 2) g.text('SEQUÊNCIA ' + combo, E.W / 2, 56, { size: 7, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { time = 90; } };
    return sc;
  });
})();
