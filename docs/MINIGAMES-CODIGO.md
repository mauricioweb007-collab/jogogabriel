# Código dos minijogos (para reaproveitar)

> Arquivo GERADO por `node src/tools/gen-minigames-md.cjs` em 2026-09-24. Não edite à mão: edite os arquivos de origem (caminho em cada seção) e rode o gerador de novo.
> O guia de reaproveitamento (contrato, dependências e como adaptar a outra matéria) está em `jogodogabriel.md`, seção 8.8.

## Índice

- [`parque.js`](#parquejs) — Runtime do Parque/Arcade (registro, entrada por moedas/perguntas, bilhetes, HUD, fim de jogo, recordes) + 4 jogos do Parque: Memória, Voo da Arara, Cesta da Feira, Quebra-cabeça do Brasil
- [`arcade1.js`](#arcade1js) — Mundo 1: Jangada Radical (DKC/Sonic/dinossauro do Chrome), Colunas do Mosaico (Columns/Puyo), Quebra-Mosaico (Arkanoid)
- [`arcade2.js`](#arcade2js) — Mundo 2: Feira Ninja (Fruit Ninja), Quermesse Tiro ao Alvo (Duck Hunt), Pega-Névoa no Arraial (acerte a toupeira)
- [`arcade3.js`](#arcade3js) — Mundo 3: Estrada Brasil (Road Fighter), Invasores da Poluição (Galaga), Empilha-Prédios (Tower Bloxx)
- [`arcade4.js`](#arcade4js) — Extras: Travessia do Rio (Frogger, Mundo 1) e Pinball da Floresta (Sonic Spinball, Mundo 3)
- [`roleta.js`](#roletajs) — Roleta da Sorte (prêmio do 100% de acerto; sorteia qualquer minijogo para 1 partida bônus)
- [`ritmolivre.js`](#ritmolivrejs) — Ritmo Livre: batalha de ritmo contra o GeoBot (a fase 2-3 usa a mesma mecânica em rhythm.js)
- [`minigames.js`](#minigamesjs) — Inglês (Expresso dos Sonhos): Associação figura ↔ palavra (adaptada da Memória, DOM, com escrita depois) e Caça-Palavras (arrastar, tocar ou teclado)

## parque.js

Runtime do Parque/Arcade (registro, entrada por moedas/perguntas, bilhetes, HUD, fim de jogo, recordes) + 4 jogos do Parque: Memória, Voo da Arara, Cesta da Feira, Quebra-cabeça do Brasil. Caminho: `src/modules/geografia/scenes/parque.js` (599 linhas).

```js
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
    { id: 'memoria', title: 'Memória das Culturas', icon: 'cartas', c1: '#9b4dca', c2: '#3a1f5a', boss: 'c1s5', unlockWorld: 1, music: 'atlas', medals: [200, 420, 620], unit: 'pts',
      desc: 'Vire as cartas e encontre os pares de instrumentos, comidas, bichos e festas do Brasil. 4 erros e acabou!', how: 'Toque em duas cartas (ou use as setas e Espaço) para achar os **pares iguais**. São 3 tabuleiros. Você tem **4 corações**: errar uma carta que **você já tinha visto** é um **erro**. Com **4 erros**, o jogo acaba!' },
    { id: 'arara', title: 'Voo da Arara', icon: 'arara', c1: '#e8456b', c2: '#5a1030', boss: 'c1s5', unlockWorld: 1, music: 'oceano', medals: [150, 300, 480], unit: 'pts',
      desc: 'Voe pelas 5 regiões do Brasil, pegue frutas e desvie das tempestades e das árvores altas.', how: 'Toque na tela ou aperte **Espaço** para a arara bater as asas. Voe pelas **5 regiões** do Brasil!' },
    { id: 'cesta', title: 'Cesta da Feira', icon: 'cesta', c1: '#ff9a3d', c2: '#7a3a10', boss: 'c2s5', unlockWorld: 2, music: 'festa', medals: [220, 420, 650], unit: 'pts',
      desc: 'Encha a banca da feira! Pegue só as comidas do PEDIDO e fuja das frutas estragadas e dos raios.', how: 'Mova a cesta com **← →** ou arrastando o dedo. Pegue as comidas do **PEDIDO** (lá em cima) para encher a banca. **Fruta estragada** e **raio** tiram uma **vida** (são 3); a **chuva** deixa a cesta lenta. Cada pedido entregue deixa a feira mais rápida!' },
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
     para um jogo do Arcade daquele mundo. No modo de teste dos pais, a tela de entrada aparece igual
     (para testar moedas e perguntas no sandbox) com um botão extra "🧪 Entrar grátis (teste)". */
  PQ.COST = 70;
  const tickets = () => { const f = (S().flags = S().flags || {}); f.arcadeTickets = f.arcadeTickets || {}; return f.arcadeTickets; };
  PQ.tickets = (w) => tickets()[w] || 0;
  PQ.giveTicket = (w) => { tickets()[w] = (tickets()[w] || 0) + 1; GEO.save.persist(); };
  const isTest = () => !!(GEO.mode && GEO.mode.isTest && GEO.mode.isTest());
  /** Estudo concluído (os 3 mundos e o final): todos os minijogos ficam livres, sem moedas nem perguntas. */
  PQ.allFree = () => !!S().finalDone;
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
    if (PQ.allFree()) { PQ.play(id); return; }
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
    const acts = [UI.btn('Cancelar', 'ghost', () => m.close()), ask, pay];
    if (isTest()) { m.body.appendChild(U.el('p', { class: 'tip' }, '🧪 Modo de teste: moedas e respostas usadas aqui ficam só no sandbox.')); acts.push(UI.btn('🧪 Entrar grátis (teste)', 'go', () => { m.close(); PQ.play(id); })); }
    m.setActions(acts);
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
    if (PQ.spins && PQ.spins() > 0) m.body.appendChild(U.el('div', { class: 'pq-spin' }, [U.el('b', null, '🎰 Você tem ' + PQ.spins() + ' giro(s) grátis na Roleta da Sorte!'), UI.btn('Girar agora ▶', 'pri small', () => { m.close(); setTimeout(() => PQ.roulette(), 60); })]));
    if (PQ.allFree()) m.body.appendChild(U.el('p', { class: 'pq-wallet' }, '🏆 Estudo concluído! Todos os minijogos estão liberados: jogue à vontade, sem moedas e sem perguntas.'));
    else m.body.appendChild(U.el('p', { class: 'pq-wallet' }, '🪙 ' + S().coins + ' EcoMoedas • entrada: ' + PQ.COST + ' 🪙 ou 2 perguntas' + (tk.length ? ' • 🎟️ bilhetes grátis — ' + tk.join(', ') : '')));
    if (isTest()) {
      const re = () => { m.close(); setTimeout(() => PQ.open(only), 40); };
      const coinsTo = (n) => { const sv = S(); sv.coins = Math.max(0, n); GEO.save.persist(); GEO.hud && GEO.hud.update(); re(); };
      m.body.appendChild(U.el('div', { class: 'pq-test' }, [U.el('b', null, '🧪 Ferramentas de teste (só sandbox): '),
        UI.btn('+100 🪙', 'small', () => coinsTo(S().coins + 100)), UI.btn('Zerar 🪙', 'small', () => coinsTo(0)),
        UI.btn('+1 🎟️ em cada mundo', 'small', () => { [1, 2, 3].forEach((w) => { tickets()[w] = (tickets()[w] || 0) + 1; }); GEO.save.persist(); re(); }),
        UI.btn('Tirar 🎟️', 'small', () => { const f = S().flags; f.arcadeTickets = {}; GEO.save.persist(); re(); }),
        UI.btn(S().finalDone ? 'Desfazer “estudo concluído”' : 'Simular “estudo concluído”', 'small', () => { S().finalDone = !S().finalDone; GEO.save.persist(); re(); }),
        UI.btn('+1 🎰 giro', 'small', () => { PQ.giveSpin(); re(); }),
        UI.btn('Tela de recompensa do chefe', 'small', () => { m.close(); setTimeout(() => GEO.app.arcadeUnlocked(only || 1), 60); })]));
    }
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

  /** opts.bonus: rodada bônus da roleta (1 partida, mesmo que o jogo ainda esteja bloqueado; sem "Jogar de novo"). */
  PQ.play = async function (id, skipIntro, opts) {
    const g = GAMES.find((x) => x.id === id); if (!g) return;
    GG.ui.closeAll && GG.ui.closeAll();
    GG.engine.stop();
    GEO.app.showStage();
    const api = new Api(g); api.bonus = !!(opts && opts.bonus); cur = { g, api };
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
      if (api.bonus) { m.body.appendChild(U.el('p', { class: 'res-rec' }, '🎰 Essa foi a sua rodada bônus da roleta! Acerte 100% em outra fase para ganhar um novo giro.')); m.setActions([UI.btn('🗺️ Atlas', 'pri', () => { m.close(); PQ.exit(false); }), UI.btn('🎡 Parque', '', () => { m.close(); PQ.exit(true); })]); }
      else m.setActions([UI.btn('🗺️ Atlas', 'ghost', () => { m.close(); PQ.exit(false); }), UI.btn('🎡 Parque', '', () => { m.close(); PQ.exit(true); }), UI.btn('🔁 Jogar de novo', 'pri', () => { m.close(); PQ.exit(false); setTimeout(() => PQ.enter(g.id), 80); })]);
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
    // pedido do usuário: 4 erros encerram o jogo. Erro = errar quando uma das cartas já tinha sido vista
    // (a criança deveria lembrar); virar duas cartas novas e errar é só tentativa.
    let bi = 0, cards = [], open = [], lock = 0, pairs = 0, misses = 0, totalPairs = 0, cursor = 0, started = false, labels = [], over = false;
    api.lives = 4; api.maxLives = 4; api.refresh();
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
      c.wasSeen = !!c.seen; c.up = true; open.push(c); GG.audio.sfx('click');
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
        const partnerSeen = cards.some((o) => o !== a && o.id === a.id && o.seen);
        const real = b.wasSeen || partnerSeen;
        a.seen = b.seen = true; lock = 0.95;
        if (real) {
          misses++; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(3, 0.2); if (X()) { X().flash('#ff4d4d', 0.2); X().pop(E.W / 2, 30, 'ERRO! Você já tinha visto essa carta', '#ff8f8f', 8); }
          if (api.lives <= 0) { over = true; lock = 99; setTimeout(() => { a.up = b.up = false; api.end(api.score, '4 erros: fim de jogo! Pares achados: ' + totalPairs + ' • chegou ao tabuleiro ' + (bi + 1) + ' de 3. Dica: lembre onde cada carta estava!'); }, 900); return; }
        } else { GG.audio.sfx('bad'); if (X()) X().pop(E.W / 2, 30, 'Cartas novas — memorize!', '#9ff2ff', 7); }
        setTimeout(() => { a.shake = b.shake = 0.35; }, 350);
        setTimeout(() => { a.up = b.up = false; open = []; }, 900);
      }
    }
    function boardDone() {
      GG.audio.sfx('win'); if (X()) X().flash('#ffffff', 0.25); E.fx.confetti(E.W / 2, 40, 40);
      api.add(50);
      if (bi < BOARDS.length - 1) { bi++; lock = 1.3; setTimeout(layout, 1100); }
      else { const bonus = api.lives * 40; api.add(bonus); setTimeout(() => api.end(api.score, 'Os 3 tabuleiros completos! Erros: ' + misses + ' • bônus dos corações: +' + bonus + '.'), 900); }
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
    sc.dbg = { miss() { const u = cards.filter((c) => !c.done); const a = u[0], b = u.find((c) => c.id !== a.id); a.seen = b.seen = true; lock = 0; open = []; flip(cards.indexOf(a)); flip(cards.indexOf(b)); }, get over() { return over; }, solve() { if (lock > 0 && pairs) return; cards.forEach((c) => { c.done = c.up = true; }); totalPairs += cards.length / 2 - pairs; pairs = cards.length / 2; boardDone(); } };
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
    // pedido do usuário (24/09/2026): objetivo claro (encher a banca com os PEDIDOS), 3 vidas e mais coisas
    // erradas caindo. Fruta estragada (micróbio) e raio tiram vida; chuva deixa a cesta lenta; comida fora do
    // pedido vale pouco e quebra o combo. Cada pedido completo deixa a feira mais rápida.
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const DUR = 90, bk = { x: 200, w: 40, slow: 0, sq: 0, inv: 0 };
    let t = DUR, playing = false, drops = [], spawnT = 0, combo = 0, mult = 1, dragX = null, face = 1, order = null, orders = 0, stall = [], over = false;
    const foods = FOODS.filter((f) => !X() || X().has(f));
    const BADS = ['microbio', 'raio', 'chuva'];
    api.lives = 3; api.refresh(); api.extra('cronometro', DUR + 's');
    function newOrder() {
      const kinds = U.shuffle(foods.slice()).slice(0, orders < 2 ? 2 : 3);
      order = kinds.map((k, i) => ({ k, need: 2 + ((orders + i) % 2) + Math.floor(orders / 3), got: 0 }));
      api.goal('Pedido ' + (orders + 1) + ' da banca: ' + order.map((o) => o.need + ' ' + NAMES[o.k]).join(', '));
    }
    const NAMES = { abacaxi: 'abacaxi', banana: 'banana', coco: 'coco', manga: 'manga', milho: 'milho', melancia: 'melancia', abacate: 'abacate', uva: 'uva', morango: 'morango', limao: 'limão', pao: 'pão', queijo: 'queijo', peixe: 'peixe', cenoura: 'cenoura', tomate: 'tomate' };
    sc.begin = () => { playing = true; newOrder(); };
    pointer(sc, { pointerdown: (lx) => { dragX = lx; }, pointermove: (lx, ly, ev) => { if (dragX != null || ev.pointerType === 'mouse') dragX = lx; }, pointerup: (lx, ly, ev) => { if (ev.pointerType !== 'mouse') dragX = null; } });
    const heat = () => Math.min(1, (DUR - t) / DUR + orders * 0.06);
    function spawn() {
      const r = Math.random(), bad = 0.18 + heat() * 0.2;
      let k;
      if (r < bad) k = U.pick(BADS);
      else if (r < bad + 0.05) k = 'estrela_brilho';
      else if (order && r < bad + 0.5) { const need = order.filter((o) => o.got < o.need); k = need.length ? U.pick(need).k : U.pick(foods); }
      else k = U.pick(foods);
      drops.push({ k, x: 20 + Math.random() * (E.W - 40), y: -14, vy: 55 + Math.random() * 35 + heat() * 70, vx: BADS.includes(k) && Math.random() < 0.3 + heat() * 0.3 ? U.rand(-40, 40) : 0, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3 });
    }
    function hurt(d, why) {
      if (bk.inv > 0) return;
      combo = 0; mult = 1; bk.inv = 1.2; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(4, 0.3);
      if (X()) { X().flash('#ff4d4d', 0.3); X().pop(d.x, 168, why, '#ff8f8f', 8); }
      if (api.lives <= 0) { playing = false; over = true; setTimeout(() => api.end(api.score, 'Acabaram as vidas! Pedidos entregues: ' + orders + '. Fuja das frutas estragadas e dos raios!'), 700); }
    }
    sc.update = function (dt) {
      sc.t += dt; if (bk.slow > 0) bk.slow -= dt; if (bk.inv > 0) bk.inv -= dt; bk.sq *= Math.max(0, 1 - dt * 10);
      const IN = GG.input;
      if (IN.pressed('pause')) PQ.pause();
      if (!playing) return;
      t -= dt; api.extra('cronometro', Math.max(0, Math.ceil(t)) + 's');
      const sp = bk.slow > 0 ? 90 : 215, ax = IN.axisX(), x0 = bk.x;
      if (ax) { bk.x += ax * sp * dt; dragX = null; } else if (dragX != null) bk.x += Math.max(-sp * dt, Math.min(sp * dt, dragX - bk.x));
      bk.x = Math.max(bk.w / 2 + 4, Math.min(E.W - bk.w / 2 - 4, bk.x));
      if (Math.abs(bk.x - x0) > 0.3) face = bk.x > x0 ? 1 : -1;
      bk.moving = Math.abs(bk.x - x0) > 0.3;
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(0.3, 0.8 - heat() * 0.45); }
      drops.forEach((d) => {
        d.y += d.vy * dt; d.x += d.vx * dt; if (d.x < 12 || d.x > E.W - 12) d.vx *= -1; d.rot += d.vr * dt;
        if (!d.got && d.y > 182 && d.y < 202 && Math.abs(d.x - bk.x) < bk.w / 2 + 6) {
          d.got = true; bk.sq = 0.4;
          if (d.k === 'chuva') { combo = 0; mult = 1; bk.slow = 2.5; GG.audio.sfx('bad'); if (X()) { X().pop(d.x, 170, 'Molhou! Cesta lenta', '#9fd8ff', 8); X().puff(bk.x, 190, 4); } return; }
          if (d.k === 'microbio') { hurt(d, 'Fruta estragada! -1 vida'); return; }
          if (d.k === 'raio') { hurt(d, 'Raio! -1 vida'); return; }
          if (d.k === 'estrela_brilho') { api.add(40 * mult); GG.audio.sfx('frag'); if (X()) { X().sparkle(d.x, 186, '#ffe39a', 8); X().pop(d.x, 172, '+' + 40 * mult, '#ffe27a', 8); } return; }
          const o = order && order.find((q) => q.k === d.k && q.got < q.need);
          if (o) {
            o.got++; combo++; const nm = Math.min(5, 1 + Math.floor(combo / 4)); if (nm > mult && X()) X().pop(E.W / 2, 90, 'COMBO x' + nm + '!', '#ffd23f', 14); mult = nm;
            const v = 15 * mult; api.add(v); GG.audio.sfx('coin'); if (X()) { X().sparkle(d.x, 186, '#ffffff', 3); X().pop(d.x, 172, '+' + v, '#ffe27a', 8); }
            if (order.every((q) => q.got >= q.need)) {
              orders++; const bonus = 60 + orders * 20; api.add(bonus); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 30);
              order.forEach((q) => { for (let i = 0; i < q.need; i++) stall.push(q.k); }); stall = stall.slice(-24);
              if (X()) { X().flash('#fff6c0', 0.2); X().pop(E.W / 2, 110, 'PEDIDO ENTREGUE! +' + bonus, '#7bff8f', 11); }
              newOrder();
            }
          } else { combo = 0; mult = 1; api.add(2); GG.audio.note('E4', 0.05); if (X()) X().pop(d.x, 172, 'Não está no pedido', '#c9d0ff', 6); }
        }
        if (!d.got && d.y > E.H + 10) { d.gone = true; if (order && order.some((q) => q.k === d.k && q.got < q.need)) { combo = 0; mult = 1; } }
      });
      drops = drops.filter((d) => !d.got && !d.gone && d.y < E.H + 20);
      if (t <= 0 && playing) { playing = false; api.add(api.lives * 50); setTimeout(() => api.end(api.score, 'Fim da feira! Pedidos entregues: ' + orders + ' • bônus das vidas: +' + api.lives * 50 + '.'), 400); }
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
        // a banca vai enchendo com os pedidos entregues
        if (x) for (let k = 0; k < 6; k++) { const it = stall[i * 6 + k]; if (it) x.ilus(c, it, sx + 10 + k * 14, sy + 30, 14); }
      }
      c.fillStyle = '#c9b89a'; c.fillRect(0, 164, E.W, 61); c.fillStyle = 'rgba(0,0,0,.08)'; for (let yy = 168; yy < E.H; yy += 8) for (let xx = (yy / 8 % 2) * 10; xx < E.W; xx += 20) c.fillRect(xx, yy, 18, 1);
      // quadro do pedido
      if (order) {
        const w = order.length * 40 + 8; g.panel(E.W / 2 - w / 2, 22, w, 30, 'rgba(255,248,230,.95)', '#8b5a2b');
        g.text('PEDIDO ' + (orders + 1), E.W / 2, 24, { size: 4, color: '#8b5a2b', align: 'center', shadow: false });
        order.forEach((o, i) => { const ox = E.W / 2 - w / 2 + 8 + i * 40; if (x) x.ilus(c, o.k, ox + 9, 40, 16, o.got >= o.need ? { gray: true } : null); g.text(o.got + '/' + o.need, ox + 26, 36, { size: 6, color: o.got >= o.need ? '#2e9e6a' : '#2a2233', align: 'center', shadow: false }); });
      }
      drops.forEach((d) => {
        if (!x) { g.circle(d.x, d.y, 6, BADS.includes(d.k) ? '#7fc8ff' : '#ffd23f'); return; }
        c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(d.x, 206, 6 * Math.max(0.1, Math.min(1, d.y / 200)), 1.5, 0, 0, Math.PI * 2); c.fill();
        if (d.k === 'estrela_brilho') x.glow(c, d.x, d.y, 16, '#ffe39a', 0.8);
        if (d.k === 'microbio' || d.k === 'raio') x.glow(c, d.x, d.y, 14, '#ff4d6d', 0.45);
        const wanted = order && order.some((q) => q.k === d.k && q.got < q.need);
        if (wanted) { c.strokeStyle = 'rgba(123,255,143,.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(d.x, d.y, 11, 0, Math.PI * 2); c.stroke(); }
        x.ilus(c, d.k, d.x, d.y, d.k === 'chuva' ? 24 : 18, { rot: BADS.includes(d.k) ? 0 : d.rot });
        if (d.k === 'chuva' && !E.reduced) for (let r = 0; r < 3; r++) g.rect(d.x - 6 + r * 6, d.y + 10 + ((sc.t * 60 + r * 7) % 10), 1, 3, '#7fc8ff');
      });
      const sq = bk.sq;
      if (!(bk.inv > 0 && Math.floor(sc.t * 14) % 2)) {
        g.img(GEO.common.gabrielSide(GEO.eco.look(), bk.moving ? 'run' : 'idle', sc.t), bk.x - 9 - face * 22, 184, { flip: face < 0 });
        if (x) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(bk.x, 208, 20, 3, 0, 0, Math.PI * 2); c.fill(); c.save(); c.translate(bk.x, 206); c.scale(1 + sq * 0.3, 1 - sq * 0.3); x.ilus(c, 'cesta', 0, -14, 40, bk.slow > 0 ? { gray: true } : null); c.restore(); if (bk.slow > 0) x.ilus(c, 'chuva', bk.x, 166, 18); }
        else g.rect(bk.x - 20, 190, 40, 14, '#8b5a2b');
      }
      if (mult > 1) g.text('x' + mult, bk.x, 176, { size: 8, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { t = 0; }, get order() { return order; }, catchNeeded() { const o = order.find((q) => q.got < q.need); drops.push({ k: o.k, x: bk.x, y: 190, vy: 0, vx: 0, rot: 0, vr: 0 }); }, drop(k) { drops.push({ k, x: bk.x, y: 190, vy: 0, vx: 0, rot: 0, vr: 0 }); }, get orders() { return orders; }, get over() { return over; } };
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
```

## arcade1.js

Mundo 1: Jangada Radical (DKC/Sonic/dinossauro do Chrome), Colunas do Mosaico (Columns/Puyo), Quebra-Mosaico (Arkanoid). Caminho: `src/modules/geografia/scenes/arcade1.js` (325 linhas).

```js
/* =====================================================================
   scenes/arcade1.js — ARCADE DO MUNDO 1 (O Mosaico do Povo Brasileiro)
   Recompensa depois do chefe Generalizador: jogos curtos (2–3 min),
   sem perguntas, com 3 vidas e recorde. Inspirados em jogabilidades
   clássicas de 16 bits (nenhum sprite, nome ou fase copiados):
   • Jangada Radical — corrida automática que acelera sem parar, com
     pulo, pulo duplo e abaixar (estilo carrinho de mina de Donkey Kong
     Country / Sonic e o dinossauro do Chrome);
   • Colunas do Mosaico — peças de 3 caem; alinhe 3+ iguais
     (estilo Columns do Mega Drive / Puyo Puyo);
   • Quebra-Mosaico — raquete e bolinha que quebram um mosaico
     (estilo Arkanoid), com poderes que caem dos tijolos.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, C = GEO.common, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ JANGADA RADICAL */
  PQ.register({ id: 'w1_jangada', world: 1, boss: 'c1s5', ref: 'Donkey Kong Country / Sonic', title: 'Jangada Radical', icon: 'veleiro', c1: '#1f8fd0', c2: '#0b3a5c', music: 'corrida', medals: [300, 700, 1200], unit: 'pts',
    desc: 'Surfe com a jangada pelo litoral: pule pedras, troncos e ondas gigantes e pegue peixes e fragmentos!',
    how: 'A jangada anda sozinha e fica **cada vez mais rápida**. **Espaço / ↑** (ou toque em cima) = **pular**; no ar, de novo = **pulo duplo**. **↓** (ou toque embaixo) = **abaixar** para passar debaixo das **redes de pesca** e das gaivotas em rasante. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const SEA = 172, J = { x: 86, y: SEA, vy: 0, air: false, jumps: 0, inv: 0, star: 0, duck: 0 };
    let dist = 0, speed = 140, gear = 0, playing = false, spawnT = 1.2, itemT = 0.6, time = 0, obs = [], items = [], dead = false;
    api.lives = 3; api.refresh(); api.goal('Chegue ao porto (2 min 30 s) sem perder as 3 vidas!');
    sc.begin = () => { playing = true; };
    const jump = () => {
      if (!playing) return;
      if (!J.air) { J.vy = -330; J.air = true; J.jumps = 1; GG.audio.sfx('jump'); if (X()) X().puff(J.x, SEA + 4, 3); }
      else if (J.jumps < 2) { J.vy = -290; J.jumps = 2; GG.audio.sfx('spring'); if (X()) X().sparkle(J.x, J.y, '#9ff2ff', 4); }
    };
    const duck = () => { if (!playing) return; J.duck = 0.55; if (J.air) J.vy = Math.max(J.vy, 420); };
    sc.click = (lx, ly) => { if (ly > 150) duck(); else jump(); };
    function spawn() {
      const lvl = Math.min(1, time / 120), r = Math.random();
      const k = r < 0.26 ? 'pedra' : r < 0.44 ? 'tronco' : r < 0.58 ? 'ave' : r < 0.7 ? 'onda' : r < 0.86 + lvl * 0.04 ? 'rede' : 'rasante';
      const o = { k, x: E.W + 30 };
      if (k === 'pedra') Object.assign(o, { w: 22, h: 20, y: SEA - 18 });
      if (k === 'tronco') Object.assign(o, { w: 34, h: 10, y: SEA - 8 });
      if (k === 'onda') Object.assign(o, { w: 30, h: 44, y: SEA - 42 });
      if (k === 'ave') Object.assign(o, { w: 18, h: 12, y: SEA - 88 - Math.random() * 20 });
      if (k === 'rede') Object.assign(o, { w: 26, h: SEA - 22, y: 0 }); // píer com rede: só passa abaixado
      if (k === 'rasante') Object.assign(o, { w: 20, h: 14, y: SEA - 42 }); // gaivota em voo baixo
      obs.push(o);
    }
    function hurt() {
      if (J.inv > 0 || J.star > 0) return;
      api.lives--; api.refresh(); J.inv = 1.6; GG.audio.sfx('hit'); E.shake(4, 0.3); if (X()) X().flash('#ff4d4d', 0.3);
      if (api.lives <= 0) { playing = false; dead = true; setTimeout(() => api.end(api.score, 'Distância: ' + Math.round(dist / 10) + ' m. Pule mais cedo nas ondas gigantes (pulo duplo)!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt;
      const I = IN();
      if (I.pressed('jump') || I.pressed('up') || I.pressed('act')) jump();
      if (I.down('down')) duck();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      // como o dinossauro do Chrome: acelera sem parar e dá um "tranco" a cada 20 s
      time += dt; speed = Math.min(360, 140 + time * 1.45);
      const ng = Math.floor(time / 20); if (ng > gear) { gear = ng; GG.audio.sfx('boost'); if (X()) X().pop(E.W / 2, 60, 'MAIS RÁPIDO!', '#9ff2ff', 11); }
      if (J.duck > 0) J.duck -= dt; dist += speed * dt; api.extra('cronometro', Math.max(0, Math.ceil(150 - time)) + 's');
      if (Math.floor(dist / 100) !== Math.floor((dist - speed * dt) / 100)) api.add(2);
      J.vy += 900 * dt; J.y += J.vy * dt;
      const surf = SEA + Math.sin(sc.t * 3) * 1.5;
      if (J.y >= surf) { if (J.air && J.vy > 150 && X()) X().puff(J.x, SEA + 4, 4); J.y = surf; J.vy = 0; J.air = false; J.jumps = 0; }
      if (J.inv > 0) J.inv -= dt; if (J.star > 0) J.star -= dt;
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = (Math.max(0.62, 1.55 - time * 0.006) + Math.random() * 0.5) * Math.min(1, 200 / speed + 0.25); }
      itemT -= dt; if (itemT <= 0) { itemT = 0.9 + Math.random() * 0.8; const r = Math.random(); items.push({ k: r < 0.08 ? 'estrela_brilho' : r < 0.25 ? 'frag' : r < 0.6 ? 'peixe' : 'coco', x: E.W + 20, y: SEA - 30 - Math.random() * 70 }); }
      obs.forEach((o) => { o.x -= speed * dt * (o.k === 'ave' || o.k === 'rasante' ? 1.2 : 1); });
      items.forEach((it) => { it.x -= speed * dt; });
      const box = J.duck > 0 && !J.air ? { x: J.x - 16, y: J.y - 16, w: 30, h: 14 } : { x: J.x - 16, y: J.y - 34, w: 30, h: 32 };
      obs.forEach((o) => { if (!o.hit && E.overlap(box, { x: o.x + 3, y: o.y + 2, w: o.w - 6, h: o.h - 3 })) { o.hit = true; if (J.star > 0) { api.add(30); if (X()) X().pop(o.x, o.y, '+30', '#ffd23f', 8); } else hurt(); } });
      items.forEach((it) => {
        if (it.got || Math.hypot(it.x - J.x, it.y - (J.y - 18)) > 20) return;
        it.got = true; const v = it.k === 'frag' ? 25 : it.k === 'peixe' ? 10 : it.k === 'coco' ? 5 : 20;
        if (it.k === 'estrela_brilho') { J.star = 5; GG.audio.sfx('power'); if (X()) X().flash('#ffd23f', 0.3); }
        api.add(v); GG.audio.sfx(it.k === 'frag' ? 'frag' : 'coin'); if (X()) { X().sparkle(it.x, it.y, '#fff0a0', 4); X().pop(it.x, it.y - 8, '+' + v, '#ffe27a', 7); }
      });
      obs = obs.filter((o) => o.x > -60); items = items.filter((it) => it.x > -30 && !it.got);
      if (time >= 150 && !dead) { playing = false; api.add(250); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 50, 60); setTimeout(() => api.end(api.score, 'Você chegou ao porto! +250 de bônus.'), 900); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'estrada', dist * 0.6, 0, sc.t, { horizon: 128 }))) { c.fillStyle = '#7fd4ff'; c.fillRect(0, 0, E.W, E.H); }
      // mar com ondas em camadas
      const sea = c.createLinearGradient(0, 128, 0, E.H); sea.addColorStop(0, '#2f9be0'); sea.addColorStop(1, '#0b4a86'); c.fillStyle = sea; c.fillRect(0, 128, E.W, E.H - 128);
      for (let row = 0; row < 6; row++) { const y = 136 + row * 16, sp = 0.3 + row * 0.25; c.fillStyle = 'rgba(255,255,255,' + (0.1 + row * 0.04) + ')'; for (let xx = -((dist * sp) % 48) - 48; xx < E.W; xx += 48) c.fillRect(xx + (row % 2) * 24, y + Math.sin(sc.t * 2 + row) * 1.5, 18, 2); }
      obs.forEach((o) => {
        if (o.k === 'pedra') { c.fillStyle = '#6b6f7a'; c.beginPath(); c.moveTo(o.x, o.y + o.h); c.lineTo(o.x + 4, o.y + 4); c.lineTo(o.x + o.w / 2, o.y); c.lineTo(o.x + o.w - 3, o.y + 6); c.lineTo(o.x + o.w, o.y + o.h); c.fill(); c.fillStyle = '#9aa0ab'; c.fillRect(o.x + 6, o.y + 5, 5, 3); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(o.x - 3, o.y + o.h - 2, o.w + 6, 3); }
        if (o.k === 'tronco') { c.fillStyle = '#7a4a26'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = '#a0683a'; c.beginPath(); c.ellipse(o.x + o.w, o.y + o.h / 2, 3, o.h / 2, 0, 0, Math.PI * 2); c.fill(); }
        if (o.k === 'onda') { const gr = c.createLinearGradient(0, o.y, 0, o.y + o.h); gr.addColorStop(0, '#e8fbff'); gr.addColorStop(0.3, '#6fd0ff'); gr.addColorStop(1, '#1f78c8'); c.fillStyle = gr; c.beginPath(); c.moveTo(o.x - 6, o.y + o.h); c.quadraticCurveTo(o.x, o.y - 4, o.x + o.w, o.y + 4); c.quadraticCurveTo(o.x + o.w - 8, o.y + 14, o.x + o.w + 8, o.y + o.h); c.fill(); g.text('!', o.x + 12, o.y - 14, { size: 7, color: '#ff5d6c' }); }
        if (o.k === 'rede') { c.fillStyle = '#7a4a26'; c.fillRect(o.x - 6, 0, o.w + 12, 10); c.fillStyle = '#a0683a'; c.fillRect(o.x - 6, 8, o.w + 12, 3); c.fillRect(o.x - 4, 0, 4, o.h + 10); c.fillRect(o.x + o.w, 0, 4, o.h + 10);
          c.strokeStyle = 'rgba(240,240,220,.85)'; c.lineWidth = 1; for (let k = 0; k <= o.w; k += 5) { c.beginPath(); c.moveTo(o.x + k, 11); c.lineTo(o.x + k, o.h); c.stroke(); } for (let yy = 14; yy < o.h; yy += 6) { c.beginPath(); c.moveTo(o.x, yy); c.lineTo(o.x + o.w, yy); c.stroke(); }
          if (o.x > J.x + 20 && Math.floor(sc.t * 6) % 2) g.text('↓ ABAIXE!', o.x + o.w / 2, o.h + 4, { size: 6, color: '#ffd23f', align: 'center' }); }
        if (o.k === 'rasante') { const f = Math.sin(sc.t * 18 + o.x) * 5; c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(o.x, o.y + 5 - f); c.quadraticCurveTo(o.x + 5, o.y, o.x + 10, o.y + 7); c.quadraticCurveTo(o.x + 15, o.y, o.x + 20, o.y + 5 - f); c.stroke(); c.fillStyle = '#ffb02e'; c.fillRect(o.x - 3, o.y + 6, 4, 2); if (o.x > J.x + 20 && Math.floor(sc.t * 6) % 2) g.text('↓', o.x + 10, o.y - 10, { size: 7, color: '#ffd23f', align: 'center' }); }
        if (o.k === 'ave') { const f = Math.sin(sc.t * 14 + o.x) * 4; c.strokeStyle = '#f4f4f4'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(o.x, o.y + 4 - f); c.quadraticCurveTo(o.x + 5, o.y, o.x + 9, o.y + 6); c.quadraticCurveTo(o.x + 13, o.y, o.x + 18, o.y + 4 - f); c.stroke(); c.fillStyle = '#ffb02e'; c.fillRect(o.x + 8, o.y + 6, 3, 2); }
      });
      items.forEach((it) => { const bob = Math.sin(sc.t * 5 + it.x * 0.05) * 2; if (x) x.glow(c, it.x, it.y + bob, 10, '#fff3b0', 0.5); if (it.k === 'frag') g.img(GG.pixel.fragmento(Math.floor(sc.t * 4) % 2), it.x - 6, it.y - 6 + bob); else if (!(x && x.ilus(c, it.k, it.x, it.y + bob, 15))) g.circle(it.x, it.y, 5, '#ffd23f'); });
      // jangada + Gabriel
      if (!(J.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        const tilt = J.air ? Math.max(-0.35, Math.min(0.35, J.vy / 900)) : Math.sin(sc.t * 3) * 0.04;
        c.save(); c.translate(J.x, J.y); c.rotate(tilt);
        const ducking = J.duck > 0 && !J.air;
        if (J.star > 0) { const hue = sc.t * 400 % 360; c.strokeStyle = 'hsl(' + hue + ',95%,60%)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, -18, 30, 26, 0, 0, Math.PI * 2); c.stroke(); if (x && !E.reduced && Math.random() < 0.5) x.sparkle(J.x + U.rand(-24, 24), J.y - 18 + U.rand(-20, 20), 'hsl(' + hue + ',95%,70%)', 1); }
        c.fillStyle = '#6b3f1d'; for (let i = 0; i < 4; i++) c.fillRect(-20, -5 + i * 0 - (i % 2), 40, 5 - (i % 2)); c.fillStyle = '#8a5a2e'; c.fillRect(-20, -6, 40, 3);
        const mh = ducking ? 18 : 40;
        c.fillStyle = '#5a3a1a'; c.fillRect(-2, -4 - mh, 2, mh);
        c.fillStyle = '#fff8e6'; c.beginPath(); c.moveTo(0, -4 - mh); c.lineTo(20, -12 + (ducking ? 4 : 0)); c.lineTo(0, -10 + (ducking ? 4 : 0)); c.closePath(); c.fill(); c.fillStyle = '#e5484d'; c.fillRect(2, ducking ? -14 : -30, 10, 3);
        if (ducking) { c.save(); c.translate(0, -4); c.scale(1.1, 0.5); c.drawImage(C.gabrielSide(GEO.eco.look(), 'idle', sc.t), -16, -26); c.restore(); }
        else c.drawImage(C.gabrielSide(GEO.eco.look(), J.air ? 'jump' : 'idle', sc.t), -16, -30);
        c.restore();
        if (!J.air && playing && Math.random() < 0.4 && x) x.puff(J.x - 22, SEA + 2, 1, -1);
      }
      if (J.star > 0) g.text('INVENCÍVEL ' + Math.ceil(J.star), E.W / 2, 22, { size: 7, color: '#ffd23f', align: 'center' });
      g.text(Math.round(speed / 3.6) + ' nós', E.W - 30, 14, { size: 5, color: '#fff', align: 'center' });
      g.rect(100, 6, 200, 4, 'rgba(0,0,0,.35)'); g.rect(100, 6, 200 * Math.min(1, time / 150), 4, '#ffd23f'); if (x) x.ilus(c, 'veleiro', 100 + 200 * Math.min(1, time / 150), 8, 12);
    };
    sc.dbg = { J, star() { J.star = 5; }, end() { api.lives = 1; J.inv = 0; J.star = 0; hurt(); } };
    return sc;
  });

  /* ================================================================ COLUNAS DO MOSAICO */
  const GEM = [{ c: '#e5484d', i: 'pena' }, { c: '#3ec1ff', i: 'pomba' }, { c: '#35e07a', i: 'girassol' }, { c: '#ffd23f', i: 'atabaque' }, { c: '#b07bff', i: 'maracas' }];
  PQ.register({ id: 'w1_colunas', world: 1, boss: 'c1s5', ref: 'Columns (Mega Drive) / Puyo Puyo', title: 'Colunas do Mosaico', icon: 'diamante', c1: '#8a3fd0', c2: '#2e1250', music: 'labirinto', medals: [800, 2000, 4000], unit: 'pts',
    desc: 'Peças do mosaico caem em colunas de 3. Junte 3 ou mais iguais em linha, coluna ou diagonal!',
    how: '**← →** movem a coluna, **↑ / Espaço** trocam a ordem das cores, **↓** desce rápido. Junte **3 iguais** (em pé, deitado ou na diagonal). A **estrela** limpa todas as peças da cor onde cair! A cada **6 combinações** sobe o **nível** e as peças caem mais rápido (como no Tetris). Tabuleiro cheio tira **1 das 3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const COLS = 6, ROWS = 12, CS = 15, BX = 155, BY = 24;
    let grid = [], piece = null, next = null, fallT = 0, playing = false, lvl = 1, cleared = 0, clearing = null, chain = 0, time = 0, moveT = 0, combos = 0, lostT = 0;
    api.lives = 3; api.refresh();
    const fresh = () => { grid = []; for (let y = 0; y < ROWS; y++) grid.push(new Array(COLS).fill(-1)); };
    const newPiece = () => ({ x: 2, y: -3, g: Math.random() < 0.05 ? [9, 9, 9] : [0, 0, 0].map(() => Math.floor(Math.random() * GEM.length)) });
    fresh(); next = newPiece();
    function spawn() { piece = next; next = newPiece(); piece.x = 2; piece.y = -3; if (grid[0][2] !== -1) lose(); }
    // Tabuleiro cheio = perde 1 das 3 vidas: o jogo PARA 2 s com o aviso, limpa só a metade de cima e continua.
    function lose() {
      if (lostT > 0) return;
      api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(5, 0.4); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; piece = null; setTimeout(() => api.end(api.score, 'Peças limpas: ' + cleared + ' • nível ' + lvl + '. Dica: planeje as diagonais!'), 700); return; }
      piece = null; lostT = 2;
      for (let y = 0; y < ROWS / 2; y++) grid[y].fill(-1);
      api.goal('Tabuleiro cheio! Vida perdida — restam ' + api.lives + '. A parte de cima foi limpa.');
    }
    sc.begin = () => { playing = true; spawn(); api.goal('Junte 3 ou mais peças iguais!'); };
    const cellFree = (x, y) => x >= 0 && x < COLS && y < ROWS && (y < 0 || grid[y][x] === -1);
    const canPlace = (x, y) => [0, 1, 2].every((i) => cellFree(x, y + i));
    function lock() {
      piece.g.forEach((v, i) => { const y = piece.y + i; if (y >= 0) grid[y][piece.x] = v; });
      GG.audio.sfx('stomp');
      if (piece.g[0] === 9) { // estrela mágica: limpa a cor de baixo
        const below = piece.y + 3 < ROWS ? grid[piece.y + 3][piece.x] : -1; const mark = new Set();
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] === 9 || (below >= 0 && grid[y][x] === below)) mark.add(y * COLS + x);
        piece = null; startClear(mark); return;
      }
      piece = null; chain = 0; resolve();
    }
    function findMatches() {
      const mark = new Set();
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const v = grid[y][x]; if (v < 0 || v === 9) continue;
        [[1, 0], [0, 1], [1, 1], [1, -1]].forEach(([dx, dy]) => {
          let n = 1; while (grid[y + dy * n] && grid[y + dy * n][x + dx * n] === v) n++;
          if (n >= 3) for (let k = 0; k < n; k++) mark.add((y + dy * k) * COLS + (x + dx * k));
        });
      }
      return mark;
    }
    function resolve() { const m = findMatches(); if (m.size) { chain++; startClear(m); } else spawn(); }
    function startClear(mark) {
      clearing = { mark, t: 0.35 }; combos++;
      const pts = mark.size * 10 * chain * lvl; api.add(pts); cleared += mark.size;
      GG.audio.sfx(chain > 1 ? 'frag' : 'ok');
      mark.forEach((k) => { const x = k % COLS, y = Math.floor(k / COLS); if (X()) X().sparkle(BX + x * CS + CS / 2, BY + y * CS + CS / 2, GEM[grid[y][x]] ? GEM[grid[y][x]].c : '#fff', 2); });
      if (X()) X().pop(BX + COLS * CS / 2, BY + 60, (chain > 1 ? 'CORRENTE x' + chain + '  ' : '') + '+' + pts, '#ffe27a', 9);
      const nl = 1 + Math.floor(combos / 6); // pedido do usuário: a cada 6 combinações, sobe o nível e a peça cai mais rápido
      if (nl > lvl) { lvl = nl; GG.audio.sfx('power'); if (X()) X().pop(BX + COLS * CS / 2, BY + 90, 'NÍVEL ' + lvl + '! MAIS RÁPIDO', '#9ff2ff', 9); }
    }
    function collapse() {
      for (let x = 0; x < COLS; x++) { const col = []; for (let y = ROWS - 1; y >= 0; y--) if (grid[y][x] !== -1) col.push(grid[y][x]); for (let y = ROWS - 1, i = 0; y >= 0; y--, i++) grid[y][x] = i < col.length ? col[i] : -1; }
    }
    sc.click = function (lx) { if (!piece || !playing) return; if (lx < BX - 4) move(-1); else if (lx > BX + COLS * CS + 4) move(1); else rotate(); };
    const move = (d) => { if (piece && canPlace(piece.x + d, piece.y)) { piece.x += d; GG.audio.sfx('click'); } };
    const rotate = () => { if (piece) { piece.g.unshift(piece.g.pop()); GG.audio.sfx('click'); } };
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('estrela', 'Nível ' + lvl);
      if (lostT > 0) { lostT -= dt; if (lostT <= 0) { collapse(); spawn(); } return; }
      if (clearing) { clearing.t -= dt; if (clearing.t <= 0) { clearing.mark.forEach((k) => { grid[Math.floor(k / COLS)][k % COLS] = -1; }); clearing = null; collapse(); resolve(); } return; }
      if (!piece) return;
      if (I.pressed('left')) { move(-1); moveT = 0.22; } else if (I.pressed('right')) { move(1); moveT = 0.22; }
      else if (I.down('left') || I.down('right')) { moveT -= dt; if (moveT <= 0) { move(I.down('left') ? -1 : 1); moveT = 0.07; } }
      if (I.pressed('up') || I.pressed('jump')) rotate();
      if (I.pressed('act')) { while (canPlace(piece.x, piece.y + 1)) piece.y++; if (piece.y < 0) lose(); else lock(); return; }
      fallT += dt * (I.down('down') ? 12 : 1);
      const iv = Math.max(0.12, 0.85 * Math.pow(0.86, lvl - 1));
      if (fallT >= iv) { fallT = 0; if (canPlace(piece.x, piece.y + 1)) piece.y++; else if (piece.y < 0) lose(); else lock(); }
      if (time >= 180) { playing = false; piece = null; setTimeout(() => api.end(api.score, 'Tempo esgotado! Peças limpas: ' + cleared + '.'), 500); }
    };
    function tile(c, x, v, px, py, s) {
      if (v === 9) { if (x) x.glow(c, px + s / 2, py + s / 2, s, '#ffd23f', 0.8); if (!(x && x.ilus(c, 'estrela_brilho', px + s / 2, py + s / 2, s))) { c.fillStyle = '#ffd23f'; c.fillRect(px, py, s, s); } return; }
      const G = GEM[v]; const gr = c.createLinearGradient(px, py, px, py + s); gr.addColorStop(0, G.c); gr.addColorStop(1, GG.pixel.shade(G.c, -60));
      c.fillStyle = gr; c.fillRect(px + 0.5, py + 0.5, s - 1, s - 1); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(px + 1, py + 1, s - 2, 2);
      if (x) x.ilus(c, G.i, px + s / 2, py + s / 2 + 0.5, s - 4);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'mosaico', sc.t * 10, 0, sc.t, { horizon: 240 }))) { c.fillStyle = '#1a1030'; c.fillRect(0, 0, E.W, E.H); }
      g.panel(BX - 4, BY - 4, COLS * CS + 8, ROWS * CS + 8, 'rgba(10,8,30,.85)', '#ffd23f');
      for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) {
        const v = grid[y][xx]; if (v < 0) continue;
        if (clearing && clearing.mark.has(y * COLS + xx) && Math.floor(sc.t * 20) % 2) { c.fillStyle = '#fff'; c.fillRect(BX + xx * CS, BY + y * CS, CS, CS); continue; }
        tile(c, x, v, BX + xx * CS, BY + y * CS, CS);
      }
      if (piece) {
        let gy = piece.y; while (canPlace(piece.x, gy + 1)) gy++;
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.strokeRect(BX + piece.x * CS + 0.5, BY + gy * CS + 0.5, CS - 1, CS * 3 - 1);
        piece.g.forEach((v, i) => { const y = piece.y + i; if (y >= 0) tile(c, x, v, BX + piece.x * CS, BY + y * CS, CS); });
      }
      g.panel(BX + COLS * CS + 16, BY, 44, 64, 'rgba(10,8,30,.85)', '#3a4290'); g.text('PRÓXIMA', BX + COLS * CS + 38, BY + 4, { size: 4, color: '#ffd23f', align: 'center' });
      if (next) next.g.forEach((v, i) => tile(c, x, v, BX + COLS * CS + 31, BY + 14 + i * CS, CS));
      g.text('NÍVEL ' + lvl + ' • próximo em ' + (6 - combos % 6) + ' combinações', BX + COLS * CS / 2, BY - 12, { size: 4.5, color: '#9ff2ff', align: 'center' });
      if (lostT > 0) { g.panel(BX - 30, BY + 60, COLS * CS + 60, 44, 'rgba(40,8,20,.92)', '#ff5d6c'); g.text('TABULEIRO CHEIO!', BX + COLS * CS / 2, BY + 66, { size: 8, color: '#ff8f8f', align: 'center' }); g.text('Vida perdida — restam ' + api.lives, BX + COLS * CS / 2, BY + 82, { size: 6, color: '#fff', align: 'center' }); g.text('continua em ' + Math.ceil(lostT) + '…', BX + COLS * CS / 2, BY + 93, { size: 5, color: '#ffd23f', align: 'center' }); }
      g.text('←→ mover  ↑ trocar  ↓ descer', BX + COLS * CS / 2, BY + ROWS * CS + 8, { size: 4, color: '#b9bde6', align: 'center' });
      if (x) { x.ilus(c, 'pena', 60, 80 + Math.sin(sc.t) * 4, 34); x.ilus(c, 'atabaque', 70, 140 + Math.sin(sc.t + 1) * 4, 30); x.ilus(c, 'pomba', 330, 150 + Math.sin(sc.t + 2) * 4, 30); }
    };
    sc.dbg = { end() { api.lives = 1; lose(); } };
    return sc;
  });

  /* ================================================================ QUEBRA-MOSAICO */
  const LEVELS = [
    ['GGGGGGGGGGGG', 'GGGGGYYGGGGG', 'GGGYYBBYYGGG', 'GYYBBWWBBYYG', 'GGGYYBBYYGGG', 'GGGGGYYGGGGG', 'GGGGGGGGGGGG'], // bandeira
    ['RROOYYGGBBPP', 'RROOYYGGBBPP', 'SS..SSSS..SS', 'PPBBGGYYOORR', 'PPBBGGYYOORR', '............', 'WWWWWWWWWWWW'], // mosaico
    ['..RR....RR..', '.RRRR..RRRR.', 'RRRRRRRRRRRR', 'RRRRRRRRRRRR', '.RRRRRRRRRR.', '..RRRRRRRR..', '....RRRR....'] // coração
  ];
  const BC = { G: '#2fae5a', Y: '#ffd23f', B: '#2e5bd8', W: '#f4f4ff', R: '#e5484d', O: '#ff9a3d', P: '#b07bff', S: '#a9b0c4' };
  PQ.register({ id: 'w1_quebra', world: 1, boss: 'c1s5', ref: 'Arkanoid', title: 'Quebra-Mosaico', icon: 'paleta', c1: '#e8456b', c2: '#4a1030', music: 'festa', medals: [600, 1400, 2400], unit: 'pts',
    desc: 'Rebata a bolinha e quebre os mosaicos coloridos: bandeira, arte e coração! Pegue os poderes que caem.',
    how: 'Mova a prancha com **← →** (ou o mouse/dedo). **Espaço** ou toque lança a bolinha. Pegue os poderes: **prancha grande**, **3 bolinhas**, **bola lenta** e **vida**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const BW = 28, BH = 9, BX0 = 22, BY0 = 30;
    const pad = { x: 200, w: 50, wide: 0 };
    let balls = [], bricks = [], caps = [], lvl = 0, playing = false, stuck = true, slow = 0, time = 0, mouseX = null;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointermove: (lx) => { mouseX = lx; }, pointerdown: (lx) => { mouseX = lx; if (stuck && playing) launch(); } });
    function load() {
      bricks = []; LEVELS[lvl % LEVELS.length].forEach((row, r) => row.split('').forEach((ch, i) => { if (ch === '.') return; bricks.push({ x: BX0 + i * (BW + 2), y: BY0 + r * (BH + 2), col: BC[ch], hp: ch === 'S' ? 2 : 1, cap: Math.random() < 0.12 ? U.pick(['wide', 'multi', 'slow', 'wide', 'life']) : null, r }); }));
      api.goal('Mosaico ' + (lvl + 1) + ': ' + ['Bandeira do Brasil', 'Mosaico colorido', 'Coração'][lvl % 3]);
      reset();
    }
    function reset() { balls = [{ x: pad.x, y: 196, vx: 0, vy: 0 }]; stuck = true; }
    function launch() { stuck = false; const sp = 150 + lvl * 12; balls.forEach((b) => { b.vx = sp * 0.5; b.vy = -sp; }); GG.audio.sfx('shoot'); }
    sc.begin = () => { playing = true; load(); };
    sc.click = () => { if (stuck && playing) launch(); };
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(180 - time)) + 's');
      if (pad.wide > 0) pad.wide -= dt; if (slow > 0) slow -= dt;
      pad.w = pad.wide > 0 ? 78 : 50;
      const ax = I.axisX(); if (ax) { pad.x += ax * 230 * dt; mouseX = null; } else if (mouseX != null) pad.x += (mouseX - pad.x) * Math.min(1, dt * 14);
      pad.x = U.clamp(pad.x, 10 + pad.w / 2, E.W - 10 - pad.w / 2);
      if (stuck) { balls[0].x = pad.x; balls[0].y = 196; if (I.pressed('jump') || I.pressed('act') || I.pressed('up')) launch(); return; }
      const k = slow > 0 ? 0.6 : 1;
      balls.forEach((b) => {
        for (let s = 0; s < 2; s++) {
          b.x += b.vx * dt * k / 2; b.y += b.vy * dt * k / 2;
          if (b.x < 12 || b.x > E.W - 12) { b.vx *= -1; b.x = U.clamp(b.x, 12, E.W - 12); GG.audio.note('A5', 0.03); }
          if (b.y < 20) { b.vy = Math.abs(b.vy); }
          if (b.vy > 0 && b.y > 199 && b.y < 206 && Math.abs(b.x - pad.x) < pad.w / 2 + 3) {
            const off = (b.x - pad.x) / (pad.w / 2), sp = Math.hypot(b.vx, b.vy) * 1.01; const a = off * 1.05;
            b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; GG.audio.note('C5', 0.05); if (X()) X().ring(b.x, 203, '#9ff2ff', 12);
          }
          for (const br of bricks) {
            if (br.dead || b.x < br.x - 3 || b.x > br.x + BW + 3 || b.y < br.y - 3 || b.y > br.y + BH + 3) continue;
            const fromSide = Math.min(Math.abs(b.x - br.x), Math.abs(b.x - br.x - BW)) < Math.min(Math.abs(b.y - br.y), Math.abs(b.y - br.y - BH));
            if (fromSide) b.vx *= -1; else b.vy *= -1;
            br.hp--; if (br.hp <= 0) {
              br.dead = true; api.add(10 + (7 - br.r) * 2); GG.audio.note(['C6', 'B5', 'A5', 'G5', 'F5', 'E5', 'D5'][br.r] || 'C5', 0.07);
              if (X()) X().sparkle(br.x + BW / 2, br.y + BH / 2, br.col, 3); E.fx.burst(br.x + BW / 2, br.y + BH / 2, br.col, 6, 70);
              if (br.cap) caps.push({ k: br.cap, x: br.x + BW / 2, y: br.y });
            } else GG.audio.note('G6', 0.04);
            break;
          }
        }
      });
      balls = balls.filter((b) => b.y < E.H + 10);
      if (!balls.length) { api.lives--; api.refresh(); GG.audio.sfx('hit'); if (X()) X().flash('#ff4d4d', 0.3); if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Mosaicos completos: ' + lvl + '.'), 600); return; } reset(); }
      caps.forEach((cp) => { cp.y += 60 * dt; if (!cp.got && cp.y > 196 && cp.y < 210 && Math.abs(cp.x - pad.x) < pad.w / 2 + 6) { cp.got = true; GG.audio.sfx('power'); api.add(15);
        if (cp.k === 'wide') pad.wide = 12; if (cp.k === 'slow') slow = 8; if (cp.k === 'life') { api.lives = Math.min(5, api.lives + 1); api.maxLives = Math.max(api.maxLives, api.lives); api.refresh(); }
        if (cp.k === 'multi') { const b0 = balls[0]; if (b0) [-0.5, 0.5].forEach((d) => balls.push({ x: b0.x, y: b0.y, vx: b0.vx * Math.cos(d) - b0.vy * Math.sin(d), vy: b0.vx * Math.sin(d) + b0.vy * Math.cos(d) })); }
        if (X()) X().pop(cp.x, 186, { wide: 'PRANCHA GRANDE!', slow: 'BOLA LENTA!', life: '+1 VIDA!', multi: '3 BOLINHAS!' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.got && cp.y < E.H);
      if (bricks.every((br) => br.dead)) { lvl++; api.add(200); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 50); caps = []; load(); }
      if (time >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo esgotado! Mosaicos completos: ' + lvl + '.'), 500); }
    };
    const CAPI = { wide: 'estrela', multi: 'balao', slow: 'tartaruga', life: 'coracao' };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.photo(c, 'satDia', sc.t, 'rgba(10,12,40,.72)'))) { c.fillStyle = '#12173a'; c.fillRect(0, 0, E.W, E.H); }
      c.strokeStyle = 'rgba(255,210,63,.6)'; c.lineWidth = 2; c.strokeRect(9, 17, E.W - 18, E.H - 12);
      bricks.forEach((br) => {
        if (br.dead) return;
        const gr = c.createLinearGradient(0, br.y, 0, br.y + BH); gr.addColorStop(0, br.col); gr.addColorStop(1, GG.pixel.shade(br.col, -55));
        c.fillStyle = gr; c.fillRect(br.x, br.y, BW, BH); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(br.x, br.y, BW, 2);
        if (br.hp > 1) { c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(br.x + 1, br.y + 1, BW - 2, BH - 2); }
        if (br.cap) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(br.x + BW / 2 - 1, br.y + 3, 2, 3); }
      });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, CAPI[cp.k], cp.x, cp.y, 13, { rot: Math.sin(sc.t * 5) * 0.2 }); } else g.circle(cp.x, cp.y, 5, '#9ff2ff'); });
      // prancha (jangada) e bolinhas
      const pw = pad.w; c.fillStyle = '#6b3f1d'; c.fillRect(pad.x - pw / 2, 203, pw, 6); c.fillStyle = '#a0683a'; c.fillRect(pad.x - pw / 2, 203, pw, 2);
      c.fillStyle = '#ffd23f'; c.fillRect(pad.x - pw / 2 - 3, 202, 4, 8); c.fillRect(pad.x + pw / 2 - 1, 202, 4, 8);
      balls.forEach((b) => { if (x) x.glow(c, b.x, b.y, 9, slow > 0 ? '#7bff8f' : '#ffffff', 0.7); g.circle(b.x, b.y, 3, '#fff'); });
      if (stuck && playing) g.text('ESPAÇO / TOQUE PARA LANÇAR', E.W / 2, 170, { size: 6, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; stuck = false; balls = []; } };
    return sc;
  });
})();
```

## arcade2.js

Mundo 2: Feira Ninja (Fruit Ninja), Quermesse Tiro ao Alvo (Duck Hunt), Pega-Névoa no Arraial (acerte a toupeira). Caminho: `src/modules/geografia/scenes/arcade2.js` (252 linhas).

```js
/* =====================================================================
   scenes/arcade2.js — ARCADE DO MUNDO 2 (Culturas que se Encontram)
   Recompensa depois do chefe Sombra do Preconceito. Jogos curtos, sem
   perguntas, com vidas/metas e recorde:
   • Feira Ninja — frutas brasileiras voam; corte deslizando o dedo ou
     o mouse (ou mova o facão com as setas e segure Espaço). Não corte
     a pimenta! (estilo Fruit Ninja)
   • Quermesse Tiro ao Alvo — barraca de festa junina com alvos em
     esteiras; mire e atire rolhas; bata a meta de cada rodada
     (estilo Duck Hunt / Yoshi's Safari)
   • Pega-Névoa no Arraial — as Névoas da Confusão saem das panelas de
     barro; capture rápido e não acerte os amigos (estilo "acerte a
     toupeira" dos jogos de festa)
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  function arraial(g, c, x, t, night) {
    const bg = c.createLinearGradient(0, 0, 0, E.H); bg.addColorStop(0, night ? '#0b1030' : '#ff9a6b'); bg.addColorStop(1, night ? '#3a1a4a' : '#ffd29a'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H);
    if (night) for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(t * 2 + i)).toFixed(2) + ')'; c.fillRect((i * 97) % E.W, (i * 41) % 90, 1, 1); }
    for (let r = 0; r < 2; r++) { const yy = 14 + r * 16; c.strokeStyle = '#5a3d2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(E.W / 2, yy + 10, E.W, yy); c.stroke();
      for (let i = 0; i < 20; i++) { const bx = i * 21 + r * 10, by = yy + Math.sin(i / 20 * Math.PI) * 9; c.fillStyle = ['#e5484d', '#3ec1ff', '#2ecc71', '#f1c40f', '#9b59b6'][(i + r) % 5]; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 5, by + 9 + Math.sin(t * 3 + i) * 1); c.lineTo(bx + 10, by); c.fill(); } }
  }

  /* ================================================================ FEIRA NINJA */
  const FRUITS = [['abacaxi', '#ffd23f'], ['manga', '#ff9a3d'], ['banana', '#ffe066'], ['coco', '#f4f4f4'], ['melancia', '#ff4d6d'], ['morango', '#e5484d'], ['uva', '#9b59b6'], ['limao', '#9ee35a'], ['abacate', '#7bc043']];
  PQ.register({ id: 'w2_ninja', world: 2, boss: 'c2s5', ref: 'Fruit Ninja', title: 'Feira Ninja', icon: 'abacaxi', c1: '#2ecc71', c2: '#0f4a28', music: 'festa', medals: [250, 600, 1000], unit: 'pts',
    desc: 'As frutas da feira voam pelo ar! Corte todas deslizando o dedo — mas NÃO corte a pimenta ardida.',
    how: '**Deslize** o dedo ou o mouse sobre as frutas para cortar. No teclado: mova o facão com as **setas** e **segure Espaço** para cortar. Deixar fruta cair ou cortar **pimenta** tira 1 vida (**3 vidas**). Corte 3 de uma vez = **combo**!' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let fr = [], halves = [], trail = [], playing = false, waveT = 1, time = 0, down = false, slowmo = 0, combo = [], lastCut = 0;
    const blade = { x: 200, y: 110 };
    api.lives = 3; api.refresh(); api.goal('Corte as frutas! Não corte a pimenta.');
    PQ.pointer(sc, { pointerdown: (lx, ly) => { down = true; trail = [{ x: lx, y: ly, t: sc.t }]; }, pointermove: (lx, ly) => { if (down) trail.push({ x: lx, y: ly, t: sc.t }); }, pointerup: () => { down = false; } });
    sc.begin = () => { playing = true; };
    function launch() {
      const n = 1 + Math.floor(Math.random() * Math.min(4, 1 + time / 25));
      for (let i = 0; i < n; i++) {
        const r = Math.random(), k = r < 0.12 + Math.min(0.08, time / 1500) ? 'pimenta' : r < 0.16 ? 'estrela_brilho' : null;
        const F = k ? [k, k === 'pimenta' ? '#e5484d' : '#ffd23f'] : U.pick(FRUITS);
        const x0 = 60 + Math.random() * 280;
        fr.push({ k: F[0], col: F[1], x: x0, y: E.H + 16, vx: (200 - x0) * 0.35 + (Math.random() - 0.5) * 40, vy: -250 - Math.random() * 60, rot: 0, vr: (Math.random() - 0.5) * 5, r: 13 });
      }
      GG.audio.sfx('jump');
    }
    function cut(f) {
      f.cut = true;
      if (f.k === 'pimenta') { api.lives--; api.refresh(); GG.audio.sfx('boom'); E.shake(5, 0.4); if (X()) { X().flash('#ff4d4d', 0.45); X().pop(f.x, f.y, 'ARDEU!', '#ff6b6b', 12); } if (api.lives <= 0) over(); return; }
      if (f.k === 'estrela_brilho') { slowmo = 3.5; api.add(50); GG.audio.sfx('power'); if (X()) { X().flash('#ffd23f', 0.3); X().pop(f.x, f.y, 'FRENESI! +50', '#ffd23f', 10); } return; }
      api.add(10); GG.audio.sfx('stomp'); combo.push(sc.t); lastCut = sc.t;
      E.fx.burst(f.x, f.y, f.col, 14, 110);
      [-1, 1].forEach((s) => halves.push({ k: f.k, x: f.x, y: f.y, vx: f.vx * 0.4 + s * 50, vy: -60, rot: f.rot, vr: s * 6, side: s, t: 0 }));
    }
    function over() { playing = false; setTimeout(() => api.end(api.score, 'Tempo: ' + Math.round(time) + ' s. Dica: corte várias frutas num só movimento!'), 800); }
    function segHit(ax, ay, bx, by, f) { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1; let k = ((f.x - ax) * dx + (f.y - ay) * dy) / L; k = Math.max(0, Math.min(1, k)); return Math.hypot(ax + dx * k - f.x, ay + dy * k - f.y) < f.r; }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      trail = trail.filter((p) => sc.t - p.t < 0.15);
      if (!playing) return;
      const k = slowmo > 0 ? 0.45 : 1; if (slowmo > 0) slowmo -= dt;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(150 - time)) + 's');
      // facão pelo teclado
      const ax = I.axisX(), ay = I.axisY();
      if (ax || ay) { blade.x = U.clamp(blade.x + ax * 260 * dt, 0, E.W); blade.y = U.clamp(blade.y + ay * 260 * dt, 0, E.H); }
      if (I.down('jump') || I.down('act')) trail.push({ x: blade.x, y: blade.y, t: sc.t });
      waveT -= dt * k; if (waveT <= 0) { launch(); waveT = Math.max(0.9, 1.9 - time * 0.008); }
      fr.forEach((f) => { f.vy += 300 * dt * k; f.x += f.vx * dt * k; f.y += f.vy * dt * k; f.rot += f.vr * dt; });
      for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i]; fr.forEach((f) => { if (!f.cut && segHit(a.x, a.y, b.x, b.y, f)) cut(f); }); }
      fr.forEach((f) => { if (!f.cut && f.vy > 0 && f.y > E.H + 20) { f.gone = true; if (f.k !== 'pimenta' && f.k !== 'estrela_brilho' && playing) { api.lives--; api.refresh(); GG.audio.sfx('bad'); if (X()) X().pop(f.x, E.H - 20, 'CAIU!', '#ff8f8f', 8); if (api.lives <= 0) over(); } } });
      fr = fr.filter((f) => !f.cut && !f.gone);
      halves.forEach((h) => { h.t += dt; h.vy += 400 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; }); halves = halves.filter((h) => h.y < E.H + 30);
      combo = combo.filter((t) => sc.t - t < 0.3);
      if (combo.length >= 3 && sc.t - lastCut < 0.02) { const b = combo.length * 10; api.add(b); if (X()) X().pop(200, 60, 'COMBO ' + combo.length + '! +' + b, '#ffd23f', 12); GG.audio.sfx('ok'); combo = []; }
      if (time >= 150) { playing = false; setTimeout(() => api.end(api.score, 'Você sobreviveu à feira inteira! Parabéns, ninja!'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, false);
      c.fillStyle = '#8b5a2b'; c.fillRect(0, 196, E.W, 29); c.fillStyle = '#6b3f1d'; for (let i = 0; i < E.W; i += 24) c.fillRect(i, 196, 1, 29);
      if (slowmo > 0) { c.fillStyle = 'rgba(255,220,120,.18)'; c.fillRect(0, 0, E.W, E.H); }
      fr.forEach((f) => { if (f.k === 'pimenta' && x) x.glow(c, f.x, f.y, 18, '#ff3b3b', 0.5 + 0.3 * Math.sin(sc.t * 12)); if (!(x && x.ilus(c, f.k, f.x, f.y, 28, { rot: f.rot }))) g.circle(f.x, f.y, 12, f.col); });
      halves.forEach((h) => { if (!x) return; c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.beginPath(); c.rect(h.side < 0 ? -16 : 0, -16, 16, 32); c.clip(); c.globalAlpha = Math.max(0, 1 - h.t / 1.2); x.ilus(c, h.k, 0, 0, 28); c.restore(); });
      if (trail.length > 1) { c.save(); c.lineCap = 'round'; for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i], k = 1 - (sc.t - b.t) / 0.15; c.strokeStyle = 'rgba(255,255,255,' + k.toFixed(2) + ')'; c.lineWidth = 1 + k * 4; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } c.restore(); }
      if (!down) { c.save(); c.translate(blade.x, blade.y); c.rotate(-0.6); c.fillStyle = '#d9dde8'; c.fillRect(-2, -12, 4, 12); c.fillStyle = '#6b3f1d'; c.fillRect(-2, 0, 4, 6); c.restore(); }
      if (slowmo > 0) g.text('FRENESI!', E.W / 2, 40, { size: 10, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; fr.push({ k: 'pimenta', x: 0, y: 0 }); cut(fr[fr.length - 1]); } };
    return sc;
  });

  /* ================================================================ QUERMESSE TIRO AO ALVO */
  PQ.register({ id: 'w2_quermesse', world: 2, boss: 'c2s5', ref: 'Duck Hunt / Yoshi\'s Safari', title: 'Quermesse Tiro ao Alvo', icon: 'alvo', c1: '#e5484d', c2: '#5a1020', music: 'festa', medals: [300, 700, 1200], unit: 'pts',
    desc: 'Barraca da festa junina: acerte os alvos das esteiras com a espingarda de rolha. Bata a meta de cada rodada!',
    how: 'Mire com o **mouse/dedo** (toque atira) ou com as **setas** e **Espaço** para atirar. Você tem **rolhas contadas: o dobro da meta** (meta 7 = 14 rolhas). Acabaram as rolhas sem bater a meta, o jogo termina! Bateu a meta, passa **na hora** para a próxima rodada. **Não acerte** a placa da **Gaia**, os **presentes** nem as **pombas**: cada erro tira **2 segundos**! Cada rodada tem **menos tempo para sobrar**, mais alvos e mais rápidos.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ROWS = [72, 112, 152];
    const aim = { x: 200, y: 112 };
    let targets = [], round = 0, roundT = 0, hits = 0, ammo = 14, playing = false, spawnT = 0, flash = 0, laugh = 0, between = 0;
    // pedido do usuário: rodada de 25 s; meta e alvos na esteira +1 por rodada; alvos errados cada vez mais comuns (−2 s)
    const RT = 25, meta = () => 7 + round, BAD = ['bussola', 'presente', 'pomba'];
    const badChance = () => Math.min(0.45, 0.16 + round * 0.06);
    PQ.pointer(sc, { pointermove: (lx, ly) => { aim.x = lx; aim.y = ly; }, pointerdown: (lx, ly) => { aim.x = lx; aim.y = ly; shoot(); } });
    function startRound() { roundT = RT; hits = 0; targets = []; between = 0; ammo = meta() * 2; api.goal('Rodada ' + (round + 1) + ': acerte ' + meta() + ' alvos com ' + ammo + ' rolhas em ' + RT + ' s! Errado = −2 s'); if (X()) X().banner({ id: 'qm', icon: 'alvo', title: 'Rodada ' + (round + 1), style: 'Meta: ' + meta() + ' alvos' }, 'QUERMESSE'); }
    sc.begin = () => { playing = true; startRound(); };
    function shoot() {
      if (!playing || between > 0) return;
      if (ammo <= 0) { GG.audio.sfx('click'); return; }
      ammo--; flash = 0.08; GG.audio.sfx('shoot');
      const t = targets.slice().reverse().find((tg) => !tg.hit && Math.abs(tg.x - aim.x) < tg.r && Math.abs(tg.y - aim.y) < tg.r);
      if (!t) { if (X()) X().puff(aim.x, aim.y, 1); return; }
      t.hit = true; t.fall = 0;
      if (BAD.includes(t.k)) { api.add(-30); roundT -= 2; GG.audio.sfx('bad'); E.shake(3, 0.2); if (X()) { X().pop(t.x, t.y - 10, 'NÃO! -2 s', '#ff6b6b', 9); X().flash('#ff4d4d', 0.15); } return; }
      const v = t.k === 'estrela_brilho' ? 50 : t.k === 'balao' ? 10 : t.k === 'lata' ? 15 : 20; hits++; api.add(v * (1 + round * 0.25) | 0);
      GG.audio.sfx(t.k === 'balao' ? 'boom' : 'coin'); if (X()) { X().sparkle(t.x, t.y, '#fff0a0', 5); X().pop(t.x, t.y - 12, '+' + (v * (1 + round * 0.25) | 0), '#ffe27a', 8); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (flash > 0) flash -= dt; if (laugh > 0) laugh -= dt;
      if (!playing) return;
      const ax = I.axisX(), ay = I.axisY(); if (ax || ay) { aim.x = U.clamp(aim.x + ax * 200 * dt, 10, E.W - 10); aim.y = U.clamp(aim.y + ay * 200 * dt, 30, 200); }
      if (I.pressed('jump') || I.pressed('act')) shoot();
      if (between > 0) { between -= dt; if (between <= 0) { if (laugh > 0 || api._over) return; startRound(); } return; }
      roundT -= dt; api.extra('alvo', hits + '/' + meta() + ' • ' + ammo + ' rolhas • ' + Math.max(0, Math.ceil(roundT)) + 's');
      spawnT -= dt;
      const live = targets.filter((t) => !t.hit && !BAD.includes(t.k)).length;
      if (spawnT <= 0 && live < 4 + round) {
        spawnT = Math.max(0.3, 0.85 - round * 0.1);
        const row = Math.floor(Math.random() * 3), dir = row % 2 ? -1 : 1, r = Math.random(), bc = badChance();
        const k = r < bc ? U.pick(BAD.slice(0, Math.min(3, 1 + round))) : r < bc + 0.07 ? 'estrela_brilho' : r < bc + 0.35 ? 'balao' : r < bc + 0.6 ? 'lata' : 'pato';
        targets.push({ k, row, x: dir > 0 ? -16 : E.W + 16, y: ROWS[row], vx: dir * (50 + round * 14 + row * 8) * (k === 'estrela_brilho' ? 2 : 1), r: k === 'balao' ? 11 : 12, bob: Math.random() * 6 });
      }
      targets.forEach((t) => { if (t.hit) { t.fall += dt; t.y += 160 * dt; } else { t.x += t.vx * dt; if (t.k === 'balao') t.y = ROWS[t.row] - 6 + Math.sin(sc.t * 3 + t.bob) * 4; } });
      targets = targets.filter((t) => t.x > -30 && t.x < E.W + 30 && (!t.hit || t.fall < 0.6));
      const mt = meta();
      // meta batida = próxima rodada na hora (bônus pelas rolhas e segundos que sobraram)
      if (hits >= mt) { const b = 100 + ammo * 5 + Math.max(0, Math.ceil(roundT)) * 3; round++; api.add(b); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); between = 2; if (X()) X().pop(E.W / 2, 90, 'META BATIDA! +' + b, '#7bff8f', 11); api.goal('Meta batida! Próxima rodada…'); return; }
      const noAmmo = ammo <= 0 && !targets.some((t) => t.hit && t.fall < 0.3);
      if (roundT <= 0 || noAmmo) {
        { playing = false; laugh = 3; api._over = true; GG.audio.sfx('bad'); api.goal(noAmmo ? 'Acabaram as rolhas… faltou pouco!' : 'O tempo acabou… faltou pouco!'); setTimeout(() => api.end(api.score, (noAmmo ? 'Acabaram as rolhas! ' : 'O tempo acabou! ') + 'Rodadas vencidas: ' + round + '. Meta da última rodada: ' + mt + ' alvos (você fez ' + hits + ').'), 2200); }
      }
    };
    function drawTarget(c, g, x, t) {
      if (t.k === 'pato') { c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(t.x, t.y + 2, 10, 7, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(t.x + 7 * Math.sign(t.vx), t.y - 6, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff8a2a'; c.fillRect(t.x + 11 * Math.sign(t.vx) - 2, t.y - 6, 4, 2); c.fillStyle = '#15152a'; c.fillRect(t.x + 8 * Math.sign(t.vx), t.y - 8, 1.5, 1.5); c.fillStyle = '#8a6a2a'; c.fillRect(t.x - 1, t.y + 9, 2, 10); return; }
      if (t.k === 'lata') { c.fillStyle = '#c0c6d6'; c.fillRect(t.x - 7, t.y - 10, 14, 20); c.fillStyle = '#e5484d'; c.fillRect(t.x - 7, t.y - 4, 14, 8); c.fillStyle = '#fff'; c.fillRect(t.x - 4, t.y - 2, 8, 3); c.fillStyle = '#8a6a2a'; c.fillRect(t.x - 1, t.y + 10, 2, 9); return; }
      if (BAD.includes(t.k)) { g.panel(t.x - 11, t.y - 11, 22, 22, '#ffe0e0', '#e5484d'); if (x) x.ilus(c, t.k, t.x, t.y, 16); c.strokeStyle = '#e5484d'; c.lineWidth = 1.5; c.beginPath(); c.arc(t.x, t.y, 13, 0, Math.PI * 2); c.moveTo(t.x - 9, t.y - 9); c.lineTo(t.x + 9, t.y + 9); c.stroke(); return; }
      if (t.k === 'estrela_brilho' && x) x.glow(c, t.x, t.y, 16, '#ffd23f', 0.8);
      if (!(x && x.ilus(c, t.k, t.x, t.y, 22))) g.circle(t.x, t.y, 10, '#ff4d6d');
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, true);
      // barraca: cortinas e prateleiras de prêmios
      for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#c0392b' : '#fff1e0'; c.fillRect(i * 30, 36, 30, 12); }
      c.fillStyle = '#5a2a10'; c.fillRect(0, 48, E.W, 4);
      ROWS.forEach((y, i) => { c.fillStyle = '#6b3f1d'; c.fillRect(0, y + 18, E.W, 5); c.fillStyle = '#3a220b'; for (let xx = -((sc.t * 40 * (i % 2 ? -1 : 1)) % 12 + 12) % 12; xx < E.W; xx += 12) c.fillRect(xx, y + 19, 4, 3); });
      targets.forEach((t) => { c.save(); if (t.hit) { c.translate(t.x, t.y); c.rotate(t.fall * 4); c.translate(-t.x, -t.y); c.globalAlpha = 1 - t.fall / 0.6; } drawTarget(c, g, x, t); c.restore(); });
      c.fillStyle = '#4a2a10'; c.fillRect(0, 196, E.W, 29);
      if (x) ['trofeu', 'presente', 'balao', 'pipa'].forEach((n, i) => x.ilus(c, n, 40 + i * 110, 210, 18));
      // mira
      const col = flash > 0 ? '#ffffff' : '#ff3b3b';
      c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.arc(aim.x, aim.y, 8, 0, Math.PI * 2); c.moveTo(aim.x - 12, aim.y); c.lineTo(aim.x - 4, aim.y); c.moveTo(aim.x + 4, aim.y); c.lineTo(aim.x + 12, aim.y); c.moveTo(aim.x, aim.y - 12); c.lineTo(aim.x, aim.y - 4); c.moveTo(aim.x, aim.y + 4); c.lineTo(aim.x, aim.y + 12); c.stroke();
      if (flash > 0 && x) x.glow(c, aim.x, aim.y, 14, '#ffffff', 0.9);
      // rolhas
      const tot = meta() * 2; for (let i = 0; i < tot; i++) { c.fillStyle = i < ammo ? '#c98b45' : 'rgba(255,255,255,.15)'; c.fillRect(8 + i * 5, 204, 3, 9); }
      g.text(ammo + ' rolhas', 12 + tot * 5, 206, { size: 5, color: ammo <= 3 ? '#ff8f8f' : '#ffd23f' });
      if (laugh > 0) { g.img(P.geobot(Math.floor(sc.t * 8) % 3), E.W / 2 - 18, 120 - Math.abs(Math.sin(sc.t * 10)) * 10, { scale: 2 }); g.text('HA HA!', E.W / 2, 104, { size: 10, color: '#fff', align: 'center' }); }
    };
    sc.dbg = { end() { roundT = 0; hits = -99; }, shootGood() { const t = targets.find((o) => !o.hit && !BAD.includes(o.k) && o.x > 10 && o.x < E.W - 10); if (t) { aim.x = t.x; aim.y = t.y; shoot(); } return !!t; }, get round() { return round; }, get ammo() { return ammo; } };
    return sc;
  });

  /* ================================================================ PEGA-NÉVOA NO ARRAIAL */
  PQ.register({ id: 'w2_nevoa', world: 2, boss: 'c2s5', ref: 'acerte a toupeira (jogos de festa)', title: 'Pega-Névoa no Arraial', icon: 'fogo', c1: '#ff7a2a', c2: '#5a1a08', music: 'corrida', medals: [300, 650, 1000], unit: 'pts',
    desc: 'As Névoas da Confusão saem das panelas de barro do arraial! Capture rápido, mas não acerte os amigos.',
    how: 'Toque/clique na **Névoa** que aparecer. No teclado: **Q W E / A S D / Z X C** (ou setas + Espaço). A **Névoa dourada** vale muito! Acertar um **amigo** tira 1 vida (**3 vidas**). **90 segundos**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const POTS = []; for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) POTS.push({ x: 110 + q * 90, y: 92 + r * 46, up: 0, who: null, life: 0, hit: 0 });
    const KEYS = ['KeyQ', 'KeyW', 'KeyE', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX', 'KeyC'], NUM = ['Numpad7', 'Numpad8', 'Numpad9', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad1', 'Numpad2', 'Numpad3'];
    let playing = false, time = 0, spawnT = 0.8, cursor = 4, combo = 0, hammer = { i: -1, t: 0 };
    api.lives = 3; api.refresh();
    const onKey = (ev) => { if (GG.ui.blocking() || E.scene !== sc) return; let i = KEYS.indexOf(ev.code); if (i < 0) i = NUM.indexOf(ev.code); if (i >= 0) { cursor = i; whack(i); } };
    window.addEventListener('keydown', onKey);
    sc.exit = () => window.removeEventListener('keydown', onKey);
    PQ.pointer(sc, { pointerdown: (lx, ly) => { const i = POTS.findIndex((p) => Math.abs(lx - p.x) < 34 && ly > p.y - 40 && ly < p.y + 14); if (i >= 0) { cursor = i; whack(i); } } });
    sc.begin = () => { playing = true; api.goal('Capture as Névoas! Não acerte os amigos.'); };
    function whack(i) {
      if (!playing) return;
      const p = POTS[i]; hammer = { i, t: 0.18 }; GG.audio.sfx('stomp');
      if (!p.who || p.up < 0.4 || p.hit) { combo = 0; return; }
      p.hit = 0.35;
      if (p.who === 'amigo') { api.lives--; api.refresh(); GG.audio.sfx('bad'); E.shake(3, 0.2); if (X()) { X().flash('#ff4d4d', 0.3); X().pop(p.x, p.y - 40, 'É AMIGO!', '#ff8f8f', 9); } combo = 0; if (api.lives <= 0) over(); return; }
      combo++; const v = (p.who === 'ouro' ? 50 : 10) + Math.min(20, combo * 2); api.add(v);
      GG.audio.sfx(p.who === 'ouro' ? 'frag' : 'coin'); if (X()) { X().puff(p.x, p.y - 20, 4); X().sparkle(p.x, p.y - 24, p.who === 'ouro' ? '#ffd23f' : '#c8b8ff', 5); X().pop(p.x, p.y - 44, 'POF! +' + v, '#ffe27a', 8); }
    }
    function over() { playing = false; setTimeout(() => api.end(api.score, 'Tempo: ' + Math.round(time) + ' s. Maior sequência vale mais!'), 700); }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (hammer.t > 0) hammer.t -= dt;
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(90 - time)) + 's');
      if (I.pressed('left')) cursor = cursor % 3 ? cursor - 1 : cursor; if (I.pressed('right')) cursor = cursor % 3 < 2 ? cursor + 1 : cursor;
      if (I.pressed('up')) cursor = cursor >= 3 ? cursor - 3 : cursor; if (I.pressed('down')) cursor = cursor < 6 ? cursor + 3 : cursor;
      if (I.pressed('jump') || I.pressed('act')) whack(cursor);
      const stay = Math.max(0.55, 1.2 - time * 0.008);
      spawnT -= dt;
      if (spawnT <= 0) { spawnT = Math.max(0.28, 0.8 - time * 0.006); const free = POTS.filter((p) => !p.who); if (free.length) { const p = U.pick(free), r = Math.random(); p.who = r < 0.07 ? 'ouro' : r < 0.25 + Math.min(0.1, time / 900) ? 'amigo' : 'nevoa'; p.friend = U.pick(['menina_medium', 'menino_dark', 'pomba', 'crianca_medium_light', 'idoso_dark']); p.life = stay; p.up = 0; p.hit = 0; } }
      POTS.forEach((p) => {
        if (!p.who) return;
        if (p.hit > 0) { p.hit -= dt; p.up = Math.max(0, p.up - dt * 4); if (p.hit <= 0) p.who = null; return; }
        p.life -= dt; p.up = p.life > 0.15 ? Math.min(1, p.up + dt * 6) : Math.max(0, p.up - dt * 7);
        if (p.life <= 0 && p.up <= 0) { if (p.who === 'nevoa' || p.who === 'ouro') combo = 0; p.who = null; }
      });
      if (time >= 90) { playing = false; api.add(api.lives * 50); setTimeout(() => api.end(api.score, 'Fim da festa! Bônus de vidas: +' + api.lives * 50 + '.'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      arraial(g, c, x, sc.t, true);
      // fogueira e chão
      c.fillStyle = '#3a2410'; c.fillRect(0, 60, E.W, E.H - 60); c.fillStyle = '#4a3018'; for (let i = 0; i < 40; i++) c.fillRect((i * 53) % E.W, 64 + (i * 37) % 150, 3, 2);
      if (x) { x.glow(c, 30, 190, 40, '#ff8a2a', 0.7 + 0.2 * Math.sin(sc.t * 12)); x.ilus(c, 'fogo', 30, 184 + Math.sin(sc.t * 9), 34); x.glow(c, 370, 190, 40, '#ff8a2a', 0.7 + 0.2 * Math.sin(sc.t * 11)); x.ilus(c, 'fogo', 370, 184 + Math.sin(sc.t * 8), 34); }
      POTS.forEach((p, i) => {
        // quem sai da panela (desenhado antes da boca da panela para "entrar" nela)
        if (p.who) {
          c.save(); c.beginPath(); c.rect(p.x - 30, p.y - 60, 60, 60); c.clip();
          const yy = p.y - 6 - p.up * 26;
          if (p.who === 'amigo') { if (x) x.ilus(c, p.friend, p.x, yy, 30); }
          else { if (x && p.who === 'ouro') x.glow(c, p.x, yy, 22, '#ffd23f', 0.9); const im = P.nevoa(Math.floor(sc.t * 4) % 2); c.save(); if (p.who === 'ouro') c.filter = 'sepia(1) saturate(4) brightness(1.2)'; c.drawImage(im, p.x - 22, yy - 16, 44, 32); c.restore(); if (p.hit > 0) g.text('×_×', p.x, yy - 6, { size: 6, color: '#fff', align: 'center' }); }
          c.restore();
        }
        // panela de barro
        c.fillStyle = '#7a3a1a'; c.beginPath(); c.ellipse(p.x, p.y + 4, 28, 12, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#a0522d'; c.beginPath(); c.ellipse(p.x, p.y, 28, 7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#2a120a'; c.beginPath(); c.ellipse(p.x, p.y, 22, 4.5, 0, 0, Math.PI * 2); c.fill();
        if (i === cursor) { c.strokeStyle = 'rgba(255,230,120,' + (0.5 + 0.4 * Math.sin(sc.t * 8)).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y + 2, 32, 14, 0, 0, Math.PI * 2); c.stroke(); }
        g.text(['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'][i], p.x + 30, p.y + 4, { size: 5, color: 'rgba(255,255,255,.5)' });
      });
      // colher de pau (martelo)
      const hp = POTS[hammer.i >= 0 && hammer.t > 0 ? hammer.i : cursor];
      c.save(); c.translate(hp.x + 18, hp.y - 30); c.rotate(hammer.t > 0 ? -0.2 : -0.9); c.fillStyle = '#c98b45'; c.fillRect(-3, 0, 6, 26); c.beginPath(); c.ellipse(0, -2, 8, 6, 0, 0, Math.PI * 2); c.fill(); c.restore();
      if (combo > 2) g.text('SEQUÊNCIA ' + combo, E.W / 2, 56, { size: 7, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { time = 90; } };
    return sc;
  });
})();
```

## arcade3.js

Mundo 3: Estrada Brasil (Road Fighter), Invasores da Poluição (Galaga), Empilha-Prédios (Tower Bloxx). Caminho: `src/modules/geografia/scenes/arcade3.js` (366 linhas).

```js
/* =====================================================================
   scenes/arcade3.js — ARCADE DO MUNDO 3 (O Brasil que Muda)
   Recompensa depois do chefe Vírus da Desigualdade. Jogos curtos, sem
   perguntas, com tempo/vidas e recorde:
   • Estrada Brasil — corrida vista de cima pelo litoral, cerrado e
     cidade, com combustível, trânsito que muda de faixa e óleo
     (estilo Road Fighter do NES)
   • Invasores da Poluição — nave solar limpa nuvens de fumaça que
     descem em formação e mergulham (estilo Galaga / Space Invaders);
     a cada fumaça limpa o céu da cidade fica mais azul
   • Empilha-Prédios — o guindaste balança; solte o andar na hora
     certa e faça a cidade crescer (estilo Tower Bloxx / Stack)
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ ESTRADA BRASIL
     Estilo Road Fighter (NES), pedido do usuário (24/09/2026): visão de cima, a estrada
     serpenteia e estreita; o recurso é o COMBUSTÍVEL (não há tempo extra por checkpoint).
     Bater num carro = rodar e explodir; raspar na beira freia e gasta um pouco (perde combustível e recomeça
     parado). Carros amarelos mudam de faixa na sua frente; manchas de óleo fazem rodar;
     galões na pista devolvem combustível. Dificuldade média: sobe a cada zona e volta. */
  const ZONES = [
    { name: 'Litoral', side: ['#e8d49a', '#dcc486'], edge: '#2f9be0', rumble: ['#e5484d', '#fff'], road: '#5d626e', hw: 74, props: ['treePalm', 'treePalm', 'house1'], traffic: 1 },
    { name: 'Cerrado', side: ['#c98f4d', '#bd8444'], edge: '#8a5a2e', rumble: ['#ffd23f', '#fff'], road: '#6d6152', hw: 64, props: ['treeOrange', 'cactus2', 'tree'], traffic: 1.3 },
    { name: 'Cidade', side: ['#8a95a3', '#7f8a98'], edge: '#4a4f5c', rumble: ['#3ec1ff', '#fff'], road: '#45495a', hw: 58, props: ['house2', 'tower', 'houseAlt1'], traffic: 1.6 }
  ];
  PQ.register({ id: 'w3_estrada', world: 3, boss: 'c3s6', ref: 'Road Fighter (NES)', title: 'Estrada Brasil', icon: 'carro_corrida', c1: '#ff4d6d', c2: '#4a0a1a', music: 'corrida', medals: [900, 1900, 3200], unit: 'pts',
    desc: 'Corrida de estrada vista de cima, do litoral à cidade! Desvie do trânsito e cuide do combustível — cada batida custa caro.',
    how: '**← →** desviam. O carro acelera sozinho; segure **↑** para a **marcha rápida** e **↓** para frear. O **TURBO** carrega sozinho: quando piscar **TURBO PRONTO**, aperte **Espaço** (ou toque no botão). O combustível **acaba rápido**: pegue os **galões** ⛽! **Bater** tira muito combustível e zera o turbo; os carros **amarelos** e **laranjas** tentam **fechar** você; o **óleo** faz rodar.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const PY = 176, ZL = 7200, CRUISE = 215, FAST = 300;
    const car = { x: 200, v: 0, crash: 0, spin: 0, inv: 0, spinDir: 1 };
    const TURBO = 390, TCHARGE = 8; // turbo: carrega em 8 s, dura 2,5 s
    let turbo = 0, boost = 0;
    let dist = 0, fuel = 100, playing = false, traffic = [], items = [], spawnT = 1.2, itemT = 5, zone = 0, lap = 0, zoneAnn = 0, over = 0, passed = 0, crashes = 0, mouseX = null, lastZoneIdx = 0;
    const Z = () => ZONES[zone];
    const level = () => Math.min(4, zone + lap * 3); // 0..4 (limitado: o fim não vira parede de carros)
    const center = (d) => 200 + 52 * Math.sin(d / 900) + 22 * Math.sin(d / 370 + 1);
    const zmod = (d) => ((Math.floor(d / ZL) % 3) + 3) % 3;
    const half = (d) => { const zi = zmod(d), zz = ZONES[zi]; let h = zz.hw + 12 * Math.sin(d / 1300); if (Math.sin(d / 2100 + zi) > 0.82) h -= 20 + Math.min(8, lap * 4); return Math.max(36, h - lap * 4); };
    const zoneAt = zmod;
    // só segue o mouse/dedo ENQUANTO está apertado (antes o mouse parado puxava o carro para o lado)
    PQ.pointer(sc, { pointerdown: (lx, ly) => { if (lx > E.W - 70 && ly > 186) { useTurbo(); return; } mouseX = lx; }, pointermove: (lx) => { if (mouseX != null) mouseX = lx; }, pointerup: () => { mouseX = null; }, pointercancel: () => { mouseX = null; } });
    sc.begin = () => { playing = true; zoneAnn = 2.5; api.goal('Zona: Litoral — desvie e cuide do combustível!'); };
    const sy = (d) => PY - (d - dist);
    function useTurbo() {
      if (!playing || turbo < 1 || car.crash > 0 || boost > 0) return;
      turbo = 0; boost = 2.5; GG.audio.sfx('boost'); if (X()) { X().flash('#9ff2ff', 0.25); X().pop(car.x, PY - 30, 'TURBO!', '#9ff2ff', 10); }
    }
    function spawnCar() {
      const d = dist + 300, lv = level(), r = Math.random();
      const kind = r < 0.14 + lv * 0.02 ? 'oil' : r < 0.28 + lv * 0.04 ? 'zig' : r < 0.4 + lv * 0.02 ? 'truck' : r < 0.62 ? 'block' : 'car';
      // nunca fechar a pista toda: no máximo 2 carros (1 se a pista estiver estreita) na mesma altura
      const near = traffic.filter((o) => o.k !== 'oil' && Math.abs(o.d - d) < 120);
      const narrow = half(d) < 52;
      if (kind !== 'oil' && near.length >= (narrow ? 1 : 2)) return;
      const lanes = [-0.55, 0, 0.55].filter((l) => !near.some((o) => Math.abs(o.off - l) < 0.3));
      const lane = U.pick(lanes.length ? lanes : [0]);
      if (kind === 'oil') { traffic.push({ k: 'oil', d, off: lane, v: 0, w: 18, h: 12 }); return; }
      traffic.push({ k: kind, d, off: lane, toOff: lane, v: kind === 'truck' ? 80 + lv * 6 : 110 + Math.random() * 45 + lv * 7, w: kind === 'truck' ? 18 : 14, h: kind === 'truck' ? 38 : 24,
        col: kind === 'zig' ? '#ffd23f' : kind === 'block' ? '#ff9a3d' : kind === 'truck' ? '#e8e8f0' : U.pick(['#3ec1ff', '#35e07a', '#b07bff']), swerved: false });
    }
    function crash(why) {
      if (car.crash > 0 || car.inv > 0) return;
      car.crash = 1.5; car.spinDir = Math.random() < 0.5 ? -1 : 1; crashes++;
      fuel = Math.max(0, fuel - 15); api.add(-80); turbo = 0; boost = 0; // erro custa caro: combustível, pontos e o turbo
      GG.audio.sfx('boom'); E.shake(6, 0.45); E.fx.burst(car.x, PY, '#ff9a3d', 14, 90);
      if (X()) { X().flash('#ff4d4d', 0.35); X().puff(car.x, PY, 6); X().pop(car.x, PY - 30, why + ' -15 combustível', '#ff8f8f', 8); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (zoneAnn > 0) zoneAnn -= dt;
      if (!playing) return;
      if (car.inv > 0) car.inv -= dt; if (car.spin > 0) car.spin -= dt;
      // combustível: gasta sempre; mais rápido na marcha rápida
      const fast = I.down('up');
      if (I.pressed('jump')) useTurbo();
      if (boost > 0) boost -= dt; else if (car.crash <= 0) turbo = Math.min(1, turbo + dt / TCHARGE);
      // combustível acaba rápido (~55 s sem galões): é preciso pegar os galões
      fuel -= dt * (boost > 0 ? 2.4 : fast ? 2.05 : 1.75);
      api.extra('bateria', Math.max(0, Math.ceil(fuel)) + '% ⛽');
      if (car.crash > 0) {
        car.crash -= dt; car.v = Math.max(0, car.v - 400 * dt); dist += car.v * dt;
        if (car.crash <= 0) { car.x = center(dist); car.v = 0; car.inv = 1.6; car.spin = 0; }
      } else {
        const top = boost > 0 ? TURBO : I.down('down') ? 0 : fast ? FAST : CRUISE;
        car.v += (top - car.v) * Math.min(1, dt * (car.v < top ? 0.9 : 3));
        let steer = I.axisX();
        if (!steer && mouseX != null) steer = Math.abs(mouseX - car.x) < 3 ? 0 : U.clamp((mouseX - car.x) / 18, -1, 1);
        if (car.spin > 0) steer = car.spinDir * 0.6;
        car.x += steer * dt * (90 + car.v * 0.3);
        dist += car.v * dt;
        const c0 = center(dist), h0 = half(dist), lim = h0 - 7;
        if (Math.abs(car.x - c0) > lim) {
          // raspou na beira: volta para a pista, perde velocidade e um pouco de combustível (sem explodir)
          car.x = c0 + Math.sign(car.x - c0) * (lim - 2); car.v *= 0.5; fuel -= 2.5; boost = 0; car.scrape = 0.3;
          if (!car.warned) { car.warned = 1.2; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'Cuidado com a beira!', '#ffd23f', 7); }
          if (X() && Math.random() < 0.5) X().sparkle(car.x + Math.sign(car.x - c0) * 7, PY, '#ffd23f', 2);
        }
        if (car.warned > 0) car.warned = Math.max(0, car.warned - dt);
      }
      if (Math.floor(dist / 25) !== Math.floor((dist - car.v * dt) / 25)) api.add(1);
      // zonas (sem tempo extra: só um pouco de combustível e bônus)
      const zi = Math.floor(dist / ZL);
      if (zi !== lastZoneIdx) {
        lastZoneIdx = zi; zone = zi % 3; lap = Math.floor(zi / 3); zoneAnn = 2.5;
        api.add(250); fuel = Math.min(100, fuel + 10); GG.audio.sfx('win');
        if (X()) { X().flash('#fff6c0', 0.25); X().pop(200, 70, 'ZONA CONCLUÍDA! +250 e +10 de combustível', '#7bff8f', 9); }
        api.goal('Zona: ' + Z().name + (lap ? ' (volta ' + (lap + 1) + ', mais rápida!)' : ''));
      }
      // trânsito
      spawnT -= dt;
      if (spawnT <= 0 && car.v > 40) { spawnCar(); spawnT = Math.max(0.7, (1.9 - level() * 0.1) / Z().traffic) * (0.7 + Math.random() * 0.6) * (CRUISE / Math.max(120, car.v)); }
      itemT -= dt; if (itemT <= 0 && car.v > 40) { itemT = 4.2 + Math.random() * 2.2 + level() * 0.35; items.push({ d: dist + 300, off: U.pick([-0.5, 0, 0.5]) }); }
      const cbox = { x: car.x - 7, y: PY - 12, w: 14, h: 24 };
      traffic.forEach((o) => {
        o.d += o.v * dt;
        const cx0 = center(o.d), hh = half(o.d);
        // amarelo (zig): muda de faixa para a SUA frente; laranja (block): vai fechando devagar enquanto você se aproxima
        const gap = o.d - dist, pOff = (car.x - cx0) / hh;
        if (o.k === 'zig' && !o.swerved && gap < 150 && gap > 45) { o.swerved = true; o.toOff = U.clamp(pOff, -0.6, 0.6); }
        if (o.k === 'block' && gap < 170 && gap > 30) o.toOff = U.clamp(o.off + U.clamp(pOff - o.off, -0.35, 0.35), -0.6, 0.6);
        if (o.toOff != null) o.off += U.clamp(o.toOff - o.off, -dt * (o.k === 'zig' ? 1.6 : 0.55), dt * (o.k === 'zig' ? 1.6 : 0.55));
        o.x = cx0 + o.off * hh; o.y = sy(o.d);
        if (car.crash > 0 || car.inv > 0 || o.hitDone) return;
        if (E.overlap(cbox, { x: o.x - o.w / 2 + 1, y: o.y - o.h / 2 + 1, w: o.w - 2, h: o.h - 2 })) {
          if (o.k === 'oil') { o.hitDone = true; car.spin = 0.6; car.spinDir = Math.random() < 0.5 ? -1 : 1; GG.audio.sfx('bad'); if (X()) X().pop(car.x, PY - 26, 'ÓLEO!', '#ffd23f', 8); }
          else { o.hitDone = true; crash('Batida!'); }
        }
        if (!o.passed && o.k !== 'oil' && o.y > PY + 20) { o.passed = true; passed++; api.add(o.k === 'zig' || o.k === 'block' ? 25 : 15); }
      });
      traffic = traffic.filter((o) => o.y < E.H + 50 && o.d < dist + 400);
      items.forEach((it) => { const cx0 = center(it.d); it.x = cx0 + it.off * half(it.d); it.y = sy(it.d); if (!it.got && car.crash <= 0 && Math.abs(it.x - car.x) < 13 && Math.abs(it.y - PY) < 16) { it.got = true; fuel = Math.min(100, fuel + 20); api.add(30); GG.audio.sfx('power'); if (X()) { X().sparkle(it.x, it.y, '#7bff8f', 6); X().pop(it.x, it.y - 12, '+20 combustível', '#7bff8f', 8); } } });
      items = items.filter((it) => !it.got && it.y < E.H + 20);
      if (fuel <= 0) { fuel = 0; playing = false; over = 1; GG.audio.sfx('bad'); setTimeout(() => api.end(api.score, 'Combustível acabou! Distância: ' + (dist / 1000).toFixed(1) + ' km • zonas: ' + lastZoneIdx + ' • ultrapassagens: ' + passed + ' • batidas: ' + crashes + '.'), 1100); }
    };
    function drawCar(c, x, y, w, h, col, rot) {
      c.save(); c.translate(x, y); if (rot) c.rotate(rot);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      c.fillStyle = '#15152a'; c.fillRect(-w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(w / 2 - 1.5, -h / 2 + 3, 3, 6); c.fillRect(-w / 2 - 1.5, h / 2 - 9, 3, 6); c.fillRect(w / 2 - 1.5, h / 2 - 9, 3, 6);
      c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-w / 2, -h / 2, w, 2);
      c.fillStyle = 'rgba(20,30,60,.85)'; c.fillRect(-w / 2 + 2, -h / 2 + h * 0.22, w - 4, h * 0.18); c.fillRect(-w / 2 + 2, h / 2 - h * 0.28, w - 4, h * 0.12);
      c.restore();
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // laterais (areia/terra/calçada) em faixas que rolam
      for (let yy = 0; yy < E.H; yy += 8) {
        const d = dist + (PY - yy), zi = zoneAt(d), zz = ZONES[zi], alt = Math.floor(d / 24) % 2;
        const cx0 = center(d), hh = half(d);
        c.fillStyle = zz.side[alt]; c.fillRect(0, yy, E.W, 8);
        if (zi === 0) { c.fillStyle = zz.edge; c.fillRect(0, yy, Math.max(0, cx0 - hh - 60), 8); } // mar à esquerda no litoral
        c.fillStyle = zz.rumble[alt]; c.fillRect(cx0 - hh - 5, yy, 5, 8); c.fillRect(cx0 + hh, yy, 5, 8);
        c.fillStyle = zz.road; c.fillRect(cx0 - hh, yy, hh * 2, 8);
        if (Math.floor(d / 20) % 2) { c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(cx0 - hh * 0.28 - 1, yy, 2, 8); c.fillRect(cx0 + hh * 0.28 - 1, yy, 2, 8); }
        if (Math.floor(d / ZL) !== Math.floor((d - 8) / ZL)) { for (let k = 0; k < hh * 2; k += 8) { c.fillStyle = (k / 8) % 2 ? '#fff' : '#15152a'; c.fillRect(cx0 - hh + k, yy, 8, 6); } }
      }
      // enfeites na beira
      if (x) {
        const step = 70, first = Math.floor((dist - 60) / step);
        for (let k = first; k < first + 6; k++) {
          const d = k * step, yy = sy(d); if (yy < -40 || yy > E.H + 40) continue;
          const zz = ZONES[zoneAt(d)], im = x.img[zz.props[((k % 3) + 3) % 3]]; if (!im) continue;
          const side = k % 2 ? -1 : 1, cx0 = center(d), hh = half(d), xx = cx0 + side * (hh + 30 + (k % 3) * 8), h = 34, w = h * im.width / im.height;
          if (xx > -20 && xx < E.W + 20) x.hd(c, () => c.drawImage(im, xx - w / 2, yy - h, w, h));
        }
      }
      items.forEach((it) => { if (x) x.glow(c, it.x, it.y, 12, '#7bff8f', 0.6); c.fillStyle = '#e5484d'; c.fillRect(it.x - 5, it.y - 6, 10, 12); c.fillStyle = '#8a1020'; c.fillRect(it.x - 3, it.y - 9, 6, 3); c.fillStyle = '#ffd23f'; c.fillRect(it.x - 3, it.y - 2, 6, 3); });
      traffic.forEach((o) => {
        if (o.k === 'oil') { c.fillStyle = 'rgba(15,15,30,.85)'; c.beginPath(); c.ellipse(o.x, o.y, 9, 6, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(140,90,255,.35)'; c.beginPath(); c.ellipse(o.x - 2, o.y - 1, 4, 2, 0.3, 0, Math.PI * 2); c.fill(); return; }
        drawCar(c, o.x, o.y, o.w, o.h, o.col, 0);
        if (o.k === 'zig' && !o.swerved && o.y > -10 && Math.floor(sc.t * 6) % 2) g.text('!', o.x, o.y - o.h / 2 - 9, { size: 7, color: '#ffd23f', align: 'center' });
      });
      // jogador
      if (!(car.inv > 0 && Math.floor(sc.t * 14) % 2)) {
        const rot = car.crash > 0 ? car.spinDir * (1.3 - car.crash) * 9 : car.spin > 0 ? car.spinDir * (0.9 - car.spin) * 7 : IN().axisX() * 0.12;
        if (boost > 0 && x) { x.glow(c, car.x - 4, PY + 15, 7, '#ff9a3d', 0.9); x.glow(c, car.x + 4, PY + 15, 7, '#ff9a3d', 0.9); if (!E.reduced && Math.random() < 0.6) x.puff(car.x, PY + 14, 1, 0); }
        drawCar(c, car.x, PY, 14, 24, '#e5484d', rot);
        if (car.crash <= 0) g.text('BR', car.x, PY - 3, { size: 3, color: '#fff', align: 'center', shadow: false });
        if (car.crash > 0 && x) x.glow(c, car.x, PY, 22 * car.crash, '#ff9a3d', 0.7);
      }
      // painel: combustível, velocidade e zona
      g.panel(6, 30, 20, 120, 'rgba(15,18,38,.85)', '#3a4290');
      const fh = 108 * fuel / 100, fc = fuel < 25 ? (Math.floor(sc.t * 4) % 2 ? '#ff5d6c' : '#8a1020') : fuel < 50 ? '#ffd23f' : '#35e07a';
      g.rect(10, 34 + 108 - fh, 12, fh, fc); g.text('COMB.', 16, 152, { size: 4, color: '#fff', align: 'center' });
      // painel/botão do turbo (tocar aqui também aciona)
      const ready = turbo >= 1 && boost <= 0;
      g.panel(E.W - 66, 188, 60, 32, ready && Math.floor(sc.t * 4) % 2 ? 'rgba(20,70,110,.95)' : 'rgba(15,18,38,.85)', ready ? '#9ff2ff' : '#3a4290');
      g.text(Math.round(car.v * 0.6) + ' km/h', E.W - 36, 191, { size: 5, color: '#fff', align: 'center' });
      g.rect(E.W - 60, 201, 48, 5, 'rgba(0,0,0,.5)'); g.rect(E.W - 60, 201, 48 * (boost > 0 ? boost / 2.5 : turbo), 5, boost > 0 ? '#ff9a3d' : ready ? '#9ff2ff' : '#3a7ab0');
      g.text(boost > 0 ? 'TURBO!' : ready ? 'TURBO PRONTO (Espaço)' : 'turbo carregando…', E.W - 36, 209, { size: 3.5, color: ready || boost > 0 ? '#ffd23f' : '#9ff2ff', align: 'center' });
      const zp = (dist % ZL) / ZL; g.rect(120, 6, 160, 4, 'rgba(0,0,0,.4)'); g.rect(120, 6, 160 * zp, 4, '#ffd23f'); g.text(Z().name + (lap ? ' • volta ' + (lap + 1) : ''), 200, 12, { size: 5, color: '#fff', align: 'center' });
      if (zoneAnn > 0) g.text('ZONA: ' + Z().name.toUpperCase(), E.W / 2, 40, { size: 10, color: '#fff', align: 'center' });
      if (fuel < 20 && playing && Math.floor(sc.t * 3) % 2) g.text('POUCO COMBUSTÍVEL!', E.W / 2, 58, { size: 7, color: '#ff8f8f', align: 'center' });
      if (over) g.text('ACABOU O COMBUSTÍVEL!', E.W / 2, 90, { size: 11, color: '#ff5d6c', align: 'center' });
    };
    sc.dbg = { end() { fuel = 0; }, car, center, half, get traffic() { return traffic; }, get items() { return items; }, get dist() { return dist; }, get fuel() { return fuel; }, set fuel(v) { fuel = v; }, get crashes() { return crashes; } };
    return sc;
  });

  /* ================================================================ INVASORES DA POLUIÇÃO */
  PQ.register({ id: 'w3_invasores', world: 3, boss: 'c3s6', ref: 'Galaga / Space Invaders', title: 'Invasores da Poluição', icon: 'fabrica', c1: '#5a6b8a', c2: '#1a2233', music: 'chefe', medals: [800, 1800, 3200], unit: 'pts',
    desc: 'Nuvens de fumaça invadem a cidade! Pilote a nave solar e limpe o céu com raios de energia limpa.',
    how: '**← →** movem a nave solar, **Espaço** (ou toque) dispara. Fumaças descem em formação e algumas **mergulham**! Pegue **raio** (tiro triplo), **escudo** e **coração**. **3 vidas**.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ship = { x: 200, y: 200, inv: 0, triple: 0, shield: 0 };
    let foes = [], shots = [], drops = [], caps = [], wave = 0, playing = false, cool = 0, clean = 0, time = 0, touchX = null, firing = false, waveAnn = 0;
    api.lives = 3; api.refresh();
    PQ.pointer(sc, { pointerdown: (lx) => { touchX = lx; firing = true; }, pointermove: (lx, ly, ev) => { if (firing || ev.pointerType === 'mouse') touchX = lx; }, pointerup: () => { firing = false; } });
    function newWave() {
      wave++; waveAnn = 2; foes = [];
      const rows = Math.min(5, 3 + Math.floor(wave / 2));
      for (let r = 0; r < rows; r++) for (let q = 0; q < 8; q++) foes.push({ hx: 60 + q * 38, hy: 36 + r * 20, x: 60 + q * 38, y: -30 - r * 20 - q * 6, k: r === 0 ? 'fabrica' : r % 2 ? 'fumaca' : 'lixo', hp: r === 0 ? 2 : 1, dive: 0, enter: 1 });
      api.goal('Onda ' + wave + ': limpe o céu!');
    }
    sc.begin = () => { playing = true; newWave(); };
    function hit() {
      if (ship.inv > 0) return;
      if (ship.shield > 0) { ship.shield = 0; ship.inv = 1; GG.audio.sfx('shield'); return; }
      api.lives--; api.refresh(); ship.inv = 2; GG.audio.sfx('hit'); E.shake(5, 0.3); if (X()) X().flash('#ff4d4d', 0.35);
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ondas limpas: ' + (wave - 1) + '. O céu ficou ' + Math.round(clean * 100) + '% mais limpo!'), 900); }
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (waveAnn > 0) waveAnn -= dt;
      if (!playing) return;
      time += dt; api.extra('sol', 'Onda ' + wave);
      if (ship.inv > 0) ship.inv -= dt; if (ship.triple > 0) ship.triple -= dt; if (ship.shield > 0) ship.shield -= dt;
      const ax = I.axisX(); if (ax) { ship.x += ax * 170 * dt; touchX = null; } else if (touchX != null) ship.x += U.clamp(touchX - ship.x, -170 * dt, 170 * dt);
      ship.x = U.clamp(ship.x, 14, E.W - 14);
      cool -= dt;
      if ((I.down('jump') || I.down('act') || firing) && cool <= 0) { cool = 0.28; (ship.triple > 0 ? [-0.25, 0, 0.25] : [0]).forEach((a) => shots.push({ x: ship.x, y: ship.y - 10, vx: Math.sin(a) * 260, vy: -Math.cos(a) * 260 })); GG.audio.sfx('shoot'); }
      shots.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; }); shots = shots.filter((s) => s.y > -10);
      const sway = Math.sin(sc.t * 0.8) * 24, sp = 1 + wave * 0.12;
      foes.forEach((f) => {
        if (f.enter > 0) { f.x += (f.hx + sway - f.x) * Math.min(1, dt * 3); f.y += (f.hy - f.y) * Math.min(1, dt * 3); if (Math.abs(f.y - f.hy) < 2) f.enter = 0; return; }
        if (f.dive > 0) { f.dive += dt; f.x += Math.sin(f.dive * 3) * 120 * dt + (ship.x - f.x) * dt * 0.8; f.y += 90 * sp * dt; if (f.y > E.H + 20) { f.dive = 0; f.y = -20; f.enter = 1; } }
        else { f.x = f.hx + sway; f.y = f.hy + Math.sin(sc.t * 2 + f.hx) * 2; if (Math.random() < dt * 0.05 * sp) f.dive = 0.01; if (Math.random() < dt * 0.1 * sp) drops.push({ x: f.x, y: f.y + 6, vy: 80 + wave * 8 }); }
        if (Math.abs(f.x - ship.x) < 12 && Math.abs(f.y - ship.y) < 10) { f.dead = true; hit(); }
      });
      for (const s of shots) for (const f of foes) if (!f.dead && !s.used && Math.abs(s.x - f.x) < 11 && Math.abs(s.y - f.y) < 9) {
        s.used = true; f.hp--; if (f.hp > 0) { GG.audio.note('G6', 0.04); continue; }
        f.dead = true; const v = (f.dive > 0 ? 30 : 10) * (f.k === 'fabrica' ? 2 : 1); api.add(v); clean = Math.min(1, clean + 0.012); GG.audio.sfx('boom');
        if (X()) { X().sparkle(f.x, f.y, '#ffffff', 4); X().pop(f.x, f.y - 8, '+' + v, '#e8f7ff', 7); X().puff(f.x, f.y, 2); }
        if (Math.random() < 0.08) caps.push({ k: U.pick(['raio', 'escudo', 'raio', 'coracao']), x: f.x, y: f.y });
      }
      shots = shots.filter((s) => !s.used); foes = foes.filter((f) => !f.dead);
      drops.forEach((d) => { d.y += d.vy * dt; if (Math.abs(d.x - ship.x) < 9 && Math.abs(d.y - ship.y) < 8) { d.used = true; hit(); } }); drops = drops.filter((d) => !d.used && d.y < E.H + 5);
      caps.forEach((cp) => { cp.y += 50 * dt; if (Math.abs(cp.x - ship.x) < 12 && Math.abs(cp.y - ship.y) < 12) { cp.used = true; GG.audio.sfx('power'); api.add(20); if (cp.k === 'raio') ship.triple = 9; if (cp.k === 'escudo') ship.shield = 10; if (cp.k === 'coracao') { api.lives = Math.min(api.maxLives, api.lives + 1); api.refresh(); } if (X()) X().pop(cp.x, cp.y - 10, { raio: 'TIRO TRIPLO!', escudo: 'ESCUDO!', coracao: '+1 VIDA' }[cp.k], '#9ff2ff', 7); } });
      caps = caps.filter((cp) => !cp.used && cp.y < E.H);
      if (!foes.length) { api.add(150); GG.audio.sfx('win'); E.fx.confetti(E.W / 2, 60, 40); newWave(); }
      if (time >= 170) { playing = false; setTimeout(() => api.end(api.score, 'Tempo! Ondas limpas: ' + (wave - 1) + '.'), 500); }
    };
    function smog(c, x, f) {
      if (f.k === 'lixo') { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, f.y - 7, 12, 14); c.fillStyle = '#9aa0ab'; c.fillRect(f.x - 7, f.y - 8, 14, 3); c.fillStyle = '#ff5d6c'; c.fillRect(f.x - 3, f.y - 2, 2, 2); c.fillRect(f.x + 1, f.y - 2, 2, 2); return; }
      const col = f.k === 'fabrica' ? '#4a4450' : '#8a8494';
      c.fillStyle = col; [[-6, 1, 6], [0, -3, 7], [6, 1, 6], [0, 3, 6]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(f.x + dx, f.y + dy, r, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = f.hp > 1 ? '#ffd23f' : '#ff5d6c'; c.fillRect(f.x - 4, f.y - 2, 2, 2); c.fillRect(f.x + 2, f.y - 2, 2, 2); c.fillStyle = '#2a2233'; c.fillRect(f.x - 3, f.y + 3, 6, 1);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      // céu poluído que vai clareando
      const sky = c.createLinearGradient(0, 0, 0, E.H);
      const mix = (a, b) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * clean)).join(',') + ')';
      sky.addColorStop(0, mix([90, 80, 70], [60, 150, 240])); sky.addColorStop(1, mix([150, 130, 110], [200, 235, 255]));
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (x && clean > 0.3) x.glow(c, 340, 40, 30 + clean * 20, '#fff2a0', clean);
      // cidade no fundo
      for (let i = 0; i < 16; i++) { const h = 30 + (i * 37) % 50, w = 24; c.fillStyle = mix([60, 55, 60], [90, 110, 150]); c.fillRect(i * 26, E.H - h, w, h); c.fillStyle = 'rgba(255,230,150,.6)'; for (let yy = E.H - h + 5; yy < E.H - 4; yy += 7) c.fillRect(i * 26 + 5, yy, 3, 3); }
      foes.forEach((f) => smog(c, x, f));
      drops.forEach((d) => { c.fillStyle = '#3a3440'; c.beginPath(); c.arc(d.x, d.y, 3, 0, Math.PI * 2); c.fill(); });
      shots.forEach((s) => { if (x) x.glow(c, s.x, s.y, 7, '#fff27a', 0.8); g.rect(s.x - 1, s.y - 5, 2, 8, '#fff6b0'); });
      caps.forEach((cp) => { if (x) { x.glow(c, cp.x, cp.y, 10, '#9ff2ff', 0.6); x.ilus(c, cp.k, cp.x, cp.y, 14); } });
      if (!(ship.inv > 0 && Math.floor(sc.t * 16) % 2)) {
        if (ship.shield > 0) { c.strokeStyle = 'rgba(159,242,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(ship.x, ship.y, 16, 0, Math.PI * 2); c.stroke(); }
        if (x) x.glow(c, ship.x, ship.y + 8, 10, '#ffb040', 0.8);
        c.fillStyle = '#2e5bd8'; c.beginPath(); c.moveTo(ship.x, ship.y - 12); c.lineTo(ship.x + 12, ship.y + 8); c.lineTo(ship.x - 12, ship.y + 8); c.closePath(); c.fill();
        c.fillStyle = '#1a2a6a'; for (let i = -1; i <= 1; i++) c.fillRect(ship.x + i * 7 - 3, ship.y, 6, 6); c.fillStyle = '#9ff2ff'; c.fillRect(ship.x - 2, ship.y - 6, 4, 4);
        if (x) x.ilus(c, 'sol', ship.x, ship.y - 2, 10);
      }
      g.rect(8, 8, 80, 5, 'rgba(0,0,0,.4)'); g.rect(8, 8, 80 * clean, 5, '#7bff8f'); g.text('CÉU LIMPO ' + Math.round(clean * 100) + '%', 8, 15, { size: 4, color: '#fff' });
      if (waveAnn > 0) g.text('ONDA ' + wave, E.W / 2, 100, { size: 14, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; ship.inv = 0; ship.shield = 0; hit(); } };
    return sc;
  });

  /* ================================================================ EMPILHA-PRÉDIOS */
  PQ.register({ id: 'w3_predios', world: 3, boss: 'c3s6', ref: 'Tower Bloxx / Stack', title: 'Empilha-Prédios', icon: 'predio', c1: '#3ec1ff', c2: '#0b2a4a', music: 'cidade', medals: [15, 30, 50], unit: 'andares',
    desc: 'O guindaste balança um andar! Solte na hora certa e faça o prédio crescer até as nuvens.',
    how: 'Aperte **Espaço** ou toque para **soltar** o andar. Quanto mais alinhado, melhor: **PERFEITO** não perde nada e faz combo. O que ficar para fora cai! Errar o prédio inteiro tira 1 vida (**3 vidas**).' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const FH = 16, BASEY = 205;
    let floors = [{ x: 170, w: 60, col: '#8a8f9e' }], hook = { t: 0 }, drop = null, playing = false, perfect = 0, pieces = [], camY = 0, time = 0;
    const COLS = ['#e8744f', '#3ec1ff', '#ffd23f', '#35e07a', '#b07bff', '#ff4d6d', '#f39c12'];
    api.lives = 3; api.refresh(); api.goal('Empilhe os andares! Cada andar = +1.200 moradores.');
    sc.begin = () => { playing = true; };
    const top = () => floors[floors.length - 1];
    function hookPos() { const h = floors.length, amp = Math.min(150, 70 + h * 3), sp = 1.4 + Math.min(1.6, h * 0.05); return { x: 200 + Math.sin(hook.t * sp) * amp, y: camY + 28 }; }
    const release = () => { if (!playing || drop) return; const hp = hookPos(); drop = { x: hp.x - top().w / 2, y: hp.y + 20, w: top().w, vy: 0, col: COLS[floors.length % COLS.length] }; GG.audio.sfx('click'); };
    sc.click = release;
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; hook.t += dt;
      if (I.pressed('jump') || I.pressed('act') || I.pressed('down')) release();
      const targetCam = Math.min(0, BASEY - floors.length * FH - 120);
      camY += (targetCam - camY) * Math.min(1, dt * 3);
      pieces.forEach((p) => { p.vy += 500 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }); pieces = pieces.filter((p) => p.y < camY + E.H + 60);
      if (!drop) return;
      drop.vy += 700 * dt; drop.y += drop.vy * dt;
      const landY = BASEY - floors.length * FH;
      if (drop.y + FH >= landY) {
        const t = top(), l = Math.max(drop.x, t.x), r = Math.min(drop.x + drop.w, t.x + t.w), ov = r - l;
        if (ov < 6) { pieces.push({ x: drop.x, y: landY - FH, w: drop.w, col: drop.col, vy: 0, vr: (drop.x < t.x ? -3 : 3), rot: 0 }); drop = null; perfect = 0; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(4, 0.3); if (X()) X().flash('#ff4d4d', 0.3);
          if (api.lives <= 0) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Prédio com ' + (floors.length - 1) + ' andares: ' + U.fmtInt((floors.length - 1) * 1200) + ' moradores!'), 900); } return; }
        const off = Math.abs(drop.x - t.x);
        let nx = l, nw = ov;
        if (off <= 3) { nx = t.x; nw = Math.min(90, t.w + (perfect >= 2 ? 6 : 0)); perfect++; GG.audio.sfx('frag'); if (X()) { X().pop(200, landY - camY - 30, perfect > 1 ? 'PERFEITO x' + perfect + '!' : 'PERFEITO!', '#7bff8f', 10); X().ring(nx + nw / 2, landY - FH / 2, '#7bff8f', 40); } api.add(0); }
        else { perfect = 0; GG.audio.sfx('stomp'); const cutL = drop.x < t.x, cw = drop.w - ov; pieces.push({ x: cutL ? drop.x : r, y: landY - FH, w: cw, col: drop.col, vy: 0, vr: cutL ? -4 : 4, rot: 0 }); }
        floors.push({ x: nx, w: nw, col: drop.col });
        drop = null; E.shake(1.5, 0.1); if (X()) X().puff(nx + nw / 2, landY, 3);
        api.score = floors.length - 1; api.refresh(); api.extra('abraco', U.fmtInt((floors.length - 1) * 1200) + ' moradores');
        if (floors.length % 10 === 1) { GG.audio.sfx('win'); E.fx.confetti(200, 60, 40); }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(floors.length - 1, 'Tempo! Prédio com ' + (floors.length - 1) + ' andares.'), 500); }
    };
    function floorDraw(c, f, y, alpha) {
      c.fillStyle = f.col; c.fillRect(f.x, y, f.w, FH); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(f.x, y, f.w, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(f.x, y + FH - 2, f.w, 2);
      c.fillStyle = 'rgba(255,240,170,' + (alpha || 0.85) + ')'; for (let wx = f.x + 4; wx < f.x + f.w - 5; wx += 9) c.fillRect(wx, y + 5, 5, 6);
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      const h = floors.length, k = Math.min(1, h / 60);
      const sky = c.createLinearGradient(0, 0, 0, E.H); sky.addColorStop(0, 'rgb(' + Math.round(80 - 70 * k) + ',' + Math.round(160 - 140 * k) + ',' + Math.round(240 - 180 * k) + ')'); sky.addColorStop(1, 'rgb(' + Math.round(190 - 140 * k) + ',' + Math.round(225 - 170 * k) + ',255)');
      c.fillStyle = sky; c.fillRect(0, 0, E.W, E.H);
      if (k > 0.5) for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,' + ((k - 0.5) * 1.6).toFixed(2) + ')'; c.fillRect((i * 83) % E.W, (i * 47) % E.H, 1, 1); }
      if (x) X().hd(c, () => { for (let i = 0; i < 5; i++) { const im = x.img[['cloud1', 'cloud3', 'cloud5'][i % 3]]; if (!im) continue; const cy = ((i * 170 - camY * 0.5) % 500) - 60; c.globalAlpha = 0.8; c.drawImage(im, (i * 97 + sc.t * 6) % (E.W + 80) - 60, cy, 70, 42); } c.globalAlpha = 1; });
      c.save(); c.translate(0, -camY);
      // cidade e chão
      for (let i = 0; i < 16; i++) { const bh = 30 + (i * 29) % 60; c.fillStyle = '#5c6f8f'; c.fillRect(i * 26, BASEY - bh, 22, bh); }
      c.fillStyle = '#3fae52'; c.fillRect(0, BASEY, E.W, 60);
      floors.forEach((f, i) => { if (i === 0) { c.fillStyle = '#6b6f7a'; c.fillRect(f.x - 6, BASEY - FH, f.w + 12, FH); return; } floorDraw(c, f, BASEY - (i + 1) * FH); });
      pieces.forEach((p) => { c.save(); c.translate(p.x + p.w / 2, p.y + FH / 2); c.rotate(p.rot); c.translate(-p.w / 2, -FH / 2); floorDraw(c, { x: 0, w: p.w, col: p.col }, 0, 0.4); c.restore(); });
      if (drop) floorDraw(c, drop, drop.y);
      // guindaste
      const hp = hookPos();
      c.fillStyle = '#ffd23f'; c.fillRect(0, camY + 10, E.W, 5); c.fillStyle = '#c99a1e'; for (let i = 0; i < E.W; i += 10) c.fillRect(i, camY + 10, 5, 5);
      c.strokeStyle = '#2a2a33'; c.lineWidth = 1; c.beginPath(); c.moveTo(hp.x, camY + 15); c.lineTo(hp.x, hp.y + 20); c.stroke();
      c.fillStyle = '#2a2a33'; c.fillRect(hp.x - 4, camY + 12, 8, 6);
      if (!drop && playing) floorDraw(c, { x: hp.x - top().w / 2, w: top().w, col: COLS[floors.length % COLS.length] }, hp.y + 20);
      c.restore();
      g.text(String(h - 1), E.W - 12, 24, { size: 16, color: '#fff', align: 'right' }); g.text('ANDARES', E.W - 12, 42, { size: 5, color: '#ffd23f', align: 'right' });
    };
    sc.dbg = { end() { api.lives = 1; drop = { x: -500, y: -1000, w: 10, vy: 0, col: '#fff' }; } };
    return sc;
  });
})();
```

## arcade4.js

Extras: Travessia do Rio (Frogger, Mundo 1) e Pinball da Floresta (Sonic Spinball, Mundo 3). Caminho: `src/modules/geografia/scenes/arcade4.js` (260 linhas).

```js
/* =====================================================================
   scenes/arcade4.js — MAIS DOIS JOGOS DO ARCADE (pedido do usuário,
   24/09/2026). Registrados com GEO.parque.register, liberados pelo
   chefe do mundo, como os outros:
   • Travessia do Rio (Mundo 1) — atravesse a estrada de terra e o rio
     pulando em troncos, canoas e tartarugas até as ocas da outra margem
     (jogabilidade no estilo Frogger). 3 vidas, 30 s por travessia.
   • Pinball da Floresta (Mundo 3) — mesa de pinball na mata: rebatedores,
     cogumelos-pára-choque, bichos presos para resgatar e Sementes Mágicas
     (jogabilidade no estilo Sonic Spinball). 3 bolas, 3 minutos.
   Nenhum sprite, nome ou fase de jogos comerciais foi copiado.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, C = GEO.common, PQ = GEO.parque;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const IN = () => GG.input;

  /* ================================================================ TRAVESSIA DO RIO */
  const CELL = 16, COLS = 25, Y0 = 13, ROWS = 13;
  const OCAS = [2, 7, 12, 17, 22];
  // faixas: y = linha; k = tipo; v = velocidade (px/s; + direita); objs = [início (em células), tamanho (células)]
  const LANES = [
    { row: 1, k: 'tronco', v: 38, objs: [[0, 4], [9, 3], [17, 4]] },
    { row: 2, k: 'tartaruga', v: -34, objs: [[1, 3], [8, 3], [15, 3], [22, 2]], dive: true },
    { row: 3, k: 'canoa', v: 56, objs: [[0, 3], [11, 3], [20, 2]] },
    { row: 4, k: 'jacare', v: -30, objs: [[2, 3], [12, 4], [20, 3]], croc: [0] },
    { row: 5, k: 'tartaruga', v: 44, objs: [[0, 2], [7, 2], [13, 2], [19, 2]], dive: true },
    { row: 7, k: 'caminhao', v: -36, objs: [[0, 2], [12, 2]], road: true },
    { row: 8, k: 'carro', v: 62, objs: [[2, 1], [10, 1], [18, 1]], road: true },
    { row: 9, k: 'bicicleta', v: -48, objs: [[1, 1], [8, 1], [15, 1], [21, 1]], road: true },
    { row: 10, k: 'onibus', v: 30, objs: [[4, 2], [16, 2]], road: true },
    { row: 11, k: 'carro', v: -72, objs: [[3, 1], [13, 1]], road: true }
  ];
  const PERIOD = 480; // os objetos dão a volta na tela
  PQ.register({ id: 'w1_travessia', world: 1, boss: 'c1s5', ref: 'Frogger', title: 'Travessia do Rio', icon: 'jacare', c1: '#2f9be0', c2: '#0b3a5c', music: 'oceano', medals: [600, 1400, 2400], unit: 'pts',
    desc: 'Atravesse a estrada de terra e o rio pulando em troncos, canoas e tartarugas até as ocas da outra margem!',
    how: 'Use as **setas** (ou toque para o lado que quer pular). Na **estrada**, desvie dos veículos. No **rio**, só pise em **troncos, canoas e tartarugas** — as tartarugas **mergulham** e a **boca do jacaré** morde! Leve o Gabriel às **5 ocas**. **3 vidas** e **30 s** por travessia.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const pl = { col: 12, row: 12, x: 12 * CELL, hop: 0, dir: 'up', dead: 0, best: 12 };
    let playing = false, T = 0, cross = 30, total = 0, filled = [false, false, false, false, false], level = 0, bonusOca = -1, bonusT = 6;
    api.lives = 3; api.refresh(); api.goal('Leve o Gabriel às 5 ocas do outro lado do rio!');
    const rowY = (r) => Y0 + r * CELL;
    const spd = () => 1 + level * 0.18;
    sc.begin = () => { playing = true; };
    const objX = (L, o) => { const p = ((o[0] * CELL + L.v * spd() * T) % PERIOD + PERIOD) % PERIOD; return p - (PERIOD - 400); };
    function diving(L, i) { if (!L.dive || i % 2) return 0; const s = Math.sin(T * 0.9 + i * 1.7 + L.row); return s > 0.55 ? (s > 0.8 ? 2 : 1) : 0; } // 1 afundando, 2 embaixo d'água
    function move(dx, dy) {
      if (!playing || pl.dead > 0 || pl.hop > 0) return;
      const nr = U.clamp(pl.row + dy, 0, ROWS - 1), nx = U.clamp(pl.x + dx * CELL, 0, (COLS - 1) * CELL);
      pl.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      pl.row = nr; pl.x = nx; pl.hop = 0.12; GG.audio.sfx('jump');
      if (nr < pl.best) { pl.best = nr; api.add(10); }
    }
    PQ.pointer(sc, { pointerdown: (lx, ly) => { const dx = lx - (pl.x + 8), dy = ly - (rowY(pl.row) + 8); if (Math.abs(dy) > Math.abs(dx)) move(0, dy < 0 ? -1 : 1); else move(dx < 0 ? -1 : 1, 0); } });
    function die(why) {
      if (pl.dead > 0) return;
      pl.dead = 1; api.lives--; api.refresh(); GG.audio.sfx('hit'); E.shake(3, 0.25);
      if (X()) { X().flash('#ff4d4d', 0.25); X().pop(pl.x + 8, rowY(pl.row) - 4, why, '#ff8f8f', 8); if (why === 'Caiu na água!') X().ring(pl.x + 8, rowY(pl.row) + 8, '#9ff2ff', 18); }
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Ocas alcançadas: ' + total + ' • nível ' + (level + 1) + '. Espere o tronco chegar antes de pular!'), 900); }
    }
    function respawn() { pl.col = 12; pl.row = 12; pl.x = 12 * CELL; pl.best = 12; pl.dir = 'up'; cross = 30; }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      T += dt; if (pl.hop > 0) pl.hop -= dt;
      bonusT -= dt; if (bonusT <= 0) { bonusT = 7; const free = OCAS.map((_, i) => i).filter((i) => !filled[i]); bonusOca = Math.random() < 0.6 && free.length ? U.pick(free) : -1; }
      if (pl.dead > 0) { pl.dead -= dt; if (pl.dead <= 0 && playing) respawn(); return; }
      if (I.pressed('up') || I.pressed('jump')) move(0, -1); else if (I.pressed('down')) move(0, 1); else if (I.pressed('left')) move(-1, 0); else if (I.pressed('right')) move(1, 0);
      cross -= dt; api.extra('cronometro', Math.max(0, Math.ceil(cross)) + 's');
      if (cross <= 0) { die('O tempo acabou!'); return; }
      const L = LANES.find((l) => l.row === pl.row), px = pl.x + 3, pw = 10;
      if (L && L.road) {
        L.objs.forEach((o) => { const ox = objX(L, o), ow = o[1] * CELL; if (px + pw > ox + 2 && px < ox + ow - 2) die('Cuidado com a estrada!'); });
      } else if (L) {
        let on = null;
        L.objs.forEach((o, i) => { const ox = objX(L, o), ow = o[1] * CELL; if (pl.x + 8 > ox && pl.x + 8 < ox + ow && diving(L, i) < 2) on = { ox, ow, i }; });
        if (!on) { die('Caiu na água!'); return; }
        if (L.croc) { const head = L.v < 0 ? on.ox : on.ox + on.ow - CELL; if (pl.x + 8 > head && pl.x + 8 < head + CELL) { die('O jacaré mordeu!'); return; } }
        if (pl.hop <= 0) pl.x += L.v * spd() * dt;
        if (pl.x < -4 || pl.x > (COLS - 1) * CELL + 4) { die('A correnteza levou!'); return; }
      }
      if (pl.row === 0 && pl.hop <= 0) {
        const oi = OCAS.findIndex((c) => Math.abs(pl.x - c * CELL) < 9);
        if (oi < 0 || filled[oi]) { die(oi < 0 ? 'Mata fechada! Mire na oca' : 'Essa oca já tem gente!'); return; }
        filled[oi] = true; total++; const tb = Math.ceil(cross) * 3 + (bonusOca === oi ? 150 : 0); api.add(50 + tb); GG.audio.sfx(bonusOca === oi ? 'frag' : 'win');
        if (X()) { X().sparkle(OCAS[oi] * CELL + 8, rowY(0) + 8, '#fff0a0', 8); X().pop(OCAS[oi] * CELL + 8, rowY(1), '+' + (50 + tb) + (bonusOca === oi ? ' PEIXE!' : ''), '#ffe27a', 8); }
        if (bonusOca === oi) bonusOca = -1;
        if (filled.every(Boolean)) { level++; filled = filled.map(() => false); api.add(500); E.fx.confetti(E.W / 2, 40, 50); if (X()) X().pop(E.W / 2, 80, 'TODAS AS OCAS! +500 — nível ' + (level + 1), '#7bff8f', 11); api.goal('Nível ' + (level + 1) + ': tudo mais rápido!'); }
        respawn();
      }
      if (T >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo total esgotado! Ocas alcançadas: ' + total + '.'), 500); }
    };
    function drawObj(c, g, x, L, ox, len, i) {
      const y = rowY(L.row), w = len * CELL, d = diving(L, i);
      if (L.k === 'tronco') { c.fillStyle = '#6b3f1d'; c.fillRect(ox, y + 3, w, 10); c.fillStyle = '#8a5a2e'; c.fillRect(ox, y + 3, w, 3); c.fillStyle = '#a0683a'; c.beginPath(); c.ellipse(ox + w, y + 8, 2.5, 5, 0, 0, Math.PI * 2); c.fill(); return; }
      if (L.k === 'canoa') { c.fillStyle = '#b5652a'; c.beginPath(); c.moveTo(ox, y + 5); c.lineTo(ox + w, y + 5); c.lineTo(ox + w - 5, y + 13); c.lineTo(ox + 5, y + 13); c.closePath(); c.fill(); c.fillStyle = '#7a3f15'; c.fillRect(ox + 4, y + 6, w - 8, 3); c.fillStyle = '#e5484d'; c.fillRect(ox + w / 2 - 1, y + 6, 2, 6); return; }
      if (L.k === 'tartaruga') { for (let k = 0; k < len; k++) { c.save(); c.globalAlpha = d === 2 ? 0.15 : d === 1 ? 0.55 : 1; if (!(x && x.ilus(c, 'tartaruga', ox + k * CELL + 8, y + 8, 15, { flip: L.v < 0 }))) { c.fillStyle = '#2e9e6a'; c.fillRect(ox + k * CELL + 2, y + 3, 12, 10); } c.restore(); } return; }
      if (L.k === 'jacare') { c.fillStyle = '#3f7a3a'; c.fillRect(ox, y + 4, w, 9); c.fillStyle = '#2e5a2a'; for (let k = 4; k < w; k += 6) c.fillRect(ox + k, y + 3, 3, 2); const hx = L.v < 0 ? ox : ox + w - CELL; c.fillStyle = '#5aa04f'; c.fillRect(hx, y + 3, CELL, 11); c.fillStyle = '#fff'; c.fillRect(hx + (L.v < 0 ? 2 : 10), y + 4, 3, 3); c.fillStyle = '#e5484d'; c.fillRect(hx + (L.v < 0 ? 0 : 12), y + 9, 4, 2); return; }
      const ic = { caminhao: 'caminhao', carro: 'carro', bicicleta: 'bicicleta', onibus: 'onibus' }[L.k];
      if (!(x && x.ilus(c, ic, ox + w / 2, y + 8, L.k === 'bicicleta' ? 15 : w > CELL ? 26 : 16, { flip: L.v > 0 }))) { c.fillStyle = '#ffd23f'; c.fillRect(ox + 1, y + 3, w - 2, 10); }
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      c.fillStyle = '#0b1a2a'; c.fillRect(0, 0, E.W, E.H);
      // margens, rio e estrada
      c.fillStyle = '#2e7d3a'; c.fillRect(0, rowY(0), E.W, CELL); // mata da outra margem
      const rio = c.createLinearGradient(0, rowY(1), 0, rowY(6)); rio.addColorStop(0, '#1f78c8'); rio.addColorStop(1, '#2f9be0'); c.fillStyle = rio; c.fillRect(0, rowY(1), E.W, CELL * 5);
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let r = 1; r <= 5; r++) for (let k = 0; k < 8; k++) c.fillRect(((k * 57 + T * 20 * (r % 2 ? 1 : -1)) % 420 + 420) % 420 - 10, rowY(r) + 7 + (k % 2) * 4, 8, 1);
      c.fillStyle = '#c9a36a'; c.fillRect(0, rowY(6), E.W, CELL); c.fillStyle = '#7a8a3a'; for (let k = 0; k < 25; k++) c.fillRect(k * 16 + 3, rowY(6) + 2 + (k % 3), 2, 3);
      c.fillStyle = '#8a6a44'; c.fillRect(0, rowY(7), E.W, CELL * 5); c.fillStyle = 'rgba(255,240,200,.25)'; for (let r = 7; r < 11; r++) for (let k = 0; k < E.W; k += 24) c.fillRect(k, rowY(r) + 15, 12, 1);
      c.fillStyle = '#6aa84f'; c.fillRect(0, rowY(12), E.W, CELL);
      // ocas
      OCAS.forEach((col, i) => { const ox = col * CELL; c.fillStyle = '#1f4a2a'; c.fillRect(ox - 2, rowY(0), CELL + 4, CELL); if (x) x.ilus(c, 'cabana', ox + 8, rowY(0) + 7, 16, { alpha: filled[i] ? 1 : 0.55 }); if (filled[i]) g.img(C.gabrielTop(GEO.eco.look(), 'down', false, 0), ox + 1, rowY(0) - 3); else if (bonusOca === i && x) x.ilus(c, 'peixe', ox + 8, rowY(0) + 8, 12); });
      LANES.forEach((L) => L.objs.forEach((o, i) => drawObj(c, g, x, L, objX(L, o), o[1], i)));
      // Gabriel
      if (!(pl.dead > 0 && Math.floor(sc.t * 12) % 2)) {
        const lift = pl.hop > 0 ? Math.sin((0.12 - pl.hop) / 0.12 * Math.PI) * 4 : 0;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(pl.x + 8, rowY(pl.row) + 14, 5, 2, 0, 0, Math.PI * 2); c.fill();
        g.img(C.gabrielTop(GEO.eco.look(), pl.dir, pl.hop > 0, sc.t), pl.x + 1, rowY(pl.row) - 4 - lift, { flip: pl.dir === 'left' });
      }
      // barra de tempo da travessia
      g.rect(0, 222, E.W, 3, 'rgba(0,0,0,.5)'); g.rect(0, 222, E.W * Math.max(0, cross) / 30, 3, cross < 8 ? '#ff5d6c' : '#ffd23f');
      g.text('Ocas: ' + filled.filter(Boolean).length + '/5 • nível ' + (level + 1), 4, 2, { size: 5, color: '#fff' });
    };
    sc.dbg = { end() { api.lives = 1; pl.dead = 0; die('fim'); }, pl, get filled() { return filled; }, fillAll() { filled = [true, true, true, true, false]; pl.row = 1; pl.x = OCAS[4] * CELL; pl.best = 1; } };
    return sc;
  });

  /* ================================================================ PINBALL DA FLORESTA */
  // mesa: paredes como segmentos [x1, y1, x2, y2]
  const WALLS = [
    [110, 60, 122, 30], [122, 30, 150, 14], [150, 14, 200, 8], [200, 8, 250, 14], [250, 14, 285, 26], [285, 26, 302, 45], // arco de cima
    [110, 60, 110, 162], [110, 162, 156, 194], // esquerda + rampa do rebatedor
    [290, 62, 290, 162], [290, 162, 244, 194], // direita + rampa
    [302, 45, 302, 222], [290, 162, 290, 222], // canaleta do lançador
    [290, 212, 302, 212] // chão do lançador
  ];
  const SLINGS = [[128, 132, 150, 166], [272, 132, 250, 166]]; // estilingues (chutam forte)
  const BUMPERS = [{ x: 170, y: 72, r: 11 }, { x: 230, y: 72, r: 11 }, { x: 200, y: 104, r: 11 }];
  const TARGETS = [{ x: 172, k: 'arara' }, { x: 196, k: 'macaco' }, { x: 220, k: 'preguica' }];
  const SEED_SPOTS = [[140, 110], [260, 110], [200, 44], [150, 70], [250, 70]];
  const FL = [{ px: 158, py: 196, rest: 0.5, up: -0.5, key: 'left' }, { px: 242, py: 196, rest: Math.PI - 0.5, up: Math.PI + 0.5, key: 'right' }];
  const FLEN = 31, BR = 4;
  PQ.register({ id: 'w3_pinball', world: 3, boss: 'c3s6', ref: 'Sonic Spinball (Mega Drive)', title: 'Pinball da Floresta', icon: 'arvore', c1: '#2ecc71', c2: '#0f3a1f', music: 'festa', medals: [3000, 7000, 12000], unit: 'pts',
    desc: 'Pinball na mata! Rebata a bola, acerte os cogumelos, liberte os bichos presos e junte as Sementes Mágicas para a floresta renascer.',
    how: '**←** rebatedor da esquerda e **→** da direita (ou toque na metade esquerda/direita). **Espaço** (ou toque) lança a bola. Acerte os **3 bichos presos** para o **RESGATE** (multiplicador sobe!) e pegue as **Sementes Mágicas**: 3 sementes = bola extra. **3 bolas**, 3 minutos.' }, function (api) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    const ball = { x: 296, y: 207, vx: 0, vy: 0, inLane: true };
    const fl = FL.map((f) => ({ ...f, a: f.rest, w: 0 }));
    let playing = false, time = 0, mult = 1, targets = [false, false, false], resetT = 0, seed = null, seeds = 0, saveT = 0, hold = { left: false, right: false }, flash = {}, bumpT = [0, 0, 0], green = 0;
    api.lives = 3; api.refresh(); api.goal('Liberte os bichos e junte as Sementes Mágicas!');
    sc.begin = () => { playing = true; newSeed(); };
    function newSeed() { const s = U.pick(SEED_SPOTS); seed = { x: s[0], y: s[1] }; }
    function launch() { if (!playing || !ball.inLane) return; ball.inLane = false; ball.vy = -560 - Math.random() * 40; ball.vx = 0; saveT = 5; GG.audio.sfx('shoot'); }
    PQ.pointer(sc, {
      pointerdown: (lx) => { if (ball.inLane) { launch(); return; } hold[lx < E.W / 2 ? 'left' : 'right'] = true; },
      pointerup: () => { hold.left = hold.right = false; }, pointercancel: () => { hold.left = hold.right = false; }
    });
    function collideSeg(x1, y1, x2, y2, e, kick) {
      const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
      let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / L2; t = U.clamp(t, 0, 1);
      const cx = x1 + t * dx, cy = y1 + t * dy, ox = ball.x - cx, oy = ball.y - cy, d = Math.hypot(ox, oy);
      if (d >= BR || d === 0) return false;
      const nx = ox / d, ny = oy / d; ball.x = cx + nx * BR; ball.y = cy + ny * BR;
      const vn = ball.vx * nx + ball.vy * ny;
      if (vn < 0) { ball.vx -= (1 + e) * vn * nx; ball.vy -= (1 + e) * vn * ny; if (kick) { ball.vx += nx * kick; ball.vy += ny * kick; } }
      return true;
    }
    function lose() {
      if (saveT > 0) { ball.inLane = true; ball.x = 296; ball.y = 207; ball.vx = ball.vy = 0; if (X()) X().pop(200, 120, 'BOLA SALVA!', '#9ff2ff', 10); GG.audio.sfx('check'); return; }
      api.lives--; api.refresh(); GG.audio.sfx('hit'); if (X()) X().flash('#ff4d4d', 0.25); mult = 1;
      if (api.lives <= 0) { playing = false; setTimeout(() => api.end(api.score, 'Bichos resgatados e sementes: ' + seeds + ' semente(s). Segure o rebatedor para “segurar” a bola e mirar!'), 700); return; }
      ball.inLane = true; ball.x = 296; ball.y = 207; ball.vx = ball.vy = 0;
    }
    sc.update = function (dt) {
      sc.t += dt; const I = IN();
      if (I.pressed('pause')) PQ.pause();
      if (!playing) return;
      time += dt; api.extra('cronometro', Math.max(0, Math.ceil(180 - time)) + 's');
      if (I.pressed('jump') || I.pressed('up')) launch();
      if (saveT > 0) saveT -= dt; if (resetT > 0) { resetT -= dt; if (resetT <= 0) targets = [false, false, false]; }
      bumpT = bumpT.map((v) => Math.max(0, v - dt)); if (green > 0) green -= dt * 0.1;
      fl.forEach((f) => {
        const down = f.key === 'left' ? (I.down('left') || hold.left) : (I.down('right') || hold.right);
        const target = down ? f.up : f.rest, prev = f.a, sp = 20 * dt;
        f.a += U.clamp(target - f.a, -sp, sp); f.w = (f.a - prev) / dt;
        if (down && Math.abs(prev - f.up) > 0.05 && Math.abs(f.a - f.up) < 0.05) GG.audio.note('C4', 0.03);
      });
      if (ball.inLane) { ball.x = 296; ball.y = 207; return; }
      const N = 6, h = dt / N;
      for (let s = 0; s < N; s++) {
        ball.vy += 330 * h; ball.x += ball.vx * h; ball.y += ball.vy * h;
        const sp = Math.hypot(ball.vx, ball.vy); if (sp > 600) { ball.vx *= 600 / sp; ball.vy *= 600 / sp; }
        WALLS.forEach((w) => collideSeg(w[0], w[1], w[2], w[3], 0.45, 0));
        SLINGS.forEach((w, i) => { if (collideSeg(w[0], w[1], w[2], w[3], 0.6, 140)) { api.add(20 * mult); flash['s' + i] = 0.15; GG.audio.note('G5', 0.04); } });
        BUMPERS.forEach((b, i) => {
          const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
          if (d < b.r + BR && d > 0) { const nx = dx / d, ny = dy / d; ball.x = b.x + nx * (b.r + BR); ball.y = b.y + ny * (b.r + BR); const v = Math.max(260, Math.hypot(ball.vx, ball.vy)); ball.vx = nx * v; ball.vy = ny * v; bumpT[i] = 0.15; api.add(50 * mult); GG.audio.sfx('spring'); if (X()) X().ring(b.x, b.y, '#ffd23f', 16); }
        });
        TARGETS.forEach((t, i) => {
          if (targets[i]) return;
          if (ball.x > t.x - 7 && ball.x < t.x + 7 && ball.y > 30 && ball.y < 40) {
            targets[i] = true; ball.vy = Math.abs(ball.vy) * 0.8 + 40; api.add(150 * mult); GG.audio.sfx('coin');
            if (X()) { X().sparkle(t.x, 34, '#fff0a0', 6); X().pop(t.x, 48, 'LIVRE!', '#7bff8f', 7); }
            if (targets.every(Boolean)) { api.add(600 * mult); mult = Math.min(5, mult + 1); resetT = 1.5; GG.audio.sfx('win'); green = 1; E.fx.confetti(200, 40, 30); if (X()) X().pop(200, 90, 'RESGATE! +' + 600 * (mult - 1) + '  multiplicador x' + mult, '#ffd23f', 10); }
          }
        });
        fl.forEach((f) => {
          const tx = f.px + Math.cos(f.a) * FLEN, ty = f.py + Math.sin(f.a) * FLEN;
          const dx = tx - f.px, dy = ty - f.py, L2 = dx * dx + dy * dy;
          let t = ((ball.x - f.px) * dx + (ball.y - f.py) * dy) / L2; t = U.clamp(t, 0, 1);
          const cx = f.px + t * dx, cy = f.py + t * dy, ox = ball.x - cx, oy = ball.y - cy, d = Math.hypot(ox, oy), rr = BR + 3;
          if (d < rr && d > 0) {
            const nx = ox / d, ny = oy / d; ball.x = cx + nx * rr; ball.y = cy + ny * rr;
            const rx = cx - f.px, ry = cy - f.py, svx = -f.w * ry, svy = f.w * rx; // velocidade da superfície do rebatedor
            const rvx = ball.vx - svx, rvy = ball.vy - svy, vn = rvx * nx + rvy * ny;
            if (vn < 0) { ball.vx = svx + rvx - 1.4 * vn * nx; ball.vy = svy + rvy - 1.4 * vn * ny; }
          }
        });
        if (seed && Math.hypot(ball.x - seed.x, ball.y - seed.y) < 9) {
          seeds++; api.add(300 * mult); GG.audio.sfx('frag'); if (X()) { X().sparkle(seed.x, seed.y, '#7bff8f', 10); X().pop(seed.x, seed.y - 10, 'SEMENTE MÁGICA!', '#7bff8f', 8); }
          seed = null; setTimeout(() => { if (playing) newSeed(); }, 1200);
          if (seeds % 3 === 0) { api.add(1000); api.lives = Math.min(5, api.lives + 1); api.maxLives = Math.max(api.maxLives, api.lives); api.refresh(); green = 1; if (X()) X().pop(200, 110, 'A FLORESTA RENASCEU! +1000 e BOLA EXTRA', '#7bff8f', 10); GG.audio.sfx('power'); }
        }
        if (ball.y > E.H + 8) { lose(); return; }
        if (ball.x > 290 && ball.y > 200 && Math.abs(ball.vy) < 30) { ball.inLane = true; return; }
      }
      if (time >= 180) { playing = false; setTimeout(() => api.end(api.score, 'Tempo esgotado! Sementes Mágicas: ' + seeds + ' • multiplicador x' + mult + '.'), 500); }
    };
    sc.draw = function (g) {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'floresta', sc.t * 4, 0, sc.t, { horizon: 240 }))) { c.fillStyle = '#12301c'; c.fillRect(0, 0, E.W, E.H); }
      // mesa
      c.fillStyle = 'rgba(8,30,16,.88)'; c.beginPath(); c.moveTo(110, 225); c.lineTo(110, 60); c.lineTo(122, 30); c.lineTo(150, 14); c.lineTo(200, 8); c.lineTo(250, 14); c.lineTo(285, 26); c.lineTo(302, 45); c.lineTo(302, 225); c.closePath(); c.fill();
      if (green > 0) { c.save(); c.globalAlpha = Math.min(0.35, green * 0.35); c.fillStyle = '#35e07a'; c.fill(); c.restore(); }
      c.strokeStyle = '#c9a24d'; c.lineWidth = 2; WALLS.forEach((w) => { c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke(); });
      SLINGS.forEach((w, i) => { c.strokeStyle = flash['s' + i] > 0 ? '#fff' : '#ff9a3d'; c.lineWidth = 3; c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke(); if (flash['s' + i] > 0) flash['s' + i] -= 1 / 60; });
      BUMPERS.forEach((b, i) => { const k = bumpT[i] > 0 ? 1.2 : 1; if (x) { x.glow(c, b.x, b.y, b.r * 1.6, '#ffd23f', bumpT[i] > 0 ? 0.9 : 0.35); x.ilus(c, 'girassol', b.x, b.y, b.r * 2 * k); } else g.circle(b.x, b.y, b.r, '#ffd23f'); });
      TARGETS.forEach((t, i) => { if (targets[i]) { if (x) x.ilus(c, t.k, t.x, 22 - (sc.t * 30 % 8), 12); return; } c.fillStyle = '#6b4f2a'; c.fillRect(t.x - 7, 30, 14, 10); if (x) x.ilus(c, t.k, t.x, 35, 10); c.strokeStyle = '#cfcfcf'; c.lineWidth = 1; for (let k = -5; k <= 5; k += 3) { c.beginPath(); c.moveTo(t.x + k, 30); c.lineTo(t.x + k, 40); c.stroke(); } });
      if (seed) { if (x) { x.glow(c, seed.x, seed.y, 12, '#7bff8f', 0.7 + Math.sin(sc.t * 6) * 0.2); x.ilus(c, 'muda', seed.x, seed.y, 13); } else g.circle(seed.x, seed.y, 5, '#7bff8f'); }
      fl.forEach((f) => { const tx = f.px + Math.cos(f.a) * FLEN, ty = f.py + Math.sin(f.a) * FLEN; c.strokeStyle = '#15152a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(f.px, f.py); c.lineTo(tx, ty); c.stroke(); c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.stroke(); c.lineCap = 'butt'; g.circle(f.px, f.py, 2.5, '#e5484d'); });
      // bola (uma semente-bola girando, como o herói do Spinball)
      if (x) x.glow(c, ball.x, ball.y, 8, '#9ff2ff', 0.6);
      c.save(); c.translate(ball.x, ball.y); c.rotate(sc.t * 12); g.circle(0, 0, BR, '#e8f6ff'); c.fillStyle = '#3ec1ff'; c.fillRect(-BR, -1, BR * 2, 2); c.restore();
      if (ball.inLane && playing) g.text('ESPAÇO / TOQUE = LANÇAR', 200, 130, { size: 6, color: '#ffd23f', align: 'center' });
      // painel lateral
      g.panel(8, 20, 92, 70, 'rgba(10,20,14,.85)', '#2e9e6a');
      g.text('MULTIPLICADOR', 54, 24, { size: 4, color: '#9fe8b0', align: 'center' }); g.text('x' + mult, 54, 32, { size: 12, color: '#ffd23f', align: 'center' });
      g.text('Sementes: ' + seeds + ' (' + (3 - seeds % 3) + ' p/ bola extra)', 54, 56, { size: 4, color: '#fff', align: 'center', maxW: 88 });
      g.text('Bichos: ' + targets.filter(Boolean).length + '/3', 54, 68, { size: 5, color: '#fff', align: 'center' });
      if (saveT > 0 && !ball.inLane) g.text('bola salva: ' + Math.ceil(saveT) + 's', 54, 80, { size: 4, color: '#9ff2ff', align: 'center' });
      g.text('← rebatedor   → rebatedor', 200, 214, { size: 4, color: '#b9e6c4', align: 'center' });
    };
    sc.dbg = { end() { api.lives = 1; saveT = 0; lose(); }, ball, get seeds() { return seeds; }, get mult() { return mult; } };
    return sc;
  });
})();
```

## roleta.js

Roleta da Sorte (prêmio do 100% de acerto; sorteia qualquer minijogo para 1 partida bônus). Caminho: `src/modules/geografia/scenes/roleta.js` (92 linhas).

```js
/* =====================================================================
   scenes/roleta.js — ROLETA DA SORTE (pedido do usuário, 24/09/2026).
   Quando a criança termina uma fase com 100% DE ACERTO (todas as
   questões de primeira e todas as checagens certas), ganha 1 GIRO
   GRÁTIS. A roleta sorteia QUALQUER minijogo (Parque e Arcade),
   inclusive os que ainda estão bloqueados, para 1 partida bônus.
   • O giro fica guardado (S().flags.spins) se ela não quiser girar na hora;
     o menu do Parque mostra "Girar agora".
   • Para não virar "fábrica de giros" repetindo uma fase fácil: 1 giro
     por fase por dia (S().flags.spinDays[fase] = dia).
   • Os desbloqueios normais continuam a cada chefe (a roleta não libera
     o jogo; é só 1 partida).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, PQ = GEO.parque;
  const S = () => GEO.save.S;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const flags = () => { const s = S(); s.flags = s.flags || {}; return s.flags; };
  PQ.spins = () => flags().spins || 0;
  PQ.giveSpin = () => { flags().spins = PQ.spins() + 1; GEO.save.persist(); };

  /** 100% de acerto na fase? (pelo menos 1 questão ou checagem; tudo de primeira) */
  PQ.isPerfect = function (ctx) {
    if (!ctx || (ctx.def && ctx.def.bonus)) return false;
    const qs = ctx.results || [], anyQ = qs.length > 0, anyC = (ctx.checksTotal || 0) > 0;
    if (!anyQ && !anyC) return false;
    return qs.every((x) => x.personal || x.tier === 1) && (ctx.checksOk || 0) === (ctx.checksTotal || 0);
  };
  /** Dá o giro (1 por fase por dia). Retorna true se deu. */
  PQ.awardPerfect = function (stageId) {
    if (GEO.mode && GEO.mode.isReplay && GEO.mode.isReplay()) return false;
    const f = flags(); f.spinDays = f.spinDays || {};
    const day = U.today();
    if (f.spinDays[stageId] === day) return false;
    f.spinDays[stageId] = day; PQ.giveSpin(); return true;
  };

  /** Abre a roleta e gasta 1 giro. */
  PQ.roulette = function () {
    if (PQ.spins() <= 0) { UI.toast('Você não tem giros. Acerte 100% em uma fase para ganhar!', '', 2600); return Promise.resolve(null); }
    const games = PQ.GAMES.slice();
    return new Promise((resolve) => {
      const m = UI.modal({ title: '🎰 Roleta da Sorte', noClose: true, cls: 'roleta-modal' });
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Pode sair QUALQUER minijogo — até um que você ainda não liberou! Você joga 1 partida bônus.'));
      const cv = U.el('canvas', { width: 300, height: 300, class: 'roleta-cv', 'aria-label': 'Roleta com todos os minijogos' });
      const res = U.el('p', { class: 'roleta-res', 'aria-live': 'polite' }, '');
      m.body.appendChild(U.el('div', { class: 'roleta-wrap' }, [cv, U.el('div', { class: 'roleta-pin' }, '▼')]));
      m.body.appendChild(res);
      const ctx = cv.getContext('2d'), n = games.length, seg = Math.PI * 2 / n;
      const cols = ['#e5484d', '#ff9a3d', '#ffd23f', '#35e07a', '#3ec1ff', '#b07bff'];
      let ang = 0;
      function draw() {
        ctx.clearRect(0, 0, 300, 300);
        ctx.save(); ctx.translate(150, 150);
        for (let i = 0; i < n; i++) {
          const a0 = ang + i * seg - Math.PI / 2 - seg / 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 140, a0, a0 + seg); ctx.closePath();
          ctx.fillStyle = cols[i % cols.length]; ctx.fill(); ctx.strokeStyle = '#15152a'; ctx.lineWidth = 2; ctx.stroke();
          const am = a0 + seg / 2, ix = Math.cos(am) * 104, iy = Math.sin(am) * 104;
          if (!(X() && X().ilus(ctx, games[i].icon, ix, iy, 30, { rot: am + Math.PI / 2 }))) { ctx.fillStyle = '#15152a'; ctx.fillText(games[i].title.slice(0, 3), ix, iy); }
        }
        ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = '#15152a'; ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      draw();
      const go = UI.btn('🎰 GIRAR!', 'pri', () => {
        go.disabled = true; flags().spins = PQ.spins() - 1; GEO.save.persist();
        const win = Math.floor(Math.random() * n);
        // a fatia "win" termina embaixo do ponteiro (no topo): ang final = -win*seg (+ voltas)
        const turns = 5 + Math.floor(Math.random() * 2), start = ang, end = -win * seg - turns * Math.PI * 2 + (Math.random() - 0.5) * seg * 0.6;
        const dur = GG.engine.reduced ? 900 : 3600, t0 = performance.now();
        let lastTick = -1;
        (function step(now) {
          const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          ang = start + (end - start) * e; draw();
          const tick = Math.floor(-ang / seg); if (tick !== lastTick) { lastTick = tick; GG.audio.note('A5', 0.02); }
          if (k < 1) { requestAnimationFrame(step); return; }
          const g = games[win], locked = !PQ.unlocked(g);
          GG.audio.sfx('win'); if (X()) X().flash('#fff6c0', 0.25);
          res.textContent = '';
          res.appendChild(U.el('b', null, 'Saiu: ' + g.title + '!'));
          res.appendChild(document.createTextNode(locked ? ' (um jogo que você ainda NÃO liberou — aproveite!)' : ' Boa!'));
          m.setActions([UI.btn('Jogar agora ▶', 'pri', () => { m.close(); resolve(g.id); setTimeout(() => PQ.play(g.id, false, { bonus: true }), 80); })]);
        })(t0);
      });
      m.setActions([go]);
      GG.audio.sfx('power');
    });
  };
})();
```

## ritmolivre.js

Ritmo Livre: batalha de ritmo contra o GeoBot (a fase 2-3 usa a mesma mecânica em rhythm.js). Caminho: `src/modules/geografia/scenes/ritmolivre.js` (217 linhas).

```js
/* =====================================================================
   scenes/ritmolivre.js — SALA BÔNUS "RITMO LIVRE": BATALHA DE RITMO
   contra o GeoBot (inspirada nos jogos de ritmo de sucesso: setas que
   sobem até os alvos, "vez do rival / sua vez", barra de disputa,
   combos, notas longas e modo especial).
   • 4 setas (← ↓ ↑ →, ou A S W D, ou tocar na pista).
   • Cada rodada: o GeoBot canta uma frase (as setas dele à esquerda)
     e você responde com a SUA frase (à direita). Acertos puxam a barra
     para o seu lado; erros para o dele.
   • Notas LONGAS (segure a tecla), notas DOURADAS (valem o dobro),
     combo que sobe o multiplicador e o MODO CARNAVAL (combo 25): tela
     em festa, confete, notas brilhando e pontos em dobro.
   • 3 rodadas cada vez mais rápidas: Frevo, Samba e Carnaval.
   Sem questões (sala bônus). Música e passos originais.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, E = GG.engine, P = GG.pixel, C = GEO.common;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const DIRN = ['left', 'down', 'up', 'right'];
  const ARROW = ['←', '↓', '↑', '→'];
  const COL = ['#c24bff', '#3ec1ff', '#35e07a', '#ff4d6d'];
  const PX = [262, 294, 326, 358], BX = [28, 52, 76, 100]; // pistas do jogador / do GeoBot
  const RY = 40; // linha dos alvos (as setas sobem até aqui)
  const ROUNDS = [
    { name: 'Frevo', bpm: 118, speed: 105, bars: 4, dens: 0.45, holds: 0.08, song: 'rl_frevo', color: '#ff9f1c' },
    { name: 'Samba', bpm: 132, speed: 125, bars: 4, dens: 0.6, holds: 0.12, song: 'rl_samba', color: '#35e07a' },
    { name: 'Carnaval', bpm: 146, speed: 145, bars: 5, dens: 0.72, holds: 0.15, chords: 0.12, song: 'rl_carnaval', color: '#ff4d6d' }
  ];
  // músicas originais para a batalha (sintetizadas)
  GG.audio.addSong('rl_frevo', { bpm: 118, wave: 'square', lead: 'G5 G5 A5 G5 E5 - C5 D5 E5 E5 G5 E5 D5 - - - G5 G5 A5 B5 C6 - B5 A5 G5 E5 D5 E5 C5 - - -', bass: 'C3 - G2 - C3 - G2 - F2 - C3 - G2 - B2 -', drums: 'k h s h k k s h' });
  GG.audio.addSong('rl_samba', { bpm: 132, wave: 'square', lead: 'E5 - G5 A5 - G5 E5 D5 - E5 - C5 D5 - - - E5 - G5 A5 - C6 A5 G5 - E5 - D5 C5 - - -', bass: 'A2 A2 - A2 E2 - E2 E2 D2 D2 - D2 E2 - E2 -', drums: 'k s h s k h s s' });
  GG.audio.addSong('rl_carnaval', { bpm: 146, wave: 'square', lead: 'C6 A5 G5 A5 C6 - D6 C6 A5 G5 E5 G5 A5 - - - C6 A5 G5 A5 C6 D6 E6 D6 C6 A5 G5 E5 D5 C5 - -', bass: 'F2 F2 C3 F2 A#2 A#2 F2 A#2 C3 C3 G2 C3 F2 C3 F2 -', drums: 'k h s h k s s h' });

  GEO.scenes.ritmolivre = function (ctx) {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    let ri = 0, phase = 'intro', notes = [], songT = 0, busy = false, finished = false, playing = false;
    let bar = 0.5, combo = 0, best = 0, mult = 1, fever = 0, score = 0, hits = { p: 0, g: 0, b: 0, m: 0 }, total = 0, wins = 0;
    let press = [0, 0, 0, 0], botPress = [0, 0, 0, 0], judge = null, pose = { me: -1, bot: -1, meT: 0, botT: 0 }, holding = [null, null, null, 0];
    ctx.actionMax = 150; ctx.learnMax = 100;
    sc.noVignette = false;

    /* ------------------------------------------------ partitura (vez do GeoBot + sua vez) */
    function chart(R) {
      const beat = 60 / R.bpm, out = [], bars = R.bars;
      let t = 2.2;
      for (let turn = 0; turn < 4; turn++) {
        const who = turn % 2 === 0 ? 'bot' : 'me';
        const phrase = [];
        if (who === 'bot') {
          for (let s = 0; s < bars * 4; s++) { // semicolcheias em colcheias
            if (Math.random() < R.dens || s % 4 === 0) {
              const lane = Math.floor(Math.random() * 4), hold = Math.random() < R.holds && s % 2 === 0 ? beat * (1 + Math.floor(Math.random() * 2)) : 0;
              phrase.push({ s, lane, hold, gold: Math.random() < 0.08, chord: R.chords && Math.random() < R.chords ? (lane + 2) % 4 : -1 });
            }
          }
          sc._last = phrase;
        }
        const src = who === 'bot' ? phrase : sc._last.map((n) => Object.assign({}, n, { lane: Math.random() < 0.25 ? (n.lane + 1) % 4 : n.lane })); // resposta parecida, com variações
        src.forEach((n) => {
          const nt = t + n.s * beat / 2;
          out.push({ who, t: nt, lane: n.lane, hold: n.hold, gold: n.gold, judged: false, held: 0 });
          if (n.chord >= 0 && who === 'me') out.push({ who, t: nt, lane: n.chord, hold: 0, gold: false, judged: false, held: 0 });
        });
        t += bars * 2 * beat + beat * 2; // pausa curta entre as vezes
      }
      return out.sort((a, b) => a.t - b.t);
    }
    sc.begin = async function () {
      await ctx.say('gaia', ['**Batalha de Ritmo** contra o GeoBot! Ele canta primeiro (setas da esquerda); depois é a **sua vez** (direita).', 'Use **← ↓ ↑ →** (ou **A S W D**) quando a seta encostar no alvo. **Segure** nas notas longas. Faça **combo 25** para ligar o **Modo Carnaval**!']);
      startRound();
    };
    async function run(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; GG.input.clear(); }
    function startRound() {
      const R = ROUNDS[ri];
      notes = chart(R); total += notes.filter((n) => n.who === 'me').length;
      songT = -0.2; playing = true; bar = 0.5; phase = 'play';
      GG.audio.music(R.song);
      ctx.setGoal('Rodada ' + (ri + 1) + '/3 — ' + R.name + ': vença a disputa!');
      if (X()) X().banner({ id: 'rl', icon: ['tambor', 'maracas', 'fogos'][ri], title: 'Rodada ' + (ri + 1) + ': ' + R.name, style: R.bpm + ' batidas por minuto' }, 'BATALHA DE RITMO');
    }
    async function endRound() {
      playing = false; GG.audio.stopMusic();
      const won = bar >= 0.5; if (won) wins++;
      GG.audio.sfx(won ? 'win' : 'bad');
      if (won) { E.fx.confetti(E.W / 2, 60, 50); if (X()) X().flash('#fff6c0', 0.35); }
      await run(() => ctx.say(won ? 'gaia' : 'geobot', [won ? 'Você venceu a rodada **' + ROUNDS[ri].name + '**! Combo máximo: ' + best + '.' : 'O GeoBot levou a rodada **' + ROUNDS[ri].name + '**… mas a próxima é sua!']));
      ri++;
      if (ri >= ROUNDS.length) { finish(); return; }
      startRound();
    }
    function finish() {
      finished = true;
      const acc = (hits.p + hits.g * 0.75 + hits.b * 0.4) / Math.max(1, total);
      ctx.learnPts = Math.round(Math.min(1, acc * 0.8 + wins * 0.1) * 100);
      ctx.actionPts = Math.round(score / 40);
      run(async () => {
        const grade = acc > 0.92 ? 'S' : acc > 0.8 ? 'A' : acc > 0.6 ? 'B' : 'C';
        await ctx.say('gaia', ['Fim da batalha! Rodadas vencidas: **' + wins + ' de 3**. Nota: **' + grade + '** (' + Math.round(acc * 100) + '% de acerto). Pontos: **' + score + '**.']);
        await ctx.finish({ geobot: { won: wins >= 2 } });
      });
    }

    /* ------------------------------------------------ julgamento */
    function hit(lane) {
      press[lane] = 0.12; pose.me = lane; pose.meT = 0.25;
      const cand = notes.filter((n) => n.who === 'me' && !n.judged && n.lane === lane && Math.abs(n.t - songT) < 0.22).sort((a, b) => Math.abs(a.t - songT) - Math.abs(b.t - songT))[0];
      if (!cand) return;
      const d = Math.abs(cand.t - songT);
      const r = d < 0.05 ? ['PERFEITO!', '#7bff8f', 1, 'p', 0.045] : d < 0.1 ? ['ÓTIMO!', '#3ec1ff', 0.8, 'g', 0.03] : ['BOM', '#ffd23f', 0.5, 'b', 0.015];
      cand.judged = true; cand.hit = true; hits[r[3]]++; combo++; best = Math.max(best, combo);
      mult = Math.min(4, 1 + Math.floor(combo / 10));
      if (combo === 25 && !fever) { fever = 8; if (X()) { X().flash('#ffd23f', 0.4); } GG.audio.sfx('power'); }
      const pts = Math.round(100 * r[2] * mult * (cand.gold ? 2 : 1) * (fever > 0 ? 2 : 1)); score += pts;
      bar = Math.min(1, bar + r[4] * (cand.gold ? 1.5 : 1));
      judge = { t: r[0], c: r[1], at: sc.t, lane };
      GG.audio.sfx(['drum', 'shaker', 'bell', 'clap'][lane]);
      if (X()) { X().sparkle(PX[lane], RY, COL[lane], cand.gold ? 8 : 4); X().ring(PX[lane], RY, cand.gold ? '#ffd23f' : COL[lane], 22); if (mult > 1 || cand.gold) X().pop(PX[lane], RY + 18, '+' + pts, cand.gold ? '#ffd23f' : '#fff', 7); }
      if (cand.hold) holding[lane] = cand;
    }
    function miss(n) { n.judged = true; hits.m++; combo = 0; mult = 1; bar = Math.max(0, bar - 0.05); judge = { t: 'ERROU', c: '#ff6b6b', at: sc.t, lane: n.lane }; pose.me = -2; pose.meT = 0.3; }
    sc.click = function (x) { if (!playing || busy) return; const lane = PX.findIndex((lx) => Math.abs(x - lx) < 16); if (lane >= 0) hit(lane); };

    sc.update = function (dt) {
      sc.t += dt; press = press.map((v) => Math.max(0, v - dt)); botPress = botPress.map((v) => Math.max(0, v - dt));
      pose.meT -= dt; pose.botT -= dt; if (fever > 0) fever -= dt;
      if (busy || finished || !playing) return;
      ctx.tick(dt); songT += dt;
      const IN = GG.input;
      if (IN.pressed('left')) hit(0); if (IN.pressed('down')) hit(1); if (IN.pressed('up') || IN.pressed('jump')) hit(2); if (IN.pressed('right')) hit(3);
      // notas longas: segurar
      holding.forEach((n, lane) => {
        if (!n) return;
        const down = IN.down(DIRN[lane]) || (lane === 2 && IN.down('jump'));
        if (down && songT < n.t + n.hold) { n.held += dt; score += Math.round(60 * dt * mult); bar = Math.min(1, bar + dt * 0.02); if (X() && Math.random() < 0.3) X().sparkle(PX[lane], RY, COL[lane], 1); }
        else holding[lane] = null;
      });
      // GeoBot canta sozinho as notas dele
      notes.forEach((n) => {
        if (n.judged) return;
        if (n.who === 'bot' && songT >= n.t) { n.judged = true; botPress[n.lane] = 0.15 + n.hold; pose.bot = n.lane; pose.botT = 0.25 + n.hold; GG.audio.note(['C4', 'E4', 'G4', 'C5'][n.lane], 0.12 + n.hold, 'square'); bar = Math.max(0, bar - 0.006); }
        else if (n.who === 'me' && songT - n.t > 0.22) miss(n);
      });
      const last = notes[notes.length - 1];
      if (!last || songT > last.t + last.hold + 1) endRound();
      if (IN.pressed('pause')) GEO.stage.pauseMenu(ctx);
    };

    /* ------------------------------------------------ desenho */
    function arrowShape(c, x, y, lane, s, fill, stroke) {
      c.save(); c.translate(x, y); c.rotate([Math.PI / 2 * 2, Math.PI / 2, -Math.PI / 2, 0][lane] || 0); const k = s / 12;
      c.beginPath(); c.moveTo(12 * k, 0); c.lineTo(0, -10 * k); c.lineTo(0, -5 * k); c.lineTo(-11 * k, -5 * k); c.lineTo(-11 * k, 5 * k); c.lineTo(0, 5 * k); c.lineTo(0, 10 * k); c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.6; c.stroke(); } c.restore();
    }
    function drawLanes(c, g, xs, who) {
      const x = X(), R = ROUNDS[Math.min(ri, 2)];
      xs.forEach((lx, lane) => {
        const pr = who === 'me' ? press[lane] : botPress[lane];
        if (pr > 0 && x) x.glow(c, lx, RY, 20, COL[lane], 0.8);
        arrowShape(c, lx, RY, lane, who === 'me' ? 12 : 9, pr > 0 ? COL[lane] : 'rgba(20,24,50,.75)', pr > 0 ? '#fff' : 'rgba(255,255,255,.5)');
      });
      notes.forEach((n) => {
        if (n.who !== who) return;
        if (n.judged && !(n.hit && n.hold && holding[n.lane] === n)) return;
        const y = RY + (n.t - songT) * R.speed; if (y > E.H + 20 || (y < RY - 30 && !n.hold)) return;
        const lx = xs[n.lane], s = who === 'me' ? 12 : 9;
        if (n.hold) { const y2 = RY + (n.t + n.hold - songT) * R.speed; c.fillStyle = COL[n.lane] + 'aa'; c.fillRect(lx - s * 0.3, Math.max(RY, y), s * 0.6, Math.max(0, y2 - Math.max(RY, y))); }
        if (n.judged) return;
        if (x) x.glow(c, lx, y, s * 1.4, n.gold || fever > 0 ? '#ffd23f' : COL[n.lane], 0.5);
        arrowShape(c, lx, y, n.lane, s, n.gold ? '#ffd23f' : fever > 0 ? 'hsl(' + ((sc.t * 400 + n.lane * 90) % 360) + ',90%,60%)' : COL[n.lane], '#fff');
      });
    }
    sc.draw = function (g) {
      const c = g.ctx(), x = X(), R = ROUNDS[Math.min(ri, 2)];
      const beat = playing ? Math.abs(Math.sin(songT * Math.PI * R.bpm / 60)) : 0;
      // palco com luzes
      const bg = c.createLinearGradient(0, 0, 0, E.H); bg.addColorStop(0, fever > 0 ? '#3a0a4a' : '#1a0c33'); bg.addColorStop(1, fever > 0 ? '#7a1a3a' : '#3a1440'); c.fillStyle = bg; c.fillRect(0, 0, E.W, E.H);
      if (x) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { const bx = 130 + i * 45, a = Math.sin(sc.t * (1 + i * 0.3) + i) * 0.5; const gr = c.createLinearGradient(bx, 0, bx + Math.sin(a) * 160, 190); gr.addColorStop(0, COL[i] + '55'); gr.addColorStop(1, COL[i] + '00'); c.fillStyle = gr; c.globalAlpha = 0.5 + beat * 0.4; c.beginPath(); c.moveTo(bx - 2, 0); c.lineTo(bx + 2, 0); c.lineTo(bx + Math.sin(a) * 160 + 26, 190); c.lineTo(bx + Math.sin(a) * 160 - 26, 190); c.closePath(); c.fill(); }
        c.restore();
        if (fever > 0 && !E.reduced) { c.save(); c.globalAlpha = 0.25 + 0.15 * beat; c.fillStyle = 'hsl(' + (sc.t * 200 % 360) + ',80%,55%)'; c.fillRect(0, 0, E.W, E.H); c.restore(); if (Math.random() < 0.3) E.fx.confetti(U.rand(40, 360), -5, 3); }
      }
      // chão do palco e alto-falantes
      c.fillStyle = '#2a1a10'; c.fillRect(0, 186, E.W, 39); c.fillStyle = '#5a3a20'; c.fillRect(0, 182, E.W, 5);
      if (x) { [[118, 162], [282, 162]].forEach(([sx, sy]) => x.ilus(c, 'caixa_som', sx, sy + beat * -2, 30 + beat * 4, { shadow: true })); x.ilus(c, 'globo_disco', 200, 50 + Math.sin(sc.t) * 2, 20, { rot: sc.t }); }
      // plateia
      P.crowd().slice(0, 10).forEach((pp, i) => g.img(P.front(Object.assign({}, pp, { frame: Math.floor(sc.t * 4 + i) % 2 })), 118 + i * 17, 196 - beat * (i % 2 ? 5 : 2)));
      // GeoBot e Gabriel dançando
      const bp = pose.botT > 0 ? pose.bot : -1, mp = pose.meT > 0 ? pose.me : -1;
      const off = (l) => (l === 0 ? [-3, 0] : l === 1 ? [0, 3] : l === 2 ? [0, -5] : l === 3 ? [3, 0] : [0, 0]);
      const ob = off(bp), om = off(mp);
      g.img(P.geobot(bp >= 0 ? 3 : Math.floor(sc.t * 4) % 3), 150 + ob[0], 150 - beat * 3 + ob[1], { scale: 1.6 });
      g.img(C.gabrielSide(ctx.look, mp === -2 ? 'idle' : mp >= 0 ? 'jump' : 'run', sc.t), 222 + om[0], 150 - beat * 3 + om[1], { scale: 1.6, flip: true });
      if (mp === -2) g.text('?', 236, 136, { size: 8, color: '#ff6b6b' });
      // pistas
      g.rect(10, 26, 112, 150, 'rgba(0,0,0,.25)'); g.rect(242, 26, 136, 190, 'rgba(0,0,0,.3)');
      drawLanes(c, g, BX, 'bot'); drawLanes(c, g, PX, 'me');
      g.text('GEOBOT', 64, 14, { size: 6, color: '#9aa7c7', align: 'center' }); g.text('VOCÊ', 310, 14, { size: 6, color: '#ffd23f', align: 'center' });
      // barra de disputa
      g.panel(130, 6, 140, 10, '#15152a', '#15152a'); g.rect(132, 8, 136, 6, '#9aa7c7'); g.rect(132 + 136 * (1 - bar), 8, 136 * bar, 6, '#ffd23f');
      if (x) { x.ilus(c, 'robo', 132 + 136 * (1 - bar) - 7, 11, 14); x.ilus(c, 'estrela', 132 + 136 * (1 - bar) + 7, 11, 12); }
      // placar
      g.text(String(score), E.W - 8, 186, { size: 8, color: '#fff', align: 'right' });
      if (combo > 2) g.text('COMBO ' + combo + (mult > 1 ? '  x' + mult : ''), E.W - 8, 198, { size: 6, color: fever > 0 ? '#ffd23f' : '#9ff2ff', align: 'right' });
      if (fever > 0) g.text('MODO CARNAVAL!', 200, 64, { size: 9, color: 'hsl(' + (sc.t * 300 % 360) + ',90%,65%)', align: 'center' });
      const nxtMe = notes.find((n) => n.who === 'me' && !n.judged), nxtBot = notes.find((n) => n.who === 'bot' && !n.judged);
      if (playing && nxtBot && (!nxtMe || nxtBot.t < nxtMe.t) && nxtBot.t - songT < 1.2) g.text('VEZ DO GEOBOT', 200, 28, { size: 6, color: '#9aa7c7', align: 'center' });
      else if (playing && nxtMe && nxtMe.t - songT < 1.4 && (!nxtBot || nxtMe.t < nxtBot.t)) g.text('SUA VEZ!', 200, 26, { size: 8, color: '#ffd23f', align: 'center' });
      if (judge && sc.t - judge.at < 0.5) { const k = (sc.t - judge.at) / 0.5; c.save(); c.globalAlpha = 1 - k; g.text(judge.t, 310, 64 - k * 8, { size: 8, color: judge.c, align: 'center' }); c.restore(); }
      if (playing && songT < 1.6) g.text(songT < 0.5 ? '3' : songT < 1 ? '2' : '1', 310, 110, { size: 16, color: '#ffd23f', align: 'center' });
    };
    sc.dbg = { busy: () => busy, playing: () => playing, autoplay() { notes.forEach((n) => { if (!n.judged) { n.judged = true; if (n.who === 'me') { n.hit = true; hits.p++; score += 100; } } }); bar = 1; songT = 999; }, state: () => ({ ri, bar, combo, score, fever, total, hits, wins }), peek: () => ({ songT, notes }) };
    return sc;
  };
})();
```

## minigames.js

Inglês (Expresso dos Sonhos): Associação figura ↔ palavra (adaptada da Memória, DOM, com escrita depois) e Caça-Palavras (arrastar, tocar ou teclado). Caminho: `src/modules/ingles/minigames.js` (188 linhas).

```js
/* =====================================================================
   minigames.js — MINIJOGOS CURTOS DO EXPRESSO (só 3 na campanha).
   • assoc — Associação figura ↔ palavra. Adaptado da “Memória das
     Culturas” de Geografia (scenes/parque.js): regra dos
     corações (errar quando o par da 1ª carta JÁ tinha aparecido tira 1), agora
     com figura de um lado e palavra em inglês do outro. Depois dos
     pares, a criança ESCREVE 3 palavras sem vê-las.
   • caca — Caça-Palavras com SÓ as 6 profissões impressas no livro
     (pág. 6). Arrastar (mouse/toque) ou tocar na 1ª e na última letra;
     teclado: setas + Espaço marcam início e fim.
   Cada um dura de 1 a 3 minutos e resolve {score 0–100}.
   Nada aqui altera Geografia: o código de lá só serviu de modelo.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, ING = window.ING;
  const MG = (ING.mg = {});
  const A = () => ING.app;
  const C = () => ING.check;
  const mount = (cls, kids) => { const a = document.getElementById('app'); a.innerHTML = ''; a.className = 'scr mg-scr ' + cls; kids.forEach((k) => k && a.appendChild(k)); A().hud(); window.scrollTo(0, 0); return a; };
  const intro = (def) => new Promise((res) => {
    mount('mg-intro', [U.el('div', { class: 'mg-card' }, [A().img(def.icon, 96), U.el('h2', { class: 'pix' }, '🎮 ' + def.title), U.el('p', null, def.desc), U.el('div', { class: 'q-acts' }, [UI.btn('Jogar ▶', 'go', () => res())])])]);
  });

  MG.play = async function (id, def, opts) {
    await intro(def);
    const r = def.kind === 'assoc' ? await assoc(def, opts) : await caca(def, opts);
    await new Promise((res) => {
      const medal = r.score >= 85 ? '🥇' : r.score >= 65 ? '🥈' : r.score >= 40 ? '🥉' : '⭐';
      GG.audio.sfx('win');
      mount('mg-end', [U.el('div', { class: 'mg-card' }, [U.el('div', { class: 'mg-medal', 'aria-hidden': 'true' }, medal), U.el('h2', { class: 'pix' }, def.title), U.el('p', null, 'Pontuação: ' + r.score + ' de 100'), r.note ? U.el('p', { class: 'tip' }, r.note) : null,
        U.el('div', { class: 'q-acts' }, [opts.replay ? null : UI.btn('Continuar a viagem ▶', 'pri', () => res()), opts.replay || opts.test ? UI.btn('🔁 Jogar de novo', '', async () => { const r2 = def.kind === 'assoc' ? await assoc(def, opts) : await caca(def, opts); r.score = Math.max(r.score, r2.score); res(); }) : null, opts.replay ? UI.btn('Ver resultado ▶', 'pri', () => res()) : null])])]);
    });
    return r;
  };

  /* ================================================================ ASSOCIAÇÃO (memória figura ↔ palavra) */
  function assoc(def, opts) {
    return new Promise((resolve) => {
      const pairs = def.set; const MAXH = 4;
      let hearts = MAXH, errors = 0, found = 0, open = [], lock = false, seen = new Set(), tries = 0;
      const cards = U.shuffle(pairs.flatMap(([w, im], i) => [{ k: i, t: 'img', im, w }, { k: i, t: 'word', w }]));
      const hud = U.el('div', { class: 'mg-hud', 'aria-live': 'polite' });
      const grid = U.el('div', { class: 'as-grid', role: 'grid', 'aria-label': 'Cartas: figuras e palavras' });
      const upd = () => { hud.textContent = '❤️'.repeat(hearts) + '🤍'.repeat(MAXH - hearts) + '   •   Pares: ' + found + '/' + pairs.length; };
      cards.forEach((c, idx) => {
        const face = c.t === 'img' ? A().img(c.im, 64, c.w) : U.el('b', { class: 'as-w', lang: 'en' }, c.w);
        const b = U.el('button', { type: 'button', class: 'as-c', 'aria-label': 'Carta ' + (idx + 1) + ' virada', dataset: { i: String(idx) } }, [U.el('span', { class: 'as-back', 'aria-hidden': 'true' }, '🎫'), U.el('span', { class: 'as-face' }, face)]);
        b.addEventListener('click', () => flip(c, b));
        c.el = b; grid.appendChild(b);
      });
      function flip(c, b) {
        if (lock || c.done || open.includes(c)) return;
        b.classList.add('up'); b.setAttribute('aria-label', c.t === 'img' ? 'Figura: ' + c.w : 'Palavra: ' + c.w);
        if (c.t === 'word') A().en.speak(c.w);
        GG.audio.sfx('click'); open.push(c);
        if (open.length < 2) return;
        const [a, d] = open; tries++;
        if (a.k === d.k && a.t !== d.t) {
          a.done = d.done = true; found++; open = []; GG.audio.sfx('check');
          [a, d].forEach((x) => x.el.classList.add('ok'));
          if (found === pairs.length) setTimeout(() => write(), 500);
        } else {
          // erro só quando o par da 1ª carta já tinha aparecido (dava para lembrar); carta nova nunca pune
          const wasSeen = cards.some((c) => c.k === a.k && c !== a && seen.has(c));
          lock = true;
          if (wasSeen) { hearts--; errors++; GG.audio.sfx('bad'); }
          setTimeout(() => {
            [a, d].forEach((x) => { x.el.classList.remove('up'); x.el.setAttribute('aria-label', 'Carta virada'); }); open = []; lock = false;
            if (hearts <= 0) lost();
          }, 900);
        }
        seen.add(a); seen.add(d); upd();
      }
      function lost() {
        const m = UI.modal({ title: '💔 Acabaram os corações', cls: 'small', noClose: true });
        m.body.appendChild(U.el('p', null, 'Você achou ' + found + ' de ' + pairs.length + ' pares. Dica: lembre onde viu cada carta!'));
        m.setActions([UI.btn('🔁 Tentar de novo', 'pri', () => { m.close(); assoc(def, opts).then(resolve); }), UI.btn('Seguir para a escrita ▶', '', () => { m.close(); write(); })]);
      }
      /* escrever 3 palavras sem vê-las */
      async function write() {
        const pick = U.shuffle(pairs).slice(0, def.write || 3); let ok = 0;
        for (let i = 0; i < pick.length; i++) ok += await writeOne(pick[i], i, pick.length);
        const score = Math.max(0, Math.min(100, Math.round(60 * found / pairs.length - 5 * errors + 40 * ok / pick.length)));
        resolve({ score, note: 'Pares: ' + found + '/' + pairs.length + ' • escritas certas de primeira: ' + ok + '/' + pick.length });
      }
      function writeOne([w, im], i, n) {
        return new Promise((res) => {
          let tries = 0;
          const inp = U.el('input', { type: 'text', class: 'q-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Escreva a palavra em inglês' });
          const fb = U.el('div', { class: 'q-fb', 'aria-live': 'polite' });
          const go = () => {
            const r = C().matchList(inp.value, [w], true);
            if (!inp.value.trim()) return;
            tries++;
            if (r.ok) { GG.audio.sfx('ok'); fb.className = 'q-fb good'; fb.innerHTML = '✔ <b lang="en">' + U.esc(w) + '</b>' + (r.typo ? ' (atenção à escrita)' : ''); A().en.speak(w); setTimeout(() => res(tries === 1 ? 1 : 0), 900); return; }
            GG.audio.sfx('bad'); fb.className = 'q-fb bad';
            fb.innerHTML = tries === 1 ? '❌ Ainda não. ' + U.rich(C().hint({ input: 'text', accept: [w] }, 1)) : tries === 2 ? '🔎 ' + U.rich(C().hint({ input: 'text', accept: [w] }, 2)) : '✏️ É <b lang="en">' + U.esc(w) + '</b>. Escreva para fixar.';
          };
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
          mount('mg-write', [U.el('div', { class: 'mg-card' }, [U.el('p', { class: 'tip' }, '✍️ Agora sem olhar (' + (i + 1) + '/' + n + '): como se escreve em inglês?'), A().img(im, 110, 'Figura'), inp, fb, U.el('div', { class: 'q-acts' }, [UI.btn('✔ Conferir', 'go q-go', go)])])]);
          setTimeout(() => inp.focus(), 50);
        });
      }
      upd();
      mount('mg-assoc', [U.el('h2', { class: 'pix mg-t' }, def.title), U.el('p', { class: 'tip' }, 'Vire 2 cartas: uma FIGURA e a PALAVRA certa formam um par. Se você já tinha visto o par da 1ª carta e errar, perde 1 coração.'), hud, grid]);
    });
  }

  /* ================================================================ CAÇA-PALAVRAS */
  function caca(def, opts) {
    return new Promise((resolve) => {
      const W = 15, H = 11;
      const rng = U.rng(20260924);
      let grid, place;
      // coloca as palavras (horizontal, vertical ou diagonal), com semente fixa e nova tentativa se colidir
      for (let attempt = 0; attempt < 200; attempt++) {
        grid = Array.from({ length: H }, () => Array(W).fill(null)); place = {}; let ok = true;
        for (const w of def.words.slice().sort((a, b) => b.length - a.length)) {
          let put = false;
          for (let t = 0; t < 300 && !put; t++) {
            const dirs = w.length > H ? [[1, 0]] : [[1, 0], [0, 1], [1, 1]];
            const [dx, dy] = dirs[Math.floor(rng() * dirs.length)];
            const x0 = Math.floor(rng() * (W - (dx ? w.length - 1 : 0))), y0 = Math.floor(rng() * (H - (dy ? w.length - 1 : 0)));
            if (x0 + dx * (w.length - 1) >= W || y0 + dy * (w.length - 1) >= H) continue;
            let fits = true; for (let i = 0; i < w.length; i++) { const c = grid[y0 + dy * i][x0 + dx * i]; if (c && c !== w[i]) { fits = false; break; } }
            if (!fits) continue;
            for (let i = 0; i < w.length; i++) grid[y0 + dy * i][x0 + dx * i] = w[i];
            place[w] = { x0, y0, dx, dy }; put = true;
          }
          if (!put) { ok = false; break; }
        }
        if (ok) break;
      }
      const AL = 'ABCDEFGHIJKLMNOPRSTUVWY';
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!grid[y][x]) grid[y][x] = AL[Math.floor(rng() * AL.length)];
      const label = { FLIGHTATTENDANT: 'FLIGHT ATTENDANT' };
      const found = new Set(); let hints = 0; const t0 = Date.now(); let a = null, cur = { x: 0, y: 0 };
      const hud = U.el('div', { class: 'mg-hud', 'aria-live': 'polite' });
      const list = U.el('ul', { class: 'ws-list', 'aria-label': 'Palavras para achar' });
      const box = U.el('div', { class: 'ws-grid', role: 'grid', style: { '--w': String(W) }, 'aria-label': 'Grade do caça-palavras. Use as setas e Espaço para marcar início e fim.', tabindex: '0' });
      const cells = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = U.el('span', { class: 'ws-c', role: 'gridcell', dataset: { x: String(x), y: String(y) } }, grid[y][x]); cells.push(c); box.appendChild(c); }
      const cellAt = (x, y) => cells[y * W + x];
      const drawList = () => { list.innerHTML = ''; def.words.forEach((w) => list.appendChild(U.el('li', { class: found.has(w) ? 'got' : '' }, [found.has(w) ? '✔ ' : '▫️ ', U.el('span', { lang: 'en' }, label[w] || w)]))); hud.textContent = 'Achadas: ' + found.size + '/' + def.words.length + (hints ? '  •  dicas: ' + hints : ''); };
      const line = (p, q) => {
        const dx = Math.sign(q.x - p.x), dy = Math.sign(q.y - p.y), n = Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y));
        if (!(p.x === q.x || p.y === q.y || Math.abs(q.x - p.x) === Math.abs(q.y - p.y))) return null;
        return Array.from({ length: n + 1 }, (_, i) => ({ x: p.x + dx * i, y: p.y + dy * i }));
      };
      const mark = (pts, cls) => { cells.forEach((c) => c.classList.remove(cls)); (pts || []).forEach((p) => cellAt(p.x, p.y).classList.add(cls)); };
      function tryLine(p, q) {
        const pts = line(p, q); mark(null, 'sel'); if (!pts) return;
        const s = pts.map((o) => grid[o.y][o.x]).join(''); const r = s.split('').reverse().join('');
        const w = def.words.find((x) => !found.has(x) && (x === s || x === r));
        if (!w) { if (pts.length > 2) GG.audio.sfx('bad'); return; }
        found.add(w); pts.forEach((o) => cellAt(o.x, o.y).classList.add('got')); GG.audio.sfx('check'); A().en.speak(label[w] || w); drawList();
        if (found.size === def.words.length) setTimeout(done, 700);
      }
      const at = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList.contains('ws-c') ? { x: +el.dataset.x, y: +el.dataset.y } : null; };
      let drag = null, moved = false;
      box.addEventListener('pointerdown', (e) => { const p = at(e); if (!p) return; e.preventDefault(); drag = p; moved = false; mark([p], 'sel'); });
      box.addEventListener('pointermove', (e) => { if (!drag) return; const p = at(e); if (p && (p.x !== drag.x || p.y !== drag.y)) { moved = true; mark(line(drag, p), 'sel'); } });
      window.addEventListener('pointerup', onUp);
      function onUp(e) {
        if (!drag) return; const p = at(e) || drag; const s = drag; drag = null;
        if (moved) { a = null; tryLine(s, p); return; }
        if (!a) { a = s; mark([s], 'sel'); } else { const b = s; const st = a; a = null; tryLine(st, b); }
      }
      box.addEventListener('keydown', (e) => {
        const k = e.key; const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
        if (mv) { e.preventDefault(); cur = { x: U.clamp(cur.x + mv[0], 0, W - 1), y: U.clamp(cur.y + mv[1], 0, H - 1) }; mark([cur], 'kb'); if (a) mark(line(a, cur), 'sel'); }
        else if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!a) { a = { x: cur.x, y: cur.y }; mark([a], 'sel'); } else { const s = a; a = null; tryLine(s, cur); } }
      });
      const hintB = UI.btn('💡 Dica', 'small', () => { const w = def.words.find((x) => !found.has(x)); if (!w) return; hints++; const p = place[w]; const c = cellAt(p.x0, p.y0); c.classList.add('hint'); setTimeout(() => c.classList.remove('hint'), 2200); drawList(); });
      function done() {
        window.removeEventListener('pointerup', onUp);
        const secs = Math.round((Date.now() - t0) / 1000);
        const score = Math.max(40, Math.min(100, 100 - Math.max(0, secs - 90) / 3 - hints * 8)) | 0;
        resolve({ score, note: 'Tempo: ' + U.fmtTime(secs) + ' • dicas: ' + hints });
      }
      drawList();
      mount('mg-caca', [U.el('h2', { class: 'pix mg-t' }, def.title), U.el('p', { class: 'tip' }, 'Arraste sobre a palavra, ou toque na 1ª e na última letra. No teclado: setas + Espaço.'), hud, U.el('div', { class: 'ws-wrap' }, [box, U.el('div', { class: 'ws-side' }, [U.el('div', { class: 'q-box' }, 'FLIGHT ATTENDANT / PILOT / DOCTOR / VETERINARIAN / CHEF / DRIVER'), list, hintB, opts.test ? UI.btn('🧪 Achar todas (teste)', 'small', () => { def.words.forEach((w) => { if (!found.has(w)) { const p = place[w]; tryLine({ x: p.x0, y: p.y0 }, { x: p.x0 + p.dx * (w.length - 1), y: p.y0 + p.dy * (w.length - 1) }); } }); }) : null])])]);
      MG._caca = { place, grid };
    });
  }
})();
```

