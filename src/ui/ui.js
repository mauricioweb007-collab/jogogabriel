/* =====================================================================
   src/ui/ui.js — interface compartilhada da plataforma v2:
   pilha de janelas (que pausa o jogo), diálogos curtos com retrato e
   voz, avisos, confirmação, portão dos responsáveis e acessibilidade
   (tamanho do texto, alto contraste, reduzir movimento).
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const U = GG.util;
  const UI = (GG.ui = {});
  const stack = [];
  let dlgOpen = 0;
  UI.portraits = {};
  UI.names = { gaia: 'Gaia', geobot: 'GeoBot', gabriel: 'Gabriel' };
  UI.autoRead = false; // ler automaticamente os diálogos em voz alta

  function layer() {
    let l = document.getElementById('ui-layer');
    if (!l) { l = U.el('div', { id: 'ui-layer' }); document.body.appendChild(l); }
    let t = document.getElementById('toasts');
    if (!t) { t = U.el('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.appendChild(t); }
    return l;
  }
  /** Existe alguma janela/diálogo aberto? (o motor pausa a ação) */
  UI.blocking = () => stack.length > 0 || dlgOpen > 0;
  UI.anyOpen = UI.blocking;

  /* ------------------------------------------------------------ janelas */
  UI.modal = function (opts) {
    const o = opts || {};
    const wrap = U.el('div', { class: 'modal-wrap', role: 'dialog', 'aria-modal': 'true' });
    const box = U.el('div', { class: 'modal ' + (o.cls || '') + (o.wide ? ' wide' : '') });
    const head = U.el('div', { class: 'm-head' }, [o.chips || null, U.el('h2', { class: 'm-title' }, o.title || '')]);
    const body = U.el('div', { class: 'm-body' });
    const actions = U.el('div', { class: 'm-actions' });
    box.appendChild(head); box.appendChild(body); box.appendChild(actions);
    wrap.appendChild(box);
    const m = { el: box, wrap, head, body, actions, closed: false };
    m.setActions = function (btns) { actions.innerHTML = ''; (btns || []).forEach((b) => b && actions.appendChild(b)); };
    m.close = function () {
      if (m.closed) return; m.closed = true;
      wrap.remove(); const i = stack.indexOf(m); if (i >= 0) stack.splice(i, 1);
      document.removeEventListener('keydown', onKey, true);
      if (o.onClose) o.onClose();
    };
    function onKey(ev) {
      if (stack[stack.length - 1] !== m) return;
      if (o.onKey && o.onKey(ev) === true) return;
      if (ev.key === 'Escape' && !o.noClose) { ev.preventDefault(); ev.stopPropagation(); m.close(); }
    }
    if (!o.noClose) {
      const x = U.el('button', { class: 'icon-btn m-close', type: 'button', 'aria-label': 'Fechar', onclick: () => m.close() }, '✕');
      box.appendChild(x);
    }
    document.addEventListener('keydown', onKey, true);
    stack.push(m);
    layer().appendChild(wrap);
    GG.input.clear();
    setTimeout(() => { const f = box.querySelector('.m-actions .btn.pri, .m-actions .btn.go, .m-actions .btn'); if (f && !box.contains(document.activeElement)) f.focus({ preventScroll: true }); }, 30);
    return m;
  };
  UI.btn = function (label, cls, fn, attrs) {
    return U.el('button', Object.assign({ type: 'button', class: 'btn ' + (cls || ''), onclick: (ev) => { GG.audio.sfx('click'); fn && fn(ev); } }, attrs || {}), label);
  };
  UI.closeAll = function () { stack.slice().forEach((m) => m.close()); };

  /* ------------------------------------------------------------ diálogo curto */
  /**
   * Mostra de 1 a 3 balões seguidos (até ~25 palavras cada). who: 'gaia' | 'geobot' | 'gabriel'.
   * Retorna Promise resolvida ao terminar.
   */
  UI.say = function (who, lines) {
    const arr = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    return new Promise((resolve) => {
      layer(); dlgOpen++; GG.input.clear();
      let i = 0;
      const img = U.el('img', { class: 'portrait', alt: UI.names[who] || who });
      const whoEl = U.el('div', { class: 'who' }, UI.names[who] || who);
      const txt = U.el('div', { class: 'txt', 'aria-live': 'polite' });
      const cnt = U.el('span', { class: 'cnt' });
      const next = UI.btn('Continuar ▶', 'pri', () => adv());
      const hear = UI.btn('🔊 Ouvir', 'small', () => GG.tts.speak(U.plain(arr[i])));
      const box = U.el('div', { class: 'dlg', role: 'dialog' }, [img, U.el('div', { style: { flex: '1' } }, [whoEl, txt, U.el('div', { class: 'row' }, [cnt, hear, next])])]);
      const pf = UI.portraits[who]; img.src = pf ? pf() : '';
      document.getElementById('ui-layer').appendChild(box);
      function show() {
        txt.innerHTML = U.rich(arr[i]); cnt.textContent = (i + 1) + '/' + arr.length;
        next.textContent = i < arr.length - 1 ? 'Continuar ▶' : 'Vamos! ▶';
        if (UI.autoRead) GG.tts.speak(U.plain(arr[i]));
      }
      function adv() {
        if (i < arr.length - 1) { i++; show(); return; }
        document.removeEventListener('keydown', key, true); box.remove(); dlgOpen--; GG.tts.stop(); GG.input.clear(); resolve();
      }
      function key(ev) {
        if (stack.length) return;
        if (ev.code === 'Space' || ev.code === 'Enter' || ev.code === 'KeyE') { ev.preventDefault(); ev.stopPropagation(); adv(); }
      }
      document.addEventListener('keydown', key, true);
      show(); setTimeout(() => next.focus({ preventScroll: true }), 30);
    });
  };

  /* ------------------------------------------------------------ avisos e confirmação */
  UI.toast = function (text, kind, ms) {
    layer();
    const t = U.el('div', { class: 'toast ' + (kind || '') , html: U.rich(text) });
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.remove(), ms || 2400);
  };
  UI.confirm = function (text, yes, no) {
    return new Promise((res) => {
      const m = UI.modal({ title: 'Confirmar', cls: 'small', onClose: () => res(false) });
      m.body.appendChild(U.el('p', { html: U.rich(text) }));
      m.setActions([UI.btn(no || 'Não', 'ghost', () => m.close()), UI.btn(yes || 'Sim', 'pri', () => { res(true); m.close(); })]);
    });
  };
  /** Portão simples para adultos: conta de multiplicação. */
  UI.gate = function (title) {
    return new Promise((res) => {
      const a = U.irand(6, 9), b = U.irand(6, 9);
      const m = UI.modal({ title: title || 'Área do responsável', cls: 'small', onClose: () => res(false) });
      const inp = U.el('input', { type: 'number', inputmode: 'numeric', 'aria-label': 'Resultado' });
      m.body.appendChild(U.el('p', null, 'Para entrar, resolva: quanto é ' + a + ' × ' + b + '?'));
      m.body.appendChild(inp);
      const msg = U.el('p', { class: 'tip' }); m.body.appendChild(msg);
      const go = () => { if (Number(inp.value) === a * b) { res(true); m.close(); } else { msg.textContent = 'Resultado incorreto.'; inp.select(); } };
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
      m.setActions([UI.btn('Cancelar', 'ghost', () => m.close()), UI.btn('Entrar', 'pri', go)]);
      setTimeout(() => inp.focus(), 50);
    });
  };

  /* ------------------------------------------------------------ acessibilidade */
  /** cfg: {textSize: 1|1.15|1.3, contrast: bool, reduceMotion: bool} */
  UI.applyA11y = function (cfg) {
    const c = cfg || {};
    document.documentElement.style.setProperty('--fs', String(c.textSize || 1));
    document.body.classList.toggle('hc', !!c.contrast);
    document.body.classList.toggle('rm', !!c.reduceMotion);
    if (GG.engine) GG.engine.reduced = !!c.reduceMotion;
    UI.autoRead = !!c.autoRead;
    GG.audio.setVolumes({ music: c.music == null ? 0.5 : c.music, sfx: c.sfx == null ? 0.7 : c.sfx, voice: c.voice == null ? 0.9 : c.voice });
  };
  /** Painel de configurações reutilizável. cfg é alterado e onChange(cfg) é chamado. */
  UI.settings = function (cfg, onChange, extra) {
    const m = UI.modal({ title: '⚙️ Configurações', wide: true });
    const b = m.body;
    const save = () => { UI.applyA11y(cfg); onChange && onChange(cfg); };
    const seg = (label, key, opts) => {
      const row = U.el('div', { class: 'set-row' }, [U.el('label', null, label)]);
      const s = U.el('div', { class: 'seg', role: 'group', 'aria-label': label });
      opts.forEach(([v, t]) => {
        const bt = U.el('button', { type: 'button', class: cfg[key] === v ? 'on' : '', 'aria-pressed': String(cfg[key] === v), onclick: () => { cfg[key] = v; U.$$('button', s).forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); }); bt.classList.add('on'); bt.setAttribute('aria-pressed', 'true'); save(); } }, t);
        s.appendChild(bt);
      });
      row.appendChild(s); b.appendChild(row);
    };
    const range = (label, key) => {
      const r = U.el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(cfg[key] == null ? 0.7 : cfg[key]), 'aria-label': label });
      r.addEventListener('input', () => { cfg[key] = Number(r.value); save(); });
      b.appendChild(U.el('div', { class: 'set-row' }, [U.el('label', null, label), r]));
    };
    if (extra && extra.top) extra.top(b);
    b.appendChild(U.el('h3', null, 'Leitura e visual'));
    seg('Tamanho do texto', 'textSize', [[1, 'Normal'], [1.15, 'Grande'], [1.3, 'Muito grande']]);
    seg('Alto contraste', 'contrast', [[false, 'Desligado'], [true, 'Ligado']]);
    seg('Reduzir movimento, paralaxe e partículas', 'reduceMotion', [[false, 'Não'], [true, 'Sim']]);
    seg('Ler diálogos automaticamente', 'autoRead', [[false, 'Não'], [true, 'Sim']]);
    b.appendChild(U.el('h3', null, 'Volumes'));
    range('🎵 Música', 'music'); range('🔔 Efeitos', 'sfx'); range('🗣️ Voz (leitura em voz alta)', 'voice');
    if (!GG.tts.supported()) b.appendChild(U.el('p', { class: 'tip' }, 'Este navegador não oferece leitura em voz alta.'));
    b.appendChild(U.el('h3', null, 'Controles'));
    seg('Controles de toque na tela', 'touch', [['auto', 'Automático'], ['on', 'Sempre'], ['off', 'Nunca']]);
    const kb = U.el('div');
    const drawKeys = () => {
      kb.innerHTML = '';
      const bind = GG.input.getBindings();
      GG.input.ACTIONS.forEach((a) => {
        const lab = U.el('span', { class: 'keybind' }, (bind[a] || []).map(GG.input.keyName).join(' / '));
        const bt = UI.btn('Trocar tecla', 'small', () => {
          lab.textContent = 'Aperte uma tecla…';
          GG.input.captureNext((code) => { if (code === 'Escape' && a !== 'pause') { drawKeys(); return; } bind[a] = [code].concat((bind[a] || []).filter((c) => c !== code)).slice(0, 2); GG.input.setBindings(bind); cfg.bindings = bind; save(); drawKeys(); });
        });
        kb.appendChild(U.el('div', { class: 'set-row' }, [U.el('label', null, GG.input.LABELS[a]), lab, bt]));
      });
      kb.appendChild(U.el('div', { class: 'set-row' }, [U.el('span', { class: 'tip' }, 'Controle (gamepad) também funciona: direcional, A pula, X/B interage, Start pausa.'), UI.btn('Restaurar teclas', 'small ghost', () => { GG.input.setBindings(null); cfg.bindings = null; save(); drawKeys(); })]));
    };
    drawKeys(); b.appendChild(kb);
    if (extra && extra.bottom) extra.bottom(b);
    m.setActions([UI.btn('Pronto', 'pri', () => m.close())]);
    return m;
  };
})();
