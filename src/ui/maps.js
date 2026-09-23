/* =====================================================================
   src/ui/maps.js — mapa do Brasil reutilizável (SVG para questões e
   painéis; Path2D para cenas em canvas). Dados: GG.brasilMapa
   (@svg-maps/brazil, CC BY 4.0). Regiões sempre têm nome escrito e
   hachuras opcionais para não depender só de cor.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const U = GG.util;
  const MP = (GG.maps = {});
  const NS = 'http://www.w3.org/2000/svg';
  MP.REGIONS = [
    { id: 'norte', t: 'Norte', c: '#86d17a' }, { id: 'nordeste', t: 'Nordeste', c: '#f7b267' },
    { id: 'centro', t: 'Centro-Oeste', c: '#f4e285' }, { id: 'sudeste', t: 'Sudeste', c: '#8ecae6' }, { id: 'sul', t: 'Sul', c: '#c9b2ff' }
  ];
  MP.regionName = (id) => (MP.REGIONS.find((r) => r.id === id) || {}).t || id;
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  MP.sv = sv;
  let uid = 0;

  /**
   * opts: { fill(state)->cor, regionFill{id:cor}, labels:'regions'|'none', interactive, onPick(rid),
   *         patterns{rid:'hatch'|'dots'}, extra(svg, M) desenha sobreposições, title }
   */
  MP.brasil = function (opts) {
    const o = opts || {}, M = GG.brasilMapa, id = 'm' + (++uid);
    const svg = sv('svg', { viewBox: M.viewBox, class: 'map-svg' + (o.interactive ? ' int' : ''), role: o.interactive ? 'group' : 'img', 'aria-label': o.title || 'Mapa do Brasil com as cinco regiões' });
    const defs = sv('defs', {}, svg);
    const hatch = sv('pattern', { id: id + 'h', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    sv('rect', { width: 8, height: 8, fill: 'transparent' }, hatch); sv('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: 'rgba(0,0,0,.45)', 'stroke-width': 3 }, hatch);
    const dots = sv('pattern', { id: id + 'd', width: 10, height: 10, patternUnits: 'userSpaceOnUse' }, defs);
    sv('circle', { cx: 5, cy: 5, r: 2.2, fill: 'rgba(0,0,0,.5)' }, dots);
    const byRegion = {};
    M.states.forEach((s) => {
      const color = o.fill ? o.fill(s) : (o.regionFill && o.regionFill[s.region]) || MP.REGIONS.find((r) => r.id === s.region).c;
      const p = sv('path', { d: s.d, fill: color, 'data-r': s.region, 'data-s': s.id }, svg);
      const pat = o.patterns && o.patterns[s.region];
      if (pat) sv('path', { d: s.d, fill: 'url(#' + id + (pat === 'hatch' ? 'h' : 'd') + ')', 'pointer-events': 'none', stroke: 'none' }, svg);
      (byRegion[s.region] = byRegion[s.region] || []).push(p);
      if (o.interactive) p.addEventListener('click', () => o.onPick && o.onPick(s.region));
    });
    const labelG = sv('g', { 'pointer-events': 'none' }, svg);
    if (o.labels !== 'none') {
      MP.REGIONS.forEach((r) => {
        const c = M.regions[r.id];
        const t = sv('text', { x: c.cx, y: c.cy, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 900, 'font-family': 'Nunito, sans-serif', fill: '#1b1b2a', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, labelG);
        t.textContent = r.t;
      });
    }
    if (o.extra) o.extra(svg, M, sv);
    const markG = sv('g', { 'pointer-events': 'none' }, svg);
    const wrap = U.el('div', { class: 'vis' }, [svg]);
    return {
      el: wrap, svg,
      select(rid) { svg.querySelectorAll('path[data-r]').forEach((p) => p.classList.toggle('sel', p.getAttribute('data-r') === rid)); },
      hint(rid) { (byRegion[rid] || []).forEach((p) => p.classList.add('hint')); },
      mark(rid, label) { const c = M.regions[rid]; const t = sv('text', { x: c.cx, y: c.cy + 34, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 900, fill: '#0b6b2e', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, markG); t.textContent = label; }
    };
  };
  /** Seta curva com rótulo sobre o mapa (coordenadas do viewBox). */
  MP.arrow = function (svg, x1, y1, x2, y2, color, label, bend) {
    const id = 'a' + (++uid);
    const defs = svg.querySelector('defs') || sv('defs', {}, svg);
    const mk = sv('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs);
    sv('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }, mk);
    const mx = (x1 + x2) / 2 + (bend || 0) * (y2 - y1) * 0.25, my = (y1 + y2) / 2 - (bend || 0) * (x2 - x1) * 0.25;
    sv('path', { d: 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2, fill: 'none', stroke: '#fff', 'stroke-width': 11, 'stroke-linecap': 'round' }, svg);
    sv('path', { d: 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2, fill: 'none', stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', 'marker-end': 'url(#' + id + ')', 'stroke-dasharray': '14 6' }, svg);
    if (label) { const t = sv('text', { x: mx, y: my, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: '#1b1b2a', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, svg); t.textContent = label; }
  };
  MP.label = function (svg, x, y, text, size, color) {
    const t = sv('text', { x, y, 'text-anchor': 'middle', 'font-size': size || 20, 'font-weight': 900, fill: color || '#1b1b2a', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke', 'font-family': 'Nunito, sans-serif' }, svg);
    t.textContent = text; return t;
  };
  MP.state = (id) => GG.brasilMapa.states.find((s) => s.id === id);

  /* ------------------------------------------------------------ canvas */
  let p2d = null;
  /** Desenha o Brasil num canvas: fill(state)->cor. (x,y) canto; w largura em px lógicos. */
  MP.drawCanvas = function (ctx, x, y, w, fill, stroke) {
    const M = GG.brasilMapa;
    if (!p2d) p2d = M.states.map((s) => ({ s, p: new Path2D(s.d) }));
    const k = w / 613;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    p2d.forEach(({ s, p }) => { ctx.fillStyle = fill ? fill(s) : MP.REGIONS.find((r) => r.id === s.region).c; ctx.fill(p); ctx.strokeStyle = stroke || 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5 / k * 0.6; ctx.stroke(p); });
    ctx.restore();
  };
  /** Converte coordenada do viewBox para a posição desenhada por drawCanvas. */
  MP.toCanvas = (x, y, w, px, py) => ({ x: x + px * (w / 613), y: y + py * (w / 613) });
})();
