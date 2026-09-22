/* =====================================================================
   data/items.js — TABELA DA ECONOMIA
   Cada item: id, nome, categoria, raridade, preço, espaço (slot),
   efeito (texto), condição de desbloqueio (nível mínimo pela raridade),
   visual aplicado ao avatar e área bônus relacionada.
   A "propriedade" (se o jogador tem o item) fica no salvamento.
   Nenhuma compra usa dinheiro real; não há sorteios nem caixas.
   ===================================================================== */

EN.data.rarities = {
  comum: { label: 'Comum', color: '#8d99a6', minLevel: 1, range: '15–35' },
  incomum: { label: 'Incomum', color: '#3aa757', minLevel: 2, range: '40–75' },
  raro: { label: 'Raro', color: '#2f80ed', minLevel: 4, range: '80–140' },
  epico: { label: 'Épico', color: '#9b51e0', minLevel: 6, range: '150–240' },
  lendario: { label: 'Lendário', color: '#e67e22', minLevel: 9, range: '280+' }
};

EN.data.categories = [
  { id: 'roupa', label: 'Skins e roupas', icon: '👕' },
  { id: 'acessorio', label: 'Acessórios', icon: '🎒' },
  { id: 'companheiro', label: 'Companheiros', icon: '✨' },
  { id: 'melhoria', label: 'Melhorias de exploração', icon: '🧭' },
  { id: 'chave', label: 'Chaves e ferramentas', icon: '🗝️' },
  { id: 'decoracao', label: 'Decorações', icon: '🪴' }
];

/* XP necessário para cada nível (XP nunca é gasto). */
EN.data.levels = [0, 150, 400, 700, 1050, 1450, 1900, 2400, 2950, 3550, 4200, 4900, 5650, 6450, 7300, 8200];
EN.data.titles = [
  { lvl: 1, t: 'Aprendiz da Natureza' }, { lvl: 3, t: 'Explorador' }, { lvl: 5, t: 'Construtor de Cadeias' },
  { lvl: 7, t: 'Guardião' }, { lvl: 9, t: 'Guardião Sênior' }, { lvl: 12, t: 'Mestre EcoNexus' }
];
EN.data.frames = [
  { lvl: 1, name: 'Bronze', color: '#c58a4a' }, { lvl: 4, name: 'Prata', color: '#c0c7d1' }, { lvl: 7, name: 'Ouro', color: '#f2c94c' },
  { lvl: 10, name: 'Esmeralda', color: '#2ecc71' }, { lvl: 13, name: 'Cristal', color: '#a78bfa' }
];

/* Visual base do Guardião (antes de equipar itens). */
EN.data.baseLook = { skin: '#e9b98f', hair: '#2f1f14', hairStyle: 'short', shirt: '#3f7fd6', pants: '#394b6b', boots: '#4a3527' };

EN.data.items = [
  /* ---------------- Skins e roupas ---------------- */
  { id: 'uni_classico', name: 'Uniforme Clássico', cat: 'roupa', rarity: 'comum', price: 0, slot: 'roupa', free: true, icon: '👕', look: { shirt: '#3f7fd6', pants: '#394b6b' }, effect: 'Uniforme inicial do Guardião.' },
  { id: 'uni_verde', name: 'Uniforme Verde-Floresta', cat: 'roupa', rarity: 'comum', price: 15, slot: 'roupa', icon: '🟩', look: { shirt: '#2f9e55', pants: '#2d5a3a' }, effect: 'Visual: uniforme verde.' },
  { id: 'uni_azul', name: 'Uniforme Azul-Rio', cat: 'roupa', rarity: 'comum', price: 20, slot: 'roupa', icon: '🟦', look: { shirt: '#2d9cdb', pants: '#1f4e79' }, effect: 'Visual: uniforme azul.' },
  { id: 'uni_sol', name: 'Uniforme Amarelo-Sol', cat: 'roupa', rarity: 'comum', price: 25, slot: 'roupa', icon: '🟨', look: { shirt: '#f2c94c', pants: '#8a6a1f' }, effect: 'Visual: uniforme amarelo.' },
  { id: 'uni_folhas', name: 'Camiseta Estampa de Folhas', cat: 'roupa', rarity: 'incomum', price: 45, slot: 'roupa', icon: '🍃', look: { shirt: '#27ae60', pants: '#2d5a3a', pattern: 'folhas' }, effect: 'Visual: camiseta com folhas.' },
  { id: 'uni_crepusculo', name: 'Uniforme Crepúsculo', cat: 'roupa', rarity: 'incomum', price: 60, slot: 'roupa', icon: '🟪', look: { shirt: '#8e5cd6', pants: '#3d2b63', pattern: 'listras' }, effect: 'Visual: uniforme roxo listrado.' },
  { id: 'set_cerrado', name: 'Conjunto Guardião do Cerrado', cat: 'roupa', rarity: 'epico', price: 180, slot: 'roupa', icon: '🌾', look: { shirt: '#c9803c', pants: '#6b4424', hat: 'palha', cape: '#e0b84a' }, effect: 'Conjunto completo: roupa, chapéu de palha e capa dourada.' },
  { id: 'set_arcoiris', name: 'Traje Arco-Íris do Pantanal', cat: 'roupa', rarity: 'lendario', price: 300, slot: 'roupa', icon: '🌈', look: { shirt: '#ffffff', pants: '#4d96ff', pattern: 'arcoiris', cape: '#4d96ff', aura: '#ffe066' }, effect: 'Conjunto lendário com capa e brilho.' },
  { id: 'chapeu_explorador', name: 'Chapéu de Explorador', cat: 'roupa', rarity: 'comum', price: 30, slot: 'chapeu', icon: '🤠', look: { hat: 'explorador', hatColor: '#c9a063' }, effect: 'Visual: chapéu de aba larga.' },
  { id: 'bone_folha', name: 'Boné Folhinha', cat: 'roupa', rarity: 'comum', price: 20, slot: 'chapeu', icon: '🧢', look: { hat: 'bone', hatColor: '#2f9e55' }, effect: 'Visual: boné com uma folha.' },
  { id: 'gorro_rio', name: 'Gorro Correnteza', cat: 'roupa', rarity: 'comum', price: 25, slot: 'chapeu', icon: '🧶', look: { hat: 'gorro', hatColor: '#2d9cdb' }, effect: 'Visual: gorro azul.' },
  { id: 'coroa_folhas', name: 'Coroa de Folhas', cat: 'roupa', rarity: 'raro', price: 110, slot: 'chapeu', icon: '🌿', look: { hat: 'coroa' }, effect: 'Visual: coroa de folhas com semente dourada.' },
  { id: 'chapeu_sol', name: 'Chapéu Raios de Sol', cat: 'roupa', rarity: 'epico', price: 170, slot: 'chapeu', icon: '☀️', look: { hat: 'sol' }, effect: 'Visual: chapéu com raios solares.' },
  { id: 'capa_folhas', name: 'Capa de Folhas', cat: 'roupa', rarity: 'incomum', price: 60, slot: 'capa', icon: '🟢', look: { cape: '#3fae5b' }, effect: 'Visual: capa verde.' },
  { id: 'capa_rio', name: 'Capa Correnteza', cat: 'roupa', rarity: 'raro', price: 95, slot: 'capa', icon: '🔵', look: { cape: '#2d9cdb' }, effect: 'Visual: capa azul-rio.' },
  { id: 'capa_estelar', name: 'Capa Noite Estrelada', cat: 'roupa', rarity: 'epico', price: 210, slot: 'capa', icon: '🌌', look: { cape: '#5b3fa8', trail: 'estrelas' }, effect: 'Visual: capa roxa que deixa estrelinhas.' },

  /* ---------------- Acessórios ---------------- */
  { id: 'mochila_lona', name: 'Mochila de Lona', cat: 'acessorio', rarity: 'comum', price: 20, slot: 'mochila', icon: '🎒', look: { backpack: '#b5824b' }, effect: 'Visual: mochila marrom.' },
  { id: 'oculos_sol', name: 'Óculos de Sol', cat: 'acessorio', rarity: 'comum', price: 25, slot: 'oculos', icon: '🕶️', look: { glasses: '#222222' }, effect: 'Visual: óculos escuros.' },
  { id: 'oculos_cientista', name: 'Óculos de Cientista', cat: 'acessorio', rarity: 'incomum', price: 45, slot: 'oculos', icon: '👓', look: { glasses: '#c0392b' }, effect: 'Visual: óculos redondos.' },
  { id: 'botas_trilha', name: 'Botas Vermelhas de Trilha', cat: 'acessorio', rarity: 'comum', price: 30, slot: 'botas', icon: '🥾', look: { boots: '#c0392b' }, effect: 'Visual: botas vermelhas.' },
  { id: 'aura_folhas', name: 'Aura de Folhas', cat: 'acessorio', rarity: 'raro', price: 120, slot: 'aura', icon: '💚', look: { aura: '#62e38b' }, effect: 'Visual: brilho verde ao redor.' },
  { id: 'aura_gotas', name: 'Aura de Gotas', cat: 'acessorio', rarity: 'raro', price: 130, slot: 'aura', icon: '💙', look: { aura: '#6fc3ff' }, effect: 'Visual: brilho azul ao redor.' },
  { id: 'aura_solar', name: 'Aura Solar Dourada', cat: 'acessorio', rarity: 'epico', price: 200, slot: 'aura', icon: '💛', look: { aura: '#ffd166' }, effect: 'Visual: brilho dourado ao redor.' },
  { id: 'rastro_flores', name: 'Rastro de Flores', cat: 'acessorio', rarity: 'incomum', price: 70, slot: 'rastro', icon: '🌸', look: { trail: 'flores' }, effect: 'Visual: pétalas ao caminhar.' },
  { id: 'rastro_bolhas', name: 'Rastro de Bolhas', cat: 'acessorio', rarity: 'raro', price: 90, slot: 'rastro', icon: '🫧', look: { trail: 'bolhas' }, effect: 'Visual: bolhinhas ao caminhar.' },
  { id: 'rastro_estrelas', name: 'Rastro de Estrelas', cat: 'acessorio', rarity: 'epico', price: 220, slot: 'rastro', icon: '⭐', look: { trail: 'estrelas' }, effect: 'Visual: estrelinhas ao caminhar.' },

  /* ---------------- Companheiros ---------------- */
  { id: 'lumi_classica', name: 'Lumi Clássica', cat: 'companheiro', rarity: 'comum', price: 0, slot: 'lumi', free: true, icon: '💧', lumi: 'classica', effect: 'A Lumi de sempre: folha, gota e luz.' },
  { id: 'lumi_orvalho', name: 'Lumi Orvalho', cat: 'companheiro', rarity: 'incomum', price: 50, slot: 'lumi', icon: '💠', lumi: 'orvalho', effect: 'Visual: Lumi azul-orvalho.' },
  { id: 'lumi_ipe', name: 'Lumi Ipê', cat: 'companheiro', rarity: 'raro', price: 100, slot: 'lumi', icon: '🌼', lumi: 'ipe', effect: 'Visual: Lumi rosa com folha amarela.' },
  { id: 'lumi_aurora', name: 'Lumi Amanhecer', cat: 'companheiro', rarity: 'epico', price: 190, slot: 'lumi', icon: '🌅', lumi: 'aurora', effect: 'Visual: Lumi verde-clara com folha laranja.' },
  { id: 'lumi_cristal', name: 'Lumi Cristal', cat: 'companheiro', rarity: 'lendario', price: 320, slot: 'lumi', icon: '💎', lumi: 'cristal', effect: 'Visual lendário: Lumi de cristal brilhante.' },
  { id: 'pet_joaninha', name: 'Joaninha Pontinho', cat: 'companheiro', rarity: 'comum', price: 30, slot: 'mascote', icon: '🐞', pet: 'joaninha', effect: 'Mascote que segue você.' },
  { id: 'pet_peixe', name: 'Peixinho Bolha', cat: 'companheiro', rarity: 'comum', price: 35, slot: 'mascote', icon: '🐟', pet: 'peixe', effect: 'Mascote que flutua numa bolha.' },
  { id: 'pet_tatu', name: 'Tatuzinho Bolinha', cat: 'companheiro', rarity: 'incomum', price: 60, slot: 'mascote', icon: '🪨', pet: 'tatu', effect: 'Mascote que rola atrás de você.' },
  { id: 'pet_arara', name: 'Ararinha Brisa', cat: 'companheiro', rarity: 'raro', price: 120, slot: 'mascote', icon: '🦜', pet: 'arara', effect: 'Mascote colorida que acompanha você.' },
  { id: 'pet_lobo', name: 'Lobinho Brasa', cat: 'companheiro', rarity: 'epico', price: 240, slot: 'mascote', icon: '🐺', pet: 'lobo', effect: 'Mascote de pernas longas e pelo laranja.' },

  /* ---------------- Melhorias de exploração (efeitos reais) ---------------- */
  { id: 'botas_explorador', name: 'Botas do Explorador', cat: 'melhoria', rarity: 'incomum', price: 45, slot: 'botas', icon: '👢', look: { boots: '#6b4e22' }, fx: 'speed', effect: 'Anda 15% mais rápido pelos mapas (não afeta atividades nem perguntas).' },
  { id: 'mochila_ampliada', name: 'Mochila Ampliada', cat: 'melhoria', rarity: 'incomum', price: 55, slot: 'mochila', icon: '🎒', look: { backpack: '#2f9e55' }, fx: 'colecao', effect: 'Mostra no HUD quantos EcoFragmentos faltam no mapa e libera a aba “Lembranças” no inventário.' },
  { id: 'lupa_ecologica', name: 'Lupa Ecológica', cat: 'melhoria', rarity: 'incomum', price: 50, slot: 'ferramenta', icon: '🔍', look: { tool: 'lupa' }, fx: 'lupa', effect: 'Destaca baús e pontos secretos próximos com um círculo brilhante.' },
  { id: 'bussola_lumi', name: 'Bússola de Lumi', cat: 'melhoria', rarity: 'comum', price: 35, slot: 'bussola', icon: '🧭', fx: 'bussola', effect: 'Mostra uma seta dourada até o próximo objetivo.' },
  { id: 'medalhao_solar', name: 'Medalhão Solar', cat: 'melhoria', rarity: 'raro', price: 90, slot: 'medalhao', icon: '🏅', fx: 'medalhao', effect: '+2 EcoMoedas extras ao acertar uma questão de primeira (limite total: 40 moedas).' },
  { id: 'cantil', name: 'Cantil Restaurador', cat: 'melhoria', rarity: 'incomum', price: 40, slot: 'cantil', icon: '🧴', fx: 'cantil', effect: 'Recupera 1 folha de energia, uma vez por missão.' },
  { id: 'caderno_melhorado', name: 'Caderno Melhorado', cat: 'melhoria', rarity: 'comum', price: 30, slot: 'caderno', icon: '📘', fx: 'caderno', effect: 'Adiciona busca no Caderno e a aba “Questões estudadas”, com as explicações já vistas.' },
  { id: 'ima_fragmentos', name: 'Ímã de EcoFragmentos', cat: 'melhoria', rarity: 'incomum', price: 60, slot: 'ima', icon: '🧲', fx: 'ima', effect: 'Atrai EcoFragmentos próximos (raio de 3 passos e meio).' },

  /* ---------------- Chaves e ferramentas (áreas bônus opcionais) ---------------- */
  { id: 'mascara_mergulho', name: 'Máscara de Mergulho', cat: 'chave', rarity: 'incomum', price: 60, slot: null, icon: '🤿', bonus: 'bonus_mergulho', effect: 'Abre o Mergulho do Lago: coleta de bolhas de oxigênio (área bônus).' },
  { id: 'corda_escalada', name: 'Corda de Escalada', cat: 'chave', rarity: 'incomum', price: 55, slot: null, icon: '🪢', bonus: 'bonus_copa', effect: 'Abre a Copa da Floresta: observação de biodiversidade (área bônus).' },
  { id: 'chave_lab', name: 'Chave do Laboratório', cat: 'chave', rarity: 'raro', price: 85, slot: null, icon: '🗝️', bonus: 'bonus_lab', effect: 'Abre a Sala Bônus de Montagem dos Ciclos.' },
  { id: 'lanterna', name: 'Lanterna Ecológica', cat: 'chave', rarity: 'raro', price: 90, slot: null, icon: '🔦', bonus: 'bonus_caverna', effect: 'Abre a Caverna dos Decompositores e ilumina mais longe.' },
  { id: 'passe_biomas', name: 'Passe dos Biomas', cat: 'chave', rarity: 'epico', price: 160, slot: null, icon: '🎫', bonus: 'bonus_biomas', effect: 'Abre as Trilhas Extras dos seis biomas.' },
  { id: 'semente_rara', name: 'Semente Rara', cat: 'chave', rarity: 'incomum', price: 40, slot: null, icon: '🌰', bonus: 'jardim_raro', effect: 'Abre o Canteiro Secreto do Jardim da Vila e libera plantas raras para decorar.' },

  /* ---------------- Decorações (quarto do Guardião) ---------------- */
  { id: 'deco_samambaia', name: 'Vaso de Samambaia', cat: 'decoracao', rarity: 'comum', price: 15, slot: 'deco_samambaia', icon: '🪴', deco: true, effect: 'Decora o quarto do Guardião.' },
  { id: 'deco_placa', name: 'Placa “Guardião em Ação”', cat: 'decoracao', rarity: 'comum', price: 20, slot: 'deco_placa', icon: '🪧', deco: true, effect: 'Decora o quarto do Guardião.' },
  { id: 'deco_tapete', name: 'Tapete de Folhas', cat: 'decoracao', rarity: 'comum', price: 25, slot: 'deco_tapete', icon: '🟫', deco: true, effect: 'Decora o quarto do Guardião.' },
  { id: 'deco_estante', name: 'Estante de Troféus', cat: 'decoracao', rarity: 'incomum', price: 50, slot: 'deco_estante', icon: '🗄️', deco: true, effect: 'Mostra suas medalhas no quarto.' },
  { id: 'deco_mapa', name: 'Mapa dos Biomas', cat: 'decoracao', rarity: 'incomum', price: 65, slot: 'deco_mapa', icon: '🗺️', deco: true, effect: 'Quadro com os seis biomas brasileiros.' },
  { id: 'deco_luminaria', name: 'Luminária de Vaga-lumes', cat: 'decoracao', rarity: 'raro', price: 85, slot: 'deco_luminaria', icon: '🏮', deco: true, effect: 'Luz suave no quarto.' },
  { id: 'deco_aquario', name: 'Aquário Virtual', cat: 'decoracao', rarity: 'raro', price: 110, slot: 'deco_aquario', icon: '🐠', deco: true, effect: 'Aquário com peixinhos animados.' },
  { id: 'deco_poltrona', name: 'Poltrona de Raízes', cat: 'decoracao', rarity: 'epico', price: 170, slot: 'deco_poltrona', icon: '🪑', deco: true, effect: 'Poltrona especial no quarto.' },
  { id: 'deco_trofeu', name: 'Troféu Dourado do Guardião', cat: 'decoracao', rarity: 'lendario', price: 280, slot: 'deco_trofeu', icon: '🏆', deco: true, effect: 'Troféu lendário para exibir.' },
  { id: 'deco_arvore', name: 'Árvore da Vida em Miniatura', cat: 'decoracao', rarity: 'lendario', price: 350, slot: 'deco_arvore', icon: '🌳', deco: true, effect: 'Arvorezinha brilhante no quarto.' }
];

EN.data.itemById = {};
EN.data.items.forEach((it) => { EN.data.itemById[it.id] = it; });

/* Plantas do Jardim da Vila (sementes comuns vêm dos EcoFragmentos). */
EN.data.plants = [
  { id: 'girassol', name: 'Girassol', icon: '🌻', cost: 1 },
  { id: 'tulipa', name: 'Flor rosa', icon: '🌷', cost: 1 },
  { id: 'muda', name: 'Muda de árvore', icon: '🌱', cost: 1 },
  { id: 'cenoura', name: 'Cenoura', icon: '🥕', cost: 1 },
  { id: 'milho', name: 'Milho', icon: '🌽', cost: 2 },
  { id: 'arbusto', name: 'Arbusto florido', icon: '🌺', cost: 2 },
  { id: 'ipe', name: 'Ipê (raro)', icon: '🌸', cost: 2, rare: true },
  { id: 'bromelia', name: 'Bromélia (rara)', icon: '🪷', cost: 2, rare: true },
  { id: 'cacto', name: 'Mandacaru (raro)', icon: '🌵', cost: 2, rare: true },
  { id: 'palmeira', name: 'Palmeira (rara)', icon: '🌴', cost: 3, rare: true }
];
EN.data.gardenDecor = [
  { id: 'pedra', name: 'Pedrinha', icon: '🪨' }, { id: 'placa', name: 'Plaquinha', icon: '🪧' },
  { id: 'regador', name: 'Regador', icon: '🚿' }, { id: 'borboleta', name: 'Borboleta', icon: '🦋' }
];
