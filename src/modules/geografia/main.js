/* =====================================================================
   main.js — aplicativo do módulo de Geografia (GEO.app).
   Início rápido (primeiro conteúdo em menos de 30 s), Atlas, HUD,
   painel da fase, modos de ritmo (Aventura completa / Estudo rápido /
   Revisão da prova), loja e mochila de Geografia, Caderno, troféus,
   Área do responsável (relatório exportável), configurações e final.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.engine, P = GG.pixel, D = GEO.data;
  const S = () => GEO.save.S;
  const A = (GEO.app = {});
  const BASE = '../../';
  let atlasScene = null, sessionStart = Date.now();

  /* ------------------------------------------------ inicialização */
  A.boot = async function () {
    E.init(document.getElementById('game'));
    await Promise.all([E.loadSheets(BASE + 'assets/shared/sprites/'), GEO.gfx ? GEO.gfx.load() : null, document.fonts ? document.fonts.ready.catch(() => null) : null]);
    E.resize();
    UI.portraits.gaia = () => P.url(P.gaiaPortrait(), 2);
    UI.portraits.geobot = () => P.url(P.geobotPortrait(), 2);
    UI.portraits.gabriel = () => P.url(P.front(GEO.eco.look()), 5);
    document.getElementById('game').addEventListener('pointerdown', (ev) => {
      if (E.scene && E.scene.click && !UI.blocking()) { const l = E.toLogical(ev.clientX, ev.clientY); E.scene.click(l.x, l.y); }
    });
    window.addEventListener('resize', () => setTimeout(E.resize, 50));
    document.getElementById('loading').remove();
    // tempo total de uso (só com a aba visível)
    setInterval(() => { if (S() && !document.hidden) { S().time.total += 5; if (Math.random() < 0.2) GEO.save.persist(); } }, 5000);
    // Integração com o Gabriel Nexus: replay do Fliperama e modo de teste dos pais (saves separados)
    if (GEO.mode.blocked) return;
    if (GEO.mode.isReplay()) { await A.replayStart(); return; }
    if (GEO.mode.isTest()) { A.testStart(); return; }
    if (GEO.save.load()) {
      applySettings();
      S().time.sessions++; S().lastSession = Date.now(); GEO.save.persist();
      if (location.hash === '#revisao' && GEO.review.available()) { A.showAtlas(); GEO.review.run(); return; }
      A.showAtlas();
      const nx = GEO.campaign.nextStage();
      UI.toast('Bem-vindo de volta, ' + S().name + '!' + (nx ? ' Próxima fase: ' + nx.title : ''), 'gold', 3000);
    } else {
      await A.firstRun();
    }
  };
  function applySettings() {
    const st = S().settings;
    UI.applyA11y(st);
    GG.input.setBindings(st.bindings);
    A.touch();
  }
  /** Primeira vez: nome → Gaia → ritmo → direto para a primeira fase (conteúdo em < 30 s). */
  A.firstRun = async function () {
    let suggested = 'Gabriel';
    try { const old = JSON.parse(localStorage.getItem('econexus_guardioes_save_v1') || 'null'); if (old && old.name) suggested = old.name; } catch (e) { /* leitura apenas */ }
    const name = await new Promise((res) => {
      const m = UI.modal({ title: '🌎 Geografia — Brasil em Movimento', cls: 'small', noClose: true });
      const inp = U.el('input', { type: 'text', value: suggested, maxlength: '24', 'aria-label': 'Seu nome' });
      m.body.appendChild(U.el('p', null, 'Qual é o seu nome de explorador?')); m.body.appendChild(inp);
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Este módulo tem save próprio: nada muda no jogo de Ciências.'));
      const go = () => { res(inp.value.trim() || 'Gabriel'); m.close(); };
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
      m.setActions([UI.btn('Começar ▶', 'pri', go)]);
      setTimeout(() => inp.select(), 50);
    });
    GEO.save.newGame(name); applySettings();
    E.start(GEO.scenes.studyRoom({ def: { title: 'Brasil em Movimento' } }));
    GG.audio.music('atlas');
    await UI.say('gaia', D.story.opening);
    const pace = await A.choosePace(true);
    S().settings.pace = pace; S().introDone = true; GEO.save.persist();
    if (pace === 'revisao') { S().settings.pace = 'aventura'; GEO.save.persist(); }
    GEO.stage.run('c1s1', S().settings.pace);
  };
  A.choosePace = function (first) {
    return new Promise((res) => {
      const m = UI.modal({ title: '🎚️ Como você quer jogar?', noClose: !!first, onClose: () => res(S().settings.pace) });
      const opt = (id, icon, t, d) => U.el('button', { type: 'button', class: 'pace-opt' + (S().settings.pace === id ? ' on' : ''), onclick: () => { S().settings.pace = id; GEO.save.persist(); res(id); m.close(); A.refreshHud(); } }, [U.el('span', { class: 'pace-ic' }, icon), U.el('b', null, t), U.el('span', null, d)]);
      m.body.appendChild(U.el('div', { class: 'pace-grid' }, [
        opt('aventura', '🎮', 'Aventura completa', 'Fases de ação, exploração, chefes e todas as explicações e questões.'),
        opt('rapido', '⚡', 'Estudo rápido', 'Menos transições: vai direto aos pontos de conteúdo, com as mesmas explicações e questões.'),
        first ? null : opt('revisao', '📝', 'Revisão da prova', 'Prioriza as questões em que você errou e o conteúdo principal.')
      ]));
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Você pode trocar a qualquer momento no Atlas.'));
    });
  };

  /* ------------------------------------------------ telas */
  A.showAtlas = function (page) {
    GG.engine.stop();
    document.getElementById('stageHud').classList.add('hide');
    document.body.classList.add('in-atlas'); document.body.classList.remove('in-stage');
    A.atlasHud();
    atlasScene = GEO.scenes.atlas({ page });
    E.start(atlasScene);
    A.touch();
  };
  A.showStage = function () {
    document.body.classList.remove('in-atlas'); document.body.classList.add('in-stage');
    document.getElementById('atlasHud').classList.add('hide'); document.getElementById('nodePanel').classList.add('hide');
    A.touch();
  };
  A.touch = function () {
    const t = document.getElementById('touch'); if (!S()) return;
    const mode = S().settings.touch;
    const show = (mode === 'on' || (mode === 'auto' && U.isTouch())) && document.body.classList.contains('in-stage');
    t.classList.toggle('hide', !show); document.body.classList.toggle('has-touch', show);
    if (show && !t.childElementCount) GG.input.buildTouch(t);
  };
  GEO.hud = { update: () => A.refreshHud() };
  A.refreshHud = function () {
    const h = document.getElementById('atlasHud'); if (!h || h.classList.contains('hide') || !S()) return;
    const lv = GEO.eco.level();
    U.$('#ahName', h).textContent = S().name;
    U.$('#ahLv', h).textContent = 'Nv ' + lv.lvl + ' • ' + lv.title;
    U.$('#ahXp', h).style.width = Math.round(lv.pct * 100) + '%';
    const cov = GEO.campaign.coverage();
    const chip = (sel, icon, emoji, v) => { const el = U.$(sel, h); if (el._v === String(v)) return; el._v = String(v); el.textContent = ''; if (GEO.gfx && GEO.gfx.ready) { el.appendChild(GEO.gfx.el(icon, 18)); el.appendChild(document.createTextNode(' ' + v)); } else el.textContent = emoji + ' ' + v; };
    chip('#ahCoins', 'moeda', '🪙', S().coins);
    chip('#ahFrag', 'mapa', '🗺️', S().fragments);
    chip('#ahCov', 'livro', '📘', cov.done + '/' + cov.total);
    U.$('#ahPace', h).textContent = { aventura: '🎮 Aventura', rapido: '⚡ Estudo rápido', revisao: '📝 Revisão' }[S().settings.pace];
    const fr = GEO.campaign.frame(); const av = U.$('#ahAv', h); av.style.boxShadow = fr ? '0 0 0 3px ' + D.frames.find((f) => f.id === fr).color : '';
  };
  A.atlasHud = function () {
    const h = document.getElementById('atlasHud'); h.classList.remove('hide'); h.innerHTML = '';
    const av = U.el('img', { id: 'ahAv', class: 'ah-av', alt: '', src: P.url(P.front(GEO.eco.look()), 4) });
    const ILB = { '🛒': 'cesta', '🎒': 'mochila', '📓': 'livros', '📝': 'lapis', '🏆': 'trofeu', '👪': 'abraco', '⚙️': 'bussola', '🏠': 'casa', '🎡': 'roda_gigante' };
    const bt = (icon, label, fn, cls) => U.el('button', { type: 'button', class: 'ah-btn' + (cls ? ' ' + cls : ''), title: label, 'aria-label': label, onclick: () => { GG.audio.sfx('click'); fn(); } }, [GEO.gfx && GEO.gfx.ready && ILB[icon] ? GEO.gfx.el(ILB[icon], 24) : U.el('span', null, icon), U.el('small', null, label)]);
    h.appendChild(U.el('div', { class: 'ah-left' }, [av, U.el('div', null, [U.el('b', { id: 'ahName' }), U.el('div', { id: 'ahLv', class: 'ah-lv' }), U.el('div', { class: 'bar ah-bar' }, U.el('i', { id: 'ahXp' }))]),
      U.el('span', { id: 'ahCoins', class: 'chip' }), U.el('span', { id: 'ahFrag', class: 'chip' }), U.el('span', { id: 'ahCov', class: 'chip', title: 'Questões do livro concluídas' })]));
    h.appendChild(U.el('div', { class: 'ah-btns' }, [
      U.el('button', { type: 'button', id: 'ahPace', class: 'btn small info', onclick: () => A.choosePace(false) }),
      GEO.parque ? bt('🎡', 'Parque', () => GEO.parque.open(), 'fun') : null,
      bt('🛒', 'Loja', A.shop), bt('🎒', 'Mochila', A.inventory), bt('📓', 'Caderno', A.notebook), bt('📝', 'Revisão', () => GEO.review.run()),
      bt('🏆', 'Troféus', A.trophies), bt('👪', 'Responsável', A.parent), bt('⚙️', 'Ajustes', A.settings), bt('🏠', 'Missões', A.toLauncher)
    ]));
    A.refreshHud();
  };
  A.atlasTabs = function (page) {
    const h = document.getElementById('atlasHud'); let tabs = U.$('.ah-tabs', h);
    if (!tabs) { tabs = U.el('div', { class: 'ah-tabs', role: 'tablist' }); h.appendChild(tabs); }
    tabs.innerHTML = '';
    D.chapters.forEach((c) => tabs.appendChild(U.el('button', { type: 'button', role: 'tab', class: 'ah-tab' + (c.n === page ? ' on' : ''), 'aria-selected': String(c.n === page), onclick: () => atlasScene && atlasScene.setPage(c.n) }, c.icon + ' ' + c.n + '. ' + c.title)));
  };
  /** Painel da fase selecionada no Atlas. */
  A.nodePanel = function (st) {
    const p = document.getElementById('nodePanel'); if (!st) return;
    p.classList.remove('hide'); p.innerHTML = '';
    const state = GEO.campaign.stageState(st.id), rec = S().stages[st.id];
    if (GEO.gfx && GEO.gfx.ready) { const hero = GEO.gfx.el(GEO.gfx.stageIcon(st.id), 80); if (state === 'locked') hero.style.filter = 'grayscale(1) brightness(.6)'; p.appendChild(U.el('div', { class: 'np-hero' }, hero)); }
    p.appendChild(U.el('div', { class: 'np-style' }, st.style));
    p.appendChild(U.el('h2', { class: 'np-title' }, (st.bonus ? '🎁 ' : st.ch + '-' + st.n + ' ') + st.title));
    if (!st.bonus) p.appendChild(U.el('p', { class: 'np-goal' }, '🎯 ' + st.goal));
    if (st.questions.length) p.appendChild(U.el('p', { class: 'np-q' }, '📘 ' + st.questions.length + ' questão(ões): ' + st.questions.map((id) => { const q = S().q[id]; return (q.done ? '✅' : '▫️') + id.replace('GEO-', ''); }).join(' ')));
    if (rec && rec.best) p.appendChild(U.el('p', { class: 'np-rec' }, 'Recorde: ' + rec.best.score + ' pts • ' + { bronze: '🥉 Bronze', prata: '🥈 Prata', ouro: '🥇 Ouro', diamante: '💎 Diamante' }[rec.best.medal] + (rec.bestTime ? ' • ⏱ ' + U.fmtTime(rec.bestTime) : '') + (rec.geobotWins ? ' • 🤖 venceu ' + rec.geobotWins + 'x' : '')));
    if (state === 'locked') { p.appendChild(U.el('p', { class: 'np-lock' }, st.bonus ? '🔒 Conquiste 3 medalhas de ouro neste capítulo.' : '🔒 Conclua a fase anterior para liberar.')); return; }
    const pace = S().settings.pace;
    const acts = U.el('div', { class: 'np-acts' });
    acts.appendChild(UI.btn(state === 'done' ? '🔁 Jogar de novo' : '▶ Jogar', 'go', () => A.playNode(st)));
    if (!st.bonus && pace !== 'rapido') acts.appendChild(UI.btn('⚡ Estudo rápido', 'small', () => GEO.stage.run(st.id, 'rapido')));
    if (!st.bonus && pace === 'rapido') acts.appendChild(UI.btn('🎮 Aventura', 'small', () => GEO.stage.run(st.id, 'aventura')));
    p.appendChild(acts);
    if (rec && rec.cp && !rec.cp.finished && rec.cp.data) p.appendChild(U.el('p', { class: 'tip' }, '🚩 Há um checkpoint salvo nesta fase.'));
  };
  A.playNode = function (st) {
    if (!st || UI.blocking()) return;
    if (GEO.campaign.stageState(st.id) === 'locked') { UI.toast('🔒 Ainda bloqueada.'); return; }
    const pace = S().settings.pace;
    GEO.stage.run(st.id, pace === 'revisao' ? 'aventura' : pace);
  };
  A.menu = function () {
    const m = UI.modal({ title: '☰ Menu', cls: 'small' });
    m.setActions([UI.btn('🛒 Loja', '', () => { m.close(); A.shop(); }), UI.btn('📓 Caderno', '', () => { m.close(); A.notebook(); }), UI.btn('⚙️ Ajustes', '', () => { m.close(); A.settings(); }), UI.btn('🏠 Missões', 'ghost', () => { m.close(); A.toLauncher(); })]);
  };
  /** Volta ao lançador (raiz do projeto: inicio.html). No replay, volta ao Fliperama do Nexus. */
  A.toLauncher = function () { GEO.save.persist(); if (GEO.mode.isReplay()) { GG.replay.back('../../../'); return; } location.href = '../../../inicio.html'; };

  /* ------------------------------------------------ Gabriel Nexus: replay e modo de teste */
  /** Replay recreativo (Fliperama): save temporário, fase direta, sem pontos de estudo. */
  A.replayStart = async function () {
    let real = null; try { real = JSON.parse(localStorage.getItem('ecoNexus.geografia.v1') || 'null'); } catch (e) { real = null; }
    GEO.save.newGame((real && real.name) || 'Gabriel');
    if (real && real.settings) S().settings = Object.assign(S().settings, real.settings, { pace: 'aventura' });
    S().introDone = true; GEO.save.persist(); applySettings();
    if (GG.testMode.active()) GG.testMode.banner('../../../');
    UI.toast('🕹️ Replay do Fliperama: vale recorde e medalha, não pontos de estudo.', 'gold', 3600);
    GEO.stage.run(GEO.mode.stage, 'aventura');
  };
  /** Modo de teste dos pais: sandbox com tudo liberado; fase ou questão direta. */
  A.testStart = function () {
    GG.testMode.banner('../../../');
    if (!GEO.save.load()) { GEO.save.newGame('TESTE'); S().introDone = true; GEO.save.persist(); }
    applySettings(); A.showAtlas();
    UI.toast('🧪 Modo de teste: todas as fases liberadas. Nada altera o save real.', 'gold', 3600);
    if (GEO.mode.stage) GEO.stage.run(GEO.mode.stage, 'aventura');
    else if (GEO.mode.question) A.testQuestion(GEO.mode.question);
    else if (GEO.parque && GEO.mode.minigame && GEO.parque.GAMES.some((g) => g.id === GEO.mode.minigame)) setTimeout(() => GEO.parque.play(GEO.mode.minigame), 300);
    else if (GEO.parque && GEO.mode.parque) setTimeout(() => GEO.parque.open(GEO.mode.parque === 'todos' ? null : +GEO.mode.parque), 300);
    else if (GEO.parque && GEO.mode.reward) setTimeout(() => A.arcadeUnlocked(GEO.mode.reward), 300);
    else if (GEO.parque && GEO.mode.roulette) setTimeout(() => { GEO.parque.giveSpin(); GEO.parque.roulette(); }, 300);
  };
  A.testQuestion = function (id) {
    const q = GEO.campaign.qById(id); if (!q) return;
    GG.quiz.run(q, { subject: 'Geografia', subjectIcon: '🌎', chips: ['Teste dos pais'], visual: GEO.visuals.render, mode: 'aventura' }).then((res) => {
      GEO.campaign.recordQ(res, { mode: 'teste' });
      UI.toast('Questão ' + id + ' registrada no SANDBOX (tentativas: ' + res.attempts + ').', 'ok', 3000);
      A.showAtlas();
    });
  };

  /* ------------------------------------------------ loja e mochila */
  A.shop = function () {
    const m = UI.modal({ title: '🛒 Loja do Cartógrafo (Geografia)', wide: true });
    function draw() {
      m.body.innerHTML = '';
      m.body.appendChild(U.el('p', { class: 'tip' }, '🪙 ' + S().coins + ' EcoMoedas de Geografia • Preços fixos • Nada aqui compra respostas ou pula conteúdo.'));
      const grid = U.el('div', { class: 'shop-grid' });
      D.items.filter((i) => !i.reward).forEach((it) => {
        const own = GEO.eco.owns(it.id);
        grid.appendChild(U.el('div', { class: 'shop-item' + (own ? ' own' : '') }, [U.el('div', { class: 'si-ic' }, it.icon), U.el('b', null, it.name), U.el('p', null, it.desc),
          own ? U.el('span', { class: 'chip' }, '✔ Na mochila') : UI.btn('🪙 ' + it.price, S().coins >= it.price ? 'pri small' : 'small', () => { const r = GEO.eco.buy(it.id); if (r.ok) { GG.audio.sfx('power'); UI.toast('Comprado: ' + it.name + '!', 'gold'); draw(); A.refreshHud(); } else UI.toast(r.msg); }, { disabled: S().coins >= it.price ? null : true })]));
      });
      m.body.appendChild(grid);
    }
    draw(); m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };
  A.inventory = function () {
    const m = UI.modal({ title: '🎒 Mochila', wide: true });
    function draw() {
      m.body.innerHTML = '';
      const inv = S().inv.map((id) => GEO.eco.item(id)).filter(Boolean);
      if (!inv.length) m.body.appendChild(U.el('p', null, 'Sua mochila está vazia. Ganhe EcoMoedas estudando e visite a Loja!'));
      const grid = U.el('div', { class: 'shop-grid' });
      inv.forEach((it) => {
        const on = S().equip[it.id] !== false;
        grid.appendChild(U.el('div', { class: 'shop-item own' }, [U.el('div', { class: 'si-ic' }, it.icon), U.el('b', null, it.name), U.el('p', null, it.desc), UI.btn(on ? '✔ Em uso' : 'Usar', on ? 'go small' : 'small', () => { GEO.eco.toggle(it.id); draw(); A.atlasHud(); })]));
      });
      m.body.appendChild(grid);
      const fr = S().flags.frames || [];
      m.body.appendChild(U.el('h3', null, 'Molduras (por desempenho)'));
      m.body.appendChild(U.el('ul', null, D.frames.map((f) => U.el('li', null, (fr.includes(f.id) ? '✅ ' : '🔒 ') + f.name + ' — ' + f.need))));
    }
    draw(); m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /* ------------------------------------------------ caderno */
  A.notebook = function () {
    const m = UI.modal({ title: '📓 Caderno de Geografia', wide: true });
    const tabsEl = U.el('div', { class: 'seg', role: 'tablist' }); const body = U.el('div');
    m.body.appendChild(tabsEl); m.body.appendChild(body);
    const tabs = [['res', 'Resumos'], ['glo', 'Glossário'], ['vis', 'Mapas e gráficos'], ['q', 'Minhas questões']];
    let cur = 'res';
    function draw() {
      tabsEl.innerHTML = ''; tabs.forEach(([id, t]) => tabsEl.appendChild(U.el('button', { type: 'button', class: cur === id ? 'on' : '', onclick: () => { cur = id; draw(); } }, t)));
      body.innerHTML = '';
      if (cur === 'res') D.chapters.forEach((c) => {
        const seen = D.stages.filter((s) => s.ch === c.n && S().stages[s.id] && S().stages[s.id].done);
        body.appendChild(U.el('h3', null, c.icon + ' Capítulo ' + c.n + ': ' + c.title));
        body.appendChild(U.el('p', null, c.summary));
        if (seen.length) { const qs = D.questions.filter((q) => q.chapter === c.n && S().q[q.id].done); body.appendChild(U.el('ul', null, qs.map((q) => U.el('li', { html: '<b>' + U.esc(q.title) + ':</b> ' + U.rich(q.why) })))); }
        else body.appendChild(U.el('p', { class: 'tip' }, 'Jogue as fases deste capítulo para preencher o resumo.'));
      });
      if (cur === 'glo') body.appendChild(U.el('dl', { class: 'glo' }, D.glossary.map((g) => [U.el('dt', null, g.t), U.el('dd', null, g.d)]).flat()));
      if (cur === 'vis') ['mapaIndigena', 'salvador', 'rotasImigracao', 'tabelaPop', 'graficoComposicao', 'tabelaRenda', 'mapaTerras', 'xilo'].forEach((v) => { const el = GEO.visuals.render(v); if (el) body.appendChild(U.el('div', { class: 'q-visual' }, el)); });
      if (cur === 'q') body.appendChild(U.el('table', { class: 'tbl' }, [U.el('tr', null, ['ID', 'Questão', 'Situação'].map((h) => U.el('th', null, h)))].concat(D.questions.map((q) => { const st = S().q[q.id]; return U.el('tr', null, [U.el('td', null, q.id), U.el('td', null, q.title), U.el('td', null, !st.done ? '—' : q.personal ? '💬 respondida' : st.tier === 1 ? '⭐⭐⭐' : st.tier === 2 ? '⭐⭐' : '⭐ (com ajuda)')]); }))));
    }
    draw(); m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };
  A.trophies = function () {
    const m = UI.modal({ title: '🏆 Troféus e recordes', wide: true });
    const b = m.body;
    b.appendChild(U.el('p', null, S().finalDone ? '🏆 Troféu “Guardião da Diversidade Brasileira” conquistado!' : '🏆 Troféu “Guardião da Diversidade Brasileira”: reúna as três páginas do Atlas.'));
    b.appendChild(U.el('p', null, '🤖 Corridas contra o GeoBot: ' + S().geobot.wins + ' vitória(s) em ' + S().geobot.races + ' corrida(s).'));
    b.appendChild(U.el('table', { class: 'tbl' }, [U.el('tr', null, ['Fase', 'Medalha', 'Recorde', 'Melhor tempo'].map((h) => U.el('th', null, h)))].concat(D.stages.concat(D.bonus).map((s) => { const r = S().stages[s.id]; return U.el('tr', null, [U.el('td', null, (s.bonus ? 'Bônus ' : s.ch + '-' + s.n + ' ') + s.title), U.el('td', null, r && r.best ? { bronze: '🥉', prata: '🥈', ouro: '🥇', diamante: '💎' }[r.best.medal] : '—'), U.el('td', null, r && r.best ? r.best.score + ' pts' : '—'), U.el('td', null, r && r.bestTime ? U.fmtTime(r.bestTime) : '—')]); }))));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /* ------------------------------------------------ configurações */
  A.settings = function () {
    const st = S().settings;
    UI.settings(st, () => { GEO.save.persist(); A.touch(); }, {
      top: (b) => { b.appendChild(U.el('div', { class: 'set-row' }, [U.el('label', null, 'Ritmo do jogo'), UI.btn({ aventura: '🎮 Aventura completa', rapido: '⚡ Estudo rápido', revisao: '📝 Revisão da prova' }[st.pace] + ' — trocar', 'small', () => A.choosePace(false))])); },
      bottom: (b) => {
        b.appendChild(U.el('h3', null, 'Save de Geografia'));
        b.appendChild(U.el('p', { class: 'tip' }, 'Apagar aqui reinicia só Geografia. O save de Ciências não é tocado.'));
        b.appendChild(UI.btn('🗑️ Reiniciar Geografia', 'ghost small', async () => { if (await UI.gate('Confirmar reinício')) { if (await UI.confirm('Apagar todo o progresso de GEOGRAFIA? (Ciências não será afetado)', 'Apagar', 'Cancelar')) { GEO.save.reset(); location.reload(); } } }));
      }
    });
  };

  /* ------------------------------------------------ área do responsável */
  A.report = function () {
    const s = S(), cov = GEO.campaign.coverage();
    const byCh = D.chapters.map((c) => { const st = D.stages.filter((x) => x.ch === c.n); const done = st.filter((x) => s.stages[x.id] && s.stages[x.id].done).length; const qs = D.questions.filter((q) => q.chapter === c.n); return { ch: c.n, title: c.title, stages: done + '/' + st.length, questions: qs.filter((q) => s.q[q.id].done).length + '/' + qs.length }; });
    const first = D.questions.filter((q) => s.q[q.id].done && s.q[q.id].first && !q.personal).length;
    const helped = D.questions.filter((q) => s.q[q.id].guided || s.q[q.id].tier === 3);
    const attempts = D.questions.reduce((a, q) => a + s.q[q.id].attempts, 0);
    const medals = {}; Object.values(s.stages).forEach((st) => { if (st.best) medals[st.best.medal] = (medals[st.best.medal] || 0) + 1; });
    const quick = s.quickLog, review = s.reviewLog;
    const weak = GEO.campaign.weakConcepts();
    const recs = [];
    helped.slice(0, 5).forEach((q) => recs.push('Revisar ' + q.id + ' (' + q.concept + ')'));
    weak.slice(0, 3).forEach((w) => recs.push('Reforçar o conceito: ' + w.concept));
    if (cov.missing.length) recs.push('Ainda faltam ' + cov.missing.length + ' questões da campanha.');
    if (!recs.length) recs.push('Ótimo desempenho! Faça uma rodada da Revisão da Prova na véspera.');
    return {
      modulo: 'Geografia - Brasil em Movimento (geografia_2026_09)', aluno: s.name, gerado: new Date().toLocaleString('pt-BR'),
      progressoTotal: Math.round(cov.done / cov.total * 100) + '%', porCapitulo: byCh, cobertura: cov.done + '/' + cov.total, faltando: cov.missing,
      acertosDePrimeira: first, tentativas: attempts, corrigidasComAjuda: helped.map((q) => q.id), conceitosComDificuldade: weak,
      tempoEstudo: U.fmtDur(s.time.study), tempoAcao: U.fmtDur(s.time.action), tempoTotal: U.fmtDur(s.time.total), sessoes: s.time.sessions,
      estudoRapido: quick.map((x) => ({ fase: x.stage, pontos: x.pts + '/' + x.max, data: new Date(x.at).toLocaleDateString('pt-BR') })),
      revisao: review.map((x) => ({ itens: x.n, acertosDePrimeira: x.ok, data: new Date(x.at).toLocaleDateString('pt-BR') })),
      medalhas: medals, geobot: { vitorias: s.geobot.wins, corridas: s.geobot.races, recordes: D.stages.filter((x) => s.stages[x.id] && s.stages[x.id].geobotBest != null).map((x) => x.title + ': ' + U.fmtTime(s.stages[x.id].geobotBest)) },
      moedasGanhas: s.earned, moedasAtuais: s.coins, ultimaSessao: s.lastSession ? new Date(s.lastSession).toLocaleString('pt-BR') : '—',
      recomendacao: recs,
      questoes: D.questions.map((q) => { const st = s.q[q.id]; return { id: q.id, capitulo: q.chapter, fase: q.stage, conceito: q.concept, concluida: st.done, modo: st.doneIn, tentativas: st.attempts, acertoDePrimeira: st.first, comAjuda: st.guided, nivel: st.tier, revisaoOk: st.reviewOk, revisaoErro: st.reviewWrong, pessoal: !!q.personal }; })
    };
  };
  A.parent = async function () {
    if (!(await UI.gate())) return;
    const r = A.report();
    const m = UI.modal({ title: '👪 Área do responsável — Geografia', wide: true });
    const b = m.body;
    b.appendChild(U.el('p', { class: 'tip' }, 'Resultados SOMENTE do módulo de Geografia. Dados ficam neste aparelho; nada é enviado. Respostas de perguntas pessoais não são guardadas (só se foram respondidas).'));
    const kv = (k, v) => U.el('tr', null, [U.el('td', null, k), U.el('td', null, String(v))]);
    b.appendChild(U.el('table', { class: 'tbl' }, [kv('Aluno', r.aluno), kv('Progresso total', r.progressoTotal), kv('Cobertura das 45 questões', r.cobertura), kv('Acertos de primeira', r.acertosDePrimeira), kv('Tentativas', r.tentativas), kv('Corrigidas com ajuda', r.corrigidasComAjuda.length), kv('Tempo de estudo / ação / total', r.tempoEstudo + ' / ' + r.tempoAcao + ' / ' + r.tempoTotal), kv('Medalhas', Object.entries(r.medalhas).map(([k, v]) => k + ': ' + v).join(', ') || '—'), kv('GeoBot', r.geobot.vitorias + ' vitória(s) em ' + r.geobot.corridas + ' corrida(s)'), kv('EcoMoedas ganhas (Geografia)', r.moedasGanhas), kv('Última sessão', r.ultimaSessao)]));
    b.appendChild(U.el('h3', null, 'Por capítulo'));
    b.appendChild(U.el('table', { class: 'tbl' }, [U.el('tr', null, ['Capítulo', 'Fases', 'Questões'].map((h) => U.el('th', null, h)))].concat(r.porCapitulo.map((c) => U.el('tr', null, [U.el('td', null, c.ch + '. ' + c.title), U.el('td', null, c.stages), U.el('td', null, c.questions)])))));
    b.appendChild(U.el('h3', null, 'Recomendação automática de revisão'));
    b.appendChild(U.el('ul', null, r.recomendacao.map((x) => U.el('li', null, x))));
    b.appendChild(U.el('h3', null, 'Estudo rápido e revisão'));
    b.appendChild(U.el('p', null, 'Estudo rápido: ' + (r.estudoRapido.map((x) => x.fase + ' (' + x.pontos + ')').join(', ') || '—') + ' • Revisões: ' + (r.revisao.map((x) => x.acertosDePrimeira + '/' + x.itens).join(', ') || '—')));
    b.appendChild(U.el('h3', null, 'As 45 questões'));
    b.appendChild(U.el('table', { class: 'tbl' }, [U.el('tr', null, ['ID', 'Fase', 'Conceito', 'Status', 'Tent.', '1ª', 'Ajuda'].map((h) => U.el('th', null, h)))].concat(r.questoes.map((q) => U.el('tr', null, [U.el('td', null, q.id), U.el('td', null, q.fase), U.el('td', null, q.conceito), U.el('td', null, q.concluida ? '✅' : '—'), U.el('td', null, String(q.tentativas)), U.el('td', null, q.acertoDePrimeira ? '✔' : ''), U.el('td', null, q.comAjuda ? '✔' : '')])))));
    m.setActions([UI.btn('⬇️ Exportar .txt', '', () => U.download('relatorio-geografia-' + U.today() + '.txt', '﻿' + A.reportTxt(r))), UI.btn('⬇️ Exportar .json', '', () => U.download('relatorio-geografia-' + U.today() + '.json', JSON.stringify(r, null, 2), 'application/json')), UI.btn('Fechar', 'pri', () => m.close())]);
  };
  A.reportTxt = function (r) {
    const L = [];
    L.push('RELATÓRIO — ' + r.modulo, 'Aluno: ' + r.aluno, 'Gerado em: ' + r.gerado, '');
    L.push('Progresso total: ' + r.progressoTotal, 'Cobertura das questões: ' + r.cobertura, 'Acertos de primeira: ' + r.acertosDePrimeira, 'Tentativas: ' + r.tentativas, 'Corrigidas com ajuda: ' + (r.corrigidasComAjuda.join(', ') || '—'));
    L.push('Tempo de estudo: ' + r.tempoEstudo + ' | ação: ' + r.tempoAcao + ' | total: ' + r.tempoTotal + ' | sessões: ' + r.sessoes, '');
    L.push('POR CAPÍTULO'); r.porCapitulo.forEach((c) => L.push('  ' + c.ch + '. ' + c.title + ' — fases ' + c.stages + ', questões ' + c.questions));
    L.push('', 'CONCEITOS COM DIFICULDADE'); (r.conceitosComDificuldade.length ? r.conceitosComDificuldade : [{ concept: '—', ok: 0, wrong: 0 }]).forEach((w) => L.push('  ' + w.concept + ' (acertos ' + w.ok + ', dificuldades ' + w.wrong + ')'));
    L.push('', 'MEDALHAS: ' + (Object.entries(r.medalhas).map(([k, v]) => k + ' ' + v).join(', ') || '—'), 'GEOBOT: ' + r.geobot.vitorias + ' vitória(s) em ' + r.geobot.corridas + ' corrida(s). ' + r.geobot.recordes.join('; '));
    L.push('EcoMoedas ganhas em Geografia: ' + r.moedasGanhas, 'Última sessão: ' + r.ultimaSessao, '');
    L.push('RECOMENDAÇÃO'); r.recomendacao.forEach((x) => L.push('  - ' + x));
    L.push('', 'QUESTÕES'); r.questoes.forEach((q) => L.push('  ' + q.id + ' [' + (q.concluida ? 'OK' : '--') + '] tentativas ' + q.tentativas + (q.acertoDePrimeira ? ' • 1ª' : '') + (q.comAjuda ? ' • com ajuda' : '') + ' — ' + q.conceito));
    return L.join('\r\n');
  };

  /* ------------------------------------------------ capítulos e final */
  A.chapterComplete = async function (n) {
    GG.audio.music('vitoria');
    await UI.say('gaia', D.story.chapterDone[n]);
    if (n === 3) await A.final();
    await A.arcadeUnlocked(n);
  };
  /** Recompensa depois do chefe: Arcade do Mundo liberado (3 minijogos só de diversão). */
  A.arcadeUnlocked = function (n) {
    const list = GEO.parque && GEO.parque.worldGames ? GEO.parque.worldGames(n) : [];
    if (!list.length || (GEO.mode && GEO.mode.isReplay && GEO.mode.isReplay())) return Promise.resolve();
    return new Promise((res) => {
      GEO.parque.giveTicket(n);
      const m = UI.modal({ title: '🕹️ Arcade do Mundo ' + n + ' liberado!', wide: true, onClose: res });
      m.body.appendChild(U.el('p', null, 'Você venceu o chefe! Recompensa: 🎟️ 1 BILHETE GRÁTIS — escolha 1 destes jogos para jogar agora. Depois, cada partida custa ' + GEO.parque.COST + ' EcoMoedas ou 2 perguntas do mundo. Os jogos ficam no botão 🎡 Parque.'));
      m.body.appendChild(U.el('div', { class: 'pq-grid' }, list.map((g) => U.el('button', { type: 'button', class: 'pq-card', style: { '--c1': g.c1, '--c2': g.c2 }, 'data-game': g.id, onclick: () => { m.close(); setTimeout(() => GEO.parque.enter(g.id), 60); } }, [
        U.el('div', { class: 'pq-art' }, GEO.gfx && GEO.gfx.ready ? GEO.gfx.el(g.icon, 76) : '🎮'), U.el('b', null, g.title), U.el('i', { class: 'pq-ref' }, 'Estilo ' + g.ref), U.el('span', null, g.desc), U.el('div', { class: 'pq-rec' }, '🎟️ Jogar grátis')]))));
      const extra = GEO.parque.GAMES.filter((g) => !g.world && g.unlockWorld === n).map((g) => g.title);
      if (extra.length) m.body.appendChild(U.el('p', { class: 'res-rec' }, '🎡 Também liberado no Parque: ' + extra.join(' e ') + '!'));
      m.setActions([UI.btn('Guardar o bilhete para depois', 'ghost', () => m.close())]);
      GG.audio.sfx('win');
    });
  };
  A.final = async function () {
    const r = GEO.campaign.finishCampaign();
    await new Promise((res) => {
      const m = UI.modal({ title: '🏆 O Atlas Vivo está completo!', wide: true, noClose: true });
      m.body.appendChild(U.el('div', { class: 'final-trophy' }, [U.el('div', { class: 'ft-ic' }, '🏆'), U.el('b', { class: 'pix' }, 'Guardião da Diversidade Brasileira')]));
      D.chapters.forEach((c) => m.body.appendChild(U.el('p', null, [U.el('b', null, c.icon + ' ' + c.title + ': '), c.summary])));
      const cov = GEO.campaign.coverage();
      m.body.appendChild(U.el('p', null, '📘 Questões do livro concluídas: ' + cov.done + '/' + cov.total));
      if (r) m.body.appendChild(U.el('p', { class: 'res-rec' }, '+' + r.coins + ' EcoMoedas • +' + r.xp + ' XP • Item: 📔 Atlas Vivo Dourado'));
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Revisão da Prova liberada! Você também pode repetir qualquer capítulo em Estudo rápido.'));
      m.setActions([UI.btn('📝 Revisão da Prova', 'gold', () => { m.close(); res(); setTimeout(() => GEO.review.run(), 50); }), UI.btn('🗺️ Voltar ao Atlas', 'pri', () => { m.close(); res(); })]);
    });
    await UI.say('gaia', D.story.final);
  };

  window.addEventListener('DOMContentLoaded', () => A.boot().catch((e) => { console.error(e); const l = document.getElementById('loading'); if (l) l.textContent = 'Erro ao carregar: ' + e.message; }));
})();
