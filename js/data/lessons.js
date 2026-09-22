/* =====================================================================
   data/lessons.js — LIÇÕES (missões de aprendizagem dentro do mundo),
   REGIÕES, MISSÕES SECUNDÁRIAS e ARENA FINAL.
   Cada lição segue a sequência pedagógica:
     cena curta (say) → explicação (explain, 1 ideia por cartão)
     → exemplo guiado de Lumi (guided) → checagem de leitura (check)
     → treino (train) → questão do livro (q) → consequência (flag)
   {nome} é trocado pelo nome do jogador.
   ===================================================================== */
(function () {
  'use strict';
  const ok = (t, fb, extra) => Object.assign({ t, ok: true, fb }, extra || {});
  const no = (t, fb, extra) => Object.assign({ t, ok: false, fb }, extra || {});

  const L = {};

  /* ============================ REGIÃO 1 ============================ */
  L.r1_prep = {
    region: 'r1', entity: 'kaua', title: 'Preparar a investigação', obj: 'Fale com o Guia Kauã na entrada da trilha',
    steps: [
      { say: 'kaua', lines: ['Olá, {nome}! Eu sou o Kauã, guia desta trilha.', 'A Névoa do Desequilíbrio deixou os animais confusos. Para entrar na mata, precisamos estar preparados.', 'Aqui é uma área de preservação. Visita só com guia. Combinado?'] },
      { say: 'lumi', lines: ['Lumi aqui! Vou ficar do seu lado o tempo todo.', 'Vamos aprender a investigar a natureza com segurança.'] },
      { explain: [
        { title: 'Investigar com segurança', art: '☀️🌧️🦟🐍', text: 'Numa investigação na natureza, precisamos de **proteção contra o Sol, a chuva, os insetos e os animais perigosos**. Também é importante **levar itens adequados** e **estar acompanhado de um adulto**. Em uma área de preservação, a visita deve ser feita com um **guia especializado**.' },
        { title: 'Área de preservação', art: '🏞️🛡️', text: 'Uma **área de preservação** é protegida por lei para conservar o **solo**, o **ar**, os **rios**, as **plantas** e os **animais**. Por isso, nela observamos sem tocar nos animais, sem arrancar plantas e sem sair da trilha.' }
      ] },
      { guided: { title: 'Lumi arruma a mochila', steps: [
        { art: '👒🧴', text: 'Vai fazer Sol? Então levo **chapéu** e **protetor solar**.' },
        { art: '🦟', text: 'Na mata há insetos: levo **repelente**.' },
        { art: '🥾', text: 'O chão tem pedras e galhos: uso **calçado fechado**.' },
        { art: '💧⛑️', text: 'Levo **água** e um **kit de primeiros socorros**. E nunca vou sozinha: vou com um adulto e com o guia!' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS informações que estão no texto.', options: [ok('Em área de preservação, a visita deve ter um guia especializado'), ok('A área de preservação é protegida por lei'), no('Podemos ir sozinhos se levarmos água', 'O texto diz para estar acompanhado de um adulto.'), no('Na área de preservação podemos arrancar plantas', 'Ela existe para conservar as plantas.')] } },
      { train: [
        { type: 'hotspot', level: 'explorador', prompt: 'Monte a investigação: toque nos itens adequados e EVITE as ações inadequadas.', items: [
          { id: 'agua', t: 'Água', icon: '💧', x: 12, y: 22, ok: true }, { id: 'chapeu', t: 'Chapéu', icon: '👒', x: 38, y: 18, ok: true },
          { id: 'protetor', t: 'Protetor solar', icon: '🧴', x: 64, y: 22, ok: true }, { id: 'repelente', t: 'Repelente', icon: '🦟', x: 88, y: 18, ok: true },
          { id: 'calcado', t: 'Calçado fechado', icon: '🥾', x: 12, y: 58, ok: true }, { id: 'kit', t: 'Kit de primeiros socorros', icon: '⛑️', x: 38, y: 56, ok: true },
          { id: 'tocar', t: 'Tocar nos animais', icon: '✋', x: 64, y: 58, ok: false, fb: 'Observe de longe: não toque nos animais.' },
          { id: 'arrancar', t: 'Arrancar plantas', icon: '🥀', x: 88, y: 56, ok: false, fb: 'Na área de preservação, as plantas são protegidas.' },
          { id: 'sozinho', t: 'Sair sozinho da trilha', icon: '🚶', x: 50, y: 88, ok: false, fb: 'Fique na trilha, com um adulto e com o guia.' }
        ] }
      ] },
      { say: 'kaua', lines: ['Ótimo! Mochila pronta e regras entendidas. Vou abrir o portão da trilha.'] },
      { flag: 'r1_portao' },
      { say: 'lumi', lines: ['O portão abriu! Vamos procurar a Guardiã Nara no posto da guarda.', 'Se quiser treinar, a Pista “Trilha Segura” fica perto da entrada.'] }
    ],
    after: ['Lembre: chapéu, água, protetor, repelente, calçado fechado e kit de primeiros socorros. E sempre com um adulto!']
  };

  L.r1_energia = {
    region: 'r1', entity: 'nara', title: 'Do que os animais precisam', obj: 'Converse com a Guardiã Nara no posto da guarda',
    notebook: ['habitat'],
    steps: [
      { say: 'nara', lines: ['Você deve ser {nome}, o novo Guardião! Eu sou a Nara e cuido dos animais silvestres desta trilha.', 'Antes de salvar os animais, precisamos entender do que eles precisam.'] },
      { explain: [
        { title: 'Plantas produzem alimento', art: '🌱☀️', text: 'As **plantas produzem o próprio alimento** por meio da **fotossíntese**, usando a energia da luz do Sol. Por isso, as plantas não precisam comer outros seres vivos.' },
        { title: 'Animais obtêm energia', art: '🐒🍌  🦫🌾', text: 'Os **animais obtêm energia** alimentando-se de **outros seres vivos** ou de **restos de matéria orgânica**. O macaco come frutos, a capivara come gramíneas e a onça pode comer capivaras.' },
        { title: 'Habitat', art: '🌳🍌🏠🐣', text: '**Habitat** é o ambiente onde o ser vivo encontra **alimento**, **abrigo** e **condições para se reproduzir**. Muitos animais têm **alimentação específica**: se forem retirados do seu habitat, podem não encontrar alimento, abrigo nem condições de reprodução.' }
      ] },
      { guided: { title: 'Lumi analisa o macaco', steps: [
        { art: '🍌', text: 'Onde o macaco encontra frutos? Na floresta → **alimento**.' },
        { art: '🌳', text: 'Onde ele se abriga? Nos galhos das árvores → **abrigo**.' },
        { art: '🐣', text: 'Onde ele cuida dos filhotes? No alto das árvores → **condições para se reproduzir**.' },
        { art: '✅', text: 'Conclusão: a floresta é o **habitat** do macaco!' }
      ] } },
      { check: { type: 'fill', prompt: 'Checagem de leitura: complete a frase.', text: 'Habitat é o ambiente onde o ser vivo encontra {0}, {1} e condições para se {2}.', answers: ['alimento', 'abrigo', 'reproduzir'], bank: ['brincar', 'televisão'] } },
      { train: [
        { type: 'classify', level: 'explorador', prompt: 'Quem produz o próprio alimento e quem se alimenta de outros seres vivos?', bins: [{ id: 'p', label: 'Produz o próprio alimento', icon: '☀️' }, { id: 'c', label: 'Come outros seres vivos', icon: '🍽️' }], cards: [{ t: 'Capim', icon: '🌾', bin: 'p' }, { t: 'Árvore frutífera', icon: '🌳', bin: 'p' }, { t: 'Macaco', icon: '🐒', bin: 'c' }, { t: 'Capivara', icon: '#capivara', bin: 'c' }, { t: 'Onça-pintada', icon: '🐆', bin: 'c' }] }
      ] },
      { say: 'nara', lines: ['Muito bem! Agora vá até a Clareira dos Tocos, ao norte. O macaco Tico precisa de ajuda.'] }
    ],
    after: ['Habitat: alimento, abrigo e condições para se reproduzir. Não esqueça!']
  };

  L.r1_habitat = {
    region: 'r1', entity: 'macaco', title: 'O macaco sem floresta', obj: 'Encontre o macaco Tico na Clareira dos Tocos',
    steps: [
      { say: 'lumi', lines: ['Olhe esses tocos… Aqui havia árvores.', 'Aquele é o Tico. Ele parece triste e com fome.'] },
      { say: 'nara', lines: ['Esta parte da floresta foi derrubada. O Tico perdeu as árvores onde vivia.', 'Os primatas brasileiros dependem das florestas.'] },
      { explain: [
        { title: 'Perda de floresta = perda de habitat', art: '🌳➡️🪵', text: 'Quando uma floresta é retirada, os animais que viviam nela **perdem o habitat**. Os **primatas brasileiros**, como os macacos, **dependem das florestas**. Sem as árvores, eles podem ficar sem alimento, sem abrigo e sem lugar seguro para ter filhotes.' }
      ] },
      { q: 'L1-Q1' },
      { say: 'nara', lines: ['Isso mesmo. Agora pense em soluções: o que podemos fazer para os macacos não desaparecerem?'] },
      { explain: [
        { title: 'Proteger é conservar', art: '🛡️🌳', text: 'Uma **área de preservação** é protegida por lei para conservar solo, ar, rios, plantas e animais. Proteger os macacos é proteger as **florestas**, o habitat deles, e deixá-los **livres na natureza**.' }
      ] },
      { q: 'L1-Q2' },
      { say: 'lumi', lines: ['Olhe! As mudas cresceram e o Tico voltou para os galhos!', 'Agora a Nara quer mostrar algo no posto da guarda.'] }
    ],
    after: ['O Tico está bem melhor com as árvores de volta!']
  };

  L.r1_silvestre = {
    region: 'r1', entity: 'placa_silvestre', title: 'Silvestre ou doméstico?', obj: 'Leia a placa “Animais Silvestres” no posto da guarda',
    notebook: ['silvestre'],
    steps: [
      { say: 'nara', lines: ['Este é o Pipoca, meu cachorro. Ele mora comigo aqui no posto.', 'Já o Tico vive livre na floresta. Eles são bem diferentes!'] },
      { explain: [
        { title: 'Silvestre × doméstico', art: '🐒🌳  |  🐕🏡', text: 'Animais **silvestres** vivem **livres na natureza** e **não devem ser tratados como animais domésticos**. Animais **domésticos** passaram por um **longo processo de domesticação** e de convivência com os seres humanos, como o cachorro Pipoca.' }
      ] },
      { guided: { title: 'Lumi compara', steps: [
        { art: '🐕', text: 'O Pipoca vive com pessoas e passou por domesticação → **doméstico**.' },
        { art: '🐒', text: 'O Tico vive livre na floresta → **silvestre**.' },
        { art: '🚫🏠', text: 'Por isso, um animal silvestre **não deve** virar bichinho de estimação.' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS frases corretas.', options: [ok('Animais silvestres vivem livres na natureza'), ok('Animais domésticos passaram por domesticação'), no('Todo animal pequeno é doméstico', 'O tamanho não define isso.'), no('Podemos levar um animal silvestre para casa', 'Silvestres não devem ser tratados como domésticos.')] } },
      { q: 'L1-Q3' }
    ],
    after: ['Animais silvestres: observe de longe e deixe-os livres.']
  };

  L.r1_pantanal = {
    region: 'r1', entity: 'mirante', title: 'Vida no Pantanal', obj: 'Suba no Mirante do Pantanal, a leste',
    notebook: ['biodiversidade', 'cadeia'],
    steps: [
      { say: 'lumi', lines: ['Do alto do mirante dá para ver o trecho do Pantanal!', 'Quanta vida diferente…'] },
      { explain: [
        { title: 'Biodiversidade', art: '🐆🦫🦜🐟🌿', text: '**Biodiversidade** é a **variedade de seres vivos**. O **Pantanal** apresenta **grande biodiversidade**: muitas espécies de aves, peixes, plantas e mamíferos, como capivaras e onças-pintadas.' },
        { title: 'Capivara e onça', art: '🌾 ➜ 🦫 ➜ 🐆', text: 'A **capivara** é **herbívora** e come **gramíneas**. A **onça-pintada** é **carnívora** e pode **predar capivaras**. Assim, gramíneas, capivaras e onças ficam ligadas pela alimentação.' }
      ] },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS informações corretas.', options: [ok('A capivara é herbívora e come gramíneas'), ok('O Pantanal apresenta grande biodiversidade'), no('A onça-pintada come gramíneas', 'A onça é carnívora.'), no('Biodiversidade é a quantidade de água de um lugar', 'É a variedade de seres vivos.')] } },
      { train: [
        { type: 'mc', level: 'explorador', prompt: 'Pelo binóculo, você vê a capivara comendo. O que ela come?', options: [ok('Gramíneas'), no('Peixes', 'A capivara é herbívora.'), no('Onças', 'É a onça que pode predar a capivara, não o contrário.')] }
      ] },
      { q: 'L1-Q4' },
      { q: 'L1-Q5' },
      { say: 'lumi', lines: ['O Pantanal está em equilíbrio de novo! Falta visitar a Pesquisadora Aurora, no ateliê a oeste.'] }
    ],
    after: ['Do mirante você vê capivaras, onças e aves: é a biodiversidade do Pantanal.']
  };

  L.r1_desenho = {
    region: 'r1', entity: 'aurora', title: 'Fotografia e desenho', obj: 'Visite a Pesquisadora Aurora no ateliê',
    steps: [
      { say: 'aurora', lines: ['Olá! Sou a Aurora, pesquisadora. Eu fotografo e desenho os seres vivos da trilha.', 'Veja: tirei uma foto da capivara… e também fiz um desenho.'] },
      { explain: [
        { title: 'Observar e registrar', art: '📷 + ✏️', text: 'Cientistas **observam** e **registram** os seres vivos. A fotografia mostra tudo o que estava na cena. No **desenho científico**, a pesquisadora **seleciona e destaca** detalhes importantes e escreve os nomes das partes. As duas formas se **complementam**.' }
      ] },
      { guided: { title: 'Lumi compara foto e desenho', steps: [
        { art: '📷', text: 'Na foto, a capivara aparece com capim e sombras na frente.' },
        { art: '✏️', text: 'No desenho, Aurora mostra só a capivara e **destaca** as patas e os dentes.' },
        { art: '🏷️', text: 'Ela **escreve os nomes** das partes ao lado.' },
        { art: '🤝', text: 'Conclusão: o desenho **destaca e registra** detalhes; a foto também ajuda. Uma **complementa** a outra.' }
      ] } },
      { q: 'L1-Q6' },
      { say: 'aurora', lines: ['Perfeito! Agora a Névoa desta trilha está fraca. Vá até o Altar do Cristal, no centro da trilha.'] }
    ],
    after: ['Desenhar ajuda a observar com atenção. Volte quando quiser!']
  };

  /* ============================ REGIÃO 2 ============================ */
  L.r2_produtores = {
    region: 'r2', entity: 'broto', title: 'Quem produz, quem consome', obj: 'Fale com o Professor Broto na horta',
    notebook: ['produtores', 'consumidores'],
    steps: [
      { say: 'broto', lines: ['Bem-vindo ao Vale das Cadeias Alimentares! Sou o Professor Broto.', 'A Névoa embaralhou quem come quem. Vamos organizar tudo, começando pelos produtores.'] },
      { explain: [
        { title: 'Produtores', art: '🌱🟢', text: 'Quase toda **cadeia alimentar** começa por um **produtor**. Produtores **fabricam seu alimento**. As **plantas** são os principais produtores terrestres, e as **algas** são importantes produtores aquáticos.' },
        { title: 'Fotossíntese', art: '☀️ + 💧 + ⚪ ➜ 🌿', text: 'Na **fotossíntese**, as plantas usam **energia solar**, **água** e **gás carbônico** para formar **matéria orgânica**, que é o seu alimento.' },
        { title: 'Consumidores', art: '🦫🐇🦊🧒', text: '**Consumidores** alimentam-se de **outros seres vivos**. A capivara come capim; a raposa come coelhos. Nós, seres humanos, também somos consumidores.' }
      ] },
      { guided: { title: 'Lumi classifica a horta', steps: [
        { art: '🌾', text: 'O capim da horta faz fotossíntese → **produtor**.' },
        { art: '🐇', text: 'O coelho come o capim → **consumidor**.' },
        { art: '🟢', text: 'As algas do lago fazem fotossíntese → **produtoras**, mesmo vivendo na água!' }
      ] } },
      { check: { type: 'fill', prompt: 'Checagem de leitura: complete a frase.', text: 'Na fotossíntese, as plantas usam energia {0}, {1} e gás carbônico para formar matéria orgânica.', answers: ['solar', 'água'], bank: ['elétrica', 'areia'] } },
      { train: [
        { type: 'mc', level: 'explorador', prompt: 'Qual destes é um importante produtor aquático?', options: [ok('Algas'), no('Peixes', 'Peixes são consumidores.'), no('Seres humanos', 'Somos consumidores.')] }
      ] },
      { q: 'L2-Q1' },
      { say: 'broto', lines: ['Excelente! Agora vá ao Painel das Setas, perto do moinho. A Névoa bagunçou as setas.'] }
    ],
    after: ['Produtor fabrica o alimento; consumidor come outros seres vivos.']
  };

  L.r2_setas = {
    region: 'r2', entity: 'painel_setas', title: 'O sentido da seta', obj: 'Examine o Painel das Setas',
    notebook: ['seta', 'niveis'],
    steps: [
      { say: 'broto', lines: ['Este é o Painel das Setas. A Névoa virou algumas ao contrário!', 'Lembre: a seta não mostra quem é maior.'] },
      { explain: [
        { title: 'O sentido da seta', art: '🥕 ➜ 🐇', text: 'Numa cadeia alimentar, a seta **sai do organismo que serve de alimento** e **aponta para quem o come**. Repita comigo: **alimento → consumidor**. Em cenoura → coelho, a seta aponta para o coelho, porque o coelho come a cenoura.' },
        { title: 'Níveis tróficos', art: '1️⃣🌾 2️⃣🦫 3️⃣🐆', text: 'Cada posição da cadeia é um **nível trófico**. Em **capim → capivara → onça**: o capim é **produtor**; a capivara é **consumidora primária** e **herbívora**; a onça é **consumidora secundária** e **carnívora**. São **três níveis tróficos**.' }
      ] },
      { guided: { title: 'Lumi conta níveis', steps: [
        { art: '🌾➜🦫➜🐆', text: 'Cadeia: capim → capivara → onça.' },
        { art: '1️⃣2️⃣3️⃣', text: 'Conto os seres: capim (1), capivara (2), onça (3).' },
        { art: '⚠️', text: 'Não conto as setas! São 2 setas, mas **3 níveis**.' }
      ] } },
      { check: { type: 'order', layout: 'list', prompt: 'Checagem de leitura: organize os passos para ler uma cadeia.', items: [{ t: 'Encontre o produtor, onde a cadeia começa', icon: '🌱' }, { t: 'Siga a seta até quem come o produtor', icon: '➡️' }, { t: 'Continue seguindo as setas até o último consumidor', icon: '🏁' }] } },
      { train: [
        { type: 'mc', level: 'explorador', prompt: 'Em “capim → capivara”, a seta mostra que:', options: [ok('A capivara come o capim'), no('O capim come a capivara', 'Quase! A seta não mostra quem é maior. Ela sai do alimento e aponta para quem o come.')] }
      ] },
      { q: 'L2-Q2' },
      { q: 'L2-Q3' },
      { say: 'lumi', lines: ['As setas do painel brilharam! Agora vamos ao sítio da Maru, ao sul.'] }
    ],
    after: ['Alimento → consumidor. A seta aponta para quem come!']
  };

  L.r2_paisagem = {
    region: 'r2', entity: 'maru', title: 'Cadeias da paisagem rural', obj: 'Visite a Agricultora Maru no sítio',
    steps: [
      { say: 'maru', lines: ['Oi! Eu sou a Maru e cuido deste sítio.', 'Minha paisagem tem capim, planta aquática, insetos, rãs, peixes, aves, coelhos… Quem come quem?'] },
      { explain: [
        { title: 'Montando cadeias', art: '🌾➜🦗➜🐸➜🐍', text: 'Para montar uma cadeia, comece por um **produtor** e pergunte: **quem come este ser?** Repita a pergunta até chegar ao último consumidor. Numa mesma paisagem podem existir várias cadeias diferentes.' }
      ] },
      { guided: { title: 'Lumi monta uma cadeia', steps: [
        { art: '🌾', text: 'Começo pelo capim (produtor).' },
        { art: '🦗', text: 'Quem come capim? O gafanhoto.' },
        { art: '🐸', text: 'Quem come o gafanhoto? A rã.' },
        { art: '🐍', text: 'Quem come a rã? A serpente. Pronto: **capim → gafanhoto → rã → serpente**!' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS frases corretas.', options: [ok('Uma cadeia começa por um produtor'), ok('Para continuar, pergunto: quem come este ser?'), no('A cadeia começa pelo maior animal', 'Começa pelo produtor.'), no('Numa paisagem só existe uma cadeia', 'Podem existir várias.')] } },
      { q: 'L2-Q4' },
      { say: 'maru', lines: ['Que beleza! Ah, a ponte para a floresta está bloqueada pela Névoa. Veja se consegue abri-la.'] }
    ],
    after: ['No meu sítio há várias cadeias ao mesmo tempo!']
  };

  L.r2_ponte = {
    region: 'r2', entity: 'ponte', title: 'A ponte das setas invertidas', obj: 'Desbloqueie a ponte das setas invertidas',
    steps: [
      { say: 'lumi', lines: ['A ponte está bloqueada! As setas estão invertidas.', 'A placa diz: harpia → jararaca → cutia → coquinhos. Isso está errado!'] },
      { explain: [
        { title: 'Setas invertidas', art: '🦅 ⬅ 🐍 ⬅ 🐿️ ⬅ 🥥', text: 'A Névoa colocou a **harpia** primeiro porque ela é grande. Mas a cadeia não começa pelo maior animal: começa pelo **produtor**. A **cutia come coquinhos**, a **jararaca** pode comer a cutia e a **harpia** pode comer a jararaca.' }
      ] },
      { q: 'L2-Q6' },
      { say: 'lumi', lines: ['A ponte se abriu! O Professor Broto já foi para a clareira da floresta.'] }
    ],
    after: ['A ponte agora mostra as setas certas.']
  };

  L.r2_decomp = {
    region: 'r2', entity: 'broto_floresta', title: 'Os decompositores', obj: 'Encontre o Professor Broto na clareira da floresta',
    notebook: ['decompositores'],
    steps: [
      { say: 'broto', lines: ['Olhe este tronco caído, cheio de cogumelos. Eles estão trabalhando!'] },
      { explain: [
        { title: 'Decompositores', art: '🍄🦠🍂', text: '**Decompositores** são **fungos e bactérias**. Eles decompõem a **matéria orgânica** de **qualquer nível** da cadeia — plantas, herbívoros e carnívoros — e **devolvem matéria e nutrientes ao solo**, permitindo que as plantas os absorvam.' },
        { title: 'Matéria', art: '⚖️📦', text: '**Matéria** é tudo o que **tem massa** e **ocupa espaço (volume)**. Nas cadeias alimentares, a matéria é **transferida** entre os seres vivos: quando o coelho come a cenoura, recebe matéria da cenoura.' }
      ] },
      { guided: { title: 'Lumi acompanha uma folha', steps: [
        { art: '🍂', text: 'Uma folha cai no chão da floresta.' },
        { art: '🍄🦠', text: 'Fungos e bactérias decompõem a folha.' },
        { art: '🟫', text: 'Nutrientes voltam ao solo.' },
        { art: '🌳', text: 'As raízes absorvem esses nutrientes. A matéria voltou a circular!' }
      ] } },
      { check: { type: 'order', layout: 'list', prompt: 'Checagem de leitura: organize as etapas.', items: [{ t: 'Uma folha cai no chão', icon: '🍂' }, { t: 'Fungos e bactérias decompõem a folha', icon: '🍄' }, { t: 'Nutrientes voltam ao solo', icon: '🟫' }, { t: 'As raízes das plantas absorvem os nutrientes', icon: '🌳' }] } },
      { train: [
        { type: 'mc', level: 'explorador', prompt: 'Matéria é tudo o que…', options: [ok('Tem massa e ocupa espaço'), no('Só existe nos animais', 'Plantas, pedras e água também são matéria.'), no('Não pode ser transferido', 'Nas cadeias, a matéria passa de um ser para outro.')] }
      ] },
      { q: 'L2-Q5' },
      { say: 'broto', lines: ['Muito bem! A Pescadora Iná está no lago, logo ali. Ela tem um painel com uma teia enorme.'] }
    ],
    after: ['Fungos e bactérias: os recicladores da natureza.']
  };

  L.r2_teia = {
    region: 'r2', entity: 'ina', title: 'A teia do lago', obj: 'Converse com a Pescadora Iná no lago',
    notebook: ['teia'],
    steps: [
      { say: 'ina', lines: ['Olá, Guardião! Sou a Iná, pescadora do lago.', 'Aqui as cadeias se cruzam e formam uma teia. Veja meu Painel da Teia!'] },
      { explain: [
        { title: 'Teia alimentar', art: '🕸️🌿🦗🐁🐍🦅', text: 'Um animal pode **comer alimentos diferentes** e participar de **várias cadeias**. As cadeias ligadas formam uma **teia alimentar**. No painel, o camundongo come plantas e é comido pela serpente e pelo gavião.' },
        { title: 'Populações ligadas', art: '📈📉', text: '**Mudanças em uma população afetam outras.** Mais predadores podem **diminuir as presas**. Menos alimento pode **diminuir os consumidores**. Por isso, antes de responder, siga as setas com o dedo.' }
      ] },
      { guided: { title: 'Lumi segue as setas', steps: [
        { art: '❓🦅', text: 'Pergunta: e se o gavião sumisse?' },
        { art: '🦅➜🐍🐁', text: 'Sigo as setas que chegam ao gavião: ele come serpentes e camundongos.' },
        { art: '📈', text: 'Sem gavião, serpentes e camundongos têm menos predadores e **poderiam aumentar**.' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS frases corretas.', options: [ok('Um animal pode participar de várias cadeias'), ok('Mudanças em uma população afetam outras'), no('Numa teia, cada animal come só um tipo de alimento', 'Um animal pode comer alimentos diferentes.'), no('Mais predadores fazem as presas aumentarem', 'Mais predadores podem diminuir as presas.')] } },
      { train: [
        { type: 'mc', level: 'explorador', prompt: 'Olhe o painel: o que o camundongo come?', img: 'teia', options: [ok('Plantas e sementes'), no('Serpentes', 'É a serpente que come o camundongo.'), no('Gaviões', 'É o gavião que come o camundongo.')] }
      ] },
      { q: 'L2-Q7' },
      { q: 'L2-Q8' },
      { q: 'L2-Q9' },
      { say: 'ina', lines: ['A teia está completa e o lago voltou a brilhar! Vá ao Altar do Cristal, perto da ponte.'] }
    ],
    after: ['Siga as setas com o dedo: é o segredo da teia!']
  };

  /* ============================ REGIÃO 3 ============================ */
  L.r3_carbono = {
    region: 'r3', entity: 'cicla', title: 'Onde está o carbono', obj: 'Fale com a Dra. Cicla no saguão do laboratório',
    notebook: ['carbono'],
    steps: [
      { say: 'cicla', lines: ['Bem-vindo ao Laboratório dos Ciclos! Sou a Dra. Cicla.', 'A Névoa desligou nossas máquinas. Para religá-las, precisamos entender como a matéria circula.'] },
      { explain: [
        { title: 'Onde está o carbono', art: '🌱🐄🛢️⚫', text: 'Os corpos de **plantas, animais** e outros seres vivos contêm **carbono**. O **petróleo** e o **carvão mineral** também: eles se originaram de **seres vivos de milhões de anos** e são a base dos **combustíveis fósseis**.' },
        { title: 'Carbono no ar', art: '🌫️⚪', text: 'Na **atmosfera**, o carbono aparece principalmente como **gás carbônico**. As plantas **usam gás carbônico** na **fotossíntese**. A **respiração**, a **decomposição** e as **queimadas liberam** gás carbônico.' }
      ] },
      { guided: { title: 'Lumi procura o carbono', steps: [
        { art: '🍃', text: 'Uma folha? É de planta → **tem carbono**.' },
        { art: '🪶', text: 'Uma pena? É de animal → **tem carbono**.' },
        { art: '⛽', text: 'Gasolina? Vem do petróleo → **tem carbono**.' },
        { art: '🌫️', text: 'E o ar? Tem gás carbônico → **tem carbono**!' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS informações corretas.', options: [ok('Petróleo e carvão mineral se originaram de seres vivos de milhões de anos'), ok('Na atmosfera, o carbono aparece principalmente como gás carbônico'), no('Só os animais têm carbono', 'Plantas e outros seres vivos também têm.'), no('As plantas liberam gás carbônico na fotossíntese', 'Na fotossíntese, elas USAM gás carbônico.')] } },
      { q: 'L3-Q1' },
      { say: 'cicla', lines: ['Excelente! Agora vá à Sala do Oxigênio, a leste. A Máquina dos Gases está desligada.'] }
    ],
    after: ['Carbono: nos seres vivos, no petróleo, no carvão e no gás carbônico do ar.']
  };

  L.r3_gases = {
    region: 'r3', entity: 'maquina_gases', title: 'A Máquina dos Gases', obj: 'Religue a Máquina dos Gases na Sala do Oxigênio',
    notebook: ['oxigenio'],
    steps: [
      { say: 'lumi', lines: ['A máquina está desligada! Olhe: há cartões espalhados — fotossíntese, respiração, decomposição e combustão.'] },
      { explain: [
        { title: 'Quatro processos', art: '🌱 🐇 🍄 🔥', text: '**Fotossíntese**: a planta usa gás carbônico e **libera gás oxigênio**. **Respiração**: os seres vivos usam gás oxigênio e **liberam gás carbônico**. **Decomposição**: os decompositores também respiram e liberam gás carbônico. **Combustão** (queima): consome gás oxigênio e libera gás carbônico.' },
        { title: 'Ciclo do oxigênio', art: '💧⚪🔵', text: 'O elemento **oxigênio** aparece na **água**, no **gás carbônico** e no **gás oxigênio**. Por isso, o ciclo do oxigênio se relaciona aos ciclos da **água** e do **carbono**. O gás oxigênio é **liberado na fotossíntese** e **consumido na respiração e na combustão**.' }
      ] },
      { guided: { title: 'Lumi lê os cartões', steps: [
        { art: '🌱', text: 'Fotossíntese: entra gás carbônico, **sai gás oxigênio**.' },
        { art: '🐇', text: 'Respiração: entra gás oxigênio, **sai gás carbônico**.' },
        { art: '🍄', text: 'Decomposição: os decompositores respiram → entra oxigênio, **sai gás carbônico**.' },
        { art: '🔥', text: 'Combustão: entra oxigênio, **sai gás carbônico**.' }
      ] } },
      { check: { type: 'classify', prompt: 'Checagem de leitura: o que cada processo LIBERA?', bins: [{ id: 'o2', label: 'Libera gás oxigênio', icon: '🔵' }, { id: 'co2', label: 'Libera gás carbônico', icon: '⚪' }], cards: [{ t: 'Fotossíntese', icon: '🌱', bin: 'o2' }, { t: 'Respiração', icon: '🐇', bin: 'co2' }, { t: 'Decomposição', icon: '🍄', bin: 'co2' }, { t: 'Combustão', icon: '🔥', bin: 'co2' }] } },
      { q: 'L3-Q7' },
      { q: 'L3-Q10' },
      { say: 'lumi', lines: ['A máquina ligou! Agora o Telão do Clima, na Sala do Carbono, quer mostrar algo.'] }
    ],
    after: ['Fotossíntese libera oxigênio; respiração e combustão liberam gás carbônico.']
  };

  L.r3_aquecimento = {
    region: 'r3', entity: 'telao', title: 'Efeito estufa e aquecimento', obj: 'Examine o Telão do Clima na Sala do Carbono',
    notebook: ['estufa'],
    steps: [
      { say: 'cicla', lines: ['Este telão mostra a temperatura média da Terra. Veja como ela está subindo.'] },
      { explain: [
        { title: 'Efeito estufa natural', art: '🌍☀️', text: 'O **gás carbônico** ajuda a **reter calor** na atmosfera. Esse **efeito estufa natural** é importante: ele **mantém a Terra aquecida**.' },
        { title: 'Excesso de gás carbônico', art: '🚗🏭🔥 ➜ 🌡️', text: 'Queimar **combustíveis fósseis** libera **rapidamente** o carbono guardado há **milhões de anos**. Com isso, há **gás carbônico em excesso**, que **intensifica o efeito estufa** e contribui para o **aquecimento global**.' }
      ] },
      { guided: { title: 'Lumi segue o carbono', steps: [
        { art: '🚗', text: 'O carro queima gasolina → libera gás carbônico.' },
        { art: '🪓🌳', text: 'Floresta derrubada → menos plantas retirando gás carbônico do ar.' },
        { art: '🌫️⬆️', text: 'Mais gás carbônico no ar → efeito estufa mais forte.' },
        { art: '🌡️', text: 'Resultado: a temperatura média sobe.' }
      ] } },
      { check: { type: 'tfj', prompt: 'Checagem de leitura: verdadeiro ou falso?', partA: { prompt: '“O efeito estufa natural é importante para manter a Terra aquecida.”', options: [ok('Verdadeiro'), no('Falso', 'Releia: o efeito estufa NATURAL é importante.')] }, partB: { prompt: 'Justifique:', options: [ok('O gás carbônico ajuda a reter calor; o problema é o excesso'), no('Todo gás carbônico é sempre ruim', 'O natural é importante; o problema é o excesso.')] } } },
      { q: 'L3-Q9' },
      { say: 'lumi', lines: ['Vamos ao Medidor de Pegada Ecológica, no corredor central.'] }
    ],
    after: ['Efeito estufa natural: bom. Excesso de gás carbônico: aquecimento global.']
  };

  L.r3_pegada = {
    region: 'r3', entity: 'medidor', title: 'A pegada ecológica', obj: 'Use o Medidor de Pegada Ecológica',
    notebook: ['pegada'],
    steps: [
      { say: 'lumi', lines: ['O Medidor de Pegada está piscando no vermelho!'] },
      { explain: [
        { title: 'Pegada ecológica', art: '👣🌎', text: 'A **pegada ecológica** representa a **área produtiva de terra e mar** necessária para **sustentar o consumo** de uma pessoa ou sociedade e **absorver seus impactos**. Ela pode ser medida em **hectare global (gha)**.' },
        { title: 'Diminuir a pegada', art: '♻️💡🚲', text: '**Reduzir o consumo e o desperdício**, **reutilizar**, **reciclar**, **economizar água e energia** e escolher **deslocamentos menos poluentes** podem **reduzir a pegada ecológica**.' }
      ] },
      { guided: { title: 'Lumi mede um dia', steps: [
        { art: '💡', text: 'Deixei a luz acesa sem ninguém no quarto → a pegada **sobe**.' },
        { art: '🚲', text: 'Fui de bicicleta à escola → a pegada **desce**.' },
        { art: '🫙', text: 'Reaproveitei um pote → a pegada **desce**.' }
      ] } },
      { check: { type: 'fill', prompt: 'Checagem de leitura: complete.', text: 'A pegada ecológica pode ser medida em {0} global (gha).', answers: ['hectare'], bank: ['litro', 'metro'] } },
      { train: [
        { type: 'classify', level: 'construtor', prompt: 'Essa atitude aumenta ou reduz a pegada ecológica?', bins: [{ id: 'up', label: 'Aumenta a pegada', icon: '⬆️' }, { id: 'down', label: 'Reduz a pegada', icon: '⬇️' }], cards: [{ t: 'Jogar comida fora', icon: '🗑️', bin: 'up' }, { t: 'Reciclar embalagens', icon: '♻️', bin: 'down' }, { t: 'Banho muito demorado', icon: '🚿', bin: 'up' }, { t: 'Ir a pé quando possível', icon: '🚶', bin: 'down' }] }
      ] },
      { q: 'L3-Q2' },
      { q: 'L3-Q3' },
      { q: 'L3-Q4' },
      { say: 'lumi', lines: ['O Medidor voltou ao verde! O Robô Bip, na Sala do Nitrogênio, precisa de ajuda.'] }
    ],
    after: ['Menos desperdício, pegada menor!']
  };

  L.r3_nitrogenio = {
    region: 'r3', entity: 'bip', title: 'O ciclo do nitrogênio', obj: 'Ajude o Robô Bip na Sala do Nitrogênio',
    notebook: ['nitrogenio', 'fixadoras'],
    steps: [
      { say: 'bip', lines: ['BIP-BOP! Sou o Bip, robô da Sala do Nitrogênio.', 'Minhas plantas estão com folhas amareladas. Falta nitrogênio? BIP!'] },
      { explain: [
        { title: 'Nitrogênio nos seres vivos', art: '🌱🟡', text: 'O **nitrogênio** faz parte de compostos **essenciais** dos seres vivos. **Plantas** com deficiência podem ter **folhas amareladas**. As plantas **absorvem compostos de nitrogênio do solo pelas raízes**, e os **animais** obtêm nitrogênio pela **alimentação**.' },
        { title: 'Nitrogênio do ar', art: '🌬️🦠🌱', text: 'A **maior parte da atmosfera** é **gás nitrogênio**, mas as plantas **não o absorvem diretamente do ar**. **Bactérias fixadoras** transformam o nitrogênio do ar em compostos que as plantas conseguem absorver. Elas vivem principalmente no **solo** e em **raízes de algumas plantas**.' },
        { title: 'De volta ao solo', art: '🍂➜🟫', text: '**Fezes** e **organismos mortos** são **decompostos**, e compostos com nitrogênio **voltam ao solo**. Assim, o nitrogênio **percorre as cadeias alimentares**. Atenção: **fertilizante em excesso** pode **contaminar rios e lagos** e causar desequilíbrio.' }
      ] },
      { guided: { title: 'Lumi segue o nitrogênio', steps: [
        { art: '🌬️🦠', text: 'Bactérias fixadoras transformam o nitrogênio do ar.' },
        { art: '🌱', text: 'A planta absorve os compostos do solo, pelas raízes.' },
        { art: '🐄', text: 'A vaca come a planta e recebe nitrogênio.' },
        { art: '🍂', text: 'Fezes e restos são decompostos: o nitrogênio volta ao solo.' }
      ] } },
      { check: { type: 'order', layout: 'list', prompt: 'Checagem de leitura: organize o caminho do nitrogênio.', items: [{ t: 'Bactérias fixadoras transformam o nitrogênio do ar', icon: '🦠' }, { t: 'A planta absorve compostos do solo pelas raízes', icon: '🌱' }, { t: 'O animal come a planta e recebe nitrogênio', icon: '🐄' }, { t: 'Fezes e restos são decompostos e o nitrogênio volta ao solo', icon: '🍂' }] } },
      { q: 'L3-Q6' },
      { q: 'L3-Q5' },
      { say: 'bip', lines: ['BIP! As folhas estão verdes de novo! Seu Composto, na composteira, quer mostrar uma coisa.'] }
    ],
    after: ['BIP-BOP! Plantas: raízes. Animais: alimentação. BIP!']
  };

  L.r3_compostagem = {
    region: 'r3', entity: 'composto', title: 'A composteira', obj: 'Visite Seu Composto na composteira',
    notebook: ['compostagem'],
    steps: [
      { say: 'composto', lines: ['Opa! Eu sou o Seu Composto. Aqui nada vira lixo: vira adubo!'] },
      { explain: [
        { title: 'Compostagem', art: '🍌🥕 ➜ ♻️ ➜ 🌱', text: 'A **compostagem** transforma **restos orgânicos** — cascas, folhas, restos de verduras — em **adubo rico em nutrientes**, incluindo **nitrogênio**. Quem faz esse trabalho são os **decompositores**.' }
      ] },
      { train: [
        { type: 'classify', level: 'explorador', prompt: 'É resto orgânico que pode virar adubo?', bins: [{ id: 's', label: 'Resto orgânico: vai para a composteira', icon: '♻️' }, { id: 'n', label: 'Não é resto orgânico', icon: '🚫' }], cards: [{ t: 'Casca de banana', icon: '🍌', bin: 's' }, { t: 'Folhas secas', icon: '🍂', bin: 's' }, { t: 'Restos de verduras', icon: '🥬', bin: 's' }, { t: 'Tampinha de metal', icon: '⚙️', bin: 'n' }] }
      ] },
      { q: 'L3-Q8' },
      { say: 'composto', lines: ['Isso! Agora vá ao Grande Diagrama, no salão central. Ele junta todos os ciclos.'] }
    ],
    after: ['Resto orgânico vira adubo. Adubo vira planta!']
  };

  L.r3_diagrama = {
    region: 'r3', entity: 'diagrama', title: 'O Grande Diagrama', obj: 'Pinte o Grande Diagrama dos Ciclos no salão central',
    steps: [
      { say: 'cicla', lines: ['O Grande Diagrama junta os ciclos da água, do carbono e do oxigênio. A Névoa apagou as cores!'] },
      { explain: [
        { title: 'Os ciclos juntos', art: '🔵🔴⚫', text: 'No diagrama, os ciclos da **água**, do **carbono** e do **oxigênio** aparecem juntos. As setas de **evaporação, transpiração, condensação, precipitação e absorção** são da água. As setas de **gás carbônico** são do carbono. As de **gás oxigênio** são do oxigênio.' }
      ] },
      { guided: { title: 'Lumi pinta três setas', steps: [
        { art: '💧➜💨', text: 'Evaporação: água virando vapor → **azul**.' },
        { art: '⚪➜🌳', text: 'Gás carbônico entrando na planta → **vermelho**.' },
        { art: '🌳➜🔵', text: 'Gás oxigênio saindo da planta → **preto**.' }
      ] } },
      { q: 'L3-Q11' },
      { say: 'cicla', lines: ['Todas as máquinas funcionam! Vá até o Altar do Cristal, no fundo do salão.'] }
    ],
    after: ['Azul = água, vermelho = gás carbônico, preto = gás oxigênio.']
  };

  /* ============================ REGIÃO 4 ============================ */
  L.r4_problema = {
    region: 'r4', entity: 'teo', title: 'O lago verde', obj: 'Fale com o Ribeirinho Téo na margem',
    notebook: ['eutrofizacao'],
    steps: [
      { say: 'teo', lines: ['Eita, Guardião! Meu lago ficou verde e os peixes estão sofrendo.', 'Antes era claro, dava para ver o fundo. Me ajuda?'] },
      { explain: [
        { title: 'Eutrofização', art: '🟢🌊', text: '**Eutrofização** é o **enriquecimento excessivo** de rios e lagos por **nutrientes**, especialmente **nitrogênio e fósforo**. Com nutrientes demais, as **algas aumentam muito** e a água fica **esverdeada**.' }
      ] },
      { guided: { title: 'Lumi investiga', steps: [
        { art: '🟢', text: 'Olho o lago: está verde → **muitas algas**.' },
        { art: '❓', text: 'Por que tantas algas? → **nutrientes demais** na água.' },
        { art: '🔎', text: 'Próximo passo: descobrir **de onde** vêm os nutrientes!' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS informações corretas.', options: [ok('Eutrofização é o enriquecimento excessivo da água por nutrientes'), ok('Os principais nutrientes são nitrogênio e fósforo'), no('Eutrofização é quando a água fica gelada', 'É excesso de nutrientes.'), no('Na eutrofização as algas diminuem', 'As algas aumentam.')] } },
      { say: 'teo', lines: ['Três lugares me preocupam: o cano de esgoto, a plantação na margem e aquele monte de resíduos. Investigue os três e volte aqui!'] }
    ],
    after: ['Investigue o cano, a plantação e os resíduos.']
  };

  L.r4_fontes = {
    region: 'r4', entity: 'teo', title: 'As entradas de nutrientes', obj: 'Investigue as 3 entradas de nutrientes e volte ao Téo',
    requiresVisit: ['cano', 'campo_fert', 'descarte'],
    visitText: 'Investigue as três entradas: o cano de esgoto, a plantação adubada e o monte de resíduos.',
    steps: [
      { say: 'teo', lines: ['E então, o que você encontrou nas três entradas?'] },
      { explain: [
        { title: 'Por onde entram os nutrientes', art: '🚽🌧️🗑️', text: 'Os nutrientes podem chegar à água por **esgoto sem tratamento**, por **fertilizantes levados pela chuva** e pelo **descarte inadequado** de matéria e resíduos.' }
      ] },
      { q: 'L4-Q1' },
      { say: 'teo', lines: ['Agora sabemos de onde vem o problema! O Dito, da plantação, quer entender o que acontece dentro do lago.'] }
    ],
    after: ['Esgoto, fertilizante e resíduos: as três entradas.']
  };

  L.r4_etapas = {
    region: 'r4', entity: 'dito', title: 'As etapas da eutrofização', obj: 'Converse com o Agricultor Dito na plantação',
    steps: [
      { say: 'dito', lines: ['Oi, sou o Dito. Acho que o adubo da minha plantação escorre com a chuva…', 'Quero entender o que acontece dentro do lago.'] },
      { explain: [
        { title: 'As etapas (parte 1)', art: '🌧️➜🟢', text: '1) **Nutrientes chegam à água**. 2) As **algas aumentam**. 3) A água fica **esverdeada** e com **muita matéria orgânica**. 4) A **luz tem dificuldade de chegar ao fundo**.' },
        { title: 'As etapas (parte 2)', art: '🦠➜🫧❌➜🐟', text: '5) Algas e outros organismos **morrem**. 6) **Bactérias decompositoras proliferam** e **consomem o oxigênio**. 7) **Falta oxigênio** na água. 8) **Peixes e outros animais morrem**.' }
      ] },
      { guided: { title: 'Lumi conta a história do lago', steps: [
        { art: '🌧️', text: 'A chuva levou o adubo para o lago…' },
        { art: '🟢', text: '…as algas se multiplicaram e a água ficou verde…' },
        { art: '🌑', text: '…a luz não chega ao fundo e muitos organismos morrem…' },
        { art: '🦠', text: '…as bactérias decompositoras se multiplicam e gastam o oxigênio… e os peixes ficam sem ar.' }
      ] } },
      { train: [
        { type: 'order', layout: 'list', level: 'construtor', prompt: 'Desafio principal: ordene os cartões da eutrofização.', items: [
          { t: 'Nutrientes chegam à água', icon: '🌧️' }, { t: 'As algas aumentam e a água fica verde', icon: '🟢' },
          { t: 'A luz tem dificuldade de chegar ao fundo', icon: '🌑' }, { t: 'Algas e outros organismos morrem', icon: '🥀' },
          { t: 'Bactérias decompositoras proliferam e consomem o oxigênio', icon: '🦠' }, { t: 'Falta oxigênio: peixes e outros animais morrem', icon: '🐟' }
        ] }
      ] },
      { q: 'L4-Q2' },
      { say: 'dito', lines: ['Nossa! Vou controlar meu adubo. A Engenheira Clara, na estação de tratamento, sabe o que fazer.'] }
    ],
    after: ['Vou usar só o adubo necessário, prometo!']
  };

  L.r4_prevencao = {
    region: 'r4', entity: 'clara', title: 'Recuperar o lago', obj: 'Encontre a Engenheira Clara na estação de tratamento',
    steps: [
      { say: 'clara', lines: ['Sou a engenheira Clara, da Estação de Tratamento.', 'Agora que você descobriu as fontes, dá para agir!'] },
      { explain: [
        { title: 'Prevenção', art: '🏭💧✅', text: 'Para prevenir a eutrofização: **tratar o esgoto**, **controlar o uso de fertilizantes**, **impedir o descarte de resíduos** e **proteger as margens** e os cursos d’água.' }
      ] },
      { q: 'L4-Q3' },
      { train: [
        { type: 'lakesim', level: 'construtor', prompt: 'Simulação do lago: diminua a entrada de nutrientes até recuperar a transparência, o oxigênio e os peixes.' }
      ] },
      { flag: 'r4_limpo' },
      { say: 'clara', lines: ['Olhe o lago! A água está clareando e os peixes voltaram. O Altar do Cristal fica no píer.'] }
    ],
    after: ['Tratar esgoto, controlar adubo, não jogar resíduos e proteger as margens.']
  };

  /* ============================ REGIÃO 5 ============================ */
  L.r5_ecossistema = {
    region: 'r5', entity: 'solar', title: 'Matéria e energia', obj: 'Fale com o Mestre Solar na entrada da torre',
    notebook: ['ecossistema', 'materiaenergia'],
    steps: [
      { say: 'solar', lines: ['Saudações, jovem Guardião! Sou o Mestre Solar, guardião da Torre da Energia.', 'A Névoa embaralhou os andares da torre. Primeiro, entenda o que é um ecossistema.'] },
      { explain: [
        { title: 'Ecossistema', art: '🌳💧☀️🐾', text: '**Ecossistema** é o **conjunto de relações** entre os **seres vivos** e o **ambiente** em que vivem.' },
        { title: 'A matéria volta', art: '♻️🍂', text: 'O **fluxo da matéria é cíclico**: a matéria pode **retornar ao ambiente** pela **decomposição** e ser **reutilizada** pelos seres vivos.' },
        { title: 'A energia segue em frente', art: '☀️➜🌾➜🦗➜🐦', text: 'O **fluxo de energia é unidirecional**. A energia entra principalmente pelo **Sol**; os **produtores** a captam na **fotossíntese**, e ela passa pelas cadeias. Em cada nível, **parte é usada ou perdida**. A energia **não retorna ao início**.' }
      ] },
      { guided: { title: 'Lumi compara', steps: [
        { art: '🍂➜🟫', text: 'Uma folha cai e é decomposta → a **matéria volta** ao solo (cíclico).' },
        { art: '☀️➜🌾➜🦗', text: 'A luz do Sol vira alimento na planta → o gafanhoto come → a energia segue.' },
        { art: '🚫↩️', text: 'A energia não volta para o Sol → **unidirecional**.' }
      ] } },
      { check: { type: 'tfj', prompt: 'Checagem de leitura: verdadeiro ou falso?', partA: { prompt: '“A energia volta ao início da cadeia.”', options: [ok('Falso'), no('Verdadeiro', 'A energia não retorna ao início.')] }, partB: { prompt: 'Justifique:', options: [ok('O fluxo de energia é unidirecional; parte é usada ou perdida em cada nível'), no('A energia volta para o Sol todas as noites', 'Isso não acontece: o fluxo é unidirecional.')] } } },
      { train: [
        { type: 'classify', level: 'construtor', prompt: 'Essa frase fala da matéria ou da energia?', bins: [{ id: 'm', label: 'Matéria (cíclica)', icon: '♻️' }, { id: 'e', label: 'Energia (unidirecional)', icon: '☀️' }], cards: [{ t: 'Volta ao ambiente pela decomposição', icon: '🍂', bin: 'm' }, { t: 'Pode ser reutilizada', icon: '🔁', bin: 'm' }, { t: 'Entra principalmente pelo Sol', icon: '☀️', bin: 'e' }, { t: 'Não retorna ao início', icon: '➡️', bin: 'e' }] }
      ] },
      { say: 'solar', lines: ['Muito bem! Agora use o Elevador dos Níveis para arrumar os andares.'] }
    ],
    after: ['Matéria: vai e volta. Energia: só vai.']
  };

  L.r5_andares = {
    region: 'r5', entity: 'elevador', title: 'Os andares fora de ordem', obj: 'Arrume os andares no Elevador dos Níveis',
    notebook: ['piramide'],
    steps: [
      { say: 'lumi', lines: ['Os andares da torre estão fora de ordem! A coruja está no térreo e o capim no topo!'] },
      { explain: [
        { title: 'A energia diminui', art: '🔺', text: 'A **quantidade de energia diminui** ao longo da cadeia. Por isso, a **pirâmide de energia** é **larga na base** e **estreita no topo**. Geralmente existem **mais produtores** do que consumidores primários, **mais primários** do que secundários, e assim por diante.' }
      ] },
      { guided: { title: 'Lumi monta a torre', steps: [
        { art: '🌾', text: 'Base: **produtores** (capim).' },
        { art: '🦗', text: 'Depois: **consumidores primários** (gafanhotos).' },
        { art: '🐦🐍', text: 'Depois: **secundários** (aves insetívoras) e **terciários** (serpentes).' },
        { art: '🦉', text: 'Topo: a **coruja**.' }
      ] } },
      { check: { type: 'fill', prompt: 'Checagem de leitura: complete.', text: 'A pirâmide de energia é {0} na base e {1} no topo.', answers: ['larga', 'estreita'], bank: ['colorida', 'molhada'] } },
      { train: [
        { type: 'order', layout: 'pyramid', level: 'construtor', prompt: 'Coloque os andares da torre na ordem: da BASE (embaixo) até o TOPO.', items: [{ t: 'Capim (produtores)', icon: '🌾' }, { t: 'Gafanhotos (consumidores primários)', icon: '🦗' }, { t: 'Aves insetívoras (consumidores secundários)', icon: '🐦' }, { t: 'Serpentes (consumidores terciários)', icon: '🐍' }, { t: 'Coruja (topo)', icon: '🦉' }] }
      ] },
      { flag: 'r5_andares' },
      { say: 'lumi', lines: ['Os andares acenderam! Suba até a Sala da Pirâmide, no topo da torre.'] }
    ],
    after: ['Base larga, topo estreito!']
  };

  L.r5_piramide = {
    region: 'r5', entity: 'piramide', title: 'A Sala da Pirâmide', obj: 'Conte a pirâmide na Sala da Pirâmide (topo)',
    steps: [
      { say: 'solar', lines: ['Esta é a pirâmide da torre. Conte com calma cada andar, começando pela base.'] },
      { q: 'L5-Q1' },
      { say: 'solar', lines: ['Perfeito. Agora desça e fale com o Guarda Jatobá, na área queimada, a oeste.'] }
    ],
    after: ['12, 5, 3, 2 e 1: a energia diminui a cada andar.']
  };

  L.r5_desequilibrio = {
    region: 'r5', entity: 'jatoba', title: 'Ecossistema em desequilíbrio', obj: 'Converse com o Guarda Jatobá na área queimada',
    notebook: ['desequilibrio', 'nativa'],
    steps: [
      { say: 'jatoba', lines: ['Sou o Jatobá, guarda-florestal. Veja esta área: desmatamento e queimada.', 'Quando um ecossistema é desequilibrado, todos sentem.'] },
      { explain: [
        { title: 'Ações que desequilibram', art: '🪓🔥🎣', text: '**Desmatamento** e **queimadas** matam e desabrigam seres vivos. **Caça e pesca ilegais** desequilibram as cadeias. **Espécies invasoras** podem ocupar o lugar das nativas por **não terem predadores locais**.' },
        { title: 'Nativa × invasora', art: '🏡🌿  |  ✈️🌿', text: '**Espécie nativa** é natural de uma região. **Espécie invasora** vem de outro local e pode causar **desequilíbrio**.' },
        { title: 'Sem capivaras, sem onças', art: '🌾➜🦫➜🐆', text: 'Em **capim → capivara → onça**: sem capivaras, as onças **perdem presa** e procuram outras. Sem onças, as capivaras podem **aumentar**, **consumir capim demais** e depois **sofrer falta de alimento**.' }
      ] },
      { check: { type: 'mc', prompt: 'Checagem de leitura: o que é uma espécie invasora?', options: [ok('Uma espécie que vem de outro local e pode causar desequilíbrio'), no('Uma espécie natural da região', 'Essa é a espécie nativa.'), no('Qualquer animal grande', 'O tamanho não define isso.')] } },
      { train: [
        { type: 'mc', level: 'guardiao', prompt: 'Sem onças, o que acontece com as capivaras?', pre: { type: 'sim', prompt: 'Use o botão **–** para diminuir as onças e observe.', need: 'down', pops: [{ id: 'capim', t: 'Capim', icon: '🌾', v: 60 }, { id: 'capi', t: 'Capivaras', icon: '#capivara', v: 45 }, { id: 'onca', t: 'Onças', icon: '🐆', v: 40 }], control: 'onca', links: [{ id: 'capi', k: -0.8 }, { id: 'capim', k: 0.6 }], notes: { down: 'Menos onças: as capivaras aumentam e comem mais capim.', up: 'Mais onças: menos capivaras; o capim se recupera.' } },
          options: [ok('Podem aumentar, comer capim demais e depois sofrer falta de alimento'), no('Diminuem imediatamente', 'Sem predadores, a população de capivaras tende a aumentar primeiro.'), no('Nada muda', 'As populações estão ligadas.')] }
      ] },
      { q: 'L5-Q2' },
      { say: 'jatoba', lines: ['Veja, brotos! Obrigado. A menina Tuane, no Jardim da Garrafa, tem um experimento incrível.'] }
    ],
    after: ['Proteger o ecossistema é proteger todas as cadeias.']
  };

  L.r5_garrafa = {
    region: 'r5', entity: 'tuane', title: 'O ecossistema na garrafa', obj: 'Visite Tuane no Jardim da Garrafa',
    steps: [
      { say: 'tuane', lines: ['Oi! Eu sou a Tuane. Montei um ecossistema dentro de uma garrafa!', 'Coloquei solo, uma planta, cascas de frutas e um pouco de água. Depois fechei bem.'] },
      { explain: [
        { title: 'Ecossistema em garrafa', art: '🫙🌱', text: 'Uma garrafa fechada com **solo, planta e restos orgânicos** forma um **pequeno ecossistema**. Nela, a **água circula**, a planta faz **fotossíntese** e os **decompositores** transformam as cascas.' }
      ] },
      { q: 'L5-Q3' },
      { q: 'L5-Q4' },
      { q: 'L5-Q5' },
      { q: 'L5-Q6' },
      { q: 'L5-Q7' },
      { say: 'tuane', lines: ['Você entende tudo de ecossistemas! O Altar do Cristal fica no centro do jardim da torre.'] }
    ],
    after: ['Minha garrafa continua viva: a água circula lá dentro!']
  };

  /* ============================ REGIÃO 6 ============================ */
  L.r6_biomas = {
    region: 'r6', entity: 'bia', title: 'A Praça dos Portais', obj: 'Fale com a Bia Bioma na Praça dos Portais',
    notebook: ['biomas'],
    steps: [
      { say: 'bia', lines: ['Oi, Guardião! Sou a Bia Bioma, exploradora. Bem-vindo à Praça dos Portais!', 'Cada portal leva a um bioma brasileiro. A Névoa apagou as pistas de cada um.'] },
      { explain: [
        { title: 'Bioma', art: '🗺️', text: '**Bioma** é um **grande ecossistema** ou um **conjunto de ecossistemas** típicos de uma região. O livro apresenta seis grandes biomas brasileiros: **Cerrado, Caatinga, Mata Atlântica, Amazônia, Pantanal e Pampas**.' },
        { title: 'Pistas (parte 1)', art: '🌳🔥 | 🌵☀️ | 🌴🌊', text: '**Cerrado**: muito calor; árvores baixas, retorcidas e espaçadas; queimadas. **Caatinga**: período seco marcante; na seca a paisagem fica clara e as plantas perdem folhas. **Mata Atlântica**: floresta úmida perto de grande parte do litoral, com grande diversidade.' },
        { title: 'Pistas (parte 2)', art: '🌳🌊 | 🐊💧 | 🌾', text: '**Amazônia**: grande floresta úmida, árvores altas, rios muito largos e enorme biodiversidade. **Pantanal**: extensas áreas alagáveis e grande diversidade de animais. **Pampas**: campos com plantas baixas e horizonte aberto.' }
      ] },
      { guided: { title: 'Lumi identifica um bioma', steps: [
        { art: '🌳🌳🌊', text: 'Pista: árvores altíssimas e um rio muito largo.' },
        { art: '🤔', text: 'Árvores altas + rios largos + floresta úmida…' },
        { art: '✅', text: '…é a **Amazônia**!' }
      ] } },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS frases corretas.', options: [ok('Bioma é um grande ecossistema ou conjunto de ecossistemas'), ok('O Pantanal tem extensas áreas alagáveis'), no('Os Pampas são florestas de árvores altas', 'Pampas: campos com plantas baixas.'), no('A Caatinga é sempre úmida', 'A Caatinga tem período seco marcante.')] } },
      { say: 'bia', lines: ['Comece pelo portal do Cerrado, ao noroeste da praça.'] }
    ],
    after: ['Seis biomas: Cerrado, Caatinga, Mata Atlântica, Amazônia, Pantanal e Pampas.']
  };

  L.r6_cerrado = {
    region: 'r6', entity: 'totem_cerrado', title: 'O Cerrado', obj: 'Entre no portal do Cerrado e toque no totem',
    steps: [
      { say: 'lumi', lines: ['Estamos no Cerrado! Observe as árvores e o chão.'] },
      { q: 'L6-Q4' },
      { say: 'lumi', lines: ['O totem acendeu! A Guia Jurema está aqui perto, no trecho queimado.'] }
    ],
    after: ['Cerrado: árvores baixas, retorcidas e espaçadas, e queimadas.']
  };

  L.r6_queimadas = {
    region: 'r6', entity: 'jurema', title: 'Queimadas no Cerrado', obj: 'Converse com a Guia Jurema no trecho queimado do Cerrado',
    steps: [
      { say: 'jurema', lines: ['Olá! Sou a Jurema, guia do Cerrado.', 'Veja este trecho queimado. O fogo muda tudo por aqui.'] },
      { explain: [
        { title: 'Lembre do habitat', art: '🏠🍃🐣', text: 'O **habitat** oferece **alimento**, **abrigo** e **condições para se reproduzir**. **Desmatamento** e **queimadas** **matam e desabrigam** seres vivos.' },
        { title: 'Quem trabalha no solo', art: '🦠🍄🟫', text: 'No **ciclo do nitrogênio**, os **decompositores** devolvem compostos de nitrogênio ao solo, e as **bactérias fixadoras** transformam o nitrogênio do ar. Essas bactérias vivem principalmente **no solo** e em raízes de algumas plantas.' }
      ] },
      { q: 'L6-Q6' },
      { q: 'L6-Q7' },
      { say: 'jurema', lines: ['Obrigada! Agora visite o portal da Mata Atlântica, a nordeste da praça.'] }
    ],
    after: ['Prevenir queimadas protege os animais e o solo.']
  };

  L.r6_mata = {
    region: 'r6', entity: 'totem_mata', title: 'A Mata Atlântica', obj: 'Entre no portal da Mata Atlântica e toque no totem',
    steps: [
      { say: 'lumi', lines: ['Que floresta úmida! E dá para ouvir o mar ao longe…'] },
      { q: 'L6-Q5' },
      { say: 'lumi', lines: ['Mais um totem aceso! Agora visite os outros quatro biomas e depois volte à Bia.'] }
    ],
    after: ['Mata Atlântica: floresta úmida perto do litoral.']
  };

  L.r6_explorar = {
    region: 'r6', entity: 'bia', title: 'Os outros quatro biomas', obj: 'Toque nos totens da Caatinga, Amazônia, Pantanal e Pampas e volte à Bia',
    requiresVisit: ['totem_caatinga', 'totem_amazonia', 'totem_pantanal', 'totem_pampas'],
    visitText: 'Visite os portais da Caatinga, Amazônia, Pantanal e Pampas e toque nos totens.',
    steps: [
      { say: 'bia', lines: ['Você visitou todos os biomas! Vamos ver se as pistas ficaram na memória.'] },
      { train: [
        { type: 'classify', level: 'construtor', prompt: 'Leve cada pista para o bioma certo.', bins: [{ id: 'cer', label: 'Cerrado', icon: '🌳' }, { id: 'caa', label: 'Caatinga', icon: '🌵' }, { id: 'mat', label: 'Mata Atlântica', icon: '🌴' }, { id: 'ama', label: 'Amazônia', icon: '🌲' }, { id: 'pan', label: 'Pantanal', icon: '🐊' }, { id: 'pam', label: 'Pampas', icon: '🌾' }], cards: [
          { t: 'Árvores baixas, retorcidas e espaçadas', icon: '🌳', bin: 'cer' }, { t: 'Período seco marcante; plantas perdem folhas', icon: '🌵', bin: 'caa' },
          { t: 'Floresta úmida perto do litoral', icon: '🌊', bin: 'mat' }, { t: 'Árvores altas e rios muito largos', icon: '🌲', bin: 'ama' },
          { t: 'Extensas áreas alagáveis', icon: '💧', bin: 'pan' }, { t: 'Campos com plantas baixas e horizonte aberto', icon: '🌾', bin: 'pam' }
        ] }
      ] },
      { say: 'bia', lines: ['Incrível! Agora a Agente Iara precisa de você no Posto de Resgate das Aves, ao sul da praça.'] }
    ],
    after: ['Você conhece todas as pistas dos biomas!']
  };

  L.r6_noticia = {
    region: 'r6', entity: 'iara', title: 'A notícia das aves', obj: 'Fale com a Agente Iara no Posto de Resgate',
    steps: [
      { say: 'iara', lines: ['Sou a Agente Iara. Resgatamos aves silvestres que eram vendidas ilegalmente.', 'Leia a notícia do mural. Cada parte que você entender vai libertar um grupo de aves das gaiolas.'] },
      { explain: [
        { title: 'A notícia', art: '📰🐦', text: 'Segundo a notícia do livro, **163 pássaros silvestres de 18 espécies** foram **resgatados** em **duas feiras** nos conjuntos **Santa Catarina e Nova Natal**, na **Zona Norte de Natal**. As aves eram **comercializadas ilegalmente**.' },
        { title: 'Maus-tratos e prisão', art: '📦🚫💧', text: 'Muitas aves estavam em **caixas pequenas**, **sem água** e com **pouca ventilação**, o que caracteriza **maus-tratos**. **Dois homens foram presos** por **crime ambiental**.' },
        { title: 'Denúncias e destino', art: '☎️🌳🏥', text: 'Segundo o texto, as denúncias podiam ser feitas pelos números **190**, **181** ou **(84) 3616-9829**. As aves **saudáveis** foram para **soltura em reserva**; as **debilitadas**, para um **centro de reabilitação credenciado pelo Ibama**.' }
      ] },
      { check: { type: 'multi', prompt: 'Checagem de leitura: marque as DUAS informações da notícia.', options: [ok('Foram resgatados 163 pássaros de 18 espécies'), ok('Muitas aves estavam em caixas pequenas e sem água'), no('As aves foram encontradas no Pantanal', 'Foi em feiras de Natal.'), no('Ninguém foi preso', 'Dois homens foram presos por crime ambiental.')] } },
      { say: 'iara', lines: ['Ótimo! Agora vá até as gaiolas. A primeira fica à esquerda.'] }
    ],
    after: ['A notícia está no mural, se quiser reler.']
  };

  L.r6_gaiola1 = { region: 'r6', entity: 'gaiola1', title: 'Gaiola 1: o crime', obj: 'Abra a Gaiola 1 no Posto de Resgate', steps: [{ q: 'L6-Q1' }, { say: 'iara', lines: ['Voem, passarinhos! Agora a Gaiola 2.'] }], after: ['Essas aves já estão livres na reserva.'] };
  L.r6_gaiola2 = { region: 'r6', entity: 'gaiola2', title: 'Gaiola 2: a denúncia', obj: 'Abra a Gaiola 2 no Posto de Resgate', steps: [{ q: 'L6-Q2' }, { say: 'iara', lines: ['Mais aves livres! A Gaiola 3 é sobre o destino das aves.'] }], after: ['Essas aves já estão livres na reserva.'] };
  L.r6_gaiola3 = {
    region: 'r6', entity: 'gaiola3', title: 'Gaiola 3: o destino das aves', obj: 'Abra a Gaiola 3 no Posto de Resgate',
    steps: [
      { explain: [{ title: 'O Ibama', art: '🛡️🌳', text: 'O **Ibama** atua na **preservação**, na **fiscalização** e na **educação** sobre os recursos naturais. As aves **debilitadas** foram levadas a um **centro de reabilitação credenciado pelo Ibama**.' }] },
      { check: { type: 'classify', prompt: 'Checagem de leitura: para onde foi cada um, segundo a notícia?', bins: [{ id: 'sol', label: 'Soltura em reserva', icon: '🌳' }, { id: 'cen', label: 'Centro de reabilitação (Ibama)', icon: '🏥' }, { id: 'pre', label: 'Presos por crime ambiental', icon: '⚖️' }], cards: [{ t: 'Aves saudáveis', icon: '🐦', bin: 'sol' }, { t: 'Aves debilitadas', icon: '🤕', bin: 'cen' }, { t: 'Os dois homens que vendiam as aves', icon: '👥', bin: 'pre' }] } },
      { flag: 'r6_gaiola3' },
      { say: 'iara', lines: ['Perfeito! Falta a última gaiola: a mais importante.'] }
    ],
    after: ['Essas aves já estão livres na reserva.']
  };
  L.r6_gaiola4 = { region: 'r6', entity: 'gaiola4', title: 'Gaiola 4: o desequilíbrio', obj: 'Abra a Gaiola 4 no Posto de Resgate', steps: [{ q: 'L6-Q3' }, { say: 'iara', lines: ['Todas as aves estão livres! Obrigada, Guardião. O Altar do Cristal está no centro da praça.'] }], after: ['Todas as aves voltaram para a natureza.'] };

  /* Ordem das lições por região (missão principal com etapas). */
  EN.data.regions = [
    { id: 'r1', n: 1, name: 'Trilha dos Animais Livres', map: 'r1', color: '#4caf50', crystal: 'Cristal da Vida Silvestre', medal: 'Defensor dos Animais', medalIcon: '🐒',
      lessons: ['r1_prep', 'r1_energia', 'r1_habitat', 'r1_silvestre', 'r1_pantanal', 'r1_desenho'], sides: ['r1_lixo', 'r1_placas'],
      chest: { coins: 15, item: 'chapeu_explorador' },
      summary: 'Habitat é onde o ser vivo encontra alimento, abrigo e condições para se reproduzir. Animais silvestres vivem livres na natureza. Tirar florestas tira o habitat. No Pantanal: gramíneas → capivara → onça.' },
    { id: 'r2', n: 2, name: 'Vale das Cadeias Alimentares', map: 'r2', color: '#f2c94c', crystal: 'Cristal das Cadeias', medal: 'Mestre das Cadeias', medalIcon: '🔗',
      lessons: ['r2_produtores', 'r2_setas', 'r2_paisagem', 'r2_ponte', 'r2_decomp', 'r2_teia'], sides: ['r2_sementes', 'r2_observa'],
      chest: { coins: 15, item: 'mochila_lona' },
      summary: 'Todos os seres vivos estão ligados por cadeias alimentares. A maioria dos produtores usa a energia do Sol. As setas indicam a passagem de alimento, matéria e energia para quem se alimenta.' },
    { id: 'r3', n: 3, name: 'Laboratório dos Ciclos', map: 'r3', color: '#2d9cdb', crystal: 'Cristal dos Ciclos', medal: 'Guardião dos Ciclos', medalIcon: '🔄',
      lessons: ['r3_carbono', 'r3_gases', 'r3_aquecimento', 'r3_pegada', 'r3_nitrogenio', 'r3_compostagem', 'r3_diagrama'], sides: ['r3_restos', 'r3_luzes'],
      chest: { coins: 15, item: 'oculos_cientista' },
      summary: 'O carbono circula entre seres vivos e atmosfera (gás carbônico). A fotossíntese libera oxigênio; respiração, decomposição e combustão liberam gás carbônico. Excesso de gás carbônico intensifica o efeito estufa. O nitrogênio vai do solo às plantas, delas aos animais, e volta pela decomposição.' },
    { id: 'r4', n: 4, name: 'Lago Esverdeado', map: 'r4', color: '#1abc9c', crystal: 'Cristal das Águas', medal: 'Protetor dos Rios', medalIcon: '💧',
      lessons: ['r4_problema', 'r4_fontes', 'r4_etapas', 'r4_prevencao'], sides: ['r4_residuos', 'r4_margem'],
      chest: { coins: 15, item: 'pet_peixe' },
      summary: 'Eutrofização é o excesso de nutrientes (nitrogênio e fósforo) na água. As algas aumentam, organismos morrem, decompositores consomem o oxigênio e os peixes morrem. Prevenção: tratar esgoto, controlar fertilizantes e não descartar resíduos.' },
    { id: 'r5', n: 5, name: 'Torre da Energia e dos Ecossistemas', map: 'r5', color: '#f39c12', crystal: 'Cristal da Energia', medal: 'Mestre da Energia', medalIcon: '⚡',
      lessons: ['r5_ecossistema', 'r5_andares', 'r5_piramide', 'r5_desequilibrio', 'r5_garrafa'], sides: ['r5_sementes', 'r5_andares_visita'],
      chest: { coins: 15, item: 'deco_estante' },
      summary: 'Ecossistema é o conjunto de relações entre seres vivos e ambiente. A matéria é cíclica; a energia é unidirecional e diminui a cada nível, por isso a pirâmide é larga na base. Desmatamento, queimadas, caça, pesca ilegal e espécies invasoras desequilibram os ecossistemas.' },
    { id: 'r6', n: 6, name: 'Portal dos Biomas Brasileiros', map: 'r6', color: '#9b51e0', crystal: 'Cristal dos Biomas', medal: 'Conhecedor dos Biomas', medalIcon: '🗺️',
      lessons: ['r6_biomas', 'r6_cerrado', 'r6_queimadas', 'r6_mata', 'r6_explorar', 'r6_noticia', 'r6_gaiola1', 'r6_gaiola2', 'r6_gaiola3', 'r6_gaiola4'], sides: ['r6_penas', 'r6_fotos'],
      chest: { coins: 20, item: 'capa_folhas' },
      summary: 'Bioma é um grande ecossistema. Brasil: Cerrado, Caatinga, Mata Atlântica, Amazônia, Pantanal e Pampas. O comércio ilegal de aves silvestres é crime ambiental e causa desequilíbrio. Queimadas prejudicam animais e o ciclo do nitrogênio.' }
  ];
  EN.data.regionById = {};
  EN.data.regions.forEach((r) => { EN.data.regionById[r.id] = r; });
  Object.keys(L).forEach((k) => { L[k].id = k; });
  EN.data.lessons = L;

  /* ============================ MISSÕES SECUNDÁRIAS ============================ */
  EN.data.sides = {
    r1_lixo: { region: 'r1', giver: 'kaua', type: 'collect', count: 5, title: 'Trilha limpa', desc: 'Recolha 5 lixos deixados na trilha e leve ao Guia Kauã.', reward: { xp: 40, coins: 6 },
      offer: ['Visitantes descuidados deixaram lixo na trilha. Pode recolher 5 para mim?'], progress: ['Faltam alguns lixos. Procure perto das árvores e do rio.'], done: ['Trilha limpa! A área de preservação agradece.'] },
    r1_placas: { region: 'r1', giver: 'nara', type: 'visit', targets: ['placa_capivara', 'placa_onca', 'placa_pantanal'], title: 'Pegadas do Pantanal', desc: 'Leia as 3 placas de observação do Pantanal e volte à Guardiã Nara.', reward: { xp: 30, coins: 5 },
      offer: ['Há três placas de observação perto do alagado. Leia todas e me conte!'], progress: ['Ainda falta ler alguma placa de observação.'], done: ['Você leu todas! Observar com atenção é coisa de Guardião.'] },
    r2_sementes: { region: 'r2', giver: 'maru', type: 'collect', count: 5, title: 'Sementes perdidas', desc: 'Encontre 5 sacos de sementes espalhados pelo Vale e devolva à Maru.', reward: { xp: 40, coins: 6 },
      offer: ['O vento espalhou meus saquinhos de sementes! Pode achar 5?'], progress: ['Ainda faltam saquinhos. O vento soprou para todo lado!'], done: ['Todas as sementes! Vou plantar mais capim e milho — produtores!'] },
    r2_observa: { region: 'r2', giver: 'broto', type: 'visit', targets: ['obs_coelho', 'obs_gafanhoto', 'obs_algas'], title: 'Caderno de campo', desc: 'Observe o coelho, o gafanhoto e as algas do Vale e volte ao Professor Broto.', reward: { xp: 30, coins: 5 },
      offer: ['Um bom cientista observa! Veja o coelho, o gafanhoto e as algas do lago.'], progress: ['Falta observar algum ser vivo da lista.'], done: ['Ótimas observações! Dois consumidores e um produtor aquático.'] },
    r3_restos: { region: 'r3', giver: 'composto', type: 'collect', count: 5, title: 'Restos para a composteira', desc: 'Junte 5 restos orgânicos pelo laboratório e leve ao Seu Composto.', reward: { xp: 45, coins: 7 },
      offer: ['Tem casca de fruta esquecida pelo laboratório. Traz 5 para a composteira?'], progress: ['Ainda faltam restos. Procure nas salas.'], done: ['Tudo vai virar adubo rico em nutrientes!'] },
    r3_luzes: { region: 'r3', giver: 'cicla', type: 'visit', targets: ['lamp1', 'lamp2', 'lamp3'], title: 'Economia de energia', desc: 'Apague as 3 lâmpadas esquecidas acesas e volte à Dra. Cicla.', reward: { xp: 35, coins: 6 },
      offer: ['Três lâmpadas ficaram acesas em salas vazias. Pode apagá-las? Economizar energia reduz a pegada ecológica.'], progress: ['Ainda há lâmpada acesa sem ninguém por perto.'], done: ['Obrigada! Menos desperdício, pegada menor.'] },
    r4_residuos: { region: 'r4', giver: 'teo', type: 'collect', count: 5, title: 'Margem sem resíduos', desc: 'Recolha 5 resíduos da margem do lago e leve ao Téo.', reward: { xp: 45, coins: 7 },
      offer: ['Tem resíduo jogado na margem. Recolhe 5 para mim? Assim não vão parar na água.'], progress: ['Ainda tem resíduo na margem.'], done: ['Margem limpinha! Menos matéria indo para o lago.'] },
    r4_margem: { region: 'r4', giver: 'clara', type: 'visit', targets: ['muda1', 'muda2', 'muda3'], title: 'Proteger as margens', desc: 'Plante as 3 mudas marcadas na margem e volte à Engenheira Clara.', reward: { xp: 40, coins: 6 },
      offer: ['Proteger as margens ajuda o lago. Plante as três mudas marcadas?'], progress: ['Ainda falta plantar alguma muda.'], done: ['As margens estão protegidas!'] },
    r5_sementes: { region: 'r5', giver: 'jatoba', type: 'collect', count: 5, title: 'Sementes nativas', desc: 'Encontre 5 sementes nativas para replantar a área queimada.', reward: { xp: 50, coins: 8 },
      offer: ['Preciso de sementes de plantas nativas da região para replantar. Acha 5?'], progress: ['Ainda faltam sementes nativas.'], done: ['Com espécies nativas, o ecossistema se recupera melhor.'] },
    r5_andares_visita: { region: 'r5', giver: 'solar', type: 'visit', targets: ['ped_capim', 'ped_gafanhoto', 'ped_ave', 'ped_serpente', 'ped_coruja'], title: 'Visita aos andares', desc: 'Visite os 5 pedestais dos andares da torre e volte ao Mestre Solar.', reward: { xp: 45, coins: 7 },
      offer: ['Visite os cinco pedestais dos andares. Cada um mostra um nível da pirâmide.'], progress: ['Falta visitar algum pedestal.'], done: ['Agora você conhece cada andar da energia.'] },
    r6_penas: { region: 'r6', giver: 'iara', type: 'collect', count: 5, title: 'Penas perdidas', desc: 'Recolha 5 penas caídas no posto e leve à Agente Iara para o registro.', reward: { xp: 50, coins: 8 },
      offer: ['Algumas aves perderam penas durante o resgate. Recolha 5 para o nosso registro?'], progress: ['Ainda faltam penas.'], done: ['Obrigada! Vamos registrar as espécies resgatadas.'] },
    r6_fotos: { region: 'r6', giver: 'jurema', type: 'visit', targets: ['foto_caatinga', 'foto_pampas', 'foto_amazonia'], title: 'Álbum dos biomas', desc: 'Registre os pontos de foto da Caatinga, dos Pampas e da Amazônia e volte à Guia Jurema.', reward: { xp: 60, coins: 10 },
      offer: ['Estou montando um álbum. Registre os pontos de foto da Caatinga, dos Pampas e da Amazônia?'], progress: ['Falta algum ponto de foto.'], done: ['Que álbum lindo! Cada bioma com suas pistas.'] },
    vila_mural: { region: 'vila', giver: 'zeca', type: 'visit', targets: ['loja_porta', 'casa_porta', 'jardim_placa'], title: 'Conhecer a Vila', desc: 'Visite a Loja, a Casa de Lumi e o Jardim e volte ao Carteiro Zeca.', reward: { xp: 30, coins: 5 },
      offer: ['Bem-vindo à Vila EcoNexus! Conheça a Loja, a Casa de Lumi e o Jardim.'], progress: ['Ainda falta conhecer algum lugar da vila.'], done: ['Agora você conhece a vila toda!'] },
    arena_pilares: { region: 'arena', giver: 'nara_arena', type: 'visit', targets: ['pilar1', 'pilar2', 'pilar3', 'pilar4', 'pilar5', 'pilar6'], title: 'Os seis pilares', desc: 'Toque nos seis pilares de cristal da Arena e volte à Guardiã Nara.', reward: { xp: 40, coins: 6 },
      offer: ['Cada pilar guarda o resumo de uma região. Visite os seis antes da batalha!'], progress: ['Falta visitar algum pilar.'], done: ['Você revisou as seis regiões. Pronto para a Névoa!'] },
    arena_fragmentos: { region: 'arena', giver: 'bia_arena', type: 'collect', count: 5, title: 'Estilhaços de Névoa', desc: 'Recolha 5 estilhaços de Névoa pela Arena e entregue à Bia.', reward: { xp: 40, coins: 6 },
      offer: ['A Névoa soltou estilhaços pela arena. Recolhe 5 para enfraquecê-la?'], progress: ['Ainda há estilhaços por aí.'], done: ['A Névoa ficou mais fraca!'] }
  };
  Object.keys(EN.data.sides).forEach((k) => { EN.data.sides[k].id = k; });

  /* ============================ ARENA FINAL ============================ */
  EN.data.arena = {
    round1: [
      { type: 'mc', prompt: '🍄 Cogumelos que crescem num tronco caído são:', options: [ok('Decompositores'), no('Produtores', 'Fungos não fazem fotossíntese.'), no('Consumidores secundários', 'Fungos decompõem restos.')], concept: 'decompositores' },
      { type: 'mc', prompt: '🌾 ➜ 🦫   A seta mostra que:', options: [ok('A capivara come o capim'), no('O capim come a capivara', 'A seta sai do alimento e aponta para quem come.')], concept: 'seta' },
      { type: 'mc', prompt: 'Bioma com extensas áreas alagáveis:', options: [ok('Pantanal'), no('Caatinga', 'A Caatinga tem seca marcante.'), no('Pampas', 'Pampas são campos.')], concept: 'biomas' },
      { type: 'mc', prompt: 'Gás LIBERADO pela planta na fotossíntese:', options: [ok('Gás oxigênio'), no('Gás carbônico', 'Na fotossíntese a planta USA gás carbônico.')], concept: 'oxigenio' },
      { type: 'mc', prompt: 'Eutrofização é:', options: [ok('Excesso de nutrientes em rios e lagos'), no('Falta de chuva', 'É excesso de nutrientes.'), no('Um tipo de peixe', 'É excesso de nutrientes.')], concept: 'eutrofizacao' },
      { type: 'mc', prompt: '🐒 Macaco que vive livre na floresta é um animal:', options: [ok('Silvestre'), no('Doméstico', 'Não passou por domesticação.')], concept: 'silvestre' },
      { type: 'mc', prompt: 'Habitat é onde o animal encontra:', options: [ok('Alimento, abrigo e condições para se reproduzir'), no('Só um lugar para dormir', 'Habitat também é alimento e reprodução.')], concept: 'habitat' },
      { type: 'mc', prompt: 'Na pirâmide de energia, a base tem:', options: [ok('Os produtores'), no('O último consumidor', 'O topo é que tem o último consumidor.')], concept: 'piramide' }
    ],
    round2: [
      { type: 'order', layout: 'chain', prompt: 'Construir 1/3 — a cadeia: monte na ordem certa.', items: [{ t: 'Milho', icon: '🌽' }, { t: 'Rato', icon: '🐁' }, { t: 'Coruja', icon: '🦉' }], concept: 'cadeia' },
      { type: 'order', layout: 'list', prompt: 'Construir 2/3 — o ciclo do nitrogênio: organize.', items: [{ t: 'Bactérias fixadoras transformam o nitrogênio do ar', icon: '🦠' }, { t: 'A planta absorve compostos do solo pelas raízes', icon: '🌱' }, { t: 'O animal come a planta', icon: '🐄' }, { t: 'Restos e fezes são decompostos e o nitrogênio volta ao solo', icon: '🍂' }], concept: 'nitrogenio' },
      { type: 'order', layout: 'pyramid', prompt: 'Construir 3/3 — a pirâmide: da BASE até o TOPO.', items: [{ t: 'Capim', icon: '🌾' }, { t: 'Gafanhotos', icon: '🦗' }, { t: 'Aves insetívoras', icon: '🐦' }, { t: 'Serpentes', icon: '🐍' }, { t: 'Coruja', icon: '🦉' }], concept: 'piramide' }
    ],
    round3: [
      { type: 'tfj', prompt: 'Explicar 1/3 — Causa e efeito', concept: 'eutrofizacao', partA: { prompt: 'Um rio recebe esgoto sem tratamento. O que pode acontecer?', options: [ok('As algas aumentam, falta oxigênio e peixes morrem'), no('A água fica mais limpa', 'O esgoto leva nutrientes em excesso.')] }, partB: { prompt: 'Por quê?', options: [ok('Decompositores consomem o oxigênio ao decompor muita matéria orgânica'), no('Porque as algas comem os peixes', 'Algas não comem peixes.')] } },
      { type: 'tfj', prompt: 'Explicar 2/3 — Causa e efeito', concept: 'habitat', partA: { prompt: 'Uma floresta é derrubada. O que acontece com os macacos?', options: [ok('Perdem o habitat e podem diminuir'), no('Ficam mais fortes', 'Sem floresta, perdem alimento e abrigo.')] }, partB: { prompt: 'Por quê?', options: [ok('Ficam sem alimento, abrigo e lugar para se reproduzir'), no('Porque macacos não gostam de árvores', 'Os macacos dependem das florestas.')] } },
      { type: 'tfj', prompt: 'Explicar 3/3 — Causa e efeito', concept: 'estufa', partA: { prompt: 'Queimamos muito combustível fóssil. O que acontece?', options: [ok('Aumenta o gás carbônico no ar e o efeito estufa se intensifica'), no('A Terra esfria', 'O excesso de gás carbônico aquece.')] }, partB: { prompt: 'Por quê?', options: [ok('O gás carbônico ajuda a reter calor; em excesso, aquece a Terra'), no('Porque o combustível vira gás oxigênio', 'A combustão consome oxigênio e libera gás carbônico.')] } }
    ]
  };
})();
