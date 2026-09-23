/* =====================================================================
   questions/c3.js — CAPÍTULO 3: O BRASIL QUE MUDA
   13 questões rastreáveis (GEO-C3-Q01 … GEO-C3-Q13). Conteúdo
   exclusivamente das seções 8.9 a 8.12 do material fornecido.
   Números e tabelas exatamente como no material.
   ===================================================================== */
(function () {
  'use strict';
  const ok = (t, fb, extra) => Object.assign({ t, ok: true, fb }, extra || {});
  const no = (t, fb, extra) => Object.assign({ t, ok: false, fb }, extra || {});
  const Q = (GEO.data.questions = GEO.data.questions || []);

  Q.push(
    /* ------------------------------------------------ Fase 3-1 Do Litoral ao Interior */
    {
      id: 'GEO-C3-Q04', chapter: 3, stage: 'c3s1', concept: 'Ocupação do litoral', book: false,
      title: 'Faixa leste mais povoada',
      prompt: 'Por que a faixa leste, no litoral, tornou-se a mais povoada?',
      pre: ['A colonização ocupou principalmente o **litoral**. Ali surgiram as primeiras **vilas e cidades**.'],
      visual: 'mapaLitoral', visualLabel: 'Ver o mapa da ocupação',
      type: 'mc',
      spec: { options: [ok('Porque foi a área ocupada primeiro na colonização, onde surgiram muitas cidades'), no('Porque ninguém podia morar no interior', 'O interior foi ocupado depois, com incentivos do governo.'), no('Porque o litoral só foi ocupado no século XX', 'Foi o contrário: a colonização começou pelo litoral.')] },
      answer: 'Foi a área inicialmente mais ocupada durante a colonização, onde surgiram muitas cidades.',
      ok: 'Isso!', why: 'A **faixa leste** foi a área **ocupada primeiro** na **colonização**, onde surgiram **muitas cidades** — por isso ficou a mais povoada.',
      recap: 'Onde a colonização começou?', hint1: 'Pense na planta de Salvador: onde ela ficava?', hint2: 'A colonização começou pelo litoral.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A faixa leste ficou mais povoada porque foi a área ocupada {0} durante a {1}, onde surgiram muitas {2}.', answers: ['primeiro', 'colonização', 'cidades'], bank: ['depois', 'florestas'] },
      confirm: { type: 'mc', prompt: 'Onde ficaram as primeiras vilas e cidades da colonização?', options: [ok('No litoral'), no('No centro do país', 'O interior foi ocupado depois.'), no('Na Região Norte, longe do mar', 'As primeiras ficaram no litoral.')] },
      review: { type: 'mc', prompt: 'A faixa mais povoada do Brasil fica…', options: [ok('no litoral, a leste'), no('no interior, a oeste', 'O interior foi ocupado depois.'), no('só no Sul', 'A faixa leste, no litoral.')] },
      where: 'Fase 3-1 • 1º Posto da corrida', effect: 'O litoral se acende no mapa animado.'
    },
    {
      id: 'GEO-C3-Q05', chapter: 3, stage: 'c3s1', concept: 'Interiorização', book: false,
      title: 'Ocupação do interior',
      prompt: 'Que ações estimularam a ocupação do interior do Brasil?',
      pre: ['No **século XX**, o governo estimulou a ocupação do **Centro-Oeste** e do **Norte**.'],
      visual: 'rotasInterior', visualLabel: 'Ver as rotas para o interior',
      type: 'multi',
      spec: { min: 3, options: [ok('Construção de Brasília'), ok('Estradas para o interior'), ok('Modernização da agropecuária'), ok('Terras mais baratas para comprar'), no('Fechamento de todas as estradas', 'Foi o contrário: construíram estradas.'), no('Proibição de morar no Centro-Oeste', 'O governo estimulou a ocupação do Centro-Oeste.')] },
      answer: 'Construção de Brasília, estradas, modernização agropecuária e possibilidade de compra de terras mais baratas.',
      ok: 'Rota para o interior liberada!', why: '**Brasília**, **estradas para o interior**, **modernização da agropecuária** e **terras mais baratas** estimularam migrações para o interior.',
      recap: 'Pense no que atrai pessoas: cidade nova, caminhos e terra.', hint1: 'Uma capital nova foi construída no Centro-Oeste.', hint2: 'Brasília, estradas, agropecuária moderna, terras baratas.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A construção de {0}, as {1} para o interior, a modernização da {2} e as terras mais {3} estimularam a ocupação.', answers: ['Brasília', 'estradas', 'agropecuária', 'baratas'], bank: ['caras', 'praias'] },
      confirm: { type: 'mc', prompt: 'Qual cidade foi construída e estimulou a ocupação do interior?', options: [ok('Brasília'), no('Salvador', 'Salvador é uma cidade antiga do litoral.'), no('Nova York', 'Não fica no Brasil.')] },
      review: { type: 'multi', prompt: 'Marque ações que estimularam a ocupação do interior.', min: 2, options: [ok('Estradas'), ok('Brasília'), no('Fechar estradas', 'Foi o contrário.')] },
      where: 'Fase 3-1 • 2º Posto da corrida', effect: 'Estradas aparecem no mapa rumo ao interior.'
    },
    {
      id: 'GEO-C3-Q06', chapter: 3, stage: 'c3s1', concept: 'Migração para o Sudeste', book: false,
      title: 'Por que o Sudeste atraiu migrantes?',
      prompt: 'Por que o Sudeste atraiu migrantes?',
      pre: ['O **Sudeste** se **industrializou** e atraiu trabalhadores, especialmente vindos do **Nordeste**.'],
      visual: 'rotaNordesteSudeste', visualLabel: 'Ver a rota de migração',
      type: 'mc',
      spec: { options: [ok('Por causa da industrialização e das oportunidades de trabalho nas fábricas'), no('Porque era a única região com praia', 'O motivo foi a industrialização.'), no('Porque o governo proibiu fábricas no Sudeste', 'Foi o contrário: o Sudeste se industrializou.')] },
      answer: 'Industrialização e oportunidades de trabalho nas fábricas.',
      ok: 'Certo!', why: 'O **Sudeste industrializado** atraiu trabalhadores pelas **oportunidades de trabalho nas fábricas**, especialmente pessoas vindas do **Nordeste**.',
      recap: 'O que o Sudeste tinha que atraía trabalhadores?', hint1: 'Pense em fábricas.', hint2: 'Industrialização = fábricas = trabalho.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O Sudeste atraiu migrantes por causa da {0} e das oportunidades de {1} nas fábricas.', answers: ['industrialização', 'trabalho'], bank: ['praia'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'De qual região vieram especialmente os trabalhadores para o Sudeste?', options: [ok('Nordeste'), no('Sul', 'O livro destaca o Nordeste.'), no('De outro país apenas', 'O livro destaca migrantes do Nordeste.')] },
      review: { type: 'mc', prompt: 'O que atraiu migrantes para o Sudeste?', options: [ok('A industrialização'), no('O fim das fábricas', 'Foi o contrário.'), no('Terras vazias no litoral', 'O motivo foram as fábricas.')] },
      where: 'Fase 3-1 • Chegada da corrida', effect: 'A seta Nordeste → Sudeste brilha no mapa.'
    },

    /* ------------------------------------------------ Fase 3-2 Cidade em Transformação */
    {
      id: 'GEO-C3-Q07', chapter: 3, stage: 'c3s2', concept: 'Urbanização e periferias', book: false,
      title: 'Crescimento das cidades e periferias',
      prompt: 'Por que as cidades e as periferias cresceram?',
      pre: ['Até a década de **1960**, a maior parte das pessoas vivia no **campo**. Hoje, segundo o livro, quase **61%** vive nas cidades.', 'A urbanização ocorreu **sem planejamento suficiente**. Trabalhadores ocuparam **cortiços**, com água, luz e saneamento precários.', 'Com a **valorização das áreas centrais**, muitos trabalhadores foram **expulsos para as periferias**.'],
      visual: 'campoCidade', visualLabel: 'Ver campo e cidade',
      type: 'multi',
      spec: { min: 3, options: [ok('Industrialização'), ok('Máquinas no campo (mecanização)'), ok('Migração do campo para a cidade'), ok('Cidades despreparadas: faltaram moradias e serviços'), no('Porque os moradores escolheram viver sem serviços', 'Não é culpa dos moradores: as cidades não estavam preparadas para todos.'), no('Porque todos se mudaram para o campo', 'Foi o contrário: muitos saíram do campo para a cidade.')] },
      answer: 'Industrialização, mecanização do campo e migração campo-cidade; cidades despreparadas, faltando moradias e serviços.',
      ok: 'A cidade começa a se transformar!', why: '**Industrialização**, **máquinas no campo** e **migração do campo para a cidade** fizeram as cidades crescerem. Como elas **não estavam preparadas**, faltaram **moradias e serviços**, e as **periferias** cresceram.',
      recap: 'Pense em quem saiu do campo e por quê.', hint1: 'Máquinas passaram a fazer o trabalho no campo.', hint2: 'Industrialização, máquinas no campo, migração e falta de moradias.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A {0} e as máquinas no {1} levaram pessoas para as cidades, que não estavam {2}. Faltaram {3} e serviços.', answers: ['industrialização', 'campo', 'preparadas', 'moradias'], bank: ['praias', 'culpa'] },
      confirm: { type: 'mc', prompt: 'Por que trabalhadores foram morar nas periferias?', options: [ok('A valorização das áreas centrais e as mudanças urbanas os expulsaram'), no('Porque não queriam serviços', 'Não é culpa dos moradores.'), no('Porque as periferias tinham mais infraestrutura', 'As periferias tinham menos serviços.')] },
      review: { type: 'multi', prompt: 'Marque causas do crescimento das cidades.', min: 2, options: [ok('Industrialização'), ok('Migração do campo para a cidade'), no('Todos foram para o campo', 'Foi o contrário.')] },
      where: 'Fase 3-2 • Praça Central da cidade', effect: 'Os cortiços recebem água e luz.'
    },
    {
      id: 'GEO-C3-Q08', chapter: 3, stage: 'c3s2', concept: 'Infraestrutura', book: false,
      title: 'O que é infraestrutura?',
      prompt: 'O que é infraestrutura?',
      pre: ['Você acabou de restaurar **saneamento**, **transporte** e **energia** na cidade. Esses serviços têm um nome em Geografia.'],
      type: 'mc',
      spec: { options: [ok('Conjunto de serviços necessários, como saneamento, transporte e energia'), no('Um tipo de prédio muito alto', 'Infraestrutura são serviços, não um prédio.'), no('Uma festa da cidade', 'Infraestrutura são serviços necessários.')] },
      answer: 'Conjunto de serviços necessários, como saneamento, transporte e energia.',
      ok: 'Exato!', why: '**Infraestrutura** é o conjunto de **serviços necessários**, como **saneamento**, **transporte** e **energia**.',
      recap: 'Lembre do que você restaurou na cidade.', hint1: 'Água, ônibus e luz são exemplos.', hint2: 'Serviços necessários: saneamento, transporte e energia.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Infraestrutura é o conjunto de {0} necessários, como {1}, transporte e {2}.', answers: ['serviços', 'saneamento', 'energia'], bank: ['festas'] },
      confirm: { type: 'mc', prompt: 'Qual destes é um exemplo de infraestrutura?', options: [ok('Rede de água e esgoto (saneamento)'), no('Um desenho animado', 'Não é serviço necessário da cidade.'), no('Uma camiseta', 'Não é serviço necessário da cidade.')] },
      review: { type: 'mc', prompt: 'Saneamento, transporte e energia são exemplos de…', options: [ok('infraestrutura'), no('miscigenação', 'Miscigenação é mistura de povos.'), no('xilogravura', 'Xilogravura é técnica de impressão.')] },
      where: 'Fase 3-2 • Central de Serviços', effect: 'Ônibus, água e luz funcionam em toda a cidade.'
    },

    /* ------------------------------------------------ Fase 3-3 Energia para Todos */
    {
      id: 'GEO-C3-Q09', chapter: 3, stage: 'c3s3', concept: 'Pobreza energética', book: false,
      title: 'O que é pobreza energética?',
      prompt: 'O que é pobreza energética?',
      pre: ['**Pobreza energética** é a **limitação** ou **falta** total ou parcial de acesso à **energia**. Famílias restringem o consumo ao **essencial**.', 'O livro relaciona isso a **comunidades periféricas**, **população negra** e **famílias chefiadas por mulheres**. **Serviços básicos são direitos**, mas nem todos conseguem pagar.'],
      type: 'open',
      spec: {
        placeholder: 'Ex.: É quando uma família…', min: 2, must: [1],
        groups: [
          { label: 'Falta ou limitação', kw: ['falta', 'limit', 'pouca', 'sem ', 'nao ter', 'nao tem', 'restring'] },
          { label: 'Acesso ou uso de energia', kw: ['energia', 'luz', 'eletric'] },
          { label: 'Dificuldades econômicas', kw: ['dinheiro', 'pagar', 'pobre', 'economic', 'renda', 'caro', 'conta'] },
          { label: 'Consumo só do essencial', kw: ['essencial', 'necessidad', 'economizar', 'o basico'] }
        ],
        distractors: ['Desperdiçar energia de propósito', 'Ter energia sobrando'],
        wrongIdeas: [{ kw: ['desperdic'], fb: 'Pobreza energética não é desperdício: é falta ou limitação de acesso à energia.' }]
      },
      answer: 'Falta total/parcial ou limitação do acesso/uso de energia por dificuldades econômicas.',
      ok: 'Energia chegando!', why: '**Pobreza energética** é a **falta total ou parcial** ou a **limitação do acesso à energia**, geralmente por **dificuldades econômicas**, levando famílias a usar só o **essencial**.',
      recap: 'Pense numa casa que não consegue pagar a conta de luz.', hint1: 'Tem a ver com falta de energia.', hint2: 'Falta ou limitação de energia por dificuldade de pagar.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Pobreza energética é a {0} ou limitação do acesso à {1}, por dificuldades {2}.', answers: ['falta', 'energia', 'econômicas'], bank: ['sobra', 'desperdício'] },
      confirm: { type: 'mc', prompt: 'Uma família só liga a luz no essencial porque não consegue pagar. Isso é um exemplo de…', options: [ok('pobreza energética'), no('desperdício', 'É falta de acesso, não desperdício.'), no('infraestrutura sobrando', 'É o contrário.')] },
      review: { type: 'mc', prompt: 'Pobreza energética é…', options: [ok('falta ou limitação de acesso à energia'), no('gastar energia demais', 'Não é desperdício.'), no('ter muitas usinas', 'É sobre acesso das famílias.')] },
      where: 'Fase 3-3 • Casa da periferia no labirinto', effect: 'As casas da periferia acendem suas luzes.'
    },
    {
      id: 'GEO-C3-Q10', chapter: 3, stage: 'c3s3', concept: 'Desigualdade de renda (tabela)', book: false,
      title: 'Tabela de rendimentos',
      prompt: 'Leia a tabela de rendimento médio (2021): quem tinha o maior rendimento médio e quais valores aparecem?',
      pre: ['O Brasil tem **grandes desigualdades** entre ricos e pobres. Em **2022**, o **1% mais rico** ganhava cerca de **32 vezes** mais que os **50% mais pobres**.', 'Há desigualdades de **gênero** e de **cor/raça**. **Pobreza**, **abandono escolar** e **preconceito** dificultam o acesso a trabalhos mais bem pagos.'],
      visual: 'tabelaRenda', visualLabel: 'Ver a tabela de rendimentos',
      type: 'steps',
      spec: { parts: [
        { type: 'mc', prompt: 'Na tabela, qual grupo tinha o **maior** rendimento médio em 2021?', spec: { keepOrder: true, options: [ok('Brancos'), no('Pardos', 'Pardos: R$ 1.814,00 — não é o maior.'), no('Pretos', 'Pretos: R$ 1.764,00 — não é o maior.')] } },
        { type: 'classify', prompt: 'Agora ligue cada valor ao grupo, conforme a tabela.', spec: { bins: [{ id: 'b', t: 'Brancos' }, { id: 'pa', t: 'Pardos' }, { id: 'pr', t: 'Pretos' }], items: [{ t: 'R$ 3.099,00', bin: 'b' }, { t: 'R$ 1.814,00', bin: 'pa' }, { t: 'R$ 1.764,00', bin: 'pr' }] } }
      ] },
      answer: 'Brancos R$ 3.099; pardos R$ 1.814; pretos R$ 1.764. O objetivo é reconhecer desigualdade.',
      ok: 'Leitura de tabela certeira!', why: 'Brancos: **R$ 3.099,00**; pardos: **R$ 1.814,00**; pretos: **R$ 1.764,00**. A tabela mostra **desigualdade** entre grupos — **não** é uma característica de cada pessoa.',
      recap: 'Leia linha por linha da tabela.', hint1: 'Procure o maior número da tabela.', hint2: 'O maior valor é R$ 3.099,00.',
      guided: { type: 'fill', prompt: 'Complete com a tabela:', text: 'Brancos: R$ {0}; pardos: R$ {1}; pretos: R$ {2}.', answers: ['3.099,00', '1.814,00', '1.764,00'], bank: ['32,00'] },
      confirm: { type: 'mc', prompt: 'O que a tabela de rendimentos mostra?', options: [ok('Que existe desigualdade de renda entre grupos'), no('Que todos ganham o mesmo', 'Os valores são diferentes.'), no('Que cada pessoa de um grupo ganha exatamente aquele valor', 'É uma média; mostra desigualdade entre grupos.')] },
      review: { type: 'mc', prompt: 'Segundo a tabela de 2021, o rendimento médio de pardos era…', options: [ok('R$ 1.814,00'), no('R$ 3.099,00', 'Esse é o dos brancos.'), no('R$ 1.764,00', 'Esse é o dos pretos.')] },
      where: 'Fase 3-3 • Painel da Usina', effect: 'O painel da usina mostra a tabela com clareza.'
    },

    /* ------------------------------------------------ Fase 3-4 Torre da População */
    {
      id: 'GEO-C3-Q01', chapter: 3, stage: 'c3s4', concept: 'Crescimento da população', book: true,
      title: 'População desde 1970',
      prompt: 'A quantidade de brasileiros mudou desde 1970? Por quê?',
      pre: ['A população do Brasil **cresceu muito no século XX**.', 'Motivos: **imigração**, **famílias numerosas** e **melhores condições de saúde**, com **menos mortes de recém-nascidos**.'],
      visual: 'tabelaPop', visualLabel: 'Ver a tabela da população',
      type: 'steps',
      spec: { parts: [
        { type: 'mc', prompt: 'De **1970 (94.508.583)** para **2022 (203.080.756)**, a população…', spec: { keepOrder: true, options: [ok('aumentou'), no('diminuiu', 'Compare: 203 milhões é maior que 94 milhões.'), no('ficou igual', 'Os números são bem diferentes.')] } },
        { type: 'multi', prompt: 'Por quê? Marque os motivos citados no material.', spec: { min: 2, options: [ok('Imigração'), ok('Famílias com muitos filhos'), ok('Melhores condições de saúde, com menos mortes de recém-nascidos'), no('Porque ninguém mais nascia', 'Se ninguém nascesse, a população não cresceria.')] } }
      ] },
      answer: 'Sim, aumentou (94.508.583 em 1970 → 203.080.756 em 2022), por imigração, famílias com muitos filhos e melhorias de saúde/redução de mortes de recém-nascidos.',
      ok: 'Você subiu mais um andar da Torre!', why: 'A população **aumentou**: de **94.508.583** (1970) para **203.080.756** (2022). O material relaciona isso à **imigração**, às **famílias com muitos filhos** e a **melhorias de saúde**, com **menos mortes de recém-nascidos**.',
      recap: 'Compare os dois números da tabela.', hint1: 'Qual número é maior: o de 1970 ou o de 2022?', hint2: 'Aumentou. Motivos: imigração, famílias numerosas, saúde.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Sim, a população {0}: eram 94.508.583 em 1970 e {1} em 2022, por causa da {2}, de famílias com muitos filhos e de melhorias na {3}.', answers: ['aumentou', '203.080.756', 'imigração', 'saúde'], bank: ['diminuiu', '51.944.397'] },
      confirm: { type: 'mc', prompt: 'Qual era a população do Brasil em 1950, segundo a tabela?', options: [ok('51.944.397'), no('203.080.756', 'Esse é o número de 2022.'), no('94.508.583', 'Esse é o número de 1970.')] },
      review: { type: 'mc', prompt: 'Segundo a tabela, a população do Brasil em 2022 era…', options: [ok('203.080.756'), no('190.755.799', 'Esse é o de 2010.'), no('169.872.856', 'Esse é o de 2000.')] },
      where: 'Fase 3-4 • Andar 1970 → 2022 da Torre', effect: 'A barra do gráfico da Torre cresce até o topo.'
    },
    {
      id: 'GEO-C3-Q11', chapter: 3, stage: 'c3s4', concept: 'Envelhecimento da população', book: false,
      title: 'Envelhecimento da população',
      prompt: 'Quais fatores explicam o envelhecimento da população?',
      pre: ['O Brasil foi considerado um **país jovem**, mas os **nascimentos diminuíram** e o **tempo médio de vida aumentou**.', 'Segundo o material, a população **idosa** deverá **ultrapassar** a de **0 a 14 anos** até a década de **2040**.'],
      visual: 'faixasEtarias', visualLabel: 'Ver as faixas etárias',
      type: 'multi',
      spec: { min: 2, options: [ok('Menos nascimentos'), ok('Famílias com menos filhos'), ok('Maior tempo de vida, com avanços da Medicina'), ok('Maior participação das mulheres no trabalho'), no('Mais nascimentos', 'Foi o contrário: os nascimentos diminuíram.'), no('Menor tempo de vida', 'Foi o contrário: as pessoas vivem mais.')] },
      answer: 'Menos nascimentos, famílias com menos filhos e maior tempo de vida ligado a avanços da Medicina.',
      ok: 'Certo!', why: 'A população envelhece com **menos nascimentos**, **famílias com menos filhos** (ligado à **maior participação feminina no trabalho**) e **maior tempo de vida**, graças a **avanços da Medicina**.',
      recap: 'Envelhecer = menos crianças nascendo e pessoas vivendo mais.', hint1: 'Pense em quantos filhos as famílias têm hoje.', hint2: 'Menos nascimentos e vida mais longa.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A população envelhece porque há {0} nascimentos, famílias com {1} filhos e as pessoas vivem {2}, com avanços da {3}.', answers: ['menos', 'menos', 'mais', 'Medicina'], bank: ['mais nascimentos'] },
      confirm: { type: 'mc', prompt: 'Até a década de 2040, o material diz que a população idosa deverá…', options: [ok('ultrapassar a de 0 a 14 anos'), no('desaparecer', 'Ela vai crescer.'), no('ficar menor que nunca', 'Ela vai crescer.')] },
      review: { type: 'multi', prompt: 'Marque fatores do envelhecimento da população.', min: 2, options: [ok('Menos nascimentos'), ok('Vida mais longa'), no('Mais nascimentos', 'Foi o contrário.')] },
      where: 'Fase 3-4 • Andar das Faixas Etárias', effect: 'As barras de idade da Torre mudam de tamanho.'
    },
    {
      id: 'GEO-C3-Q12', chapter: 3, stage: 'c3s4', concept: 'Composição da população (gráfico)', book: false,
      title: 'Gráfico de 2022',
      prompt: 'Quais grupos formavam as maiores parcelas no gráfico de 2022? Ordene do maior para o menor.',
      pre: ['O gráfico mostra a **composição da população** em **2022** por cor ou raça declarada.'],
      visual: 'graficoComposicao', visualLabel: 'Ver o gráfico de 2022',
      type: 'order',
      spec: { items: ['Parda — 45,3%', 'Branca — 42,8%', 'Preta — 10,6%', 'Indígena, amarela ou sem declaração — 1,3%'], note: 'Toque do MAIOR para o MENOR.' },
      answer: 'Pardos 45,3% e brancos 42,8%; depois pretos 10,6%; indígenas, amarelos ou sem declaração 1,3%.',
      ok: 'Gráfico lido!', why: 'As maiores parcelas: **parda 45,3%** e **branca 42,8%**; depois **preta 10,6%**; **indígena, amarela ou sem declaração 1,3%**.',
      recap: 'Compare as porcentagens: qual número é maior?', hint1: '45,3 é maior que 42,8.', hint2: 'Parda, branca, preta, e por último 1,3%.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Parda: {0}%; branca: {1}%; preta: {2}%; indígena, amarela ou sem declaração: 1,3%.', answers: ['45,3', '42,8', '10,6'], bank: ['61'] },
      confirm: { type: 'mc', prompt: 'No gráfico de 2022, qual é a maior parcela?', options: [ok('Parda, 45,3%'), no('Branca, 42,8%', 'É grande, mas 45,3 é maior.'), no('Preta, 10,6%', 'É menor que parda e branca.')] },
      review: { type: 'mc', prompt: 'No gráfico de 2022, a parcela preta era…', options: [ok('10,6%'), no('45,3%', 'Essa é a parda.'), no('1,3%', 'Essa é indígena, amarela ou sem declaração.')] },
      where: 'Fase 3-4 • Topo da Torre', effect: 'O gráfico se acende no topo da Torre.'
    },

    /* ------------------------------------------------ Fase 3-5 Territórios e Direitos */
    {
      id: 'GEO-C3-Q03', chapter: 3, stage: 'c3s5', concept: 'Terras indígenas e quilombolas (mapas)', book: true,
      title: 'Terras regularizadas',
      prompt: 'Em que regiões predominam as terras indígenas regularizadas e os territórios quilombolas delimitados? Por quê?',
      pre: ['No material, as **terras indígenas regularizadas** predominam na Região **Norte**.', 'Na atividade comparativa, os **territórios quilombolas delimitados** aparecem com **forte concentração** no **Nordeste**.'],
      visual: 'mapaTerras', visualLabel: 'Ver o mapa esquemático das terras',
      type: 'steps',
      spec: { parts: [
        { type: 'mappick', prompt: 'Toque na região onde **predominam as terras indígenas regularizadas**.', spec: { parts: [{ prompt: 'Toque na região onde **predominam as terras indígenas regularizadas**.', answer: 'norte', wrong: 'Observe o mapa: onde há mais áreas indígenas marcadas?', markLabel: 'Terras indígenas' }] } },
        { type: 'mappick', prompt: 'Agora toque na região com **forte concentração de territórios quilombolas**.', spec: { parts: [{ prompt: 'Agora toque na região com **forte concentração de territórios quilombolas**.', answer: 'nordeste', wrong: 'Observe o mapa: onde os pontos quilombolas se concentram?', markLabel: 'Quilombolas' }] } },
        { type: 'mc', prompt: 'Por que isso acontece, segundo o que estudamos?', spec: { options: [ok('Por causa das histórias de ocupação e da permanência dessas comunidades nesses lugares'), no('Porque o governo sorteou os lugares', 'Relacione com a história de ocupação e permanência das comunidades.'), no('Porque não existem indígenas nem quilombolas em outras regiões', 'Existem em outras regiões; o mapa mostra onde predominam.')] } }
      ] },
      answer: 'Terras indígenas regularizadas principalmente no Norte; territórios quilombolas com forte concentração no Nordeste; relacionado às histórias de ocupação e permanência dessas comunidades.',
      ok: 'Mapas lidos com atenção!', why: '**Terras indígenas regularizadas**: principalmente na Região **Norte**. **Territórios quilombolas delimitados**: forte concentração no **Nordeste**. Isso se relaciona às **histórias de ocupação e permanência** dessas comunidades.',
      recap: 'Olhe onde há mais áreas marcadas em cada mapa.', hint1: 'Terras indígenas: região da floresta ao norte.', hint2: 'Indígenas: Norte. Quilombolas: Nordeste.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'As terras indígenas regularizadas predominam na Região {0}; os territórios quilombolas se concentram no {1}.', answers: ['Norte', 'Nordeste'], bank: ['Sul'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'Em qual região predominam as terras indígenas regularizadas, segundo o material?', options: [ok('Norte'), no('Sul', 'Observe de novo o mapa: é o Norte.'), no('Sudeste', 'Observe de novo o mapa: é o Norte.')] },
      review: { type: 'mc', prompt: 'Os territórios quilombolas delimitados aparecem com forte concentração no…', options: [ok('Nordeste'), no('Sul', 'É no Nordeste.'), no('Centro-Oeste', 'É no Nordeste.')] },
      where: 'Fase 3-5 • Mesa dos Mapas de Territórios', effect: 'Marcos de demarcação aparecem no mapa.'
    },
    {
      id: 'GEO-C3-Q13', chapter: 3, stage: 'c3s5', concept: 'Demarcação e direitos', book: false,
      title: 'Por que demarcar terras?',
      prompt: 'Por que a demarcação de terras é importante?',
      pre: ['O **crescimento urbano** e a **expansão agropecuária e extrativista** ocuparam novas áreas e **reduziram** populações e territórios indígenas.', '**Indígenas, quilombolas e ribeirinhos** lutam pelo **direito à terra**. O **governo deve demarcar** esses territórios.'],
      type: 'open',
      spec: {
        placeholder: 'Ex.: Porque garante…', min: 2,
        groups: [
          { label: 'Garante o direito ao território', kw: ['direito', 'garant', 'lei', 'territor', 'terra', 'demarc'] },
          { label: 'Indígenas, quilombolas e ribeirinhos', kw: ['indigena', 'quilombola', 'ribeirinho', 'comunidade', 'povos'] },
          { label: 'Manter o modo de vida', kw: ['modo de vida', 'jeito de viver', 'viver', 'vivem'] },
          { label: 'Manter a cultura', kw: ['cultura', 'tradic', 'costume'] },
          { label: 'Sobrevivência (moradia, alimento, trabalho)', kw: ['sobreviv', 'moradia', 'morar', 'aliment', 'comida', 'trabalh', 'protec'] }
        ],
        distractors: ['Para ninguém mais poder morar em lugar nenhum', 'Para tirar as comunidades de suas terras']
      },
      answer: 'Garante o direito ao território e permite que indígenas, quilombolas e ribeirinhos mantenham modo de vida, cultura e sobrevivência.',
      ok: 'Território protegido!', why: 'A demarcação **garante o direito ao território** e permite que **indígenas, quilombolas e ribeirinhos** mantenham seu **modo de vida**, sua **cultura** e sua **sobrevivência**.',
      recap: 'Lembre o que a terra garante às comunidades (Capítulo 1).', hint1: 'Demarcar = marcar e garantir o direito.', hint2: 'Garante o direito e mantém cultura e modo de vida.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A demarcação garante o {0} ao território e permite manter o modo de {1}, a {2} e a sobrevivência das comunidades.', answers: ['direito', 'vida', 'cultura'], bank: ['lucro', 'fim'] },
      confirm: { type: 'mc', prompt: 'Quem deve demarcar os territórios, segundo o material?', options: [ok('O governo'), no('Ninguém', 'O material diz que o governo deve demarcar.'), no('Os turistas', 'O material diz que o governo deve demarcar.')] },
      review: { type: 'mc', prompt: 'A demarcação de terras é importante porque…', options: [ok('garante o direito ao território e o modo de vida das comunidades'), no('acaba com as comunidades', 'É o contrário.'), no('serve só para decorar mapas', 'É um direito.')] },
      where: 'Fase 3-5 • Marco final dos Territórios', effect: 'O território fica protegido e florido.'
    },

    /* ------------------------------------------------ Fase 3-6 Chefe final: Vírus da Desigualdade */
    {
      id: 'GEO-C3-Q02', chapter: 3, stage: 'c3s6', concept: 'União e cooperação (reflexão)', book: true, personal: true,
      title: 'União fora da Copa',
      prompt: 'O sentimento de união entre brasileiros também pode existir quando não há Copa do Mundo?',
      pre: ['Na Copa, muitos brasileiros torcem **juntos**. Para vencer o Vírus, Gabriel precisa da **união** de todos. Será que a união só aparece na Copa?'],
      type: 'personal',
      spec: {
        min: 1, choices: ['Sim, quando as pessoas se ajudam e cooperam', 'Sim, em festas e celebrações', 'Sim, em desafios que a comunidade enfrenta junta', 'Às vezes sim, às vezes não — depende da situação'],
        placeholder: 'Se quiser, dê um exemplo (uma festa, um mutirão, uma campanha…).', note: 'Reflexão: não há resposta única. Escolha e, se quiser, dê um exemplo.'
      },
      answer: 'Reflexão: sim (ou resposta ponderada), com exemplos de cooperação, festas, desafios ou acontecimentos coletivos.',
      ok: 'A união de todos derrotou o Vírus da Desigualdade!',
      why: 'A união aparece quando as pessoas **cooperam**, **celebram juntas** e **enfrentam desafios coletivos** — não só na Copa.',
      recap: 'Escolha uma opção. Todas são reflexões aceitas.', hint1: 'Pense em momentos em que sua escola ou bairro se juntou.', hint2: 'Escolha a opção que você acha verdadeira.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A união também aparece quando as pessoas se {0} e enfrentam {1} juntas.', answers: ['ajudam', 'desafios'], bank: ['brigam'], prefill: 0 },
      confirm: null,
      review: { type: 'mc', prompt: 'Qual situação mostra união entre brasileiros fora da Copa?', options: [ok('Pessoas se ajudando para restaurar serviços de um bairro'), no('Cada um pensando só em si', 'Isso não é união.'), no('Zombar de quem é diferente', 'Isso separa as pessoas.')] },
      where: 'Fase 3-6 • Golpe final no Vírus da Desigualdade', effect: 'Serviços e direitos são restaurados em todo o Atlas.'
    }
  );

  GEO.data.statements = GEO.data.statements || {};
  GEO.data.statements[3] = [
    { t: 'A faixa leste, no litoral, tornou-se a mais povoada.', v: true },
    { t: 'Até a década de 1960, a maior parte das pessoas já vivia nas cidades.', v: false, fb: 'Até 1960, a maior parte vivia no campo.' },
    { t: 'Segundo o livro, quase 61% da população vive hoje nas cidades.', v: true },
    { t: 'A urbanização foi totalmente planejada e havia casa para todos.', v: false, fb: 'A urbanização ocorreu sem planejamento suficiente.' },
    { t: 'Cortiços tinham água, luz e saneamento precários.', v: true },
    { t: 'Morar na periferia é culpa dos próprios moradores.', v: false, fb: 'A valorização das áreas centrais e as mudanças urbanas expulsaram trabalhadores para as periferias.' },
    { t: 'Infraestrutura inclui saneamento, transporte e energia.', v: true },
    { t: 'Segregar significa separar ou isolar.', v: true },
    { t: 'Serviços básicos são luxo, não direitos.', v: false, fb: 'Serviços básicos são direitos, mas nem todos conseguem pagar por eles.' },
    { t: 'Em 2022, o 1% mais rico ganhava cerca de 32 vezes mais que os 50% mais pobres.', v: true },
    { t: 'A população do Brasil diminuiu de 1950 a 2022.', v: false, fb: 'Cresceu: de 51.944.397 em 1950 para 203.080.756 em 2022.' },
    { t: 'Em 2022, a população parda era 45,3% e a branca 42,8%.', v: true },
    { t: 'Os nascimentos aumentaram e as pessoas vivem menos.', v: false, fb: 'Houve redução de nascimentos e aumento do tempo médio de vida.' },
    { t: 'O governo deve demarcar territórios indígenas e quilombolas.', v: true },
    { t: 'Brasília foi construída para esvaziar o interior.', v: false, fb: 'A construção de Brasília estimulou a ocupação do interior.' },
    { t: 'A modernização da agropecuária e terras mais baratas estimularam migrações para o interior.', v: true },
    { t: 'Máquinas agrícolas e industrialização contribuíram para a migração do campo para a cidade.', v: true },
    { t: 'Pobreza energética é desperdiçar energia.', v: false, fb: 'É a falta ou limitação de acesso à energia.' },
    { t: 'Pobreza, abandono escolar e preconceito dificultam o acesso a trabalhos mais bem pagos.', v: true },
    { t: 'O crescimento urbano aumentou os territórios indígenas.', v: false, fb: 'O crescimento urbano e a expansão agropecuária reduziram populações e territórios indígenas.' }
  ];
})();
