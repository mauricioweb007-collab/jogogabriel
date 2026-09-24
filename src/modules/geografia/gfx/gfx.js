/* =====================================================================
   gfx/gfx.js — CAMADA GRÁFICA "PROFISSIONAL" DE GEOGRAFIA (GEO.gfx).
   Só é carregada por jogar.html: nada muda em Ciências, no lançador
   nem no Nexus. Acrescenta, por cima do motor pixel 400x225:
   • ilustrações 3D (Fluent Emoji, Microsoft, MIT) desenhadas em HD;
   • cenários pintados em camadas com paralaxe (Kenney Background
     Elements, CC0) tingidos por tema, sol/lua com brilho, raios de
     luz, estrelas, nuvens e partículas de ambiente;
   • fotos de satélite reais do Brasil de dia e de noite e um globo
     terrestre girando (texturas Solar System Scope, CC BY 4.0);
   • efeitos: brilho aditivo, estrelinhas, anéis de impacto, poeira de
     pulo/pouso, flash, textos que "saltam", vinheta, transição em íris
     e cartão animado de abertura de fase.
   Tudo respeita "reduzir movimento" (GG.engine.reduced) e funciona em
   file:// (nenhuma leitura de pixels de imagem carregada).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine;
  const X = (GEO.gfx = { ready: false, img: {}, fx: [], lite: false });
  const BASE = 'assets/';
  const LAYERS = ['hills', 'hillsLarge', 'mountains', 'cloudLayer1', 'cloudLayerB1', 'groundLayer1'];
  const PROPS = ['treePalm', 'tree', 'treeLong', 'treePine', 'treeOrange', 'cloud1', 'cloud3', 'cloud5', 'cloud7', 'sun', 'moonFull', 'house1', 'house2', 'houseSmall1', 'houseAlt1', 'cactus1', 'cactus2', 'bush1', 'bush2', 'bushOrange1', 'fence', 'tower'];
  const FX = ['star_07', 'star_04', 'light_01', 'light_03', 'spark_01', 'spark_04', 'magic_02', 'magic_05', 'circle_05', 'flare_01', 'smoke_04', 'twirl_02', 'puff0', 'puff1', 'puff2', 'puff3', 'puff4', 'puff5', 'puff6', 'puff7'];
  const PHOTOS = { satDia: 'fotos/sat_dia.jpg', satNoite: 'fotos/sat_noite.jpg', terra: 'fotos/terra_1024.jpg' };

  function load(src) {
    return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.warn('imagem ausente', src); res(null); }; im.src = src; });
  }
  /** Carrega todas as imagens (≈2,3 MB, local). Nunca falha: sem imagem, cai no visual antigo. */
  X.load = function () {
    const jobs = [];
    jobs.push(load(BASE + 'ilustracoes/fluent3d.png').then((im) => { X.img.ilus = im; }));
    LAYERS.concat(PROPS).forEach((n) => jobs.push(load(BASE + 'cenario/' + n + '.png').then((im) => { X.img[n] = im; })));
    FX.forEach((n) => jobs.push(load(BASE + 'efeitos/' + n + '.png').then((im) => { X.img[n] = im; })));
    Object.keys(PHOTOS).forEach((k) => jobs.push(load(BASE + PHOTOS[k]).then((im) => { X.img[k] = im; })));
    return Promise.all(jobs).then(() => { X.ready = !!X.img.ilus; installHooks(); });
  };

  /* ================================================================ utilidades de desenho */
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); fn(c.getContext('2d'), c.width, c.height); return c; };
  X.mk = mk;
  /** Executa fn com suavização ligada (imagens HD sobre o canvas pixel). */
  X.hd = function (c, fn) { const s = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'low'; try { fn(); } finally { c.imageSmoothingEnabled = s; } };
  const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  X.hash = hash;
  const cache = {};
  /** Silhueta tingida (com degradê vertical) de uma camada/prop — composta sem ler pixels. */
  X.tint = function (name, top, bottom, alpha) {
    const key = name + top + bottom + (alpha || 1);
    if (cache[key]) return cache[key];
    const im = X.img[name]; if (!im) return null;
    const c = mk(im.width, im.height, (x, w, h) => {
      x.drawImage(im, 0, 0);
      x.globalCompositeOperation = 'source-atop';
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom || top);
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      // borda iluminada no topo (lê a forma pela máscara deslocada)
      x.globalCompositeOperation = 'source-over';
    });
    if (alpha != null && alpha < 1) { const c2 = mk(c.width, c.height, (x) => { x.globalAlpha = alpha; x.drawImage(c, 0, 0); }); cache[key] = c2; return c2; }
    cache[key] = c; return c;
  };
  /** Textura branca de partícula tingida (para 'lighter'). */
  X.glowTex = function (name, color) {
    const key = 'g' + name + color; if (cache[key]) return cache[key];
    if (name === 'light_01') { // brilho radial que termina em transparência total (sem "caixa")
      cache[key] = mk(64, 64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'aa'); gr.addColorStop(0.6, color + '33'); gr.addColorStop(1, color + '00'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
      return cache[key];
    }
    const im = X.img[name]; if (!im) return null;
    const c = mk(im.width, im.height, (x, w, h) => { x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = color; x.fillRect(0, 0, w, h); });
    cache[key] = c; return c;
  };

  /* ================================================================ ilustrações 3D */
  const idx = {};
  (GEO.ILUS ? GEO.ILUS.names : []).forEach((n, i) => { idx[n] = i; });
  X.has = (name) => idx[name] != null;
  /** Desenha a ilustração centrada em (x,y) com tamanho s (px lógicos). o: {alpha, rot, gray, shadow, glow, flip, sy} */
  X.ilus = function (g, name, x, y, s, o) {
    const im = X.img.ilus, i = idx[name]; if (!im || i == null) return false;
    const opt = o || {}, cell = GEO.ILUS.cell, cols = GEO.ILUS.cols;
    const c = g.ctx ? g.ctx() : g;
    c.save();
    if (opt.glow) X.glow(c, x, y, s * 0.9, opt.glow, 0.55);
    if (opt.shadow) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y + s * 0.48, s * 0.34, s * 0.09, 0, 0, Math.PI * 2); c.fill(); }
    if (opt.alpha != null) c.globalAlpha *= opt.alpha;
    c.translate(x, y); if (opt.rot) c.rotate(opt.rot); c.scale(opt.flip ? -1 : 1, opt.sy || 1);
    if (opt.gray) { const gi = grayIcon(name, i); X.hd(c, () => c.drawImage(gi, -s / 2, -s / 2, s, s)); }
    else X.hd(c, () => c.drawImage(im, (i % cols) * cell, Math.floor(i / cols) * cell, cell, cell, -s / 2, -s / 2, s, s));
    c.restore();
    return true;
  };
  /** Versão cinza (bloqueado) feita uma vez: filtro de canvas por quadro é caro. */
  function grayIcon(name, i) {
    const key = 'gray' + name; if (cache[key]) return cache[key];
    const cell = GEO.ILUS.cell, cols = GEO.ILUS.cols, im = X.img.ilus;
    cache[key] = mk(cell, cell, (w) => {
      w.drawImage(im, (i % cols) * cell, Math.floor(i / cols) * cell, cell, cell, 0, 0, cell, cell);
      w.globalCompositeOperation = 'saturation'; w.fillStyle = '#808080'; w.fillRect(0, 0, cell, cell);
      w.globalCompositeOperation = 'multiply'; w.fillStyle = '#9a9aa8'; w.fillRect(0, 0, cell, cell);
      w.globalCompositeOperation = 'destination-in'; w.drawImage(im, (i % cols) * cell, Math.floor(i / cols) * cell, cell, cell, 0, 0, cell, cell);
    });
    return cache[key];
  }
  /** Elemento DOM com a ilustração (sprite CSS). */
  X.el = function (name, size, cls) {
    const i = idx[name]; const s = size || 24;
    const sp = document.createElement('span'); sp.className = 'ilus' + (cls ? ' ' + cls : ''); sp.setAttribute('aria-hidden', 'true');
    if (i == null || !GEO.ILUS) { sp.textContent = '•'; return sp; }
    const k = s / GEO.ILUS.cell, cols = GEO.ILUS.cols, rows = Math.ceil(GEO.ILUS.names.length / cols);
    Object.assign(sp.style, { width: s + 'px', height: s + 'px', backgroundSize: (cols * s) + 'px ' + (rows * s) + 'px', backgroundPosition: (-(i % cols) * s) + 'px ' + (-Math.floor(i / cols) * s) + 'px' });
    void k; return sp;
  };

  /* ================================================================ luz */
  /** Brilho radial aditivo. */
  X.glow = function (c, x, y, r, color, a) {
    const tex = X.glowTex('light_01', color || '#fff8c0');
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= (a == null ? 0.6 : a);
    if (tex) X.hd(c, () => c.drawImage(tex, x - r, y - r, r * 2, r * 2));
    else { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.restore();
  };
  /** Raios de luz (god rays) saindo de um ponto. */
  /** Leque de raios pré-desenhado uma vez por cor (barato por quadro). */
  X.rays = function (c, x, y, len, color, t, n) {
    if (E.reduced) t = 0;
    const N = n || 9, key = 'rays' + color + N;
    let fan = cache[key];
    if (!fan) fan = cache[key] = mk(256, 256, (w) => {
      w.translate(128, 128); w.globalCompositeOperation = 'lighter';
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2, ww = 0.07 + 0.05 * ((i * 7) % 3) / 2;
        const gr = w.createRadialGradient(0, 0, 0, 0, 0, 128); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255,255,255,0)');
        w.fillStyle = gr; w.globalAlpha = 0.5 + 0.3 * ((i * 5) % 3) / 2;
        w.beginPath(); w.moveTo(0, 0); w.arc(0, 0, 128, a - ww, a + ww); w.closePath(); w.fill();
      }
    });
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.2 + 0.05 * Math.sin(t * 1.3); c.translate(x, y); c.rotate(t * 0.05);
    X.hd(c, () => c.drawImage(fan, -len, -len, len * 2, len * 2));
    c.restore();
  };
  /** Vinheta: escurece só os 4 cantos com um degradê que chega a zero antes da borda do retângulo (sem linhas). */
  X.vignette = function (c, strength) {
    const k = strength == null ? 0.38 : strength, key = 'vig' + k;
    let v = cache[key];
    if (!v) v = cache[key] = mk(64, 64, (w) => { const gr = w.createRadialGradient(0, 0, 0, 0, 0, 64); gr.addColorStop(0, 'rgba(8,6,20,' + k + ')'); gr.addColorStop(0.55, 'rgba(8,6,20,' + (k * 0.35).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(8,6,20,0)'); w.fillStyle = gr; w.fillRect(0, 0, 64, 64); });
    const W2 = 130, H2 = 90;
    X.hd(c, () => {
      c.drawImage(v, 0, 0, W2, H2);
      c.save(); c.translate(E.W, 0); c.scale(-1, 1); c.drawImage(v, 0, 0, W2, H2); c.restore();
      c.save(); c.translate(0, E.H); c.scale(1, -1); c.drawImage(v, 0, 0, W2, H2); c.restore();
      c.save(); c.translate(E.W, E.H); c.scale(-1, -1); c.drawImage(v, 0, 0, W2, H2); c.restore();
    });
  };

  /* ================================================================ cenários em camadas */
  /* top/bot: cores do degradê do céu (3 paradas). layers: silhuetas de longe para perto. */
  const SKIES = {
    festival: { sky: ['#3d2a6e', '#e2677f', '#ffc07a'], sun: { x: 300, y: 92, r: 20, c: '#fff0b8', glow: '#ffb070' }, rays: '#ffd9a0',
      layers: [{ im: 'mountains', c: ['#a8588c', '#c77196'], y: -58, par: 0.08 }, { im: 'hillsLarge', c: ['#7c3a78', '#8c4580'], y: -34, par: 0.16 }],
      props: { list: ['treePalm', 'treePalm', 'tree', 'houseSmall1'], c: ['#4a2358', '#3a1b48'], y: 8, h: 54, par: 0.3, gap: 70 }, amb: 'confetti', clouds: 'rgba(255,214,200,.55)' },
    cordel: { sky: ['#e9d6a8', '#f3e4c0', '#efdcae'], sun: { x: 80, y: 62, r: 18, c: '#f6e7b8', glow: '#d9b46a', woodcut: true },
      layers: [{ im: 'mountains', c: ['#cfb482', '#c4a672'], y: -56, par: 0.08 }, { im: 'hills', c: ['#b89462', '#a9854f'], y: -30, par: 0.16 }],
      props: { list: ['cactus1', 'cactus2', 'treeOrange', 'cactus1', 'fence'], c: ['#6e5230', '#5a4224'], y: 8, h: 46, par: 0.3, gap: 64 }, amb: 'dust', clouds: 'rgba(250,240,215,.6)' },
    torre: { sky: ['#070d24', '#172b62', '#3a5ba8'], moon: { x: 320, y: 40, r: 14 }, stars: 60,
      layers: [{ im: 'mountains', c: ['#1d2c5c', '#16224a'], y: -60, par: 0.05 }], skyline: { c: ['#101a3d', '#0b1330'], par: 0.12, y: -40 }, amb: 'snow' },
    mosaico: { sky: ['#120a2e', '#3a2168', '#8a4fb0'], moon: { x: 70, y: 46, r: 12 }, stars: 50, aurora: ['#7bffb0', '#b07bff'],
      layers: [{ im: 'mountains', c: ['#3a2466', '#2e1c52'], y: -58, par: 0.06 }, { im: 'hillsLarge', c: ['#24164a', '#1c113a'], y: -30, par: 0.12 }], amb: 'sparkle' },
    sombra: { sky: ['#06040f', '#1a1033', '#3a2766'], moon: { x: 300, y: 50, r: 16, c: '#d9c8ff' }, stars: 40,
      layers: [{ im: 'mountains', c: ['#1d1236', '#150d28'], y: -56, par: 0.06 }], fog: '#4a3a7a', amb: 'wisp' },
    virus: { sky: ['#041109', '#0f3a22', '#2f6b3a'], stars: 25,
      layers: [{ im: 'mountains', c: ['#0f3a24', '#0b2c1b'], y: -56, par: 0.06 }, { im: 'hills', c: ['#0a2a18', '#082012'], y: -28, par: 0.12 }], fog: '#2f7a3a', amb: 'spore' },
    estrada: { sky: ['#2f8ff0', '#7cc8ff', '#d8f2ff'], sun: { x: 70, y: 40, r: 16, c: '#fffbe0', glow: '#fff2a0' }, rays: '#fff6c8',
      layers: [{ im: 'mountains', c: ['#a8d4f0', '#bfe0f4'], y: -56, par: 0.06 }, { im: 'hillsLarge', c: ['#7cc47e', '#63b06a'], y: -32, par: 0.14 }],
      props: { list: ['treePalm', 'tree', 'houseSmall1', 'treeLong', 'treePalm', 'house2'], c: ['#3f8f52', '#2f7a44'], y: 8, h: 52, par: 0.28, gap: 66 }, amb: 'butterfly', cloudImgs: true },
    interior: { sky: ['#f07a4a', '#ffb56b', '#ffe2a8'], sun: { x: 320, y: 78, r: 24, c: '#fff4c8', glow: '#ffb35a' }, rays: '#ffe0a0',
      layers: [{ im: 'mountains', c: ['#e39a6a', '#d88c5c'], y: -58, par: 0.06 }, { im: 'hills', c: ['#c7783f', '#b86c36'], y: -30, par: 0.14 }],
      props: { list: ['treeOrange', 'cactus2', 'tree', 'bushOrange1', 'treeOrange'], c: ['#7a3f1c', '#643316'], y: 8, h: 48, par: 0.28, gap: 62 }, amb: 'dust', cloudImgs: true },
    // temas extras (minijogos e cenas próprias)
    floresta: { sky: ['#1f7fd6', '#6cc0f0', '#c8f0ff'], sun: { x: 330, y: 36, r: 15, c: '#fffbe0', glow: '#fff2a0' }, rays: '#f6ffd8',
      layers: [{ im: 'mountains', c: ['#6fb2a0', '#5aa08e'], y: -56, par: 0.06 }, { im: 'hillsLarge', c: ['#2f8a4c', '#26763f'], y: -30, par: 0.14 }],
      props: { list: ['tree', 'treeLong', 'treePalm', 'tree', 'treeLong'], c: ['#1d5a30', '#164a26'], y: 8, h: 58, par: 0.3, gap: 38 }, amb: 'butterfly', cloudImgs: true },
    sul: { sky: ['#5b8fc9', '#a9cbe8', '#e6f1f8'], sun: { x: 90, y: 44, r: 14, c: '#fffbe8', glow: '#e8f0ff' },
      layers: [{ im: 'mountains', c: ['#9fb8cf', '#8ea9c2'], y: -58, par: 0.06 }, { im: 'hills', c: ['#5e9a6a', '#4f8a5c'], y: -30, par: 0.14 }],
      props: { list: ['treePine', 'treePine', 'house1', 'treePine', 'fence'], c: ['#2c5a3a', '#224a2e'], y: 8, h: 56, par: 0.3, gap: 54 }, amb: 'leaf', cloudImgs: true },
    cidadeDia: { sky: ['#4d8fd6', '#9cc8ee', '#f2e2c4'], sun: { x: 60, y: 52, r: 15, c: '#fff6d8', glow: '#ffe0a0' }, rays: '#fff0c8',
      layers: [{ im: 'mountains', c: ['#a6c0da', '#98b4d0'], y: -60, par: 0.05 }], skyline: { c: ['#6f86a8', '#5c7396'], par: 0.12, y: -44, day: true }, amb: 'bird', cloudImgs: true }
  };
  X.SKIES = SKIES;
  X.hasSky = (id) => !!SKIES[id];

  /** Cópia da imagem já no tamanho de tela (px do dispositivo): o desenho vira cópia 1:1, sem reescala por quadro. */
  const scaledMap = new WeakMap();
  function scaled(img, w, h) {
    const k = E.canvas.width / E.W, dw = Math.max(1, Math.round(w * k)), dh = Math.max(1, Math.round(h * k));
    let m = scaledMap.get(img); if (!m) { m = {}; scaledMap.set(img, m); }
    const key = dw + 'x' + dh; if (m[key]) return m[key];
    if (Object.keys(m).length > 12) for (const kk in m) delete m[kk];
    m[key] = mk(dw, dh, (x) => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, dw, dh); });
    return m[key];
  }
  X.scaled = scaled;
  function drawLayerTiled(c, img, y, h, off) {
    const w = img.width * (h / img.height), sim = scaled(img, w, h);
    let x = -(((off % w) + w) % w);
    for (; x < E.W; x += w - 0.5) c.drawImage(sim, x, y, w, h);
  }
  /**
   * Céu completo. opt: {horizon (y da linha do chão, padrão 125), fill (preenche até o fim da tela)}.
   */
  X.sky = function (g, theme, camX, camY, t, opt) {
    const S = SKIES[theme]; if (!S) return false;
    const c = g.ctx ? g.ctx() : g, o = opt || {}, red = E.reduced;
    const cx = red ? 0 : (camX || 0), cy = camY || 0;
    const hz = (o.horizon == null ? 125 : o.horizon) - cy * 0.05;
    // céu
    const gr = c.createLinearGradient(0, 0, 0, Math.max(40, hz)); gr.addColorStop(0, S.sky[0]); gr.addColorStop(0.6, S.sky[1]); gr.addColorStop(1, S.sky[2]);
    c.fillStyle = gr; c.fillRect(-2, -2, E.W + 4, E.H + 4);
    // estrelas
    if (S.stars) for (let i = 0; i < S.stars; i++) { const x = hash(i) * E.W, y = hash(i + 99) * hz * 0.85, a = 0.35 + 0.45 * Math.abs(Math.sin(t * (0.8 + hash(i + 7)) + i)); c.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; const s = hash(i + 3) > 0.85 ? 2 : 1; c.fillRect(Math.round(x), Math.round(y), s, s); if (s === 2 && !red) X.glow(c, x + 1, y + 1, 5, '#cfe0ff', a * 0.5); }
    // aurora
    if (S.aurora && !red) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let b = 0; b < 2; b++) { c.beginPath(); for (let x = 0; x <= E.W; x += 8) { const y = 40 + b * 18 + Math.sin(x * 0.02 + t * 0.6 + b) * 10; if (x === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.lineTo(E.W, 0); c.lineTo(0, 0); c.closePath(); const ag = c.createLinearGradient(0, 0, 0, 80); ag.addColorStop(0, 'rgba(0,0,0,0)'); ag.addColorStop(1, S.aurora[b] + '40'); c.fillStyle = ag; c.fill(); }
      c.restore();
    }
    // sol / lua
    const body = S.sun || S.moon;
    if (body) {
      const bx = body.x - cx * 0.01, by = body.y - cy * 0.02;
      if (S.sun) {
        if (S.rays && !red && !X.lite) X.rays(c, bx, by, 105, S.rays, t);
        X.glow(c, bx, by, body.r * 3.2, body.glow || '#fff0b0', 0.85);
        const sg = c.createRadialGradient(bx - body.r * 0.3, by - body.r * 0.3, 1, bx, by, body.r); sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, body.c);
        c.fillStyle = sg; c.beginPath(); c.arc(bx, by, body.r, 0, Math.PI * 2); c.fill();
        if (body.woodcut) { c.strokeStyle = '#6e5230'; c.lineWidth = 1.5; c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.1; c.beginPath(); c.moveTo(bx + Math.cos(a) * (body.r + 3), by + Math.sin(a) * (body.r + 3)); c.lineTo(bx + Math.cos(a) * (body.r + 9), by + Math.sin(a) * (body.r + 9)); c.stroke(); } }
      } else {
        X.glow(c, bx, by, body.r * 3, body.c || '#cfe0ff', 0.5);
        if (X.img.moonFull) X.hd(c, () => c.drawImage(X.img.moonFull, bx - body.r, by - body.r, body.r * 2, body.r * 2));
        else { c.fillStyle = body.c || '#eef2ff'; c.beginPath(); c.arc(bx, by, body.r, 0, Math.PI * 2); c.fill(); }
      }
    }
    X.hd(c, () => {
      // nuvens (imagens) ou faixa de nuvem
      if (S.cloudImgs) for (let i = 0; i < 6; i++) { const im = X.img[['cloud1', 'cloud3', 'cloud5', 'cloud7'][i % 4]]; if (!im) continue; const w = 42 + hash(i + 20) * 34, h = w * im.height / im.width; const span = E.W + 120; const x = ((hash(i) * span + (red ? 0 : t * (3 + i)) - cx * 0.04) % span + span) % span - 60; c.globalAlpha = 0.9; c.drawImage(im, x, 10 + hash(i + 5) * (hz * 0.35), w, h); c.globalAlpha = 1; }
      if (S.clouds && !X.lite) { const cl = X.tint('cloudLayerB1', S.clouds, 'rgba(255,255,255,0)'); if (cl) drawLayerTiled(c, cl, hz - 92, 60, cx * 0.03 + (red ? 0 : t * 4)); }
      // camadas de silhueta
      (S.layers || []).forEach((L) => {
        const im = X.tint(L.im, L.c[0], L.c[1]); if (!im) return;
        const y = hz + L.y, h = 80;
        drawLayerTiled(c, im, y, h, cx * L.par);
        c.fillStyle = L.c[1]; c.fillRect(0, y + h - 1, E.W, E.H);
      });
      // horizonte de cidade
      if (S.skyline) skyline(c, S.skyline, hz, cx, t);
      // névoa
      if (S.fog) { const fl = X.tint('cloudLayer1', S.fog, 'rgba(0,0,0,0)', 0.55); if (fl) { drawLayerTiled(c, fl, hz - 50, 70, cx * 0.1 + (red ? 0 : t * 8)); drawLayerTiled(c, fl, hz - 20, 60, cx * 0.2 - (red ? 0 : t * 5)); } }
      // props (árvores, casas, cactos) em silhueta
      if (S.props) {
        const P = S.props, off = cx * P.par, first = Math.floor(off / P.gap) - 1;
        for (let k = first; k < first + Math.ceil(E.W / P.gap) + 3; k++) {
          if (hash(k * 3.1) < 0.28) continue;
          const name = P.list[Math.floor(hash(k) * P.list.length)], im = X.tint(name, P.c[0], P.c[1]); if (!im) continue;
          const h = P.h * (0.7 + Math.round(hash(k + 1) * 3) * 0.15), w = h * im.width / im.height, sim = scaled(im, w, h);
          const x = k * P.gap - off + hash(k + 2) * P.gap * 0.5, sway = red || name !== 'treePalm' ? 0 : Math.sin(t * 1.2 + k) * 0.02;
          if (sway) { c.save(); c.translate(x + w / 2, hz + P.y); c.rotate(sway); c.drawImage(sim, -w / 2, -h, w, h); c.restore(); } else c.drawImage(sim, x, hz + P.y - h, w, h);
        }
        c.fillStyle = P.c[1]; c.fillRect(0, hz + P.y - 1, E.W, E.H);
      }
    });
    if (!red && !X.lite) ambient(c, S.amb, t, hz, cx);
    return true;
  };
  function skyline(c, s, hz, cx, t) {
    const off = cx * s.par, W = 26;
    const first = Math.floor(off / W) - 1;
    for (let k = first; k < first + E.W / W + 3; k++) {
      const h = 30 + hash(k) * 55, w = W - 3 - hash(k + 4) * 6, x = k * W - off, y = hz + s.y + 60 - h;
      const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, s.c[0]); gr.addColorStop(1, s.c[1]);
      c.fillStyle = gr; c.fillRect(x, y, w, h + 40);
      if (hash(k + 9) > 0.6) { c.fillRect(x + w / 2 - 1, y - 8, 2, 8); if (!s.day) { c.fillStyle = Math.sin(t * 3 + k) > 0 ? '#ff5d5d' : '#7a2a2a'; c.fillRect(x + w / 2 - 1, y - 9, 2, 2); } }
      for (let wy = y + 5; wy < y + h - 3; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) { const on = hash(k * 31 + wx * 7 + wy) > (s.day ? 0.55 : 0.45); if (on) { c.fillStyle = s.day ? 'rgba(210,235,255,.55)' : 'rgba(255,220,130,.85)'; c.fillRect(Math.round(wx), Math.round(wy), 2, 2); } }
    }
    c.fillStyle = s.c[1]; c.fillRect(0, hz + s.y + 58, E.W, E.H);
  }
  function ambient(c, kind, t, hz, cx) {
    if (!kind) return;
    c.save();
    if (kind === 'confetti') {
      const cols = ['#ff5d8f', '#ffd23f', '#3ec1ff', '#7bff8f', '#b07bff', '#ffffff'];
      for (let i = 0; i < 26; i++) { const sp = 12 + hash(i) * 18; const x = ((hash(i + 1) * E.W + Math.sin(t + i) * 12 - cx * 0.2) % E.W + E.W) % E.W; const y = (hash(i + 2) * E.H + t * sp) % (E.H + 10) - 5; c.save(); c.translate(x, y); c.rotate(t * 3 + i); c.scale(1, Math.cos(t * 4 + i)); c.fillStyle = cols[i % cols.length]; c.fillRect(-1.5, -1, 3, 2); c.restore(); }
      for (let i = 0; i < 3; i++) { const x = ((hash(i + 40) * E.W - cx * 0.15 + t * 4) % (E.W + 40) + E.W + 40) % (E.W + 40) - 20; const y = 30 + hash(i + 41) * 40 + Math.sin(t * 1.3 + i) * 5; X.ilus(c, 'balao', x, y, 16, { rot: Math.sin(t + i) * 0.12 }); }
    } else if (kind === 'dust' || kind === 'sparkle' || kind === 'spore' || kind === 'wisp' || kind === 'snow') {
      const col = { dust: 'rgba(255,240,200,', sparkle: 'rgba(220,200,255,', spore: 'rgba(140,255,140,', wisp: 'rgba(190,160,255,', snow: 'rgba(255,255,255,' }[kind];
      const n = kind === 'snow' ? 40 : 22;
      if (kind !== 'snow') c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const sp = kind === 'snow' ? 10 + hash(i) * 14 : 4 + hash(i) * 6;
        const x = ((hash(i + 1) * E.W + Math.sin(t * 0.7 + i) * 10 - cx * 0.1 + (kind === 'snow' ? 0 : t * sp)) % E.W + E.W) % E.W;
        const y = kind === 'snow' ? (hash(i + 2) * E.H + t * sp) % E.H : ((hash(i + 2) * E.H - t * sp * 0.6) % E.H + E.H) % E.H;
        const a = kind === 'snow' ? 0.7 : 0.25 + 0.4 * Math.abs(Math.sin(t * 2 + i));
        c.fillStyle = col + a.toFixed(2) + ')'; c.fillRect(Math.round(x), Math.round(y), 1, 1);
        if (kind === 'spore' || kind === 'sparkle' || kind === 'wisp') X.glow(c, x, y, 4, kind === 'spore' ? '#7bff8f' : '#c8a8ff', a * 0.6);
      }
    } else if (kind === 'butterfly' || kind === 'leaf' || kind === 'bird') {
      for (let i = 0; i < (kind === 'bird' ? 5 : 4); i++) {
        const x = ((hash(i) * E.W + t * (10 + i * 4) - cx * 0.2) % (E.W + 40) + E.W + 40) % (E.W + 40) - 20;
        const y = (kind === 'leaf' ? (hash(i + 3) * hz + t * 12) % hz : 24 + hash(i + 3) * (hz - 50)) + Math.sin(t * 2 + i) * 6;
        if (kind === 'butterfly') X.ilus(c, 'borboleta', x, y, 9, { sy: 0.6 + 0.4 * Math.abs(Math.sin(t * 9 + i)) });
        else if (kind === 'leaf') X.ilus(c, 'folha', x, y, 8, { rot: t * 2 + i });
        else { c.strokeStyle = 'rgba(40,50,70,.7)'; c.lineWidth = 1; const f = Math.sin(t * 8 + i) * 2; c.beginPath(); c.moveTo(x - 4, y - f); c.lineTo(x, y); c.lineTo(x + 4, y - f); c.stroke(); }
      }
    }
    c.restore();
  }

  /* ================================================================ globo terrestre girando */
  const globeCache = {};
  /** Desenha um globo (foto de satélite) de raio r, girando. lon0 inicial ≈ Brasil. */
  X.globe = function (c, x, y, r, t) {
    const tex = X.img.terra; if (!tex) return false;
    const N = 48, R = 48;
    let f = E.reduced ? 0 : Math.floor(t * 6) % N;
    // gera no máximo um quadro novo a cada 120 ms; enquanto isso usa o mais próximo pronto
    if (!globeCache[f]) { const now = performance.now(); if (globeCache._t && now - globeCache._t < 120) { let g2 = f; while (g2 > 0 && !globeCache[g2]) g2--; if (globeCache[g2]) f = g2; } else globeCache._t = now; }
    const key = f; let fr = globeCache[key];
    if (!fr) {
      const lon0 = -52 + f * 360 / N; // grau central
      fr = mk(R * 2, R * 2, (x2) => {
        x2.imageSmoothingEnabled = true;
        const cell = 3.5, TW = tex.width, TH = tex.height;
        for (let py = -R; py < R; py += cell) for (let px = -R; px < R; px += cell) {
          const cxp = px + cell / 2, cyp = py + cell / 2, d = Math.hypot(cxp, cyp); if (d > R) continue;
          const lat = Math.asin(-cyp / R), cl = Math.cos(lat); if (cl < 1e-3) continue;
          const lon = lon0 + Math.asin(Math.max(-1, Math.min(1, cxp / (R * cl)))) * 180 / Math.PI;
          const u = ((((lon + 180) / 360) % 1) + 1) % 1 * TW, v = (0.5 - lat / Math.PI) * TH;
          x2.drawImage(tex, u, v, 2, 2, px + R, py + R, cell + 0.6, cell + 0.6);
        }
        x2.globalCompositeOperation = 'destination-in'; x2.beginPath(); x2.arc(R, R, R, 0, Math.PI * 2); x2.fill();
        x2.globalCompositeOperation = 'source-over';
        const sh = x2.createRadialGradient(R * 0.65, R * 0.6, R * 0.1, R, R, R); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(0.55, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,10,40,.6)');
        x2.fillStyle = sh; x2.beginPath(); x2.arc(R, R, R, 0, Math.PI * 2); x2.fill();
      });
      globeCache[key] = fr;
    }
    X.glow(c, x, y, r * 1.45, '#6fc8ff', 0.5);
    X.hd(c, () => c.drawImage(fr, x - r, y - r, r * 2, r * 2));
    c.save(); c.strokeStyle = 'rgba(160,220,255,.6)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r + 0.5, 0, Math.PI * 2); c.stroke(); c.restore();
    return true;
  };
  /** Foto de satélite "cover" com leve movimento (Ken Burns). */
  X.photo = function (c, name, t, dark) {
    const im = X.img[name]; if (!im) return false;
    const cw = E.canvas.width, ch = E.canvas.height, key = 'ph' + name + dark + cw + 'x' + ch;
    let pc = cache[key];
    if (!pc) {
      Object.keys(cache).forEach((k) => { if (k.indexOf('ph' + name) === 0) delete cache[k]; });
      pc = cache[key] = mk(cw, ch, (w) => {
        w.imageSmoothingEnabled = true; w.imageSmoothingQuality = 'high';
        const k = Math.max(cw / im.width, ch / im.height) * 1.1, pw = im.width * k, ph = im.height * k;
        w.drawImage(im, (cw - pw) / 2, (ch - ph) / 2, pw, ph);
        if (dark) { w.fillStyle = dark; w.fillRect(0, 0, cw, ch); }
      });
    }
    c.drawImage(pc, 0, 0, E.W, E.H);
    return true;
  };

  /* ================================================================ efeitos extras (partículas com textura) */
  /** kinds: 'sparkle' estrela que gira e some; 'ring' anel que expande; 'puff' poeira; 'glow' bolinha luminosa; 'flash' tela. */
  X.add = function (p) { if (X.fx.length > 220 || (E.reduced && p.kind !== 'flash' && X.fx.length > 30)) return; X.fx.push(Object.assign({ t: 0, life: 0.6, vx: 0, vy: 0, s: 8, rot: 0, vr: 0, c: '#fff', g: 0 }, p)); };
  X.sparkle = function (x, y, color, n) {
    const k = E.reduced ? 2 : (n || 6);
    for (let i = 0; i < k; i++) { const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 70; X.add({ kind: 'sparkle', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, s: 5 + Math.random() * 6, life: 0.5 + Math.random() * 0.4, c: color || '#ffe9a8', vr: (Math.random() - 0.5) * 8, g: 60 }); }
  };
  X.ring = function (x, y, color, size) { X.add({ kind: 'ring', x, y, s: size || 24, life: 0.45, c: color || '#ffffff' }); };
  X.puff = function (x, y, n, dir) {
    const k = E.reduced ? 1 : (n || 3);
    for (let i = 0; i < k; i++) X.add({ kind: 'puff', x: x + (Math.random() - 0.5) * 6, y, vx: (dir || (Math.random() - 0.5)) * (15 + Math.random() * 25), vy: -6 - Math.random() * 10, s: 7 + Math.random() * 5, life: 0.45, c: 'rgba(255,255,255,.8)' });
  };
  X.flash = function (color, a) { X.add({ kind: 'flash', x: 0, y: 0, life: 0.25, c: color || '#ffffff', a: a == null ? 0.5 : a, screen: true }); };
  X.pop = function (x, y, text, color, size) { X.add({ kind: 'pop', x, y, text, c: color || '#fff', s: size || 10, life: 1, vy: -24 }); };
  function fxUpdate(dt) {
    for (let i = X.fx.length - 1; i >= 0; i--) { const p = X.fx[i]; p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.t >= p.life) X.fx.splice(i, 1); }
  }
  function fxDraw(c, cam) {
    if (!X.fx.length) return;
    c.save(); c.translate(-Math.round(cam.x), -Math.round(cam.y));
    X.fx.forEach((p) => {
      const k = p.t / p.life, a = Math.max(0, 1 - k);
      if (p.kind === 'sparkle') { const tex = X.glowTex('star_07', p.c); if (!tex) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.rot); const s = p.s * (k < 0.2 ? k / 0.2 : 1); X.hd(c, () => c.drawImage(tex, -s, -s, s * 2, s * 2)); c.restore(); }
      else if (p.kind === 'ring') { c.save(); c.globalAlpha = a; c.strokeStyle = p.c; c.lineWidth = 2 * a + 0.5; c.beginPath(); c.arc(p.x, p.y, 3 + p.s * Math.sqrt(k), 0, Math.PI * 2); c.stroke(); c.restore(); }
      else if (p.kind === 'puff') { const im = X.img['puff' + Math.min(7, Math.floor(k * 8))]; if (!im) return; c.save(); c.globalAlpha = a * 0.8; const s = p.s * (0.6 + k * 0.8); X.hd(c, () => c.drawImage(im, p.x - s / 2, p.y - s / 2, s, s)); c.restore(); }
      else if (p.kind === 'pop') { const sc = k < 0.12 ? 0.4 + k / 0.12 * 1.0 : k < 0.22 ? 1.4 - (k - 0.12) / 0.1 * 0.4 : 1; c.save(); c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; c.translate(p.x, p.y); c.scale(sc, sc); c.font = '800 ' + p.s + "px 'Press Start 2P', monospace"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = 'rgba(20,16,40,.9)'; c.strokeText(p.text, 0, 0); c.fillStyle = p.c; c.fillText(p.text, 0, 0); c.restore(); }
    });
    c.restore();
    X.fx.forEach((p) => { if (p.kind === 'flash') { c.save(); c.globalAlpha = (1 - p.t / p.life) * p.a; c.fillStyle = p.c; c.fillRect(0, 0, E.W, E.H); c.restore(); } });
  }

  /* ================================================================ transição e cartão de fase */
  let trans = null, banner = null;
  X.iris = function (dir) { if (E.reduced) return; trans = { t0: performance.now(), dur: 650, dir: dir || 'in' }; };
  const STAGE_ICON = { c1s1: 'festa', c1s2: 'arvore', c1s3: 'veleiro', c1s4: 'carro_corrida', c1s5: 'robo', c2s1: 'teatro', c2s2: 'pergaminho', c2s3: 'tambor', c2s4: 'panela', c2s5: 'fantasma', c3s1: 'onibus', c3s2: 'cidade', c3s3: 'raio', c3s4: 'predio', c3s5: 'mapa', c3s6: 'microbio', b1: 'carro_corrida', b2: 'maracas', b3: 'raio' };
  X.stageIcon = (id) => STAGE_ICON[id] || 'globo';
  X.banner = function (def, sub) {
    banner = { t0: performance.now(), dur: 2600, icon: STAGE_ICON[def.id] || def.icon || 'globo', top: sub || (def.bonus ? 'SALA BÔNUS' : def.ch ? 'CAPÍTULO ' + def.ch + '  •  FASE ' + def.ch + '-' + def.n : 'PARQUE DO ATLAS'), title: def.title, style: def.style || '' };
  };
  function overlay(c) {
    const now = performance.now();
    if (banner) {
      const k = (now - banner.t0) / banner.dur;
      if (k >= 1) banner = null;
      else {
        const inK = Math.min(1, k / 0.14), outK = k > 0.82 ? (k - 0.82) / 0.18 : 0;
        const ease = (v) => 1 - Math.pow(1 - v, 3);
        const x = E.W / 2 - (1 - ease(inK)) * 340 + (outK ? ease(outK) * 340 : 0);
        const cx = E.reduced ? E.W / 2 : x, y = 26, w = 250, h = 58;
        c.save(); c.globalAlpha = E.reduced ? (outK ? 1 - outK : Math.min(1, inK * 2)) : 1;
        c.translate(cx, y);
        // faixa
        c.fillStyle = 'rgba(10,12,34,.86)'; c.beginPath(); c.moveTo(-w / 2 - 10, 0); c.lineTo(w / 2 + 14, 0); c.lineTo(w / 2, h); c.lineTo(-w / 2 - 24, h); c.closePath(); c.fill();
        const gg = c.createLinearGradient(-w / 2, 0, w / 2, 0); gg.addColorStop(0, '#ffd23f'); gg.addColorStop(1, '#ff7a59'); c.fillStyle = gg; c.fillRect(-w / 2 - 12, 0, w + 24, 3); c.fillRect(-w / 2 - 22, h - 3, w + 22, 3);
        // brilho passando
        if (!E.reduced) { const sx = -w / 2 + ((k * 2.2) % 1) * (w + 60) - 30; const sg = c.createLinearGradient(sx - 20, 0, sx + 20, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.18)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(-w / 2 - 20, 3, w + 40, h - 6); }
        X.ilus(c, banner.icon, -w / 2 + 16, h / 2, 40, { glow: '#ffd89a', rot: Math.sin(now / 300) * 0.08 });
        c.textAlign = 'left'; c.textBaseline = 'top';
        c.font = "6px 'Press Start 2P', monospace"; c.fillStyle = '#ffd23f'; c.fillText(banner.top, -w / 2 + 44, 10, w - 50);
        c.font = "10px 'Press Start 2P', monospace"; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillText(banner.title, -w / 2 + 45, 23, w - 52); c.fillStyle = '#ffffff'; c.fillText(banner.title, -w / 2 + 44, 22, w - 52);
        c.font = "600 8px Nunito, sans-serif"; c.fillStyle = '#b9c4ff'; c.fillText(banner.style, -w / 2 + 44, 40, w - 52);
        c.restore();
      }
    }
    if (trans) {
      const k = (now - trans.t0) / trans.dur;
      if (k >= 1) trans = null;
      else {
        const e = trans.dir === 'in' ? k : 1 - k, R = Math.hypot(E.W, E.H) * 0.6 * (e * e * (3 - 2 * e));
        c.save(); c.fillStyle = '#0b0a1e'; c.beginPath(); c.rect(-5, -5, E.W + 10, E.H + 10); c.arc(E.W / 2, E.H / 2, Math.max(0.1, R), 0, Math.PI * 2, true); c.fill('evenodd');
        c.strokeStyle = 'rgba(255,210,63,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(E.W / 2, E.H / 2, Math.max(0.1, R), 0, Math.PI * 2); c.stroke(); c.restore();
      }
    }
  }

  /* ================================================================ qualidade automática */
  /* Se o aparelho não aguentar (média < 34 quadros/s por ~4 s), liga o modo leve:
     sem raios de sol, vinheta, nuvens em faixa e partículas de ambiente. */
  let pf = { n: 0, t0: 0, slow: 0 };
  function perf() {
    if (X.lite) return;
    const now = performance.now();
    if (!pf.t0 || document.hidden || E.isPaused()) { pf.t0 = now; pf.n = 0; return; }
    pf.n++;
    if (now - pf.t0 >= 2000) { const fps = pf.n * 1000 / (now - pf.t0); pf.slow = fps < 34 ? pf.slow + 1 : 0; pf.t0 = now; pf.n = 0; if (pf.slow >= 2) { X.lite = true; console.info('Geografia: modo gráfico leve ativado (' + Math.round(fps) + ' quadros/s)'); } }
  }

  /* ================================================================ ganchos no motor (só nesta página) */
  let hooked = false;
  function installHooks() {
    if (hooked) return; hooked = true;
    const fx = E.fx;
    const oUpd = fx.update, oDraw = fx.draw, oClr = fx.clear;
    fx.update = function (dt) { oUpd(dt); fxUpdate(dt); };
    fx.clear = function () { oClr(); X.fx.length = 0; };
    // partículas antigas ganham brilho aditivo; textos flutuantes "saltam"
    fx.draw = function () {
      const c = E.ctx, cam = (E.scene && E.scene.cam) || { x: 0, y: 0 };
      if (X.ready && fx.parts.length && !E.reduced) {
        c.save(); c.translate(-Math.round(cam.x), -Math.round(cam.y)); c.globalCompositeOperation = 'lighter';
        const tex = X.glowTex('light_01', '#ffffff');
        fx.parts.forEach((p, i) => { if (i % 2 || !tex) return; c.globalAlpha = Math.max(0, 1 - p.t / p.life) * 0.35; X.hd(c, () => c.drawImage(tex, p.x - 5, p.y - 5, 10, 10)); });
        c.restore();
      }
      const floats = fx.floats.splice(0);
      oDraw();
      fx.floats.push(...floats);
      fxDraw(c, cam);
      if (floats.length) {
        c.save(); c.translate(-Math.round(cam.x), -Math.round(cam.y));
        floats.forEach((f) => { const k = f.t / f.life, sc = k < 0.1 ? 0.5 + k * 8 : k < 0.2 ? 1.3 - (k - 0.1) * 3 : 1; c.save(); c.globalAlpha = Math.max(0, 1 - Math.max(0, k - 0.6) / 0.4); c.translate(f.x, f.y); c.scale(sc, sc); c.font = "8px 'Press Start 2P', monospace"; c.textAlign = 'center'; c.textBaseline = 'top'; c.lineWidth = 3; c.strokeStyle = 'rgba(15,12,35,.85)'; c.strokeText(f.text, 0, 0); c.fillStyle = f.c; c.fillText(f.text, 0, 0); c.restore(); });
        c.restore();
      }
    };
    // toda cena ganha vinheta + cartões + transição
    const oStart = E.start;
    E.start = function (scene) {
      if (scene && !scene._gfx) {
        scene._gfx = true;
        const d = scene.draw, h = scene.hud;
        scene.draw = function (g) { if (d) d.call(scene, g); if (!scene.noVignette && !X.lite) X.vignette(E.ctx, scene.vignette); perf(); };
        scene.hud = function (g) { if (h) h.call(scene, g); overlay(E.ctx); };
      }
      X.fx.length = 0;
      return oStart.call(E, scene);
    };
  }
})();
