/* =====================================================================
   tools/autoplayer.js — "jogador automático" usado nos testes
   (injetado pelo Playwright; NÃO é carregado pelo jogo).
   Responde a diálogos, cartões e atividades pela interface real, usando
   o gancho EN.learn._cur para saber o gabarito. O perfil controla
   quantos erros ele comete de propósito:
     - otimo:  acerta tudo de primeira
     - medio:  erra 1 vez em ~35% das atividades
     - minimo: erra até cair na versão guiada em todas as atividades
   ===================================================================== */
(function () {
  'use strict';
  const A = window.__AP = { profile: 'otimo', log: [], acts: 0, wrongs: 0, running: false };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clean = (t) => String(t || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const norm = (t) => EN.util.norm(clean(t));
  const txt = (el) => norm(el.textContent);
  const click = (el) => { if (el && !el.disabled) { el.click(); return true; } return false; };
  const pointerTap = (el) => {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 7, isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', o));
    el.dispatchEvent(new PointerEvent('pointerup', o));
  };
  const btnByText = (root, re) => $$('button', root).find((b) => re.test(b.textContent) && !b.disabled && b.offsetParent !== null);
  let wrongPlan = new Map(); // chave da atividade → erros restantes
  let lastKey = null;

  function decideWrong(key) {
    if (wrongPlan.has(key)) return wrongPlan.get(key);
    let n = 0;
    if (A.profile === 'medio') n = Math.random() < 0.35 ? 1 : 0;
    if (A.profile === 'minimo') n = 2;
    wrongPlan.set(key, n);
    return n;
  }

  /* ---------------- respostas corretas por tipo ---------------- */
  function solve(area, spec, cur) {
    const t = spec.type;
    if (t === 'mc') { const ok = spec.options.find((o) => o.ok); return click($$('.opt', area).find((b) => txt(b).endsWith(norm(ok.t)))); }
    if (t === 'multi') { spec.options.filter((o) => o.ok).forEach((o) => { const b = $$('.opt', area).find((x) => txt(x).endsWith(norm(o.t))); if (b && !b.classList.contains('sel')) b.click(); }); return true; }
    if (t === 'tfj') { $$('.tfj-part', area).forEach((p, i) => { const part = i === 0 ? spec.partA : spec.partB; const ok = part.options.find((o) => o.ok); const b = $$('.opt', p).find((x) => txt(x) === norm(ok.t)); if (b && !b.classList.contains('sel')) b.click(); }); return true; }
    if (t === 'open') {
      const ta = $('textarea', area);
      const sp = cur.open || spec;
      ta.value = sp.groups.map((g) => g.kw[0].trim()).join(', ');
      ta.dispatchEvent(new Event('input', { bubbles: true })); return true;
    }
    if (t === 'order') {
      for (let guard = 0; guard < 20; guard++) {
        const slots = $$('.slot', area).sort((a, b) => a.dataset.si - b.dataset.si);
        const empty = slots.find((s) => !s.classList.contains('full'));
        if (!empty) break;
        const need = spec.items[+empty.dataset.si];
        const c = $$('.pool .card', area).find((x) => txt(x).endsWith(norm(need.t)));
        if (!c) break; pointerTap(c);
      }
      return true;
    }
    if (t === 'classify') {
      for (let guard = 0; guard < 30; guard++) {
        const c = $('.pool .card', area); if (!c) break;
        const card = spec.cards.find((k) => txt(c).endsWith(norm(k.t)));
        pointerTap(c);
        const bin = $$('.bin', area).find((b) => b.dataset.bin === card.bin);
        bin.click();
      }
      return true;
    }
    if (t === 'arrows') {
      const drawn = new Set($$('.edge-chip', area).map((c) => c.textContent));
      spec.edges.forEach(([a, b]) => {
        const na = spec.nodes.find((n) => n.id === a).t, nb = spec.nodes.find((n) => n.id === b).t;
        if ([...drawn].some((d) => d.startsWith(na + ' → ' + nb))) return;
        $('.gnode[data-id="' + a + '"]', area).click(); $('.gnode[data-id="' + b + '"]', area).click();
      });
      return true;
    }
    if (t === 'fill') {
      for (let guard = 0; guard < 10; guard++) {
        const blanks = $$('.blank', area); const bi = blanks.findIndex((b) => !b.classList.contains('full'));
        if (bi < 0) break;
        const w = $$('.word', area).find((x) => norm(x.textContent) === norm(spec.answers[+blanks[bi].dataset.bi]));
        if (!w) break; w.click();
      }
      return true;
    }
    if (t === 'hotspot') { spec.items.filter((i) => i.ok).forEach((i) => { const b = $$('.hot', area).find((x) => txt(x).endsWith(norm(i.t))); if (b && !b.classList.contains('sel')) b.click(); }); return true; }
    if (t === 'color') {
      spec.arrows.forEach((a) => {
        const col = spec.colors.find((c) => c.id === a.color);
        const pal = $$('.pal', area).find((p) => txt(p) === norm(col.label)); pal.click();
        const it = $('.arrow-item[data-id="' + a.id + '"]', area); if (it && !it.classList.contains('locked')) it.click();
      });
      return true;
    }
    if (t === 'numbers') {
      $$('.num-row', area).forEach((row, i) => {
        if (row.classList.contains('locked')) return;
        const v = () => +$('.num-v', row).textContent;
        const want = spec.rows[i].answer;
        const [minus, plus] = $$('.num-b', row);
        for (let g = 0; g < 30 && v() !== want; g++) (v() < want ? plus : minus).click();
      });
      return true;
    }
    if (t === 'chainbuild') {
      const saved = $$('.chain-row', area).length;
      const chains = EN.learn.validChains(spec);
      const used = new Set($$('.chain-row', area).map((r) => r.textContent));
      let k = 0;
      for (let n = saved; n < spec.need; n++) {
        const nm = (id) => spec.organisms.find((o) => o.id === id).t;
        while (k < chains.length && [...used].some((u) => { const names = u.split('→').map((x) => x.replace(/[^A-Za-zÀ-ÿ ]/g, '').trim()); return names.length === chains[k].length && chains[k].every((id, i) => names[i] === nm(id)); })) k++;
        const ch = chains[(k++) % chains.length];
        used.add(ch.map(nm).join(' → '));
        const cur2 = $('.chain-cur span', area).textContent;
        if (cur2.includes('→')) { for (let g = 0; g < 6; g++) btnByText(area, /Desfazer/).click(); }
        ch.forEach((id) => { const o = spec.organisms.find((x) => x.id === id); $$('.org', area).find((b) => txt(b) === norm(o.t)).click(); });
        btnByText(area, /Guardar/).click();
      }
      return true;
    }
    if (t === 'lakesim') { const b = btnByText(area, /Entrada de nutrientes/); for (let i = 0; i < 10; i++) b.click(); return true; }
    return false;
  }

  /* ---------------- respostas erradas por tipo ---------------- */
  function wrong(area, spec) {
    const t = spec.type;
    if (t === 'mc') { const w = spec.options.find((o) => !o.ok); if (!w) return solve(area, spec, {}); return click($$('.opt', area).find((b) => txt(b).endsWith(norm(w.t)))); }
    if (t === 'multi' || t === 'hotspot') {
      const list = t === 'multi' ? spec.options : spec.items;
      const sel = t === 'multi' ? '.opt' : '.hot';
      const w = list.find((o) => !o.ok);
      if (w) { const b = $$(sel, area).find((x) => txt(x).endsWith(norm(w.t))); if (b && !b.classList.contains('sel')) b.click(); return true; }
      const oks = list.filter((o) => o.ok); const b = $$(sel, area).find((x) => txt(x).endsWith(norm(oks[0].t))); if (b && !b.classList.contains('sel')) b.click(); return true;
    }
    if (t === 'tfj') { const p0 = $('.tfj-part', area); const w = spec.partA.options.find((o) => !o.ok); $$('.opt', p0).find((x) => txt(x) === norm(w.t)).click(); const p1 = $$('.tfj-part', area)[1]; $$('.opt', p1)[0].click(); return true; }
    if (t === 'open') { const ta = $('textarea', area); ta.value = 'não sei responder'; ta.dispatchEvent(new Event('input', { bubbles: true })); return true; }
    if (t === 'order') { for (let g = 0; g < 20; g++) { const cs = $$('.pool .card', area); if (!cs.length) break; pointerTap(cs[cs.length - 1]); } const sl = $$('.slot', area); if (sl.length && !sl.some((s) => s.classList.contains('wrong'))) { /* talvez já correto por acaso */ } return true; }
    if (t === 'classify') { for (let g = 0; g < 30; g++) { const c = $('.pool .card', area); if (!c) break; pointerTap(c); const card = spec.cards.find((k) => txt(c).endsWith(norm(k.t))); const bin = $$('.bin', area).find((b) => b.dataset.bin !== card.bin) || $('.bin', area); bin.click(); } return true; }
    if (t === 'arrows') { const [a, b] = spec.edges[spec.edges.length - 1]; $('.gnode[data-id="' + b + '"]', area).click(); $('.gnode[data-id="' + a + '"]', area).click(); return true; }
    if (t === 'fill') { for (let g = 0; g < 10; g++) { const blanks = $$('.blank', area); const bi = blanks.findIndex((b) => !b.classList.contains('full')); if (bi < 0) break; const ws = $$('.word', area); const w = ws.find((x) => norm(x.textContent) !== norm(spec.answers[+blanks[bi].dataset.bi])) || ws[0]; w.click(); } return true; }
    if (t === 'color') { const pal = $$('.pal', area)[0]; pal.click(); $$('.arrow-item', area).forEach((i) => { if (!i.classList.contains('locked')) i.click(); }); return true; }
    if (t === 'numbers') { $$('.num-row', area).forEach((row) => { if (!row.classList.contains('locked')) $$('.num-b', row)[1].click(); }); return true; }
    if (t === 'chainbuild') { const need = spec.need; for (let n = $$('.chain-row', area).length; n < need; n++) { const orgs = spec.organisms.filter((o) => !o.producer); $$('.org', area).find((b) => txt(b) === norm(orgs[n % orgs.length].t)).click(); $$('.org', area).find((b) => txt(b) === norm(orgs[(n + 1) % orgs.length].t)).click(); $$('.org', area).find((b) => txt(b) === norm(orgs[(n + 2) % orgs.length].t)).click(); btnByText(area, /Guardar/).click(); } return true; }
    return solve(area, spec, {});
  }

  /* ---------------- pré-atividades ---------------- */
  function doPre(m, pre) {
    const body = $('.m-body', m);
    if (pre.type === 'sim') { const re = pre.need === 'up' ? /^\+/ : /^−/; const b = $$('.sim-ctl .btn', body).find((x) => re.test(x.textContent.trim())); for (let i = 0; i < 3; i++) b.click(); if (pre.need === 'both') $$('.sim-ctl .btn', body)[1].click(); }
    if (pre.type === 'trace') pre.path.forEach((id) => $('.gnode[data-id="' + id + '"]', body).click());
    if (pre.type === 'observe') { for (let i = 0; i < 5; i++) { const b = $$('.area .btn', body)[0]; if (b && !b.disabled) b.click(); } }
    return click(btnByText($('.m-foot', m), /Continuar|observei/));
  }

  /* ---------------- laço principal ---------------- */
  let busyTick = false;
  function tick() {
    if (busyTick) return;
    busyTick = true;
    try { step(); } catch (e) { A.log.push('ERRO autoplayer: ' + e.message); } finally { busyTick = false; }
  }
  function step() {
    // diálogo / escolha
    const dlg = $$('.dlg-wrap').pop();
    const modal = $$('.modal-wrap').pop();
    const topIsDlg = dlg && (!modal || (dlg.compareDocumentPosition(modal) & Node.DOCUMENT_POSITION_PRECEDING));
    if (topIsDlg) {
      const opts = $$('.dlg-opts .btn', dlg);
      if (opts.length) { const pref = opts.find((b) => /Aceitar|Sim, vamos|Rever a explica|Jogar a Arena de novo/.test(b.textContent) && A.acceptAll) || opts[A.choice || 0] || opts[0]; pref.click(); return; }
      const nx = $$('.dlg-ctl .btn.pri', dlg)[0]; if (nx) nx.click(); return;
    }
    if (!modal) return;
    const m = $('.modal', modal);
    const foot = $('.m-foot', m);
    const cur = EN.learn._cur || {};
    if (m.classList.contains('act')) {
      // resultado?
      if ($('.fb.good', m)) { const c = btnByText(foot, /Continuar/); if (c) { click(c); A.acts++; EN.learn._cur = null; } return; }
      const again = btnByText(foot, /Tentar|versão/);
      if (again) { click(again); return; }
      if ($('.fb.warn', m) && btnByText(foot, /Conferir/)) { // autoavaliação da resposta aberta
        $$('.opts .opt', m).forEach((b) => b.click()); return;
      }
      if (cur.pre) { doPre(m, cur.pre); EN.learn._cur = null; return; }
      if (!cur.spec) return;
      const area = $('.area', m); if (!area || area.dataset.ap) return;
      const key = ($('.m-title', m).textContent) + '|' + (cur.spec.prompt || '') + '|' + (cur.spec.type);
      if (key !== lastKey) { lastKey = key; }
      const nWrong = decideWrong(key);
      const sub = btnByText(foot, /Verificar/) || $$('button', foot).find((b) => /Verificar/.test(b.textContent));
      if (!sub) return;
      area.dataset.ap = '1';
      if (nWrong > 0 && cur.spec.type !== 'lakesim') { wrong(area, cur.spec); wrongPlan.set(key, nWrong - 1); A.wrongs++; }
      else solve(area, cur.spec, cur);
      setTimeout(() => { if (!sub.disabled) sub.click(); else { A.log.push('Verificar desabilitado: ' + key); delete area.dataset.ap; } }, 20);
      return;
    }
    // cartões, recompensas, certificado etc.: botão principal
    const p = $$('.btn.pri', foot).filter((b) => !b.disabled).pop();
    if (p) { p.click(); return; }
    const any = $$('button', foot).filter((b) => !b.disabled && !/Voltar|Repetir|Ouvir/.test(b.textContent)).pop();
    if (any) any.click();
  }
  A.start = function (profile) { A.profile = profile || 'otimo'; wrongPlan = new Map(); if (!A.running) { A.running = true; A.iv = setInterval(tick, 15); } };
  A.stop = function () { clearInterval(A.iv); A.running = false; };
})();
