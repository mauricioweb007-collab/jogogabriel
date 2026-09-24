/* =====================================================================
   src/modules/ciencias-legacy-adapter/manifest.js
   ADAPTADOR SOMENTE DE LEITURA para o módulo legado de Ciências.
   - O jogo de Ciências continua em /index.html, /css, /js, /docs, /tools
     exatamente como na versão 1.0 (congelado; nenhum arquivo alterado).
   - Este adaptador apenas aponta para a entrada antiga e LÊ o save
     "econexus_guardioes_save_v1" para mostrar o progresso no lançador e
     alimentar o perfil global do Gabriel Nexus (bloco `franchise`).
     Ele nunca grava, migra, reformata ou apaga esse save.
   - Reprise de minijogos e modo de teste rodam em páginas próprias
     (replay.html / teste.html) que redirecionam o armazenamento para
     chaves separadas, sem tocar no save real.
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'econexus_guardioes_save_v1';
  const MAPS = { vila: 'Vila EcoNexus', loja: 'Loja do Guardião', casa: 'Casa de Lumi', r1: 'Trilha dos Animais Livres', r2: 'Vale das Cadeias Alimentares', r3: 'Laboratório dos Ciclos', r4: 'Lago Esverdeado', r5: 'Torre da Energia e dos Ecossistemas', r6: 'Portal dos Biomas Brasileiros', arena: 'Arena da Restauração' };
  const REGIONS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
  const PT = () => GG.FR.points;
  function readOnly() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  const when = (S) => new Date(S.updated || S.created || Date.now()).toISOString();
  const doneQ = (S) => Object.keys(S.q || {}).filter((k) => S.q[k] && S.q[k].done);

  /** Minijogos que existem de verdade em js/systems/minigames.js (o Jardim é um painel, não um minijogo). */
  const MG = [
    ['trilha_segura', 'Trilha Segura', 'r1', 'Desvie de obstáculos e pegue os itens certos para a investigação.', 'Corrida lateral', '◀ ▶ ou A/D, ou arrastar'],
    ['corredor_cadeia', 'Corredor da Cadeia', 'r2', 'Monte pares “alimento → consumidor”.', 'Escolha rápida', 'Toque ou teclas 1/2'],
    ['coleta_solar', 'Coleta Solar', 'r3', 'Colete luz, água e gás carbônico para a fotossíntese.', 'Coleta', 'Setas/WASD ou arrastar'],
    ['salve_lago', 'Salve o Lago', 'r4', 'Leve oxigênio aos peixes e feche os canos de nutrientes.', 'Ação', 'Setas/WASD, E/Espaço ou toque'],
    ['torre_niveis', 'Torre dos Níveis', 'r5', 'Monte a torre da cadeia alimentar de baixo para cima.', 'Montagem', 'Toque/clique'],
    ['corrida_biomas', 'Corrida dos Biomas', 'r6', 'Leia a pista e corra até o portal do bioma certo.', 'Corrida', 'Setas/WASD ou arrastar'],
    ['relampago', 'Desafio Relâmpago', 'r6', 'Versão cronometrada e opcional do Corredor da Cadeia.', 'Contra o relógio', 'Toque ou teclas 1/2']
  ];

  GG.registry.register({
    id: 'ciencias_v1', subject: 'Ciências', title: 'Missão EcoNexus', subtitle: 'Guardiões dos Biomas', version: 1, enabled: true, order: 1, legacy: true,
    theme: { color: '#2f9e5b', icon: '🔬', art: 'ciencias' },
    entry: 'index.html', entryAlt: 'ciencias.html',
    saveKey: KEY,
    reviewTip: 'A Revisão de Ciências fica no Menu (☰) do próprio jogo, depois de restaurar os cristais.',
    progress() {
      const S = readOnly();
      if (!S) return { started: false, percent: 0, last: '—', medals: 0, medalsLabel: 'cristais' };
      const q = S.q || {}; const ids = Object.keys(q); const done = ids.filter((k) => q[k] && q[k].done).length;
      return {
        started: true, name: S.name,
        percent: ids.length ? Math.round(done / ids.length * 100) : 0,
        last: (S.map && MAPS[S.map]) || '—',
        medals: (S.crystals || []).length, medalsLabel: 'cristais', extra: (S.medals || []).length + ' medalhas',
        done: !!S.storyDone
      };
    },

    /* ============================ contrato da franquia (Gabriel Nexus) */
    franchise: {
      moduleId: 'ciencias', title: 'Ciências — Missão EcoNexus', version: '1.0.0',
      color: '#2f9e5b', icon: '🔬', world: 'Mundo de Ciências',
      entryRoute: 'index.html',
      saveNamespace: KEY,
      /** Deriva eventos estáveis do save (1 por conquista). */
      scoreAdapter(S) {
        const out = [], t = when(S), P = PT();
        doneQ(S).forEach((id) => {
          const st = S.q[id];
          out.push({ sourceType: 'question', sourceId: id, variant: 'concluida', scoreEarned: P.questionDone, occurredAt: t });
          if (st.tier && st.tier <= 2) out.push({ sourceType: 'question', sourceId: id, variant: 'sem-guia', scoreEarned: P.questionTier2, occurredAt: t });
          if (st.tier === 1) out.push({ sourceType: 'question', sourceId: id, variant: 'primeira', scoreEarned: P.questionTier1, occurredAt: t });
        });
        (S.crystals || []).filter((r) => REGIONS.includes(r)).forEach((r) => out.push({ sourceType: 'mission', sourceId: 'regiao-' + r, scoreEarned: P.mission, occurredAt: t }));
        if (S.arena && S.arena.done) out.push({ sourceType: 'boss', sourceId: 'arena-restauracao', scoreEarned: P.boss, occurredAt: t });
        if (S.storyDone) out.push({ sourceType: 'achievement', sourceId: 'historia-completa', scoreEarned: P.finale, occurredAt: t });
        return out;
      },
      stats(S) {
        const total = Object.keys(S.q || {}).length || 43, done = doneQ(S).length;
        const first = doneQ(S).filter((id) => S.q[id].tier === 1).length;
        return {
          percent: Math.round(done * 100 / total), questionsDone: done, questionsTotal: total, firstTry: first,
          missionsDone: (S.crystals || []).length, missionsTotal: 6, bossesDone: S.arena && S.arena.done ? 1 : 0, bossesTotal: 1,
          worldDone: S.storyDone ? 1 : 0, lastPlace: (S.map && MAPS[S.map]) || '—', timeSec: (S.time && S.time.total) || 0
        };
      },
      /** Minijogo liberado quando foi jogado no jogo de origem ou quando a região dele foi restaurada. */
      unlockedMinigames(S) {
        return MG.filter(([id, , reg]) => (S.mg && S.mg[id] && S.mg[id].plays > 0) || (id !== 'relampago' && (S.crystals || []).includes(reg))).map(([id]) => 'ciencias_' + id);
      },
      minigames: MG.map(([id, title, reg, desc, genre, controls]) => ({
        minigameId: 'ciencias_' + id, title, description: desc, genre, controls, icon: '🔬',
        entry: { type: 'page', url: 'src/modules/ciencias-legacy-adapter/replay.html', params: { mg: id } },
        unlockText: id === 'relampago' ? 'Jogue o Desafio Relâmpago no Portal dos Biomas (Ciências).' : 'Jogue na região “' + MAPS[reg] + '” ou restaure o cristal dela (Ciências).',
        freePlay: true, parentTest: true, records: true,
        assets: 'Desenho em canvas do próprio jogo de Ciências (js/systems/minigames.js)', deps: 'js/core/*, js/data/*, js/systems/*, js/ui/ui.js (somente leitura)'
      })),
      collectiblePacks: ['src/modules/ciencias-legacy-adapter/nexoticos.js'],
      questionBank: {
        scripts: ['js/data/questions.js'],
        prepare() { window.EN = window.EN || {}; EN.data = EN.data || {}; },
        build() {
          return ((window.EN && EN.data.questions) || []).map((q) => ({
            id: q.id, module: 'ciencias', group: MAPS[q.region] || q.region, title: q.title, prompt: q.prompt, type: q.main && q.main.type,
            concept: q.concept, where: q.where, answer: q.answer, model: q.model, why: q.why, err: q.err, hint1: q.hint1, hint2: q.hint2,
            spec: q.main, guided: q.guided, raw: q
          }));
        },
        statsFor(S, id) { const st = S && S.q && S.q[id]; return st ? { seen: !!st.seen, done: !!st.done, attempts: st.attempts | 0, errors: st.errors | 0, tier: st.tier | 0, first: !!st.first, guided: !!st.guided, hints: st.tier >= 2 ? 1 : 0 } : null; },
        concepts(S) { return (S && S.concepts) || {}; }
      },
      /** Jogo completo no modo de teste (sandbox). preset: novo | completo; mapa: id do mapa inicial. */
      testEntry(o) { o = o || {}; return 'src/modules/ciencias-legacy-adapter/teste.html?preset=' + (o.preset || 'novo') + (o.mapa ? '&mapa=' + encodeURIComponent(o.mapa) : ''); },
      testTargets: [{ id: 'vila', t: 'Vila EcoNexus' }].concat(REGIONS.map((r) => ({ id: r, t: MAPS[r] }))).concat([{ id: 'arena', t: 'Arena da Restauração' }])
    }
  });
})();
