/* =====================================================================
   src/core/engine.js — motor 2D em canvas para os módulos novos.
   Resolução lógica fixa 400x225 (16:9) escalada em "pixel perfeito".
   Laço com passo fixo (60 Hz), cenas {init, update, draw, hud},
   folhas de sprites, partículas, textos flutuantes, tremor de tela e
   pausa automática quando qualquer janela (pergunta, menu, diálogo)
   está aberta. Opção "reduzir movimento" desliga tremor e paralaxe.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const U = GG.util;
  const E = (GG.engine = {});
  E.W = 400; E.H = 225;
  E.reduced = false; // reduzir movimento / partículas
  E.scene = null; E.t = 0; E.frame = 0;
  let cv = null, ctx = null, scale = 1, raf = 0, acc = 0, lastT = 0, shakeT = 0, shakeA = 0;
  const DT = 1 / 60;

  /* ------------------------------------------------------------ folhas de sprites */
  const SHEETS = {
    plat: { f: 'plat.png', s: 18, c: 20 }, chars: { f: 'chars.png', s: 24, c: 9 }, bg: { f: 'bg.png', s: 24, c: 8 },
    shmup: { f: 'shmup.png', s: 16, c: 12 }, ships: { f: 'ships.png', s: 32, c: 12 }, dungeon: { f: 'dungeon.png', s: 16, c: 12 },
    town: { f: 'town.png', s: 16, c: 12 }, urban: { f: 'urban.png', s: 16, c: 27 }, food: { f: 'food.png', s: 18, c: 10 }, farm: { f: 'farm.png', s: 18, c: 10 }
  };
  E.img = {};
  E.loadSheets = function (base) {
    return Promise.all(Object.keys(SHEETS).map((k) => new Promise((res) => {
      const im = new Image();
      im.onload = () => { E.img[k] = im; res(); };
      im.onerror = () => { console.warn('sprite ausente', k); res(); };
      im.src = base + SHEETS[k].f;
    })));
  };

  /* ------------------------------------------------------------ inicialização */
  E.init = function (canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    E.ctx = ctx; E.canvas = cv;
    window.addEventListener('resize', E.resize);
    E.resize();
  };
  E.resize = function () {
    if (!cv) return;
    const host = cv.parentElement;
    const aw = host.clientWidth, ah = host.clientHeight;
    let w = aw, h = Math.round(aw * 9 / 16);
    if (h > ah) { h = ah; w = Math.round(ah * 16 / 9); }
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(E.W, Math.round(w * dpr)); cv.height = Math.max(E.H, Math.round(h * dpr));
    scale = cv.width / E.W;
    E.cssScale = w / E.W;
  };
  /** Converte coordenada de tela (clientX/Y) para coordenada lógica. */
  E.toLogical = function (cx, cy) {
    const r = cv.getBoundingClientRect();
    return { x: (cx - r.left) / r.width * E.W, y: (cy - r.top) / r.height * E.H };
  };

  E.start = function (scene) {
    if (E.scene && E.scene.exit) { try { E.scene.exit(); } catch (e) { console.error(e); } }
    E.scene = scene; E.fx.clear(); E.t = 0;
    if (scene && scene.init) scene.init();
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); }
  };
  E.stop = function () {
    if (E.scene && E.scene.exit) { try { E.scene.exit(); } catch (e) { console.error(e); } }
    E.scene = null;
  };
  E.isPaused = () => !!(GG.ui && GG.ui.blocking && GG.ui.blocking()) || !!(E.scene && E.scene.paused) || document.hidden;

  function loop(now) {
    raf = requestAnimationFrame(loop);
    let dt = (now - lastT) / 1000; lastT = now;
    if (dt > 0.25) dt = 0.25;
    GG.input.pollPad();
    const paused = E.isPaused();
    if (!paused && E.scene) {
      acc += dt;
      let n = 0;
      while (acc >= DT && n < 5) {
        try { E.scene.update(DT); } catch (e) { console.error(e); E.scene.paused = true; }
        E.fx.update(DT); E.t += DT; E.frame++; acc -= DT; n++;
        GG.input.endFrame();
        if (E.isPaused()) { acc = 0; break; }
      }
      if (shakeT > 0) shakeT -= dt;
    } else { acc = 0; GG.input.endFrame(); }
    draw();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0d1020'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (shakeT > 0 && !E.reduced) ctx.translate(Math.round(U.rand(-shakeA, shakeA)), Math.round(U.rand(-shakeA, shakeA)));
    if (E.scene && E.scene.draw) { try { E.scene.draw(E.g); } catch (e) { console.error(e); } }
    E.fx.draw(E.g);
    if (E.scene && E.scene.hud) { ctx.setTransform(scale, 0, 0, scale, 0, 0); try { E.scene.hud(E.g); } catch (e) { console.error(e); } }
  }
  E.shake = function (amp, time) { if (E.reduced) return; shakeA = amp || 3; shakeT = time || 0.25; };

  /* ------------------------------------------------------------ desenho */
  const g = (E.g = {});
  g.cam = { x: 0, y: 0 };
  /** Entra no espaço do mundo (câmera). */
  g.world = function (cam, parallax) {
    const p = parallax == null ? 1 : parallax;
    ctx.save(); ctx.translate(-Math.round(cam.x * p), -Math.round(cam.y * p));
  };
  g.end = () => ctx.restore();
  g.ctx = () => ctx;
  g.clear = function (color) { ctx.fillStyle = color; ctx.fillRect(-50, -50, E.W + 100, E.H + 100); };
  g.rect = function (x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  g.frame = function (x, y, w, h, color, lw) { ctx.strokeStyle = color; ctx.lineWidth = lw || 1; ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1); };
  g.circle = function (x, y, r, color, stroke) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = stroke; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  };
  g.line = function (x1, y1, x2, y2, color, w, dash) {
    ctx.strokeStyle = color; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
  };
  g.alpha = (a) => { ctx.globalAlpha = a; };
  /** Sprite de uma folha: opt {flip, scale, alpha, rot, w, h (em células)}. */
  g.spr = function (sheet, idx, x, y, opt) {
    const S = SHEETS[sheet], im = E.img[sheet];
    if (!S || !im) return;
    const o = opt || {}, s = S.s, cw = (o.w || 1) * s, ch = (o.h || 1) * s;
    const sx = (idx % S.c) * s, sy = Math.floor(idx / S.c) * s, k = o.scale || 1;
    const dw = cw * k, dh = ch * k;
    if (!o.flip && !o.rot && o.alpha == null && !o.flipY) { ctx.drawImage(im, sx, sy, cw, ch, Math.round(x), Math.round(y), dw, dh); return; }
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(Math.round(x + dw / 2), Math.round(y + dh / 2));
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.flip ? -1 : 1, o.flipY ? -1 : 1);
    ctx.drawImage(im, sx, sy, cw, ch, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  };
  g.sheetSize = (sheet) => SHEETS[sheet].s;
  /** Desenha um canvas/imagem pronto (sprites originais). */
  g.img = function (im, x, y, opt) {
    if (!im) return;
    const o = opt || {}, k = o.scale || 1, w = im.width * k, h = im.height * k;
    if (!o.flip && !o.rot && o.alpha == null) { ctx.drawImage(im, Math.round(x), Math.round(y), w, h); return; }
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(Math.round(x + w / 2), Math.round(y + h / 2)); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
  };
  /** Texto pixelado (Press Start 2P). opt {size, color, align, shadow, font, maxW}. */
  g.text = function (str, x, y, opt) {
    const o = opt || {}, size = o.size || 8;
    ctx.font = (o.bold ? '800 ' : '') + size + 'px ' + (o.font || "'Press Start 2P', monospace");
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'top';
    if (o.shadow !== false) { ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.65)'; ctx.fillText(str, Math.round(x) + 1, Math.round(y) + 1, o.maxW); }
    ctx.fillStyle = o.color || '#fff'; ctx.fillText(str, Math.round(x), Math.round(y), o.maxW);
  };
  g.textW = function (str, size, font) { ctx.font = (size || 8) + 'px ' + (font || "'Press Start 2P', monospace"); return ctx.measureText(str).width; };
  /** Texto com quebra de linha dentro de largura. */
  g.wrap = function (str, x, y, maxW, opt) {
    const o = Object.assign({ size: 7, lh: 10 }, opt || {});
    const words = String(str).split(' '); let line = '', yy = y;
    words.forEach((w) => {
      const t = line ? line + ' ' + w : w;
      if (g.textW(t, o.size, o.font) > maxW && line) { g.text(line, x, yy, o); line = w; yy += o.lh; } else line = t;
    });
    if (line) g.text(line, x, yy, o);
    return yy + o.lh;
  };
  /** Painel com borda (placas, balões). */
  g.panel = function (x, y, w, h, fill, border) {
    ctx.fillStyle = border || '#1b1f3a'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, Math.round(w) + 2, Math.round(h) + 2);
    ctx.fillStyle = fill || '#fff8e6'; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  /* ------------------------------------------------------------ efeitos */
  const fx = (E.fx = { parts: [], floats: [] });
  fx.clear = function () { fx.parts.length = 0; fx.floats.length = 0; };
  /** Explosão de partículas (em coordenadas do mundo, desenhadas com a câmera da cena). */
  fx.burst = function (x, y, color, n, speed, opt) {
    const o = opt || {};
    const count = E.reduced ? Math.ceil((n || 10) / 4) : (n || 10);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = (speed || 80) * (0.4 + Math.random() * 0.8);
      fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), life: o.life || 0.6, t: 0, c: Array.isArray(color) ? U.pick(color) : color, s: o.size || 2, g: o.grav == null ? 180 : o.grav, cam: o.screen ? null : 'world' });
    }
  };
  fx.confetti = function (x, y, n) { fx.burst(x, y, ['#ffd23f', '#3ec1ff', '#ff5d8f', '#7bff8f', '#ffffff', '#b07bff'], n || 30, 140, { up: 80, life: 1.1, size: 2 }); };
  /** Texto flutuante (+10, ✓). */
  fx.float = function (x, y, text, color) { fx.floats.push({ x, y, text, c: color || '#fff', t: 0, life: 1 }); };
  fx.update = function (dt) {
    for (let i = fx.parts.length - 1; i >= 0; i--) { const p = fx.parts[i]; p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t >= p.life) fx.parts.splice(i, 1); }
    for (let i = fx.floats.length - 1; i >= 0; i--) { const f = fx.floats[i]; f.t += dt; f.y -= 22 * dt; if (f.t >= f.life) fx.floats.splice(i, 1); }
  };
  fx.draw = function () {
    const cam = (E.scene && E.scene.cam) || { x: 0, y: 0 };
    ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    fx.parts.forEach((p) => { ctx.globalAlpha = Math.max(0, 1 - p.t / p.life); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
    ctx.globalAlpha = 1;
    fx.floats.forEach((f) => { ctx.globalAlpha = Math.max(0, 1 - f.t / f.life); g.text(f.text, f.x, f.y, { size: 8, color: f.c, align: 'center' }); });
    ctx.globalAlpha = 1; ctx.restore();
  };

  /* ------------------------------------------------------------ colisão */
  E.overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
})();
