/* =====================================================================
   questions/c1.js — CAPÍTULO 1: O MOSAICO DO POVO BRASILEIRO
   15 questões rastreáveis (GEO-C1-Q01 … GEO-C1-Q15). Conteúdo
   exclusivamente das seções 8.1 a 8.5 do material fornecido.
   Campos (modelo pedagógico): id, chapter, stage, concept, title,
   prompt, book, personal, pre (≤3 blocos), visual, type, spec, answer,
   ok (acerto), why, recap (1º erro), hint1, hint2 (2º erro), guided
   (3º erro), confirm (nova aplicação), review (revisão), where, effect.
   Recompensas/estrelas por tentativa: ver systems/economy.js.
   ===================================================================== */
(function () {
  'use strict';
  const ok = (t, fb, extra) => Object.assign({ t, ok: true, fb }, extra || {});
  const no = (t, fb, extra) => Object.assign({ t, ok: false, fb }, extra || {});
  const Q = (GEO.data.questions = GEO.data.questions || []);

  Q.push(
    /* ------------------------------------------------ Fase 1-1 Festival da Diversidade */
    {
      id: 'GEO-C1-Q01', chapter: 1, stage: 'c1s1', concept: 'Diversidade do povo brasileiro', book: true,
      title: 'Diversidade no cartaz',
      prompt: 'De que modo o cartaz do Festival da Diversidade Cultural ilustra a diversidade do brasileiro?',
      pre: ['O povo brasileiro é **diverso** pela convivência e mistura de **diferentes povos**.', 'A diversidade aparece no **jeito de falar**, na **cor da pele**, nos **tipos de cabelo**, nos **costumes** e nas **preferências alimentares**.'],
      visual: 'cartaz', visualLabel: 'Ver o cartaz do festival',
      type: 'open',
      spec: {
        placeholder: 'Ex.: O cartaz mostra pessoas com…',
        min: 2, mustAny: [0, 1, 2, 3, 4],
        groups: [
          { label: 'Pessoas com aparências diferentes', kw: ['aparencia', 'aparencias', 'traco', 'tracos', 'fisic', 'rosto', 'altura', 'diferentes', 'diversas'] },
          { label: 'Diferentes tons de pele', kw: ['pele', 'cor da pele', 'cores de pele', 'tom de pele', 'tons'] },
          { label: 'Diferentes tipos de cabelo', kw: ['cabelo', 'cabelos', 'cacheado', 'liso', 'crespo', 'tranca'] },
          { label: 'Roupas diferentes', kw: ['roupa', 'roupas', 'vestid', 'vestimenta', 'fantasia'] },
          { label: 'Manifestações culturais e artísticas', kw: ['danca', 'dancam', 'musica', 'arte', 'artistic', 'cultur', 'festa', 'tambor', 'instrument', 'canta', 'cantam', 'costume'] },
          { label: 'Todos convivendo no mesmo festival', kw: ['junt', 'conviv', 'mesmo festival', 'mesmo lugar', 'todos', 'mistur', 'uniao'] }
        ],
        distractors: ['Todas as pessoas do cartaz são iguais', 'Só aparece um tipo de roupa', 'O cartaz mostra só um povo'],
        wrongIdeas: [{ kw: ['todos iguais', 'todas iguais', 'sao iguais', 'tudo igual'], fb: 'Observe de novo: as pessoas do cartaz são diferentes entre si.' }]
      },
      answer: 'Mostra pessoas com diferentes aparências, tons de pele, cabelos, roupas e manifestações culturais/artísticas convivendo no mesmo festival.',
      ok: 'Isso! O cartaz mostra a diversidade do povo brasileiro.',
      why: 'O cartaz mostra pessoas com **aparências, tons de pele, cabelos e roupas diferentes** e **manifestações culturais e artísticas**, todas **convivendo** no mesmo festival.',
      recap: 'Lembre: a diversidade aparece na aparência, nas roupas e nas manifestações culturais.',
      hint1: 'Compare as pessoas do cartaz: pele, cabelo, roupas e o que estão fazendo.',
      hint2: 'Encontre pelo menos duas diferenças: tons de pele, cabelos, roupas, danças ou músicas.',
      guided: { type: 'fill', prompt: 'Complete a explicação sobre o cartaz:', text: 'O cartaz mostra pessoas com diferentes tons de {0}, tipos de {1} e {2}, e várias manifestações {3}, todas {4} no mesmo festival.', answers: ['pele', 'cabelo', 'roupas', 'culturais', 'convivendo'], bank: ['iguais', 'sozinhas'] },
      confirm: { type: 'mc', prompt: 'Qual frase descreve a diversidade mostrada no cartaz?', options: [ok('Pessoas diferentes, com culturas diferentes, convivendo juntas'), no('Pessoas iguais, com a mesma roupa', 'O cartaz mostra justamente as diferenças.'), no('Pessoas de um único povo', 'O Brasil foi formado por muitos povos.')] },
      review: { type: 'mc', prompt: 'Em um festival, o que mostra a diversidade do povo brasileiro?', options: [ok('Pessoas com aparências, costumes e manifestações culturais diferentes convivendo'), no('Todos vestidos iguais e falando do mesmo jeito', 'Isso apagaria as diferenças.'), no('Apenas uma dança e uma comida', 'A diversidade aparece em muitas manifestações.')] },
      where: 'Fase 1-1 • Totem da Gaia no palco do festival', effect: 'O cartaz do palco ganha cores e o público aplaude.'
    },
    {
      id: 'GEO-C1-Q02', chapter: 1, stage: 'c1s1', concept: 'Perceber a diversidade sem julgar', book: true, personal: true,
      title: 'Pessoas semelhantes',
      prompt: 'Você conhece pessoas parecidas com as personagens do cartaz?',
      pre: ['Esta é uma pergunta **pessoal**: não existe resposta errada. Vale qualquer resposta **respeitosa**, sem julgar a aparência de ninguém.'],
      visual: 'cartaz',
      type: 'personal',
      spec: { single: true, choices: ['Sim, conheço pessoas parecidas', 'Conheço algumas', 'Ainda não conheço'], placeholder: 'Se quiser, conte onde: na escola, no bairro… (não escreva nomes completos).', note: 'Resposta pessoal. Qualquer resposta respeitosa vale — e ela não fica guardada no jogo.' },
      answer: 'Resposta pessoal respeitosa, percebendo a diversidade sem julgar a aparência.',
      ok: 'Obrigado por compartilhar! Perceber a diversidade à nossa volta, sem julgar, é uma forma de respeito.',
      why: 'Pessoas diferentes estão por toda parte: na escola, na família, no bairro. **Perceber as diferenças sem julgar** é respeitar.',
      recap: 'Responda sem palavras que julgam a aparência, como “feio” ou “esquisito”.',
      hint1: 'Pense em pessoas da sua escola, do bairro ou da família.', hint2: 'Escolha uma opção. Todas são aceitas.',
      guided: { type: 'fill', prompt: 'Complete com respeito:', text: 'Conheço pessoas {0} e todas merecem {1}.', answers: ['diferentes', 'respeito'], bank: ['feias', 'risadas'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'Ao notar diferenças entre as pessoas, qual atitude combina com o respeito?', options: [ok('Perceber as diferenças sem julgar a aparência'), no('Rir de quem é diferente', 'Rir de alguém por ser diferente é desrespeito.'), no('Dizer que só um jeito de ser é certo', 'As diferenças são uma riqueza.')] },
      review: { type: 'mc', prompt: 'Perceber a diversidade das pessoas ao nosso redor significa…', options: [ok('notar as diferenças e respeitá-las'), no('escolher quem é mais bonito', 'Não se trata de julgar aparência.'), no('fingir que todos são iguais', 'As diferenças existem e merecem respeito.')] },
      where: 'Fase 1-1 • Conversa com o público do festival', effect: 'Pessoas diferentes acenam para Gabriel.'
    },
    {
      id: 'GEO-C1-Q03', chapter: 1, stage: 'c1s1', concept: 'Diversidade no dia a dia', book: true,
      title: 'Diversidade na sala',
      prompt: 'Na sala de aula também há diversidade de pessoas? Explique.',
      pre: ['A diversidade não está só nos festivais: aparece também na **escola**, na aparência, na **origem**, nos **gostos** e no **jeito de falar**.'],
      visual: 'sala', visualLabel: 'Ver a sala de aula',
      type: 'open',
      spec: {
        placeholder: 'Ex.: Sim, porque na sala…', min: 2, mustAny: [1, 2, 3, 4],
        groups: [
          { label: 'Sim, há diversidade', kw: ['sim', 'ha diversidade', 'tem diversidade', 'existe', 'divers'] },
          { label: 'Diferenças de aparência', kw: ['aparencia', 'pele', 'cabelo', 'altura', 'olho', 'rosto', 'fisic', 'oculos'] },
          { label: 'Origens diferentes', kw: ['origem', 'origens', 'famili', 'nasceu', 'vem de', 'vieram', 'cidade', 'estado', 'pais', 'regiao'] },
          { label: 'Costumes e gostos diferentes', kw: ['costume', 'gosto', 'gostam', 'gosta', 'comida', 'brincadeira', 'preferenc', 'time', 'musica', 'religi'] },
          { label: 'Jeitos de falar ou pensar diferentes', kw: ['fala', 'falar', 'sotaque', 'pensa', 'pensar', 'opiniao', 'jeito'] },
          { label: 'Todos devem se respeitar e conviver', kw: ['respeit', 'conviv', 'junt', 'amig', 'uniao'] }
        ],
        distractors: ['Na sala todos são exatamente iguais', 'Só existe diversidade em outros países'],
        wrongIdeas: [{ kw: ['todos iguais', 'todos sao iguais', 'ninguem e diferente', 'nao tem diferenca'], fb: 'Mesmo na mesma turma, as pessoas têm aparências, origens e gostos diferentes.' }]
      },
      answer: 'Sim: há diferenças de aparência, origem, costumes, gostos, modos de falar ou pensar, e todos devem se respeitar e conviver.',
      ok: 'Muito bem! A sala de aula também é um pedaço da diversidade do Brasil.',
      why: 'Na sala há colegas com **aparências**, **origens**, **costumes**, **gostos** e **jeitos de falar** diferentes — e todos devem **se respeitar** e **conviver**.',
      recap: 'Pense nas diferenças entre você e seus colegas: aparência, origem, gostos, jeito de falar.',
      hint1: 'Compare dois colegas: o que é diferente entre eles?', hint2: 'Diga “sim” e cite pelo menos uma diferença: aparência, origem, gostos ou jeito de falar.',
      guided: { type: 'fill', prompt: 'Complete a explicação:', text: 'Sim. Na sala há colegas com {0} diferentes, que vêm de {1} diferentes e têm {2} diferentes. Todos devem se {3}.', answers: ['aparências', 'lugares', 'gostos', 'respeitar'], bank: ['iguais', 'afastar'] },
      confirm: { type: 'mc', prompt: 'Um colega gosta de futebol e tem sotaque de outra região; outro prefere desenhar. Isso mostra…', options: [ok('diversidade de gostos e de jeitos de falar'), no('que um deles está errado', 'Diferenças não são erros.'), no('que não há diversidade', 'Gostos e sotaques diferentes são diversidade.')] },
      review: { type: 'mc', prompt: 'Qual frase mostra diversidade na escola?', options: [ok('Colegas com origens, gostos e jeitos de falar diferentes estudam juntos'), no('Todos os alunos pensam igual', 'As pessoas pensam de jeitos diferentes.'), no('Só existe diversidade em festas', 'Ela aparece também no dia a dia.')] },
      where: 'Fase 1-1 • Barraca da escola no festival', effect: 'A barraca da escola ganha desenhos de toda a turma.'
    },
    {
      id: 'GEO-C1-Q04', chapter: 1, stage: 'c1s1', concept: 'Povos que formam a população brasileira', book: true,
      title: 'Povos citados pelo ISA',
      prompt: 'Segundo o texto do Instituto Socioambiental, quais povos e grupos deram origem ou compõem a população brasileira?',
      pre: ['**Povos indígenas**, **portugueses** e povos de várias regiões da **África** estão no início da formação do povo brasileiro.', 'Depois vieram **alemães, italianos, espanhóis, japoneses, sírios, libaneses, chineses, coreanos** e outros.', '**Origem étnica** é a origem de um povo ou grupo social caracterizado por uma **cultura própria**.'],
      visual: 'isa', visualLabel: 'Ver o resumo do texto do ISA',
      type: 'multi',
      spec: {
        min: 4, note: 'Marque pelo menos 4 grupos citados no texto (inclua os quatro principais).',
        required: ['Povos indígenas', 'Descendentes de africanos', 'Imigrantes europeus', 'Imigrantes asiáticos'],
        requiredMsg: 'Faltou um dos quatro grupos principais do texto: indígenas, descendentes de africanos, imigrantes europeus e asiáticos.',
        options: [ok('Povos indígenas'), ok('Descendentes de africanos'), ok('Imigrantes europeus'), ok('Imigrantes asiáticos'), ok('Árabes e judeus'), ok('Caiçaras, caboclos e ribeirinhos'), ok('Camponeses, extrativistas e colonos'),
          no('Somente portugueses', 'O texto mostra muitos povos, não um só.'), no('Nenhum povo: o território era vazio', 'Antes de o Brasil existir como país, muitos povos indígenas já viviam aqui.'), no('Só quem mora em cidades grandes', 'O texto cita populações rurais e urbanas.')]
      },
      answer: 'Povos indígenas; descendentes de africanos; imigrantes europeus e asiáticos; árabes; judeus; além de caiçaras, caboclos, ribeirinhos, camponeses, extrativistas, pequenos fazendeiros, colonos e populações rurais e urbanas.',
      ok: 'Excelente! Você reconheceu os povos que compõem o Brasil.',
      why: 'O texto cita **indígenas**, **descendentes de africanos**, **imigrantes europeus e asiáticos**, **árabes**, **judeus**, além de **caiçaras, caboclos, ribeirinhos, camponeses, extrativistas, pequenos fazendeiros, colonos** e populações **rurais e urbanas**.',
      recap: 'O texto do ISA cita muitos grupos. Os quatro principais: indígenas, africanos, europeus e asiáticos.',
      hint1: 'Releia o resumo do texto: ele começa pelos povos indígenas.', hint2: 'Os quatro principais são: indígenas, descendentes de africanos, imigrantes europeus e asiáticos.',
      guided: { type: 'fill', prompt: 'Complete com os grupos do texto:', text: 'O texto cita povos {0}, descendentes de {1}, imigrantes {2} e {3}, além de árabes, judeus, caiçaras e ribeirinhos.', answers: ['indígenas', 'africanos', 'europeus', 'asiáticos'], bank: ['somente portugueses', 'marcianos'] },
      confirm: { type: 'mc', prompt: 'Qual lista tem apenas grupos citados no texto do ISA?', options: [ok('Indígenas, descendentes de africanos, imigrantes europeus e asiáticos'), no('Somente portugueses e espanhóis', 'O texto cita muitos outros grupos.'), no('Apenas pessoas das cidades grandes', 'O texto fala de populações rurais e urbanas.')] },
      review: { type: 'multi', prompt: 'Marque grupos que o texto do ISA cita na população brasileira.', min: 3, options: [ok('Ribeirinhos'), ok('Imigrantes asiáticos'), ok('Povos indígenas'), no('Só um povo', 'São muitos povos.')] },
      where: 'Fase 1-1 • Placa do Instituto no fim do festival', effect: 'O mosaico do palco se completa com todos os grupos.'
    },

    /* ------------------------------------------------ Fase 1-2 Mapa dos Povos Originários */
    {
      id: 'GEO-C1-Q05', chapter: 1, stage: 'c1s2', concept: 'Diversidade dos povos indígenas', book: true,
      title: 'Os povos indígenas são iguais?',
      prompt: 'É possível afirmar que todos os indígenas são iguais? Por quê?',
      pre: ['Antes de o Brasil existir como país, o território era ocupado por **muitos povos indígenas**.', 'Eram grupos **diferentes**, com **nomes, línguas e costumes próprios**. Coletavam frutos, caçavam, pescavam e faziam pequenos roçados.', 'Os colonizadores europeus **não reconheceram essas diferenças** e chamaram os diversos povos de forma **genérica**.'],
      visual: 'povos', visualLabel: 'Ver a aldeia de cartões',
      type: 'open',
      spec: {
        placeholder: 'Ex.: Não, porque existem…', min: 2, must: [0],
        groups: [
          { label: 'Não, não são iguais', kw: ['nao', 'nao sao', 'nunca'] },
          { label: 'Existem povos diferentes', kw: ['povos', 'grupos', 'diferentes', 'varios', 'muitos', 'divers'] },
          { label: 'Cada povo tem nome e língua próprios', kw: ['nome', 'nomes', 'lingua', 'linguas', 'idioma', 'fala'] },
          { label: 'Cada povo tem costumes e cultura próprios', kw: ['costume', 'costumes', 'cultura', 'culturas', 'tradic', 'jeito de viver', 'modo de vida'] }
        ],
        distractors: ['Sim, todos falam a mesma língua', 'Sim, todos vivem do mesmo jeito'],
        wrongIdeas: [{ kw: ['sim', 'todos iguais', 'sao todos iguais', 'todos sao iguais'], fb: 'Cuidado com a generalização! Existem povos diferentes, cada um com nome, língua e costumes.' }]
      },
      answer: 'Não. Existem diferentes povos indígenas, com nomes, línguas, costumes e culturas próprias.',
      ok: 'Isso! Chamar todos de iguais é uma generalização.',
      why: '**Não.** Existem **diferentes povos indígenas**, cada um com **nome, língua, costumes e cultura próprios**. Hoje usamos “**indígena**” para integrantes dos **povos originários** — e eles também vivem, estudam e trabalham nas cidades.',
      recap: 'Lembre: eram muitos povos, cada um com nome, língua e costumes próprios.',
      hint1: 'Pense nos cartões da aldeia: cada povo tem nome e língua?', hint2: 'Comece com “Não” e explique: cada povo tem nome, língua e costumes próprios.',
      guided: { type: 'fill', prompt: 'Complete a resposta:', text: 'Não. Existem {0} povos indígenas, cada um com {1}, {2} e {3} próprios.', answers: ['diferentes', 'nome', 'língua', 'costumes'], bank: ['iguais', 'uma só'] },
      confirm: { type: 'mc', prompt: 'Um colega disse: “Indígena é tudo igual”. O que responder?', options: [ok('Não é: há muitos povos, com nomes, línguas e costumes diferentes'), no('É verdade: todos falam a mesma língua', 'Cada povo tem língua própria.'), no('É verdade: todos vivem do mesmo jeito', 'Cada povo tem costumes próprios.')] },
      review: { type: 'mc', prompt: 'Por que não é correto dizer que todos os indígenas são iguais?', options: [ok('Porque há muitos povos, cada um com nome, língua e costumes próprios'), no('Porque só existe um povo indígena', 'Existem muitos povos.'), no('Porque indígenas não vivem nas cidades', 'Indígenas também vivem, estudam e trabalham nas cidades.')] },
      where: 'Fase 1-2 • Roda de conversa na praça dos cartões', effect: 'As Sombras da Generalização se desfazem na praça.'
    },
    {
      id: 'GEO-C1-Q06', chapter: 1, stage: 'c1s2', concept: 'Origem da família (pessoal)', book: true, personal: true,
      title: 'Origens da família',
      prompt: 'Sua família descende de quais povos?',
      pre: ['Pergunta **pessoal e opcional**. Se você **não souber**, tudo bem: escolha “Não sei ainda” e converse com sua família depois.'],
      type: 'personal',
      spec: { choices: ['Povos indígenas', 'Portugueses', 'Povos africanos', 'Imigrantes de outros países', 'Outros povos'], allowUnknown: true, unknownLabel: '🤔 Não sei ainda — vou conversar com minha família', text: false, note: 'Não existe resposta certa. Escolha o que você sabe ou “Não sei ainda”. Nada disso fica guardado no jogo.' },
      answer: 'Resposta pessoal. Pode ser “não sei ainda”, com orientação de conversar com familiares.',
      ok: 'Ótimo! Conhecer a história da família é uma descoberta. Se tiver dúvida, pergunte a um familiar, sem pressa.',
      why: 'Muitas famílias brasileiras descendem de **povos diferentes**. Para saber a sua, o melhor caminho é **conversar com familiares** — nunca inventar.',
      recap: 'Escolha uma opção ou “Não sei ainda”.', hint1: 'Não precisa saber agora: “Não sei ainda” também vale.', hint2: 'Escolha qualquer opção ou “Não sei ainda”.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Para descobrir a origem da minha família, posso {0} com meus familiares.', answers: ['conversar'], bank: ['inventar'], prefill: 0 },
      confirm: null,
      review: { type: 'mc', prompt: 'O que fazer se você não souber de quais povos sua família descende?', options: [ok('Conversar com familiares para descobrir'), no('Inventar uma origem qualquer', 'Não é preciso inventar: é melhor perguntar à família.'), no('Dizer que a família não tem origem', 'Toda família tem uma história; vale conversar para conhecer.')] },
      where: 'Fase 1-2 • Árvore das Famílias', effect: 'A Árvore das Famílias floresce.'
    },
    {
      id: 'GEO-C1-Q07', chapter: 1, stage: 'c1s2', concept: 'Mapa histórico dos povos indígenas', book: true,
      title: 'Povos indígenas em São Paulo',
      prompt: 'Observando o mapa histórico, qual grupo ocupava principalmente o território que hoje forma o estado de São Paulo?',
      pre: ['No **mapa histórico** do livro, as áreas mostram grupos indígenas que ocupavam o território.', 'Procure o território que **hoje** forma o estado de **São Paulo** (contornado no mapa) e leia a legenda.'],
      visual: 'mapaIndigena', visualLabel: 'Ver o mapa histórico',
      type: 'mc',
      spec: { options: [ok('Tupi-Guarani'), no('Nenhum grupo: a área era vazia', 'O território era ocupado por muitos povos indígenas antes de o Brasil existir como país.'), no('Imigrantes japoneses', 'Os imigrantes chegaram muito depois. O mapa é de antes da colonização.'), no('Colonizadores portugueses', 'O mapa histórico mostra os povos indígenas que já viviam no território.')] },
      answer: 'Tupi-Guarani.',
      ok: 'Certo! No mapa, a área de São Paulo aparece associada ao grupo Tupi-Guarani.',
      why: 'No mapa histórico, o território que hoje corresponde a **São Paulo** aparece principalmente associado ao grupo **Tupi-Guarani**.',
      recap: 'Encontre o contorno de São Paulo no mapa e veja a legenda daquela área.',
      hint1: 'Use o dedo para achar o estado contornado e olhe a legenda.', hint2: 'A área que cobre São Paulo tem hachuras e o nome do grupo escrito sobre ela.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'No mapa, o território de São Paulo aparece associado ao grupo {0}-{1}.', answers: ['Tupi', 'Guarani'], bank: ['Japonês', 'Português'] },
      confirm: { type: 'mc', prompt: 'Complete: antes da colonização, a área de São Paulo era ocupada principalmente por povos…', options: [ok('Tupi-Guarani'), no('imigrantes', 'Os imigrantes chegaram muito depois.'), no('de nenhum grupo', 'O território era ocupado por povos indígenas.')] },
      review: { type: 'mc', prompt: 'No mapa histórico do livro, qual grupo aparece no território do atual estado de São Paulo?', options: [ok('Tupi-Guarani'), no('Italianos', 'Os imigrantes vieram depois.'), no('Nenhum', 'O território já era ocupado.')] },
      where: 'Fase 1-2 • Mesa do Mapa Histórico', effect: 'O mapa da mesa se acende com os nomes corretos.'
    },
    {
      id: 'GEO-C1-Q08', chapter: 1, stage: 'c1s2', concept: 'Palavras de origem indígena', book: true,
      title: 'Palavras de origem indígena',
      prompt: 'Cite palavras de origem indígena que você conhece.',
      pre: ['Muitas palavras do nosso dia a dia vieram de **línguas indígenas**. Gaia guardou alguns cartões: **abacaxi, mandioca, pipoca, capivara, jacaré e tatu**.'],
      visual: 'palavras', visualLabel: 'Ver os cartões de palavras',
      type: 'open',
      spec: {
        placeholder: 'Escreva duas ou mais palavras, separadas por vírgula.', min: 2,
        groups: [
          { label: 'abacaxi', kw: ['abacaxi'] }, { label: 'mandioca', kw: ['mandioca'] }, { label: 'pipoca', kw: ['pipoca'] },
          { label: 'capivara', kw: ['capivara'] }, { label: 'jacaré', kw: ['jacare'] }, { label: 'tatu', kw: ['tatu'] },
          { label: 'caju', kw: ['caju'], extra: true }, { label: 'maracujá', kw: ['maracuja'], extra: true }, { label: 'arara', kw: ['arara'], extra: true }, { label: 'tucano', kw: ['tucano'], extra: true }
        ],
        distractors: ['computador', 'internet', 'televisão']
      },
      answer: 'Exemplos comuns: abacaxi, mandioca, pipoca, capivara, jacaré e tatu.',
      ok: 'Muito bem! Essas palavras mostram a influência indígena na nossa língua.',
      why: 'Palavras como **abacaxi, mandioca, pipoca, capivara, jacaré e tatu** têm origem indígena e fazem parte do português falado no Brasil.',
      recap: 'Use os cartões da Gaia: há frutas, comidas e animais.',
      hint1: 'Pense em uma fruta e em um animal dos cartões.', hint2: 'Cartões: abacaxi, mandioca, pipoca, capivara, jacaré, tatu. Escreva dois.',
      guided: { type: 'fill', prompt: 'Complete com palavras de origem indígena:', text: 'Palavras de origem indígena: {0}, {1} e {2}.', answers: ['abacaxi', 'capivara', 'jacaré'], bank: ['internet', 'televisão'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Qual destas palavras tem origem indígena, segundo os cartões da Gaia?', options: [ok('Mandioca'), no('Computador', 'Não está entre os cartões de origem indígena.'), no('Internet', 'Não está entre os cartões de origem indígena.')] },
      review: { type: 'multi', prompt: 'Marque as palavras de origem indígena dos cartões da Gaia.', min: 3, options: [ok('Tatu'), ok('Pipoca'), ok('Capivara'), no('Televisão', 'Não é dos cartões de origem indígena.')] },
      where: 'Fase 1-2 • Varal de Palavras', effect: 'As palavras voam do varal e viram trilhas no mapa.'
    },

    /* ------------------------------------------------ Fase 1-3 Rotas pelo Atlântico */
    {
      id: 'GEO-C1-Q09', chapter: 1, stage: 'c1s3', concept: 'Plantas cartográficas e colonização no litoral', book: true,
      title: 'Planta de Salvador',
      prompt: 'Que detalhes podem ser identificados na planta de Salvador de 1631?',
      pre: ['A colonização portuguesa começou concentrada no **litoral**. Ali surgiram as primeiras **vilas, cidades e fortalezas**.', '**Plantas cartográficas** permitem estudar os detalhes dessas cidades, como a planta de **Salvador de 1631**.'],
      visual: 'salvador', visualLabel: 'Ver a planta inspirada em Salvador (1631)',
      type: 'multi',
      spec: { min: 3, options: [ok('Muitas construções concentradas'), ok('Centro em terreno mais plano'), ok('Costa com navios'), ok('Fortalezas'), ok('Quartéis'), ok('Canhões para proteger a cidade'), no('Aeroporto', 'Em 1631 não havia aviões. Observe a costa com navios.'), no('Arranha-céus e metrô', 'Esses elementos não aparecem na planta de 1631.'), no('Estádio de futebol', 'Esse elemento não aparece na planta de 1631.')] },
      answer: 'Concentração de construções, centro em terreno mais plano, costa/navios, fortalezas, quartéis, canhões e proteção da cidade.',
      ok: 'Ótimo trabalho de cartógrafo!',
      why: 'Na planta aparecem **muitas construções concentradas**, o **centro em terreno mais plano**, a **costa com navios**, **fortalezas**, **quartéis** e **canhões** — tudo ligado à **proteção da cidade**.',
      recap: 'Observe a legenda da planta: cada símbolo mostra um detalhe.',
      hint1: 'Procure na legenda: construções, fortalezas, quartéis, canhões e navios.', hint2: 'Marque três detalhes que existiam em 1631: construções, fortalezas e navios, por exemplo.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Na planta vemos muitas {0} concentradas, o centro em terreno mais {1}, a {2} com navios e {3}, quartéis e canhões para proteger a cidade.', answers: ['construções', 'plano', 'costa', 'fortalezas'], bank: ['aviões', 'montanhoso'] },
      confirm: { type: 'mc', prompt: 'Por que a planta mostra fortalezas e canhões na costa?', options: [ok('Para proteger a cidade'), no('Para enfeitar a praia', 'Fortalezas e canhões serviam para proteção.'), no('Porque eram fábricas', 'Eram construções de defesa.')] },
      review: { type: 'multi', prompt: 'Marque detalhes da planta de Salvador de 1631.', min: 2, options: [ok('Fortalezas'), ok('Navios na costa'), no('Aeroporto', 'Não existia em 1631.')] },
      where: 'Fase 1-3 • Ilha-Atlas da Planta', effect: 'A planta aparece como holograma sobre o mar.'
    },
    {
      id: 'GEO-C1-Q10', chapter: 1, stage: 'c1s3', concept: 'Representar o município numa planta', book: true,
      title: 'Planta do município',
      prompt: 'Se você elaborasse uma planta do município onde vive, que aspectos representaria? Monte sua planta!',
      pre: ['Uma **planta** mostra um lugar **visto de cima**, com símbolos e uma **legenda** explicando cada um.'],
      type: 'builder',
      spec: {
        cols: 6, rows: 4, min: 4, note: 'Escolha um elemento e toque nos quadrinhos. Use pelo menos 4 tipos de elementos reais.',
        palette: [
          { id: 'rua', icon: '🛣️', t: 'Rua/avenida', real: true }, { id: 'casa', icon: '🏠', t: 'Casas', real: true }, { id: 'predio', icon: '🏢', t: 'Prédios', real: true },
          { id: 'praca', icon: '⛲', t: 'Praça', real: true }, { id: 'parque', icon: '🌳', t: 'Parque', real: true }, { id: 'rio', icon: '🌊', t: 'Rio', real: true },
          { id: 'escola', icon: '🏫', t: 'Escola', real: true }, { id: 'hospital', icon: '🏥', t: 'Hospital', real: true }, { id: 'bairro', icon: '🏘️', t: 'Bairro', real: true },
          { id: 'dragao', icon: '🐉', t: 'Dragão', real: false }, { id: 'castelo', icon: '🏰', t: 'Castelo voador', real: false }
        ]
      },
      answer: 'Ruas, avenidas, casas/prédios, praças, parques, rios, bairros, escolas, hospitais e outros elementos reais.',
      ok: 'Sua planta tem elementos reais do município e uma legenda. É assim que se representa uma cidade!',
      why: 'Uma planta do município pode mostrar **ruas, avenidas, casas, prédios, praças, parques, rios, bairros, escolas, hospitais** e outros **elementos reais**, com **legenda**.',
      recap: 'Numa planta só entram elementos reais do lugar.',
      hint1: 'Pense no caminho da sua casa até a escola: o que existe nele?', hint2: 'Use ruas, casas, escola e praça — todos reais.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Na planta do meu município eu desenharia {0}, {1}, {2} e {3}.', answers: ['ruas', 'casas', 'praças', 'escolas'], bank: ['dragões', 'castelos voadores'] },
      confirm: { type: 'mc', prompt: 'Qual destes elementos faz sentido numa planta de município?', options: [ok('Hospital'), no('Nave espacial', 'Planta mostra elementos reais do município.'), no('Dragão', 'Planta mostra elementos reais do município.')] },
      review: { type: 'multi', prompt: 'Marque elementos que podem aparecer na planta de um município.', min: 3, options: [ok('Ruas'), ok('Praças'), ok('Escolas'), no('Castelo voador', 'Não é um elemento real.')] },
      where: 'Fase 1-3 • Porto do Cartógrafo', effect: 'Sua planta vira uma bandeira na nave.'
    },
    {
      id: 'GEO-C1-Q11', chapter: 1, stage: 'c1s3', concept: 'Observar arte afro-brasileira', book: true, personal: true,
      title: 'Obra de Carybé',
      prompt: 'O que mais chamou sua atenção na pintura de Carybé? Por quê?',
      pre: ['O artista **Carybé** representou **rodas de capoeira**, **orixás** e rituais de **candomblé**.', 'Ele usou **madeira, cerâmica e concreto** em obras ligadas à cultura afro-brasileira. Veja uma cena **inspirada** nesses temas.'],
      visual: 'carybe', visualLabel: 'Ver a cena inspirada nos temas de Carybé',
      type: 'personal',
      spec: {
        choices: ['As personagens', 'As roupas', 'O ritual', 'O movimento', 'As cores', 'Os elementos culturais'], min: 1,
        reasons: ['porque mostra a cultura afro-brasileira', 'porque parece que as pessoas estão se movendo', 'porque as cores chamam atenção', 'porque mostra uma roda de capoeira', 'porque mostra uma celebração'],
        reasonsTitle: 'Por quê? (escolha ou escreva)', placeholder: 'Se quiser, escreva seu porquê.',
        note: 'Observação pessoal: escolha o que chamou sua atenção e explique por quê.'
      },
      answer: 'Observação pessoal com justificativa: personagens, roupas, ritual, movimento, cores ou elementos culturais.',
      ok: 'Ótima observação! Explicar o porquê ajuda a entender a obra.',
      why: 'Na arte de Carybé há **personagens**, **roupas**, **rituais**, **movimento** e **cores** que representam a **cultura afro-brasileira**.',
      recap: 'Escolha algo que chamou sua atenção e um motivo.', hint1: 'Olhe para as pessoas: o que estão fazendo?', hint2: 'Escolha um item e um “porquê”.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O que mais chamou minha atenção foi o {0}, porque mostra a cultura {1}.', answers: ['movimento', 'afro-brasileira'], bank: ['japonesa'], prefill: 0 },
      confirm: null,
      review: { type: 'mc', prompt: 'Que materiais Carybé usou em obras ligadas à cultura afro-brasileira?', options: [ok('Madeira, cerâmica e concreto'), no('Plástico e vidro', 'O livro cita madeira, cerâmica e concreto.'), no('Somente papel', 'O livro cita madeira, cerâmica e concreto.')] },
      where: 'Fase 1-3 • Galeria da Ilha da Arte', effect: 'A galeria se enche de cor e música.'
    },
    {
      id: 'GEO-C1-Q12', chapter: 1, stage: 'c1s3', concept: 'Influência africana na arte e na cultura', book: true,
      title: 'Influência africana na arte',
      prompt: 'Como a influência africana foi representada por Carybé?',
      pre: ['Pessoas escravizadas vieram de **diferentes regiões da África**, com **línguas e culturas distintas**.', 'As **influências africanas** estão presentes na **cultura** e no **vocabulário** brasileiros — e aparecem na arte de Carybé.'],
      visual: 'carybe',
      type: 'multi',
      spec: { min: 2, options: [ok('Rodas de capoeira'), ok('Orixás'), ok('Rituais de candomblé'), ok('Religiosidade afro-brasileira'), no('Imigrantes em fazendas de café', 'Isso é imigração, não o tema de Carybé citado no livro.'), no('Festa do Divino', 'A Festa do Divino tem origem portuguesa.')] },
      answer: 'Por cenas e personagens da cultura afro-brasileira: rodas de capoeira, orixás, religiosidade e rituais de candomblé.',
      ok: 'Isso mesmo!',
      why: 'Carybé representou a influência africana com **rodas de capoeira**, **orixás**, **religiosidade** e **rituais de candomblé** — cenas da **cultura afro-brasileira**.',
      recap: 'Lembre os temas de Carybé citados pela Gaia.', hint1: 'Um dos temas é uma luta que parece dança, feita em roda.', hint2: 'Capoeira, orixás e candomblé.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Carybé representou a influência africana com rodas de {0}, {1} e rituais de {2}.', answers: ['capoeira', 'orixás', 'candomblé'], bank: ['Divino', 'café'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Uma obra mostra uma roda de capoeira. Que influência ela representa?', options: [ok('Africana'), no('Portuguesa', 'A capoeira está ligada à cultura afro-brasileira.'), no('Japonesa', 'A capoeira está ligada à cultura afro-brasileira.')] },
      review: { type: 'mc', prompt: 'Quais temas Carybé usou para representar a influência africana?', options: [ok('Capoeira, orixás e candomblé'), no('Festa do Divino e bandeiras', 'Isso é de origem portuguesa.'), no('Fazendas de café', 'Isso é imigração.')] },
      where: 'Fase 1-3 • Galeria da Ilha da Arte', effect: 'Um berimbau de luz toca na galeria.'
    },

    /* ------------------------------------------------ Fase 1-4 Caminhos da Imigração (corrida) */
    {
      id: 'GEO-C1-Q14', chapter: 1, stage: 'c1s4', concept: 'Imigração entre 1822 e 1900', book: true,
      title: 'Imigração entre 1822 e 1900',
      prompt: 'Quais eram os objetivos do governo ao incentivar a vinda de imigrantes? E de onde eles vieram?',
      pre: ['Os **portugueses** foram o principal grupo que veio **voluntariamente** no período colonial. Por volta de **1820**, chegaram chineses, suíços e alemães.', 'Leis reduziram e depois **proibiram** o trabalho escravo: a **abolição** foi assinada em **1888**.', 'O governo incentivou a imigração para **ocupar fronteiras e terras** e **substituir mão de obra**.'],
      visual: 'rotasImigracao', visualLabel: 'Ver o mapa de rotas',
      type: 'multi',
      spec: {
        note: 'Marque pelo menos 2 objetivos e 1 origem.', needTags: [{ tag: 'obj', min: 2, msg: 'Marque pelo menos 2 objetivos do governo.' }, { tag: 'ori', min: 1, msg: 'Marque também de onde vieram os imigrantes.' }],
        options: [ok('Objetivo: substituir parte da mão de obra escravizada', null, { tag: 'obj' }), ok('Objetivo: trabalhar no café, na indústria, no comércio e na agropecuária', null, { tag: 'obj' }), ok('Objetivo: ocupar fronteiras e terras', null, { tag: 'obj' }),
          ok('Origem: italianos, espanhóis e japoneses', null, { tag: 'ori' }), ok('Origem: alemães, suíços e chineses', null, { tag: 'ori' }), ok('Origem: turcos, sírios e libaneses', null, { tag: 'ori' }), ok('Origem: poloneses, russos e ucranianos', null, { tag: 'ori' }),
          no('Objetivo: aumentar a escravidão', 'Leis reduziram e depois proibiram o trabalho escravo; a abolição foi assinada em 1888.'), no('Objetivo: fazer turismo nas praias', 'O governo queria trabalhadores e ocupação de terras.')]
      },
      answer: 'Substituir parte da mão de obra escravizada, trabalhar no café/indústria/comércio/agropecuária e ocupar fronteiras/terras; vieram chineses, suíços, alemães, italianos, espanhóis, japoneses, turcos, sírios, libaneses, poloneses, russos e ucranianos.',
      ok: 'Rota certa! Você entendeu os objetivos e as origens.',
      why: 'O governo queria **substituir parte da mão de obra escravizada**, ter trabalhadores no **café, indústria, comércio e agropecuária** e **ocupar fronteiras e terras**. Vieram **chineses, suíços, alemães, italianos, espanhóis, japoneses, turcos, sírios, libaneses, poloneses, russos e ucranianos**.',
      recap: 'Separe: objetivos (por que o governo queria) e origens (de onde vieram).',
      hint1: 'Um objetivo tem a ver com a abolição; outro, com as fronteiras.', hint2: 'Objetivos: substituir mão de obra, trabalhar, ocupar terras. Origens: por exemplo, italianos e japoneses.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O governo queria {0} parte da mão de obra escravizada e {1} fronteiras e terras. Vieram italianos, {2}, japoneses, alemães e outros.', answers: ['substituir', 'ocupar', 'espanhóis'], bank: ['aumentar', 'esvaziar'] },
      confirm: { type: 'mc', prompt: 'Italianos, espanhóis e japoneses trabalharam principalmente em…', options: [ok('fazendas de café, indústria e comércio'), no('somente pesca em alto-mar', 'O livro cita café, indústria e comércio.'), no('nenhum trabalho', 'Eles vieram para trabalhar.')] },
      review: { type: 'classify', prompt: 'Ligue os imigrantes às atividades citadas no livro.', bins: [{ id: 'cafe', t: 'Café, indústria e comércio' }, { id: 'com', t: 'Comércio e pequena indústria' }, { id: 'agro', t: 'Agropecuária familiar no Sul' }], items: [{ t: 'Italianos, espanhóis e japoneses', bin: 'cafe' }, { t: 'Turcos, sírios e libaneses', bin: 'com' }, { t: 'Alemães, suíços, poloneses, russos e ucranianos', bin: 'agro' }] },
      where: 'Fase 1-4 • Posto da Gaia no meio da corrida', effect: 'A rota dos imigrantes se ilumina no mapa da corrida.'
    },
    {
      id: 'GEO-C1-Q15', chapter: 1, stage: 'c1s4', concept: 'Imigração atual', book: true,
      title: 'Imigração atual',
      prompt: 'Quais povos mais imigram atualmente para o Brasil, segundo o texto? O que eles buscam?',
      pre: ['Hoje chegam **latino-americanos**, como **venezuelanos, cubanos, colombianos e peruanos**, e **africanos**, como **angolanos e nigerianos**.', 'Eles buscam **trabalho** e **qualidade de vida**.'],
      type: 'multi',
      spec: {
        note: 'Marque pelo menos 2 povos e 1 motivo.', needTags: [{ tag: 'ori', min: 2, msg: 'Marque pelo menos 2 povos que imigram hoje.' }, { tag: 'bus', min: 1, msg: 'Marque também o que eles buscam.' }],
        options: [ok('Venezuelanos e cubanos', null, { tag: 'ori' }), ok('Colombianos e peruanos', null, { tag: 'ori' }), ok('Angolanos e nigerianos', null, { tag: 'ori' }), ok('Buscam trabalho', null, { tag: 'bus' }), ok('Buscam melhores oportunidades e qualidade de vida', null, { tag: 'bus' }),
          no('Portugueses do período colonial', 'Eles vieram no passado; a pergunta é sobre hoje.'), no('Buscam só passar férias', 'O texto diz que buscam trabalho e qualidade de vida.')]
      },
      answer: 'Latino-americanos (venezuelanos, cubanos, colombianos, peruanos) e africanos (angolanos, nigerianos); buscam trabalho, melhores oportunidades e qualidade de vida.',
      ok: 'Perfeito!',
      why: 'Hoje vêm **latino-americanos** (venezuelanos, cubanos, colombianos, peruanos) e **africanos** (angolanos, nigerianos), em busca de **trabalho**, **melhores oportunidades** e **qualidade de vida**.',
      recap: 'A pergunta é sobre a imigração de hoje, não a do passado.', hint1: 'Pense em países vizinhos da América Latina e em países africanos.', hint2: 'Venezuelanos, cubanos, angolanos… e o que buscam: trabalho.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Hoje imigram {0}, como venezuelanos e cubanos, e {1}, como angolanos e nigerianos. Eles buscam {2} e qualidade de vida.', answers: ['latino-americanos', 'africanos', 'trabalho'], bank: ['marcianos', 'férias'] },
      confirm: { type: 'mc', prompt: 'Angolanos e nigerianos que imigram hoje para o Brasil são…', options: [ok('africanos'), no('europeus', 'O texto diz: africanos, como angolanos e nigerianos.'), no('asiáticos', 'O texto diz: africanos, como angolanos e nigerianos.')] },
      review: { type: 'mc', prompt: 'O que buscam os imigrantes que chegam hoje ao Brasil, segundo o texto?', options: [ok('Trabalho e qualidade de vida'), no('Somente turismo', 'O texto fala de trabalho e qualidade de vida.'), no('Ocupar fronteiras para o governo colonial', 'Isso é do passado.')] },
      where: 'Fase 1-4 • Linha de chegada da corrida', effect: 'Bandeirinhas de boas-vindas aparecem na chegada.'
    },

    /* ------------------------------------------------ Fase 1-5 Chefe: Generalizador */
    {
      id: 'GEO-C1-Q13', chapter: 1, stage: 'c1s5', concept: 'Terra e povos tradicionais', book: true,
      title: 'Importância da terra',
      prompt: 'Por que a terra é tão importante para a sobrevivência dos povos tradicionais?',
      pre: ['Nos **quilombos**, as pessoas criavam animais, cultivavam **pequenos roçados** e dividiam tarefas para **abrigo e proteção**.', 'Comunidades **quilombolas** atuais descendem dessas populações. **Indígenas, quilombolas e ribeirinhos** lutam pelo **direito à terra**.'],
      visual: 'quilombo', visualLabel: 'Ver a comunidade',
      type: 'open',
      spec: {
        placeholder: 'Ex.: Porque na terra eles…', min: 2,
        groups: [
          { label: 'Mantêm seu modo de vida', kw: ['modo de vida', 'jeito de viver', 'viver', 'vivem', 'sobreviv'] },
          { label: 'Moradia e abrigo', kw: ['moradia', 'morar', 'moram', 'casa', 'abrigo', 'lar'] },
          { label: 'Alimentação', kw: ['aliment', 'comida', 'comer', 'plant', 'cultiv', 'roca', 'caca', 'pesca', 'animais'] },
          { label: 'Trabalho', kw: ['trabalh'] },
          { label: 'Cultura e tradições', kw: ['cultura', 'tradic', 'costume', 'festa', 'ritual', 'historia'] },
          { label: 'Proteção', kw: ['protec', 'proteg', 'seguranca'] },
          { label: 'Vínculos com a comunidade e a natureza', kw: ['comunidade', 'vinculo', 'natureza', 'juntos', 'famili', 'ancestr'] }
        ],
        distractors: ['Porque a terra serve só para enfeitar', 'Porque podem viver em qualquer lugar sem mudar nada']
      },
      answer: 'Na terra mantêm modo de vida, moradia, alimentação, trabalho, cultura, tradições, proteção e vínculos com a comunidade e a natureza.',
      ok: 'Escudo quebrado! Você explicou a importância da terra.',
      why: 'Na terra, os povos tradicionais mantêm seu **modo de vida**, **moradia**, **alimentação**, **trabalho**, **cultura e tradições**, **proteção** e **vínculos** com a comunidade e a natureza.',
      recap: 'Pense no que a comunidade faz na terra: morar, plantar, trabalhar, celebrar.', hint1: 'Lembre o quilombo: criavam animais e cultivavam roçados.', hint2: 'Cite duas coisas: moradia, alimentação, trabalho, cultura ou proteção.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A terra é importante porque nela os povos tradicionais têm {0}, {1}, {2} e mantêm sua {3} e seus vínculos com a comunidade.', answers: ['moradia', 'alimentação', 'trabalho', 'cultura'], bank: ['shopping', 'férias'] },
      confirm: { type: 'mc', prompt: 'Se uma comunidade quilombola perde sua terra, o que ela pode perder?', options: [ok('Moradia, alimento, trabalho e tradições'), no('Nada, pois pode viver em qualquer lugar do mesmo jeito', 'A terra garante o modo de vida da comunidade.'), no('Apenas uma paisagem bonita', 'A terra é moradia, alimento, trabalho e cultura.')] },
      review: { type: 'mc', prompt: 'Por que a terra é importante para os povos tradicionais?', options: [ok('Porque nela mantêm moradia, alimentação, trabalho e cultura'), no('Porque serve só para passear', 'É a base da vida da comunidade.'), no('Porque é mais bonita que a cidade', 'O motivo é a sobrevivência e o modo de vida.')] },
      where: 'Fase 1-5 • Escudo do Generalizador', effect: 'O escudo do Generalizador se parte e o mosaico volta a ter cores.'
    }
  );

  /* Afirmações para Blocos do Erro, placas e escudos (capítulo 1). v=true verdadeira. */
  GEO.data.statements = GEO.data.statements || {};
  GEO.data.statements[1] = [
    { t: 'O povo brasileiro é diverso pela convivência e mistura de diferentes povos.', v: true },
    { t: 'Indígenas, portugueses e povos de várias regiões da África estão no início da formação do povo brasileiro.', v: true },
    { t: 'O povo brasileiro foi formado por um único povo.', v: false, fb: 'Foram muitos povos: indígenas, portugueses, africanos e, depois, imigrantes.' },
    { t: 'Todos os indígenas falam a mesma língua.', v: false, fb: 'Eram grupos diferentes, com nomes, línguas e costumes próprios.' },
    { t: 'Indígenas também vivem, estudam e trabalham nas cidades.', v: true },
    { t: 'Indígenas só vivem na floresta.', v: false, fb: 'Indígenas também vivem, estudam e trabalham nas cidades.' },
    { t: 'A colonização portuguesa começou concentrada no litoral.', v: true },
    { t: 'O português tornou-se o idioma oficial do Brasil.', v: true },
    { t: 'As pessoas africanas vieram ao Brasil por vontade própria.', v: false, fb: 'Pessoas africanas foram trazidas à força e escravizadas.' },
    { t: 'A fuga de pessoas escravizadas contribuiu para a formação de quilombos.', v: true },
    { t: 'Nenhum quilombo acolhia pessoas brancas ou indígenas.', v: false, fb: 'Alguns quilombos também acolhiam pessoas brancas e indígenas.' },
    { t: 'A abolição da escravidão foi assinada em 1888.', v: true },
    { t: 'Trabalho semelhante à escravidão não existe mais.', v: false, fb: 'O livro explica que ainda ocorre, com promessas falsas, dívidas e impedimento de saída.' },
    { t: 'Trabalho semelhante à escravidão deve ser combatido com denúncia e consumo responsável.', v: true },
    { t: 'Doenças trazidas da Europa aumentaram a população indígena.', v: false, fb: 'Doenças, conflitos por terras e resistência à escravidão diminuíram a população indígena.' },
    { t: 'Colonizadores europeus chamaram os diversos povos indígenas de forma genérica.', v: true },
    { t: 'Origem étnica é o nome da rua onde a pessoa mora.', v: false, fb: 'Origem étnica é a origem de um povo ou grupo social com cultura própria.' },
    { t: 'Apesar das diferenças, todos compartilham o território brasileiro e seguem as mesmas leis.', v: true },
    { t: 'Influências portuguesas aparecem na culinária, na arquitetura, na religiosidade e nos costumes.', v: true },
    { t: 'Pessoas escravizadas eram tratadas com justiça e podiam sair quando quisessem.', v: false, fb: 'Eram tratadas como mercadoria, em condições desumanas; muitas fugiam.' }
  ];
})();
