/* =====================================================================
   scenes/common.js — ajudantes compartilhados pelas cenas de Geografia:
   desenho de Gabriel (aparência vinda da loja), mascote Mini-GeoBot,
   trilha de mapinhas, seta de objetivo (Mochila-Mapa), fundos com
   paralaxe por tema, totens, placas de texto e FÍSICA DE PLATAFORMA
   (tiles, plataformas de mão única, móveis, molas).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel;
  const C = (GEO.common = {});
  GEO.scenes = GEO.scenes || {};

  /* ------------------------------------------------ Gabriel */
  /** Sprite lateral de Gabriel. state: 'idle'|'run'|'jump'|'shoot'. */
  C.gabrielSide = function (look, state, t) {
    const f = state === 'jump' ? 3 : state === 'shoot' ? 4 : state === 'run' ? (Math.floor(t * 10) % 2 ? 1 : 2) : 0;
    return P.side(Object.assign({}, look, { frame: f }));
  };
  C.gabrielTop = function (look, dir, moving, t) {
    return P.front(Object.assign({}, look, { dir: dir === 'left' || dir === 'right' ? 'side' : dir, frame: moving ? Math.floor(t * 8) % 2 : 0, backpack: undefined, cape: undefined }));
  };
  /** Desenha Gabriel lateral centrado em (x, pés em y). */
  C.drawGabriel = function (g, ctx, p, t) {
    const im = C.gabrielSide(ctx.look, p.state || 'idle', t);
    const c = g.ctx(), fx = p.x + p.w / 2, fy = p.y + p.h;
    // sombra oval no chão (some no ar)
    if (p.onGround) { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(fx, fy, 7, 2, 0, 0, Math.PI * 2); c.fill(); }
    if (p.inv > 0 && Math.floor(t * 20) % 2) return;
    const sq = p.sq || 0; // >0 amassa (pouso), <0 estica (pulo)
    if (!sq || E.reduced) { g.img(im, Math.round(fx - 9), Math.round(fy - 24), { flip: p.face < 0 }); return; }
    c.save(); c.translate(Math.round(fx), Math.round(fy)); c.scale((p.face < 0 ? -1 : 1) * (1 + sq * 0.35), 1 - sq * 0.3);
    c.drawImage(im, -9, -24); c.restore();
  };
  /** Poeira, esticar/amassar e brilho de pulo/pouso (chamado depois da física). */
  C.juice = function (b, dt) {
    const X = GEO.gfx;
    if (b._wasGround && !b.onGround && b.vy < -100) { b.sq = -0.5; if (X) X.puff(b.x + b.w / 2, b.y + b.h, 2); }
    if (!b._wasGround && b.onGround && (b._fallV || 0) > 200) { b.sq = Math.min(0.9, b._fallV / 500); if (X) X.puff(b.x + b.w / 2, b.y + b.h, 4); }
    if (b.onGround && Math.abs(b.vx) > 80 && Math.random() < dt * 6 && X) X.puff(b.x + b.w / 2 - Math.sign(b.vx) * 4, b.y + b.h, 1, -Math.sign(b.vx) * 0.6);
    b._fallV = b.vy; b._wasGround = b.onGround;
    if (b.sq) { b.sq += (0 - b.sq) * Math.min(1, dt * 12); if (Math.abs(b.sq) < 0.02) b.sq = 0; }
  };
  /** Mini-GeoBot segue o jogador. */
  C.pet = function () {
    const o = { x: 0, y: 0 };
    o.update = (tx, ty, dt) => { o.x += (tx - o.x) * Math.min(1, dt * 4); o.y += (ty - o.y) * Math.min(1, dt * 4); };
    o.draw = (g, t) => g.img(P.geobot(Math.floor(t * 6) % 3), o.x - 6, o.y - 10 + Math.sin(t * 5) * 2, { scale: 0.6 });
    return o;
  };
  C.trail = function (x, y) { if (Math.random() < 0.35) E.fx.parts.push({ x: x + U.rand(-3, 3), y: y + U.rand(-2, 2), vx: U.rand(-10, 10), vy: U.rand(-20, -5), life: 0.6, t: 0, c: U.pick(['#f3d78a', '#7bd88f', '#3ec1ff']), s: 2, g: 0 }); };
  /** Seta de objetivo na borda da tela (Mochila-Mapa). */
  C.arrow = function (g, cam, tx, ty) {
    const cx = E.W / 2, cy = E.H / 2, dx = tx - cam.x - cx, dy = ty - cam.y - cy;
    if (Math.abs(dx) < E.W / 2 - 20 && Math.abs(dy) < E.H / 2 - 20) return;
    const a = Math.atan2(dy, dx), r = Math.min(E.W, E.H) / 2 - 24;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const c = g.ctx(); c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#ffd23f'; c.strokeStyle = '#15152a'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(10, 0); c.lineTo(-6, -7); c.lineTo(-2, 0); c.lineTo(-6, 7); c.closePath(); c.fill(); c.stroke(); c.restore();
  };

  /* ------------------------------------------------ fundos por tema */
  const THEMES = {
    festival: { sky: ['#ffb86b', '#ff7a8a'], bgCol: 4, ground: 'grass', deco: 'festa' },
    cordel: { sky: ['#f5e6c8', '#e2cfa3'], bgCol: 4, ground: 'sand', deco: 'cordel', sepia: true },
    torre: { sky: ['#1b2a5a', '#3a5ba8'], bgCol: 0, ground: 'snow', deco: 'torre' },
    mosaico: { sky: ['#2a1f4a', '#6b3fa0'], bgCol: 6, ground: 'grass', deco: 'mosaico' },
    sombra: { sky: ['#140f26', '#3a2766'], bgCol: 0, ground: 'snow', deco: 'sombra' },
    virus: { sky: ['#0f2a1a', '#2f6b3a'], bgCol: 6, ground: 'grass', deco: 'virus' },
    estrada: { sky: ['#7fd4ff', '#d8f4ff'], bgCol: 6, ground: 'grass', deco: 'estrada' },
    interior: { sky: ['#ffd89b', '#ffb36b'], bgCol: 4, ground: 'sand', deco: 'interior' }
  };
  C.theme = (id) => THEMES[id] || THEMES.festival;
  /** Céu em degradê + faixa de silhuetas com paralaxe (folha bg, 24px). */
  C.sky = function (g, theme, camX, camY, t, opt) {
    const th = C.theme(theme), c = g.ctx();
    // Cenário pintado em camadas (gfx/gfx.js). Sem as imagens, usa o fundo antigo.
    if (!(GEO.gfx && GEO.gfx.ready && GEO.gfx.sky(g, theme, camX, camY, t, opt))) {
      const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, th.sky[0]); gr.addColorStop(1, th.sky[1]);
      c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
      const par = E.reduced ? 0 : 0.25;
      const base = 120 - (camY || 0) * 0.05;
      const off = -((camX || 0) * par) % 24;
      for (let x = off - 24; x < E.W + 24; x += 24) {
        g.spr('bg', th.bgCol + 8, x, base, { alpha: 0.9 });
        g.spr('bg', th.bgCol + 16, x, base + 24, { alpha: 0.9 }); g.spr('bg', th.bgCol + 16, x, base + 48, { alpha: 0.9 }); g.spr('bg', th.bgCol + 16, x, base + 72, { alpha: 0.9 }); g.spr('bg', th.bgCol + 16, x, base + 96, { alpha: 0.9 });
      }
    }
    if (th.deco === 'festa' && !E.reduced) {
      for (let i = 0; i < 18; i++) { const x = ((i * 53 - (camX || 0) * 0.4) % (E.W + 60) + E.W + 60) % (E.W + 60) - 30; c.fillStyle = ['#e5484d', '#3ec1ff', '#2ecc71', '#f1c40f', '#9b59b6'][i % 5]; c.beginPath(); c.moveTo(x, 18); c.lineTo(x + 7, 30); c.lineTo(x + 14, 18); c.fill(); }
      c.strokeStyle = '#5a3d2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 18); c.lineTo(E.W, 18); c.stroke();
    }
    if (th.deco === 'cordel') {
      c.strokeStyle = '#6b4f2a'; c.lineWidth = 1;
      for (let r = 0; r < 2; r++) { const yy = 26 + r * 30; c.beginPath(); c.moveTo(0, yy); c.lineTo(E.W, yy + 4); c.stroke();
        for (let i = 0; i < 9; i++) { const x = ((i * 61 + r * 30 - (camX || 0) * (0.3 + r * 0.1)) % (E.W + 60) + E.W + 60) % (E.W + 60) - 30; c.fillStyle = '#2a2233'; c.fillRect(x, yy + 2, 16, 20); c.fillStyle = '#efe1bf'; c.fillRect(x + 1, yy + 3, 14, 18); c.fillStyle = '#2a2233'; c.fillRect(x + 3, yy + 8, 10, 8); } }
    }
    if ((th.deco === 'sombra' || th.deco === 'virus' || th.deco === 'mosaico') && !(GEO.gfx && GEO.gfx.ready)) {
      for (let i = 0; i < 30; i++) { const x = (i * 97) % E.W, y = (i * 53) % 110; c.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.2 * Math.sin(t * 2 + i)) + ')'; c.fillRect(x, y, 1, 1); }
    }
    if (th.deco === 'torre' && !(GEO.gfx && GEO.gfx.ready)) {
      for (let i = 0; i < 40; i++) { const x = (i * 71) % E.W, y = ((i * 37) - (camY || 0) * 0.1) % E.H; c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x, (y + E.H) % E.H, 1, 1); }
    }
  };

  /* ------------------------------------------------ física de plataforma */
  const T = (C.T = 18);
  /**
   * Mapa de tiles: tiles[y][x] código. Sólidos: 'G' chão (grama), 'D' terra, 'B' bloco, 'S' areia, 'N' neve, 'W' madeira;
   * '=' plataforma de mão única; '^' espinhos (dano).
   */
  C.SOLID = new Set(['G', 'D', 'B', 'S', 'N', 'W', 'X', 'M']);
  C.level = function (w, h) {
    const tiles = []; for (let y = 0; y < h; y++) tiles.push(new Array(w).fill('.'));
    const L = { w, h, tiles, movers: [], springs: [], objs: [] };
    L.get = (x, y) => (x < 0 || x >= w ? 'B' : y < 0 ? '.' : y >= h ? '.' : tiles[y][x]);
    L.set = (x, y, c) => { if (x >= 0 && x < w && y >= 0 && y < h) tiles[y][x] = c; };
    L.fill = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) L.set(x, y, c); };
    /** chão de x0 a x1 com topo em y (preenche até o fundo). */
    L.ground = (x0, x1, y, top, fill) => { L.fill(x0, y, x1, y, top || 'G'); L.fill(x0, y + 1, x1, h - 1, fill || 'D'); };
    L.plat = (x0, x1, y, c) => L.fill(x0, y, x1, y, c || '=');
    return L;
  };
  C.isSolid = (L, tx, ty) => C.SOLID.has(L.get(tx, ty));
  /** Cria corpo físico. */
  C.body = (x, y, w, h) => ({ x, y, w, h, vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, jumpBuf: 0, inv: 0, state: 'idle', ride: null });
  /**
   * Atualiza corpo do jogador: input + gravidade + colisão com tiles, plataformas de mão única e móveis.
   * opts: {speed, jumpV, gravity, control:true}
   */
  C.physics = function (L, b, dt, opts) {
    const o = Object.assign({ speed: 105, jumpV: 315, gravity: 900, control: true }, opts || {});
    const IN = GG.input;
    if (o.control) {
      const ax = IN.axisX();
      const target = ax * o.speed;
      b.vx += (target - b.vx) * Math.min(1, dt * (b.onGround ? 14 : 8));
      if (ax) b.face = ax;
      if (IN.pressed('jump')) b.jumpBuf = 0.12;
      if (b.onGround) b.coyote = 0.1; else b.coyote -= dt;
      b.jumpBuf -= dt;
      if (b.jumpBuf > 0 && b.coyote > 0) { b.vy = -o.jumpV; b.jumpBuf = 0; b.coyote = 0; b.onGround = false; b.ride = null; GG.audio.sfx('jump'); }
      if (!IN.down('jump') && b.vy < -120) b.vy = -120;
    }
    b.vy = Math.min(b.vy + o.gravity * dt, 460);
    // plataforma móvel carregando
    if (b.ride) { b.x += b.ride.dx; b.y += b.ride.dy; }
    // eixo X
    b.x += b.vx * dt;
    const tx0 = Math.floor(b.x / T), tx1 = Math.floor((b.x + b.w - 1) / T), ty0 = Math.floor(b.y / T), ty1 = Math.floor((b.y + b.h - 1) / T);
    for (let ty = ty0; ty <= ty1; ty++) {
      if (b.vx > 0 && C.isSolid(L, tx1, ty)) { b.x = tx1 * T - b.w; b.vx = 0; }
      else if (b.vx < 0 && C.isSolid(L, tx0, ty)) { b.x = (tx0 + 1) * T; b.vx = 0; }
    }
    // eixo Y
    const prevBottom = b.y + b.h;
    b.y += b.vy * dt;
    b.onGround = false; b.ride = null;
    const lx0 = Math.floor(b.x / T), lx1 = Math.floor((b.x + b.w - 1) / T);
    if (b.vy >= 0) {
      const ty = Math.floor((b.y + b.h) / T);
      for (let tx = lx0; tx <= lx1; tx++) {
        const c = L.get(tx, ty);
        if (C.SOLID.has(c) || (c === '=' && prevBottom <= ty * T + 2)) { b.y = ty * T - b.h; b.vy = 0; b.onGround = true; break; }
      }
    } else {
      const ty = Math.floor(b.y / T);
      for (let tx = lx0; tx <= lx1; tx++) if (C.isSolid(L, tx, ty)) { b.y = (ty + 1) * T; b.vy = 0; break; }
    }
    // plataformas móveis (mão única)
    L.movers.forEach((m) => {
      if (b.vy >= 0 && b.x + b.w > m.x + 1 && b.x < m.x + m.w - 1 && prevBottom <= m.y + 3 && b.y + b.h >= m.y) { b.y = m.y - b.h; b.vy = 0; b.onGround = true; b.ride = m; }
    });
    // molas
    L.springs.forEach((s) => {
      if (b.vy >= 0 && b.x + b.w > s.x && b.x < s.x + 16 && b.y + b.h >= s.y + 4 && prevBottom <= s.y + 8) { b.vy = -(s.power || 470); b.onGround = false; s.t = 0.25; GG.audio.sfx('spring'); }
    });
    b.state = !b.onGround ? 'jump' : Math.abs(b.vx) > 12 ? 'run' : 'idle';
    if (b.inv > 0) b.inv -= dt;
    if (o.control) C.juice(b, dt);
  };
  C.updateMovers = function (L, dt, time) {
    L.movers.forEach((m) => {
      const ox = m.x, oy = m.y;
      const k = Math.sin(time * (m.speed || 1)) * (m.range || 40);
      m.x = m.x0 + (m.axis === 'y' ? 0 : k); m.y = m.y0 + (m.axis === 'y' ? k : 0);
      m.dx = m.x - ox; m.dy = m.y - oy;
    });
    L.springs.forEach((s) => { if (s.t > 0) s.t -= dt; });
  };
  /** Desenho de tiles visíveis com o tileset de plataforma (Kenney Pixel Platformer). */
  const TILE = {
    grass: { top: [1, 2, 3], fill: 122, single: 0 }, sand: { top: [41, 42, 43], fill: 122, single: 40 }, snow: { top: [81, 82, 83], fill: 122, single: 80 }
  };
  C.drawTiles = function (g, L, cam, theme) {
    const th = C.theme(theme), set = TILE[th.ground] || TILE.grass;
    const x0 = Math.max(0, Math.floor(cam.x / T) - 1), x1 = Math.min(L.w - 1, Math.floor((cam.x + E.W) / T) + 1);
    const y0 = Math.max(0, Math.floor(cam.y / T) - 1), y1 = Math.min(L.h - 1, Math.floor((cam.y + E.H) / T) + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const c = L.tiles[y][x]; if (c === '.') continue;
      const px = x * T, py = y * T;
      if (c === 'G' || c === 'S' || c === 'N') {
        const l = L.get(x - 1, y) === c, r = L.get(x + 1, y) === c;
        g.spr('plat', !l && !r ? set.single : !l ? set.top[0] : !r ? set.top[2] : set.top[1], px, py);
      } else if (c === 'D') g.spr('plat', (x * 7 + y * 3) % 5 === 0 ? 5 : 4, px, py);
      else if (c === 'B') g.spr('plat', 26, px, py);
      else if (c === 'W') g.spr('plat', 47, px, py);
      else if (c === 'M') g.spr('plat', 13, px, py);
      else if (c === 'X') g.spr('plat', 27, px, py);
      else if (c === '=') { const l = L.get(x - 1, y) === '=', r = L.get(x + 1, y) === '='; g.spr('plat', !l ? 48 : !r ? 50 : 49, px, py); }
      else if (c === '^') g.spr('plat', 68, px, py);
    }
  };
  C.drawMovers = function (g, L) { L.movers.forEach((m) => { for (let i = 0; i < m.w / T; i++) g.spr('plat', i === 0 ? 48 : i === m.w / T - 1 ? 50 : 49, m.x + i * T, m.y); }); };
  C.drawSprings = function (g, L) { L.springs.forEach((s) => g.img(P.mola(s.t > 0), s.x, s.y)); };
  /** Placa com texto curto no mundo. */
  C.sign = function (g, x, y, text, color, clampW) {
    const w = Math.max(40, g.textW(text, 6) + 10);
    if (clampW) x = Math.max(w / 2 + 2, Math.min(clampW - w / 2 - 2, x));
    g.panel(x - w / 2, y, w, 14, color || '#fff8e6', '#15152a');
    g.text(text, x, y + 4, { size: 6, color: '#2a2233', align: 'center', shadow: false });
  };
  /** Sprite sepia (xilogravura) — compõe sem ler pixels (funciona em file://). */
  const sepiaCache = {};
  C.sepiaSheet = function (name) {
    if (sepiaCache[name]) return sepiaCache[name];
    const im = E.img[name]; if (!im) return null;
    const c = P.mk(im.width, im.height, (x) => {
      x.drawImage(im, 0, 0);
      x.globalCompositeOperation = 'saturation'; x.fillStyle = '#808080'; x.fillRect(0, 0, im.width, im.height);
      x.globalCompositeOperation = 'multiply'; x.fillStyle = '#e8d4a8'; x.fillRect(0, 0, im.width, im.height);
      x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0);
    });
    sepiaCache[name] = c; return c;
  };
  /** Tela de fundo simples para Estudo rápido e Revisão (mesa do Atlas animada). */
  GEO.scenes.studyRoom = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    sc.update = (dt) => { sc.t += dt; };
    sc.draw = (g) => {
      const c = g.ctx(), X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      if (!(X && X.photo(c, 'satDia', sc.t, 'rgba(20,14,50,.55)'))) { const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#2a1f4a'); gr.addColorStop(1, '#141030'); c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H); }
      if (X) { X.glow(c, 200, 130, 170, '#ffd89a', 0.25); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(44, 65, 320, 150); }
      c.fillStyle = '#6b4f2a'; c.fillRect(40, 60, 320, 150); c.fillStyle = '#f3e6c4'; c.fillRect(48, 66, 150, 136); c.fillRect(202, 66, 150, 136);
      GG.maps.drawCanvas(c, 60, 72, 126, null, 'rgba(0,0,0,.2)');
      g.text('ATLAS VIVO', 277, 80, { size: 8, color: '#6d4c8f', align: 'center', shadow: false });
      g.text((ctx.def && ctx.def.title) || '', 277, 100, { size: 6, color: '#2a2233', align: 'center', shadow: false, maxW: 140 });
      g.img(P.gaia(Math.floor(sc.t * 2) % 2), 262, 130 + Math.sin(sc.t * 2) * 4, { scale: 2 });
      if (X) { X.globe(c, 330, 34, 22, sc.t); X.ilus(c, 'livros', 72, 44, 30, { shadow: true }); }
    };
    return sc;
  };
})();
