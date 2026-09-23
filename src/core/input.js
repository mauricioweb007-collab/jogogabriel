/* =====================================================================
   src/core/input.js — entrada unificada: teclado (remapeável), toque
   (direcional + botões na tela) e gamepad. As cenas consultam ações:
   left, right, up, down, jump, act, pause.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const IN = (GG.input = {});
  const U = GG.util;

  IN.ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'act', 'pause'];
  IN.LABELS = { left: 'Esquerda', right: 'Direita', up: 'Cima', down: 'Baixo', jump: 'Pular / confirmar', act: 'Interagir / pulso', pause: 'Pausa / menu' };
  IN.DEFAULT = {
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    jump: ['Space', 'KeyK'], act: ['KeyE', 'KeyJ', 'KeyX'], pause: ['Escape', 'KeyP']
  };
  let bind = JSON.parse(JSON.stringify(IN.DEFAULT));
  const held = {}; // ação -> fontes ativas
  const pressedQ = {}; // ação -> pressionada neste quadro
  const touchHeld = {};
  let padPrev = {};
  IN.enabled = true;

  IN.setBindings = function (b) { bind = JSON.parse(JSON.stringify(Object.assign({}, IN.DEFAULT, b || {}))); };
  IN.getBindings = () => JSON.parse(JSON.stringify(bind));
  IN.keyName = function (code) {
    if (!code) return '—';
    return code.replace(/^Key/, '').replace(/^Digit/, '').replace('Arrow', '').replace('Left', '←').replace('Right', '→').replace('Up', '↑').replace('Down', '↓').replace('Space', 'Espaço').replace('Escape', 'Esc');
  };
  function actionsFor(code) { return IN.ACTIONS.filter((a) => (bind[a] || []).includes(code)); }

  let capture = null; // remapeamento: função que recebe o próximo código
  IN.captureNext = (fn) => { capture = fn; };

  window.addEventListener('keydown', (ev) => {
    if (capture) { ev.preventDefault(); const f = capture; capture = null; f(ev.code); return; }
    const tag = (ev.target && ev.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const acts = actionsFor(ev.code);
    if (!acts.length) return;
    if (ev.code === 'Space' || ev.code.startsWith('Arrow')) ev.preventDefault();
    acts.forEach((a) => { if (!held[a]) pressedQ[a] = true; held[a] = true; });
  });
  window.addEventListener('keyup', (ev) => { actionsFor(ev.code).forEach((a) => { held[a] = false; }); });
  window.addEventListener('blur', () => { IN.ACTIONS.forEach((a) => { held[a] = false; touchHeld[a] = false; }); });

  IN.down = (a) => IN.enabled && !!(held[a] || touchHeld[a] || padHeld[a]);
  IN.pressed = (a) => IN.enabled && !!pressedQ[a];
  IN.axisX = () => (IN.down('right') ? 1 : 0) - (IN.down('left') ? 1 : 0);
  IN.axisY = () => (IN.down('down') ? 1 : 0) - (IN.down('up') ? 1 : 0);
  /** Chamado pelo motor ao fim de cada quadro. */
  IN.endFrame = function () { for (const k in pressedQ) pressedQ[k] = false; };
  IN.clear = function () { IN.ACTIONS.forEach((a) => { held[a] = false; touchHeld[a] = false; pressedQ[a] = false; }); };

  /* ------------------------------------------------------------ gamepad */
  const padHeld = {};
  IN.pollPad = function () {
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    const p = Array.from(pads).find((x) => x && x.connected);
    const now = {};
    if (p) {
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0, b = (i) => !!(p.buttons[i] && p.buttons[i].pressed);
      now.left = ax < -0.4 || b(14); now.right = ax > 0.4 || b(15); now.up = ay < -0.4 || b(12); now.down = ay > 0.4 || b(13);
      now.jump = b(0); now.act = b(2) || b(1); now.pause = b(9);
    }
    IN.ACTIONS.forEach((a) => { if (now[a] && !padPrev[a]) pressedQ[a] = true; padHeld[a] = !!now[a]; });
    padPrev = now;
    IN.padConnected = !!p;
  };

  /* ------------------------------------------------------------ toque */
  /** Monta os controles de toque dentro de `host`. layout: 'plat' | 'top' | 'lanes'. */
  IN.buildTouch = function (host) {
    host.innerHTML = '';
    const mk = (cls, act, label, aria) => {
      const b = U.el('button', { type: 'button', class: 'tbtn ' + cls, 'aria-label': aria, dataset: { act } }, label);
      const on = (ev) => { ev.preventDefault(); if (!touchHeld[act]) pressedQ[act] = true; touchHeld[act] = true; b.classList.add('on'); };
      const off = (ev) => { if (ev) ev.preventDefault(); touchHeld[act] = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', (ev) => { try { b.setPointerCapture(ev.pointerId); } catch (e) { /* ok */ } on(ev); });
      b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', () => off());
      b.addEventListener('contextmenu', (ev) => ev.preventDefault());
      return b;
    };
    const pad = U.el('div', { class: 'tpad' }, [
      mk('up', 'up', '▲', 'Cima'), mk('left', 'left', '◀', 'Esquerda'), mk('right', 'right', '▶', 'Direita'), mk('down', 'down', '▼', 'Baixo')
    ]);
    const btns = U.el('div', { class: 'tbtns' }, [mk('b', 'act', 'B', 'Interagir ou disparar pulso'), mk('a', 'jump', 'A', 'Pular ou confirmar')]);
    host.appendChild(pad); host.appendChild(btns);
  };
})();
