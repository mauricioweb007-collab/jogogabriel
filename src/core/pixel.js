/* =====================================================================
   src/core/pixel.js — sprites ORIGINAIS desenhados por código
   (pixel art gerada em canvas pequenos e ampliada sem suavização).
   Personagens: Gabriel (lateral e visão de cima), Gaia (bússola),
   GeoBot (rival amistoso), pessoas diversas (tons de pele, cabelos,
   roupas), adversários ABSTRATOS (névoas, blocos do erro, sombras,
   robôs do preconceito, vírus do mapa) e chefes. Nenhum sprite de
   franquia comercial é copiado.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const P = (GG.pixel = {});
  const cache = {};

  function mk(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; fn(x, w, h); return c;
  }
  P.mk = mk;
  /** Retângulos com contorno: parts = [[x,y,w,h,cor], ...]. Contorno 1px desenhado antes. */
  function parts(x, list, outline) {
    if (outline) { x.fillStyle = outline; list.forEach((p) => { if (!p[5]) x.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2); }); }
    list.forEach((p) => { x.fillStyle = p[4]; x.fillRect(p[0], p[1], p[2], p[3]); });
  }
  P.SKINS = ['#f6d3b3', '#e8b48a', '#c98e62', '#a86b45', '#7a4a2c', '#5a3520'];
  P.HAIRC = ['#2b1d14', '#5b3a1e', '#1b1b1b', '#a0522d', '#d8b25a', '#e8e8e8'];

  /* ------------------------------------------------------------ pessoa (vista lateral) */
  /**
   * Personagem lateral 18x24 olhando para a direita.
   * o: {skin, hair, hairStyle, shirt, pants, shoes, cap, capColor, backpack, cape, capeColor, frame(0 parado,1-2 corrida,3 pulo,4 disparo)}
   */
  P.side = function (o) {
    const key = 'side' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const K = '#15152a';
    const c = mk(18, 24, (x) => {
      const f = o.frame || 0, sk = o.skin || '#c98e62', sh = shade(sk, -30), hr = o.hair || '#2b1d14';
      const shirt = o.shirt || '#1fa39a', pants = o.pants || '#33415e', shoes = o.shoes || '#6b3f22';
      const L = [];
      // capa (atrás de tudo)
      if (o.cape) L.push([3, 10, 5, f === 1 || f === 2 ? 9 : 8, o.capeColor || '#e05a47']);
      // perna de trás / braço de trás
      const legs = {
        0: [[6, 17, 2, 5, pants], [9, 17, 2, 5, pants], [6, 21, 3, 2, shoes], [9, 21, 3, 2, shoes]],
        1: [[4, 17, 2, 4, pants], [3, 20, 3, 2, shoes], [10, 17, 2, 5, pants], [10, 21, 3, 2, shoes]],
        2: [[6, 17, 2, 5, pants], [6, 21, 3, 2, shoes], [9, 16, 3, 3, pants], [11, 18, 3, 2, shoes]],
        3: [[5, 16, 2, 4, pants], [4, 19, 3, 2, shoes], [10, 16, 3, 3, pants], [12, 17, 2, 3, shoes]],
        4: [[6, 17, 2, 5, pants], [9, 17, 2, 5, pants], [6, 21, 3, 2, shoes], [9, 21, 3, 2, shoes]]
      }[f] || [];
      legs.forEach((l) => L.push(l));
      if (f === 1) L.push([3, 11, 2, 4, sk]); else if (f === 2) L.push([11, 11, 2, 3, sk]);
      if (o.backpack) L.push([3, 10, 3, 6, o.backpack]);
      L.push([5, 10, 7, 7, shirt]); // tronco
      L.push([5, 15, 7, 2, pants]); // cintura
      // cabeça
      L.push([5, 2, 8, 8, sk]);
      parts(x, L, K);
      // detalhes sem contorno
      x.fillStyle = shade(shirt, -35); x.fillRect(5, 15, 7, 1);
      x.fillStyle = sh; x.fillRect(7, 6, 1, 2); // orelha
      // cabelo
      x.fillStyle = hr;
      const hs = o.hairStyle || 'curto';
      if (hs === 'curto') { x.fillRect(5, 1, 8, 3); x.fillRect(5, 2, 2, 5); }
      else if (hs === 'crespo') { x.fillRect(4, 0, 10, 4); x.fillRect(4, 1, 3, 6); x.fillRect(13, 1, 1, 2); }
      else if (hs === 'longo') { x.fillRect(5, 1, 8, 3); x.fillRect(4, 2, 3, 9); }
      else if (hs === 'trancas') { x.fillRect(5, 1, 8, 3); x.fillRect(4, 3, 2, 10); x.fillStyle = shade(hr, 25); x.fillRect(4, 6, 2, 1); x.fillRect(4, 9, 2, 1); }
      else if (hs === 'coque') { x.fillRect(5, 1, 8, 3); x.fillRect(3, 1, 3, 3); x.fillRect(5, 2, 2, 4); }
      else if (hs === 'liso') { x.fillRect(5, 1, 8, 2); x.fillRect(5, 1, 3, 7); x.fillRect(11, 1, 2, 2); }
      // olho e boca
      x.fillStyle = '#fff'; x.fillRect(10, 4, 2, 2); x.fillStyle = K; x.fillRect(11, 4, 1, 2);
      x.fillStyle = shade(sk, -55); x.fillRect(11, 8, 2, 1);
      // boné/chapéu
      if (o.cap) { x.fillStyle = K; x.fillRect(4, 0, 10, 1); x.fillRect(12, 2, 4, 1); x.fillStyle = o.capColor || '#f39c12'; x.fillRect(5, 0, 8, 2); x.fillRect(12, 1, 4, 1); x.fillStyle = shade(o.capColor || '#f39c12', -40); x.fillRect(5, 2, 8, 1); }
      // braço da frente
      x.fillStyle = K;
      if (f === 4) { x.fillRect(9, 10, 8, 4); x.fillStyle = shirt; x.fillRect(10, 11, 3, 2); x.fillStyle = sk; x.fillRect(13, 11, 3, 2); }
      else if (f === 1) { x.fillRect(10, 10, 4, 6); x.fillStyle = shirt; x.fillRect(11, 11, 2, 2); x.fillStyle = sk; x.fillRect(11, 13, 2, 2); }
      else if (f === 2 || f === 3) { x.fillRect(4, 10, 4, 6); x.fillStyle = shirt; x.fillRect(5, 11, 2, 2); x.fillStyle = sk; x.fillRect(5, 13, 2, 2); }
      else { x.fillRect(8, 10, 4, 7); x.fillStyle = shirt; x.fillRect(9, 11, 2, 2); x.fillStyle = sk; x.fillRect(9, 13, 2, 3); }
    });
    cache[key] = c; return c;
  };

  /* ------------------------------------------------------------ pessoa (de frente / visão de cima) */
  /** Pessoa 14x20 de frente (dir 'down'), costas ('up') ou perfil ('side'); frame 0/1 anda. */
  P.front = function (o) {
    const key = 'front' + JSON.stringify(o);
    if (cache[key]) return cache[key];
    const K = '#15152a';
    const c = mk(14, 20, (x) => {
      const sk = o.skin || '#c98e62', hr = o.hair || '#2b1d14', shirt = o.shirt || '#1fa39a', pants = o.pants || '#33415e';
      const f = o.frame || 0, dir = o.dir || 'down';
      const L = [];
      L.push([4, 14, 2, f === 1 ? 4 : 5, pants], [8, 14, 2, f === 1 ? 5 : 4, pants]);
      L.push([3, 8, 8, 7, shirt]);
      L.push([1, 9, 2, 5, sk], [11, 9, 2, 5, sk]);
      L.push([3, 1, 8, 8, sk]);
      parts(x, L, K);
      if (o.dress) { x.fillStyle = o.dress; x.fillRect(3, 12, 8, 4); }
      x.fillStyle = shade(shirt, -35); x.fillRect(3, 13, 8, 1);
      x.fillStyle = hr;
      const hs = o.hairStyle || 'curto';
      const back = dir === 'up';
      if (hs === 'curto') { x.fillRect(3, 0, 8, 3); if (back) x.fillRect(3, 0, 8, 7); }
      else if (hs === 'crespo') { x.fillRect(2, -1 + 1, 10, 4); x.fillRect(1, 1, 2, 5); x.fillRect(11, 1, 2, 5); if (back) x.fillRect(2, 0, 10, 8); }
      else if (hs === 'longo') { x.fillRect(3, 0, 8, 3); x.fillRect(2, 1, 2, 10); x.fillRect(10, 1, 2, 10); if (back) x.fillRect(2, 0, 10, 11); }
      else if (hs === 'trancas') { x.fillRect(3, 0, 8, 3); x.fillRect(2, 2, 2, 11); x.fillRect(10, 2, 2, 11); if (back) x.fillRect(3, 0, 8, 8); }
      else if (hs === 'coque') { x.fillRect(3, 0, 8, 3); x.fillRect(5, -1 + 1, 4, 1); x.fillRect(6, 0, 2, 1); if (back) { x.fillRect(3, 0, 8, 7); x.fillRect(5, 0, 4, 3); } }
      else if (hs === 'liso') { x.fillRect(3, 0, 8, 2); x.fillRect(3, 0, 2, 7); x.fillRect(9, 0, 2, 7); if (back) x.fillRect(3, 0, 8, 8); }
      if (!back) {
        x.fillStyle = K;
        if (dir === 'side') { x.fillRect(8, 4, 1, 2); } else { x.fillRect(5, 4, 1, 2); x.fillRect(8, 4, 1, 2); }
        x.fillStyle = shade(sk, -55); x.fillRect(6, 7, 2, 1);
      }
      if (o.cap) { x.fillStyle = o.capColor || '#f39c12'; x.fillRect(3, 0, 8, 2); if (!back) x.fillRect(4, 2, 6, 1); }
      if (o.adorn) { x.fillStyle = o.adorn; x.fillRect(4, 9, 6, 1); x.fillRect(5, 10, 1, 1); x.fillRect(8, 10, 1, 1); }
      if (o.hat) { x.fillStyle = o.hat; x.fillRect(1, 0, 12, 1); x.fillRect(3, -1 + 1, 8, 1); }
    });
    cache[key] = c; return c;
  };

  /* ------------------------------------------------------------ Gaia, a bússola digital */
  /** Gaia 16x16 (frame 0/1 pisca). */
  P.gaia = function (frame) {
    const key = 'gaia' + (frame || 0);
    if (cache[key]) return cache[key];
    const c = mk(16, 16, (x) => {
      x.fillStyle = '#15152a'; circ(x, 8, 8, 7.5);
      x.fillStyle = '#f7c948'; circ(x, 8, 8, 6.6);
      x.fillStyle = '#fff8e6'; circ(x, 8, 8, 5.2);
      x.fillStyle = '#e5484d'; x.fillRect(7, 3, 2, 3); x.fillStyle = '#3f6ad8'; x.fillRect(7, 11, 2, 2);
      x.fillStyle = '#15152a';
      if (frame === 1) { x.fillRect(5, 8, 2, 1); x.fillRect(9, 8, 2, 1); } else { x.fillRect(5, 7, 2, 2); x.fillRect(9, 7, 2, 2); }
      x.fillStyle = '#ff8fa3'; x.fillRect(4, 9, 1, 1); x.fillRect(11, 9, 1, 1);
      x.fillStyle = '#15152a'; x.fillRect(7, 10, 2, 1);
      x.fillStyle = '#9ff2ff'; x.fillRect(0, 7, 2, 2); x.fillRect(14, 7, 2, 2);
    });
    cache[key] = c; return c;
  };
  /** Retrato grande da Gaia 48x48 para diálogos. */
  P.gaiaPortrait = function () {
    if (cache.gaiaP) return cache.gaiaP;
    const c = mk(48, 48, (x) => {
      x.fillStyle = 'rgba(120,230,255,.25)'; circ(x, 24, 24, 23);
      x.fillStyle = '#15152a'; circ(x, 24, 24, 19);
      x.fillStyle = '#f7c948'; circ(x, 24, 24, 17.5);
      x.fillStyle = '#c99a1e'; circ(x, 24, 26, 15.5);
      x.fillStyle = '#fff8e6'; circ(x, 24, 24, 14);
      x.fillStyle = '#e8dcc0'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.fillRect(Math.round(24 + Math.cos(a) * 12) - 1, Math.round(24 + Math.sin(a) * 12) - 1, 2, 2); }
      x.fillStyle = '#e5484d'; x.beginPath(); x.moveTo(24, 9); x.lineTo(27, 18); x.lineTo(21, 18); x.fill();
      x.fillStyle = '#3f6ad8'; x.beginPath(); x.moveTo(24, 39); x.lineTo(27, 31); x.lineTo(21, 31); x.fill();
      x.fillStyle = '#15152a'; x.fillRect(16, 21, 4, 5); x.fillRect(28, 21, 4, 5);
      x.fillStyle = '#fff'; x.fillRect(17, 22, 1, 2); x.fillRect(29, 22, 1, 2);
      x.fillStyle = '#ff8fa3'; x.fillRect(13, 27, 4, 2); x.fillRect(31, 27, 4, 2);
      x.fillStyle = '#15152a'; x.fillRect(21, 28, 6, 1); x.fillRect(22, 29, 4, 1);
      x.fillStyle = '#9ff2ff'; x.fillRect(2, 20, 5, 8); x.fillRect(41, 20, 5, 8); x.fillStyle = '#5fd0ee'; x.fillRect(3, 22, 3, 4); x.fillRect(42, 22, 3, 4);
    });
    cache.gaiaP = c; return c;
  };

  /* ------------------------------------------------------------ GeoBot, rival amistoso */
  /** GeoBot lateral 18x24 (frame 0-3 como pessoa lateral). */
  P.geobot = function (frame) {
    const key = 'geobot' + (frame || 0);
    if (cache[key]) return cache[key];
    const K = '#15152a';
    const c = mk(18, 24, (x) => {
      const f = frame || 0, metal = '#9aa7c7', dark = '#5b6789', acc = '#ff9f1c';
      const L = [];
      const legA = f === 1 ? [4, 17, 3, 5] : f === 2 ? [10, 17, 3, 5] : [6, 17, 3, 5];
      const legB = f === 1 ? [10, 17, 3, 5] : f === 2 ? [5, 17, 3, 5] : [10, 17, 3, 5];
      L.push(legA.concat(dark), legB.concat(dark));
      L.push([4, 9, 10, 8, metal]);
      L.push([4, 1, 11, 8, metal]);
      parts(x, L, K);
      x.fillStyle = '#1c2b4a'; x.fillRect(7, 3, 7, 4);
      x.fillStyle = '#5ef2ff'; x.fillRect(9, 4, 2, 2); x.fillRect(12, 4, 2, 2);
      x.fillStyle = acc; x.fillRect(4, 12, 10, 2);
      x.fillStyle = K; x.fillRect(8, 0, 1, 1); x.fillStyle = '#7bd88f'; x.fillRect(7, -1 + 1, 3, 1);
      x.fillStyle = '#3f6ad8'; circ(x, 8, 0.5, 1.6);
      x.fillStyle = dark; x.fillRect(legA[0], 21, 4, 2); x.fillRect(legB[0], 21, 4, 2);
      x.fillStyle = K; x.fillRect(12, 10, 3, 5); x.fillStyle = metal; x.fillRect(13, 11, 1, 3);
    });
    cache[key] = c; return c;
  };
  P.geobotPortrait = function () {
    if (cache.gbP) return cache.gbP;
    const c = mk(48, 48, (x) => {
      x.fillStyle = '#15152a'; round(x, 6, 8, 36, 34, 7);
      x.fillStyle = '#9aa7c7'; round(x, 8, 10, 32, 30, 6);
      x.fillStyle = '#1c2b4a'; round(x, 12, 16, 24, 12, 4);
      x.fillStyle = '#5ef2ff'; x.fillRect(16, 19, 5, 5); x.fillRect(27, 19, 5, 5);
      x.fillStyle = '#fff'; x.fillRect(17, 20, 2, 2); x.fillRect(28, 20, 2, 2);
      x.fillStyle = '#ff9f1c'; x.fillRect(18, 32, 12, 3);
      x.fillStyle = '#15152a'; x.fillRect(23, 2, 2, 7);
      x.fillStyle = '#3f6ad8'; circ(x, 24, 3, 3.2); x.fillStyle = '#7bd88f'; x.fillRect(22, 2, 3, 2);
      x.fillStyle = '#5b6789'; x.fillRect(3, 20, 4, 10); x.fillRect(41, 20, 4, 10);
    });
    cache.gbP = c; return c;
  };

  /* ------------------------------------------------------------ adversários abstratos */
  /** Névoa da Confusão 22x16 (frame 0/1). */
  P.nevoa = function (frame) {
    const key = 'nevoa' + (frame || 0); if (cache[key]) return cache[key];
    const c = mk(22, 16, (x) => {
      x.fillStyle = 'rgba(80,70,120,.9)'; [[7, 9, 6], [12, 7, 7], [16, 10, 5], [5, 11, 4]].forEach((p) => circ(x, p[0], p[1] + (frame ? 0.5 : 0), p[2]));
      x.fillStyle = 'rgba(190,180,230,.95)'; [[7, 8, 5], [12, 6, 6], [16, 9, 4]].forEach((p) => circ(x, p[0], p[1], p[2]));
      x.fillStyle = '#3d3566'; spiral(x, 9, 8); spiral(x, 14, 8);
    });
    cache[key] = c; return c;
  };
  /** Bloco do Erro 16x16 com X e cara zangada. */
  P.bloco = function (frame) {
    const key = 'bloco' + (frame || 0); if (cache[key]) return cache[key];
    const c = mk(16, 16, (x) => {
      x.fillStyle = '#15152a'; x.fillRect(0, 0, 16, 16);
      x.fillStyle = '#c0392b'; x.fillRect(1, 1, 14, 14);
      x.fillStyle = '#e74c3c'; x.fillRect(1, 1, 14, 3);
      x.fillStyle = '#7b1f16'; x.fillRect(1, 12, 14, 3);
      x.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { x.fillRect(5 + i, 5 + i, 1, 1); x.fillRect(10 - i, 5 + i, 1, 1); }
      x.fillStyle = '#15152a'; x.fillRect(3, frame ? 4 : 3, 3, 1); x.fillRect(10, frame ? 4 : 3, 3, 1);
    });
    cache[key] = c; return c;
  };
  /** Sombra da Generalização 16x16 (frame 0/1; assustada = revelada pela Empatia). */
  P.sombra = function (frame, calm) {
    const key = 'sombra' + (frame || 0) + (calm ? 'c' : ''); if (cache[key]) return cache[key];
    const c = mk(16, 16, (x) => {
      x.fillStyle = calm ? 'rgba(140,220,255,.85)' : 'rgba(30,20,50,.92)';
      circ(x, 8, 7, 6.5); x.fillRect(2, 7, 12, 6);
      for (let i = 0; i < 4; i++) x.fillRect(2 + i * 3 + (frame ? 1 : 0), 13, 2, 2);
      x.fillStyle = calm ? '#15152a' : '#ffffff'; x.fillRect(5, 6, 2, 3); x.fillRect(9, 6, 2, 3);
      if (!calm) { x.fillStyle = '#b07bff'; x.fillRect(3, 10, 10, 1); }
    });
    cache[key] = c; return c;
  };
  /** Robô do Preconceito 16x18 (carimba rótulos). */
  P.robo = function (frame) {
    const key = 'robo' + (frame || 0); if (cache[key]) return cache[key];
    const K = '#15152a';
    const c = mk(16, 18, (x) => {
      parts(x, [[2, 2, 12, 9, '#7d8597'], [3, 11, 10, 5, '#5c6373'], [3 + (frame ? 1 : 0), 16, 3, 2, '#3a3f4b'], [10 - (frame ? 1 : 0), 16, 3, 2, '#3a3f4b']], K);
      x.fillStyle = '#ff4d4d'; x.fillRect(4, 5, 3, 2); x.fillRect(9, 5, 3, 2);
      x.fillStyle = K; x.fillRect(5, 9, 6, 1); x.fillRect(4, 8, 1, 1); x.fillRect(11, 8, 1, 1);
      x.fillStyle = '#f7c948'; x.fillRect(4, 12, 8, 3); x.fillStyle = K; x.fillRect(5, 13, 6, 1);
    });
    cache[key] = c; return c;
  };
  /** Vírus do Mapa 14x14. */
  P.virus = function (frame) {
    const key = 'virus' + (frame || 0); if (cache[key]) return cache[key];
    const c = mk(14, 14, (x) => {
      x.fillStyle = '#2f8f3a';
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (frame ? 0.39 : 0); x.fillRect(Math.round(7 + Math.cos(a) * 6) - 1, Math.round(7 + Math.sin(a) * 6) - 1, 2, 2); }
      x.fillStyle = '#15152a'; circ(x, 7, 7, 4.8); x.fillStyle = '#6ad16f'; circ(x, 7, 7, 4);
      x.fillStyle = '#15152a'; x.fillRect(5, 5, 1, 2); x.fillRect(8, 5, 1, 2); x.fillRect(5, 9, 4, 1);
    });
    cache[key] = c; return c;
  };
  /** Fragmento do Atlas 12x12 (pedaço de mapa brilhante). */
  P.fragmento = function (frame) {
    const key = 'frag' + (frame || 0); if (cache[key]) return cache[key];
    const c = mk(12, 12, (x) => {
      x.fillStyle = '#15152a'; x.beginPath(); x.moveTo(1, 2); x.lineTo(8, 0); x.lineTo(11, 4); x.lineTo(10, 11); x.lineTo(2, 10); x.closePath(); x.fill();
      x.fillStyle = frame ? '#ffe9a8' : '#f3d78a'; x.beginPath(); x.moveTo(2, 3); x.lineTo(8, 1); x.lineTo(10, 4); x.lineTo(9, 10); x.lineTo(3, 9); x.closePath(); x.fill();
      x.fillStyle = '#4caf50'; x.fillRect(4, 4, 3, 3); x.fillStyle = '#3f6ad8'; x.fillRect(7, 6, 2, 2);
      x.fillStyle = '#e5484d'; x.fillRect(5, 7, 1, 1);
    });
    cache[key] = c; return c;
  };
  /** Totem da Gaia (estação de conteúdo/checkpoint) 16x32. */
  P.totem = function (active) {
    const key = 'totem' + (active ? 1 : 0); if (cache[key]) return cache[key];
    const c = mk(16, 32, (x) => {
      x.fillStyle = '#15152a'; x.fillRect(4, 10, 8, 22); x.fillRect(2, 28, 12, 4);
      x.fillStyle = '#6d4c8f'; x.fillRect(5, 11, 6, 17); x.fillStyle = '#8e6bb8'; x.fillRect(5, 11, 2, 17);
      x.fillStyle = '#a07850'; x.fillRect(3, 29, 10, 2);
      x.drawImage(P.gaia(0), 0, 0);
      if (active) { x.fillStyle = '#7bff8f'; x.fillRect(6, 16, 4, 4); } else { x.fillStyle = '#ffd23f'; x.fillRect(7, 15, 2, 6); x.fillRect(7, 22, 2, 2); }
    });
    cache[key] = c; return c;
  };
  /** Mola original 16x12 (comprimida ou não). */
  P.mola = function (down) {
    const key = 'mola' + (down ? 1 : 0); if (cache[key]) return cache[key];
    const c = mk(16, 12, (x) => {
      const top = down ? 6 : 1;
      x.fillStyle = '#15152a'; x.fillRect(1, top - 1, 14, 4); x.fillRect(2, 10, 12, 2);
      x.fillStyle = '#3ec1ff'; x.fillRect(2, top, 12, 2);
      x.fillStyle = '#c0c6d6'; for (let y = top + 3; y < 10; y += 2) x.fillRect(4, y, 8, 1);
      x.fillStyle = '#7d8597'; x.fillRect(3, 10, 10, 1);
    });
    cache[key] = c; return c;
  };
  /** Nave-cartográfica 26x16 (voltada para a direita). skin: cor. */
  P.nave = function (skin, frame) {
    const key = 'nave' + skin + (frame || 0); if (cache[key]) return cache[key];
    const c = mk(26, 16, (x) => {
      const col = skin || '#3ec1ff';
      x.fillStyle = frame ? '#ffd23f' : '#ff9f1c'; x.fillRect(0, 6, 4, 4);
      x.fillStyle = '#15152a'; x.beginPath(); x.moveTo(3, 3); x.lineTo(19, 4); x.lineTo(25, 8); x.lineTo(19, 12); x.lineTo(3, 13); x.closePath(); x.fill();
      x.fillStyle = col; x.beginPath(); x.moveTo(4, 4); x.lineTo(18, 5); x.lineTo(23, 8); x.lineTo(18, 11); x.lineTo(4, 12); x.closePath(); x.fill();
      x.fillStyle = shade(col, -40); x.fillRect(4, 9, 14, 2);
      x.fillStyle = '#fff8e6'; x.fillRect(11, 6, 5, 3); x.fillStyle = '#3f6ad8'; x.fillRect(12, 7, 3, 1);
      x.fillStyle = '#f3d78a'; x.fillRect(6, 1, 7, 3); x.fillRect(6, 12, 7, 3);
      x.fillStyle = '#4caf50'; x.fillRect(8, 2, 2, 1); x.fillRect(9, 13, 2, 1);
    });
    cache[key] = c; return c;
  };

  /* ------------------------------------------------------------ chefes (48x48) */
  P.chefe = function (kind, frame, hurt) {
    const key = 'boss' + kind + (frame || 0) + (hurt ? 'h' : ''); if (cache[key]) return cache[key];
    const K = '#15152a';
    const c = mk(48, 48, (x) => {
      const f = frame || 0;
      if (kind === 'generalizador') {
        x.fillStyle = K; round(x, 4, 6, 40, 36, 5);
        x.fillStyle = hurt ? '#ffffff' : '#8a8fa3'; round(x, 6, 8, 36, 32, 4);
        x.fillStyle = '#5c6070'; x.fillRect(6, 30, 36, 10);
        x.fillStyle = '#ff5d5d'; x.fillRect(12, 16, 8, 5); x.fillRect(28, 16, 8, 5);
        x.fillStyle = K; x.fillRect(14, 25, 20, 2);
        x.fillStyle = '#f7c948'; x.fillRect(10, 33, 28, 5); x.fillStyle = K; x.font = '5px monospace'; x.fillText('IGUAIS', 15, 37);
        x.fillStyle = K; x.fillRect(18, f ? 41 : 42, 12, 6); x.fillStyle = '#b0b4c4'; x.fillRect(19, f ? 42 : 43, 10, 4);
      } else if (kind === 'sombra') {
        x.fillStyle = hurt ? 'rgba(220,220,255,.95)' : 'rgba(25,15,45,.95)'; circ(x, 24, 20, 17); x.fillRect(7, 20, 34, 18);
        for (let i = 0; i < 6; i++) x.fillRect(7 + i * 6 + (f ? 2 : 0), 38, 4, 5);
        x.fillStyle = '#b07bff'; x.fillRect(12, 17, 8, 3); x.fillRect(28, 17, 8, 3);
        x.fillStyle = '#fff'; x.fillRect(14, 15, 3, 3); x.fillRect(30, 15, 3, 3);
        x.fillStyle = '#b07bff'; x.fillRect(16, 28, 16, 2); x.fillRect(14, 27, 2, 1); x.fillRect(32, 27, 2, 1);
      } else {
        x.fillStyle = '#2f8f3a';
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + (f ? 0.26 : 0); x.fillRect(Math.round(24 + Math.cos(a) * 20) - 2, Math.round(24 + Math.sin(a) * 20) - 2, 5, 5); }
        x.fillStyle = K; circ(x, 24, 24, 17); x.fillStyle = hurt ? '#ffffff' : '#56c25d'; circ(x, 24, 24, 15.5);
        x.fillStyle = '#3d8f45'; circ(x, 18, 30, 4); circ(x, 32, 16, 3);
        x.fillStyle = K; x.fillRect(15, 18, 6, 4); x.fillRect(27, 18, 6, 4);
        x.fillStyle = '#ffd23f'; x.fillRect(16, 19, 2, 2); x.fillRect(28, 19, 2, 2);
        x.fillStyle = K; x.fillRect(17, 30, 14, 2); x.fillStyle = '#f7c948'; x.font = '6px monospace'; x.fillStyle = K; x.fillText('$', 22, 12);
      }
    });
    cache[key] = c; return c;
  };

  /* ------------------------------------------------------------ pessoas diversas */
  /** Lista fixa de pessoas variadas para multidões e festivais (sem estereótipos). */
  P.crowd = function () {
    if (cache.crowd) return cache.crowd;
    const H = ['curto', 'crespo', 'longo', 'trancas', 'coque', 'liso'];
    const shirts = ['#e05a47', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#e84393', '#1abc9c', '#f1c40f'];
    const list = [];
    for (let i = 0; i < 18; i++) list.push({ skin: P.SKINS[i % 6], hair: P.HAIRC[(i * 5) % 6], hairStyle: H[(i * 7) % 6], shirt: shirts[(i * 3) % 8], pants: ['#33415e', '#5b3a1e', '#2d3436', '#6c5ce7'][i % 4], cap: i % 5 === 2, capColor: shirts[(i + 2) % 8], adorn: i % 6 === 4 ? '#f7c948' : null });
    cache.crowd = list; return list;
  };

  /* ------------------------------------------------------------ auxiliares */
  function circ(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
  function round(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); x.fill(); }
  function spiral(x, cx, cy) { x.fillRect(cx - 1, cy - 1, 3, 1); x.fillRect(cx + 1, cy - 1, 1, 3); x.fillRect(cx - 1, cy + 1, 3, 1); x.fillRect(cx - 1, cy, 1, 1); }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  P.shade = shade;
  P.circ = circ; P.round = round;
  /** Canvas → dataURL para usar em <img> (retratos de diálogos). */
  P.url = function (canvas, scale) {
    const k = scale || 4;
    const c = mk(canvas.width * k, canvas.height * k, (x) => { x.imageSmoothingEnabled = false; x.drawImage(canvas, 0, 0, canvas.width * k, canvas.height * k); });
    return c.toDataURL();
  };
})();
