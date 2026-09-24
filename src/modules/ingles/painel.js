/* =====================================================================
   painel.js — PAINEL DO RESPONSÁVEL DO MÓDULO DE INGLÊS.
   Aberto pela Área dos Pais (exige a sessão dos pais: só a senha).
   • Matriz de cobertura do PDF: página, seção, enunciado original,
     tipo, respostas aceitas, explicação, fase e estado.
   • O que a criança digitou, tentativas, erros, dicas e alternativas
     (save REAL, somente leitura).
   • Filtros: página, ato, tipo (vocabulário, completar, pessoal,
     interrogativa, negativa…), campanha/extra e situação.
   • Testar o corretor (certa, errada, parcial) e ver as dicas
     progressivas — sem gravar nada.
   • Abrir qualquer questão, ato, explicação ou minijogo no sandbox;
     reiniciar SOMENTE o sandbox de Inglês.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, PA = GG.parentAuth, TM = GG.testMode, D = ING.data, C = ING.check;
  const REAL = 'ecoNexus.ingles.v1';
  const ROOT = '../../../';
  const box = document.getElementById('ip');
  if (!PA.active()) { location.replace(ROOT + 'src/pais/pais.html#teste'); return; }
  PA.watchActivity();
  if (TM.active()) TM.banner(ROOT);
  const save = (() => { try { return JSON.parse(localStorage.getItem(REAL) || 'null'); } catch (e) { return null; } })();
  const stOf = (id) => (save && save.q && save.q[id]) || null;
  const where = {}; D.acts.forEach((a) => a.steps.forEach((s, i) => { if (s.type === 'block') s.all.forEach((id) => { where[id] = { act: a, step: i, core: s.q.includes(id) }; }); }));
  const accepted = (q) => q.input === 'fill' ? q.blanks.map((b, i) => (q.blanks.length > 1 ? (i + 1) + ') ' : '') + b.join(' / ')).join('  ') : q.input === 'order' ? q.order.map((x, i) => (i + 1) + '. ' + x).join(' ') : q.personal ? 'Pessoal: ' + C.PERSONAL[q.personal].models.join(' / ') + ' (e variações coerentes)' : q.target ? 'Frase com “' + q.target.join(' / ') + '” (3+ palavras)' : q.accept.join(' / ');
  const situ = (s) => !s || !s.seen ? 'não vista' : !s.done ? 'vista' : s.tier === 1 ? 'de primeira' : s.alt ? 'com alternativas' : 'com dica/2ª tentativa';
  const sandbox = (p) => {
    if (!TM.active()) { if (!TM.start()) { UI.toast('Sessão dos pais expirada.'); return; } }
    location.href = window.ING_MANIFEST_TEST(p);
  };
  const arcade = (q) => { if (!TM.active() && !TM.start()) { UI.toast('Sessão dos pais expirada.'); return; } location.href = 'arcade.html?teste=1' + q; };
  window.ING_MANIFEST_TEST = (p) => 'jogar.html?teste=1' + Object.keys(p).map((k) => '&' + k + '=' + encodeURIComponent(p[k])).join('');

  function render(f) {
    f = Object.assign({ page: '', act: '', kind: '', core: '', situ: '' }, f || {});
    box.innerHTML = '';
    const sel = (key, label, opts) => { const s = U.el('select', { 'aria-label': label }, opts.map(([v, t]) => U.el('option', { value: v }, t))); s.value = f[key]; s.addEventListener('change', () => { f[key] = s.value; render(f); }); return s; };
    const L = D.questions.filter((q) => (!f.page || q.page === +f.page) && (!f.act || q.act === +f.act) && (!f.kind || q.kind === f.kind) && (!f.core || (f.core === 'core') === !!q.core) && (!f.situ || situ(stOf(q.id)) === f.situ));
    const done = D.questions.filter((q) => q.core && stOf(q.id) && stOf(q.id).done).length;
    const secs = new Set(D.questions.map((q) => q.page + q.sec));
    box.appendChild(U.el('div', { class: 'row', style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, [
      U.el('h1', { style: { flex: '1 1 300px' } }, '🚂 Inglês — Expresso dos Sonhos'),
      UI.btn('⬅ Área dos Pais', 'small', () => { location.href = ROOT + 'src/pais/pais.html#teste'; })
    ]));
    box.appendChild(U.el('section', { class: 'card' }, [U.el('div', { class: 'cards', style: { '--min': '170px' } }, [
      kpi(D.questions.length + ' questões', '11 páginas • ' + secs.size + ' seções do livro, todas no jogo'),
      kpi(D.core.length + ' na campanha', 'as outras ' + (D.questions.length - D.core.length) + ' são “extras” opcionais'),
      kpi(save ? done + '/' + D.core.length : '—', save ? 'feitas pela criança (campanha)' : 'Inglês ainda não jogado neste navegador'),
      kpi(save ? (save.tickets || []).length + '/3 🎫' : '—', 'Bilhetes-Palavra' + (save && save.finalDone ? ' • viagem concluída' : '')),
      kpi(save ? U.fmtDur((save.time || {}).total || 0) : '—', 'tempo aproximado')
    ])]));
    // atalhos para o sandbox
    const allSteps = []; D.acts.forEach((a) => a.steps.forEach((s, i) => allSteps.push([a.id + ':' + i, 'Ato ' + a.n + ' • ' + (i + 1) + '. ' + (s.type === 'lesson' ? '📘 ' + D.lessons[s.id].title : s.type === 'game' ? '🎮 ' + D.games[s.id].title : s.type === 'ticket' ? '🎫 Bilhete' : '📝 ' + s.title)])));
    const ss = U.el('select', { 'aria-label': 'Passo do ato' }, allSteps.map(([v, t]) => U.el('option', { value: v }, t)));
    box.appendChild(U.el('section', { class: 'card' }, [U.el('h2', null, '🧪 Abrir no sandbox (nada altera o save real)'),
      U.el('div', { class: 'filters' }, [ss, UI.btn('Abrir este passo', 'small pri', () => { const [a, i] = ss.value.split(':'); sandbox({ ato: a, passo: i }); })]),
      U.el('div', { class: 'filters' }, Object.keys(D.lessons).map((k) => UI.btn('📘 ' + D.lessons[k].title, 'small', () => sandbox({ licao: k }))).concat(Object.keys(D.games).map((k) => UI.btn('🎮 ' + D.games[k].title, 'small', () => sandbox({ minijogo: k }))))),
      U.el('div', { class: 'filters' }, [U.el('b', null, '🕹️ Arcade do Expresso (bônus, sem perguntas):'), UI.btn('Menu completo', 'small', () => arcade('')), UI.btn('Tela “Arcade liberado”', 'small', () => arcade('&recompensa=1'))].concat([['e1_galaxias', 'Quebra-Galáxias'], ['e1_invasores', 'Invasores Cósmicos'], ['e2_taxi', 'Táxi para o Aeroporto'], ['e2_voo', 'Voo do Avião'], ['e3_colunas', 'Colunas do Laboratório'], ['e3_bairro', 'Empilha o Bairro']].map(([id, t]) => UI.btn('🎮 ' + t, 'small', () => arcade('&jogo=' + id))))),
      U.el('div', { class: 'filters' }, [UI.btn('🗺️ Mapa (tudo liberado)', 'small', () => sandbox({ tela: 'mapa' })), UI.btn('🏁 Passagem de Volta', 'small', () => sandbox({ final: '1' })), UI.btn('📝 Revisão rápida', 'small', () => sandbox({ revisao: '1' })),
        UI.btn('♻️ Reiniciar só o sandbox de Inglês', 'small', async () => { if (await UI.confirm('Apagar SOMENTE o sandbox de Inglês? O progresso real não é tocado.', 'Reiniciar', 'Cancelar')) { GG.store.remove(TM.keyFor(REAL)); UI.toast('Sandbox de Inglês reiniciado.', 'ok'); } })]),
      U.el('p', { class: 'tip' }, TM.active() ? 'Modo de teste ATIVO.' : 'Ao abrir algo aqui, o modo de teste é iniciado automaticamente.')]));
    // filtros + matriz
    box.appendChild(U.el('section', { class: 'card' }, [U.el('h2', null, '📋 Matriz de cobertura do PDF (' + L.length + ')'),
      U.el('div', { class: 'filters' }, [
        sel('page', 'Página', [['', 'Todas as páginas']].concat([...Array(11)].map((_, i) => [String(i + 1), 'Página ' + (i + 1)]))),
        sel('act', 'Ato', [['', 'Todos os atos'], ['1', 'Ato 1 — Cidade Cósmica'], ['2', 'Ato 2 — Aeroporto'], ['3', 'Ato 3 — Laboratório']]),
        sel('kind', 'Tipo', [['', 'Todos os tipos']].concat(Object.keys(D.KINDS).map((k) => [k, D.KINDS[k]]))),
        sel('core', 'Campanha', [['', 'Campanha + extras'], ['core', 'Só campanha'], ['extra', 'Só extras']]),
        sel('situ', 'Situação', [['', 'Qualquer situação'], ['não vista', 'Não vista'], ['vista', 'Vista (sem concluir)'], ['de primeira', 'De primeira'], ['com dica/2ª tentativa', 'Com dica / 2ª tentativa'], ['com alternativas', 'Com alternativas']]),
        UI.btn('⬇️ CSV', 'small', () => csv(L))
      ]),
      U.el('div', { class: 'tbl-wrap', style: { maxHeight: '70vh' } }, U.el('table', { class: 'dt' }, [
        U.el('thead', null, U.el('tr', null, ['Pág.', 'Seção', 'Enunciado (livro)', 'Tipo', 'Respostas aceitas', 'Fase', 'Criança', 'Digitou', ''].map((h) => U.el('th', null, h)))),
        U.el('tbody', null, L.map((q) => {
          const s = stOf(q.id), w = where[q.id];
          return U.el('tr', null, [
            U.el('td', null, String(q.page)), U.el('td', null, q.section), U.el('td', { class: 'en', lang: 'en' }, q.prompt), U.el('td', null, D.KINDS[q.kind]),
            U.el('td', null, accepted(q)),
            U.el('td', null, (w ? 'Ato ' + w.act.n + ', passo ' + (w.step + 1) : '—') + (q.core ? '' : ' • extra')),
            U.el('td', null, situ(s) + (s ? ' • tent. ' + s.attempts + ' • erros ' + s.errors + ' • dicas ' + s.hints + (s.alt ? ' • alternativas' : '') : '')),
            U.el('td', { class: 'typed' }, (s && s.typed || []).slice(-4).map((t) => U.el('div', { class: t.ok ? 'ok' : 'no' }, (t.ok ? '✔ ' : '✖ ') + t.v + (t.copy ? ' (cópia)' : '')))),
            U.el('td', null, [UI.btn('Testar', 'small', () => tryIt(q)), UI.btn('Abrir', 'small pri', () => sandbox({ questao: q.id }))])
          ]);
        }))
      ]))]));
    box.appendChild(U.el('p', { class: 'tip' }, 'Estado de implementação: todas as questões acima estão no jogo (campanha ou extras). O áudio do livro não existe no projeto: os dois exercícios de Listening foram adaptados para leitura (completar) e ordenação, sem fingir que é o áudio oficial.'));
  }
  const kpi = (b, s) => U.el('div', { class: 'kpi' }, [U.el('b', null, b), U.el('span', null, s)]);
  function csv(L) {
    const esc = (x) => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"';
    const rows = [['id', 'pagina', 'secao', 'enunciado', 'tipo', 'aceitas', 'explicacao', 'ato', 'campanha', 'situacao', 'digitou']].concat(L.map((q) => { const s = stOf(q.id); return [q.id, q.page, q.section, q.prompt, D.KINDS[q.kind], accepted(q), U.plain(q.why), q.act, q.core ? 'sim' : 'extra', situ(s), (s && s.typed || []).map((t) => t.v).join(' | ')]; }));
    U.download('ingles-matriz.csv', rows.map((r) => r.map(esc).join(';')).join('\n'), 'text/csv');
  }
  /** Testar o corretor sem gravar nada. */
  function tryIt(q) {
    const m = UI.modal({ title: '🧪 ' + q.id + ' — testar o corretor', wide: true });
    const n = q.input === 'fill' ? q.blanks.length : 1;
    const ins = [...Array(q.input === 'order' ? 0 : n)].map((_, i) => U.el('input', { type: 'text', 'aria-label': 'Resposta ' + (i + 1), placeholder: q.input === 'fill' ? 'lacuna ' + (i + 1) : 'resposta' }));
    const out = U.el('div', { class: 'tr-out', 'aria-live': 'polite' }, '—');
    const run = (vals) => { const v = q.input === 'fill' ? vals : q.input === 'order' ? vals : vals[0]; const r = C.check(q, v); out.innerHTML = (r.ok ? '✅ ACEITA' + (r.typo ? ' (com aviso de escrita: ' + U.esc(r.typo) + ')' : '') : '❌ NÃO ACEITA — mensagem para a criança: ' + U.rich(r.msg || '')); };
    const md = (kind) => {
      const full = q.input === 'fill' ? q.blanks.map((b) => b[0]) : q.input === 'order' ? q.order.slice() : [String(C.model(q))];
      if (kind === 'certa') return full;
      if (kind === 'errada') return q.input === 'order' ? q.items.slice() : full.map(() => 'xyz');
      if (q.input === 'order') return [full[1], full[0]].concat(full.slice(2));
      return full.map((x, k) => (k === full.length - 1 ? (x.split(' ').length > 1 ? x.split(' ').filter((_, j) => j !== 1).join(' ') : x.slice(0, -1)) : x));
    };
    const use = (kind) => { const v = md(kind); ins.forEach((i, k) => { i.value = v[k]; }); run(v); };
    const ops = C.options(q, () => 0.3);
    const later = 'Depois de mais erros: ' + (ops ? 'alternativas — ' + ops.map((o) => o.join(' / ')).join(' • ') : q.input === 'order' ? 'as frases vão sendo fixadas no lugar' : 'cartões de palavras (Oficina de frases)') + '; em seguida a criança digita a resposta completa.';
    const kids = [
      U.el('p', { lang: 'en' }, [U.el('b', null, q.prompt)]), U.el('p', { class: 'tip' }, q.section + ' • página ' + q.page + ' • ' + D.KINDS[q.kind]),
      U.el('p', null, 'Aceitas: ' + accepted(q)), U.el('p', { html: 'Explicação: ' + U.rich(q.why) }),
      q.input === 'order' ? U.el('p', { class: 'tip' }, 'Ordenação: use os botões abaixo.') : U.el('div', { class: 'filters' }, ins.concat([UI.btn('Conferir', 'small pri', () => run(ins.map((i) => i.value)))])),
      U.el('div', { class: 'filters' }, [UI.btn('Resposta certa', 'small', () => use('certa')), UI.btn('Resposta errada', 'small', () => use('errada')), UI.btn('Parcialmente certa', 'small', () => use('parcial'))]),
      out,
      U.el('div', null, [U.el('b', null, 'Dicas progressivas:'), U.el('ol', null, [1, 2].map((lv) => U.el('li', { html: U.rich(C.hint(q, lv, () => 0.3)) })).concat([U.el('li', null, later)]))])
    ];
    m.body.appendChild(U.el('div', { class: 'tr-box' }, kids));
    m.setActions([UI.btn('Abrir no jogo (sandbox)', 'small', () => sandbox({ questao: q.id })), UI.btn('Fechar', 'pri', () => m.close())]);
  }
  render();
})();
