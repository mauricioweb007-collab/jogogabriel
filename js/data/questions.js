/* =====================================================================
   data/questions.js — MATRIZ DE COBERTURA das 43 QUESTÕES DO LIVRO
   (L1-Q1 … L6-Q7). Cada questão tem:
     id, region, map, where (NPC/objeto/ponto que apresenta), entity,
     concept, level, title, prompt (enunciado), prep (conceito, exemplo
     do material, passo a passo), main (tipo de interação, alternativas,
     gabarito), answer (gabarito conceitual), keywords, why (explicação
     do acerto), err (erro comum), model (resposta-modelo), recap
     (reapresentação após erro), hint1, hint2, guided (versão guiada
     opcional), review (variação para revisão), scene (mudança no
     cenário). XP/EcoMoedas por tentativa ficam em EN.data.rewards.
   Status, tentativas e acerto de primeira ficam no salvamento (save.js).
   ===================================================================== */
(function () {
  'use strict';
  const ok = (t, fb, extra) => Object.assign({ t, ok: true, fb }, extra || {});
  const no = (t, fb, extra) => Object.assign({ t, ok: false, fb }, extra || {});

  /* Recompensas fixas (seção "Ganho de recompensas"). */
  EN.data.rewards = {
    tier1: { xp: 100, coins: 12, label: 'Correta de primeira' },
    tier2: { xp: 70, coins: 8, label: 'Correta na segunda tentativa / com pista' },
    tier3: { xp: 40, coins: 5, label: 'Correta após explicação guiada' },
    check: { xp: 25, coins: 2, label: 'Checagem de leitura / treino correto' },
    checkGuided: { xp: 10, coins: 1, label: 'Treino concluído com ajuda' },
    mainQuest: { xp: 80, coins: 10, label: 'Missão principal concluída' },
    secret: { xp: 0, coins: 3, label: 'Colecionável secreto' },
    recovery: { xp: 20, coins: 3, label: 'Bônus de recuperação' },
    medallionCap: 40
  };

  /* Teia alimentar usada nas questões L2-Q7, L2-Q8 e L2-Q9. */
  const TEIA = {
    nodes: [
      { id: 'plantas', t: 'Plantas', icon: '🌿', x: 50, y: 88 },
      { id: 'gafanhotos', t: 'Gafanhotos', icon: '🦗', x: 18, y: 62 },
      { id: 'camundongos', t: 'Camundongos', icon: '🐁', x: 80, y: 62 },
      { id: 'aves', t: 'Aves pequenas', icon: '🐦', x: 18, y: 34 },
      { id: 'serpentes', t: 'Serpentes', icon: '🐍', x: 55, y: 38 },
      { id: 'gaviao', t: 'Gavião', icon: '🦅', x: 55, y: 10 },
      { id: 'fungos', t: 'Fungos', icon: '🍄', x: 90, y: 20 }
    ],
    edges: [['plantas', 'gafanhotos'], ['plantas', 'camundongos'], ['gafanhotos', 'aves'], ['aves', 'serpentes'], ['camundongos', 'serpentes'], ['serpentes', 'gaviao'], ['camundongos', 'gaviao'],
      ['plantas', 'fungos'], ['gafanhotos', 'fungos'], ['camundongos', 'fungos'], ['aves', 'fungos'], ['serpentes', 'fungos'], ['gaviao', 'fungos']]
  };
  EN.data.TEIA = TEIA;

  const Q = [
    /* =========================== REGIÃO 1 =========================== */
    {
      id: 'L1-Q1', region: 'r1', map: 'r1', entity: 'macaco', where: 'Clareira dos Tocos — macaco Tico (com a Guardiã Nara)', concept: 'habitat', level: 'guardiao',
      title: 'Por que as florestas importam?',
      prompt: 'Por que a retirada de florestas ameaça a vida dos animais?',
      prep: {
        concept: '**Habitat** é o ambiente onde o ser vivo encontra **alimento**, **abrigo** e **condições para se reproduzir**.',
        example: 'O macaco Tico vivia nestas árvores: ali achava frutos, galhos para se abrigar e um lugar seguro para ter filhotes.',
        steps: ['O que a floresta oferece ao animal?', 'Com as árvores cortadas, o que ele perde?', 'O que acontece com o número de animais quando falta tudo isso?']
      },
      main: {
        type: 'open', placeholder: 'Escreva com suas palavras. Ex.: Porque os animais perdem…',
        groups: [
          { label: 'A floresta é o habitat e ele é destruído ou reduzido', kw: ['habitat', 'casa', 'lar', 'onde vivem', 'onde moram', 'onde mora', 'moradia', 'destro', 'destruid', 'reduz', 'sem floresta', 'sem arvore', 'perdem', 'perde '] },
          { label: 'Os animais ficam sem alimento', kw: ['aliment', 'comida', 'comer', 'fruta', 'frutos', 'fome'] },
          { label: 'Os animais ficam sem abrigo', kw: ['abrigo', 'abrigar', 'esconder', 'protec', 'dormir'] },
          { label: 'Perdem lugar para se reproduzir', kw: ['reproduz', 'filhote', 'cria ', 'crias', 'ninho', 'procria', 'bebe'] },
          { label: 'As populações podem diminuir', kw: ['diminu', 'morre', 'morrer', 'morrem', 'extin', 'desaparec', 'menos animais', 'populac'] }
        ],
        min: 2, wrongIdeas: ['Os animais ganham mais comida', 'A floresta não tem relação com os animais']
      },
      answer: 'Porque destrói ou reduz o habitat, retirando alimento, abrigo e locais/condições de reprodução; as populações podem diminuir.',
      model: 'Porque destrói ou reduz o habitat dos animais. Sem a floresta, eles perdem alimento, abrigo e lugares para se reproduzir, e as populações podem diminuir.',
      why: 'A floresta é o **habitat** de muitos animais. Quando ela é retirada, eles perdem **alimento**, **abrigo** e **locais para se reproduzir**. Muitos têm alimentação específica e não encontram o que precisam em outro lugar. Por isso, as populações podem diminuir.',
      err: 'Responder só “porque ficam sem casa”. Habitat também é alimento e lugar para ter filhotes.',
      recap: 'Lembre: **habitat = alimento + abrigo + condições para se reproduzir**. Sem floresta, o que o macaco perde?',
      hint1: 'Pense nas três coisas que um habitat oferece.',
      hint2: 'Alimento, abrigo, reprodução… e o que acontece com o número de animais?',
      guided: { type: 'fill', prompt: 'Complete a explicação:', text: 'Sem a floresta, os animais perdem o seu {0}: ficam sem {1}, sem {2} e sem lugar para se {3}. Por isso, as populações podem {4}.', answers: ['habitat', 'alimento', 'abrigo', 'reproduzir', 'diminuir'], bank: ['aumentar', 'brincar'] },
      review: { type: 'mc', prompt: 'Uma mata foi cortada. Qual é a principal ameaça para as aves que viviam ali?', options: [ok('Perdem o habitat: alimento, abrigo e lugar para fazer ninhos'), no('Ganham mais espaço para voar e ficam mais fortes', 'Espaço vazio não significa alimento nem abrigo.'), no('Nada muda, pois aves podem voar para qualquer lugar', 'Muitos animais têm alimentação específica e não encontram o que precisam em outro lugar.')] },
      scene: { flag: 'q_L1-Q1', text: 'Mudas aparecem ao redor dos tocos da clareira.' }
    },
    {
      id: 'L1-Q2', region: 'r1', map: 'r1', entity: 'nara', where: 'Clareira dos Tocos — Guardiã Nara', concept: 'habitat', level: 'construtor',
      title: 'Salvar os macacos',
      prompt: 'O que poderia ser feito para impedir a extinção dos macacos citados no texto? Marque as ações que ajudam.',
      prep: {
        concept: 'Os primatas brasileiros **dependem das florestas**. Proteger os macacos é proteger o **habitat** deles.',
        example: 'Uma **área de preservação** é protegida por lei para conservar solo, ar, rios, plantas e animais.',
        steps: ['Qual é o problema? A perda de floresta.', 'Quais ações cuidam da floresta?', 'Quais ações evitam tirar os macacos da natureza?']
      },
      main: {
        type: 'multi', minCorrect: 2,
        options: [
          ok('Preservar e recuperar as florestas, replantando árvores'),
          ok('Combater o desmatamento'),
          ok('Criar ou respeitar áreas protegidas'),
          ok('Não capturar os macacos da natureza'),
          no('Levar os macacos para casa como animais de estimação', 'Os macacos são silvestres: retirá-los da natureza os afasta do habitat.'),
          no('Cortar mais árvores para construir abrigos para eles', 'Cortar árvores reduz o habitat — esse é justamente o problema.')
        ]
      },
      answer: 'Preservar e recuperar as florestas/habitats, combater o desmatamento, criar ou respeitar áreas protegidas e não capturar animais.',
      model: 'Preservar e replantar as florestas, combater o desmatamento, criar e respeitar áreas protegidas e não capturar os macacos.',
      why: 'A ameaça aos macacos é a **perda de habitat**. As soluções protegem a floresta ou deixam os macacos livres: **preservar e recuperar florestas**, **combater o desmatamento**, **respeitar áreas protegidas** e **não capturar** os animais.',
      err: 'Achar que levar o macaco para casa o protege. Ele é silvestre e precisa da floresta.',
      recap: 'O problema é a floresta diminuindo. Boas ações **protegem a floresta** ou **deixam o macaco livre** na natureza.',
      hint1: 'Todas as boas ações protegem o habitat ou deixam o macaco livre.',
      hint2: 'Descarte as ações que tiram o macaco da floresta ou cortam árvores.',
      review: { type: 'multi', minCorrect: 2, prompt: 'Para proteger a onça-pintada no Pantanal, o que ajuda?', options: [ok('Conservar a área onde ela vive'), ok('Não caçar as onças'), ok('Respeitar a área de preservação'), no('Retirar as capivaras da região', 'As capivaras são alimento da onça.'), no('Queimar o capim', 'Queimadas destroem habitats.')] },
      scene: { flag: 'q_L1-Q2', text: 'As mudas viram árvores jovens e o macaco Tico volta a subir nelas.' }
    },
    {
      id: 'L1-Q3', region: 'r1', map: 'r1', entity: 'placa_silvestre', where: 'Posto da Guarda — placa “Animais Silvestres” (com o cachorro Pipoca)', concept: 'silvestre', level: 'explorador',
      title: 'Silvestre ou doméstico?',
      prompt: 'Os macacos citados são domésticos ou silvestres? Explique.',
      prep: {
        concept: '**Silvestres** vivem livres na natureza. **Domésticos** passaram por um longo processo de **domesticação** e convivência com os seres humanos.',
        example: 'O cachorro Pipoca, que mora no posto com a Guardiã Nara, é doméstico. O macaco Tico vive livre na floresta.',
        steps: ['Onde o macaco vive?', 'Ele passou por domesticação, como o cachorro?', 'Então ele é…']
      },
      main: {
        type: 'tfj',
        partA: { prompt: 'Os macacos são:', options: [ok('Silvestres'), no('Domésticos', 'Domésticos passaram por longa domesticação, como o cachorro Pipoca.')] },
        partB: { prompt: 'Por quê?', options: [ok('Porque vivem livres na natureza, nas florestas, e não passaram por domesticação'), no('Porque são pequenos e fofos', 'O tamanho não define se um animal é silvestre.'), no('Porque podem morar em qualquer casa', 'Animais silvestres não devem ser tratados como domésticos.')] }
      },
      answer: 'Silvestres, porque vivem livres na natureza/florestas e não passaram por domesticação.',
      model: 'São silvestres, porque vivem livres nas florestas e não passaram por domesticação.',
      why: 'Os macacos são **silvestres**: vivem **livres na natureza**, nas florestas, e **não passaram pela domesticação**, como aconteceu com o cachorro.',
      err: 'Pensar que um animal vira doméstico só porque alguém o cria em casa.',
      recap: 'Silvestre = vive **livre na natureza**. Doméstico = passou por **domesticação** e convive com pessoas há muito tempo.',
      hint1: 'Compare o macaco Tico com o cachorro Pipoca.',
      hint2: 'Onde o macaco vive: na floresta ou numa casa, com pessoas?',
      review: { type: 'tfj', partA: { prompt: 'A capivara que vive no Pantanal é:', options: [ok('Silvestre'), no('Doméstica', 'Ela não passou por domesticação.')] }, partB: { prompt: 'Por quê?', options: [ok('Porque vive livre na natureza'), no('Porque come gramíneas', 'É verdade que come gramíneas, mas isso não explica se é silvestre.'), no('Porque mora com pessoas', 'A capivara do Pantanal vive livre.')] } },
      scene: { flag: 'q_L1-Q3', text: 'A placa “Animais Silvestres: observe de longe” acende e uma família de macacos aparece nas árvores.' }
    },
    {
      id: 'L1-Q4', region: 'r1', map: 'r1', entity: 'mirante', where: 'Mirante do Pantanal', concept: 'cadeia', level: 'construtor',
      title: 'Gramíneas, capivaras e onças',
      prompt: 'Existe relação entre gramíneas, capivaras e onças-pintadas? Ligue com setas: a seta sai do alimento e aponta para quem come.',
      prep: {
        concept: 'A **capivara** é **herbívora** e come **gramíneas**. A **onça-pintada** é **carnívora** e pode predar capivaras.',
        example: 'Do mirante, você viu capivaras pastando e uma onça observando de longe.',
        steps: ['Quem come as gramíneas?', 'Quem pode comer a capivara?', 'A seta sai do alimento → aponta para quem come.']
      },
      main: {
        type: 'arrows',
        nodes: [{ id: 'gram', t: 'Gramíneas', icon: '🌾', x: 15, y: 50 }, { id: 'capi', t: 'Capivara', icon: '#capivara', x: 50, y: 50 }, { id: 'onca', t: 'Onça-pintada', icon: '🐆', x: 85, y: 50 }],
        edges: [['gram', 'capi'], ['capi', 'onca']]
      },
      answer: 'Sim. As gramíneas alimentam as capivaras, e as capivaras podem servir de alimento às onças; formam uma cadeia alimentar.',
      model: 'Sim: gramíneas → capivara → onça-pintada. É uma cadeia alimentar.',
      why: '**Sim!** As **gramíneas** alimentam as **capivaras**, e as capivaras podem servir de alimento às **onças-pintadas**. Juntas formam uma **cadeia alimentar**: gramíneas → capivara → onça.',
      err: 'Desenhar a seta da onça para a capivara. A seta sai do alimento e aponta para quem come.',
      recap: 'A seta **sai do alimento** e **aponta para quem come**: **alimento → consumidor**.',
      hint1: 'Pergunte: quem serviu de alimento para quem?',
      hint2: 'Comece pelas gramíneas: quem as come?',
      review: { type: 'arrows', prompt: 'Ligue a cadeia com setas: milho, rato e coruja.', nodes: [{ id: 'coruja', t: 'Coruja', icon: '🦉', x: 15, y: 50 }, { id: 'milho', t: 'Milho', icon: '🌽', x: 50, y: 50 }, { id: 'rato', t: 'Rato', icon: '🐁', x: 85, y: 50 }], edges: [['milho', 'rato'], ['rato', 'coruja']] },
      scene: { flag: 'q_L1-Q4', text: 'Capivaras pastam no alagado e uma onça aparece ao longe.' }
    },
    {
      id: 'L1-Q5', region: 'r1', map: 'r1', entity: 'mirante', where: 'Mirante do Pantanal — painel de populações', concept: 'teia', level: 'guardiao',
      title: 'Menos capivaras',
      prompt: 'O que aconteceria se o número de capivaras diminuísse no Pantanal? Marque o que pode acontecer.',
      prep: {
        concept: 'Numa cadeia, **mudar uma população afeta as outras**: menos alimento pode diminuir os consumidores.',
        example: 'gramíneas → capivara → onça. A capivara come gramíneas e serve de alimento à onça.',
        steps: ['Olhe para frente da seta: quem come a capivara?', 'Olhe para trás da seta: o que a capivara come?', 'Pense no que muda para cada um.']
      },
      pre: {
        type: 'sim', prompt: 'Use o botão **–** para diminuir as capivaras e observe as outras populações.', need: 'down',
        pops: [{ id: 'gram', t: 'Gramíneas', icon: '🌾', v: 55 }, { id: 'capi', t: 'Capivaras', icon: '#capivara', v: 55 }, { id: 'onca', t: 'Onças', icon: '🐆', v: 45 }],
        control: 'capi', links: [{ id: 'onca', k: 0.6 }, { id: 'gram', k: -0.8 }],
        notes: { down: 'Menos capivaras: as onças ficam com menos alimento; as gramíneas são menos comidas.', up: 'Mais capivaras: mais alimento para as onças; as gramíneas são mais comidas.' }
      },
      main: {
        type: 'multi', minCorrect: 1,
        options: [
          ok('As onças teriam menos alimento e poderiam diminuir'),
          ok('As onças poderiam procurar outras presas'),
          ok('As gramíneas tenderiam a aumentar, por serem menos comidas'),
          no('As onças ficariam com mais alimento', 'Capivaras são presas das onças: menos capivaras = menos alimento.'),
          no('As gramíneas acabariam', 'Com menos capivaras comendo, as gramíneas tendem a aumentar.')
        ]
      },
      answer: 'As onças teriam menos alimento e poderiam diminuir ou procurar outras presas; as gramíneas tenderiam a aumentar por serem menos consumidas.',
      model: 'As onças teriam menos alimento e poderiam diminuir ou procurar outras presas. As gramíneas tenderiam a aumentar.',
      why: 'As capivaras são **alimento das onças** e **comem gramíneas**. Com menos capivaras, as **onças têm menos alimento** e podem **diminuir ou procurar outras presas**. As **gramíneas tendem a aumentar**, porque são menos consumidas.',
      err: 'Pensar só na onça e esquecer das gramíneas (ou o contrário).',
      recap: 'Siga as setas: gramíneas → **capivara** → onça. O que muda para quem vem **antes** e para quem vem **depois** da capivara?',
      hint1: 'Quem come a capivara vai ter mais ou menos comida?',
      hint2: 'E as gramíneas: menos capivaras comendo significa mais ou menos capim?',
      review: { type: 'mc', prompt: 'Se as gramíneas diminuíssem muito no Pantanal, o que aconteceria com as capivaras?', options: [ok('Teriam menos alimento e poderiam diminuir'), no('Aumentariam', 'Com menos alimento, a população de consumidores tende a diminuir.'), no('Nada mudaria', 'Mudar uma população afeta as outras da cadeia.')] },
      scene: { flag: 'q_L1-Q5', text: 'O painel de equilíbrio do mirante fica verde.' }
    },
    {
      id: 'L1-Q6', region: 'r1', map: 'r1', entity: 'aurora', where: 'Ateliê da Pesquisadora Aurora', concept: 'biodiversidade', level: 'guardiao',
      title: 'Desenho científico',
      prompt: 'Por que cientistas não usam somente fotografias e também fazem desenhos dos seres vivos?',
      prep: {
        concept: 'Cientistas **observam** e **registram** os seres vivos. O desenho científico permite **selecionar e destacar** detalhes importantes.',
        example: 'A pesquisadora Aurora fotografou uma capivara e também a desenhou, destacando patas e dentes, com nomes ao lado.',
        steps: ['O que a foto mostra?', 'O que o desenho permite destacar?', 'Lembre: foto e desenho podem se complementar.']
      },
      main: {
        type: 'open', placeholder: 'Porque o desenho permite…',
        groups: [
          { label: 'Observar com atenção', kw: ['observ', 'olhar', 'atenc', 'estudar', 'examinar'] },
          { label: 'Selecionar e destacar detalhes importantes', kw: ['detalhe', 'destac', 'selecion', 'important', 'partes', 'mostrar melhor', 'clareza', 'claro', 'estrutur', 'ressalt', 'escolher'] },
          { label: 'Registrar informações', kw: ['registr', 'anot', 'legenda', 'guardar', 'document', 'nome das partes'] },
          { label: 'Foto e desenho se complementam', kw: ['complement', 'junt', 'os dois', 'ambos', 'tambem ajuda', 'as duas'] }
        ],
        min: 2, wrongIdeas: ['A fotografia não serve para a ciência', 'Desenhar é só para enfeitar']
      },
      answer: 'O desenho científico permite observar, selecionar, destacar e registrar detalhes importantes; pode mostrar estruturas com clareza. Foto e desenho se complementam.',
      model: 'Porque o desenho permite observar, selecionar e destacar os detalhes importantes e registrar as estruturas com clareza. A foto também é útil: as duas formas se complementam.',
      why: 'O desenho científico permite **observar**, **selecionar**, **destacar** e **registrar** detalhes importantes, mostrando estruturas com clareza. A fotografia também serve: **as duas formas se complementam**.',
      err: 'Dizer que a fotografia não serve. Ela serve — e o desenho a complementa.',
      recap: 'No desenho, a cientista **escolhe o que mostrar**: pode **destacar** as patas, os dentes e escrever os nomes das partes.',
      hint1: 'O que a Aurora destacou no desenho da capivara?',
      hint2: 'Use palavras como: observar, destacar, detalhes, registrar.',
      guided: { type: 'mc', prompt: 'Complete: o desenho científico ajuda o cientista a…', options: [ok('Selecionar, destacar e registrar detalhes importantes'), no('Substituir a observação da natureza', 'O desenho depende da observação.'), no('Apenas enfeitar o caderno', 'O desenho científico tem função: registrar detalhes.')] },
      review: { type: 'mc', prompt: 'A pesquisadora fotografou uma flor e também a desenhou. Por que isso é útil?', options: [ok('O desenho destaca detalhes importantes; a foto e o desenho se complementam'), no('Porque a foto não serve para nada', 'A fotografia serve! As duas formas se complementam.'), no('Porque desenhar é mais rápido que fotografar', 'O motivo é destacar e registrar detalhes.')] },
      scene: { flag: 'q_L1-Q6', text: 'O cavalete da Aurora mostra o desenho científico da capivara.' }
    },

    /* =========================== REGIÃO 2 =========================== */
    {
      id: 'L2-Q1', region: 'r2', map: 'r2', entity: 'broto', where: 'Horta do Professor Broto', concept: 'produtores', level: 'explorador',
      title: 'Produtor ou consumidor?',
      prompt: 'Classifique bromélias, lagarto, jacarandá, algas, peixes e seres humanos em produtores ou consumidores.',
      prep: {
        concept: '**Produtores** fabricam seu alimento (plantas na terra, **algas** na água). **Consumidores** alimentam-se de outros seres vivos.',
        example: 'O capim da horta faz fotossíntese: é produtor. A capivara come capim: é consumidora.',
        steps: ['Ele fabrica o próprio alimento?', 'Ou precisa comer outros seres vivos?', 'Cuidado com as algas: vivem na água, mas…']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'p', label: 'Produtores', icon: '🌱' }, { id: 'c', label: 'Consumidores', icon: '🍽️' }],
        cards: [
          { t: 'Bromélias', icon: '🪴', bin: 'p', fb: 'Bromélias são plantas: fabricam seu alimento.' },
          { t: 'Lagarto', icon: '🦎', bin: 'c', fb: 'O lagarto come outros seres vivos.' },
          { t: 'Jacarandá', icon: '🌳', bin: 'p', fb: 'O jacarandá é uma árvore: faz fotossíntese.' },
          { t: 'Algas', icon: '🟢', bin: 'p', fb: 'Algas são importantes produtores aquáticos.' },
          { t: 'Peixes', icon: '🐟', bin: 'c', fb: 'Peixes se alimentam de outros seres vivos.' },
          { t: 'Seres humanos', icon: '🧒', bin: 'c', fb: 'Nós nos alimentamos de outros seres vivos: somos consumidores.' }
        ]
      },
      answer: 'Produtores: bromélias, jacarandá e algas. Consumidores: lagarto, peixes e seres humanos.',
      why: '**Bromélias**, **jacarandá** e **algas** fabricam seu alimento: são **produtores**. **Lagarto**, **peixes** e **seres humanos** comem outros seres vivos: são **consumidores**.',
      err: 'Colocar as algas com os consumidores porque vivem na água junto com os peixes.',
      recap: 'Produtor **fabrica** o alimento (plantas, algas). Consumidor **come** outros seres.',
      hint1: 'Plantas e algas fazem fotossíntese.',
      hint2: 'Animais — inclusive nós — são consumidores.',
      review: { type: 'classify', prompt: 'Classifique: capim, coruja, milho, coelho, cenoura e capivara.', bins: [{ id: 'p', label: 'Produtores', icon: '🌱' }, { id: 'c', label: 'Consumidores', icon: '🍽️' }], cards: [{ t: 'Capim', icon: '🌾', bin: 'p' }, { t: 'Coruja', icon: '🦉', bin: 'c' }, { t: 'Milho', icon: '🌽', bin: 'p' }, { t: 'Coelho', icon: '🐇', bin: 'c' }, { t: 'Cenoura', icon: '🥕', bin: 'p' }, { t: 'Capivara', icon: '#capivara', bin: 'c' }] },
      scene: { flag: 'q_L2-Q1', text: 'Plaquinhas “produtor” e “consumidor” brotam na horta.' }
    },
    {
      id: 'L2-Q2', region: 'r2', map: 'r2', entity: 'painel_setas', where: 'Painel das Setas (Vale)', concept: 'niveis', level: 'construtor',
      title: 'Contar níveis tróficos',
      prompt: 'Quantos níveis tróficos há nas cadeias milho → rato → coruja e capim → gafanhoto → sapo → serpente → gavião?',
      prep: {
        concept: 'Cada **posição** de uma cadeia é um **nível trófico**.',
        example: 'capim → capivara → onça tem **3** níveis: capim (1), capivara (2), onça (3).',
        steps: ['Toque em cada ser vivo da cadeia.', 'Conte os seres, não as setas.', 'O número de seres = número de níveis.']
      },
      main: {
        type: 'numbers', min: 1, max: 8,
        rows: [{ t: 'milho → rato → coruja', icon: '🌽🐁🦉', answer: 3 }, { t: 'capim → gafanhoto → sapo → serpente → gavião', icon: '🌾🦗🐸🐍🦅', answer: 5 }]
      },
      answer: '3 e 5 níveis, respectivamente.',
      why: 'Cada ser vivo ocupa um nível. **milho, rato, coruja = 3 níveis**. **capim, gafanhoto, sapo, serpente, gavião = 5 níveis**.',
      err: 'Contar as setas (2 e 4) em vez dos seres vivos.',
      recap: 'Conte os **seres vivos**: cada um é um nível trófico.',
      hint1: 'Conte os seres vivos, não as setas.',
      hint2: 'Aponte com o dedo: 1, 2, 3…',
      review: { type: 'numbers', prompt: 'Quantos níveis tróficos há em cada cadeia?', min: 1, max: 8, rows: [{ t: 'cenoura → coelho → raposa', icon: '🥕🐇🦊', answer: 3 }, { t: 'coquinhos → cutia → jararaca → harpia', icon: '🥥🐿️🐍🦅', answer: 4 }] },
      scene: { flag: 'q_L2-Q2', text: 'Degraus numerados aparecem no Painel das Setas.' }
    },
    {
      id: 'L2-Q3', region: 'r2', map: 'r2', entity: 'painel_setas', where: 'Painel das Setas (Vale)', concept: 'consumidores', level: 'explorador',
      title: 'Cenoura, coelho e raposa',
      prompt: 'Em cenoura → coelho → raposa, identifique produtor, consumidor primário e consumidor secundário.',
      prep: {
        concept: 'O **produtor** fabrica o alimento. O **consumidor primário** come o produtor. O **consumidor secundário** come o primário.',
        example: 'capim → capivara → onça: capim = produtor; capivara = primária (herbívora); onça = secundária (carnívora).',
        steps: ['Quem fabrica o alimento?', 'Quem come o produtor?', 'Quem come o consumidor primário?']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'p', label: 'Produtor', icon: '🌱' }, { id: 'c1', label: 'Consumidor primário', icon: '1️⃣' }, { id: 'c2', label: 'Consumidor secundário', icon: '2️⃣' }],
        cards: [{ t: 'Cenoura', icon: '🥕', bin: 'p', fb: 'A cenoura é planta: produtora.' }, { t: 'Coelho', icon: '🐇', bin: 'c1', fb: 'O coelho come a cenoura (o produtor).' }, { t: 'Raposa', icon: '🦊', bin: 'c2', fb: 'A raposa come o coelho (consumidor primário).' }]
      },
      answer: 'Cenoura = produtor; coelho = consumidor primário; raposa = consumidor secundário.',
      why: 'A **cenoura** fabrica seu alimento: **produtora**. O **coelho** come a cenoura: **consumidor primário**. A **raposa** come o coelho: **consumidora secundária**. A seta vai da cenoura para o coelho porque o coelho come a cenoura.',
      err: 'Chamar a raposa de “primária” por ser a mais forte.',
      recap: 'Primário = come o **produtor**. Secundário = come o **primário**.',
      hint1: 'Pergunte: quem come quem?',
      hint2: 'O coelho come a cenoura. Quem come o coelho?',
      review: { type: 'classify', prompt: 'Em capim → capivara → onça, classifique cada ser vivo.', bins: [{ id: 'p', label: 'Produtor', icon: '🌱' }, { id: 'c1', label: 'Consumidor primário', icon: '1️⃣' }, { id: 'c2', label: 'Consumidor secundário', icon: '2️⃣' }], cards: [{ t: 'Onça', icon: '🐆', bin: 'c2' }, { t: 'Capim', icon: '🌾', bin: 'p' }, { t: 'Capivara', icon: '#capivara', bin: 'c1' }] },
      scene: { flag: 'q_L2-Q3', text: 'As setas do Painel ficam douradas.' }
    },
    {
      id: 'L2-Q4', region: 'r2', map: 'r2', entity: 'maru', where: 'Sítio da Agricultora Maru — paisagem rural', concept: 'cadeia', level: 'guardiao',
      title: 'Cadeias da paisagem rural',
      prompt: 'Observe a paisagem rural e monte DUAS cadeias alimentares possíveis, tocando nos seres em ordem (do alimento para quem come).',
      prep: {
        concept: 'Toda cadeia começa por um **produtor**, e cada seta vai do **alimento para quem come**.',
        example: 'Na paisagem da Maru há capim, planta aquática, gafanhoto, rã, serpente, gavião, coelho, raposa, peixe e ave pescadora.',
        steps: ['Comece por uma planta.', 'Escolha quem come essa planta.', 'Continue: quem come esse animal?']
      },
      main: {
        type: 'chainbuild', need: 2, minLen: 3,
        organisms: [
          { id: 'capim', t: 'Capim', icon: '🌾', producer: true }, { id: 'aquatica', t: 'Planta aquática', icon: '🌿', producer: true },
          { id: 'gafanhoto', t: 'Gafanhoto', icon: '🦗' }, { id: 'ra', t: 'Rã', icon: '🐸' }, { id: 'serpente', t: 'Serpente', icon: '🐍' },
          { id: 'gaviao', t: 'Gavião', icon: '🦅' }, { id: 'coelho', t: 'Coelho', icon: '🐇' }, { id: 'raposa', t: 'Raposa', icon: '🦊' },
          { id: 'peixe', t: 'Peixe', icon: '🐟' }, { id: 'pescadora', t: 'Ave pescadora', icon: '🐦' }
        ],
        eats: [['capim', 'gafanhoto'], ['capim', 'coelho'], ['gafanhoto', 'ra'], ['ra', 'serpente'], ['ra', 'gaviao'], ['serpente', 'gaviao'], ['coelho', 'raposa'], ['coelho', 'gaviao'], ['aquatica', 'peixe'], ['peixe', 'pescadora']]
      },
      answer: 'Exemplos: capim → gafanhoto → rã → serpente (ou gavião); capim → coelho → raposa (ou gavião); planta aquática → peixe → ave pescadora.',
      why: 'Cadeias corretas começam num **produtor** e seguem “quem come quem”. Exemplos da paisagem: **capim → gafanhoto → rã → serpente → gavião**; **capim → coelho → raposa**; **planta aquática → peixe → ave pescadora**.',
      err: 'Ligar dois animais que não se alimentam um do outro, ou começar a cadeia por um animal.',
      recap: 'Primeiro um **produtor**. Depois, **quem come** esse ser. E assim por diante.',
      hint1: 'Comece por uma planta: capim ou planta aquática.',
      hint2: 'Tente: capim → coelho → … (quem come o coelho?)',
      review: { type: 'chainbuild', prompt: 'Monte UMA cadeia com estes seres.', need: 1, minLen: 3, organisms: [{ id: 'milho', t: 'Milho', icon: '🌽', producer: true }, { id: 'rato', t: 'Rato', icon: '🐁' }, { id: 'coruja', t: 'Coruja', icon: '🦉' }, { id: 'cenoura', t: 'Cenoura', icon: '🥕', producer: true }, { id: 'coelho', t: 'Coelho', icon: '🐇' }, { id: 'raposa', t: 'Raposa', icon: '🦊' }], eats: [['milho', 'rato'], ['rato', 'coruja'], ['cenoura', 'coelho'], ['coelho', 'raposa']] },
      scene: { flag: 'q_L2-Q4', text: 'Na paisagem da Maru, os animais aparecem nos lugares certos.' }
    },
    {
      id: 'L2-Q5', region: 'r2', map: 'r2', entity: 'quadro_floresta', where: 'Clareira da Floresta — Quadro da Floresta', concept: 'decompositores', level: 'construtor',
      title: 'Quem é quem na floresta',
      prompt: 'Na cena da floresta, identifique produtores, consumidores primários, outros consumidores e decompositores.',
      prep: {
        concept: '**Produtores** = plantas. **Consumidores primários** = herbívoros que comem plantas. **Outros consumidores** = carnívoros. **Decompositores** = fungos e bactérias.',
        example: 'Na clareira: árvores, capim, cutia, gafanhoto, jararaca, harpia, cogumelos no tronco e bactérias no solo.',
        steps: ['É planta? Produtor.', 'Come plantas? Primário.', 'Come animais? Outro consumidor. Decompõe restos? Decompositor.']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'p', label: 'Produtores', icon: '🌱' }, { id: 'c1', label: 'Consumidores primários', icon: '🐿️' }, { id: 'c2', label: 'Outros consumidores', icon: '🦅' }, { id: 'd', label: 'Decompositores', icon: '🍄' }],
        cards: [
          { t: 'Árvores', icon: '🌳', bin: 'p' }, { t: 'Capim', icon: '🌾', bin: 'p' },
          { t: 'Cutia (come coquinhos)', icon: '#cutia', bin: 'c1', fb: 'A cutia come coquinhos (produtor): é consumidora primária.' },
          { t: 'Gafanhoto', icon: '🦗', bin: 'c1', fb: 'O gafanhoto come plantas.' },
          { t: 'Jararaca', icon: '🐍', bin: 'c2', fb: 'A jararaca come animais, como a cutia.' },
          { t: 'Harpia', icon: '🦅', bin: 'c2', fb: 'A harpia come outros animais.' },
          { t: 'Cogumelos', icon: '🍄', bin: 'd', fb: 'Cogumelos são fungos: decompositores, não plantas.' },
          { t: 'Bactérias do solo', icon: '🦠', bin: 'd', fb: 'Bactérias decompõem restos.' }
        ]
      },
      answer: 'Produtores = plantas; consumidores primários = herbívoros; outros consumidores = carnívoros/onívoros; decompositores = fungos e bactérias.',
      why: '**Árvores e capim** são produtores. **Cutia e gafanhoto** comem plantas: consumidores primários. **Jararaca e harpia** comem animais: outros consumidores. **Cogumelos (fungos) e bactérias** são decompositores.',
      err: 'Colocar os cogumelos com os produtores porque crescem no chão como plantas. Eles são fungos: decompositores.',
      recap: 'Decompositores = **fungos e bactérias**. Consumidor primário = **come planta**.',
      hint1: 'Pergunte a cada ser: o que você come?',
      hint2: 'Cogumelo é planta? Não: é fungo!',
      review: { type: 'classify', prompt: 'Classifique os seres do Vale.', bins: [{ id: 'p', label: 'Produtores', icon: '🌱' }, { id: 'c1', label: 'Consumidores primários', icon: '🐇' }, { id: 'c2', label: 'Outros consumidores', icon: '🦊' }, { id: 'd', label: 'Decompositores', icon: '🍄' }], cards: [{ t: 'Cenoura', icon: '🥕', bin: 'p' }, { t: 'Coelho', icon: '🐇', bin: 'c1' }, { t: 'Raposa', icon: '🦊', bin: 'c2' }, { t: 'Fungos', icon: '🍄', bin: 'd' }, { t: 'Capivara', icon: '#capivara', bin: 'c1' }, { t: 'Bactérias', icon: '🦠', bin: 'd' }] },
      scene: { flag: 'q_L2-Q5', text: 'A legenda da clareira aparece e os cogumelos do tronco brilham.' }
    },
    {
      id: 'L2-Q6', region: 'r2', map: 'r2', entity: 'ponte', where: 'Ponte das Setas Invertidas', concept: 'seta', level: 'construtor',
      title: 'Desbloquear a ponte',
      prompt: 'A Névoa inverteu as setas da ponte! Ordene os seres para montar a cadeia: harpia, cutia, jararaca e coquinhos.',
      prep: {
        concept: 'A cadeia começa pelo **produtor** e cada seta aponta para **quem come**.',
        example: 'A **cutia** come **coquinhos**; a **jararaca** pode comer a cutia; a **harpia** pode comer a jararaca.',
        steps: ['Quem é o produtor?', 'Quem come o produtor?', 'Siga até o último consumidor.']
      },
      main: { type: 'order', layout: 'chain', items: [{ t: 'Coquinhos', icon: '🥥' }, { t: 'Cutia', icon: '#cutia' }, { t: 'Jararaca', icon: '🐍' }, { t: 'Harpia', icon: '🦅' }] },
      answer: 'coquinhos → cutia → jararaca → harpia.',
      why: '**Coquinhos** são o produtor e começam a cadeia. A **cutia** come coquinhos, a **jararaca** come a cutia e a **harpia** come a jararaca: **coquinhos → cutia → jararaca → harpia**.',
      err: 'Começar pela harpia por ser o maior animal — foi assim que a Névoa inverteu as setas.',
      recap: 'A seta **não** mostra quem é maior. Ela **sai do alimento** e **aponta para quem o come**.',
      hint1: 'Qual deles fabrica o próprio alimento?',
      hint2: 'Os coquinhos vêm primeiro. Quem come coquinhos?',
      review: { type: 'order', layout: 'chain', prompt: 'Monte a cadeia na ordem certa.', items: [{ t: 'Capim', icon: '🌾' }, { t: 'Gafanhoto', icon: '🦗' }, { t: 'Sapo', icon: '🐸' }, { t: 'Serpente', icon: '🐍' }, { t: 'Gavião', icon: '🦅' }] },
      scene: { flag: 'q_L2-Q6', text: 'As setas da ponte se desviram e a passagem para a floresta se abre.' }
    },
    {
      id: 'L2-Q7', region: 'r2', map: 'r2', entity: 'ina', where: 'Lago do Vale — Pescadora Iná e o Painel da Teia', concept: 'teia', level: 'guardiao',
      title: 'Mais camundongos',
      prompt: 'Na teia alimentar: o que aconteceria se a população de camundongos crescesse? Marque o que pode acontecer.',
      prep: {
        concept: 'Numa **teia alimentar**, mudanças em uma população afetam outras: **mais predadores podem diminuir as presas**; **mais presas significam mais alimento** para os predadores.',
        example: 'Camundongos comem plantas e sementes; serpentes e gaviões comem camundongos.',
        steps: ['Siga as setas que CHEGAM ao camundongo: o que ele come?', 'Siga as setas que SAEM dele: quem o come?', 'Pense no que muda para cada um.']
      },
      pre: {
        type: 'sim', prompt: 'Use o botão **+** para aumentar os camundongos e observe a teia.', need: 'up',
        pops: [{ id: 'plantas', t: 'Plantas e sementes', icon: '🌿', v: 60 }, { id: 'camu', t: 'Camundongos', icon: '🐁', v: 40 }, { id: 'serp', t: 'Serpentes', icon: '🐍', v: 35 }, { id: 'gav', t: 'Gaviões', icon: '🦅', v: 30 }],
        control: 'camu', links: [{ id: 'plantas', k: -0.7 }, { id: 'serp', k: 0.5 }, { id: 'gav', k: 0.4 }],
        notes: { up: 'Mais camundongos comem mais plantas e sementes. Serpentes e gaviões ganham mais alimento.', down: 'Menos camundongos: sobra mais planta; predadores com menos alimento.' }
      },
      main: {
        type: 'multi', minCorrect: 1,
        options: [
          ok('Consumiriam mais plantas e sementes, que poderiam diminuir'),
          ok('Haveria mais alimento para serpentes e gaviões, que poderiam aumentar'),
          no('As plantas aumentariam', 'Os camundongos comem plantas e sementes: mais camundongos = mais consumo.'),
          no('As serpentes diminuiriam', 'Serpentes comem camundongos: teriam mais alimento.')
        ]
      },
      answer: 'Consumiriam mais do alimento que utilizam, podendo reduzir plantas/sementes; haveria mais alimento para seus predadores, que poderiam aumentar.',
      model: 'Os camundongos comeriam mais plantas e sementes, que poderiam diminuir, e as serpentes e os gaviões teriam mais alimento e poderiam aumentar.',
      why: 'Mais camundongos **consomem mais plantas e sementes**, que podem **diminuir**. Eles também são **alimento de serpentes e gaviões**, que teriam mais comida e poderiam **aumentar**.',
      err: 'Olhar só para um lado da teia e esquecer das plantas ou dos predadores.',
      recap: 'Setas que **chegam** ao camundongo = o que ele come. Setas que **saem** dele = quem o come.',
      hint1: 'O que o camundongo come? Quem come o camundongo?',
      hint2: 'Mais camundongos → mais comida sendo comida… e mais comida para os predadores.',
      review: { type: 'mc', prompt: 'Na teia, se as serpentes aumentassem muito, o que poderia acontecer com os camundongos?', options: [ok('Poderiam diminuir, porque haveria mais predadores'), no('Aumentariam', 'Mais predadores costumam diminuir as presas.'), no('Nada mudaria', 'Numa teia, mudar uma população afeta outras.')] },
      scene: { flag: 'q_L2-Q7', text: 'O Painel da Teia acende as setas dos camundongos.' }
    },
    {
      id: 'L2-Q8', region: 'r2', map: 'r2', entity: 'ina', where: 'Lago do Vale — Painel da Teia', concept: 'decompositores', level: 'construtor',
      title: 'Todas as setas para os fungos',
      prompt: 'Por que as setas de todos os níveis tróficos são direcionadas para os fungos?',
      prep: {
        concept: '**Decompositores** (fungos e bactérias) decompõem matéria orgânica de **qualquer nível** e devolvem nutrientes ao solo.',
        example: 'No tronco caído do Vale, cogumelos decompõem a madeira. Restos de gafanhoto ou de gavião também são decompostos.',
        steps: ['Que tipo de ser é o fungo?', 'O que ele faz com restos e organismos mortos?', 'De quais níveis podem vir esses restos?']
      },
      main: {
        type: 'mc',
        options: [
          ok('Porque os fungos são decompositores e decompõem restos e organismos mortos de qualquer nível trófico'),
          no('Porque os fungos são os maiores predadores da teia', 'Fungos não caçam: eles decompõem restos.'),
          no('Porque os fungos são produtores', 'Fungos não fazem fotossíntese; são decompositores.'),
          no('Porque os fungos comem apenas as plantas', 'Se fosse assim, só a seta das plantas iria para os fungos.')
        ]
      },
      answer: 'Fungos são decompositores e podem decompor restos e organismos mortos de qualquer nível trófico.',
      why: 'Os **fungos são decompositores**: decompõem **restos e organismos mortos de qualquer nível trófico** — plantas, herbívoros e carnívoros — e devolvem matéria e nutrientes ao solo.',
      err: 'Achar que o fungo é um predador ou uma planta.',
      recap: 'Decompositores agem em **todos os níveis**: planta, gafanhoto, serpente, gavião…',
      hint1: 'Fungos são produtores, consumidores ou decompositores?',
      hint2: 'Restos de QUALQUER ser vivo podem ser decompostos.',
      review: { type: 'mc', prompt: 'Um gavião morreu na floresta. Quem decompõe seus restos?', options: [ok('Fungos e bactérias (decompositores)'), no('O capim', 'O capim é produtor.'), no('O gafanhoto', 'O gafanhoto é consumidor primário.')] },
      scene: { flag: 'q_L2-Q8', text: 'Os cogumelos da teia brilham e o solo do Vale fica mais escuro e fértil.' }
    },
    {
      id: 'L2-Q9', region: 'r2', map: 'r2', entity: 'ina', where: 'Lago do Vale — Painel da Teia', concept: 'teia', level: 'guardiao',
      title: 'Menos gafanhotos',
      prompt: 'O que aconteceria com a população de serpentes se o número de gafanhotos diminuísse?',
      prep: {
        concept: 'Um ser pode depender de outro **diretamente** (come) ou **indiretamente** (pelo caminho das setas).',
        example: 'Na teia do jogo: gafanhotos → aves pequenas → serpentes.',
        steps: ['Siga as setas a partir dos gafanhotos.', 'Chegue até as serpentes.', 'Se o começo do caminho diminui, o que acontece no fim?']
      },
      pre: { type: 'trace', prompt: 'Siga as setas: toque nos seres do caminho dos **gafanhotos** até as **serpentes**.', nodes: TEIA.nodes, edges: TEIA.edges, path: ['gafanhotos', 'aves', 'serpentes'] },
      main: {
        type: 'mc',
        options: [
          ok('Tenderia a diminuir, porque haveria menos alimento pelo caminho das setas (as aves que comem gafanhotos diminuiriam)'),
          no('Aumentaria, pois as serpentes não comem gafanhotos', 'Mesmo sem comer gafanhotos diretamente, as serpentes dependem deles pelo caminho das setas.'),
          no('Não mudaria nada', 'Numa teia, mudar uma população afeta outras.')
        ]
      },
      answer: 'Tenderia a diminuir por haver menos alimento de forma direta ou indireta na teia apresentada.',
      why: 'Na teia, **gafanhotos → aves pequenas → serpentes**. Com menos gafanhotos, as aves têm menos alimento e diminuem; então as **serpentes também têm menos alimento** e tendem a **diminuir** — um efeito **indireto**.',
      err: 'Pensar que, como a serpente não come gafanhoto, nada muda para ela.',
      recap: 'Siga o **caminho das setas**: um ser pode depender de outro indiretamente.',
      hint1: 'Quem come os gafanhotos? E quem come esse ser?',
      hint2: 'gafanhotos → aves → serpentes. Se o começo diminui…',
      review: { type: 'mc', prompt: 'Na mesma teia, se as plantas diminuíssem muito, o que aconteceria com o gavião?', options: [ok('Tenderia a diminuir, pois faltaria alimento pelo caminho das setas'), no('Aumentaria', 'Menos alimento na base afeta toda a teia.'), no('Nada mudaria, pois o gavião não come plantas', 'Ele depende das plantas indiretamente.')] },
      scene: { flag: 'q_L2-Q9', text: 'A teia inteira acende e o Lago do Vale fica cheio de vida.' }
    },

    /* =========================== REGIÃO 3 =========================== */
    {
      id: 'L3-Q1', region: 'r3', map: 'r3', entity: 'cicla', where: 'Sala do Carbono — Dra. Cicla', concept: 'carbono', level: 'explorador',
      title: 'Onde há carbono?',
      prompt: 'Marque quais têm carbono: animal, óleo derivado de petróleo, atmosfera e plantas.',
      prep: {
        concept: 'Corpos de **plantas e animais** contêm carbono. **Petróleo** e **carvão mineral** também. Na **atmosfera**, o carbono aparece principalmente no **gás carbônico**.',
        example: 'Nos frascos da Dra. Cicla: uma folha, uma pena, uma gota de óleo e um balão de gás carbônico.',
        steps: ['Seres vivos têm carbono?', 'O petróleo se originou de quê?', 'E o ar: qual gás tem carbono?']
      },
      main: {
        type: 'multi',
        options: [
          ok('Animal', null, { icon: '🐄', miss: 'O corpo dos animais contém carbono.' }),
          ok('Óleo derivado de petróleo', null, { icon: '🛢️', miss: 'O petróleo se originou de seres vivos de milhões de anos e contém carbono.' }),
          ok('Atmosfera', null, { icon: '🌫️', miss: 'Na atmosfera, o carbono aparece principalmente no gás carbônico.' }),
          ok('Plantas', null, { icon: '🌱', miss: 'O corpo das plantas contém carbono.' })
        ]
      },
      answer: 'Todos os quatro têm carbono. Na atmosfera, principalmente no gás carbônico.',
      why: '**Todos os quatro têm carbono!** Animais e plantas têm carbono no corpo. O óleo vem do **petróleo**, que se originou de seres vivos de milhões de anos. Na **atmosfera**, o carbono está principalmente no **gás carbônico**.',
      err: 'Esquecer a atmosfera, porque não dá para ver o gás carbônico.',
      recap: 'Carbono está em **seres vivos**, no **petróleo e carvão** e no **gás carbônico** do ar.',
      hint1: 'Mais de um tem carbono… talvez todos!',
      hint2: 'Pense no gás carbônico: ele está na atmosfera.',
      review: { type: 'multi', prompt: 'Quais destes contêm carbono?', options: [ok('Carvão mineral', null, { icon: '⚫' }), ok('Onça-pintada', null, { icon: '🐆' }), ok('Capim', null, { icon: '🌾' }), ok('Gás carbônico do ar', null, { icon: '🌫️' })] },
      scene: { flag: 'q_L3-Q1', text: 'Os frascos da Sala do Carbono acendem.' }
    },
    {
      id: 'L3-Q2', region: 'r3', map: 'r3', entity: 'medidor', where: 'Medidor de Pegada Ecológica', concept: 'pegada', level: 'construtor',
      title: 'Para que serve a pegada?',
      prompt: 'Por que o conceito de pegada ecológica é importante?',
      prep: {
        concept: '**Pegada ecológica** = área produtiva de **terra e mar** necessária para sustentar o consumo de uma pessoa ou sociedade e absorver impactos. Medida em **hectare global (gha)**.',
        example: 'O Medidor mostra que desperdiçar comida e energia aumenta a pegada.',
        steps: ['O que a pegada mede?', 'Para que serve medir isso?', 'Que escolhas ela ajuda a fazer?']
      },
      main: {
        type: 'mc',
        options: [
          ok('Porque ajuda a medir e entender o impacto do consumo humano e quanto de recursos e áreas produtivas é preciso para sustentá-lo, apoiando escolhas mais responsáveis'),
          no('Porque mede o tamanho do pé das pessoas', 'A pegada ecológica não é a marca do pé: é uma medida de impacto do consumo.'),
          no('Porque mostra quantos animais existem em um bioma', 'Ela mede a área produtiva necessária para o consumo, não o número de animais.'),
          no('Porque serve apenas para calcular preços de alimentos', 'Ela é sobre recursos e impacto ambiental, não preços.')
        ]
      },
      answer: 'Ajuda a medir/entender o impacto do consumo humano e quanto de recursos/áreas produtivas é necessário para sustentá-lo, apoiando escolhas mais responsáveis.',
      why: 'A pegada ecológica **mede o impacto do consumo**: quanta **área produtiva de terra e mar** é preciso para sustentar o que usamos. Conhecendo esse impacto, podemos fazer **escolhas mais responsáveis**.',
      err: 'Confundir com a pegada do pé.',
      recap: 'Pegada ecológica = **quanto de natureza** o nosso consumo precisa.',
      hint1: 'Pense em “medir o impacto do consumo”.',
      hint2: 'Ela ajuda a fazer escolhas mais responsáveis.',
      review: { type: 'mc', prompt: 'Uma escola calculou sua pegada ecológica. Para que isso serve?', options: [ok('Para entender o impacto do seu consumo e fazer escolhas mais responsáveis'), no('Para saber o número do sapato dos alunos', 'Não é a pegada do pé!'), no('Para contar as árvores do pátio', 'Ela mede a área necessária para o consumo.')] },
      scene: { flag: 'q_L3-Q2', text: 'O Medidor de Pegada acende a tela.' }
    },
    {
      id: 'L3-Q3', region: 'r3', map: 'r3', entity: 'medidor', where: 'Medidor de Pegada Ecológica', concept: 'pegada', level: 'guardiao',
      title: 'Minha pegada menor',
      prompt: 'O que você poderia fazer para reduzir sua pegada ecológica? Escreva pelo menos uma ação.',
      prep: {
        concept: 'Reduzir **consumo e desperdício**, **reutilizar**, **reciclar**, **economizar água e energia** e escolher **deslocamentos menos poluentes** reduzem a pegada.',
        example: 'Apagar a luz ao sair da sala, fechar a torneira e ir de bicicleta quando possível.',
        steps: ['Pense no que você usa no dia a dia.', 'Onde há desperdício?', 'Escreva uma ação que você pode fazer.']
      },
      main: {
        type: 'open', placeholder: 'Eu posso…',
        groups: [
          { label: 'Reduzir consumo e desperdício', kw: ['desperdic', 'reduz', 'consumir menos', 'comprar menos', 'menos consumo', 'nao compr', 'economiz'] },
          { label: 'Reutilizar e reciclar', kw: ['reutiliz', 'recicl', 'reaproveit', 'separar o lixo', 'separar lixo', 'reusar'] },
          { label: 'Economizar água e energia', kw: ['agua', 'energia', 'luz', 'apagar', 'torneira', 'banho', 'desligar', 'eletric', 'lampada'] },
          { label: 'Cuidar dos alimentos', kw: ['aliment', 'comida', 'prato', 'sobra'] },
          { label: 'Transporte menos poluente', kw: ['bicicleta', 'bike', 'caminh', 'a pe', 'onibus', 'transporte', 'carona', 'andar'] }
        ],
        min: 1, wrongIdeas: ['Deixar a luz acesa o dia todo', 'Comprar coisas sem precisar']
      },
      answer: 'Reduzir desperdício e consumo, reutilizar/reciclar, economizar água e energia, cuidar dos alimentos, usar transporte coletivo/bicicleta/caminhada quando possível.',
      model: 'Eu posso evitar desperdício, reutilizar e reciclar, economizar água e energia, não deixar comida no prato e ir a pé ou de bicicleta quando possível.',
      why: 'Qualquer ação que **reduza consumo e desperdício**, **reutilize**, **recicle**, **economize água e energia** ou use **transporte menos poluente** ajuda a diminuir a pegada ecológica.',
      err: 'Escrever algo que aumenta o consumo, como comprar mais coisas.',
      recap: 'Ações que **economizam** e **evitam desperdício** reduzem a pegada.',
      hint1: 'Pense em água, energia, lixo, comida ou transporte.',
      hint2: 'Exemplo: “apagar a luz quando saio do quarto”.',
      guided: { type: 'multi', prompt: 'Marque ações que reduzem a pegada ecológica:', minCorrect: 1, options: [ok('Fechar a torneira ao escovar os dentes'), ok('Reutilizar e reciclar'), no('Deixar a TV ligada sem ninguém assistindo', 'Isso desperdiça energia.'), no('Jogar comida fora', 'Desperdício aumenta a pegada.')] },
      review: { type: 'multi', minCorrect: 2, prompt: 'Quais atitudes reduzem a pegada ecológica?', options: [ok('Ir a pé ou de bicicleta quando possível'), ok('Separar o lixo para reciclar'), ok('Apagar as luzes ao sair'), no('Tomar banhos muito demorados', 'Desperdiça água e energia.'), no('Comprar brinquedos sem precisar', 'Aumenta o consumo.')] },
      scene: { flag: 'q_L3-Q3', text: 'As lâmpadas desnecessárias do laboratório se apagam sozinhas.' }
    },
    {
      id: 'L3-Q4', region: 'r3', map: 'r3', entity: 'medidor', where: 'Medidor de Pegada Ecológica', concept: 'pegada', level: 'guardiao',
      title: 'Pegada grande, risco grande',
      prompt: 'Por que o aumento da pegada ecológica representa riscos aos seres vivos? Marque as explicações corretas.',
      prep: {
        concept: 'Uma pegada maior significa **mais recursos usados** e **mais impactos** na natureza.',
        example: 'Mais consumo pode trazer mais desmatamento, mais poluição e mais emissão de gases.',
        steps: ['O que aumenta quando a pegada cresce?', 'O que isso faz com os habitats?', 'E com os seres vivos?']
      },
      main: {
        type: 'multi', minCorrect: 2,
        options: [
          ok('Aumenta o uso de recursos da natureza'), ok('Aumenta a poluição e a emissão de gases'),
          ok('Pode aumentar o desmatamento e a perda de habitats'), ok('Ameaça os seres vivos e o equilíbrio ambiental'),
          no('Faz as florestas crescerem mais rápido', 'Mais consumo tende a causar mais desmatamento.'), no('Diminui a quantidade de lixo', 'Mais consumo costuma gerar mais lixo e poluição.')
        ]
      },
      answer: 'Aumenta uso de recursos, poluição, emissão de gases, desmatamento e perda de habitats, ameaçando seres vivos e o equilíbrio ambiental.',
      why: 'Com a pegada maior, **usamos mais recursos**, **poluímos mais**, **emitimos mais gases** e pode haver **mais desmatamento e perda de habitats**. Isso **ameaça os seres vivos** e o **equilíbrio ambiental**.',
      err: 'Pensar que consumir mais não tem efeito na natureza.',
      recap: 'Pegada maior = **mais recursos + mais poluição + mais gases + menos habitats**.',
      hint1: 'Mais consumo traz mais ou menos impactos?',
      hint2: 'Descarte as frases que parecem “boas notícias”.',
      review: { type: 'mc', prompt: 'Uma cidade aumentou muito sua pegada ecológica. O que pode acontecer?', options: [ok('Mais desmatamento, poluição e perda de habitats'), no('As florestas ficam maiores', 'Mais consumo tende a reduzir florestas.'), no('Nada muda para os animais', 'A perda de habitats ameaça os animais.')] },
      scene: { flag: 'q_L3-Q4', text: 'O ponteiro do Medidor volta para a zona verde.' }
    },
    {
      id: 'L3-Q5', region: 'r3', map: 'r3', entity: 'bip', where: 'Sala do Nitrogênio — Robô Bip', concept: 'nitrogenio', level: 'construtor',
      title: 'Fertilizante demais',
      prompt: 'Qual é o problema de usar fertilizantes em excesso? Por quê? Complete a explicação.',
      prep: {
        concept: 'Fertilizantes têm nutrientes como **nitrogênio** e **fósforo**. Em excesso, podem **contaminar rios e lagos** e causar desequilíbrio.',
        example: 'O saco de fertilizante do Bip está aberto demais; a chuva leva o excesso para a água.',
        steps: ['O que o fertilizante tem?', 'Para onde vai o excesso?', 'O que acontece na água?']
      },
      main: { type: 'fill', text: 'O excesso de fertilizantes leva {0} e fósforo para a {1}. Isso provoca a proliferação de {2} (eutrofização), {3} o oxigênio da água e prejudicando os animais aquáticos.', answers: ['nitrogênio', 'água', 'algas', 'reduzindo'], bank: ['areia', 'peixes', 'aumentando'] },
      answer: 'O excesso de nitrogênio e fósforo pode chegar à água, contaminá-la e provocar proliferação de algas/eutrofização, reduzindo oxigênio e prejudicando animais aquáticos.',
      why: 'O excesso de **nitrogênio e fósforo** pode chegar à **água** e contaminá-la, provocando **proliferação de algas** (eutrofização). Isso **reduz o oxigênio** e prejudica os animais aquáticos.',
      err: 'Achar que mais fertilizante é sempre melhor para as plantas.',
      recap: 'Excesso de nutrientes na água → **muitas algas** → **menos oxigênio** → animais aquáticos prejudicados.',
      hint1: 'Quais nutrientes estão no fertilizante?',
      hint2: 'Na água, o excesso faz as algas… e o oxigênio…',
      review: { type: 'mc', prompt: 'Um agricultor usou fertilizante demais e choveu. O que pode acontecer com o rio perto da plantação?', options: [ok('Receber excesso de nutrientes, ter muitas algas e perder oxigênio'), no('Ficar mais limpo', 'O excesso contamina a água.'), no('Nada, o fertilizante fica só na plantação', 'A chuva pode levar o excesso para rios e lagos.')] },
      scene: { flag: 'q_L3-Q5', text: 'Bip fecha o saco de fertilizante e mede só o necessário.' }
    },
    {
      id: 'L3-Q6', region: 'r3', map: 'r3', entity: 'bip', where: 'Sala do Nitrogênio — Robô Bip', concept: 'nitrogenio', level: 'explorador',
      title: 'Nitrogênio de plantas e animais',
      prompt: 'Como as plantas conseguem nitrogênio? E os animais? Leve cada frase para o lugar certo.',
      prep: {
        concept: '**Plantas** absorvem compostos de nitrogênio do **solo pelas raízes**. **Animais** obtêm nitrogênio pela **alimentação**.',
        example: 'A maior parte da atmosfera é gás nitrogênio, mas as plantas **não o absorvem diretamente do ar**.',
        steps: ['Por onde a planta retira coisas do solo?', 'Como o animal recebe matéria?', 'Alguma frase está errada?']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'pl', label: 'Plantas', icon: '🌱' }, { id: 'an', label: 'Animais', icon: '🐄' }, { id: 'x', label: 'Não é verdade', icon: '🚫' }],
        cards: [
          { t: 'Absorvem compostos de nitrogênio do solo pelas raízes', icon: '🌱', bin: 'pl' },
          { t: 'Obtêm nitrogênio pela alimentação', icon: '🍽️', bin: 'an' },
          { t: 'Recebem nitrogênio ao comer plantas ou outros animais', icon: '🐇', bin: 'an' },
          { t: 'Plantas absorvem o gás nitrogênio direto do ar', icon: '🌬️', bin: 'x', fb: 'As plantas não absorvem o gás nitrogênio diretamente do ar; bactérias fixadoras o transformam.' }
        ]
      },
      answer: 'Plantas absorvem compostos de nitrogênio do solo pelas raízes; animais obtêm nitrogênio pela alimentação.',
      why: '**Plantas** absorvem **compostos de nitrogênio do solo pelas raízes**. **Animais** obtêm nitrogênio pela **alimentação**, comendo plantas ou outros animais. As plantas **não** absorvem o gás nitrogênio direto do ar.',
      err: 'Achar que a planta “respira” o nitrogênio do ar.',
      recap: 'Planta → **raízes, do solo**. Animal → **alimentação**.',
      hint1: 'Plantas usam as raízes; animais usam a boca!',
      hint2: 'O ar tem muito nitrogênio, mas a planta não o pega sozinha.',
      review: { type: 'mc', prompt: 'A vaca come capim. De onde vem o nitrogênio do corpo dela?', options: [ok('Da alimentação: do capim que ela come'), no('Das raízes', 'Vacas não têm raízes!'), no('Do ar que ela respira', 'Animais obtêm nitrogênio pela alimentação.')] },
      scene: { flag: 'q_L3-Q6', text: 'As plantas da estufa perdem o amarelado e ficam verdes.' }
    },
    {
      id: 'L3-Q7', region: 'r3', map: 'r3', entity: 'maquina_gases', where: 'Sala do Oxigênio — Máquina dos Gases', concept: 'oxigenio', level: 'construtor',
      title: 'Religar as tubulações',
      prompt: 'Complete o esquema: ligue as tubulações. A seta que ENTRA num processo é o gás consumido; a seta que SAI é o gás liberado.',
      prep: {
        concept: '**Fotossíntese** consome gás carbônico e **libera gás oxigênio**. **Respiração** e **combustão** consomem gás oxigênio e **liberam gás carbônico**.',
        example: 'A planta da estufa faz fotossíntese; o coelho respira; a vela queima (combustão).',
        steps: ['Fotossíntese: qual gás entra, qual sai?', 'Respiração: qual entra, qual sai?', 'Combustão: parecida com a respiração.']
      },
      main: {
        type: 'arrows',
        nodes: [
          { id: 'co2', t: 'Gás carbônico', icon: '⚪', x: 12, y: 50 }, { id: 'o2', t: 'Gás oxigênio', icon: '🔵', x: 88, y: 50 },
          { id: 'foto', t: 'Fotossíntese', icon: '🌱', x: 50, y: 12 }, { id: 'resp', t: 'Respiração (seres vivos e decompositores)', icon: '🐇', x: 50, y: 52 }, { id: 'comb', t: 'Combustão', icon: '🔥', x: 50, y: 90 }
        ],
        edges: [['co2', 'foto'], ['foto', 'o2'], ['o2', 'resp'], ['resp', 'co2'], ['o2', 'comb'], ['comb', 'co2']]
      },
      answer: 'Fotossíntese consome gás carbônico e libera gás oxigênio; respiração (seres vivos/decompositores) consome gás oxigênio e libera gás carbônico; combustão consome gás oxigênio e libera gás carbônico.',
      why: '**Fotossíntese**: gás carbônico **entra**, gás oxigênio **sai**. **Respiração** (dos seres vivos e dos decompositores): gás oxigênio **entra**, gás carbônico **sai**. **Combustão**: gás oxigênio **entra**, gás carbônico **sai**.',
      err: 'Inverter a fotossíntese, achando que a planta libera gás carbônico nesse processo.',
      recap: 'Fotossíntese **usa** gás carbônico e **libera** oxigênio. Respiração e combustão fazem o **contrário**.',
      hint1: 'São 6 tubulações: cada processo tem uma entrada e uma saída.',
      hint2: 'Comece pela fotossíntese: gás carbônico → fotossíntese → gás oxigênio.',
      review: { type: 'mc', prompt: 'Numa queimada (combustão), o que acontece com os gases?', options: [ok('Consome gás oxigênio e libera gás carbônico'), no('Consome gás carbônico e libera gás oxigênio', 'Isso é a fotossíntese.'), no('Não usa nenhum gás', 'A combustão consome gás oxigênio.')] },
      scene: { flag: 'q_L3-Q7', text: 'A Máquina dos Gases liga e as tubulações coloridas brilham.' }
    },
    {
      id: 'L3-Q8', region: 'r3', map: 'r3', entity: 'composto', where: 'Composteira — Seu Composto', concept: 'compostagem', level: 'construtor',
      title: 'O caminho do nitrogênio na composteira',
      prompt: 'O que acontece com o nitrogênio dos restos vegetais colocados na composteira? Organize as etapas.',
      prep: {
        concept: 'A **compostagem** transforma restos orgânicos e gera **adubo** rico em nutrientes, incluindo **nitrogênio**.',
        example: 'Seu Composto coloca cascas e folhas na composteira; semanas depois, tira um adubo escuro.',
        steps: ['O que entra na composteira?', 'Quem transforma os restos?', 'Para onde vai o nitrogênio e quem o usa?']
      },
      main: { type: 'order', layout: 'list', items: [{ t: 'Restos vegetais são colocados na composteira', icon: '🍂' }, { t: 'Decompositores (fungos e bactérias) transformam os restos', icon: '🍄' }, { t: 'Os compostos de nitrogênio ficam no adubo e no solo', icon: '🟫' }, { t: 'As plantas absorvem esses compostos pelas raízes', icon: '🌱' }] },
      answer: 'Decompositores transformam os restos; compostos de nitrogênio ficam no adubo/solo e podem ser absorvidos pelas plantas.',
      why: 'Na composteira, **decompositores transformam os restos**. Os **compostos de nitrogênio ficam no adubo** e, colocados no solo, podem ser **absorvidos pelas plantas** pelas raízes.',
      err: 'Achar que o nitrogênio desaparece na composteira.',
      recap: 'Restos → **decompositores** → **adubo com nitrogênio** → **plantas**.',
      hint1: 'Quem trabalha dentro da composteira?',
      hint2: 'O último passo acontece nas raízes.',
      review: { type: 'mc', prompt: 'Seu Composto colocou o adubo da composteira na horta. O que as plantas ganham?', options: [ok('Compostos de nitrogênio e outros nutrientes, absorvidos pelas raízes'), no('Gás nitrogênio do ar', 'As plantas não absorvem gás nitrogênio diretamente.'), no('Nada, o adubo não tem nutrientes', 'O adubo é rico em nutrientes.')] },
      scene: { flag: 'q_L3-Q8', text: 'A composteira gera adubo e a estufa floresce.' }
    },
    {
      id: 'L3-Q9', region: 'r3', map: 'r3', entity: 'telao', where: 'Sala do Carbono — Telão do Clima', concept: 'estufa', level: 'guardiao',
      title: 'Por que a Terra está esquentando?',
      prompt: 'Explique por que atividades humanas têm provocado aquecimento global.',
      prep: {
        concept: 'Queimar **combustíveis fósseis** libera rapidamente carbono guardado há milhões de anos. Gás carbônico em **excesso intensifica o efeito estufa**.',
        example: 'No telão: carros, fábricas e queimadas soltando gás carbônico; florestas sendo derrubadas.',
        steps: ['Que atividades liberam muito gás carbônico?', 'O que o desmatamento muda?', 'O que o excesso de gás carbônico faz?']
      },
      main: {
        type: 'open', placeholder: 'Porque as pessoas…',
        groups: [
          { label: 'Queima de combustíveis fósseis (carros, fábricas)', kw: ['combust', 'fossil', 'fosseis', 'petrole', 'gasolina', 'carro', 'fabrica', 'carvao', 'queima de', 'queimar', 'poluic', 'fumaca'] },
          { label: 'Queimadas', kw: ['queimada', 'fogo', 'incendi'] },
          { label: 'Liberam muito gás carbônico', kw: ['gas carbonico', 'carbonico', 'co2', 'gases', 'gas '] },
          { label: 'Desmatamento reduz as plantas que retiram gás carbônico', kw: ['desmat', 'cortar arvore', 'corte de arvore', 'derrub', 'menos planta', 'menos arvore', 'cortam'] },
          { label: 'O excesso intensifica o efeito estufa e eleva a temperatura', kw: ['efeito estufa', 'estufa', 'temperatura', 'esquent', 'calor', 'aquec'] }
        ],
        min: 2, wrongIdeas: ['O efeito estufa natural é sempre ruim', 'As plantas liberam gás carbônico na fotossíntese']
      },
      answer: 'Queima de combustíveis fósseis, queimadas e outras ações liberam muito gás carbônico; o desmatamento reduz a retirada desse gás pelas plantas; o excesso intensifica o efeito estufa e eleva a temperatura média.',
      model: 'Porque a queima de combustíveis fósseis e as queimadas liberam muito gás carbônico, e o desmatamento diminui as plantas que retiram esse gás do ar. O excesso intensifica o efeito estufa e aumenta a temperatura média.',
      why: 'A **queima de combustíveis fósseis** e as **queimadas** liberam **muito gás carbônico**. O **desmatamento** diminui as plantas que retiram esse gás na fotossíntese. O **excesso** intensifica o **efeito estufa** e **eleva a temperatura média**.',
      err: 'Dizer que o efeito estufa em si é o problema. O natural é importante; o problema é o excesso.',
      recap: 'Mais **gás carbônico** (combustíveis, queimadas) + menos **plantas** (desmatamento) = **efeito estufa intensificado**.',
      hint1: 'Pense em carros, fábricas e queimadas.',
      hint2: 'Use: gás carbônico, efeito estufa, temperatura.',
      guided: { type: 'fill', prompt: 'Complete a explicação:', text: 'Carros e fábricas queimam {0} fósseis, e as queimadas também liberam muito {1}. O desmatamento reduz as {2} que retiram esse gás do ar. O excesso intensifica o efeito {3} e eleva a {4} média.', answers: ['combustíveis', 'gás carbônico', 'plantas', 'estufa', 'temperatura'], bank: ['gás oxigênio', 'pedras'] },
      review: { type: 'mc', prompt: 'Qual destas atividades humanas mais contribui para o aquecimento global?', options: [ok('Queimar combustíveis fósseis e florestas, liberando muito gás carbônico'), no('Plantar árvores', 'As plantas retiram gás carbônico na fotossíntese.'), no('Usar a bicicleta', 'A bicicleta não queima combustível.')] },
      scene: { flag: 'q_L3-Q9', text: 'O termômetro do Telão do Clima baixa um pouco.' }
    },
    {
      id: 'L3-Q10', region: 'r3', map: 'r3', entity: 'maquina_gases', where: 'Sala do Oxigênio — Janela de Observação', concept: 'carbono', level: 'construtor',
      title: 'Quem libera gás carbônico?',
      prompt: 'Entre planta em vaso, vaca, fogo, fábrica, fruta e carro, toque nos seres ou situações que liberam gás carbônico.',
      prep: {
        concept: '**Respiração** (animais), **decomposição** e **queimas/combustão** liberam gás carbônico. As plantas **consomem** gás carbônico na fotossíntese.',
        example: 'O coelho do laboratório respira e libera gás carbônico. A vela acesa também libera.',
        steps: ['É um animal respirando?', 'Há algo queimando (combustão)?', 'A planta, na fotossíntese, usa ou libera?']
      },
      main: {
        type: 'hotspot',
        items: [
          { id: 'planta', t: 'Planta em vaso', icon: '🪴', x: 15, y: 30, ok: false, fb: 'Na fotossíntese, a planta CONSOME gás carbônico.' },
          { id: 'vaca', t: 'Vaca', icon: '🐄', x: 45, y: 25, ok: true },
          { id: 'fogo', t: 'Fogo', icon: '🔥', x: 78, y: 30, ok: true },
          { id: 'fabrica', t: 'Fábrica', icon: '🏭', x: 20, y: 72, ok: true },
          { id: 'fruta', t: 'Fruta', icon: '🍎', x: 50, y: 70, ok: false, fb: 'A fruta sozinha não é o alvo desta atividade: procure animais respirando e coisas queimando.' },
          { id: 'carro', t: 'Carro', icon: '🚗', x: 80, y: 72, ok: true }
        ]
      },
      answer: 'Vaca (respiração), fogo, fábrica e carro (combustão). A planta consome gás carbônico na fotossíntese.',
      why: 'A **vaca** libera gás carbônico na **respiração**. **Fogo**, **fábrica** e **carro** liberam gás carbônico pela **combustão**. A **planta**, na fotossíntese, **consome** gás carbônico.',
      err: 'Marcar a planta, confundindo fotossíntese com liberação de gás carbônico.',
      recap: 'Liberam gás carbônico: **respiração**, **decomposição** e **combustão**.',
      hint1: 'São 4 respostas.',
      hint2: 'Um animal e três coisas que queimam combustível ou material.',
      review: { type: 'hotspot', prompt: 'Toque no que libera gás carbônico.', items: [{ id: 'onca', t: 'Onça respirando', icon: '🐆', x: 18, y: 28, ok: true }, { id: 'capim', t: 'Capim fazendo fotossíntese', icon: '🌾', x: 50, y: 28, ok: false, fb: 'Na fotossíntese o capim consome gás carbônico.' }, { id: 'fogueira', t: 'Fogueira', icon: '🔥', x: 82, y: 28, ok: true }, { id: 'onibus', t: 'Ônibus', icon: '🚌', x: 30, y: 72, ok: true }, { id: 'cogumelo', t: 'Cogumelos decompondo um tronco', icon: '🍄', x: 70, y: 72, ok: true }] },
      scene: { flag: 'q_L3-Q10', text: 'A janela de observação mostra os gases coloridos em movimento.' }
    },
    {
      id: 'L3-Q11', region: 'r3', map: 'r3', entity: 'diagrama', where: 'Salão Central — Grande Diagrama dos Ciclos', concept: 'carbono', level: 'guardiao',
      title: 'Pintar os ciclos',
      prompt: 'No grande diagrama, pinte de AZUL as setas do ciclo da água, de VERMELHO as do carbono (gás carbônico) e de PRETO as do gás oxigênio.',
      prep: {
        concept: 'Ciclo da **água**: evaporação, transpiração, condensação, precipitação, absorção. Ciclo do **carbono**: gás carbônico na fotossíntese, respiração, decomposição e combustão. **Oxigênio**: liberado na fotossíntese, consumido na respiração, decomposição e combustão.',
        example: 'A planta tem três tipos de setas: absorve água (azul), usa gás carbônico (vermelho) e libera gás oxigênio (preto).',
        steps: ['A seta fala de água? Azul.', 'Fala de gás carbônico? Vermelho.', 'Fala de gás oxigênio? Preto.']
      },
      main: {
        type: 'color',
        colors: [{ id: 'azul', label: 'Azul — água', css: '#2d7be5' }, { id: 'vermelho', label: 'Vermelho — carbono', css: '#e04b4b' }, { id: 'preto', label: 'Preto — oxigênio', css: '#222222' }],
        nodes: [
          { id: 'ar', t: 'Atmosfera', icon: '🌬️', x: 50, y: 8 }, { id: 'nuvem', t: 'Nuvem', icon: '☁️', x: 12, y: 8 }, { id: 'vapor', t: 'Vapor de água', icon: '💨', x: 12, y: 42 },
          { id: 'lago', t: 'Lago', icon: '💧', x: 8, y: 88 }, { id: 'planta', t: 'Planta', icon: '🌳', x: 36, y: 62 }, { id: 'solo', t: 'Solo', icon: '🟫', x: 36, y: 92 },
          { id: 'animal', t: 'Animal', icon: '🐄', x: 62, y: 62 }, { id: 'fungos', t: 'Decompositores', icon: '🍄', x: 66, y: 92 }, { id: 'fogo', t: 'Combustão', icon: '🔥', x: 90, y: 55 }
        ],
        arrows: [
          { id: 'a1', from: 'lago', to: 'vapor', label: 'evaporação', color: 'azul' },
          { id: 'a2', from: 'planta', to: 'vapor', label: 'transpiração', color: 'azul' },
          { id: 'a3', from: 'vapor', to: 'nuvem', label: 'condensação', color: 'azul' },
          { id: 'a4', from: 'nuvem', to: 'lago', label: 'precipitação', color: 'azul', bend: -30 },
          { id: 'a5', from: 'solo', to: 'planta', label: 'absorção da água', color: 'azul' },
          { id: 'a6', from: 'ar', to: 'planta', label: 'gás carbônico (fotossíntese)', color: 'vermelho', bend: -14 },
          { id: 'a7', from: 'animal', to: 'ar', label: 'gás carbônico (respiração)', color: 'vermelho', bend: -14 },
          { id: 'a8', from: 'fungos', to: 'ar', label: 'gás carbônico (decomposição)', color: 'vermelho', bend: 22 },
          { id: 'a9', from: 'fogo', to: 'ar', label: 'gás carbônico (combustão)', color: 'vermelho', bend: -14 },
          { id: 'a10', from: 'planta', to: 'ar', label: 'gás oxigênio (fotossíntese)', color: 'preto', bend: 14 },
          { id: 'a11', from: 'ar', to: 'animal', label: 'gás oxigênio (respiração)', color: 'preto', bend: 14 },
          { id: 'a12', from: 'ar', to: 'fungos', label: 'gás oxigênio (decomposição)', color: 'preto', bend: -22 },
          { id: 'a13', from: 'ar', to: 'fogo', label: 'gás oxigênio (combustão)', color: 'preto', bend: 14 }
        ]
      },
      answer: 'Evaporação, transpiração, condensação, precipitação e absorção = azul; gás carbônico em fotossíntese, respiração, decomposição e combustão = vermelho; gás oxigênio liberado na fotossíntese e consumido em respiração, decomposição e combustão = preto.',
      why: 'As setas de **evaporação, transpiração, condensação, precipitação e absorção** são do **ciclo da água (azul)**. As de **gás carbônico** (fotossíntese, respiração, decomposição, combustão) são do **carbono (vermelho)**. As de **gás oxigênio** são **pretas**.',
      err: 'Pintar a transpiração de vermelho por sair da planta. Ela é vapor de água: azul.',
      recap: 'Leia o **nome da seta**: água → azul; gás carbônico → vermelho; gás oxigênio → preto.',
      hint1: 'Escolha uma cor e toque em todas as setas daquela cor antes de trocar.',
      hint2: 'Toda seta com “gás carbônico” no nome é vermelha.',
      review: { type: 'color', prompt: 'Pinte as setas: azul = água, vermelho = gás carbônico, preto = gás oxigênio.', colors: [{ id: 'azul', label: 'Azul — água', css: '#2d7be5' }, { id: 'vermelho', label: 'Vermelho — carbono', css: '#e04b4b' }, { id: 'preto', label: 'Preto — oxigênio', css: '#222222' }], nodes: [{ id: 'ar', t: 'Atmosfera', icon: '🌬️', x: 50, y: 10 }, { id: 'planta', t: 'Planta', icon: '🌱', x: 20, y: 80 }, { id: 'coelho', t: 'Coelho', icon: '🐇', x: 80, y: 80 }, { id: 'lago', t: 'Lago', icon: '💧', x: 50, y: 88 }], arrows: [{ id: 'b1', from: 'planta', to: 'ar', label: 'gás oxigênio (fotossíntese)', color: 'preto', bend: 14 }, { id: 'b2', from: 'ar', to: 'planta', label: 'gás carbônico (fotossíntese)', color: 'vermelho', bend: 14 }, { id: 'b3', from: 'coelho', to: 'ar', label: 'gás carbônico (respiração)', color: 'vermelho', bend: 14 }, { id: 'b4', from: 'lago', to: 'ar', label: 'evaporação', color: 'azul' }] },
      scene: { flag: 'q_L3-Q11', text: 'O Grande Diagrama se ilumina em azul, vermelho e preto; todas as máquinas funcionam.' }
    },

    /* =========================== REGIÃO 4 =========================== */
    {
      id: 'L4-Q1', region: 'r4', map: 'r4', entity: 'teo', where: 'Margem do Lago — Ribeirinho Téo (após investigar as três entradas)', concept: 'eutrofizacao', level: 'explorador',
      title: 'De onde vêm os nutrientes?',
      prompt: 'Como os nutrientes podem acumular-se no leito de água? Toque em todas as fontes de nutrientes da cena.',
      prep: {
        concept: 'Nutrientes ricos em **nitrogênio e fósforo** chegam à água por **esgoto sem tratamento**, **fertilizantes levados pela chuva** e **descarte inadequado de resíduos**.',
        example: 'Você investigou o cano de esgoto, a plantação adubada perto da margem e o monte de resíduos.',
        steps: ['O que desce pelo cano?', 'O que a chuva leva da plantação?', 'O que foi jogado na margem?']
      },
      main: {
        type: 'hotspot',
        items: [
          { id: 'esgoto', t: 'Esgoto sem tratamento', icon: '🚽', x: 15, y: 28, ok: true },
          { id: 'fert', t: 'Fertilizante levado pela chuva', icon: '🌧️', x: 50, y: 22, ok: true },
          { id: 'residuos', t: 'Despejo de resíduos e restos', icon: '🗑️', x: 85, y: 28, ok: true },
          { id: 'arvores', t: 'Árvores na margem', icon: '🌳', x: 20, y: 72, ok: false, fb: 'Proteger as margens com plantas ajuda a PREVENIR a eutrofização.' },
          { id: 'peixes', t: 'Peixes nadando', icon: '🐟', x: 50, y: 78, ok: false, fb: 'Os peixes são prejudicados pela eutrofização; não são a fonte dos nutrientes.' },
          { id: 'barco', t: 'Barco a remo', icon: '🚣', x: 80, y: 72, ok: false, fb: 'O barco a remo não leva nutrientes para a água.' }
        ]
      },
      answer: 'Por esgoto, fertilizantes/adubos carregados pela chuva e despejo de resíduos/matéria orgânica ricos em nitrogênio e fósforo.',
      why: 'Os nutrientes (**nitrogênio e fósforo**) chegam pelo **esgoto sem tratamento**, pelos **fertilizantes levados pela chuva** e pelo **despejo de resíduos e matéria orgânica**.',
      err: 'Marcar as árvores da margem — elas ajudam a proteger o lago.',
      recap: 'Fontes de nutrientes: **esgoto**, **fertilizante com chuva**, **resíduos**.',
      hint1: 'São três fontes: lembre-se das três entradas que você investigou.',
      hint2: 'Cano, plantação com chuva e lixo jogado.',
      review: { type: 'multi', prompt: 'Quais situações levam nutrientes em excesso para um rio?', options: [ok('Esgoto lançado sem tratamento'), ok('Chuva levando fertilizante das plantações'), ok('Restos de comida jogados na água'), no('Mata ciliar na margem', 'Proteger as margens ajuda a prevenir.')] },
      scene: { flag: 'q_L4-Q1', text: 'Placas de aviso aparecem nas três entradas de nutrientes.' }
    },
    {
      id: 'L4-Q2', region: 'r4', map: 'r4', entity: 'dito', where: 'Horta do Agricultor Dito — Quadro das Etapas', concept: 'eutrofizacao', level: 'construtor',
      title: 'Por que os peixes morrem?',
      prompt: 'Por que peixes e outros animais morrem durante a eutrofização?',
      prep: {
        concept: 'Na eutrofização, muitos organismos morrem e há muita matéria orgânica. **Bactérias decompositoras** se multiplicam e **consomem o oxigênio** da água.',
        example: 'Téo viu peixes subindo à superfície, “buscando ar”, no Lago Esverdeado.',
        steps: ['O que as bactérias decompositoras usam para decompor?', 'O que acontece com o oxigênio da água?', 'Os peixes precisam de quê para respirar?']
      },
      main: {
        type: 'mc',
        options: [
          ok('Os decompositores consomem o oxigênio da água ao decompor muita matéria orgânica; com pouco oxigênio, os animais não conseguem respirar'),
          no('As algas comem os peixes', 'Algas são produtoras; não comem peixes.'),
          no('A luz do Sol aquece demais o fundo do lago', 'Na eutrofização, a luz tem DIFICULDADE de chegar ao fundo.'),
          no('Os peixes comem algas demais e passam mal', 'O problema é a falta de oxigênio causada pela decomposição.')
        ]
      },
      answer: 'Decompositores consomem o oxigênio da água ao decompor muita matéria orgânica; com pouco oxigênio, os animais aquáticos não conseguem respirar.',
      why: 'Com muita matéria orgânica, as **bactérias decompositoras** se multiplicam e **consomem o oxigênio** da água. Com **pouco oxigênio**, peixes e outros animais **não conseguem respirar** e morrem.',
      err: 'Culpar as algas diretamente. O que falta é oxigênio, consumido pelos decompositores.',
      recap: 'Muita matéria orgânica → **decompositores consomem oxigênio** → falta oxigênio → animais morrem.',
      hint1: 'Qual gás os peixes precisam para respirar?',
      hint2: 'Quem gasta esse gás no fundo do lago?',
      review: { type: 'mc', prompt: 'Num lago eutrofizado, qual é a causa principal da falta de oxigênio?', options: [ok('Bactérias decompositoras consumindo oxigênio ao decompor muita matéria orgânica'), no('Os peixes respirando demais', 'O consumo principal vem da decomposição.'), no('A chuva', 'A chuva pode levar fertilizantes, mas não consome o oxigênio.')] },
      scene: { flag: 'q_L4-Q2', text: 'Aeradores ligam e bolhas de oxigênio sobem no lago.' }
    },
    {
      id: 'L4-Q3', region: 'r4', map: 'r4', entity: 'clara', where: 'Estação de Tratamento — Engenheira Clara', concept: 'eutrofizacao', level: 'guardiao',
      title: 'Impedir a eutrofização',
      prompt: 'O que pode ser feito para impedir a eutrofização? Marque as ações corretas.',
      prep: {
        concept: 'Prevenção: **tratar esgoto**, **controlar fertilizantes**, **impedir descarte de resíduos** e **proteger margens** e cursos d’água.',
        example: 'A estação de tratamento da Clara limpa o esgoto antes que ele chegue ao lago.',
        steps: ['Como impedir o esgoto de levar nutrientes?', 'E os fertilizantes?', 'E os resíduos?']
      },
      main: {
        type: 'multi', minCorrect: 2,
        options: [
          ok('Tratar o esgoto antes de chegar ao lago'), ok('Evitar lançar resíduos na água'),
          ok('Controlar o uso de fertilizantes e o seu escoamento'), ok('Proteger as margens dos rios e lagos'),
          no('Jogar mais adubo para as plantas do lago crescerem', 'Mais nutrientes pioram a eutrofização.'),
          no('Despejar o esgoto mais longe da margem', 'O esgoto continuaria chegando à água.')
        ]
      },
      answer: 'Tratar esgoto, evitar lançamento de resíduos e controlar o uso/escoamento de fertilizantes e nutrientes para rios e lagos.',
      why: 'Para impedir a eutrofização é preciso **tratar o esgoto**, **evitar lançar resíduos**, **controlar o uso e o escoamento de fertilizantes** e **proteger as margens**.',
      err: 'Achar que basta mudar o lugar do esgoto sem tratá-lo.',
      recap: 'Impedir a **entrada de nutrientes**: tratar esgoto, controlar fertilizantes, não jogar resíduos.',
      hint1: 'Todas as ações certas diminuem a entrada de nutrientes.',
      hint2: 'Descarte as que ainda deixam nutrientes chegarem à água.',
      review: { type: 'mc', prompt: 'Qual atitude ajuda a prevenir a eutrofização de um rio?', options: [ok('Tratar o esgoto da cidade'), no('Aumentar o fertilizante das plantações', 'Isso aumenta os nutrientes na água.'), no('Jogar restos de comida no rio', 'Isso é descarte inadequado de matéria orgânica.')] },
      scene: { flag: 'q_L4-Q3', text: 'A estação de tratamento funciona e a água do lago começa a clarear.' }
    },

    /* =========================== REGIÃO 5 =========================== */
    {
      id: 'L5-Q1', region: 'r5', map: 'r5', entity: 'piramide', where: 'Topo da Torre — Sala da Pirâmide', concept: 'piramide', level: 'explorador',
      title: 'Contar a pirâmide',
      prompt: 'Na pirâmide ilustrada, conte os indivíduos em cada nível (de baixo para cima).',
      prep: {
        concept: 'A **energia diminui** ao longo da cadeia; por isso a pirâmide é **larga na base** e **estreita no topo**.',
        example: 'Geralmente há mais produtores do que consumidores primários, e assim por diante.',
        steps: ['Comece pela base (produtores).', 'Conte com calma cada figura.', 'Suba um andar de cada vez.']
      },
      main: {
        type: 'numbers', min: 0, max: 15, picture: 'pyramid',
        rows: [
          { t: 'Topo: coruja', icon: '🦉', answer: 1 },
          { t: 'Consumidores terciários: serpentes', icon: '🐍', answer: 2 },
          { t: 'Consumidores secundários: aves insetívoras', icon: '🐦', answer: 3 },
          { t: 'Consumidores primários: gafanhotos', icon: '🦗', answer: 5 },
          { t: 'Produtores: touceiras de capim', icon: '🌾', answer: 12 }
        ]
      },
      answer: '12, 5, 3, 2 e 1, de baixo para cima.',
      why: 'De baixo para cima: **12 capins**, **5 gafanhotos**, **3 aves insetívoras**, **2 serpentes** e **1 coruja**. Há mais produtores na base porque a **energia diminui** a cada nível.',
      err: 'Contar a pirâmide de cima para baixo e trocar a ordem dos números.',
      recap: 'Conte cada **andar** separadamente, começando pela **base**.',
      hint1: 'Conte com o dedo, figura por figura.',
      hint2: 'A base tem o maior número; o topo tem só um.',
      review: { type: 'mc', prompt: 'Numa pirâmide de energia, onde fica o MAIOR número de indivíduos?', options: [ok('Na base, com os produtores'), no('No topo, com o último consumidor', 'O topo é estreito: poucos indivíduos.'), no('Todos os níveis têm o mesmo número', 'A energia diminui a cada nível.')] },
      scene: { flag: 'q_L5-Q1', text: 'A pirâmide do topo acende em cores, da base verde ao topo vermelho.' }
    },
    {
      id: 'L5-Q2', region: 'r5', map: 'r5', entity: 'jatoba', where: 'Área Queimada — Guarda Jatobá', concept: 'desequilibrio', level: 'guardiao',
      title: 'Como o ecossistema se desequilibra',
      prompt: 'Como região desmatada, queimada e pesca predatória podem desequilibrar ecossistemas? Leve cada efeito para a causa certa.',
      prep: {
        concept: '**Desmatamento e queimadas** matam e desabrigam seres vivos. **Pesca predatória** retira animais em excesso. Tudo isso afeta as **cadeias** do ecossistema.',
        example: 'Na área queimada da Torre, Jatobá mostra troncos cortados, cinzas e um rio com poucos peixes.',
        steps: ['O que o machado faz com o habitat?', 'O que o fogo faz com os seres vivos?', 'O que a pesca em excesso retira?']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'd', label: 'Desmatamento', icon: '🪓' }, { id: 'q', label: 'Queimada', icon: '🔥' }, { id: 'p', label: 'Pesca predatória', icon: '🎣' }, { id: 't', label: 'As três causam', icon: '⚠️' }],
        cards: [
          { t: 'Retira árvores e destrói habitats', icon: '🌳', bin: 'd' },
          { t: 'O fogo mata e desabriga seres vivos', icon: '🔥', bin: 'q' },
          { t: 'Retira peixes em excesso dos rios', icon: '🐟', bin: 'p' },
          { t: 'Reduz populações e o alimento de outros seres', icon: '📉', bin: 't', fb: 'Todas as três reduzem populações e alimentos.' },
          { t: 'Afeta as relações e as cadeias alimentares do ecossistema', icon: '🔗', bin: 't', fb: 'Todas as três afetam as cadeias.' }
        ]
      },
      answer: 'Destroem habitats e matam/desabrigam organismos; reduzem populações e alimentos; a pesca predatória retira animais em excesso; as mudanças afetam as relações e cadeias do ecossistema.',
      model: 'O desmatamento e as queimadas destroem habitats e matam ou desabrigam seres vivos; a pesca predatória retira peixes em excesso. Isso reduz populações e alimentos e afeta as cadeias do ecossistema.',
      why: '**Desmatamento** e **queimadas** destroem habitats e **matam ou desabrigam** seres vivos. A **pesca predatória** retira animais **em excesso**. As três **reduzem populações e alimentos** e **afetam as cadeias** do ecossistema.',
      err: 'Achar que só a queimada causa problema. As três ações desequilibram.',
      recap: 'Cada ação tira algo do ecossistema — e isso mexe com **todas as cadeias**.',
      hint1: 'Duas frases valem para as três causas.',
      hint2: 'Machado → habitat; fogo → mata e desabriga; anzol → peixes em excesso.',
      review: { type: 'mc', prompt: 'Uma pesca predatória retirou quase todos os peixes de um rio. O que pode acontecer?', options: [ok('Os animais que comem peixes ficam sem alimento e a cadeia se desequilibra'), no('Nada muda no rio', 'Retirar uma população afeta outras.'), no('O rio fica com mais peixes', 'A pesca predatória retira peixes em excesso.')] },
      scene: { flag: 'q_L5-Q2', text: 'Brotos verdes surgem na área queimada.' }
    },
    {
      id: 'L5-Q3', region: 'r5', map: 'r5', entity: 'tuane', where: 'Jardim da Garrafa — Tuane', concept: 'ecossistema', level: 'explorador',
      title: 'Horas depois, na garrafa…',
      prompt: 'Em um ecossistema fechado em uma garrafa, o que acontece após algumas horas?',
      prep: {
        concept: 'Numa garrafa fechada, a água **evapora** do solo e a planta **transpira**; o vapor **condensa** nas paredes.',
        example: 'Tuane montou uma garrafa com solo, planta, cascas e um pouco de água, e fechou a tampa.',
        steps: ['A água pode sair da garrafa fechada?', 'O vapor encontra a parede fria…', 'O que aparece nas paredes?']
      },
      pre: { type: 'observe', prompt: 'Observe a garrafa e deixe o tempo passar.', button: 'Passar algumas horas ⏳', cards: [{ art: '🫙🌱', text: 'Garrafa recém-fechada: parede limpa e seca.' }, { art: '🫙💧🌱', text: 'Algumas horas depois… observe as paredes!' }] },
      main: {
        type: 'mc',
        options: [
          ok('Aparecem gotinhas de água nas paredes: a água evapora e transpira, depois condensa, e circula no sistema'),
          no('A garrafa fica totalmente seca', 'A água não sai de uma garrafa fechada: ela circula.'),
          no('A água desaparece para sempre', 'A água circula dentro do sistema; ela não some.'),
          no('Nascem peixes na garrafa', 'Não havia peixes na garrafa.')
        ]
      },
      answer: 'Pode aparecer umidade/gotículas nas paredes por evaporação/transpiração e condensação; a água circula no sistema.',
      why: 'A água **evapora** do solo e a planta **transpira**. O vapor **condensa** nas paredes e forma **gotinhas**. A água **circula** dentro do sistema fechado.',
      err: 'Achar que a água “some” porque a garrafa está fechada.',
      recap: 'Evaporação/transpiração → **condensação nas paredes** → a água volta ao solo.',
      hint1: 'O que acontece com um espelho quando alguém toma banho quente?',
      hint2: 'Gotinhas nas paredes = condensação.',
      review: { type: 'mc', prompt: 'Por que aparecem gotinhas na parede da garrafa?', options: [ok('O vapor de água condensa nas paredes'), no('A planta chora', 'Plantas não choram! É condensação.'), no('Entrou água de fora', 'A garrafa está fechada; a água circula dentro dela.')] },
      scene: { flag: 'q_L5-Q3', text: 'Gotinhas aparecem na garrafa gigante do jardim.' }
    },
    {
      id: 'L5-Q4', region: 'r5', map: 'r5', entity: 'tuane', where: 'Jardim da Garrafa — Tuane', concept: 'ecossistema', level: 'guardiao',
      title: 'Os ciclos na garrafa',
      prompt: 'Explique o ciclo da água, do carbono ou do oxigênio nessa garrafa (escolha um).',
      prep: {
        concept: 'Na garrafa: a água evapora, condensa e volta; a planta faz **fotossíntese**; seres vivos e **decompositores respiram**.',
        example: 'A planta usa gás carbônico e libera oxigênio; os fungos das cascas respiram, usando oxigênio.',
        steps: ['Escolha um ciclo.', 'Diga o que acontece primeiro.', 'Diga como o ciclo recomeça.']
      },
      main: {
        type: 'open', placeholder: 'Na garrafa, a água…  (ou: a planta…)',
        groups: [
          { label: 'A água evapora e a planta transpira', kw: ['evapor', 'transpir', 'vapor'] },
          { label: 'O vapor condensa nas paredes', kw: ['condens', 'gotas', 'gotinhas', 'parede', 'umid'] },
          { label: 'A água volta ao solo', kw: ['volta', 'solo', 'cai', 'escorre', 'retorna', 'chuv'] },
          { label: 'A planta usa gás carbônico e libera oxigênio (fotossíntese)', kw: ['fotossint', 'gas carbonico', 'libera oxigenio', 'libera o oxigenio', 'usa gas'] },
          { label: 'Seres vivos e decompositores respiram, usando oxigênio e liberando gás carbônico', kw: ['respir', 'decompos', 'fungo', 'bacteria'] }
        ],
        min: 2, wrongIdeas: ['A água some da garrafa', 'A planta libera gás carbônico na fotossíntese']
      },
      answer: 'Água evapora/transpira, condensa nas paredes e retorna ao solo; planta usa gás carbônico e libera oxigênio na fotossíntese; seres vivos/decompositores respiram, usando oxigênio e liberando gás carbônico.',
      model: 'A água evapora do solo e a planta transpira; o vapor condensa nas paredes e a água volta ao solo. A planta usa gás carbônico e libera oxigênio na fotossíntese; os seres vivos e os decompositores respiram, usando oxigênio e liberando gás carbônico.',
      why: '**Água**: evapora e transpira, **condensa** nas paredes e **volta ao solo**. **Carbono e oxigênio**: a planta **usa gás carbônico e libera oxigênio** na fotossíntese; seres vivos e decompositores **respiram**, usando oxigênio e liberando gás carbônico.',
      err: 'Misturar os gases: na fotossíntese a planta libera oxigênio, não gás carbônico.',
      recap: 'Água: **evapora → condensa → volta**. Gases: **fotossíntese** ⇄ **respiração**.',
      hint1: 'Escolha só um ciclo e conte em 2 ou 3 passos.',
      hint2: 'Água: evapora, condensa nas paredes, volta ao solo.',
      guided: { type: 'order', layout: 'list', prompt: 'Organize o ciclo da água na garrafa:', items: [{ t: 'A água evapora do solo e a planta transpira', icon: '♨️' }, { t: 'O vapor condensa nas paredes (gotinhas)', icon: '💧' }, { t: 'As gotas escorrem e voltam ao solo', icon: '🟫' }] },
      review: { type: 'order', layout: 'list', prompt: 'Organize o caminho dos gases na garrafa:', items: [{ t: 'A planta usa gás carbônico na fotossíntese', icon: '🌱' }, { t: 'A planta libera gás oxigênio', icon: '🔵' }, { t: 'Seres vivos e decompositores usam oxigênio na respiração', icon: '🍄' }, { t: 'A respiração libera gás carbônico, que a planta usa de novo', icon: '⚪' }] },
      scene: { flag: 'q_L5-Q4', text: 'Setas de água e de gases giram ao redor da garrafa.' }
    },
    {
      id: 'L5-Q5', region: 'r5', map: 'r5', entity: 'tuane', where: 'Jardim da Garrafa — Tuane', concept: 'ecossistema', level: 'explorador',
      title: 'Quem mora na garrafa?',
      prompt: 'Quais seres vivos podem fazer parte desse ecossistema? Coloque na garrafa.',
      prep: {
        concept: 'Um ecossistema em garrafa é pequeno: tem **planta**, **solo** com **fungos, bactérias** e **pequenos organismos**. **Animais grandes não**.',
        example: 'A garrafa da Tuane tem planta, solo e cascas de frutas.',
        steps: ['Caberia na garrafa?', 'Sobreviveria nela?', 'Já estava no solo?']
      },
      main: {
        type: 'multi', minCorrect: 2, visual: 'bottle',
        options: [
          ok('Planta', null, { icon: '🌱' }), ok('Fungos', null, { icon: '🍄' }), ok('Bactérias', null, { icon: '🦠' }), ok('Pequenos organismos que já estão no solo', null, { icon: '🟫' }),
          no('Capivara', 'Animais grandes não cabem nem sobreviveriam numa garrafa fechada.', { icon: '#capivara' }), no('Peixe', 'Não há água suficiente para um peixe; não incluímos animais grandes.', { icon: '🐟' }),
          no('Onça-pintada', 'Animais grandes não fazem parte desse ecossistema.', { icon: '🐆' })
        ]
      },
      answer: 'Planta, fungos, bactérias e pequenos organismos presentes no solo. Não incluir animais grandes.',
      why: 'Na garrafa cabem a **planta**, os **fungos**, as **bactérias** e **pequenos organismos que já estão no solo**. **Animais grandes** não fazem parte.',
      err: 'Colocar um animal grande porque ele “gosta de plantas”.',
      recap: 'Garrafa = **planta + solo com fungos, bactérias e pequenos organismos**.',
      hint1: 'Pense no tamanho da garrafa.',
      hint2: 'Os decompositores ficam no solo e nas cascas.',
      review: { type: 'multi', minCorrect: 2, prompt: 'Qual destes pode viver no ecossistema da garrafa?', options: [ok('Fungos nas cascas', null, { icon: '🍄' }), ok('Uma plantinha', null, { icon: '🌱' }), no('Um coelho', 'Animais grandes não cabem.', { icon: '🐇' }), no('Um gavião', 'Animais grandes não cabem.', { icon: '🦅' })] },
      scene: { flag: 'q_L5-Q5', text: 'A garrafa gigante mostra a planta e o solo cheio de vida microscópica.' }
    },
    {
      id: 'L5-Q6', region: 'r5', map: 'r5', entity: 'tuane', where: 'Jardim da Garrafa — Tuane', concept: 'niveis', level: 'construtor',
      title: 'Níveis tróficos da garrafa',
      prompt: 'Quais níveis tróficos estão presentes na nossa garrafa?',
      prep: {
        concept: 'A planta é **produtora**. Fungos e bactérias são **decompositores**. Consumidores só existiriam se houvesse animais na garrafa.',
        example: 'Na garrafa da Tuane não colocamos animais visíveis.',
        steps: ['Quem fabrica o alimento?', 'Quem decompõe as cascas?', 'Há algum animal comendo a planta?']
      },
      main: {
        type: 'multi',
        options: [ok('Produtor (a planta)'), ok('Decompositores (fungos e bactérias)'), no('Consumidor primário', 'Na nossa garrafa não há animais visíveis comendo a planta.'), no('Consumidor secundário', 'Não há consumidores na nossa garrafa.'), no('Consumidor terciário', 'Não há consumidores na nossa garrafa.')]
      },
      answer: 'Produtor (planta) e decompositores (fungos/bactérias); consumidores só se a cena incluísse pequenos animais.',
      why: 'Na nossa garrafa há o **produtor** (a planta) e os **decompositores** (fungos e bactérias). Não colocamos animais visíveis, por isso **não há consumidores**.',
      err: 'Marcar consumidores sem haver animais na cena.',
      recap: 'Planta = **produtor**; fungos e bactérias = **decompositores**.',
      hint1: 'São dois níveis.',
      hint2: 'Há algum animal na garrafa?',
      review: { type: 'mc', prompt: 'Na garrafa com planta, solo e cascas, os fungos são:', options: [ok('Decompositores'), no('Produtores', 'Fungos não fazem fotossíntese.'), no('Consumidores secundários', 'Fungos decompõem restos.')] },
      scene: { flag: 'q_L5-Q6', text: 'Etiquetas “produtor” e “decompositores” aparecem na garrafa.' }
    },
    {
      id: 'L5-Q7', region: 'r5', map: 'r5', entity: 'tuane', where: 'Jardim da Garrafa — Tuane', concept: 'decompositores', level: 'construtor',
      title: 'Onde ficam na garrafa?',
      prompt: 'Onde ficam produtores e decompositores na garrafa? Leve cada parte para o grupo certo.',
      prep: {
        concept: 'O **produtor** é a planta. Os **decompositores** ficam principalmente **no solo** e nos **restos orgânicos (cascas)**.',
        example: 'Nas cascas de fruta da garrafa, aparecem manchinhas de fungos.',
        steps: ['Onde está a planta?', 'Onde há restos para decompor?', 'O que não é nenhum dos dois?']
      },
      main: {
        type: 'classify',
        bins: [{ id: 'p', label: 'Aqui está o produtor', icon: '🌱' }, { id: 'd', label: 'Aqui ficam os decompositores', icon: '🍄' }, { id: 'x', label: 'Nenhum dos dois', icon: '🚫' }],
        cards: [
          { t: 'A planta', icon: '🌱', bin: 'p' }, { t: 'O solo', icon: '🟫', bin: 'd' }, { t: 'As cascas e restos orgânicos', icon: '🍌', bin: 'd' },
          { t: 'As gotinhas na parede', icon: '💧', bin: 'x', fb: 'As gotinhas são água condensada.' }, { t: 'A tampa da garrafa', icon: '⚪', bin: 'x', fb: 'A tampa não é ser vivo.' }
        ]
      },
      answer: 'Produtor é a planta; decompositores ficam principalmente no solo e nos restos orgânicos/cascas.',
      why: 'O **produtor** é a **planta**. Os **decompositores** ficam principalmente **no solo** e nas **cascas e restos orgânicos**.',
      err: 'Achar que os decompositores ficam nas gotinhas da parede.',
      recap: 'Decompositores ficam onde há **restos para decompor**: **solo e cascas**.',
      hint1: 'Decompositores precisam de restos orgânicos.',
      hint2: 'Duas partes vão para os decompositores.',
      review: { type: 'mc', prompt: 'Na garrafa, onde estão principalmente os decompositores?', options: [ok('No solo e nas cascas'), no('Na tampa', 'A tampa não tem restos para decompor.'), no('Nas folhas verdes da planta', 'A planta viva é produtora.')] },
      scene: { flag: 'q_L5-Q7', text: 'O Jardim da Garrafa floresce ao redor.' }
    },

    /* =========================== REGIÃO 6 =========================== */
    {
      id: 'L6-Q1', region: 'r6', map: 'r6', entity: 'gaiola1', where: 'Posto de Resgate — Gaiola 1 (Agente Iara)', concept: 'desequilibrio', level: 'explorador',
      title: 'O crime da notícia',
      prompt: 'Que crime foi relatado e onde ocorreu?',
      prep: {
        concept: 'Segundo a notícia do livro, **163 pássaros silvestres de 18 espécies** foram resgatados em **duas feiras** nos conjuntos **Santa Catarina e Nova Natal**, **Zona Norte de Natal**.',
        example: 'As aves eram **comercializadas ilegalmente**, em caixas pequenas, sem água e com pouca ventilação (maus-tratos).',
        steps: ['O que estava sendo feito com as aves?', 'Como elas estavam?', 'Em que lugar?']
      },
      main: {
        type: 'tfj',
        partA: { prompt: 'Que crime foi relatado?', options: [ok('Comércio ilegal e maus-tratos de pássaros silvestres'), no('Caça de onças', 'A notícia fala de pássaros.'), no('Pesca predatória', 'A notícia fala de pássaros vendidos em feiras.'), no('Queimada em floresta', 'A notícia fala de venda ilegal de aves.')] },
        partB: { prompt: 'Onde ocorreu?', options: [ok('Em feiras dos conjuntos Santa Catarina e Nova Natal, na Zona Norte de Natal'), no('No Pantanal', 'Releia a notícia: foi em Natal.'), no('Na Amazônia', 'Releia a notícia: foi em feiras de Natal.'), no('Em um zoológico', 'Foi em duas feiras.')] }
      },
      answer: 'Comércio ilegal e maus-tratos de pássaros silvestres em feiras de Santa Catarina e Nova Natal, na Zona Norte de Natal.',
      why: 'A notícia relata **comércio ilegal** e **maus-tratos** de **pássaros silvestres** em **duas feiras** dos conjuntos **Santa Catarina e Nova Natal**, na **Zona Norte de Natal**.',
      err: 'Esquecer os maus-tratos: as aves estavam em caixas pequenas, sem água e com pouca ventilação.',
      recap: 'Crime: **venda ilegal + maus-tratos**. Local: **feiras em Natal (Zona Norte)**.',
      hint1: 'Releia o jornal na parede do posto.',
      hint2: 'Os bairros eram Santa Catarina e Nova Natal.',
      review: { type: 'mc', prompt: 'Segundo a notícia, quantos pássaros foram resgatados?', options: [ok('163 pássaros de 18 espécies'), no('18 pássaros de 163 espécies', 'Os números estão trocados.'), no('Apenas 2 pássaros', 'Foram 2 feiras, não 2 pássaros.')] },
      scene: { flag: 'q_L6-Q1', text: 'A primeira gaiola se abre e um grupo de aves voa para a reserva.' }
    },
    {
      id: 'L6-Q2', region: 'r6', map: 'r6', entity: 'gaiola2', where: 'Posto de Resgate — Gaiola 2 (Agente Iara)', concept: 'desequilibrio', level: 'explorador',
      title: 'Como denunciar',
      prompt: 'Segundo a notícia, como denunciar esse tipo de crime? Marque os contatos citados no texto.',
      prep: {
        concept: 'A notícia do livro cita três contatos para denúncia: **190**, **181** e **(84) 3616-9829**.',
        example: 'Esses números aparecem no texto histórico trabalhado no livro. Contatos podem mudar com o tempo.',
        steps: ['Releia o final da notícia.', 'Encontre os números.', 'Marque só os que aparecem no texto.']
      },
      main: {
        type: 'multi',
        options: [ok('190'), ok('181'), ok('(84) 3616-9829'), no('193', 'Esse número não aparece na notícia.'), no('192', 'Esse número não aparece na notícia.')]
      },
      answer: '190, 181 ou (84) 3616-9829 (conforme a notícia histórica do livro).',
      why: 'Segundo a notícia, as denúncias podiam ser feitas pelos números **190**, **181** ou **(84) 3616-9829**. Lembre: é a resposta **conforme o texto do livro**; contatos podem mudar com o tempo.',
      err: 'Marcar outros números de emergência que não aparecem no texto.',
      recap: 'Os três contatos do texto: **190**, **181** e **(84) 3616-9829**.',
      hint1: 'São três contatos.',
      hint2: 'Dois números curtos e um com código de área (84).',
      review: { type: 'mc', prompt: 'Qual destes contatos aparece na notícia do livro?', options: [ok('181'), no('193', 'Não aparece na notícia.'), no('192', 'Não aparece na notícia.')] },
      scene: { flag: 'q_L6-Q2', text: 'A segunda gaiola se abre e mais aves voam livres.' }
    },
    {
      id: 'L6-Q3', region: 'r6', map: 'r6', entity: 'gaiola4', where: 'Posto de Resgate — Gaiola 4 (Agente Iara)', concept: 'desequilibrio', level: 'guardiao',
      title: 'Crime e desequilíbrio',
      prompt: 'Por que esse crime contribui para o desequilíbrio ecológico?',
      prep: {
        concept: 'Captura e comércio ilegal **reduzem populações**, **retiram animais do seu papel** nas cadeias e teias e podem contribuir para **extinção** e **desequilíbrio**.',
        example: 'Cada ave vendida deixa de viver na natureza, onde fazia parte de cadeias alimentares.',
        steps: ['Onde a ave deveria estar?', 'O que acontece com a população?', 'O que muda nas cadeias alimentares?']
      },
      main: {
        type: 'open', placeholder: 'Porque esse crime…',
        groups: [
          { label: 'Retira os animais da natureza', kw: ['retir', 'tira ', 'tiram', 'captur', 'tirar', 'levar', 'remov', 'fora da natureza', 'prend'] },
          { label: 'Reduz as populações e ameaça espécies', kw: ['diminu', 'reduz', 'menos', 'populac', 'extin', 'ameac', 'desaparec', 'morr'] },
          { label: 'Interrompe relações nas cadeias e no ecossistema', kw: ['cadeia', 'teia', 'predador', 'presa', 'relac', 'ecossistema', 'equilibr', 'funcao', 'funcoes', 'alimento'] }
        ],
        min: 2, wrongIdeas: ['As aves ficam mais protegidas nas feiras', 'O crime não afeta a natureza']
      },
      answer: 'Retira animais da natureza, reduz populações, ameaça espécies e interrompe funções e relações nas cadeias alimentares/ecossistemas.',
      model: 'Porque retira as aves da natureza, reduz as populações e pode levar espécies à extinção. Sem essas aves, as cadeias alimentares e o ecossistema ficam desequilibrados.',
      why: 'O comércio ilegal **retira animais da natureza**, **reduz as populações** e **ameaça espécies** de extinção. Sem essas aves, as **relações nas cadeias alimentares** e no ecossistema são **interrompidas**.',
      err: 'Pensar só na ave e esquecer o efeito nas cadeias alimentares.',
      recap: 'Menos aves na natureza → **populações menores** → **cadeias alteradas** → desequilíbrio.',
      hint1: 'Pense no que acontece com a população de aves.',
      hint2: 'Use: retira, populações, cadeias alimentares.',
      guided: { type: 'fill', prompt: 'Complete a explicação:', text: 'O comércio ilegal {0} as aves da natureza, {1} as populações e pode levar espécies à extinção. Sem essas aves, as {2} alimentares e o ecossistema ficam em desequilíbrio.', answers: ['retira', 'reduz', 'cadeias'], bank: ['aumenta', 'protege'] },
      review: { type: 'mc', prompt: 'Por que capturar animais silvestres pode causar desequilíbrio ecológico?', options: [ok('Reduz as populações e altera as cadeias alimentares'), no('Porque os animais ficam mais bonitos em casa', 'Animais silvestres precisam da natureza.'), no('Não causa desequilíbrio', 'Retirar animais afeta as cadeias.')] },
      scene: { flag: 'q_L6-Q3', text: 'A última gaiola se abre: todas as aves voam para a reserva.' }
    },
    {
      id: 'L6-Q4', region: 'r6', map: 'r6', entity: 'totem_cerrado', where: 'Portal do Cerrado — Totem', concept: 'biomas', level: 'explorador',
      title: 'Qual é o bioma? (1)',
      prompt: 'Bioma com queimadas, arbustos e árvores distantes umas das outras. Qual é?',
      prep: {
        concept: '**Cerrado**: muito calor; árvores geralmente **baixas, retorcidas e espaçadas**; presença natural de **fogo** e ocorrência de **queimadas**.',
        example: 'Olhe ao redor: árvores tortas e distantes, capim e marcas de fogo.',
        steps: ['As árvores estão juntas ou distantes?', 'Há sinais de fogo?', 'Qual bioma combina?']
      },
      main: {
        type: 'mc',
        options: [no('Pantanal', 'O Pantanal é marcado por extensas áreas alagáveis.'), no('Mata Atlântica', 'A Mata Atlântica é floresta úmida perto do litoral.'), no('Amazônia', 'A Amazônia tem floresta úmida, árvores altas e rios largos.'), ok('Cerrado')]
      },
      answer: 'Cerrado.',
      why: 'Queimadas, arbustos e **árvores distantes umas das outras** são pistas do **Cerrado**.',
      err: 'Confundir com a Caatinga por causa do calor.',
      recap: 'Cerrado = **árvores baixas, retorcidas e espaçadas** + **queimadas**.',
      hint1: 'Qual bioma tem árvores tortas e espaçadas?',
      hint2: 'É o bioma onde você está agora!',
      review: { type: 'mc', prompt: 'Árvores baixas e retorcidas, muito calor e ocorrência de queimadas. Que bioma é?', options: [ok('Cerrado'), no('Pampas', 'Pampas: campos com plantas baixas.'), no('Amazônia', 'Amazônia: árvores altas e rios largos.')] },
      scene: { flag: 'q_L6-Q4', text: 'O totem do Cerrado acende e flores aparecem entre as árvores retorcidas.' }
    },
    {
      id: 'L6-Q5', region: 'r6', map: 'r6', entity: 'totem_mata', where: 'Portal da Mata Atlântica — Totem', concept: 'biomas', level: 'explorador',
      title: 'Qual é o bioma? (2)',
      prompt: 'Bioma muito úmido, com florestas próximas ao litoral brasileiro e grande diversidade de animais e plantas. Qual é?',
      prep: {
        concept: '**Mata Atlântica**: floresta **úmida** próxima de grande parte do **litoral**, com grande **diversidade**.',
        example: 'Aqui você ouve o mar ao longe e vê uma floresta úmida e cheia de vida.',
        steps: ['É floresta?', 'Fica perto do litoral?', 'Qual bioma combina?']
      },
      main: {
        type: 'mc',
        options: [no('Cerrado', 'Cerrado: árvores espaçadas e queimadas.'), ok('Mata Atlântica'), no('Caatinga', 'Caatinga: período seco marcante.'), no('Amazônia', 'A Amazônia também é úmida, mas a pista “perto do litoral” indica a Mata Atlântica.')]
      },
      answer: 'Mata Atlântica.',
      why: 'Floresta **muito úmida**, **perto do litoral** e com **grande diversidade**: é a **Mata Atlântica**.',
      err: 'Escolher a Amazônia por ser floresta úmida — a pista do litoral indica Mata Atlântica.',
      recap: 'Mata Atlântica = **floresta úmida + litoral**.',
      hint1: 'A palavra-chave é “litoral”.',
      hint2: 'O nome do bioma lembra o oceano.',
      review: { type: 'mc', prompt: 'Floresta úmida perto do litoral, com muitos animais e plantas. Que bioma é?', options: [ok('Mata Atlântica'), no('Caatinga', 'A Caatinga tem seca marcante.'), no('Pampas', 'Pampas são campos.')] },
      scene: { flag: 'q_L6-Q5', text: 'O totem da Mata Atlântica acende e aves coloridas aparecem.' }
    },
    {
      id: 'L6-Q6', region: 'r6', map: 'r6', entity: 'jurema', where: 'Portal do Cerrado — Guia Jurema', concept: 'desequilibrio', level: 'construtor',
      title: 'Queimadas e animais',
      prompt: 'Qual o risco do desmatamento por queimadas para os animais? Marque os riscos.',
      prep: {
        concept: '**Desmatamento e queimadas** matam e desabrigam seres vivos.',
        example: 'Jurema mostra um trecho queimado do Cerrado: tocas destruídas e ninhos vazios.',
        steps: ['O que o fogo faz com o corpo dos animais?', 'O que acontece com abrigo e alimento?', 'E com a população?']
      },
      main: {
        type: 'multi', minCorrect: 2,
        options: [ok('Podem morrer ou sofrer queimaduras'), ok('Perdem abrigo, alimento e local de reprodução'), ok('Precisam fugir, e suas populações podem diminuir'), no('Ganham novas casas', 'O fogo destrói abrigos.'), no('Ficam com mais alimento', 'O fogo destrói o alimento de muitos animais.')]
      },
      answer: 'Animais podem morrer, sofrer queimaduras, perder abrigo, alimento e local de reprodução, fugir e ter sua população reduzida.',
      why: 'Nas queimadas, animais podem **morrer** ou sofrer **queimaduras**, **perdem abrigo, alimento e local de reprodução**, precisam **fugir** e suas **populações podem diminuir**.',
      err: 'Pensar que os animais sempre conseguem fugir sem prejuízo.',
      recap: 'Queimada = **morte e queimaduras** + **perda de habitat** + **populações menores**.',
      hint1: 'Lembre o que é habitat.',
      hint2: 'Descarte as frases que parecem “vantagens”.',
      review: { type: 'mc', prompt: 'Depois de uma queimada, um tamanduá perdeu seu abrigo. Isso é:', options: [ok('Perda de habitat causada pela queimada'), no('Um ganho de espaço', 'Sem abrigo e alimento, é perda.'), no('Algo sem importância', 'A perda de habitat ameaça o animal.')] },
      scene: { flag: 'q_L6-Q6', text: 'Jurema instala placas “Previna queimadas” no Cerrado.' }
    },
    {
      id: 'L6-Q7', region: 'r6', map: 'r6', entity: 'jurema', where: 'Portal do Cerrado — Guia Jurema (trecho queimado)', concept: 'nitrogenio', level: 'guardiao',
      title: 'Queimadas e nitrogênio',
      prompt: 'Por que queimadas prejudicam o ciclo do nitrogênio?',
      prep: {
        concept: 'No ciclo do nitrogênio, **decompositores** devolvem nitrogênio ao solo e **bactérias fixadoras** transformam o nitrogênio do ar.',
        example: 'No trecho queimado, o solo ficou cinza e sem folhas caídas para decompor.',
        steps: ['Quem vive no solo e ajuda no ciclo?', 'O que o fogo faz com esses seres?', 'E com a matéria orgânica?']
      },
      main: {
        type: 'open', placeholder: 'Porque as queimadas…',
        groups: [
          { label: 'Matam plantas, animais, decompositores e bactérias do solo', kw: ['mata', 'morr', 'bacteria', 'decompos', 'fung', 'seres do solo', 'seres vivos'] },
          { label: 'Queimam a matéria orgânica', kw: ['materia organica', 'restos', 'folhas', 'organic', 'queimam a', 'queima a'] },
          { label: 'Reduzem os processos que devolvem ou fixam nitrogênio no solo', kw: ['nitrogen', 'fixa', 'devolv', 'nutriente', 'adubo', 'solo'] }
        ],
        min: 2, wrongIdeas: ['O fogo aumenta o nitrogênio do solo', 'As plantas pegam nitrogênio da fumaça']
      },
      answer: 'Matam plantas, animais, decompositores e bactérias do solo, queimam matéria orgânica e reduzem os processos que devolvem/fixam/transferem compostos de nitrogênio no ecossistema.',
      model: 'Porque matam plantas, animais, decompositores e bactérias do solo e queimam a matéria orgânica. Assim diminuem os processos que devolvem e fixam nitrogênio no solo.',
      why: 'As queimadas **matam plantas, animais, decompositores e bactérias do solo** (inclusive as fixadoras) e **queimam a matéria orgânica**. Assim, **diminuem os processos que devolvem, fixam e transferem nitrogênio** no ecossistema.',
      err: 'Achar que as cinzas “adubam” e resolvem o problema.',
      recap: 'Sem **decompositores**, sem **bactérias fixadoras** e sem **matéria orgânica**, o nitrogênio para de circular.',
      hint1: 'Quem trabalha no solo no ciclo do nitrogênio?',
      hint2: 'Use: bactérias, decompositores, matéria orgânica, nitrogênio.',
      guided: { type: 'fill', prompt: 'Complete a explicação:', text: 'As queimadas matam plantas, animais e as {0} do solo, como as fixadoras e as decompositoras, e queimam a {1} orgânica. Assim, diminuem os processos que devolvem e fixam {2} no solo.', answers: ['bactérias', 'matéria', 'nitrogênio'], bank: ['nuvens', 'água'] },
      review: { type: 'mc', prompt: 'Depois de uma queimada, por que o solo pode ficar pobre em nitrogênio?', options: [ok('Porque morreram decompositores e bactérias do solo e a matéria orgânica queimou'), no('Porque choveu', 'A chuva não é a causa aqui.'), no('Porque o fogo produz nitrogênio', 'O fogo destrói quem ajuda no ciclo.')] },
      scene: { flag: 'q_L6-Q7', text: 'O trecho queimado do Cerrado começa a se recuperar.' }
    }
  ];

  EN.data.questions = Q;
  EN.data.questionById = {};
  Q.forEach((q) => { EN.data.questionById[q.id] = q; });

  /* Lista oficial exigida — usada pela auditoria. */
  EN.data.REQUIRED_IDS = ['L1-Q1', 'L1-Q2', 'L1-Q3', 'L1-Q4', 'L1-Q5', 'L1-Q6', 'L2-Q1', 'L2-Q2', 'L2-Q3', 'L2-Q4', 'L2-Q5', 'L2-Q6', 'L2-Q7', 'L2-Q8', 'L2-Q9',
    'L3-Q1', 'L3-Q2', 'L3-Q3', 'L3-Q4', 'L3-Q5', 'L3-Q6', 'L3-Q7', 'L3-Q8', 'L3-Q9', 'L3-Q10', 'L3-Q11', 'L4-Q1', 'L4-Q2', 'L4-Q3',
    'L5-Q1', 'L5-Q2', 'L5-Q3', 'L5-Q4', 'L5-Q5', 'L5-Q6', 'L5-Q7', 'L6-Q1', 'L6-Q2', 'L6-Q3', 'L6-Q4', 'L6-Q5', 'L6-Q6', 'L6-Q7'];
})();
