/* =====================================================================
   ui/ui.js — INTERFACE: janelas (pilha de modais), diálogos com
   retrato, cartões de explicação, HUD, menu, loja, inventário,
   Caderno do Guardião, área do responsável, mural de missões,
   portal das regiões, jardim, troféus, certificado e tela inicial.
   ===================================================================== */
EN.ui = (function () {
  'use strict';
  const U = EN.util, D = EN.data;
  const UI = {};
  const S = () => EN.save.S;
  let layer, toasts, hud;
  const stack = [];

  /* ------------------------------------------------------------------ base */
  UI.init = function () {
    layer = U.$('#layer'); toasts = U.$('#toasts'); hud = U.$('#hud');
    document.addEventListener('click', (ev) => {
      const g = ev.target.closest && ev.target.closest('button.gl');
      if (g) { ev.preventDefault(); ev.stopPropagation(); UI.glossary(g.dataset.g.replace(/^g_/, '')); }
    }, true);
    window.addEventListener('keydown', (ev) => {
      const top = stack[stack.length - 1];
      if (!top || !top.onKey) return;
      const tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      top.onKey(ev);
    });
    bindHud();
    document.body.classList.toggle('no-tts', !EN.audio.ttsSupported);
  };
  function sync() { EN.engine.paused = stack.length > 0 || !!UI.titleOpen; document.body.classList.toggle('modal-open', stack.length > 0); }
  UI.anyOpen = () => stack.length > 0;

  UI.btn = function (label, cls, fn) {
    const b = U.el('button', { type: 'button', class: 'btn ' + (cls || '') }, label);
    b.addEventListener('click', (ev) => { ev.stopPropagation(); EN.audio.play('click'); fn && fn(ev); });
    return b;
  };
  /** Botão "Ouvir" (Web Speech). Some quando não há suporte. */
  UI.ttsBtn = function (getText, labelled) {
    const b = U.el('button', { type: 'button', class: 'btn tts ghost', title: 'Ouvir o texto', 'aria-label': 'Ouvir o texto' }, labelled ? '🔊 Ouvir' : '🔊');
    b.addEventListener('click', (ev) => { ev.stopPropagation(); EN.audio.speak(typeof getText === 'function' ? getText() : getText); });
    if (!EN.audio.ttsSupported || (S() && S().settings.tts === false)) b.style.display = 'none';
    return b;
  };

  /**
   * Janela modal empilhável.
   * opts: { title, cls, wide, noClose, onClose, onKey }
   */
  UI.modal = function (opts) {
    opts = opts || {};
    const wrap = U.el('div', { class: 'modal-wrap' });
    const el = U.el('div', { class: 'modal ' + (opts.cls || '') + (opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' });
    const head = U.el('div', { class: 'm-head' }, [U.el('h2', { class: 'm-title' }, opts.title || '')]);
    const body = U.el('div', { class: 'm-body' });
    const foot = U.el('div', { class: 'm-foot' });
    el.appendChild(head); el.appendChild(body); el.appendChild(foot);
    wrap.appendChild(el); layer.appendChild(wrap);
    const m = {
      el, head, body, foot, wrap, onKey: opts.onKey,
      setTitle: (t) => { head.querySelector('.m-title').textContent = t; },
      setActions: (btns) => { foot.innerHTML = ''; (btns || []).forEach((b) => b && foot.appendChild(b)); },
      close: () => {
        const i = stack.indexOf(m); if (i >= 0) stack.splice(i, 1);
        wrap.remove(); EN.audio.stopSpeech(); sync();
        if (opts.onClose) opts.onClose();
      }
    };
    if (!opts.noClose) {
      const x = U.el('button', { type: 'button', class: 'm-x', 'aria-label': 'Fechar' }, '✖');
      x.addEventListener('click', () => m.close());
      head.appendChild(x);
      if (!m.onKey) m.onKey = (ev) => { if (ev.key === 'Escape') m.close(); };
    }
    stack.push(m); sync();
    EN.audio.play('open');
    return m;
  };

  UI.toast = function (text, kind) {
    const t = U.el('div', { class: 'toast ' + (kind || '') }, text);
    toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3200);
  };
  UI.rewardPop = function (xp, coins, reason) {
    if (!xp && !coins) return;
    EN.audio.play('coin');
    UI.toast((reason ? reason + ': ' : '') + (xp ? '+' + xp + ' XP ' : '') + (coins ? ' +' + coins + ' 🪙' : ''), 'reward');
    if (EN.engine.map) EN.engine.floatText((coins ? '+' + coins + ' 🪙 ' : '') + (xp ? '+' + xp + ' XP' : ''), '#ffe066');
    UI.hudUpdate(true);
  };
  UI.levelUp = function (lvl, title) {
    EN.audio.play('levelup');
    UI.toast('⭐ Nível ' + lvl + '! Novo título: ' + title, 'level');
    EN.engine.celebrate && EN.engine.celebrate();
  };
  UI.saveBadge = function () {
    const b = U.$('#saveBadge'); if (!b) return;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  };
  UI.confirm = function (text, yes, no) {
    return new Promise((res) => {
      const m = UI.modal({ title: 'Confirmar', cls: 'small', noClose: true, onKey: (ev) => { if (ev.key === 'Escape') { m.close(); res(false); } } });
      m.body.appendChild(U.el('p', { class: 'prompt', html: U.rich(text, { noGloss: true }) }));
      m.setActions([UI.btn(no || 'Não', 'ghost', () => { m.close(); res(false); }), UI.btn(yes || 'Sim', 'pri', () => { m.close(); res(true); })]);
    });
  };

  /* ------------------------------------------------------------------ texto com nome */
  const fmt = (t) => String(t || '').replace(/\{nome\}/g, S() ? S().name : 'Gabriel');
  function speakerOf(id) {
    const sp = D.speakers[id] || { name: id };
    if (id === 'lumi') return { name: 'Lumi', kind: 'lumi', variant: EN.eco.lumiVariant() };
    return sp;
  }

  /* ------------------------------------------------------------------ diálogo */
  /** Diálogo em blocos, com retrato, nome, ouvir, voltar e continuar. */
  UI.say = function (who, lines, opts) {
    opts = opts || {};
    lines = (lines || []).map(fmt);
    if (!lines.length) return Promise.resolve();
    return new Promise((resolve) => {
      const sp = typeof who === 'object' ? who : speakerOf(who);
      const wrap = U.el('div', { class: 'dlg-wrap' });
      const box = U.el('div', { class: 'dlg' });
      const cv = U.el('canvas', { class: 'portrait', width: 192, height: 192 });
      const name = U.el('div', { class: 'dlg-name' }, sp.name || '');
      const txt = U.el('div', { class: 'dlg-text', 'aria-live': 'polite' });
      const cnt = U.el('span', { class: 'dlg-cnt' });
      const bBack = UI.btn('◀ Voltar', 'ghost sm', () => { if (i > 0) { i--; show(); } });
      const bRep = UI.btn('↺ Repetir', 'ghost sm', () => { i = 0; show(); });
      const bTts = UI.ttsBtn(() => lines[i], true); bTts.classList.add('sm');
      const bNext = UI.btn('Continuar ▶', 'pri', () => next());
      const ctr = U.el('div', { class: 'dlg-ctl' }, [bBack, bRep, bTts, U.el('span', { class: 'sp' }), cnt, bNext]);
      box.appendChild(U.el('div', { class: 'dlg-l' }, [cv])); box.appendChild(U.el('div', { class: 'dlg-r' }, [name, txt, ctr]));
      wrap.appendChild(box); layer.appendChild(wrap);
      let i = 0;
      const m = { onKey: (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); next(); } else if (ev.key === 'ArrowLeft' || ev.key === 'Backspace') { if (i > 0) { i--; show(); } } } };
      stack.push(m); sync();
      function show() {
        EN.sprites.portrait(cv, sp);
        txt.innerHTML = U.rich(lines[i]);
        txt.classList.remove('in'); void txt.offsetWidth; txt.classList.add('in');
        cnt.textContent = (i + 1) + '/' + lines.length + (i < lines.length - 1 ? ' ▼' : '');
        bBack.disabled = i === 0;
        bNext.textContent = i < lines.length - 1 ? 'Continuar ▶' : (opts.last || 'Ok ▶');
      }
      function next() {
        if (i < lines.length - 1) { i++; show(); EN.audio.play('click'); return; }
        const k = stack.indexOf(m); if (k >= 0) stack.splice(k, 1);
        wrap.remove(); EN.audio.stopSpeech(); sync(); resolve();
      }
      wrap.addEventListener('click', (ev) => { if (ev.target === wrap) next(); });
      show();
    });
  };

  /** Pergunta com opções num diálogo. Retorna o índice escolhido. */
  UI.choice = function (who, text, options) {
    return new Promise((resolve) => {
      const sp = typeof who === 'object' ? who : speakerOf(who);
      const wrap = U.el('div', { class: 'dlg-wrap' });
      const box = U.el('div', { class: 'dlg' });
      const cv = U.el('canvas', { class: 'portrait', width: 192, height: 192 });
      const opts = U.el('div', { class: 'dlg-opts' });
      box.appendChild(U.el('div', { class: 'dlg-l' }, [cv]));
      box.appendChild(U.el('div', { class: 'dlg-r' }, [U.el('div', { class: 'dlg-name' }, sp.name || ''), U.el('div', { class: 'dlg-text in', html: U.rich(fmt(text)) }), opts]));
      wrap.appendChild(box); layer.appendChild(wrap);
      const m = { onKey: (ev) => { const n = parseInt(ev.key, 10); if (n >= 1 && n <= options.length) done(n - 1); if (ev.key === 'Escape') done(options.length - 1); } };
      stack.push(m); sync();
      EN.sprites.portrait(cv, sp);
      function done(k) { const j = stack.indexOf(m); if (j >= 0) stack.splice(j, 1); wrap.remove(); sync(); resolve(k); }
      options.forEach((o, k) => opts.appendChild(UI.btn((k + 1) + '. ' + o, k === 0 ? 'pri' : '', () => done(k))));
    });
  };

  /* ------------------------------------------------------------------ cartões de explicação */
  /** Explicação em cartões (uma ideia por cartão) com voltar/repetir/ouvir. */
  UI.cardsPromise = function (cards, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      let i = 0;
      const m = UI.modal({ title: opts.title || 'Explicação', cls: 'cards', noClose: true, onKey: (ev) => { if (ev.key === 'ArrowRight' || ev.key === 'Enter') next(); if (ev.key === 'ArrowLeft') back(); } });
      const bTts = UI.ttsBtn(() => U.strip(cards[i].text || cards[i].html || ''), true);
      function back() { if (i > 0) { i--; draw(); } }
      function next() { if (i < cards.length - 1) { i++; draw(); } else { m.close(); resolve(); } }
      function draw() {
        const c = cards[i];
        m.setTitle(c.title || opts.title || 'Explicação');
        m.body.innerHTML = '';
        const lumi = U.el('canvas', { class: 'mini-lumi', width: 90, height: 90 });
        EN.sprites.portrait(lumi, speakerOf(opts.speaker || 'lumi'));
        m.body.appendChild(U.el('div', { class: 'card-top' }, [lumi, U.el('div', { class: 'art' }, c.art || '')]));
        m.body.appendChild(U.el('div', { class: 'card-text', html: c.html || U.rich(fmt(c.text)) }));
        m.body.appendChild(U.el('div', { class: 'dots' }, cards.map((_, k) => U.el('span', { class: k === i ? 'on' : '' }))));
        const acts = [UI.btn('◀ Voltar', 'ghost', back), UI.btn('↺ Repetir explicação', 'ghost', () => { i = 0; draw(); }), bTts, UI.btn(i < cards.length - 1 ? 'Continuar ▶' : (opts.finalLabel || 'Entendi! ▶'), 'pri', next)];
        acts[0].disabled = i === 0;
        m.setActions(acts);
      }
      draw();
    });
  };

  /** Exemplo guiado: Lumi resolve passo a passo (o jogador revela cada passo). */
  UI.guided = function (gd) {
    return new Promise((resolve) => {
      const m = UI.modal({ title: '🧭 Exemplo guiado: ' + gd.title, cls: 'cards', noClose: true });
      let n = 1;
      const list = U.el('ol', { class: 'guided' });
      function draw() {
        list.innerHTML = '';
        gd.steps.slice(0, n).forEach((s, k) => list.appendChild(U.el('li', { class: k === n - 1 ? 'new' : '' }, [U.el('span', { class: 'g-art' }, s.art || '•'), U.el('span', { html: U.rich(s.text) })])));
        const done = n >= gd.steps.length;
        m.setActions([UI.ttsBtn(() => gd.steps.slice(0, n).map((s) => s.text).join(' '), true), UI.btn(done ? 'Entendi! ▶' : 'Próximo passo ▶', 'pri', () => { if (done) { m.close(); resolve(); } else { n++; draw(); } })]);
      }
      const lumi = U.el('canvas', { class: 'mini-lumi', width: 90, height: 90 });
      EN.sprites.portrait(lumi, speakerOf('lumi'));
      m.body.appendChild(U.el('div', { class: 'card-top' }, [lumi, U.el('p', { class: 'prompt' }, 'Observe como a Lumi pensa, passo a passo.')]));
      m.body.appendChild(list);
      draw();
    });
  };

  UI.info = function (inf) {
    return UI.cardsPromise([{ title: inf.title, art: inf.art, text: inf.text }], { finalLabel: 'Ok ▶' });
  };

  UI.glossary = function (id) {
    const g = D.glossary.find((x) => x.id === id);
    if (!g) return;
    const m = UI.modal({ title: '📘 ' + g.term, cls: 'small' });
    m.body.appendChild(U.el('p', { class: 'prompt', html: U.rich(g.def, { noGloss: true }) }));
    m.body.appendChild(U.el('p', { class: 'tip', html: '<b>Exemplo:</b> ' + U.esc(g.ex) }));
    m.setActions([UI.ttsBtn(() => g.term + '. ' + g.def + ' Exemplo: ' + g.ex, true), UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /* ------------------------------------------------------------------ HUD */
  function bindHud() {
    U.$('#hMenu').addEventListener('click', () => EN.game.openMenu());
    U.$('#hInv').addEventListener('click', () => EN.game.openInventory());
    U.$('#hNote').addEventListener('click', () => EN.game.openNotebook());
    U.$('#hPath').addEventListener('click', () => EN.game.togglePath());
    U.$('#hSound').addEventListener('click', () => UI.toggleSound());
    U.$('#hFull').addEventListener('click', () => UI.fullscreen());
    U.$('#hMin').addEventListener('click', () => { S().settings.hudMin = !S().settings.hudMin; UI.hudUpdate(true); EN.save.persist(); });
    U.$('#hMission').addEventListener('click', () => EN.game.openBoard());
  }
  UI.toggleSound = function () {
    const on = !EN.audio.enabled;
    EN.audio.setEnabled(on);
    if (S()) { S().settings.sound = on; EN.save.persist(); }
    UI.hudUpdate(true);
    UI.toast(on ? '🔊 Sons ligados' : '🔇 Sons desligados');
  };
  UI.fullscreen = function () {
    const d = document;
    try {
      if (!d.fullscreenElement && !d.webkitFullscreenElement) (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen).call(d.documentElement);
      else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    } catch (e) { UI.toast('Tela cheia não disponível neste navegador.'); }
  };
  let hudT = 0;
  UI.hudUpdate = function (force) {
    const s = S(); if (!s || !hud) return;
    const now = performance.now();
    if (!force && now - hudT < 250) return;
    hudT = now;
    const lv = EN.eco.level();
    const fr = EN.eco.frame(lv.lvl);
    U.$('#hName').textContent = s.name;
    U.$('#hTitle').textContent = 'Nv ' + lv.lvl + ' • ' + EN.eco.title(lv.lvl);
    U.$('#hAvatar').style.borderColor = fr.color;
    U.$('#hXp').style.width = Math.round(lv.pct * 100) + '%';
    U.$('#hXpT').textContent = lv.next ? (s.xp - lv.cur) + '/' + (lv.next - lv.cur) + ' XP' : 'Nível máximo';
    U.$('#hCoins').textContent = s.coins;
    U.$('#hLeaves').textContent = '🍃🍃🍃';
    U.$('#hMissionT').textContent = EN.quests.objectiveText(EN.engine.map ? EN.engine.map.id : 'vila');
    U.$('#hSound').textContent = EN.audio.enabled ? '🔊' : '🔇';
    U.$('#hSound').title = EN.audio.enabled ? 'Pausar sons' : 'Ligar sons';
    U.$('#hPath').classList.toggle('on', !!s.settings.path);
    hud.classList.toggle('min', !!s.settings.hudMin);
    U.$('#hMin').textContent = s.settings.hudMin ? '▸' : '▾';
    const tr = U.$('#hFrag');
    if (EN.eco.effect('colecao') && EN.engine.map) {
      const fr2 = EN.engine.map.entities.filter((e) => e.def.pickup === 'frag');
      const got = fr2.filter((e) => EN.game.picked('frag:' + e.id.replace('_frag', ''))).length;
      tr.textContent = '💎 ' + got + '/' + fr2.length + ' EcoFragmentos aqui';
      tr.style.display = fr2.length ? '' : 'none';
    } else tr.style.display = 'none';
    const av = U.$('#hAvatar');
    if (av && av.getContext) {
      const c = av.getContext('2d'); c.clearRect(0, 0, av.width, av.height);
      EN.sprites.drawCharacter(c, av.width / 2, av.height * 1.55, EN.eco.look(), { dir: 'down', t: 0, scale: 1.9 });
    }
  };

  /* ------------------------------------------------------------------ PAINÉIS */
  function tabs(el, list, cur, onPick) {
    const t = U.el('div', { class: 'tabs', role: 'tablist' });
    list.forEach((x) => { const b = U.el('button', { type: 'button', class: 'tab' + (x.id === cur ? ' on' : ''), role: 'tab' }, x.label); b.addEventListener('click', () => onPick(x.id)); t.appendChild(b); });
    el.appendChild(t);
  }
  const rarChip = (r) => U.el('span', { class: 'rar', style: { background: D.rarities[r].color } }, D.rarities[r].label);

  /** Menu de pausa. */
  UI.menu = function () {
    const m = UI.modal({ title: '☰ Menu do Guardião' });
    const s = S();
    const grid = U.el('div', { class: 'menu-grid' });
    const add = (label, fn, cls) => grid.appendChild(UI.btn(label, 'big ' + (cls || ''), () => { m.close(); fn(); }));
    add('▶ Continuar', () => {}, 'pri');
    add('📓 Caderno do Guardião', () => EN.game.openNotebook());
    add('🎒 Inventário', () => EN.game.openInventory());
    add('📋 Missões', () => EN.game.openBoard());
    add('📈 Progresso', () => UI.progress());
    add('🏆 Troféus e medalhas', () => UI.trophies());
    if (s.storyDone) add('📝 Revisão antes da prova', () => EN.game.reviewMode(), 'gold');
    else grid.appendChild(U.el('div', { class: 'locked-note' }, '📝 Revisão antes da prova: libera ao concluir a história.'));
    add('⚙️ Configurações', () => UI.settings());
    add('👨‍👩‍👦 Área do Responsável/Professor', () => UI.parentGate());
    add('❓ Como jogar', () => UI.help());
    add('🏠 Salvar e voltar à tela inicial', () => { EN.save.persist('salvo'); EN.game.toTitle(); });
    m.body.appendChild(grid);
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  UI.help = function () {
    UI.cardsPromise([
      { title: 'Andar e interagir', art: '⌨️📱', text: 'No computador: **WASD** ou **setas** para andar; **E** ou **Espaço** para interagir. No celular: use o **direcional** e o botão **✋**. Quando aparecer um balão sobre alguém ou algo, você pode interagir.' },
      { title: 'Missões', art: '📋', text: 'O objetivo atual aparece no alto da tela. Toque em **🧭** para **mostrar o caminho** até ele. Missões secundárias são opcionais e dão recompensas extras.' },
      { title: 'Folhas e pistas', art: '🍃💡', text: 'Cada desafio começa com **3 folhas**. Errar tira uma folha, mas você nunca perde o que já conquistou. Depois de um erro vem uma **pista**, e depois uma **versão guiada**.' },
      { title: 'Moedas e XP', art: '🪙⭐', text: '**XP** sobe seu nível e libera prateleiras mais raras. **EcoMoedas** compram itens na Loja do Guardião. Acertar de primeira rende mais, mas ninguém fica sem terminar a história.' }
    ], { title: 'Como jogar' });
  };

  UI.settings = function () {
    const m = UI.modal({ title: '⚙️ Configurações' });
    const s = S().settings;
    const row = (label, val, fn) => { const b = UI.btn(val ? 'Ligado' : 'Desligado', val ? 'pri' : '', () => { fn(); m.close(); UI.settings(); }); m.body.appendChild(U.el('div', { class: 'set-row' }, [U.el('span', null, label), b])); };
    row('🔊 Sons suaves', EN.audio.enabled, () => UI.toggleSound());
    if (EN.audio.ttsSupported) row('🗣️ Botões de ouvir texto', s.tts !== false, () => { s.tts = s.tts === false; EN.save.persist(); });
    else m.body.appendChild(U.el('p', { class: 'tip' }, '🗣️ A leitura em voz alta não está disponível neste navegador.'));
    row('🧭 Mostrar caminho até o objetivo', !!s.path, () => EN.game.togglePath());
    row('📱 Controles de toque na tela', document.body.classList.contains('touch-on'), () => { s.touch = document.body.classList.contains('touch-on') ? 'off' : 'on'; EN.game.applyTouch(); EN.save.persist(); });
    row('🔠 Letras maiores', !!s.bigText, () => { s.bigText = !s.bigText; document.body.classList.toggle('big', s.bigText); EN.save.persist(); });
    m.body.appendChild(U.el('div', { class: 'set-row' }, [U.el('span', null, '⛶ Tela cheia'), UI.btn('Alternar', '', () => UI.fullscreen())]));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /** Progresso total e por região. */
  UI.progress = function () {
    const m = UI.modal({ title: '📈 Progresso', wide: true });
    const Q = EN.quests;
    const tot = Math.round(Q.totalProgress() * 100);
    m.body.appendChild(U.el('div', { class: 'prog-total' }, [U.el('b', null, 'História: ' + tot + '%'), U.el('div', { class: 'bar' }, U.el('i', { style: { width: tot + '%' } }))]));
    const cov = Q.coverage();
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Questões do livro concluídas: ' + cov.done + '/' + cov.total + ' • Domínio geral: ' + Math.round(Q.overallMastery() * 100) + '%'));
    D.regions.forEach((r) => {
      const p = Math.round(Q.regionProgress(r.id) * 100);
      const st = !Q.regionUnlocked(r.id) ? '🔒 bloqueada' : Q.regionComplete(r.id) ? '✅ concluída' : '▶ em andamento';
      const stars = Q.questionsOf(r.id).reduce((a, q) => a + (S().q[q.id].stars || 0), 0);
      m.body.appendChild(U.el('div', { class: 'prog-row' }, [U.el('span', { class: 'dot', style: { background: r.color } }), U.el('b', null, r.n + '. ' + r.name), U.el('span', { class: 'tip' }, st + ' • ⭐ ' + stars + '/' + Q.questionsOf(r.id).length * 3 + ' • domínio ' + Math.round(Q.mastery(r.id) * 100) + '%'), U.el('div', { class: 'bar' }, U.el('i', { style: { width: p + '%', background: r.color } }))]));
    });
    const a = S().arena;
    m.body.appendChild(U.el('div', { class: 'prog-row' }, [U.el('span', { class: 'dot', style: { background: '#b07bff' } }), U.el('b', null, '7. Arena Final'), U.el('span', { class: 'tip' }, S().storyDone ? '✅ concluída • melhor: ' + Math.round(a.best * 100) + '%' : Q.allRegionsDone() ? '▶ liberada' : '🔒 bloqueada')]));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /** Mural de Missões: missão principal com etapas + secundárias. */
  UI.board = function () {
    const m = UI.modal({ title: '📋 Mural de Missões', wide: true });
    const Q = EN.quests;
    const o = Q.objective();
    m.body.appendChild(U.el('div', { class: 'obj-box' }, [U.el('b', null, '🎯 Agora: '), o.text]));
    const r = Q.activeRegion();
    if (r) {
      m.body.appendChild(U.el('h3', null, 'Missão principal: ' + r.name));
      const ol = U.el('ol', { class: 'steps' });
      r.lessons.forEach((lid) => { const st = Q.lessonState(lid); ol.appendChild(U.el('li', { class: st }, (st === 'done' ? '✅ ' : st === 'locked' ? '⬜ ' : '▶ ') + D.lessons[lid].title)); });
      ol.appendChild(U.el('li', { class: Q.regionComplete(r.id) ? 'done' : '' }, (Q.regionComplete(r.id) ? '✅ ' : '⬜ ') + 'Desafio da Região no Altar do Cristal'));
      m.body.appendChild(ol);
    }
    m.body.appendChild(U.el('h3', null, 'Missões secundárias (opcionais)'));
    const any = Object.values(D.sides).filter((sd) => Q.sideState(sd.id) !== 'none');
    if (!any.length) m.body.appendChild(U.el('p', { class: 'tip' }, 'Converse com os moradores das regiões para receber missões secundárias.'));
    any.forEach((sd) => {
      const st = Q.sideState(sd.id);
      m.body.appendChild(U.el('div', { class: 'side-row ' + st }, [U.el('b', null, (st === 'done' ? '✅ ' : st === 'ready' ? '🎁 ' : '▶ ') + sd.title), U.el('span', null, ' — ' + sd.desc + (st === 'active' ? ' (' + Q.sideProgress(sd.id) + '/' + Q.sideGoal(sd.id) + ')' : st === 'ready' ? ' (volte para receber a recompensa!)' : ''))]));
    });
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /** Portal das Regiões (mapa de progressão acessado andando até o portal). */
  UI.regionPortal = function () {
    return new Promise((resolve) => {
      const m = UI.modal({ title: '🗺️ Portal das Regiões', wide: true, onClose: () => resolve(null) });
      const Q = EN.quests;
      const grid = U.el('div', { class: 'region-grid' });
      D.regions.forEach((r, k) => {
        const un = Q.regionUnlocked(r.id), done = Q.regionComplete(r.id);
        const card = U.el('div', { class: 'region-card' + (un ? '' : ' locked') + (done ? ' done' : ''), style: { '--c': r.color } }, [
          U.el('div', { class: 'rc-h' }, [U.el('span', { class: 'rc-n' }, String(r.n)), U.el('b', null, r.name)]),
          U.el('div', { class: 'bar' }, U.el('i', { style: { width: Math.round(Q.regionProgress(r.id) * 100) + '%' } })),
          U.el('p', { class: 'tip' }, done ? '✅ Cristal restaurado' : un ? '▶ Liberada' : '🔒 Conclua a região ' + (r.n - 1) + ' para liberar'),
          un ? UI.btn('Viajar ▶', 'pri', () => { m.close(); resolve(r.map); }) : null
        ]);
        grid.appendChild(card);
      });
      const ar = Q.allRegionsDone();
      grid.appendChild(U.el('div', { class: 'region-card' + (ar ? '' : ' locked'), style: { '--c': '#b07bff' } }, [U.el('div', { class: 'rc-h' }, [U.el('span', { class: 'rc-n' }, '7'), U.el('b', null, 'Arena Final')]), U.el('p', { class: 'tip' }, ar ? 'Use o Portal da Arena, a leste da praça da Vila.' : '🔒 Restaure os seis cristais')]));
      m.body.appendChild(grid);
      m.setActions([UI.btn('Fechar', '', () => m.close())]);
    });
  };

  /* ------------------------------------------------------------------ LOJA */
  UI.shop = function (tab) {
    let cur = tab || 'roupa';
    const m = UI.modal({ title: '🛒 Loja do Guardião', wide: true, cls: 'shop' });
    function draw() {
      const s = S();
      m.body.innerHTML = '';
      const lv = EN.eco.level().lvl;
      m.body.appendChild(U.el('div', { class: 'shop-top' }, [U.el('span', { class: 'coins-big' }, '🪙 ' + s.coins + ' EcoMoedas'), U.el('span', { class: 'tip' }, 'Nível ' + lv + ' • Preços fixos • Sem sorteios • Nada aqui é obrigatório para terminar a história')]));
      tabs(m.body, D.categories.map((c) => ({ id: c.id, label: c.icon + ' ' + c.label })), cur, (id) => { cur = id; draw(); });
      const grid = U.el('div', { class: 'item-grid' });
      D.items.filter((it) => it.cat === cur && !it.free).forEach((it) => {
        const chk = EN.eco.canBuy(it.id);
        const owned = EN.eco.owns(it.id);
        const card = U.el('button', { type: 'button', class: 'item-card' + (owned ? ' owned' : '') + (chk.locked ? ' locked' : ''), style: { '--rc': D.rarities[it.rarity].color } }, [
          U.el('span', { class: 'it-ic' }, it.icon), U.el('b', null, it.name), rarChip(it.rarity),
          U.el('span', { class: 'price' }, owned ? '✔ Já é seu' : chk.locked ? '🔒 Nível ' + D.rarities[it.rarity].minLevel : '🪙 ' + it.price),
          U.el('span', { class: 'fx' }, it.effect)
        ]);
        card.addEventListener('click', () => itemDetail(it, 'shop', draw));
        grid.appendChild(card);
      });
      m.body.appendChild(grid);
    }
    draw();
    m.setActions([UI.btn('Sair da loja', 'pri', () => m.close())]);
  };

  /** Prévia do avatar com um item aplicado. */
  function preview(it) {
    const cv = U.el('canvas', { class: 'preview', width: 180, height: 200 });
    const eq = Object.assign({}, S().equip);
    if (it && it.slot) eq[it.slot] = it.id;
    const c = cv.getContext('2d');
    let t = 0, live = true;
    const loop = () => {
      if (!live || !cv.isConnected) { live = false; return; }
      t += 0.05;
      c.clearRect(0, 0, 180, 200);
      c.fillStyle = '#e8f6ec'; c.beginPath(); c.ellipse(90, 170, 60, 18, 0, 0, 7); c.fill();
      EN.sprites.drawCharacter(c, 90, 170, EN.eco.look(eq), { dir: 'down', t, moving: true, walk: t * 4, scale: 2 });
      const lumi = EN.eco.lumiVariant(eq); EN.sprites.drawLumi(c, 36, 150, t, lumi, 1.2);
      const pet = EN.eco.petKind(eq); if (pet) EN.sprites.drawPet(c, pet, 150, 176, t, false);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return cv;
  }

  /** Detalhe do item: prévia, comparação com o equipado, comprar/equipar. */
  function itemDetail(it, mode, after) {
    const m = UI.modal({ title: it.icon + ' ' + it.name, cls: 'small' });
    const s = S();
    m.body.appendChild(U.el('div', { class: 'det' }, [preview(it), U.el('div', null, [rarChip(it.rarity), U.el('p', { html: '<b>Efeito:</b> ' + U.esc(it.effect) }), it.bonus ? U.el('p', { class: 'tip' }, 'Abre uma área bônus opcional. Nenhum conteúdo da prova fica trancado.') : null])]));
    if (it.slot) {
      const curId = s.equip[it.slot];
      const cur = curId && EN.eco.item(curId);
      m.body.appendChild(U.el('div', { class: 'cmp' }, [U.el('b', null, 'Comparação'), U.el('p', null, 'Equipado agora: ' + (cur ? cur.icon + ' ' + cur.name + ' — ' + cur.effect : 'nada neste espaço')), U.el('p', null, 'Este item: ' + it.icon + ' ' + it.name + ' — ' + it.effect)]));
    }
    const acts = [];
    if (mode === 'shop' && !EN.eco.owns(it.id)) {
      const chk = EN.eco.canBuy(it.id);
      m.body.appendChild(U.el('p', { class: 'price-line' }, 'Preço: 🪙 ' + it.price + ' • Seu saldo: 🪙 ' + s.coins + (chk.ok ? ' • Depois da compra: 🪙 ' + (s.coins - it.price) : '')));
      if (!chk.ok) m.body.appendChild(U.el('p', { class: 'fb warn' }, chk.why + (chk.locked ? '' : ' Continue aprendendo e revisando para juntar mais!')));
      const b = UI.btn('Comprar', 'pri', async () => {
        const yes = await UI.confirm('Comprar **' + it.name + '** por **' + it.price + ' EcoMoedas**? Seu saldo ficará em ' + (s.coins - it.price) + '.', 'Comprar', 'Agora não');
        if (!yes) return;
        const r = EN.eco.buy(it.id);
        if (r.ok) { UI.toast('🛍️ Comprado: ' + it.name + ' (já está no inventário)', 'reward'); EN.audio.play('coin'); UI.hudUpdate(true); m.close(); after && after(); EN.game.onPurchase(it); }
        else UI.toast(r.why);
      });
      b.disabled = !chk.ok; acts.push(b);
    } else if (EN.eco.owns(it.id) && it.slot) {
      if (EN.eco.equipped(it.id)) acts.push(UI.btn('Desequipar', '', () => { EN.eco.unequip(it.id); m.close(); after && after(); UI.hudUpdate(true); }));
      else acts.push(UI.btn('Equipar', 'pri', () => { EN.eco.equip(it.id); m.close(); after && after(); UI.hudUpdate(true); UI.toast('Equipado: ' + it.name); }));
    }
    acts.unshift(UI.btn('Voltar', 'ghost', () => m.close()));
    m.setActions(acts);
  }

  /* ------------------------------------------------------------------ INVENTÁRIO */
  UI.inventory = function (startTab) {
    let cat = startTab || 'todos', rar = 'todas';
    const m = UI.modal({ title: '🎒 Inventário', wide: true, cls: 'shop' });
    function draw() {
      const s = S();
      m.body.innerHTML = '';
      const tl = [{ id: 'todos', label: 'Todos' }].concat(D.categories.map((c) => ({ id: c.id, label: c.icon + ' ' + c.label })));
      if (EN.eco.effect('colecao')) tl.push({ id: 'lembrancas', label: '💎 Lembranças' });
      tabs(m.body, tl, cat, (id) => { cat = id; draw(); });
      if (cat === 'lembrancas') { m.body.appendChild(memories()); return; }
      const rsel = U.el('div', { class: 'rar-filter' }, [U.el('span', null, 'Raridade: ')].concat(['todas'].concat(Object.keys(D.rarities)).map((r) => { const b = UI.btn(r === 'todas' ? 'Todas' : D.rarities[r].label, rar === r ? 'pri sm' : 'sm', () => { rar = r; draw(); }); return b; })));
      m.body.appendChild(rsel);
      const grid = U.el('div', { class: 'item-grid' });
      const items = s.inv.map((id) => EN.eco.item(id)).filter((it) => it && (cat === 'todos' || it.cat === cat) && (rar === 'todas' || it.rarity === rar));
      if (!items.length) grid.appendChild(U.el('p', { class: 'tip' }, 'Nenhum item aqui ainda. Visite a Loja do Guardião na Vila!'));
      items.forEach((it) => {
        const card = U.el('button', { type: 'button', class: 'item-card' + (EN.eco.equipped(it.id) ? ' equipped' : ''), style: { '--rc': D.rarities[it.rarity].color } }, [U.el('span', { class: 'it-ic' }, it.icon), U.el('b', null, it.name), rarChip(it.rarity), U.el('span', { class: 'price' }, it.slot ? (EN.eco.equipped(it.id) ? '✔ Equipado' : 'Toque para equipar') : (it.bonus ? '🗝️ Abre área bônus' : '')), U.el('span', { class: 'fx' }, it.effect)]);
        card.addEventListener('click', () => itemDetail(it, 'inv', draw));
        grid.appendChild(card);
      });
      m.body.appendChild(U.el('div', { class: 'det' }, [preview(null), U.el('div', { class: 'tip' }, 'Seu Guardião com os itens equipados. Itens equipados continuam salvos quando você fecha o jogo.')]));
      m.body.appendChild(grid);
    }
    function memories() {
      const box = U.el('div', null);
      const byMap = {};
      Object.keys(D.maps).forEach((mid) => { const fr = (D.maps[mid].extra || []).filter((e) => e.pickup === 'frag'); if (fr.length) byMap[mid] = fr; });
      Object.keys(byMap).forEach((mid) => {
        const got = byMap[mid].filter((e) => EN.game.picked('frag:' + e.id.replace('_frag', ''))).length;
        box.appendChild(U.el('div', { class: 'prog-row' }, [U.el('b', null, D.maps[mid].name), U.el('span', { class: 'tip' }, '💎 ' + got + '/' + byMap[mid].length + ' • baú secreto: ' + ((D.maps[mid].extra || []).some((e) => e.chest && EN.game.picked('chest:' + e.id)) ? '✅' : '❔'))]));
      });
      Object.keys(S().mg).forEach((k) => { if (S().mg[k].trophy) box.appendChild(U.el('p', null, '🏅 Troféu do minijogo: ' + (EN.minigames.names[k] || k))); });
      return box;
    }
    draw();
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /* ------------------------------------------------------------------ CADERNO DO GUARDIÃO */
  UI.notebook = function () {
    let tab = 'fichas', q = '';
    const better = EN.eco.effect('caderno');
    const m = UI.modal({ title: '📓 Caderno do Guardião', wide: true, cls: 'notebook' });
    function draw() {
      const s = S();
      m.body.innerHTML = '';
      const tl = [{ id: 'fichas', label: '🗂️ Fichas' }, { id: 'glossario', label: '📘 Glossário' }, { id: 'regioes', label: '🧾 Resumos' }];
      if (better) tl.push({ id: 'questoes', label: '📚 Questões estudadas' });
      tabs(m.body, tl, tab, (id) => { tab = id; draw(); });
      if (better) {
        const inp = U.el('input', { type: 'search', class: 'search', placeholder: '🔎 Buscar no caderno…', value: q });
        inp.addEventListener('input', () => { q = inp.value; drawList(); });
        m.body.appendChild(inp);
      } else m.body.appendChild(U.el('p', { class: 'tip' }, 'Dica: o Caderno Melhorado (Loja) adiciona busca e a aba de questões estudadas.'));
      const listBox = U.el('div', { class: 'nb-list' });
      m.body.appendChild(listBox);
      function match(t) { return !q || U.norm(t).includes(U.norm(q)); }
      function drawList() {
        listBox.innerHTML = '';
        if (tab === 'fichas') {
          D.notebook.forEach((c) => {
            const un = UI.fichaUnlocked(c.id);
            if (!match(c.title + ' ' + c.text)) return;
            const b = U.el('button', { type: 'button', class: 'ficha' + (un ? '' : ' locked') }, [U.el('span', { class: 'f-art' }, un ? c.art : '🔒'), U.el('b', null, c.title), U.el('span', { class: 'tip' }, un ? 'Toque para abrir' : 'Descubra em: ' + D.regionById[c.region].name)]);
            if (un) b.addEventListener('click', () => ficha(c));
            listBox.appendChild(b);
          });
        } else if (tab === 'glossario') {
          D.glossary.forEach((g) => { if (!match(g.term + g.def)) return; listBox.appendChild(U.el('div', { class: 'gl-row' }, [U.el('b', null, g.term + ': '), U.el('span', { html: U.rich(g.def, { noGloss: true }) }), U.el('div', { class: 'tip' }, 'Exemplo: ' + g.ex)])); });
        } else if (tab === 'regioes') {
          D.regions.forEach((r) => { if (!EN.quests.regionComplete(r.id)) { listBox.appendChild(U.el('div', { class: 'gl-row locked' }, '🔒 ' + r.name + ': resumo liberado ao restaurar o cristal.')); return; } if (!match(r.summary)) return; listBox.appendChild(U.el('div', { class: 'gl-row' }, [U.el('b', null, r.medalIcon + ' ' + r.name + ': '), U.el('span', null, r.summary)])); });
        } else if (tab === 'questoes') {
          D.questions.filter((x) => s.q[x.id].done).forEach((x) => {
            if (!match(x.prompt + x.answer)) return;
            const st = s.q[x.id];
            listBox.appendChild(U.el('details', { class: 'q-row' }, [U.el('summary', null, x.id + ' — ' + x.title + ' ' + '★'.repeat(st.stars)), U.el('p', { html: '<b>Pergunta:</b> ' + U.esc(x.prompt) }), U.el('p', { html: '<b>Resposta:</b> ' + U.esc(x.answer) }), U.el('p', { html: '<b>Por quê:</b> ' + U.rich(x.why, { noGloss: true }) }), U.el('p', { class: 'err', html: '⚠️ ' + U.esc(x.err) })]));
          });
          if (!listBox.children.length) listBox.appendChild(U.el('p', { class: 'tip' }, 'Ainda não há questões concluídas.'));
        }
      }
      drawList();
    }
    function ficha(c) {
      const f = UI.modal({ title: c.art + ' ' + c.title, wide: true });
      f.body.appendChild(U.el('div', { class: 'art big' }, c.art));
      f.body.appendChild(U.el('p', { class: 'prompt', html: U.rich(c.text) }));
      f.body.appendChild(U.el('p', { html: '<b>Exemplo:</b> ' + U.rich(c.ex, { noGloss: true }) }));
      f.body.appendChild(U.el('p', { class: 'err', html: '⚠️ <b>Erro comum:</b> ' + U.rich(c.err, { noGloss: true }) }));
      const rq = U.el('div', { class: 'mini-q' }, [U.el('b', null, '❓ Pergunta de revisão: ' + c.review.q)]);
      U.shuffle(c.review.options.map((t, i) => ({ t, ok: i === c.review.ok }))).forEach((o) => {
        const b = UI.btn(o.t, '', () => { b.classList.add(o.ok ? 'right' : 'wrong'); UI.toast(o.ok ? 'Certo! 🎉' : 'Quase! Releia a ficha e tente de novo.'); });
        rq.appendChild(b);
      });
      f.body.appendChild(rq);
      f.setActions([UI.ttsBtn(() => c.title + '. ' + c.text + ' Exemplo: ' + c.ex + ' Erro comum: ' + c.err, true), UI.btn('Fechar', 'pri', () => f.close())]);
    }
    draw();
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };
  UI.fichaUnlocked = function (id) {
    return Object.values(D.lessons).some((l) => (l.notebook || []).includes(id) && EN.quests.lessonDone(l.id));
  };

  /* ------------------------------------------------------------------ TROFÉUS */
  UI.trophies = function () {
    const m = UI.modal({ title: '🏆 Sala de Troféus', wide: true });
    const s = S();
    m.body.appendChild(U.el('h3', null, 'Cristais da Natureza (' + s.crystals.length + '/6)'));
    m.body.appendChild(U.el('div', { class: 'trophy-row' }, D.regions.map((r) => U.el('span', { class: 'crystal' + (s.crystals.includes(r.id) ? ' on' : ''), style: { '--c': r.color }, title: r.crystal }, '💎'))));
    m.body.appendChild(U.el('h3', null, 'Medalhas'));
    const all = D.regions.map((r) => ({ n: r.medal, i: r.medalIcon })).concat([{ n: 'Guardião do EcoNexus', i: '🌟' }, { n: 'Mestre da Restauração', i: '🏵️' }]);
    m.body.appendChild(U.el('div', { class: 'medal-grid' }, all.map((md) => U.el('div', { class: 'medal' + (s.medals.includes(md.n) ? ' on' : '') }, [U.el('span', null, s.medals.includes(md.n) ? md.i : '🔒'), U.el('b', null, md.n)]))));
    const mgT = Object.keys(s.mg).filter((k) => s.mg[k].trophy);
    m.body.appendChild(U.el('h3', null, 'Troféus de minijogos'));
    m.body.appendChild(U.el('p', null, mgT.length ? mgT.map((k) => '🏅 ' + (EN.minigames.names[k] || k)).join('  •  ') : 'Faça 80% ou mais num minijogo para ganhar o troféu dele.'));
    m.body.appendChild(U.el('h3', null, 'Arena Final'));
    m.body.appendChild(U.el('p', null, s.storyDone ? 'Melhor pontuação: ' + Math.round(s.arena.best * 100) + '%' + (s.arena.bonusWon ? ' — prêmio máximo conquistado!' : ' — volte para tentar 70% ou mais e ganhar o prêmio raro.') : 'Ainda não concluída.'));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  };

  /* ------------------------------------------------------------------ JARDIM */
  UI.garden = function (kind) {
    const rare = kind === 'raro';
    const m = UI.modal({ title: rare ? '🌸 Canteiro Secreto' : '🌱 Jardim da Vila', wide: true });
    const s = S();
    const slots = rare ? 4 : 6;
    const arr = rare ? s.gardenRare : s.garden;
    let pick = null;
    function draw() {
      m.body.innerHTML = '';
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Sem pressa: plante e decore como quiser. Sementes: 🌰 ' + s.seeds + ' (cada EcoFragmento encontrado nos mapas vira 1 semente).'));
      const plants = D.plants.filter((p) => (rare ? p.rare : !p.rare)).concat(D.gardenDecor.map((d) => Object.assign({ cost: 0 }, d)));
      const pal = U.el('div', { class: 'plant-pal' });
      plants.forEach((p) => { const b = UI.btn(p.icon + ' ' + p.name + (p.cost ? ' (🌰' + p.cost + ')' : ' (grátis)'), pick === p ? 'pri sm' : 'sm', () => { pick = p; draw(); }); pal.appendChild(b); });
      m.body.appendChild(pal);
      const grid = U.el('div', { class: 'garden-grid' });
      for (let i = 0; i < slots; i++) {
        const cell = U.el('button', { type: 'button', class: 'plot-cell' }, arr[i] || '＋');
        cell.addEventListener('click', () => {
          if (!pick) { if (arr[i]) { arr[i] = null; EN.save.persist(); draw(); } else UI.toast('Escolha uma planta ou decoração acima.'); return; }
          if (pick.cost > s.seeds) { UI.toast('Sementes insuficientes. Procure EcoFragmentos 💎 pelos mapas!'); return; }
          s.seeds -= pick.cost; arr[i] = pick.icon; EN.save.persist('jardim'); EN.audio.play('pickup'); draw();
        });
        grid.appendChild(cell);
      }
      m.body.appendChild(grid);
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Toque num canteiro vazio para plantar. Toque num canteiro ocupado (sem nada escolhido) para limpar.'));
    }
    draw();
    m.setActions([UI.btn('Fechar', 'pri', () => { m.close(); EN.engine.refreshTiles(); })]);
  };

  /* ------------------------------------------------------------------ ÁREA DO RESPONSÁVEL */
  UI.parentGate = function () {
    const a = U.randi(6, 9), b = U.randi(4, 9);
    const m = UI.modal({ title: '👨‍👩‍👦 Área do Responsável/Professor', cls: 'small' });
    m.body.appendChild(U.el('p', { class: 'prompt' }, 'Para entrar, resolva: ' + a + ' × ' + b + ' = ?'));
    const inp = U.el('input', { type: 'number', class: 'num-in', inputmode: 'numeric', 'aria-label': 'Resultado' });
    m.body.appendChild(inp);
    setTimeout(() => inp.focus(), 50);
    const go = () => { if (+inp.value === a * b) { m.close(); UI.parent(); } else { UI.toast('Resultado incorreto.'); inp.value = ''; } };
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
    m.setActions([UI.btn('Cancelar', 'ghost', () => m.close()), UI.btn('Entrar', 'pri', go)]);
  };

  UI.report = function () {
    const s = S(), Q = EN.quests;
    const qs = D.questions;
    const seen = qs.filter((q) => s.q[q.id].seen).length;
    const first = qs.filter((q) => s.q[q.id].done && s.q[q.id].first).length;
    const errors = qs.reduce((a, q) => a + s.q[q.id].errors, 0);
    const attempts = qs.reduce((a, q) => a + s.q[q.id].attempts, 0);
    const conceptErr = Object.keys(s.concepts).map((k) => ({ k, err: s.concepts[k].err, ok: s.concepts[k].ok })).filter((c) => c.err > 0).sort((a, b) => b.err - a.err);
    const conceptName = (k) => { const n = D.notebook.find((c) => c.id === k); return n ? n.title : k; };
    return {
      jogador: s.name, geradoEm: new Date().toLocaleString('pt-BR'),
      cobertura: Q.coverage(),
      questoesVistas: seen, acertosDePrimeira: first, erros: errors, tentativas: attempts,
      dominioGeral: Math.round(Q.overallMastery() * 100),
      regioes: D.regions.map((r) => ({ regiao: r.name, concluida: Q.regionComplete(r.id), dominio: Math.round(Q.mastery(r.id) * 100), desafio: s.regionStats[r.id] && s.regionStats[r.id].challenge !== undefined ? Math.round(s.regionStats[r.id].challenge * 100) : null, recuperacao: !!(s.regionStats[r.id] && s.regionStats[r.id].recovery), tempoAproximado: U.fmtTime(s.time.region[r.id] || 0) })),
      conceitosComDificuldade: conceptErr.slice(0, 8).map((c) => ({ conceito: conceptName(c.k), erros: c.err, acertos: c.ok })),
      questoes: qs.map((q) => ({ id: q.id, vista: s.q[q.id].seen, concluida: s.q[q.id].done, tentativas: s.q[q.id].attempts, acertoDePrimeira: s.q[q.id].first, erros: s.q[q.id].errors, estrelas: s.q[q.id].stars, revisoesCertas: s.q[q.id].reviewOk, revisoesErradas: s.q[q.id].reviewWrong })),
      arena: { concluida: s.storyDone, melhor: Math.round(s.arena.best * 100), tentativas: s.arena.tries },
      revisoesAntesDaProva: s.reviewLog,
      economia: { moedasGanhas: s.earned, moedasGastas: s.spent, saldo: s.coins, xp: s.xp, nivel: EN.eco.level().lvl, itensComprados: s.purchases.map((p) => ({ item: EN.eco.item(p.id).name, preco: p.price, data: new Date(p.t).toLocaleDateString('pt-BR') })) },
      tempoTotal: U.fmtTime(s.time.total)
    };
  };

  UI.parent = function () {
    const m = UI.modal({ title: '👨‍👩‍👦 Relatório de desempenho', wide: true, cls: 'parent' });
    const r = UI.report();
    const box = (t, v) => U.el('div', { class: 'stat' }, [U.el('b', null, String(v)), U.el('span', null, t)]);
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Jogador: ' + r.jogador + ' • Tempo total aproximado: ' + r.tempoTotal + ' • Dados guardados só neste aparelho.'));
    m.body.appendChild(U.el('div', { class: 'stats' }, [box('Cobertura das questões do livro', r.cobertura.done + '/' + r.cobertura.total), box('Questões vistas', r.questoesVistas), box('Acertos de primeira', r.acertosDePrimeira), box('Erros', r.erros), box('Tentativas', r.tentativas), box('Domínio geral', r.dominioGeral + '%')]));
    m.body.appendChild(U.el('h3', null, 'Por região'));
    const tbl = U.el('table', { class: 'tbl' }, [U.el('tr', null, ['Região', 'Concluída', 'Domínio', 'Desafio', 'Recuperação', 'Tempo'].map((h) => U.el('th', null, h)))]);
    r.regioes.forEach((x) => tbl.appendChild(U.el('tr', null, [x.regiao, x.concluida ? 'sim' : 'não', x.dominio + '%', x.desafio === null ? '—' : x.desafio + '%', x.recuperacao ? 'sim' : 'não', x.tempoAproximado].map((v) => U.el('td', null, String(v))))));
    m.body.appendChild(tbl);
    m.body.appendChild(U.el('h3', null, 'Conceitos com dificuldade'));
    m.body.appendChild(U.el('p', null, r.conceitosComDificuldade.length ? r.conceitosComDificuldade.map((c) => c.conceito + ' (' + c.erros + ' erro' + (c.erros > 1 ? 's' : '') + ')').join(' • ') : 'Nenhum erro registrado até agora.'));
    m.body.appendChild(U.el('h3', null, 'Questões do livro'));
    const qt = U.el('table', { class: 'tbl small' }, [U.el('tr', null, ['ID', 'Vista', 'Concluída', 'Tentativas', 'De primeira', 'Estrelas'].map((h) => U.el('th', null, h)))]);
    r.questoes.forEach((x) => qt.appendChild(U.el('tr', null, [x.id, x.vista ? '✔' : '—', x.concluida ? '✔' : '—', x.tentativas, x.acertoDePrimeira ? '✔' : '—', '★'.repeat(x.estrelas)].map((v) => U.el('td', null, String(v))))));
    m.body.appendChild(U.el('details', null, [U.el('summary', null, 'Ver todas as 43 questões'), qt]));
    m.body.appendChild(U.el('h3', null, 'Economia'));
    m.body.appendChild(U.el('p', null, 'Moedas ganhas: ' + r.economia.moedasGanhas + ' • gastas: ' + r.economia.moedasGastas + ' • saldo: ' + r.economia.saldo + ' • XP: ' + r.economia.xp + ' (nível ' + r.economia.nivel + ')'));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Itens comprados: ' + (r.economia.itensComprados.length ? r.economia.itensComprados.map((i) => i.item + ' (' + i.preco + ')').join(', ') : 'nenhum')));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Arena: ' + (r.arena.concluida ? 'concluída, melhor ' + r.arena.melhor + '%' : 'não concluída') + ' • Revisões antes da prova: ' + r.revisoesAntesDaProva.length));
    m.setActions([
      UI.btn('⬇ Exportar .txt', '', () => U.download('relatorio_econexus_' + r.jogador + '.txt', '\ufeff' + UI.reportTxt(r), 'text/plain')),
      UI.btn('⬇ Exportar .json', '', () => U.download('relatorio_econexus_' + r.jogador + '.json', JSON.stringify(r, null, 2), 'application/json')),
      UI.btn('🗑️ Reiniciar progresso', 'danger', async () => {
        if (await UI.confirm('Tem certeza? **Todo o progresso** deste aparelho será apagado.', 'Apagar tudo', 'Cancelar') && await UI.confirm('Última confirmação: apagar o progresso de ' + r.jogador + '?', 'Sim, apagar', 'Cancelar')) { m.close(); EN.game.resetAll(); }
      }),
      UI.btn('Fechar', 'pri', () => m.close())
    ]);
  };
  UI.reportTxt = function (r) {
    const L = [];
    L.push('MISSÃO ECONEXUS — RELATÓRIO DE DESEMPENHO', 'Jogador: ' + r.jogador, 'Gerado em: ' + r.geradoEm, '');
    L.push('Cobertura das questões do livro: ' + r.cobertura.done + '/' + r.cobertura.total);
    L.push('Questões vistas: ' + r.questoesVistas, 'Acertos de primeira: ' + r.acertosDePrimeira, 'Erros: ' + r.erros, 'Tentativas: ' + r.tentativas, 'Domínio geral: ' + r.dominioGeral + '%', 'Tempo total aproximado: ' + r.tempoTotal, '');
    L.push('POR REGIÃO');
    r.regioes.forEach((x) => L.push('- ' + x.regiao + ': ' + (x.concluida ? 'concluída' : 'em andamento') + ', domínio ' + x.dominio + '%, desafio ' + (x.desafio === null ? '—' : x.desafio + '%') + ', recuperação ' + (x.recuperacao ? 'sim' : 'não') + ', tempo ' + x.tempoAproximado));
    L.push('', 'CONCEITOS COM DIFICULDADE');
    (r.conceitosComDificuldade.length ? r.conceitosComDificuldade : [{ conceito: 'nenhum', erros: 0 }]).forEach((c) => L.push('- ' + c.conceito + ': ' + c.erros + ' erro(s)'));
    L.push('', 'QUESTÕES DO LIVRO');
    r.questoes.forEach((x) => L.push(x.id + ' | vista: ' + (x.vista ? 'sim' : 'não') + ' | concluída: ' + (x.concluida ? 'sim' : 'não') + ' | tentativas: ' + x.tentativas + ' | de primeira: ' + (x.acertoDePrimeira ? 'sim' : 'não') + ' | estrelas: ' + x.estrelas));
    L.push('', 'ECONOMIA', 'Moedas ganhas: ' + r.economia.moedasGanhas + ' | gastas: ' + r.economia.moedasGastas + ' | saldo: ' + r.economia.saldo + ' | XP: ' + r.economia.xp + ' | nível: ' + r.economia.nivel);
    r.economia.itensComprados.forEach((i) => L.push('- ' + i.item + ' (' + i.preco + ' moedas, ' + i.data + ')'));
    L.push('', 'ARENA: ' + (r.arena.concluida ? 'concluída, melhor ' + r.arena.melhor + '%' : 'não concluída'), 'Revisões antes da prova: ' + r.revisoesAntesDaProva.length);
    return L.join('\r\n');
  };

  /* ------------------------------------------------------------------ RESUMO DA REGIÃO E CERTIFICADO */
  UI.regionReward = function (r, info) {
    return new Promise((resolve) => {
      const m = UI.modal({ title: '💎 ' + r.crystal + ' restaurado!', wide: true, noClose: true });
      const it = EN.eco.item(r.chest.item);
      m.body.appendChild(U.el('div', { class: 'reward-top' }, [U.el('div', { class: 'big-crystal', style: { '--c': r.color } }, '💎'), U.el('div', null, [U.el('h3', null, r.name), U.el('p', null, 'Medalha: ' + r.medalIcon + ' ' + r.medal), U.el('p', null, 'Estrelas: ' + '★'.repeat(info.stars) + ' (' + info.starsN + '/' + info.starsMax + ')')])]));
      m.body.appendChild(U.el('div', { class: 'chest-box' }, [U.el('b', null, '🎁 Baú da região (conteúdo conhecido, sem sorteio): '), U.el('span', null, '🪙 ' + r.chest.coins + ' EcoMoedas + ' + it.icon + ' ' + it.name + (info.hadItem ? ' (você já tinha: vira +10 moedas)' : ''))]));
      m.body.appendChild(U.el('div', { class: 'cmp' }, [U.el('b', null, 'Recompensas desta região'), U.el('p', null, 'Base garantida (todas as questões concluídas com ajuda): ' + info.base.xp + ' XP e ' + info.base.coins + ' moedas'), U.el('p', null, 'Bônus de desempenho (acertos com menos ajuda): +' + info.bonus.xp + ' XP e +' + info.bonus.coins + ' moedas'), U.el('p', null, 'Domínio da região: ' + Math.round(info.mastery * 100) + '%' + (info.recovery ? ' (com Missão de Recuperação concluída)' : ''))]));
      m.body.appendChild(U.el('div', { class: 'obj-box' }, [U.el('b', null, '📝 O que você aprendeu: '), r.summary]));
      m.setActions([UI.ttsBtn(() => r.summary, true), UI.btn('Continuar ▶', 'pri', () => { m.close(); resolve(); })]);
    });
  };

  UI.certificate = function () {
    return new Promise((resolve) => {
      const s = S();
      const m = UI.modal({ title: '🌟 EcoNexus restaurado!', wide: true, cls: 'cert', noClose: true });
      m.body.appendChild(U.el('div', { class: 'cert-card' }, [
        U.el('div', { class: 'cert-crystals' }, D.regions.map((r) => U.el('span', { class: 'crystal on', style: { '--c': r.color } }, '💎'))),
        U.el('h2', null, 'Certificado'),
        U.el('p', { class: 'cert-name' }, s.name + ' — Guardião do EcoNexus'),
        U.el('p', null, 'restaurou os seis Cristais da Natureza e dissipou a Névoa do Desequilíbrio.'),
        U.el('ul', { class: 'cert-topics' }, D.regions.map((r) => U.el('li', null, r.medalIcon + ' ' + r.name))),
        U.el('p', { class: 'tip' }, new Date().toLocaleDateString('pt-BR'))
      ]));
      m.setActions([
        UI.btn('📝 Revisão antes da prova', 'gold', () => { m.close(); resolve('review'); }),
        UI.btn('📓 Ver meu Caderno do Guardião', '', () => { m.close(); resolve('notebook'); }),
        UI.btn('Continuar explorando ▶', 'pri', () => { m.close(); resolve(null); })
      ]);
    });
  };

  /* ------------------------------------------------------------------ TELA INICIAL */
  UI.title = function () {
    UI.titleOpen = true; sync();
    const t = U.$('#title');
    t.classList.remove('hide');
    const has = EN.save.exists();
    let story = false; try { story = has && JSON.parse(localStorage.getItem('econexus_guardioes_save_v1')).storyDone; } catch (e) { story = false; }
    const box = U.$('#titleBtns'); box.innerHTML = '';
    box.appendChild(UI.btn('✨ Novo jogo', 'pri big', () => EN.game.newGameFlow()));
    const c = UI.btn('▶ Continuar', 'big', () => EN.game.continueGame()); c.disabled = !has; box.appendChild(c);
    if (story) box.appendChild(UI.btn('📝 Revisão antes da prova', 'gold big', () => { EN.game.continueGame(); setTimeout(() => EN.game.reviewMode(), 400); }));
    box.appendChild(UI.btn('👨‍👩‍👦 Área do Responsável', 'ghost', () => { if (!has) { UI.toast('Ainda não há progresso salvo.'); return; } EN.save.load(); UI.parentGate(); }));
    box.appendChild(UI.btn(EN.audio.enabled ? '🔊 Som ligado' : '🔇 Som desligado', 'ghost', (ev) => { EN.audio.setEnabled(!EN.audio.enabled); ev.target.textContent = EN.audio.enabled ? '🔊 Som ligado' : '🔇 Som desligado'; }));
  };
  UI.hideTitle = function () { UI.titleOpen = false; U.$('#title').classList.add('hide'); sync(); };
  UI.askName = function () {
    return new Promise((resolve) => {
      const m = UI.modal({ title: 'Qual é o nome do Guardião?', cls: 'small', noClose: true });
      const inp = U.el('input', { type: 'text', class: 'name-in', value: 'Gabriel', maxlength: 24, 'aria-label': 'Nome do jogador' });
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Escreva seu nome (já deixamos “Gabriel” preenchido).'));
      m.body.appendChild(inp);
      setTimeout(() => { inp.focus(); inp.select(); }, 50);
      const go = () => { m.close(); resolve(inp.value.trim() || 'Gabriel'); };
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
      m.setActions([UI.btn('Começar ▶', 'pri', go)]);
    });
  };

  return UI;
})();
