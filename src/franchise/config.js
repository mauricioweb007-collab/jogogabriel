/* =====================================================================
   src/franchise/config.js — CONFIGURAÇÃO CENTRAL DA FRANQUIA.
   Toda regra numérica do perfil global (Pontuação de Carreira, Moedas
   Nexus, níveis do Nexus, raridades, cápsula, sessão dos pais) mora
   AQUI. Nenhum outro arquivo deve repetir estes números.
   Todos os valores são inteiros (sem ponto flutuante no livro-razão).
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  GG.FR = {
    schemaVersion: 1,
    /** Taxa de conversão: cada N pontos válidos de estudo = 1 Moeda Nexus (resto acumulado). */
    pointsPerCoin: 10,
    /** Pontos de estudo por tipo de conquista (usados pelos adaptadores das matérias). */
    points: {
      questionDone: 40,      // questão do livro concluída (qualquer caminho, inclusive guiado)
      questionTier2: 30,     // bônus: concluída sem precisar da versão guiada
      questionTier1: 30,     // bônus: correta de primeira
      mission: 200,          // fase/região concluída
      boss: 500,             // chefe/arena vencido
      chapter: 150,          // capítulo concluído
      finale: 300            // história/campanha concluída
    },
    /** Limite de segurança de um único evento. */
    maxEventScore: 2000,
    /** Nível do Nexus = limiar de Pontuação de Carreira (o índice + 1 é o nível). */
    nexusLevels: [0, 300, 900, 1800, 3000, 4500, 6500, 9000, 12000, 15500],
    levelNames: ['Nexus Adormecido', 'Primeira Faísca', 'Praça Acesa', 'Parque Vivo', 'Fliperama Ligado', 'Ilhas Flutuantes', 'Nexus Brilhante', 'Nexus Radiante', 'Nexus Lendário', 'Coração do Nexus'],
    /** Raridades (configuráveis). A cor nunca é o único sinal: há ícone, moldura e texto. */
    rarities: [
      { id: 'comum', label: 'Comum', color: '#aab4c3', icon: '●', frame: 'prata', order: 1, dupFragments: 3, fragmentCost: 12, capsuleWeight: 50 },
      { id: 'raro', label: 'Raro', color: '#3b82f6', icon: '◆', frame: 'azul', order: 2, dupFragments: 5, fragmentCost: 25, capsuleWeight: 30 },
      { id: 'epico', label: 'Épico', color: '#9b5cf6', icon: '⬟', frame: 'roxa', order: 3, dupFragments: 8, fragmentCost: 45, capsuleWeight: 15 },
      { id: 'mitico', label: 'Mítico', color: '#e0287a', icon: '✦', frame: 'magenta', order: 4, dupFragments: 12, fragmentCost: 70, capsuleWeight: 5 },
      { id: 'lendario', label: 'Lendário', color: '#f5b700', icon: '♛', frame: 'dourada', order: 5, dupFragments: 20, fragmentCost: 110, capsuleWeight: 0 }
    ],
    /** Cápsula-surpresa (somente Moedas Nexus; regras visíveis; proteção contra repetição). */
    capsule: { price: 30, pity: 3, fragmentsOnly: 6 },
    /** Expedições dos Nexóticos (sem espera artificial longa). */
    expedition: { seconds: 45, perDay: 6 },
    /** Coleta decorativa no hub (Mochilango dá +1). */
    hubBag: 5,
    /** Fliperama: recompensas cosméticas limitadas (nunca pontos de estudo). */
    arcade: { medalScores: { bronze: 40, prata: 65, ouro: 85 }, tourneySize: [3, 5] },
    /** Área dos Pais. */
    parent: { sessionMinutesDefault: 10, sessionMinutesOptions: [5, 10, 15, 30], maxAttempts: 5, lockSeconds: 30 },
    /** Sessão recreativa sugerida (sem bloquear). */
    suggestedMinutes: 15
  };
  GG.FR.rarityById = (id) => GG.FR.rarities.find((r) => r.id === id) || null;
  /** Nível do Nexus a partir da Pontuação de Carreira. */
  GG.FR.levelFor = function (career) {
    const L = GG.FR.nexusLevels; let lvl = 1;
    for (let i = 0; i < L.length; i++) if (career >= L[i]) lvl = i + 1;
    const cur = L[lvl - 1], next = L[lvl] == null ? null : L[lvl];
    return { level: lvl, name: GG.FR.levelNames[lvl - 1], cur, next, pct: next == null ? 100 : Math.floor(((career - cur) * 100) / (next - cur)) };
  };
})();
