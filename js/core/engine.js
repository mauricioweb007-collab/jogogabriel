/* =====================================================================
   core/engine.js — motor 2D em Canvas: ciclo de jogo, entrada (teclado,
   joystick virtual), mapas em tiles, colisões, câmera suave, NPCs que
   andam, interação por proximidade, seguidores (Lumi e mascote),
   partículas, névoa e o guia "mostrar caminho".
   O motor não conhece regras do jogo: ele consulta o objeto E.G
   (a "fachada" do jogo, criada em main.js) para condições e ações.
   ===================================================================== */
EN.engine = (function () {
  'use strict';
  const U = EN.util, SP = EN.sprites;
  const TS = SP.TS;
  const E = {};

  E.G = null;               // fachada do jogo (main.js)
  E.map = null;             // mapa carregado (runtime)
  E.player = { x: 0, y: 0, dir: 'down', moving: false, walk: 0, cel: 0, stepT: 0 };
  E.cam = { x: 0, y: 0 };
  E.keys = new Set();
  E.joy = { x: 0, y: 0, active: false };
  E.paused = true;
  E.time = 0;
  E.particles = [];
  E.hist = [];              // histórico de posições para os seguidores
  E.lumi = { x: 0, y: 0 };
  E.pet = { x: 0, y: 0 };
  E.near = null;            // entidade interativa mais próxima
  E.path = [];              // pontos do "mostrar caminho"
  E.pathT = 0;
  E.fade = 0;               // 0..1 escurecimento de transição
  E.zoom = 1;
  E.running = false;

  /* ------------------------------------------------------------ init */
  E.init = function (canvas) {
    E.canvas = canvas;
    E.ctx = canvas.getContext('2d');
    window.addEventListener('resize', E.resize);
    E.resize();
    bindKeys();
    bindTouch();
    if (!E.running) { E.running = true; let last = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        try { E.update(dt); E.draw(); } catch (err) { console.error(err); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  };

  E.resize = function () {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth, h = window.innerHeight;
    E.W = w; E.H = h; E.dpr = dpr;
    E.canvas.width = Math.round(w * dpr); E.canvas.height = Math.round(h * dpr);
    E.canvas.style.width = w + 'px'; E.canvas.style.height = h + 'px';
    E.zoom = U.clamp(Math.min(w / (9.5 * TS), h / (9 * TS)), 0.6, 1.45);
  };

  /* ------------------------------------------------------------ entrada */
  const MOVE = { arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd', arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r' };
  function bindKeys() {
    window.addEventListener('keydown', (ev) => {
      const k = ev.key.toLowerCase();
      const tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (MOVE[k]) { E.keys.add(MOVE[k]); if (!E.paused) ev.preventDefault(); }
      if (E.paused || !E.G || E.G.busy) return;
      if ((k === 'e' || k === ' ' || k === 'enter') && !ev.repeat) { ev.preventDefault(); E.pressInteract(); }
      else if (k === 'escape') { E.G.openMenu(); }
      else if (k === 'i') { E.G.openInventory(); }
      else if (k === 'c') { E.G.openNotebook(); }
      else if (k === 'm') { E.G.togglePath(); }
    });
    window.addEventListener('keyup', (ev) => { const k = ev.key.toLowerCase(); if (MOVE[k]) E.keys.delete(MOVE[k]); });
    window.addEventListener('blur', () => E.keys.clear());
  }

  function bindTouch() {
    const joy = document.getElementById('joy');
    const knob = document.getElementById('joyKnob');
    const act = document.getElementById('btnAct');
    if (joy && knob) {
      let id = null, cx = 0, cy = 0;
      const R = 46;
      const move = (x, y) => {
        let dx = x - cx, dy = y - cy;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx = dx / d * R; dy = dy / d * R; }
        knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        E.joy.x = dx / R; E.joy.y = dy / R;
        if (Math.hypot(E.joy.x, E.joy.y) < 0.2) { E.joy.x = 0; E.joy.y = 0; }
      };
      joy.addEventListener('pointerdown', (ev) => {
        ev.preventDefault(); id = ev.pointerId; try { joy.setPointerCapture(id); } catch (e) { /* alguns navegadores recusam; o controle segue funcionando */ }
        const r = joy.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        E.joy.active = true; move(ev.clientX, ev.clientY);
      });
      joy.addEventListener('pointermove', (ev) => { if (ev.pointerId === id) move(ev.clientX, ev.clientY); });
      const end = (ev) => { if (ev.pointerId !== id) return; id = null; E.joy.active = false; E.joy.x = 0; E.joy.y = 0; knob.style.transform = ''; };
      joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);
    }
    if (act) act.addEventListener('pointerdown', (ev) => { ev.preventDefault(); if (!E.paused && E.G && !E.G.busy) E.pressInteract(); });
    // tocar/clicar no mundo perto de algo interativo também interage
    E.canvas && E.canvas.addEventListener('pointerdown', (ev) => {
      if (E.paused || !E.G || E.G.busy || !E.near) return;
      const w = E.screenToWorld(ev.clientX, ev.clientY);
      if (U.dist(w.x, w.y, E.near.x, E.near.y - 18) < 48) E.pressInteract();
    });
  }

  E.screenToWorld = (sx, sy) => ({ x: sx / E.zoom + E.cam.x, y: sy / E.zoom + E.cam.y });

  /* ------------------------------------------------------------ mapas */
  E.loadMap = function (id, spawn) {
    const def = EN.data.maps[id];
    if (!def) throw new Error('Mapa inexistente: ' + id);
    if (!def.rows && def.build) def.rows = def.build();
    const rows = def.rows.map((r) => r.split(''));
    const h = rows.length, w = Math.max.apply(null, def.rows.map((r) => r.length));
    rows.forEach((r) => { while (r.length < w) r.push(' '); });
    const m = { id, def, w, h, base: rows, tiles: null, entities: [], theme: Object.assign({}, SP.defaultTheme, def.theme || {}) };
    let sp = null;
    // marcadores de entidades (letras maiúsculas e dígitos) e '@' (entrada)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '@') { sp = { x, y }; rows[y][x] = def.under || '.'; continue; }
      if (/[A-Z0-9]/.test(ch)) {
        const ed = def.marks && def.marks[ch];
        rows[y][x] = (ed && ed.under) || def.under || '.';
        if (ed) (Array.isArray(ed) ? ed : [ed]).forEach((d) => m.entities.push(makeEntity(d, x, y)));
        else console.warn('Marcador sem entidade', id, ch);
      }
    }
    (def.extra || []).forEach((d) => m.entities.push(makeEntity(d, d.x, d.y)));
    E.map = m;
    E.refreshTiles();
    const s = spawn || sp || def.spawn || { x: 2, y: 2 };
    if (s.px !== undefined) { E.player.x = s.px; E.player.y = s.py; }
    else { E.player.x = s.x * TS + TS / 2; E.player.y = s.y * TS + TS * 0.75; }
    E.player.dir = s.dir || 'down';
    E.hist = [];
    E.lumi.x = E.player.x - 30; E.lumi.y = E.player.y;
    E.pet.x = E.player.x - 50; E.pet.y = E.player.y;
    E.particles = [];
    E.snapCamera();
    return m;
  };

  function makeEntity(d, tx, ty) {
    const e = {
      def: d, id: d.id, kind: d.kind || 'obj', tx, ty,
      x: tx * TS + TS / 2 + (d.ox || 0), y: ty * TS + TS * 0.75 + (d.oy || 0),
      dir: 'down', walk: 0, moving: false, wt: U.rand(1, 3), tgt: null
    };
    e.hx = e.x; e.hy = e.y;
    return e;
  }

  /** Recalcula tiles (aplica "patches" condicionais) e redesenha o mapa. */
  E.refreshTiles = function () {
    const m = E.map; if (!m) return;
    const t = m.base.map((r) => r.slice());
    (m.def.patches || []).forEach((p) => {
      let ok = false;
      try { ok = !p.when || p.when(E.G); } catch (e) { ok = false; }
      if (!ok) return;
      if (p.set) p.set.forEach(([x, y, ch]) => { if (t[y] && t[y][x] !== undefined) t[y][x] = ch; });
      if (p.rect) { const [x0, y0, w, h] = p.rect; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (t[y] && t[y][x] !== undefined && (!p.only || p.only.includes(t[y][x]))) t[y][x] = p.ch; }
    });
    m.tiles = t;
    if (m.def.lake) { try { m.theme.lakeNow = m.def.lake(E.G); } catch (e) { /* ignora */ } }
    bake();
  };

  function bake() {
    const m = E.map;
    const c = document.createElement('canvas');
    c.width = m.w * TS; c.height = m.h * TS;
    const g = c.getContext('2d');
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      SP.drawTile(g, m.tiles[y][x], x * TS, y * TS, m.theme, x, y, m.def.under || '.');
    }
    m.bake = c;
  }

  E.tileAt = (tx, ty) => { const m = E.map; if (!m || ty < 0 || tx < 0 || ty >= m.h || tx >= m.w) return ' '; return m.tiles[ty][tx]; };
  E.solidTile = (tx, ty) => SP.SOLID.has(E.tileAt(tx, ty));

  E.visible = function (e) {
    if (!e.def.show) return true;
    try { return !!e.def.show(E.G); } catch (err) { return false; }
  };
  function isSolidEnt(e) {
    if (e.kind === 'pickup' || e.def.solid === false) return false;
    return E.visible(e);
  }
  function entBox(e) { return { w: e.def.bw || 30, h: e.def.bh || 18 }; }

  /** Verifica se uma caixa (centrada nos pés) colide com algo sólido. */
  E.blocked = function (x, y, w, h, self) {
    const x0 = Math.floor((x - w / 2) / TS), x1 = Math.floor((x + w / 2 - 0.01) / TS);
    const y0 = Math.floor((y - h / 2) / TS), y1 = Math.floor((y + h / 2 - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (E.solidTile(tx, ty)) return true;
    for (const e of E.map.entities) {
      if (e === self || !isSolidEnt(e)) continue;
      const b = entBox(e);
      if (Math.abs(e.x - x) < (b.w + w) / 2 && Math.abs(e.y - y) < (b.h + h) / 2) return true;
    }
    if (self && self !== E.player) {
      if (Math.abs(E.player.x - x) < (22 + w) / 2 && Math.abs(E.player.y - y) < (12 + h) / 2) return true;
    }
    return false;
  };

  function moveBody(b, dx, dy, w, h) {
    let moved = false;
    if (dx && !E.blocked(b.x + dx, b.y, w, h, b)) { b.x += dx; moved = true; }
    if (dy && !E.blocked(b.x, b.y + dy, w, h, b)) { b.y += dy; moved = true; }
    return moved;
  }

  /* ------------------------------------------------------------ update */
  E.update = function (dt) {
    E.time += dt;
    const P = E.player;
    if (P.cel > 0) P.cel = Math.max(0, P.cel - dt);
    if (!E.map) return;
    if (!E.paused && E.G && !E.G.busy) {
      let ix = 0, iy = 0;
      if (E.keys.has('l')) ix -= 1; if (E.keys.has('r')) ix += 1;
      if (E.keys.has('u')) iy -= 1; if (E.keys.has('d')) iy += 1;
      if (E.joy.active && (E.joy.x || E.joy.y)) { ix = E.joy.x; iy = E.joy.y; }
      const len = Math.hypot(ix, iy);
      if (len > 0) {
        if (len > 1) { ix /= len; iy /= len; }
        const sp = 150 * (E.G.speedMult ? E.G.speedMult() : 1);
        const moved = moveBody(P, ix * sp * dt, iy * sp * dt, 22, 12);
        P.moving = moved;
        if (Math.abs(ix) > Math.abs(iy)) P.dir = ix < 0 ? 'left' : 'right'; else P.dir = iy < 0 ? 'up' : 'down';
        if (moved) {
          P.walk += dt * 12;
          P.stepT += dt; if (P.stepT > 0.32) { P.stepT = 0; EN.audio.play('step'); }
          E.hist.push({ x: P.x, y: P.y });
          if (E.hist.length > 60) E.hist.shift();
          const look = E.G.look ? E.G.look() : {};
          if (look.trail && Math.random() < dt * 14) emitTrail(look.trail);
        }
      } else P.moving = false;
    } else P.moving = false;

    // seguidores
    const lumiT = E.hist[Math.max(0, E.hist.length - 14)] || { x: P.x - 28, y: P.y + 4 };
    E.lumi.x = U.lerp(E.lumi.x, lumiT.x - 18, 1 - Math.exp(-dt * 5));
    E.lumi.y = U.lerp(E.lumi.y, lumiT.y + 2, 1 - Math.exp(-dt * 5));
    const petT = E.hist[Math.max(0, E.hist.length - 28)] || { x: P.x - 44, y: P.y + 6 };
    const pdx = petT.x + 14 - E.pet.x, pdy = petT.y + 8 - E.pet.y;
    E.pet.moving = Math.hypot(pdx, pdy) > 2;
    E.pet.x += pdx * (1 - Math.exp(-dt * 4)); E.pet.y += pdy * (1 - Math.exp(-dt * 4));

    // NPCs e animais que andam
    for (const e of E.map.entities) {
      if (!e.def.wander || !E.visible(e)) continue;
      const dp = U.dist(e.x, e.y, P.x, P.y);
      if (dp < 80) { // reage à aproximação: para e olha para o jogador
        e.moving = false;
        const dx = P.x - e.x, dy = P.y - e.y;
        e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
        continue;
      }
      e.wt -= dt;
      if (!e.tgt || e.wt <= 0) {
        e.wt = U.rand(2, 4.5);
        const r = e.def.wander * TS;
        e.tgt = Math.random() < 0.35 ? null : { x: e.hx + U.rand(-r, r), y: e.hy + U.rand(-r, r) };
      }
      if (e.tgt) {
        const dx = e.tgt.x - e.x, dy = e.tgt.y - e.y, d = Math.hypot(dx, dy);
        if (d < 3) { e.tgt = null; e.moving = false; continue; }
        const sp = (e.def.speed || 40) * dt;
        const b = entBox(e);
        const ok = moveBody(e, dx / d * sp, dy / d * sp, b.w - 6, b.h - 4);
        e.moving = ok;
        if (!ok) e.tgt = null;
        e.walk += dt * 10;
        e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      } else e.moving = false;
    }

    // coletáveis (com ímã)
    const magnet = E.G && E.G.magnetRadius ? E.G.magnetRadius() : 0;
    for (const e of E.map.entities) {
      if (e.kind !== 'pickup' || e.gone || !E.visible(e)) continue;
      const d = U.dist(e.x, e.y, P.x, P.y);
      if (magnet && d < magnet && d > 8) { e.x += (P.x - e.x) * Math.min(1, dt * 4); e.y += (P.y - e.y) * Math.min(1, dt * 4); }
      if (d < 26) { e.gone = true; burst(e.x, e.y - 14, '#7ef0c0', 10); if (E.G) E.G.pickup(e); }
    }

    // entidade interativa mais próxima
    E.near = null;
    if (!E.paused) {
      let best = 999;
      for (const e of E.map.entities) {
        if (e.kind === 'pickup' || e.def.interact === false || !E.visible(e)) continue;
        const d = U.dist(e.x, e.y, P.x, P.y - 4);
        const r = e.def.range || 64;
        if (d < r && d < best) { best = d; E.near = e; }
      }
    }

    // partículas
    for (const p of E.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; }
    E.particles = E.particles.filter((p) => p.life > 0);
    ambient(dt);

    // caminho até o objetivo
    E.pathT -= dt;
    if (E.pathT <= 0) { E.pathT = 0.45; computePath(); }

    // câmera
    const vw = E.W / E.zoom, vh = E.H / E.zoom;
    let tx = P.x - vw / 2, ty = P.y - 24 - vh / 2;
    const mw = E.map.w * TS, mh = E.map.h * TS;
    tx = mw <= vw ? (mw - vw) / 2 : U.clamp(tx, 0, mw - vw);
    ty = mh <= vh ? (mh - vh) / 2 : U.clamp(ty, 0, mh - vh);
    const k = 1 - Math.exp(-dt * 7);
    E.cam.x += (tx - E.cam.x) * k; E.cam.y += (ty - E.cam.y) * k;
  };

  E.snapCamera = function () {
    const vw = E.W / E.zoom, vh = E.H / E.zoom, P = E.player;
    const mw = E.map.w * TS, mh = E.map.h * TS;
    E.cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(P.x - vw / 2, 0, mw - vw);
    E.cam.y = mh <= vh ? (mh - vh) / 2 : U.clamp(P.y - 24 - vh / 2, 0, mh - vh);
  };

  E.pressInteract = function () {
    if (E.near && E.G) { EN.audio.play('click'); E.G.interact(E.near); }
  };

  /* ------------------------------------------------------------ partículas */
  function emitTrail(kind) {
    const P = E.player;
    const colors = { flores: ['#ff7aa8', '#ffd84a', '#ffffff'], estrelas: ['#fff3a0', '#ffe066', '#ffffff'], folhas: ['#5fcf6b', '#3fae5b'], bolhas: ['#bfe8ff'] }[kind] || ['#fff'];
    E.particles.push({ x: P.x + U.rand(-6, 6), y: P.y - 2, vx: U.rand(-8, 8), vy: U.rand(-14, -4), life: 0.9, max: 0.9, color: U.pick(colors), size: U.rand(2, 3.5), kind: kind === 'estrelas' ? 'star' : 'dot' });
  }
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, s = U.rand(40, 110);
      E.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, g: 120, life: 0.7, max: 0.7, color, size: U.rand(2, 4), kind: 'dot' });
    }
  }
  E.burst = burst;
  E.celebrate = function () {
    E.player.cel = 1.4;
    burst(E.player.x, E.player.y - 40, '#ffe066', 18);
    burst(E.player.x, E.player.y - 40, '#7ef0c0', 12);
  };
  E.floatText = function (text, color) {
    E.particles.push({ x: E.player.x, y: E.player.y - 64, vx: 0, vy: -26, life: 1.4, max: 1.4, color: color || '#fff', text, kind: 'text' });
  };
  function ambient(dt) {
    const kind = E.map.def.ambient;
    if (!kind) return;
    const rate = kind === 'bubbles' ? 5 : 3;
    if (Math.random() < dt * rate) {
      const vw = E.W / E.zoom, vh = E.H / E.zoom;
      const x = E.cam.x + Math.random() * vw;
      if (kind === 'leaves') E.particles.push({ x, y: E.cam.y - 10, vx: U.rand(-10, 20), vy: U.rand(20, 40), life: 8, max: 8, color: U.pick(['#5fcf6b', '#9ad06a', '#e0b84a']), size: 3.5, kind: 'leaf' });
      else if (kind === 'bubbles') E.particles.push({ x, y: E.cam.y + vh + 10, vx: U.rand(-5, 5), vy: U.rand(-40, -20), life: 9, max: 9, color: 'rgba(220,245,255,.7)', size: U.rand(2, 5), kind: 'ring' });
      else if (kind === 'sparks') E.particles.push({ x, y: E.cam.y + Math.random() * vh, vx: U.rand(-6, 6), vy: U.rand(-12, -4), life: 3, max: 3, color: U.pick(['#fff3a0', '#bfe8ff', '#d8c2ff']), size: 2, kind: 'dot' });
      else if (kind === 'dust') E.particles.push({ x, y: E.cam.y + Math.random() * vh, vx: U.rand(-4, 4), vy: U.rand(-4, 4), life: 4, max: 4, color: 'rgba(200,190,230,.5)', size: 2, kind: 'dot' });
    }
  }

  /* ------------------------------------------------------------ caminho */
  function computePath() {
    E.path = [];
    if (!E.G || !E.map) return;
    const want = E.G.showPath && E.G.showPath();
    const tgt = E.G.objectiveTarget && E.G.objectiveTarget();
    E.target = tgt;
    if (!want || !tgt) return;
    const P = E.player;
    const sx = Math.floor(P.x / TS), sy = Math.floor(P.y / TS);
    const W = E.map.w, H = E.map.h;
    const block = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) block[y * W + x] = E.solidTile(x, y) ? 1 : 0;
    for (const e of E.map.entities) if (isSolidEnt(e)) { const tx = Math.floor(e.x / TS), ty = Math.floor(e.y / TS); if (tx >= 0 && ty >= 0 && tx < W && ty < H) block[ty * W + tx] = 1; }
    const goal = (x, y) => Math.abs(x - tgt.tx) + Math.abs(y - tgt.ty) <= 1;
    const prev = new Int32Array(W * H).fill(-1);
    const q = [sy * W + sx]; prev[sy * W + sx] = sy * W + sx;
    let found = -1;
    while (q.length) {
      const c = q.shift(); const cx = c % W, cy = (c / W) | 0;
      if (goal(cx, cy)) { found = c; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx;
        if (prev[n] !== -1 || block[n]) continue;
        prev[n] = c; q.push(n);
      }
    }
    if (found < 0) return;
    const pts = [];
    let c = found;
    while (c !== prev[c]) { pts.push({ x: (c % W) * TS + TS / 2, y: ((c / W) | 0) * TS + TS / 2 }); c = prev[c]; }
    E.path = pts.reverse();
  }

  /* ------------------------------------------------------------ desenho */
  E.draw = function () {
    const ctx = E.ctx, dpr = E.dpr, z = E.zoom;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b2030'; ctx.fillRect(0, 0, E.canvas.width, E.canvas.height);
    if (!E.map || !E.map.bake) return;
    const G = E.G;
    const cx = Math.round(E.cam.x * z * dpr) / (z * dpr), cy = Math.round(E.cam.y * z * dpr) / (z * dpr);
    ctx.setTransform(dpr * z, 0, 0, dpr * z, -cx * dpr * z, -cy * dpr * z);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(E.map.bake, 0, 0);

    // brilho da água animado
    const t = E.time;
    // caminho
    if (E.path.length) {
      for (let i = 1; i < E.path.length; i += 1) {
        const p = E.path[i];
        const a = 0.35 + 0.35 * Math.sin(t * 5 - i * 0.6);
        ctx.fillStyle = 'rgba(255,230,90,' + a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y + 6, 5, 0, 7); ctx.fill();
      }
    }

    // lista de desenháveis ordenada por y
    const list = [];
    const P = E.player;
    for (const e of E.map.entities) {
      if (e.gone || !E.visible(e)) continue;
      list.push({ y: e.y + (e.def.z || 0), f: () => drawEntity(ctx, e) });
    }
    const look = G && G.look ? G.look() : {};
    list.push({ y: P.y, f: () => SP.drawCharacter(ctx, P.x, P.y, look, { dir: P.dir, walk: P.walk, moving: P.moving, celebrate: P.cel, t }) });
    if (!E.map.def.noLumi && G && G.lumiFollows && G.lumiFollows()) list.push({ y: E.lumi.y, f: () => SP.drawLumi(ctx, E.lumi.x, E.lumi.y, t, G.lumiVariant ? G.lumiVariant() : 'classica') });
    const pet = G && G.petKind ? G.petKind() : null;
    if (pet) list.push({ y: E.pet.y, f: () => SP.drawPet(ctx, pet, E.pet.x, E.pet.y, t, E.pet.moving) });
    list.sort((a, b) => a.y - b.y);
    list.forEach((d) => d.f());

    // lupa: destaca segredos próximos
    if (G && G.lupaActive && G.lupaActive()) {
      for (const e of E.map.entities) {
        if (!e.def.secret || e.gone || !E.visible(e)) continue;
        if (G.secretFound && G.secretFound(e)) continue;
        if (U.dist(e.x, e.y, P.x, P.y) < TS * 7) {
          const r = 22 + Math.sin(t * 4) * 6;
          ctx.strokeStyle = 'rgba(255,240,120,.9)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(e.x, e.y - 16, r, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
          SP.drawEmoji(ctx, '✨', e.x + 18, e.y - 44, 16);
        }
      }
    }

    // partículas
    for (const p of E.particles) {
      const a = U.clamp(p.life / p.max, 0, 1);
      if (p.kind === 'text') {
        ctx.globalAlpha = a; ctx.font = 'bold 18px Nunito, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1;
      } else if (p.kind === 'ring') {
        ctx.strokeStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.stroke();
      } else if (p.kind === 'leaf') {
        ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t * 2 + p.x); ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, 7); ctx.fill(); ctx.restore();
      } else if (p.kind === 'star') {
        ctx.globalAlpha = a; SP.drawEmoji(ctx, '✦', p.x, p.y, 10); ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      }
    }

    // bússola de Lumi: seta até o objetivo
    if (G && G.compassActive && G.compassActive() && E.target) {
      const tx = E.target.tx * TS + TS / 2, ty = E.target.ty * TS + TS / 2;
      const ang = Math.atan2(ty - P.y, tx - P.x);
      const d = U.dist(tx, ty, P.x, P.y);
      if (d > TS * 1.5) {
        ctx.save(); ctx.translate(P.x + Math.cos(ang) * 38, P.y - 20 + Math.sin(ang) * 38); ctx.rotate(ang);
        ctx.fillStyle = 'rgba(255,215,64,.95)'; ctx.strokeStyle = '#6b4e00'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-7, -8); ctx.lineTo(-3, 0); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore(); ctx.lineWidth = 1;
      }
    }

    // indicador de interação
    if (E.near && !E.paused) {
      const e = E.near;
      const badge = G && G.entityBadge ? G.entityBadge(e) : { icon: 'E' };
      const top = e.y - (e.def.tall || 62) + Math.sin(t * 5) * 3;
      ctx.fillStyle = badge.quest ? '#ffcf33' : '#ffffff';
      ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 2.5;
      SP.rrect(ctx, e.x - 16, top - 30, 32, 28, 9); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.x - 5, top - 3); ctx.lineTo(e.x, top + 4); ctx.lineTo(e.x + 5, top - 3); ctx.fill(); ctx.lineWidth = 1;
      ctx.fillStyle = '#2b2d42'; ctx.font = 'bold 18px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(badge.icon, e.x, top - 15);
      const name = e.def.name;
      if (name) {
        ctx.font = 'bold 14px Nunito, sans-serif';
        const w = ctx.measureText(name).width + 14;
        ctx.fillStyle = 'rgba(20,24,40,.8)'; SP.rrect(ctx, e.x - w / 2, e.y + 4, w, 20, 8); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText(name, e.x, e.y + 14.5);
      }
      ctx.textBaseline = 'alphabetic';
    }

    // camada de tela: tonalidade, névoa e transição
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const def = E.map.def;
    let fog = 0;
    try { fog = def.fog ? def.fog(G) : 0; } catch (e) { fog = 0; }
    if (def.tint) { ctx.fillStyle = def.tint; ctx.fillRect(0, 0, E.W, E.H); }
    if (fog > 0) {
      for (let i = 0; i < 7; i++) {
        const fx = ((i * 263 + t * (12 + i * 3)) % (E.W + 400)) - 200;
        const fy = (i * 157 + Math.sin(t * 0.3 + i) * 40) % E.H;
        const g = ctx.createRadialGradient(fx, fy, 10, fx, fy, 220);
        g.addColorStop(0, 'rgba(150,110,200,' + (0.28 * fog) + ')'); g.addColorStop(1, 'rgba(150,110,200,0)');
        ctx.fillStyle = g; ctx.fillRect(fx - 220, fy - 220, 440, 440);
      }
    }
    if (def.dark) { // caverna: só enxerga ao redor (lanterna)
      const px = (P.x - cx) * z, py = (P.y - 20 - cy) * z;
      const r = (G && G.hasItem && G.hasItem('lanterna') ? 200 : 110) * z;
      const g = ctx.createRadialGradient(px, py, r * 0.3, px, py, r);
      g.addColorStop(0, 'rgba(10,8,20,0)'); g.addColorStop(1, 'rgba(10,8,20,.88)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, E.W, E.H);
    }
    if (E.fade > 0) { ctx.fillStyle = 'rgba(12,16,28,' + E.fade + ')'; ctx.fillRect(0, 0, E.W, E.H); }
  };

  function drawEntity(ctx, e) {
    const G = E.G, t = E.time, d = e.def;
    let st = {};
    if (d.state) { try { st = d.state(G) || {}; } catch (err) { st = {}; } }
    if (d.dyn) { try { const v = d.dyn(G); if (d.sprite === 'shelf') d.items = v; else if (v) d.emoji = v; } catch (err) { /* ignora */ } }
    if (d.secret && !(G && G.secretFound && G.secretFound(e))) st.alpha = 0.8;
    if (e.kind === 'npc') SP.drawCharacter(ctx, e.x, e.y, d.look || {}, { dir: e.dir, walk: e.walk, moving: e.moving, t: t + e.hx });
    else if (e.kind === 'lumi') SP.drawLumi(ctx, e.x, e.y, t, G && G.lumiVariant ? G.lumiVariant() : 'classica');
    else if (e.kind === 'animal') SP.drawAnimal(ctx, d.animal, e.x, e.y, t, { flip: e.dir === 'left', size: d.size });
    else SP.drawObject(ctx, d, e.x, e.y, t, st);
  }

  return E;
})();
