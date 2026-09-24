/* =====================================================================
   src/nexus/data/itens.js — ITENS DA LOJA NEXUS (somente Moedas Nexus).
   Nada é comprado com dinheiro real. Preços pensados para que itens
   comuns sejam alcançáveis cedo (uma sessão de estudo rende ~20–60
   moedas) e itens especiais peçam mais progresso, sem bloquear nenhuma
   função essencial. slot = onde o item é usado.
   Materiais (💎 Cristais de Decoração) vêm da coleta no hub e das
   expedições — nunca da pontuação escolar — e servem só para a Oficina.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const I = (id, slot, name, price, icon, desc, extra) => Object.assign({ id, slot, name, price, icon, desc }, extra || {});
  GG.NEXUS_SLOTS = {
    hat: 'Chapéu', face: 'Rosto', back: 'Costas', frame: 'Moldura', trail: 'Rastro', entry: 'Efeito de entrada', victory: 'Efeito de vitória',
    title: 'Título', palette: 'Paleta do Nexus', music: 'Trilha', decor: 'Decoração', acc: 'Acessório de Nexótico', template: 'Modelo de base', fragments: 'Fragmentos'
  };
  GG.NEXUS_ITEMS = [
    // Roupas e acessórios do Gabriel
    I('bone_nexus', 'hat', 'Boné Nexus', 20, '🧢', 'Boné azul com o símbolo do Nexus.'),
    I('capacete_explorador', 'hat', 'Capacete de Explorador', 35, '⛑️', 'Para expedições pelos mundos.'),
    I('cartola_magica', 'hat', 'Cartola Mágica', 60, '🎩', 'Às vezes solta uma estrelinha.'),
    I('coroa_cristal', 'hat', 'Coroa de Cristal', 160, '👑', 'Brilha como o coração do Nexus.'),
    I('oculos_neon', 'face', 'Óculos Neon', 25, '🕶️', 'Estilo total no Fliperama.'),
    I('oculos_lab', 'face', 'Óculos de Laboratório', 30, '🥽', 'Clássico de cientista.'),
    I('capa_neon', 'back', 'Capa Neon', 70, '🦸', 'Capa que muda de cor ao andar.', { color: '#29e7ff' }),
    I('mochila_jato', 'back', 'Mochila a Jato', 120, '🚀', 'Solta faísca quando você viaja pelo hub.', { color: '#ffb020' }),
    I('asas_luz', 'back', 'Asas de Luz', 220, '🪽', 'Asas brilhantes (combinam com o Atlas Alado).', { color: '#fff3a0' }),
    // Molduras e títulos
    I('moldura_neon', 'frame', 'Moldura Neon', 30, '🟦', 'Moldura azul-néon para o seu retrato.', { color: '#29e7ff' }),
    I('moldura_arco', 'frame', 'Moldura Arco-Íris', 60, '🌈', 'Todas as cores de uma vez.', { color: 'rainbow' }),
    I('moldura_dourada', 'frame', 'Moldura Dourada', 140, '🟨', 'Para colecionadores lendários.', { color: '#f5b700' }),
    I('titulo_explorador', 'title', 'Título: Explorador do Nexus', 15, '🏷️', 'Aparece embaixo do seu nome.'),
    I('titulo_cientista', 'title', 'Título: Cientista Curioso', 25, '🏷️', 'Aparece embaixo do seu nome.'),
    I('titulo_cartografo', 'title', 'Título: Cartógrafo Veloz', 25, '🏷️', 'Aparece embaixo do seu nome.'),
    I('titulo_colecionador', 'title', 'Título: Colecionador de Nexóticos', 80, '🏷️', 'Aparece embaixo do seu nome.'),
    // Rastros e efeitos
    I('rastro_estrelas', 'trail', 'Rastro de Estrelas', 30, '✨', 'Estrelinhas por onde você passa.', { fx: 'estrelas' }),
    I('rastro_bolhas', 'trail', 'Rastro de Bolhas', 30, '🫧', 'Bolhas de sabão coloridas.', { fx: 'bolhas' }),
    I('rastro_folhas', 'trail', 'Rastro de Folhas', 30, '🍃', 'Folhinhas girando no ar.', { fx: 'folhas' }),
    I('rastro_notas', 'trail', 'Rastro Musical', 45, '🎵', 'Notas musicais a cada passo.', { fx: 'notas' }),
    I('entrada_portal', 'entry', 'Entrada de Portal', 40, '🌀', 'Chegue às áreas por um portal giratório.', { fx: 'portal' }),
    I('entrada_raio', 'entry', 'Entrada Relâmpago', 60, '⚡', 'Chegue com um raio (inofensivo!).', { fx: 'raio' }),
    I('vitoria_confete', 'victory', 'Vitória com Confete', 30, '🎉', 'Chuva de confete ao vencer.', { fx: 'confete' }),
    I('vitoria_fogos', 'victory', 'Vitória com Fogos', 60, '🎆', 'Fogos coloridos ao vencer.', { fx: 'fogos' }),
    // Paletas e trilhas
    I('paleta_por_do_sol', 'palette', 'Paleta Pôr do Sol', 50, '🌇', 'O Nexus em tons de laranja e rosa.', { filter: 'sepia(.25) saturate(1.3) hue-rotate(-12deg)' }),
    I('paleta_noite_neon', 'palette', 'Paleta Noite Neon', 70, '🌃', 'Noite com luzes neon.', { filter: 'brightness(.72) saturate(1.5) hue-rotate(20deg)' }),
    I('paleta_algodao', 'palette', 'Paleta Algodão-Doce', 50, '🍭', 'Tons pastel de algodão-doce.', { filter: 'saturate(.8) brightness(1.08) hue-rotate(-28deg)' }),
    I('trilha_festa', 'music', 'Trilha Festa', 25, '🎶', 'Música animada para o hub.', { song: 'festa' }),
    I('trilha_oceano', 'music', 'Trilha Oceano', 25, '🌊', 'Música tranquila de ondas.', { song: 'oceano' }),
    I('trilha_turbo', 'music', 'Trilha Turbo', 35, '🏁', 'Música acelerada.', { song: 'corrida' }),
    // Decorações da base (size: 'small' | 'big'; big só se move com a Força Continental)
    I('pufe_nexus', 'decor', 'Pufe Nexus', 20, '🛋️', 'Pufe fofinho.', { size: 'small' }),
    I('planta_neon', 'decor', 'Planta Neon', 20, '🪴', 'Planta que brilha no escuro.', { size: 'small' }),
    I('luminaria_lava', 'decor', 'Luminária de Lava', 30, '💡', 'Bolhas coloridas subindo.', { size: 'small' }),
    I('globo_mesa', 'decor', 'Globo de Mesa', 30, '🌍', 'Um globo que gira.', { size: 'small' }),
    I('telescopio', 'decor', 'Telescópio', 45, '🔭', 'Para olhar as ilhas flutuantes.', { size: 'small' }),
    I('microscopio_gigante', 'decor', 'Microscópio Gigante', 45, '🔬', 'Decoração de cientista.', { size: 'small' }),
    I('poster_ciencias', 'decor', 'Pôster do Mundo de Ciências', 25, '🖼️', 'Lembrança da Missão EcoNexus.', { size: 'small', tint: '#2f9e5b' }),
    I('poster_geografia', 'decor', 'Pôster do Mundo de Geografia', 25, '🗺️', 'Lembrança do Brasil em Movimento.', { size: 'small', tint: '#1f9e7a' }),
    I('aquario', 'decor', 'Aquário Borbulhante', 90, '🐠', 'Peixinhos nadando.', { size: 'big' }),
    I('fliperama_mini', 'decor', 'Fliperama de Quarto', 120, '🕹️', 'Um mini fliperama só seu.', { size: 'big' }),
    I('foguete_brinquedo', 'decor', 'Foguete de Brinquedo', 110, '🚀', 'Pronto para decolar (de mentirinha).', { size: 'big' }),
    I('trampolim', 'decor', 'Trampolim de Gelatina', 100, '🟣', 'Os Nexóticos adoram pular.', { size: 'big' }),
    // Acessórios para Nexóticos
    I('acc_laco', 'acc', 'Laço de Festa', 15, '🎀', 'Um laço para o seu Nexótico favorito.'),
    I('acc_chapeu_festa', 'acc', 'Chapéu de Festa', 20, '🥳', 'Para aniversários de Nexótico.'),
    I('acc_oculos', 'acc', 'Óculos Estilosos', 20, '😎', 'Nexótico estiloso.'),
    I('acc_coroa', 'acc', 'Coroinha', 60, '👑', 'Coroinha para o seu campeão.'),
    // Modelos prontos de base (arrumam as decorações que você já tem)
    I('modelo_laboratorio', 'template', 'Modelo Laboratório', 0, '🧪', 'Arruma a base como um laboratório (grátis).'),
    I('modelo_explorador', 'template', 'Modelo Explorador', 0, '🧭', 'Arruma a base como um acampamento (grátis).'),
    I('modelo_fliperama', 'template', 'Modelo Fliperama', 0, '🎮', 'Arruma a base como um fliperama (grátis).'),
    // Fragmentos (para trocar por Nexóticos)
    I('pacote_fragmentos', 'fragments', 'Pacote de 10 Fragmentos', 50, '🧩', 'Fragmentos servem para trocar por Nexóticos.', { amount: 10, repeatable: true })
  ];
  /** Decorações feitas na Oficina com 💎 Cristais de Decoração (coleta/expedições). */
  GG.NEXUS_CRAFT = [
    { id: 'craft_cristal_luz', name: 'Luminária de Cristal', icon: '💎', cost: 6, size: 'small', desc: 'Feita com cristais que você coletou.' },
    { id: 'craft_arco_neon', name: 'Arco Neon', icon: '🌈', cost: 10, size: 'small', desc: 'Um arco-íris de luz para a parede.' },
    { id: 'craft_fonte', name: 'Fonte dos Mundos', icon: '⛲', cost: 16, size: 'big', desc: 'Uma mini fonte da Praça dos Mundos.' },
    { id: 'craft_ilha', name: 'Ilha Flutuante de Mesa', icon: '🏝️', cost: 20, size: 'big', desc: 'Uma ilhazinha que flutua de verdade (quase).' }
  ];
  /** Recompensas cosméticas limitadas do Fliperama (uma vez cada; nunca pontos de estudo). */
  GG.NEXUS_ARCADE_REWARDS = [
    { id: 'trofeu_bronze', need: 3, name: 'Troféu de Fliperama (bronze)', icon: '🥉' },
    { id: 'trofeu_prata', need: 8, name: 'Troféu de Fliperama (prata)', icon: '🥈' },
    { id: 'trofeu_ouro', need: 15, name: 'Troféu de Fliperama (ouro)', icon: '🥇' },
    { id: 'titulo_mestre_fliperama', need: 20, name: 'Título: Mestre do Fliperama', icon: '🏷️', slot: 'title' },
    { id: 'taca_torneio', need: 99999, name: 'Taça do Torneio', icon: '🏆' }
  ];
  GG.nexusItem = (id) => GG.NEXUS_ITEMS.find((i) => i.id === id) || GG.NEXUS_CRAFT.find((i) => i.id === id) || GG.NEXUS_ARCADE_REWARDS.find((i) => i.id === id) || null;
})();
