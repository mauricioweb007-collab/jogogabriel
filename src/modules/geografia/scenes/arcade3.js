/* =====================================================================
   scenes/arcade3.js — ARCADE DO MUNDO 3 (O Brasil que Muda)
   Recompensa depois do chefe Vírus da Desigualdade. Jogos curtos, sem
   perguntas, com tempo/vidas e recorde:
   • Estrada Brasil — corrida vista de cima pelo litoral, cerrado e
     cidade, com combustível, trânsito que muda de faixa e óleo
     (estilo Road Fighter do NES)
   • Invasores da Poluição — nave solar limpa nuvens de fumaça que
     descem em formação e mergulham (estilo Galaga / Space Invaders);
     a cada fumaça limpa o céu da cidade fica mais azul
   • Empilha-Prédios — o guindaste balança; solte o andar na hora
     certa e faça a cidade crescer (estilo Tower Bloxx / Stack)
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ ESTRADA BRASIL
     Estilo Road Fighter (NES), pedido do usuário (24/09/2026): visão de cima, a estrada
     serpenteia e estreita; o recurso é o COMBUSTÍVEL (não há tempo extra por checkpoint).
     Bater num carro = rodar e explodir; raspar na beira freia e gasta um pouco (perde combustível e recomeça
     parado). Carros amarelos mudam de faixa na sua frente; manchas de óleo fazem rodar;
     galões na pista devolvem combustível. Dificuldade média: sobe a cada zona e volta. */
  const ZONES = [
    { name: 'Litoral', side: ['#e8d49a', '#dcc486'], edge: '#2f9be0', rumble: ['#e5484d', '#fff'], road: '#5d626e', hw: 74, props: ['treePalm', 'treePalm', 'house1'], traffic: 1 },
    { name: 'Cerrado', side: ['#c98f4d', '#bd8444'], edge: '#8a5a2e', rumble: ['#ffd23f', '#fff'], road: '#6d6152', hw: 64, props: ['treeOrange', 'cactus2', 'tree'], traffic: 1.3 },
    { name: 'Cidade', side: ['#8a95a3', '#7f8a98'], edge: '#4a4f5c', rumble: ['#3ec1ff', '#fff'], road: '#45495a', hw: 58, props: ['house2', 'tower', 'houseAlt1'], traffic: 1.6 }
  ];
  PQ.register({ id: 'w3_estrada', world: 3, boss: 'c3s6', ref: 'Road Fighter (NES)', title: 'Estrada Brasil', icon: 'carro_corrida', c1: '#ff4d6d', c2: '#4a0a1a', music: 'corrida', medals: [900, 1900, 3200], unit: 'pts',
    desc: 'Corrida de estrada vista de cima, do litoral à cidade! Desvie do trânsito e cuide do combustível — cada batida custa caro.',
    how: '**← →** desviam. O carro acelera sozinho; segure **↑ / Espaço** para a **marcha rápida** (mais pontos, mais risco) e **↓** para frear. **Não bata** nos carros! Raspar na **beira da pista** freia o carro. Carros **amarelos** mudam de faixa; **óleo** faz rodar. Pegue os **galões** ⛽: quando o combustível acaba, o jogo termina.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const PY = 176, ZL = 7200, CRUISE = 215, FAST = 300;
    const car = { x: 200, v: 0, crash: 0, spin: 0, inv: 0, spinDir: 1 };
    let dist = 0, fuel = 100, playing = false, traffic = [], items = [], spawnT = 1.2, itemT = 5, zone = 0, lap = 0, zoneAnn = 0, over = 0, passed = 0, crashes = 0, mouseX = null, lastZoneIdx = 0;
    const Z = () => ZONES[zone];
    const level = () => zone + lap * 3; // 0,1,2,3…
    const center = (d) => 200 + 52 * Math.sin(d / 900) + 22 * Math.sin(d / 370 + 1);
    const zmod = (d) => ((Math.floor(d / ZL) % 3) + 3) % 3;
    const half = (d) => { const zi = zmod(d), zz = ZONES[zi]; let h = zz.hw + 12 * Math.sin(d / 1300); if (Math.sin(d / 2100 + zi) > 0.82) h -= 20 + Math.min(8, lap * 4); return Math.max(36, h - lap * 4); };
    const zoneAt = zmod;
    // só segue o mouse/dedo ENQUANTO está apertado (antes o mouse parado puxava o carro para o lado)
    PQ.pointer(sc, { pointerdown: (lx) => { mouseX = lx; }, pointermove: (lx) => { if (mouseX != null) mouseX = lx; }, pointerup: () => { mouseX = null; }, pointercancel: () => { mouseX = null; } });
    sc.begin = () => { playing = true; zoneAnn = 2.5; api.goal('Zona: Litoral — desvie e cuide do combustível!'); };
    const sy = (d) => PY - (d - dist);
    function spawnCar() {
      const d = dist + 300, lv = level(), r = Math.random();
      const kind = r < 0.12 + lv * 0.04 ? 'zig' : r < 0.24 + lv * 0.03 ? 'truck' : r < 0.29 + lv * 0.02 ? 'oil' : 'car';
      const lane = U.pick([-0.55, 0, 0.55]);
      if (kind === 'oil') { traffic.push({ k: 'oil', d, off: lane, v: 0, w: 18, h: 12 }); return; }
      traffic.push({ k: kind, d, off: lane, toOff: lane, v: kind === 'truck' ? 80 + lv * 6 : 110 + Math.random() * 50 + lv * 8, w: kind === 'truck' ? 18 : 14, h: kind === 'truck' ? 38 : 24,
        col: kind === 'zig' ? '#ffd23f' : kind === 'truck' ? '#e8e8f0' : U.pick(['#3ec1ff', '#35e07a', '#b07bff', '#ff9a3d']), swerved: false });
    }
    function crash(why) {
      if (car.crash > 0 || car.inv > 0) return;
      car.crash = 1.3; car.spinDir = Math.random() < 0.5 ? -1 : 1; crashes++;
      fuel = Math.max(0, fuel - 10); api.add(-40);
      GG.audio.sfx('boom'); E.shake(6, 0.45); E.fx.burst(car.x, PY, '#ff9a3d', 14, 90);
      if (X()) { X().flash('#ff4d4d', 0.35); X().puff(car.x, PY, 6); X().pop(car.x, PY - 30, why + ' -10 combustível', '#ff8f8f', 8); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (zoneAnn > 0) zoneAnn -= dt;
      if (!playing) return;
      if (car.inv > 0) car.inv -= dt; if (car.spin > 0) car.spin -= dt;
      // combustível: gasta sempre; mais rápido na marcha rápida
      const fast = I.down('up') || I.down('jump');
      fuel -= dt * (fast ? 1.35 : 1.05);
      api.extra('bateria', Math.max(0, Math.ceil(fuel)) + '% ⛽');
      if (car.crash > 0) {
        car.crash -= dt; car.v = Math.max(0, car.v - 400 * dt); dist += car.v * dt;
        if (car.crash <= 0) { car.x = center(dist); car.v = 0; car.inv = 1.6; car.spin = 0; }
      } else {
        const top = I.down('down') ? 0 : fast ? FAST : CRUISE;
        car.v += (top - car.v) * Math.min(1, dt * (car.v < top ? 0.9 : 3));
        let steer = I.axisX();
        if (!steer && mouseX != null) steer = Math.abs(mouseX - car.x) < 3 ? 0 : U.clamp((mouseX - car.x) / 18, -1, 1);
        if (car.spin > 0) steer = car.spinDir * 0.6;
        car.x += steer * dt * (90 + car.v * 0.3);
        dist += car.v * dt;
        const c0 = center(dist), h0 = half(dist), lim = h0 - 7;
        if (Math.abs(car.x - c0) > lim) {
          // raspou na beira: volta para a pista, perde velocidade e um pouco de combustível (sem explodir)
          car.x = c0 + Math.sign(car.x - c0) * (lim - 2); car.v *= 0.55; fuel -= 1.5; car.scrape = 0.3;
          if (!car.warned) { car.warned = 1.2; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'Cuidado com a beira!', '#ffd23f', 7); }
          if (X() && Math.random() < 0.5) X().sparkle(car.x + Math.sign(car.x - c0) * 7, PY, '#ffd23f', 2);
        }
        if (car.warned > 0) car.warned = Math.max(0, car.warned - dt);
      }
      if (Math.floor(dist / 25) !== Math.floor((dist - car.v * dt) / 25)) api.add(1);
      // zonas (sem tempo extra: só um pouco de combustível e bônus)
      const zi = Math.floor(dist / ZL);
      if (zi !== lastZoneIdx) {
        lastZoneIdx = zi; zone = zi % 3; lap = Math.floor(zi / 3); zoneAnn = 2.5;
        api.add(250); fuel = Math.min(100, fuel + 12); GG.audio.sfx('win');
        if (X()) { X().flash('#fff6c0', 0.25); X().pop(200, 70, 'ZONA CONCLUÍDA! +250 e +12 de combustível', '#7bff8f', 9); }
        api.goal('Zona: ' + Z().name + (lap ? ' (volta ' + (lap + 1) + ', mais rápida!)' : ''));
      }
      // trânsito
      spawnT -= dt;
      if (spawnT <= 0 && car.v > 40) { spawnCar(); spawnT = Math.max(0.55, (1.5 - level() * 0.1) / Z().traffic) * (0.7 + Math.random() * 0.6) * (CRUISE / Math.max(120, car.v)); }
      itemT -= dt; if (itemT <= 0 && car.v > 40) { itemT = 6.5 + Math.random() * 3 + level() * 0.6; items.push({ d: dist + 300, off: U.pick([-0.5, 0, 0.5]) }); }
      const cbox = { x: car.x - 7, y: PY - 12, w: 14, h: 24 };
      traffic.forEach((o) => {
        o.d += o.v * dt;
        const cx0 = center(o.d), hh = half(o.d);
        if (o.k === 'zig' && !o.swerved) { const gap = o.d - dist; if (gap < 130 && gap > 40) { o.swerved = true; const pOff = (car.x - cx0) / hh; o.toOff = U.clamp(pOff + (Math.random() < 0.5 ? -0.15 : 0.15), -0.6, 0.6); } }
        if (o.toOff != null) o.off += U.clamp(o.toOff - o.off, -dt * 1.3, dt * 1.3);
        o.x = cx0 + o.off * hh; o.y = sy(o.d);
        if (car.crash > 0 || car.inv > 0 || o.hitDone) return;
        if (E.overlap(cbox, { x: o.x - o.w / 2 + 1, y: o.y - o.h / 2 + 1, w: o.w - 2, h: o.h - 2 })) {
          if (o.k === 'oil') { o.hitDone = true; car.spin = 0.6; car.spinDir = Math.random() < 0.5 ? -1 : 1; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'ÓLEO!', '#ffd23f', 8); }
          else { o.hitDone = true; crash('Batida!'); }
        }
        if (!o.passed && o.k !== 'oil' && o.y > PY + 20) { o.passed = true; passed++; api.add(o.k === 'zig' ? 25 : 15); }
      });
      traffic = traffic.filter((o) => o.y < E.H + 50 && o.d < dist + 400);
      items.forEach((it) => { const cx0 = center(it.d); it.x = cx0 + it.off * half(it.d); it.y = sy(it.d); if (!it.got && car.crash <= 0 && Math.abs(it.x - car.x) < 13 && Math.abs(it.y - PY) < 16) { it.got = true; fuel = Math.min(100, fuel + 18); api.add(30); GG.audio.sfx('power'); if (X()) { X().sparkle(it.x, it.y, '#7bff8f', 6); X().pop(it.x, it.y - 12, '+18 combustível', '#7bff8f', 8); } } });
      items = items.filter((it) => !it.got && it.y < E.H + 20);
      if (fuel <= 0) { fuel = 0; playing = false; over = 1; GG.audio.sfx('bad'); setTimeout(() => api.end(api.score, 'Combustível acabou! Distância: ' + (dist / 1000).toFixed(1) + ' km • zonas: ' + lastZoneIdx + ' • ultrapassagens: ' + passed + ' • batidas: ' + crashes + '.'), 1100); }
    };
    function drawCar(c, x, y, w, h, col, rot) {
      c.save(); c.translate(x, y); if (rot) c.rotate(rot);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      c.fillStyle = '#15152a'; c.fillRect(-w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(-w / 2 - 1.5, h / 2 - 9, 3, 6); c.fillRect(w / 2 - 1.5, h / 2 - 9, 3, 6);
      c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-w / 2, -h / 2, w, 2);
      c.fillStyle = 'rgba(20,30,60,.85)'; c.fillRect(-w / 2 + 2, -h / 2 + h * 0.22, w - 4, h * 0.18); c.fillRect(-w / 2 + 2, h / 2 - h * 0.28, w - 4, h * 0.12);
      c.restore();
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // laterais (areia/terra/calçada) em faixas que rolam
      for (let yy = 0; yy < E.H; yy += 8) {
        const d = dist + (PY - yy), zi = zoneAt(d), zz = ZONES[zi], alt = Math.floor(d / 24) % 2;
        const cx0 = center(d), hh = half(d);
        c.fillStyle = zz.side[alt]; c.fillRect(0, yy, E.W, 8);
        if (zi === 0) { c.fillStyle = zz.edge; c.fillRect(0, yy, Math.max(0, cx0 - hh - 60), 8); } // mar à esquerda no litoral
        c.fillStyle = zz.rumble[alt]; c.fillRect(cx0 - hh - 5, yy, 5, 8); c.fillRect(cx0 + hh, yy, 5, 8);
        c.fillStyle = zz.road; c.fillRect(cx0 - hh, yy, hh * 2, 8);
        if (Math.floor(d / 20) % 2) { c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(cx0 - hh * 0.28 - 1, yy, 2, 8); c.fillRect(cx0 + hh * 0.28 - 1, yy, 2, 8); }
        if (Math.floor(d / ZL) !== Math.floor((d - 8) / ZL)) { for (let k = 0; k < hh * 2; k += 8) { c.fillStyle = (k / 8) % 2 ? '#fff' : '#15152a'; c.fillRect(cx0 - hh + k, yy, 8, 6); } }
      }
      // enfeites na beira
      if (x) {
        const step = 70, first = Math.floor((dist - 60) / step);
        for (let k = first; k < first + 6; k++) {
          const d = k * step, yy = sy(d); if (yy < -40 || yy > E.H + 40) continue;
          const zz = ZONES[zoneAt(d)], im = x.img[zz.props[((k % 3) + 3) % 3]]; if (!im) continue;
          const side = k % 2 ? -1 : 1, cx0 = center(d), hh = half(d), xx = cx0 + side * (hh + 30 + (k % 3) * 8), h = 34, w = h * im.width / im.height;
          if (xx > -20 && xx < E.W + 20) x.hd(c, () => c.drawImage(im, xx - w / 2, yy - h, w, h));
        }
      }
      items.forEach((it) => { if (x) x.glow(c, it.x, it.y, 12, '#7bff8f', 0.6); c.fillStyle = '#e5484d'; c.fillRect(it.x - 5, it.y - 6, 10, 12); c.fillStyle = '#8a1020'; c.fillRect(it.x - 3, it.y - 9, 6, 3); c.fillStyle = '#ffd23f'; c.fillRect(it.x - 3, it.y - 2, 6, 3); });
      traffic.forEach((o) => {
        if (o.k === 'oil') { c.fillStyle = 'rgba(15,15,30,.85)'; c.beginPath(); c.ellipse(o.x, o.y, 9, 6, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(140,90,255,.35)'; c.beginPath(); c.ellipse(o.x - 2, o.y - 1, 4, 2, 0.3, 0, Math.PI * 2); c.fill(); return; }
        drawCar(c, o.x, o.y, o.w, o.h, o.col, 0);
        if (o.k === 'zig' && !o.swerved && o.y > -10 && Math.floor(sc.t * 6) % 2) g.text('!', o.x, o.y - o.h / 2 - 9, { size: 7, color: '#ffd23f', align: 'center' });
      });
      // jogador
      if (!(car.inv > 0 && Math.floor(sc.t * 14) % 2)) {
        const rot = car.crash > 0 ? car.spinDir * (1.3 - car.crash) * 9 : car.spin > 0 ? car.spinDir * (0.9 - car.spin) * 7 : IN().axisX() * 0.12;
        drawCar(c, car.x, PY, 14, 24, '#e5484d', rot);
        if (car.crash <= 0) g.text('BR', car.x, PY - 3, { size: 3, color: '#fff', align: 'center', shadow: false });
        if (car.crash > 0 && x) x.glow(c, car.x, PY, 22 * car.crash, '#ff9a3d', 0.7);
      }
      // painel: combustível, velocidade e zona
      g.panel(6, 30, 20, 120, 'rgba(15,18,38,.85)', '#3a4290');
      const fh = 108 * fuel / 100, fc = fuel < 25 ? (Math.floor(sc.t * 4) % 2 ? '#ff5d6c' : '#8a1020') : fuel < 50 ? '#ffd23f' : '#35e07a';
      g.rect(10, 34 + 108 - fh, 12, fh, fc); g.text('COMB.', 16, 152, { size: 4, color: '#fff', align: 'center' });
      g.panel(E.W - 64, 196, 58, 22, 'rgba(15,18,38,.85)', '#3a4290'); g.text(Math.round(car.v * 0.6) + ' km/h', E.W - 35, 200, { size: 6, color: '#fff', align: 'center' });
      g.text(IN().down('up') || IN().down('jump') ? 'MARCHA RÁPIDA' : 'marcha normal', E.W - 35, 209, { size: 3.5, color: '#9ff2ff', align: 'center' });
      const zp = (dist % ZL) / ZL; g.rect(120, 6, 160, 4, 'rgba(0,0,0,.4)'); g.rect(120, 6, 160 * zp, 4, '#ffd23f'); g.text(Z().name + (lap ? ' • volta ' + (lap + 1) : ''), 200, 12, { size: 5, color: '#fff', align: 'center' });
      if (zoneAnn > 0) g.text('ZONA: ' + Z().name.toUpperCase(), E.W / 2, 40, { size: 10, color: '#fff', align: 'center' });
      if (fuel < 20 && playing && Math.floor(sc.t * 3) % 2) g.text('POUCO COMBUSTÍVEL!', E.W / 2, 58, { size: 7, color: '#ff8f8f', align: 'center' });
      if (over) g.text('ACABOU O COMBUSTÍVEL!', E.W / 2, 90, { size: 11, color: '#ff5d6c', align: 'center' });
    };
    sc.dbg = { end() { fuel = 0; }, car, center, half, get traffic() { return traffic; }, get items() { return items; }, get dist() { return dist; }, get fuel() { return fuel; }, set fuel(v) { fuel = v; }, get crashes() { return crashes; } };
    return sc;
  });

  /* ================================================================ INVASORES DA POLUIÇÃO */
  PQ.register({ id: 'w3_invasores', world: 3, boss: 'c3s6', ref: 'Galaga / Space Invaders', title: 'Invasores da Poluição', icon: 'fabrica', c1: '#5a6b8a', c2: '#1a2233', music: 'chefe', medals: [800, 1800, 3200], unit: 'pts',
    desc: 'Nuvens de fumaça invadem a cidade! Pilote a nave solar e limpe o céu com raios de energia limpa.',
    how: '**← →** movem a nave solar, **Espaço** (ou toque) dispara. Fumaças descem em formação e algumas **mergulham**! Pegue **raio** (tiro triplo), **escudo** e **coração**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ship = { x: 200, y: 200, inv: 0, triple: 0, shield: 0 };
    let foes = [], shots = [], drops = [], caps = [], wave = 0, playing = false, cool = 0, clean = 0, time = 0, touchX = null, firing = false, waveAnn = 0;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointerdown: (lx) => { touchX = lx; firing = true; }, pointermove: (lx, ly, ev) => { if (firing || ev.pointerType === 'mouse') touchX = lx; }, pointerup: () => { firing = false; } });
    function newWave() {
      wave++; waveAnn = 2; foes = [];
      const rows = Math.min(5, 3 + Math.floor(wave / 2));
      for (let r = 0; r < rows; r++) for (let q = 0; q < 8; q++) foes.push({ hx: 60 + q * 38, hy: 36 + r * 20, x: 60 + q * 38, y: -30 - r * 20 - q * 6, k: r === 0 ? 'fabrica' : r % 2 ? 'fumaca' : 'lixo', hp: r === 0 ? 2 : 1, dive: 0, enter: 1 });
      api.goal('Onda ' + wave + ': limpe o céu!');
    }
    sc.begin = () => { playing = true; newWave(); };
    function hit() {
      if (ship.inv > 0) return;
      if (ship.shield > 0) { ship.shield = 0; ship.inv = 1; GG.audio.sfx('shield'); return; }
      api.lives--; api.refresh(); ship.inv = 2; GG.audio.sfx('hit'); E.shake(5, 0.3); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ondas limpas: ' + (wave - 1) + '. O céu ficou ' + Math.round(clean * 100) + '% mais limpo!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (waveAnn > 0) waveAnn -= dt;
      if (!playing) return;
      time += dt; api.extra('sol', 'Onda ' + wave);
      if (ship.inv > 0) ship.inv -= dt; if (ship.triple > 0) ship.triple -= dt; if (ship.shield > 0) ship.shield -= dt;
      const ax = I.axisX(); if (ax) { ship.x += ax * 170 * dt; touchX = null; } else if (touchX != null) ship.x += U.clamp(touchX - ship.x, -170 * dt, 170 * dt);
      ship.x = U.clamp(ship.x, 14, E.W - 14);
      cool -= dt;
      if ((I.down('jump') || I.down('act') || firing) && cool <= 0) { cool = 0.28; (ship.triple > 0 ? [-0.25, 0, 0.25] : [0]).forEach((a) => shots.push({ x: ship.x, y: ship.y - 10, vx: Math.sin(a) * 260, vy: -Math.cos(a) * 260 })); GG.audio.sfx('shoot'); }
      shots.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; }); shots = shots.filter((s) => s.y > -10);
      const sway = Math.sin(sc.t * 0.8) * 24, sp = 1 + wave * 0.12;
      foes.forEach((f) => {
        if (f.enter > 0) { f.x += (f.hx + sway - f.x) * Math.min(1, dt * 3); f.y += (f.hy - f.y) * Math.min(1, dt * 3); if (Math.abs(f.y - f.hy) < 2) f.enter = 0; return; }
        if (f.dive > 0) { f.dive += dt; f.x += Math.sin(f.dive * 3) * 120 * dt + (ship.x - f.x) * dt * 0.8; f.y += 90 * sp * dt; if (f.y > E.H + 20) { f.dive = 0; f.y = -20; f.enter = 1; } }
        else { f.x = f.hx + sway; f.y = f.hy + Math.sin(sc.t * 2 + f.hx) * 2; if (Math.random() < dt * 0.05 * sp) f.dive = 0.01; if (Math.random() < dt * 0.1 * sp) drops.push({ x: f.x, y: f.y + 6, vy: 80 + wave * 8 }); }
        if (Math.abs(f.x - ship.x) < 12 && Math.abs(f.y - ship.y) < 10) { f.dead = true; hit(); }
      });
      for (const s of shots) for (const f of foes) if (!f.dead && !s.used && Math.abs(s.x - f.x) < 11 && Math.abs(s.y - f.y) < 9) {
        s.used = true; f.hp--; if (f.hp > 0) { GG.audio.note('G6', 0.04); continue; }
        f.dead = true; const v = (f.dive > 0 ? 30 : 10) * (f.k === 'fabrica' ? 2 : 1); api.add(v); clean = Math.min(1, clean + 0.012); GG.audio.sfx('boom');
        if (X()) { X().sparkle(f.x, f.y, '#ffffff', 4); X().pop(f.x, f.y - 8, '+' + v, '#e8f7ff', 7); X().puff(f.x, f.y, 2); }
        if (Math.random() < 0.08) caps.push({ k: U.pick(['raio', 'escudo', 'raio', 'coracao']), x: f.x, y: f.y });
      }
      shots = shots.filter((s) => !s.used); foes = foes.filter((f) => !f.dead);
      drops.forEach((d) => { d.y += d.vy * dt; if (Math.abs(d.x - ship.x) < 9 && Math.abs(d.y - ship.y) < 8) { d.used = true; hit(); } }); drops = drops.filter((d) => !d.used && d.y < E.H + 5);
      caps.forEach((cp) => { cp.y += 50 * dt; if (Math.abs(cp.x - ship.x) < 12 && Math.abs(cp.y - ship.y) < 12) { cp.used = true; GG.audio.sfx('power'); api.add(20); if (cp.k === 'raio') ship.triple = 9; if (cp.k === 'escudo') ship.shield = 10; if (cp.k === 'coracao') { api.lives = Math.min(api.maxLives, api.lives + 1); api.refresh(); } if (X()) X().pop(cp.x, cp.y - 10, { raio: 'TIRO TRIPLO!', escudo: 'ESCUDO!', coracao: '+1 VIDA' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.used && cp.y < E.H);
      if (!foes.length) { api.add(150); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); newWave(); }
      if (time >= 170) { playing = false; setTimeout(() => api.end(api.score, 'Tempo! Ondas limpas: ' + (wave - 1) + '.'), 500); }
    };
    function smog(c, x, f) {
      if (f.k === 'lixo') { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, f.y - 7, 12, 14); c.fillStyle = '#9aa0ab'; c.fillRect(f.x - 7, f.y - 8, 14, 3); c.fillStyle = '#ff5d6c'; c.fillRect(f.x - 3, f.y - 2, 2, 2); c.fillRect(f.x + 1, f.y - 2, 2, 2); return; }
      const col = f.k === 'fabrica' ? '#4a4450' : '#8a8494';
      c.fillStyle = col; [[-6, 1, 6], [0, -3, 7], [6, 1, 6], [0, 3, 6]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(f.x + dx, f.y + dy, r, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = f.hp > 1 ? '#ffd23f' : '#ff5d6c'; c.fillRect(f.x - 4, f.y - 2, 2, 2); c.fillRect(f.x + 2, f.y - 2, 2, 2); c.fillStyle = '#2a2233'; c.fillRect(f.x - 3, f.y + 3, 6, 1);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // céu poluído que vai clareando
      const sky = c.createLinearGradient(0, 0, 0, E.H);
      const mix = (a, b) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * clean)).join(',') + ')';
      sky.addColorStop(0, mix([90, 80, 70], [60, 150, 240])); sky.addColorStop(1, mix([150, 130, 110], [200, 235, 255]));
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (x && clean > 0.3) x.glow(c, 340, 40, 30 + clean * 20, '#fff2a0', clean);
      // cidade no fundo
      for (let i = 0; i < 16; i++) { const h = 30 + (i * 37) % 50, w = 24; c.fillStyle = mix([60, 55, 60], [90, 110, 150]); c.fillRect(i * 26, E.H - h, w, h); c.fillStyle = 'rgba(255,230,150,.6)'; for (let yy = E.H - h + 5; yy < E.H - 4; yy += 7) c.fillRect(i * 26 + 5, yy, 3, 3); }
      foes.forEach((f) => smog(c, x, f));
      drops.forEach((d) => { c.fillStyle = '#3a3440'; c.beginPath(); c.arc(d.x, d.y, 3, 0, Math.PI * 2); c.fill(); });
      shots.forEach((s) => { if (x) x.glow(c, s.x, s.y, 7, '#fff27a', 0.8); g.rect(s.x - 1, s.y - 5, 2, 8, '#fff6b0'); });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, cp.k, cp.x, cp.y, 14); } });
      if (!(ship.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        if (ship.shield > 0) { c.strokeStyle = 'rgba(159,242,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(ship.x, ship.y, 16, 0, Math.PI * 2); c.stroke(); }
        if (x) x.glow(c, ship.x, ship.y + 8, 10, '#ffb040', 0.8);
        c.fillStyle = '#2e5bd8'; c.beginPath(); c.moveTo(ship.x, ship.y - 12); c.lineTo(ship.x + 12, ship.y + 8); c.lineTo(ship.x - 12, ship.y + 8); c.closePath(); c.fill();
        c.fillStyle = '#1a2a6a'; for (let i = -1; i <= 1; i++) c.fillRect(ship.x + i * 7 - 3, ship.y, 6, 6); c.fillStyle = '#9ff2ff'; c.fillRect(ship.x - 2, ship.y - 6, 4, 4);
        if (x) x.ilus(c, 'sol', ship.x, ship.y - 2, 10);
      }
      g.rect(8, 8, 80, 5, 'rgba(0,0,0,.4)'); g.rect(8, 8, 80 * clean, 5, '#7bff8f'); g.text('CÉU LIMPO ' + Math.round(clean * 100) + '%', 8, 15, { size: 4, color: '#fff' });
      if (waveAnn > 0) g.text('ONDA ' + wave, E.W / 2, 100, { size: 14, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; ship.inv = 0; ship.shield = 0; hit(); } };
    return sc;
  });

  /* ================================================================ EMPILHA-PRÉDIOS */
  PQ.register({ id: 'w3_predios', world: 3, boss: 'c3s6', ref: 'Tower Bloxx / Stack', title: 'Empilha-Prédios', icon: 'predio', c1: '#3ec1ff', c2: '#0b2a4a', music: 'cidade', medals: [15, 30, 50], unit: 'andares',
    desc: 'O guindaste balança um andar! Solte na hora certa e faça o prédio crescer até as nuvens.',
    how: 'Aperte **Espaço** ou toque para **soltar** o andar. Quanto mais alinhado, melhor: **PERFEITO** não perde nada e faz combo. O que ficar para fora cai! Errar o prédio inteiro tira 1 vida (**3 vidas**).' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const FH = 16, BASEY = 205;
    let floors = [{ x: 170, w: 60, col: '#8a8f9e' }], hook = { t: 0 }, drop = null, playing = false, perfect = 0, pieces = [], camY = 0, time = 0;
    const COLS = ['#e8744f', '#3ec1ff', '#ffd23f', '#35e07a', '#b07bff', '#ff4d6d', '#f39c12'];
    api.lives = 3; api.refresh(); api.goal('Empilhe os andares! Cada andar = +1.200 moradores.');
    sc.begin = () => { playing = true; };
    const top = () => floors[floors.length - 1];
    function hookPos() { const h = floors.length, amp = Math.min(150, 70 + h * 3), sp = 1.4 + Math.min(1.6, h * 0.05); return { x: 200 + Math.sin(hook.t * sp) * amp, y: camY + 28 }; }
    const release = () => { if (!playing || drop) return; const hp = hookPos(); drop = { x: hp.x - top().w / 2, y: hp.y + 20, w: top().w, vy: 0, col: COLS[floors.length % COLS.length] }; GG.audio.sfx('click'); };
    sc.click = release;
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; hook.t += dt;
      if (I.pressed('jump') || I.pressed('act') || I.pressed('down')) release();
      const targetCam = Math.min(0, BASEY - floors.length * FH - 120);
      camY += (targetCam - camY) * Math.min(1, dt * 3);
      pieces.forEach((p) => { p.vy += 500 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }); pieces = pieces.filter((p) => p.y < camY + E.H + 60);
      if (!drop) return;
      drop.vy += 700 * dt; drop.y += drop.vy * dt;
      const landY = BASEY - floors.length * FH;
      if (drop.y + FH >= landY) {
        const t = top(), l = Math.max(drop.x, t.x), r = Math.min(drop.x + drop.w, t.x + t.w), ov = r - l;
        if (ov < 6) { pieces.push({ x: drop.x, y: landY - FH, w: drop.w, col: drop.col, vy: 0, vr: (drop.x < t.x ? -3 : 3), rot: 0 }); drop = null; perfect = 0; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(4, 0.3); if (X()) X().flash('#ff4d4d', 0.3);
          if (api.lives <= 0) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Prédio com ' + (floors.length - 1) + ' andares: ' + U.fmtInt((floors.length - 1) * 1200) + ' moradores!'), 900); } return; }
        const off = Math.abs(drop.x - t.x);
        let nx = l, nw = ov;
        if (off <= 3) { nx = t.x; nw = Math.min(90, t.w + (perfect >= 2 ? 6 : 0)); perfect++; GG.audio.sfx('frag'); if (X()) { X().pop(200, landY - camY - 30, perfect > 1 ? 'PERFEITO x' + perfect + '!' : 'PERFEITO!', '#7bff8f', 10); X().ring(nx + nw / 2, landY - FH / 2, '#7bff8f', 40); } api.add(0); }
        else { perfect = 0; GG.audio.sfx('stomp'); const cutL = drop.x < t.x, cw = drop.w - ov; pieces.push({ x: cutL ? drop.x : r, y: landY - FH, w: cw, col: drop.col, vy: 0, vr: cutL ? -4 : 4, rot: 0 }); }
        floors.push({ x: nx, w: nw, col: drop.col });
        drop = null; E.shake(1.5, 0.1); if (X()) X().puff(nx + nw / 2, landY, 3);
        api.score = floors.length - 1; api.refresh(); api.extra('abraco', U.fmtInt((floors.length - 1) * 1200) + ' moradores');
        if (floors.length % 10 === 1) { GG.audio.sfx('win'); E.fx.confetti(200, 60, 40); }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Tempo! Prédio com ' + (floors.length - 1) + ' andares.'), 500); }
    };
    function floorDraw(c, f, y, alpha) {
      c.fillStyle = f.col; c.fillRect(f.x, y, f.w, FH); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(f.x, y, f.w, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(f.x, y + FH - 2, f.w, 2);
      c.fillStyle = 'rgba(255,240,170,' + (alpha || 0.85) + ')'; for (let wx = f.x + 4; wx < f.x + f.w - 5; wx += 9) c.fillRect(wx, y + 5, 5, 6);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      const h = floors.length, k = Math.min(1, h / 60);
      const sky = c.createLinearGradient(0, 0, 0, E.H); sky.addColorStop(0, 'rgb(' + Math.round(80 - 70 * k) + ',' + Math.round(160 - 140 * k) + ',' + Math.round(240 - 180 * k) + ')'); sky.addColorStop(1, 'rgb(' + Math.round(190 - 140 * k) + ',' + Math.round(225 - 170 * k) + ',255)');
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (k > 0.5) for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,' + ((k - 0.5) * 1.6).toFixed(2) + ')'; c.fillRect((i * 83) % E.W, (i * 47) % E.H, 1, 1); }
      if (x) X().hd(c, () => { for (let i = 0; i < 5; i++) { const im = x.img[['cloud1', 'cloud3', 'cloud5'][i % 3]]; if (!im) continue; const cy = ((i * 170 - camY * 0.5) % 500) - 60; c.globalAlpha = 0.8; c.drawImage(im, (i * 97 + sc.t * 6) % (E.W + 80) - 60, cy, 70, 42); } c.globalAlpha = 1; });
      c.save(); c.translate(0, -camY);
      // cidade e chão
      for (let i = 0; i < 16; i++) { const bh = 30 + (i * 29) % 60; c.fillStyle = '#5c6f8f'; c.fillRect(i * 26, BASEY - bh, 22, bh); }
      c.fillStyle = '#3fae52'; c.fillRect(0, BASEY, E.W, 60);
      floors.forEach((f, i) => { if (i === 0) { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, BASEY - FH, f.w + 12, FH); return; } floorDraw(c, f, BASEY - (i + 1) * FH); });
      pieces.forEach((p) => { c.save(); c.translate(p.x + p.w / 2, p.y + FH / 2); c.rotate(p.rot); c.translate(-p.w / 2, -FH / 2); floorDraw(c, { x: 0, w: p.w, col: p.col }, 0, 0.4); c.restore(); });
      if (drop) floorDraw(c, drop, drop.y);
      // guindaste
      const hp = hookPos();
      c.fillStyle = '#ffd23f'; c.fillRect(0, camY + 10, E.W, 5); c.fillStyle = '#c99a1e'; for (let i = 0; i < E.W; i += 10) c.fillRect(i, camY + 10, 5, 5);
      c.strokeStyle = '#2a2a33'; c.lineWidth = 1; c.beginPath(); c.moveTo(hp.x, camY + 15); c.lineTo(hp.x, hp.y + 20); c.stroke();
      c.fillStyle = '#2a2a33'; c.fillRect(hp.x - 4, camY + 12, 8, 6);
      if (!drop && playing) floorDraw(c, { x: hp.x - top().w / 2, w: top().w, col: COLS[floors.length % COLS.length] }, hp.y + 20);
      c.restore();
      g.text(String(h - 1), E.W - 12, 24, { size: 16, color: '#fff', align: 'right' }); g.text('ANDARES', E.W - 12, 42, { size: 5, color: '#ffd23f', align: 'right' });
    };
    sc.dbg = { end() { api.lives = 1; drop = { x: -500, y: -1000, w: 10, vy: 0, col: '#fff' }; } };
    return sc;
  });
})();
