/* =====================================================================
   content/banco.js — BANCO DE QUESTÕES DE INGLÊS (ingles.pdf, 11 páginas).
   Fonte ÚNICA: as páginas do livro (Places, Unit 7 Professions, More
   professions, subjects and dreams). Enunciados em inglês iguais aos do
   livro. As explicações em português só explicam o que já está no PDF.
   Formato de cada questão (ING.data.questions):
     id, page, act, sec (código da seção), section (título original),
     kind: vocab | complete | personal | interrogative | negative | sentence | order
     input: 'fill' (lacunas ___) | 'text' (resposta escrita) | 'order'
     prompt (texto original), pt (instrução curta em português),
     blanks: [[aceitas...]] (fill) | accept: [aceitas] (text) | personal: 'regra'
     tol: tolerância de 1 letra (só vocabulário), img, why (explicação),
     options: alternativas (só aparecem como ajuda depois de erros)
   ===================================================================== */
(function () {
  'use strict';
  const ING = (window.ING = window.ING || {});
  const D = (ING.data = ING.data || {});
  const Q = [];
  /** Acrescenta as questões de uma seção. base = campos comuns da seção. */
  const sec = (base, items) => items.forEach((it, i) => Q.push(Object.assign({ n: i + 1 }, base, it, { id: 'ING-P' + base.page + '-' + base.sec + '-' + (i + 1) })));

  /* ============================================================ PÁGINA 1 — Places */
  // MATCH (figuras numeradas no livro: 1 tour guide, 2 galaxy, 3 cart, 4 bank, 5 post office, 6 laundromat)
  sec({ page: 1, act: 1, sec: 'MT', section: 'MATCH — Places', kind: 'vocab', input: 'text', tol: true, pt: 'Escreva em inglês o lugar ou a palavra da figura.', options: ['tour guide', 'galaxy', 'cart', 'bank', 'post office', 'laundromat'] }, [
    { prompt: 'Places — picture 1', img: ['guia'], accept: ['tour guide'], why: '**Tour guide** é o guia de passeio: a pessoa que leva o grupo e mostra os lugares.' },
    { prompt: 'Places — picture 2', img: ['galaxia'], accept: ['galaxy', 'galaxies'], why: '**Galaxy** é galáxia. No plural: **galaxies**.' },
    { prompt: 'Places — picture 3', img: ['cart'], accept: ['cart', 'carts'], why: '**Cart** é o carrinho (como o carrinho de corrida da figura).' },
    { prompt: 'Places — picture 4', img: ['banco'], accept: ['bank'], why: '**Bank** é banco (onde se guarda dinheiro).' },
    { prompt: 'Places — picture 5', img: ['correio'], accept: ['post office'], why: '**Post office** é o correio, onde enviamos cartas.' },
    { prompt: 'Places — picture 6', img: ['lavanderia', 'bolhas'], accept: ['laundromat'], why: '**Laundromat** é a lavanderia.' }
  ]);
  // LET'S TALK (perguntas pessoais)
  sec({ page: 1, act: 1, sec: 'LT', section: "LET'S TALK — Places", kind: 'personal', input: 'text', pt: 'Responda sobre você, em inglês.' }, [
    { prompt: 'Would you like to go to space?', personal: 'yn-would', why: 'Pergunta com **Would you…?** responde-se **Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Are you really happy today?', personal: 'yn-am', why: 'Pergunta com **Are you…?** responde-se **Yes, I am.** ou **No, I’m not.** **Really** = realmente.' },
    { prompt: 'Where would you like to go when you grow up?', personal: 'want-go', why: 'Responda com **I would like to go to** + lugar. Ex.: I would like to go to the space museum.' },
    { prompt: 'Would you like to go to the post office today?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you like to go to the bank?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you ride a flying cart?', personal: 'yn-would', why: '**Would you ride…?** = Você andaria…? Resposta: **Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you ride a cart under the water?', personal: 'yn-would', why: '**Under the water** = debaixo da água. Resposta: **Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Do you usually go to the museum?', personal: 'yn-do', why: 'Pergunta com **Do you…?** responde-se **Yes, I do.** ou **No, I don’t.** **Usually** = geralmente.' }
  ]);
  // GOT IT?
  const P1GI = ['grow up', 'like', 'super', 'usually', 'really', 'under', 'bank', 'would'];
  sec({ page: 1, act: 1, sec: 'GI', section: 'GOT IT? — Places', kind: 'complete', input: 'fill', pt: 'Complete a frase em inglês.', options: P1GI }, [
    { prompt: 'I would like to go there when I ___.', blanks: [['grow up']], why: '**When I grow up** = quando eu crescer.' },
    { prompt: 'She would ___ to go to the Comet Galaxy Water Park.', blanks: [['like', 'love']], why: '**would like to** = gostaria de. Depois de **would** vem **like**.' },
    { prompt: 'I would love to have ___ powers.', blanks: [['super']], why: '**Super powers** = superpoderes, como os dos super siblings.' },
    { prompt: 'The Simple Family ___ go to the movies and parks.', blanks: [['usually', 'never', 'would', 'like to', 'would like to', 'love to', 'would love to']], why: '**Usually** = geralmente: a família geralmente vai ao cinema e aos parques.' },
    { prompt: 'Adventure Day is ___ fun.', blanks: [['really', 'super']], why: '**Really fun** = muito divertido. **Really** deixa a palavra mais forte.' },
    { prompt: 'The carts go ___ the water.', blanks: [['under']], why: '**Under the water** = debaixo da água.' },
    { prompt: 'They never go to the ___.', blanks: [['bank', 'post office', 'laundromat', 'museum', 'space museum', 'water park', 'bank']], tolW: true, why: '**Never** = nunca. Depois de **the** vem um lugar: **bank**.' },
    { prompt: 'He ___ like to play in the water park.', blanks: [['would']], why: '**He would like to play** = Ele gostaria de brincar.' }
  ]);

  /* ============================================================ PÁGINA 2 */
  const WS = (w, rx) => ({ prompt: w, target: rx || [w], why: 'Escreva uma frase curta com **' + w + '**. Ex.: ' + ({ 'space museum': 'I would like to go to the space museum.', bank: 'They never go to the bank.', 'tour guide': 'The tour guide is nice.', 'post office': 'I want to go to the post office.', galaxy: 'I would like to go to the galaxy.' })[w] });
  sec({ page: 2, act: 1, sec: 'WS', section: '1. WRITE SENTENCES WITH THE WORDS BELOW', kind: 'sentence', input: 'text', pt: 'Escreva uma frase em inglês usando a palavra.' }, [
    WS('space museum'), WS('bank'), WS('tour guide'), WS('post office'), WS('galaxy', ['galaxy', 'galaxies'])
  ]);
  sec({ page: 2, act: 1, sec: 'GW', section: '2. GUESS THE WORDS', kind: 'vocab', input: 'text', pt: 'Desembaralhe as letras e escreva a palavra.', options: ['usually', 'really', 'under', 'never', 'place'] }, [
    { prompt: 'SUUALLY', accept: ['usually'], why: 'SUUALLY → **USUALLY** (geralmente).' },
    { prompt: 'LRELYA', accept: ['really'], why: 'LRELYA → **REALLY** (realmente).' },
    { prompt: 'RUNED', accept: ['under'], why: 'RUNED → **UNDER** (debaixo de).' },
    { prompt: 'EVERN', accept: ['never'], why: 'EVERN → **NEVER** (nunca).' },
    { prompt: 'LAPCE', accept: ['place'], why: 'LAPCE → **PLACE** (lugar). Places = lugares.' }
  ]);
  const BOX2 = ['comet', 'galaxy', 'water park', 'usually', 'really', 'would', 'go', 'under'];
  sec({ page: 2, act: 1, sec: 'CB', section: '3. COMPLETE WITH THE WORDS FROM THE BOX', box: 'COMET / GALAXY / WATER PARK / USUALLY / REALLY / WOULD / GO / UNDER', kind: 'complete', input: 'fill', pt: 'Complete com uma palavra da caixa.', options: BOX2 }, [
    { prompt: 'I would go to the ___.', blanks: [['water park', 'galaxy', 'comet']], why: 'Depois de **go to the** vem um lugar da caixa: **water park** (ou galaxy).' },
    { prompt: 'I want to ___ to the post office.', blanks: [['go']], why: '**Go to** = ir para.' },
    { prompt: 'My book is ___ the table.', blanks: [['under']], why: '**Under the table** = debaixo da mesa.' },
    { prompt: 'She ___ love to play with you.', blanks: [['would']], why: '**She would love to** = Ela adoraria.' },
    { prompt: 'Are you ___ happy today?', blanks: [['really']], why: '**Are you really happy?** = Você está muito feliz?' },
    { prompt: 'I ___ go to the mall with my mom.', blanks: [['usually']], why: '**I usually go** = Eu geralmente vou.' }
  ]);

  /* ============================================================ PÁGINA 3 */
  sec({ page: 3, act: 1, sec: 'DR', section: '4. DRAW (desafio visual: identifique)', kind: 'vocab', input: 'text', tol: true, pt: 'No livro você desenhou. Aqui: escreva o nome do que aparece.', options: ['laundromat', 'flying carts', 'museum', 'comet'] }, [
    { prompt: 'LAUNDROMAT — what is it?', img: ['lavanderia', 'bolhas'], accept: ['laundromat'], why: '**Laundromat** = lavanderia.' },
    { prompt: 'FLYING CARTS — what is it?', img: ['carro_voador'], accept: ['flying carts', 'flying cart'], why: '**Flying carts** = carrinhos voadores.' },
    { prompt: 'MUSEUM — what is it?', img: ['museu'], accept: ['museum', 'space museum'], why: '**Museum** = museu.' },
    { prompt: 'COMET — what is it?', img: ['cometa'], accept: ['comet'], why: '**Comet** = cometa.' }
  ]);
  sec({ page: 3, act: 1, sec: 'GM', section: '5. GUESS THE WORDS', kind: 'vocab', input: 'text', pt: 'Complete as letras que faltam e escreva a palavra inteira.', options: ['tour', 'usually', 'galaxies', 'cart', 'like'] }, [
    { prompt: 'T _ _ R', accept: ['tour'], why: 'T _ _ R → **TOUR** (como em tour guide).' },
    { prompt: '_ S _ A _ _ Y', accept: ['usually'], why: '_S_A__Y → **USUALLY**.' },
    { prompt: '_ _ L _ X _ _ S', accept: ['galaxies'], why: '__L_X__S → **GALAXIES** (plural de galaxy).' },
    { prompt: 'C _ R _', accept: ['cart'], why: 'C_R_ → **CART**.' },
    { prompt: '_ _ _ E', accept: ['like'], why: '___E → **LIKE** (como em would like to).' }
  ]);

  /* ============================================================ PÁGINA 4 — Unit 7 Professions (texto) */
  sec({ page: 4, act: 2, sec: 'BS', section: 'BUILDING SENTENCES', kind: 'personal', input: 'text', pt: 'Monte uma frase: que profissão você gostaria de ter quando crescer?' }, [
    { prompt: 'What would you like to be when you grow up?', personal: 'want-be', why: 'Use **I would like to be a/an** + profissão. Ex.: I would like to be a pilot.' }
  ]);

  /* ============================================================ PÁGINA 5 */
  const P5MT = ['airport', 'doctor', 'taxi driver', 'chef', 'airplane', 'woman', 'flight attendant', 'veterinarian', 'pilot'];
  sec({ page: 5, act: 2, sec: 'MT', section: 'MATCH — Professions', kind: 'vocab', input: 'text', tol: true, pt: 'Escreva em inglês a profissão ou a palavra da figura.', options: P5MT }, [
    { prompt: 'Professions — picture 1', img: ['aeroporto'], accept: ['airport'], why: '**Airport** = aeroporto.' },
    { prompt: 'Professions — picture 2', img: ['profissional_saude', 'estetoscopio'], accept: ['doctor'], why: '**Doctor** = médico(a).' },
    { prompt: 'Professions — picture 3', img: ['taxi'], accept: ['taxi driver', 'driver'], why: '**Taxi driver** = motorista de táxi.' },
    { prompt: 'Professions — picture 4', img: ['cozinheiro'], accept: ['chef'], why: '**Chef** = chefe de cozinha (com o chapéu branco grande).' },
    { prompt: 'Professions — picture 5', img: ['aviao'], accept: ['airplane', 'plane'], why: '**Airplane** = avião. **By plane** = de avião.' },
    { prompt: 'Professions — picture 6', img: ['mulher'], accept: ['woman'], why: '**Woman** = mulher.' },
    { prompt: 'Professions — picture 7', img: ['mulher', 'aviao'], accept: ['flight attendant'], why: '**Flight attendant** = comissário(a) de bordo: ajuda as pessoas no avião.' },
    { prompt: 'Professions — picture 8', img: ['profissional_saude', 'cachorro'], accept: ['veterinarian'], why: '**Veterinarian** = veterinário(a), médico dos animais.' },
    { prompt: 'Professions — picture 9', img: ['piloto'], accept: ['pilot'], why: '**Pilot** = piloto: pilota o avião.' }
  ]);
  const P5GI = ['airplane', 'pilot', 'flight attendant', 'be', 'taxi driver', 'meet', 'to be'];
  sec({ page: 5, act: 2, sec: 'GI', section: 'GOT IT? — Professions', kind: 'complete', input: 'fill', pt: 'Complete a frase em inglês.', options: P5GI }, [
    { prompt: 'We are going to fly by ___.', blanks: [['airplane', 'plane']], why: '**Fly by airplane / by plane** = voar de avião.' },
    { prompt: 'John wants to be a ___.', blanks: [['pilot']], why: 'No texto: **John would like to be a pilot.**' },
    { prompt: "I'm the ___. I help people on airplanes.", blanks: [['flight attendant']], why: 'Quem ajuda as pessoas no avião é o(a) **flight attendant**.' },
    { prompt: 'When I grow up I want to ___ a chef.', blanks: [['be']], why: '**I want to be** = eu quero ser.' },
    { prompt: 'Carlos is the ___.', blanks: [['taxi driver', 'driver', 'pilot', 'chef', 'doctor', 'veterinarian', 'flight attendant']], why: 'Carlos tem uma profissão: **taxi driver** (motorista de táxi), como no livro.' },
    { prompt: 'They are going to ___ grandma.', blanks: [['meet']], why: '**Meet** = encontrar. They are going to meet their grandma.' },
    { prompt: 'What would you like ___?', blanks: [['to be']], why: '**What would you like to be?** = O que você gostaria de ser?' },
    { prompt: 'He looks like a ___.', blanks: [['pilot', 'doctor', 'chef', 'driver', 'taxi driver', 'veterinarian', 'flight attendant']], why: '**He looks like a pilot** = Ele parece um piloto.' }
  ]);
  sec({ page: 5, act: 2, sec: 'LT', section: "LET'S TALK — Professions", kind: 'personal', input: 'text', pt: 'Responda sobre você, em inglês.' }, [
    { prompt: 'Would you like to be a pilot?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'What would you like to be?', personal: 'want-be', why: '**I would like to be a/an** + profissão.' },
    { prompt: 'What does your mom do?', personal: 'job-she', why: 'Responda **She is a/an** + profissão. Ex.: She is a doctor.' },
    { prompt: 'What does your dad do?', personal: 'job-he', why: 'Responda **He is a/an** + profissão. Ex.: He is a taxi driver.' },
    { prompt: 'Would they like to fly by airplane?', personal: 'yn-would-they', why: 'Pergunta sobre **they**: **Yes, they would.** ou **No, they wouldn’t.**' },
    { prompt: 'Do you prefer airplanes or spaceships?', personal: 'prefer-air', why: '**Or** = ou. Responda **I prefer airplanes.** ou **I prefer spaceships.**' }
  ]);

  /* ============================================================ PÁGINA 6 */
  sec({ page: 6, act: 2, sec: 'AQ', section: '1. ANSWER THE QUESTIONS', kind: 'personal', input: 'text', pt: 'Responda em inglês.' }, [
    { prompt: 'What would you like to be when you grow up?', personal: 'want-be', why: '**I would like to be a/an** + profissão.' },
    { prompt: 'Would you like to fly on a spaceship?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Do you like to travel by airplane?', personal: 'yn-do', why: '**Do you…?** → **Yes, I do.** ou **No, I don’t.**' },
    { prompt: 'Would you like to go to the airport today?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you like to be a pilot?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' }
  ]);
  sec({ page: 6, act: 2, sec: 'SR', section: '2. WORD SEARCH', box: 'FLIGHT ATTENDANT / PILOT / DOCTOR / VETERINARIAN / CHEF / DRIVER', kind: 'vocab', input: 'text', tol: true, pt: 'Você achou esta profissão no caça-palavras. Escreva-a sem olhar.', options: ['flight attendant', 'pilot', 'doctor', 'veterinarian', 'chef', 'driver'] }, [
    { prompt: 'Word search — profession 1', img: ['mulher', 'aviao'], accept: ['flight attendant'], why: '**Flight attendant**.' },
    { prompt: 'Word search — profession 2', img: ['piloto'], accept: ['pilot'], why: '**Pilot**.' },
    { prompt: 'Word search — profession 3', img: ['profissional_saude', 'estetoscopio'], accept: ['doctor'], why: '**Doctor**.' },
    { prompt: 'Word search — profession 4', img: ['profissional_saude', 'cachorro'], accept: ['veterinarian'], why: '**Veterinarian**.' },
    { prompt: 'Word search — profession 5', img: ['cozinheiro'], accept: ['chef'], why: '**Chef**.' },
    { prompt: 'Word search — profession 6', img: ['taxi'], accept: ['driver', 'taxi driver'], why: '**Driver** = motorista.' }
  ]);
  const P6CP = ['doctor', 'would you like', 'driver', 'meet', 'to be', 'would'];
  sec({ page: 6, act: 2, sec: 'CP', section: '3. COMPLETE WITH THE WORDS FROM “PROFESSIONS”', kind: 'complete', input: 'fill', pt: 'Complete com palavras da unidade Professions.', options: P6CP }, [
    { prompt: 'She is a nice ___.', blanks: [['doctor', 'pilot', 'chef', 'driver', 'taxi driver', 'veterinarian', 'flight attendant', 'woman']], why: 'Depois de **a nice** vem uma profissão: **doctor**.' },
    { prompt: '___ to fly?', blanks: [['would you like', 'would you love']], why: '**Would you like to fly?** = Você gostaria de voar? A pergunta começa com **Would**.' },
    { prompt: 'He is a good ___.', blanks: [['driver', 'taxi driver', 'pilot', 'chef', 'doctor', 'veterinarian', 'flight attendant']], why: 'Depois de **a good** vem uma profissão: **driver**.' },
    { prompt: 'It is nice to ___ you.', blanks: [['meet']], why: '**Nice to meet you** = prazer em conhecer você.' },
    { prompt: 'I want ___ a veterinarian.', blanks: [['to be']], why: '**I want to be** = eu quero ser. Falta o **to** antes de **be**.' },
    { prompt: 'What ___ you like to be?', blanks: [['would']], why: '**What would you like to be?**' }
  ]);

  /* ============================================================ PÁGINA 7 */
  const IN = (a, b) => ({ prompt: a, accept: [b], why: '**Would** vai para o começo e o resto continua na mesma ordem: **' + b + '**' });
  sec({ page: 7, act: 2, sec: 'IN', section: '4. CHANGE THE SENTENCES INTO INTERROGATIVE', kind: 'interrogative', input: 'text', pt: 'Transforme em pergunta: Would vai para o começo.' }, [
    IN('She would like to go to the water park.', 'Would she like to go to the water park?'),
    IN('John would like to be a pilot.', 'Would John like to be a pilot?'),
    IN('She would like to be a veterinarian.', 'Would she like to be a veterinarian?'),
    IN('He would like to be a driver.', 'Would he like to be a driver?'),
    IN('Linda would like to be a flight attendant.', 'Would Linda like to be a flight attendant?'),
    IN('They would like to go by plane.', 'Would they like to go by plane?')
  ]);
  const PROF = ['doctor', 'pilot', 'chef', 'driver', 'taxi driver', 'veterinarian', 'flight attendant', 'nurse'];
  sec({ page: 7, act: 2, sec: 'LC', section: 'LISTENING — LISTEN AND COMPLETE (sem o áudio do livro: leitura e escrita)', kind: 'complete', input: 'fill', pt: 'O áudio do livro não está no jogo. Leia e complete.', options: ['would love', 'grow up', 'doctor', 'airplane', 'chef', 'would you like', 'would like', 'to be a pilot'] }, [
    { prompt: 'I ___ to go to Orlando.', blanks: [['would love', 'would like']], why: '**I would love to go** = Eu adoraria ir.' },
    { prompt: 'When I ___ I want to be a nurse.', blanks: [['grow up']], why: '**When I grow up** = quando eu crescer.' },
    { prompt: 'He looks like a ___.', blanks: [PROF], why: 'Depois de **looks like a** vem uma profissão, como **doctor**.' },
    { prompt: 'I would like to go by ___.', blanks: [['airplane', 'plane']], why: '**By airplane / by plane** = de avião.' },
    { prompt: '___ is the ___?', blanks: [['who', 'where'], PROF], why: 'Pergunta sobre uma pessoa: **Who is the chef?** (Quem é o chef?)' },
    { prompt: '___ to be a flight attendant?', blanks: [['would you like', 'would you love']], why: '**Would you like to be…?** = Você gostaria de ser…?' },
    { prompt: 'Linda ___ to be a veterinarian.', blanks: [['would like', 'would love']], why: 'No texto: **Linda would love to be a flight attendant and a veterinarian.**' },
    { prompt: 'I would like ___.', blanks: [['to be a pilot', 'to be a doctor', 'to be a chef', 'to be a driver', 'to be a taxi driver', 'to be a veterinarian', 'to be a flight attendant', 'to be a nurse', 'to fly']], why: 'Depois de **would like** vem **to** + ação: **to be a pilot**.' }
  ]);

  /* ============================================================ PÁGINA 8 — More professions and subjects */
  const P8 = ['nervous', 'in pairs', 'apron', 'nurse', 'engineer', 'dentist', 'police officer', 'biology', 'physics', 'chemistry'];
  sec({ page: 8, act: 3, sec: 'MT', section: 'MATCH — More professions and subjects', kind: 'vocab', input: 'text', tol: true, pt: 'Escreva em inglês a palavra da figura.', options: P8 }, [
    { prompt: 'Picture 1', img: ['nervoso'], accept: ['nervous'], why: '**Nervous** = nervoso(a).' },
    { prompt: 'Picture 2', img: ['passaro', 'coracoes', 'passaro'], accept: ['in pairs'], why: '**In pairs** = em duplas (como os dois passarinhos).' },
    { prompt: 'Picture 3', img: ['avental'], accept: ['apron'], why: '**Apron** = avental.' },
    { prompt: 'Picture 4', img: ['enfermeira', 'curativo'], accept: ['nurse'], why: '**Nurse** = enfermeiro(a).' },
    { prompt: 'Picture 5', img: ['engenheiro'], accept: ['engineer'], why: '**Engineer** = engenheiro(a).' },
    { prompt: 'Picture 6', img: ['dente'], accept: ['dentist'], why: '**Dentist** = dentista.' },
    { prompt: 'Picture 7', img: ['policial'], accept: ['police officer'], why: '**Police officer** = policial.' },
    { prompt: 'Picture 8', img: ['microscopio'], accept: ['biology'], why: '**Biology** = biologia (o microscópio).' },
    { prompt: 'Picture 9', img: ['atomo'], accept: ['physics'], why: '**Physics** = física (o átomo).' },
    { prompt: 'Picture 10', img: ['tubo', 'alambique'], accept: ['chemistry'], why: '**Chemistry** = química (os tubos do laboratório).' }
  ]);
  const P8GI = ['apron', 'grow up', 'would', 'in pairs', 'biology', 'do', 'subjects'];
  sec({ page: 8, act: 3, sec: 'GI', section: 'GOT IT? — More professions and subjects', kind: 'complete', input: 'fill', pt: 'Complete a frase em inglês.', options: P8GI }, [
    { prompt: 'Linda has an ___ with nice pictures.', blanks: [['apron']], why: '**An apron** = um avental.' },
    { prompt: 'When I ___, I want to study biology.', blanks: [['grow up']], why: '**When I grow up** = quando eu crescer.' },
    { prompt: '___ she like to study physics?', blanks: [['would']], why: 'Pergunta: **Would she like to study physics?**' },
    { prompt: "We wouldn't work ___.", blanks: [['in pairs']], why: '**In pairs** = em duplas.' },
    { prompt: 'They would study ___.', blanks: [['biology', 'physics', 'chemistry', 'math', 'portuguese']], why: 'Depois de **study** vem uma matéria: **biology**, **physics** ou **chemistry**.' },
    { prompt: '___ they have a presentation?', blanks: [['do']], why: 'Pergunta com **have**: **Do they have a presentation?**' },
    { prompt: '___ you like to go to school with me?', blanks: [['would']], why: '**Would you like to…?** = Você gostaria de…?' },
    { prompt: 'There are many good ___ to study.', blanks: [['subjects']], why: '**Subjects** = matérias da escola (biology, physics, chemistry).' }
  ]);
  sec({ page: 8, act: 3, sec: 'LT', section: "LET'S TALK — Subjects", kind: 'personal', input: 'text', pt: 'Responda sobre você, em inglês.' }, [
    { prompt: 'Are you studying for a test?', personal: 'yn-am', why: '**Are you…?** → **Yes, I am.** ou **No, I’m not.**' },
    { prompt: 'Is your dad working today?', personal: 'yn-is-he', why: '**Is your dad…?** → **Yes, he is.** ou **No, he isn’t.**' },
    { prompt: 'What would you love to study?', personal: 'want-study', why: '**I would love to study** + matéria. Ex.: I would love to study biology.' },
    { prompt: 'Do you have a test today?', personal: 'yn-do', why: '**Do you…?** → **Yes, I do.** ou **No, I don’t.**' },
    { prompt: 'Would you like to study biology?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you like to be an engineer?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Would you like to study chemistry?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'Do you prefer math or Portuguese?', personal: 'prefer-subject', why: '**I prefer math.** ou **I prefer Portuguese.**' }
  ]);

  /* ============================================================ PÁGINA 9 — Dreams */
  const MW = ['street', 'mission', 'interview', 'dreams', 'neighborhood', 'drawer', 'office', 'later', 'muscle', 'other'];
  sec({ page: 9, act: 3, sec: 'MW', section: 'MATCH AND WRITE', box: 'Street / Mission / Interview / Dreams / Neighborhood / Drawer / Office / Later / Muscle / Other', kind: 'vocab', input: 'text', tol: true, pt: 'Escreva a palavra da caixa que combina.', options: MW }, [
    { prompt: 'Picture: office', img: ['escritorio'], accept: ['office'], why: '**Office** = escritório.' },
    { prompt: 'Picture: muscle', img: ['musculo'], accept: ['muscle', 'muscles'], why: '**Muscle** = músculo.' },
    { prompt: 'Picture: drawer', img: ['gaveta'], accept: ['drawer', 'drawers'], why: '**Drawer** = gaveta.' },
    { prompt: 'Picture: street', img: ['rua'], accept: ['street'], why: '**Street** = rua.' },
    { prompt: 'Picture: neighborhood', img: ['bairro'], accept: ['neighborhood'], why: '**Neighborhood** = bairro, vizinhança.' },
    { prompt: 'Mission', img: ['missao'], ptWord: 'missão', accept: ['mission'], why: '**Mission** = missão.' },
    { prompt: 'Interview', img: ['entrevista'], ptWord: 'entrevista', accept: ['interview'], why: '**Interview** = entrevista.' },
    { prompt: 'Dreams', img: ['sonhos'], ptWord: 'sonhos', accept: ['dreams'], why: '**Dreams** = sonhos.' },
    { prompt: 'Other', ptWord: 'outro / outra', accept: ['other'], why: '**Other** = outro(a).' },
    { prompt: 'Later', img: ['relogio'], ptWord: 'mais tarde', accept: ['later'], why: '**Later** = mais tarde.' }
  ]);
  const P9GI = ['interview', 'dream', 'grow up', 'muscles', 'mission', 'baseball', 'office'];
  sec({ page: 9, act: 3, sec: 'GI', section: 'GOT IT? — Dreams', kind: 'complete', input: 'fill', pt: 'Complete a frase em inglês.', options: P9GI }, [
    { prompt: 'We are going to ___ with Simple Mom.', blanks: [['interview']], why: '**Interview** = entrevistar.' },
    { prompt: 'I have a big ___.', blanks: [['dream']], why: '**A big dream** = um grande sonho (uma coisa só: dream, sem s).' },
    { prompt: 'What would you like to be when you ___?', blanks: [['grow up']], why: '**When you grow up** = quando você crescer.' },
    { prompt: 'What do you ___ about?', blanks: [['dream']], why: '**What do you dream about?** = Com o que você sonha?' },
    { prompt: "I'm strong. I have ___.", blanks: [['muscles', 'big muscles']], why: '**Muscles** = músculos.' },
    { prompt: 'Simple Mom has a ___ for the super siblings.', blanks: [['mission']], why: '**Mission** = missão.' },
    { prompt: "He's a nice ___ player.", blanks: [['baseball']], why: '**Baseball player** = jogador de beisebol.' },
    { prompt: 'Dad needs to work at the ___ today.', blanks: [['office']], why: '**Office** = escritório.' }
  ]);
  sec({ page: 9, act: 3, sec: 'LT', section: "LET'S TALK — Dreams", kind: 'personal', input: 'text', pt: 'Responda sobre você, em inglês.' }, [
    { prompt: 'What is your big dream?', personal: 'dream', why: '**My big dream is to be a/an…** ou **I would like to…**' },
    { prompt: 'Do you have big muscles?', personal: 'yn-do', why: '**Yes, I do.** ou **No, I don’t.**' },
    { prompt: 'Is your brother a baseball player?', personal: 'yn-is-he', why: '**Yes, he is.** / **No, he isn’t.** (Se não tiver irmão: **I don’t have a brother.**)' },
    { prompt: 'What do you dream about?', personal: 'dream-about', why: '**I dream about** + assunto. Ex.: I dream about superheroes.' },
    { prompt: 'Do you like your neighborhood?', personal: 'yn-do', why: '**Yes, I do.** ou **No, I don’t.**' },
    { prompt: 'Do you need to interview your friends?', personal: 'yn-do', why: '**Yes, I do.** ou **No, I don’t.**' },
    { prompt: 'Would you like to grow up fast?', personal: 'yn-would', why: '**Yes, I would.** ou **No, I wouldn’t.**' },
    { prompt: 'What is in your drawer?', personal: 'drawer', why: 'Diga o que tem: **A pencil and paper.** ou **My pencil.**' }
  ]);

  /* ============================================================ PÁGINA 10 */
  sec({ page: 10, act: 3, sec: 'OD', section: '1. CAN YOU SAY WHICH WORD DOES NOT GO WITH THE OTHERS? CIRCLE IT', kind: 'vocab', input: 'text', pt: 'Escreva a palavra que NÃO combina com as outras.' }, [
    { prompt: 'nurse - engineer - doctor - drawer', accept: ['drawer', 'drawers'], options: ['nurse', 'engineer', 'doctor', 'drawer'], why: 'Nurse, engineer e doctor são profissões. **Drawer** (gaveta) não é.' },
    { prompt: 'interview - biology - physics - chemistry', accept: ['interview'], options: ['interview', 'biology', 'physics', 'chemistry'], why: 'Biology, physics e chemistry são matérias. **Interview** (entrevista) não é.' },
    { prompt: 'dentist - muscles - police officer - engineer', accept: ['muscles', 'muscle'], options: ['dentist', 'muscles', 'police officer', 'engineer'], why: 'Os outros são profissões. **Muscles** (músculos) não é.' },
    { prompt: 'airport - office - mission - laundromat', accept: ['mission'], options: ['airport', 'office', 'mission', 'laundromat'], why: 'Airport, office e laundromat são lugares. **Mission** (missão) não é.' }
  ]);
  sec({ page: 10, act: 3, sec: 'CD', section: '2. COMPLETE WITH THE WORDS FROM “DREAMS”', kind: 'complete', input: 'fill', pt: 'Complete com palavras da unidade Dreams.', options: ['dream', 'what', 'mission', 'drawer', 'muscles'] }, [
    { prompt: 'I have a big ___.', blanks: [['dream']], why: '**A big dream** = um grande sonho.' },
    { prompt: '___ do you dream about?', blanks: [['what']], why: '**What do you dream about?** = Com o que você sonha?' },
    { prompt: 'Simple Mom has a special ___.', blanks: [['mission']], why: '**A special mission** = uma missão especial.' },
    { prompt: 'We need a pencil and a ___.', blanks: [['drawer', 'paper']], why: 'Na unidade Dreams: **drawer** (gaveta).' },
    { prompt: 'I would love to have big ___.', blanks: [['muscles']], why: '**Big muscles** = músculos grandes.' }
  ]);
  const NG = (a, b) => ({ prompt: a, accept: [b], why: 'Troque **would** por **wouldn’t** (= would not): **' + b + '**' });
  sec({ page: 10, act: 3, sec: 'NG', section: '3. CHANGE THE SENTENCES INTO NEGATIVE', kind: 'negative', input: 'text', pt: 'Transforme em negativa: would → wouldn’t.' }, [
    NG('She would like to grow up.', "She wouldn't like to grow up."),
    NG('They would like to have dreams.', "They wouldn't like to have dreams."),
    NG('John and Linda would help mom.', "John and Linda wouldn't help mom."),
    NG('She would work with her brother.', "She wouldn't work with her brother."),
    NG('Linda would interview her friends.', "Linda wouldn't interview her friends.")
  ]);

  /* ============================================================ PÁGINA 11 */
  sec({ page: 11, act: 3, sec: 'CW', section: '4. COMPLETE WITH THE CORRESPONDING WORDS', box: '● HAVE / WORK / WOULD / PLAY   # PAPER / TV / PENCIL   ~ SUPERHEROES / BASEBALL PLAYER', kind: 'complete', input: 'fill', pt: 'Complete com a palavra do grupo do símbolo (●, # ou ~).', options: ['have', 'work', 'would', 'play', 'paper', 'tv', 'pencil', 'superheroes', 'baseball player'] }, [
    { prompt: 'Linda is helping super mommy with her ● ___.', blanks: [['work']], why: 'Grupo ●: **work** (trabalho).' },
    { prompt: 'John has 2 big dreams. He would like to have a big # ___ and to be a ~ ___.', blanks: [['tv'], ['baseball player']], why: 'Grupo #: **TV**. Grupo ~: **baseball player**.' },
    { prompt: 'She is writing on the # ___ with a # ___.', blanks: [['paper'], ['pencil']], why: 'Escreve-se no **paper** (papel) com um **pencil** (lápis).' },
    { prompt: 'He loves to watch the ~ ___. He says they ● ___ big muscles to protect people.', blanks: [['superheroes'], ['have']], why: '**Superheroes** = super-heróis. **They have big muscles** = eles têm músculos grandes.' },
    { prompt: 'Simple Mom ● ___ love to ● ___ with her kids.', blanks: [['would'], ['play']], why: '**Would love to play** = adoraria brincar.' }
  ]);
  // LISTENING — NUMBER THE SENTENCES (ordem conferida nos números do livro)
  Q.push({ id: 'ING-P11-LN-1', n: 1, page: 11, act: 3, sec: 'LN', section: 'LISTENING — NUMBER THE SENTENCES (sem o áudio do livro: ordenar o texto)', kind: 'order', input: 'order', pt: 'Coloque as frases na ordem do texto (como no livro).',
    prompt: 'Number the sentences.',
    items: ['We have many dreams.', 'My sister would like to be a doctor.', 'And he would like to watch all the good baseball games on the baseball field.', 'I have a big dream.', 'I would like to have super English too.', 'My friend would like to be a baseball player.', 'I would like to have big superhero muscles when I grow up.', 'Because she likes to help people.'],
    order: ['I have a big dream.', 'I would like to have big superhero muscles when I grow up.', 'I would like to have super English too.', 'My friend would like to be a baseball player.', 'And he would like to watch all the good baseball games on the baseball field.', 'My sister would like to be a doctor.', 'Because she likes to help people.', 'We have many dreams.'],
    why: 'A ordem conta uma história: **eu** (dream, muscles, English) → **my friend** (baseball) → **my sister** (doctor, because she likes to help people) → **We have many dreams.**' });

  Q.forEach((q) => {
    q.answer = q.input === 'fill' ? q.blanks.map((b) => b[0]).join(' / ') : q.input === 'order' ? q.order.join(' → ') : q.accept ? q.accept[0] : (ING.personalModel ? '' : '');
  });
  D.questions = Q;
  D.byId = (id) => Q.find((q) => q.id === id);
  D.KINDS = { vocab: 'Vocabulário', complete: 'Completar frase', personal: 'Resposta pessoal', interrogative: 'Interrogativa', negative: 'Negativa', sentence: 'Escrever frase', order: 'Ordenar texto' };
})();
