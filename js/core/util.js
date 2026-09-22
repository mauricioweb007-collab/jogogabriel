/* =====================================================================
   Missão EcoNexus: Guardiões dos Biomas
   core/util.js — utilidades gerais (matemática, texto, DOM, eventos)
   Todos os módulos usam o espaço de nomes global EN (sem módulos ES,
   para funcionar abrindo o index.html direto do disco, sem servidor).
   ===================================================================== */
window.EN = window.EN || {};
EN.data = EN.data || {};

EN.util = (function () {
  'use strict';
  const U = {};

  /* ---------- matemática ---------- */
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  /** Embaralha sem alterar o array original (Fisher–Yates). */
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /** Embaralha garantindo (quando possível) uma ordem diferente da original. */
  U.shuffleDiff = function (arr) {
    if (arr.length < 2) return arr.slice();
    let a, tries = 0;
    do { a = U.shuffle(arr); tries++; } while (tries < 12 && a.every((v, i) => v === arr[i]));
    return a;
  };

  /** Gerador pseudoaleatório com semente (mulberry32) — usado nos desenhos. */
  U.seeded = function (seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hash2 = (x, y) => {
    let h = (x * 374761393 + y * 668265263) >>> 0;
    h = (h ^ (h >>> 13)) * 1274126177 >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  /* ---------- texto ---------- */
  /** Normaliza para comparação: minúsculas, sem acentos, sem pontuação. */
  U.norm = (s) => String(s || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9()\-\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  U.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.strip = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  U.fmtTime = function (sec) {
    sec = Math.round(sec || 0);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + String(m).padStart(2, '0') + 'min';
    if (m) return m + 'min ' + String(s).padStart(2, '0') + 's';
    return s + 's';
  };
  U.words = (s) => U.strip(s).split(' ').filter(Boolean).length;

  /**
   * Converte o texto do conteúdo em HTML "rico":
   *  - **palavra** vira destaque;
   *  - termos do glossário viram botões clicáveis (primeira ocorrência).
   */
  U.rich = function (text, opts) {
    opts = opts || {};
    const parts = String(text || '').split('**');
    const used = opts.used || new Set();
    const glossary = (EN.data.glossary || []);
    const L = 'A-Za-zÀ-ÖØ-öø-ÿ';
    function link(plain) {
      let html = U.esc(plain);
      if (opts.noGloss) return html;
      for (const g of glossary) {
        if (used.has(g.id)) continue;
        for (const v of g.variants) {
          const re = new RegExp('(^|[^' + L + '>_"=\\-])(' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=[^' + L + ']|$)', 'i');
          const m = html.match(re);
          if (m && !/<button[^>]*>[^<]*$/.test(html.slice(0, m.index + m[1].length))) {
            const start = m.index + m[1].length;
            html = html.slice(0, start) + '<button type="button" class="gl" data-g="g_' + g.id + '">' + m[2] + '</button>' + html.slice(start + m[2].length);
            used.add(g.id);
            break;
          }
        }
      }
      return html;
    }
    let out = '';
    parts.forEach((p, i) => {
      const h = link(p);
      out += (i % 2 === 1) ? '<b class="hl">' + h + '</b>' : h;
    });
    return out.replace(/\n/g, '<br>');
  };

  /* ---------- DOM ---------- */
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  /** Cria elemento: U.el('div', {class:'x', onclick:fn}, [filhos | 'texto']) */
  U.el = function (tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(e.dataset, v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children !== undefined && children !== null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c === null || c === undefined || c === false) return;
        e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return e;
  };
  U.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  U.isTouch = () => (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window);

  /* ---------- barramento de eventos simples ---------- */
  const handlers = {};
  U.on = (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); };
  U.emit = (ev, data) => { (handlers[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.warn(e); } }); };

  /** Baixa um arquivo gerado localmente (não envia nada para a internet). */
  U.download = function (filename, content, mime) {
    const blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  return U;
})();
