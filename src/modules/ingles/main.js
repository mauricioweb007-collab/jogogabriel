/* =====================================================================
   main.js — GABRIEL E O EXPRESSO DOS SONHOS (Inglês, 4º ano).
   Jogo curto (≈30–40 min), em telas grandes e diretas:
     mapa da linha do trem → ato (explicação → minijogo → questões do
     livro → Bilhete-Palavra) × 3 → Passagem de Volta (revisão final).
   Fluxo de cada questão (ING.ask):
     escrever → 1º erro: explicação do ponto → 2º erro: dica 1 (nº de
     palavras e 1ª letra) → 3º erro: dica 2 (letras embaralhadas ou
     estrutura) → 4º erro: alternativas / cartões de palavras → depois
     de escolher, a criança DIGITA a resposta completa uma vez.
   Pontos para o Nexus: pelo adaptador do manifesto (eventos estáveis).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, ING = window.ING, D = ING.data, C = ING.check, M = ING.mode, SV = ING.save;
  const S = () => SV.S;
  const $ = (id) => document.getElementById(id);
  const APP = () => $('app');
  const A = (ING.app = {});
  const IMG = 'assets/img/';
  const test = () => M.isTest();

  /* ================================================================ utilidades visuais */
  A.img = (name, size, alt) => U.el('img', { class: 'ill', src: IMG + name + '.png', alt: alt || '', width: size || 96, height: size || 96, draggable: 'false', onerror: function () { this.replaceWith(U.el('span', { class: 'ill-miss', style: { width: (size || 96) + 'px', height: (size || 96) + 'px' } }, '🖼️')); } });
  A.imgs = (list, size, alt) => U.el('div', { class: 'ills', role: 'img', 'aria-label': alt || 'Figura' }, (list || []).map((n, i) => A.img(n, i ? Math.round((size || 110) * 0.62) : size || 110)));
  const rich = (s) => ({ html: U.rich(s) });

  /* ---------------------------------------------------------------- voz em inglês (só textos do livro) */
  const EN = (A.en = {});
  EN.voice = () => { try { const vs = speechSynthesis.getVoices(); return vs.find((v) => /^en[-_]US/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null; } catch (e) { return null; } };
  EN.speak = function (text) {
    if (!('speechSynthesis' in window)) { UI.toast('Este navegador não tem leitura em voz alta.'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/_{2,}|___/g, ' blank ').replace(/[●#~]/g, ''));
      u.lang = 'en-US'; u.rate = 0.82; u.volume = GG.audio.vol.voice; const v = EN.voice(); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* sem voz */ }
  };
  A.hear = (text, label) => UI.btn(label || '🔊', 'small ghost hear', () => EN.speak(text), { 'aria-label': 'Ouvir em inglês: ' + text, title: 'Ouvir em inglês' });

  /* ---------------------------------------------------------------- música original do Expresso */
  GG.audio.addSong('expresso', { bpm: 118, wave: 'triangle', lead: 'G4 - B4 D5 - B4 G4 - A4 - C5 E5 D5 - - - G4 - B4 D5 G5 - E5 D5 C5 - A4 - B4 - - -', bass: 'G2 - D3 - G2 - D3 - A2 - E3 - D3 - A2 - G2 - D3 - E3 - B2 - C3 - D3 - G2 - - -', drums: 'k h s h k h s h' });
  GG.audio.addSong('estacao', { bpm: 84, wave: 'triangle', lead: 'E5 - D5 - C5 - G4 - A4 - C5 - D5 - - - E5 - G5 - E5 - D5 - C5 - - - - - - -', bass: 'C3 - - - G2 - - - A2 - - - G2 - - -', drums: '- - h - - - h -' });
  const music = (n) => { try { GG.audio.music(n); } catch (e) { /* sem áudio */ } };

  /* ================================================================ HUD */
  A.hud = function () {
    const h = $('hud'); if (!h) return; h.innerHTML = '';
    const sm = SV.summary();
    h.appendChild(U.el('button', { type: 'button', class: 'hud-brand', onclick: () => A.map(), 'aria-label': 'Voltar ao mapa do Expresso' }, [A.img('locomotiva', 34), U.el('span', { class: 'pix' }, 'Expresso dos Sonhos')]));
    h.appendChild(U.el('div', { class: 'hud-tk', 'aria-label': sm.tickets + ' de 3 Bilhetes-Palavra' }, [1, 2, 3].map((n) => U.el('span', { class: 'tk' + (S().tickets.includes('a' + n) ? ' on' : ''), title: D.acts[n - 1].ticket }, S().tickets.includes('a' + n) ? '🎫' : '▫️'))));
    h.appendChild(U.el('div', { class: 'hud-pct' }, [U.el('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': String(sm.percent), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Progresso' }, U.el('i', { style: { width: sm.percent + '%' } })), U.el('span', null, sm.done + '/' + sm.all)]));
    h.appendChild(U.el('div', { class: 'hud-acts' }, [
      UI.btn('⌨️', 'small ghost', () => OSK.toggle(), { 'aria-label': 'Teclado na tela', title: 'Teclado na tela' }),
      UI.btn('⚙️', 'small ghost', () => A.settings(), { 'aria-label': 'Configurações', title: 'Configurações' }),
      UI.btn('🏠', 'small ghost', () => A.toLauncher(), { 'aria-label': 'Voltar à Central de Missões', title: 'Central de Missões' })
    ]));
  };
  A.settings = function () {
    const cfg = S().settings;
    UI.settings(cfg, () => { SV.persist(); }, null);
  };
  A.toLauncher = function () { SV.persist(); try { speechSynthesis.cancel(); } catch (e) { /* ok */ } if (M.isReplay()) { GG.replay.back('../../../'); return; } location.href = '../../../inicio.html'; };
  const screen = (cls, kids) => { const a = APP(); a.innerHTML = ''; a.className = 'scr ' + (cls || ''); (kids || []).forEach((k) => k && a.appendChild(k)); a.focus({ preventScroll: true }); window.scrollTo(0, 0); A.hud(); return a; };

  /* ================================================================ teclado na tela (opcional) */
  const OSK = (A.osk = { on: false, target: null });
  OSK.build = function () {
    const box = $('osk'); box.innerHTML = '';
    ['qwertyuiop', "asdfghjkl'", 'zxcvbnm?.,'].forEach((row) => box.appendChild(U.el('div', { class: 'osk-row' }, row.split('').map((k) => U.el('button', { type: 'button', class: 'osk-k', onmousedown: (e) => e.preventDefault(), onclick: () => OSK.type(k) }, k)))));
    box.appendChild(U.el('div', { class: 'osk-row' }, [U.el('button', { type: 'button', class: 'osk-k wide', onmousedown: (e) => e.preventDefault(), onclick: () => OSK.type(' ') }, 'espaço'), U.el('button', { type: 'button', class: 'osk-k', onmousedown: (e) => e.preventDefault(), onclick: () => OSK.back(), 'aria-label': 'Apagar' }, '⌫'), U.el('button', { type: 'button', class: 'osk-k', onmousedown: (e) => e.preventDefault(), onclick: () => { const b = U.$('.q-go'); if (b) b.click(); } }, '✔'), U.el('button', { type: 'button', class: 'osk-k', onclick: () => OSK.toggle(false), 'aria-label': 'Fechar teclado' }, '✕')]));
  };
  OSK.toggle = function (v) { OSK.on = v == null ? !OSK.on : v; $('osk').classList.toggle('hide', !OSK.on); document.body.classList.toggle('osk-on', OSK.on); if (OSK.on) OSK.build(); };
  const field = () => (OSK.target && document.body.contains(OSK.target) ? OSK.target : U.$('#app input:not([disabled]), #app textarea:not([disabled])'));
  OSK.type = function (k) { const f = field(); if (!f) return; const s = f.selectionStart == null ? f.value.length : f.selectionStart; f.value = f.value.slice(0, s) + k + f.value.slice(f.selectionEnd == null ? s : f.selectionEnd); f.selectionStart = f.selectionEnd = s + 1; f.dispatchEvent(new Event('input')); };
  OSK.back = function () { const f = field(); if (!f) return; const s = f.selectionStart || f.value.length; if (!s) return; f.value = f.value.slice(0, s - 1) + f.value.slice(f.selectionEnd || s); f.selectionStart = f.selectionEnd = s - 1; };
  document.addEventListener('focusin', (e) => { if (/INPUT|TEXTAREA/.test(e.target.tagName)) OSK.target = e.target; });

  /* ================================================================ registro de resultados */
  /** Registra o resultado de uma questão no save (modo estudo). Melhorar depois nunca piora o tier. */
  A.recordQ = function (q, r, mode) {
    const st = S().q[q.id];
    st.seen = true; st.attempts += r.attempts; st.errors += r.errors; st.hints += r.hints; st.time += r.time || 0;
    st.typed = st.typed.concat(r.typed).slice(-8);
    if (mode === 'review') { if (r.tier === 1) st.reviewOk++; else st.reviewWrong++; }
    else {
      if (!st.done) { st.done = true; st.tier = r.tier; st.first = r.tier === 1; st.alt = r.alt; }
      else if (r.tier < st.tier) { st.tier = r.tier; st.first = st.first || r.tier === 1; }
    }
    SV.persist();
  };

  /* ================================================================ A QUESTÃO */
  /** Mostra a questão e resolve {tier, attempts, errors, hints, alt, typed, time}. opts: {i, n, title, mode} */
  A.ask = function (q, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const st = { attempts: 0, errors: 0, hints: 0, alt: false, phase: 'answer', typed: [], t0: Date.now(), done: false };
      S().q[q.id].seen = true;
      const fb = U.el('div', { class: 'q-fb', 'aria-live': 'polite' });
      const help = U.el('div', { class: 'q-help' });
      const inputs = [];
      let orderList = null;
      /* ---- enunciado */
      const head = U.el('div', { class: 'q-head' }, [
        U.el('span', { class: 'chip' }, '📖 Página ' + q.page),
        U.el('span', { class: 'chip sec' }, q.section),
        U.el('span', { class: 'chip k-' + q.kind }, D.KINDS[q.kind]),
        opts.n ? U.el('span', { class: 'chip cnt' }, (opts.i + 1) + '/' + opts.n) : null,
        test() ? U.el('span', { class: 'chip id' }, q.id) : null
      ]);
      const body = U.el('div', { class: 'q-body' });
      if (q.box) body.appendChild(U.el('div', { class: 'q-box', 'aria-label': 'Caixa de palavras do livro' }, q.box));
      if (q.img) body.appendChild(A.imgs(q.img, 120, 'Figura da questão'));
      const mkInput = (w, i) => {
        const inp = U.el('input', { type: 'text', class: 'q-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': q.input === 'fill' ? 'Lacuna ' + (i + 1) : 'Sua resposta em inglês', size: String(Math.max(6, w)) });
        if (q.input === 'fill') inp.style.width = 'calc(' + Math.max(5, w) + 'ch + 20px)'; // lacunas com a mesma largura: não entregam o tamanho da resposta
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
        inp.addEventListener('input', () => inp.classList.remove('bad', 'good'));
        inputs.push(inp); return inp;
      };
      if (q.input === 'fill') {
        const parts = q.prompt.split('___'); const line = U.el('p', { class: 'q-prompt en', lang: 'en' });
        parts.forEach((p, i) => { line.appendChild(document.createTextNode(p)); if (i < parts.length - 1) line.appendChild(mkInput(13, i)); });
        body.appendChild(U.el('div', { class: 'q-line' }, [line, A.hear(q.prompt)]));
      } else if (q.input === 'order') {
        body.appendChild(U.el('div', { class: 'q-line' }, [U.el('p', { class: 'q-prompt en', lang: 'en' }, q.prompt)]));
        orderList = U.el('ol', { class: 'q-order' });
        let cur = q.items.slice();
        const draw = () => {
          orderList.innerHTML = '';
          cur.forEach((s, i) => {
            const lock = st.locked && st.locked[i];
            orderList.appendChild(U.el('li', { class: lock ? 'lock' : '' }, [
              U.el('span', { class: 'on', lang: 'en' }, s), A.hear(s),
              UI.btn('▲', 'small', () => { if (i > 0) { [cur[i - 1], cur[i]] = [cur[i], cur[i - 1]]; draw(); } }, { 'aria-label': 'Subir: ' + s, disabled: lock || i === 0 || (st.locked && st.locked[i - 1]) ? 'disabled' : null }),
              UI.btn('▼', 'small', () => { if (i < cur.length - 1) { [cur[i + 1], cur[i]] = [cur[i], cur[i + 1]]; draw(); } }, { 'aria-label': 'Descer: ' + s, disabled: lock || i === cur.length - 1 || (st.locked && st.locked[i + 1]) ? 'disabled' : null })
            ]));
          });
        };
        orderList.get = () => cur.slice(); orderList.set = (v) => { cur = v; draw(); }; draw();
        body.appendChild(orderList);
      } else {
        const tag = q.personal ? '💬 ' : q.target ? '✏️ ' : '';
        body.appendChild(U.el('div', { class: 'q-line' }, [U.el('p', { class: 'q-prompt en' + (q.sec === 'GW' || q.sec === 'GM' ? ' letters' : ''), lang: 'en' }, tag + q.prompt), /^(Places|Professions|Picture|Word search)/.test(q.prompt) ? null : A.hear(q.prompt)]));
        if (q.ptWord) body.appendChild(U.el('p', { class: 'tip' }, 'Em português: “' + q.ptWord + '”'));
        body.appendChild(U.el('div', { class: 'q-write' }, [mkInput(q.target || q.personal || q.input === 'text' && C.tokens(q.accept ? q.accept[0] : '').length > 2 ? 34 : 16, 0)]));
      }
      body.appendChild(U.el('p', { class: 'q-pt' }, '🇧🇷 ' + q.pt));
      /* ---- ações */
      const btnHint = UI.btn('💡 Dica', '', () => hint());
      const btnGo = UI.btn('✔ Conferir', 'go q-go', () => go());
      const acts = U.el('div', { class: 'q-acts' }, [btnHint, btnGo]);
      const card = U.el('section', { class: 'qcard', 'aria-label': 'Questão ' + q.id, dataset: { q: q.id } }, [head, body, fb, help, acts]);
      screen('q-scr', [opts.title ? U.el('h2', { class: 'blk-t pix' }, opts.title) : null, card]);
      if (test()) card.appendChild(testTools());
      setTimeout(() => { const f = inputs[0]; if (f && !U.isTouch()) f.focus(); }, 60);
      if (S().settings.osk === 'sempre' || (S().settings.osk === 'auto' && U.isTouch() && inputs.length)) OSK.toggle(true);

      const value = () => (q.input === 'order' ? orderList.get() : q.input === 'fill' ? inputs.map((i) => i.value) : inputs[0].value);
      const say = (html, kind) => { fb.className = 'q-fb ' + (kind || ''); fb.innerHTML = html; };
      function fullModel() { if (q.input === 'fill') { let k = 0; return q.prompt.replace(/___/g, () => q.blanks[k++][0]).replace(/[●#~] /g, ''); } const m = C.model(q); return Array.isArray(m) ? m.join(' ') : m; }

      /* ---- conferir */
      function go() {
        if (st.done) { finish(); return; }
        const v = value();
        if (st.phase === 'copy') {
          const ok = C.norm(v) === C.norm(st.copyOf) || (q.personal && C.check(q, v).ok);
          st.attempts++; st.typed.push({ v: String(v), ok, at: Date.now(), copy: true });
          if (ok) return success(null);
          GG.audio.sfx('bad'); inputs[0].classList.add('bad');
          say('✏️ ' + U.rich(C.diff(v, st.copyOf) || 'Copie exatamente o modelo.') + '<br><span class="mdl">Modelo: <b lang="en">' + U.esc(st.copyOf) + '</b></span>', 'bad');
          return;
        }
        const r = C.check(q, v);
        if (r.empty) { say(U.rich(r.msg || 'Escreva a resposta.'), 'warn'); return; }
        st.attempts++; st.typed.push({ v: Array.isArray(v) ? (q.input === 'order' ? v.map((x) => q.order.indexOf(x) + 1).join(',') : v.join(' | ')) : String(v), ok: r.ok, at: Date.now() });
        if (r.ok) return success(r);
        st.errors++; GG.audio.sfx('bad');
        if (r.parts) r.parts.forEach((p, i) => inputs[i].classList.toggle('bad', !p.ok));
        else inputs.forEach((i) => i.classList.add('bad'));
        let html = '❌ ' + U.rich(r.msg || 'Ainda não.');
        if (st.errors === 1) html += '<div class="why">💡 ' + U.rich(q.why) + '</div>';
        else if (st.errors === 2) { st.hints = Math.max(st.hints, 1); html += '<div class="why">🔎 Dica: ' + U.rich(C.hint(q, 1)) + '</div>'; }
        else if (st.errors === 3) { st.hints = Math.max(st.hints, 2); html += '<div class="why">🔎 Dica: ' + U.rich(C.hint(q, 2)) + '</div>'; }
        else { html += '<div class="why">Vamos juntos: escolha abaixo.</div>'; alternatives(); }
        if (q.input === 'order' && st.errors >= 2) lockOrder();
        say(html, 'bad');
        const f = inputs.find((i) => i.classList.contains('bad')) || inputs[0]; if (f && !U.isTouch()) f.focus();
      }
      function hint() {
        if (st.done) return;
        const lv = Math.min(3, Math.max(st.hints, st.errors >= 3 ? 2 : st.errors >= 2 ? 1 : 0) + 1);
        st.hints = lv;
        if (lv >= 3) { alternatives(); return; }
        if (q.input === 'order') lockOrder();
        say('🔎 Dica ' + lv + ': ' + U.rich(C.hint(q, lv)), 'info');
      }
      function lockOrder() {
        const cur = orderList.get(); st.locked = st.locked || {};
        const k = Math.min(q.order.length, Object.keys(st.locked).length + 2);
        const rest = cur.filter((x) => !q.order.slice(0, k).includes(x));
        q.order.slice(0, k).forEach((_, i) => { st.locked[i] = true; });
        orderList.set(q.order.slice(0, k).concat(rest));
      }
      /* ---- alternativas / cartões (ajuda depois de erros) */
      function alternatives() {
        if (st.alt && help.childNodes.length) return;
        st.alt = true; help.innerHTML = '';
        if (q.input === 'order') { lockOrder(); lockOrder(); lockOrder(); say('🔎 Coloquei as primeiras frases no lugar. Arrume o resto e confira.', 'info'); return; }
        const ops = C.options(q);
        if (ops) {
          help.appendChild(U.el('p', { class: 'tip' }, q.personal ? 'Escolha um modelo e depois escreva a resposta:' : 'Escolha a resposta certa' + (ops.length > 1 ? ' para cada lacuna:' : ':')));
          const chosen = [];
          ops.forEach((list, bi) => {
            const row = U.el('div', { class: 'q-ops', role: 'group', 'aria-label': 'Alternativas' + (ops.length > 1 ? ' da lacuna ' + (bi + 1) : '') });
            list.forEach((o) => row.appendChild(UI.btn(o, 'op', (ev) => {
              const ok = q.personal ? true : q.input === 'fill' ? q.blanks[bi].map(C.norm).includes(C.norm(o)) : q.accept.map(C.norm).includes(C.norm(o));
              if (!ok) { ev.target.classList.add('no'); ev.target.disabled = true; say('❌ **' + U.esc(o) + '** não completa esta frase. Tente outra.'.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'), 'bad'); GG.audio.sfx('bad'); return; }
              U.$$('.op', row).forEach((b) => { b.disabled = true; }); ev.target.classList.add('yes'); GG.audio.sfx('check');
              chosen[bi] = o;
              if (chosen.filter((x) => x != null).length === ops.length) startCopy(q.personal ? o : q.input === 'fill' ? (() => { let k = 0; return q.prompt.replace(/___/g, () => chosen[k++]).replace(/[●#~] /g, ''); })() : o);
            })));
            help.appendChild(row);
          });
        } else {
          // Oficina de frases: cartões de palavras para montar a frase
          const cd = C.cards(q); const built = [];
          const line = U.el('p', { class: 'q-built en', lang: 'en', 'aria-live': 'polite' }, '…');
          const row = U.el('div', { class: 'q-cards', role: 'group', 'aria-label': 'Cartões de palavras' });
          const target = fullModel();
          const redraw = () => { line.textContent = built.length ? built.map((b) => b.w).join(' ') + (built.length === cd.words.length ? cd.end : '') : '…'; };
          cd.words.forEach((w) => { const b = UI.btn(w, 'card', () => { built.push({ w, b }); b.disabled = true; redraw();
            if (built.length === cd.words.length) {
              if (C.norm(built.map((x) => x.w).join(' ')) === C.norm(target)) { GG.audio.sfx('check'); startCopy(target); }
              else { say('A ordem ainda não está certa. Toque em “↩ Desfazer”.', 'bad'); GG.audio.sfx('bad'); }
            } }); row.appendChild(b); });
          help.appendChild(U.el('p', { class: 'tip' }, '🧩 Oficina de frases: toque nas palavras na ordem certa.'));
          help.appendChild(line); help.appendChild(row);
          help.appendChild(UI.btn('↩ Desfazer', 'small ghost', () => { const x = built.pop(); if (x) { x.b.disabled = false; redraw(); } }));
        }
      }
      function startCopy(model) {
        st.phase = 'copy'; st.copyOf = model; help.innerHTML = '';
        body.querySelectorAll('.q-write, .q-copy').forEach((e) => e.remove());
        inputs.forEach((i) => { i.disabled = true; });
        inputs.length = 0;
        const inp = mkInput(Math.min(48, model.length + 4), 0); inp.classList.add('copy');
        body.appendChild(U.el('div', { class: 'q-copy' }, [U.el('p', null, ['✏️ Agora escreva a resposta completa para fixar:']), U.el('p', { class: 'mdl en', lang: 'en' }, [model + ' ', A.hear(model)]), inp]));
        say('Muito bem! Falta só escrever uma vez. ✍️', 'info');
        setTimeout(() => inp.focus(), 40);
      }
      /* ---- acerto */
      function success(r) {
        st.done = true; GG.audio.sfx('ok');
        inputs.forEach((i) => { i.classList.remove('bad'); i.classList.add('good'); i.readOnly = true; });
        const tier = st.alt ? 3 : st.attempts === 1 && st.hints === 0 ? 1 : 2;
        st.tier = tier;
        const praise = tier === 1 ? ['Perfect! 🌟', 'Great job! ⭐', 'Excellent! 🚂'][st.attempts % 3] : tier === 2 ? 'Muito bem! Você conseguiu. 👏' : 'Pronto! Agora você já sabe. 💪';
        const typo = r && r.typo ? '<div class="why">✍️ Atenção à escrita: <b lang="en">' + U.esc(r.typo) + '</b></div>' : '';
        const model = fullModel();
        const showModel = q.personal ? '' : '<div class="mdl">✔ <b lang="en">' + U.esc(q.input === 'order' ? 'Ordem do livro conferida.' : model) + '</b></div>';
        say('<b>' + praise + '</b>' + typo + showModel + (tier > 1 || q.personal ? '<div class="why">' + U.rich(q.why) + '</div>' : ''), 'good');
        if (q.input !== 'order' && !q.personal) fb.appendChild(A.hear(model, '🔊 Ouvir'));
        if (q.personal) fb.appendChild(A.hear(String(value()), '🔊 Ouvir a minha resposta'));
        help.innerHTML = '';
        btnHint.remove(); btnGo.textContent = opts.last ? 'Concluir ▶' : 'Próxima ▶'; btnGo.classList.add('pri'); btnGo.focus();
      }
      function finish() {
        resolve({ tier: st.tier, attempts: st.attempts, errors: st.errors, hints: st.hints, alt: st.alt, typed: st.typed, time: Math.round((Date.now() - st.t0) / 1000) });
      }
      /* ---- ferramentas do modo de teste (só sandbox) */
      function testTools() {
        const box = U.el('details', { class: 'q-test' }, [U.el('summary', null, '🧪 Ferramentas de teste (só sandbox)')]);
        box.appendChild(U.el('p', { class: 'tip' }, 'Aceitas: ' + (q.input === 'fill' ? q.blanks.map((b, i) => (i + 1) + ') ' + b.join(' / ')).join('  ') : q.input === 'order' ? q.order.map((x, i) => (i + 1) + '. ' + x).join(' ') : q.personal ? 'resposta pessoal — ' + C.PERSONAL[q.personal].need.replace(/\*\*/g, '') : q.target ? 'frase com “' + q.target.join('/') + '” (3+ palavras)' : q.accept.join(' / '))));
        box.appendChild(U.el('div', { class: 'row' }, [
          UI.btn('✅ Preencher certo', 'small', () => { const m = q.input === 'fill' ? q.blanks.map((b) => b[0]) : C.model(q); if (q.input === 'order') orderList.set(q.order.slice()); else if (Array.isArray(m)) m.forEach((x, i) => { if (inputs[i]) inputs[i].value = x; }); else inputs[0].value = m; }),
          UI.btn('❌ Preencher errado', 'small', () => { if (q.input === 'order') orderList.set(q.items.slice()); else inputs.forEach((i) => { i.value = 'xyz'; }); }),
          UI.btn('½ Parcial', 'small', () => { const m = fullModel(); if (q.input === 'fill') { inputs.forEach((i, k) => { i.value = k === 0 && q.blanks.length > 1 ? q.blanks[0][0] : q.blanks[k][0].split(' ')[0] === q.blanks[k][0] ? q.blanks[k][0].slice(0, -1) : q.blanks[k][0].split(' ')[0]; }); } else if (inputs[0]) inputs[0].value = String(m).split(' ').filter((w, k) => k !== 2).join(' '); }),
          UI.btn('💡 Próxima dica', 'small', () => hint())
        ]));
        return box;
      }
    });
  };

  /* ================================================================ telas */
  /** Mapa da linha do Expresso: 3 estações + Passagem de Volta. */
  A.map = function () {
    music('estacao');
    const acts = D.acts.map((a, i) => {
      const s = S().acts[a.id]; const open = M.unlockAll || i === 0 || S().acts[D.acts[i - 1].id].done;
      const tot = a.steps.length, pct = s.done ? 100 : Math.round(s.step * 100 / tot);
      return U.el('button', { type: 'button', class: 'st-card' + (open ? '' : ' lock') + (s.done ? ' done' : ''), style: { '--c': a.color }, 'aria-disabled': String(!open), onclick: () => { if (UI.blocking()) return; if (!open) { UI.toast('🔒 Termine a estação anterior para chegar aqui.'); return; } A.runAct(a.id); } }, [
        U.el('div', { class: 'st-n pix' }, String(a.n)), A.img(a.icon, 84), U.el('b', null, a.title), U.el('span', { class: 'st-sub' }, a.sub),
        U.el('div', { class: 'bar' }, U.el('i', { style: { width: pct + '%' } })),
        U.el('span', { class: 'st-st' }, s.done ? '🎫 ' + a.ticket : open ? (s.step ? '▶ Continuar (' + pct + '%)' : '▶ Começar') : '🔒 Bloqueada')
      ]);
    });
    const allT = S().tickets.length >= 3 || M.unlockAll;
    const fin = U.el('button', { type: 'button', class: 'st-card fin' + (allT ? '' : ' lock') + (S().finalDone ? ' done' : ''), 'aria-disabled': String(!allT), onclick: () => { if (UI.blocking()) return; if (!allT) { UI.toast('Junte os 3 Bilhetes-Palavra para a Passagem de Volta.'); return; } A.final(); } }, [
      U.el('div', { class: 'st-n pix' }, '🏁'), A.img('bilhete', 84), U.el('b', null, 'Passagem de Volta'), U.el('span', { class: 'st-sub' }, 'Revisão final (' + D.finalSize + ' desafios)'),
      U.el('span', { class: 'st-st' }, S().finalDone ? '🏆 Concluída' : allT ? '▶ Montar a passagem' : '🔒 ' + S().tickets.length + '/3 bilhetes')]);
    const rail = U.el('div', { class: 'rail' }, [U.el('div', { class: 'rail-track', 'aria-hidden': 'true' }), U.el('div', { class: 'rail-train', 'aria-hidden': 'true' }, [A.img('locomotiva', 64)])].concat(acts).concat([fin]));
    const ex = D.acts.filter((a) => S().acts[a.id].done || M.unlockAll).map((a) => { const L = D.questions.filter((q) => q.act === a.n && !q.core); const d = L.filter((q) => S().q[q.id].done).length; return UI.btn('📚 Extras do livro — ' + a.title + ' (' + d + '/' + L.length + ')', 'small', () => A.extras(a)); });
    const arcOpen = M.unlockAll || D.acts.some((a) => S().acts[a.id].done);
    const tks = [1, 2, 3].reduce((n, w) => n + (((S().arcade || {}).tickets || {})[w] || 0), 0);
    const arcBtn = UI.btn(arcOpen ? '🕹️ Arcade do Expresso — jogos bônus' + (S().finalDone ? ' (tudo liberado!)' : tks ? ' (' + tks + ' 🎟️)' : '') : '🔒 Arcade do Expresso: termine a 1ª estação', arcOpen ? 'pri arc-btn' : 'ghost arc-btn', () => { if (!arcOpen) { UI.toast('Termine uma estação para ganhar um bilhete do Arcade!'); return; } A.arcade(); });
    const extra = U.el('div', { class: 'map-acts' }, [
      arcBtn,
      ex.length ? U.el('div', { class: 'map-ex' }, [U.el('p', { class: 'tip' }, '📚 Opcional: o resto dos exercícios do livro, para treinar mais (valem pontos, mas não são obrigatórios).')].concat(ex)) : null,
      S().finalDone || M.unlockAll ? UI.btn('📝 Revisão rápida (por página, assunto ou tipo)', 'info', () => A.reviewMenu()) : U.el('p', { class: 'tip' }, '📝 A revisão rápida por página e assunto libera quando você terminar a viagem.'),
      UI.btn('📖 Rever a história', 'ghost small', () => A.say(D.story.intro))
    ]);
    screen('map-scr', [U.el('h1', { class: 'map-t pix' }, 'Gabriel e o Expresso dos Sonhos'), U.el('p', { class: 'map-s' }, 'Olá, ' + S().name + '! Escolha a estação. O jogo salva sozinho.'), rail, extra, test() ? A.testPanel() : null]);
    const i = D.acts.findIndex((a) => !S().acts[a.id].done); const tr = U.$('.rail-train'); if (tr) tr.style.setProperty('--pos', String(i < 0 ? 3 : i));
  };
  A.say = (lines) => UI.say('estela', lines);

  /* ---------------------------------------------------------------- explicação */
  A.lesson = function (id) {
    const L = D.lessons[id];
    return new Promise((resolve) => {
      const kids = [U.el('h2', { class: 'pix les-t' }, L.title)];
      if (L.story) {
        const box = U.el('div', { class: 'les-story' });
        let i = 0;
        const next = UI.btn('Continuar a história ▶', 'pri', () => show());
        const show = () => {
          if (i >= L.story.length) { next.remove(); return; }
          const p = L.story[i++];
          box.appendChild(U.el('div', { class: 'les-par' }, [U.el('p', { class: 'en', lang: 'en' }, p), A.hear(p)]));
          if (i >= L.story.length) { next.remove(); box.appendChild(U.el('div', { class: 'les-comic' }, [U.el('b', null, '💬 Story + comics')].concat(L.comics.map((c) => U.el('p', { class: 'en bubble', lang: 'en' }, [c + ' ', A.hear(c)]))))); }
        };
        show(); kids.push(box); kids.push(next);
      }
      // destaca só a palavra que muda (would → Would no começo / would → wouldn't)
      const mark = (t) => U.el('p', { class: 'en', lang: 'en' }, t.split(' ').map((w, i) => (/^would/i.test(w) ? U.el('span', { class: 'w-would' }, w) : w)).reduce((a, x) => a.concat([x, ' ']), []));
      if (L.swap) kids.push(U.el('div', { class: 'les-swap' }, [mark(L.swap[0]), U.el('div', { class: 'arrow', 'aria-hidden': 'true' }, '⬇'), mark(L.swap[1]), A.hear(L.swap.join(' ... '), '🔊 Ouvir')]));
      L.cards.forEach((c) => {
        const k = [U.el('p', rich(c.t))];
        if (c.words) k.push(U.el('div', { class: 'les-words' }, c.words.map(([en, pt, im]) => U.el('div', { class: 'w' }, [im ? A.img(im, 56) : U.el('span', { class: 'w-ic' }, '✨'), U.el('b', { lang: 'en' }, en), U.el('span', null, pt), A.hear(en)]))));
        if (c.ex) k.push(U.el('ul', { class: 'les-ex' }, c.ex.map((e) => U.el('li', null, [U.el('span', { class: 'en', lang: 'en' }, e), ' ', A.hear(e)]))));
        kids.push(U.el('div', { class: 'les-card' }, k));
      });
      kids.push(U.el('div', { class: 'q-acts' }, [UI.btn('Entendi! Vamos praticar ▶', 'go', () => resolve())]));
      screen('les-scr', kids);
    });
  };

  /* ---------------------------------------------------------------- bloco de questões (seção do livro) */
  A.block = async function (act, step, from) {
    const ids = step.q; const s = S().acts[act.id];
    for (let i = from || 0; i < ids.length; i++) {
      s.qi = i; SV.persist();
      const q = D.byId(ids[i]);
      const r = await A.ask(q, { i, n: ids.length, title: 'Ato ' + act.n + ' • ' + step.title, last: i === ids.length - 1 });
      A.recordQ(q, r, 'study');
    }
    s.qi = 0; SV.persist();
  };

  /* ---------------------------------------------------------------- minijogo */
  A.game = async function (id, opt) {
    const def = D.games[id];
    music('expresso');
    const r = await ING.mg.play(id, def, Object.assign({ test: test(), replay: M.isReplay() }, opt || {}));
    const g = (S().mg[id] = S().mg[id] || { plays: 0, best: 0, done: false });
    g.plays++; g.best = Math.max(g.best, r.score | 0); g.done = true; g.last = Date.now();
    SV.persist();
    return r;
  };

  /* ---------------------------------------------------------------- bilhete do ato */
  A.ticket = function (act) {
    return new Promise((resolve) => {
      if (!S().tickets.includes(act.id)) {
        S().tickets.push(act.id);
        // prêmio: 1 bilhete grátis para 1 dos 2 jogos bônus deste mundo (Arcade do Expresso)
        const ar = (S().arcade = S().arcade || { tickets: {}, rec: {} }); ar.tickets[act.n] = (ar.tickets[act.n] || 0) + 1;
      }
      if (!S().rewards.includes(act.reward)) S().rewards.push(act.reward);
      SV.persist(); GG.audio.sfx('win'); music('vitoria');
      const st = D.questions.filter((q) => q.act === act.n && q.core), first = st.filter((q) => S().q[q.id].tier === 1).length;
      screen('tk-scr', [U.el('div', { class: 'ticket', style: { '--c': act.color } }, [
        U.el('div', { class: 'tk-top pix' }, 'BILHETE-PALAVRA ' + act.n + '/3'), A.img(act.icon, 110), U.el('h2', null, act.ticket),
        U.el('p', null, 'Estação ' + act.title + ' concluída!'), U.el('p', { class: 'tip' }, first + ' de ' + st.length + ' questões certas de primeira.')]),
      U.el('div', { class: 'tk-arc' }, [A.img('bilhete', 48), U.el('div', null, [U.el('b', null, '🕹️ Arcade do Mundo ' + act.n + ' liberado!'), U.el('p', { class: 'tip' }, 'Você ganhou 1 bilhete grátis para um jogo bônus (sem perguntas).')])]),
      U.el('div', { class: 'q-acts' }, [UI.btn('🕹️ Jogar o bônus agora', 'info', () => A.arcade({ recompensa: act.n })), UI.btn(act.n < 3 ? 'Voltar ao trem ▶' : 'Montar a Passagem de Volta ▶', 'pri', () => resolve())])]);
      try { GG.bridge.sync({ modules: [window.ING_MANIFEST], collectibles: false }); } catch (e) { GG.errlog && GG.errlog.add('sync', e.message); }
    });
  };

  /* ---------------------------------------------------------------- ato inteiro (continua do passo salvo) */
  A.runAct = async function (actId, fromStep) {
    const act = D.acts.find((a) => a.id === actId); const s = S().acts[actId];
    S().cur = actId;
    if (fromStep != null) { s.step = fromStep; s.qi = 0; }
    SV.persist();
    if (s.step === 0 && s.qi === 0 && fromStep == null) await A.say(act.intro);
    while (s.step < act.steps.length) {
      const step = act.steps[s.step];
      if (step.type === 'lesson') { music('estacao'); await A.lesson(step.id); }
      else if (step.type === 'game') await A.game(step.id);
      else if (step.type === 'block') { music('estacao'); await A.block(act, step, s.qi); }
      else if (step.type === 'ticket') { s.done = true; s.doneAt = s.doneAt || Date.now(); s.step++; SV.persist(); await A.ticket(act); continue; }
      s.step++; s.qi = 0; SV.persist();
    }
    s.step = act.steps.length; SV.persist();
    const nx = D.acts[act.n];
    if (nx && !S().acts[nx.id].done) { S().cur = nx.id; SV.persist(); }
    A.map();
  };

  /* ---------------------------------------------------------------- final: Passagem de Volta */
  A.final = async function () {
    await A.say(D.story.final);
    const all = D.questions.filter((q) => q.input !== 'order' && (q.core || S().q[q.id].done));
    const weak = U.shuffle(all.filter((q) => S().q[q.id].errors > 0 || S().q[q.id].tier >= 2 || !S().q[q.id].done));
    const pick = []; const kinds = {};
    weak.concat(U.shuffle(all)).forEach((q) => { if (pick.length >= D.finalSize || pick.includes(q)) return; if ((kinds[q.kind] || 0) >= 3 && pick.length < D.finalSize - 2) return; kinds[q.kind] = (kinds[q.kind] || 0) + 1; pick.push(q); });
    let ok = 0;
    for (let i = 0; i < pick.length; i++) {
      const r = await A.ask(pick[i], { i, n: pick.length, title: '🏁 Passagem de Volta', last: i === pick.length - 1 });
      A.recordQ(pick[i], r, 'review'); if (r.tier === 1) ok++;
    }
    const f = S().final; f.plays++; f.ok = Math.max(f.ok, ok); f.wrong = pick.length - ok; f.doneAt = f.doneAt || Date.now();
    S().finalDone = true; if (!S().rewards.includes('Skin do Expresso')) S().rewards.push('Skin do Expresso', 'Moldura de caderno');
    SV.persist();
    try { GG.bridge.sync({ modules: [window.ING_MANIFEST], collectibles: false }); } catch (e) { /* ok */ }
    await A.end(ok, pick.length);
  };
  A.end = function (ok, n) {
    return new Promise((resolve) => {
      music('vitoria'); GG.audio.sfx('win');
      screen('end-scr', [U.el('div', { class: 'ticket big' }, [U.el('div', { class: 'tk-top pix' }, 'PASSAGEM DE VOLTA'), U.el('div', { class: 'tk-row' }, D.acts.map((a) => A.img(a.icon, 72))), A.img('trofeu', 110),
        U.el('h2', null, 'Viagem concluída!'), n ? U.el('p', null, ok + ' de ' + n + ' desafios certos de primeira na revisão.') : null,
        U.el('p', { class: 'tip' }, 'Recompensas: ' + S().rewards.join(' • '))]),
      U.el('div', { class: 'q-acts' }, [UI.btn('📝 Revisão rápida', 'info', () => { resolve(); A.reviewMenu(); }), UI.btn('🚂 Voltar ao mapa', 'pri', () => { resolve(); A.map(); })])]);
      A.say(D.story.end);
    });
  };

  /* ---------------------------------------------------------------- Arcade do Expresso (jogos bônus, arcade.html) */
  A.arcade = function (o) {
    SV.persist(); o = o || {};
    const q = Object.assign(test() ? { teste: '1' } : {}, o);
    location.href = 'arcade.html' + (Object.keys(q).length ? '?' + Object.keys(q).map((k) => k + '=' + encodeURIComponent(q[k])).join('&') : '');
  };

  /* ---------------------------------------------------------------- exercícios extras (resto do livro, opcional) */
  A.extras = async function (act) {
    const L = D.questions.filter((q) => q.act === act.n && !q.core && !S().q[q.id].done);
    if (!L.length) { UI.toast('Você já fez todos os extras desta estação! 🌟', 'ok'); return; }
    const take = L.slice(0, 8);
    for (let i = 0; i < take.length; i++) { const r = await A.ask(take[i], { i, n: take.length, title: '📚 Extras — ' + act.title, last: i === take.length - 1 }); A.recordQ(take[i], r, 'study'); }
    UI.toast('Extras salvos! Faltam ' + (L.length - take.length) + ' nesta estação.', 'ok', 3000); A.map();
  };

  /* ---------------------------------------------------------------- revisão rápida (depois de concluir) */
  A.reviewMenu = function () {
    const sel = (label, opts) => { const s = U.el('select', { 'aria-label': label }, opts.map(([v, t]) => U.el('option', { value: v }, t))); return s; };
    const sp = sel('Página', [['', 'Todas as páginas']].concat([...Array(11)].map((_, i) => [String(i + 1), 'Página ' + (i + 1)])));
    const sk = sel('Tipo', [['', 'Todos os tipos']].concat(Object.keys(D.KINDS).map((k) => [k, D.KINDS[k]])));
    const sa = sel('Assunto', [['', 'Todos os assuntos'], ['1', 'Places (Cidade Cósmica)'], ['2', 'Professions (Aeroporto)'], ['3', 'Subjects and dreams (Laboratório)']]);
    const sw = sel('Quais', [['todas', 'Todas'], ['erros', 'Só as que tiveram erro']]);
    const cnt = U.el('p', { class: 'tip' });
    const list = () => D.questions.filter((q) => (!sp.value || q.page === +sp.value) && (!sk.value || q.kind === sk.value) && (!sa.value || q.act === +sa.value) && (sw.value !== 'erros' || S().q[q.id].errors > 0));
    const upd = () => { cnt.textContent = list().length + ' questões neste filtro.'; };
    [sp, sk, sa, sw].forEach((s) => s.addEventListener('change', upd)); upd();
    screen('rev-scr', [U.el('h2', { class: 'pix' }, '📝 Revisão rápida'), U.el('p', null, 'Escolha por página, assunto ou tipo. A revisão não muda seus pontos: é treino.'),
      U.el('div', { class: 'rev-f' }, [sp, sa, sk, sw]), cnt,
      U.el('div', { class: 'q-acts' }, [UI.btn('🚂 Mapa', 'ghost', () => A.map()), UI.btn('▶ Treinar 10', 'go', async () => {
        const L = U.shuffle(list()).slice(0, 10); if (!L.length) { UI.toast('Nenhuma questão neste filtro.'); return; }
        for (let i = 0; i < L.length; i++) { const r = await A.ask(L[i], { i, n: L.length, title: '📝 Revisão', last: i === L.length - 1 }); A.recordQ(L[i], r, 'review'); }
        UI.toast('Revisão concluída! 👏', 'ok'); A.reviewMenu();
      })])]);
  };

  /* ================================================================ modo de teste (Área dos Pais) */
  A.testPanel = function () {
    const sa = U.el('select', { 'aria-label': 'Ato' }, D.acts.map((a) => U.el('option', { value: a.id }, 'Ato ' + a.n + ' — ' + a.title)));
    const sp = U.el('select', { 'aria-label': 'Passo' });
    const fill = () => { sp.innerHTML = ''; D.stepsOf(sa.value).forEach((st, i) => sp.appendChild(U.el('option', { value: String(i) }, (i + 1) + '. ' + (st.type === 'lesson' ? '📘 ' + D.lessons[st.id].title : st.type === 'game' ? '🎮 ' + D.games[st.id].title : st.type === 'ticket' ? '🎫 Bilhete' : '📝 ' + st.title)))); };
    sa.addEventListener('change', fill); fill();
    const sq = U.el('select', { 'aria-label': 'Questão' }, D.questions.map((q) => U.el('option', { value: q.id }, q.id + ' — ' + q.prompt.slice(0, 50))));
    return U.el('details', { class: 'q-test', open: true }, [U.el('summary', null, '🧪 Modo de teste dos pais (sandbox — tudo liberado)'),
      U.el('div', { class: 'row' }, [sa, sp, UI.btn('Ir para o passo', 'small pri', () => A.runAct(sa.value, +sp.value))]),
      U.el('div', { class: 'row' }, [sq, UI.btn('Abrir questão', 'small pri', () => A.single(sq.value))]),
      U.el('div', { class: 'row' }, [
        UI.btn('+1 bilhete', 'small', () => { const a = D.acts.find((x) => !S().tickets.includes(x.id)); if (a) { S().tickets.push(a.id); S().acts[a.id].done = true; SV.persist(); } A.map(); }),
        UI.btn('Zerar bilhetes', 'small', () => { S().tickets = []; D.acts.forEach((a) => { S().acts[a.id].done = false; }); S().finalDone = false; SV.persist(); A.map(); }),
        UI.btn('Tela do bilhete 1', 'small', () => A.ticket(D.acts[0]).then(A.map)), UI.btn('🕹️ Arcade (bônus)', 'small', () => A.arcade()), UI.btn('Tela final', 'small', () => A.end(0, 0)),
        UI.btn('História de abertura', 'small', () => A.say(D.story.intro)),
        UI.btn('♻️ Reiniciar só o sandbox de Inglês', 'small', async () => { if (await UI.confirm('Apagar SOMENTE o sandbox de Inglês? O save real não é tocado.', 'Reiniciar', 'Cancelar')) { SV.reset(); SV.newGame(GG.profile.name()); S().introDone = true; SV.persist(); A.map(); } })
      ])]);
  };
  A.single = async function (id) {
    const q = D.byId(id);
    const r = await A.ask(q, { title: '🧪 Questão ' + id + ' (sandbox)', last: true });
    A.recordQ(q, r, 'study');
    UI.toast('Resultado no sandbox: nível ' + r.tier + ' • ' + r.attempts + ' tentativa(s) • ' + r.hints + ' dica(s)' + (r.alt ? ' • alternativas' : ''), 'ok', 4000);
    A.map();
  };

  /* ================================================================ início */
  async function boot() {
    if (M.blocked) return;
    UI.portraits.estela = () => IMG + 'estrela.png'; UI.names.estela = 'Estela';
    UI.portraits.gabriel = UI.portraits.gabriel || (() => GG.pixel.url ? GG.pixel.url(GG.pixel.front({}), 5) : '');
    if (GG.testMode && GG.testMode.active()) GG.testMode.banner('../../../');
    if (!SV.load()) SV.newGame(GG.profile ? GG.profile.name() : 'Gabriel');
    const nm = GG.profile && GG.profile.name(); if (nm && nm !== 'EXPLORADOR' && M.kind === 'normal') S().name = nm;
    UI.applyA11y(S().settings);
    S().time.sessions++; SV.persist();
    setInterval(() => { if (!document.hidden && S()) { S().time.total += 15; SV.persist(); } }, 15000);
    $('loading') && $('loading').remove();
    if (M.isReplay()) {
      const r = await A.game(M.game, { replay: true });
      if (M.token) GG.replay.push('ingles_' + M.game, r.score, M.token);
      const m = UI.modal({ title: '🕹️ ' + D.games[M.game].title + ' — replay', noClose: true });
      m.body.appendChild(U.el('p', null, 'Resultado: ' + r.score + ' de 100. (Replay vale recorde, não pontos de estudo.)'));
      m.setActions([UI.btn('🕹️ Voltar ao Fliperama', 'pri', () => GG.replay.back('../../../'))]);
      return;
    }
    if (test()) {
      S().introDone = true; SV.persist();
      if (M.question) return A.single(M.question);
      if (M.lesson) { await A.lesson(M.lesson); return A.map(); }
      if (M.game) { const r = await A.game(M.game); UI.toast('Minijogo (sandbox): ' + r.score + '/100', 'ok', 3000); return A.map(); }
      if (M.final) { D.acts.forEach((a) => { if (!S().tickets.includes(a.id)) S().tickets.push(a.id); S().acts[a.id].done = true; }); SV.persist(); return A.final(); }
      if (M.review) return A.reviewMenu();
      if (M.act) return A.runAct(M.act, M.step == null ? 0 : M.step);
      if (M.screen === 'intro') { await A.say(D.story.intro); return A.map(); }
      if (M.screen && /^bilhete-/.test(M.screen)) { await A.ticket(D.acts[+M.screen.slice(-1) - 1]); return A.map(); }
      if (M.screen === 'fim') return A.end(0, 0);
      return A.map();
    }
    if (!S().introDone) { A.map(); await A.say(D.story.intro); S().introDone = true; SV.persist(); A.map(); return; }
    A.map();
  }
  window.addEventListener('DOMContentLoaded', () => { boot().catch((e) => { GG.errlog && GG.errlog.add('ingles', e.message); console.error(e); }); });
})();
