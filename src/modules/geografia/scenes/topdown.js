/* =====================================================================
   scenes/topdown.js — EXPLORAÇÃO VISTA DE CIMA + QUEBRA-CABEÇA DE MAPA
   Fase 1-2 Mapa dos Povos Originários e Fase 3-5 Territórios e Direitos.
   Mapa compacto (estações a poucos segundos umas das outras), Sombras da
   Generalização / Névoas como adversários abstratos, peças de mapa para
   montar na Mesa, marcos de demarcação, portais de viagem rápida entre
   estações já visitadas e portal de saída.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const TS = 16, W = 40, H = 26;

  const LAYOUT = {
    c1s2: {
      start: [4, 13], exit: [36, 22], theme: 'aldeia',
      stations: [
        { id: 'A', x: 12, y: 6, q: 'GEO-C1-Q05', label: 'Praça dos Cartões', art: 'cartoes' },
        { id: 'B', x: 27, y: 5, q: 'GEO-C1-Q08', label: 'Varal de Palavras', art: 'varal' },
        { id: 'C', x: 33, y: 15, q: 'GEO-C1-Q07', label: 'Mesa do Mapa Histórico', art: 'mesa', needPieces: true, card: 'doencas' },
        { id: 'D', x: 17, y: 20, q: 'GEO-C1-Q06', label: 'Árvore das Famílias', art: 'arvore', card: 'hoje' }
      ],
      pieces: [[29, 11], [37, 9], [25, 17]], enemies: [[20, 9, 'sombra'], [30, 19, 'sombra'], [9, 18, 'sombra']],
      frags: [[7, 8], [20, 3], [36, 4], [24, 22], [11, 23]]
    },
    c3s5: {
      start: [4, 12], exit: [36, 21], theme: 'territorio',
      stations: [
        { id: 'A', x: 14, y: 6, q: 'GEO-C3-Q03', label: 'Mesa dos Mapas', art: 'mesa', card: 'luta' },
        { id: 'B', x: 28, y: 13, q: 'GEO-C3-Q13', label: 'Marco final', art: 'marco', needPosts: true }
      ],
      posts: [[8, 20], [24, 22], [34, 6]], slots: [[25, 10], [31, 10], [28, 17]], enemies: [[17, 15, 'nevoa'], [32, 21, 'nevoa'], [10, 8, 'nevoa']],
      frags: [[6, 4], [18, 3], [37, 14], [15, 23], [26, 5]]
    }
  };

  GEO.scenes.topdown = function (ctx) {
    const def = ctx.def, LY = LAYOUT[def.id];
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const rng = U.rng(def.id === 'c1s2' ? 11 : 29);
    // ---- mapa: 0 grama, 1 caminho, 2 árvore (sólida), 3 água (sólida), 4 flor
    const map = []; for (let y = 0; y < H; y++) { map.push([]); for (let x = 0; x < W; x++) map[y].push(x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 2 : 0); }
    const setp = (x, y) => { if (map[y] && map[y][x] !== undefined && x > 0 && y > 0 && x < W - 1 && y < H - 1) map[y][x] = 1; };
    const path = (x0, y0, x1, y1) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) { setp(x, y0); setp(x, y0 + 1); } for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) { setp(x1, y); setp(x1 + 1, y); } };
    const pts = [LY.start].concat(LY.stations.map((s) => [s.x, s.y])).concat([LY.exit]);
    const extra = (LY.pieces || []).concat(LY.posts || []).concat(LY.slots || []);
    for (let i = 1; i < pts.length; i++) path(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
    extra.forEach((q) => { const s = LY.stations[LY.stations.length - 1]; path(s.x, s.y, q[0], q[1]); });
    const clear = (cx, cy, r) => { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (map[y] && map[y][x] !== undefined && x > 0 && y > 0 && x < W - 1 && y < H - 1 && map[y][x] !== 1) map[y][x] = 0; };
    for (let i = 0; i < 130; i++) { const x = 1 + Math.floor(rng() * (W - 2)), y = 1 + Math.floor(rng() * (H - 2)); if (map[y][x] === 0) map[y][x] = rng() < 0.6 ? 2 : 4; }
    if (LY.theme === 'territorio') { for (let y = 1; y < H - 1; y++) { const x = 20 + Math.round(Math.sin(y / 3) * 2); if (map[y][x] !== 1) map[y][x] = 3; if (map[y][x + 1] !== 1) map[y][x + 1] = 3; } }
    pts.forEach((q) => clear(q[0], q[1], 2));
    extra.concat(LY.frags).forEach((q) => clear(q[0], q[1], 1));
    LY.enemies.forEach((e) => clear(e[0], e[1], 1));
    clear(LY.start[0], LY.start[1] - 2, 1);
    const solid = (tx, ty) => { const v = map[ty] && map[ty][tx]; return v === 2 || v === 3 || v === undefined; };

    // ---- objetos
    const p = { x: LY.start[0] * TS, y: LY.start[1] * TS, w: 10, h: 8, dir: 'down', moving: false, inv: 0 };
    const stations = LY.stations.map((s) => Object.assign({ done: false, visited: false }, s));
    const pieces = (LY.pieces || []).map((q) => ({ x: q[0], y: q[1], got: false }));
    const posts = (LY.posts || []).map((q) => ({ x: q[0], y: q[1], got: false }));
    const slots = (LY.slots || []).map((q) => ({ x: q[0], y: q[1], filled: false }));
    const frags = LY.frags.map((q) => ({ x: q[0], y: q[1], got: false }));
    const enemies = LY.enemies.map((e) => ({ x: e[0] * TS, y: e[1] * TS, t: e[2], vx: (rng() < 0.5 ? -1 : 1) * 24, vy: (rng() < 0.5 ? -1 : 1) * 16 }));
    let carrying = 0, busy = false, lastPos = { x: p.x, y: p.y }, finished = false;
    ctx.fragTotal = frags.length;
    ctx.actionMax = frags.length * 10 + 70;
    const pet = ctx.pet ? C.pet() : null;
    if (ctx.resume) {
      stations.forEach((s) => { if (ctx.qDone(s.q)) { s.done = true; s.visited = true; } });
      if (stations.some((s) => s.needPieces && s.done)) pieces.forEach((q) => { q.got = true; });
      if (stations.some((s) => s.needPosts && s.done)) { posts.forEach((q) => { q.got = true; }); slots.forEach((q) => { q.filled = true; }); }
    }
    const allDone = () => stations.every((z) => z.done);
    sc.begin = function () { if (!ctx.resume) ctx.checkpoint({ n: 0 }); updateGoal(); };

    function updateGoal() {
      const n = stations.find((s) => !s.done);
      if (!n) ctx.setGoal('Todas as estações concluídas! Vá ao portal de SAÍDA.');
      else if (n.needPieces && pieces.some((q) => !q.got)) ctx.setGoal('Colete as ' + pieces.length + ' peças do mapa (' + pieces.filter((q) => q.got).length + '/' + pieces.length + ') e leve à Mesa do Mapa.');
      else if (n.needPosts && slots.some((q) => !q.filled)) ctx.setGoal('Leve os marcos de demarcação aos círculos amarelos (' + slots.filter((q) => q.filled).length + '/' + slots.length + ').');
      else ctx.setGoal('Próxima estação: ' + n.label);
    }
    function target() {
      const n = stations.find((s) => !s.done);
      if (!n) return { x: LY.exit[0] * TS, y: LY.exit[1] * TS };
      if (n.needPieces) { const q = pieces.find((z) => !z.got); if (q) return { x: q.x * TS, y: q.y * TS }; }
      if (n.needPosts) { if (!carrying) { const q = posts.find((z) => !z.got); if (q) return { x: q.x * TS, y: q.y * TS }; } else { const s = slots.find((z) => !z.filled); if (s) return { x: s.x * TS, y: s.y * TS }; } }
      return { x: n.x * TS, y: n.y * TS };
    }
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); updateGoal(); }
    const near = (x, y, r) => Math.hypot(p.x + 5 - (x * TS + 8), p.y + 4 - (y * TS + 8)) < (r || 18);
    function move(dx, dy) {
      const hit = (x, y) => solid(Math.floor(x / TS), Math.floor(y / TS)) || solid(Math.floor((x + p.w) / TS), Math.floor(y / TS)) || solid(Math.floor(x / TS), Math.floor((y + p.h) / TS)) || solid(Math.floor((x + p.w) / TS), Math.floor((y + p.h) / TS));
      if (!hit(p.x + dx, p.y)) p.x += dx;
      if (!hit(p.x, p.y + dy)) p.y += dy;
    }
    function portalMenu() {
      const visited = stations.filter((s) => s.visited);
      if (!visited.length) { GG.ui.toast('Visite uma estação para ativar a viagem rápida.'); return; }
      run(() => new Promise((res) => {
        const m = GG.ui.modal({ title: '🌀 Portal de viagem rápida', cls: 'small', onClose: res });
        m.body.appendChild(U.el('p', null, 'Escolha para onde ir:'));
        m.setActions(visited.map((s) => GG.ui.btn(s.label, '', () => { p.x = s.x * TS + 12; p.y = s.y * TS + 24; m.close(); })).concat([GG.ui.btn('Cancelar', 'ghost', () => m.close())]));
      }));
    }

    sc.update = function (dt) {
      sc.t += dt; ctx.tick(dt);
      enemies.forEach((e) => {
        e.x += e.vx * dt; e.y += e.vy * dt;
        if (solid(Math.floor((e.x + 8 + Math.sign(e.vx) * 8) / TS), Math.floor((e.y + 8) / TS)) || rng() < 0.004) e.vx *= -1;
        if (solid(Math.floor((e.x + 8) / TS), Math.floor((e.y + 8 + Math.sign(e.vy) * 8) / TS)) || rng() < 0.004) e.vy *= -1;
      });
      if (busy || finished) return;
      const IN = GG.input; const sp = 84 * ctx.speed;
      let ax = IN.axisX(), ay = IN.axisY();
      if (ax && ay) { ax *= 0.72; ay *= 0.72; }
      p.moving = !!(ax || ay);
      if (ax < 0) p.dir = 'left'; else if (ax > 0) p.dir = 'right'; else if (ay < 0) p.dir = 'up'; else if (ay > 0) p.dir = 'down';
      move(ax * sp * dt, ay * sp * dt);
      if (p.inv > 0) p.inv -= dt;
      if (ctx.trail && p.moving) C.trail(p.x + 5, p.y + 6);
      if (pet) pet.update(p.x - 8, p.y - 4, dt);
      frags.forEach((f) => { if (!f.got && (near(f.x, f.y) || (ctx.magnet && near(f.x, f.y, 44)))) { f.got = true; ctx.fragment(f.x * TS + 8, f.y * TS + 8); } });
      pieces.forEach((q) => { if (!q.got && near(q.x, q.y)) { q.got = true; GG.audio.sfx('frag'); E.fx.float(q.x * TS + 8, q.y * TS, 'Peça do mapa!', '#ffe9a8'); ctx.addAction(5); updateGoal(); } });
      posts.forEach((q) => { if (!q.got && !carrying && near(q.x, q.y)) { q.got = true; carrying = 1; GG.audio.sfx('power'); E.fx.float(q.x * TS + 8, q.y * TS, 'Marco coletado!', '#ffe9a8'); updateGoal(); } });
      slots.forEach((s) => {
        if (!s.filled && carrying && near(s.x, s.y, 20)) {
          s.filled = true; carrying = 0; GG.audio.sfx('check'); E.fx.burst(s.x * TS + 8, s.y * TS + 8, ['#7bff8f', '#fff'], 16, 80); ctx.addAction(10); updateGoal();
          if (slots.every((z) => z.filled)) run(() => ctx.say('gaia', ['Marcos no lugar! A **demarcação** ajuda a garantir o **direito à terra**. Agora vá ao **Marco final**.']));
        }
      });
      enemies.forEach((e) => {
        if (Math.hypot(e.x + 8 - (p.x + 5), e.y + 8 - (p.y + 4)) < 11 && p.inv <= 0) {
          p.inv = 1.3; const a = Math.atan2(p.y - e.y, p.x - e.x); move(Math.cos(a) * 20, Math.sin(a) * 20);
          if (ctx.hurt()) { p.x = lastPos.x; p.y = lastPos.y; }
        }
      });
      for (const s of stations) {
        if (s.done || !near(s.x, s.y, 22)) continue;
        if (s.needPieces && pieces.some((q) => !q.got)) { if (!s._told) { s._told = true; run(() => ctx.say('gaia', ['A **Mesa do Mapa** está sem peças! Encontre as ' + pieces.length + ' peças espalhadas por perto.'])); } continue; }
        if (s.needPosts && slots.some((q) => !q.filled)) { if (!s._told) { s._told = true; run(() => ctx.say('gaia', ['Antes, coloque os **marcos de demarcação** nos círculos ao redor da comunidade.'])); } continue; }
        s.done = true; s.visited = true; ctx.fxX = s.x * TS; ctx.fxY = s.y * TS;
        run(async () => {
          if (s.card) await ctx.cards(s.card);
          await ctx.q(s.q);
          E.fx.confetti(s.x * TS + 8, s.y * TS, 30);
          lastPos = { x: p.x, y: p.y };
          ctx.checkpoint({ n: stations.filter((z) => z.done).length });
          if (allDone()) await ctx.say('gaia', ['Mapa restaurado! O **portal de saída** está aberto.']);
        });
        return;
      }
      if (near(LY.start[0], LY.start[1] - 2, 16) && (IN.pressed('act') || IN.pressed('jump'))) portalMenu();
      if (allDone() && near(LY.exit[0], LY.exit[1], 18)) {
        finished = true;
        run(async () => { GG.audio.sfx('win'); if (!ctx.damage) ctx.addAction(40); await ctx.finish(); });
      }
      const tx = U.clamp(p.x - E.W / 2, 0, W * TS - E.W), ty = U.clamp(p.y - E.H / 2, 0, H * TS - E.H);
      sc.cam.x += (tx - sc.cam.x) * Math.min(1, dt * 8); sc.cam.y += (ty - sc.cam.y) * Math.min(1, dt * 8);
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    const pathTile = (x, y) => { const n = (xx, yy) => map[yy] && map[yy][xx] === 1; const t = n(x, y - 1), b = n(x, y + 1), l = n(x - 1, y), r = n(x + 1, y); return (!t && !l) ? 12 : (!t && !r) ? 14 : (!b && !l) ? 36 : (!b && !r) ? 38 : !t ? 13 : !b ? 37 : !l ? 24 : !r ? 26 : 25; };
    sc.draw = function (g) {
      const c = g.ctx();
      g.world(sc.cam);
      const x0 = Math.max(0, Math.floor(sc.cam.x / TS)), y0 = Math.max(0, Math.floor(sc.cam.y / TS));
      for (let y = y0; y <= y0 + 15 && y < H; y++) for (let x = x0; x <= x0 + 26 && x < W; x++) {
        const v = map[y][x], px = x * TS, py = y * TS;
        g.spr('town', (x * 13 + y * 7) % 11 === 0 ? 1 : 0, px, py);
        if (v === 1) g.spr('town', pathTile(x, y), px, py);
        else if (v === 2) g.spr('town', LY.theme === 'territorio' ? ((x + y) % 3 ? 16 : 28) : ((x * y) % 4 === 0 ? 5 : 4), px, py);
        else if (v === 3) { c.fillStyle = '#3f8fd8'; c.fillRect(px, py, TS, TS); c.fillStyle = 'rgba(255,255,255,.35)'; if ((x + y + Math.floor(sc.t * 2)) % 3 === 0) c.fillRect(px + 3, py + 6, 6, 1); }
        else if (v === 4) g.spr('town', 2, px, py);
      }
      if (LY.theme === 'territorio') { for (let i = 0; i < 3; i++) g.spr('town', 72 + i, (26 + i) * TS, 12 * TS); for (let i = 0; i < 3; i++) g.spr('town', 84 + i, (26 + i) * TS, 13 * TS); P.crowd().slice(6, 9).forEach((pp, i) => g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 3 + i) % 2 })), (26 + i) * TS, 15 * TS)); }
      const X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      if (X) { // brilho na água
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let y = y0; y <= y0 + 15 && y < H; y++) for (let x = x0; x <= x0 + 26 && x < W; x++) if (map[y][x] === 3 && X.hash(x * 7 + y * 13 + Math.floor(sc.t * 1.5)) > 0.8) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x * TS + 4 + X.hash(x + y) * 6, y * TS + 5, 3, 1); }
        c.restore();
      }
      stations.forEach((s) => {
        const px = s.x * TS, py = s.y * TS;
        if (X && !s.done) { X.glow(c, px + 5, py - 4, 30, '#ffe08a', 0.35 + 0.15 * Math.sin(sc.t * 3)); }
        if (s.art === 'cartoes') { for (let i = 0; i < 4; i++) { g.rect(px - 20 + i * 12, py - 14, 10, 16, ['#c0392b', '#f39c12', '#16a085', '#8e44ad'][i]); g.rect(px - 19 + i * 12, py - 13, 8, 5, '#fff8e6'); } }
        else if (s.art === 'varal') { g.line(px - 22, py - 12, px + 26, py - 12, '#6b4f2a', 1); for (let i = 0; i < 3; i++) g.rect(px - 18 + i * 16, py - 11, 12, 10, '#fff3d1'); }
        else if (s.art === 'mesa') { g.rect(px - 16, py - 8, 36, 14, '#8b5a2b'); g.rect(px - 14, py - 12, 32, 12, pieces.some((q) => !q.got) ? '#d9c9a0' : '#f3e6c4'); if (!pieces.some((q) => !q.got)) GG.maps.drawCanvas(c, px - 6, py - 12, 12, null, 'rgba(0,0,0,.1)'); }
        else if (s.art === 'arvore') g.spr('town', 16, px - 8, py - 22, { scale: 2 });
        else if (s.art === 'marco') { g.rect(px + 2, py - 16, 5, 20, '#6b4f2a'); g.rect(px - 2, py - 18, 13, 6, '#ffd23f'); }
        if (!s.done) { if (X) { X.glow(c, px + 5, py - 30 + Math.sin(sc.t * 4) * 2, 10, '#ffd23f', 0.8); X.ilus(c, 'livro', px + 5, py - 30 + Math.sin(sc.t * 4) * 2, 14, { rot: Math.sin(sc.t * 2) * 0.1 }); } else g.text('!', px + 5, py - 34 + Math.sin(sc.t * 4) * 2, { size: 10, color: '#ffd23f', align: 'center' }); }
        else if (X) X.ilus(c, 'check', px + 5, py - 28, 10);
        C.sign(g, px + 5, py + 8, s.label, s.done ? '#d9ffd9' : '#fff8e6');
      });
      pieces.forEach((q) => { if (!q.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), q.x * TS + 1, q.y * TS + 1 + Math.sin(sc.t * 3 + q.x) * 2, { scale: 1.2 }); });
      posts.forEach((q) => { if (!q.got) { g.rect(q.x * TS + 6, q.y * TS - 4, 4, 16, '#6b4f2a'); g.rect(q.x * TS + 3, q.y * TS - 6, 10, 4, '#ffd23f'); } });
      slots.forEach((s) => { if (s.filled) { g.rect(s.x * TS + 6, s.y * TS - 4, 4, 16, '#6b4f2a'); g.rect(s.x * TS + 3, s.y * TS - 6, 10, 4, '#3ddc84'); } else g.circle(s.x * TS + 8, s.y * TS + 8, 7 + Math.sin(sc.t * 4), '#ffd23f', 2); });
      frags.forEach((f) => { if (!f.got) g.img(P.fragmento(Math.floor(sc.t * 4) % 2), f.x * TS + 2, f.y * TS + 2 + Math.sin(sc.t * 3 + f.x) * 2); });
      const sx = LY.start[0] * TS, sy = (LY.start[1] - 2) * TS;
      if (X) X.glow(c, sx + 8, sy + 8, 18, '#7fd0ff', 0.7);
      g.circle(sx + 8, sy + 8, 7, 'rgba(120,200,255,.7)'); g.circle(sx + 8, sy + 8, 4 + Math.sin(sc.t * 5), '#fff'); C.sign(g, sx + 8, sy - 10, 'Portal rápido');
      const ex = LY.exit[0] * TS, ey = LY.exit[1] * TS, open = allDone();
      if (X && open) { X.glow(c, ex + 8, ey + 8, 26, '#7bff8f', 0.8); X.rays(c, ex + 8, ey + 8, 40, '#c8ffd0', sc.t, 6); }
      g.circle(ex + 8, ey + 8, 10, open ? 'rgba(123,255,143,.8)' : 'rgba(120,120,140,.6)'); if (open) g.circle(ex + 8, ey + 8, 6 + Math.sin(sc.t * 6) * 2, '#fff'); C.sign(g, ex + 8, ey + 20, open ? 'SAÍDA' : 'Saída (conclua as estações)');
      enemies.forEach((e) => g.img(e.t === 'sombra' ? P.sombra(Math.floor(sc.t * 4) % 2, false) : P.nevoa(Math.floor(sc.t * 3) % 2), e.x, e.y + Math.sin(sc.t * 3 + e.x) * 2));
      if (pet) pet.draw(g, sc.t);
      if (X) { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(p.x + 5, p.y + 8, 6, 2, 0, 0, Math.PI * 2); c.fill(); if (p.moving && !E.reduced && Math.random() < 0.15) X.puff(p.x + 5, p.y + 8, 1); }
      if (!(p.inv > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielTop(ctx.look, p.dir, p.moving, sc.t), p.x - 2, p.y - 12, { flip: p.dir === 'right' });
      if (carrying) { g.rect(p.x + 3, p.y - 24, 4, 10, '#6b4f2a'); g.rect(p.x + 1, p.y - 26, 8, 3, '#ffd23f'); }
      g.end();
      if (X && !E.reduced) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) { const fx = (X.hash(i) * E.W + Math.sin(sc.t * 0.6 + i) * 20 - sc.cam.x * 0.2 % E.W + E.W) % E.W, fy = (X.hash(i + 9) * E.H + Math.cos(sc.t * 0.5 + i) * 14) % E.H; X.glow(c, fx, fy, 5, '#fff7a0', 0.4 + 0.3 * Math.sin(sc.t * 3 + i)); } c.restore(); }
      if (ctx.arrow) { const t = target(); C.arrow(g, sc.cam, t.x + 8, t.y + 8); }
    };
    sc.dbg = { player: p, stations, busy: () => busy, next() { const t = target(); p.x = t.x + 3; p.y = t.y + 4; return t; } };
    return sc;
  };
})();
