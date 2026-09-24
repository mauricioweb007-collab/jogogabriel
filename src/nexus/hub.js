/* =====================================================================
   src/nexus/hub.js — HUB 2.5D: a PRAÇA DOS MUNDOS.
   A arte da praça (02_cenario_praca_dos_mundos) é o mapa: os portais
   desenhados nela viram portais de verdade (Ciências, Geografia,
   Matemática e futuras matérias) e placas levam às áreas do Nexus.
   Gabriel anda por uma rede de caminhos (escala por profundidade), a
   equipe de Nexóticos segue atrás. Tudo fica a poucos segundos: clique
   num lugar, use a barra de áreas (1–9) ou o mapa rápido (M).
   Poderes do hub: Norte de Casa (bússola), Rota Amiga (caminho),
   Marcador de Mapa, Voo Direto, Fluxo Azul (dash na água), Lupa Curiosa
   (destaque), Bolso Extra (coleta) e Clima Maluco (clima/paleta).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui;
  const H = (NX.hub = {});
  const $ = (id) => document.getElementById(id);
  const IW = 1672, IH = 941;

  /* ---------------- rede de caminhos (coordenadas em % da imagem) ---------------- */
  const NODES = {
    ponte: [50, 90], sul: [50, 79], centro: [50, 67], e1: [40, 60], d1: [60, 60], e2: [35, 69], d2: [65, 71],
    ne: [42, 41], nd: [58, 41], nc: [50, 31], ce1: [35, 33], cien: [26, 31], gd1: [65, 33], geo: [74, 31],
    me1: [27, 67], mat: [19, 62], fd1: [74, 69], fut: [82, 63], pais: [90, 88]
  };
  const EDGES = [['ponte', 'sul'], ['sul', 'centro'], ['centro', 'e1', 'agua'], ['centro', 'd1', 'agua'], ['e1', 'e2'], ['d1', 'd2'], ['e1', 'ne'], ['d1', 'nd'], ['ne', 'nc'], ['nd', 'nc'], ['ne', 'ce1'], ['ce1', 'cien'], ['nd', 'gd1'], ['gd1', 'geo'], ['e2', 'me1'], ['me1', 'mat'], ['d2', 'fd1'], ['fd1', 'fut'], ['sul', 'e2'], ['sul', 'd2'], ['d2', 'pais']];
  const ADJ = {}; Object.keys(NODES).forEach((k) => { ADJ[k] = []; });
  EDGES.forEach(([a, b, w]) => { ADJ[a].push({ n: b, w }); ADJ[b].push({ n: a, w }); });
  function route(from, to) {
    const prev = { [from]: null }, q = [from];
    while (q.length) { const c = q.shift(); if (c === to) break; ADJ[c].forEach((e) => { if (!(e.n in prev)) { prev[e.n] = c; q.push(e.n); } }); }
    if (!(to in prev)) return [from];
    const path = []; let c = to; while (c) { path.unshift(c); c = prev[c]; } return path;
  }
  const isWater = (a, b) => EDGES.some((e) => e[2] === 'agua' && ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)));

  /* ---------------- lugares clicáveis ---------------- */
  H.SPOTS = [
    { id: 'p_ciencias', node: 'cien', at: [24, 21], sz: 78, icon: '🔬', label: 'Portal de Ciências', color: '#3ddc84', world: 'ciencias' },
    { id: 'p_geografia', node: 'geo', at: [75, 21], sz: 78, icon: '🌎', label: 'Portal de Geografia', color: '#3ec1ff', world: 'geografia' },
    { id: 'p_matematica', node: 'mat', at: [17, 56], sz: 74, icon: '📊', label: 'Portal de Matemática', color: '#ff5d8f', world: 'matematica' },
    { id: 'p_futuro', node: 'fut', at: [83, 57], sz: 70, icon: '✨', label: 'Mundos futuros', color: '#ffd23f', world: null },
    { id: 'coracao', node: 'centro', at: [50, 45], sz: 70, icon: '💠', label: 'Coração do Nexus', color: '#29e7ff', area: 'coracao' },
    { id: 'parque', node: 'ponte', at: [60, 81], sz: 60, icon: '🌳', label: 'Parque dos Nexóticos', color: '#3ddc84', area: 'parque' },
    { id: 'fliperama', node: 'e2', at: [33, 76], sz: 60, icon: '🕹️', label: 'Fliperama Multimundos', color: '#b07bff', area: 'fliperama' },
    { id: 'base', node: 'd2', at: [66, 79], sz: 60, icon: '🏠', label: 'Casa do Gabriel', color: '#ffb020', area: 'base' },
    { id: 'loja', node: 'ne', at: [39, 44], sz: 56, icon: '🛒', label: 'Loja Nexus', color: '#ffd23f', area: 'loja' },
    { id: 'oficina', node: 'nd', at: [61, 44], sz: 56, icon: '🎨', label: 'Oficina', color: '#ff5d8f', area: 'oficina' },
    { id: 'galeria', node: 'nc', at: [50, 24], sz: 56, icon: '🏆', label: 'Galeria das Conquistas', color: '#ffd23f', area: 'galeria' },
    { id: 'terminal', node: 'pais', at: [92, 90], sz: 42, icon: '👪', label: 'Terminal dos Pais', color: '#9aa4c8', area: 'terminal', small: true }
  ];
  /** Pontos de coleta decorativa (sorteados por dia). */
  const PICK_SPOTS = [[44, 83], [56, 83], [30, 62], [70, 64], [46, 36], [54, 36], [31, 36], [69, 36], [24, 70], [77, 74], [50, 72], [38, 72]];
  const nearestNode = (x, y) => Object.keys(NODES).reduce((best, k) => { const d = Math.hypot(NODES[k][0] - x, NODES[k][1] - y); return !best || d < best.d ? { k, d } : best; }, null).k;

  /* ---------------- estado ---------------- */
  let stage, stW, stH, camX = 0, camY = 0, scale = 1, raf = 0, active = false;
  let pos = { x: NODES.sul[0], y: NODES.sul[1] }, cur = 'sul', path = [], target = null, onArrive = null, flying = false;
  const trail = []; let gab, comps = [], tintCv, tintCtx, weatherParts = [], markerEl = null, compassEl = null, routeTo = null, markMode = false;
  let lastT = 0, hlT = 0, drag = null;

  H.depth = (y) => 0.5 + Math.max(0, Math.min(1, (y - 22) / 72)) * 0.72;

  function layout() {
    const W = innerWidth, Hh = innerHeight;
    scale = Math.max(W / IW, Hh / IH);
    stW = IW * scale; stH = IH * scale;
    stage.style.width = stW + 'px'; stage.style.height = stH + 'px';
    const fx = $('nxFx'); fx.width = W; fx.height = Hh;
    clampCam(); applyCam();
    placeActors();
  }
  function clampCam() { camX = Math.max(0, Math.min(stW - innerWidth, camX)); camY = Math.max(0, Math.min(stH - innerHeight, camY)); }
  function applyCam() { stage.style.transform = 'translate(' + (-camX) + 'px,' + (-camY) + 'px)'; }
  function follow(k) { const tx = pos.x / 100 * stW - innerWidth / 2, ty = pos.y / 100 * stH - innerHeight * 0.55; camX += (tx - camX) * (k || 0.08); camY += (ty - camY) * (k || 0.08); clampCam(); applyCam(); }

  /* ---------------- atores (Gabriel + equipe) ---------------- */
  function actor(src, cls, alt) {
    const d = U.el('div', { class: 'actor ' + (cls || '') }, [U.el('span', { class: 'shadow' }), U.el('img', { src, alt: alt || '' })]);
    $('nxActors').appendChild(d); return d;
  }
  function buildActors() {
    $('nxActors').innerHTML = ''; comps = [];
    gab = actor('assets/gabriel.png', 'gab', 'Gabriel');
    const p = NX.p, eq = p.equipped;
    [['hat', '-18%', 1.2], ['face', '12%', 0.7]].forEach(([slot, top, s]) => { const it = eq[slot] && GG.nexusItem(eq[slot]); if (it) gab.appendChild(U.el('span', { class: 'acc', style: { top, fontSize: s + 'em' } }, it.icon)); });
    const back = eq.back && GG.nexusItem(eq.back); if (back) gab.insertBefore(U.el('span', { class: 'acc', style: { top: '22%', fontSize: '2.2em', zIndex: -1, opacity: 0.9 } }, back.icon), gab.firstChild);
    GG.powers.team(p).forEach((ch) => { const a = actor(ch.assetUrl, 'comp', ch.name); a.dataset.idle = ch.idle; const acc = p.charAcc && p.charAcc[ch.id] && GG.nexusItem(p.charAcc[ch.id]); if (acc) a.appendChild(U.el('span', { class: 'acc', style: { top: '-12%' } }, acc.icon)); comps.push(a); });
    markerEl = U.el('div', { class: 'marker hide' }, '📍'); $('nxActors').appendChild(markerEl);
    compassEl = U.el('div', { class: 'compass hide', title: 'Norte de Casa' }, '🧭'); $('nxActors').appendChild(compassEl);
  }
  function placeAt(el, x, y, hFrac, flip) {
    const d = H.depth(y), h = stH * hFrac * d;
    el.style.width = (h * 0.72) + 'px'; el.style.left = (x / 100 * stW - h * 0.36) + 'px'; el.style.top = (y / 100 * stH - h) + 'px';
    el.style.zIndex = String(Math.round(y * 10));
    el.style.transform = flip ? 'scaleX(-1)' : '';
  }
  let facing = false;
  function placeActors() {
    if (!gab) return;
    placeAt(gab, pos.x, pos.y - (flying ? 6 : 0), 0.19, facing);
    comps.forEach((c, i) => {
      const t = trail[Math.min(trail.length - 1, (i + 1) * 9)] || { x: pos.x - (i + 1) * 3, y: pos.y + 1 };
      placeAt(c, t.x - (i % 2 ? -2.5 : 2.5), t.y + 0.5, 0.11, t.x > pos.x);
      c.classList.toggle('walk', !!target);
    });
    gab.classList.toggle('walk', !!target && !flying);
    const p = NX.p;
    if (p.hub.marker && markerEl) { markerEl.classList.remove('hide'); markerEl.style.left = p.hub.marker[0] + '%'; markerEl.style.top = p.hub.marker[1] + '%'; markerEl.style.zIndex = '999'; } else if (markerEl) markerEl.classList.add('hide');
    if (NX.power('compass_home') && compassEl) {
      const dest = nearestOpenSpot(); compassEl.classList.toggle('hide', !dest);
      if (dest) { const a = Math.atan2(dest.at[1] - pos.y, dest.at[0] - pos.x); compassEl.style.left = (pos.x / 100 * stW + Math.cos(a) * 60) + 'px'; compassEl.style.top = (pos.y / 100 * stH - stH * 0.1 + Math.sin(a) * 60) + 'px'; compassEl.style.transform = 'rotate(' + (a + Math.PI / 4) + 'rad)'; compassEl.style.zIndex = '998'; compassEl.title = 'Norte de Casa: ' + dest.label; }
    } else if (compassEl) compassEl.classList.add('hide');
  }
  function nearestOpenSpot() {
    return H.SPOTS.filter((s) => s.area && s.area !== 'terminal' && NX.areaOpen(s.area) && s.node !== cur).sort((a, b) => Math.hypot(a.at[0] - pos.x, a.at[1] - pos.y) - Math.hypot(b.at[0] - pos.x, b.at[1] - pos.y))[0] || null;
  }

  /* ---------------- movimento ---------------- */
  H.goTo = function (node, cb, opts) {
    opts = opts || {};
    if (NX.power('fast_travel') && opts.fast) { // Voo Direto (Atlas Alado)
      flying = true; NX.sfx('power', 'Voo Direto!'); NX.burst(innerWidth / 2, innerHeight / 2, 'estrelas', 20);
      path = [node]; target = NODES[node]; onArrive = cb; H.speed = 220; return;
    }
    path = route(cur, node); path.shift();
    H.speed = opts.fast ? 70 : 34;
    onArrive = cb; nextTarget();
    if (!path.length && !target) { cur = node; if (cb) cb(); }
  };
  function nextTarget() { const n = path.shift(); target = n ? NODES[n] : null; target && (target.id = n); }
  function step(dt) {
    if (!target) return;
    const nx = target[0], ny = target[1];
    let sp = H.speed;
    const nextId = target.id || path[0];
    if (!flying && NX.power('water_dash') && isWater(cur, nextId)) { sp *= 1 + GG.powers.sum(NX.p, 'water_dash', 'percent') / 100; if (Math.random() < 0.4) splash(); }
    const dx = nx - pos.x, dy = ny - pos.y, d = Math.hypot(dx, dy);
    const mv = sp * dt;
    if (dx) facing = dx < 0;
    if (d <= mv) {
      pos.x = nx; pos.y = ny; cur = target.id || nearestNode(nx, ny); nextTarget();
      if (!target) { flying = false; const cb = onArrive; onArrive = null; if (cb) cb(); }
    } else { pos.x += dx / d * mv; pos.y += dy / d * mv; }
    trail.unshift({ x: pos.x, y: pos.y }); if (trail.length > 40) trail.pop();
    trailFx();
  }
  let trailAcc = 0;
  function trailFx() {
    const it = NX.p.equipped.trail && GG.nexusItem(NX.p.equipped.trail); if (!it || NX.p.settings.reduceMotion) return;
    if ((trailAcc += 1) % 6) return;
    weatherParts.push({ x: pos.x / 100 * stW - camX, y: pos.y / 100 * stH - camY - 10, vx: (Math.random() - 0.5), vy: -0.6 - Math.random(), life: 1.2, t: 0, txt: { estrelas: '✨', bolhas: '🫧', folhas: '🍃', notas: '🎵' }[it.fx] });
  }
  function splash() { weatherParts.push({ x: pos.x / 100 * stW - camX + (Math.random() - 0.5) * 30, y: pos.y / 100 * stH - camY, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 2, g: 0.15, life: 0.7, t: 0, txt: '💧' }); }

  /* ---------------- clima (Clima Maluco) + vivacidade por nível ---------------- */
  const WEATHER = { sol: { tint: 'transparent', filter: '' }, chuva: { tint: 'rgba(40,70,140,.35)', filter: 'brightness(.85) saturate(.9)' }, neve: { tint: 'rgba(200,230,255,.35)', filter: 'brightness(1.05) saturate(.7)' }, aurora: { tint: 'rgba(80,0,160,.35)', filter: 'brightness(.7) saturate(1.3) hue-rotate(20deg)' }, 'arco-iris': { tint: 'rgba(255,200,240,.25)', filter: 'saturate(1.35)' } };
  function applyLook() {
    const p = NX.p, lv = NX.level().level;
    const w = WEATHER[NX.power('weather') ? p.hub.weather : 'sol'] || WEATHER.sol;
    const pal = p.equipped.palette && GG.nexusItem(p.equipped.palette);
    const wake = p.allContentUnlocked ? 1 : Math.min(1, 0.55 + lv * 0.05);
    $('nxHubImg').style.filter = [w.filter, pal ? pal.filter : '', 'saturate(' + wake + ')', lv <= 1 && !p.allContentUnlocked ? 'brightness(.9)' : ''].join(' ');
    $('nxWeatherTint').style.background = w.tint;
  }
  function weatherTick(dt) {
    const fx = $('nxFx'), c = fx.getContext('2d'); c.clearRect(0, 0, fx.width, fx.height);
    const p = NX.p; const mode = NX.power('weather') ? p.hub.weather : 'sol';
    const reduce = p.settings.reduceMotion;
    if (!reduce && (mode === 'chuva' || mode === 'neve') && weatherParts.filter((q) => q.w).length < 140) {
      for (let i = 0; i < 4; i++) weatherParts.push({ w: 1, x: Math.random() * fx.width, y: -10, vx: mode === 'chuva' ? -1 : (Math.random() - 0.5), vy: mode === 'chuva' ? 9 : 1.4, life: 4, t: 0, c: mode === 'chuva' ? 'rgba(180,210,255,.8)' : '#fff', s: mode === 'chuva' ? 2 : 4, rain: mode === 'chuva' });
    }
    // brilhos do nível: quanto maior o nível, mais faíscas no ar
    const lv = NX.level().level;
    if (!reduce && Math.random() < 0.02 * lv) weatherParts.push({ x: Math.random() * fx.width, y: fx.height * (0.2 + Math.random() * 0.6), vx: 0, vy: -0.3, life: 2, t: 0, txt: '✦', col: '#fff6b0', size: 10 + Math.random() * 8 });
    weatherParts = weatherParts.filter((q) => (q.t += dt) < q.life && q.y < fx.height + 20);
    weatherParts.forEach((q) => {
      q.vy += (q.g || 0); q.x += q.vx; q.y += q.vy;
      c.globalAlpha = Math.max(0, 1 - q.t / q.life);
      if (q.txt) { c.font = (q.size || 18) + 'px system-ui'; c.fillStyle = q.col || '#fff'; c.fillText(q.txt, q.x, q.y); }
      else if (q.rain) { c.strokeStyle = q.c; c.lineWidth = 2; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x + q.vx * 2, q.y + 12); c.stroke(); }
      else { c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y, q.s / 2, 0, 7); c.fill(); }
    });
    c.globalAlpha = 1;
    // Rota Amiga (Capimapa): pontilhado até o destino escolhido
    if (routeTo && NX.power('route_hint')) {
      const r = route(cur, routeTo); c.setLineDash([8, 10]); c.lineWidth = 5; c.strokeStyle = 'rgba(255,210,63,.95)'; c.beginPath();
      c.moveTo(pos.x / 100 * stW - camX, pos.y / 100 * stH - camY);
      r.forEach((n) => c.lineTo(NODES[n][0] / 100 * stW - camX, NODES[n][1] / 100 * stH - camY)); c.stroke(); c.setLineDash([]);
    }
  }

  /* ---------------- lugares, coleta e destaques ---------------- */
  function spotLocked(s) { return s.area ? !NX.areaOpen(s.area) : false; }
  function renderSpots() {
    const box = $('nxSpots'); box.innerHTML = '';
    H.SPOTS.forEach((s) => {
      const lock = spotLocked(s);
      const mod = s.world ? GG.modules.get(s.world) : null;
      const soon = s.world && (!mod || mod.franchise.comingSoon);
      const badge = s.area === 'loja' && NX.p.nexusCoins >= GG.FR.capsule.price ? '!' : s.area === 'parque' && NX.p.expedition && Date.now() >= NX.p.expedition.end ? '!' : null;
      const b = U.el('button', { type: 'button', class: 'spot' + (lock ? ' locked' : '') + (s.small ? ' small' : ''), style: { left: s.at[0] + '%', top: s.at[1] + '%', '--sc': s.color, '--sz': (s.sz * Math.max(0.6, scale)) + 'px' }, 'aria-label': s.label + (lock ? ' (bloqueado)' : '') + (soon && s.world ? ' (em breve)' : ''), 'data-spot': s.id }, [
        U.el('span', { class: 'spot-ring' }, lock ? '🔒' : s.icon),
        U.el('span', { class: 'spot-lbl' }, s.label + (soon && s.world ? ' • em breve' : '')),
        badge ? U.el('span', { class: 'spot-badge' }, badge) : null
      ]);
      b.addEventListener('click', (ev) => { ev.stopPropagation(); if (markMode) return; H.activate(s); });
      b.addEventListener('pointerenter', () => { routeTo = s.node; });
      b.addEventListener('pointerleave', () => { routeTo = null; });
      b.addEventListener('focus', () => { routeTo = s.node; });
      box.appendChild(b);
    });
    renderPickups();
  }
  function todaysPicks() {
    const day = new Date().toISOString().slice(0, 10); let h = 0; for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const out = []; const pool = PICK_SPOTS.slice();
    for (let i = 0; i < 7 && pool.length; i++) { h = (h * 1103515245 + 12345) >>> 0; out.push({ id: day + '-' + i, at: pool.splice(h % pool.length, 1)[0] }); }
    return out;
  }
  function renderPickups() {
    const box = $('nxSpots'); U.$$('.pickup', box).forEach((x) => x.remove());
    const bag = NX.p.hub.bag || {}; const picked = bag.day === new Date().toISOString().slice(0, 10) ? bag.ids || {} : {};
    const full = (bag.day === new Date().toISOString().slice(0, 10) ? bag.picked : 0) >= GG.nexusEco.bagSize(NX.p);
    if (full) return;
    todaysPicks().filter((k) => !picked[k.id]).forEach((k) => {
      const b = U.el('button', { type: 'button', class: 'pickup', style: { left: k.at[0] + '%', top: k.at[1] + '%', zIndex: String(Math.round(k.at[1] * 10)) }, 'aria-label': 'Cristal de decoração para coletar', 'data-pick': k.id }, '💎');
      b.addEventListener('click', (ev) => { ev.stopPropagation(); H.goTo(nearestNode(k.at[0], k.at[1]), () => collect(k, b)); });
      box.appendChild(b);
    });
  }
  function collect(k, el) {
    const r = GG.nexusEco.pickup(k.id);
    if (r.ok) { NX.sfx('coin', 'cristal coletado'); const bb = el.getBoundingClientRect(); NX.burst(bb.left + bb.width / 2, bb.top, 'estrelas', 14); NX.toast('💎 +1 Cristal de Decoração (use na Oficina)', 'ok', 2000); }
    else NX.toast(r.why || 'Não deu para coletar.', '', 2600);
    NX.refresh(); renderPickups();
  }
  /** Lupa Curiosa (Queijossauro): destaca brevemente um objeto interativo. */
  function highlightTick(dt) {
    if (!NX.power('highlight_interactive')) return;
    hlT += dt; if (hlT < 9) return; hlT = 0;
    const cands = U.$$('.pickup', $('nxSpots')).concat(U.$$('.spot:not(.locked)', $('nxSpots')));
    const el = cands[Math.floor(Math.random() * cands.length)]; if (!el) return;
    el.classList.add('hl'); setTimeout(() => el.classList.remove('hl'), GG.powers.sum(NX.p, 'highlight_interactive', 'seconds') * 1000 || 3000);
  }

  /** Ativa um lugar (anda até ele e abre). */
  H.activate = function (s, fast) {
    GG.audio.sfx('click');
    if (s.area && spotLocked(s)) { NX.open(s.area); return; }
    H.goTo(s.node, () => {
      if (s.world !== undefined && s.world !== false && !s.area) NX.areas.portal.show(s.world);
      else if (s.area) NX.open(s.area);
    }, { fast });
  };

  /* ---------------- ferramentas de poder ---------------- */
  function renderTools() {
    const box = $('nxHubTools'); box.innerHTML = '';
    const t = (icon, label, fn, on) => { const b = U.el('button', { type: 'button', class: 'icon-btn' + (on ? ' on' : ''), title: label, 'aria-label': label }, icon); b.addEventListener('click', fn); box.appendChild(b); };
    if (NX.power('map_marker')) t('📍', markMode ? 'Toque no mapa para marcar' : 'Marcador de Mapa (Crocodilo Cartógrafo)', () => { markMode = !markMode; NX.toast(markMode ? '📍 Toque em qualquer lugar do mapa para pôr seu marcador.' : 'Marcador guardado.', 'ok'); renderTools(); }, markMode);
    if (NX.power('map_marker') && NX.p.hub.marker) t('🎯', 'Ir até o marcador', () => { const m = NX.p.hub.marker; H.goTo(nearestNode(m[0], m[1]), null, { fast: true }); });
    if (NX.power('weather')) t('🌦️', 'Clima Maluco (Tempestade Totem)', () => { const modes = GG.powers.params(NX.p, 'weather').modes || ['sol']; const i = modes.indexOf(NX.p.hub.weather); const nw = modes[(i + 1) % modes.length]; GG.profile.update((p) => { p.hub.weather = nw; }); NX.reload(); weatherParts = []; applyLook(); NX.sfx('power', 'clima mudou: ' + nw); NX.toast('Clima: ' + nw); });
  }

  /* ---------------- teclado e arrasto ---------------- */
  const DIRS = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] };
  function onKey(ev) {
    if (!active || UI.blocking() || /INPUT|TEXTAREA|SELECT/.test((ev.target && ev.target.tagName) || '')) return;
    const d = DIRS[ev.code];
    if (d) {
      ev.preventDefault();
      const opts = ADJ[cur].map((e) => { const v = [NODES[e.n][0] - NODES[cur][0], NODES[e.n][1] - NODES[cur][1]]; const len = Math.hypot(v[0], v[1]) || 1; return { n: e.n, dot: (v[0] * d[0] + v[1] * d[1]) / len }; }).filter((o) => o.dot > 0.35).sort((a, b) => b.dot - a.dot);
      if (opts[0] && !target) H.goTo(opts[0].n);
      return;
    }
    if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'KeyE') {
      const s = H.SPOTS.find((x) => x.node === cur);
      if (s) { ev.preventDefault(); H.activate(s); }
    }
  }
  function onDown(ev) { if (!active) return; drag = { x: ev.clientX, y: ev.clientY, cx: camX, cy: camY, moved: false }; }
  function onMove(ev) { if (!drag) return; const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true; if (drag.moved) { camX = drag.cx - dx; camY = drag.cy - dy; clampCam(); applyCam(); } }
  function onUp(ev) {
    if (!drag) return; const d = drag; drag = null; if (d.moved) { H.userCam = Date.now(); return; }
    const r = stage.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100;
    if (markMode) { GG.profile.update((p) => { p.hub.marker = [Math.round(x), Math.round(y)]; }); NX.reload(); markMode = false; renderTools(); NX.sfx('check', 'marcador colocado'); return; }
    if (ev.target.closest && (ev.target.closest('.spot') || ev.target.closest('.pickup'))) return;
    H.goTo(nearestNode(x, y));
  }

  /* ---------------- ciclo ---------------- */
  function loop(t) {
    if (!active) return;
    const dt = Math.min(0.05, ((t - lastT) / 1000) || 0.016); lastT = t;
    if (!UI.blocking()) step(dt);
    if (target || !H.userCam || Date.now() - H.userCam > 2500) follow(target ? 0.12 : 0.04);
    placeActors(); weatherTick(dt); highlightTick(dt);
    raf = requestAnimationFrame(loop);
  }
  H.refresh = function () { if (!stage || !active) return; buildActors(); renderSpots(); renderTools(); applyLook(); placeActors(); };
  H.enter = function () {
    active = true; H.refresh(); layout();
    follow(1); lastT = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  };
  H.leave = function () { active = false; cancelAnimationFrame(raf); target = null; path = []; };
  H.init = function () {
    stage = $('nxStage');
    const hub = $('nxHub');
    hub.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', () => { if (active) { layout(); renderSpots(); } });
    const last = NX.p.hub.lastArea; const s = H.SPOTS.find((x) => x.id === last || x.area === last);
    if (s) { cur = s.node; pos = { x: NODES[s.node][0], y: NODES[s.node][1] }; }
  };
  H.current = () => cur;
  H.NODES = NODES; H.route = route;
})();
