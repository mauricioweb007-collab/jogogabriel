/* =====================================================================
   src/modules/geografia/manifest.js — MANIFESTO DO MÓDULO DE GEOGRAFIA.
   Registrado no lançador (inicio.html) e usado pela página do módulo
   (jogar.html) para saber quais arquivos carregar. O progresso exibido
   no lançador vem do save isolado "ecoNexus.geografia.v1".
   O bloco `franchise` é o contrato com o Gabriel Nexus (pontuação,
   minigames, colecionáveis, banco de questões para a Área dos Pais).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'ecoNexus.geografia.v1';
  /** Fases reais (content/capitulos.js). boss = chefe; bonus = sala opcional sem questões. */
  const STAGES = [
    ['c1s1', 'Festival da Diversidade', 'Plataforma lateral', 1], ['c1s2', 'Mapa dos Povos Originários', 'Exploração e mapa', 1], ['c1s3', 'Rotas pelo Atlântico', 'Nave-cartográfica', 1], ['c1s4', 'Caminhos da Imigração', 'Corrida contra o GeoBot', 1], ['c1s5', 'Chefe: Generalizador', 'Batalha de chefe', 1, 'boss'],
    ['c2s1', 'Labirinto das Culturas', 'Labirinto de coleta', 2], ['c2s2', 'Cordel em Movimento', 'Plataforma em xilogravura', 2], ['c2s3', 'Ritmos do Brasil', 'Jogo de ritmo', 2], ['c2s4', 'Cozinha dos Povos', 'Quebra-cabeça de sílabas', 2], ['c2s5', 'Chefe: Sombra do Preconceito', 'Batalha de chefe', 2, 'boss'],
    ['c3s1', 'Do Litoral ao Interior', 'Corrida com mapa animado', 3], ['c3s2', 'Cidade em Transformação', 'Ação e construção', 3], ['c3s3', 'Energia para Todos', 'Labirinto de rede elétrica', 3], ['c3s4', 'Torre da População', 'Plataforma vertical', 3], ['c3s5', 'Territórios e Direitos', 'Mapa e demarcação', 3], ['c3s6', 'Chefe Final: Vírus da Desigualdade', 'Batalha final', 3, 'boss'],
    ['b1', 'Corrida Relâmpago', 'Desafio opcional contra o GeoBot', 1, 'bonus'], ['b2', 'Ritmo Livre', 'Batalha de ritmo contra o GeoBot', 2, 'bonus'], ['b3', 'Labirinto Relâmpago', 'Desafio opcional de labirinto', 3, 'bonus']
  ];
  const CONTROLS = 'Setas/WASD andam • Espaço/K pula e confirma • E/J/X interage • Esc pausa • toque (direcional A/B) • controle';
  const doneQ = (S) => Object.keys(S.q || {}).filter((k) => S.q[k] && S.q[k].done);
  const when = (S) => new Date(S.updated || S.created || Date.now()).toISOString();
  const M = {
    id: 'geografia_2026_09', subject: 'Geografia', title: 'Brasil em Movimento', subtitle: 'O Atlas Vivo do Brasil', version: 1, enabled: true, order: 2,
    theme: { color: '#1f9e7a', icon: '🌎', art: 'geografia' },
    entry: 'src/modules/geografia/jogar.html', reviewEntry: 'src/modules/geografia/jogar.html#revisao',
    saveKey: KEY,
    chapters: [
      { n: 1, title: 'O Mosaico do Povo Brasileiro', stages: 5 },
      { n: 2, title: 'Culturas que se Encontram', stages: 5 },
      { n: 3, title: 'O Brasil que Muda', stages: 6 }
    ],
    questionsTotal: 45,
    /** Arquivos do módulo, na ordem de carregamento (relativos a jogar.html). */
    files: {
      content: ['content/capitulos.js', 'content/glossario.js', 'content/loja.js', 'questions/c1.js', 'questions/c2.js', 'questions/c3.js', 'content/visuais.js'],
      systems: ['systems/save.js', 'systems/economy.js', 'systems/campaign.js'],
      scenes: ['scenes/common.js', 'scenes/stage.js', 'scenes/atlas.js', 'scenes/platform.js', 'scenes/topdown.js', 'scenes/shmup.js', 'scenes/race.js', 'scenes/boss.js', 'scenes/maze.js', 'scenes/rhythm.js', 'scenes/kitchen.js', 'scenes/city.js', 'scenes/tower.js'],
      main: ['main.js']
    },
    /** Progresso somente leitura para o lançador. */
    progress() {
      let S = null; try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
      if (!S) return { started: false, percent: 0, last: '—', medals: 0, medalsLabel: 'medalhas' };
      const sm = S.summary || {};
      return { started: true, name: S.name, percent: sm.percent || 0, last: sm.last || '—', medals: sm.medals || 0, medalsLabel: 'medalhas', done: !!S.finalDone, extra: (sm.coverage || '0/45') + ' questões' };
    },

    /* ============================ contrato da franquia (Gabriel Nexus) */
    franchise: {
      moduleId: 'geografia', title: 'Geografia — Brasil em Movimento', version: '1.0.0',
      color: '#1f9e7a', icon: '🌎', world: 'Mundo de Geografia',
      entryRoute: 'src/modules/geografia/jogar.html',
      saveNamespace: KEY,
      scoreAdapter(S) {
        const out = [], t = when(S), P = GG.FR.points;
        doneQ(S).forEach((id) => {
          const st = S.q[id];
          out.push({ sourceType: 'question', sourceId: id, variant: 'concluida', scoreEarned: P.questionDone, occurredAt: t });
          if (st.tier && st.tier <= 2) out.push({ sourceType: 'question', sourceId: id, variant: 'sem-guia', scoreEarned: P.questionTier2, occurredAt: t });
          if (st.tier === 1) out.push({ sourceType: 'question', sourceId: id, variant: 'primeira', scoreEarned: P.questionTier1, occurredAt: t });
        });
        STAGES.forEach(([id, , , , kind]) => {
          const st = S.stages && S.stages[id];
          if (!st || !st.done || kind === 'bonus') return;
          out.push({ sourceType: kind === 'boss' ? 'boss' : 'mission', sourceId: 'fase-' + id, scoreEarned: kind === 'boss' ? P.boss : P.mission, occurredAt: t });
        });
        (S.chaptersDone || []).forEach((n) => out.push({ sourceType: 'achievement', sourceId: 'capitulo-' + n, scoreEarned: P.chapter, occurredAt: t }));
        if (S.finalDone) out.push({ sourceType: 'achievement', sourceId: 'campanha-completa', scoreEarned: P.finale, occurredAt: t });
        return out;
      },
      stats(S) {
        const total = Object.keys(S.q || {}).length || 45, done = doneQ(S).length;
        const main = STAGES.filter((s) => s[4] !== 'bonus');
        const sd = (id) => !!(S.stages && S.stages[id] && S.stages[id].done);
        return {
          percent: Math.round(done * 100 / total), questionsDone: done, questionsTotal: total,
          firstTry: doneQ(S).filter((id) => S.q[id].tier === 1).length,
          missionsDone: main.filter((s) => sd(s[0])).length, missionsTotal: main.length,
          bossesDone: main.filter((s) => s[4] === 'boss' && sd(s[0])).length, bossesTotal: 3,
          worldDone: S.finalDone ? 1 : 0, lastPlace: (S.summary && S.summary.last) || '—', timeSec: (S.time && S.time.total) || 0
        };
      },
      /** Fase liberada no Fliperama depois de concluída no jogo de origem (salas bônus: depois de abertas). */
      unlockedMinigames(S) {
        return STAGES.filter(([id, , , , kind]) => (S.stages && S.stages[id] && S.stages[id].done) || (kind === 'bonus' && (S.unlockedBonus || []).includes(id))).map(([id]) => 'geografia_' + id);
      },
      minigames: STAGES.map(([id, title, style, ch, kind]) => ({
        minigameId: 'geografia_' + id, title, description: style + (kind === 'bonus' ? ' (sala bônus, sem questões)' : ' — reprise com o conteúdo original da fase') + '.',
        genre: style, controls: CONTROLS, icon: '🌎', chapter: ch,
        entry: { type: 'page', url: 'src/modules/geografia/jogar.html', params: { replay: id } },
        unlockText: kind === 'bonus' ? 'Ganhe medalhas de ouro no capítulo ' + ch + ' de Geografia.' : 'Conclua a fase “' + title + '” em Geografia.',
        freePlay: true, parentTest: true, records: true,
        assets: 'Sprites Kenney (CC0) e pixel art original (src/assets/shared, src/core/pixel.js)', deps: 'src/core/*, src/ui/*, src/systems/quiz.js, src/modules/geografia/*'
      })),
      collectiblePacks: ['src/modules/geografia/nexoticos.js'],
      questionBank: {
        scripts: ['src/modules/geografia/content/capitulos.js', 'src/modules/geografia/questions/c1.js', 'src/modules/geografia/questions/c2.js', 'src/modules/geografia/questions/c3.js'],
        prepare() { window.GEO = window.GEO || {}; GEO.data = GEO.data || {}; },
        build() {
          const D = (window.GEO && GEO.data) || {};
          const title = {}; STAGES.forEach((s) => { title[s[0]] = s[1]; });
          return (D.questions || []).map((q) => ({
            id: q.id, module: 'geografia', group: 'Fase ' + (q.stage || '').replace('c', '').replace('s', '-') + ' • ' + (title[q.stage] || ''), stage: q.stage, title: q.title, prompt: q.prompt, type: q.type,
            concept: q.concept, where: q.where, answer: q.answer, model: q.model, why: q.why, err: q.err, hint1: q.hint1, hint2: q.hint2,
            spec: q.spec, guided: q.guided, raw: q
          }));
        },
        statsFor(S, id) { const st = S && S.q && S.q[id]; return st ? { seen: !!st.seen, done: !!st.done, attempts: st.attempts | 0, errors: st.errors | 0, tier: st.tier | 0, first: !!st.first, guided: !!st.guided, hints: st.hintUsed ? 1 : 0 } : null; },
        concepts(S) { return (S && S.concepts) || {}; }
      },
      /** Jogo no modo de teste (sandbox, tudo liberado). fase, questao, minijogo (Parque/Arcade), parque (menu), recompensa (tela do chefe). */
      testEntry(o) { o = o || {}; return 'src/modules/geografia/jogar.html?teste=1' + ['fase', 'questao', 'minijogo', 'parque', 'recompensa'].filter((k) => o[k]).map((k) => '&' + k + '=' + encodeURIComponent(o[k])).join(''); },
      /** Área dos Pais (modo de teste): TODO conteúdo novo do módulo entra aqui para os pais testarem.
          tests/parque.cjs confere que cada minijogo registrado em GEO.parque aparece nesta lista. */
      testExtras: [
        { group: 'Menus e telas', items: [
          { t: '🎡 Parque + Arcade (menu completo)', p: { parque: 'todos' } },
          { t: '🕹️ Arcade do Mundo 1 (menu)', p: { parque: '1' } }, { t: '🕹️ Arcade do Mundo 2 (menu)', p: { parque: '2' } }, { t: '🕹️ Arcade do Mundo 3 (menu)', p: { parque: '3' } },
          { t: '🏆 Tela “Arcade liberado” (chefe do Mundo 1)', p: { recompensa: '1' } }, { t: '🏆 Tela “Arcade liberado” (chefe do Mundo 2)', p: { recompensa: '2' } }, { t: '🏆 Tela “Arcade liberado” (chefe do Mundo 3)', p: { recompensa: '3' } }] },
        { group: 'Parque do Atlas', items: [['memoria', 'Memória das Culturas'], ['arara', 'Voo da Arara'], ['cesta', 'Cesta da Feira'], ['quebra', 'Quebra-cabeça do Brasil']].map(([id, t]) => ({ t, p: { minijogo: id } })) },
        { group: 'Arcade do Mundo 1', items: [['w1_jangada', 'Jangada Radical'], ['w1_colunas', 'Colunas do Mosaico'], ['w1_quebra', 'Quebra-Mosaico']].map(([id, t]) => ({ t, p: { minijogo: id } })) },
        { group: 'Arcade do Mundo 2', items: [['w2_ninja', 'Feira Ninja'], ['w2_quermesse', 'Quermesse Tiro ao Alvo'], ['w2_nevoa', 'Pega-Névoa no Arraial']].map(([id, t]) => ({ t, p: { minijogo: id } })) },
        { group: 'Arcade do Mundo 3', items: [['w3_estrada', 'Estrada Brasil'], ['w3_invasores', 'Invasores da Poluição'], ['w3_predios', 'Empilha-Prédios']].map(([id, t]) => ({ t, p: { minijogo: id } })) }
      ],
      testTargets: STAGES.map((s) => ({ id: s[0], t: (s[4] === 'bonus' ? 'Bônus: ' : s[0].slice(1).replace('s', '-') + ' ') + s[1] }))
    }
  };
  if (window.GG && GG.registry) GG.registry.register(M);
  window.GEO_MANIFEST = M;
})();
