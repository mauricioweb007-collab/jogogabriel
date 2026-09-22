/* =====================================================================
   data/maps.js — DADOS DAS REGIÕES: todos os mapas exploráveis.
   Cada mapa: nome, região, tema de cores, construção dos tiles, entrada
   (spawn), entidades (NPCs, animais, objetos, placas, portais, baús,
   coletáveis), "patches" (mudanças visuais por progresso), névoa.
   Propriedades das entidades interpretadas por main.js:
     lessons, side, talk, info, portal, chest, minigame, altar, shop,
     wardrobe, trophies, board, regionPortal, garden, notebook, bed,
     review, pickup (frag | side | bubble), visitOnly.
   ===================================================================== */
(function () {
  'use strict';
  const K = EN.mapkit;
  const SPK = EN.data.speakers;
  const maps = {};

  /* -------------------------- fábricas de entidades -------------------------- */
  const npc = (id, spk, x, y, o) => Object.assign({ id, kind: 'npc', speaker: spk, name: SPK[spk].name, look: SPK[spk].look, x, y, tall: 74, wander: 1.2 }, o || {});
  const animal = (id, an, x, y, name, o) => Object.assign({ id, kind: 'animal', animal: an, x, y, name, tall: 52 }, o || {});
  const obj = (id, sprite, x, y, name, o) => Object.assign({ id, kind: 'obj', sprite, x, y, name }, o || {});
  const emo = (id, emoji, x, y, name, o) => obj(id, 'emoji', x, y, name, Object.assign({ emoji }, o || {}));
  const info = (id, emoji, x, y, name, title, text, o) => emo(id, emoji, x, y, name, Object.assign({ info: { title, text, art: emoji } }, o || {}));
  const sign = (id, x, y, name, title, text, o) => obj(id, 'sign', x, y, name, Object.assign({ info: { title, text, art: '🪧' } }, o || {}));
  const portal = (id, x, y, name, to, o) => obj(id, 'portal', x, y, name, Object.assign({ portal: to, tall: 88 }, o || {}));
  const chest = (id, x, y, coins, o) => obj(id, 'chest', x, y, 'Baú secreto', Object.assign({ chest: { coins: coins || 3 }, secret: true, state: (G) => ({ open: G.picked('chest:' + id) }) }, o || {}));
  const altar = (region, x, y, color) => obj('altar_' + region, 'altar', x, y, 'Altar do Cristal', { altar: region, color, tall: 80, state: (G) => ({ lit: G.regionDone(region) }) });
  const station = (id, mg, x, y, name, emoji, color) => obj(id, 'station', x, y, name, { minigame: mg, emoji, color, tall: 76 });
  const frag = (map, i, x, y) => ({ id: map + '_frag' + i, kind: 'pickup', sprite: 'fragment', x, y, pickup: 'frag', secret: true, show: (G) => !G.picked('frag:' + map + i) });
  const sidePick = (side, i, emoji, x, y) => ({ id: side + '_p' + i, kind: 'pickup', sprite: 'emoji', emoji, size: 22, lift: 12, float: true, x, y, pickup: 'side', side, idx: i, show: (G) => G.sideState(side) === 'active' && !G.picked('side:' + side + i) });
  const review = (id, x, y, regions, name, emoji) => obj(id, 'station', x, y, name || 'Estação de Revisão', { review: regions, emoji: emoji || '📚', color: '#2f80ed', tall: 76 });

  /** Finaliza um mapa: protege entidades da decoração e gera as linhas. */
  function finish(g, ents, deco) {
    ents.forEach((e) => g.clear(e.x, e.y, e.kind === 'pickup' ? 0 : 1));
    if (deco) deco(g);
    return g.rows();
  }
  /** Névoa da região: diminui conforme as lições são concluídas. */
  const regionFog = (r) => (G) => (G.regionDone(r) ? 0 : 1 - 0.7 * G.lessonFrac(r));

  /* =================================================================
     VILA ECONEXUS — base do jogador
     ================================================================= */
  (function () {
    const ents = [
      portal('portal_regioes', 17, 4, 'Portal das Regiões', null, { regionPortal: true, color: '#7bd88f', emoji: '🗺️' }),
      ...[1, 2, 3, 4, 5, 6].map((n, i) => obj('pedestal' + n, 'altar', [12, 14, 16, 18, 20, 22][i], [3, 2, 2, 2, 2, 3][i], 'Pedestal do Cristal ' + n, { color: EN.data.regions[i].color, state: (G) => ({ lit: G.regionDone('r' + n) }), info: { title: 'Pedestal do ' + EN.data.regions[i].crystal, text: 'Este pedestal guarda o **' + EN.data.regions[i].crystal + '** da região **' + EN.data.regions[i].name + '**. Ele acende quando você restaura a região.', art: '💎' } })),
      obj('loja_porta', 'door', 5, 5, 'Loja do Guardião', { portal: { map: 'loja', x: 9, y: 10 }, emoji: '🛒', color: '#b5651d', tall: 70 }),
      obj('casa_porta', 'door', 30, 5, 'Casa de Lumi', { portal: { map: 'casa', x: 9, y: 10 }, emoji: '🏠', color: '#4f8a3a', tall: 70 }),
      obj('fonte', 'fountain', 17, 11, 'Fonte da Vila', { bw: 70, bh: 30, state: (G) => ({ on: G.crystals() >= 3 }), info: { title: 'Fonte da Vila', text: 'A água da fonte fica mais limpa a cada cristal restaurado. Depois do terceiro cristal, ela volta a jorrar!', art: '⛲' } }),
      obj('mural', 'board', 8, 11, 'Mural de Missões', { board: true, tall: 66 }),
      npc('zeca', 'zeca', 8, 13, { side: 'vila_mural', talk: ['Oi! Eu cuido do Mural de Missões. Lá você vê a missão atual e o progresso de cada região.'] }),
      sign('placa_vila', 14, 17, 'Placa da Vila', 'Bem-vindo à Vila EcoNexus!', 'Aqui é a sua base, Guardião. **Loja** a noroeste, **Casa de Lumi** a nordeste, **Jardim** a sudeste e o **Portal das Regiões** ao norte. A cada região restaurada, a vila fica mais bonita.'),
      npc('flora', 'flora', 26, 18, { garden: true, wander: 1, talk: ['Olá! Sou a Dona Flora. Com os EcoFragmentos que você achar, eu te dou sementes para plantar no Jardim.'] }),
      sign('jardim_placa', 23, 20, 'Jardim da Vila', 'Jardim da Vila', 'Plante e decore sem pressa. Cada **EcoFragmento** encontrado nos mapas vira **1 semente**. Fale com a Dona Flora ou toque no canteiro.'),
      obj('canteiro', 'plot', 29, 20, 'Canteiro do Jardim', { garden: true, emoji: '🌱', state: () => ({}) }),
      ...[0, 1, 2, 3, 4, 5].map((i) => obj('plot' + i, 'emoji', 26 + (i % 3) * 2 + (i > 2 ? 1 : 0), 22, 'Planta', { interact: false, solid: false, emoji: '🌱', size: 24, show: (G) => !!G.gardenAt(i), dyn: (G) => G.gardenAt(i) })),
      obj('portao_raro', 'gate', 5, 18, 'Canteiro Secreto', { emoji: '🌰', show: (G) => !G.has('semente_rara'), talk: ['Lumi: Este é o Canteiro Secreto. Ele abre com a Semente Rara, vendida na Loja do Guardião.'] }),
      obj('canteiro_raro', 'plot', 5, 21, 'Canteiro Secreto', { garden: 'raro', emoji: '🌸', show: (G) => G.has('semente_rara') }),
      obj('portal_arena', 'portal', 31, 11, 'Portal da Arena Final', { arenaPortal: true, color: '#b07bff', emoji: '⚔️', tall: 88, state: (G) => ({ lit: G.crystals() >= 6 }) }),
      npc('caju', 'zeca', 22, 14, { name: 'Menino Caju', look: { skin: '#b07850', hair: '#2b1a10', hairStyle: 'curly', shirt: '#e74c3c', pants: '#2c3e50' }, wander: 2, talk: ['Oi! Eu sou o Caju. Dizem que, quando os seis cristais acendem, o Portal da Arena se abre!', 'Minha avó falou que a fonte fica limpinha quando os cristais voltam.'] }),
      emo('bandeira1', '🎏', 11, 8, 'Bandeira', { interact: false, show: (G) => G.crystals() >= 1 }),
      emo('bandeira2', '🎏', 24, 8, 'Bandeira', { interact: false, show: (G) => G.crystals() >= 2 }),
      emo('balao', '🎈', 11, 15, 'Balão', { interact: false, float: true, show: (G) => G.crystals() >= 4 }),
      emo('estatua', '🗿', 24, 15, 'Estátua do Guardião', { info: { title: 'Estátua do Guardião', text: 'Uma homenagem a quem cuida dos biomas. Dizem que ela brilha quando a história termina.', art: '🗿' }, show: (G) => G.crystals() >= 5 }),
      chest('bau_vila', 34, 1, 3),
      frag('vila', 1, 3, 14), frag('vila', 2, 33, 14), frag('vila', 3, 20, 23), frag('vila', 4, 10, 24), frag('vila', 5, 26, 7)
    ];
    maps.vila = {
      name: 'Vila EcoNexus', region: 'vila', under: '.', ambient: 'leaves', spawn: { x: 17, y: 19, dir: 'up' },
      theme: { grass: '#78c86f', grass2: '#66b35e' },
      build: () => {
        const g = new K.Grid(36, 26, '.').border('t');
        g.rect(11, 8, 14, 8, ',');
        g.rect(2, 2, 7, 4, 'h'); g.rect(27, 2, 7, 4, 'h');
        g.path([[5, 6], [5, 7], [11, 7]], ','); g.path([[30, 6], [30, 7], [24, 7]], ',');
        g.vline(17, 5, 8, ','); g.vline(17, 15, 23, ',');
        g.hline(6, 11, 12, ','); g.hline(24, 30, 11, ',');
        g.frame(24, 16, 10, 8, 'f'); g.set(24, 19, ','); g.hline(18, 24, 19, ',');
        g.frame(2, 18, 7, 6, 'f'); g.set(5, 18, ','); g.path([[5, 17], [5, 16], [11, 16]], ',');
        g.set(33, 1, 'b'); g.clear(30, 12, 0);
        return finish(g, ents, (k) => k.scatter([['t', 0.1], ['b', 0.04], ['*', 0.06]], 11, ['.'], [1, 1, 34, 24]));
      },
      extra: ents,
      patches: [
        { when: (G) => G.crystals() >= 1, rect: [1, 13, 10, 3], ch: '*', only: ['.'] },
        { when: (G) => G.crystals() >= 2, rect: [25, 8, 10, 2], ch: '*', only: ['.'] },
        { when: (G) => G.crystals() >= 4, rect: [9, 20, 14, 4], ch: '*', only: ['.'] },
        { when: (G) => G.crystals() >= 6, rect: [1, 1, 34, 24], ch: '*', only: ['.'] }
      ],
      fog: (G) => Math.max(0, 0.5 - G.crystals() * 0.1)
    };
  })();

  /* =================================================================
     LOJA DO GUARDIÃO (interior)
     ================================================================= */
  (function () {
    const ents = [
      npc('nino', 'nino', 9, 3, { wander: 0, shop: 'roupa', talk: ['Olá, Guardião! Eu sou o Nino. Tudo aqui tem preço fixo e mostra exatamente o que faz.', 'Sem pressa: você pode olhar tudo antes de decidir. E nada daqui é obrigatório para terminar a história!'] }),
      obj('rack_roupa', 'rack', 2, 5, 'Cabide: Skins e roupas', { shop: 'roupa', emoji: '👕' }),
      obj('rack_acessorio', 'rack', 2, 8, 'Cabide: Acessórios', { shop: 'acessorio', emoji: '🎒' }),
      obj('rack_companheiro', 'pedestal', 15, 5, 'Pedestal: Companheiros', { shop: 'companheiro', emoji: '✨' }),
      obj('rack_melhoria', 'pedestal', 15, 8, 'Pedestal: Melhorias', { shop: 'melhoria', emoji: '🧭' }),
      obj('rack_chave', 'pedestal', 6, 8, 'Balcão: Chaves e ferramentas', { shop: 'chave', emoji: '🗝️' }),
      obj('rack_decoracao', 'pedestal', 12, 8, 'Balcão: Decorações', { shop: 'decoracao', emoji: '🪴' }),
      sign('placa_precos', 4, 3, 'Placa de preços', 'Como funciona a loja', 'Aqui você usa **EcoMoedas**, ganhas jogando e aprendendo. Cada item mostra **preço**, **raridade** e **efeito** antes da compra. Não há sorteios nem dinheiro de verdade. Itens mais raros aparecem conforme seu **nível de Guardião** sobe.'),
      emo('vitrine', '🏆', 14, 2, 'Vitrine das raridades', { info: { title: 'Raridades', text: '**Comum** (cinza), **Incomum** (verde), **Raro** (azul), **Épico** (roxo) e **Lendário** (laranja). Os lendários são para quem faz revisões extras e acerta com pouca ajuda.', art: '🏆' } }),
      obj('saida_loja', 'door', 9, 11, 'Saída', { portal: { map: 'vila', x: 5, y: 6 }, tall: 60 })
    ];
    maps.loja = {
      name: 'Loja do Guardião', region: 'vila', under: '_', noLumi: false, spawn: { x: 9, y: 10, dir: 'up' },
      theme: { floor: '#c9975f', floor2: '#b3824c', house: '#8d5a2b', house2: '#6d4420' },
      build: () => { const g = new K.Grid(18, 12, '_').border('h'); g.hline(6, 12, 2, 's'); g.set(9, 2, '_'); return finish(g, ents); },
      extra: ents
    };
  })();

  /* =================================================================
     CASA DE LUMI / QUARTO DO GUARDIÃO
     ================================================================= */
  (function () {
    const deco = (id, sprite, x, y, name, o) => obj(id + '_obj', sprite, x, y, name, Object.assign({ show: (G) => G.shown(id) }, o || {}));
    const ents = [
      obj('armario', 'wardrobe', 3, 2, 'Armário de Skins', { wardrobe: true, tall: 78 }),
      obj('cama', 'bed', 14, 2, 'Cama (salvar)', { bed: true }),
      obj('trofeus', 'shelf', 8, 1, 'Sala de Troféus', { trophies: true, dyn: (G) => G.medalIcons() }),
      obj('vitrine_cristais', 'altar', 12, 1, 'Vitrine dos Cristais', { trophies: true, color: '#7bd88f', state: (G) => ({ lit: G.crystals() > 0 }) }),
      emo('mesa_caderno', '📓', 12, 6, 'Mesa do Caderno', { notebook: true }),
      emo('cama_lumi', '🛏️', 15, 6, 'Caminha da Lumi', { size: 24, talk: ['Lumi: Esta é a minha caminha! Eu durmo numa folha bem macia.'] }),
      emo('janela_casa', '🪟', 5, 1, 'Janela', { interact: false }),
      deco('deco_samambaia', 'emoji', 1, 9, 'Vaso de Samambaia', { emoji: '🪴', interact: false }),
      deco('deco_placa', 'sign', 7, 4, 'Placa', { info: { title: 'Guardião em Ação', text: 'Aqui mora um Guardião que cuida dos biomas!', art: '🪧' } }),
      deco('deco_estante', 'shelf', 10, 1, 'Estante de Troféus', { trophies: true, dyn: (G) => G.medalIcons() }),
      deco('deco_mapa', 'emoji', 16, 5, 'Mapa dos Biomas', { emoji: '🗺️', info: { title: 'Mapa dos Biomas', text: 'Cerrado, Caatinga, Mata Atlântica, Amazônia, Pantanal e Pampas: os seis grandes biomas brasileiros.', art: '🗺️' } }),
      deco('deco_luminaria', 'lamp', 16, 9, 'Luminária de Vaga-lumes', { interact: false, state: () => ({ on: true }) }),
      deco('deco_aquario', 'emoji', 1, 5, 'Aquário Virtual', { emoji: '🐠', float: true, interact: false }),
      deco('deco_poltrona', 'emoji', 4, 9, 'Poltrona de Raízes', { emoji: '🪑', interact: false }),
      deco('deco_trofeu', 'emoji', 12, 9, 'Troféu Dourado', { emoji: '🏆', float: true, interact: false }),
      deco('deco_arvore', 'emoji', 7, 9, 'Árvore da Vida', { emoji: '🌳', size: 34, interact: false }),
      obj('saida_casa', 'door', 9, 11, 'Saída', { portal: { map: 'vila', x: 30, y: 6 }, tall: 60 })
    ];
    maps.casa = {
      name: 'Casa de Lumi — Quarto do Guardião', region: 'vila', under: '_', spawn: { x: 9, y: 10, dir: 'up' },
      theme: { floor: '#d6a86e', floor2: '#bf915a', house: '#6f9a4f', house2: '#557a3a', carpet: '#5aa85a' },
      build: () => finish(new K.Grid(18, 12, '_').border('h'), ents),
      extra: ents,
      patches: [{ when: (G) => G.shown('deco_tapete'), rect: [7, 6, 4, 3], ch: 'r' }]
    };
  })();

  /* =================================================================
     REGIÃO 1 — TRILHA DOS ANIMAIS LIVRES
     ================================================================= */
  (function () {
    const ents = [
      portal('portal_vila_r1', 2, 21, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      sign('placa_entrada', 3, 19, 'Área de Preservação', 'Área de Preservação', 'Esta área é **protegida por lei** para conservar **solo, ar, rios, plantas e animais**. Visite com um **guia especializado**, fique na trilha e observe sem tocar.'),
      npc('kaua', 'kaua', 7, 21, { lessons: ['r1_prep'], side: 'r1_lixo' }),
      station('mg_trilha', 'trilha_segura', 9, 24, 'Pista: Trilha Segura', '🥾', '#4caf50'),
      obj('portao', 'gate', 6, 18, 'Portão da trilha', { emoji: '🚧', bw: 48, show: (G) => !G.flag('r1_portao'), talk: ['Lumi: O portão está fechado. Primeiro, fale com o Guia Kauã para se preparar.'] }),
      obj('posto', 'emoji', 3, 7, 'Posto da Guarda', { emoji: '🏕️', size: 34, info: { title: 'Posto da Guarda', text: 'Aqui a Guardiã Nara cuida dos animais silvestres da trilha.', art: '🏕️' } }),
      npc('nara', 'nara', 5, 8, { lessons: ['r1_energia'], side: 'r1_placas', wander: 0.8 }),
      animal('pipoca', 'cao', 8, 9, 'Pipoca (cachorro)', { wander: 1, talk: ['Au au! (O Pipoca abana o rabo. Ele é doméstico: vive com a Nara no posto.)'] }),
      sign('placa_silvestre', 2, 10, 'Placa: Animais Silvestres', null, null, { info: null, lessons: ['r1_silvestre'], color: '#8fbf5a', state: (G) => ({}) }),
      ...[[15, 4], [17, 3], [20, 3], [21, 7], [16, 7]].map(([x, y], i) => obj('toco' + i, 'stump', x, y, 'Toco de árvore', { info: { title: 'Tocos', text: 'Aqui havia árvores. **Perda de floresta significa perda de habitat**: os animais que viviam aqui perderam alimento, abrigo e lugar para ter filhotes.', art: '🪵' }, show: (G) => !G.regionDone('r1') })),
      ...[[14, 4], [19, 2], [22, 5]].map(([x, y], i) => obj('muda_r1_' + i, 'sapling', x, y, 'Muda', { interact: false, show: (G) => G.q('L1-Q1'), state: (G) => ({ on: G.q('L1-Q2') }) })),
      animal('macaco', 'macaco', 18, 5, 'Macaco Tico', { lessons: ['r1_habitat'], show: (G) => !G.q('L1-Q2'), wander: 0 }),
      animal('tico_feliz', 'macaco', 23, 4, 'Macaco Tico', { show: (G) => G.q('L1-Q2'), talk: ['(O Tico pula de galho em galho, feliz. Ele encontrou frutos e abrigo nas árvores novas!)'] }),
      ...[[13, 2], [16, 1], [21, 1]].map(([x, y], i) => animal('familia' + i, 'macaco', x, y, 'Macaco', { interact: false, show: (G) => G.q('L1-Q3') })),
      info('ninho', '🪺', 13, 10, 'Ninho', 'Um ninho na árvore', 'O habitat também oferece **condições para se reproduzir**. Este ninho está protegido nos galhos: sem árvores, as aves perderiam esse lugar.'),
      emo('arvore_gigante', '🌳', 24, 3, 'Árvore Gigante', { size: 46, lift: 24, bonus: 'bonus_copa', item: 'corda_escalada', bw: 40 }),
      obj('mirante', 'tower', 31, 10, 'Mirante do Pantanal', { lessons: ['r1_pantanal'], tall: 92 }),
      sign('placa_capivara', 33, 14, 'Placa: Capivara', 'Observação 1: Capivara', 'A **capivara** é **herbívora**: ela come **gramíneas**. Observe de longe!'),
      sign('placa_onca', 35, 18, 'Placa: Onça-pintada', 'Observação 2: Onça-pintada', 'A **onça-pintada** é **carnívora** e pode **predar capivaras**.'),
      sign('placa_pantanal', 29, 15, 'Placa: Pantanal', 'Observação 3: Pantanal', 'O **Pantanal** apresenta **grande biodiversidade**: uma enorme variedade de seres vivos.'),
      animal('capi1', 'capivara', 30, 19, 'Capivara', { wander: 1.2, interact: false, show: (G) => G.q('L1-Q4') }),
      animal('capi2', 'capivara', 32, 22, 'Capivara', { wander: 1.2, interact: false, show: (G) => G.q('L1-Q4') }),
      animal('onca', 'onca', 37, 15, 'Onça-pintada', { interact: false, wander: 0.6, show: (G) => G.q('L1-Q4') }),
      animal('arara1', 'arara', 29, 24, 'Arara', { interact: false }),
      animal('arara2', 'ave', 37, 25, 'Ave', { interact: false }),
      info('rio_r1', '💧', 25, 20, 'Rio', 'O rio da trilha', 'Numa **área de preservação**, os **rios** também são protegidos por lei, junto com o solo, o ar, as plantas e os animais.'),
      npc('aurora', 'aurora', 8, 15, { lessons: ['r1_desenho'], wander: 0 }),
      obj('cavalete', 'easel', 10, 15, 'Cavalete da Aurora', { state: (G) => ({ done: G.q('L1-Q6') }), info: { title: 'Cavalete', text: 'Foto e desenho científico se **complementam**: o desenho destaca e registra detalhes importantes.', art: '🖼️' } }),
      altar('r1', 20, 17, '#4caf50'),
      chest('bau_r1', 38, 2, 3),
      ...[[11, 10], [24, 15], [16, 22], [34, 7], [21, 25]].map(([x, y], i) => sidePick('r1_lixo', i, i % 2 ? '🥤' : '📰', x, y)),
      frag('r1', 1, 13, 14), frag('r1', 2, 23, 9), frag('r1', 3, 29, 21), frag('r1', 4, 36, 9), frag('r1', 5, 3, 16)
    ];
    // placa silvestre usa sprite de placa com lição
    ents.find((e) => e.id === 'placa_silvestre').info = null;
    maps.r1 = {
      name: 'Trilha dos Animais Livres', region: 'r1', under: '.', ambient: 'leaves', spawn: { x: 4, y: 24, dir: 'up' },
      theme: { grass: '#5fb85c', grass2: '#4fa24d', tree: '#2e8b45', tree2: '#206b33' },
      build: () => {
        const g = new K.Grid(40, 28, '.').border('t');
        g.rect(26, 1, 2, 26, '~'); g.set(26, 12, '='); g.set(27, 12, '=');
        g.hline(1, 11, 18, 'f'); g.vline(12, 18, 26, 't'); g.set(6, 18, ',');
        g.rect(28, 13, 11, 13, 'm'); g.rect(33, 20, 5, 4, 'w');
        g.rect(2, 3, 6, 4, 'h');
        g.path([[3, 24], [6, 24], [6, 12]], ',');
        g.hline(2, 25, 12, ','); g.hline(28, 37, 12, ',');
        g.vline(5, 9, 12, ','); g.vline(18, 6, 12, ','); g.vline(20, 12, 16, ','); g.vline(9, 12, 15, ',');
        g.vline(22, 12, 24, ','); g.hline(14, 22, 24, ','); g.hline(18, 23, 6, ','); g.vline(23, 4, 6, ',');
        g.vline(31, 11, 20, ','); g.hline(31, 36, 17, ',');
        g.set(37, 2, 'b'); g.set(37, 3, 'b'); g.set(38, 3, 'b'); g.clear(36, 1, 0); g.clear(37, 1, 0); g.clear(38, 1, 0);
        g.vline(36, 1, 11, ',');
        return finish(g, ents, (k) => {
          k.scatter([['t', 0.2], ['b', 0.05], ['*', 0.05]], 101, ['.'], [1, 1, 25, 17]);
          k.scatter([['t', 0.12], ['b', 0.05], ['*', 0.06]], 102, ['.'], [1, 19, 11, 8]);
          k.scatter([['t', 0.18], ['b', 0.05]], 103, ['.'], [13, 13, 13, 14]);
          k.scatter([['t', 0.12], ['b', 0.06]], 104, ['.'], [28, 1, 11, 12]);
        });
      },
      extra: ents,
      patches: [
        { when: (G) => G.regionDone('r1'), rect: [13, 1, 12, 10], ch: '*', only: ['.'] },
        { when: (G) => G.q('L1-Q5'), rect: [28, 13, 11, 13], ch: '"', only: ['m'] }
      ],
      fog: regionFog('r1')
    };
  })();

  /* =================================================================
     REGIÃO 2 — VALE DAS CADEIAS ALIMENTARES
     ================================================================= */
  (function () {
    const ents = [
      portal('portal_vila_r2', 2, 12, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      npc('broto', 'broto', 8, 10, { lessons: ['r2_produtores'], side: 'r2_observa', show: (G) => !G.q('L2-Q6') }),
      npc('broto_casa', 'broto', 9, 10, { show: (G) => G.q('L2-Q6'), talk: ['Estou indo e voltando da floresta! Lá os decompositores trabalham sem parar.'], side: 'r2_observa' }),
      info('horta', '🥕', 6, 5, 'Horta', 'A horta do Professor Broto', 'Cenouras, milho e capim são **produtores**: fabricam o próprio alimento pela **fotossíntese**, usando energia solar, água e gás carbônico.'),
      emo('placas_horta', '🏷️', 10, 5, 'Plaquinhas', { interact: false, show: (G) => G.q('L2-Q1') }),
      obj('painel_setas', 'board', 18, 6, 'Painel das Setas', { lessons: ['r2_setas'], tall: 70 }),
      info('balanca', '⚖️', 17, 9, 'Balança da Matéria', 'Balança da Matéria', '**Matéria** é tudo o que **tem massa** e **ocupa espaço (volume)**. Nas cadeias alimentares, a matéria passa de um ser vivo para outro.'),
      animal('obs_gafanhoto', 'gafanhoto', 20, 4, 'Gafanhoto', { wander: 1, visitOnly: true, info: { title: 'Gafanhoto', text: 'O gafanhoto come plantas: é um **consumidor primário**.', art: '🦗' } }),
      npc('maru', 'maru', 9, 20, { lessons: ['r2_paisagem'], side: 'r2_sementes' }),
      info('quadro_paisagem', '🖼️', 5, 19, 'Quadro da Paisagem Rural', 'Paisagem rural', 'Na paisagem da Maru há capim, planta aquática, gafanhoto, rã, serpente, gavião, coelho, raposa, peixe e ave pescadora. Quem come quem?'),
      animal('obs_coelho', 'coelho', 12, 21, 'Coelho', { wander: 2, visitOnly: true, info: { title: 'Coelho', text: 'O coelho come plantas, como a cenoura: é um **consumidor primário**.', art: '🐇' } }),
      animal('capivara_r2', 'capivara', 14, 25, 'Capivara', { wander: 1.5, interact: false }),
      station('mg_corredor', 'corredor_cadeia', 14, 16, 'Corredor da Cadeia', '➡️', '#f2c94c'),
      obj('ponte', 'barrier', 24, 14, 'Ponte das Setas Invertidas', { lessons: ['r2_ponte'], ox: 24, bw: 96, bh: 40, tall: 70, show: (G) => !G.q('L2-Q6') }),
      emo('ponte_ok', '✅', 22, 13, 'Placa da ponte', { show: (G) => G.q('L2-Q6'), info: { title: 'Ponte das Setas', text: 'coquinhos → cutia → jararaca → harpia. A seta sai do alimento e aponta para quem come.', art: '🌉' } }),
      altar('r2', 21, 18, '#f2c94c'),
      npc('broto_floresta', 'broto', 30, 12, { lessons: ['r2_decomp'], show: (G) => G.q('L2-Q6'), wander: 0.8 }),
      obj('quadro_floresta', 'board', 32, 9, 'Quadro da Floresta', { tall: 70, info: { title: 'Quadro da Floresta', text: 'Árvores e capim (produtores), cutia e gafanhoto (consumidores primários), jararaca e harpia (outros consumidores), cogumelos e bactérias (decompositores).', art: '🌳' }, state: () => ({}) }),
      info('tronco', '🍄', 34, 7, 'Tronco com cogumelos', 'Tronco caído', 'Os **cogumelos** são **fungos**: estão **decompondo** a madeira e devolvendo nutrientes ao solo.'),
      animal('cutia_r2', 'cutia', 36, 11, 'Cutia', { wander: 1.5, interact: false }),
      npc('ina', 'ina', 28, 19, { lessons: ['r2_teia'], wander: 0.6 }),
      obj('painel_teia', 'board', 28, 16, 'Painel da Teia', { tall: 70, info: { title: 'Painel da Teia', text: 'plantas → gafanhotos → aves → serpentes → gavião; plantas → camundongos → serpentes e gavião. As setas de todos os níveis também vão para os **fungos**.', art: '🕸️' } }),
      info('obs_algas', '🟢', 29, 23, 'Algas do lago', 'Algas', 'As **algas** são importantes **produtores aquáticos**.', { visitOnly: true }),
      emo('caverna', '🕳️', 37, 4, 'Entrada da Caverna', { size: 36, bonus: 'bonus_caverna', item: 'lanterna' }),
      chest('bau_r2', 1, 26, 3),
      ...[[11, 12], [16, 23], [20, 2], [3, 9], [33, 16]].map(([x, y], i) => sidePick('r2_sementes', i, '🌰', x, y)),
      frag('r2', 1, 13, 7), frag('r2', 2, 22, 24), frag('r2', 3, 35, 13), frag('r2', 4, 6, 16), frag('r2', 5, 31, 24)
    ];
    maps.r2 = {
      name: 'Vale das Cadeias Alimentares', region: 'r2', under: '.', ambient: 'leaves', spawn: { x: 3, y: 14, dir: 'right' },
      theme: { grass: '#8cc85e', grass2: '#7ab44f', path: '#e0c081' },
      build: () => {
        const g = new K.Grid(40, 28, '.').border('t');
        g.rect(24, 1, 2, 26, '~'); g.set(24, 14, '='); g.set(25, 14, '=');
        g.frame(4, 3, 9, 6, 'f'); g.rect(5, 4, 7, 4, '*'); g.set(8, 8, ',');
        g.rect(3, 22, 4, 3, 'w'); g.rect(30, 18, 7, 6, 'w');
        g.hline(2, 23, 14, ','); g.hline(26, 37, 14, ',');
        g.vline(8, 7, 20, ','); g.vline(18, 7, 14, ','); g.vline(21, 14, 17, ',');
        g.vline(31, 5, 14, ','); g.hline(31, 36, 5, ','); g.vline(28, 14, 22, ',');
        g.clear(2, 26, 0); g.clear(2, 25, 0); g.clear(3, 25, 0); g.set(1, 25, 'b'); g.set(2, 24, 'b');
        g.hline(3, 8, 25, ',');
        return finish(g, ents, (k) => {
          k.scatter([['t', 0.1], ['b', 0.05], ['*', 0.08]], 201, ['.'], [1, 1, 23, 26]);
          k.scatter([['y', 0.22], ['t', 0.08], ['b', 0.04]], 202, ['.'], [26, 1, 13, 26]);
        });
      },
      extra: ents,
      patches: [
        { when: (G) => G.q('L2-Q8'), rect: [26, 1, 13, 26], ch: '*', only: ['b'] },
        { when: (G) => G.regionDone('r2'), rect: [1, 1, 23, 26], ch: '*', only: ['.'] }
      ],
      fog: regionFog('r2')
    };
  })();

  /* =================================================================
     REGIÃO 3 — LABORATÓRIO DOS CICLOS
     ================================================================= */
  (function () {
    const lampOn = (id) => (G) => ({ on: !G.seen(id) && G.sideState('r3_luzes') !== 'done' });
    const ents = [
      portal('portal_vila_r3', 15, 25, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      npc('cicla', 'cicla', 19, 22, { lessons: ['r3_carbono'], side: 'r3_luzes', wander: 1 }),
      obj('diagrama', 'board', 19, 12, 'Grande Diagrama dos Ciclos', { lessons: ['r3_diagrama'], bw: 60, tall: 70 }),
      obj('medidor', 'machine', 16, 17, 'Medidor de Pegada Ecológica', { lessons: ['r3_pegada'], emoji: '👣', state: (G) => ({ on: G.q('L3-Q4') }), tall: 80 }),
      altar('r3', 23, 4, '#2d9cdb'),
      obj('porta_bonus_lab', 'door', 19, 2, 'Sala Bônus dos Ciclos', { bonus: 'bonus_lab', item: 'chave_lab', emoji: '🗝️', tall: 70, state: (G) => ({ locked: !G.has('chave_lab') }) }),
      obj('telao', 'machine', 7, 19, 'Telão do Clima', { lessons: ['r3_aquecimento'], emoji: '🌡️', state: (G) => ({ on: G.q('L3-Q9') }), tall: 80 }),
      info('frascos', '🧪', 4, 19, 'Frascos de carbono', 'Frascos de carbono', 'Uma folha, uma pena, uma gota de óleo e um balão de gás carbônico: **todos contêm carbono**.'),
      info('barril', '🛢️', 10, 24, 'Amostra de petróleo', 'Petróleo e carvão', '**Petróleo** e **carvão mineral** contêm carbono e se originaram de **seres vivos de milhões de anos**. São base de **combustíveis fósseis**.'),
      obj('lamp1', 'lamp', 3, 25, 'Lâmpada esquecida', { visitOnly: true, state: lampOn('lamp1'), info: { title: 'Lâmpada apagada', text: 'Você apagou uma lâmpada de uma sala vazia. **Economizar energia** ajuda a **reduzir a pegada ecológica**.', art: '💡' } }),
      obj('maquina_gases', 'machine', 32, 21, 'Máquina dos Gases', { lessons: ['r3_gases'], emoji: '⚙️', state: (G) => ({ on: G.q('L3-Q7') }), tall: 80 }),
      info('janela_obs', '🪟', 36, 19, 'Janela de Observação', 'Janela de Observação', 'Pela janela você vê uma vaca, um carro, uma fábrica, uma fogueira, uma planta em vaso e uma fruta. Quem libera gás carbônico?'),
      animal('coelho_lab', 'coelho', 35, 24, 'Coelho do laboratório', { wander: 1, talk: ['(O coelho respira: usa gás oxigênio e libera gás carbônico.)'] }),
      obj('lamp2', 'lamp', 37, 25, 'Lâmpada esquecida', { visitOnly: true, state: lampOn('lamp2'), info: { title: 'Lâmpada apagada', text: 'Mais uma lâmpada apagada: menos desperdício de energia!', art: '💡' } }),
      npc('bip', 'bip', 7, 6, { lessons: ['r3_nitrogenio'], wander: 0.8 }),
      info('vaso_amarelo', '🌿', 4, 3, 'Vaso com folhas amareladas', 'Folhas amareladas', 'Plantas com **deficiência de nitrogênio** podem apresentar **folhas amareladas**.', { state: () => ({}) }),
      info('raiz', '🫚', 10, 3, 'Raiz com bactérias', 'Raízes e bactérias', '**Bactérias fixadoras** vivem principalmente no **solo** e em **raízes de algumas plantas**. Elas transformam o nitrogênio do ar em compostos que as plantas absorvem.'),
      info('tubo_ar', '🌬️', 3, 9, 'Tubo de ar', 'O ar que respiramos', 'A **maior parte da atmosfera** é **gás nitrogênio**, mas as plantas **não o absorvem diretamente do ar**.'),
      info('saco_fert', '🧺', 10, 9, 'Saco de fertilizante', 'Fertilizante', 'Fertilizantes têm nutrientes como nitrogênio. **Em excesso**, podem **contaminar rios e lagos** e causar desequilíbrio.'),
      obj('lamp3', 'lamp', 6, 9, 'Lâmpada esquecida', { visitOnly: true, state: lampOn('lamp3'), info: { title: 'Lâmpada apagada', text: 'Última lâmpada apagada! Reduzir desperdício reduz a pegada ecológica.', art: '💡' } }),
      station('mg_solar', 'coleta_solar', 32, 4, 'Coleta Solar', '☀️', '#f2c94c'),
      npc('composto', 'composto', 35, 8, { lessons: ['r3_compostagem'], side: 'r3_restos', wander: 0.6 }),
      obj('composteira', 'compost', 37, 6, 'Composteira', { info: { title: 'Composteira', text: 'A **compostagem** transforma restos orgânicos em **adubo** rico em nutrientes, incluindo **nitrogênio**.', art: '♻️' } }),
      info('plantas_estufa', '🌱', 29, 3, 'Plantas da estufa', 'Estufa', 'As plantas da estufa fazem **fotossíntese**: usam energia solar, água e gás carbônico e liberam gás oxigênio.'),
      chest('bau_r3', 38, 2, 3),
      ...[[3, 5], [11, 20], [30, 24], [34, 3], [22, 8]].map(([x, y], i) => sidePick('r3_restos', i, i % 2 ? '🍌' : '🍂', x, y)),
      frag('r3', 1, 24, 24), frag('r3', 2, 12, 5), frag('r3', 3, 28, 9), frag('r3', 4, 38, 24), frag('r3', 5, 15, 7)
    ];
    maps.r3 = {
      name: 'Laboratório dos Ciclos', region: 'r3', under: '-', ambient: 'sparks', spawn: { x: 19, y: 25, dir: 'up' },
      theme: { wall: '#7c8aa0', wall2: '#65728a', grass: '#8fd49a', grass2: '#7cc488' },
      build: () => {
        const g = new K.Grid(40, 28, '#');
        g.rect(14, 2, 12, 25, '-');
        g.rect(2, 2, 11, 9, '-'); g.rect(2, 18, 11, 9, '-');
        g.frame(26, 1, 14, 11, 'g'); g.rect(27, 2, 12, 9, '.');
        g.rect(27, 18, 12, 9, '-');
        g.set(13, 6, '-'); g.set(13, 22, '-'); g.set(26, 6, '-'); g.set(26, 22, '-');
        g.set(36, 2, 'b'); g.set(36, 3, 'b'); g.set(37, 3, 'b');
        g.frame(0, 0, 40, 28, '#');
        return finish(g, ents, (k) => k.scatter([['b', 0.08], ['*', 0.1]], 301, ['.'], [27, 2, 12, 9]));
      },
      extra: ents,
      patches: [{ when: (G) => G.q('L3-Q8'), rect: [27, 2, 12, 9], ch: '*', only: ['.'] }],
      fog: regionFog('r3')
    };
  })();

  /* =================================================================
     REGIÃO 4 — LAGO ESVERDEADO
     ================================================================= */
  (function () {
    const ents = [
      portal('portal_vila_r4', 2, 23, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      npc('teo', 'teo', 8, 15, { lessons: ['r4_problema', 'r4_fontes'], side: 'r4_residuos', wander: 0.8 }),
      obj('cano', 'pipe', 20, 5, 'Cano de esgoto', { visitOnly: true, flowColor: 'rgba(110,120,70,.85)', state: (G) => ({ flow: !G.q('L4-Q1') }), info: { title: 'Cano de esgoto', text: 'Este cano despeja **esgoto sem tratamento** no lago. O esgoto leva muitos **nutrientes**.', art: '🚽' } }),
      emo('campo_fert', '🧺', 33, 9, 'Plantação adubada', { visitOnly: true, info: { title: 'Plantação adubada', text: 'Muito **fertilizante** na plantação. Quando chove, a água leva o excesso para o lago.', art: '🌧️' } }),
      npc('dito', 'dito', 35, 10, { lessons: ['r4_etapas'], wander: 0.8 }),
      emo('descarte', '🗑️', 22, 23, 'Monte de resíduos', { visitOnly: true, info: { title: 'Descarte de resíduos', text: 'Restos e resíduos jogados perto da água também levam **matéria** e **nutrientes** para o lago.', art: '🗑️' } }),
      npc('clara', 'clara', 34, 17, { lessons: ['r4_prevencao'], side: 'r4_margem', wander: 0.6 }),
      info('estacao', '🏭', 36, 18, 'Estação de Tratamento', 'Estação de Tratamento', 'Aqui o **esgoto é tratado** antes de voltar para a natureza. Isso ajuda a **prevenir a eutrofização**.'),
      station('mg_lago', 'salve_lago', 11, 17, 'Salve o Lago', '🫧', '#1abc9c'),
      altar('r4', 9, 19, '#1abc9c'),
      emo('ponto_mergulho', '🤿', 14, 14, 'Ponto de Mergulho', { bonus: 'bonus_mergulho', item: 'mascara_mergulho', size: 26 }),
      info('algas_info', '🟢', 13, 8, 'Algas na margem', 'Algas demais', 'Com nutrientes em excesso, as **algas aumentam** e a água fica **esverdeada**.'),
      sign('placa_luz', 28, 5, 'Placa: Luz', 'A luz e o fundo do lago', 'Com a água cheia de algas, a **luz tem dificuldade de chegar ao fundo**.'),
      info('oximetro', '📟', 12, 21, 'Medidor de oxigênio', 'Medidor de oxigênio', 'Quando bactérias decompositoras proliferam, elas **consomem o oxigênio** da água. Pouco oxigênio = animais aquáticos em perigo.'),
      emo('peixes_tristes', '🐟', 17, 12, 'Peixes na superfície', { interact: false, show: (G) => !G.flag('r4_limpo') }),
      emo('bolha1', '🫧', 18, 16, 'Bolhas de oxigênio', { interact: false, float: true, show: (G) => G.q('L4-Q2') }),
      emo('bolha2', '🫧', 25, 11, 'Bolhas de oxigênio', { interact: false, float: true, show: (G) => G.q('L4-Q2') }),
      ...[[19, 12], [24, 15], [21, 17], [27, 13]].map(([x, y], i) => animal('peixe' + i, 'peixe', x, y, 'Peixe', { interact: false, show: (G) => G.flag('r4_limpo') })),
      emo('barco', '🚣', 27, 17, 'Barco a remo', { interact: false }),
      ...[[11, 9], [31, 16], [20, 21]].map(([x, y], i) => obj('muda' + (i + 1), 'sapling', x, y, 'Muda marcada', { visitOnly: true, show: (G) => G.sideState('r4_margem') !== 'none' || G.seen('muda' + (i + 1)), state: (G) => ({ on: G.seen('muda' + (i + 1)) }), info: { title: 'Muda plantada', text: 'Plantar nas margens ajuda a **proteger rios e lagos**.', art: '🌱' } })),
      chest('bau_r4', 1, 1, 3),
      ...[[12, 7], [27, 21], [33, 14], [15, 21], [9, 10]].map(([x, y], i) => sidePick('r4_residuos', i, i % 2 ? '🧃' : '🛍️', x, y)),
      frag('r4', 1, 5, 19), frag('r4', 2, 37, 4), frag('r4', 3, 24, 3), frag('r4', 4, 30, 24), frag('r4', 5, 3, 6)
    ];
    const lakeColors = ['#5f9a3a', '#5d9c56', '#4c9a86', '#3f9be0'];
    maps.r4 = {
      name: 'Lago Esverdeado', region: 'r4', under: '.', spawn: { x: 3, y: 25, dir: 'up' },
      theme: { grass: '#6fbf62', grass2: '#5daa52' },
      lake: (G) => lakeColors[G.flag('r4_limpo') ? 3 : G.q('L4-Q2') ? 2 : G.q('L4-Q1') ? 1 : 0],
      build: () => {
        const g = new K.Grid(40, 28, '.').border('t');
        g.ellipse(21, 14, 9, 6, 'w');
        g.frame(10, 6, 23, 17, ',');
        g.path([[3, 25], [10, 25], [10, 22]], ',');
        g.rect(3, 9, 5, 4, 'h'); g.hline(8, 10, 15, ',');
        g.hline(11, 13, 14, ','); g.set(12, 14, '='); g.set(13, 14, '=');
        g.rect(33, 2, 6, 6, '"'); g.hline(32, 35, 10, ',');
        g.rect(33, 20, 6, 5, '#'); g.hline(32, 35, 17, ',');
        g.set(1, 2, 'b'); g.clear(2, 1, 0); g.clear(3, 1, 0); g.clear(2, 2, 0);
        return finish(g, ents, (k) => k.scatter([['t', 0.16], ['b', 0.05], ['*', 0.04]], 401, ['.']));
      },
      extra: ents,
      patches: [
        { when: (G) => G.flag('r4_limpo'), rect: [1, 1, 38, 26], ch: '*', only: ['b'] },
        { when: (G) => G.regionDone('r4'), rect: [11, 7, 21, 15], ch: '*', only: ['.'] }
      ],
      fog: regionFog('r4')
    };
  })();

  /* =================================================================
     REGIÃO 5 — TORRE DA ENERGIA E DOS ECOSSISTEMAS
     ================================================================= */
  (function () {
    const ped = (id, x, y, emoji, title, text) => obj(id, 'pedestal', x, y, title, { emoji, visitOnly: true, info: { title, text, art: emoji } });
    const ents = [
      portal('portal_vila_r5', 16, 28, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      npc('solar', 'solar', 21, 26, { lessons: ['r5_ecossistema'], side: 'r5_andares_visita', wander: 0.6 }),
      obj('elevador', 'machine', 15, 21, 'Elevador dos Níveis', { lessons: ['r5_andares'], emoji: '🛗', state: (G) => ({ on: G.flag('r5_andares') }), tall: 80 }),
      obj('barreira_andares', 'barrier', 19, 19, 'Andares fora de ordem', { show: (G) => !G.flag('r5_andares'), talk: ['Lumi: A Névoa trancou a escada. Os andares estão fora de ordem! Use o Elevador dos Níveis.'] }),
      ped('ped_capim', 23, 21, '🌾', 'Térreo: Produtores', 'Base da pirâmide: **produtores**, como o capim. Eles captam a energia do Sol na fotossíntese.'),
      ped('ped_gafanhoto', 23, 17, '🦗', '1º andar: Consumidores primários', 'Gafanhotos comem capim. A cada nível, **parte da energia é usada ou perdida**.'),
      ped('ped_ave', 23, 13, '🐦', '2º andar: Consumidores secundários', 'Aves insetívoras comem gafanhotos. Há menos energia disponível aqui.'),
      ped('ped_serpente', 23, 9, '🐍', '3º andar: Consumidores terciários', 'Serpentes comem aves. A pirâmide vai ficando estreita.'),
      ped('ped_coruja', 23, 4, '🦉', 'Topo: a coruja', 'No topo, pouca energia chega: poucos indivíduos.'),
      info('lampada_energia', '💡', 15, 17, 'Energia perdida', 'Energia que se perde', 'O fluxo de energia é **unidirecional**: em cada nível, **parte é usada ou perdida** e **não retorna ao início**.'),
      obj('piramide', 'pyramid', 19, 3, 'Sala da Pirâmide', { lessons: ['r5_piramide'], state: (G) => ({ on: G.q('L5-Q1') }), bw: 50 }),
      info('janela_solar', '☀️', 15, 3, 'Janela Solar', 'A energia entra pelo Sol', 'A energia entra nos ecossistemas principalmente pelo **Sol**; os **produtores** a captam na **fotossíntese**.'),
      npc('jatoba', 'jatoba', 7, 12, { lessons: ['r5_desequilibrio'], side: 'r5_sementes', wander: 0.8 }),
      ...[[4, 7], [9, 9], [5, 16], [10, 18]].map(([x, y], i) => obj('toco_r5_' + i, 'stump', x, y, 'Tronco cortado', { interact: false, show: (G) => !G.q('L5-Q2') })),
      ...[[4, 7], [9, 9], [5, 16], [10, 18]].map(([x, y], i) => obj('broto_r5_' + i, 'sapling', x, y, 'Broto', { interact: false, show: (G) => G.q('L5-Q2'), state: (G) => ({ on: G.regionDone('r5') }) })),
      sign('placa_invasora', 10, 22, 'Placa: Espécies', 'Nativa × invasora', '**Espécie nativa** é natural da região. **Espécie invasora** vem de outro local e pode ocupar o lugar das nativas por **não ter predadores locais**.'),
      npc('tuane', 'tuane', 32, 10, { lessons: ['r5_garrafa'], wander: 0.6 }),
      obj('garrafa', 'bottle', 34, 8, 'Garrafa Gigante', { state: (G) => ({ on: G.q('L5-Q3') }), info: { title: 'Ecossistema na garrafa', text: 'Solo, planta, cascas e um pouco de água numa garrafa fechada: um **pequeno ecossistema**.', art: '🫙' } }),
      sign('placa_materia', 29, 12, 'Placa: Matéria', 'A matéria volta', 'O fluxo da matéria é **cíclico**: pela **decomposição**, ela retorna ao ambiente e é reutilizada.'),
      altar('r5', 33, 15, '#f39c12'),
      sign('placa_pesca', 30, 25, 'Placa: Pesca', 'Pesca predatória', 'Retirar peixes **em excesso** desequilibra as cadeias alimentares do rio.'),
      ...[[31, 23], [35, 22]].map(([x, y], i) => animal('peixe_r5_' + i, 'peixe', x, y, 'Peixe', { interact: false })),
      station('mg_torre', 'torre_niveis', 10, 26, 'Torre dos Níveis', '🏗️', '#f39c12'),
      chest('bau_r5', 38, 1, 3),
      ...[[4, 24], [12, 3], [37, 18], [30, 5], [24, 27]].map(([x, y], i) => sidePick('r5_sementes', i, '🌰', x, y)),
      frag('r5', 1, 15, 9), frag('r5', 2, 24, 13), frag('r5', 3, 2, 27), frag('r5', 4, 38, 27), frag('r5', 5, 36, 3)
    ];
    maps.r5 = {
      name: 'Torre da Energia e dos Ecossistemas', region: 'r5', under: '.', ambient: 'sparks', spawn: { x: 19, y: 28, dir: 'up' },
      theme: { grass: '#83c66a', grass2: '#72b35a', lab: '#f3e6c4', lab2: '#e8d7a9', wall: '#b08d57', wall2: '#8f6f3f' },
      build: () => {
        const g = new K.Grid(40, 30, '.').border('t');
        g.frame(13, 1, 14, 24, '#'); g.rect(14, 2, 12, 22, '-');
        [19, 15, 11, 7].forEach((y) => { g.hline(14, 25, y, '#'); g.set(19, y, '-'); });
        g.set(19, 24, '-');
        g.rect(2, 4, 10, 17, 'x');
        g.rect(28, 22, 11, 3, '~');
        g.vline(19, 25, 28, ','); g.hline(7, 33, 26, ','); g.vline(7, 13, 26, ',');
        g.vline(33, 16, 26, ','); g.vline(32, 11, 16, ','); g.hline(16, 19, 28, ',');
        g.vline(33, 22, 24, '=');
        g.set(37, 1, 'b'); g.clear(38, 2, 0);
        return finish(g, ents, (k) => {
          k.scatter([['t', 0.12], ['b', 0.05], ['*', 0.12]], 501, ['.'], [27, 1, 12, 21]);
          k.scatter([['t', 0.14], ['b', 0.04]], 502, ['.'], [1, 21, 12, 8]);
          k.scatter([['t', 0.1]], 503, ['.'], [1, 1, 12, 3]);
        });
      },
      extra: ents,
      patches: [
        { when: (G) => G.q('L5-Q2'), rect: [2, 4, 10, 17], ch: '.', only: ['x'] },
        { when: (G) => G.regionDone('r5'), rect: [2, 4, 10, 17], ch: '*', only: ['.'] }
      ],
      fog: regionFog('r5')
    };
  })();

  /* =================================================================
     REGIÃO 6 — PORTAL DOS BIOMAS BRASILEIROS E RESGATE DAS AVES
     ================================================================= */
  (function () {
    const zp = (id, x, y, name, tx, ty, color, emoji) => portal(id, x, y, name, { map: 'r6', x: tx, y: ty }, { color, emoji });
    const totem = (id, x, y, name, color, emoji, clue, lessons) => obj(id, 'totem', x, y, name, Object.assign({ color, emoji, visitOnly: !lessons, info: lessons ? null : { title: name, text: clue, art: emoji }, state: (G) => ({ on: lessons ? G.done(lessons[0]) : G.seen(id) }) }, lessons ? { lessons } : {}));
    const ents = [
      portal('portal_vila_r6', 18, 4, 'Voltar à Vila', { map: 'vila', x: 17, y: 6 }, { color: '#7bd88f' }),
      portal('portal_bonus_biomas', 25, 4, 'Trilhas Extras dos Biomas', null, { bonus: 'bonus_biomas', item: 'passe_biomas', color: '#f2c94c', emoji: '🎫', state: (G) => ({ lit: G.has('passe_biomas') }) }),
      station('mg_corrida', 'corrida_biomas', 23, 9, 'Corrida dos Biomas', '🏃', '#9b51e0'),
      npc('bia', 'bia', 20, 14, { lessons: ['r6_biomas', 'r6_explorar'], wander: 0.6 }),
      altar('r6', 22, 17, '#9b51e0'),
      zp('portal_cerrado', 18, 13, 'Portal: Cerrado', 10, 8, '#e0b84a', '🌳'),
      zp('portal_mata', 25, 13, 'Portal: Mata Atlântica', 33, 8, '#2ecc71', '🌴'),
      zp('portal_caatinga', 17, 16, 'Portal: Caatinga', 10, 16, '#d8c59a', '🌵'),
      zp('portal_amazonia', 26, 16, 'Portal: Amazônia', 33, 14, '#1e8449', '🌲'),
      zp('portal_pantanal', 18, 19, 'Portal: Pantanal', 10, 25, '#5dade2', '🐊'),
      zp('portal_pampas', 25, 19, 'Portal: Pampas', 33, 25, '#c5e17a', '🌾'),
      zp('ret_cerrado', 12, 9, 'Voltar à praça', 19, 14, '#7bd88f'),
      zp('ret_mata', 31, 9, 'Voltar à praça', 24, 14, '#7bd88f'),
      zp('ret_caatinga', 12, 18, 'Voltar à praça', 18, 17, '#7bd88f'),
      zp('ret_amazonia', 31, 16, 'Voltar à praça', 25, 17, '#7bd88f'),
      zp('ret_pantanal', 12, 27, 'Voltar à praça', 19, 18, '#7bd88f'),
      zp('ret_pampas', 31, 27, 'Voltar à praça', 24, 18, '#7bd88f'),
      totem('totem_cerrado', 7, 5, 'Totem do Cerrado', '#e0b84a', '🌳', '', ['r6_cerrado']),
      totem('totem_mata', 35, 5, 'Totem da Mata Atlântica', '#2ecc71', '🌴', '', ['r6_mata']),
      totem('totem_caatinga', 7, 15, 'Totem da Caatinga', '#d8c59a', '🌵', 'Pista da **Caatinga**: **período seco marcante**. Na seca, a paisagem pode ficar **clara/esbranquiçada** e as plantas **perdem folhas** ou têm adaptações.'),
      totem('totem_amazonia', 36, 14, 'Totem da Amazônia', '#1e8449', '🌲', 'Pista da **Amazônia**: **grande floresta úmida**, **árvores altas**, **rios muito largos** e **enorme biodiversidade**.'),
      totem('totem_pantanal', 7, 25, 'Totem do Pantanal', '#5dade2', '🐊', 'Pista do **Pantanal**: **extensas áreas alagáveis** e grande diversidade de animais.'),
      totem('totem_pampas', 36, 26, 'Totem dos Pampas', '#c5e17a', '🌾', 'Pista dos **Pampas**: predomínio de **campos com plantas baixas** e **horizonte aberto**.'),
      npc('jurema', 'jurema', 4, 7, { lessons: ['r6_queimadas'], side: 'r6_fotos', wander: 0.6 }),
      sign('placa_cerrado', 10, 3, 'Placa: Cerrado', 'Cerrado', 'Muito **calor**; árvores geralmente **baixas, retorcidas e espaçadas**; presença natural do **fogo** e ocorrência de **queimadas**.'),
      sign('placa_mata', 38, 3, 'Placa: Mata Atlântica', 'Mata Atlântica', 'Floresta **úmida** próxima de grande parte do **litoral**, com grande **diversidade** de animais e plantas.'),
      sign('placa_caatinga', 10, 13, 'Placa: Caatinga', 'Caatinga', '**Período seco marcante**; na seca a paisagem fica clara e as plantas perdem folhas.'),
      sign('placa_amazonia', 38, 13, 'Placa: Amazônia', 'Amazônia', 'Grande floresta **úmida**, **árvores altas**, **rios muito largos**.'),
      sign('placa_pantanal_r6', 4, 23, 'Placa: Pantanal', 'Pantanal', '**Extensas áreas alagáveis** e grande diversidade de animais.'),
      sign('placa_pampas', 40, 24, 'Placa: Pampas', 'Pampas', '**Campos** com **plantas baixas** e **horizonte aberto**.'),
      obj('foto_caatinga', 'emoji', 4, 18, 'Ponto de foto', { emoji: '📷', visitOnly: true, info: { title: 'Foto: Caatinga', text: 'Registrado: paisagem clara na seca, cactos e plantas sem folhas.', art: '📷' } }),
      obj('foto_amazonia', 'emoji', 39, 15, 'Ponto de foto', { emoji: '📷', visitOnly: true, info: { title: 'Foto: Amazônia', text: 'Registrado: árvores altas e um rio muito largo.', art: '📷' } }),
      obj('foto_pampas', 'emoji', 39, 28, 'Ponto de foto', { emoji: '📷', visitOnly: true, info: { title: 'Foto: Pampas', text: 'Registrado: campos de plantas baixas até o horizonte.', art: '📷' } }),
      npc('iara', 'iara', 21, 23, { lessons: ['r6_noticia'], side: 'r6_penas', wander: 0.6 }),
      obj('mural_noticia', 'board', 18, 23, 'Mural da Notícia', { tall: 70, info: { title: 'Notícia (texto do livro)', text: '**163 pássaros silvestres de 18 espécies** foram resgatados em **duas feiras** nos conjuntos **Santa Catarina e Nova Natal**, **Zona Norte de Natal**. As aves eram comercializadas ilegalmente, em caixas pequenas, sem água e com pouca ventilação. **Dois homens foram presos** por crime ambiental. Denúncias: **190, 181 ou (84) 3616-9829** (conforme o texto).', art: '📰' } }),
      obj('gaiola1', 'cage', 17, 27, 'Gaiola 1', { lessons: ['r6_gaiola1'], emoji: '🐦', state: (G) => ({ open: G.q('L6-Q1') }) }),
      obj('gaiola2', 'cage', 20, 27, 'Gaiola 2', { lessons: ['r6_gaiola2'], emoji: '🦜', state: (G) => ({ open: G.q('L6-Q2') }) }),
      obj('gaiola3', 'cage', 23, 27, 'Gaiola 3', { lessons: ['r6_gaiola3'], emoji: '🐤', state: (G) => ({ open: G.flag('r6_gaiola3') }) }),
      obj('gaiola4', 'cage', 26, 27, 'Gaiola 4', { lessons: ['r6_gaiola4'], emoji: '🦚', state: (G) => ({ open: G.q('L6-Q3') }) }),
      emo('flores_cerrado', '🌼', 9, 6, 'Flores do Cerrado', { interact: false, show: (G) => G.q('L6-Q4') }),
      animal('aves_mata', 'tucano', 37, 7, 'Aves', { interact: false, show: (G) => G.q('L6-Q5') }),
      emo('placa_prev', '🚫🔥', 3, 5, 'Previna queimadas', { size: 20, interact: false, show: (G) => G.q('L6-Q6') }),
      animal('jacare', 'jacare', 9, 28, 'Jacaré', { interact: false }),
      chest('bau_r6', 42, 30, 3),
      ...[[16, 25], [27, 24], [24, 29], [17, 21], [26, 11]].map(([x, y], i) => sidePick('r6_penas', i, '🪶', x, y)),
      frag('r6', 1, 3, 19), frag('r6', 2, 40, 15), frag('r6', 3, 2, 29), frag('r6', 4, 41, 29), frag('r6', 5, 27, 2)
    ];
    maps.r6 = {
      name: 'Portal dos Biomas Brasileiros', region: 'r6', under: '.', spawn: { x: 21, y: 6, dir: 'down' },
      zones: [
        { rect: [1, 1, 13, 10], portal: 'portal_cerrado', ret: 'ret_cerrado' }, { rect: [30, 1, 13, 10], portal: 'portal_mata', ret: 'ret_mata' },
        { rect: [1, 12, 13, 9], portal: 'portal_caatinga', ret: 'ret_caatinga' }, { rect: [30, 12, 13, 9], portal: 'portal_amazonia', ret: 'ret_amazonia' },
        { rect: [1, 22, 13, 9], portal: 'portal_pantanal', ret: 'ret_pantanal' }, { rect: [30, 22, 13, 9], portal: 'portal_pampas', ret: 'ret_pampas' }
      ],
      theme: { grass: '#86c46a', grass2: '#74b05a', stone: '#c9c2b5', stone2: '#b3ab9c' },
      build: () => {
        const g = new K.Grid(44, 32, '.').border('t');
        g.vline(14, 1, 30, 't'); g.vline(29, 1, 30, 't');
        g.hline(1, 13, 11, 't'); g.hline(1, 13, 21, 't'); g.hline(30, 42, 11, 't'); g.hline(30, 42, 21, 't');
        g.rect(2, 2, 4, 3, 'x');
        g.rect(1, 12, 13, 9, ';');
        g.rect(1, 22, 13, 9, 'm'); g.rect(3, 27, 4, 3, 'w'); g.rect(9, 23, 4, 2, 'w');
        g.rect(30, 22, 13, 9, '"');
        g.rect(39, 1, 2, 10, ':'); g.rect(41, 1, 2, 10, '~');
        g.rect(30, 18, 13, 2, '~');
        g.rect(17, 12, 10, 8, 'j');
        g.rect(16, 22, 12, 8, 'j');
        g.vline(21, 5, 12, ','); g.vline(21, 20, 22, ',');
        g.hline(18, 25, 5, ',');
        [[10, 8], [33, 8], [10, 16], [33, 14], [10, 25], [33, 25], [25, 6]].forEach(([x, y]) => g.clear(x, y, 0));
        return finish(g, ents, (k) => {
          k.scatter([['q', 0.1], ['b', 0.03]], 601, ['.'], [1, 1, 13, 10]);
          k.scatter([['y', 0.3], ['b', 0.04]], 602, ['.'], [30, 1, 9, 10]);
          k.scatter([['k', 0.12]], 603, [';'], [1, 12, 13, 9]);
          k.scatter([['y', 0.28]], 604, ['.'], [30, 12, 13, 6]);
          k.scatter([['b', 0.03]], 605, ['"'], [30, 22, 13, 9]);
          k.scatter([['t', 0.1], ['*', 0.05]], 606, ['.'], [15, 1, 14, 11]);
          k.scatter([['t', 0.1], ['*', 0.05]], 607, ['.'], [15, 20, 14, 11]);
        });
      },
      extra: ents,
      patches: [
        { when: (G) => G.q('L6-Q7'), rect: [2, 2, 4, 3], ch: '.', only: ['x'] },
        { when: (G) => G.q('L6-Q4'), rect: [1, 1, 13, 10], ch: '*', only: ['b'] },
        { when: (G) => G.regionDone('r6'), rect: [15, 1, 14, 11], ch: '*', only: ['.'] }
      ],
      fog: regionFog('r6')
    };
  })();

  /* =================================================================
     ARENA FINAL — RESTAURAÇÃO DO ECONEXUS
     ================================================================= */
  (function () {
    const pil = (i, x, y) => obj('pilar' + i, 'altar', x, y, 'Pilar: ' + EN.data.regions[i - 1].name, { color: EN.data.regions[i - 1].color, visitOnly: true, state: (G) => ({ lit: G.regionDone('r' + i) }), info: { title: EN.data.regions[i - 1].name, text: EN.data.regions[i - 1].summary, art: EN.data.regions[i - 1].medalIcon } });
    const ents = [
      obj('nucleo', 'nucleo', 16, 10, 'Núcleo da Névoa', { arena: true, bw: 50, bh: 30, tall: 84, state: (G) => ({ level: G.storyDone() ? 0 : 1 }) }),
      pil(1, 8, 6), pil(2, 24, 6), pil(3, 5, 11), pil(4, 27, 11), pil(5, 8, 16), pil(6, 24, 16),
      npc('solar_arena', 'solar', 16, 5, { wander: 0, talk: ['Guardião, esta é a Arena da Restauração. São quatro rodadas: Reconhecer, Construir, Explicar e o Chefão da Névoa.', 'A meta de 70% dá o prêmio máximo, mas ninguém fica para trás: se precisar, faremos uma revisão guiada.'] }),
      npc('nara_arena', 'nara', 11, 18, { side: 'arena_pilares', talk: ['Estou torcendo por você! Cada acerto dissipa um pouco da Névoa.'] }),
      npc('bia_arena', 'bia', 21, 18, { side: 'arena_fragmentos', talk: ['Os seis biomas contam com você!'] }),
      sign('placar', 16, 15, 'Placar da Arena', 'Placar', 'Veja sua melhor pontuação da Arena no Caderno e no painel de progresso. A meta é **70%** para o baú especial.'),
      station('mg_relampago', 'relampago', 5, 15, 'Desafio Relâmpago (opcional)', '⏱️', '#e67e22'),
      portal('portal_saida_arena', 16, 21, 'Voltar à Vila', { map: 'vila', x: 30, y: 12 }, { color: '#7bd88f' }),
      chest('bau_arena', 9, 19, 3),
      ...[[6, 8], [26, 8], [12, 13], [20, 13], [16, 17]].map(([x, y], i) => sidePick('arena_fragmentos', i, '🌫️', x, y))
    ];
    maps.arena = {
      name: 'Arena Final: Restauração do EcoNexus', region: 'arena', under: 'j', ambient: 'sparks', spawn: { x: 16, y: 19, dir: 'up' },
      theme: { stone: '#cbbfe8', stone2: '#b3a3dd', wall: '#6a5a8f', wall2: '#584a7a' },
      build: () => {
        const g = new K.Grid(32, 24, '#');
        g.ellipse(16, 11, 14, 10.5, 'j');
        g.ellipse(16, 11, 10, 7, 'i', ['j']); g.ellipse(16, 11, 8, 5, 'j', ['i']);
        g.frame(0, 0, 32, 24, '#');
        return finish(g, ents);
      },
      extra: ents,
      patches: [
        { when: (G) => G.arenaRound() >= 1, rect: [0, 0, 32, 24], ch: '*', only: ['i'] },
        { when: (G) => G.arenaRound() >= 2, rect: [3, 3, 26, 17], ch: '.', only: ['j'] },
        { when: (G) => G.arenaRound() >= 3, rect: [0, 0, 32, 24], ch: 't', only: ['#'] },
        { when: (G) => G.arenaRound() >= 4, rect: [0, 0, 32, 24], ch: '*', only: ['.'] }
      ],
      fog: (G) => Math.max(0, 1 - G.arenaRound() * 0.25)
    };
  })();

  /* =================================================================
     ÁREAS BÔNUS (abertas por itens da loja; conteúdo opcional)
     ================================================================= */
  (function () {
    // Copa da Floresta (Corda de Escalada) — Região 1
    const copa = [
      portal('saida_copa', 1, 7, 'Descer pela corda', { map: 'r1', x: 23, y: 5 }, { color: '#7bd88f', emoji: '🪢' }),
      sign('obs_copa1', 5, 2, 'Observação: aves', 'Biodiversidade na copa', 'Daqui do alto você vê araras, tucanos e macacos: a **biodiversidade** é a variedade de seres vivos.'),
      sign('obs_copa2', 15, 2, 'Observação: macacos', 'Habitat dos macacos', 'Os macacos encontram **alimento**, **abrigo** e **lugar para ter filhotes** nas copas: é o seu **habitat**.'),
      sign('obs_copa3', 15, 11, 'Observação: frutos', 'Alimento na floresta', 'Frutos alimentam muitos animais. Sem floresta, eles perdem esse alimento.'),
      review('rev_copa', 10, 3, ['r1'], 'Estação de Revisão da Copa', '🔭'),
      animal('arara_copa', 'arara', 12, 7, 'Arara', { interact: false, solid: false }),
      animal('macaco_copa', 'macaco', 8, 11, 'Macaco', { interact: false, solid: false }),
      chest('bau_copa', 5, 11, 3)
    ];
    maps.bonus_copa = {
      name: 'Copa da Floresta (bônus)', region: 'bonus', under: 'z', ambient: 'leaves', spawn: { x: 2, y: 7, dir: 'right' }, bonusArea: true,
      build: () => { const g = new K.Grid(22, 14, 'v'); g.hline(1, 20, 7, 'z'); g.vline(5, 2, 11, 'z'); g.vline(15, 2, 11, 'z'); g.hline(5, 15, 3, 'z'); g.hline(5, 15, 11, 'z'); g.frame(0, 0, 22, 14, 'v'); return finish(g, copa); },
      extra: copa
    };
    // Caverna dos Decompositores (Lanterna Ecológica) — Região 2
    const cav = [
      portal('saida_caverna', 1, 6, 'Sair da caverna', { map: 'r2', x: 36, y: 5 }, { color: '#7bd88f' }),
      ...[[4, 1], [5, 12], [15, 1], [17, 12], [10, 5]].map(([x, y], i) => emo('cogumelo' + i, '🍄', x, y, 'Cogumelo brilhante', { visitOnly: true, info: { title: 'Fungo decompositor', text: ['Fungos decompõem restos de **qualquer nível** trófico.', 'Decompositores devolvem **matéria e nutrientes** ao solo.', 'Bactérias também são decompositoras.', 'Sem decompositores, os restos se acumulariam.', 'As plantas absorvem os nutrientes que os decompositores devolvem.'][i], art: '🍄' } })),
      review('rev_caverna', 10, 8, ['r2'], 'Estação de Revisão da Caverna', '🔦'),
      chest('bau_caverna', 18, 6, 3)
    ];
    maps.bonus_caverna = {
      name: 'Caverna dos Decompositores (bônus)', region: 'bonus', under: 'u', ambient: 'dust', dark: true, spawn: { x: 2, y: 6, dir: 'right' }, bonusArea: true,
      build: () => { const g = new K.Grid(22, 14, 'c'); g.rect(1, 5, 20, 4, 'u'); g.rect(3, 1, 4, 12, 'u'); g.rect(14, 1, 5, 12, 'u'); return finish(g, cav); },
      extra: cav
    };
    // Sala Bônus dos Ciclos (Chave do Laboratório) — Região 3
    const lab = [
      obj('saida_lab', 'door', 10, 12, 'Voltar ao laboratório', { portal: { map: 'r3', x: 19, y: 4 }, tall: 60 }),
      review('rev_lab', 10, 3, ['r3'], 'Máquina de Montagem dos Ciclos', '⚙️'),
      info('lab_info1', '🔵', 3, 3, 'Painel do oxigênio', 'Oxigênio', 'Liberado na **fotossíntese**, consumido na **respiração** e na **combustão**.'),
      info('lab_info2', '⚪', 17, 3, 'Painel do carbono', 'Gás carbônico', 'Usado na **fotossíntese**; liberado na **respiração**, **decomposição** e **queimadas**.'),
      info('lab_info3', '🦠', 3, 10, 'Painel do nitrogênio', 'Nitrogênio', '**Bactérias fixadoras** transformam o nitrogênio do ar; plantas absorvem pelo solo; animais, pela alimentação.'),
      chest('bau_lab', 18, 10, 3)
    ];
    maps.bonus_lab = {
      name: 'Sala Bônus dos Ciclos', region: 'bonus', under: '-', ambient: 'sparks', spawn: { x: 10, y: 11, dir: 'up' }, bonusArea: true,
      build: () => finish(new K.Grid(22, 14, '-').border('#'), lab), extra: lab
    };
    // Mergulho do Lago (Máscara de Mergulho) — Região 4
    const mer = [
      portal('saida_mergulho', 1, 1, 'Voltar à superfície', { map: 'r4', x: 12, y: 14 }, { color: '#7bd88f', emoji: '🤿' }),
      review('rev_mergulho', 11, 3, ['r4'], 'Coral da Revisão', '🪸'),
      info('mer_info', '🐟', 5, 10, 'Peixes felizes', 'Água com oxigênio', 'Com a água limpa e **oxigênio** suficiente, os peixes conseguem respirar.'),
      info('mer_info2', '🌿', 17, 6, 'Plantas aquáticas', 'Produtores aquáticos', 'Algas e plantas aquáticas são **produtores**: fazem fotossíntese e liberam gás oxigênio.'),
      ...[[4, 4], [8, 2], [13, 9], [18, 3], [7, 11], [15, 12], [19, 9], [10, 6], [3, 8], [16, 5]].map(([x, y], i) => ({ id: 'bolha_b' + i, kind: 'pickup', sprite: 'emoji', emoji: '🫧', size: 22, float: true, x, y, pickup: 'bubble', idx: i, show: (G) => !G.tempPicked('bolha' + i) })),
      animal('peixe_m1', 'peixe', 9, 8, 'Peixe', { interact: false, solid: false, wander: 2 }),
      animal('peixe_m2', 'tartaruga', 14, 4, 'Tartaruga', { interact: false, solid: false, wander: 2 }),
      chest('bau_mergulho', 19, 11, 3)
    ];
    maps.bonus_mergulho = {
      name: 'Mergulho do Lago (bônus)', region: 'bonus', under: 'e', ambient: 'bubbles', spawn: { x: 2, y: 2, dir: 'right' }, bonusArea: true,
      tint: 'rgba(40,120,200,.12)',
      build: () => { const g = new K.Grid(22, 14, 'e').border('a'); return finish(g, mer, (k) => k.scatter([['a', 0.06]], 701, ['e'])); },
      extra: mer
    };
    // Trilhas Extras dos Biomas (Passe dos Biomas) — Região 6
    const bio = [
      portal('saida_biomas', 11, 12, 'Voltar à praça', { map: 'r6', x: 25, y: 6 }, { color: '#7bd88f' }),
      review('rev_biomas', 11, 6, ['r6'], 'Estação de Revisão dos Biomas', '🧭'),
      ...[['Cerrado', '🌳', 3, 3], ['Caatinga', '🌵', 11, 2], ['Mata Atlântica', '🌴', 19, 3], ['Amazônia', '🌲', 3, 9], ['Pantanal', '🐊', 19, 9], ['Pampas', '🌾', 7, 11]].map(([n, e, x, y], i) => sign('trilha_bio' + i, x, y, 'Trilha: ' + n, n, EN.data.notebook.find((c) => c.id === 'biomas').text.split('. ')[0] + '.', { emoji: e, info: { title: 'Trilha do bioma: ' + n, text: ({ Cerrado: 'Muito calor; árvores baixas, retorcidas e espaçadas; queimadas.', Caatinga: 'Período seco marcante; paisagem clara na seca; plantas perdem folhas.', 'Mata Atlântica': 'Floresta úmida perto do litoral, com grande diversidade.', 'Amazônia': 'Grande floresta úmida, árvores altas, rios muito largos, enorme biodiversidade.', Pantanal: 'Extensas áreas alagáveis e grande diversidade de animais.', Pampas: 'Campos com plantas baixas e horizonte aberto.' })[n], art: e } })),
      chest('bau_biomas', 16, 12, 3)
    ];
    maps.bonus_biomas = {
      name: 'Trilhas Extras dos Biomas (bônus)', region: 'bonus', under: '.', ambient: 'leaves', spawn: { x: 11, y: 11, dir: 'up' }, bonusArea: true,
      build: () => {
        const g = new K.Grid(22, 14, '.').border('t');
        g.rect(1, 1, 6, 5, '.'); g.rect(8, 1, 6, 4, ';'); g.rect(16, 1, 5, 5, '.'); g.rect(1, 7, 6, 4, '.'); g.rect(16, 7, 5, 4, 'm'); g.rect(3, 10, 8, 3, '"');
        g.vline(11, 3, 12, ','); g.hline(3, 19, 6, ',');
        return finish(g, bio, (k) => { k.scatter([['q', 0.15]], 801, ['.'], [1, 1, 6, 5]); k.scatter([['k', 0.12]], 802, [';'], [8, 1, 6, 4]); k.scatter([['y', 0.2]], 803, ['.'], [16, 1, 5, 5]); k.scatter([['y', 0.2]], 804, ['.'], [1, 7, 6, 4]); });
      },
      extra: bio
    };
  })();

  EN.data.maps = maps;

  /* Índice: em qual mapa/posição está cada entidade (usado por objetivos). */
  EN.data.entityIndex = {};
  Object.keys(maps).forEach((mid) => {
    (maps[mid].extra || []).forEach((e) => { if (!EN.data.entityIndex[e.id]) EN.data.entityIndex[e.id] = { map: mid, x: e.x, y: e.y, def: e }; });
  });
})();
