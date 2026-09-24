/* =====================================================================
   scenes/maze.js — LABIRINTO DE COLETA (visão de cima, estilo arcade)
   Fase 2-1 Labirinto das Culturas: levar cada símbolo ao ALTAR DA
   ORIGEM certa; Sombras da Generalização perseguem; o poder EMPATIA
   deixa atravessar as sombras e revela pistas. Cada conjunto completo
   abre explicação ou questão.
   Regras de arcade (pedido do usuário, set/2026): encostar num monstro
   faz o Gabriel voltar ao início (sem perder itens); o poder deixa os
   monstros assustados (azuis), acelera a música e, ao serem pegos, os
   monstros viram "olhos" que voltam para a base e renascem. Cada item
   e cada altar têm DESENHO + NOME; ao pegar um item o jogo pausa num
   cartão com o nome (qualquer tecla continua).
   Fase 3-3 Energia para Todos: levar energia às casas da periferia
   (Vírus do Mapa atrapalham) e consertar a rede num quebra-cabeça de
   infraestrutura. Sala bônus 3: coleta relâmpago.
   Layout original (não copia labirintos comerciais).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const CS = 16, OX = 0, OY = 17;
  const GRID = [
    '#########################',
    '#A......#.......#......B#',
    '#.##.##.#.#####.#.##.##.#',
    '#.......................#',
    '#.##.#.###.#.#.###.#.##.#',
    '#....#.....#.#.....#....#',
    '####.###.#.....#.###.####',
    '#........#.#.#.#........#',
    '#.##.###.#.#.#.#.###.##.#',
    '#.......................#',
    '#.##.##.###.#.###.##.##.#',
    '#...........C...........#',
    '#########################'
  ];
  const DIRS = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  const OPP = { left: 'right', right: 'left', up: 'down', down: 'up' };

  /* Itens: [nome, altar, explicação, ilustração]. Altares: {letra: [nome, ilustração | 'mapa:<região>']}. */
  const SETS = {
    c2s1: [
      { altars: { A: ['Indígena', 'pena'], B: ['Africana', 'africa'], C: ['Portuguesa/europeia', 'bandeira_pt'] }, items: [['Rede para descansar', 'A', 'A rede para descansar é influência indígena.', 'rede'], ['Balangandãs', 'B', 'Balangandãs: adornos de influência africana.', 'diamante'], ['Três refeições (café, almoço, jantar)', 'C', 'As três refeições principais são influência portuguesa/europeia.', 'refeicao']], after: { cards: ['set1', 'miscig'] } },
      { altars: { A: ['Indígena', 'pena'], B: ['Africana', 'africa'], C: ['Portuguesa', 'bandeira_pt'] }, items: [['Festa do Divino', 'C', 'A Festa do Divino tem origem portuguesa.', 'pomba'], ['Samba de roda', 'B', 'O samba de roda surgiu na Bahia, com forte influência africana.', 'dancarina_dark'], ['Toré', 'A', 'O toré é manifestação de comunidades indígenas.', 'maracas']], after: { q: 'GEO-C2-Q10' } },
      { altars: { A: ['Norte', 'mapa:norte'], B: ['Nordeste', 'mapa:nordeste'], C: ['Sul', 'mapa:sul'] }, items: [['Influência indígena', 'A', 'A influência indígena é destacada no Norte.', 'pena'], ['Influência africana', 'B', 'A influência africana é destacada no Nordeste.', 'atabaque'], ['Influência alemã', 'C', 'A influência alemã é destacada no Sul.', 'bandeira_de']], intro: ['Agora os altares mostram **regiões**! Leve cada influência à região onde o livro a destaca.'], after: { q: 'GEO-C2-Q11' } }
    ],
    c3s3: [
      { altars: { A: ['Casa da periferia 1', 'casa'], B: ['Casa da periferia 2', 'casa'], C: ['Casa da periferia 3', 'casa'] }, energy: true, items: [['Energia', '*', null, 'raio'], ['Energia', '*', null, 'raio'], ['Energia', '*', null, 'raio']], after: { cards: ['desig'], q: 'GEO-C3-Q09' } },
      { puzzle: true, after: { q: 'GEO-C3-Q10' } }
    ],
    b3: [{ bonus: true, altars: {}, items: [] }]
  };
  const altName = (a) => (Array.isArray(a) ? a[0] : a);
  const altIcon = (a) => (Array.isArray(a) ? a[1] : null);
  /** Mini mapa do Brasil com a região destacada (desenho de verdade, sem letras). */
  const mapCache = {};
  function regionMap(rid, px) {
    const key = rid + px; if (mapCache[key]) return mapCache[key];
    const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * 639 / 613);
    const x = c.getContext('2d');
    GG.maps.drawCanvas(x, 0, 0, px, (s) => (s.region === rid ? (GG.maps.REGIONS.find((r) => r.id === rid) || {}).c || '#ffd23f' : 'rgba(255,255,255,.28)'), 'rgba(20,20,40,.55)');
    mapCache[key] = c; return c;
  }
  // música acelerada do poder (mesmas notas do labirinto, bem mais rápida)
  GG.audio.addSong('labirinto_poder', { bpm: 190, wave: 'square', lead: 'C5 - D#5 - G5 - D#5 - F5 - D5 - A#4 - - - C5 - D#5 - G5 - C6 - A#5 - G5 - F5 - - -', bass: 'C3 C3 - C3 G#2 G#2 - G#2 A#2 A#2 - A#2 G2 G2 - G2', drums: 'k h s h k h s s' });

  GEO.scenes.maze = function (ctx) {
    const def = ctx.def, energy = def.id === 'c3s3', bonus = !!def.bonus;
    const sets = SETS[def.bonus ? 'b3' : def.id];
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const cell = (x, y) => (GRID[y] && GRID[y][x]) || '#';
    const open = (x, y) => cell(x, y) !== '#';
    const altarPos = {}; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if ('ABC'.includes(ch)) altarPos[ch] = { x, y }; }));
    const dots = []; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '.' && Math.random() < 0.7) dots.push({ x, y, got: false }); }));
    const START = { x: 12, y: 7 }, HOUSE = { x: 12, y: 5 };
    const SPAWNS = [[1, 11], [23, 11], [12, 3]];
    const p = { cx: START.x, cy: START.y, x: START.x * CS, y: START.y * CS, dir: 'left', want: 'left', moving: true, inv: 0 };
    // monstros: 0 persegue direto, 1 tenta cortar o caminho (4 casas à frente), 2 persegue e às vezes vagueia
    const foes = SPAWNS.map((q, i) => ({ i, cx: q[0], cy: q[1], x: q[0] * CS, y: q[1] * CS, dir: i % 2 ? 'left' : 'right', mode: 'chase', wait: 0 }));
    const powers = [];
    let setI = 0, items = [], carry = null, busy = false, finished = false, power = 0, frags = [], bonusT = 75;
    let ready = 0, dying = 0, freeze = 0, eatChain = 0, chomp = 0, deaths = 0;
    ctx.fragTotal = 0; ctx.actionMax = 120;
    if (bonus) { ctx.learnMax = 100; }
    if (ctx.resume && ctx.resume.data && ctx.resume.data.set != null) setI = ctx.resume.data.set;
    function freeCells() { const out = []; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '.' && Math.abs(x - 12) + Math.abs(y - 7) > 3 && !(x === HOUSE.x && y === HOUSE.y)) out.push({ x, y }); })); return U.shuffle(out); }
    function loadSet() {
      const S = sets[setI]; if (!S) return;
      items = []; carry = null; powers.length = 0;
      [[1, 5], [23, 5], [1, 9], [23, 9]].forEach((q) => powers.push({ x: q[0], y: q[1], got: false }));
      if (S.bonus) { frags = freeCells().slice(0, 10).map((c) => ({ x: c.x, y: c.y, got: false })); ctx.fragTotal = frags.length; ctx.setGoal('Colete os 10 fragmentos antes do tempo acabar! Pegue um poder e derrote os Vírus.'); resetPositions(); return; }
      if (S.puzzle) return;
      const cells = freeCells();
      S.items.forEach((it, i) => items.push({ name: it[0], target: it[1], fb: it[2], icon: it[3], x: cells[i].x, y: cells[i].y, home: { x: cells[i].x, y: cells[i].y }, done: false }));
      const fc = freeCells().slice(10, 13); frags = frags.concat(fc.map((c) => ({ x: c.x, y: c.y, got: false }))); ctx.fragTotal = frags.length;
      ctx.setGoal(energy ? 'Pegue a energia e leve às casas da periferia.' : 'Pegue um símbolo e leve ao Altar da Origem certo.');
      resetPositions();
    }
    /** Volta Gabriel e monstros para o começo (mantém itens, carga e pontos). */
    function resetPositions() {
      p.cx = START.x; p.cy = START.y; p.x = p.cx * CS; p.y = p.cy * CS; p.dir = 'left'; p.want = 'left'; p.inv = 0;
      foes.forEach((f) => { const q = SPAWNS[f.i]; f.cx = q[0]; f.cy = q[1]; f.x = q[0] * CS; f.y = q[1] * CS; f.mode = 'chase'; f.wait = 0; });
      if (power > 0) { power = 0; if (def.music) GG.audio.music(def.music); }
      ready = 1.6;
    }
    sc.begin = async function () {
      if (!ctx.resume) ctx.checkpoint({ set: 0 });
      await startSet();
    };
    async function startSet() {
      const S = sets[setI];
      if (!S) { finish(); return; }
      if (S.puzzle) { await run(puzzle); return; }
      if (S.intro) await ctx.say('gaia', S.intro);
      loadSet();
    }
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function finish() { finished = true; run(async () => { if (power > 0 && def.music) GG.audio.music(def.music); GG.audio.sfx('win'); if (bonus) ctx.learnPts = Math.round(100 * frags.filter((f) => f.got).length / Math.max(1, frags.length)); if (!ctx.damage) ctx.addAction(40); await ctx.finish(); }); }
    async function setDone() {
      const S = sets[setI];
      GG.audio.sfx('win'); E.fx.confetti(12 * CS, 7 * CS + OY, 40);
      if (power > 0) { power = 0; if (def.music) GG.audio.music(def.music); }
      if (S.after) { if (S.after.cards) for (const k of S.after.cards) await ctx.cards(k); if (S.after.q) await ctx.q(S.after.q); }
      setI++; ctx.checkpoint({ set: setI });
      await startSet();
    }
    /** Cartão que PAUSA o jogo ao pegar um item: desenho + nome; qualquer tecla continua. */
    function pickupCard(it) {
      const S = sets[setI], X = GEO.gfx;
      const dest = Object.keys(S.altars).map((k) => altName(S.altars[k]));
      const lines = it.target === '*' ? ['Leve a energia para uma **casa da periferia** que ainda está no escuro.'] : ['Leve ao altar certo: ' + dest.map((d) => '**' + d + '**').join(', ').replace(/, ([^,]*)$/, ' ou $1') + '?'];
      if (!X || !X.readCard) { GG.ui.toast('Você pegou: ' + it.name, 'ok'); return Promise.resolve(); }
      return X.readCard({ kicker: '✨ ITEM COLETADO!', icon: it.icon, title: it.name, lines, color: energy ? '#ffe066' : '#ff8fd0' });
    }

    // ---------------- quebra-cabeça da rede (infraestrutura)
    function puzzle() {
      return new Promise((resolve) => {
        const m = GG.ui.modal({ title: '🔌 Conserte a rede elétrica', wide: true, noClose: true });
        m.body.appendChild(U.el('p', null, 'Gire as peças (toque nelas) para levar a energia da ⚡ Usina até as 🏠 três casas. Energia e outros serviços são infraestrutura: um direito de todos.'));
        // conexões: bits N=1 E=2 S=4 W=8
        const SOL = [
          [6, 12, 6, 10, 10],
          [0, 0, 5, 0, 0],
          [10, 10, 11, 10, 14],
          [3, 10, 0, 0, 3]
        ];
        const houses = [[0, 4], [2, 4], [3, 4]].map(([r, c]) => ({ r, c }));
        const R = SOL.length, Cc = SOL[0].length;
        const rot = (v) => ((v << 1) & 15) | (v >> 3);
        const grid = SOL.map((row) => row.map((v) => { let x = v; const n = Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) x = rot(x); return x; }));
        if (grid.every((row, r) => row.every((v, c) => v === SOL[r][c]))) grid[0][0] = rot(grid[0][0]);
        const glyph = (v) => ({ 0: ' ', 5: '│', 10: '─', 3: '└', 6: '┌', 12: '┐', 9: '┘', 7: '├', 14: '┬', 13: '┤', 11: '┴', 15: '┼', 1: '╵', 2: '╶', 4: '╷', 8: '╴' }[v] || '?');
        const box = U.el('div', { class: 'pz-grid', style: { gridTemplateColumns: 'repeat(' + (Cc + 2) + ', 52px)' } });
        const cells = [];
        function lit() {
          const on = SOL.map((row) => row.map(() => false)); const q = [[2, 0]];
          if (grid[2][0] & 8) on[2][0] = true; else return on;
          while (q.length) { const [r, c] = q.shift(); const v = grid[r][c]; [[1, -1, 0, 4], [2, 0, 1, 8], [4, 1, 0, 1], [8, 0, -1, 2]].forEach(([b, dr, dc, opp]) => { const nr = r + dr, nc = c + dc; if ((v & b) && nr >= 0 && nr < R && nc >= 0 && nc < Cc && (grid[nr][nc] & opp) && !on[nr][nc]) { on[nr][nc] = true; q.push([nr, nc]); } }); }
          return on;
        }
        function draw() {
          box.innerHTML = ''; const on = lit();
          for (let r = 0; r < R; r++) {
            box.appendChild(U.el('div', { class: 'pz-cell pz-side' }, r === 2 ? '⚡' : ''));
            for (let c = 0; c < Cc; c++) {
              const b = U.el('button', { type: 'button', class: 'pz-cell' + (on[r][c] ? ' on' : ''), 'aria-label': 'Peça linha ' + (r + 1) + ' coluna ' + (c + 1), onclick: () => { if (!grid[r][c]) return; grid[r][c] = rot(grid[r][c]); GG.audio.sfx('click'); draw(); check(); } }, glyph(grid[r][c]));
              cells.push(b); box.appendChild(b);
            }
            const h = houses.find((x) => x.r === r); box.appendChild(U.el('div', { class: 'pz-cell pz-side' + (h && on[h.r][h.c] && (grid[h.r][h.c] & 2) ? ' lit' : '') }, h ? '🏠' : ''));
          }
        }
        const msg = U.el('p', { class: 'tip' });
        function check() {
          const on = lit();
          const ok = houses.every((h) => on[h.r][h.c] && (grid[h.r][h.c] & 2));
          if (ok) { msg.textContent = '✔ Rede consertada! As três casas têm energia.'; GG.audio.sfx('win'); ctx.addAction(30); m.setActions([GG.ui.btn('Continuar ▶', 'pri', () => { m.close(); resolve(); })]); }
        }
        m.body.appendChild(box); m.body.appendChild(msg);
        m.setActions([GG.ui.btn('💡 Dica', 'small', () => { for (let r = 0; r < R; r++) for (let c = 0; c < Cc; c++) if (grid[r][c] !== SOL[r][c]) { grid[r][c] = SOL[r][c]; draw(); check(); msg.textContent = 'A Gaia girou uma peça para você.'; return; } })]);
        draw();
        QZ_PUZ = { solve() { for (let r = 0; r < R; r++) for (let c = 0; c < Cc; c++) grid[r][c] = SOL[r][c]; draw(); check(); } };
      }).then(() => setDone());
    }
    let QZ_PUZ = null;

    function stepEntity(e, speed, dt, choose) {
      const tx = e.cx * CS, ty = e.cy * CS;
      const at = Math.abs(e.x - tx) < 0.01 && Math.abs(e.y - ty) < 0.01;
      if (at) {
        const nd = choose(e);
        if (nd) { e.dir = nd; const d = DIRS[nd]; if (open(e.cx + d[0], e.cy + d[1])) { e.cx += d[0]; e.cy += d[1]; } }
      }
      const gx = e.cx * CS, gy = e.cy * CS, dx = gx - e.x, dy = gy - e.y, dist = Math.hypot(dx, dy);
      if (dist > 0) { const mv = Math.min(dist, speed * dt); e.x += dx / dist * mv; e.y += dy / dist * mv; }
    }
    /** Próximo passo pelo menor caminho (busca em largura) — usado pelos "olhos" voltando para a base. */
    function bfsDir(fx, fy, tx, ty) {
      const key = (x, y) => x + ',' + y, prev = {}, q = [[fx, fy]]; prev[key(fx, fy)] = null;
      while (q.length) {
        const [x, y] = q.shift(); if (x === tx && y === ty) break;
        for (const k of Object.keys(DIRS)) { const nx = x + DIRS[k][0], ny = y + DIRS[k][1]; if (open(nx, ny) && !(key(nx, ny) in prev)) { prev[key(nx, ny)] = [x, y, k]; q.push([nx, ny]); } }
      }
      let cur = prev[key(tx, ty)], dir = null; if (cur === undefined) return null;
      let node = [tx, ty];
      while (prev[key(node[0], node[1])]) { const pr = prev[key(node[0], node[1])]; dir = pr[2]; node = [pr[0], pr[1]]; }
      return dir;
    }
    function chaseTarget(f) {
      if (f.i === 1) { const d = DIRS[p.dir] || [0, 0]; return { x: p.cx + d[0] * 4, y: p.cy + d[1] * 4 }; }
      if (f.i === 2 && Math.hypot(f.cx - p.cx, f.cy - p.cy) < 5) return { x: SPAWNS[2][0], y: SPAWNS[2][1] }; // tímido: foge quando chega perto
      return { x: p.cx, y: p.cy };
    }
    function startPower() {
      power = 7; eatChain = 0; GG.audio.sfx('power'); if (def.music || bonus) GG.audio.music('labirinto_poder');
      foes.forEach((f) => { if (f.mode === 'chase') { f.mode = 'fright'; f.dir = OPP[f.dir]; } });
      if (GEO.gfx) { GEO.gfx.flash(energy || bonus ? '#9ff2ff' : '#ff8fd0', 0.35); GEO.gfx.ring(p.x + 8, p.y + 8 + OY, '#ffffff', 60); }
      E.fx.float(p.x + 8, p.y + OY - 6, energy || bonus ? 'ESCUDO!' : 'EMPATIA!', '#9ff2ff');
    }
    function endPower() { power = 0; foes.forEach((f) => { if (f.mode === 'fright') f.mode = 'chase'; }); if (def.music) GG.audio.music(def.music); }
    function caught() {
      dying = 1.3; deaths++; GG.audio.sfx('hit'); GG.audio.jingle([660, 520, 400, 300, 200], 'square', 0.1); E.shake(4, 0.3);
      if (GEO.gfx) GEO.gfx.flash('#ff4d4d', 0.35);
      // perde um coração (só visual) — a punição é voltar ao início; sem a mensagem de checkpoint
      ctx.damage++; ctx.energy = ctx.energy > 1 ? ctx.energy - 1 : ctx.maxEnergy; ctx.hud();
    }

    sc.update = function (dt) {
      sc.t += dt;
      if (busy || finished) return;
      if (freeze > 0) { freeze -= dt; return; }
      if (dying > 0) { dying -= dt; if (dying <= 0) { resetPositions(); GG.ui.toast('Pego! De volta ao início — seus itens continuam com você.', '', 2000); } return; }
      if (ready > 0) { ready -= dt; return; }
      ctx.tick(dt);
      const IN = GG.input;
      ['left', 'right', 'up', 'down'].forEach((k) => { if (IN.down(k)) p.want = k; });
      stepEntity(p, 74 * ctx.speed, dt, (e) => { const w = DIRS[p.want]; if (open(e.cx + w[0], e.cy + w[1])) return p.want; const d = DIRS[e.dir]; return open(e.cx + d[0], e.cy + d[1]) ? e.dir : null; });
      if (p.inv > 0) p.inv -= dt;
      if (power > 0) { power -= dt; if (power <= 0) endPower(); }
      const base = (bonus ? 66 : 58) + setI * 4;
      foes.forEach((f) => {
        if (f.mode === 'house') { f.wait -= dt; if (f.wait <= 0) f.mode = power > 0 ? 'fright' : 'chase'; return; }
        const sp = f.mode === 'eyes' ? 150 : f.mode === 'fright' ? 36 : base;
        stepEntity(f, sp, dt, (e) => {
          if (f.mode === 'eyes') { if (e.cx === HOUSE.x && e.cy === HOUSE.y) { f.mode = 'house'; f.wait = 2.5; return null; } return bfsDir(e.cx, e.cy, HOUSE.x, HOUSE.y); }
          const opts = Object.keys(DIRS).filter((k) => k !== OPP[e.dir] && open(e.cx + DIRS[k][0], e.cy + DIRS[k][1]));
          if (!opts.length) return OPP[e.dir];
          if (f.mode === 'fright' || Math.random() < 0.12) return U.pick(opts);
          const tg = chaseTarget(f);
          opts.sort((a, b) => Math.hypot(e.cx + DIRS[a][0] - tg.x, e.cy + DIRS[a][1] - tg.y) - Math.hypot(e.cx + DIRS[b][0] - tg.x, e.cy + DIRS[b][1] - tg.y));
          return opts[0];
        });
        if (f.mode !== 'eyes' && Math.hypot(f.x - p.x, f.y - p.y) < 10) {
          if (f.mode === 'fright') {
            f.mode = 'eyes'; eatChain++; const pts = 5 * Math.pow(2, eatChain - 1); ctx.addAction(pts); freeze = 0.35;
            GG.audio.sfx('boom'); if (GEO.gfx) { GEO.gfx.sparkle(f.x + 8, f.y + 8 + OY, '#9ff2ff', 8); GEO.gfx.pop(f.x + 8, f.y + OY, '+' + pts * 10, '#9ff2ff', 9); }
            if (!energy && !bonus && carry && carry.target !== '*') { const S = sets[setI]; GG.ui.toast('💡 Pista da Empatia: “' + carry.name + '” vai para o altar ' + altName(S.altars[carry.target]) + '.', 'ok', 3200); }
          } else if (f.mode === 'chase' && p.inv <= 0) { caught(); }
        }
      });
      if (dying > 0) return;
      // coletas
      dots.forEach((d) => { if (!d.got && d.x === p.cx && d.y === p.cy) { d.got = true; ctx.addAction(0.2); chomp++; if (chomp % 2 === 0) GG.audio.note(chomp % 4 ? 'C5' : 'G4', 0.05, 'square'); if (dots.every((z) => z.got)) { ctx.addAction(20); E.fx.float(p.x, p.y + OY, 'LIMPOU TUDO!', '#ffd23f'); GG.audio.sfx('ok'); } } });
      frags.forEach((f) => { if (!f.got && ((f.x === p.cx && f.y === p.cy) || (ctx.magnet && Math.abs(f.x - p.cx) + Math.abs(f.y - p.cy) <= 1))) { f.got = true; ctx.fragment(f.x * CS + 8, f.y * CS + 8 + OY); } });
      powers.forEach((pw) => { if (!pw.got && pw.x === p.cx && pw.y === p.cy) { pw.got = true; startPower(); } });
      if (!carry) {
        const it = items.find((i) => !i.done && i.x === p.cx && i.y === p.cy);
        if (it) { carry = it; GG.audio.sfx('coin'); ctx.setGoal('Levando: ' + it.name + ' → qual altar?'); if (GEO.gfx) GEO.gfx.sparkle(p.x + 8, p.y + 8 + OY, '#fff0a0', 6); run(() => pickupCard(it)); return; }
      }
      // entrega
      if (carry) {
        const S = sets[setI];
        const alt = Object.keys(altarPos).find((k) => altarPos[k].x === p.cx && altarPos[k].y === p.cy && S.altars[k]);
        if (alt) {
          const it = carry;
          if (it.target === '*' ? !S._lit || !S._lit[alt] : it.target === alt) {
            it.done = true; carry = null; if (it.target === '*') { S._lit = S._lit || {}; S._lit[alt] = true; }
            GG.audio.sfx('ok'); E.fx.burst(p.x + 8, p.y + 8 + OY, ['#ffd23f', '#7bff8f', '#fff'], 18, 100); ctx.addAction(10);
            if (GEO.gfx) { GEO.gfx.ring(p.x + 8, p.y + 8 + OY, '#7bff8f', 40); GEO.gfx.pop(p.x + 8, p.y + OY - 4, 'CERTO!', '#7bff8f', 10); }
            if (it.target !== '*') { GEO.campaign.recordCheck(true, 'Origens — ' + def.title); ctx.learnPts += 15; ctx.learnMax += 15; GG.ui.toast('✔ ' + it.fb, 'ok', 2600); }
            else GG.ui.toast('💡 ' + altName(S.altars[alt]) + ' tem energia!', 'ok');
            ctx.setGoal(energy ? 'Leve energia às outras casas.' : 'Pegue outro símbolo.');
            if (items.every((i) => i.done)) run(setDone);
          } else if (!S._wrongT || sc.t - S._wrongT > 1.5) {
            S._wrongT = sc.t;
            if (it.target === '*') { GG.ui.toast('Esta casa já tem energia. Leve para outra!', '', 2000); }
            else {
              GEO.campaign.recordCheck(false, 'Origens — ' + def.title); ctx.learnMax += 15; GG.audio.sfx('bad');
              run(async () => { await ctx.say('gaia', ['Hum, **' + it.name + '** não é deste altar. ' + (it.fb || ''), 'O símbolo voltou para o lugar. Tente de novo!']); });
              it.x = it.home.x; it.y = it.home.y; carry = null; ctx.setGoal('Pegue o símbolo de novo e escolha outro altar.');
            }
          }
        }
      }
      if (bonus && !finished) { bonusT -= dt; if (frags.every((f) => f.got) || bonusT <= 0) finish(); }
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    /* paredes neon pré-desenhadas uma vez (brilho sem custo por quadro) */
    let wallsHD = null;
    function buildWalls() {
      const X = GEO.gfx, K = 3, blue = energy || bonus;
      return X.mk(GRID[0].length * CS * K, GRID.length * CS * K, (w) => {
        w.scale(K, K);
        GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch !== '#') return; const px = x * CS, py = y * CS; const gr = w.createLinearGradient(0, py, 0, py + CS); gr.addColorStop(0, blue ? '#16466c' : '#46266c'); gr.addColorStop(1, blue ? '#0e2c48' : '#2c1648'); w.fillStyle = gr; w.fillRect(px, py, CS, CS); }));
        w.shadowColor = blue ? '#3ec1ff' : '#ff4fa8'; w.shadowBlur = 6 * K; w.strokeStyle = blue ? '#7fdcff' : '#ff8fd0'; w.lineWidth = 1.2; w.lineCap = 'round';
        for (let pass = 0; pass < 2; pass++) {
          w.beginPath();
          GRID.forEach((row, y) => row.split('').forEach((ch, x) => {
            if (ch !== '#') return; const px = x * CS, py = y * CS;
            if (open(x, y - 1)) { w.moveTo(px, py + 0.6); w.lineTo(px + CS, py + 0.6); }
            if (open(x, y + 1)) { w.moveTo(px, py + CS - 0.6); w.lineTo(px + CS, py + CS - 0.6); }
            if (open(x - 1, y)) { w.moveTo(px + 0.6, py); w.lineTo(px + 0.6, py + CS); }
            if (open(x + 1, y)) { w.moveTo(px + CS - 0.6, py); w.lineTo(px + CS - 0.6, py + CS); }
          }));
          w.stroke(); w.shadowBlur = 0; w.strokeStyle = '#ffffff'; w.lineWidth = 0.4;
        }
      });
    }
    /** Desenha a ilustração do item/altar: ícone 3D ou mini mapa da região. */
    function drawArt(c, X, ic, x, y, s) {
      if (!ic) return false;
      if (ic.indexOf('mapa:') === 0) { const m = regionMap(ic.slice(5), 64); X.hd(c, () => c.drawImage(m, x - s / 2, y - s / 2, s, s * m.height / m.width)); return true; }
      return X.ilus(c, ic, x, y, s);
    }
    function drawFoe(g, c, X, f) {
      const x = f.x + 8, y = f.y + 8;
      if (f.mode === 'eyes' || f.mode === 'house' && f.wait > 1.8) {
        [-3, 3].forEach((ox) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + ox, y - 1, 2.6, 3.2, 0, 0, Math.PI * 2); c.fill(); const d = DIRS[f.dir] || [0, 0]; c.fillStyle = '#2a5bd8'; c.beginPath(); c.arc(x + ox + d[0] * 1.2, y - 1 + d[1] * 1.2, 1.4, 0, Math.PI * 2); c.fill(); });
        return;
      }
      if (f.mode === 'fright') {
        const blink = power < 2 && Math.floor(sc.t * 8) % 2;
        if (X) X.glow(c, x, y, 12, blink ? '#ffffff' : '#3e6bff', 0.6);
        c.fillStyle = blink ? '#f4f4ff' : '#2e4fd8'; c.beginPath(); c.arc(x, y - 1, 6.5, Math.PI, 0); c.lineTo(x + 6.5, y + 6); for (let i = 0; i < 4; i++) c.lineTo(x + 6.5 - (i + 0.5) * 3.25, y + (i % 2 ? 6 : 3.5 + Math.sin(sc.t * 20) * 0.8)); c.lineTo(x - 6.5, y + 6); c.closePath(); c.fill();
        c.fillStyle = blink ? '#e5484d' : '#ffd0d0'; c.fillRect(x - 3, y - 3, 2, 2); c.fillRect(x + 1, y - 3, 2, 2);
        c.strokeStyle = blink ? '#e5484d' : '#ffd0d0'; c.lineWidth = 0.8; c.beginPath(); for (let i = 0; i < 5; i++) c.lineTo(x - 4 + i * 2, y + 2 + (i % 2)); c.stroke();
        return;
      }
      if (f.mode === 'house') { c.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(sc.t * 8)); }
      if (X) X.glow(c, x, y, 12, energy || bonus ? '#7bff8f' : '#b07bff', 0.45);
      const im = energy || bonus ? P.virus(Math.floor(sc.t * 4) % 2) : P.sombra(Math.floor(sc.t * 4) % 2, false);
      g.img(im, f.x + 1, f.y + 1);
      c.globalAlpha = 1;
    }
    sc.draw = function (g) {
      const c = g.ctx(), X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      c.fillStyle = energy || bonus ? '#0b1624' : '#1a1030'; c.fillRect(0, 0, E.W, E.H);
      if (X) { const bg = c.createRadialGradient(E.W / 2, E.H / 2, 20, E.W / 2, E.H / 2, 260); bg.addColorStop(0, power > 0 ? (energy || bonus ? '#1b4a80' : '#4a1f6a') : energy || bonus ? '#123055' : '#301a55'); bg.addColorStop(1, energy || bonus ? '#050b16' : '#0c0618'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H); }
      g.world({ x: -OX, y: -OY });
      if (X) { if (!wallsHD) wallsHD = buildWalls(); X.hd(c, () => c.drawImage(wallsHD, 0, 0, GRID[0].length * CS, GRID.length * CS)); }
      else GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '#') { c.fillStyle = energy || bonus ? '#123a5a' : '#3a1f5a'; c.fillRect(x * CS, y * CS, CS, CS); } }));
      // base dos monstros
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([2, 2]); c.strokeRect(HOUSE.x * CS + 1, HOUSE.y * CS + 1, CS - 2, CS - 2); c.setLineDash([]);
      dots.forEach((d) => { if (!d.got) g.rect(d.x * CS + 7, d.y * CS + 7, 2, 2, '#f3d78a'); });
      const S = sets[setI] || {};
      Object.keys(altarPos).forEach((k) => {
        const a = altarPos[k]; if (!S.altars || !S.altars[k]) return;
        const lit = S._lit && S._lit[k], ax = a.x * CS + 8, ay = a.y * CS + 8, icon = altIcon(S.altars[k]);
        if (X) {
          X.glow(c, ax, ay, energy ? (lit ? 26 : 12) : 20, energy ? (lit ? '#ffe066' : '#6fa0ff') : '#ffd23f', energy ? (lit ? 0.9 : 0.35) : 0.45 + 0.2 * Math.sin(sc.t * 3));
          if (!energy) { c.strokeStyle = '#ffd23f'; c.lineWidth = 1.2; c.beginPath(); c.arc(ax, ay, 8 + Math.sin(sc.t * 3), 0, Math.PI * 2); c.stroke(); }
          if (!drawArt(c, X, energy ? (lit ? 'casa_jardim' : 'casa') : icon, ax, ay - 1, energy ? 16 : 15)) g.rect(ax - 4, ay - 4, 8, 8, '#b07bff');
        } else { g.circle(ax, ay, 7 + Math.sin(sc.t * 3), '#ffd23f', 2); g.rect(ax - 4, ay - 4, 8, 8, '#b07bff'); }
        C.sign(g, ax, a.y === 1 ? a.y * CS + 18 : a.y * CS - 16, altName(S.altars[k]), null, E.W);
      });
      powers.forEach((pw) => { if (!pw.got) { const r = 4 + Math.sin(sc.t * 6) * 1.2; if (X) X.glow(c, pw.x * CS + 8, pw.y * CS + 8, 16, energy || bonus ? '#9ff2ff' : '#ff8fc8', 0.9); if (!(X && X.ilus(c, energy || bonus ? 'escudo' : 'coracao', pw.x * CS + 8, pw.y * CS + 8, 10 + r))) g.circle(pw.x * CS + 8, pw.y * CS + 8, r, energy ? '#9ff2ff' : '#ff8fc8'); } });
      frags.forEach((f) => { if (!f.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), f.x * CS + 2, f.y * CS + 2); });
      items.forEach((it) => {
        if (it.done || it === carry) return;
        const ix = it.x * CS + 8, iy = it.y * CS + 8 + Math.sin(sc.t * 4 + it.x) * 1.5;
        if (X) { X.glow(c, ix, iy, 14, energy ? '#ffe066' : '#fff0c0', 0.7); if (!drawArt(c, X, it.icon, ix, iy, 15)) g.panel(ix - 7, iy - 7, 14, 14, '#fff3d1', '#15152a'); }
        else g.panel(ix - 7, iy - 7, 14, 14, '#fff3d1', '#15152a');
        if (!energy) { const w = Math.min(80, g.textW(it.name, 4) + 6), lx = Math.max(w / 2 + 2, Math.min(E.W - w / 2 - 2, ix)); g.panel(lx - w / 2, iy + 8, w, 8, 'rgba(15,18,38,.85)', '#ffd23f'); g.text(it.name, lx, iy + 10, { size: 4, color: '#fff', align: 'center', shadow: false, maxW: w - 4 }); }
      });
      foes.forEach((f) => drawFoe(g, c, X, f));
      if (X) X.glow(c, p.x + 8, p.y + 6, 34, energy || bonus ? '#bfe8ff' : '#ffd0f0', 0.35);
      if (dying > 0) {
        const k = 1 - dying / 1.3, im = C.gabrielTop(ctx.look, 'down', false, sc.t);
        c.save(); c.translate(p.x + 8, p.y + 6); c.rotate(k * Math.PI * 4); c.scale(1 - k * 0.9, 1 - k * 0.9); c.drawImage(im, -7, -10); c.restore();
      } else if (!(p.inv > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielTop(ctx.look, p.dir, true, sc.t), p.x + 1, p.y - 4, { scale: 0.9, flip: p.dir === 'right' });
      if (carry && dying <= 0) { if (X) { X.glow(c, p.x + 9, p.y - 8, 10, '#ffe066', 0.8); if (!drawArt(c, X, carry.icon, p.x + 9, p.y - 8, 12)) g.panel(p.x + 4, p.y - 12, 10, 10, '#fff3d1', '#15152a'); } else g.panel(p.x + 4, p.y - 12, 10, 10, energy ? '#ffe066' : '#fff3d1', '#15152a'); }
      g.end();
      g.panel(0, 0, E.W, 16, 'rgba(15,18,38,.95)', '#15152a');
      g.text(carry ? 'Levando: ' + carry.name : bonus ? 'Tempo: ' + Math.ceil(bonusT) + ' s' : energy ? 'Leve a energia às casas' : 'Leve os símbolos aos altares', 6, 5, { size: 6, color: '#ffd23f', maxW: 270 });
      if (power > 0) { g.rect(E.W - 96, 5, 90, 6, '#0a0c1c'); g.rect(E.W - 96, 5, 90 * power / 7, 6, power < 2 && Math.floor(sc.t * 8) % 2 ? '#ffffff' : '#9ff2ff'); g.text(energy || bonus ? 'ESCUDO' : 'EMPATIA', E.W - 100, 5, { size: 5, color: '#9ff2ff', align: 'right' }); }
      if (ready > 0 && !busy) { const k = Math.min(1, (1.6 - ready) * 4); g.panel(E.W / 2 - 50, 100, 100, 22, 'rgba(15,18,38,.9)', '#ffd23f'); g.text(ready > 0.5 ? 'PRONTO?' : 'VAI!', E.W / 2, 106, { size: 9 * k + 1, color: ready > 0.5 ? '#ffd23f' : '#7bff8f', align: 'center' }); }
      if (dying > 0) g.text('PEGO!', E.W / 2, 100, { size: 14, color: '#ff5d6c', align: 'center' });
    };
    sc.dbg = {
      p, foes, busy: () => busy, items: () => items, set: () => setI, power: () => power, deaths: () => deaths, carry: () => carry,
      deliverAll() { const S = sets[setI]; if (!S || S.puzzle || S.bonus) return; items.forEach((it) => { if (it.done) return; if (it.target === '*') { const k = Object.keys(S.altars).find((a) => !(S._lit && S._lit[a])); S._lit = S._lit || {}; S._lit[k] = true; } it.done = true; }); carry = null; run(setDone); },
      solvePuzzle() { if (QZ_PUZ) QZ_PUZ.solve(); },
      finishBonus() { frags.forEach((f) => { f.got = true; }); },
      /** coloca o Gabriel numa casa (testes) */
      place(x, y) { p.cx = x; p.cy = y; p.x = x * CS; p.y = y * CS; ready = 0; },
      foeAt(i, x, y) { const f = foes[i]; f.cx = x; f.cy = y; f.x = x * CS; f.y = y * CS; }
    };
    return sc;
  };
})();
