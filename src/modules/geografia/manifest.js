/* =====================================================================
   src/modules/geografia/manifest.js — MANIFESTO DO MÓDULO DE GEOGRAFIA.
   Registrado no lançador (inicio.html) e usado pela página do módulo
   (jogar.html) para saber quais arquivos carregar. O progresso exibido
   no lançador vem do save isolado "ecoNexus.geografia.v1".
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'ecoNexus.geografia.v1';
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
    }
  };
  if (window.GG && GG.registry) GG.registry.register(M);
  window.GEO_MANIFEST = M;
})();
