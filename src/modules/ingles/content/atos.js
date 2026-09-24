/* =====================================================================
   content/atos.js — HISTÓRIA, ATOS, EXPLICAÇÕES E ROTEIRO DO EXPRESSO.
   “Gabriel e o Expresso dos Sonhos”: na noite anterior à prova, um
   bilhete brilhante sai do caderno de Inglês. O Expresso perdeu 3
   Bilhetes-Palavra e precisa voltar à estação antes da manhã.
   Guia: Estela, a estrela-maquinista (falas de até 3 balões).
   Cada ato é uma lista de PASSOS: lesson (explicação curta), game
   (minijogo), block (questões de uma seção do livro), ticket.
   ===================================================================== */
(function () {
  'use strict';
  const D = (window.ING.data = window.ING.data || {});
  const qs = (page, sec) => D.questions.filter((q) => q.page === page && q.sec === sec).map((q) => q.id);
  /** pick = números das questões da seção que entram na campanha (as outras ficam em “exercícios extras”). */
  const block = (page, sec, title, pick) => { const all = qs(page, sec); const q = pick ? all.filter((id) => pick.includes(+id.split('-').pop())) : all; return { type: 'block', id: 'p' + page + '-' + sec.toLowerCase(), page, sec, title, q, all }; };

  /* ------------------------------------------------------------ explicações (só conteúdo do PDF) */
  D.lessons = {
    lugares: { title: '🏙️ Places — lugares', icon: 'banco', cards: [
      { t: 'Estas são as palavras de lugares do livro:', words: [['tour guide', 'guia de passeio', 'guia'], ['galaxy / galaxies', 'galáxia / galáxias', 'galaxia'], ['cart', 'carrinho', 'cart'], ['bank', 'banco', 'banco'], ['post office', 'correio', 'correio'], ['laundromat', 'lavanderia', 'lavanderia'], ['space museum', 'museu espacial', 'museu'], ['water park', 'parque aquático', 'parque_aquatico'], ['comet', 'cometa', 'cometa']] },
      { t: '**would like to** = “gostaria de”. Depois dele vem uma **ação**: go, be, play, have…', ex: ['I would like to go to the space museum.', 'John would like to be a pilot.'] },
      { t: '**would love to** = “adoraria”. Mesma regra: depois vem a ação.', ex: ['Linda would love to be a flight attendant.', 'I would love to have super powers.'] }
    ] },
    palavrinhas: { title: '✨ really, usually, never, under, or', icon: 'estrela', cards: [
      { t: 'Palavrinhas que aparecem nas frases do livro:', words: [['really', 'realmente / muito'], ['usually', 'geralmente'], ['never', 'nunca'], ['under', 'debaixo de'], ['or', 'ou']] },
      { t: 'Veja no livro:', ex: ['Are you really happy today?', 'Do you usually go to the museum?', 'They never go to the bank.', 'The carts go under the water.', 'Do you prefer airplanes or spaceships?'] },
      { t: '**Perguntas pessoais:** responda curto. **Would you…?** → **Yes, I would.** / **No, I wouldn’t.** • **Do you…?** → **Yes, I do.** / **No, I don’t.** • **Are you…?** → **Yes, I am.** / **No, I’m not.**' }
    ] },
    texto: { title: '📖 Professions — When I Grow Up', icon: 'aviao', story: [
      'It is a big day for the super siblings. Today, they are going to fly to Orlando to meet their grandma and grandpa. They are on vacation there.',
      'John and Linda are really excited, because they usually travel on a spaceship, but this time they are going by plane.',
      'When they are going to the airport, they see a driver and a chef with his big white hat. On the airplane, they see the flight attendant and the pilot.',
      'Linda would love to be a flight attendant and a veterinarian. John would like to be a pilot.'
    ], comics: ['What do you do?', "Hi, I'm Kelly and I'm a flight attendant. I help people on airplanes.", "Hi, I'm the pilot. I fly airplanes.", 'Would you like to be a pilot?', 'I would like to be a super pilot when I grow up!!!', 'And I love to fly. I would like to be a flight attendant when I grow up!'],
      cards: [{ t: '**by plane** = de avião • **grow up** = crescer • **when I grow up** = quando eu crescer • **meet** = encontrar.' }] },
    profissoes: { title: '👩‍✈️ Professions — profissões', icon: 'piloto', cards: [
      { t: 'Profissões e palavras da viagem:', words: [['airport', 'aeroporto', 'aeroporto'], ['airplane', 'avião', 'aviao'], ['pilot', 'piloto', 'piloto'], ['flight attendant', 'comissário(a) de bordo', 'mulher'], ['doctor', 'médico(a)', 'estetoscopio'], ['veterinarian', 'veterinário(a)', 'cachorro'], ['taxi driver', 'motorista de táxi', 'taxi'], ['chef', 'chefe de cozinha', 'cozinheiro'], ['woman', 'mulher', 'mulher']] },
      { t: '**What would you like to be?** = O que você gostaria de ser? Resposta: **I would like to be a pilot.**', ex: ['What would you like to be?', 'I would like to be a pilot.'] }
    ] },
    pergunta: { title: '❓ Pergunta com would', icon: 'balao_fala', swap: ['She would like to be a veterinarian.', 'Would she like to be a veterinarian?'], cards: [
      { t: 'Para perguntar, **Would** vai para o **começo**. O resto da frase continua **na mesma ordem**, e no fim vem **?**' },
      { t: 'Mais exemplos do livro:', ex: ['John would like to be a pilot.', 'Would John like to be a pilot?'] }
    ] },
    materias: { title: '🔬 Subjects, professions and dreams', icon: 'microscopio', cards: [
      { t: 'Matérias (subjects) do livro:', words: [['biology', 'biologia', 'microscopio'], ['physics', 'física', 'atomo'], ['chemistry', 'química', 'tubo']] },
      { t: 'Mais profissões e palavras:', words: [['nurse', 'enfermeiro(a)', 'enfermeira'], ['engineer', 'engenheiro(a)', 'engenheiro'], ['dentist', 'dentista', 'dente'], ['police officer', 'policial', 'policial'], ['apron', 'avental', 'avental'], ['nervous', 'nervoso(a)', 'nervoso'], ['in pairs', 'em duplas', 'passaro'], ['presentation', 'apresentação'], ['turn', 'vez']] },
      { t: 'Sonhos (dreams):', words: [['dreams', 'sonhos', 'sonhos'], ['mission', 'missão', 'missao'], ['interview', 'entrevista', 'entrevista'], ['street', 'rua', 'rua'], ['neighborhood', 'bairro', 'bairro'], ['drawer', 'gaveta', 'gaveta'], ['office', 'escritório', 'escritorio'], ['muscle', 'músculo', 'musculo'], ['later', 'mais tarde', 'relogio'], ['other', 'outro(a)']] },
      { t: '**What do you dream about?** = Com o que você sonha?', ex: ['What do you dream about?', 'I have a big dream.'] }
    ] },
    negativa: { title: '🚫 Negativa com wouldn’t', icon: 'x', swap: ['She would like to grow up.', "She wouldn't like to grow up."], cards: [
      { t: '**wouldn’t** = **would not** (não gostaria / não faria). Troque **would** por **wouldn’t**; o resto fica igual.' },
      { t: 'Mais exemplos do livro:', ex: ['Linda would interview her friends.', "Linda wouldn't interview her friends."] }
    ] }
  };

  /* ------------------------------------------------------------ minijogos */
  D.games = {
    assoc_lugares: { title: 'Associação: Places', kind: 'assoc', icon: 'banco', world: 1, set: [['tour guide', 'guia'], ['galaxy', 'galaxia'], ['cart', 'cart'], ['bank', 'banco'], ['post office', 'correio'], ['laundromat', 'lavanderia'], ['comet', 'cometa'], ['museum', 'museu']], write: 3, desc: 'Ligue cada figura à palavra (memória de pares). Depois escreva 3 palavras sem olhar.' },
    assoc_lab: { title: 'Associação: Subjects and professions', kind: 'assoc', icon: 'microscopio', world: 3, set: [['apron', 'avental'], ['nurse', 'enfermeira'], ['engineer', 'engenheiro'], ['dentist', 'dente'], ['police officer', 'policial'], ['biology', 'microscopio'], ['physics', 'atomo'], ['chemistry', 'tubo']], write: 3, desc: 'Ligue cada figura à palavra. Depois escreva 3 sem olhar.' },
    caca: { title: 'Caça-Palavras das Profissões', kind: 'caca', icon: 'lupa', world: 2, words: ['FLIGHTATTENDANT', 'PILOT', 'DOCTOR', 'VETERINARIAN', 'CHEF', 'DRIVER'], desc: 'Ache as 6 profissões do livro na grade (arraste ou toque na 1ª e na última letra).' },
  };

  /* ------------------------------------------------------------ atos */
  D.acts = [
    { n: 1, id: 'a1', title: 'Cidade Cósmica', sub: 'Places • páginas 1 a 3', icon: 'galaxia', color: '#7b5cff', ticket: 'Bilhete da Cidade Cósmica', reward: 'Bilhete da Cidade Cósmica',
      intro: ['Chegamos à **Cidade Cósmica**! Aqui os carrinhos voam e o museu é espacial.', 'Para ganhar o **1º Bilhete-Palavra**, mostre que sabe os lugares e o **would like to**.'],
      steps: [
        { type: 'lesson', id: 'lugares' },
        { type: 'game', id: 'assoc_lugares' },
        block(1, 'MT', 'MATCH — Places', [2, 5]),
        block(1, 'GI', 'GOT IT? — complete', [1, 2, 5, 8]),
        { type: 'lesson', id: 'palavrinhas' },
        block(1, 'LT', "LET'S TALK — responda sobre você", [1, 8]),
        block(2, 'WS', '1. Write sentences with the words below', [1, 4]),
        block(2, 'GW', '2. Guess the words', [1, 4]),
        block(2, 'CB', '3. Complete with the words from the box', [3, 6]),
        block(3, 'DR', '4. Draw — desafio visual', [2, 4]),
        block(3, 'GM', '5. Guess the words', [3, 5]),
        { type: 'ticket' }
      ] },
    { n: 2, id: 'a2', title: 'Aeroporto das Profissões', sub: 'Professions • páginas 4 a 7', icon: 'aviao', color: '#1fa6c9', ticket: 'Distintivo das Profissões', reward: 'Distintivo das Profissões',
      intro: ['Próxima parada: **Aeroporto das Profissões**! Pilotos, chefs e médicos embarcam aqui.', 'Leia a história de **John e Linda** e ganhe o **2º Bilhete-Palavra**.'],
      steps: [
        { type: 'lesson', id: 'texto' },
        block(4, 'BS', 'BUILDING SENTENCES'),
        { type: 'lesson', id: 'profissoes' },
        block(5, 'MT', 'MATCH — Professions', [7, 8]),
        block(5, 'GI', 'GOT IT? — complete', [1, 3, 6, 7]),
        block(5, 'LT', "LET'S TALK — responda sobre você", [3, 6]),
        block(6, 'AQ', '1. Answer the questions', [3]),
        { type: 'game', id: 'caca' },
        block(6, 'SR', '2. Word search — escreva sem olhar', [1, 4]),
        block(6, 'CP', '3. Complete with the words from “Professions”', [2, 5]),
        { type: 'lesson', id: 'pergunta' },
        block(7, 'IN', '4. Change the sentences into interrogative', [1, 2, 6]),
        block(7, 'LC', 'Listening — listen and complete (leitura)', [1, 6, 8]),
        { type: 'ticket' }
      ] },
    { n: 3, id: 'a3', title: 'Laboratório dos Sonhos', sub: 'Subjects and dreams • páginas 8 a 11', icon: 'microscopio', color: '#e0287a', ticket: 'Chave do Laboratório dos Sonhos', reward: 'Chave do Laboratório dos Sonhos',
      intro: ['Última estação: o **Laboratório dos Sonhos**. Tem biology, physics, chemistry… e muitos dreams!', 'Aqui você aprende a **negativa com wouldn’t** e ganha o **3º Bilhete-Palavra**.'],
      steps: [
        { type: 'lesson', id: 'materias' },
        { type: 'game', id: 'assoc_lab' },
        block(8, 'MT', 'MATCH — More professions and subjects', [1, 2]),
        block(8, 'GI', 'GOT IT? — complete', [3, 6, 8]),
        block(8, 'LT', "LET'S TALK — responda sobre você", [3, 5]),
        block(9, 'MW', 'MATCH AND WRITE', [3, 5, 6, 7]),
        block(9, 'GI', 'GOT IT? — complete', [2, 4]),
        block(9, 'LT', "LET'S TALK — responda sobre você", [4]),
        block(10, 'OD', '1. Which word does not go with the others?', [2, 4]),
        block(10, 'CD', '2. Complete with the words from “Dreams”', [2]),
        { type: 'lesson', id: 'negativa' },
        block(10, 'NG', '3. Change the sentences into negative', [1, 3, 5]),
        block(11, 'CW', '4. Complete with the corresponding words', [2, 3]),
        block(11, 'LN', 'Listening — number the sentences (ordenar)'),
        { type: 'ticket' }
      ] }
  ];
  D.story = {
    intro: ['Psiu, **Gabriel**! Sou a **Estela**, a estrela-maquinista do **Expresso dos Sonhos**.', 'Saí do seu caderno de Inglês porque o trem perdeu **3 Bilhetes-Palavra**. Sem eles, não voltamos à estação antes da manhã da prova!', 'São 3 paradas rápidas. Em cada uma, você **escreve** em inglês e ganha um bilhete. Partiu?'],
    final: ['Os 3 Bilhetes-Palavra brilharam juntos: é a **Passagem de Volta**!', 'Última viagem: uma **revisão rápida** com as palavras dos 3 destinos. Vamos?'],
    end: ['Piuííí! O Expresso chegou à estação bem na hora. 🌅', 'Você está pronto para a prova de Inglês, **Gabriel**. **Good luck!**']
  };
  /** Revisão final: 8 a 12 desafios, priorizando os que tiveram erro. */
  D.finalSize = 8;
  /** Questões da campanha (curta) e “exercícios extras” (o resto do livro, opcional). */
  D.core = []; D.acts.forEach((a) => a.steps.forEach((st) => { if (st.type === 'block') D.core.push(...st.q); }));
  D.questions.forEach((q) => { q.core = D.core.includes(q.id); });
  D.stepsOf = (actId) => (D.acts.find((a) => a.id === actId) || {}).steps || [];
})();
