/* =====================================================================
   src/nexus/core.js — NÚCLEO DO GABRIEL NEXUS (namespace NX).
   Estado (perfil em cache), HUD, troca de telas (hub / áreas / jogo),
   efeitos (partículas), legendas de sons, músicas originais do Nexus,
   configurações (volumes separados, movimento reduzido, legendas…) e
   pequenos componentes (moeda, selo de raridade, cartão de Nexótico).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui;
  const NX = (window.NX = { root: '../../', areas: {}, cur: null });
  const $ = (id) => document.getElementById(id);

  /* ---------------- estado ---------------- */
  NX.reload = function () { NX.p = GG.profile.load(); return NX.p; };
  NX.test = () => GG.testMode.active();
  NX.has = (id) => GG.nexusEco.hasChar(NX.p, id);
  NX.owns = (id) => GG.nexusEco.owns(NX.p, id);
  NX.level = () => GG.FR.levelFor(NX.p.careerPoints);
  NX.power = (type) => GG.powers.has(NX.p, type);
  NX.txn = (tag) => tag + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  NX.name = () => NX.p.displayNameUppercase || (NX.test() ? 'TESTE' : 'EXPLORADOR');

  /* ---------------- músicas originais do Nexus (compostas para o projeto) ---------------- */
  GG.audio.addSong('nexus', { bpm: 108, wave: 'triangle', lead: 'E5 - G5 B5 - A5 G5 - E5 - D5 E5 - G5 - - C5 - E5 G5 - F#5 E5 - D5 - B4 D5 - E5 - -', bass: 'E2 - - - B2 - - - C3 - - - D3 - - - E2 - - - B2 - - - A2 - - - B2 - - -', drums: 'k - h - s - h h k - h - s - h -' });
  GG.audio.addSong('parque', { bpm: 96, wave: 'triangle', lead: 'C5 - E5 - G5 - E5 - F5 - A5 - G5 - - - E5 - G5 - C6 - B5 - A5 - G5 - E5 - - -', bass: 'C3 - - - G2 - - - F2 - - - G2 - - -', drums: 'k - - h s - - h' });
  GG.audio.addSong('fliperama', { bpm: 144, wave: 'square', lead: 'A4 C5 E5 A5 G5 E5 C5 E5 F4 A4 C5 F5 E5 C5 A4 C5 G4 B4 D5 G5 F5 D5 B4 D5 E5 - E5 - G#5 - B5 -', bass: 'A2 A2 A3 A2 F2 F2 F3 F2 G2 G2 G3 G2 E2 E2 E3 E2', drums: 'k h s h k k s h' });
  GG.audio.addSong('base', { bpm: 84, wave: 'sine', lead: 'G4 - B4 - D5 - B4 - C5 - E5 - D5 - - - B4 - D5 - G5 - F#5 - E5 - D5 - B4 - - -', bass: 'G2 - - - - - - - C3 - - - D3 - - -', drums: '- - h - - - h -' });

  /* ---------------- som + legenda ---------------- */
  const CAPS = { coin: 'moedas tilintando', win: 'fanfarra de vitória', ok: 'som de acerto', bad: 'som de erro', power: 'poder ativado', boost: 'turbo!', jump: 'pulo', hit: 'batida', shield: 'bolha protegeu', frag: 'brilho mágico', spring: 'boing!', click: null, check: 'aviso', bell: 'sino', boom: 'estouro de festa' };
  let capT = 0;
  NX.caption = function (text) {
    if (!text || !(NX.p && NX.p.settings.captions)) return;
    const c = $('nxCaption'); c.textContent = '🔊 ' + text; c.classList.add('on');
    clearTimeout(capT); capT = setTimeout(() => c.classList.remove('on'), 1600);
  };
  NX.sfx = function (name, cap) { GG.audio.sfx(name); const t = cap === undefined ? CAPS[name] : cap; if (t) NX.caption(t); };
  NX.jingle = function (ch) { if (!ch || !ch.sound) return; GG.audio.jingle(ch.sound.notes, ch.sound.wave, ch.sound.dur); NX.caption('som de ' + ch.name); };

  /* ---------------- componentes ---------------- */
  NX.coin = () => U.el('span', { class: 'nx-coin', 'aria-hidden': 'true' });
  NX.rar = function (id) {
    const r = GG.FR.rarityById(id) || { label: id, icon: '●', color: '#888' };
    return U.el('span', { class: 'rar ' + id, style: { '--rc': r.color }, title: 'Raridade: ' + r.label }, [r.icon + ' ', r.label]);
  };
  NX.worldName = (w) => { const m = GG.modules.get(w); return m ? m.franchise.world || m.franchise.title : w; };
  NX.worldIcon = (w) => { const m = GG.modules.get(w); return m ? m.franchise.icon || '✨' : '✨'; };
  /** Cartão de Nexótico (grade da coleção). */
  NX.charCard = function (ch, opts) {
    const o = opts || {}; const r = GG.FR.rarityById(ch.rarity);
    const owned = NX.has(ch.id);
    const info = !owned ? GG.unlocks.charInfo(NX.p, ch) : null;
    const img = GG.catalog.img(ch, owned && !o.still ? 'idle-' + ch.idle : '');
    const b = U.el('button', { type: 'button', class: 'nxc ' + ch.rarity + (owned ? '' : ' locked'), style: { '--rc': r.color }, 'aria-label': (owned ? ch.name : 'Bloqueado: ' + ch.name) + ', ' + r.label, onclick: () => (o.onClick ? o.onClick(ch) : NX.ficha(ch)) }, [
      U.el('div', { class: 'nxc-img' }, [img]),
      U.el('b', null, owned || o.showName !== false ? ch.name : '???'),
      NX.rar(ch.rarity),
      o.sub ? U.el('small', null, o.sub) : (!owned && info ? U.el('small', null, info.autos[0] ? info.autos[0].label : (info.price != null ? 'Na Loja' : '')) : null),
      NX.p.team.includes(ch.id) ? U.el('span', { class: 'team-dot', title: 'Na equipe' }, '⭐') : null
    ]);
    return b;
  };
  /** Ficha completa do Nexótico (todos os campos obrigatórios). */
  NX.ficha = function (ch) {
    const owned = NX.has(ch.id); const r = GG.FR.rarityById(ch.rarity);
    const m = UI.modal({ title: (owned ? '' : '🔒 ') + ch.name, wide: true });
    const info = GG.unlocks.charInfo(NX.p, ch);
    const art = U.el('div', { class: 'ficha-art' + (NX.power('zoom') ? ' zoomable' : ''), style: { '--rc': r.color } }, [GG.catalog.img(ch, owned ? 'idle-' + ch.idle : '')]);
    if (NX.power('zoom')) art.addEventListener('click', () => { art.classList.toggle('zoomed'); NX.sfx('click'); });
    const ways = [];
    info.autos.forEach((a) => ways.push(U.el('li', null, (a.ok ? '✅ ' : '⬜ ') + a.label + (a.need > 1 && !a.ok ? ' (' + Math.min(a.have, a.need) + '/' + a.need + ')' : ''))));
    if (info.price != null) ways.push(U.el('li', null, ['🛒 Loja: ', NX.coin(), ' ' + info.price]));
    if (info.fragmentCost != null) ways.push(U.el('li', null, '🧩 Troca por ' + info.fragmentCost + ' fragmentos'));
    if (info.capsule) ways.push(U.el('li', null, '🎁 Pode sair na Cápsula-surpresa'));
    const acc = NX.p.charAcc && NX.p.charAcc[ch.id] ? GG.nexusItem(NX.p.charAcc[ch.id]) : null;
    m.body.appendChild(U.el('div', { class: 'ficha' }, [
      art,
      U.el('div', null, [
        U.el('div', { class: 'row' }, [NX.rar(ch.rarity), U.el('span', { class: 'chip' }, NX.worldIcon(ch.world) + ' ' + NX.worldName(ch.world)), owned ? U.el('span', { class: 'chip ok' }, 'Na coleção') : U.el('span', { class: 'chip' }, 'Ainda não'), acc ? U.el('span', { class: 'chip' }, acc.icon + ' ' + acc.name) : null]),
        U.el('dl', null, [
          U.el('dt', null, 'Visual'), U.el('dd', null, ch.visual),
          U.el('dt', null, 'Jeito de ser'), U.el('dd', null, ch.personality),
          U.el('dt', null, 'Animações'), U.el('dd', null, 'Parado: ' + ch.idle + ' • Comemoração: ' + ch.celebrate),
          U.el('dt', null, 'Som'), U.el('dd', null, 'Melodia original curta (toque em “Ouvir”)')
        ]),
        U.el('div', { class: 'power' }, [U.el('b', null, '✨ ' + ch.power.name + ' — '), ch.power.description, U.el('div', { class: 'tip' }, 'Poder de conforto: só funciona no Nexus e nos jogos recreativos, com o Nexótico na sua equipe. Nunca mostra respostas.')]),
        U.el('h3', null, 'Como conseguir'),
        U.el('ul', null, ways)
      ])
    ]));
    const acts = [UI.btn('🔊 Ouvir', '', () => NX.jingle(ch))];
    if (owned) {
      acts.push(UI.btn('🎉 Comemorar', '', () => { const im = art.querySelector('img'); im.className = ''; void im.offsetWidth; im.className = 'cel-' + ch.celebrate; NX.jingle(ch); }));
      acts.push(UI.btn(NX.p.team.includes(ch.id) ? '⭐ Tirar da equipe' : '⭐ Pôr na equipe', 'pri', () => {
        const t = NX.p.team.slice(); const i = t.indexOf(ch.id);
        if (i >= 0) t.splice(i, 1); else { if (t.length >= 3) { UI.toast('A equipe tem até 3 Nexóticos. Tire um antes.', '', 2600); return; } t.push(ch.id); }
        GG.nexusEco.setTeam(t); NX.refresh(); m.close(); NX.toast(i >= 0 ? ch.name + ' saiu da equipe.' : ch.name + ' entrou na equipe! Poder: ' + ch.power.name);
      }));
    }
    acts.push(UI.btn('Fechar', 'ghost', () => m.close()));
    m.setActions(acts);
    return m;
  };
  NX.toast = (t, kind, ms) => UI.toast(t, kind || 'gold', ms || 2600);

  /* ---------------- HUD ---------------- */
  let lastCoins = null;
  NX.refresh = function () {
    NX.reload();
    const p = NX.p, lv = NX.level();
    $('nxName').textContent = NX.name();
    const t = p.equipped.title ? GG.nexusItem(p.equipped.title) : null;
    $('nxTitle').textContent = t ? t.name.replace(/^Título: /, '') : lv.name;
    $('nxLvl').textContent = 'Nv ' + lv.level;
    $('nxLvBar').style.width = lv.pct + '%';
    $('nxCareer').textContent = U.fmtInt(p.careerPoints);
    $('nxCoins').textContent = U.fmtInt(p.nexusCoins);
    if (lastCoins != null && lastCoins !== p.nexusCoins) { const c = $('nxCoins'); c.classList.remove('nx-coin-pop'); void c.offsetWidth; c.classList.add('nx-coin-pop'); }
    lastCoins = p.nexusCoins;
    $('nxFrags').textContent = p.fragments;
    $('nxMats').textContent = GG.nexusEco.materials(p);
    const av = $('nxAvatar'); av.style.backgroundImage = 'url("assets/gabriel.png")';
    const fr = p.equipped.frame ? GG.nexusItem(p.equipped.frame) : null;
    av.classList.toggle('rainbow', !!(fr && fr.color === 'rainbow'));
    av.style.setProperty('--fc', fr && fr.color !== 'rainbow' ? fr.color : '#cfd6e6');
    if (NX.hub && NX.hub.refresh) NX.hub.refresh();
  };

  /* ---------------- telas ---------------- */
  NX.showHub = function () {
    if (NX.cur && NX.cur.close) try { NX.cur.close(); } catch (e) { /* ok */ }
    NX.cur = null;
    $('nxArea').classList.add('hide'); $('nxGame').classList.add('hide'); $('nxHub').classList.remove('hide'); $('nxBack').classList.add('hide');
    NX.music();
    if (NX.hub) NX.hub.enter();
    NX.saveLastArea('praca');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  };
  /** Abre uma área (id registrado em NX.areas). */
  NX.open = function (id, arg) {
    const A = NX.areas[id]; if (!A) return;
    if (!NX.areaOpen(id)) { const lv = A.level || 1; NX.toast('🔒 ' + A.title + ' desperta no Nível ' + lv + ' do Nexus. Estude nas matérias para dar energia ao Nexus!', '', 3600); return; }
    if (NX.cur && NX.cur.close) try { NX.cur.close(); } catch (e) { /* ok */ }
    UI.closeAll();
    if (NX.hub) NX.hub.leave();
    $('nxHub').classList.add('hide'); $('nxGame').classList.add('hide');
    const area = $('nxArea'), bg = $('nxAreaBg'), body = $('nxAreaBody');
    area.classList.remove('hide'); $('nxBack').classList.remove('hide');
    body.innerHTML = ''; body.removeAttribute('style'); body.scrollTop = 0;
    bg.className = 'nx-area-bg' + (A.blur ? ' blur' : '');
    bg.src = A.bg || 'assets/cenarios/01_keyart_gabriel_nexus.jpg';
    NX.cur = { id, close: null };
    const ret = A.open(body, arg);
    if (ret && ret.close) NX.cur.close = ret.close;
    NX.music(A.music);
    NX.saveLastArea(id);
    NX.entryFx();
    history.replaceState(null, '', '#' + id);
  };
  NX.areaOpen = (id) => { const A = NX.areas[id]; return !!A && (NX.p.allContentUnlocked || NX.level().level >= (A.level || 1)); };
  NX.saveLastArea = function (id) { try { GG.profile.update((p) => { p.hub.lastArea = id; }); } catch (e) { /* ok */ } };
  NX.music = function (name) {
    const it = NX.p.equipped.music ? GG.nexusItem(NX.p.equipped.music) : null;
    GG.audio.music(name || (it && it.song) || 'nexus');
  };
  NX.areaTitle = (icon, title, sub) => U.el('div', { class: 'area-title' }, [U.el('h1', null, icon + ' ' + title), sub ? U.el('p', null, sub) : null]);

  /* ---------------- efeitos (partículas sobre a tela) ---------------- */
  let fxCv = null, fxCtx = null, parts = [], fxRun = false;
  function fxLoop() {
    if (!parts.length) { fxRun = false; fxCtx && fxCtx.clearRect(0, 0, fxCv.width, fxCv.height); return; }
    fxRun = true;
    const W = fxCv.width, H = fxCv.height; fxCtx.clearRect(0, 0, W, H);
    parts = parts.filter((q) => (q.t += 1 / 60) < q.life);
    parts.forEach((q) => { q.vy += q.g; q.x += q.vx; q.y += q.vy; fxCtx.globalAlpha = Math.max(0, 1 - q.t / q.life); if (q.txt) { fxCtx.font = q.size + 'px system-ui'; fxCtx.fillText(q.txt, q.x, q.y); } else { fxCtx.fillStyle = q.c; fxCtx.fillRect(q.x, q.y, q.size, q.size * 0.6); } });
    fxCtx.globalAlpha = 1;
    requestAnimationFrame(fxLoop);
  }
  function ensureFx() {
    if (!fxCv) { fxCv = U.el('canvas', { class: 'nx-fx', style: { position: 'fixed', zIndex: 95 }, 'aria-hidden': 'true' }); document.body.appendChild(fxCv); fxCtx = fxCv.getContext('2d'); }
    if (fxCv.width !== innerWidth || fxCv.height !== innerHeight) { fxCv.width = innerWidth; fxCv.height = innerHeight; }
  }
  NX.burst = function (x, y, kind, n) {
    if (NX.p && NX.p.settings.reduceMotion) return;
    ensureFx();
    const cols = ['#ff5d8f', '#ffd23f', '#3ddc84', '#3ec1ff', '#b07bff', '#fff'];
    const txt = { estrelas: '✨', bolhas: '🫧', folhas: '🍃', notas: '🎵', raio: '⚡', portal: '🌀' }[kind];
    for (let i = 0; i < (n || 40); i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, g: txt ? 0.05 : 0.18, t: 0, life: 1 + Math.random() * 0.8, c: cols[i % cols.length], size: txt ? 18 + Math.random() * 10 : 6 + Math.random() * 6, txt });
    }
    if (!fxRun) requestAnimationFrame(fxLoop);
  };
  NX.confetti = () => NX.burst(innerWidth / 2, innerHeight / 3, null, 90);
  NX.victoryFx = function () {
    const v = NX.p.equipped.victory ? GG.nexusItem(NX.p.equipped.victory) : null;
    if (v && v.fx === 'fogos') { for (let i = 0; i < 4; i++) setTimeout(() => NX.burst(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.2 + Math.random() * 0.3), null, 60), i * 300); }
    else NX.confetti();
  };
  NX.entryFx = function () {
    const e = NX.p.equipped.entry ? GG.nexusItem(NX.p.equipped.entry) : null;
    if (e) { NX.burst(innerWidth / 2, innerHeight / 2, e.fx, 30); NX.sfx(e.fx === 'raio' ? 'boom' : 'power', e.fx === 'raio' ? 'trovão de chegada' : 'portal de chegada'); }
  };

  /* ---------------- configurações ---------------- */
  NX.applySettings = function () {
    const s = NX.p.settings;
    UI.applyA11y(s);
    GG.input.setBindings(s.bindings || null);
  };
  NX.settings = function () {
    const cfg = Object.assign({}, NX.p.settings);
    UI.settings(cfg, (c) => { GG.profile.update((p) => { p.settings = Object.assign(p.settings, c); }); NX.reload(); }, {
      bottom: (b) => {
        b.appendChild(U.el('h3', null, 'Sons importantes'));
        const row = U.el('div', { class: 'set-row' }, [U.el('label', null, 'Legendas para sons importantes')]);
        const s = U.el('div', { class: 'seg' });
        [[true, 'Ligadas'], [false, 'Desligadas']].forEach(([v, t]) => { const bt = U.el('button', { type: 'button', class: cfg.captions === v ? 'on' : '', onclick: () => { cfg.captions = v; GG.profile.update((p) => { p.settings.captions = v; }); NX.reload(); U.$$('button', s).forEach((x) => x.classList.remove('on')); bt.classList.add('on'); } }, t); s.appendChild(bt); });
        row.appendChild(s); b.appendChild(row);
        b.appendChild(U.el('p', { class: 'tip' }, 'Sessões curtas (10–15 min) são ótimas. Você pode pausar e sair a qualquer momento: tudo fica salvo neste computador.'));
        b.appendChild(U.el('div', { class: 'row' }, [UI.btn('👪 Área dos Pais', 'ghost small', () => { location.href = NX.root + 'src/pais/pais.html'; })]));
      }
    });
  };
})();
