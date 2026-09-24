/* =====================================================================
   scenes/maze.js — LABIRINTO DE COLETA (visão de cima, estilo arcade)
   Fase 2-1 Labirinto das Culturas: levar cada símbolo ao ALTAR DA
   ORIGEM certa; Sombras da Generalização perseguem; o poder EMPATIA
   deixa atravessar as sombras e revela pistas. Cada conjunto completo
   abre explicação ou questão.
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

  const SETS = {
    c2s1: [
      { altars: { A: 'Indígena', B: 'Africana', C: 'Portuguesa/europeia' }, items: [['Rede para descansar', 'A', 'A rede para descansar é influência indígena.'], ['Balangandãs', 'B', 'Balangandãs: adornos de influência africana.'], ['Três refeições (café, almoço, jantar)', 'C', 'As três refeições principais são influência portuguesa/europeia.']], after: { cards: ['set1', 'miscig'] } },
      { altars: { A: 'Indígena', B: 'Africana', C: 'Portuguesa' }, items: [['Festa do Divino', 'C', 'A Festa do Divino tem origem portuguesa.'], ['Samba de roda', 'B', 'O samba de roda surgiu na Bahia, com forte influência africana.'], ['Toré', 'A', 'O toré é manifestação de comunidades indígenas.']], after: { q: 'GEO-C2-Q10' } },
      { altars: { A: 'Norte', B: 'Nordeste', C: 'Sul' }, items: [['Influência indígena', 'A', 'A influência indígena é destacada no Norte.'], ['Influência africana', 'B', 'A influência africana é destacada no Nordeste.'], ['Influência alemã', 'C', 'A influência alemã é destacada no Sul.']], intro: ['Agora os altares mostram **regiões**! Leve cada influência à região onde o livro a destaca.'], after: { q: 'GEO-C2-Q11' } }
    ],
    c3s3: [
      { altars: { A: 'Casa da periferia 1', B: 'Casa da periferia 2', C: 'Casa da periferia 3' }, energy: true, items: [['Energia ⚡', '*'], ['Energia ⚡', '*'], ['Energia ⚡', '*']], after: { cards: ['desig'], q: 'GEO-C3-Q09' } },
      { puzzle: true, after: { q: 'GEO-C3-Q10' } }
    ],
    b3: [{ bonus: true, altars: {}, items: [] }]
  };

  GEO.scenes.maze = function (ctx) {
    const def = ctx.def, energy = def.id === 'c3s3', bonus = !!def.bonus;
    const sets = SETS[def.bonus ? 'b3' : def.id];
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const cell = (x, y) => (GRID[y] && GRID[y][x]) || '#';
    const open = (x, y) => cell(x, y) !== '#';
    const altarPos = {}; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if ('ABC'.includes(ch)) altarPos[ch] = { x, y }; }));
    const dots = []; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '.' && Math.random() < 0.55) dots.push({ x, y, got: false }); }));
    const p = { cx: 12, cy: 7, x: 12 * CS, y: 7 * CS, dir: 'left', want: 'left', moving: true, inv: 0 };
    const foes = [[1, 11], [23, 11], [12, 3]].map((q, i) => ({ cx: q[0], cy: q[1], x: q[0] * CS, y: q[1] * CS, dir: i % 2 ? 'left' : 'right', calm: 0 }));
    const powers = [];
    let setI = 0, items = [], carry = null, busy = false, finished = false, power = 0, frags = [], bonusT = 75;
    ctx.fragTotal = 0; ctx.actionMax = 120;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.set != null) setI = ctx.resume.data.set;
    function freeCells() { const out = []; GRID.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === '.' && Math.abs(x - 12) + Math.abs(y - 7) > 3) out.push({ x, y }); })); return U.shuffle(out); }
    function loadSet() {
      const S = sets[setI]; if (!S) return;
      items = []; carry = null; powers.length = 0;
      if (S.bonus) { frags = freeCells().slice(0, 10).map((c) => ({ x: c.x, y: c.y, got: false })); ctx.fragTotal = frags.length; ctx.setGoal('Colete os 10 fragmentos antes do tempo acabar, fugindo dos Vírus!'); return; }
      if (S.puzzle) return;
      const cells = freeCells();
      S.items.forEach((it, i) => items.push({ name: it[0], target: it[1], fb: it[2], x: cells[i].x, y: cells[i].y, home: { x: cells[i].x, y: cells[i].y }, done: false }));
      [[1, 5], [23, 5], [1, 9], [23, 9]].forEach((q, i) => { if (i < 2) powers.push({ x: q[0], y: q[1], got: false }); });
      const fc = freeCells().slice(10, 13); frags = frags.concat(fc.map((c) => ({ x: c.x, y: c.y, got: false }))); ctx.fragTotal = frags.length;
      ctx.setGoal(energy ? 'Pegue a energia ⚡ e leve às casas da periferia.' : 'Pegue um símbolo e leve ao Altar da Origem certo.');
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
    function finish() { finished = true; run(async () => { GG.audio.sfx('win'); if (!ctx.damage) ctx.addAction(40); await ctx.finish(); }); }
    async function setDone() {
      const S = sets[setI];
      GG.audio.sfx('win'); E.fx.confetti(12 * CS, 7 * CS + OY, 40);
      if (S.after) { if (S.after.cards) for (const k of S.after.cards) await ctx.cards(k); if (S.after.q) await ctx.q(S.after.q); }
      setI++; ctx.checkpoint({ set: setI });
      await startSet();
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
    sc.update = function (dt) {
      sc.t += dt;
      if (busy || finished) return;
      ctx.tick(dt);
      const IN = GG.input;
      ['left', 'right', 'up', 'down'].forEach((k) => { if (IN.down(k)) p.want = k; });
      stepEntity(p, 72 * ctx.speed, dt, (e) => { const w = DIRS[p.want]; if (open(e.cx + w[0], e.cy + w[1])) return p.want; const d = DIRS[e.dir]; return open(e.cx + d[0], e.cy + d[1]) ? e.dir : null; });
      if (p.inv > 0) p.inv -= dt;
      if (power > 0) power -= dt;
      foes.forEach((f) => {
        if (f.calm > 0) f.calm -= dt;
        stepEntity(f, (bonus ? 58 : 48) * (power > 0 ? 0.6 : 1), dt, (e) => {
          const opts = Object.keys(DIRS).filter((k) => k !== OPP[e.dir] && open(e.cx + DIRS[k][0], e.cy + DIRS[k][1]));
          if (!opts.length) return OPP[e.dir];
          if (Math.random() < 0.35 || power > 0) return U.pick(opts);
          opts.sort((a, b) => { const da = Math.hypot(e.cx + DIRS[a][0] - p.cx, e.cy + DIRS[a][1] - p.cy), db = Math.hypot(e.cx + DIRS[b][0] - p.cx, e.cy + DIRS[b][1] - p.cy); return da - db; });
          return opts[0];
        });
        if (Math.hypot(f.x - p.x, f.y - p.y) < 10) {
          if (power > 0) { if (f.calm <= 0) { f.calm = 3; ctx.addAction(5); GG.audio.sfx('power'); if (carry && carry.target !== '*') { const S = sets[setI]; GG.ui.toast('💡 Pista revelada: “' + carry.name + '” vai para o altar ' + S.altars[carry.target] + '.', 'ok', 3000); } else E.fx.float(f.x, f.y + OY, 'Empatia!', '#9ff2ff'); } }
          else if (p.inv <= 0) { p.inv = 1.5; if (ctx.hurt()) { p.cx = 12; p.cy = 7; p.x = 12 * CS; p.y = 7 * CS; } }
        }
      });
      // coletas
      dots.forEach((d) => { if (!d.got && d.x === p.cx && d.y === p.cy) { d.got = true; ctx.addAction(0.2); if (Math.random() < 0.15) GG.audio.sfx('click'); } });
      frags.forEach((f) => { if (!f.got && ((f.x === p.cx && f.y === p.cy) || (ctx.magnet && Math.abs(f.x - p.cx) + Math.abs(f.y - p.cy) <= 1))) { f.got = true; ctx.fragment(f.x * CS + 8, f.y * CS + 8 + OY); } });
      powers.forEach((pw) => { if (!pw.got && pw.x === p.cx && pw.y === p.cy) { pw.got = true; power = 8; GG.audio.sfx('power'); GG.ui.toast(energy ? '🛡️ Escudo de Direitos: atravesse os vírus!' : '💗 Empatia! Atravesse as sombras e revele pistas.', 'ok'); } });
      if (!carry) { const it = items.find((i) => !i.done && i.x === p.cx && i.y === p.cy); if (it) { carry = it; GG.audio.sfx('coin'); ctx.setGoal('Levando: ' + it.name + ' → qual altar?'); } }
      // entrega
      if (carry) {
        const S = sets[setI];
        const alt = Object.keys(altarPos).find((k) => altarPos[k].x === p.cx && altarPos[k].y === p.cy && S.altars[k]);
        if (alt) {
          const it = carry;
          if (it.target === '*' ? !S._lit || !S._lit[alt] : it.target === alt) {
            it.done = true; carry = null; if (it.target === '*') { S._lit = S._lit || {}; S._lit[alt] = true; }
            GG.audio.sfx('ok'); E.fx.burst(p.x + 8, p.y + 8 + OY, ['#ffd23f', '#7bff8f', '#fff'], 18, 100); ctx.addAction(10);
            if (it.target !== '*') { GEO.campaign.recordCheck(true, 'Origens — ' + def.title); ctx.learnPts += 15; ctx.learnMax += 15; GG.ui.toast('✔ ' + it.fb, 'ok', 2600); }
            else GG.ui.toast('💡 ' + S.altars[alt] + ' tem energia!', 'ok');
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
    sc.draw = function (g) {
      const c = g.ctx(), X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      c.fillStyle = energy || bonus ? '#0b1624' : '#1a1030'; c.fillRect(0, 0, E.W, E.H);
      if (X) { const bg = c.createRadialGradient(E.W / 2, E.H / 2, 20, E.W / 2, E.H / 2, 260); bg.addColorStop(0, energy || bonus ? '#123055' : '#301a55'); bg.addColorStop(1, energy || bonus ? '#050b16' : '#0c0618'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H); }
      g.world({ x: -OX, y: -OY });
      if (X) { if (!wallsHD) wallsHD = buildWalls(); X.hd(c, () => c.drawImage(wallsHD, 0, 0, GRID[0].length * CS, GRID.length * CS)); }
      else GRID.forEach((row, y) => row.split('').forEach((ch, x) => {
        const px = x * CS, py = y * CS;
        if (ch === '#') {
          c.fillStyle = energy || bonus ? '#123a5a' : '#3a1f5a'; c.fillRect(px, py, CS, CS);
          c.strokeStyle = energy || bonus ? '#3ec1ff' : '#e84393'; c.lineWidth = 1;
          if (!open(x, y) && open(x, y - 1)) { c.beginPath(); c.moveTo(px, py + 0.5); c.lineTo(px + CS, py + 0.5); c.stroke(); }
          if (open(x, y + 1)) { c.beginPath(); c.moveTo(px, py + CS - 0.5); c.lineTo(px + CS, py + CS - 0.5); c.stroke(); }
          if (open(x - 1, y)) { c.beginPath(); c.moveTo(px + 0.5, py); c.lineTo(px + 0.5, py + CS); c.stroke(); }
          if (open(x + 1, y)) { c.beginPath(); c.moveTo(px + CS - 0.5, py); c.lineTo(px + CS - 0.5, py + CS); c.stroke(); }
        }
      }));
      dots.forEach((d) => { if (!d.got) g.rect(d.x * CS + 7, d.y * CS + 7, 2, 2, '#f3d78a'); });
      const S = sets[setI] || {};
      Object.keys(altarPos).forEach((k) => {
        const a = altarPos[k]; if (!S.altars || !S.altars[k]) return;
        const lit = S._lit && S._lit[k];
        if (energy) { if (!X) { g.spr('town', lit ? 85 : 84, a.x * CS, a.y * CS); if (lit) g.circle(a.x * CS + 8, a.y * CS + 4, 3, '#ffe066'); } }
        else { g.circle(a.x * CS + 8, a.y * CS + 8, 7 + Math.sin(sc.t * 3), '#ffd23f', 2); g.rect(a.x * CS + 4, a.y * CS + 4, 8, 8, '#b07bff'); }
        C.sign(g, a.x * CS + 8, a.y === 1 ? a.y * CS + 18 : a.y * CS - 16, S.altars[k], null, E.W);
      });
      if (X) Object.keys(altarPos).forEach((k) => { const a = altarPos[k]; if (!S.altars || !S.altars[k]) return; const lit = S._lit && S._lit[k]; if (energy) { X.glow(c, a.x * CS + 8, a.y * CS + 8, lit ? 26 : 12, lit ? '#ffe066' : '#6fa0ff', lit ? 0.9 : 0.35); X.ilus(c, lit ? 'casa_jardim' : 'casa', a.x * CS + 8, a.y * CS + 7, 16, { gray: !lit }); } else X.glow(c, a.x * CS + 8, a.y * CS + 8, 18, '#ffd23f', 0.4 + 0.2 * Math.sin(sc.t * 3)); });
      powers.forEach((pw) => { if (!pw.got) { if (X) X.glow(c, pw.x * CS + 8, pw.y * CS + 8, 14, energy ? '#9ff2ff' : '#ff8fc8', 0.8); g.circle(pw.x * CS + 8, pw.y * CS + 8, 4 + Math.sin(sc.t * 6), energy ? '#9ff2ff' : '#ff8fc8'); } });
      frags.forEach((f) => { if (!f.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), f.x * CS + 2, f.y * CS + 2); });
      items.forEach((it) => { if (!it.done && it !== carry && X && energy) { X.glow(c, it.x * CS + 8, it.y * CS + 8, 14, '#ffe066', 0.7); X.ilus(c, 'raio', it.x * CS + 8, it.y * CS + 8 + Math.sin(sc.t * 4 + it.x) * 1.5, 15); } else if (!it.done && it !== carry) { g.panel(it.x * CS + 1, it.y * CS + 1, 14, 14, energy ? '#ffe066' : '#fff3d1', '#15152a'); g.text(energy ? '⚡' : it.name.slice(0, 1), it.x * CS + 8, it.y * CS + 3, { size: energy ? 9 : 8, color: '#6d4c8f', align: 'center', shadow: false, font: energy ? 'sans-serif' : undefined }); } });
      foes.forEach((f) => { const im = energy || bonus ? P.virus(Math.floor(sc.t * 4) % 2) : P.sombra(Math.floor(sc.t * 4) % 2, power > 0); g.img(im, f.x + 1, f.y + 1, { alpha: power > 0 ? 0.7 : 1 }); });
      if (X) X.glow(c, p.x + 8, p.y + 6, 34, energy || bonus ? '#bfe8ff' : '#ffd0f0', 0.35);
      if (!(p.inv > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielTop(ctx.look, p.dir, true, sc.t), p.x + 1, p.y - 4, { scale: 0.9, flip: p.dir === 'right' });
      if (carry) { if (X && energy) { X.glow(c, p.x + 9, p.y - 8, 10, '#ffe066', 0.8); X.ilus(c, 'raio', p.x + 9, p.y - 8, 11); } else g.panel(p.x + 4, p.y - 12, 10, 10, energy ? '#ffe066' : '#fff3d1', '#15152a'); }
      g.end();
      g.panel(0, 0, E.W, 16, 'rgba(15,18,38,.95)', '#15152a');
      g.text(carry ? 'Levando: ' + carry.name : bonus ? 'Tempo: ' + Math.ceil(bonusT) + ' s' : energy ? 'Leve energia ⚡ às casas' : 'Leve os símbolos aos altares', 6, 5, { size: 6, color: '#ffd23f', maxW: 300 });
      if (power > 0) g.text((energy ? 'ESCUDO ' : 'EMPATIA ') + Math.ceil(power), E.W - 6, 5, { size: 6, color: '#9ff2ff', align: 'right' });
    };
    sc.dbg = {
      p, busy: () => busy, items: () => items, set: () => setI,
      deliverAll() { const S = sets[setI]; if (!S || S.puzzle || S.bonus) return; items.forEach((it) => { if (it.done) return; if (it.target === '*') { const k = Object.keys(S.altars).find((a) => !(S._lit && S._lit[a])); S._lit = S._lit || {}; S._lit[k] = true; } it.done = true; }); carry = null; run(setDone); },
      solvePuzzle() { if (QZ_PUZ) QZ_PUZ.solve(); },
      finishBonus() { frags.forEach((f) => { f.got = true; }); }
    };
    return sc;
  };
})();
