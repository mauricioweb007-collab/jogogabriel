/* =====================================================================
   scenes/city.js — CIDADE EM TRANSFORMAÇÃO (Fase 3-2): ação e construção
   em visão de cima compacta. 1) Quebra-cabeça de planejamento: decidir
   quais serviços cada bairro precisa (sem culpar os moradores — a cidade
   é que não estava preparada). 2) Ação: levar os recursos da Central até
   os bairros, desviando do trânsito. 3) A cidade se transforma (água,
   luz, ônibus, moradia). 4) Comparar paisagens "antes e depois" e tabela.
   Versão com mais desafio (pedido do usuário, set/2026): trânsito nas
   duas mãos com ônibus e caminhões, semáforo no cruzamento (atravesse
   quando os carros param), o trânsito acelera a cada entrega, cones de
   obra que bloqueiam a rua, batida faz o recurso CAIR (pegue de novo),
   entrega expressa com bônus, moedas e bicicleta turbo, pedestres e
   animação de obra em cada bairro atendido.
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
    const p = { x: 166, y: 94, dir: 'down', moving: false, stun: 0 }; // começa na calçada, fora da rua
    const got = {}; DIST.forEach((d) => { got[d.id] = []; });
    const cars = [
      { x: 0, y: 110, vx: 70, k: 'carro', w: 20 }, { x: 150, y: 110, vx: 70, k: 'onibus', w: 30 },
      { x: 300, y: 119, vx: -60, k: 'carro', w: 20 }, { x: 60, y: 119, vx: -60, k: 'caminhao', w: 26 },
      { x: 190, y: 0, vy: 55, vert: true, w: 10 }, { x: 201, y: 225, vy: -50, vert: true, w: 10 }
    ];
    const walkers = [0, 1, 2, 3].map((i) => ({ x: i * 110, y: i % 2 ? 132 : 100, v: (i % 2 ? -1 : 1) * (14 + i * 3), look: P.crowd()[i * 3] }));
    const coins = [], cones = [], anims = [];
    let carry = null, busy = false, finished = false, planned = false, q7 = false;
    let light = 0, deliveries = 0, dropped = null, express = 0, bike = null, turbo = 0, spawnT = 2, coneT = 4;
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
      anims.push({ d, res: carry, t: 0 }); deliveries++;
      if (express > 0) { ctx.addAction(8); if (GEO.gfx) GEO.gfx.pop(d.x + d.w / 2, d.y + 10, 'EXPRESSO! +bônus', '#7bff8f', 8); GG.audio.sfx('ok'); }
      express = 0;
      got[d.id].push(carry); carry = null; GG.audio.sfx('power'); E.fx.confetti(d.x + d.w / 2, d.y + d.h / 2, 24); ctx.addAction(12);
      if (GEO.gfx) { GEO.gfx.ring(d.x + d.w / 2, d.y + d.h / 2, '#ffd23f', 60); GEO.gfx.flash('#fff6c0', 0.2); }
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
      // semáforo: 4,5 s para a rua horizontal, 3,5 s para a vertical (1 s de amarelo)
      light = (light + dt) % 8;
      const hGreen = light < 4.5, hYellow = light >= 3.5 && light < 4.5, vYellow = light >= 7;
      const fast = 1 + Math.min(0.6, deliveries * 0.12);
      cars.forEach((c) => {
        if (c.vert) {
          const stopLine = c.vy > 0 ? 96 : 134, before = c.vy > 0 ? c.y + 18 <= stopLine && c.y + 18 > stopLine - 14 : c.y >= stopLine && c.y < stopLine + 14;
          if (!(hGreen && before)) c.y += c.vy * dt * fast;
          if (c.y > E.H + 20) c.y = -20; if (c.y < -30) c.y = E.H + 20;
        } else {
          const stopLine = c.vx > 0 ? 182 : 218, before = c.vx > 0 ? c.x + c.w <= stopLine && c.x + c.w > stopLine - 16 : c.x >= stopLine && c.x < stopLine + 16;
          if (!(!hGreen && before)) c.x += c.vx * dt * fast;
          if (c.x > E.W + 20) c.x = -40; if (c.x < -40) c.x = E.W + 20;
        }
      });
      walkers.forEach((w) => { w.x += w.v * dt; if (w.x > E.W + 10) w.x = -10; if (w.x < -10) w.x = E.W + 10; });
      anims.forEach((a) => { a.t += dt; if (GEO.gfx && a.t < 1.4 && Math.random() < dt * 10) GEO.gfx.puff(a.d.x + 10 + Math.random() * (a.d.w - 20), a.d.y + a.d.h - 10, 1); });
      for (let i = anims.length - 1; i >= 0; i--) if (anims[i].t > 3) anims.splice(i, 1);
      sc.hYellow = hYellow || vYellow; sc.hGreen = hGreen;
      if (busy || finished || !planned) return;
      ctx.tick(dt);
      if (turbo > 0) turbo -= dt;
      if (express > 0) express -= dt;
      const IN = GG.input; const sp = 90 * ctx.speed * (turbo > 0 ? 1.6 : 1);
      const px0 = p.x, py0 = p.y;
      if (p.stun > 0) p.stun -= dt;
      else {
        let ax = IN.axisX(), ay = IN.axisY(); if (ax && ay) { ax *= 0.72; ay *= 0.72; }
        p.moving = !!(ax || ay);
        if (ax < 0) p.dir = 'left'; else if (ax > 0) p.dir = 'right'; else if (ay < 0) p.dir = 'up'; else if (ay > 0) p.dir = 'down';
        p.x = U.clamp(p.x + ax * sp * dt, 6, E.W - 16); p.y = U.clamp(p.y + ay * sp * dt, 22, E.H - 12);
      }
      // cones de obra bloqueiam a passagem
      cones.forEach((cn) => { if (Math.abs(cn.x - (p.x + 5)) < 9 && Math.abs(cn.y - (p.y + 4)) < 8) { p.x = px0; p.y = py0; } });
      cars.forEach((c) => {
        const cw = c.vert ? 10 : c.w, ch = c.vert ? 18 : 10;
        if (Math.abs(c.x + cw / 2 - (p.x + 5)) < cw / 2 + 4 && Math.abs(c.y + ch / 2 - (p.y + 4)) < ch / 2 + 5 && p.stun <= 0) {
          p.stun = 0.7; GG.audio.sfx('hit'); E.shake(3, 0.2); if (GEO.gfx) GEO.gfx.flash('#ff4d4d', 0.25);
          p.y += c.vert ? 0 : (p.y < c.y ? -16 : 16); p.x += c.vert ? (p.x < c.x ? -16 : 16) : 0;
          if (carry) { dropped = { k: carry, x: U.clamp(p.x, 10, E.W - 20), y: U.clamp(p.y + (p.y < 116 ? -14 : 14), 24, E.H - 14), t: 0 }; carry = null; express = 0; GG.ui.toast('Batida! O recurso caiu — pegue de novo.', '', 2000); goal(); }
        }
      });
      if (dropped) { dropped.t += dt; if (!carry && Math.hypot(dropped.x - p.x, dropped.y - p.y) < 18) { carry = dropped.k; dropped = null; GG.audio.sfx('coin'); goal(); } }
      // moedas, cones e bicicleta turbo aparecem pela cidade
      spawnT -= dt; coneT -= dt;
      if (spawnT <= 0 && coins.length < 4) { spawnT = 2.5; const onH = Math.random() < 0.5; coins.push({ x: onH ? U.rand(20, 380) : U.rand(192, 206), y: onH ? U.rand(110, 124) : U.rand(24, 210), t: 0 }); }
      if (coneT <= 0) { coneT = 5.5; if (cones.length > 2) cones.shift(); const onH = Math.random() < 0.5; cones.push({ x: onH ? U.pick([60, 110, 290, 340]) : 200, y: onH ? 118 : U.pick([60, 170]), t: 0 }); }
      cones.forEach((cn) => { cn.t += dt; }); for (let i = cones.length - 1; i >= 0; i--) if (cones[i].t > 9) cones.splice(i, 1);
      if (!bike && Math.random() < dt * 0.05) bike = { x: U.pick([40, 360]), y: U.pick([60, 170]) };
      if (bike && Math.hypot(bike.x - p.x, bike.y - p.y) < 12) { bike = null; turbo = 6; GG.audio.sfx('boost'); GG.ui.toast('🚲 Bicicleta turbo! Mais rápido por 6 segundos.', 'ok', 1800); }
      for (let i = coins.length - 1; i >= 0; i--) { const cn = coins[i]; cn.t += dt; if (Math.hypot(cn.x - (p.x + 5), cn.y - (p.y + 4)) < 10) { coins.splice(i, 1); ctx.coin(cn.x, cn.y); ctx.addAction(1); } else if (cn.t > 12) coins.splice(i, 1); }
      if (ctx.trail && p.moving) C.trail(p.x + 5, p.y + 6);
      // Central de recursos: pega o próximo recurso necessário
      if (!carry && !dropped && Math.hypot(p.x - HUB.x, p.y - HUB.y) < 18) { const n = need(); if (n) { carry = n.n; express = 14; GG.audio.sfx('coin'); goal(); if (p.zone) p.zone = null; } }
      // Entrega só no momento em que ENTRA num bairro (antes repetia a cada quadro: no Centro a fala
      // da Gaia reabria sem parar e a fase travava; em bairro errado, avisos se acumulavam).
      const zone = [CENTRO].concat(DIST).find((d) => p.x > d.x && p.x < d.x + d.w && p.y > d.y && p.y < d.y + d.h) || null;
      if (zone !== p.zone) { p.zone = zone; if (zone && carry) deliver(zone); }
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
      // semáforo no cruzamento
      const lc = sc.hGreen ? (sc.hYellow ? '#ffd23f' : '#3ddc84') : '#ff4d4d', vc = !sc.hGreen ? (sc.hYellow ? '#ffd23f' : '#3ddc84') : '#ff4d4d';
      g.rect(176, 94, 6, 14, '#222'); g.circle(179, 98, 2, lc); g.rect(214, 128, 6, 14, '#222'); g.circle(217, 132, 2, lc);
      g.rect(214, 94, 14, 6, '#222'); g.circle(218, 97, 2, vc); g.rect(172, 134, 14, 6, '#222'); g.circle(182, 137, 2, vc);
      if (X) { X.glow(c, 179, 98, 6, lc, 0.8); X.glow(c, 218, 97, 6, vc, 0.8); }
      // faixas de pedestre
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 5; i++) { c.fillRect(170, 110 + i * 4, 8, 2); c.fillRect(222, 110 + i * 4, 8, 2); }
      walkers.forEach((w, i) => g.img(P.front(Object.assign({}, w.look, { frame: Math.floor(sc.t * 6 + i) % 2, dir: 'side' })), w.x, w.y - 12, { scale: 0.7, flip: w.v < 0 }));
      // obras em andamento (animação de construção)
      anims.forEach((a) => {
        const k = Math.min(1, a.t / 1.4), cx = a.d.x + a.d.w / 2, cy = a.d.y + a.d.h / 2;
        if (a.t < 1.5) { c.strokeStyle = '#c98b45'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const hx = a.d.x + 14 + i * (a.d.w - 28) / 3, top = a.d.y + a.d.h - 6 - k * 34; c.beginPath(); c.moveTo(hx, a.d.y + a.d.h - 6); c.lineTo(hx, top); c.stroke(); c.beginPath(); c.moveTo(hx - 6, top + 8); c.lineTo(hx + 6, top + 8); c.stroke(); } if (X) X.ilus(c, 'obra', cx, cy - 6 - Math.abs(Math.sin(a.t * 8)) * 4, 20); }
        else if (X) { for (let i = 0; i < 3; i++) X.ilus(c, 'coracao', cx - 20 + i * 20, cy - (a.t - 1.5) * 24 - i * 3, 9, { alpha: Math.max(0, 1 - (a.t - 1.5) / 1.5) }); if (RIL[a.res]) X.ilus(c, RIL[a.res], cx, cy - 8, 22, { glow: '#fff2a0' }); }
      });
      cones.forEach((cn) => { if (!(X && X.ilus(c, 'cone', cn.x, cn.y - 3, 12, { shadow: true }))) { g.rect(cn.x - 3, cn.y - 6, 6, 8, '#ff8a2a'); } });
      coins.forEach((cn) => { if (X) X.glow(c, cn.x, cn.y, 8, '#ffd23f', 0.6); g.spr('plat', Math.floor(sc.t * 6 + cn.x) % 4 === 0 ? 152 : 151, cn.x - 9, cn.y - 9); });
      if (bike && X) { X.glow(c, bike.x, bike.y, 12, '#7bff8f', 0.7); X.ilus(c, 'bicicleta', bike.x, bike.y + Math.sin(sc.t * 5) * 1.5, 16); }
      if (dropped) { const bl = Math.floor(sc.t * 6) % 2; if (X && RIL[dropped.k]) { X.glow(c, dropped.x + 5, dropped.y, 12, RES[dropped.k].c, 0.8); X.ilus(c, RIL[dropped.k], dropped.x + 5, dropped.y, 13, { alpha: bl ? 1 : 0.6 }); } else g.panel(dropped.x, dropped.y - 6, 12, 12, RES[dropped.k].c, '#15152a'); g.text('pegue!', dropped.x + 5, dropped.y + 8, { size: 4, color: '#fff', align: 'center' }); }
      // placas e necessidades
      C.sign(g, CENTRO.x + CENTRO.w / 2, CENTRO.y - 14, CENTRO.name, '#e9dcff');
      DIST.forEach((d) => {
        C.sign(g, d.x + d.w / 2, d.y - 14, d.name, d.needs.every((n) => got[d.id].includes(n)) ? '#d9ffd9' : '#fff8e6');
        d.needs.forEach((n, i) => { const done = got[d.id].includes(n); g.panel(d.x + d.w - 22 - i * 20, d.y + 2, 18, 14, done ? '#d9ffd9' : '#ffd0d0', '#15152a'); if (!(X && RIL[n] && X.ilus(c, RIL[n], d.x + d.w - 13 - i * 20, d.y + 9, 12, { gray: false }))) g.text(RES[n].icon, d.x + d.w - 13 - i * 20, d.y + 4, { size: 8, font: 'sans-serif', align: 'center', shadow: false }); if (!done) g.text('!', d.x + d.w - 6 - i * 20, d.y, { size: 6, color: '#e5484d', shadow: false }); });
      });
      // central
      g.panel(HUB.x - 14, HUB.y - 12, 28, 22, '#6d4c8f', '#15152a'); if (X) { X.glow(c, HUB.x, HUB.y - 2, 18, '#c8a8ff', 0.5); X.ilus(c, 'obra', HUB.x, HUB.y - 2, 18); } else g.text('📦', HUB.x, HUB.y - 8, { size: 9, font: 'sans-serif', align: 'center', shadow: false });
      C.sign(g, HUB.x, HUB.y + 12, 'Central');
      cars.forEach((cr) => { if (X && !cr.vert) { X.ilus(c, cr.k || 'carro', cr.x + cr.w / 2, cr.y + 4, cr.k === 'onibus' ? 26 : cr.k === 'caminhao' ? 22 : 18, { shadow: true, flip: (cr.vx || 1) > 0 }); return; } g.rect(cr.x, cr.y, cr.vert ? 10 : 20, cr.vert ? 18 : 10, cr.vert ? '#3f6ad8' : '#e5484d'); g.rect(cr.x + 3, cr.y + 2, cr.vert ? 4 : 6, 4, '#bfe8ff'); });
      if (turbo > 0 && X) { X.ilus(c, 'bicicleta', p.x + 5, p.y + 6, 14); if (Math.random() < 0.3) X.puff(p.x + 5, p.y + 8, 1); }
      if (!(p.stun > 0 && Math.floor(sc.t * 20) % 2)) g.img(C.gabrielTop(ctx.look, p.dir, p.moving, sc.t), p.x - 2, p.y - 12, { flip: p.dir === 'right' });
      if (express > 0 && carry) { g.rect(p.x - 6, p.y - 34, 22, 3, '#0a0c1c'); g.rect(p.x - 6, p.y - 34, 22 * express / 14, 3, express < 4 ? '#ff8f3d' : '#7bff8f'); }
      if (carry && X && RIL[carry]) { X.glow(c, p.x + 6, p.y - 21, 12, RES[carry].c, 0.8); X.ilus(c, RIL[carry], p.x + 6, p.y - 21 + Math.sin(sc.t * 6), 14); }
      else if (carry) { g.panel(p.x - 2, p.y - 28, 16, 14, RES[carry].c, '#15152a'); g.text(RES[carry].icon, p.x + 6, p.y - 26, { size: 8, font: 'sans-serif', align: 'center', shadow: false }); }
      if (ctx.arrow) { const n = need(); if (n) C.arrow(g, { x: 0, y: 0 }, carry ? n.d.x + n.d.w / 2 : HUB.x, carry ? n.d.y + n.d.h / 2 : HUB.y); }
    };
    sc.dbg = { busy: () => busy, deliverNext() { const n = need(); if (!n) return false; carry = n.n; deliver(n.d); return true; } };
    return sc;
  };
})();
