/* =====================================================================
   src/modules/ingles/manifest.js — MANIFESTO DO MÓDULO DE INGLÊS.
   “Gabriel e o Expresso dos Sonhos” (prova de Inglês do 4º ano,
   material: ingles.pdf, 11 páginas). Jogo independente da franquia:
   história, save ("ecoNexus.ingles.v1"), pontos e minijogos próprios.
   Carregado pelo lançador (src/modules/modulos.js), pela Área dos Pais
   e pelo Nexus. NÃO depende do conteúdo carregado: tudo que o lançador
   usa lê só o save (somente leitura).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'ecoNexus.ingles.v1';
  const ACTS = [['a1', 'Cidade Cósmica', 'Places • pág. 1–3'], ['a2', 'Aeroporto das Profissões', 'Professions • pág. 4–7'], ['a3', 'Laboratório dos Sonhos', 'Subjects and dreams • pág. 8–11']];
  const GAMES = [['assoc_lugares', 'Associação: Places', 'Memória figura ↔ palavra', 1], ['caca', 'Caça-Palavras das Profissões', 'Caça-palavras', 2], ['assoc_lab', 'Associação: Subjects and professions', 'Memória figura ↔ palavra', 3]];
  /** Arcade do Expresso (arcade/jogos.js): 2 jogos bônus por mundo, sem perguntas. */
  const ARCADE = [['e1_galaxias', 'Quebra-Galáxias', 1], ['e1_invasores', 'Invasores Cósmicos', 1], ['e2_taxi', 'Táxi para o Aeroporto', 2], ['e2_voo', 'Voo do Avião', 2], ['e3_colunas', 'Colunas do Laboratório', 3], ['e3_bairro', 'Empilha o Bairro', 3]];
  const LESSONS = [['lugares', 'Places + would like to'], ['palavrinhas', 'really, usually, never, under, or'], ['texto', 'Texto: Professions — When I Grow Up'], ['profissoes', 'Professions'], ['pergunta', 'Pergunta com would'], ['materias', 'Subjects, professions and dreams'], ['negativa', 'Negativa com wouldn’t']];
  const CORE_TOTAL = 61; // questões da campanha curta (content/atos.js → D.core); as outras são extras opcionais
  const when = (S) => new Date(S.updated || S.created || Date.now()).toISOString();
  const doneQ = (S) => Object.keys(S.q || {}).filter((k) => S.q[k] && S.q[k].done);
  const M = {
    id: 'ingles_2026_09', subject: 'Inglês', title: 'Gabriel e o Expresso dos Sonhos', subtitle: 'Places • Professions • Dreams', version: 1, enabled: true, order: 3,
    theme: { color: '#6a4cff', icon: '🚂', art: 'ingles' },
    entry: 'src/modules/ingles/jogar.html', reviewEntry: null, reviewTip: 'A revisão rápida fica no mapa do Expresso, depois da viagem.',
    saveKey: KEY, questionsTotal: CORE_TOTAL,
    progress() {
      let S = null; try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
      if (!S) return { started: false, percent: 0, last: '—', medals: 0, medalsLabel: 'bilhetes' };
      const sm = S.summary || {};
      return { started: true, percent: sm.percent || 0, last: sm.last || '—', medals: (S.tickets || []).length, medalsLabel: 'de 3 bilhetes', done: !!S.finalDone, extra: (sm.done || 0) + '/' + (sm.all || CORE_TOTAL) + ' questões' };
    },

    /* ============================ contrato da franquia (Gabriel Nexus) */
    franchise: {
      moduleId: 'ingles', title: 'Inglês — Expresso dos Sonhos', version: '1.0.0',
      color: '#6a4cff', icon: '🚂', world: 'Mundo de Inglês',
      entryRoute: 'src/modules/ingles/jogar.html',
      saveNamespace: KEY,
      /** Eventos estáveis: refazer ou reiniciar nunca soma de novo (a ponte é idempotente pelo eventId). */
      scoreAdapter(S) {
        const out = [], t = when(S), P = GG.FR.points;
        doneQ(S).forEach((id) => {
          const st = S.q[id];
          out.push({ sourceType: 'question', sourceId: id, variant: 'concluida', scoreEarned: P.questionDone, occurredAt: t });
          if (st.tier && st.tier <= 2) out.push({ sourceType: 'question', sourceId: id, variant: 'sem-alternativas', scoreEarned: P.questionTier2, occurredAt: t });
          if (st.tier === 1) out.push({ sourceType: 'question', sourceId: id, variant: 'primeira', scoreEarned: P.questionTier1, occurredAt: t });
        });
        ACTS.forEach(([id]) => { if (S.acts && S.acts[id] && S.acts[id].done) out.push({ sourceType: 'mission', sourceId: 'ato-' + id, scoreEarned: P.mission, occurredAt: t }); });
        // bônus pequeno e controlado: 20 pontos na 1ª vez de cada minijogo (replays não somam)
        GAMES.forEach(([id]) => { if (S.mg && S.mg[id] && S.mg[id].done) out.push({ sourceType: 'achievement', sourceId: 'minijogo-' + id, scoreEarned: 20, occurredAt: t }); });
        if (S.finalDone) {
          out.push({ sourceType: 'boss', sourceId: 'passagem-de-volta', scoreEarned: P.boss, occurredAt: t });
          out.push({ sourceType: 'achievement', sourceId: 'campanha-completa', scoreEarned: P.finale, occurredAt: t });
        }
        return out;
      },
      stats(S) {
        const sm = S.summary || {}; const all = sm.all || CORE_TOTAL;
        return {
          percent: sm.percent || 0, questionsDone: sm.done || 0, questionsTotal: all,
          firstTry: doneQ(S).filter((id) => S.q[id].tier === 1).length,
          missionsDone: ACTS.filter(([id]) => S.acts && S.acts[id] && S.acts[id].done).length, missionsTotal: 3,
          bossesDone: S.finalDone ? 1 : 0, bossesTotal: 1, worldDone: S.finalDone ? 1 : 0,
          lastPlace: sm.last || '—', timeSec: (S.time && S.time.total) || 0
        };
      },
      unlockedMinigames(S) { return GAMES.filter(([id]) => S.mg && S.mg[id] && S.mg[id].done).map(([id]) => 'ingles_' + id); },
      minigames: GAMES.map(([id, title, genre, ato]) => ({
        minigameId: 'ingles_' + id, title, description: genre + ' com as palavras do livro de Inglês (ato ' + ato + ').', genre, icon: '🚂',
        controls: 'Mouse ou toque; teclado: setas + Espaço (caça-palavras) e Tab/Enter (cartas)',
        entry: { type: 'page', url: 'src/modules/ingles/jogar.html', params: { replay: id } },
        unlockText: 'Jogue “' + title + '” no Expresso dos Sonhos (ato ' + ato + ').', freePlay: true, parentTest: true, records: true,
        assets: 'Fluent Emoji 3D (Microsoft, MIT) + avental original', deps: 'src/core/*, src/ui/*, src/modules/ingles/*'
      })),
      collectiblePacks: [],
      /** Área dos Pais: todas as 174 questões do livro (campanha + extras), por página e ato. */
      questionBank: {
        scripts: ['src/modules/ingles/content/banco.js', 'src/modules/ingles/content/atos.js', 'src/modules/ingles/systems/checker.js'],
        prepare() { window.ING = window.ING || {}; window.ING.data = window.ING.data || {}; },
        build() {
          const D = window.ING.data, C = window.ING.check; const KIND = D.KINDS;
          return (D.questions || []).map((q) => ({
            id: q.id, module: 'ingles', group: 'Pág. ' + q.page + ' • Ato ' + q.act + ' • ' + q.section + (q.core ? '' : ' (extra)'), stage: 'a' + q.act,
            title: (q.core ? '' : '[extra] ') + q.prompt.slice(0, 60), prompt: q.prompt + (q.box ? '\n\nCaixa: ' + q.box : ''), type: KIND[q.kind], kind: q.kind,
            concept: KIND[q.kind], where: 'Ato ' + q.act + ' — página ' + q.page + ' — ' + q.section + (q.core ? ' (campanha)' : ' (exercício extra opcional)'),
            answer: q.input === 'fill' ? q.blanks.map((b, i) => (q.blanks.length > 1 ? (i + 1) + ') ' : '') + b.join(' / ')).join('  ') : q.input === 'order' ? q.order.map((x, i) => (i + 1) + '. ' + x).join('\n') : q.personal ? 'Resposta pessoal: ' + C.PERSONAL[q.personal].models.join(' / ') : q.target ? 'Frase livre com “' + q.target.join(' / ') + '”' : q.accept.join(' / '),
            model: C.model(q) && (Array.isArray(C.model(q)) ? C.model(q).join(' / ') : C.model(q)), why: q.why,
            err: q.personal ? C.PERSONAL[q.personal].need : 'Palavras essenciais (would, like, to, wouldn’t, do, is, are) nunca são dispensadas.',
            hint1: C.hint(q, 1, () => 0.3), hint2: C.hint(q, 2, () => 0.3), spec: { options: q.options ? q.options.map((o) => ({ t: o, ok: (q.input === 'fill' ? q.blanks[0] : q.accept || []).map(C.norm).includes(C.norm(o)) })) : null }, raw: q
          }));
        },
        statsFor(S, id) { const st = S && S.q && S.q[id]; return st ? { seen: !!st.seen, done: !!st.done, attempts: st.attempts | 0, errors: st.errors | 0, tier: st.tier | 0, first: !!st.first, guided: !!st.alt, hints: st.hints | 0, typed: st.typed || [] } : null; },
        concepts(S) { const out = {}; if (!S || !S.q || !window.ING || !window.ING.data.questions) return out; window.ING.data.questions.forEach((q) => { const st = S.q[q.id]; if (!st || !st.seen) return; const k = window.ING.data.KINDS[q.kind]; out[k] = out[k] || { ok: 0, wrong: 0 }; if (st.done && st.tier === 1) out[k].ok++; if (st.errors) out[k].wrong++; }); return out; }
      },
      /** Área dos Pais → jogo no sandbox. fase: 'a1' | 'a1-3' (ato e passo) | 'final' | 'revisao'. */
      testEntry(o) {
        o = o || {};
        if (o.painel) return 'src/modules/ingles/painel.html';
        if (o.arcade) return 'src/modules/ingles/arcade.html?teste=1' + (o.arcade === 'menu' ? '' : o.arcade === 'recompensa' ? '&recompensa=' + o.mundo : /^[123]$/.test(o.arcade) ? '&menu=' + o.arcade : '&jogo=' + encodeURIComponent(o.arcade));
        const p = Object.assign({}, o);
        if (p.fase) { const m = /^(a[123])(?:-(\d{1,2}))?$/.exec(p.fase); if (m) { p.ato = m[1]; if (m[2] != null) p.passo = m[2]; } else if (p.fase === 'final') p.final = '1'; else if (p.fase === 'revisao') p.revisao = '1'; delete p.fase; }
        return 'src/modules/ingles/jogar.html?teste=1' + ['ato', 'passo', 'questao', 'minijogo', 'licao', 'final', 'revisao', 'tela'].filter((k) => p[k] != null && p[k] !== '').map((k) => '&' + k + '=' + encodeURIComponent(p[k])).join('');
      },
      /** O inspetor de questões da Área dos Pais pode abrir a questão no jogo (sandbox). */
      answerInGame: true, testHomeLabel: 'Mapa do Expresso',
      testTargets: ACTS.map(([id, t, s]) => ({ id, t: 'Ato ' + id.slice(1) + ': ' + t + ' (' + s + ')' })).concat([{ id: 'final', t: '🏁 Passagem de Volta (revisão final)' }, { id: 'revisao', t: '📝 Revisão rápida (filtros)' }]),
      /** TODO conteúdo do módulo, para os pais abrirem direto (regra permanente da Área dos Pais). */
      testExtras: [
        { group: 'Painel do responsável (Inglês)', items: [{ t: '📋 Matriz de cobertura do PDF, respostas digitadas e teste do corretor', p: { painel: 1 } }] },
        { group: 'Telas', items: [{ t: '🗺️ Mapa do Expresso', p: { tela: 'mapa' } }, { t: '📖 História de abertura', p: { tela: 'intro' } }, { t: '🎫 Bilhete 1 (Cidade Cósmica)', p: { tela: 'bilhete-1' } }, { t: '🎫 Bilhete 2 (Aeroporto)', p: { tela: 'bilhete-2' } }, { t: '🎫 Bilhete 3 (Laboratório)', p: { tela: 'bilhete-3' } }, { t: '🏁 Passagem de Volta (revisão final)', p: { final: '1' } }, { t: '🏆 Tela final', p: { tela: 'fim' } }, { t: '📝 Revisão rápida', p: { revisao: '1' } }] },
        { group: 'Explicações', items: LESSONS.map(([id, t]) => ({ t: '📘 ' + t, p: { licao: id } })) },
        { group: 'Minijogos', items: GAMES.map(([id, t]) => ({ t: '🎮 ' + t, p: { minijogo: id } })) },
        { group: 'Arcade do Expresso (bônus, sem perguntas)', items: [{ t: '🕹️ Arcade completo (menu)', p: { arcade: 'menu' } }]
          .concat([1, 2, 3].map((w) => ({ t: '🕹️ Arcade do Mundo ' + w + ' (menu)', p: { arcade: String(w) } })))
          .concat([1, 2, 3].map((w) => ({ t: '🏆 Tela “Arcade liberado” (fim do Mundo ' + w + ')', p: { arcade: 'recompensa', mundo: String(w) } })))
          .concat(ARCADE.map(([id, t, w]) => ({ t: '🎮 Mundo ' + w + ': ' + t, p: { arcade: id } }))) },
        { group: 'Atos (do começo)', items: ACTS.map(([id, t]) => ({ t: '🚂 ' + t, p: { ato: id, passo: '0' } })) }
      ]
    }
  };
  if (window.GG && GG.registry) GG.registry.register(M);
  window.ING_MANIFEST = M;
})();
