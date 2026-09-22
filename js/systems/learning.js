/* =====================================================================
   systems/learning.js — MOTOR PEDAGÓGICO
   • Renderizadores de atividades: múltipla escolha, marcar várias,
     verdadeiro/falso com justificativa, resposta aberta (palavras-chave
     + autoavaliação), ordenar, classificar (arrastar ou tocar), desenhar
     setas, completar frases, cena clicável, colorir setas, contar,
     montar cadeias, simulação do lago; e "pré-atividades": simulação de
     populações (+/–), seguir setas na teia e observar.
   • Fluxo de tentativa: 3 folhas de energia; erro → feedback específico
     e explicação; 2ª tentativa com pista; 3ª em versão guiada; sem
     folhas → microexplicação e versão mais simples. Chute rápido
     repetido → pausa de 4 s com pista. Alternativas embaralhadas a cada
     tentativa, sem alterar o gabarito.
   • Questões do livro, desafios de região, recuperação e revisão.
   ===================================================================== */
EN.learn = (function () {
  'use strict';
  const U = EN.util, D = EN.data;
  const L = {};
  const S = () => EN.save.S;
  const LEVEL = { explorador: { t: 'Explorador', c: 'lv-exp' }, construtor: { t: 'Construtor', c: 'lv-con' }, guardiao: { t: 'Guardião', c: 'lv-gua' } };

  /* ------------------------------------------------------------------ ícones */
  /** Ícone: emoji ou desenho do jogo (#capivara, #cutia). */
  L.icon = function (ic, size) {
    size = size || 34;
    if (ic && ic[0] === '#') {
      const c = document.createElement('canvas');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = size * dpr; c.height = size * dpr; c.className = 'ico-cv';
      c.style.width = size + 'px'; c.style.height = size + 'px';
      const g = c.getContext('2d');
      const big = ic === '#capivara';
      const k = dpr * size / (big ? 44 : 30);
      g.scale(k, k);
      EN.sprites.drawAnimal(g, ic.slice(1), big ? 18 : 13, big ? 34 : 25, 0, {});
      return c;
    }
    return U.el('span', { class: 'ico', style: { fontSize: Math.round(size * 0.8) + 'px' } }, ic || '');
  };
  const nameOf = (nodes, id) => (nodes.find((n) => n.id === id) || {}).t || id;

  /* ------------------------------------------------------------------ grafo (setas) */
  /** Desenha nós e setas num quadro 1000×620 (SVG + botões). */
  function graphBox(nodes, opts) {
    opts = opts || {};
    const box = U.el('div', { class: 'graph' + (opts.tall ? ' tall' : '') });
    const H = opts.tall ? 800 : 620;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 ' + H);
    svg.innerHTML = '<defs>' + ['#2b2d42', '#e04b4b', '#2d7be5', '#222222', '#3aa757', '#e67e22', '#9aa0ad'].map((c, i) =>
      '<marker id="ah' + i + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker>').join('') + '</defs>';
    box.appendChild(svg);
    const btns = {};
    nodes.forEach((n) => {
      const b = U.el('button', { type: 'button', class: 'gnode', style: { left: n.x + '%', top: n.y + '%' }, dataset: { id: n.id } }, [L.icon(n.icon, 30), U.el('span', { class: 'gl-t' }, n.t)]);
      btns[n.id] = b; box.appendChild(b);
    });
    const pos = (id) => { const n = nodes.find((x) => x.id === id); return { x: n.x * 10, y: n.y * H / 100 }; };
    const MARK = { '#2b2d42': 0, '#e04b4b': 1, '#2d7be5': 2, '#222222': 3, '#3aa757': 4, '#e67e22': 5, '#9aa0ad': 6 };
    /** Seta curva de a até b (encurtada para não cobrir os nós). */
    function arrow(a, b, color, bend, extra) {
      const p = pos(a), q = pos(b);
      const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d, r = 62;
      const x1 = p.x + ux * r, y1 = p.y + uy * r, x2 = q.x - ux * r, y2 = q.y - uy * r;
      const mx = (x1 + x2) / 2 - uy * (bend || 0) * 4, my = (y1 + y2) / 2 + ux * (bend || 0) * 4;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2);
      path.setAttribute('stroke', color); path.setAttribute('stroke-width', (extra && extra.w) || 7);
      path.setAttribute('fill', 'none'); path.setAttribute('marker-end', 'url(#ah' + (MARK[color] !== undefined ? MARK[color] : 0) + ')');
      if (extra && extra.dash) path.setAttribute('stroke-dasharray', '14 10');
      if (extra && extra.cls) path.setAttribute('class', extra.cls);
      svg.appendChild(path);
      if (extra && extra.num) {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const lx = 0.25 * x1 + 0.5 * mx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * my + 0.25 * y2;
        t.innerHTML = '<circle cx="' + lx + '" cy="' + ly + '" r="24" fill="#fff" stroke="' + color + '" stroke-width="4"/><text x="' + lx + '" y="' + (ly + 9) + '" text-anchor="middle" font-size="26" font-weight="800" fill="#2b2d42">' + extra.num + '</text>';
        if (extra.onClick) { t.style.cursor = 'pointer'; t.addEventListener('click', extra.onClick); }
        svg.appendChild(t);
      }
      if (extra && extra.onClick) { path.style.cursor = 'pointer'; path.addEventListener('click', extra.onClick); path.setAttribute('pointer-events', 'stroke'); }
      return path;
    }
    function clear() { Array.from(svg.querySelectorAll('path:not(defs path), g')).forEach((p) => { if (!p.closest('defs')) p.remove(); }); }
    return { box, btns, arrow, clear, svg };
  }
  L.teiaDiagram = function (highlight) {
    const G = graphBox(D.TEIA.nodes);
    D.TEIA.edges.forEach(([a, b]) => G.arrow(a, b, b === 'fungos' ? '#9aa0ad' : (highlight && highlight.includes(a + '>' + b) ? '#e67e22' : '#2b2d42'), 0, { w: b === 'fungos' ? 4 : 6, dash: b === 'fungos' }));
    return G.box;
  };

  /* ------------------------------------------------------------------ arrastar/tocar */
  /** Torna um elemento arrastável (mouse e toque). onDrop(alvo) ou onTap(). */
  function draggable(el, targetsSel, onDrop, onTap) {
    let sx = 0, sy = 0, ghost = null, moved = false, id = null;
    el.addEventListener('pointerdown', (ev) => {
      if (el.classList.contains('locked')) return;
      id = ev.pointerId; sx = ev.clientX; sy = ev.clientY; moved = false;
      try { el.setPointerCapture(id); } catch (e) { /* ignora */ }
    });
    el.addEventListener('pointermove', (ev) => {
      if (ev.pointerId !== id) return;
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        moved = true;
        ghost = el.cloneNode(true); ghost.classList.add('ghost');
        const r = el.getBoundingClientRect(); ghost.style.width = r.width + 'px';
        document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
    });
    const end = (ev) => {
      if (ev.pointerId !== id) return; id = null;
      if (ghost) {
        ghost.remove(); ghost = null;
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const tgt = under && under.closest(targetsSel);
        if (tgt) onDrop(tgt);
      } else if (!moved && ev.type === 'pointerup') onTap();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
  function cardEl(t, icon, extraCls) {
    return U.el('div', { class: 'card ' + (extraCls || ''), tabindex: 0, role: 'button' }, [icon ? L.icon(icon, 30) : null, U.el('span', { html: U.rich(t, { noGloss: true }) })]);
  }
  function kbTap(el, fn) { el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } }); }

  /* ------------------------------------------------------------------ RENDERIZADORES */
  const R = {};

  R.mc = function (area, spec, g) {
    let opts = U.shuffle(spec.options);
    if (g.guided >= 1) { const c = opts.filter((o) => o.ok), w = opts.filter((o) => !o.ok); opts = U.shuffle(c.slice(0, 1).concat(w.slice(0, 1))); }
    if (spec.img === 'teia') area.appendChild(L.teiaDiagram());
    let sel = null;
    const wrap = U.el('div', { class: 'opts' });
    const btns = opts.map((o, i) => {
      const b = U.el('button', { type: 'button', class: 'opt' }, [U.el('span', { class: 'opt-k' }, String.fromCharCode(65 + i)), o.icon ? L.icon(o.icon, 28) : null, U.el('span', { html: U.rich(o.t, { noGloss: true }) })]);
      b.addEventListener('click', () => { sel = o; btns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); g.onChange(); });
      wrap.appendChild(b); return b;
    });
    area.appendChild(wrap);
    return {
      ready: () => !!sel,
      check: () => (sel.ok ? { ok: true } : { ok: false, msgs: [sel.fb || 'Essa alternativa não responde à pergunta.'] }),
      mark: (res) => { btns.forEach((b, i) => { if (opts[i] === sel) b.classList.add(res.ok ? 'right' : 'wrong'); }); }
    };
  };

  R.multi = function (area, spec, g) {
    let opts = U.shuffle(spec.options);
    const pre = new Set();
    if (g.guided >= 1) {
      const c = opts.filter((o) => o.ok), w = opts.filter((o) => !o.ok);
      opts = U.shuffle(c.concat(w.slice(0, 1)));
      c.slice(0, Math.max(0, c.length - 1)).forEach((o) => pre.add(o));
    }
    const sel = new Set(pre);
    let bottle = null;
    if (spec.visual === 'bottle') { bottle = U.el('div', { class: 'bottle-vis' }); area.appendChild(bottle); }
    const wrap = U.el('div', { class: 'opts multi' });
    const btns = opts.map((o) => {
      const b = U.el('button', { type: 'button', class: 'opt chk' + (pre.has(o) ? ' sel locked' : '') }, [U.el('span', { class: 'box' }), o.icon ? L.icon(o.icon, 28) : null, U.el('span', { html: U.rich(o.t, { noGloss: true }) })]);
      b.addEventListener('click', () => {
        if (pre.has(o)) return;
        if (sel.has(o)) sel.delete(o); else sel.add(o);
        b.classList.toggle('sel', sel.has(o)); drawBottle(); g.onChange();
      });
      wrap.appendChild(b); return b;
    });
    function drawBottle() { if (!bottle) return; bottle.innerHTML = ''; bottle.appendChild(U.el('div', { class: 'bottle-in' }, [...sel].map((o) => L.icon(o.icon || '•', 26)))); }
    drawBottle();
    area.appendChild(U.el('p', { class: 'tip' }, 'Marque todas as alternativas corretas.'));
    area.appendChild(wrap);
    const totalOk = opts.filter((o) => o.ok).length;
    return {
      ready: () => sel.size > 0,
      check: () => {
        const wrong = [...sel].filter((o) => !o.ok), right = [...sel].filter((o) => o.ok);
        const need = spec.minCorrect ? Math.min(spec.minCorrect, totalOk) : totalOk;
        const msgs = wrong.map((o) => '“' + o.t + '”: ' + (o.fb || 'essa não está correta.'));
        const missing = opts.filter((o) => o.ok && !sel.has(o));
        if (wrong.length === 0 && right.length >= need) {
          return { ok: true, extra: missing.length ? 'Também estava correto: ' + missing.map((o) => '“' + o.t + '”').join('; ') + '.' : '' };
        }
        if (right.length < need) {
          msgs.push('Ainda falta marcar ' + (need - right.length) + ' alternativa(s) correta(s).');
          missing.slice(0, 1).forEach((o) => { if (o.miss) msgs.push('Dica: ' + o.miss); });
        }
        return { ok: false, msgs };
      },
      mark: (res) => { btns.forEach((b, i) => { const o = opts[i]; if (sel.has(o)) b.classList.add(o.ok ? 'right' : 'wrong'); else if (res.ok && o.ok) b.classList.add('right-soft'); }); }
    };
  };

  R.tfj = function (area, spec, g) {
    const parts = [spec.partA, spec.partB];
    const sels = [null, null];
    const allBtns = [];
    parts.forEach((p, pi) => {
      let opts = U.shuffle(p.options);
      if (g.guided >= 1) { const c = opts.filter((o) => o.ok), w = opts.filter((o) => !o.ok); opts = U.shuffle(c.slice(0, 1).concat(w.slice(0, 1))); }
      const sec = U.el('div', { class: 'tfj-part' }, [U.el('h4', { html: (pi === 0 ? '1) ' : '2) ') + U.rich(p.prompt, { noGloss: true }) })]);
      const wrap = U.el('div', { class: 'opts' });
      const btns = opts.map((o) => {
        const b = U.el('button', { type: 'button', class: 'opt' }, U.el('span', { html: U.rich(o.t, { noGloss: true }) }));
        b.addEventListener('click', () => { sels[pi] = o; btns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); g.onChange(); });
        wrap.appendChild(b); allBtns.push([b, o, pi]); return b;
      });
      if (g.guided >= 1 && pi === 0) { const c = opts.findIndex((o) => o.ok); sels[0] = opts[c]; btns[c].classList.add('sel', 'locked'); btns.forEach((b) => { if (b !== btns[c]) b.disabled = true; }); }
      sec.appendChild(wrap); area.appendChild(sec);
    });
    return {
      ready: () => !!(sels[0] && sels[1]),
      check: () => {
        const msgs = [];
        sels.forEach((o) => { if (!o.ok) msgs.push(o.fb || 'Revise esta parte.'); });
        return msgs.length ? { ok: false, msgs } : { ok: true };
      },
      mark: () => { allBtns.forEach(([b, o, pi]) => { if (sels[pi] === o) b.classList.add(o.ok ? 'right' : 'wrong'); }); }
    };
  };

  /** Avalia resposta aberta por grupos de ideias (palavras-chave). */
  L.evalOpen = function (text, spec) {
    const t = ' ' + U.norm(text) + ' ';
    const matched = spec.groups.filter((gr) => gr.kw.some((k) => t.includes(U.norm(k).length > 2 ? U.norm(k) : ' ' + U.norm(k) + ' ')));
    const n = matched.length;
    const level = n >= spec.min ? 'ok' : n >= 1 ? 'partial' : 'none';
    return { matched, n, level };
  };
  R.open = function (area, spec) {
    const ta = U.el('textarea', { class: 'open-in', rows: 4, maxlength: 400, placeholder: spec.placeholder || 'Escreva sua resposta…', 'aria-label': 'Sua resposta' });
    area.appendChild(ta);
    area.appendChild(U.el('p', { class: 'tip' }, 'Escreva com suas palavras. Não precisa ser igual ao livro: o importante são as ideias.'));
    setTimeout(() => { try { ta.focus(); } catch (e) { /* ignora */ } }, 50);
    let onCh = null;
    ta.addEventListener('input', () => onCh && onCh());
    return {
      bind: (fn) => { onCh = fn; },
      ready: () => ta.value.trim().length >= 3,
      value: () => ta.value,
      check: () => {
        const ev = L.evalOpen(ta.value, spec);
        if (ev.level === 'ok') return { ok: true, extra: 'Ideias encontradas na sua resposta: ' + ev.matched.map((m) => m.label.toLowerCase()).join('; ') + '.' };
        if (ev.level === 'partial') return { ok: false, partial: true, ev };
        return { ok: false, msgs: ['Ainda não encontrei as ideias principais na sua resposta. Releia a explicação e tente usar as palavras importantes.'] };
      },
      mark: () => { ta.readOnly = true; }
    };
  };

  R.order = function (area, spec, g) {
    const n = spec.items.length;
    const slots = new Array(n).fill(null);
    const lockN = g.guided >= 1 ? Math.max(0, n - (g.guided >= 2 ? 1 : 2)) : 0;
    for (let i = 0; i < lockN; i++) slots[i] = i;
    let pool = U.shuffleDiff(spec.items.map((_, i) => i).filter((i) => i >= lockN));
    const layout = spec.layout || 'list';
    const slotBox = U.el('div', { class: 'order-slots ' + layout });
    const poolBox = U.el('div', { class: 'pool' });
    let selSlot = null;
    function place(item, si) {
      if (si === undefined || si === null) si = selSlot !== null && slots[selSlot] === null ? selSlot : slots.indexOf(null);
      if (si < 0 || si < lockN) return;
      if (slots[si] !== null) pool.push(slots[si]);
      slots[si] = item; pool = pool.filter((x) => x !== item); selSlot = null; draw(); g.onChange();
    }
    function unplace(si) { if (si < lockN || slots[si] === null) return; pool.push(slots[si]); slots[si] = null; draw(); g.onChange(); }
    function draw() {
      slotBox.innerHTML = ''; poolBox.innerHTML = '';
      const order = layout === 'pyramid' ? [...Array(n).keys()].reverse() : [...Array(n).keys()];
      if (layout === 'pyramid') slotBox.appendChild(U.el('div', { class: 'pyr-lbl' }, '▲ TOPO'));
      order.forEach((si, k) => {
        const it = slots[si] !== null ? spec.items[slots[si]] : null;
        const s = U.el('div', { class: 'slot' + (it ? ' full' : '') + (si < lockN ? ' locked' : '') + (selSlot === si ? ' sel' : ''), dataset: { si }, style: layout === 'pyramid' ? { width: (46 + 54 * (si === 0 ? 1 : (n - si) / n)) + '%' } : {} },
          [U.el('span', { class: 'slot-n' }, layout === 'pyramid' ? (si === 0 ? 'Base' : String(si + 1)) : String(si + 1)), it ? cardEl(it.t, it.icon, 'in') : U.el('span', { class: 'slot-empty' }, 'toque aqui')]);
        s.addEventListener('click', () => { if (slots[si] !== null) unplace(si); else { selSlot = si; draw(); } });
        slotBox.appendChild(s);
        if (layout === 'chain' && k < n - 1) slotBox.appendChild(U.el('span', { class: 'arrow' }, '→'));
      });
      if (layout === 'pyramid') slotBox.appendChild(U.el('div', { class: 'pyr-lbl' }, '▼ BASE'));
      pool.forEach((item) => {
        const it = spec.items[item];
        const c = cardEl(it.t, it.icon);
        draggable(c, '.slot', (tgt) => place(item, +tgt.dataset.si), () => place(item));
        kbTap(c, () => place(item));
        poolBox.appendChild(c);
      });
      if (!pool.length) poolBox.appendChild(U.el('p', { class: 'tip' }, 'Todos posicionados. Confira e toque em Verificar.'));
    }
    area.appendChild(U.el('p', { class: 'tip' }, 'Toque (ou arraste) os cartões para colocá-los em ordem. Toque num cartão já colocado para tirá-lo.'));
    area.appendChild(slotBox); area.appendChild(poolBox);
    draw();
    return {
      ready: () => slots.every((x) => x !== null),
      check: () => {
        const wrong = slots.map((x, i) => (x !== i ? i : -1)).filter((i) => i >= 0);
        if (!wrong.length) return { ok: true };
        const msgs = ['Há ' + wrong.length + ' cartão(ões) fora do lugar (marcados em laranja).'];
        if (layout === 'chain' && slots[0] !== 0) msgs.push('Lembre: a cadeia começa pelo produtor, e a seta aponta para quem come.');
        if (layout === 'pyramid' && slots[0] !== 0) msgs.push('A base da pirâmide é dos produtores: eles têm mais energia.');
        return { ok: false, msgs, wrong };
      },
      mark: (res) => { Array.from(slotBox.querySelectorAll('.slot')).forEach((s) => { const si = +s.dataset.si; s.classList.add(res.ok || !(res.wrong || []).includes(si) ? 'right' : 'wrong'); }); }
    };
  };

  R.classify = function (area, spec, g) {
    const cards = spec.cards.map((c, i) => Object.assign({ i }, c));
    const place = {};
    const lockN = g.guided >= 1 ? Math.max(0, cards.length - (g.guided >= 2 ? 1 : 2)) : 0;
    U.shuffle(cards).slice(0, lockN).forEach((c) => { place[c.i] = c.bin; c.locked = true; });
    let order = U.shuffle(cards.filter((c) => !c.locked).map((c) => c.i));
    let selCard = null;
    const binsBox = U.el('div', { class: 'bins n' + spec.bins.length });
    const poolBox = U.el('div', { class: 'pool' });
    function put(ci, bin) { place[ci] = bin; selCard = null; draw(); g.onChange(); }
    function draw() {
      binsBox.innerHTML = ''; poolBox.innerHTML = '';
      spec.bins.forEach((b) => {
        const bx = U.el('div', { class: 'bin', dataset: { bin: b.id } }, [U.el('div', { class: 'bin-h' }, [L.icon(b.icon, 26), U.el('span', null, b.label)])]);
        bx.addEventListener('click', (ev) => { if (ev.target.closest('.card')) return; if (selCard !== null) put(selCard, b.id); });
        cards.filter((c) => place[c.i] === b.id).forEach((c) => {
          const ce = cardEl(c.t, c.icon, 'in' + (c.locked ? ' locked' : ''));
          ce.dataset.ci = c.i;
          ce.addEventListener('click', () => { if (c.locked) return; delete place[c.i]; order.push(c.i); draw(); g.onChange(); });
          bx.appendChild(ce);
        });
        binsBox.appendChild(bx);
      });
      order.filter((ci) => place[ci] === undefined).forEach((ci) => {
        const c = cards[ci];
        const ce = cardEl(c.t, c.icon, selCard === ci ? 'sel' : '');
        draggable(ce, '.bin', (tgt) => put(ci, tgt.dataset.bin), () => { selCard = selCard === ci ? null : ci; draw(); });
        kbTap(ce, () => { selCard = ci; draw(); });
        poolBox.appendChild(ce);
      });
      if (!order.some((ci) => place[ci] === undefined)) poolBox.appendChild(U.el('p', { class: 'tip' }, 'Todos os cartões foram colocados.'));
    }
    area.appendChild(U.el('p', { class: 'tip' }, 'Toque num cartão e depois no grupo certo (ou arraste). Toque num cartão já colocado para devolvê-lo.'));
    area.appendChild(poolBox); area.appendChild(binsBox);
    draw();
    return {
      ready: () => cards.every((c) => place[c.i] !== undefined),
      check: () => {
        const wrong = cards.filter((c) => place[c.i] !== c.bin);
        if (!wrong.length) return { ok: true };
        const msgs = ['Há ' + wrong.length + ' cartão(ões) no grupo errado (em laranja).'].concat(wrong.filter((c) => c.fb).slice(0, 2).map((c) => '“' + c.t + '”: ' + c.fb));
        return { ok: false, msgs, wrongIds: wrong.map((c) => c.i) };
      },
      mark: (res) => { Array.from(binsBox.querySelectorAll('.card')).forEach((ce) => { const ci = +ce.dataset.ci; ce.classList.add((res.wrongIds || []).includes(ci) ? 'wrong' : 'right'); }); }
    };
  };

  R.arrows = function (area, spec, g) {
    const req = new Set(spec.edges.map(([a, b]) => a + '>' + b));
    const drawn = new Set();
    const locked = new Set();
    if (g.guided >= 1) spec.edges.slice(0, Math.max(0, spec.edges.length - 1)).forEach(([a, b]) => { drawn.add(a + '>' + b); locked.add(a + '>' + b); });
    const G = graphBox(spec.nodes, { tall: spec.nodes.length > 3 });
    const list = U.el('div', { class: 'edge-list' });
    let from = null;
    const nm = (id) => nameOf(spec.nodes, id);
    function draw() {
      G.clear();
      drawn.forEach((k) => { const [a, b] = k.split('>'); G.arrow(a, b, locked.has(k) ? '#3aa757' : '#2b2d42', drawn.has(b + '>' + a) ? 10 : 0, { onClick: () => { if (!locked.has(k)) { drawn.delete(k); draw(); g.onChange(); } } }); });
      Object.values(G.btns).forEach((b) => b.classList.toggle('sel', b.dataset.id === from));
      list.innerHTML = '';
      if (!drawn.size) list.appendChild(U.el('p', { class: 'tip' }, 'Nenhuma seta ainda. Toque na ORIGEM e depois no DESTINO.'));
      drawn.forEach((k) => {
        const [a, b] = k.split('>');
        const it = U.el('span', { class: 'edge-chip' + (locked.has(k) ? ' locked' : '') }, [nm(a) + ' → ' + nm(b) + ' ', locked.has(k) ? null : U.el('button', { type: 'button', class: 'x', 'aria-label': 'remover seta', onclick: () => { drawn.delete(k); draw(); g.onChange(); } }, '✖')]);
        list.appendChild(it);
      });
    }
    Object.values(G.btns).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (from === null) from = id;
      else if (from === id) from = null;
      else { const k = from + '>' + id; if (drawn.has(k)) { if (!locked.has(k)) drawn.delete(k); } else drawn.add(k); from = null; g.onChange(); }
      draw();
    }));
    area.appendChild(U.el('p', { class: 'tip' }, 'Para desenhar uma seta: toque no ser/ponto de ORIGEM e depois no de DESTINO. Toque numa seta para apagá-la.'));
    area.appendChild(G.box); area.appendChild(list);
    draw();
    return {
      ready: () => drawn.size > 0,
      check: () => {
        const extra = [...drawn].filter((k) => !req.has(k));
        const missing = [...req].filter((k) => !drawn.has(k));
        if (!extra.length && !missing.length) return { ok: true };
        const msgs = [];
        extra.forEach((k) => {
          const [a, b] = k.split('>');
          msgs.push(req.has(b + '>' + a) ? 'A seta ' + nm(a) + ' → ' + nm(b) + ' está invertida. Ela deve sair de ' + nm(b) + ' e apontar para ' + nm(a) + '.' : 'A ligação ' + nm(a) + ' → ' + nm(b) + ' não faz parte do esquema.');
        });
        if (missing.length) msgs.push('Ainda falta(m) ' + missing.length + ' seta(s).');
        return { ok: false, msgs: msgs.slice(0, 4), extra };
      },
      mark: (res) => { if (!res.ok) (res.extra || []).forEach((k) => { const [a, b] = k.split('>'); G.arrow(a, b, '#e67e22', 0, { w: 9 }); }); else { G.clear(); drawn.forEach((k) => { const [a, b] = k.split('>'); G.arrow(a, b, '#3aa757', drawn.has(b + '>' + a) ? 10 : 0); }); } }
    };
  };

  R.fill = function (area, spec, g) {
    const parts = spec.text.split(/\{(\d+)\}/);
    const n = spec.answers.length;
    const filled = new Array(n).fill(null);
    const lockN = g.guided >= 1 ? n - 1 : 0;
    for (let i = 0; i < lockN; i++) filled[i] = spec.answers[i];
    let bank = g.guided >= 1 ? U.shuffle([spec.answers[n - 1], (spec.bank || [])[0]].filter(Boolean)) : U.shuffle(spec.answers.concat(spec.bank || []));
    let selBlank = null;
    const sent = U.el('p', { class: 'fill-text' });
    const bankBox = U.el('div', { class: 'bank' });
    function draw() {
      sent.innerHTML = '';
      parts.forEach((p, i) => {
        if (i % 2 === 0) { sent.appendChild(document.createTextNode(p)); return; }
        const bi = +p;
        const b = U.el('button', { type: 'button', class: 'blank' + (filled[bi] ? ' full' : '') + (bi < lockN ? ' locked' : '') + (selBlank === bi ? ' sel' : ''), dataset: { bi } }, filled[bi] || '_____');
        b.addEventListener('click', () => { if (bi < lockN) return; if (filled[bi]) { bank.push(filled[bi]); filled[bi] = null; } else selBlank = bi; draw(); g.onChange(); });
        sent.appendChild(b);
      });
      bankBox.innerHTML = '';
      bank.forEach((w, wi) => {
        const b = U.el('button', { type: 'button', class: 'word' }, w);
        b.addEventListener('click', () => {
          const bi = selBlank !== null && !filled[selBlank] ? selBlank : filled.indexOf(null);
          if (bi < 0) return;
          filled[bi] = w; bank.splice(wi, 1); selBlank = null; draw(); g.onChange();
        });
        bankBox.appendChild(b);
      });
    }
    area.appendChild(U.el('p', { class: 'tip' }, 'Toque numa palavra para colocá-la no próximo espaço. Toque num espaço preenchido para tirar a palavra.'));
    area.appendChild(sent); area.appendChild(bankBox);
    draw();
    return {
      ready: () => filled.every(Boolean),
      check: () => {
        const wrong = filled.map((w, i) => (U.norm(w) === U.norm(spec.answers[i]) ? -1 : i)).filter((i) => i >= 0);
        return wrong.length ? { ok: false, msgs: ['Há ' + wrong.length + ' espaço(s) com a palavra errada (em laranja).'], wrong } : { ok: true };
      },
      mark: (res) => { Array.from(sent.querySelectorAll('.blank')).forEach((b) => b.classList.add((res.wrong || []).includes(+b.dataset.bi) ? 'wrong' : 'right')); }
    };
  };

  R.hotspot = function (area, spec, g) {
    let items = spec.items.slice();
    const pre = new Set();
    if (g.guided >= 1) {
      const c = items.filter((i) => i.ok), w = items.filter((i) => !i.ok);
      items = c.concat(w.slice(0, 1));
      c.slice(0, c.length - 1).forEach((i) => pre.add(i.id));
    }
    const sel = new Set(pre);
    const scene = U.el('div', { class: 'scene' });
    const btns = items.map((it) => {
      const b = U.el('button', { type: 'button', class: 'hot' + (pre.has(it.id) ? ' sel locked' : ''), style: { left: it.x + '%', top: it.y + '%' } }, [L.icon(it.icon, 38), U.el('span', null, it.t)]);
      b.addEventListener('click', () => { if (pre.has(it.id)) return; if (sel.has(it.id)) sel.delete(it.id); else sel.add(it.id); b.classList.toggle('sel', sel.has(it.id)); g.onChange(); });
      scene.appendChild(b); return b;
    });
    area.appendChild(U.el('p', { class: 'tip' }, 'Toque em todos os itens certos da cena. Toque de novo para desmarcar.'));
    area.appendChild(scene);
    return {
      ready: () => sel.size > 0,
      check: () => {
        const wrong = items.filter((i) => sel.has(i.id) && !i.ok);
        const miss = items.filter((i) => i.ok && !sel.has(i.id));
        if (!wrong.length && !miss.length) return { ok: true };
        const msgs = wrong.map((i) => '“' + i.t + '”: ' + (i.fb || 'não é um item certo aqui.'));
        if (miss.length) msgs.push('Ainda falta(m) ' + miss.length + ' item(ns) certo(s) na cena.');
        return { ok: false, msgs };
      },
      mark: () => { btns.forEach((b, k) => { const it = items[k]; if (sel.has(it.id)) b.classList.add(it.ok ? 'right' : 'wrong'); }); }
    };
  };

  R.color = function (area, spec, g) {
    const col = {};
    const lockN = g.guided >= 1 ? Math.max(0, spec.arrows.length - (g.guided >= 2 ? 1 : 2)) : 0;
    const lockedIds = new Set(U.shuffle(spec.arrows).slice(0, lockN).map((a) => a.id));
    spec.arrows.forEach((a) => { if (lockedIds.has(a.id)) col[a.id] = a.color; });
    let cur = spec.colors[0].id;
    const cssOf = (id) => (spec.colors.find((c) => c.id === id) || {}).css || '#9aa0ad';
    const pal = U.el('div', { class: 'palette' });
    const G = graphBox(spec.nodes, { tall: true });
    const list = U.el('div', { class: 'arrow-list' });
    function setColor(a) { if (lockedIds.has(a.id)) return; col[a.id] = cur; draw(); g.onChange(); }
    function draw() {
      pal.innerHTML = '';
      spec.colors.forEach((c) => {
        const b = U.el('button', { type: 'button', class: 'pal' + (cur === c.id ? ' sel' : ''), style: { '--c': c.css } }, [U.el('span', { class: 'sw' }), c.label]);
        b.addEventListener('click', () => { cur = c.id; draw(); });
        pal.appendChild(b);
      });
      G.clear();
      spec.arrows.forEach((a, i) => G.arrow(a.from, a.to, col[a.id] ? cssOf(col[a.id]) : '#9aa0ad', a.bend || 0, { num: i + 1, w: col[a.id] ? 8 : 5, dash: !col[a.id], onClick: () => setColor(a) }));
      list.innerHTML = '';
      spec.arrows.forEach((a, i) => {
        const b = U.el('button', { type: 'button', class: 'arrow-item' + (lockedIds.has(a.id) ? ' locked' : ''), dataset: { id: a.id }, style: { '--c': col[a.id] ? cssOf(col[a.id]) : 'transparent' } },
          [U.el('b', null, String(i + 1)), U.el('span', null, a.label + ' (' + nameOf(spec.nodes, a.from) + ' → ' + nameOf(spec.nodes, a.to) + ')'), U.el('span', { class: 'sw' })]);
        b.addEventListener('click', () => setColor(a));
        list.appendChild(b);
      });
    }
    area.appendChild(U.el('p', { class: 'tip' }, 'Escolha uma cor e toque nas setas (no desenho ou na lista numerada).'));
    area.appendChild(pal); area.appendChild(G.box); area.appendChild(list);
    draw();
    return {
      ready: () => spec.arrows.every((a) => col[a.id]),
      check: () => {
        const wrong = spec.arrows.filter((a) => col[a.id] !== a.color);
        return wrong.length ? { ok: false, msgs: ['Há ' + wrong.length + ' seta(s) com a cor errada (em laranja na lista).', 'Leia o nome da seta: água → azul; gás carbônico → vermelho; gás oxigênio → preto.'], wrong: wrong.map((a) => a.id) } : { ok: true };
      },
      mark: (res) => { Array.from(list.querySelectorAll('.arrow-item')).forEach((b) => b.classList.add((res.wrong || []).includes(b.dataset.id) ? 'wrong' : 'right')); }
    };
  };

  R.numbers = function (area, spec, g) {
    const vals = spec.rows.map(() => spec.min || 0);
    const lockN = g.guided >= 1 ? spec.rows.length - 1 : 0;
    const lockIdx = new Set(U.shuffle(spec.rows.map((_, i) => i)).slice(0, lockN));
    lockIdx.forEach((i) => { vals[i] = spec.rows[i].answer; });
    if (spec.picture === 'pyramid') {
      const pyr = U.el('div', { class: 'pyramid-pic' });
      spec.rows.forEach((r, i) => pyr.appendChild(U.el('div', { class: 'pyr-row', style: { width: (30 + 70 * (i + 1) / spec.rows.length) + '%' } }, [U.el('span', { class: 'pyr-n' }, String(spec.rows.length - i)), U.el('span', { class: 'pyr-ic' }, new Array(r.answer).fill(r.icon).join(''))])));
      area.appendChild(pyr);
    }
    const rows = U.el('div', { class: 'num-rows' });
    const els = spec.rows.map((r, i) => {
      const v = U.el('output', { class: 'num-v' }, String(vals[i]));
      const mk = (d, lab) => U.el('button', { type: 'button', class: 'num-b', 'aria-label': lab, disabled: lockIdx.has(i) || undefined, onclick: () => { vals[i] = U.clamp(vals[i] + d, spec.min || 0, spec.max || 20); v.textContent = vals[i]; g.onChange(); } }, d < 0 ? '−' : '+');
      const row = U.el('div', { class: 'num-row' + (lockIdx.has(i) ? ' locked' : '') }, [U.el('div', { class: 'num-lbl' }, [spec.picture ? null : U.el('span', { class: 'num-ic' }, r.icon), U.el('span', null, r.t)]), U.el('div', { class: 'num-ctl' }, [mk(-1, 'menos'), v, mk(1, 'mais')])]);
      rows.appendChild(row); return row;
    });
    area.appendChild(rows);
    let touched = false;
    const origChange = g.onChange; g.onChange = () => { touched = true; origChange(); };
    return {
      ready: () => touched || lockN > 0,
      check: () => {
        const wrong = spec.rows.map((r, i) => (vals[i] !== r.answer ? i : -1)).filter((i) => i >= 0);
        return wrong.length ? { ok: false, msgs: ['Há ' + wrong.length + ' número(s) diferente(s) do esperado.', spec.picture ? 'Conte figura por figura, andar por andar.' : 'Conte os seres vivos, não as setas.'], wrong } : { ok: true };
      },
      mark: (res) => { els.forEach((e, i) => e.classList.add((res.wrong || []).includes(i) ? 'wrong' : 'right')); }
    };
  };

  function validChains(spec) {
    const out = [];
    const eats = spec.eats;
    const walk = (chain) => {
      const last = chain[chain.length - 1];
      const next = eats.filter(([a]) => a === last).map(([, b]) => b);
      if (chain.length >= spec.minLen) out.push(chain.slice());
      next.forEach((b) => { if (!chain.includes(b)) walk(chain.concat(b)); });
    };
    spec.organisms.filter((o) => o.producer).forEach((o) => walk([o.id]));
    return out;
  }
  R.chainbuild = function (area, spec, g) {
    const orgs = spec.organisms;
    const nm = (id) => nameOf(orgs.map((o) => ({ id: o.id, t: o.t })), id);
    const saved = [];
    let cur = [];
    const valid = validChains(spec);
    if (g.guided >= 1 && valid.length) {
      saved.push({ c: valid[0], locked: true });
      if (g.guided >= 2 && spec.need > 1) { const other = valid.find((v) => v[0] !== valid[0][0]) || valid[1]; if (other) cur = other.slice(0, 2); }
    }
    const scene = U.el('div', { class: 'org-grid' });
    const curBox = U.el('div', { class: 'chain-cur' });
    const savedBox = U.el('div', { class: 'chain-saved' });
    const ctl = U.el('div', { class: 'chain-ctl' });
    U.shuffle(orgs).forEach((o) => {
      const b = U.el('button', { type: 'button', class: 'org' }, [L.icon(o.icon, 34), U.el('span', null, o.t)]);
      b.addEventListener('click', () => { if (cur.includes(o.id)) return; cur.push(o.id); draw(); });
      scene.appendChild(b);
    });
    const bUndo = U.el('button', { type: 'button', class: 'btn sm' }, '↶ Desfazer');
    const bSave = U.el('button', { type: 'button', class: 'btn sm pri' }, '✔ Guardar esta cadeia');
    bUndo.addEventListener('click', () => { cur.pop(); draw(); });
    bSave.addEventListener('click', () => { if (cur.length >= 2) { saved.push({ c: cur.slice() }); cur = []; draw(); g.onChange(); } });
    ctl.appendChild(bUndo); ctl.appendChild(bSave);
    function chainTxt(c) { return c.map((id) => { const o = orgs.find((x) => x.id === id); return o.icon[0] === '#' ? o.t : o.icon + ' ' + o.t; }).join('  →  '); }
    function draw() {
      curBox.innerHTML = '';
      curBox.appendChild(U.el('b', null, 'Cadeia em construção: '));
      curBox.appendChild(U.el('span', null, cur.length ? chainTxt(cur) : 'toque nos seres, do alimento para quem come…'));
      bSave.disabled = cur.length < 2;
      savedBox.innerHTML = '';
      savedBox.appendChild(U.el('b', null, 'Cadeias guardadas (' + saved.length + '/' + spec.need + '):'));
      saved.forEach((s, i) => savedBox.appendChild(U.el('div', { class: 'chain-row' + (s.locked ? ' locked' : ''), dataset: { i } }, [U.el('span', null, chainTxt(s.c)), s.locked ? null : U.el('button', { type: 'button', class: 'x', onclick: () => { saved.splice(i, 1); draw(); g.onChange(); } }, '✖')])));
    }
    area.appendChild(U.el('p', { class: 'tip' }, 'Toque nos seres na ordem “alimento → quem come” e guarde a cadeia. Monte ' + spec.need + ' cadeia(s) com pelo menos ' + spec.minLen + ' seres.'));
    area.appendChild(scene); area.appendChild(curBox); area.appendChild(ctl); area.appendChild(savedBox);
    draw();
    return {
      ready: () => saved.length >= spec.need,
      check: () => {
        const msgs = []; const bad = [];
        const seenKeys = new Set();
        saved.forEach((s, i) => {
          const c = s.c; const key = c.join('>');
          const o0 = orgs.find((o) => o.id === c[0]);
          if (seenKeys.has(key)) { msgs.push('Duas cadeias estão iguais. Monte cadeias diferentes.'); bad.push(i); return; }
          seenKeys.add(key);
          if (c.length < spec.minLen) { msgs.push('A cadeia “' + chainTxt(c) + '” é curta: use pelo menos ' + spec.minLen + ' seres.'); bad.push(i); return; }
          if (!o0.producer) { msgs.push('A cadeia “' + chainTxt(c) + '” começa por um animal. Toda cadeia começa por um produtor.'); bad.push(i); return; }
          for (let k = 1; k < c.length; k++) {
            if (!spec.eats.some(([a, b]) => a === c[k - 1] && b === c[k])) { msgs.push('Na cena, ' + nm(c[k - 1]).toLowerCase() + ' não serve de alimento para ' + nm(c[k]).toLowerCase() + '.'); bad.push(i); return; }
          }
        });
        return bad.length ? { ok: false, msgs: msgs.slice(0, 3), bad } : { ok: true, extra: 'Exemplos possíveis: ' + valid.slice(0, 3).map(chainTxt).join(' | ') };
      },
      mark: (res) => { Array.from(savedBox.querySelectorAll('.chain-row')).forEach((r) => r.classList.add((res.bad || []).includes(+r.dataset.i) ? 'wrong' : 'right')); }
    };
  };

  R.lakesim = function (area, spec, g) {
    let nut = 100;
    const lake = U.el('div', { class: 'lake-vis' });
    const info = U.el('div', { class: 'lake-info' });
    const note = U.el('p', { class: 'sim-note' });
    const ctl = U.el('div', { class: 'sim-ctl' }, [
      U.el('button', { type: 'button', class: 'btn big', onclick: () => { nut = Math.max(0, nut - 10); draw(); g.onChange(); } }, '− Entrada de nutrientes'),
      U.el('button', { type: 'button', class: 'btn', onclick: () => { nut = Math.min(100, nut + 10); draw(); g.onChange(); } }, '+ nutrientes')
    ]);
    function draw() {
      const k = nut / 100;
      const r = Math.round(63 + (95 - 63) * k), gg = Math.round(155 + (154 - 155) * k), b = Math.round(224 + (58 - 224) * k);
      lake.style.background = 'rgb(' + r + ',' + gg + ',' + b + ')';
      const oxy = Math.round(100 - nut * 0.9), fish = Math.max(0, Math.floor((100 - nut) / 20));
      lake.innerHTML = '<span>' + '🐟'.repeat(fish) + (nut > 50 ? ' 🟢🟢🟢' : nut > 20 ? ' 🟢' : '') + '</span>';
      info.innerHTML = '<div>Nutrientes: <b>' + nut + '%</b></div><div>Transparência: <b>' + (100 - nut) + '%</b></div><div>Oxigênio: <b>' + oxy + '%</b></div><div>Peixes: <b>' + fish + '</b></div>';
      note.textContent = nut > 60 ? 'Muitos nutrientes: algas demais, a luz não chega ao fundo e falta oxigênio.' : nut > 20 ? 'Melhorando! Menos algas; o oxigênio começa a voltar.' : 'Lago recuperado: água transparente, oxigênio e peixes de volta!';
    }
    area.appendChild(lake); area.appendChild(info); area.appendChild(ctl); area.appendChild(note);
    draw();
    return { ready: () => nut <= 20, check: () => ({ ok: true }), mark: () => {} };
  };

  /* ------------------------------------------------------------------ PRÉ-ATIVIDADES */
  function runPre(m, pre) {
    return new Promise((resolve) => {
      const body = m.body; body.innerHTML = '';
      L._cur = { pre }; // gancho para testes automáticos
      body.appendChild(U.el('p', { class: 'prompt', html: U.rich(pre.prompt || 'Observe antes de responder.') }));
      const area = U.el('div', { class: 'area' }); body.appendChild(area);
      const msg = U.el('p', { class: 'sim-note' }); body.appendChild(msg);
      const next = EN.ui.btn('Continuar ▶', 'pri', () => resolve());
      next.disabled = true;
      m.setActions([next]);
      if (pre.type === 'sim') {
        const pops = pre.pops.map((p) => Object.assign({}, p, { v0: p.v }));
        const ctl = pops.find((p) => p.id === pre.control);
        let downs = 0, ups = 0;
        const bars = U.el('div', { class: 'pop-bars' });
        function draw() {
          bars.innerHTML = '';
          pops.forEach((p) => bars.appendChild(U.el('div', { class: 'pop' + (p === ctl ? ' ctl' : '') }, [L.icon(p.icon, 30), U.el('span', { class: 'pop-t' }, p.t), U.el('div', { class: 'pop-bar' }, U.el('i', { style: { width: Math.round(p.v) + '%' } })), U.el('b', null, Math.round(p.v))])));
        }
        function change(d) {
          ctl.v = U.clamp(ctl.v + d, 5, 100);
          (pre.links || []).forEach((lk) => { const p = pops.find((x) => x.id === lk.id); p.v = U.clamp(p.v0 + lk.k * (ctl.v - ctl.v0), 3, 100); });
          if (d < 0) downs++; else ups++;
          msg.textContent = d < 0 ? pre.notes.down : pre.notes.up;
          draw();
          const okDir = pre.need === 'down' ? downs >= 2 : pre.need === 'up' ? ups >= 2 : downs >= 1 && ups >= 1;
          next.disabled = !okDir;
          if (okDir) next.textContent = 'Já observei ▶';
        }
        area.appendChild(bars);
        area.appendChild(U.el('div', { class: 'sim-ctl' }, [
          U.el('button', { type: 'button', class: 'btn big', onclick: () => change(-10) }, '− ' + ctl.t),
          U.el('button', { type: 'button', class: 'btn big', onclick: () => change(10) }, '+ ' + ctl.t)
        ]));
        draw();
      } else if (pre.type === 'trace') {
        const G = graphBox(pre.nodes, { tall: true });
        pre.edges.forEach(([a, b]) => G.arrow(a, b, b === 'fungos' ? '#9aa0ad' : '#2b2d42', 0, { w: b === 'fungos' ? 4 : 6, dash: b === 'fungos' }));
        let step = 0;
        Object.values(G.btns).forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.id;
          if (step >= pre.path.length) return;
          if (id === pre.path[step]) {
            b.classList.add('right');
            if (step > 0) G.arrow(pre.path[step - 1], id, '#e67e22', 0, { w: 10 });
            step++;
            msg.textContent = step < pre.path.length ? 'Isso! Agora siga a seta que sai de ' + nameOf(pre.nodes, id) + '.' : 'Caminho encontrado: ' + pre.path.map((p) => nameOf(pre.nodes, p)).join(' → ') + '.';
            if (step >= pre.path.length) next.disabled = false;
          } else {
            msg.textContent = step === 0 ? 'Comece pelo ponto de partida indicado na pergunta.' : 'Siga as setas: a partir de ' + nameOf(pre.nodes, pre.path[step - 1]) + ', a seta aponta para quem come esse ser.';
            b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          }
        }));
        area.appendChild(G.box);
      } else if (pre.type === 'observe') {
        let i = 0;
        const card = U.el('div', { class: 'obs-card' });
        const draw = () => { card.innerHTML = ''; card.appendChild(U.el('div', { class: 'art' }, pre.cards[i].art)); card.appendChild(U.el('p', { html: U.rich(pre.cards[i].text) })); };
        const adv = EN.ui.btn(pre.button || 'Avançar', '', () => { i++; if (i >= pre.cards.length - 1) { i = pre.cards.length - 1; adv.disabled = true; next.disabled = false; } draw(); });
        area.appendChild(card); area.appendChild(adv); draw();
      }
    });
  }

  /* ------------------------------------------------------------------ AUTOAVALIAÇÃO (aberta) */
  function selfCheck(m, spec, o, ev) {
    return new Promise((resolve) => {
      const body = m.body; body.innerHTML = '';
      body.appendChild(U.el('div', { class: 'fb warn', html: 'Encontrei parte das ideias (' + ev.matched.map((x) => x.label.toLowerCase()).join('; ') + '). Vamos comparar com uma <b>resposta-modelo</b>.' }));
      body.appendChild(U.el('div', { class: 'model', html: '<b>Resposta-modelo:</b> ' + U.rich(o.model || '', { noGloss: true }) }));
      body.appendChild(U.el('p', { class: 'prompt' }, 'Marque TODAS as ideias que aparecem na resposta-modelo:'));
      const ideas = U.shuffle(spec.groups.slice(0, 4).map((g) => ({ t: g.label, ok: true })).concat((spec.wrongIdeas || []).map((t) => ({ t, ok: false }))));
      const sel = new Set();
      const wrap = U.el('div', { class: 'opts multi' });
      ideas.forEach((it) => { const b = U.el('button', { type: 'button', class: 'opt chk' }, [U.el('span', { class: 'box' }), it.t]); b.onclick = () => { if (sel.has(it)) sel.delete(it); else sel.add(it); b.classList.toggle('sel'); }; wrap.appendChild(b); });
      body.appendChild(wrap);
      const fb = U.el('div', { class: 'fb' }); body.appendChild(fb);
      m.setActions([EN.ui.btn('Conferir', 'pri', () => {
        const good = ideas.filter((i) => i.ok).every((i) => sel.has(i)) && ![...sel].some((i) => !i.ok);
        resolve(good);
      })]);
    });
  }

  /** Rostinho da Lumi reagindo à resposta. */
  function lumiFace() {
    const c = U.el('canvas', { class: 'fb-lumi', width: 76, height: 76 });
    EN.sprites.portrait(c, { kind: 'lumi', variant: EN.eco.lumiVariant() });
    return c;
  }

  /* ------------------------------------------------------------------ EXECUTOR */
  const PRAISE = ['Boa! Você acertou.', 'Isso mesmo, Guardião!', 'Muito bem! Resposta certa.', 'Excelente raciocínio!', 'Perfeito!'];
  /**
   * Executa uma atividade com tentativas, folhas, pistas e versão guiada.
   * o: { mode, title, level, prompt, recap, hint1, hint2, guidedSpec, why,
   *      err, model, missionKey, startGuided, noLeaves }
   * Retorna { tier (1|2|3), attempts, firstTry }.
   */
  L.run = function (spec, o) {
    o = o || {};
    return new Promise(async (resolve) => {
      const m = EN.ui.modal({ title: o.title || 'Atividade', cls: 'act', wide: true, noClose: true });
      const lv = LEVEL[spec.level || o.level || 'construtor'];
      const leavesEl = U.el('span', { class: 'leaves', 'aria-label': 'folhas de energia' });
      m.head.appendChild(U.el('span', { class: 'lv ' + lv.c }, lv.t));
      if (!o.noLeaves) m.head.appendChild(leavesEl);
      const promptTxt = spec.prompt || o.prompt || '';
      m.head.appendChild(EN.ui.ttsBtn(() => promptTxt));
      let attempts = 0, leaves = 3, guided = o.startGuided || 0, fastWrong = 0, showHint = 0;
      let renderedAt = 0, ren = null;
      const cantilKey = o.missionKey || 'geral';
      function drawLeaves() { leavesEl.innerHTML = ''; for (let i = 0; i < 3; i++) leavesEl.appendChild(U.el('span', { class: 'leaf' + (i < leaves ? '' : ' off') }, '🍃')); }
      drawLeaves();
      if (spec.pre) await runPre(m, spec.pre);

      function render() {
        const body = m.body; body.innerHTML = '';
        const useSpec = (guided > 0 && o.guidedSpec) ? o.guidedSpec : spec;
        if (guided > 0) body.appendChild(U.el('div', { class: 'fb guide', html: (o.guidedSpec && spec.type === 'open') ? '🧭 <b>Versão guiada:</b> vamos por partes. Conclua o último passo!' : '🧭 <b>Vamos fazer juntos:</b> eu já adiantei uma parte. Agora é com você: conclua o último passo!' }));
        body.appendChild(U.el('p', { class: 'prompt', html: U.rich(useSpec.prompt && useSpec !== spec ? useSpec.prompt : promptTxt) }));
        if (showHint) body.appendChild(U.el('div', { class: 'fb hint', html: '💡 <b>Pista:</b> ' + U.rich(showHint >= 2 ? (o.hint2 || o.hint1 || '') : (o.hint1 || ''), { noGloss: true }) }));
        const area = U.el('div', { class: 'area' }); body.appendChild(area);
        const g = { guided: (useSpec !== spec) ? 0 : guided, onChange: () => { sub.disabled = !ren.ready(); } };
        ren = R[useSpec.type](area, useSpec, g);
        L._cur = { spec: useSpec, guided: g.guided, open: spec.type === 'open' ? spec : null }; // gancho para testes automáticos
        if (ren.bind) ren.bind(g.onChange);
        const acts = [];
        if (o.recap) acts.push(EN.ui.btn('📖 Rever explicação', 'ghost', () => EN.ui.info({ title: 'Relembrando', text: o.recap, art: '📖' })));
        if (!o.noLeaves && EN.eco.effect('cantil') && leaves < 3 && !S().cantilUsed[cantilKey]) acts.push(EN.ui.btn('🧴 Usar Cantil (+1 folha)', 'ghost', () => { S().cantilUsed[cantilKey] = true; leaves = Math.min(3, leaves + 1); drawLeaves(); EN.ui.toast('Cantil usado: +1 folha de energia!'); render(); }));
        const sub = EN.ui.btn('Verificar ✔', 'pri', submit);
        sub.disabled = !ren.ready();
        acts.push(sub);
        m.setActions(acts);
        renderedAt = Date.now();
        m.body.scrollTop = 0;
      }

      async function submit() {
        let res = ren.check();
        attempts++;
        const quick = Date.now() - renderedAt < 3000;
        if (!res.ok && res.partial && spec.type === 'open') {
          ren.mark(res);
          const good = await selfCheck(m, spec, o, res.ev);
          if (good) { res = { ok: true, extra: 'Você identificou as ideias da resposta-modelo. Da próxima vez, tente escrevê-las na sua resposta!' }; if (guided === 0) guided = 1; }
          else res = { ok: false, msgs: ['Algumas ideias marcadas não estão na resposta-modelo (ou faltou marcar alguma). Releia com calma.'] };
        }
        if (res.ok) return success(res);
        // ----- erro -----
        EN.audio.play('err');
        S().acts.wrong++;
        if (o.concept) { const c = S().concepts[o.concept] = S().concepts[o.concept] || { err: 0, ok: 0 }; c.err++; }
        if (!o.noLeaves) leaves--;
        drawLeaves();
        ren.mark(res);
        fastWrong = quick ? fastWrong + 1 : 0;
        const body = m.body;
        const fb = U.el('div', { class: 'fb bad' });
        fb.appendChild(lumiFace());
        fb.appendChild(U.el('p', { class: 'fb-t' }, attempts === 1 ? 'Quase! Vamos ajustar.' : 'Ainda não. Você está perto!'));
        (res.msgs || []).forEach((t) => fb.appendChild(U.el('p', { html: '• ' + U.rich(t, { noGloss: true }) })));
        if (o.recap) fb.appendChild(U.el('p', { class: 'recap', html: '📖 ' + U.rich(o.recap) }));
        body.appendChild(fb);
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        let nextLabel = 'Tentar de novo ↻';
        if (!o.noLeaves && leaves <= 0) {
          // sem folhas: microexplicação e versão mais simples
          fb.appendChild(U.el('div', { class: 'fb guide', html: '🔋 <b>Seu cristal está recarregando.</b> Vamos rever uma ideia e tentar uma missão menor.' + (o.hint2 ? '<br>💡 ' + U.rich(o.hint2, { noGloss: true }) : '') }));
          leaves = 3; guided = Math.max(guided, 2); showHint = 2; nextLabel = 'Tentar a versão mais simples ↻';
        } else if (attempts === 1) { showHint = 1; }
        else if (attempts >= 2) { guided = Math.max(guided, 1); showHint = 2; nextLabel = 'Fazer a versão guiada ↻'; }
        const again = EN.ui.btn(nextLabel, 'pri', () => { drawLeaves(); render(); });
        const acts = [again];
        m.setActions(acts);
        if (fastWrong >= 2) {
          fastWrong = 0;
          again.disabled = true;
          const w = U.el('div', { class: 'fb warn', html: '⏸️ <b>Pare um pouquinho e procure a pista na explicação.</b> <span class="cd">4</span>' });
          if (o.hint1) w.appendChild(U.el('p', { html: '💡 ' + U.rich(o.hint1, { noGloss: true }) }));
          body.appendChild(w);
          let c = 4; const cd = w.querySelector('.cd');
          const iv = setInterval(() => { c--; cd.textContent = c; if (c <= 0) { clearInterval(iv); again.disabled = false; cd.textContent = '✔'; } }, 1000);
          w.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      function success(res) {
        EN.audio.play('ok');
        ren.mark({ ok: true });
        const tier = attempts === 1 && guided === 0 ? 1 : guided === 0 ? 2 : 3;
        S().acts.total++;
        if (attempts === 1) S().acts.firstOk++;
        if (o.concept) { const c = S().concepts[o.concept] = S().concepts[o.concept] || { err: 0, ok: 0 }; c.ok++; }
        const body = m.body;
        const stars = 4 - tier;
        const fb = U.el('div', { class: 'fb good' });
        fb.appendChild(lumiFace());
        fb.appendChild(U.el('p', { class: 'fb-t' }, [U.pick(PRAISE) + ' ', U.el('span', { class: 'stars' }, '★'.repeat(stars) + '☆'.repeat(3 - stars))]));
        if (res.extra) fb.appendChild(U.el('p', { html: U.rich(res.extra, { noGloss: true }) }));
        if (o.why) fb.appendChild(U.el('p', { html: '<b>Por quê?</b> ' + U.rich(o.why) }));
        if (o.err) fb.appendChild(U.el('p', { class: 'err', html: '⚠️ <b>Erro comum:</b> ' + U.rich(o.err, { noGloss: true }) }));
        if (o.model) fb.appendChild(U.el('p', { class: 'model', html: '✍️ <b>Resposta-modelo:</b> ' + U.rich(o.model, { noGloss: true }) }));
        body.appendChild(fb);
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const ttsTxt = [o.why, o.err, o.model].filter(Boolean).join(' ');
        m.setActions([EN.ui.ttsBtn(() => ttsTxt, true), EN.ui.btn('Continuar ▶', 'pri', () => { m.close(); resolve({ tier, attempts, firstTry: attempts === 1 && guided === 0 }); })]);
      }
      render();
    });
  };

  /* ------------------------------------------------------------------ explicação antes da questão */
  L.prep = function (q) {
    return EN.ui.cardsPromise([{
      title: 'Antes da questão: ' + q.title, art: '🧠',
      html: '<div class="prep"><div><h4>📌 O que preciso saber</h4><p>' + U.rich(q.prep.concept) + '</p></div><div><h4>🔎 Exemplo do material</h4><p>' + U.rich(q.prep.example) + '</p></div><div><h4>🪜 Como pensar</h4><ol>' + q.prep.steps.map((s) => '<li>' + U.rich(s, { noGloss: true }) + '</li>').join('') + '</ol></div></div>',
      text: q.prep.concept + ' ' + q.prep.example + ' ' + q.prep.steps.join(' ')
    }], { speaker: 'lumi', finalLabel: 'Ir para a questão ▶' });
  };

  const opt = (q, extra) => Object.assign({ title: '📘 Questão do livro — ' + q.title, level: q.level, prompt: q.prompt, recap: q.recap, hint1: q.hint1, hint2: q.hint2, guidedSpec: q.guided, why: q.why, err: q.err, model: q.model, concept: q.concept }, extra || {});

  /** Recompensa de questão do livro conforme o número de tentativas. */
  function rewardTier(tier, label) {
    const r = D.rewards['tier' + tier];
    let coins = r.coins;
    if (tier === 1) coins += EN.eco.medallionBonus();
    return EN.eco.award(r.xp, coins, label);
  }

  /** Fluxo completo de uma QUESTÃO DO LIVRO dentro de uma lição. */
  L.book = async function (qid, missionKey) {
    const q = D.questionById[qid];
    const st = S().q[qid];
    st.seen = true;
    await L.prep(q);
    const t0 = Date.now();
    const res = await L.run(q.main, opt(q, { missionKey }));
    const first = !st.done;
    st.attempts += res.attempts;
    st.errors += res.attempts - 1;
    st.time += Math.round((Date.now() - t0) / 1000);
    if (first) {
      st.done = true; st.tier = res.tier; st.first = res.firstTry; st.stars = 4 - res.tier; st.guided = res.tier === 3;
      if (!res.firstTry) st.wrongOnce = true;
      rewardTier(res.tier, 'Questão ' + qid);
    }
    EN.save.persist('questão concluída');
    // confirmar com uma questão semelhante (ordem/exemplo diferente)
    if (!res.firstTry) {
      await EN.ui.cardsPromise([{ title: 'Vamos confirmar!', art: '🔁', text: 'Agora uma questão **parecida**, com outro exemplo, para confirmar que a ideia ficou clara.' }], { speaker: 'lumi' });
      const r2 = await L.run(q.review, opt(q, { title: '🔁 Confirmação — ' + q.title, prompt: q.review.prompt, guidedSpec: null, model: null, missionKey }));
      if (r2.firstTry) { st.reviewOk++; if (!st.recovered) { st.recovered = true; EN.eco.award(D.rewards.recovery.xp, D.rewards.recovery.coins, 'Bônus de recuperação ' + qid); } }
      else st.reviewWrong++;
      EN.save.persist();
    }
    return res;
  };

  /** Checagem de leitura / treino dentro das lições. */
  L.practice = async function (spec, kind, missionKey) {
    const res = await L.run(spec, { title: kind === 'check' ? '👀 Checagem de leitura' : '🏋️ Treino', level: spec.level || (kind === 'check' ? 'explorador' : 'construtor'), prompt: spec.prompt, missionKey, hint1: 'Releia a explicação: a resposta está nela.', hint2: 'Procure as palavras destacadas na explicação.', recap: spec.recap });
    const r = res.tier === 3 ? D.rewards.checkGuided : D.rewards.check;
    EN.eco.award(r.xp, r.coins, kind === 'check' ? 'Checagem de leitura' : 'Treino');
    return res;
  };

  /* ------------------------------------------------------------------ seleção para revisões */
  L.needsReview = function (qid) {
    const st = S().q[qid];
    return st.wrongOnce && st.reviewOk < 2 || st.reviewWrong > st.reviewOk;
  };
  /**
   * Escolhe itens para revisão. Prioriza questões erradas; garante uma por
   * região quando pedido. Questões erradas usam o enunciado original do
   * livro; as demais usam a variação.
   */
  L.pick = function (regions, n, opts) {
    opts = opts || {};
    let pool = D.questions.filter((q) => regions.includes(q.region));
    const wrong = U.shuffle(pool.filter((q) => L.needsReview(q.id)));
    const rest = U.shuffle(pool.filter((q) => !L.needsReview(q.id)));
    let chosen = [];
    if (opts.perRegion) regions.forEach((r) => { const c = wrong.find((q) => q.region === r && !chosen.includes(q)) || rest.find((q) => q.region === r && !chosen.includes(q)); if (c) chosen.push(c); });
    wrong.concat(rest).forEach((q) => { if (chosen.length < n && !chosen.includes(q)) chosen.push(q); });
    chosen = U.shuffle(chosen.slice(0, n));
    return chosen.map((q) => {
      const useOrig = L.needsReview(q.id) && opts.originalForWrong && q.main.type !== 'open';
      const spec = useOrig ? Object.assign({ prompt: q.prompt }, q.main, q.pre ? { pre: q.pre } : {}) : Object.assign({ level: q.level }, q.review);
      return { q, spec, orig: useOrig };
    });
  };

  /** Registra resultado de revisão de uma questão (anti-farm de moedas). */
  function reviewReward(q, res, label) {
    const st = S().q[q.id];
    if (res.firstTry) {
      const firstReview = st.reviewOk === 0;
      st.reviewOk++;
      if (st.wrongOnce && !st.recovered) { st.recovered = true; EN.eco.award(D.rewards.recovery.xp, D.rewards.recovery.coins, 'Bônus de recuperação ' + q.id); }
      EN.eco.award(firstReview ? D.rewards.check.xp : 10, firstReview ? D.rewards.check.coins : 0, label);
    } else {
      st.reviewWrong++;
      EN.eco.award(10, 0, label);
    }
  }

  /* ------------------------------------------------------------------ DESAFIO DA REGIÃO */
  L.challenge = async function (rid) {
    const items = L.pick([rid], 4, {});
    await EN.ui.cardsPromise([{ title: 'Desafio da Região', art: '⭐', text: 'Hora de **misturar** o que você aprendeu nesta região! São **' + items.length + ' atividades**. Dê o seu melhor: as que você errou antes voltam agora para você mostrar que aprendeu.' }], { speaker: 'lumi' });
    let first = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const res = await L.run(it.spec, opt(it.q, { title: '⭐ Desafio da Região (' + (i + 1) + '/' + items.length + ')', prompt: it.spec.prompt, guidedSpec: it.orig ? it.q.guided : null, model: it.orig ? it.q.model : null, missionKey: 'desafio_' + rid }));
      if (res.firstTry) first++;
      reviewReward(it.q, res, 'Desafio da Região');
      EN.save.persist();
    }
    return first / items.length;
  };

  /* ------------------------------------------------------------------ MISSÃO DE RECUPERAÇÃO */
  L.recovery = async function (rid) {
    const Q = EN.quests;
    const qs = D.questions.filter((q) => q.region === rid).sort((a, b) => Q.questionScore(a.id) - Q.questionScore(b.id)).slice(0, 3);
    await EN.ui.cardsPromise([{ title: 'Missão de Recuperação', art: '🔋', text: 'Seu cristal está recarregando. Vamos rever **' + qs.length + ' ideias** e fazer atividades menores, passo a passo. Ao terminar, o cristal se acende!' }]
      .concat(qs.map((q) => ({ title: 'Relembrando: ' + q.title, art: '📖', text: q.recap + '\n\n' + q.why }))), { speaker: 'lumi' });
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const res = await L.run(Object.assign({ level: q.level }, q.review), opt(q, { title: '🔋 Recuperação (' + (i + 1) + '/' + qs.length + ')', prompt: q.review.prompt, startGuided: 1, guidedSpec: null, model: null, missionKey: 'recup_' + rid }));
      reviewReward(q, res, 'Missão de Recuperação');
    }
    EN.save.persist();
  };

  /* ------------------------------------------------------------------ REVISÃO ANTES DA PROVA */
  L.reviewSession = async function (n) {
    n = n || 10;
    const all = D.regions.map((r) => r.id);
    const items = L.pick(all, n, { perRegion: true, originalForWrong: true });
    let ok = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const res = await L.run(it.spec, opt(it.q, { title: '📝 Revisão antes da prova (' + (i + 1) + '/' + items.length + ')' + (it.orig ? ' — questão do livro' : ''), prompt: it.spec.prompt, guidedSpec: it.orig ? it.q.guided : null, model: it.orig ? it.q.model : null, missionKey: 'revisao' }));
      if (res.firstTry) ok++;
      reviewReward(it.q, res, 'Revisão antes da prova');
      EN.save.persist();
    }
    S().reviewSessions++;
    S().reviewLog.push({ t: Date.now(), ok, n: items.length });
    EN.save.persist('revisão');
    return { ok, n: items.length };
  };

  /** Estação de revisão das áreas bônus (3 itens de uma região). */
  L.reviewStation = async function (regions) {
    const items = L.pick(regions, 3, {});
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const res = await L.run(it.spec, opt(it.q, { title: '📚 Revisão bônus (' + (i + 1) + '/' + items.length + ')', prompt: it.spec.prompt, guidedSpec: null, model: null, missionKey: 'bonus' }));
      reviewReward(it.q, res, 'Revisão bônus');
    }
    EN.save.persist();
  };

  L.renderers = R;
  L.validChains = validChains;
  return L;
})();
