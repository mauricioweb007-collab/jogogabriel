/* =====================================================================
   data/mapkit.js — pequeno kit para construir mapas em tiles por código
   (retângulos, bordas, caminhos, elipses e decoração espalhada com
   semente fixa). Assim, todos os mapas têm linhas do mesmo tamanho e a
   decoração nunca bloqueia trilhas nem pontos de interação.
   ===================================================================== */
EN.mapkit = (function () {
  'use strict';
  function Grid(w, h, fill) {
    this.w = w; this.h = h; this.g = [];
    for (let y = 0; y < h; y++) this.g.push(new Array(w).fill(fill));
    this.keep = new Set();
  }
  const P = Grid.prototype;
  P.in = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; };
  P.set = function (x, y, ch) { if (this.in(x, y)) this.g[y][x] = ch; return this; };
  P.get = function (x, y) { return this.in(x, y) ? this.g[y][x] : ' '; };
  P.rect = function (x, y, w, h, ch, only) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (!only || only.includes(this.get(i, j))) this.set(i, j, ch);
    return this;
  };
  P.frame = function (x, y, w, h, ch) {
    for (let i = x; i < x + w; i++) { this.set(i, y, ch); this.set(i, y + h - 1, ch); }
    for (let j = y; j < y + h; j++) { this.set(x, j, ch); this.set(x + w - 1, j, ch); }
    return this;
  };
  P.border = function (ch) { return this.frame(0, 0, this.w, this.h, ch); };
  P.hline = function (x1, x2, y, ch) { for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) this.set(i, y, ch); return this; };
  P.vline = function (x, y1, y2, ch) { for (let j = Math.min(y1, y2); j <= Math.max(y1, y2); j++) this.set(x, j, ch); return this; };
  /** Caminho em "L" passando pelos pontos (horizontal, depois vertical). */
  P.path = function (pts, ch) {
    for (let k = 1; k < pts.length; k++) {
      const [x1, y1] = pts[k - 1], [x2, y2] = pts[k];
      this.hline(x1, x2, y1, ch); this.vline(x2, y1, y2, ch);
    }
    return this;
  };
  P.ellipse = function (cx, cy, rx, ry, ch, only) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
      if (d <= 1 && (!only || only.includes(this.get(x, y)))) this.set(x, y, ch);
    }
    return this;
  };
  /** Marca células que a decoração não pode ocupar (raio r). */
  P.clear = function (x, y, r) {
    r = r === undefined ? 1 : r;
    for (let j = y - r; j <= y + r; j++) for (let i = x - r; i <= x + r; i++) this.keep.add(i + ',' + j);
    return this;
  };
  /** Espalha decoração com semente fixa, somente sobre os tiles "on". */
  P.scatter = function (list, seed, on, area) {
    const rnd = EN.util.seeded(seed);
    on = on || ['.'];
    const [ax, ay, aw, ah] = area || [0, 0, this.w, this.h];
    for (let y = ay; y < ay + ah; y++) for (let x = ax; x < ax + aw; x++) {
      const r = rnd();
      if (!on.includes(this.get(x, y)) || this.keep.has(x + ',' + y)) continue;
      let acc = 0;
      for (const [ch, p] of list) { acc += p; if (r < acc) { this.set(x, y, ch); break; } }
    }
    return this;
  };
  P.rows = function () { return this.g.map((r) => r.join('')); };

  return { Grid };
})();
