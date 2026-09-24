/* =====================================================================
   arcade/runtime.js — ARCADE DO EXPRESSO (Inglês): minijogos BÔNUS.
   Motor adaptado do Parque/Arcade de Geografia (scenes/parque.js, ver
   docs/MINIGAMES-CODIGO.md): mesma API de minijogo (PQ.register,
   api.add/lives/extra/goal/end, PQ.pointer, PQ.pause), mesmo HUD,
   recorde e medalhas. Diferenças (pedido do usuário, 24/09/2026):
     • 2 jogos por mundo (6 no total), SEM perguntas e sem moedas;
     • ao terminar cada mundo (estação), a criança ganha 1 BILHETE
       grátis para 1 dos 2 jogos daquele mundo;
     • terminada a viagem (Passagem de Volta), TUDO fica liberado;
     • modo de teste dos pais: tudo aberto + “Entrar grátis (teste)”
       e ferramentas (bilhetes, simular viagem concluída).
   Roda em arcade.html, que usa a camada gráfica de Geografia (GEO.gfx)
   só para leitura: nenhum arquivo de Geografia é alterado. O namespace
   GEO desta página é um adaptador mínimo (common, eco, app, parque).
   Recordes e bilhetes ficam no save de Inglês: S.arcade.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.engine, ING = window.ING, D = ING.data, M = ING.mode, SV = ING.save;
  const S = () => SV.S;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const PQ = (GEO.parque = {});
  const WORLDS = { 1: 'Cidade Cósmica', 2: 'Aeroporto das Profissões', 3: 'Laboratório dos Sonhos' };
  const ICON = { 1: 'estrela_brilho', 2: 'aviao', 3: 'lupa' };

  /* ---------------------------------------------------------------- adaptadores usados pelos jogos */
  const LOOK = { skin: '#c98e62', hair: '#2b1d14', hairStyle: 'curto', shirt: '#6a4cff', pants: '#33415e', shoes: '#6b3f22', cap: true, capColor: '#ffd23f', backpack: null, cape: false };
  GEO.eco = { look: () => LOOK };
  GEO.common = {
    gabrielSide: (look, state, t) => GG.pixel.side(Object.assign({}, look, { frame: state === 'jump' ? 3 : state === 'shoot' ? 4 : state === 'run' ? (Math.floor(t * 10) % 2 ? 1 : 2) : 0 })),
    gabrielTop: (look, dir, moving, t) => GG.pixel.front(Object.assign({}, look, { dir: dir === 'left' || dir === 'right' ? 'side' : dir, frame: moving ? Math.floor(t * 8) % 2 : 0 }))
  };
  GEO.app = {
    showStage() { document.body.classList.add('in-stage'); touch(); },
    showMenu() { document.body.classList.remove('in-stage'); touch(); }
  };
  function touch() {
    const t = document.getElementById('touch');
    const show = U.isTouch() && document.body.classList.contains('in-stage');
    t.classList.toggle('hide', !show); document.body.classList.toggle('has-touch', show);
    if (show && !t.childElementCount) GG.input.buildTouch(t);
  }

  /* ---------------------------------------------------------------- estado (save de Inglês) */
  const AR = () => { const s = S(); s.arcade = s.arcade || {}; s.arcade.tickets = s.arcade.tickets || {}; s.arcade.rec = s.arcade.rec || {}; return s.arcade; };
  const isTest = () => M.isTest();
  const GAMES = [];
  const MAKE = {};
  PQ.GAMES = GAMES;
  PQ.register = function (g, maker) { if (!GAMES.find((x) => x.id === g.id)) GAMES.push(g); MAKE[g.id] = maker; };
  PQ.worldGames = (w) => GAMES.filter((g) => g.world === w);
  PQ.worldDone = (w) => !!(S().acts['a' + w] && S().acts['a' + w].done);
  /** Viagem concluída (Passagem de Volta): tudo livre para sempre. */
  PQ.allFree = () => !!S().finalDone;
  PQ.unlocked = (g) => isTest() || PQ.allFree() || PQ.worldDone(g.world);
  PQ.tickets = (w) => AR().tickets[w] || 0;
  const medalOf = (g, score) => (score >= g.medals[2] ? 'ouro' : score >= g.medals[1] ? 'prata' : score >= g.medals[0] ? 'bronze' : null);
  const MEDAL = { bronze: ['🥉', 'Bronze'], prata: ['🥈', 'Prata'], ouro: ['🥇', 'Ouro'] };
  const lockText = (g) => '🔒 Termine a estação ' + g.world + ' (' + WORLDS[g.world] + ')';

  /* ---------------------------------------------------------------- entrada de uma partida */
  PQ.enter = function (id) {
    const g = GAMES.find((x) => x.id === id); if (!g) return;
    if (!PQ.unlocked(g)) { UI.toast(lockText(g) + ' para liberar.'); return; }
    if (PQ.allFree()) { PQ.play(id); return; }
    if (PQ.tickets(g.world) > 0 && !isTest()) { AR().tickets[g.world]--; SV.persist(); UI.toast('🎟️ Bilhete grátis usado! Boa diversão.', 'gold', 2200); PQ.play(id); return; }
    const m = UI.modal({ title: '🎟️ ' + g.title, cls: 'small pq-entry' });
    m.body.appendChild(U.el('div', { class: 'pq-entry-art' }, X() ? X().el(g.icon, 64) : '🎮'));
    if (isTest() && PQ.tickets(g.world) > 0) {
      m.body.appendChild(U.el('p', null, 'Há ' + PQ.tickets(g.world) + ' bilhete(s) do Mundo ' + g.world + ' no sandbox.'));
      m.body.appendChild(U.el('p', { class: 'tip' }, '🧪 Modo de teste: use o bilhete (como a criança) ou entre grátis.'));
      m.setActions([UI.btn('Cancelar', 'ghost', () => m.close()), UI.btn('🎟️ Usar bilhete', 'pri', () => { AR().tickets[g.world]--; SV.persist(); m.close(); PQ.play(id); }), UI.btn('🧪 Entrar grátis (teste)', 'go', () => { m.close(); PQ.play(id); })]);
      return;
    }
    m.body.appendChild(U.el('p', null, 'Você já usou o bilhete grátis do Mundo ' + g.world + '.'));
    m.body.appendChild(U.el('p', { class: 'tip' }, '🏁 Termine a viagem (a Passagem de Volta) e TODOS os jogos do Arcade ficam liberados para sempre!'));
    const acts = [UI.btn('Ok', 'pri', () => m.close())];
    if (isTest()) { m.body.appendChild(U.el('p', { class: 'tip' }, '🧪 Modo de teste: nada aqui muda o save real.')); acts.push(UI.btn('🧪 Entrar grátis (teste)', 'go', () => { m.close(); PQ.play(id); })); }
    m.setActions(acts);
  };

  /* ---------------------------------------------------------------- menu do Arcade */
  let lastView = null;
  PQ.open = function (only) {
    if (UI.blocking()) return;
    lastView = only || null;
    GEO.app.showMenu(); E.start(menuScene());
    GG.audio.music('estacao');
    const m = UI.modal({ title: only ? '🕹️ Arcade do Mundo ' + only + ' — ' + WORLDS[only] : '🕹️ Arcade do Expresso — jogos bônus', wide: true, noClose: true });
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Jogos de bônus, só para se divertir (sem perguntas). Cada estação terminada dá 1 bilhete grátis para um dos 2 jogos dela. Terminou a viagem? Tudo liberado!'));
    const tk = [1, 2, 3].filter((w) => PQ.tickets(w) > 0).map((w) => 'Mundo ' + w + ': ' + PQ.tickets(w));
    m.body.appendChild(U.el('p', { class: 'pq-wallet' }, PQ.allFree() ? '🏆 Viagem concluída! Todos os jogos estão liberados: jogue à vontade.' : tk.length ? '🎟️ Bilhetes grátis — ' + tk.join(', ') : '🎟️ Nenhum bilhete agora. Termine uma estação para ganhar um!'));
    const card = (g) => {
      const open = PQ.unlocked(g), r = AR().rec[g.id];
      const art = X() ? X().el(g.icon, 76) : U.el('span', { style: { fontSize: '48px' } }, '🎮');
      return U.el('button', { type: 'button', class: 'pq-card' + (open ? '' : ' lock'), style: { '--c1': g.c1, '--c2': g.c2 }, 'aria-disabled': String(!open), 'data-game': g.id,
        onclick: () => { if (!open) { UI.toast(lockText(g) + ' para liberar.'); return; } GG.audio.sfx('click'); m.close(); PQ.enter(g.id); } }, [
        U.el('div', { class: 'pq-art' }, art), U.el('b', null, g.title), g.ref ? U.el('i', { class: 'pq-ref' }, 'Estilo ' + g.ref) : null, U.el('span', null, g.desc),
        U.el('div', { class: 'pq-rec' }, open ? (r && r.best != null ? 'Recorde: ' + r.best + ' ' + g.unit + (r.medal ? ' ' + MEDAL[r.medal][0] : '') : '▶ Novo!') : lockText(g))
      ]);
    };
    if (isTest()) {
      const re = () => { m.close(); setTimeout(() => PQ.open(only), 40); };
      m.body.appendChild(U.el('div', { class: 'pq-test' }, [U.el('b', null, '🧪 Ferramentas de teste (só sandbox): '),
        UI.btn('+1 🎟️ em cada mundo', 'small', () => { [1, 2, 3].forEach((w) => { AR().tickets[w] = PQ.tickets(w) + 1; }); SV.persist(); re(); }),
        UI.btn('Tirar 🎟️', 'small', () => { AR().tickets = {}; SV.persist(); re(); }),
        UI.btn(S().finalDone ? 'Desfazer “viagem concluída”' : 'Simular “viagem concluída”', 'small', () => { S().finalDone = !S().finalDone; SV.persist(); re(); }),
        UI.btn('Tela “Arcade liberado”', 'small', () => { m.close(); setTimeout(() => PQ.reward(only || 1), 60); })]));
    }
    [1, 2, 3].filter((w) => !only || w === +only).forEach((w) => {
      m.body.appendChild(U.el('h3', { class: 'pq-sec' }, '🚂 Mundo ' + w + ' — ' + WORLDS[w]));
      m.body.appendChild(U.el('div', { class: 'pq-grid' }, PQ.worldGames(w).map(card)));
    });
    m.body.appendChild(U.el('details', { class: 'tip', style: { marginTop: '10px' } }, [U.el('summary', null, 'Créditos das imagens'),
      U.el('p', null, 'Ilustrações 3D: Fluent Emoji (Microsoft, licença MIT). Cenários, partículas e nuvens: Kenney (CC0). Jogos adaptados do Arcade de Geografia deste projeto.')]));
    m.setActions([UI.btn('🚂 Voltar ao Expresso', 'pri', () => { m.close(); PQ.back(); })]);
  };
  /** Tela de recompensa ao terminar um mundo: bilhete grátis para 1 dos 2 jogos. */
  PQ.reward = function (w) {
    w = +w || 1;
    GG.audio.sfx('win'); if (X()) X().flash('#fff6c0', 0.3); E.fx.confetti(E.W / 2, 50, 60);
    const m = UI.modal({ title: '🕹️ Arcade do Mundo ' + w + ' liberado!', noClose: true });
    m.body.appendChild(U.el('p', null, 'Parabéns por terminar a estação ' + WORLDS[w] + '! Você ganhou ' + (PQ.tickets(w) || 1) + ' 🎟️ bilhete grátis para jogar UM destes jogos bônus:'));
    m.body.appendChild(U.el('div', { class: 'pq-grid' }, PQ.worldGames(w).map((g) => U.el('button', { type: 'button', class: 'pq-card', style: { '--c1': g.c1, '--c2': g.c2 }, 'data-game': g.id, onclick: () => { m.close(); PQ.enter(g.id); } }, [U.el('div', { class: 'pq-art' }, X() ? X().el(g.icon, 64) : '🎮'), U.el('b', null, g.title), U.el('span', null, g.desc)]))));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Pode guardar o bilhete para depois. Quando terminar a viagem inteira, todos os jogos ficam liberados.'));
    m.setActions([UI.btn('Guardar para depois', 'ghost', () => { m.close(); PQ.back(); }), UI.btn('Ver o Arcade', '', () => { m.close(); PQ.open(); })]);
  };
  PQ.back = function () { SV.persist(); location.href = '../ingles/jogar.html' + (isTest() ? '?teste=1&tela=mapa' : ''); };

  /* ================================================================ runtime comum (igual ao Parque de Geografia) */
  let cur = null;
  function setStat(el, icon, v) {
    const s = String(v); if (el._v === s) return;
    const up = el._v != null && parseFloat(s) > parseFloat(el._v); el._v = s; el.textContent = ''; el.style.display = '';
    if (X()) el.appendChild(X().el(icon, 18)); el.appendChild(document.createTextNode(' ' + s));
    if (up) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  function Api(g) {
    this.g = g; this.score = 0; this.lives = null; this.maxLives = 3; this.ended = false;
    const h = document.getElementById('stageHud'); h.innerHTML = ''; h.classList.remove('hide');
    this.hud = { score: U.el('div', { class: 'sh-stat' }), extra: U.el('div', { class: 'sh-stat', style: { display: 'none' } }), lives: U.el('div', { class: 'sh-hearts' }), goal: U.el('div', { class: 'sh-goal' }) };
    const pause = U.el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Pausa', title: 'Pausa (Esc)', onclick: () => PQ.pause() }, '⏸');
    h.appendChild(U.el('div', { class: 'sh-row' }, [U.el('div', { class: 'sh-title' }, [U.el('span', { class: 'sh-ch pix' }, 'ARCADE'), ' ', X() ? X().el(g.icon, 22) : '🕹️', ' ' + g.title]), this.hud.lives, this.hud.score, this.hud.extra, U.el('span', { style: { flex: '1' } }), pause]));
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
    UI.closeAll && UI.closeAll();
    E.stop(); GEO.app.showStage();
    const api = new Api(g); cur = { g, api };
    const scene = MAKE[id](api);
    cur.scene = scene;
    E.start(scene);
    if (X()) { X().iris('in'); X().banner({ id: 'ing_' + id, icon: g.icon, title: g.title, style: 'Arcade do Expresso • Mundo ' + g.world + (g.ref ? ' • estilo ' + g.ref : '') }, 'JOGO BÔNUS'); }
    GG.audio.music(g.music);
    api.refresh();
    if (!skipIntro) await UI.say('estela', [g.how]);
    if (cur && cur.scene === scene && scene.begin) scene.begin();
  };
  PQ.current = () => cur;
  PQ.pause = function () {
    if (!cur || UI.blocking()) return;
    const m = UI.modal({ title: '⏸ Pausa — ' + cur.g.title, cls: 'small' });
    m.body.appendChild(U.el('p', { class: 'tip' }, 'O jogo está parado.'));
    m.setActions([UI.btn('🕹️ Sair para o Arcade', 'ghost', () => { m.close(); PQ.exit(true); }), UI.btn('Continuar ▶', 'pri', () => m.close())]);
  };
  PQ.exit = function (reopen) {
    E.stop(); cur = null;
    document.getElementById('stageHud').classList.add('hide');
    if (reopen) setTimeout(() => PQ.open(lastView), 60); else PQ.back();
  };
  function finish(api, note) {
    const g = api.g, score = api.score, r = AR().rec, old = r[g.id] || { best: null, plays: 0, medal: null };
    const medal = medalOf(g, score), record = old.best == null || score > old.best;
    const rank = (m) => ({ bronze: 1, prata: 2, ouro: 3 }[m] || 0);
    r[g.id] = { best: record ? score : old.best, plays: (old.plays || 0) + 1, medal: rank(medal) > rank(old.medal) ? medal : old.medal, last: Date.now() };
    SV.persist();
    GG.audio.music('vitoria'); GG.audio.sfx('win');
    if (medal) { E.fx.confetti(E.W / 2, 60, 70); if (X()) X().flash('#fff6c0', 0.35); }
    setTimeout(() => {
      const m = UI.modal({ title: '🕹️ ' + g.title + ' — fim de jogo!', noClose: true });
      const icon = X() ? U.el('div', { class: 'res-icon res-3d' }, [U.el('span', { class: 'res-shine' }), X().el(medal || 'estrela', 64)]) : U.el('div', { class: 'res-icon' }, medal ? MEDAL[medal][0] : '⭐');
      m.body.appendChild(U.el('div', { class: 'res-medal' + (medal ? ' medal-' + medal : '') }, [icon, U.el('div', null, [U.el('b', { class: 'pix' }, medal ? 'Medalha ' + MEDAL[medal][1] : 'Boa tentativa!'), U.el('div', null, 'Pontuação: ' + score + ' ' + g.unit), record ? U.el('div', { class: 'res-rec' }, '🏆 Novo recorde!') : U.el('div', null, 'Recorde: ' + old.best + ' ' + g.unit)])]));
      if (note) m.body.appendChild(U.el('p', { class: 'tip' }, note));
      const nxt = g.medals.find((v) => v > score);
      m.body.appendChild(U.el('p', { class: 'tip' }, nxt ? 'Próxima medalha com ' + nxt + ' ' + g.unit + '.' : 'Você conquistou a medalha máxima! 🥇'));
      m.setActions([UI.btn('🚂 Expresso', 'ghost', () => { m.close(); PQ.exit(false); }), UI.btn('🕹️ Arcade', '', () => { m.close(); PQ.exit(true); }), UI.btn('🔁 Jogar de novo', 'pri', () => { m.close(); E.stop(); cur = null; setTimeout(() => PQ.enter(g.id), 80); })]);
    }, medal ? 700 : 250);
  }
  /** Ouve arrastar/soltar enquanto a cena estiver ativa (remove ao sair). */
  PQ.pointer = function (sc, handlers) {
    const cv = document.getElementById('game');
    const offs = Object.keys(handlers).map((type) => {
      const target = type === 'pointerdown' ? cv : window;
      const f = (ev) => { if (UI.blocking() || E.scene !== sc) return; const l = E.toLogical(ev.clientX, ev.clientY); handlers[type](l.x, l.y, ev); };
      target.addEventListener(type, f); return () => target.removeEventListener(type, f);
    });
    const ex = sc.exit; sc.exit = function () { offs.forEach((o) => o()); if (ex) ex.call(sc); };
  };
  /** Cena de fundo do menu: céu estrelado com o Expresso passando. */
  function menuScene() {
    const sc = { cam: { x: 0, y: 0 }, t: 0 };
    sc.update = (dt) => { sc.t += dt; };
    sc.draw = (g) => {
      const c = g.ctx(), x = X();
      if (!(x && x.sky(g, 'torre', sc.t * 12, 0, sc.t, { horizon: 230 }))) { c.fillStyle = '#1a1350'; c.fillRect(0, 0, E.W, E.H); }
      c.fillStyle = '#c9a24d'; c.fillRect(0, 196, E.W, 3); c.fillStyle = '#6b4a1c'; for (let i = 0; i < E.W; i += 10) c.fillRect(i, 199, 5, 3);
      if (x) x.ilus(c, 'trem', ((sc.t * 40) % (E.W + 80)) - 40, 184, 30, { flip: true });
    };
    return sc;
  }

  /* ================================================================ início da página */
  async function boot() {
    if (M.blocked) return;
    UI.portraits.estela = () => '../ingles/assets/img/estrela.png'; UI.names.estela = 'Estela';
    E.init(document.getElementById('game'));
    await Promise.all([E.loadSheets('../../assets/shared/sprites/'), GEO.gfx ? GEO.gfx.load() : null, document.fonts ? document.fonts.ready.catch(() => null) : null]);
    if (GG.testMode && GG.testMode.active()) GG.testMode.banner('../../../');
    if (!SV.load()) SV.newGame(GG.profile ? GG.profile.name() : 'Gabriel');
    UI.applyA11y(S().settings);
    AR(); SV.persist();
    const l = document.getElementById('loading'); if (l) l.remove();
    const q = new URLSearchParams(location.search);
    const jogo = q.get('jogo'), menu = q.get('menu'), rec = q.get('recompensa');
    // recompensa ao fim de um mundo (vinda do jogo de Inglês): só se o mundo foi mesmo concluído (ou no teste)
    if (rec && /^[123]$/.test(rec) && (isTest() || PQ.worldDone(+rec))) { GEO.app.showMenu(); E.start(menuScene()); PQ.reward(+rec); return; }
    if (jogo && GAMES.some((g) => g.id === jogo)) { if (isTest()) { PQ.play(jogo); return; } PQ.open(); PQ.enter(jogo); return; }
    PQ.open(menu && /^[123]$/.test(menu) ? +menu : null);
  }
  window.addEventListener('DOMContentLoaded', () => { boot().catch((e) => { GG.errlog && GG.errlog.add('arcade-ingles', e.message); console.error(e); }); });
})();
