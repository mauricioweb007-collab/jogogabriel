/* =====================================================================
   src/core/util.js — utilitários compartilhados da plataforma (v2).
   Namespace global GG (Gabriel Games). Não interfere no módulo de
   Ciências (namespace EN), que continua em index.html sem alterações.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const U = (GG.util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.irand = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  /** Gerador pseudoaleatório determinístico (mulberry32). */
  U.rng = function (seed) {
    let s = seed >>> 0;
    return function () { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  /** Normaliza texto para comparação: minúsculas, sem acentos, espaços simples. */
  U.norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%$,.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** **negrito** → <b>, quebras de linha → <br>. Texto sempre escapado. */
  U.rich = (s) => U.esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  U.plain = (s) => String(s || '').replace(/\*\*/g, '');
  U.words = (s) => U.plain(s).split(/\s+/).filter(Boolean).length;
  U.fmtInt = (n) => Number(n).toLocaleString('pt-BR');
  U.fmtTime = function (sec) { sec = Math.round(sec || 0); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); };
  U.fmtDur = function (sec) { sec = Math.round(sec || 0); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h ? h + ' h ' + m + ' min' : m + ' min'; };
  U.today = () => new Date().toISOString().slice(0, 10);

  /** Cria elemento: U.el('div', {class:'x', onclick:fn, html:'..'}, [filhos | texto]). */
  U.el = function (tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(e.dataset, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach((c) => { if (c == null || c === false) return; e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c); });
    return e;
  };
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Baixa um arquivo gerado localmente (relatórios). Nada é enviado a servidor. */
  U.download = function (name, text, mime) {
    const blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  U.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  U.isTouch = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  /** Carrega scripts em sequência (funciona abrindo o arquivo direto, sem servidor). */
  U.loadScripts = function (list) {
    return list.reduce((p, src) => p.then(() => new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Falha ao carregar ' + src));
      document.head.appendChild(s);
    })), Promise.resolve());
  };
})();
