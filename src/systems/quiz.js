/* =====================================================================
   src/systems/quiz.js — MOTOR DE QUESTÕES reutilizável (módulos novos).
   Fluxo obrigatório de cada questão:
     1. contexto rápido (vem da fase) → 2. explicação em até 3 blocos →
     3. exemplo visual → 4. questão → 5. feedback com o motivo →
     6. nova aplicação curta se houve erro → 7. volta ao jogo.
   Erros: 1º → explicação específica + nova tentativa; 2º → pista 2
   visual + redução de alternativas; 3º → versão guiada em que o jogador
   precisa concluir a última etapa. Nunca mostra a resposta e avança.
   Sem cronômetro. A ação do jogo fica pausada enquanto a janela está
   aberta (GG.ui.blocking()).
   Tipos: mc, multi, open, classify, order, syllables, mappick,
   builder, personal, fill (guiada).
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const U = GG.util, UI = GG.ui;
  const QZ = (GG.quiz = {});
  QZ._cur = null; // gancho de teste: {spec, type, renderer}
  /** Palavras de julgamento/desrespeito recusadas em respostas livres. */
  QZ.JUDGE = ['feio', 'feia', 'bonito', 'bonita', 'ruim', 'legal', 'chato', 'chata', 'esquisito', 'esquisita', 'estranho', 'estranha', 'nojento', 'burro', 'burra', 'idiota', 'horroroso'];
  QZ.RUDE = ['burro', 'burra', 'idiota', 'nojento', 'nojenta', 'macaco', 'imbecil', 'otario', 'lixo', 'feio', 'feia', 'horroroso'];

  const has = (text, list) => { const t = ' ' + U.norm(text).replace(/[,.;:!?"()]/g, ' ').replace(/\s+/g, ' ') + ' '; return list.filter((w) => t.includes(' ' + U.norm(w) + ' ') || (U.norm(w).length > 5 && t.includes(U.norm(w)))); };

  /* ============================================================ RENDERIZADORES */
  const R = {};

  /* ---------------- múltipla escolha (uma resposta) */
  R.mc = function (spec, api) {
    const opts = spec.keepOrder ? spec.options.slice() : U.shuffle(spec.options);
    let sel = null; const btns = [];
    const el = U.el('div', { class: 'q-opts', role: 'radiogroup' });
    opts.forEach((o, i) => {
      const b = U.el('button', { type: 'button', class: 'q-opt', role: 'radio', 'aria-checked': 'false', onclick: () => { if (b.disabled) return; sel = o; btns.forEach((x) => { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-checked', 'true'); GG.audio.sfx('click'); api.changed(true); } }, [U.el('span', { class: 'q-letter' }, String.fromCharCode(65 + i)), U.el('span', { html: U.rich(o.t) })]);
      b._o = o; btns.push(b); el.appendChild(b);
    });
    return {
      el,
      text: () => opts.map((o, i) => String.fromCharCode(65 + i) + ') ' + U.plain(o.t)).join('. '),
      check() {
        if (!sel) return null;
        if (sel.ok) { btns.forEach((b) => { if (b._o === sel) b.classList.add('right'); }); return { ok: true }; }
        const wrongOpt = sel;
        btns.forEach((b) => { if (b._o === sel) { b.classList.add('wrong'); b.disabled = true; b.classList.remove('sel'); } });
        sel = null; api.changed(false);
        return { ok: false, fb: wrongOpt.fb || spec.wrongMsg || '' };
      },
      reduce() {
        const wrongs = btns.filter((b) => !b._o.ok && !b.disabled);
        wrongs.slice(0, Math.max(0, wrongs.length - 1)).forEach((b) => { b.disabled = true; b.classList.add('gone'); });
      },
      solve() { const b = btns.find((x) => x._o.ok); b.click(); },
      solveWrong() { const b = btns.find((x) => !x._o.ok && !x.disabled); if (b) b.click(); return !!b; }
    };
  };

  /* ---------------- várias respostas */
  R.multi = function (spec, api) {
    const opts = spec.keepOrder ? spec.options.slice() : U.shuffle(spec.options);
    const btns = [];
    const need = spec.min || spec.options.filter((o) => o.ok).length;
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || ('Marque ' + (spec.min ? 'pelo menos ' + need : 'todas as') + ' respostas corretas.')), U.el('div', { class: 'q-opts' })]);
    const box = el.lastChild;
    opts.forEach((o) => {
      const b = U.el('button', { type: 'button', class: 'q-opt multi', 'aria-pressed': 'false', onclick: () => { if (b.disabled) return; b.classList.toggle('sel'); b.setAttribute('aria-pressed', String(b.classList.contains('sel'))); GG.audio.sfx('click'); api.changed(btns.some((x) => x.classList.contains('sel'))); } }, [U.el('span', { class: 'q-box' }), U.el('span', { html: U.rich(o.t) })]);
      b._o = o; btns.push(b); box.appendChild(b);
    });
    return {
      el,
      text: () => opts.map((o) => U.plain(o.t)).join('. '),
      check() {
        const sel = btns.filter((b) => b.classList.contains('sel'));
        if (!sel.length) return null;
        const wrong = sel.filter((b) => !b._o.ok), right = sel.filter((b) => b._o.ok);
        const missReq = (spec.required || []).filter((t) => !right.some((b) => b._o.t === t));
        const missTag = (spec.needTags || []).find((nt) => right.filter((b) => b._o.tag === nt.tag).length < nt.min);
        if (!wrong.length && right.length >= need && !missReq.length && !missTag) { sel.forEach((b) => b.classList.add('right')); return { ok: true }; }
        if (!wrong.length && (missReq.length || missTag)) { right.forEach((b) => b.classList.add('right-soft')); return { ok: false, fb: missTag ? missTag.msg : (spec.requiredMsg || 'Falta marcar: ' + missReq.join(', ') + '.') }; }
        wrong.forEach((b) => { b.classList.add('wrong'); b.classList.remove('sel'); b.disabled = true; });
        right.forEach((b) => b.classList.add('right-soft'));
        const fb = wrong.map((b) => b._o.fb).filter(Boolean)[0] || (right.length < need ? 'Ainda faltam ' + (need - right.length) + ' resposta(s) correta(s).' : '');
        api.changed(btns.some((x) => x.classList.contains('sel')));
        return { ok: false, fb };
      },
      reduce() {
        const wrongs = btns.filter((b) => !b._o.ok && !b.disabled);
        wrongs.slice(0, Math.ceil(wrongs.length / 2)).forEach((b) => { b.disabled = true; b.classList.add('gone'); });
      },
      solve() { btns.forEach((b) => { if (b._o.ok !== b.classList.contains('sel') && !b.disabled) b.click(); }); },
      solveWrong() { const b = btns.find((x) => !x._o.ok && !x.disabled); if (!b) return false; b.click(); return true; }
    };
  };

  /* ---------------- resposta aberta (palavras-chave) com opção de montar com blocos */
  R.open = function (spec, api) {
    let mode = 'text';
    const ta = U.el('textarea', { placeholder: spec.placeholder || 'Escreva com suas palavras…', 'aria-label': 'Sua resposta' });
    ta.addEventListener('input', () => api.changed(mode === 'text' ? ta.value.trim().length > 2 : chips.some((c) => c.classList.contains('sel'))));
    const chipsBox = U.el('div', { class: 'q-chips hide' });
    const pool = U.shuffle(spec.groups.map((g) => ({ t: g.label, ok: true })).concat((spec.distractors || []).map((t) => ({ t, ok: false }))));
    const chips = pool.map((p) => {
      const c = U.el('button', { type: 'button', class: 'q-chip', 'aria-pressed': 'false', onclick: () => { if (c.disabled) return; c.classList.toggle('sel'); c.setAttribute('aria-pressed', String(c.classList.contains('sel'))); GG.audio.sfx('click'); api.changed(chips.some((x) => x.classList.contains('sel'))); } }, p.t);
      c._p = p; chipsBox.appendChild(c); return c;
    });
    const toggle = U.el('button', { type: 'button', class: 'btn small info', onclick: () => {
      mode = mode === 'text' ? 'chips' : 'text';
      ta.classList.toggle('hide', mode !== 'text'); chipsBox.classList.toggle('hide', mode !== 'chips');
      toggle.textContent = mode === 'text' ? '🧩 Montar a resposta com blocos de ideias' : '✍️ Prefiro escrever';
      note.textContent = mode === 'text' ? '' : 'Escolha as ideias certas (pelo menos ' + (spec.min || 1) + ').';
      api.changed(mode === 'text' ? ta.value.trim().length > 2 : chips.some((x) => x.classList.contains('sel')));
    } }, '🧩 Montar a resposta com blocos de ideias');
    const note = U.el('p', { class: 'q-note' });
    const el = U.el('div', null, [ta, U.el('div', { class: 'q-row' }, [toggle]), note, chipsBox]);
    if (spec.startWithChips) setTimeout(() => toggle.click(), 0);
    const R0 = {
      el,
      text: () => '',
      check() {
        const min = spec.min || 1;
        if (mode === 'chips') {
          const sel = chips.filter((c) => c.classList.contains('sel'));
          if (!sel.length) return null;
          const bad = sel.filter((c) => !c._p.ok), good = sel.filter((c) => c._p.ok);
          if (!bad.length && good.length >= min) { sel.forEach((c) => c.classList.add('right')); return { ok: true, answer: good.map((c) => c._p.t).join('; ') }; }
          bad.forEach((c) => { c.classList.add('wrong'); c.classList.remove('sel'); c.disabled = true; });
          return { ok: false, fb: bad.length ? '“' + bad[0]._p.t + '” não combina com o que estudamos.' : 'Boa escolha! Falta pelo menos mais ' + (min - good.length) + ' ideia(s) certa(s).' };
        }
        const txt = ta.value;
        if (txt.trim().length < 3) return null;
        const rude = has(txt, QZ.RUDE);
        if (rude.length) return { ok: false, fb: 'Vamos responder com respeito, sem palavras que ofendem ou julgam as pessoas.' };
        const miss = (spec.wrongIdeas || []).find((w) => has(txt, w.kw).length);
        const hits = spec.groups.map((g) => has(txt, g.kw).length > 0);
        const n = hits.filter(Boolean).length;
        const mustOk = (spec.must || []).every((i) => hits[i]) && (!spec.mustAny || spec.mustAny.some((i) => hits[i]));
        if (!miss && n >= min && mustOk) return { ok: true, answer: txt, hits: spec.groups.filter((g, i) => hits[i]).map((g) => g.label) };
        if (miss) return { ok: false, fb: miss.fb };
        const got = spec.groups.filter((g, i) => hits[i]).map((g) => g.label);
        const lack = spec.groups.filter((g, i) => !hits[i] && !g.extra);
        const want = (spec.must || []).map((i) => spec.groups[i]).find((g, k) => !hits[spec.must[k]]) || (spec.mustAny && !spec.mustAny.some((i) => hits[i]) ? spec.groups[spec.mustAny[0]] : null) || lack[0];
        return { ok: false, fb: (got.length ? 'Você já lembrou: **' + got.join('**, **') + '**. ' : '') + 'Pense também em: **' + (want ? want.label : '') + '**.' };
      },
      reduce() {
        if (mode === 'text') toggle.click();
        const bad = chips.filter((c) => !c._p.ok && !c.disabled);
        bad.slice(0, Math.ceil(bad.length / 2)).forEach((c) => { c.disabled = true; c.classList.add('gone'); });
      },
      solve() { if (mode !== 'text') toggle.click(); ta.value = spec.groups.map((g) => g.kw[0]).join(', '); api.changed(true); },
      solveWrong() { if (mode !== 'text') toggle.click(); ta.value = 'não sei bem'; api.changed(true); return true; }
    };
    return R0;
  };

  /* ---------------- classificar itens em grupos */
  R.classify = function (spec, api) {
    let picked = null;
    const place = {};
    const items = U.shuffle(spec.items.map((it, i) => Object.assign({ i }, it)));
    const tray = U.el('div', { class: 'q-tray', 'aria-label': 'Itens para classificar' });
    const bins = U.el('div', { class: 'q-bins' });
    const itemBtns = items.map((it) => {
      const b = U.el('button', { type: 'button', class: 'q-item', onclick: () => { if (b.disabled) return; picked = it; itemBtns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); GG.audio.sfx('click'); } }, [it.icon ? U.el('span', { class: 'q-ic' }, it.icon) : null, it.t]);
      b._it = it; return b;
    });
    const binEls = spec.bins.map((bn) => {
      const drop = U.el('div', { class: 'q-drop' });
      const e = U.el('button', { type: 'button', class: 'q-bin', onclick: () => { if (!picked) return; place[picked.i] = bn.id; const b = itemBtns.find((x) => x._it === picked); drop.appendChild(b); b.classList.remove('sel'); picked = null; GG.audio.sfx('click'); api.changed(Object.keys(place).length === items.length); } }, [U.el('b', null, (bn.icon ? bn.icon + ' ' : '') + bn.t)]);
      const wrap = U.el('div', { class: 'q-binwrap' }, [e, drop]);
      wrap._bin = bn; bins.appendChild(wrap); return { bn, drop };
    });
    itemBtns.forEach((b) => tray.appendChild(b));
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Toque em um item e depois no grupo certo.'), tray, bins]);
    return {
      el,
      text: () => 'Grupos: ' + spec.bins.map((b) => b.t).join(', ') + '. Itens: ' + items.map((i) => i.t).join(', '),
      check() {
        if (Object.keys(place).length < items.length) return null;
        const wrong = items.filter((it) => place[it.i] !== it.bin);
        if (!wrong.length) { itemBtns.forEach((b) => b.classList.add('right')); return { ok: true }; }
        wrong.forEach((it) => { const b = itemBtns.find((x) => x._it === it); b.classList.add('wrong'); tray.appendChild(b); delete place[it.i]; setTimeout(() => b.classList.remove('wrong'), 900); });
        items.filter((it) => place[it.i] === it.bin).forEach((it) => { const b = itemBtns.find((x) => x._it === it); b.disabled = true; b.classList.add('right'); });
        api.changed(false);
        return { ok: false, fb: wrong[0].fb || ('“' + wrong[0].t + '” está no grupo errado.') };
      },
      reduce() {
        const first = items.find((it) => place[it.i] !== it.bin);
        if (first) { const b = itemBtns.find((x) => x._it === first); const target = binEls.find((x) => x.bn.id === first.bin); target.drop.appendChild(b); place[first.i] = first.bin; b.disabled = true; b.classList.add('right'); api.changed(Object.keys(place).length === items.length); }
      },
      solve() { items.forEach((it) => { if (place[it.i] === it.bin) return; itemBtns.find((x) => x._it === it).click(); binEls.find((x) => x.bn.id === it.bin).drop.previousSibling.click(); }); },
      solveWrong() { const it = items.find((x) => place[x.i] == null); if (!it) return false; itemBtns.find((x) => x._it === it).click(); const other = binEls.find((x) => x.bn.id !== it.bin); other.drop.previousSibling.click(); items.forEach((x) => { if (place[x.i] == null) { itemBtns.find((y) => y._it === x).click(); binEls.find((y) => y.bn.id === x.bin).drop.previousSibling.click(); } }); return true; }
    };
  };

  /* ---------------- ordenar etapas */
  R.order = function (spec, api) {
    const items = U.shuffle(spec.items.map((t, i) => ({ t, i })));
    const seq = [];
    const out = U.el('ol', { class: 'q-seq' });
    const pool = U.el('div', { class: 'q-tray' });
    const btns = items.map((it) => { const b = U.el('button', { type: 'button', class: 'q-item', onclick: () => { if (b.disabled) return; seq.push(it); b.disabled = true; b.classList.add('used'); draw(); GG.audio.sfx('click'); } }, it.t); b._it = it; pool.appendChild(b); return b; });
    function draw() {
      out.innerHTML = '';
      seq.forEach((it, k) => out.appendChild(U.el('li', null, [U.el('span', null, it.t), U.el('button', { type: 'button', class: 'btn small ghost', 'aria-label': 'Tirar', onclick: () => { seq.splice(k, 1); const b = btns.find((x) => x._it === it); b.disabled = false; b.classList.remove('used'); draw(); } }, '↩')])));
      api.changed(seq.length === items.length);
    }
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Toque nas etapas na ordem certa.'), pool, out]);
    return {
      el, text: () => items.map((i) => i.t).join('. '),
      check() {
        if (seq.length < items.length) return null;
        const k = seq.findIndex((it, n) => it.i !== n);
        if (k < 0) return { ok: true };
        const keep = seq.slice(0, k); seq.length = 0; keep.forEach((x) => seq.push(x));
        btns.forEach((b) => { const inSeq = seq.includes(b._it); b.disabled = inSeq; b.classList.toggle('used', inSeq); });
        draw();
        return { ok: false, fb: 'A etapa ' + (k + 1) + ' não está certa. O que acontece antes?' };
      },
      reduce() { const nextI = seq.length; const it = items.find((x) => x.i === nextI); if (it) btns.find((b) => b._it === it).click(); },
      solve() { seq.length = 0; btns.forEach((b) => { b.disabled = false; b.classList.remove('used'); }); draw(); spec.items.forEach((t, i) => btns.find((b) => b._it.i === i).click()); },
      solveWrong() { seq.length = 0; btns.forEach((b) => { b.disabled = false; b.classList.remove('used'); }); draw(); btns.slice().reverse().forEach((b) => b.click()); return true; }
    };
  };

  /* ---------------- enigma de sílabas + origem */
  R.syllables = function (spec, api) {
    let built = spec.prebuilt ? spec.pieces.slice() : [];
    let step = spec.prebuilt ? 2 : 1;
    const word = U.el('div', { class: 'q-word pix' });
    const pool = U.el('div', { class: 'q-tray' });
    const pieces = U.shuffle(spec.pieces.concat(spec.extra || []));
    const btns = pieces.map((p) => { const b = U.el('button', { type: 'button', class: 'q-syl pix', onclick: () => { if (b.disabled || step !== 1) return; built.push(p); b.disabled = true; drawW(); GG.audio.sfx('click'); } }, p); b._p = p; pool.appendChild(b); return b; });
    const undo = U.el('button', { type: 'button', class: 'btn small ghost', onclick: () => { if (step !== 1 || !built.length) return; const p = built.pop(); const b = btns.find((x) => x._p === p && x.disabled); if (b) b.disabled = false; drawW(); } }, '↩ Desfazer');
    const origin = U.el('div', { class: 'hide' });
    let mcR = null;
    function drawW() { word.textContent = built.length ? built.join(' + ') + ' = ' + built.join('') : '_ + _ + _'; api.changed(step === 1 ? built.length === spec.pieces.length : !!(mcR && mcR._sel)); }
    function toStep2() {
      step = 2; pool.classList.add('hide'); undo.classList.add('hide'); origin.classList.remove('hide');
      word.textContent = spec.word + ' ✔';
      mcR = R.mc({ options: spec.origin.options }, { changed: (v) => { mcR._sel = v; api.changed(v); } });
      origin.appendChild(U.el('p', { class: 'q-note', html: U.rich(spec.origin.prompt) })); origin.appendChild(mcR.el);
      api.changed(false);
    }
    if (step === 2) setTimeout(toStep2, 0);
    drawW();
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Monte o nome do prato com as sílabas, na ordem.'), word, pool, U.el('div', { class: 'q-row' }, [undo]), origin]);
    return {
      el, text: () => 'Sílabas: ' + pieces.join(', '),
      check() {
        if (step === 1) {
          if (built.length < spec.pieces.length) return null;
          if (built.join('') === spec.pieces.join('')) { GG.audio.sfx('coin'); toStep2(); return { ok: 'step', msg: 'Isso! Você montou **' + spec.word + '**. Agora indique a origem.' }; }
          built = []; btns.forEach((b) => { b.disabled = false; }); drawW();
          return { ok: false, fb: 'Essa combinação não forma o nome do prato. Leia as sílabas em voz alta e tente de novo.' };
        }
        const r = mcR.check(); if (!r) return null; if (!r.ok) mcR._sel = false; return r;
      },
      reduce() {
        if (step === 1) { built = []; btns.forEach((b) => { b.disabled = false; }); const extra = btns.filter((b) => !spec.pieces.includes(b._p)); extra.forEach((b) => { b.disabled = true; b.classList.add('gone'); }); built.push(spec.pieces[0]); btns.find((b) => b._p === spec.pieces[0]).disabled = true; drawW(); }
        else mcR.reduce();
      },
      solve() { if (step === 1) { built = spec.pieces.slice(); btns.forEach((b) => { b.disabled = spec.pieces.includes(b._p); }); drawW(); } else mcR.solve(); },
      solveWrong() { if (step === 1) { built = spec.pieces.slice().reverse(); drawW(); return true; } return mcR.solveWrong(); },
      step: () => step
    };
  };

  /* ---------------- escolher região no mapa do Brasil */
  R.mappick = function (spec, api) {
    let k = 0; const ans = [];
    const note = U.el('p', { class: 'q-note', html: U.rich(spec.parts[0].prompt) });
    const map = GG.maps.brasil({ interactive: true, onPick: (rid) => { ans[k] = rid; map.select(rid); list.forEach((b) => b.classList.toggle('sel', b._r === rid)); GG.audio.sfx('click'); api.changed(true); }, legend: spec.legend });
    const list = GG.maps.REGIONS.map((r) => { const b = U.el('button', { type: 'button', class: 'q-chip', onclick: () => { ans[k] = r.id; map.select(r.id); list.forEach((x) => x.classList.toggle('sel', x === b)); api.changed(true); } }, r.t); b._r = r.id; return b; });
    const el = U.el('div', null, [note, U.el('div', { class: 'q-mapwrap' }, [map.el, U.el('div', { class: 'q-chips col' }, list)])]);
    return {
      el, text: () => U.plain(spec.parts[k].prompt) + ' Regiões: ' + GG.maps.REGIONS.map((r) => r.t).join(', '),
      check() {
        if (!ans[k]) return null;
        const part = spec.parts[k];
        if (ans[k] !== part.answer) { const fb = (part.fb && part.fb[ans[k]]) || part.wrong || 'Observe de novo onde aparecem mais áreas marcadas.'; ans[k] = null; map.select(null); list.forEach((b) => b.classList.remove('sel')); api.changed(false); return { ok: false, fb }; }
        map.mark(part.answer, part.markLabel || '✔'); list.forEach((b) => b.classList.remove('sel'));
        if (k < spec.parts.length - 1) { k++; note.innerHTML = U.rich(spec.parts[k].prompt); map.select(null); api.changed(false); return { ok: 'step', msg: part.okMsg || 'Certo!' }; }
        return { ok: true };
      },
      reduce() { const p = spec.parts[k]; map.hint(p.answer); },
      solve() { ans[k] = spec.parts[k].answer; map.select(ans[k]); api.changed(true); },
      solveWrong() { ans[k] = GG.maps.REGIONS.find((r) => r.id !== spec.parts[k].answer).id; api.changed(true); return true; }
    };
  };

  /* ---------------- montar uma planta (arrastar/tocar ícones) */
  R.builder = function (spec, api) {
    const cols = spec.cols || 6, rows = spec.rows || 4;
    let cur = null; const cells = [];
    const pal = U.el('div', { class: 'q-tray' });
    const palBtns = spec.palette.map((p) => { const b = U.el('button', { type: 'button', class: 'q-item', onclick: () => { cur = p; palBtns.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); GG.audio.sfx('click'); } }, [U.el('span', { class: 'q-ic' }, p.icon), p.t]); b._p = p; pal.appendChild(b); return b; });
    const grid = U.el('div', { class: 'q-grid', style: { gridTemplateColumns: 'repeat(' + cols + ', 1fr)' } });
    for (let i = 0; i < cols * rows; i++) {
      const c = U.el('button', { type: 'button', class: 'q-cell', 'aria-label': 'Espaço ' + (i + 1), onclick: () => { if (cur) { c._p = cur; c.textContent = cur.icon; c.title = cur.t; } else { c._p = null; c.textContent = ''; } GG.audio.sfx('click'); api.changed(cells.filter((x) => x._p).length >= 2); } });
      cells.push(c); grid.appendChild(c);
    }
    const eraser = U.el('button', { type: 'button', class: 'btn small ghost', onclick: () => { cur = null; palBtns.forEach((x) => x.classList.remove('sel')); } }, '🧽 Apagar');
    const legend = U.el('div', { class: 'q-legend' });
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Escolha um elemento e toque nos quadrinhos da planta.'), pal, U.el('div', { class: 'q-row' }, [eraser]), grid, legend]);
    return {
      el, text: () => 'Elementos: ' + spec.palette.map((p) => p.t).join(', '),
      check() {
        const used = cells.filter((c) => c._p).map((c) => c._p);
        if (used.length < 2) return null;
        const fant = used.filter((p) => !p.real);
        const distinct = Array.from(new Set(used.filter((p) => p.real).map((p) => p.id)));
        legend.innerHTML = '<b>Legenda:</b> ' + Array.from(new Set(used.map((p) => p.icon + ' ' + p.t))).join(' • ');
        if (fant.length) return { ok: false, fb: '“' + fant[0].t + '” não existe de verdade num município. Uma planta representa elementos reais.' };
        if (distinct.length < (spec.min || 4)) return { ok: false, fb: 'Boa! Coloque pelo menos ' + (spec.min || 4) + ' tipos diferentes de elementos reais (você usou ' + distinct.length + ').' };
        return { ok: true, answer: distinct.join(', ') };
      },
      reduce() { palBtns.forEach((b) => { if (!b._p.real) { b.disabled = true; b.classList.add('gone'); } }); },
      solve() { spec.palette.filter((p) => p.real).slice(0, (spec.min || 4) + 1).forEach((p, i) => { cur = p; cells[i * 2].click(); }); cur = null; },
      solveWrong() { const f = spec.palette.find((p) => !p.real); cur = f; cells[0].click(); cells[1].click(); cur = null; return true; }
    };
  };

  /* ---------------- pergunta pessoal/reflexiva (rubrica, sem dados sensíveis) */
  R.personal = function (spec, api) {
    const chosen = new Set(), why = new Set(); let unknown = false;
    const box = U.el('div', { class: 'q-chips' });
    const toggleChip = (set, c, t, single, peers) => {
      if (single) { set.clear(); peers.forEach((x) => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); }
      if (set.has(t)) { set.delete(t); c.classList.remove('sel'); c.setAttribute('aria-pressed', 'false'); } else { set.add(t); c.classList.add('sel'); c.setAttribute('aria-pressed', 'true'); }
    };
    const chips = (spec.choices || []).map((t) => { const c = U.el('button', { type: 'button', class: 'q-chip', 'aria-pressed': 'false', onclick: () => { if (c.disabled) return; toggleChip(chosen, c, t, spec.single, chips); unknown = false; if (unk) unk.classList.remove('sel'); GG.audio.sfx('click'); upd(); } }, t); c._t = t; box.appendChild(c); return c; });
    const unk = spec.allowUnknown ? U.el('button', { type: 'button', class: 'q-chip unk', onclick: () => { unknown = !unknown; unk.classList.toggle('sel', unknown); if (unknown) { chosen.clear(); chips.forEach((x) => x.classList.remove('sel')); } upd(); } }, spec.unknownLabel || '🤔 Não sei ainda') : null;
    if (unk) box.appendChild(unk);
    let whyChips = [];
    const whyBox = spec.reasons ? U.el('div', null, [U.el('p', { class: 'q-note' }, spec.reasonsTitle || 'Por quê?'), U.el('div', { class: 'q-chips' })]) : null;
    if (whyBox) whyChips = spec.reasons.map((t) => { const c = U.el('button', { type: 'button', class: 'q-chip', 'aria-pressed': 'false', onclick: () => { toggleChip(why, c, t, false, whyChips); GG.audio.sfx('click'); upd(); } }, t); whyBox.lastChild.appendChild(c); return c; });
    const ta = spec.text === false ? null : U.el('textarea', { placeholder: spec.placeholder || 'Se quiser, escreva mais (opcional).', 'aria-label': 'Resposta escrita' });
    if (ta) ta.addEventListener('input', upd);
    const txtOk = () => ta && ta.value.trim().length > 3;
    function ready() { return unknown || chosen.size >= (spec.min || 1) || (txtOk() && !spec.need && !spec.minDistinct); }
    function upd() { api.changed(ready()); }
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Não existe resposta única. Escolha o que combina com você.'), box, whyBox, ta]);
    return {
      el, text: () => (spec.choices || []).join('. '),
      check() {
        const txt = ta ? ta.value : '';
        const bad = has(txt, spec.judge ? QZ.JUDGE.concat(QZ.RUDE) : QZ.RUDE);
        if (bad.length) return { ok: false, fb: spec.judgeMsg || 'Use palavras respeitosas, sem julgar a aparência ou o jeito das pessoas.' };
        if (spec.avoid) { const a = Array.from(chosen).find((t) => spec.avoid.includes(t)); if (a) { chosen.delete(a); chips.forEach((c) => { if (c._t === a) { c.classList.remove('sel'); c.classList.add('wrong'); c.disabled = true; } }); upd(); return { ok: false, fb: (spec.avoidMsg && spec.avoidMsg[a]) || '“' + a + '” não é uma atitude respeitosa.' }; } }
        if (!ready()) return null;
        if (spec.need && !unknown) {
          const n = Array.from(chosen).filter((t) => spec.need.includes(t)).length;
          if (n < (spec.min || 1)) return { ok: false, fb: spec.needMsg || 'Escolha pelo menos ' + (spec.min || 1) + ' ideia(s).' };
        }
        if (spec.minDistinct && !unknown) {
          const tags = new Set(Array.from(chosen).map((t) => spec.choiceTags[spec.choices.indexOf(t)]).filter((x) => x && x !== 'x'));
          if (chosen.size < (spec.min || 1)) return { ok: false, fb: 'Escolha pelo menos ' + (spec.min || 1) + ' elementos.' };
          if (tags.size < spec.minDistinct) return { ok: false, fb: spec.distinctMsg || 'Escolha elementos de origens diferentes.' };
        }
        if (spec.reasons && !unknown && !why.size && !txtOk()) return { ok: false, fb: 'Falta explicar o porquê: escolha um motivo ou escreva o seu.' };
        return { ok: true, unknown, personal: true };
      },
      reduce() { if (spec.avoid) chips.forEach((c) => { if (spec.avoid.includes(c._t)) { c.disabled = true; c.classList.add('gone'); } }); },
      solve() {
        if (unk && !spec.need && !spec.minDistinct) { if (!unknown) unk.click(); return; }
        chosen.clear(); chips.forEach((c) => c.classList.remove('sel'));
        let pool = spec.need ? chips.filter((c) => spec.need.includes(c._t)) : chips.filter((c) => !(spec.avoid || []).includes(c._t));
        if (spec.minDistinct) { const seen = new Set(); const pick = []; pool.forEach((c) => { const tg = spec.choiceTags[spec.choices.indexOf(c._t)]; if (!seen.has(tg) && tg !== 'x') { seen.add(tg); pick.push(c); } }); pool = pick.concat(pool.filter((c) => !pick.includes(c))); }
        pool.slice(0, Math.max(spec.min || 1, spec.minDistinct || 0)).forEach((c) => c.click());
        if (whyChips.length && !why.size) whyChips[0].click();
      },
      solveWrong() { if (spec.avoid) { const c = chips.find((x) => spec.avoid.includes(x._t) && !x.disabled); if (c) { c.click(); return true; } } if (ta) { ta.value = 'ele é feio'; upd(); return true; } return false; }
    };
  };

  /* ---------------- várias etapas em sequência (ex.: ler tabela e depois ligar valores) */
  R.steps = function (spec, api) {
    let k = 0, cur = null;
    const host = U.el('div');
    const title = U.el('p', { class: 'q-note' });
    const el = U.el('div', null, [title, host]);
    function load() {
      const p = spec.parts[k];
      title.innerHTML = '<b>Etapa ' + (k + 1) + ' de ' + spec.parts.length + ':</b> ' + U.rich(p.prompt);
      host.innerHTML = '';
      cur = R[p.type](p.spec, api);
      host.appendChild(cur.el); api.changed(false);
    }
    load();
    return {
      el, text: () => U.plain(spec.parts[k].prompt) + '. ' + (cur.text ? cur.text() : ''),
      check() {
        const r = cur.check();
        if (!r || r.ok === 'step' || !r.ok) return r;
        if (k < spec.parts.length - 1) { k++; const msg = spec.parts[k - 1].okMsg || 'Certo! Próxima etapa.'; setTimeout(load, 700); return { ok: 'step', msg }; }
        return r;
      },
      reduce() { if (cur.reduce) cur.reduce(); },
      solve() { cur.solve(); }, solveWrong() { return cur.solveWrong(); },
      part: () => k
    };
  };

  /* ---------------- completar lacunas (versão guiada) */
  R.fill = function (spec, api) {
    const parts = spec.text.split(/(\{\d+\})/);
    const slots = []; let active = null;
    const pre = spec.prefill == null ? Math.max(0, spec.answers.length - 2) : spec.prefill;
    const p = U.el('p', { class: 'q-fill' });
    parts.forEach((s) => {
      const m = s.match(/^\{(\d+)\}$/);
      if (!m) { p.appendChild(document.createTextNode(s)); return; }
      const i = Number(m[1]);
      const sl = U.el('button', { type: 'button', class: 'q-slot', onclick: () => { if (sl.disabled) return; active = sl; slots.forEach((x) => x.classList.remove('act')); sl.classList.add('act'); } }, '____');
      sl._i = i; sl._v = null;
      if (i < pre) { sl._v = spec.answers[i]; sl.textContent = spec.answers[i]; sl.disabled = true; sl.classList.add('pre'); }
      slots.push(sl); p.appendChild(sl);
    });
    const bank = U.el('div', { class: 'q-tray' });
    U.shuffle(spec.answers.filter((a, i) => i >= pre).concat(spec.bank || [])).forEach((w) => {
      bank.appendChild(U.el('button', { type: 'button', class: 'q-item', onclick: () => {
        const target = active && !active.disabled ? active : slots.find((s) => !s._v && !s.disabled);
        if (!target) return; target._v = w; target.textContent = w; target.classList.remove('act'); active = null; GG.audio.sfx('click');
        api.changed(slots.every((s) => s._v));
      } }, w));
    });
    const el = U.el('div', null, [U.el('p', { class: 'q-note' }, spec.note || 'Complete as lacunas com as palavras do banco. Algumas já foram preenchidas para ajudar.'), p, bank]);
    return {
      el, text: () => spec.text.replace(/\{\d+\}/g, 'lacuna'),
      check() {
        if (!slots.every((s) => s._v)) return null;
        const wrong = slots.filter((s) => s._v !== spec.answers[s._i]);
        if (!wrong.length) { slots.forEach((s) => s.classList.add('right')); return { ok: true }; }
        wrong.forEach((s) => { s._v = null; s.textContent = '____'; s.classList.add('wrong'); setTimeout(() => s.classList.remove('wrong'), 800); });
        api.changed(false);
        return { ok: false, fb: 'Algumas lacunas não combinam. Leia a frase inteira e tente de novo.' };
      },
      reduce() {}, solve() { slots.forEach((s) => { s._v = spec.answers[s._i]; s.textContent = s._v; }); api.changed(true); },
      solveWrong() { slots.forEach((s) => { if (!s.disabled) { s._v = 'x'; s.textContent = 'x'; } }); api.changed(true); return true; }
    };
  };

  QZ.renderers = R;

  /* ============================================================ FLUXO */
  /**
   * Executa uma questão completa. Retorna Promise<{id, tier, attempts, firstTry, guided, hintUsed, confirmOk, personal}>.
   * opts: { chips:[texto], pre:true|false, visual:(id)=>Element, mode:'campanha'|'rapido'|'revisao', extraHints:n,
   *         subject:'Geografia', onEvent:(nome, dados)=>void }
   */
  QZ.run = function (q, opts) {
    const o = opts || {};
    return new Promise((resolve) => {
      const res = { id: q.id, tier: 0, attempts: 0, firstTry: false, guided: false, hintUsed: false, confirmOk: null, personal: !!q.personal, started: Date.now() };
      const chips = U.el('div', { class: 'q-chipsrow' }, [
        U.el('span', { class: 'chip geo' }, (o.subjectIcon || '🌎') + ' ' + (o.subject || 'Geografia')),
        q.book ? U.el('span', { class: 'chip' }, '📘 Questão do livro') : U.el('span', { class: 'chip' }, '✅ Checagem'),
        U.el('span', { class: 'chip id' }, q.id)
      ].concat((o.chips || []).map((c) => U.el('span', { class: 'chip' }, c))));
      const m = UI.modal({ title: q.title || 'Pergunta', wide: true, noClose: true, chips, cls: 'quiz' });
      const body = m.body;
      const step = { n: 0 };

      // 2-3. Explicação curta e exemplo visual (até 3 blocos)
      const preBlocks = (o.pre === false ? [] : (q.pre || []));
      function showPre() {
        if (step.n >= preBlocks.length) { ask(); return; }
        body.innerHTML = '';
        const blk = preBlocks[step.n];
        const txt = typeof blk === 'string' ? blk : blk.t;
        const vis = (typeof blk === 'object' && blk.visual) || (step.n === preBlocks.length - 1 ? q.visual : null);
        body.appendChild(U.el('div', { class: 'q-pre' }, [
          U.el('img', { class: 'q-gaia', src: UI.portraits.gaia ? UI.portraits.gaia() : '', alt: 'Gaia' }),
          U.el('div', { class: 'q-bubble', html: U.rich(txt) })
        ]));
        if (vis && o.visual) { const v = o.visual(vis); if (v) body.appendChild(U.el('div', { class: 'q-visual' }, v)); }
        if (UI.autoRead) GG.tts.speak(U.plain(txt));
        m.setActions([
          UI.btn('🔊 Ouvir', 'small', () => GG.tts.speak(U.plain(txt))),
          U.el('span', { class: 'q-count pix' }, 'Explicação ' + (step.n + 1) + '/' + preBlocks.length),
          UI.btn(step.n < preBlocks.length - 1 ? 'Entendi ▶' : 'Vamos à pergunta ▶', 'pri', () => { step.n++; showPre(); })
        ]);
      }

      // 4-6. Questão com tentativas
      let rend = null, fbBox = null, checkBtn = null, stage = 'main';
      function ask(spec, type) {
        body.innerHTML = '';
        const sp = spec || q.spec, tp = type || q.type;
        body.appendChild(U.el('p', { class: 'q-prompt', html: U.rich(stage === 'guided' ? (sp.prompt || 'Versão guiada: complete a explicação.') : stage === 'confirm' ? sp.prompt : q.prompt) }));
        const vis = stage === 'main' && q.visual && o.visual ? o.visual(q.visual) : null;
        if (vis) {
          const det = U.el('details', { class: 'q-vis-d', open: q.visualOpen !== false ? true : null }, [U.el('summary', null, '🖼️ ' + (q.visualLabel || 'Ver imagem / mapa')), U.el('div', { class: 'q-visual' }, vis)]);
          body.appendChild(det);
        }
        rend = R[tp](sp, { changed: (v) => { if (checkBtn) checkBtn.disabled = !v; } });
        QZ._cur = { q, stage, type: tp, spec: sp, r: rend, res };
        body.appendChild(rend.el);
        fbBox = U.el('div', { class: 'q-fb', 'aria-live': 'polite' });
        body.appendChild(fbBox);
        checkBtn = UI.btn('Verificar ✔', 'go', () => check());
        checkBtn.disabled = true;
        const hintBtn = stage === 'main' && q.hint1 ? UI.btn('💡 Pista', 'small', () => { res.hintUsed = true; say('hint', '💡 ' + q.hint1); }) : null;
        const reBtn = stage === 'main' && (q.pre || []).length ? UI.btn('📖 Rever explicação', 'small', () => { say('info', (q.pre || []).map((b) => typeof b === 'string' ? b : b.t).join('\n')); }) : null;
        const extra = stage === 'main' && o.extraHint && o.extraHint() > 0 ? UI.btn('🎩 Pista extra (' + o.extraHint() + ')', 'small', () => { if (o.useExtraHint && o.useExtraHint()) { res.hintUsed = true; if (rend.reduce) rend.reduce(); say('hint', '🎩 O Chapéu do Cartógrafo tirou uma alternativa errada. ' + (q.hint2 || '')); m.actions.querySelector('.extra-h') && m.actions.querySelector('.extra-h').remove(); } }, { class: 'btn small extra-h' }) : null;
        m.setActions([UI.btn('🔊 Ouvir', 'small', () => GG.tts.speak(U.plain(stage === 'confirm' || stage === 'guided' ? sp.prompt : q.prompt) + '. ' + (rend.text ? rend.text() : ''))), hintBtn, reBtn, extra, checkBtn]);
        if (UI.autoRead) GG.tts.speak(U.plain(stage === 'main' ? q.prompt : sp.prompt));
      }
      function say(kind, html) { fbBox.className = 'q-fb ' + kind; fbBox.innerHTML = U.rich(html); }

      function check() {
        const r = rend.check();
        if (r == null) { say('hint', 'Complete a resposta antes de verificar.'); return; }
        if (r.ok === 'step') { say('ok', r.msg || 'Certo!'); checkBtn.disabled = true; return; }
        if (stage === 'confirm') {
          if (r.ok) { res.confirmOk = res.confirmOk == null ? true : res.confirmOk; GG.audio.sfx('ok'); say('ok', '✔ ' + (q.confirm.ok || 'Isso mesmo! Você aplicou o conceito.')); finishBtn(); }
          else { res.confirmOk = false; GG.audio.sfx('bad'); say('bad', (r.fb || 'Ainda não.') + ' Tente de novo.'); if (!rend._red) { rend.reduce(); rend._red = true; } }
          return;
        }
        if (stage === 'guided') {
          if (r.ok) { GG.audio.sfx('ok'); res.tier = 3; say('ok', '✔ Você completou a explicação! ' + (q.why ? '\n' + q.why : '')); afterSuccess(); }
          else { GG.audio.sfx('bad'); say('bad', r.fb || 'Tente de novo.'); }
          return;
        }
        res.attempts++;
        if (o.onEvent) o.onEvent('attempt', { ok: !!r.ok });
        if (r.ok) {
          GG.audio.sfx('ok');
          res.tier = res.attempts === 1 && !res.hintUsed ? 1 : res.attempts <= 2 ? 2 : 3;
          if (res.personal) res.tier = 1;
          res.firstTry = res.attempts === 1;
          say('ok', '✔ ' + (q.ok || 'Muito bem!') + (q.why ? '\n\n' + q.why : ''));
          afterSuccess();
          return;
        }
        GG.audio.sfx('bad');
        if (res.attempts === 1) {
          say('bad', '✘ ' + (r.fb ? r.fb + '\n' : '') + (q.recap || 'Releia a explicação e tente de novo.'));
        } else if (res.attempts === 2) {
          if (rend.reduce) rend.reduce();
          say('hint', '💡 ' + (r.fb ? r.fb + '\n' : '') + (q.hint2 || 'Veja a pista e tente mais uma vez.') + (q.type === 'mc' || q.type === 'multi' ? '\n(Algumas alternativas erradas foram retiradas.)' : ''));
          if (q.visual && o.visual) { const d = body.querySelector('.q-vis-d'); if (d) d.open = true; }
        } else {
          // 3º erro: versão guiada — o jogador precisa concluir a última etapa
          res.guided = true;
          stage = 'guided';
          const g = q.guided || autoGuided(q);
          const tp = g.type || 'fill';
          ask(g, tp);
          say('hint', '🧭 Vamos juntos, passo a passo. Complete o que falta.');
        }
      }
      function autoGuided(qq) {
        const ans = U.plain(qq.answer || '').split(/[;,.]\s*/).filter((s) => s.trim().length > 2).slice(0, 3);
        if (ans.length >= 2) return { type: 'fill', prompt: 'Complete a resposta:', text: ans.map((a, i) => '{' + i + '}').join(' • '), answers: ans, bank: [], prefill: ans.length - 1 };
        return { type: 'fill', prompt: 'Complete a resposta:', text: 'A resposta é: {0}', answers: [U.plain(qq.answer || 'ok').slice(0, 40)], bank: ['Não sei'], prefill: 0 };
      }
      function afterSuccess() {
        checkBtn.disabled = true;
        if (o.onEvent) o.onEvent('solved', res);
        const needConfirm = q.confirm && (res.attempts > 1 || res.guided || res.hintUsed || o.forceConfirm);
        const next = needConfirm
          ? UI.btn('Aplicar de novo ▶', 'pri', () => { stage = 'confirm'; ask(q.confirm, q.confirm.type || 'mc'); say('info', '🎯 Nova aplicação curta: mostre que entendeu!'); })
          : UI.btn(o.doneLabel || 'Voltar ao jogo ▶', 'pri', done);
        m.setActions([UI.btn('🔊 Ouvir explicação', 'small', () => GG.tts.speak(U.plain((q.ok || '') + ' ' + (q.why || '')))), next]);
        setTimeout(() => next.focus({ preventScroll: true }), 30);
      }
      function finishBtn() {
        const b = UI.btn(o.doneLabel || 'Voltar ao jogo ▶', 'pri', done);
        m.setActions([b]); setTimeout(() => b.focus({ preventScroll: true }), 30);
      }
      function done() {
        res.time = Math.round((Date.now() - res.started) / 1000);
        GG.tts.stop(); QZ._cur = null; m.close(); resolve(res);
      }
      if (preBlocks.length) showPre(); else ask();
    });
  };

  /** Pergunta curta sem explicação (checagens rápidas, placas, portais). Resolve {ok, attempts}. */
  QZ.quick = function (spec, opts) {
    const q = { id: (opts && opts.id) || 'check', title: (opts && opts.title) || 'Checagem rápida', prompt: spec.prompt, type: spec.type || 'mc', spec, why: spec.why, ok: spec.ok, recap: spec.recap, hint2: spec.hint2, confirm: null, guided: spec.guided, book: false };
    return QZ.run(q, Object.assign({ pre: false }, opts || {}));
  };
})();
