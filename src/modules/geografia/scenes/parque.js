/* =====================================================================
   scenes/parque.js — PARQUE DO ATLAS: minijogos extras de Geografia.
   São jogos de diversão SEM questões (as 45 questões continuam só nas
   fases). Não dão EcoMoedas nem mexem na economia: valem recorde e
   medalha, guardados em S().parque. Liberação pelo número de fases
   concluídas (no modo de teste dos pais, tudo liberado).
   • Memória das Culturas — pares de ilustrações 3D (instrumentos,
     comidas, bichos e festas), 3 tabuleiros crescentes.
   • Voo da Arara — voa pelas 5 regiões do Brasil desviando de
     tempestades e árvores altas; cada região tem seu cenário.
   • Cesta da Feira — pega frutas e comidas que caem; combos.
   • Quebra-cabeça do Brasil — arrasta as 5 regiões até o mapa.
   Controles: teclado, mouse/toque e gamepad. Errar nunca tira
   progresso das fases.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.engine, D = GEO.data;
  const S = () => GEO.save.S;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const PQ = (GEO.parque = {});

  const GAMES = [
    { id: 'memoria', title: 'Memória das Culturas', icon: 'cartas', c1: '#9b4dca', c2: '#3a1f5a', boss: 'c1s5', unlockWorld: 1, music: 'atlas', medals: [45, 70, 88], unit: '%',
      desc: 'Vire as cartas e encontre os pares de instrumentos, comidas, bichos e festas do Brasil.', how: 'Toque em duas cartas (ou use as setas e Espaço) para achar os **pares iguais**. São 3 tabuleiros!' },
    { id: 'arara', title: 'Voo da Arara', icon: 'arara', c1: '#e8456b', c2: '#5a1030', boss: 'c1s5', unlockWorld: 1, music: 'oceano', medals: [150, 300, 480], unit: 'pts',
      desc: 'Voe pelas 5 regiões do Brasil, pegue frutas e desvie das tempestades e das árvores altas.', how: 'Toque na tela ou aperte **Espaço** para a arara bater as asas. Voe pelas **5 regiões** do Brasil!' },
    { id: 'cesta', title: 'Cesta da Feira', icon: 'cesta', c1: '#ff9a3d', c2: '#7a3a10', boss: 'c2s5', unlockWorld: 2, music: 'festa', medals: [220, 420, 650], unit: 'pts',
      desc: 'As comidas estão caindo das barracas! Pegue tudo com a cesta e faça combos.', how: 'Mova a cesta com **← →** ou arrastando o dedo. Pegue as comidas e as estrelas; fuja das **nuvens de chuva**!' },
    { id: 'quebra', title: 'Quebra-cabeça do Brasil', icon: 'quebra', c1: '#2e9e6a', c2: '#123f2c', boss: 'c3s6', unlockWorld: 3, music: 'atlas', medals: [250, 400, 520], unit: 'pts',
      desc: 'As regiões do mapa se soltaram! Arraste cada uma para o lugar certo.', how: 'Arraste cada **região** para o contorno do mapa. No teclado: **E** troca a peça, as setas movem e **Espaço** solta.' }
  ];
  PQ.GAMES = GAMES;
  const rec = () => { const s = S(); s.parque = s.parque || {}; return s.parque; };
  const stagesDone = () => D.stages.filter((s) => S().stages[s.id] && S().stages[s.id].done).length;
  const stageDone = (id) => !!(S().stages[id] && S().stages[id].done);
  PQ.unlocked = (g) => !!(GEO.mode && GEO.mode.isTest && GEO.mode.isTest()) || (g.boss ? stageDone(g.boss) : stagesDone() >= g.need);
  const lockText = (g) => (g.boss ? '🔒 Termine o Mundo ' + (g.world || g.unlockWorld) + ' (vença o chefe)' : '🔒 Conclua ' + g.need + ' fase' + (g.need > 1 ? 's' : ''));
  /** Registra um minijogo novo (Arcade dos Mundos: scenes/arcade*.js). */
  PQ.register = function (g, maker) { if (!GAMES.find((x) => x.id === g.id)) GAMES.push(g); MAKE[g.id] = maker; };
  PQ.worldGames = (w) => GAMES.filter((g) => g.world === w);
  const medalOf = (g, score) => (score >= g.medals[2] ? 'ouro' : score >= g.medals[1] ? 'prata' : score >= g.medals[0] ? 'bronze' : null);
  const MEDAL = { bronze: ['🥉', 'Bronze'], prata: ['🥈', 'Prata'], ouro: ['🥇', 'Ouro'] };

  /* ================================================================ menu do parque */
  /* ---------------------------------------------------------------- ENTRADA (pedido do usuário, set/2026)
     Cada partida custa PQ.COST EcoMoedas de Geografia (≈ o que se ganha em ~2 fases novas: uma fase
     rende de ~40 a ~60) OU 2 perguntas rápidas do tema do mundo. Vencer um chefe dá 1 BILHETE GRÁTIS
     para um jogo do Arcade daquele mundo. No modo de teste dos pais, tudo é grátis. */
  PQ.COST = 70;
  const tickets = () => { const f = (S().flags = S().flags || {}); f.arcadeTickets = f.arcadeTickets || {}; return f.arcadeTickets; };
  PQ.tickets = (w) => tickets()[w] || 0;
  PQ.giveTicket = (w) => { tickets()[w] = (tickets()[w] || 0) + 1; GEO.save.persist(); };
  const isTest = () => !!(GEO.mode && GEO.mode.isTest && GEO.mode.isTest());
  /** Duas perguntas rápidas (afirmações do capítulo) para entrar sem gastar moedas. */
  async function twoQuestions(g) {
    const done = [1, 2, 3].filter((n) => D.stages.some((st) => st.ch === n && stageDone(st.id)));
    for (let i = 0; i < 2; i++) {
      const ch = g.world || U.pick(done.length ? done : [1]);
      const all = D.statements[ch] || [];
      const sts = U.shuffle(U.shuffle(all.filter((x) => x.v)).slice(0, 1).concat(U.shuffle(all.filter((x) => !x.v)).slice(0, 2)));
      const r = await GG.quiz.quick({ prompt: 'Pergunta ' + (i + 1) + ' de 2 — qual afirmação está **correta**?', type: 'mc', keepOrder: true, options: sts.map((x) => ({ t: x.t, ok: x.v, fb: x.fb })) }, { title: '🎟️ Entrada do minijogo', subject: 'Geografia', chips: [g.title, 'Capítulo ' + ch], doneLabel: i ? 'Jogar! ▶' : 'Próxima ▶' });
      GEO.campaign.recordCheck(r.attempts === 1, 'Entrada de minijogo — capítulo ' + ch);
    }
  }
  /** Entrada: bilhete grátis → joga; senão, escolher entre moedas e 2 perguntas. */
  PQ.enter = function (id) {
    const g = GAMES.find((x) => x.id === id); if (!g) return;
    if (isTest()) { PQ.play(id); return; }
    if (g.world && PQ.tickets(g.world) > 0) { tickets()[g.world]--; GEO.save.persist(); UI.toast('🎟️ Bilhete grátis usado! Boa diversão.', 'gold', 2200); PQ.play(id); return; }
    const coins = S().coins, can = coins >= PQ.COST;
    const m = UI.modal({ title: '🎟️ Entrar em ' + g.title, cls: 'small pq-entry' });
    m.body.appendChild(U.el('div', { class: 'pq-entry-art' }, X() ? X().el(g.icon, 64) : '🎮'));
    m.body.appendChild(U.el('p', null, 'Escolha como entrar nesta partida:'));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Suas EcoMoedas: ' + coins + ' 🪙 • entrada: ' + PQ.COST + ' 🪙' + (can ? '' : ' (faltam ' + (PQ.COST - coins) + ')')));
    const pay = UI.btn('🪙 Pagar ' + PQ.COST + ' EcoMoedas', can ? 'pri' : 'ghost', () => {
      if (!can) { UI.toast('Moedas insuficientes — jogue fases ou responda 2 perguntas.', '', 2200); return; }
      const s = S(); s.coins -= PQ.COST; s.spent += PQ.COST; s.ledger.push({ t: Date.now(), r: 'Entrada: ' + g.title, xp: 0, c: -PQ.COST }); GEO.save.persist(); GEO.hud && GEO.hud.update();
      GG.audio.sfx('coin'); m.close(); PQ.play(id);
    });
    if (!can) pay.setAttribute('aria-disabled', 'true');
    const ask = UI.btn('📝 Responder 2 perguntas' + (g.world ? ' do Mundo ' + g.world : ''), can ? '' : 'pri', async () => { m.close(); await twoQuestions(g); PQ.play(id); });
    m.setActions([UI.btn('Cancelar', 'ghost', () => m.close()), ask, pay]);
  };
  let lastView = null;
  /** Abre o Parque. only = número do mundo para mostrar só o Arcade daquele mundo. */
  PQ.open = function (only) {
    if (UI.blocking()) return;
    lastView = only || null;
    const m = UI.modal({ title: only ? '🕹️ Arcade do Mundo ' + only : '🎡 Parque do Atlas — minijogos', wide: true });
    m.body.appendChild(U.el('p', { class: 'tip' }, only ? 'Recompensa por vencer o chefe: jogos rápidos só de diversão, sem perguntas. Bata seus recordes!' : 'Os minijogos são prêmios: cada MUNDO terminado (chefe vencido) libera novos jogos. Avance no Atlas para ganhar todos!'));
    const card = (g) => {
      const open = PQ.unlocked(g), r = rec()[g.id];
      const art = X() ? X().el(g.icon, 76) : U.el('span', { style: { fontSize: '48px' } }, '🎮');
      return U.el('button', { type: 'button', class: 'pq-card' + (open ? '' : ' lock'), style: { '--c1': g.c1, '--c2': g.c2 }, 'aria-disabled': String(!open), 'data-game': g.id,
        onclick: () => { if (!open) { UI.toast(lockText(g) + ' para liberar.'); return; } GG.audio.sfx('click'); m.close(); PQ.enter(g.id); } }, [
        U.el('div', { class: 'pq-art' }, art), U.el('b', null, g.title), g.ref ? U.el('i', { class: 'pq-ref' }, 'Estilo ' + g.ref) : null, U.el('span', null, g.desc),
        U.el('div', { class: 'pq-rec' }, open ? (r && r.best != null ? 'Recorde: ' + r.best + ' ' + g.unit + (r.medal ? ' ' + MEDAL[r.medal][0] : '') : '▶ Novo!') : lockText(g))
      ]);
    };
    const tk = [1, 2, 3].filter((w) => PQ.tickets(w) > 0).map((w) => 'Mundo ' + w + ': ' + PQ.tickets(w));
    m.body.appendChild(U.el('p', { class: 'pq-wallet' }, '🪙 ' + S().coins + ' EcoMoedas • entrada: ' + PQ.COST + ' 🪙 ou 2 perguntas' + (tk.length ? ' • 🎟️ bilhetes grátis — ' + tk.join(', ') : '')));
    const section = (title, list) => { if (!list.length) return; m.body.appendChild(U.el('h3', { class: 'pq-sec' }, title)); m.body.appendChild(U.el('div', { class: 'pq-grid' }, list.map(card))); };
    if (!only) section('🎡 Parque do Atlas', GAMES.filter((g) => !g.world));
    [1, 2, 3].filter((w) => !only || w === only).forEach((w) => section('🕹️ Arcade do Mundo ' + w + ' — ' + D.chapters[w - 1].title, PQ.worldGames(w)));
    m.body.appendChild(U.el('details', { class: 'tip', style: { marginTop: '10px' } }, [U.el('summary', null, 'Créditos das imagens'),
      U.el('p', null, 'Ilustrações 3D: Fluent Emoji (Microsoft, licença MIT). Cenários, partículas e árvores: Kenney (CC0). Fotos de satélite da Terra (dia e noite) e globo: Solar System Scope, com dados da NASA (CC BY 4.0). Mapa do Brasil: Victor Cazanave, @svg-maps/brazil (CC BY 4.0).')]));
    m.setActions([UI.btn('Voltar ao Atlas', 'pri', () => m.close())]);
  };

  /* ================================================================ runtime comum */
  let cur = null;
  function setStat(el, icon, v) {
    const s = String(v); if (el._v === s) return;
    const up = el._v != null && parseFloat(s) > parseFloat(el._v); el._v = s; el.textContent = ''; el.style.display = '';
    if (X()) el.appendChild(X().el(icon, 18)); el.appendChild(document.createTextNode(' ' + s));
    if (up) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  /** API entregue a cada minijogo: pontos, vidas, texto de objetivo e fim. */
  function Api(g) {
    this.g = g; this.score = 0; this.lives = null; this.maxLives = 3; this.ended = false;
    const h = document.getElementById('stageHud'); h.innerHTML = ''; h.classList.remove('hide');
    this.hud = { score: U.el('div', { class: 'sh-stat' }), extra: U.el('div', { class: 'sh-stat', style: { display: 'none' } }), lives: U.el('div', { class: 'sh-hearts' }), goal: U.el('div', { class: 'sh-goal' }) };
    const pause = U.el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Pausa', title: 'Pausa (Esc)', onclick: () => PQ.pause() }, '⏸');
    h.appendChild(U.el('div', { class: 'sh-row' }, [U.el('div', { class: 'sh-title' }, [U.el('span', { class: 'sh-ch pix' }, g.world ? 'ARCADE' : 'PARQUE'), ' ', X() ? X().el(g.icon, 22) : '🎡', ' ' + g.title]), this.hud.lives, this.hud.score, this.hud.extra, U.el('span', { style: { flex: '1' } }), pause]));
    h.appendChild(this.hud.goal);
  }
  Api.prototype.add = function (n) { this.score = Math.max(0, Math.round(this.score + n)); this.refresh(); };
  Api.prototype.refresh = function () {
    setStat(this.hud.score, 'estrela', this.score);
    if (this.lives == null) return;
    const k = this.lives + '/' + this.maxLives, el = this.hud.lives;
    if (el._v === k) return;
    const lost = el._v && parseInt(el._v, 10) > this.lives; el._v = k; el.textContent = '';
    for (let i = 0; i < this.maxLives; i++) el.appendChild(X() ? X().el('coracao', 18, i < this.lives ? 'hp' : 'hp off') : document.createTextNode(i < this.lives ? '❤' : '♡'));
    if (lost) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  };
  Api.prototype.extra = function (icon, v) { setStat(this.hud.extra, icon, v); };
  Api.prototype.goal = function (t) { this.hud.goal.textContent = t || ''; };
  Api.prototype.end = function (score, note) { if (this.ended) return; this.ended = true; if (score != null) this.score = Math.max(0, Math.round(score)); finish(this, note); };

  PQ.play = async function (id, skipIntro) {
    const g = GAMES.find((x) => x.id === id); if (!g) return;
    GG.ui.closeAll && GG.ui.closeAll();
    GG.engine.stop();
    GEO.app.showStage();
    const api = new Api(g); cur = { g, api };
    const scene = MAKE[id](api);
    cur.scene = scene;
    E.start(scene);
    if (X()) { X().iris('in'); X().banner({ id: 'pq_' + id, icon: g.icon, title: g.title, style: g.world ? 'Arcade do Mundo ' + g.world + (g.ref ? ' • estilo ' + g.ref : '') : 'Minijogo do Parque do Atlas' }, g.world ? 'ARCADE DO MUNDO ' + g.world : null); }
    GG.audio.music(g.music);
    api.refresh();
    if (!skipIntro) await UI.say('gaia', [g.how]);
    if (cur && cur.scene === scene && scene.begin) scene.begin();
  };
  PQ.current = () => cur;
  PQ.pause = function () {
    if (!cur || UI.blocking()) return;
    const m = UI.modal({ title: '⏸ Pausa — ' + cur.g.title, cls: 'small' });
    m.body.appendChild(U.el('p', { class: 'tip' }, 'O jogo está parado.'));
    m.setActions([UI.btn('🎡 Sair para o Parque', 'ghost', () => { m.close(); PQ.exit(true); }), UI.btn('Continuar ▶', 'pri', () => m.close())]);
  };
  PQ.exit = function (reopen) {
    GG.engine.stop(); cur = null;
    document.getElementById('stageHud').classList.add('hide');
    GEO.app.showAtlas();
    if (reopen) setTimeout(() => PQ.open(lastView), 60);
  };
  function finish(api, note) {
    const g = api.g, score = api.score, r = rec(), old = r[g.id] || { best: null, plays: 0, medal: null };
    const medal = medalOf(g, score), record = old.best == null || score > old.best;
    const rank = (m) => ({ bronze: 1, prata: 2, ouro: 3 }[m] || 0);
    r[g.id] = { best: record ? score : old.best, plays: (old.plays || 0) + 1, medal: rank(medal) > rank(old.medal) ? medal : old.medal, last: Date.now() };
    GEO.save.persist();
    GG.audio.music('vitoria'); GG.audio.sfx('win');
    if (medal) { E.fx.confetti(E.W / 2, 60, 70); if (X()) X().flash('#fff6c0', 0.35); }
    setTimeout(() => {
      const m = UI.modal({ title: '🎡 ' + g.title + ' — fim de jogo!', noClose: true });
      const icon = X() ? U.el('div', { class: 'res-icon res-3d' }, [U.el('span', { class: 'res-shine' }), X().el(medal || 'estrela', 64)]) : U.el('div', { class: 'res-icon' }, medal ? MEDAL[medal][0] : '⭐');
      m.body.appendChild(U.el('div', { class: 'res-medal' + (medal ? ' medal-' + medal : '') }, [icon, U.el('div', null, [U.el('b', { class: 'pix' }, medal ? 'Medalha ' + MEDAL[medal][1] : 'Boa tentativa!'), U.el('div', null, 'Pontuação: ' + score + ' ' + g.unit), record ? U.el('div', { class: 'res-rec' }, '🏆 Novo recorde!') : U.el('div', null, 'Recorde: ' + old.best + ' ' + g.unit)])]));
      if (note) m.body.appendChild(U.el('p', { class: 'tip' }, note));
      const nxt = g.medals.find((v) => v > score);
      m.body.appendChild(U.el('p', { class: 'tip' }, nxt ? 'Próxima medalha com ' + nxt + ' ' + g.unit + '.' : 'Você conquistou a medalha máxima! 🥇'));
      m.setActions([UI.btn('🗺️ Atlas', 'ghost', () => { m.close(); PQ.exit(false); }), UI.btn('🎡 Parque', '', () => { m.close(); PQ.exit(true); }), UI.btn('🔁 Jogar de novo', 'pri', () => { m.close(); PQ.exit(false); setTimeout(() => PQ.enter(g.id), 80); })]);
    }, medal ? 700 : 250);
  }
  /** Ouve arrastar/soltar enquanto a cena estiver ativa (remove ao sair). */
  function pointer(sc, handlers) {
    const cv = document.getElementById('game');
    const offs = Object.keys(handlers).map((type) => {
      const target = type === 'pointerdown' ? cv : window;
      const f = (ev) => { if (UI.blocking() || E.scene !== sc) return; const l = E.toLogical(ev.clientX, ev.clientY); handlers[type](l.x, l.y, ev); };
      target.addEventListener(type, f); return () => target.removeEventListener(type, f);
    });
    const ex = sc.exit; sc.exit = function () { offs.forEach((o) => o()); if (ex) ex.call(sc); };
  }
  PQ.pointer = pointer;
  const MAKE = {};

  /* ================================================================ 1. MEMÓRIA DAS CULTURAS */
  const CARDS = [['atabaque', 'Atabaque'], ['maracas', 'Maracas'], ['sanfona', 'Sanfona'], ['violao', 'Violão'], ['flauta', 'Flauta'], ['trompete', 'Trompete'], ['tambor', 'Tambor'],
    ['coco', 'Coco'], ['abacaxi', 'Abacaxi'], ['milho', 'Milho'], ['banana', 'Banana'], ['manga', 'Manga'], ['feijao', 'Feijão'], ['peixe', 'Peixe'], ['melancia', 'Melancia'],
    ['arara', 'Arara'], ['macaco', 'Macaco'], ['jacare', 'Jacaré'], ['preguica', 'Bicho-preguiça'], ['tartaruga', 'Tartaruga'], ['golfinho', 'Boto'],
    ['coqueiro', 'Coqueiro'], ['girassol', 'Girassol'], ['pipa', 'Pipa'], ['balao', 'Balão'], ['fogos', 'Fogos'], ['teatro', 'Teatro'], ['paleta', 'Pintura'], ['veleiro', 'Barco a vela']];
  MAKE.memoria = function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const BOARDS = [[4, 3], [4, 4], [5, 4]];
    const CW = 40, CH = 44, GAP = 6;
    let bi = 0, cards = [], open = [], lock = 0, pairs = 0, misses = 0, totalPairs = 0, cursor = 0, started = false, labels = [];
    function layout() {
      const [cols, rows] = BOARDS[bi], n = cols * rows / 2;
      const pick = U.shuffle(CARDS.filter((c) => !X() || X().has(c[0]))).slice(0, n);
      const deck = U.shuffle(pick.concat(pick));
      const w = cols * (CW + GAP) - GAP, h = rows * (CH + GAP) - GAP, x0 = (E.W - w) / 2, y0 = 20 + (200 - h) / 2;
      cards = deck.map((c, i) => ({ id: c[0], name: c[1], x: x0 + (i % cols) * (CW + GAP), y: y0 + Math.floor(i / cols) * (CH + GAP), up: false, k: 0, done: false, shake: 0, deal: i * 0.04 }));
      open = []; pairs = 0; cursor = 0; lock = 0.3;
      api.goal('Tabuleiro ' + (bi + 1) + ' de 3 — ache os ' + n + ' pares.'); api.extra('cartas', '0/' + n);
    }
    sc.begin = () => { started = true; };
    function flip(i) {
      const c = cards[i]; if (!started || lock > 0 || !c || c.up || c.done || open.length >= 2) return;
      c.up = true; open.push(c); GG.audio.sfx('click');
      if (open.length < 2) return;
      const [a, b] = open;
      if (a.id === b.id) {
        lock = 0.4;
        setTimeout(() => {
          a.done = b.done = true; open = []; pairs++; totalPairs++; api.add(20); GG.audio.sfx('coin'); api.extra('cartas', pairs + '/' + cards.length / 2);
          [a, b].forEach((c2) => { if (X()) { X().sparkle(c2.x + CW / 2, c2.y + CH / 2, '#fff0a0', 6); X().ring(c2.x + CW / 2, c2.y + CH / 2, '#7bff8f', 30); } });
          labels.push({ t: a.name, x: (a.x + b.x) / 2 + CW / 2, y: Math.min(a.y, b.y) + 4, at: sc.t });
          if (pairs === cards.length / 2) boardDone();
        }, 350);
      } else {
        misses++; lock = 0.95; GG.audio.sfx('bad');
        setTimeout(() => { a.shake = b.shake = 0.35; }, 350);
        setTimeout(() => { a.up = b.up = false; open = []; }, 900);
      }
    }
    function boardDone() {
      GG.audio.sfx('win'); if (X()) X().flash('#ffffff', 0.25); E.fx.confetti(E.W / 2, 40, 40);
      if (bi < BOARDS.length - 1) { bi++; lock = 1.3; setTimeout(layout, 1100); }
      else { const pct = Math.round(100 * totalPairs / (totalPairs + misses * 0.6)); setTimeout(() => api.end(pct, 'Pares: ' + totalPairs + ' • Tentativas sem par: ' + misses + '. A pontuação é o seu aproveitamento.'), 900); }
    }
    layout();
    sc.click = (lx, ly) => { const i = cards.findIndex((c) => lx >= c.x && lx <= c.x + CW && ly >= c.y && ly <= c.y + CH); if (i >= 0) { cursor = i; flip(i); } };
    sc.update = function (dt) {
      sc.t += dt; if (lock > 0) lock -= dt;
      cards.forEach((c) => { c.k += ((c.up || c.done ? 1 : 0) - c.k) * Math.min(1, dt * 12); if (c.shake > 0) c.shake -= dt; if (c.deal > 0) c.deal -= dt; });
      const IN = GG.input, cols = BOARDS[bi][0];
      if (IN.pressed('right')) cursor = Math.min(cards.length - 1, cursor + 1);
      if (IN.pressed('left')) cursor = Math.max(0, cursor - 1);
      if (IN.pressed('down')) cursor = Math.min(cards.length - 1, cursor + cols);
      if (IN.pressed('up')) cursor = Math.max(0, cursor - cols);
      if (IN.pressed('jump') || IN.pressed('act')) flip(cursor);
      if (IN.pressed('pause')) PQ.pause();
      labels = labels.filter((l) => sc.t - l.at < 1.6);
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'mosaico', sc.t * 8, 0, sc.t, { horizon: 235 }))) { c.fillStyle = '#2a1640'; c.fillRect(0, 0, E.W, E.H); }
      const tg = c.createRadialGradient(E.W / 2, 120, 20, E.W / 2, 120, 230); tg.addColorStop(0, 'rgba(30,110,90,.88)'); tg.addColorStop(1, 'rgba(12,50,40,.92)');
      c.fillStyle = tg; c.fillRect(E.W / 2 - 150, 14, 300, 208); c.strokeStyle = '#c9a24d'; c.lineWidth = 2; c.strokeRect(E.W / 2 - 149, 15, 298, 206);
      cards.forEach((cd, i) => {
        if (cd.deal > 0) return;
        const k = cd.k, sx = Math.abs(Math.cos(k * Math.PI)), face = k > 0.5;
        const sh = cd.shake > 0 ? Math.sin(cd.shake * 60) * 2 : 0;
        const cx = cd.x + CW / 2 + sh, cy = cd.y + CH / 2 - (cd.done && !E.reduced ? Math.sin(sc.t * 3 + i) : 0);
        c.save(); c.translate(cx, cy); c.scale(Math.max(0.04, sx), 1);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-CW / 2 + 2, -CH / 2 + 3, CW, CH);
        if (face) {
          c.fillStyle = cd.done ? '#e9ffe9' : '#fff8e6'; c.fillRect(-CW / 2, -CH / 2, CW, CH);
          c.strokeStyle = cd.done ? '#3ddc84' : '#c9a24d'; c.lineWidth = 2; c.strokeRect(-CW / 2 + 1, -CH / 2 + 1, CW - 2, CH - 2);
          if (!(x && x.ilus(c, cd.id, 0, -3, 28))) { c.fillStyle = '#2a2233'; c.font = '8px sans-serif'; c.textAlign = 'center'; c.fillText(cd.name.slice(0, 6), 0, 0); }
          c.fillStyle = '#6d4c2a'; c.font = '700 6px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(cd.name, 0, CH / 2 - 3, CW - 4);
        } else {
          const bg = c.createLinearGradient(0, -CH / 2, 0, CH / 2); bg.addColorStop(0, '#5a3ab0'); bg.addColorStop(1, '#2e1c6a');
          c.fillStyle = bg; c.fillRect(-CW / 2, -CH / 2, CW, CH); c.strokeStyle = '#ffd23f'; c.lineWidth = 1.5; c.strokeRect(-CW / 2 + 2, -CH / 2 + 2, CW - 4, CH - 4);
          if (!(x && x.ilus(c, 'bussola', 0, 0, 20, { alpha: 0.9 }))) { c.fillStyle = '#ffd23f'; c.fillRect(-3, -3, 6, 6); }
        }
        c.restore();
        if (i === cursor && !cd.done && started) { c.strokeStyle = 'rgba(255,230,120,' + (0.6 + 0.4 * Math.sin(sc.t * 6)).toFixed(2) + ')'; c.lineWidth = 2; c.strokeRect(cd.x - 2, cd.y - 2, CW + 4, CH + 4); }
      });
      labels.forEach((l) => { const k = (sc.t - l.at) / 1.6; c.save(); c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; g.panel(l.x - 34, l.y - 14 - k * 10, 68, 12, '#ffd23f', '#15152a'); g.text(l.t, l.x, l.y - 11 - k * 10, { size: 5, color: '#2a2233', align: 'center', shadow: false, maxW: 64 }); c.restore(); });
    };
    sc.dbg = { solve() { if (lock > 0 && pairs) return; cards.forEach((c) => { c.done = c.up = true; }); totalPairs += cards.length / 2 - pairs; pairs = cards.length / 2; boardDone(); } };
    return sc;
  };

  /* ================================================================ 2. VOO DA ARARA */
  const REGIONS = [
    { t: 'Norte', sky: 'floresta', fruit: ['banana', 'abacaxi', 'coco'], bg: 'Floresta Amazônica' },
    { t: 'Nordeste', sky: 'interior', fruit: ['coco', 'manga', 'melancia'], bg: 'Sertão e litoral' },
    { t: 'Centro-Oeste', sky: 'estrada', fruit: ['milho', 'banana', 'manga'], bg: 'Cerrado e Pantanal' },
    { t: 'Sudeste', sky: 'cidadeDia', fruit: ['abacaxi', 'banana', 'milho'], bg: 'Grandes cidades' },
    { t: 'Sul', sky: 'sul', fruit: ['uva', 'morango', 'melancia'], bg: 'Araucárias e campos' }
  ];
  MAKE.arara = function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const RT = 20; // segundos por região
    const b = { x: 90, y: 100, vy: 0, inv: 0, flap: 0 };
    let dist = 0, playing = false, spawnT = 0.6, obs = [], items = [], ri = 0, rt = 0, prevSky = null, fadeT = 0, speed = 72, regionPop = 0, started = false;
    api.lives = 3; api.refresh();
    api.goal('Região: ' + REGIONS[0].t + ' — ' + REGIONS[0].bg); api.extra('bussola', REGIONS[0].t);
    sc.begin = () => { playing = true; started = true; regionPop = 1.8; };
    const flap = () => { if (!playing) return; b.vy = -165; b.flap = 0.25; GG.audio.sfx('jump'); if (X()) X().puff(b.x - 8, b.y + 4, 1, -1); };
    sc.click = () => flap();
    function spawn() {
      const gap = 86 - Math.min(16, ri * 4), cy = 62 + Math.random() * 104;
      obs.push({ x: E.W + 30, top: cy - gap / 2, bot: cy + gap / 2, w: 26, passed: false, tree: ['treeLong', 'tree', 'treePalm', 'treePine'][Math.floor(Math.random() * 4)] });
      if (Math.random() < 0.85) items.push({ x: E.W + 43, y: cy + (Math.random() - 0.5) * gap * 0.4, k: Math.random() < 0.18 ? 'frag' : U.pick(REGIONS[ri].fruit.filter((f) => !X() || X().has(f))) || 'banana', got: false });
    }
    function hit() {
      if (b.inv > 0 || !playing) return; b.inv = 1.6; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(3, 0.25); if (X()) X().flash('#ff4d4d', 0.3);
      b.vy = -120;
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Você voou até a região ' + REGIONS[ri].t + '. Tente de novo para chegar ao Sul!'), 700); }
    }
    sc.update = function (dt) {
      sc.t += dt; if (b.inv > 0) b.inv -= dt; if (b.flap > 0) b.flap -= dt; if (regionPop > 0) regionPop -= dt; if (fadeT > 0) fadeT -= dt;
      const IN = GG.input;
      if (IN.pressed('jump') || IN.pressed('up') || IN.pressed('act')) flap();
      if (IN.pressed('pause')) PQ.pause();
      if (!playing) { if (!started) b.y = 100 + Math.sin(sc.t * 3) * 6; return; }
      b.vy = Math.min(b.vy + 430 * dt, 240); b.y += b.vy * dt;
      if (b.y < 14) { b.y = 14; b.vy = 20; }
      if (b.y > 206) { b.y = 206; b.vy = -140; }
      speed = 72 + ri * 6; dist += speed * dt;
      rt += dt;
      if (rt >= RT) {
        rt = 0; api.add(50); GG.audio.sfx('ok');
        if (ri === REGIONS.length - 1) { playing = false; if (X()) X().flash('#ffffff', 0.4); E.fx.confetti(E.W / 2, 50, 60); setTimeout(() => api.end(api.score + 100, 'Viagem completa pelas 5 regiões do Brasil! (+100 de bônus)'), 900); return; }
        prevSky = REGIONS[ri].sky; fadeT = 1.2; ri++; regionPop = 2.2; api.goal('Região: ' + REGIONS[ri].t + ' — ' + REGIONS[ri].bg); api.extra('bussola', REGIONS[ri].t);
      }
      spawnT -= dt; if (spawnT <= 0 && rt < RT - 2.2) { spawn(); spawnT = 1.9 - Math.min(0.5, ri * 0.1); }
      const bx = b.x - 9, by = b.y - 7, bw = 18, bh = 13;
      obs.forEach((o) => {
        o.x -= speed * dt;
        if (!o.passed && o.x + o.w < b.x) { o.passed = true; api.add(5); }
        if (bx + bw > o.x + 3 && bx < o.x + o.w - 3 && (by < o.top || by + bh > o.bot)) hit();
      });
      obs = obs.filter((o) => o.x > -40);
      items.forEach((it) => { it.x -= speed * dt; if (!it.got && Math.hypot(it.x - b.x, it.y - b.y) < 15) { it.got = true; const v = it.k === 'frag' ? 25 : 10; api.add(v); GG.audio.sfx(it.k === 'frag' ? 'frag' : 'coin'); if (X()) { X().sparkle(it.x, it.y, it.k === 'frag' ? '#ffe39a' : '#ffffff', 5); X().pop(it.x, it.y - 10, '+' + v, '#ffe27a', 8); } } });
      items = items.filter((it) => it.x > -20 && !it.got);
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X(), R = REGIONS[ri];
      if (x) {
        x.sky(g, R.sky, dist * 3, 0, sc.t, { horizon: 190 });
        if (fadeT > 0 && prevSky) { c.save(); c.globalAlpha = fadeT / 1.2; x.sky(g, prevSky, dist * 3, 0, sc.t, { horizon: 190 }); c.restore(); }
      } else { c.fillStyle = '#6cc0f0'; c.fillRect(0, 0, E.W, E.H); }
      obs.forEach((o) => {
        if (x) {
          for (let y = o.top - 16, n = 0; y > -30; y -= 22, n++) x.ilus(c, n === 0 ? 'tempestade' : 'nuvem', o.x + o.w / 2, y, 34);
          if (Math.floor(sc.t * 3 + o.x * 0.1) % 7 === 0) { c.strokeStyle = '#fff6a0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(o.x + 12, o.top - 4); c.lineTo(o.x + 8, o.top + 6); c.lineTo(o.x + 14, o.top + 6); c.lineTo(o.x + 10, o.top + 16); c.stroke(); }
          const im = x.img[o.tree]; if (im) x.hd(c, () => { const h = E.H - o.bot + 10, w = Math.max(o.w + 10, h * im.width / im.height * 0.55); c.drawImage(im, o.x + o.w / 2 - w / 2, o.bot - 4, w, h); });
        } else { g.rect(o.x, 0, o.w, o.top, '#555'); g.rect(o.x, o.bot, o.w, E.H - o.bot, '#3a7a3a'); }
      });
      items.forEach((it) => { const bob = Math.sin(sc.t * 4 + it.x * 0.1) * 2; if (x) { x.glow(c, it.x, it.y + bob, 12, '#fff3b0', 0.5); if (it.k === 'frag') g.img(GG.pixel.fragmento(Math.floor(sc.t * 4) % 2), it.x - 6, it.y - 6 + bob); else x.ilus(c, it.k, it.x, it.y + bob, 16); } else g.circle(it.x, it.y, 5, '#ffd23f'); });
      if (!(b.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        const rot = Math.max(-0.5, Math.min(0.7, b.vy / 300));
        if (x) x.ilus(c, 'arara', b.x, b.y, 28, { rot, flip: true, sy: b.flap > 0 ? 0.8 + (0.25 - b.flap) : 1 });
        else g.circle(b.x, b.y, 8, '#e5484d');
      }
      g.panel(110, 4, 180, 12, 'rgba(15,18,38,.8)', '#3a4290');
      REGIONS.forEach((r, i) => { const w = 36; g.rect(110 + i * w, 4, w - 1, 12, i < ri ? 'rgba(61,220,132,.5)' : i === ri ? 'rgba(255,210,63,.35)' : 'rgba(0,0,0,0)'); g.text(r.t === 'Centro-Oeste' ? 'C.-Oeste' : r.t, 110 + i * w + w / 2, 7, { size: 4, color: '#fff', align: 'center', maxW: w - 2 }); });
      g.rect(110 + ri * 36, 15, 35 * Math.min(1, rt / RT), 2, '#ffd23f');
      if (regionPop > 0 && started) { const k = Math.min(1, (2.2 - regionPop) * 3); c.save(); c.globalAlpha = Math.min(1, regionPop); c.translate(E.W / 2, 64); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); g.text('Sobrevoando: ' + R.t, 0, 0, { size: 10, color: '#ffd23f', align: 'center' }); g.text(R.bg, 0, 16, { size: 6, color: '#fff', align: 'center' }); c.restore(); }
    };
    sc.dbg = { b, skipRegion() { rt = RT; }, win() { ri = REGIONS.length - 1; rt = RT; } };
    return sc;
  };

  /* ================================================================ 3. CESTA DA FEIRA */
  const FOODS = ['abacaxi', 'banana', 'coco', 'manga', 'milho', 'melancia', 'abacate', 'uva', 'morango', 'limao', 'pao', 'queijo', 'peixe', 'cenoura', 'tomate'];
  MAKE.cesta = function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const DUR = 60, bk = { x: 200, w: 40, slow: 0, sq: 0 };
    let t = DUR, playing = false, drops = [], spawnT = 0, combo = 0, mult = 1, dragX = null, face = 1;
    api.extra('cronometro', DUR + 's');
    sc.begin = () => { playing = true; };
    pointer(sc, { pointerdown: (lx) => { dragX = lx; }, pointermove: (lx, ly, ev) => { if (dragX != null || ev.pointerType === 'mouse') dragX = lx; }, pointerup: (lx, ly, ev) => { if (ev.pointerType !== 'mouse') dragX = null; } });
    const foods = FOODS.filter((f) => !X() || X().has(f));
    function spawn() {
      const r = Math.random(), k = r < 0.12 ? 'chuva' : r < 0.2 ? 'estrela_brilho' : U.pick(foods);
      drops.push({ k, x: 20 + Math.random() * (E.W - 40), y: -14, vy: 45 + Math.random() * 30 + (DUR - t) * 1.1, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3 });
    }
    sc.update = function (dt) {
      sc.t += dt; if (bk.slow > 0) bk.slow -= dt; bk.sq *= Math.max(0, 1 - dt * 10);
      const IN = GG.input;
      if (IN.pressed('pause')) PQ.pause();
      if (!playing) return;
      t -= dt; api.extra('cronometro', Math.max(0, Math.ceil(t)) + 's');
      const sp = bk.slow > 0 ? 90 : 210, ax = IN.axisX(), x0 = bk.x;
      if (ax) { bk.x += ax * sp * dt; dragX = null; } else if (dragX != null) bk.x += Math.max(-sp * dt, Math.min(sp * dt, dragX - bk.x));
      bk.x = Math.max(bk.w / 2 + 4, Math.min(E.W - bk.w / 2 - 4, bk.x));
      if (Math.abs(bk.x - x0) > 0.3) face = bk.x > x0 ? 1 : -1;
      bk.moving = Math.abs(bk.x - x0) > 0.3;
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(0.38, 0.85 - (DUR - t) * 0.008); }
      drops.forEach((d) => {
        d.y += d.vy * dt; d.rot += d.vr * dt;
        if (!d.got && d.y > 182 && d.y < 202 && Math.abs(d.x - bk.x) < bk.w / 2 + 6) {
          d.got = true; bk.sq = 0.4;
          if (d.k === 'chuva') { combo = 0; mult = 1; bk.slow = 2; GG.audio.sfx('bad'); if (X()) { X().pop(d.x, 170, 'Molhou!', '#9fd8ff', 8); X().puff(bk.x, 190, 4); } }
          else {
            combo++; const nm = Math.min(5, 1 + Math.floor(combo / 5)); if (nm > mult && X()) X().pop(E.W / 2, 90, 'COMBO x' + nm + '!', '#ffd23f', 14); mult = nm;
            const v = (d.k === 'estrela_brilho' ? 30 : 10) * mult; api.add(v); GG.audio.sfx(d.k === 'estrela_brilho' ? 'frag' : 'coin');
            if (X()) { X().sparkle(d.x, 186, d.k === 'estrela_brilho' ? '#ffe39a' : '#ffffff', d.k === 'estrela_brilho' ? 8 : 3); X().pop(d.x, 172, '+' + v, '#ffe27a', 8); }
          }
        }
        if (!d.got && d.y > E.H + 10 && d.k !== 'chuva') { combo = 0; mult = 1; d.gone = true; }
      });
      drops = drops.filter((d) => !d.got && !d.gone && d.y < E.H + 20);
      if (t <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Dica: pegue várias comidas seguidas para subir o combo até x5!'), 400); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'estrada', sc.t * 6, 0, sc.t, { horizon: 118 }))) { c.fillStyle = '#7fd4ff'; c.fillRect(0, 0, E.W, E.H); }
      const cols = [['#e5484d', '#fff'], ['#3ec1ff', '#fff'], ['#2ecc71', '#fff8d0'], ['#f39c12', '#fff']];
      for (let i = 0; i < 4; i++) {
        const sx = 8 + i * 100, sy = 104;
        g.rect(sx + 4, sy, 3, 60, '#6b4f2a'); g.rect(sx + 81, sy, 3, 60, '#6b4f2a');
        for (let k = 0; k < 8; k++) { c.fillStyle = cols[i][k % 2]; c.beginPath(); c.moveTo(sx + k * 11, sy - 14); c.lineTo(sx + k * 11 + 11, sy - 14); c.lineTo(sx + k * 11 + 11, sy); c.arc(sx + k * 11 + 5.5, sy, 5.5, 0, Math.PI); c.closePath(); c.fill(); }
        g.rect(sx, sy + 34, 88, 12, '#8b5a2b'); g.rect(sx, sy + 34, 88, 3, '#b07a3f');
        if (x) for (let k = 0; k < 4; k++) x.ilus(c, foods[(i * 4 + k) % foods.length], sx + 14 + k * 20, sy + 30, 16);
      }
      c.fillStyle = '#c9b89a'; c.fillRect(0, 164, E.W, 61); c.fillStyle = 'rgba(0,0,0,.08)'; for (let yy = 168; yy < E.H; yy += 8) for (let xx = (yy / 8 % 2) * 10; xx < E.W; xx += 20) c.fillRect(xx, yy, 18, 1);
      drops.forEach((d) => {
        if (!x) { g.circle(d.x, d.y, 6, d.k === 'chuva' ? '#7fc8ff' : '#ffd23f'); return; }
        c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(d.x, 206, 6 * Math.max(0.1, Math.min(1, d.y / 200)), 1.5, 0, 0, Math.PI * 2); c.fill();
        if (d.k === 'estrela_brilho') x.glow(c, d.x, d.y, 16, '#ffe39a', 0.8);
        x.ilus(c, d.k, d.x, d.y, d.k === 'chuva' ? 24 : 18, { rot: d.k === 'chuva' ? 0 : d.rot });
        if (d.k === 'chuva' && !E.reduced) for (let r = 0; r < 3; r++) g.rect(d.x - 6 + r * 6, d.y + 10 + ((sc.t * 60 + r * 7) % 10), 1, 3, '#7fc8ff');
      });
      const sq = bk.sq;
      g.img(GEO.common.gabrielSide(GEO.eco.look(), bk.moving ? 'run' : 'idle', sc.t), bk.x - 9 - face * 22, 184, { flip: face < 0 });
      if (x) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(bk.x, 208, 20, 3, 0, 0, Math.PI * 2); c.fill(); c.save(); c.translate(bk.x, 206); c.scale(1 + sq * 0.3, 1 - sq * 0.3); x.ilus(c, 'cesta', 0, -14, 40, bk.slow > 0 ? { gray: true } : null); c.restore(); if (bk.slow > 0) x.ilus(c, 'chuva', bk.x, 166, 18); }
      else g.rect(bk.x - 20, 190, 40, 14, '#8b5a2b');
      if (mult > 1) g.text('x' + mult, bk.x, 176, { size: 8, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { t = 0; } };
    return sc;
  };

  /* ================================================================ 4. QUEBRA-CABEÇA DO BRASIL */
  MAKE.quebra = function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const M = GG.brasilMapa, MP = GG.maps, K = 184 / 613, X0 = 26, Y0 = 20;
    const hitCtx = document.createElement('canvas').getContext('2d');
    const SLOTS = [[298, 64], [356, 64], [298, 124], [356, 124], [327, 180]], TRAY = 0.42;
    const outline = M.states.map((s) => new Path2D(s.d));
    const pieces = MP.REGIONS.map((r) => ({ id: r.id, t: r.t, c: r.c, paths: M.states.filter((s) => s.region === r.id).map((s) => new Path2D(s.d)), cx: M.regions[r.id].cx, cy: M.regions[r.id].cy, dx: 0, dy: 0, placed: false, lift: 0, sz: TRAY }));
    U.shuffle(pieces.slice()).forEach((p, i) => { const [sx, sy] = SLOTS[i]; p.dx = sx - (X0 + p.cx * K); p.dy = sy - (Y0 + p.cy * K); });
    let drag = null, sel = 0, playing = false, time = 0, done = false, placedN = 0, kb = false;
    api.goal('Arraste as 5 regiões para o contorno do mapa.'); api.extra('quebra', '0/5');
    sc.begin = () => { playing = true; };
    /** Ponto da tela → coordenadas do mapa da peça (considera a escala menor na bandeja). */
    const local = (p, lx, ly) => { const pcx = p.cx * K, pcy = p.cy * K, s = p.sz * (1 + p.lift * 0.05); return { x: ((lx - X0 - p.dx - pcx) / s + pcx) / K, y: ((ly - Y0 - p.dy - pcy) / s + pcy) / K }; };
    const hitPiece = (lx, ly) => { for (let i = pieces.length - 1; i >= 0; i--) { const p = pieces[i]; if (p.placed) continue; const m = local(p, lx, ly); if (p.paths.some((pa) => hitCtx.isPointInPath(pa, m.x, m.y))) return p; } return null; };
    function drop(p) {
      if (Math.abs(p.dx) < 16 && Math.abs(p.dy) < 16) {
        p.dx = 0; p.dy = 0; p.placed = true; placedN++; api.add(40); api.extra('quebra', placedN + '/5'); GG.audio.sfx('frag');
        const cx = X0 + p.cx * K, cy = Y0 + p.cy * K; if (X()) { X().sparkle(cx, cy, '#fff0a0', 8); X().ring(cx, cy, '#ffffff', 40); X().pop(cx, cy - 10, p.t + '!', '#ffe27a', 9); }
        pieces.splice(pieces.indexOf(p), 1); pieces.unshift(p);
        if (placedN === 5) win();
        const free = pieces.filter((q) => !q.placed); sel = free.length ? pieces.indexOf(free[free.length - 1]) : 0;
      } else GG.audio.sfx('click');
    }
    function win() {
      done = true; playing = false; GG.audio.sfx('win'); E.fx.confetti(X0 + 92, 60, 60); if (X()) X().flash('#ffffff', 0.3);
      const bonus = Math.max(0, Math.round(400 - time * 4));
      setTimeout(() => api.end(api.score + bonus, 'Mapa completo em ' + U.fmtTime(time) + '! Bônus de rapidez: +' + bonus + '.'), 1600);
    }
    pointer(sc, {
      pointerdown: (lx, ly) => { if (!playing) return; const p = hitPiece(lx, ly); if (p) { kb = false; drag = { p, ox: lx - p.dx, oy: ly - p.dy }; pieces.splice(pieces.indexOf(p), 1); pieces.push(p); sel = pieces.length - 1; GG.audio.sfx('click'); } },
      pointermove: (lx, ly) => { if (drag) { drag.p.dx = lx - drag.ox; drag.p.dy = ly - drag.oy; } },
      pointerup: () => { if (drag) { const p = drag.p; drag = null; drop(p); } }
    });
    sc.update = function (dt) {
      sc.t += dt; if (playing) time += dt;
      const IN = GG.input;
      if (IN.pressed('pause')) PQ.pause();
      pieces.forEach((p) => { const up = (drag && drag.p === p) || (!drag && kb && pieces[sel] === p && !p.placed); p.lift += ((up ? 1 : 0) - p.lift) * Math.min(1, dt * 12); const tz = p.placed || up || Math.abs(p.dx) + Math.abs(p.dy) < 120 ? 1 : TRAY; p.sz += (tz - p.sz) * Math.min(1, dt * 10); });
      if (!playing) return;
      const free = pieces.filter((p) => !p.placed); if (!free.length) return;
      if (!pieces[sel] || pieces[sel].placed) sel = pieces.indexOf(free[free.length - 1]);
      if (IN.pressed('act')) { const i = free.indexOf(pieces[sel]); sel = pieces.indexOf(free[(i + 1) % free.length]); kb = true; }
      const p = pieces[sel], ax = IN.axisX(), ay = IN.axisY();
      if (ax || ay) { kb = true; p.dx += ax * 90 * dt; p.dy += ay * 90 * dt; }
      if (IN.pressed('jump') && kb) drop(p);
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.photo(c, 'satDia', sc.t, 'rgba(6,20,40,.55)'))) { c.fillStyle = '#123f5a'; c.fillRect(0, 0, E.W, E.H); }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(16, 16, 212, 206); c.fillStyle = '#f3e6c4'; c.fillRect(12, 12, 212, 206);
      c.fillStyle = 'rgba(120,80,30,.15)'; for (let i = 0; i < 6; i++) c.fillRect(12, 30 + i * 32, 212, 1);
      g.text('BRASIL', 118, 15, { size: 6, color: '#6d4c2a', align: 'center', shadow: false });
      c.save(); c.translate(X0, Y0); c.scale(K, K); c.setLineDash([4, 4]); c.lineWidth = 0.6 / K;
      outline.forEach((pa) => { c.fillStyle = 'rgba(90,60,30,.12)'; c.fill(pa); c.strokeStyle = 'rgba(90,60,30,.35)'; c.stroke(pa); });
      c.setLineDash([]); c.restore();
      g.panel(264, 22, 124, 196, 'rgba(15,18,38,.75)', '#3a4290'); g.text('PEÇAS', 326, 27, { size: 5, color: '#ffd23f', align: 'center' });
      pieces.forEach((p) => {
        const lift = p.lift, isSel = pieces[sel] === p && !p.placed;
        c.save(); c.translate(X0 + p.dx, Y0 + p.dy - lift * 3);
        const s = p.sz * (1 + lift * 0.05), pcx = p.cx * K, pcy = p.cy * K; c.translate(pcx, pcy); c.scale(s, s); c.translate(-pcx, -pcy);
        c.scale(K, K);
        if (!p.placed) { const o = (2 + lift * 6) / K; c.save(); c.translate(o * 0.4, o); c.fillStyle = 'rgba(0,0,0,' + (0.25 + lift * 0.1).toFixed(2) + ')'; p.paths.forEach((pa) => c.fill(pa)); c.restore(); }
        p.paths.forEach((pa) => { c.fillStyle = p.c; c.fill(pa); });
        p.paths.forEach((pa) => { c.strokeStyle = p.placed ? 'rgba(255,255,255,.9)' : '#15152a'; c.lineWidth = (p.placed ? 0.5 : 0.8) / K; c.stroke(pa); });
        if (isSel && kb) p.paths.forEach((pa) => { c.strokeStyle = 'rgba(255,230,120,' + (0.6 + 0.4 * Math.sin(sc.t * 6)).toFixed(2) + ')'; c.lineWidth = 1.5 / K; c.stroke(pa); });
        c.restore();
        const lx = X0 + p.dx + p.cx * K, ly = Y0 + p.dy + p.cy * K - lift * 3;
        c.save(); c.font = '900 ' + (p.sz < 0.7 ? 6 : 7) + 'px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 2.5; c.strokeStyle = '#fff'; c.strokeText(p.t, lx, ly); c.fillStyle = '#1b1b2a'; c.fillText(p.t, lx, ly); c.restore();
      });
      if (done && x) x.rays(c, X0 + 92, Y0 + 96, 140, '#fff0c0', sc.t, 10);
      g.text('Tempo ' + U.fmtTime(time), 326, 208, { size: 5, color: '#fff', align: 'center' });
    };
    sc.dbg = {
      solve() { pieces.slice().forEach((p) => { if (!p.placed) { p.dx = 0; p.dy = 0; drop(p); } }); },
      placed: () => placedN,
      /** Primeira peça livre: ponto para pegar (centro na bandeja) e destino (centro no mapa). */
      first() { const p = pieces.find((q) => !q.placed && q.id !== 'norte') || pieces.find((q) => !q.placed); return { x: X0 + p.dx + p.cx * K, y: Y0 + p.dy + p.cy * K, tx: X0 + p.cx * K, ty: Y0 + p.cy * K }; }
    };
    return sc;
  };
})();
