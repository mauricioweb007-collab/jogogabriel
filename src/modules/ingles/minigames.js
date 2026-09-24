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
