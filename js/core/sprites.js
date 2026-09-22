/* =====================================================================
   core/sprites.js — toda a arte do jogo é desenhada por código:
   tiles do mapa, personagens (jogador e NPCs), Lumi, mascotes, animais
   e objetos. Nenhuma imagem externa ou recurso de jogo comercial.
   ===================================================================== */
EN.sprites = (function () {
  'use strict';
  const U = EN.util;
  const S = {};
  const TS = S.TS = 48; // tamanho do tile em pixels

  /* ------------------------------------------------------------------
     TILES
     Caminháveis:  . grama  , trilha  : areia  _ piso madeira  - piso lab
                   * flores  " capim alto  ; chão seco  = ponte  m alagado
                   r tapete  x chão queimado  z galho (copa)  u chão caverna
                   e areia submersa  j piso de pedra  i gelo de névoa (arena)
     Sólidos:      t árvore  y árvore alta  q árvore retorcida  k cacto
                   b arbusto  o pedra  ~ rio  w lago  # muro  h parede casa
                   f cerca  s balcão  p cano  l máquina  g vidro  c rocha
                   a alga/coral  v copa (folhagem)  (espaço) vazio
     ------------------------------------------------------------------ */
  S.SOLID = new Set(['t', 'y', 'q', 'k', 'b', 'o', '~', 'w', '#', 'h', 'f', 's', 'p', 'l', 'g', 'c', 'a', 'v', ' ']);

  S.defaultTheme = {
    grass: '#6cc36a', grass2: '#5bb05a', path: '#d9b77e', path2: '#c9a36a', sand: '#ecd9a0',
    floor: '#c8955c', floor2: '#b5824b', lab: '#dfe7ef', lab2: '#c9d5e2', water: '#3f9be0', water2: '#6fb8ef',
    lake: '#3f9be0', tree: '#2f8f46', tree2: '#23733a', trunk: '#7a5230', wall: '#8d95a3', wall2: '#6f7785',
    house: '#b77a45', house2: '#94602f', dry: '#d8c59a', dry2: '#c2ab7c', carpet: '#8a5cc7', burnt: '#5d5750',
    cave: '#3a3346', cave2: '#2b2535', stone: '#b9b3a8', stone2: '#a39c90', flower: ['#ff7aa8', '#ffd84a', '#ffffff', '#b18cff']
  };

  function hash(x, y, k) { return U.hash2(x * 7 + (k || 0) * 131, y * 13 + (k || 0) * 17); }

  function fillTile(ctx, px, py, c) { ctx.fillStyle = c; ctx.fillRect(px, py, TS, TS); }

  function speckles(ctx, px, py, x, y, color, n, size) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const a = hash(x, y, i + 1), b = hash(y, x, i + 7);
      ctx.fillRect(px + a * (TS - size), py + b * (TS - size), size, size);
    }
  }

  function groundOf(ch, fallback) {
    if ('tbofkyq'.includes(ch)) return fallback || '.';
    if (ch === 'k') return ';';
    return null;
  }

  /** Desenha o chão (parte caminhável) de um tile. */
  function drawGround(ctx, ch, px, py, th, x, y) {
    switch (ch) {
      case '.': fillTile(ctx, px, py, th.grass); speckles(ctx, px, py, x, y, th.grass2, 5, 4); break;
      case ',': fillTile(ctx, px, py, th.path); speckles(ctx, px, py, x, y, th.path2, 4, 5); break;
      case ':': fillTile(ctx, px, py, th.sand); speckles(ctx, px, py, x, y, '#d8c283', 4, 3); break;
      case '_':
        fillTile(ctx, px, py, th.floor);
        ctx.fillStyle = th.floor2;
        for (let i = 0; i < 4; i++) ctx.fillRect(px, py + i * 12 + 11, TS, 1);
        ctx.fillRect(px + ((x + y) % 2 ? 16 : 32), py, 1, TS);
        break;
      case '-':
        fillTile(ctx, px, py, (x + y) % 2 ? th.lab : th.lab2);
        ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        break;
      case 'j':
        fillTile(ctx, px, py, th.stone);
        ctx.strokeStyle = th.stone2; ctx.lineWidth = 2; ctx.strokeRect(px + 2, py + 2, TS - 4, TS - 4); ctx.lineWidth = 1;
        break;
      case '*': {
        fillTile(ctx, px, py, th.grass); speckles(ctx, px, py, x, y, th.grass2, 3, 4);
        for (let i = 0; i < 4; i++) {
          const fx = px + 6 + hash(x, y, i) * 34, fy = py + 6 + hash(y, x, i + 3) * 34;
          ctx.fillStyle = th.flower[Math.floor(hash(x, y, i + 9) * th.flower.length)];
          ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, 7); ctx.fill();
          ctx.fillStyle = '#ffe98a'; ctx.beginPath(); ctx.arc(fx, fy, 1.4, 0, 7); ctx.fill();
        }
        break;
      }
      case '"':
        fillTile(ctx, px, py, th.grass);
        ctx.strokeStyle = th.grass2; ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
          const gx = px + 4 + hash(x, y, i) * 40, gy = py + 12 + hash(y, x, i) * 32;
          ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 3, gy - 10); ctx.moveTo(gx, gy); ctx.lineTo(gx + 3, gy - 9); ctx.stroke();
        }
        ctx.lineWidth = 1;
        break;
      case ';':
        fillTile(ctx, px, py, th.dry);
        ctx.strokeStyle = th.dry2; ctx.beginPath();
        ctx.moveTo(px + hash(x, y, 1) * 48, py); ctx.lineTo(px + 20, py + 24); ctx.lineTo(px + hash(x, y, 2) * 48, py + 48);
        ctx.stroke();
        break;
      case 'm':
        fillTile(ctx, px, py, th.grass);
        ctx.fillStyle = 'rgba(80,160,220,.55)';
        ctx.beginPath(); ctx.ellipse(px + 14 + hash(x, y, 3) * 20, py + 16 + hash(y, x, 4) * 16, 13, 7, 0, 0, 7); ctx.fill();
        break;
      case 'r': fillTile(ctx, px, py, th.carpet); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(px + 4, py + 4, TS - 8, TS - 8); break;
      case 'x': fillTile(ctx, px, py, th.burnt); speckles(ctx, px, py, x, y, '#3d3934', 6, 4); break;
      case 'z':
        fillTile(ctx, px, py, '#1f5d33');
        ctx.fillStyle = '#8a5a32'; ctx.fillRect(px, py + 12, TS, 24);
        ctx.fillStyle = '#6e4526'; ctx.fillRect(px, py + 30, TS, 6);
        break;
      case 'u': fillTile(ctx, px, py, th.cave2); speckles(ctx, px, py, x, y, '#3b3447', 4, 5); break;
      case 'e': fillTile(ctx, px, py, '#2f7fae'); speckles(ctx, px, py, x, y, '#e6d59a', 5, 4); break;
      case 'i': fillTile(ctx, px, py, (x + y) % 2 ? '#cfc2f2' : '#bfb0ea'); break;
      case '=': {
        fillTile(ctx, px, py, th.water);
        ctx.fillStyle = '#a0703f'; ctx.fillRect(px, py + 3, TS, TS - 6);
        ctx.fillStyle = '#7e5329';
        for (let i = 0; i < 4; i++) ctx.fillRect(px + i * 12 + 11, py + 3, 1.5, TS - 6);
        ctx.fillRect(px, py + 3, TS, 3); ctx.fillRect(px, py + TS - 6, TS, 3);
        break;
      }
      default: fillTile(ctx, px, py, th.grass);
    }
  }

  function drawTree(ctx, px, py, c1, c2, trunk, big) {
    const cx = px + TS / 2, cy = py + TS / 2;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx + 3, cy + 14, 18, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = trunk; ctx.fillRect(cx - 4, cy + 2, 8, 14);
    const r = big ? 24 : 20;
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(cx, cy - 2, r, 0, 7); ctx.fill();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(cx - 3, cy - 6, r - 5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(cx - 8, cy - 12, r / 3, 0, 7); ctx.fill();
  }

  /** Desenha um tile completo (chão + objeto). */
  S.drawTile = function (ctx, ch, px, py, th, x, y, under) {
    const g = S.SOLID.has(ch) ? (under || '.') : ch;
    if (ch === '~' || ch === 'w' || ch === ' ' || ch === '#' || ch === 'h' || ch === 'c' || ch === 'v') {
      // tiles que cobrem o chão inteiro
    } else {
      drawGround(ctx, ch === 'k' ? ';' : (ch === 'q' ? (under || ';') : g), px, py, th, x, y);
    }
    switch (ch) {
      case 't': drawTree(ctx, px, py, th.tree, th.tree2, th.trunk); break;
      case 'y': drawTree(ctx, px, py, '#1f7a3a', '#145c2a', '#5a3b20', true); break;
      case 'q': {
        const cx = px + 24, cy = py + 24;
        ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy + 18); ctx.quadraticCurveTo(cx - 10, cy + 4, cx + 2, cy - 6); ctx.quadraticCurveTo(cx + 10, cy - 12, cx + 4, cy - 16); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 3, cy + 2); ctx.lineTo(cx - 14, cy - 6); ctx.stroke();
        ctx.lineWidth = 1; ctx.lineCap = 'butt';
        ctx.fillStyle = '#7ea83b';
        [[cx + 4, cy - 16, 9], [cx - 14, cy - 8, 7], [cx + 12, cy - 8, 6]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fill(); });
        break;
      }
      case 'k': {
        const cx = px + 24, cy = py + 26;
        ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 15, 12, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4f8f4a';
        ctx.fillRect(cx - 5, cy - 18, 10, 34); ctx.fillRect(cx - 16, cy - 8, 8, 14); ctx.fillRect(cx + 8, cy - 12, 8, 16);
        ctx.fillRect(cx - 16, cy + 2, 14, 5); ctx.fillRect(cx + 4, cy + 0, 12, 5);
        ctx.fillStyle = '#6fb465'; ctx.fillRect(cx - 2, cy - 16, 3, 30);
        break;
      }
      case 'b': {
        const cx = px + 24, cy = py + 28;
        ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(cx, cy + 10, 18, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = th.tree2;
        [[-9, 0, 11], [9, 0, 11], [0, -7, 12]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(cx + a, cy + b, r, 0, 7); ctx.fill(); });
        ctx.fillStyle = th.tree; ctx.beginPath(); ctx.arc(cx - 2, cy - 8, 8, 0, 7); ctx.fill();
        break;
      }
      case 'o': {
        const cx = px + 24, cy = py + 28;
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 10, 17, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#8e8c86'; ctx.beginPath(); ctx.ellipse(cx, cy, 17, 13, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#b0aea6'; ctx.beginPath(); ctx.ellipse(cx - 4, cy - 4, 9, 6, 0, 0, 7); ctx.fill();
        break;
      }
      case '~': case 'w': {
        const base = ch === 'w' ? (th.lakeNow || th.lake) : th.water;
        fillTile(ctx, px, py, base);
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
        const o = hash(x, y, 5) * 20;
        ctx.beginPath(); ctx.moveTo(px + 6 + o, py + 16); ctx.quadraticCurveTo(px + 12 + o, py + 12, px + 18 + o, py + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + 4 + o / 2, py + 34); ctx.quadraticCurveTo(px + 10 + o / 2, py + 30, px + 16 + o / 2, py + 34); ctx.stroke();
        ctx.lineWidth = 1;
        break;
      }
      case '#': {
        fillTile(ctx, px, py, th.wall);
        ctx.fillStyle = th.wall2;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
          const off = r % 2 ? 8 : 0;
          ctx.fillRect(px + c * 16 + off, py + r * 12 + 11, 15, 1);
          ctx.fillRect(px + c * 16 + off, py + r * 12, 1, 12);
        }
        break;
      }
      case 'h': {
        fillTile(ctx, px, py, th.house);
        ctx.fillStyle = th.house2;
        for (let i = 0; i < 4; i++) ctx.fillRect(px, py + i * 12 + 10, TS, 2);
        break;
      }
      case 'f': {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(px + 4, py + 14, 6, 24); ctx.fillRect(px + 38, py + 14, 6, 24);
        ctx.fillStyle = '#a8703c'; ctx.fillRect(px, py + 18, TS, 5); ctx.fillRect(px, py + 29, TS, 5);
        break;
      }
      case 's': {
        ctx.fillStyle = '#6b4424'; ctx.fillRect(px + 1, py + 8, TS - 2, TS - 10);
        ctx.fillStyle = '#9a6a3a'; ctx.fillRect(px + 1, py + 6, TS - 2, 12);
        ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(px + 3, py + 8, TS - 6, 3);
        break;
      }
      case 'p': {
        ctx.fillStyle = '#7b8794'; ctx.fillRect(px, py + 16, TS, 16);
        ctx.fillStyle = '#9fb0c0'; ctx.fillRect(px, py + 18, TS, 4);
        ctx.fillStyle = '#5c6772'; ctx.fillRect(px + 20, py + 14, 8, 20);
        break;
      }
      case 'l': {
        ctx.fillStyle = '#5d6b7a'; ctx.fillRect(px + 2, py + 4, TS - 4, TS - 6);
        ctx.fillStyle = '#39434e'; ctx.fillRect(px + 8, py + 10, TS - 16, 14);
        ctx.fillStyle = (x + y) % 2 ? '#62e38b' : '#ffd166'; ctx.fillRect(px + 12, py + 30, 6, 6);
        ctx.fillStyle = '#6fc3ff'; ctx.fillRect(px + 24, py + 30, 6, 6);
        break;
      }
      case 'g': {
        fillTile(ctx, px, py, '#cfeaf3');
        ctx.strokeStyle = '#8fbfd0'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, TS - 2, TS - 2);
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(px + 8, py + 30); ctx.lineTo(px + 22, py + 12); ctx.stroke(); ctx.lineWidth = 1;
        break;
      }
      case 'c': {
        fillTile(ctx, px, py, th.cave);
        ctx.fillStyle = '#4a4258';
        ctx.beginPath(); ctx.arc(px + 12 + hash(x, y, 1) * 24, py + 14 + hash(y, x, 2) * 20, 10, 0, 7); ctx.fill();
        break;
      }
      case 'a': {
        drawGround(ctx, 'e', px, py, th, x, y);
        ctx.strokeStyle = '#3fae6b'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const bx = px + 12 + i * 12;
          ctx.beginPath(); ctx.moveTo(bx, py + 44); ctx.quadraticCurveTo(bx - 8, py + 26, bx + 2, py + 8); ctx.stroke();
        }
        ctx.lineWidth = 1; ctx.lineCap = 'butt';
        break;
      }
      case 'v': {
        fillTile(ctx, px, py, '#1f6b35');
        ctx.fillStyle = '#2d8a47';
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(px + 10 + hash(x, y, i) * 28, py + 10 + hash(y, x, i) * 28, 12, 0, 7); ctx.fill(); }
        break;
      }
      case ' ': fillTile(ctx, px, py, '#1b2030'); break;
      default: break;
    }
  };

  /* ------------------------------------------------------------------
     PERSONAGENS (jogador e NPCs) — vista de cima levemente inclinada.
     look: { skin, hair, hairStyle, shirt, pants, boots, hat, hatColor,
             cape, backpack, glasses, coat, beard, aura, tool, pattern }
     st:   { dir, walk, moving, celebrate, t }
     ------------------------------------------------------------------ */
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  S.rrect = rrect;

  function drawHat(ctx, look, hx, hy, dir) {
    const c = look.hatColor || '#c9a063';
    switch (look.hat) {
      case 'explorador':
        ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(hx, hy - 6, 17, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = c; rrect(ctx, hx - 10, hy - 18, 20, 13, 5); ctx.fill();
        ctx.fillStyle = '#6b4e22'; ctx.fillRect(hx - 10, hy - 9, 20, 3);
        break;
      case 'bone':
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy - 8, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = shade(c, -30);
        if (dir === 'down') ctx.fillRect(hx - 10, hy - 9, 20, 5);
        else if (dir === 'left') ctx.fillRect(hx - 18, hy - 9, 12, 4);
        else if (dir === 'right') ctx.fillRect(hx + 6, hy - 9, 12, 4);
        ctx.fillStyle = '#6fd36b'; ctx.beginPath(); ctx.ellipse(hx + 3, hy - 17, 5, 3, -0.5, 0, 7); ctx.fill();
        break;
      case 'coroa':
        ctx.fillStyle = '#3fae5b';
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(hx + i * 6, hy - 14 - (i === 0 ? 3 : 0), 4, 7, i * 0.3, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(hx, hy - 18, 3, 0, 7); ctx.fill();
        break;
      case 'gorro':
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy - 7, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy - 20, 4, 0, 7); ctx.fill();
        break;
      case 'guarda':
        ctx.fillStyle = '#556b2f'; ctx.beginPath(); ctx.ellipse(hx, hy - 6, 16, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6b8e23'; rrect(ctx, hx - 9, hy - 16, 18, 11, 4); ctx.fill();
        ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(hx, hy - 11, 2.5, 0, 7); ctx.fill();
        break;
      case 'palha':
        ctx.fillStyle = '#e8c96a'; ctx.beginPath(); ctx.ellipse(hx, hy - 6, 18, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#f1d98a'; ctx.beginPath(); ctx.arc(hx, hy - 10, 9, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#c0392b'; ctx.fillRect(hx - 9, hy - 11, 18, 2);
        break;
      case 'sol':
        ctx.fillStyle = '#ffcf33';
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.arc(hx + Math.cos(a) * 13, hy - 12 + Math.sin(a) * 6, 3, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(hx, hy - 12, 8, 0, 7); ctx.fill();
        break;
      case 'capacete':
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy - 6, 13, Math.PI, 0); ctx.fill();
        ctx.fillRect(hx - 15, hy - 7, 30, 3);
        break;
      case 'flor':
        ctx.fillStyle = '#ff7aa8';
        for (let i = 0; i < 5; i++) { const a = i * 1.256; ctx.beginPath(); ctx.arc(hx + 8 + Math.cos(a) * 4, hy - 12 + Math.sin(a) * 4, 3, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(hx + 8, hy - 12, 2.5, 0, 7); ctx.fill();
        break;
      default: break;
    }
  }

  function shade(hex, amt) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = U.clamp((n >> 16) + amt, 0, 255), g = U.clamp(((n >> 8) & 255) + amt, 0, 255), b = U.clamp((n & 255) + amt, 0, 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  S.shade = shade;

  S.drawCharacter = function (ctx, x, y, look, st) {
    st = st || {};
    const dir = st.dir || 'down';
    const t = st.t || 0;
    const walk = st.moving ? Math.sin(st.walk || 0) : 0;
    const cel = st.celebrate || 0;
    const jump = cel > 0 ? Math.abs(Math.sin(cel * 10)) * 8 : 0;
    const bob = st.moving ? Math.abs(Math.sin((st.walk || 0))) * 1.5 : Math.sin(t * 2) * 0.6;
    const sc = st.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    // aura
    if (look.aura) {
      const a = 0.35 + Math.sin(t * 3) * 0.12;
      const grd = ctx.createRadialGradient(0, -14, 4, 0, -14, 30);
      grd.addColorStop(0, hexA(look.aura, a)); grd.addColorStop(1, hexA(look.aura, 0));
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, -14, 30, 0, 7); ctx.fill();
    }
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.ellipse(0, 0, 13 - jump * 0.4, 5, 0, 0, 7); ctx.fill();
    ctx.translate(0, -jump - bob);

    const shirt = look.shirt || '#3f7fd6';
    const pants = look.pants || '#394b6b';
    const boots = look.boots || '#4a3527';
    const skin = look.skin || '#f1c7a0';
    const hair = look.hair || '#3b2a1e';

    // capa atrás (quando não está de costas)
    if (look.cape && dir !== 'up') {
      ctx.fillStyle = shade(look.cape, -20);
      ctx.beginPath(); ctx.moveTo(-10, -26); ctx.lineTo(10, -26); ctx.lineTo(14 + walk * 2, -4); ctx.lineTo(-14 + walk * 2, -4); ctx.closePath(); ctx.fill();
    }
    // mochila (lateral) quando de frente/lado
    if (look.backpack && dir !== 'up') {
      ctx.fillStyle = look.backpack;
      if (dir === 'left') rrect(ctx, 4, -27, 10, 16, 3);
      else if (dir === 'right') rrect(ctx, -14, -27, 10, 16, 3);
      else rrect(ctx, -12, -28, 24, 6, 3);
      ctx.fill();
    }
    // pernas
    ctx.fillStyle = pants;
    ctx.fillRect(-7, -12, 6, 9 + (walk > 0 ? walk * 2 : 0));
    ctx.fillRect(1, -12, 6, 9 + (walk < 0 ? -walk * 2 : 0));
    ctx.fillStyle = boots;
    rrect(ctx, -8, -4 + (walk > 0 ? walk * 2 : 0), 8, 5, 2); ctx.fill();
    rrect(ctx, 0, -4 + (walk < 0 ? -walk * 2 : 0), 8, 5, 2); ctx.fill();

    // corpo
    ctx.fillStyle = look.coat || shirt;
    rrect(ctx, -10, -28, 20, 18, 6); ctx.fill();
    if (look.coat) { ctx.fillStyle = shirt; ctx.fillRect(-3, -28, 6, 14); }
    if (look.pattern === 'folhas') {
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      [[-5, -22], [4, -18], [-2, -14]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(a, b, 3, 1.6, 0.6, 0, 7); ctx.fill(); });
    } else if (look.pattern === 'listras') {
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-10, -22, 20, 3); ctx.fillRect(-10, -16, 20, 3);
    } else if (look.pattern === 'arcoiris') {
      ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-10, -27 + i * 4, 20, 3); });
    }
    if (look.apron) { ctx.fillStyle = look.apron; rrect(ctx, -7, -22, 14, 12, 3); ctx.fill(); }
    if (look.badge) { ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(dir === 'right' ? 4 : -4, -22, 2.5, 0, 7); ctx.fill(); }

    // braços
    const armUp = cel > 0 ? -12 : 0;
    ctx.fillStyle = look.coat || shirt;
    const sw = st.moving ? walk * 3 : 0;
    ctx.beginPath(); ctx.ellipse(-12, -20 + armUp - sw, 3.5, 6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -20 + armUp + sw, 3.5, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-12, -14 + armUp * 1.4 - sw, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -14 + armUp * 1.4 + sw, 3, 0, 7); ctx.fill();
    // ferramenta (lupa)
    if (look.tool === 'lupa' && cel === 0) {
      ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(13, -14 + sw); ctx.lineTo(17, -6 + sw); ctx.stroke();
      ctx.strokeStyle = '#d0d6de'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(13, -18 + sw, 4, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(160,220,255,.5)'; ctx.fill(); ctx.lineWidth = 1;
    }

    // mochila de costas
    if (look.backpack && dir === 'up') {
      ctx.fillStyle = look.backpack; rrect(ctx, -9, -28, 18, 15, 4); ctx.fill();
      ctx.fillStyle = shade(look.backpack, -30); ctx.fillRect(-6, -20, 12, 3);
    }
    // capa de costas por cima
    if (look.cape && dir === 'up') {
      ctx.fillStyle = look.cape;
      ctx.beginPath(); ctx.moveTo(-11, -28); ctx.lineTo(11, -28); ctx.lineTo(14 + walk * 2, -6); ctx.lineTo(-14 + walk * 2, -6); ctx.closePath(); ctx.fill();
    }

    // cabeça
    const hx = 0, hy = -38;
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, 11, 0, 7); ctx.fill();
    // cabelo
    ctx.fillStyle = hair;
    const hs = look.hairStyle || 'short';
    if (hs !== 'bald') {
      if (dir === 'up') { ctx.beginPath(); ctx.arc(hx, hy, 11.5, 0, 7); ctx.fill(); }
      else {
        ctx.beginPath(); ctx.arc(hx, hy - 2, 11.5, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
        if (dir === 'left') ctx.fillRect(hx + 3, hy - 6, 8, 8);
        if (dir === 'right') ctx.fillRect(hx - 11, hy - 6, 8, 8);
      }
      if (hs === 'long') { ctx.fillRect(hx - 12, hy - 4, 5, 16); ctx.fillRect(hx + 7, hy - 4, 5, 16); }
      if (hs === 'bun') { ctx.beginPath(); ctx.arc(hx, hy - 13, 5.5, 0, 7); ctx.fill(); }
      if (hs === 'curly') { for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(hx + i * 5, hy - 10, 4.5, 0, 7); ctx.fill(); } }
      if (hs === 'braid') { ctx.fillRect(hx + 8, hy, 4, 14); ctx.beginPath(); ctx.arc(hx + 10, hy + 15, 3, 0, 7); ctx.fill(); }
    }
    // rosto
    if (dir !== 'up') {
      ctx.fillStyle = '#2b2b2b';
      const ex = dir === 'left' ? -4 : dir === 'right' ? 4 : 0;
      if (dir === 'down') {
        ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 1.7, 0, 7); ctx.arc(hx + 4, hy + 1, 1.7, 0, 7); ctx.fill();
        ctx.strokeStyle = '#8a4b3a'; ctx.lineWidth = 1.3; ctx.beginPath();
        if (cel > 0) ctx.arc(hx, hy + 4, 3.5, 0.1, Math.PI - 0.1); else ctx.arc(hx, hy + 4, 2.4, 0.3, Math.PI - 0.3);
        ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255,120,120,.35)'; ctx.beginPath(); ctx.arc(hx - 7, hy + 4, 2, 0, 7); ctx.arc(hx + 7, hy + 4, 2, 0, 7); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(hx + ex, hy + 1, 1.7, 0, 7); ctx.fill();
      }
      if (look.beard) { ctx.fillStyle = look.beard; ctx.beginPath(); ctx.arc(hx + ex / 2, hy + 7, 6, 0, Math.PI); ctx.fill(); }
      if (look.glasses) {
        ctx.strokeStyle = look.glasses; ctx.lineWidth = 1.6;
        if (dir === 'down') { ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 3.4, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(hx + 4, hy + 1, 3.4, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx - 1, hy + 1); ctx.lineTo(hx + 1, hy + 1); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(hx + ex, hy + 1, 3.4, 0, 7); ctx.stroke(); }
        ctx.lineWidth = 1;
      }
    }
    drawHat(ctx, look, hx, hy, dir);
    if (cel > 0) {
      ctx.fillStyle = '#ffe066';
      for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.25; ctx.beginPath(); ctx.arc(Math.cos(a) * 20, hy - 6 + Math.sin(a) * 12, 2.2, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  };

  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  S.hexA = hexA;

  /* ------------------------------------------------------------------
     LUMI — criaturinha de folha, gota d'água e luz solar.
     ------------------------------------------------------------------ */
  S.lumiVariants = {
    classica: { body: '#8fe3ff', leaf: '#47c46b', glow: '#ffe066' },
    orvalho: { body: '#b8d6ff', leaf: '#4fa3ff', glow: '#d8f0ff' },
    ipe: { body: '#ffd6ef', leaf: '#f5c518', glow: '#ffb3de' },
    aurora: { body: '#c7ffe0', leaf: '#ff9f43', glow: '#9dffcf' },
    cristal: { body: '#eadcff', leaf: '#a879ff', glow: '#ffffff' }
  };
  S.drawLumi = function (ctx, x, y, t, variant, scale) {
    const v = S.lumiVariants[variant] || S.lumiVariants.classica;
    const sc = scale || 1;
    const bob = Math.sin(t * 3) * 3;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, 0, 7); ctx.fill();
    ctx.translate(0, -22 + bob);
    const grd = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
    grd.addColorStop(0, hexA(v.glow, 0.55)); grd.addColorStop(1, hexA(v.glow, 0));
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
    // corpo de gota
    ctx.fillStyle = v.body;
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.bezierCurveTo(9, -3, 11, 4, 0, 10); ctx.bezierCurveTo(-11, 4, -9, -3, 0, -13); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-3, -2, 2, 3.5, 0.3, 0, 7); ctx.fill();
    // folha
    ctx.fillStyle = v.leaf;
    ctx.save(); ctx.rotate(Math.sin(t * 2) * 0.2);
    ctx.beginPath(); ctx.ellipse(4, -14, 6, 3, -0.6, 0, 7); ctx.fill(); ctx.restore();
    // olhos
    ctx.fillStyle = '#1f2d3d'; ctx.beginPath(); ctx.arc(-3, 2, 1.6, 0, 7); ctx.arc(3, 2, 1.6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1f2d3d'; ctx.beginPath(); ctx.arc(0, 4.5, 2, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     MASCOTES originais
     ------------------------------------------------------------------ */
  S.drawPet = function (ctx, kind, x, y, t, moving) {
    const hop = moving ? Math.abs(Math.sin(t * 10)) * 3 : 0;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.5, 0, 0, 7); ctx.fill();
    ctx.translate(0, -hop);
    switch (kind) {
      case 'tatu':
        ctx.fillStyle = '#9c8a78'; ctx.beginPath(); ctx.ellipse(0, -8, 10, 7, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#7d6c5b'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 4, -15); ctx.lineTo(i * 4, -2); ctx.stroke(); }
        ctx.fillStyle = '#b8a390'; ctx.beginPath(); ctx.ellipse(10, -6, 4, 3, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(11, -7, 1, 0, 7); ctx.fill();
        break;
      case 'joaninha':
        ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(0, -9, 8, 0, 7); ctx.fill();
        ctx.fillStyle = '#222'; ctx.fillRect(-0.7, -17, 1.4, 16);
        [[-4, -11], [4, -11], [-3, -5], [3, -5]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 1.6, 0, 7); ctx.fill(); });
        ctx.beginPath(); ctx.arc(0, -17, 3.5, 0, 7); ctx.fill();
        break;
      case 'peixe':
        ctx.fillStyle = 'rgba(170,220,255,.35)'; ctx.beginPath(); ctx.arc(0, -14, 11, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
        ctx.fillStyle = '#ff9f43'; ctx.beginPath(); ctx.ellipse(0, -14 + Math.sin(t * 4), 6, 4, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(-10, -18); ctx.lineTo(-10, -10); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(3, -15, 1, 0, 7); ctx.fill();
        break;
      case 'arara':
        ctx.fillStyle = '#2e86de'; ctx.beginPath(); ctx.ellipse(0, -10, 6, 9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#feca57'; ctx.beginPath(); ctx.ellipse(0, -7, 4, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#2e86de'; ctx.beginPath(); ctx.arc(0, -19, 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(3, -19); ctx.lineTo(7, -17); ctx.lineTo(3, -16); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-1, -20, 1.6, 0, 7); ctx.fill();
        break;
      case 'lobo':
        ctx.fillStyle = '#d9722b'; ctx.beginPath(); ctx.ellipse(0, -12, 11, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-8, -8, 2.5, 8); ctx.fillRect(6, -8, 2.5, 8);
        ctx.fillStyle = '#d9722b'; ctx.beginPath(); ctx.arc(11, -17, 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.moveTo(9, -21); ctx.lineTo(10, -28); ctx.lineTo(13, -21); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-11, -12); ctx.lineTo(-17, -16); ctx.lineTo(-13, -9); ctx.fill();
        break;
      default: break;
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     ANIMAIS — capivara, cutia e tatu desenhados; outros via emoji.
     ------------------------------------------------------------------ */
  S.animalEmoji = {
    macaco: '🐒', onca: '🐆', cao: '🐕', arara: '🦜', ave: '🐦', peixe: '🐟', sapo: '🐸', coelho: '🐇',
    raposa: '🦊', harpia: '🦅', gaviao: '🦅', serpente: '🐍', jararaca: '🐍', gafanhoto: '🦗', rato: '🐁',
    camundongo: '🐁', coruja: '🦉', jacare: '🐊', lagarto: '🦎', borboleta: '🦋', abelha: '🐝', vaca: '🐄',
    tucano: '🐦', garca: '🦢', tartaruga: '🐢', galinha: '🐔', joaninha: '🐞'
  };
  S.drawEmoji = function (ctx, emo, x, y, size, alpha) {
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emo, x, y);
    ctx.restore();
  };

  S.drawAnimal = function (ctx, kind, x, y, t, opts) {
    opts = opts || {};
    const bob = Math.sin(t * 2 + x) * 1.2;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, y, 12, 4, 0, 0, 7); ctx.fill();
    if (kind === 'capivara') {
      ctx.save(); ctx.translate(x, y - 12 + bob);
      if (opts.flip) ctx.scale(-1, 1);
      ctx.fillStyle = '#8b5e3c'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#7a4f30'; rrect(ctx, 10, -10, 12, 12, 4); ctx.fill();
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(12, -10, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(17, -6, 1.3, 0, 7); ctx.fill();
      ctx.fillStyle = '#6b4428'; ctx.fillRect(-10, 7, 4, 5); ctx.fillRect(6, 7, 4, 5);
      ctx.restore();
    } else if (kind === 'cutia') {
      ctx.save(); ctx.translate(x, y - 9 + bob);
      if (opts.flip) ctx.scale(-1, 1);
      ctx.fillStyle = '#c1843f'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10, -3, 6, 4.5, 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(13, -4, 1.2, 0, 7); ctx.fill();
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-6, 5, 3, 5); ctx.fillRect(4, 5, 3, 5);
      ctx.restore();
    } else if (kind === 'tatu') {
      S.drawPet(ctx, 'tatu', x, y, t, false);
    } else {
      const e = S.animalEmoji[kind] || kind;
      S.drawEmoji(ctx, e, x, y - 16 + bob, opts.size || 30, opts.alpha);
    }
  };

  /* ------------------------------------------------------------------
     OBJETOS do mundo
     ------------------------------------------------------------------ */
  S.drawObject = function (ctx, e, x, y, t, st) {
    const k = e.sprite;
    st = st || {};
    const shadow = (w) => { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, y, w, w / 3, 0, 0, 7); ctx.fill(); };
    switch (k) {
      case 'sign': {
        shadow(10);
        ctx.fillStyle = '#6b4424'; ctx.fillRect(x - 2.5, y - 26, 5, 26);
        ctx.fillStyle = e.color || '#b7864f'; rrect(ctx, x - 18, y - 42, 36, 20, 4); ctx.fill();
        ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 12, y - 36, 24, 2); ctx.fillRect(x - 12, y - 30, 18, 2);
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 54, 18);
        break;
      }
      case 'chest': {
        shadow(16);
        const open = st.open;
        ctx.fillStyle = e.color || '#a0642c'; rrect(ctx, x - 16, y - 20, 32, 18, 3); ctx.fill();
        ctx.fillStyle = '#ffcf40'; ctx.fillRect(x - 16, y - 13, 32, 3);
        if (open) {
          ctx.fillStyle = '#7a4a1e'; rrect(ctx, x - 16, y - 34, 32, 12, 3); ctx.fill();
          ctx.fillStyle = 'rgba(255,230,120,.7)'; ctx.beginPath(); ctx.arc(x, y - 20, 9, 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = shade(e.color || '#a0642c', 20); rrect(ctx, x - 17, y - 29, 34, 11, 5); ctx.fill();
          ctx.fillStyle = '#ffcf40'; ctx.fillRect(x - 3, y - 22, 6, 7);
        }
        break;
      }
      case 'portal': {
        const c = e.color || '#9b6bff';
        const lit = st.lit !== false;
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x, y, 22, 7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6d6875'; rrect(ctx, x - 24, y - 56, 8, 56, 3); ctx.fill(); rrect(ctx, x + 16, y - 56, 8, 56, 3); ctx.fill();
        ctx.fillStyle = '#86808f'; rrect(ctx, x - 26, y - 62, 52, 10, 4); ctx.fill();
        if (lit) {
          const g = ctx.createRadialGradient(x, y - 28, 2, x, y - 28, 22);
          g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.5, hexA(c, 0.8)); g.addColorStop(1, hexA(c, 0.25));
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - 27, 16, 25, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(x, y - 27, 10 + Math.sin(t * 3) * 3, 18, t, 0, 4); ctx.stroke(); ctx.lineWidth = 1;
        } else {
          ctx.fillStyle = 'rgba(60,60,80,.55)'; ctx.beginPath(); ctx.ellipse(x, y - 27, 16, 25, 0, 0, 7); ctx.fill();
          S.drawEmoji(ctx, '🔒', x, y - 28, 18);
        }
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 74, 18);
        break;
      }
      case 'altar': {
        shadow(18);
        ctx.fillStyle = '#9aa0ad'; rrect(ctx, x - 18, y - 16, 36, 16, 4); ctx.fill();
        ctx.fillStyle = '#b8bfcc'; rrect(ctx, x - 14, y - 22, 28, 8, 3); ctx.fill();
        const c = e.color || '#7bd88f';
        const lit = st.lit;
        ctx.save(); ctx.translate(x, y - 38 + Math.sin(t * 2) * 3);
        if (lit) {
          const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
          g.addColorStop(0, hexA(c, 0.7)); g.addColorStop(1, hexA(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
        }
        ctx.fillStyle = lit ? c : '#7c7a88';
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, 0); ctx.lineTo(0, 14); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0); ctx.fill();
        ctx.restore();
        break;
      }
      case 'board': {
        shadow(20);
        ctx.fillStyle = '#6b4424'; ctx.fillRect(x - 20, y - 20, 4, 20); ctx.fillRect(x + 16, y - 20, 4, 20);
        ctx.fillStyle = '#c28e57'; rrect(ctx, x - 24, y - 50, 48, 32, 3); ctx.fill();
        ['#fff4a3', '#b8f2c9', '#c9e4ff', '#ffd1dc'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - 20 + (i % 2) * 22, y - 46 + Math.floor(i / 2) * 14, 17, 11); });
        break;
      }
      case 'machine': {
        shadow(20);
        const on = st.on;
        ctx.fillStyle = '#5f6d7c'; rrect(ctx, x - 20, y - 44, 40, 44, 5); ctx.fill();
        ctx.fillStyle = on ? '#1e3b2c' : '#2b3038'; rrect(ctx, x - 14, y - 38, 28, 16, 3); ctx.fill();
        if (on) {
          ctx.strokeStyle = '#62e38b'; ctx.lineWidth = 2; ctx.beginPath();
          for (let i = 0; i < 24; i++) ctx.lineTo(x - 12 + i, y - 30 + Math.sin(t * 6 + i * 0.6) * 4);
          ctx.stroke(); ctx.lineWidth = 1;
        }
        ctx.fillStyle = on ? '#62e38b' : '#c0504d'; ctx.beginPath(); ctx.arc(x - 8, y - 12, 4, 0, 7); ctx.fill();
        ctx.fillStyle = on ? '#ffd166' : '#555'; ctx.beginPath(); ctx.arc(x + 8, y - 12, 4, 0, 7); ctx.fill();
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 56, 18);
        break;
      }
      case 'cage': {
        shadow(14);
        const open = st.open;
        ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 2;
        ctx.strokeRect(x - 14, y - 32, 28, 30);
        if (!open) for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 14 + i * 5.6, y - 32); ctx.lineTo(x - 14 + i * 5.6, y - 2); ctx.stroke(); }
        ctx.lineWidth = 1;
        if (!open) S.drawEmoji(ctx, e.emoji || '🐦', x, y - 17, 16);
        else { S.drawEmoji(ctx, e.emoji || '🐦', x + Math.sin(t * 3) * 10, y - 46 - Math.abs(Math.sin(t * 2)) * 8, 18); }
        break;
      }
      case 'easel': {
        shadow(14);
        ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x, y - 44); ctx.lineTo(x + 12, y); ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = '#fffaf0'; ctx.fillRect(x - 16, y - 44, 32, 24);
        ctx.strokeStyle = '#6b4424'; ctx.strokeRect(x - 16, y - 44, 32, 24);
        if (st.done) { S.drawEmoji(ctx, '🦫', x - 5, y - 32, 12); ctx.strokeStyle = '#3b82f6'; ctx.beginPath(); ctx.moveTo(x + 2, y - 30); ctx.lineTo(x + 12, y - 38); ctx.stroke(); }
        break;
      }
      case 'tower': {
        shadow(20);
        ctx.fillStyle = '#7a5230'; ctx.fillRect(x - 16, y - 40, 5, 40); ctx.fillRect(x + 11, y - 40, 5, 40);
        ctx.fillStyle = '#9a6a3a'; ctx.fillRect(x - 20, y - 48, 40, 10);
        ctx.fillStyle = '#6b4424'; ctx.fillRect(x - 20, y - 60, 3, 12); ctx.fillRect(x + 17, y - 60, 3, 12); ctx.fillRect(x - 20, y - 60, 40, 3);
        S.drawEmoji(ctx, '🔭', x, y - 70, 18);
        break;
      }
      case 'pipe': {
        const flow = st.flow;
        ctx.fillStyle = '#6f7b87'; rrect(ctx, x - 22, y - 22, 26, 14, 4); ctx.fill();
        ctx.fillStyle = '#56616c'; rrect(ctx, x + 2, y - 25, 8, 20, 2); ctx.fill();
        if (flow) {
          ctx.fillStyle = e.flowColor || 'rgba(120,150,60,.8)';
          ctx.beginPath(); ctx.ellipse(x + 20 + Math.sin(t * 5) * 2, y - 12, 10, 6, 0, 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = '#c0504d'; ctx.fillRect(x + 1, y - 27, 10, 4);
          S.drawEmoji(ctx, '✅', x + 18, y - 26, 12);
        }
        break;
      }
      case 'bottle': {
        shadow(16);
        const ok = st.on;
        ctx.fillStyle = 'rgba(200,235,255,.45)'; rrect(ctx, x - 14, y - 46, 28, 44, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(120,170,200,.9)'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x - 12, y - 16, 24, 12);
        ctx.fillStyle = '#3fae5b'; ctx.beginPath(); ctx.ellipse(x - 4, y - 26, 4, 9, -0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 5, y - 28, 4, 9, 0.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#8a6a4a'; ctx.fillRect(x - 6, y - 54, 12, 8);
        if (ok) { ctx.fillStyle = 'rgba(255,255,255,.8)'; [[-9, -38], [8, -40], [-6, -44], [10, -32]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a, y + b + Math.sin(t * 2 + a) * 1, 1.6, 0, 7); ctx.fill(); }); }
        break;
      }
      case 'pyramid': {
        shadow(24);
        const lit = st.on;
        const cols = lit ? ['#6cc36a', '#9ad06a', '#f3c64b', '#f39c4b', '#e2654b'] : ['#888', '#999', '#aaa', '#bbb', '#ccc'];
        for (let i = 0; i < 5; i++) {
          const w = 48 - i * 9;
          ctx.fillStyle = cols[i]; ctx.fillRect(x - w / 2, y - 10 - i * 10, w, 9);
        }
        break;
      }
      case 'stump': {
        shadow(12);
        ctx.fillStyle = '#7a5230'; rrect(ctx, x - 12, y - 14, 24, 12, 4); ctx.fill();
        ctx.fillStyle = '#c69c6d'; ctx.beginPath(); ctx.ellipse(x, y - 14, 12, 5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#9a7248'; ctx.beginPath(); ctx.ellipse(x, y - 14, 6, 2.5, 0, 0, 7); ctx.stroke();
        break;
      }
      case 'sapling': {
        const grown = st.on;
        if (grown) { drawTree(ctx, x - 24, y - 40, '#3fae5b', '#2d8a47', '#7a5230'); break; }
        shadow(8);
        ctx.strokeStyle = '#4a7a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 14); ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = '#5fcf6b'; ctx.beginPath(); ctx.ellipse(x - 5, y - 14, 5, 3, 0.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 5, y - 16, 5, 3, -0.5, 0, 7); ctx.fill();
        break;
      }
      case 'compost': {
        shadow(16);
        ctx.fillStyle = '#6b8e23'; rrect(ctx, x - 16, y - 30, 32, 28, 4); ctx.fill();
        ctx.fillStyle = '#556b2f'; ctx.fillRect(x - 16, y - 32, 32, 6);
        S.drawEmoji(ctx, '♻️', x, y - 16, 16);
        break;
      }
      case 'fountain': {
        const clean = st.on;
        ctx.fillStyle = '#9aa0ad'; ctx.beginPath(); ctx.ellipse(x, y - 8, 34, 16, 0, 0, 7); ctx.fill();
        ctx.fillStyle = clean ? '#57b7f0' : '#7c8f6a'; ctx.beginPath(); ctx.ellipse(x, y - 10, 28, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#b8bfcc'; ctx.fillRect(x - 4, y - 34, 8, 24);
        if (clean) {
          ctx.fillStyle = 'rgba(180,230,255,.8)';
          for (let i = 0; i < 6; i++) { const a = t * 3 + i; ctx.beginPath(); ctx.arc(x + Math.cos(i) * 10 * ((a % 1)), y - 34 + (a % 1) * 20, 2, 0, 7); ctx.fill(); }
        }
        break;
      }
      case 'bed': {
        ctx.fillStyle = '#7a5230'; rrect(ctx, x - 18, y - 40, 36, 40, 4); ctx.fill();
        ctx.fillStyle = '#e8f4ff'; rrect(ctx, x - 15, y - 37, 30, 10, 3); ctx.fill();
        ctx.fillStyle = e.color || '#4fa3ff'; rrect(ctx, x - 15, y - 26, 30, 23, 3); ctx.fill();
        break;
      }
      case 'wardrobe': {
        shadow(18);
        ctx.fillStyle = '#8b5a2b'; rrect(ctx, x - 20, y - 56, 40, 56, 3); ctx.fill();
        ctx.fillStyle = '#a8703c'; ctx.fillRect(x - 17, y - 52, 16, 48); ctx.fillRect(x + 1, y - 52, 16, 48);
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x - 4, y - 28, 2, 0, 7); ctx.arc(x + 4, y - 28, 2, 0, 7); ctx.fill();
        break;
      }
      case 'shelf': {
        shadow(20);
        ctx.fillStyle = '#6b4424'; ctx.fillRect(x - 22, y - 50, 44, 50);
        ctx.fillStyle = '#9a6a3a'; ctx.fillRect(x - 20, y - 36, 40, 3); ctx.fillRect(x - 20, y - 20, 40, 3);
        (e.items || ['🏆', '📗', '🌱']).forEach((em, i) => S.drawEmoji(ctx, em, x - 13 + (i % 3) * 13, y - 43 + Math.floor(i / 3) * 16, 12));
        break;
      }
      case 'rack': {
        shadow(18);
        ctx.fillStyle = '#6b4424'; ctx.fillRect(x - 20, y - 46, 3, 46); ctx.fillRect(x + 17, y - 46, 3, 46); ctx.fillRect(x - 20, y - 46, 40, 3);
        ['#3f7fd6', '#6cc36a', '#ffcf33', '#9b6bff'].forEach((c, i) => { ctx.fillStyle = c; rrect(ctx, x - 16 + i * 8, y - 42, 7, 18, 2); ctx.fill(); });
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 12, 16);
        break;
      }
      case 'pedestal': {
        shadow(12);
        ctx.fillStyle = '#b8bfcc'; rrect(ctx, x - 11, y - 22, 22, 22, 3); ctx.fill();
        ctx.fillStyle = '#d7dce5'; ctx.fillRect(x - 13, y - 24, 26, 5);
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 36 + Math.sin(t * 2) * 2, 22);
        break;
      }
      case 'totem': {
        shadow(12);
        const c = e.color || '#f3c64b';
        const lit = st.on;
        ctx.fillStyle = lit ? c : '#8a8a8a'; rrect(ctx, x - 9, y - 44, 18, 44, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 5, y - 40, 4, 36);
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 56, 20);
        break;
      }
      case 'station': {
        shadow(18);
        ctx.fillStyle = e.color || '#7b5cff'; rrect(ctx, x - 18, y - 48, 36, 48, 6); ctx.fill();
        ctx.fillStyle = '#1b1f2e'; rrect(ctx, x - 13, y - 42, 26, 20, 3); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x - 6, y - 12, 3, 0, 7); ctx.fill();
        ctx.fillStyle = '#62e38b'; ctx.beginPath(); ctx.arc(x + 6, y - 12, 3, 0, 7); ctx.fill();
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 32, 14);
        break;
      }
      case 'door': {
        ctx.fillStyle = '#5a3a1a'; rrect(ctx, x - 16, y - 44, 32, 44, 6); ctx.fill();
        ctx.fillStyle = e.color || '#8b5a2b'; rrect(ctx, x - 13, y - 41, 26, 41, 5); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x + 7, y - 20, 2.4, 0, 7); ctx.fill();
        if (st.locked) S.drawEmoji(ctx, '🔒', x, y - 24, 16);
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 56, 18);
        break;
      }
      case 'gate': {
        ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x - 22, y - 36, 6, 36); ctx.fillRect(x + 16, y - 36, 6, 36);
        ctx.fillStyle = '#b07a42'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 22, y - 30 + i * 10, 44, 5);
        S.drawEmoji(ctx, e.emoji || '🚧', x, y - 46, 18);
        break;
      }
      case 'barrier': {
        ctx.fillStyle = '#7b5cff'; ctx.globalAlpha = 0.25 + Math.sin(t * 3) * 0.1;
        ctx.fillRect(x - 24, y - 40, 48, 40); ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('← ← ←', x, y - 16);
        S.drawEmoji(ctx, '🌫️', x, y - 48, 20);
        break;
      }
      case 'lamp': {
        shadow(8);
        const on = st.on;
        ctx.fillStyle = '#555'; ctx.fillRect(x - 2, y - 30, 4, 30);
        ctx.fillStyle = on ? '#ffe066' : '#777'; ctx.beginPath(); ctx.arc(x, y - 34, 7, 0, 7); ctx.fill();
        if (on) { ctx.fillStyle = 'rgba(255,230,100,.25)'; ctx.beginPath(); ctx.arc(x, y - 34, 16, 0, 7); ctx.fill(); }
        break;
      }
      case 'nucleo': {
        const r = 20 + Math.sin(t * 2) * 3;
        const lvl = st.level === undefined ? 1 : st.level;
        const g = ctx.createRadialGradient(x, y - 30, 2, x, y - 30, r + 16);
        g.addColorStop(0, lvl > 0 ? 'rgba(140,100,200,.95)' : 'rgba(255,255,255,.95)');
        g.addColorStop(1, lvl > 0 ? 'rgba(120,90,180,0)' : 'rgba(120,230,160,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 30, r + 16, 0, 7); ctx.fill();
        ctx.fillStyle = lvl > 0 ? '#6c4fa3' : '#62e38b';
        ctx.beginPath(); ctx.moveTo(x, y - 52); ctx.lineTo(x + 13, y - 30); ctx.lineTo(x, y - 8); ctx.lineTo(x - 13, y - 30); ctx.fill();
        break;
      }
      case 'plot': {
        ctx.fillStyle = '#6b4a2b'; rrect(ctx, x - 18, y - 22, 36, 22, 4); ctx.fill();
        ctx.fillStyle = '#5a3d22'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 15, y - 18 + i * 6, 30, 2);
        if (e.emoji) S.drawEmoji(ctx, e.emoji, x, y - 20, 20);
        break;
      }
      case 'fragment': {
        const yy = y - 14 + Math.sin(t * 3 + x) * 3;
        ctx.fillStyle = 'rgba(120,255,200,.25)'; ctx.beginPath(); ctx.arc(x, yy, 10, 0, 7); ctx.fill();
        ctx.fillStyle = '#5ef0b0'; ctx.beginPath(); ctx.moveTo(x, yy - 8); ctx.lineTo(x + 6, yy); ctx.lineTo(x, yy + 8); ctx.lineTo(x - 6, yy); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, yy - 5, 2, 4);
        break;
      }
      case 'emoji':
      default: {
        shadow(e.shadow || 10);
        S.drawEmoji(ctx, e.emoji || '❓', x, y - (e.lift || 16) + (e.float ? Math.sin(t * 3) * 3 : 0), e.size || 28, st.alpha);
        break;
      }
    }
  };

  /** Retrato para o diálogo (desenhado num canvas pequeno). */
  S.portrait = function (canvas, who) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e7f7ff'); g.addColorStop(1, '#c9ecd3');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (!who) return;
    if (who.kind === 'lumi') { S.drawLumi(c, w / 2, h * 0.95, performance.now() / 1000, who.variant, 2.6); return; }
    if (who.kind === 'animal') { S.drawEmoji(c, S.animalEmoji[who.animal] || '🐾', w / 2, h / 2, w * 0.6); return; }
    if (who.kind === 'emoji') { S.drawEmoji(c, who.emoji, w / 2, h / 2, w * 0.6); return; }
    S.drawCharacter(c, w / 2, h * 1.02, who.look || {}, { dir: 'down', t: 0, scale: 2.3 });
  };

  return S;
})();
