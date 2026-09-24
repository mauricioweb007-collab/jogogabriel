/* =====================================================================
   src/modules/matematica/manifest.js — MUNDO DE MATEMÁTICA (EM BREVE).
   ATENÇÃO: o JOGO de Matemática ainda NÃO existe neste repositório.
   Este manifesto só registra o mundo e o pacote de colecionáveis
   aprovado (1 personagem: Gato Gráfico). Não há save, fases, questões
   nem minigames de Matemática. Quando o jogo for criado (com o material
   da prova entregue pelo usuário), completar aqui: entry, saveNamespace,
   scoreAdapter, stats, unlockedMinigames, minigames, questionBank.
   ===================================================================== */
(function () {
  'use strict';
  GG.registry.register({
    id: 'matematica_em_breve', subject: 'Matemática', title: 'Mundo de Matemática', subtitle: 'Em breve', version: 0, enabled: false, comingSoon: true, order: 3,
    theme: { color: '#e0287a', icon: '📊', art: 'matematica' },
    entry: null, saveKey: null,
    progress() { return { started: false, percent: 0, last: '—', medals: 0, medalsLabel: 'medalhas' }; },
    franchise: {
      moduleId: 'matematica', title: 'Matemática (em breve)', version: '0.0.0', comingSoon: true,
      color: '#e0287a', icon: '📊', world: 'Mundo de Matemática',
      entryRoute: null, saveNamespace: null,
      scoreAdapter() { return []; },
      stats() { return { percent: 0 }; },
      unlockedMinigames() { return []; },
      minigames: [],
      collectiblePacks: ['src/modules/matematica/nexoticos.js']
    }
  });
})();
