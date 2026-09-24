/* =====================================================================
   Pacote de colecionáveis "matematica-v1" — por enquanto só o Gato
   Gráfico (catálogo aprovado). Os outros personagens de Matemática
   virão em pacotes futuros (matematica-v2…), sem editar este.
   Como ainda não existe jogo de Matemática, ele é liberado pelo Nível
   do Nexus 2, pela Loja, por fragmentos ou pela cápsula.
   ===================================================================== */
GG.catalog.registerPack({
  packId: 'matematica-v1', version: '1.0.0', schemaVersion: 1, world: 'matematica', title: 'Nexóticos de Matemática',
  base: 'src/modules/matematica/nexoticos/',
  characters: [
    { id: 'matematica_gato_grafico', name: 'Gato Gráfico', world: 'matematica', rarity: 'comum', order: 1,
      visual: 'Gato simpático feito de barras coloridas de gráfico, com cauda em forma de seta para cima.',
      personality: 'Animado e organizado; comemora cada barrinha que sobe como se fosse um gol.',
      idle: 'bob', celebrate: 'dance', sound: { wave: 'square', notes: [523, 587, 659, 784], dur: 0.07 },
      unlock: [{ type: 'nexusLevel', min: 2, label: 'Chegue ao Nível 2 do Nexus' }, { type: 'shop', price: 40 }, { type: 'fragments' }, { type: 'capsule' }],
      power: { id: 'combo_em_barras', name: 'Combo em Barras', type: 'combo_bar', params: {}, scope: 'nexus_ui', description: 'Torna a barra de combo mais clara e adiciona celebrações, sem ajudar na resposta.' },
      asset: '21_gato_grafico.png', alt: 'Gato simpático formado por barras coloridas de gráfico.' }
  ]
}, GG.ROOT || '');
