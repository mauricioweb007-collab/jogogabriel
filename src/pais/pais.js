/* =====================================================================
   src/pais/pais.js — ÁREA DOS PAIS / RESPONSÁVEIS.
   • Entrada pede SOMENTE a senha (sem usuário). A senha nunca é
     mostrada, registrada ou enviada; tentativas limitadas; sessão com
     expiração por inatividade (configurável) e saída imediata.
   • Painel: TODOS os dados da criança salvos neste navegador (somente
     leitura dos saves reais): progresso geral e por matéria, questões
     (acertos, erros, tentativas, pistas), conceitos, pontos e moedas,
     coleção, minigames, tempo de uso, versões, sincronização, erros.
   • Modo de teste: perfil SANDBOX separado, tudo liberado, acesso direto
     a matérias, fases, questões e minigames, simulações, gabarito.
   • Backup/restauração/exclusão do progresso real: nova senha +
     confirmação explícita do alvo.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, PA = GG.parentAuth, TM = GG.testMode;
  const ROOT = '../../';
  const $ = (id) => document.getElementById(id);
  const btn = UI.btn;
  const REAL_PROFILE = GG.profile.KEY;
  const readJSON = (k) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const fmtDate = (d) => { if (!d) return '—'; const x = new Date(d); return isNaN(x) ? '—' : x.toLocaleString('pt-BR'); };
  const dur = (s) => U.fmtDur(s || 0);
  const esc = U.esc;
  /** Perfil REAL (somente leitura; nunca o sandbox). */
  const realProfile = () => GG.fstore.read(REAL_PROFILE);
  const realSave = (m) => (m.franchise.saveNamespace ? readJSON(m.franchise.saveNamespace) : null);
  const gameKeys = () => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && /^(econexus|ecoNexus)/.test(k)) out.push(k); } return out.sort(); };
  const isSandboxKey = (k) => /^ecoNexus\.(teste|replay)\./.test(k) || /\.teste\./.test(k);

  /* ================================================================ ENTRADA */
  function showLogin(msg) {
    $('pApp').classList.add('hide'); $('pLogin').classList.remove('hide');
    const m = $('pMsg'); m.textContent = msg || '';
    const inp = $('pPass'); inp.value = ''; setTimeout(() => inp.focus(), 50);
    tickLock();
  }
  let lockTimer = 0;
  function tickLock() {
    clearInterval(lockTimer);
    const upd = () => { const w = PA.lockedFor(); $('pGo').disabled = w > 0; if (w > 0) $('pMsg').textContent = 'Muitas tentativas. Aguarde ' + w + ' s.'; else if (/Aguarde/.test($('pMsg').textContent)) $('pMsg').textContent = ''; if (!w) clearInterval(lockTimer); };
    upd(); lockTimer = setInterval(upd, 1000);
  }
  $('pLoginForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const inp = $('pPass'); const v = inp.value; inp.value = '';
    const r = PA.login(v);
    if (r.ok) { $('pMsg').textContent = ''; openApp(); }
    else { $('pMsg').textContent = r.wait ? 'Muitas tentativas. Aguarde ' + r.wait + ' s.' : 'Senha incorreta.'; tickLock(); inp.focus(); }
  });

  /* ================================================================ PAINEL */
  const SECTIONS = [
    ['geral', '📊', 'Visão geral'], ['questoes', '📘', 'Matérias e questões'], ['pontos', '⭐', 'Pontos e moedas'], ['colecao', '🧸', 'Coleção e itens'],
    ['minigames', '🕹️', 'Minigames'], ['dados', '🗄️', 'Dados locais'], ['teste', '🧪', 'Modo de teste'], ['backup', '🛡️', 'Backup e segurança'], ['erros', '🐞', 'Erros técnicos'], ['config', '⚙️', 'Configurações']
  ];
  let cur = 'geral', banks = null;
  async function openApp() {
    $('pLogin').classList.add('hide'); $('pApp').classList.remove('hide');
    PA.watchActivity();
    const rail = $('pRail'); rail.innerHTML = '';
    rail.appendChild(U.el('div', { class: 'brand' }, '👪 Área dos Pais'));
    SECTIONS.forEach(([id, ic, t]) => { const b = U.el('button', { type: 'button', 'data-sec': id }, [U.el('span', { class: 'ic' }, ic), U.el('span', { class: 'tx' }, t)]); b.addEventListener('click', () => go(id)); rail.appendChild(b); });
    const p = realProfile();
    $('pChild').textContent = (p && p.displayNameUppercase) || 'Criança (nome ainda não informado)';
    $('pSub').textContent = ' • dados salvos neste navegador';
    if (TM.active()) TM.banner(ROOT);
    const h = location.hash.slice(1);
    go(h === 'teste-necessario' || h === 'saiu' || h === 'expirou' ? 'teste' : SECTIONS.some((x) => x[0] === h) ? h : 'geral');
    if (h === 'teste-necessario') UI.toast('Para abrir uma versão de teste, inicie o modo de teste aqui.', '', 4000);
    if (h === 'saiu') UI.toast('Modo de teste encerrado. O perfil da criança não foi alterado.', 'ok', 4000);
  }
  function go(id) {
    cur = id; U.$$('button', $('pRail')).forEach((b) => b.classList.toggle('on', b.dataset.sec === id));
    const v = $('pView'); v.innerHTML = ''; v.focus({ preventScroll: true }); window.scrollTo(0, 0);
    ({ geral, questoes, pontos, colecao, minigames, dados, teste, backup, erros, config })[id](v);
    history.replaceState(null, '', '#' + id);
  }
  $('pLogout').addEventListener('click', () => { PA.logout(); location.href = ROOT + 'inicio.html'; });
  $('pToGame').addEventListener('click', () => { location.href = ROOT + 'inicio.html'; });
  setInterval(() => {
    if ($('pApp').classList.contains('hide')) return;
    if (!PA.active()) { $('pApp').classList.add('hide'); showLogin('Sessão encerrada por inatividade. Digite a senha de novo.'); return; }
    const s = PA.remaining(); $('pSess').textContent = '⏱ sessão: ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }, 1000);

  const card = (title, kids) => U.el('section', { class: 'card' }, [title ? U.el('h2', null, title) : null].concat(kids || []));
  const kpi = (b, s) => U.el('div', { class: 'kpi' }, [U.el('b', null, b), U.el('span', null, s)]);
  const table = (heads, rows, onRow) => U.el('div', { class: 'tbl-wrap' }, U.el('table', { class: 'dt' }, [U.el('thead', null, U.el('tr', null, heads.map((h) => U.el('th', null, h)))), U.el('tbody', null, rows.map((r, i) => { const tr = U.el('tr', { class: onRow ? 'click' : '' }, r.map((c) => U.el('td', null, c == null ? '—' : c))); if (onRow) { tr.tabIndex = 0; tr.addEventListener('click', () => onRow(i)); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') onRow(i); }); } return tr; }))]));
  const statusOf = (s) => !s ? ['não vista', 'no'] : s.done && s.tier === 1 ? ['dominada', 'top'] : s.done ? ['concluída', 'ok'] : s.seen ? ['vista', 'warn'] : ['não vista', 'no'];
  const st = (t, k) => U.el('span', { class: 'st ' + k }, t);

  /* ---------------- 1. visão geral ---------------- */
  function geral(v) {
    const p = realProfile() || GG.profile.fresh(false);
    const lv = GG.FR.levelFor(p.careerPoints || 0);
    const mods = GG.modules.list();
    v.appendChild(U.el('h1', null, '📊 Visão geral'));
    v.appendChild(card(null, [U.el('div', { class: 'cards', style: { '--min': '170px' } }, [
      kpi('⭐ ' + U.fmtInt(p.careerPoints || 0), 'Pontuação de Carreira'), kpi('🪙 ' + U.fmtInt(p.nexusCoins || 0), 'Moedas Nexus (saldo)'),
      kpi('Nível ' + lv.level, lv.name), kpi(Object.keys(p.collectibles || {}).length + '/' + GG.catalog.list.length, 'Nexóticos'),
      kpi(dur((p.time || {}).nexusSec), 'Tempo no Nexus (aprox.)')
    ])]));
    v.appendChild(card('Progresso por matéria', [U.el('div', { class: 'cards', style: { '--min': '260px' } }, mods.map((m) => {
      const F = m.franchise; const S = realSave(m); let s = {}; try { s = S && F.stats ? F.stats(S) : {}; } catch (e) { s = {}; }
      return U.el('div', { class: 'kpi', style: { boxShadow: 'inset 0 0 0 2px ' + F.color, gap: '6px' } }, [
        U.el('b', null, F.icon + ' ' + F.title), F.comingSoon ? U.el('span', null, 'Jogo ainda não criado') : !S ? U.el('span', null, 'Ainda não jogado neste navegador') : U.el('span', null, (s.percent || 0) + '% • questões ' + (s.questionsDone || 0) + '/' + (s.questionsTotal || 0) + ' • de primeira ' + (s.firstTry || 0)),
        S && !F.comingSoon ? U.el('span', null, 'Missões ' + (s.missionsDone || 0) + '/' + (s.missionsTotal || 0) + ' • chefes ' + (s.bossesDone || 0) + '/' + (s.bossesTotal || 0) + ' • tempo ≈ ' + dur(s.timeSec)) : null,
        S && s.lastPlace ? U.el('span', null, 'Último lugar: ' + s.lastPlace) : null
      ]);
    }))]));
    const audit = realProfile() ? GG.bridge.audit(p) : [];
    const outbox = readJSON(GG.bridge.OUTBOX) || [];
    v.appendChild(card('Versões e sincronização', [table(['Item', 'Valor'], [
      ['Perfil (schema)', 'v' + (p.schemaVersion || 1) + ' • id ' + (p.profileId || '—')],
      ['Criado / atualizado', fmtDate(p.createdAt) + ' / ' + fmtDate(p.updatedAt)],
      ['Última sincronização', fmtDate(p.lastSyncAt)],
      ['Eventos na fila local', String(outbox.length)],
      ['Integridade do livro-razão', audit.length ? '⚠️ ' + audit.join('; ') : '✅ confere'],
      ['Módulos', mods.map((m) => m.franchise.moduleId + ' ' + m.franchise.version).join(' • ')],
      ['Pacotes de Nexóticos', GG.catalog.packs.map((x) => x.packId + ' ' + x.version + ' (' + x.count + ')').join(' • ')],
      ['Importações (migração)', Object.keys(p.migrationMarkers || {}).map((k) => k + ': ' + p.migrationMarkers[k].points + ' pts em ' + fmtDate(p.migrationMarkers[k].at)).join(' • ') || 'nenhuma ainda']
    ])]));
  }

  /* ---------------- 2. questões ---------------- */
  async function loadBanks() {
    if (banks) return banks;
    banks = {};
    for (const m of GG.modules.list()) {
      const qb = m.franchise.questionBank; if (!qb) continue;
      try { if (qb.prepare) qb.prepare(); await U.loadScripts(qb.scripts.map((s) => ROOT + s)); banks[m.franchise.moduleId] = qb.build(); } catch (e) { GG.errlog.add('pais', 'banco ' + m.franchise.moduleId + ': ' + e.message); banks[m.franchise.moduleId] = []; }
    }
    return banks;
  }
  async function questoes(v, opts) {
    opts = Object.assign({ mod: null, status: 'todas' }, opts || {});
    v.appendChild(U.el('h1', null, '📘 Matérias e questões'));
    v.appendChild(U.el('p', { class: 'tip' }, 'Dados reais da criança (somente leitura). Toque numa questão para ver enunciado, gabarito e critérios — visíveis só aqui.'));
    const B = await loadBanks();
    const mods = GG.modules.list().filter((m) => B[m.franchise.moduleId] && B[m.franchise.moduleId].length);
    if (!mods.length) { v.appendChild(card(null, [U.el('p', null, 'Nenhum banco de questões encontrado.')])); return; }
    const mod = opts.mod || mods[0].franchise.moduleId;
    const m = GG.modules.get(mod), qb = m.franchise.questionBank, S = realSave(m);
    const filters = U.el('div', { class: 'filters' }, mods.map((x) => btn(x.franchise.icon + ' ' + x.franchise.title, x.franchise.moduleId === mod ? 'pri small' : 'small', () => { const vv = $('pView'); vv.innerHTML = ''; questoes(vv, { mod: x.franchise.moduleId }); })));
    const sel = U.el('select', { 'aria-label': 'Filtrar por situação' }, ['todas', 'não vista', 'vista', 'concluída', 'dominada', 'com erro'].map((x) => U.el('option', { value: x }, x)));
    sel.value = opts.status; sel.addEventListener('change', () => { const vv = $('pView'); vv.innerHTML = ''; questoes(vv, { mod, status: sel.value }); });
    filters.appendChild(U.el('label', null, ' Situação: ')); filters.appendChild(sel);
    v.appendChild(filters);
    const list = B[mod];
    const rows = [], idx = [];
    list.forEach((q, i) => {
      const s = qb.statsFor(S, q.id); const [t, k] = statusOf(s);
      if (opts.status !== 'todas' && !(opts.status === t || (opts.status === 'com erro' && s && s.errors > 0))) return;
      idx.push(i);
      rows.push([q.id, q.title, q.group || '', st(t, k), s ? String(s.attempts) : '0', s ? String(s.errors) : '0', s && s.hints ? 'sim' : 'não', s && s.guided ? 'sim' : 'não', s && s.first ? '✅' : '—']);
    });
    const done = list.filter((q) => { const s = qb.statsFor(S, q.id); return s && s.done; }).length;
    v.appendChild(card(m.franchise.icon + ' ' + m.franchise.title + ' — ' + done + '/' + list.length + ' concluídas', [table(['ID', 'Título', 'Onde', 'Situação', 'Tentativas', 'Erros', 'Pista', 'Guiada', '1ª'], rows, (i) => qDetail(mod, idx[i], false))]));
    // conceitos
    const C = qb.concepts ? qb.concepts(S) : {};
    const dom = [], rev = [];
    Object.keys(C).forEach((k) => { const c = C[k]; if ((c.wrong | 0) > 0 && (c.wrong | 0) >= (c.ok | 0)) rev.push(k + ' (' + (c.ok | 0) + ' ✔ / ' + (c.wrong | 0) + ' ✖)'); else if ((c.ok | 0) > 0) dom.push(k + ' (' + (c.ok | 0) + ' ✔' + (c.wrong ? ' / ' + c.wrong + ' ✖' : '') + ')'); });
    v.appendChild(card('Conceitos', [U.el('div', { class: 'cards', style: { '--min': '300px' } }, [
      U.el('div', null, [U.el('b', null, '✅ Dominados'), dom.length ? U.el('ul', null, dom.map((x) => U.el('li', null, x))) : U.el('p', { class: 'tip' }, 'Ainda sem dados.')]),
      U.el('div', null, [U.el('b', null, '🔁 Precisam de revisão'), rev.length ? U.el('ul', null, rev.map((x) => U.el('li', null, x))) : U.el('p', { class: 'tip' }, 'Nenhum conceito com mais erros que acertos.')])
    ])]));
  }
  /** Critérios de correção a partir dos formatos usados nos bancos (opções, grupos, ordem…). */
  function criteria(q) {
    const sp = q.spec || {}; const out = [];
    const opts = sp.options || sp.opts || sp.choices;
    if (Array.isArray(opts)) out.push(U.el('ul', null, opts.map((o) => U.el('li', { class: o && o.ok ? 'opt-ok' : 'opt-no' }, (o && o.ok ? '✔ ' : '✖ ') + (o && (o.t || o.text || o.label) || String(o)) + (o && o.fb ? ' — ' + U.plain(o.fb) : '')))));
    if (Array.isArray(sp.groups)) out.push(U.el('div', null, [U.el('p', { class: 'tip' }, 'Resposta aberta: precisa de ' + (sp.min || 1) + ' destas ideias (palavras-chave):'), U.el('ul', null, sp.groups.map((g) => U.el('li', null, (g.label || '') + (g.kw ? ' — ' + g.kw.slice(0, 8).join(', ') + (g.kw.length > 8 ? '…' : '') : ''))))]));
    if (Array.isArray(sp.order)) out.push(U.el('ol', null, sp.order.map((x) => U.el('li', null, typeof x === 'string' ? x : (x.t || JSON.stringify(x))))));
    if (Array.isArray(sp.items) && !opts) out.push(U.el('ul', null, sp.items.map((x) => U.el('li', null, (x.t || x.text || x.label || JSON.stringify(x)) + (x.group != null ? ' → ' + x.group : x.g != null ? ' → ' + x.g : '')))));
    if (!out.length) out.push(U.el('p', { class: 'tip' }, 'Formato especial (' + (q.type || '?') + '): veja os metadados completos abaixo.'));
    return out;
  }
  /** Ficha de uma questão com navegação anterior/próxima. sandbox=true: simulações. */
  async function qDetail(mod, i, sandbox) {
    const B = await loadBanks(); const list = B[mod]; const q = list[i]; if (!q) return;
    const m = GG.modules.get(mod), qb = m.franchise.questionBank;
    const dlg = UI.modal({ title: (sandbox ? '🧪 ' : '') + q.id + ' — ' + q.title, wide: true });
    const s = sandbox ? simGet(mod, q.id) : qb.statsFor(realSave(m), q.id);
    const [t, k] = sandbox ? [s.state, s.state === 'dominado' ? 'top' : s.state === 'concluído' ? 'ok' : s.state === 'bloqueado' ? 'no' : 'warn'] : statusOf(s);
    dlg.body.appendChild(U.el('div', { class: 'qbox' }, [
      U.el('div', { class: 'row' }, [st(t, k), U.el('span', { class: 'chip' }, m.franchise.icon + ' ' + (q.group || '')), q.concept ? U.el('span', { class: 'chip' }, '💡 ' + q.concept) : null, U.el('span', { class: 'chip' }, 'Tipo: ' + (q.type || '?'))]),
      s ? U.el('p', { class: 'tip' }, sandbox ? 'Sandbox — tentativas: ' + s.attempts + ' • erros: ' + s.errors + ' • pistas: ' + s.hints : 'Tentativas: ' + s.attempts + ' • erros: ' + s.errors + ' • pista: ' + (s.hints ? 'sim' : 'não') + ' • guiada: ' + (s.guided ? 'sim' : 'não') + ' • de primeira: ' + (s.first ? 'sim' : 'não')) : null,
      U.el('div', null, [U.el('div', { class: 'lbl' }, 'Enunciado'), U.el('p', { html: U.rich(q.prompt || '') })]),
      q.where ? U.el('div', null, [U.el('div', { class: 'lbl' }, 'Onde aparece'), U.el('p', null, q.where)]) : null,
      U.el('div', { class: 'ans' }, [U.el('div', { class: 'lbl' }, 'Gabarito (somente responsáveis)'), U.el('p', { html: U.rich(q.answer || q.model || '—') })].concat(q.model && q.model !== q.answer ? [U.el('p', { class: 'tip', html: 'Resposta-modelo: ' + U.rich(q.model) })] : [])),
      U.el('div', null, [U.el('div', { class: 'lbl' }, 'Critérios de correção')].concat(criteria(q))),
      q.why ? U.el('div', null, [U.el('div', { class: 'lbl' }, 'Explicação'), U.el('p', { html: U.rich(q.why) })]) : null,
      q.err ? U.el('div', null, [U.el('div', { class: 'lbl' }, 'Erro comum'), U.el('p', { html: U.rich(q.err) })]) : null,
      U.el('div', null, [U.el('div', { class: 'lbl' }, 'Pistas'), U.el('p', { html: '1) ' + U.rich(q.hint1 || '—') + '<br>2) ' + U.rich(q.hint2 || '—') })]),
      U.el('details', null, [U.el('summary', null, 'Metadados completos (JSON)'), U.el('pre', { class: 'json' }, JSON.stringify(q.raw, null, 2))])
    ]));
    const acts = [btn('◀ Anterior', 'small', () => { dlg.close(); qDetail(mod, (i - 1 + list.length) % list.length, sandbox); }), btn('Próxima ▶', 'small', () => { dlg.close(); qDetail(mod, (i + 1) % list.length, sandbox); })];
    if (sandbox) {
      acts.push(btn('✅ Simular acerto', 'small go', () => { sim(mod, q.id, 'acerto'); dlg.close(); qDetail(mod, i, true); }));
      acts.push(btn('❌ Simular erro', 'small', () => { sim(mod, q.id, 'erro'); dlg.close(); qDetail(mod, i, true); }));
      acts.push(btn('💡 Simular pista', 'small', () => { sim(mod, q.id, 'pista'); dlg.close(); qDetail(mod, i, true); }));
      acts.push(btn('🏁 Simular conclusão', 'small pri', () => { sim(mod, q.id, 'conclusao'); dlg.close(); qDetail(mod, i, true); }));
      const ss = U.el('select', { 'aria-label': 'Estado da questão no sandbox' }, ['bloqueado', 'liberado', 'concluído', 'dominado'].map((x) => U.el('option', { value: x }, 'Estado: ' + x))); ss.value = s.state;
      ss.addEventListener('change', () => { simSet(mod, q.id, { state: ss.value }); UI.toast('Estado no sandbox: ' + ss.value, 'ok'); });
      acts.push(ss);
      const te = m.franchise.testEntry;
      if (te && mod === 'geografia') acts.push(btn('▶ Responder como aluno', 'small info', () => { location.href = ROOT + te({ questao: q.id }); }));
      if (te && mod === 'ciencias') acts.push(btn('▶ Abrir região no jogo', 'small info', () => { location.href = ROOT + te({ preset: 'completo', mapa: q.raw.map || q.raw.region }); }));
    }
    acts.push(btn('Fechar', 'ghost small', () => dlg.close()));
    dlg.setActions(acts);
  }

  /* ---------------- simulações no sandbox (nunca no perfil real) ---------------- */
  function simGet(mod, id) { const p = GG.profile.load(); const x = ((p.qsim || {})[mod] || {})[id]; return Object.assign({ state: 'liberado', attempts: 0, errors: 0, hints: 0 }, x || {}); }
  function simSet(mod, id, patch) { if (!TM.active()) return; GG.profile.update((p) => { p.qsim = p.qsim || {}; p.qsim[mod] = p.qsim[mod] || {}; p.qsim[mod][id] = Object.assign(simGet(mod, id), p.qsim[mod][id] || {}, patch); }); }
  function sim(mod, id, what) {
    if (!TM.active()) { UI.toast('Inicie o modo de teste primeiro.', ''); return; }
    const s = simGet(mod, id);
    if (what === 'acerto') { s.attempts++; s.state = s.errors || s.hints ? 'concluído' : 'dominado'; }
    if (what === 'erro') { s.attempts++; s.errors++; }
    if (what === 'pista') { s.hints++; }
    if (what === 'conclusao') { s.state = s.errors || s.hints ? 'concluído' : 'dominado'; }
    simSet(mod, id, s);
    if (what === 'acerto' || what === 'conclusao') {
      // pontuação simulada: evento com testMode:true, aceito SOMENTE pelo perfil sandbox
      const P = GG.FR.points;
      GG.profile.update((p) => { const pts = P.questionDone + (s.state === 'dominado' ? P.questionTier1 + P.questionTier2 : 0); const r = GG.bridge.apply(p, GG.bridge.makeEvent(p, mod, { sourceType: 'question', sourceId: id, variant: 'simulado-' + Date.now().toString(36), scoreEarned: pts })); if (r.applied) UI.toast('Sandbox: +' + r.points + ' pontos simulados (' + r.coins + ' moedas).', 'ok'); });
    }
  }

  /* ---------------- 3. pontos e moedas ---------------- */
  function pontos(v) {
    const p = realProfile() || GG.profile.fresh(false);
    v.appendChild(U.el('h1', null, '⭐ Pontos e moedas'));
    v.appendChild(card(null, [U.el('div', { class: 'cards', style: { '--min': '180px' } }, [kpi(U.fmtInt(p.careerPoints || 0), 'Pontuação de Carreira'), kpi(U.fmtInt(p.nexusCoins || 0), 'Saldo de Moedas Nexus'), kpi(U.fmtInt(p.coinsEarnedTotal || 0), 'Moedas ganhas no total'), kpi(U.fmtInt(p.coinsSpentTotal || 0), 'Moedas gastas'), kpi(String(p.conversionRemainder || 0), 'Resto para a próxima moeda')])]));
    v.appendChild(U.el('p', { class: 'tip' }, 'Regra: cada ' + GG.FR.pointsPerCoin + ' pontos de estudo = 1 Moeda Nexus. Gastar moedas não reduz a Pontuação de Carreira. Replays no Fliperama não geram pontos.'));
    const byMod = {}; (p.scoreLedger || []).forEach((e) => { byMod[e.moduleId] = (byMod[e.moduleId] || 0) + e.points; });
    v.appendChild(card('Origem dos pontos por matéria', [table(['Matéria', 'Pontos'], Object.keys(byMod).map((k) => [k, U.fmtInt(byMod[k])]))]));
    v.appendChild(card('Livro-razão de pontos (' + (p.scoreLedger || []).length + ')', [table(['Quando', 'Matéria', 'Tipo', 'Origem', 'Pontos', 'Moedas'], (p.scoreLedger || []).slice().reverse().map((e) => [fmtDate(e.appliedAt), e.moduleId, e.sourceType, e.sourceId + (e.eventId.split(':')[3] ? ' (' + e.eventId.split(':')[3] + ')' : ''), String(e.points), String(e.coins)]))]));
    v.appendChild(card('Histórico de Moedas Nexus (' + (p.transactionLedger || []).length + ')', [table(['Quando', 'Tipo', 'Valor', 'Saldo', 'Descrição', 'ID'], (p.transactionLedger || []).slice().reverse().map((t) => [fmtDate(t.at), t.type, String(t.amount) + (t.fragments ? ' (🧩 ' + t.fragments + ')' : '') + (t.materials ? ' (💎 ' + t.materials + ')' : ''), String(t.balance), t.label || '', t.txnId]))]));
  }

  /* ---------------- 4. coleção e itens ---------------- */
  function colecao(v) {
    const p = realProfile() || GG.profile.fresh(false);
    v.appendChild(U.el('h1', null, '🧸 Coleção e itens'));
    v.appendChild(card('Nexóticos (' + Object.keys(p.collectibles || {}).length + '/' + GG.catalog.list.length + ')', [table(['Nexótico', 'Mundo', 'Raridade', 'Poder', 'Situação', 'Como conseguiu'], GG.catalog.sorted().map((c) => { const o = (p.collectibles || {})[c.id]; return [c.name, c.world, GG.FR.rarityById(c.rarity).label, c.power.name, o ? '✅ ' + fmtDate(o.at) : '—', o ? o.via + (o.label ? ' — ' + o.label : '') : '']; }))]));
    v.appendChild(card('Equipe e companheiro', [U.el('p', null, (p.team || []).map((id) => (GG.catalog.get(id) || {}).name).join(', ') || 'nenhum')]));
    v.appendChild(card('Itens comprados', [table(['Item', 'Tipo', 'Quando'], Object.keys(p.inventory || {}).map((id) => { const it = GG.nexusItem(id) || { name: id, slot: '?' }; return [it.name, GG.NEXUS_SLOTS[it.slot] || it.slot, fmtDate(p.inventory[id].at)]; }))]));
    v.appendChild(card('Outros', [U.el('ul', null, [U.el('li', null, 'Fragmentos: ' + (p.fragments || 0)), U.el('li', null, 'Cristais de Decoração: ' + (p.materials || 0)), U.el('li', null, 'Decorações na casa: ' + ((p.decorations || {}).placed || []).length), U.el('li', null, 'Cápsulas abertas: ' + ((p.capsule || {}).opened || 0)), U.el('li', null, 'Cenas do parque vistas: ' + Object.keys((p.seen || {}).dialogs || {}).length)])]));
  }

  /* ---------------- 5. minigames ---------------- */
  function minigames(v) {
    const p = realProfile() || GG.profile.fresh(false);
    v.appendChild(U.el('h1', null, '🕹️ Minigames'));
    v.appendChild(U.el('p', { class: 'tip' }, 'Liberados = já encontrados/concluídos no jogo de origem (ou por nível do Nexus, nos recreativos). No modo de teste, todos ficam liberados.'));
    v.appendChild(card(null, [table(['Minigame', 'Origem', 'Gênero', 'Liberado', 'Recorde', 'Medalhas', 'Partidas', 'Como liberar'], GG.unlocks.all().map((g) => { const md = ((p.arcade || {}).medals || {})[g.minigameId] || {}; const rec = ((p.arcade || {}).records || {})[g.minigameId]; return [g.title, g.module, g.genre, (p.unlockedMinigames || {})[g.minigameId] ? '✅ ' + fmtDate(p.unlockedMinigames[g.minigameId].at) : '—', rec ? String(rec.score) : '—', (md.bronze ? '🥉' : '') + (md.prata ? '🥈' : '') + (md.ouro ? '🥇' : ''), String(((p.arcade || {}).plays || {})[g.minigameId] || 0), g.unlockText || '']; }))]));
  }

  /* ---------------- 6. dados locais ---------------- */
  function dados(v) {
    v.appendChild(U.el('h1', null, '🗄️ Dados locais'));
    v.appendChild(U.el('p', { class: 'tip' }, 'Tudo o que os jogos guardaram neste navegador (nada é enviado para a internet). Chaves de teste/replay aparecem marcadas.'));
    const rows = gameKeys().map((k) => { const raw = localStorage.getItem(k) || ''; return [k, isSandboxKey(k) ? '🧪 sandbox/replay' : '👦 criança', (raw.length / 1024).toFixed(1) + ' KB']; });
    v.appendChild(card('Chaves', [table(['Chave', 'Tipo', 'Tamanho'], rows, (i) => { const k = gameKeys()[i]; const d = UI.modal({ title: k, wide: true }); let pretty = localStorage.getItem(k); try { pretty = JSON.stringify(JSON.parse(pretty), null, 2); } catch (e) { /* texto */ } d.body.appendChild(U.el('pre', { class: 'json' }, pretty)); d.setActions([btn('⬇️ Baixar', 'small', () => U.download(k + '.json', pretty, 'application/json')), btn('Fechar', 'pri small', () => d.close())]); })]));
  }

  /* ---------------- 7. modo de teste ---------------- */
  async function teste(v) {
    v.appendChild(U.el('h1', null, '🧪 Modo de teste completo'));
    const on = TM.active();
    v.appendChild(card(null, [
      U.el('p', null, 'O modo de teste usa um PERFIL SANDBOX separado: tudo liberado (mundos, fases, questões, minigames, Nexóticos, itens). Nada feito nele altera pontos, moedas, inventário, respostas, recordes ou conquistas da criança. Uma faixa amarela fica visível o tempo todo.'),
      U.el('div', { class: 'row' }, on ? [st('ATIVO', 'top'), btn('⏹ Sair do modo de teste', 'pri', () => { TM.stop(); location.hash = 'teste'; location.reload(); }), btn('♻️ Reiniciar somente o sandbox', '', async () => { if (await UI.confirm('Apagar SOMENTE os dados de teste (sandbox)? O progresso da criança não é tocado.', 'Reiniciar sandbox', 'Cancelar')) { const n = TM.resetSandbox(); UI.toast(n + ' chave(s) de teste apagadas.', 'ok'); go('teste'); } })]
          : [btn('▶ Iniciar modo de teste', 'go', () => { if (TM.start()) { location.hash = 'teste'; location.reload(); } })])
    ]));
    if (!on) return;
    const sp = GG.profile.load(); // sandbox
    // atalhos por matéria
    const mods = GG.modules.list();
    v.appendChild(card('🎮 Abrir jogos (sandbox)', [U.el('div', { class: 'cards', style: { '--min': '280px' } }, [
      U.el('div', { class: 'kpi' }, [U.el('b', null, '🌀 Gabriel Nexus'), U.el('div', { class: 'row' }, [btn('Hub', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html'; }), btn('Fliperama', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#fliperama'; }), btn('Loja', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#loja'; }), btn('Parque', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#parque'; }), btn('Casa', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#base'; }), btn('Oficina', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#oficina'; }), btn('Galeria', 'small', () => { location.href = ROOT + 'src/nexus/nexus.html#galeria'; })]), U.el('span', null, 'Lançador em modo teste: '), btn('Central de Missões', 'small ghost', () => { location.href = ROOT + 'inicio.html'; })])
    ].concat(mods.filter((m) => m.franchise.testEntry).map((m) => {
      const F = m.franchise; const s = U.el('select', { 'aria-label': 'Fase / região de ' + F.title }, (F.testTargets || []).map((t) => U.el('option', { value: t.id }, t.t)));
      const box = U.el('div', { class: 'kpi' }, [U.el('b', null, F.icon + ' ' + F.title), s]);
      if (m.franchise.moduleId === 'ciencias') box.appendChild(U.el('div', { class: 'row' }, [btn('Jogo novo', 'small', () => { location.href = ROOT + F.testEntry({ preset: 'novo' }); }), btn('Tudo concluído', 'small', () => { location.href = ROOT + F.testEntry({ preset: 'completo' }) + '&reset=1'; }), btn('Ir para a região', 'small pri', () => { location.href = ROOT + F.testEntry({ preset: 'completo', mapa: s.value }); })]));
      else box.appendChild(U.el('div', { class: 'row' }, [btn('Atlas', 'small', () => { location.href = ROOT + F.testEntry({}); }), btn('Ir para a fase', 'small pri', () => { location.href = ROOT + F.testEntry({ fase: s.value }); })]));
      // conteúdo extra do módulo (minijogos, menus, telas de recompensa): lista vinda do manifesto
      if ((F.testExtras || []).length) {
        const ex = [];
        const sx = U.el('select', { 'aria-label': 'Minijogos e telas de ' + F.title }, F.testExtras.map((gr) => U.el('optgroup', { label: gr.group }, gr.items.map((it) => { ex.push(it); return U.el('option', { value: String(ex.length - 1) }, it.t); }))));
        box.appendChild(U.el('span', { class: 'tip' }, 'Minijogos, Parque e Arcade (tudo liberado no teste):'));
        box.appendChild(U.el('div', { class: 'row' }, [sx, btn('Abrir', 'small pri', () => { location.href = ROOT + F.testEntry(ex[+sx.value].p); })]));
      }
      return box;
    })))]));
    // minigames
    v.appendChild(card('🕹️ Minigames (todos liberados)', [U.el('div', { class: 'row' }, GG.unlocks.all().map((g) => btn(g.title, 'small', () => {
      if (g.entry.type === 'native') location.href = ROOT + 'src/nexus/nexus.html#fliperama';
      else { const q = Object.assign({}, g.entry.params, { token: 'teste-' + Date.now().toString(36) }); location.href = ROOT + g.entry.url + '?' + Object.keys(q).map((k) => k + '=' + encodeURIComponent(q[k])).join('&'); }
    })))]));
    // inspetor de questões
    const B = await loadBanks();
    const qmods = mods.filter((m) => (B[m.franchise.moduleId] || []).length);
    const selM = U.el('select', { 'aria-label': 'Matéria' }, qmods.map((m) => U.el('option', { value: m.franchise.moduleId }, m.franchise.title)));
    const selQ = U.el('select', { 'aria-label': 'Questão' });
    const fillQ = () => { selQ.innerHTML = ''; (B[selM.value] || []).forEach((q, i) => selQ.appendChild(U.el('option', { value: String(i) }, q.id + ' — ' + q.title))); };
    selM.addEventListener('change', fillQ); fillQ();
    v.appendChild(card('📘 Inspetor de questões (gabarito e simulações)', [U.el('div', { class: 'row' }, [selM, selQ, btn('Abrir', 'pri small', () => qDetail(selM.value, +selQ.value, true))]), U.el('p', { class: 'tip' }, 'Avance/volte questão por questão, simule acerto, erro, pista e conclusão, e force estados (bloqueado, liberado, concluído, dominado). Tudo fica só no sandbox.')]));
    // pontuação simulada
    const amt = U.el('input', { type: 'number', min: '1', max: '5000', value: '500', 'aria-label': 'Pontos simulados' });
    v.appendChild(card('⭐ Pontuação e saldo simulados (sandbox)', [
      U.el('p', null, 'Sandbox agora: ' + U.fmtInt(sp.careerPoints) + ' pontos • ' + U.fmtInt(sp.nexusCoins) + ' moedas • Nível ' + GG.FR.levelFor(sp.careerPoints).level),
      U.el('div', { class: 'row' }, [amt, btn('Somar pontos', 'small', () => { const n = Math.max(1, Math.min(5000, Math.round(+amt.value || 0))); GG.profile.update((p) => { GG.bridge.apply(p, GG.bridge.makeEvent(p, 'ciencias', { sourceType: 'achievement', sourceId: 'simulacao', variant: Date.now().toString(36), scoreEarned: Math.min(n, GG.FR.maxEventScore) })); }); go('teste'); }), btn('Somar 100 moedas', 'small', () => { GG.profile.update((p) => { GG.bridge.credit(p, 100, 'sim-' + Date.now().toString(36), { label: 'Simulação dos pais' }); }); go('teste'); })]),
      U.el('p', { class: 'tip' }, 'Esses eventos levam testMode:true e seriam recusados pelo perfil real.')
    ]));
    // estados de desbloqueio para testar telas
    v.appendChild(card('🔓 Estados de teste do Nexus', [U.el('div', { class: 'row' }, [
      btn('Tudo liberado', 'small', () => { GG.profile.update((p) => { p.allContentUnlocked = true; }); UI.toast('Sandbox: tudo liberado.', 'ok'); }),
      btn('Como aluno (bloqueios reais de nível)', 'small', () => { GG.profile.update((p) => { p.allContentUnlocked = false; }); UI.toast('Sandbox: regras normais de desbloqueio.', 'ok'); }),
      btn('Rever boas-vindas', 'small', () => { GG.profile.update((p) => { p.seen.welcome = false; p.seen.welcomeGift = false; p.allContentUnlocked = false; }); UI.toast('Abra o Nexus para ver a história e o presente.', 'ok'); })
    ])]));
    // dispositivos
    const keyOut = U.el('b', null, '—'), padOut = U.el('div', { class: 'testpad', tabindex: '0' }, 'Toque, clique ou arraste aqui');
    window.addEventListener('keydown', (e) => { keyOut.textContent = e.code + ' (' + e.key + ')'; });
    padOut.addEventListener('pointerdown', (e) => { padOut.textContent = 'pointerdown: ' + e.pointerType + ' em ' + Math.round(e.offsetX) + ',' + Math.round(e.offsetY); });
    padOut.addEventListener('pointermove', (e) => { if (e.buttons) padOut.textContent = 'arrastando (' + e.pointerType + ') ' + Math.round(e.offsetX) + ',' + Math.round(e.offsetY); });
    const a11y = { textSize: 1, contrast: false, reduceMotion: false };
    v.appendChild(card('🖐️ Teclado, mouse, toque, áudio e acessibilidade', [U.el('div', { class: 'cards', style: { '--min': '260px' } }, [
      U.el('div', { class: 'kpi' }, [U.el('span', null, 'Última tecla'), keyOut]),
      padOut,
      U.el('div', { class: 'kpi' }, [U.el('span', null, 'Áudio'), U.el('div', { class: 'row' }, [btn('🎵 Música', 'small', () => { GG.audio.unlock(); GG.audio.music(GG.audio.current() ? null : 'atlas'); }), btn('🔔 Efeito', 'small', () => { GG.audio.unlock(); GG.audio.sfx('win'); }), btn('🗣️ Voz', 'small', () => GG.tts.speak('Teste de voz do jogo.'))]), U.el('span', null, GG.tts.supported() ? 'Leitura em voz alta disponível.' : 'Sem leitura em voz alta neste navegador.')]),
      U.el('div', { class: 'kpi' }, [U.el('span', null, 'Acessibilidade (prévia nesta página)'), U.el('div', { class: 'row' }, [btn('Texto grande', 'small', () => { a11y.textSize = a11y.textSize === 1 ? 1.3 : 1; UI.applyA11y(a11y); }), btn('Alto contraste', 'small', () => { a11y.contrast = !a11y.contrast; UI.applyA11y(a11y); }), btn('Menos movimento', 'small', () => { a11y.reduceMotion = !a11y.reduceMotion; UI.applyA11y(a11y); })])])
    ])]));
  }

  /* ---------------- 8. backup e segurança ---------------- */
  function askPassword(title) {
    return new Promise((res) => {
      const d = UI.modal({ title: '🔐 ' + title, cls: 'small', onClose: () => res(false) });
      const inp = U.el('input', { type: 'password', autocomplete: 'off', 'aria-label': 'Senha' }); const msg = U.el('p', { class: 'p-msg' });
      d.body.appendChild(U.el('p', null, 'Confirme a senha dos responsáveis.')); d.body.appendChild(inp); d.body.appendChild(msg);
      const ok = () => { const r = PA.verify(inp.value); inp.value = ''; if (r.ok) { res(true); d.close(); } else msg.textContent = r.wait ? 'Aguarde ' + r.wait + ' s.' : 'Senha incorreta.'; };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
      d.setActions([btn('Cancelar', 'ghost', () => d.close()), btn('Confirmar', 'pri', ok)]);
      setTimeout(() => inp.focus(), 50);
    });
  }
  function typed(title, word, text) {
    return new Promise((res) => {
      const d = UI.modal({ title, cls: 'small', onClose: () => res(false) });
      const inp = U.el('input', { type: 'text', autocomplete: 'off', 'aria-label': 'Confirmação' });
      d.body.appendChild(U.el('div', { class: 'dangerbox' }, [U.el('p', { html: U.rich(text) }), U.el('p', null, ['Para confirmar, digite exatamente: ', U.el('b', null, word)])])); d.body.appendChild(inp);
      d.setActions([btn('Cancelar', 'ghost', () => d.close()), btn('Confirmar', 'pri', () => { if (inp.value.trim() === word) { res(true); d.close(); } else UI.toast('Texto de confirmação diferente.', ''); })]);
      setTimeout(() => inp.focus(), 50);
    });
  }
  const TARGETS = () => [
    { id: 'nexus', t: 'Gabriel Nexus (perfil global)', keys: [REAL_PROFILE, REAL_PROFILE + '.bak', REAL_PROFILE + '.tmp', GG.bridge.OUTBOX, GG.replay.KEY] },
    { id: 'ciencias', t: 'Ciências (Missão EcoNexus)', keys: ['econexus_guardioes_save_v1'] },
    { id: 'geografia', t: 'Geografia (Brasil em Movimento)', keys: ['ecoNexus.geografia.v1'] },
    { id: 'lancador', t: 'Lançador (última matéria)', keys: ['ecoNexus.launcher.v1'] }
  ];
  function backup(v) {
    v.appendChild(U.el('h1', null, '🛡️ Backup e segurança'));
    v.appendChild(card('Exportar backup', [U.el('p', null, 'Baixa um arquivo .json com todos os saves reais deste navegador (sem a senha). Guarde em local seguro.'), btn('⬇️ Exportar backup', 'pri', async () => {
      if (!(await askPassword('Exportar backup'))) return;
      const data = {}; gameKeys().filter((k) => !isSandboxKey(k)).forEach((k) => { data[k] = localStorage.getItem(k); });
      U.download('backup-gabriel-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ tipo: 'backup-franquia-gabriel', versao: 1, criadoEm: new Date().toISOString(), chaves: data }, null, 2), 'application/json');
      UI.toast('Backup exportado.', 'ok');
    })]));
    const file = U.el('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Arquivo de backup' });
    v.appendChild(card('Restaurar backup', [U.el('div', { class: 'warnbox' }, 'Restaurar substitui os saves escolhidos pelos do arquivo. Antes, uma cópia do estado atual é guardada automaticamente neste navegador.'), file, btn('♻️ Restaurar do arquivo', '', async () => {
      const f = file.files && file.files[0]; if (!f) { UI.toast('Escolha o arquivo de backup.', ''); return; }
      let obj = null; try { obj = JSON.parse(await f.text()); } catch (e) { obj = null; }
      if (!obj || obj.tipo !== 'backup-franquia-gabriel' || !obj.chaves) { UI.toast('Arquivo inválido.', ''); return; }
      const keys = Object.keys(obj.chaves).filter((k) => /^(econexus|ecoNexus)/.test(k) && !isSandboxKey(k));
      if (!keys.length) { UI.toast('O arquivo não tem saves reconhecidos.', ''); return; }
      if (!(await askPassword('Restaurar backup'))) return;
      if (!(await typed('Confirmar restauração', 'RESTAURAR', 'Serão substituídas estas chaves: **' + keys.join(', ') + '** (backup de ' + fmtDate(obj.criadoEm) + ').'))) return;
      const before = {}; keys.forEach((k) => { before[k] = localStorage.getItem(k); });
      try { localStorage.setItem('ecoNexus.backup.antes-restauracao', JSON.stringify({ em: new Date().toISOString(), chaves: before })); } catch (e) { /* sem espaço */ }
      keys.forEach((k) => { const val = obj.chaves[k]; if (typeof val === 'string') localStorage.setItem(k, val); });
      UI.toast('Backup restaurado (' + keys.length + ' chaves).', 'ok', 4000); go('geral');
    })]));
    v.appendChild(card('Apagar progresso real', [U.el('div', { class: 'dangerbox' }, 'Operação sensível: pede a senha de novo e a confirmação do alvo. Recomenda-se exportar um backup antes.'), U.el('div', { class: 'row' }, TARGETS().map((t) => btn('🗑️ ' + t.t, 'small', async () => {
      if (!(await askPassword('Apagar: ' + t.t))) return;
      if (!(await typed('Apagar ' + t.t, 'APAGAR ' + t.id.toUpperCase(), 'Isto apaga o progresso real de **' + t.t + '** neste navegador. Não dá para desfazer (a não ser com um backup).'))) return;
      const before = {}; t.keys.forEach((k) => { before[k] = localStorage.getItem(k); });
      try { localStorage.setItem('ecoNexus.backup.antes-exclusao', JSON.stringify({ em: new Date().toISOString(), alvo: t.id, chaves: before })); } catch (e) { /* ok */ }
      t.keys.forEach((k) => localStorage.removeItem(k));
      UI.toast(t.t + ': progresso apagado. Cópia de segurança guardada em “ecoNexus.backup.antes-exclusao”.', 'ok', 5000); go('geral');
    })))]));
  }

  /* ---------------- 9. erros ---------------- */
  function erros(v) {
    v.appendChild(U.el('h1', null, '🐞 Erros técnicos'));
    const l = GG.errlog.list();
    v.appendChild(card(l.length + ' registro(s)', [l.length ? table(['Quando', 'Onde', 'Página', 'Mensagem'], l.slice().reverse().map((e) => [fmtDate(e.t), e.where, e.page, e.msg])) : U.el('p', null, 'Nenhum erro registrado. 🎉'), btn('Limpar registro', 'small ghost', () => { GG.errlog.clear(); go('erros'); })]));
  }

  /* ---------------- 10. configurações ---------------- */
  function config(v) {
    v.appendChild(U.el('h1', null, '⚙️ Configurações da Área dos Pais'));
    const sel = U.el('select', { 'aria-label': 'Tempo de inatividade' }, GG.FR.parent.sessionMinutesOptions.map((n) => U.el('option', { value: String(n) }, n + ' minutos')));
    sel.value = String(PA.config().sessionMinutes);
    sel.addEventListener('change', () => { PA.setConfig({ sessionMinutes: +sel.value }); PA.touch(); UI.toast('Sessão agora expira após ' + sel.value + ' min sem uso.', 'ok'); });
    v.appendChild(card('Sessão', [U.el('div', { class: 'row' }, [U.el('label', null, 'Encerrar sozinha após'), sel]), U.el('p', { class: 'tip' }, 'Depois de ' + GG.FR.parent.maxAttempts + ' senhas erradas seguidas, a entrada espera ' + GG.FR.parent.lockSeconds + ' s.')]));
    v.appendChild(card('Sobre a proteção', [U.el('p', null, 'O jogo é totalmente local (sem servidor). A senha é guardada apenas como um código (hash com sal) e funciona como uma barreira familiar — não é segurança forte contra quem inspeciona o código. Para trocar a senha, veja “jogodogabriel.md”.')]));
  }

  /* ================================================================ BOOT */
  async function boot() {
    try { await GG.modules.load(ROOT); } catch (e) { GG.errlog.add('pais', e.message); }
    const h = location.hash.slice(1);
    if (PA.active()) openApp();
    else showLogin(h === 'expirou' ? 'Sessão encerrada. Digite a senha de novo.' : h === 'teste-necessario' ? 'Entre e inicie o modo de teste para abrir as versões de teste.' : '');
  }
  window.addEventListener('DOMContentLoaded', boot);
})();
