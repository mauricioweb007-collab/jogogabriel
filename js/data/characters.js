/* =====================================================================
   data/characters.js — elenco original do jogo (aparência e função).
   A aparência ("look") é usada tanto no mundo quanto no retrato do
   diálogo. Todos os personagens foram criados para este jogo.
   ===================================================================== */
EN.data.speakers = {
  lumi: { name: 'Lumi', kind: 'lumi', role: 'Guia: criatura de folha, gota d’água e luz solar' },
  narrador: { name: 'Narrador', kind: 'emoji', emoji: '📜', role: 'Narração' },
  nevoa: { name: 'Névoa do Desequilíbrio', kind: 'emoji', emoji: '🌫️', role: 'Antagonista simbólico' },
  nara: { name: 'Guardiã Nara', role: 'Cuida dos animais silvestres', look: { skin: '#c98e62', hair: '#1f140c', hairStyle: 'braid', shirt: '#6b8e23', pants: '#4a5a2a', hat: 'guarda', badge: true } },
  kaua: { name: 'Guia Kauã', role: 'Guia especializado da área de preservação', look: { skin: '#8d5a3b', hair: '#111111', hairStyle: 'short', shirt: '#e67e22', pants: '#5a4632', hat: 'bone', hatColor: '#d35400', backpack: '#7a5230' } },
  aurora: { name: 'Pesquisadora Aurora', role: 'Faz fotos e desenhos científicos', look: { skin: '#f3d0b0', hair: '#b03a2e', hairStyle: 'long', shirt: '#9b59b6', coat: '#ffffff', glasses: '#333333' } },
  broto: { name: 'Professor Broto', role: 'Ensina produtores, consumidores e cadeias', look: { skin: '#e0ac7e', hair: '#95a5a6', hairStyle: 'short', beard: '#b0b8bb', shirt: '#27ae60', pants: '#5d4037', glasses: '#654321', hat: 'palha' } },
  maru: { name: 'Agricultora Maru', role: 'Cuida do sítio e da paisagem rural', look: { skin: '#a0694a', hair: '#2c1a10', hairStyle: 'curly', shirt: '#f1c40f', pants: '#2e86de', hat: 'palha' } },
  ina: { name: 'Pescadora Iná', role: 'Mostra a teia alimentar do lago', look: { skin: '#b87a50', hair: '#111111', hairStyle: 'long', shirt: '#16a085', pants: '#34495e', hat: 'bone', hatColor: '#0e6655' } },
  cicla: { name: 'Dra. Cicla', role: 'Cientista do carbono, oxigênio e nitrogênio', look: { skin: '#f0c8a0', hair: '#4a2f1a', hairStyle: 'bun', shirt: '#3498db', coat: '#ffffff', glasses: '#2c3e50' } },
  bip: { name: 'Robô Bip', role: 'Assistente da Sala do Nitrogênio', look: { skin: '#b0bec5', hair: '#78909c', hairStyle: 'bald', shirt: '#607d8b', pants: '#455a64', boots: '#37474f', glasses: '#00bcd4', hat: 'capacete', hatColor: '#90a4ae' } },
  composto: { name: 'Seu Composto', role: 'Cuida da composteira', look: { skin: '#c68642', hair: '#eeeeee', hairStyle: 'short', beard: '#dddddd', shirt: '#8d6e63', apron: '#6d4c41', hat: 'palha' } },
  teo: { name: 'Ribeirinho Téo', role: 'Mora na margem do lago', look: { skin: '#8d5a3b', hair: '#222222', hairStyle: 'short', shirt: '#2980b9', pants: '#7f8c8d', hat: 'palha' } },
  dito: { name: 'Agricultor Dito', role: 'Planta perto do lago', look: { skin: '#d9a066', hair: '#5d4037', hairStyle: 'short', beard: '#5d4037', shirt: '#c0392b', pants: '#2c3e50', hat: 'palha' } },
  clara: { name: 'Engenheira Clara', role: 'Trabalha na estação de tratamento', look: { skin: '#6d4c41', hair: '#1b1b1b', hairStyle: 'curly', shirt: '#1abc9c', pants: '#34495e', hat: 'capacete', hatColor: '#f1c40f' } },
  solar: { name: 'Mestre Solar', role: 'Guardião da Torre da Energia', look: { skin: '#e8b07a', hair: '#ffffff', hairStyle: 'long', beard: '#ffffff', shirt: '#f39c12', pants: '#7e5109', cape: '#e67e22', hat: 'sol' } },
  jatoba: { name: 'Guarda Jatobá', role: 'Guarda-florestal da área queimada', look: { skin: '#7b4a2e', hair: '#111111', hairStyle: 'short', shirt: '#556b2f', pants: '#3e4a2a', hat: 'guarda', badge: true } },
  tuane: { name: 'Tuane', role: 'Montou o ecossistema na garrafa', look: { skin: '#a86b4a', hair: '#2b1a10', hairStyle: 'curly', shirt: '#e84393', pants: '#6c5ce7', hat: 'flor' } },
  bia: { name: 'Bia Bioma', role: 'Exploradora dos seis biomas', look: { skin: '#d4a373', hair: '#6c3483', hairStyle: 'long', shirt: '#27ae60', pants: '#b5824b', hat: 'explorador', hatColor: '#d4ac6e', backpack: '#e67e22' } },
  iara: { name: 'Agente Iara', role: 'Resgata aves silvestres', look: { skin: '#8d5524', hair: '#111111', hairStyle: 'bun', shirt: '#34495e', pants: '#2c3e50', hat: 'bone', hatColor: '#1f3a4d', badge: true } },
  jurema: { name: 'Guia Jurema', role: 'Guia do Cerrado', look: { skin: '#c68642', hair: '#3e2723', hairStyle: 'braid', shirt: '#d35400', pants: '#6d4c41', hat: 'palha' } },
  nino: { name: 'Nino Mercador', role: 'Administra a Loja do Guardião', look: { skin: '#f1c27d', hair: '#e67e22', hairStyle: 'curly', shirt: '#8e44ad', apron: '#f1c40f', hat: 'gorro', hatColor: '#8e44ad' } },
  flora: { name: 'Dona Flora', role: 'Jardineira da Vila', look: { skin: '#e0ac69', hair: '#bdbdbd', hairStyle: 'bun', shirt: '#e91e63', apron: '#4caf50', hat: 'flor' } },
  zeca: { name: 'Carteiro Zeca', role: 'Cuida do Mural de Missões', look: { skin: '#8d5524', hair: '#000000', hairStyle: 'short', shirt: '#f39c12', pants: '#2c3e50', hat: 'bone', hatColor: '#2980b9', backpack: '#b5824b' } },
  tico: { name: 'Macaco Tico', kind: 'animal', animal: 'macaco' },
  pipoca: { name: 'Pipoca', kind: 'animal', animal: 'cao' }
};
