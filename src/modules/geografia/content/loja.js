/* =====================================================================
   content/loja.js — economia EXCLUSIVA de Geografia (não mexe na loja,
   moedas ou inventário de Ciências). Itens temáticos com benefícios
   permitidos: velocidade moderada em fases já concluídas, ímã, indicação
   do próximo objetivo, uma pista extra por fase, recuperação de energia,
   acesso a salas bônus e personalização. Nada compra respostas, pula
   conteúdo obrigatório ou gera nota falsa.
   ===================================================================== */
(function () {
  'use strict';
  GEO.data.rewards = {
    tier1: { xp: 100, coins: 12, stars: 3, pts: 100, label: 'Correta de primeira' },
    tier2: { xp: 70, coins: 8, stars: 2, pts: 70, label: 'Correta na 2ª tentativa ou com pista' },
    tier3: { xp: 40, coins: 5, stars: 1, pts: 40, label: 'Correta com a versão guiada' },
    confirm: { xp: 20, coins: 2, pts: 20, label: 'Nova aplicação correta' },
    check: { xp: 25, coins: 2, pts: 25, label: 'Checagem/afirmação correta' },
    stage: { xp: 80, coins: 10, label: 'Fase concluída' },
    fragment: { pts: 10, coins: 1, label: 'Fragmento do Atlas' },
    medal: { prata: 5, ouro: 10, diamante: 15 },
    finalTrophy: { xp: 300, coins: 60 },
    replayFactor: 0.3, replayPerDay: 2
  };
  GEO.data.levels = [0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 9000];
  GEO.data.titles = ['Explorador Novato', 'Leitor de Mapas', 'Cartógrafo Aprendiz', 'Viajante do Atlas', 'Guardião das Rotas', 'Mestre das Culturas', 'Cartógrafo Real', 'Guardião do Atlas', 'Lenda do Atlas', 'Lenda do Atlas', 'Lenda do Atlas', 'Lenda do Atlas'];
  GEO.data.items = [
    { id: 'chapeu', icon: '🎩', name: 'Chapéu do Cartógrafo', price: 80, type: 'acessorio', effect: 'hint', desc: 'Uma pista extra por fase: tira uma alternativa errada (não mostra a resposta).' },
    { id: 'mochila', icon: '🎒', name: 'Mochila-Mapa', price: 60, type: 'acessorio', effect: 'arrow', desc: 'Mostra uma seta para o próximo objetivo nas fases.' },
    { id: 'botas', icon: '🥾', name: 'Botas do Explorador Urbano', price: 90, type: 'acessorio', effect: 'speed', desc: 'Velocidade moderada (+20%) em fases que você já concluiu.' },
    { id: 'capa', icon: '🧣', name: 'Capa Mosaico do Brasil', price: 70, type: 'roupa', effect: 'heart', desc: '+1 coração de energia de ação nas fases.' },
    { id: 'aura', icon: '🧭', name: 'Aura de Bússola', price: 100, type: 'efeito', effect: 'magnet', desc: 'Ímã: fragmentos e moedas próximos vêm até você.' },
    { id: 'garrafa', icon: '🧃', name: 'Garrafinha de Energia', price: 40, type: 'acessorio', effect: 'refill', desc: 'Recupera toda a energia de ação uma vez por fase.' },
    { id: 'xilo', icon: '🪵', name: 'Skin Pixel Xilogravura', price: 120, type: 'skin', effect: 'skin', desc: 'Visual de Gabriel em estilo xilogravura.' },
    { id: 'naveAtlas', icon: '🚀', name: 'Nave do Atlas', price: 110, type: 'nave', effect: 'ship', desc: 'Pintura dourada para a nave-cartográfica.' },
    { id: 'trilha', icon: '✨', name: 'Trilha de Mapinhas', price: 60, type: 'efeito', effect: 'trail', desc: 'Partículas de pequenos mapas atrás de Gabriel.' },
    { id: 'miniBot', icon: '🤖', name: 'Mascote Mini-GeoBot', price: 150, type: 'mascote', effect: 'pet', desc: 'Um Mini-GeoBot acompanha Gabriel nas fases.' },
    { id: 'boneAzul', icon: '🧢', name: 'Boné Azul do Explorador', price: 30, type: 'roupa', effect: 'cap', desc: 'Troca a cor do boné de Gabriel.' },
    { id: 'atlasDourado', icon: '📔', name: 'Atlas Vivo Dourado', price: 0, type: 'trofeu', effect: 'goldpack', reward: true, desc: 'Item temático entregue ao reunir as três páginas do Atlas.' }
  ];
  /** Molduras e títulos liberados por desempenho (não se compram). */
  GEO.data.frames = [
    { id: 'bronze', name: 'Moldura Bronze', need: 'Conquistar 3 medalhas de qualquer tipo', color: '#cd7f32' },
    { id: 'prata', name: 'Moldura Prata', need: 'Conquistar 5 medalhas de prata ou melhores', color: '#c0c6d6' },
    { id: 'ouro', name: 'Moldura Ouro', need: 'Conquistar 8 medalhas de ouro ou melhores', color: '#ffd23f' },
    { id: 'diamante', name: 'Moldura Diamante', need: 'Conquistar 5 medalhas de diamante', color: '#7ff0ff' }
  ];
})();
