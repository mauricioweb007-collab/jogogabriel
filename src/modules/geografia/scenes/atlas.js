/* =====================================================================
   scenes/atlas.js — O ATLAS VIVO: mapa da campanha (3 páginas).
   Fases como pontos sobre o mapa do Brasil, trilha pontilhada,
   medalhas, cadeados, salas bônus e viagem rápida (tocar/clicar numa
   fase já liberada leva direto a ela). Teclado: ←/→ fases, ↑/↓ páginas,
   Espaço/Enter joga. Painel lateral (DOM) mostra detalhes e botões.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, D = GEO.data;
  const S = () => GEO.save.S;
  const MAPX = 96, MAPY = 14, MAPW = 206;
  const toC = (n) => ({ x: MAPX + n.x * MAPW / 613, y: MAPY + n.y * MAPW / 613 });

  GEO.scenes.atlas = function (opts) {
    const o = opts || {};
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let page = o.page || (GEO.campaign.nextStage() || D.stages[D.stages.length - 1]).ch;
    let sel = null, walker = null;
    const nodesOf = (ch) => D.stages.filter((s) => s.ch === ch).concat(D.bonus.filter((b) => b.ch === ch && S().unlockedBonus.includes(b.id)).map((b, i) => Object.assign({ node: { x: 110 + i * 40, y: 560 } }, b)));
    function pickDefault() {
      const list = nodesOf(page);
      const open = list.find((s) => GEO.campaign.stageState(s.id) === 'open');
      sel = open || list.filter((s) => GEO.campaign.stageState(s.id) !== 'locked').pop() || list[0];
      const c = toC(sel.node); walker = { x: c.x, y: c.y, tx: c.x, ty: c.y };
    }
    pickDefault();
    sc.select = function (st) {
      if (!st) return;
      sel = st; const c = toC(st.node); walker.tx = c.x; walker.ty = c.y; GG.audio.sfx('click');
      GEO.app.nodePanel(st);
    };
    sc.page = () => page;
    sc.setPage = function (p) {
      if (p < 1 || p > 3) return;
      if (p > 1 && !S().chaptersDone.includes(p - 1) && !D.stages.some((s) => s.ch === p && GEO.campaign.stageState(s.id) !== 'locked')) { GG.ui.toast('🔒 Conclua a Página ' + (p - 1) + ' do Atlas para liberar.'); return; }
      page = p; pickDefault(); GEO.app.nodePanel(sel); GEO.app.atlasTabs(page);
    };
    sc.init = function () { GEO.app.nodePanel(sel); GEO.app.atlasTabs(page); GG.audio.music('atlas'); };
    sc.update = function (dt) {
      sc.t += dt;
      walker.x += (walker.tx - walker.x) * Math.min(1, dt * 7); walker.y += (walker.ty - walker.y) * Math.min(1, dt * 7);
      const IN = GG.input, list = nodesOf(page), i = list.indexOf(sel);
      if (IN.pressed('right')) sc.select(list[Math.min(list.length - 1, i + 1)]);
      if (IN.pressed('left')) sc.select(list[Math.max(0, i - 1)]);
      if (IN.pressed('up')) sc.setPage(page - 1);
      if (IN.pressed('down')) sc.setPage(page + 1);
      if (IN.pressed('jump') || IN.pressed('act')) GEO.app.playNode(sel);
      if (IN.pressed('pause')) GEO.app.menu();
    };
    sc.click = function (lx, ly) {
      const list = nodesOf(page);
      const hit = list.find((s) => { const c = toC(s.node); return Math.hypot(c.x - lx, c.y - ly) < 14; });
      if (hit) { if (hit === sel) GEO.app.playNode(hit); else sc.select(hit); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), ch = D.chapters[page - 1];
      const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#1b2a5a'); gr.addColorStop(1, '#0f1733'); c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
      // ondas do mar
      for (let y = 20; y < E.H; y += 16) for (let x = ((y * 7) % 32) - 32 + (E.reduced ? 0 : (sc.t * 6) % 32); x < E.W; x += 32) { c.fillStyle = 'rgba(120,180,255,.12)'; c.fillRect(x, y, 10, 1); }
      // página do atlas (pergaminho)
      c.fillStyle = '#2b1d14'; c.fillRect(MAPX - 10, MAPY - 6, MAPW + 20, 218); c.fillStyle = '#f3e6c4'; c.fillRect(MAPX - 8, MAPY - 4, MAPW + 16, 214);
      const fill = (s) => { const base = { 1: ['#f8c77d', '#f6b04a'], 2: ['#f7a8c8', '#e87bb0'], 3: ['#9fd9f5', '#62bde8'] }[page]; return (s.cx + s.cy) % 2 < 1 ? base[0] : base[1]; };
      GG.maps.drawCanvas(c, MAPX, MAPY, MAPW, fill, 'rgba(90,60,30,.35)');
      g.text(ch.page.toUpperCase(), MAPX + MAPW / 2, MAPY + 2, { size: 6, color: '#6d4c2a', align: 'center', shadow: false });
      // trilha
      const list = nodesOf(page).filter((s) => !s.bonus);
      c.setLineDash([3, 3]); c.strokeStyle = '#6d4c2a'; c.lineWidth = 2; c.beginPath();
      list.forEach((s, i) => { const p = toC(s.node); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke(); c.setLineDash([]);
      // nós
      nodesOf(page).forEach((s) => {
        const p = toC(s.node), state = GEO.campaign.stageState(s.id), st = S().stages[s.id];
        const isSel = s === sel;
        const r = isSel ? 10 + Math.sin(sc.t * 5) : 9;
        c.fillStyle = '#15152a'; c.beginPath(); c.arc(p.x, p.y, r + 2, 0, Math.PI * 2); c.fill();
        c.fillStyle = state === 'locked' ? '#6b6b7a' : state === 'done' ? '#3ddc84' : s.bonus ? '#b07bff' : '#ffd23f'; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
        const icon = state === 'locked' ? '🔒' : { platform: '🏃', topdown: '🧭', shmup: '🚀', race: '🏁', boss: '👾', maze: '🌀', rhythm: '🥁', kitchen: '🍲', city: '🏙️', tower: '🗼' }[s.engine];
        g.text(icon, p.x, p.y - 6, { size: 10, align: 'center', font: 'sans-serif', shadow: false });
        if (st && st.best) g.text({ bronze: '🥉', prata: '🥈', ouro: '🥇', diamante: '💎' }[st.best.medal], p.x + 9, p.y + 3, { size: 8, font: 'sans-serif', shadow: false });
        if (isSel) C_label(g, p.x, p.y + 13, (s.bonus ? 'Bônus: ' : s.ch + '-' + s.n + ' ') + s.title);
      });
      // Gabriel e Gaia
      const moving = Math.hypot(walker.tx - walker.x, walker.ty - walker.y) > 1;
      g.img(P.front(Object.assign({}, GEO.eco.look(), { frame: moving ? Math.floor(sc.t * 8) % 2 : 0 })), walker.x - 7, walker.y - 30);
      g.img(P.gaia(Math.floor(sc.t * 2) % 2), walker.x + 8, walker.y - 40 + Math.sin(sc.t * 3) * 3);
      // painel esquerdo: capítulo
      g.panel(6, 16, 84, 120, 'rgba(20,24,60,.85)', '#3a4290');
      g.text('CAPÍTULO ' + page, 48, 22, { size: 6, color: ch.color, align: 'center' });
      g.wrap(ch.title, 11, 34, 76, { size: 6, lh: 9, color: '#fff' });
      const done = D.stages.filter((s) => s.ch === page && S().stages[s.id] && S().stages[s.id].done).length, tot = D.stages.filter((s) => s.ch === page).length;
      g.text(done + '/' + tot + ' fases', 48, 108, { size: 6, color: '#b9bde6', align: 'center' });
      g.rect(12, 120, 72, 6, '#0a0c1c'); g.rect(12, 120, 72 * done / tot, 6, '#3ddc84');
      g.text('↑↓ páginas', 48, 144, { size: 5, color: '#b9bde6', align: 'center' }); g.text('←→ fases', 48, 154, { size: 5, color: '#b9bde6', align: 'center' });
    };
    function C_label(g, x, y, t) { const w = Math.min(150, g.textW(t, 6) + 8); g.panel(x - w / 2, y, w, 12, '#fff8e6', '#15152a'); g.text(t, x, y + 3, { size: 6, color: '#2a2233', align: 'center', shadow: false, maxW: w - 4 }); }
    return sc;
  };
})();
