/* =====================================================================
   scenes/city.js — CIDADE EM TRANSFORMAÇÃO (Fase 3-2): ação e construção
   em visão de cima compacta. 1) Quebra-cabeça de planejamento: decidir
   quais serviços cada bairro precisa (sem culpar os moradores — a cidade
   é que não estava preparada). 2) Ação: levar os recursos da Central até
   os bairros, desviando do trânsito. 3) A cidade se transforma (água,
   luz, ônibus, moradia). 4) Comparar paisagens "antes e depois" e tabela.
   Questões GEO-C3-Q07 e GEO-C3-Q08.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const RES = {
    moradia: { icon: '🏠', t: 'Moradia digna', c: '#e8744f' }, saneamento: { icon: '🚰', t: 'Saneamento (água e esgoto)', c: '#3ec1ff' },
    transporte: { icon: '🚌', t: 'Transporte (ônibus)', c: '#f39c12' }, energia: { icon: '💡', t: 'Energia (luz)', c: '#ffd23f' }
  };
  const DIST = [
    { id: 'cortico', name: 'Cortiços do centro', x: 250, y: 30, w: 130, h: 70, needs: ['moradia', 'saneamento'], problem: 'moradias precárias; água, luz e saneamento precários' },
    { id: 'pn', name: 'Periferia Norte', x: 20, y: 130, w: 130, h: 70, needs: ['transporte', 'energia'], problem: 'sem linha de ônibus e sem luz' },
    { id: 'ps', name: 'Periferia Sul', x: 250, y: 130, w: 130, h: 70, needs: ['saneamento', 'energia'], problem: 'sem esgoto e sem luz' }
  ];
  const CENTRO = { name: 'Centro valorizado', x: 20, y: 30, w: 130, h: 70 };
  const HUB = { x: 188, y: 104 };

  GEO.scenes.city = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const p = { x: HUB.x, y: HUB.y + 14, dir: 'down', moving: false, stun: 0 };
    const got = {}; DIST.forEach((d) => { got[d.id] = []; });
    const cars = [{ x: 0, y: 112, vx: 70 }, { x: 300, y: 120, vx: -60 }, { x: 194, y: 0, vy: 55, vert: true }];
    let carry = null, busy = false, finished = false, planned = false, q7 = false;
    ctx.actionMax = 110;
    if (ctx.resume && ctx.resume.data && ctx.resume.data.got) { Object.assign(got, ctx.resume.data.got); planned = true; q7 = ctx.qDone('GEO-C3-Q07'); }
    const allDone = () => DIST.every((d) => d.needs.every((n) => got[d.id].includes(n)));
    const need = () => { for (const d of DIST) for (const n of d.needs) if (!got[d.id].includes(n)) return { d, n }; return null; };
    sc.begin = async function () {
      if (!ctx.resume) ctx.checkpoint({ got });
      if (!planned) await run(plan);
      goal();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function goal() { const n = need(); ctx.setGoal(n ? (carry ? 'Leve ' + RES[carry].icon + ' ' + RES[carry].t + ' ao bairro que precisa.' : 'Pegue um recurso na Central (centro do mapa).') : 'Cidade transformada!'); }
    async function plan() {
      await ctx.cards('segregar');
      let first = null;
      await GG.quiz.quick({
        prompt: 'Plano da cidade: ligue cada serviço ao bairro que precisa dele. (Leia os problemas de cada bairro.)', type: 'classify',
        bins: DIST.map((d) => ({ id: d.id, t: d.name + ' — ' + d.problem })),
        items: [{ t: '🏠 Moradia digna', bin: 'cortico' }, { t: '🚰 Água e esgoto', bin: 'cortico', fb: 'Os cortiços têm saneamento precário.' }, { t: '🚌 Linha de ônibus', bin: 'pn' }, { t: '💡 Rede de luz (Norte)', bin: 'pn' }, { t: '🚰 Rede de esgoto (Sul)', bin: 'ps' }, { t: '💡 Postes de luz (Sul)', bin: 'ps' }],
        recap: 'Leia o problema escrito em cada bairro e leve o serviço que falta.'
      }, { title: 'Quebra-cabeça: planejar a cidade', subject: 'Geografia', chips: ['Cidade'], doneLabel: 'Executar o plano ▶', onEvent: (k, v) => { if (k === 'attempt' && first === null) first = v.ok; } });
      GEO.campaign.recordCheck(!!first, 'Planejamento urbano'); ctx.learnPts += first ? 25 : 10; ctx.learnMax += 25;
      planned = true;
      await ctx.say('gaia', ['Plano pronto! Pegue os recursos na **Central** e leve aos bairros. Cuidado com o trânsito!']);
    }
    function deliver(d) {
      if (!carry) return;
      if (d === CENTRO) { run(() => ctx.say('gaia', ['O **centro** já tem esses serviços. Leve para os bairros que ainda **não têm** — serviços básicos são direitos de todos.'])); return; }
      if (!d.needs.includes(carry) || got[d.id].includes(carry)) { GG.ui.toast(d.name + ' não precisa disso agora. Veja os ícones ❗ de cada bairro.', '', 2400); return; }
      got[d.id].push(carry); carry = null; GG.audio.sfx('power'); E.fx.confetti(d.x + d.w / 2, d.y + d.h / 2, 24); ctx.addAction(12);
      ctx.checkpoint({ got });
      const cortDone = DIST[0].needs.every((n) => got.cortico.includes(n));
      if (cortDone && !q7) { q7 = true; ctx.fxX = d.x; ctx.fxY = d.y; run(() => ctx.q('GEO-C3-Q07')).then(goal); return; }
      if (allDone()) { run(async () => { await compare(); await ctx.q('GEO-C3-Q08'); finished = true; if (!ctx.damage) ctx.addAction(30); await ctx.finish(); }); return; }
      goal();
    }
    function compare() {
      return new Promise((res) => {
        const m = GG.ui.modal({ title: '🏙️ Antes e depois', wide: true, onClose: res });
        const snap = (after) => { const cv = P.mk(E.W, E.H, (x) => drawCity(x, after)); cv.className = 'pic'; cv.style.maxWidth = '420px'; return cv; };
        m.body.appendChild(U.el('div', { class: 'cmp' }, [U.el('div', null, [U.el('b', null, 'Antes'), snap(false)]), U.el('div', null, [U.el('b', null, 'Depois'), snap(true)])]));
        const rows = DIST.map((d) => U.el('tr', null, [U.el('td', null, d.name)].concat(Object.keys(RES).map((r) => U.el('td', null, d.needs.includes(r) ? '❌ → ✅' : '—')))));
        m.body.appendChild(U.el('table', { class: 'tbl' }, [U.el('tr', null, [U.el('th', null, 'Bairro')].concat(Object.values(RES).map((r) => U.el('th', null, r.icon + ' ' + r.t.split(' ')[0]))))].concat(rows)));
        m.body.appendChild(U.el('p', null, 'Moradia, saneamento, transporte e energia: serviços necessários que tornam a cidade melhor para todos.'));
        m.setActions([GG.ui.btn('Continuar ▶', 'pri', () => m.close())]);
      });
    }

    sc.update = function (dt) {
      sc.t += dt;
      cars.forEach((c) => { if (c.vert) { c.y += c.vy * dt; if (c.y > E.H + 20) c.y = -20; } else { c.x += c.vx * dt; if (c.x > E.W + 20) c.x = -30; if (c.x < -30) c.x = E.W + 20; } });
      if (busy || finished || !planned) return;
      ctx.tick(dt);
      const IN = GG.input; const sp = 90 * ctx.speed;
      if (p.stun > 0) p.stun -= dt;
      else {
        let ax = IN.axisX(), ay = IN.axisY(); if (ax && ay) { ax *= 0.72; ay *= 0.72; }
        p.moving = !!(ax || ay);
        if (ax < 0) p.dir = 'left'; else if (ax > 0) p.dir = 'right'; else if (ay < 0) p.dir = 'up'; else if (ay > 0) p.dir = 'down';
        p.x = U.clamp(p.x + ax * sp * dt, 6, E.W - 16); p.y = U.clamp(p.y + ay * sp * dt, 22, E.H - 12);
      }
      cars.forEach((c) => { if (Math.abs(c.x + 10 - (p.x + 5)) < 14 && Math.abs(c.y + 5 - (p.y + 4)) < 10 && p.stun <= 0) { p.stun = 0.6; GG.audio.sfx('hit'); p.y += c.vert ? 0 : (p.y < c.y ? -14 : 14); p.x += c.vert ? (p.x < c.x ? -14 : 14) : 0; } });
      if (ctx.trail && p.moving) C.trail(p.x + 5, p.y + 6);
      // Central de recursos: pega o próximo recurso necessário
      if (!carry && Math.hypot(p.x - HUB.x, p.y - HUB.y) < 18) { const n = need(); if (n) { carry = n.n; GG.audio.sfx('coin'); goal(); } }
      if (carry) { [CENTRO].concat(DIST).forEach((d) => { if (p.x > d.x && p.x < d.x + d.w && p.y > d.y && p.y < d.y + d.h) deliver(d); }); }
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };
    function drawCity(x, after) {
      const all = after === true, gotOf = (id, r) => all || (after !== false && got[id].includes(r));
      x.fillStyle = '#7fb86a'; x.fillRect(0, 0, E.W, E.H);
      x.fillStyle = '#4a4f5c'; x.fillRect(0, 108, E.W, 20); x.fillRect(188, 0, 24, E.H);
      x.fillStyle = '#e8e8e8'; for (let i = 0; i < E.W; i += 20) x.fillRect(i, 117, 10, 2); for (let i = 0; i < E.H; i += 20) x.fillRect(199, i, 2, 10);
      // centro valorizado
      for (let i = 0; i < 4; i++) { x.fillStyle = '#9aa7c7'; x.fillRect(CENTRO.x + 8 + i * 30, CENTRO.y + 6, 22, 58); x.fillStyle = '#ffe066'; for (let j = 0; j < 5; j++) x.fillRect(CENTRO.x + 12 + i * 30, CENTRO.y + 10 + j * 10, 4, 4), x.fillRect(CENTRO.x + 20 + i * 30, CENTRO.y + 10 + j * 10, 4, 4); }
      DIST.forEach((d) => {
        const hasH = gotOf(d.id, 'moradia') || !d.needs.includes('moradia');
        const n = d.id === 'cortico' ? 6 : 5;
        for (let i = 0; i < n; i++) {
          const hx = d.x + 6 + i * (d.w - 12) / n, hy = d.y + 18 + (i % 2) * 18, w = (d.w - 12) / n - 3;
          x.fillStyle = hasH ? '#e8b48a' : '#8a7a6a'; x.fillRect(hx, hy, w, 22);
          x.fillStyle = hasH ? '#c0392b' : '#5a4a3a'; x.fillRect(hx - 1, hy - 5, w + 2, 6);
          const lit = gotOf(d.id, 'energia') || !d.needs.includes('energia');
          x.fillStyle = lit ? '#ffe066' : '#2a2a33'; x.fillRect(hx + 3, hy + 6, 4, 4);
          if (!hasH) { x.fillStyle = '#5a4a3a'; x.fillRect(hx + 2, hy + 14, w - 4, 2); }
        }
        if (gotOf(d.id, 'saneamento') || !d.needs.includes('saneamento')) { x.fillStyle = '#3ec1ff'; x.fillRect(d.x + 4, d.y + d.h - 8, d.w - 8, 3); } else { x.fillStyle = '#6b5a3a'; x.fillRect(d.x + 4, d.y + d.h - 8, d.w - 8, 3); }
        if (gotOf(d.id, 'transporte')) { x.fillStyle = '#f39c12'; x.fillRect(d.x + d.w - 30, d.y + d.h - 18, 24, 9); x.fillStyle = '#fff'; x.fillRect(d.x + d.w - 27, d.y + d.h - 16, 4, 3); x.fillRect(d.x + d.w - 20, d.y + d.h - 16, 4, 3); }
        if (gotOf(d.id, 'energia')) { x.fillStyle = '#555'; x.fillRect(d.x + 2, d.y + 4, 2, 30); x.fillStyle = '#ffe066'; x.fillRect(d.x, d.y + 2, 6, 3); }
      });
    }
    const RIL = { moradia: 'casa', saneamento: 'agua', transporte: 'onibus', energia: 'lampada', agua: 'gota', luz: 'lampada' };
    sc.draw = function (g) {
      const c = g.ctx(), X = GEO.gfx && GEO.gfx.ready ? GEO.gfx : null;
      drawCity(c, null);
      if (X) {
        // sombras suaves dos quarteirões, árvores 3D e bairros prontos iluminados
        [[20, 20], [380, 30], [20, 205], [380, 205], [170, 30], [230, 200]].forEach(([tx, ty], i) => X.ilus(c, i % 2 ? 'arvore' : 'coqueiro', tx, ty + Math.sin(sc.t + i) * 0.5, 18, { shadow: true }));
        DIST.forEach((d) => { if (d.needs.every((n) => got[d.id].includes(n))) { X.glow(c, d.x + d.w / 2, d.y + d.h / 2, d.w * 0.6, '#fff2a0', 0.25 + 0.1 * Math.sin(sc.t * 2)); } });
      }
      // placas e necessidades
      C.sign(g, CENTRO.x + CENTRO.w / 2, CENTRO.y - 14, CENTRO.name, '#e9dcff');
      DIST.forEach((d) => {
        C.sign(g, d.x + d.w / 2, d.y - 14, d.name, d.needs.every((n) => got[d.id].includes(n)) ? '#d9ffd9' : '#fff8e6');
        d.needs.forEach((n, i) => { const done = got[d.id].includes(n); g.panel(d.x + d.w - 22 - i * 20, d.y + 2, 18, 14, done ? '#d9ffd9' : '#ffd0d0', '#15152a'); if (!(X && RIL[n] && X.ilus(c, RIL[n], d.x + d.w - 13 - i * 20, d.y + 9, 12, { gray: false }))) g.text(RES[n].icon, d.x + d.w - 13 - i * 20, d.y + 4, { size: 8, font: 'sans-serif', align: 'center', shadow: false }); if (!done) g.text('!', d.x + d.w - 6 - i * 20, d.y, { size: 6, color: '#e5484d', shadow: false }); });
      });
      // central
      g.panel(HUB.x - 14, HUB.y - 12, 28, 22, '#6d4c8f', '#15152a'); if (X) { X.glow(c, HUB.x, HUB.y - 2, 18, '#c8a8ff', 0.5); X.ilus(c, 'obra', HUB.x, HUB.y - 2, 18); } else g.text('📦', HUB.x, HUB.y - 8, { size: 9, font: 'sans-serif', align: 'center', shadow: false });
      C.sign(g, HUB.x, HUB.y + 12, 'Central');
      cars.forEach((cr) => { if (X && !cr.vert) { X.ilus(c, 'carro', cr.x + 10, cr.y + 4, 18, { shadow: true, flip: (cr.vx || cr.v || 1) > 0 }); return; } g.rect(cr.x, cr.y, cr.vert ? 10 : 20, cr.vert ? 18 : 10, cr.vert ? '#3f6ad8' : '#e5484d'); g.rect(cr.x + 3, cr.y + 2, cr.vert ? 4 : 6, 4, '#bfe8ff'); });
      if (!(p.stun > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielTop(ctx.look, p.dir, p.moving, sc.t), p.x - 2, p.y - 12, { flip: p.dir === 'right' });
      if (carry && X && RIL[carry]) { X.glow(c, p.x + 6, p.y - 21, 12, RES[carry].c, 0.8); X.ilus(c, RIL[carry], p.x + 6, p.y - 21 + Math.sin(sc.t * 6), 14); }
      else if (carry) { g.panel(p.x - 2, p.y - 28, 16, 14, RES[carry].c, '#15152a'); g.text(RES[carry].icon, p.x + 6, p.y - 26, { size: 8, font: 'sans-serif', align: 'center', shadow: false }); }
      if (ctx.arrow) { const n = need(); if (n) C.arrow(g, { x: 0, y: 0 }, carry ? n.d.x + n.d.w / 2 : HUB.x, carry ? n.d.y + n.d.h / 2 : HUB.y); }
    };
    sc.dbg = { busy: () => busy, deliverNext() { const n = need(); if (!n) return false; carry = n.n; deliver(n.d); return true; } };
    return sc;
  };
})();
