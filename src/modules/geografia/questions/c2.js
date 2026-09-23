/* =====================================================================
   questions/c2.js — CAPÍTULO 2: CULTURAS QUE SE ENCONTRAM
   17 questões rastreáveis (GEO-C2-Q01 … GEO-C2-Q17). Conteúdo
   exclusivamente das seções 8.6, 8.7 e 8.8 do material fornecido.
   ===================================================================== */
(function () {
  'use strict';
  const ok = (t, fb, extra) => Object.assign({ t, ok: true, fb }, extra || {});
  const no = (t, fb, extra) => Object.assign({ t, ok: false, fb }, extra || {});
  const Q = (GEO.data.questions = GEO.data.questions || []);
  const ORIG = [{ id: 'port', t: 'Portuguesa', icon: '⛵' }, { id: 'afr', t: 'Africana', icon: '🥁' }, { id: 'ind', t: 'Indígena', icon: '🪶' }];

  Q.push(
    /* ------------------------------------------------ Fase 2-1 Labirinto das Culturas */
    {
      id: 'GEO-C2-Q10', chapter: 2, stage: 'c2s1', concept: 'Diversidade cultural brasileira', book: true,
      title: 'Festa brasileira fora do país',
      prompt: 'Se você organizasse uma festa brasileira em outro país, que elementos culturais escolheria para mostrar as diferentes culturas do Brasil?',
      pre: ['**Miscigenação** é a convivência, influência e geração de descendentes entre pessoas de **origens diversas**.', 'A influência **alemã** se destaca no **Sul**, a **africana** no **Nordeste** e a **indígena** no **Norte**. Sotaques, comidas e costumes variam.', 'Brasileiros no exterior **preservam costumes**: o livro cita o **Brazilian Day** em Nova York e no Japão.'],
      visual: 'simbolos', visualLabel: 'Ver os símbolos coletados',
      type: 'personal',
      spec: {
        min: 3, minDistinct: 2, distinctMsg: 'Escolha elementos de pelo menos 2 origens diferentes para mostrar a diversidade.',
        choices: ['Rede para descansar (indígena)', 'Balangandãs (africana)', 'Três refeições: café, almoço e jantar (portuguesa)', 'Festa do Divino (portuguesa)', 'Samba de roda (africana)', 'Toré (indígena)', 'Tapioca e farofa (indígena)', 'Vatapá e acarajé (africana)', 'Buchada e sarapatel (portuguesa)', 'Fantasias que imitam povos para fazer piada'],
        choiceTags: ['ind', 'afr', 'port', 'port', 'afr', 'ind', 'ind', 'afr', 'port', 'x'],
        avoid: ['Fantasias que imitam povos para fazer piada'], avoidMsg: { 'Fantasias que imitam povos para fazer piada': 'Isso não é respeitoso: culturas não são fantasia de brincadeira.' },
        text: true, placeholder: 'Se quiser, conte como seria sua festa.', note: 'Escolha pelo menos 3 elementos, de origens diferentes. Não existe uma única resposta.'
      },
      answer: 'Combinação respeitosa de comidas, músicas, danças, artesanato, festas e costumes de origens diferentes mostrados no livro.',
      ok: 'Que festa! Ela mostra a diversidade com elementos de origens diferentes.',
      why: 'Uma boa escolha **combina** elementos de **origens diferentes** — indígena, africana e portuguesa — com **respeito**, mostrando a riqueza da diversidade brasileira.',
      recap: 'A festa deve mostrar várias culturas, não só uma.', hint1: 'Misture uma comida, uma dança e um costume de povos diferentes.', hint2: 'Exemplo: toré (indígena), samba de roda (africana) e Festa do Divino (portuguesa).',
      guided: { type: 'fill', prompt: 'Complete sua festa:', text: 'Na minha festa eu mostraria a {0} (indígena), o samba de {1} (africana) e a Festa do {2} (portuguesa).', answers: ['rede', 'roda', 'Divino'], bank: ['bala', 'Natal'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'Qual combinação mostra MAIS diversidade cultural?', options: [ok('Toré, samba de roda e Festa do Divino'), no('Apenas uma dança de um único povo', 'Uma só manifestação mostra pouca diversidade.'), no('Fantasias engraçadas de outros povos', 'Isso não é respeitoso.')] },
      review: { type: 'mc', prompt: 'Para mostrar a diversidade do Brasil numa festa, o melhor é…', options: [ok('combinar elementos de origens indígena, africana e portuguesa'), no('mostrar só uma comida', 'Mostra pouca diversidade.'), no('imitar povos para fazer piada', 'Isso é desrespeito.')] },
      where: 'Fase 2-1 • Altar das Origens (2º conjunto)', effect: 'Bandeirolas de todas as origens enfeitam o labirinto.'
    },
    {
      id: 'GEO-C2-Q11', chapter: 2, stage: 'c2s1', concept: 'Cultura brasileira no exterior', book: true,
      title: 'Cultura brasileira em outros países',
      prompt: 'É importante que a cultura brasileira chegue a outros países? Por quê?',
      pre: ['Brasileiros que vivem fora **preservam costumes**. O livro cita o **Brazilian Day**, em **Nova York** e no **Japão**.'],
      type: 'open',
      spec: {
        placeholder: 'Ex.: Sim, porque…', min: 1,
        groups: [
          { label: 'Divulga a diversidade do Brasil', kw: ['divulg', 'mostrar', 'mostra', 'diversidade', 'espalh'] },
          { label: 'Preserva a identidade e os costumes', kw: ['preserv', 'costume', 'identidade', 'tradic', 'nao esquec', 'lembrar'] },
          { label: 'Aproxima os brasileiros que vivem fora', kw: ['aproxim', 'junt', 'uniao', 'saudade', 'brasileiros que', 'moram fora', 'vivem fora'] },
          { label: 'Permite que outros conheçam o país', kw: ['conhec', 'outros paises', 'outras pessoas', 'estrangeir', 'mundo', 'aprender'] }
        ],
        distractors: ['Não, porque cada cultura deve ficar escondida', 'Não importa, cultura não serve para nada']
      },
      answer: 'Sim: divulga a diversidade, preserva identidade e costumes, aproxima brasileiros e permite que outros conheçam o país.',
      ok: 'Boa reflexão!',
      why: 'Levar a cultura para fora ajuda a **divulgar a diversidade**, **preservar identidade e costumes**, **aproximar brasileiros** que vivem longe e deixar que **outros conheçam** o Brasil.',
      recap: 'Pense nos brasileiros que moram longe: o que o Brazilian Day faz por eles?', hint1: 'Pense em saudade, costumes e em mostrar o Brasil a outras pessoas.', hint2: 'Complete: “Sim, porque ajuda a preservar os costumes e…”.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Sim, porque ajuda a {0} a diversidade, a {1} os costumes, a {2} os brasileiros e permite que outros {3} o Brasil.', answers: ['divulgar', 'preservar', 'aproximar', 'conheçam'], bank: ['esconder', 'apagar'] },
      confirm: { type: 'mc', prompt: 'Por que o Brazilian Day é importante para brasileiros no exterior?', options: [ok('Ajuda a preservar costumes e aproximar os brasileiros'), no('Serve para esquecer o Brasil', 'É o contrário: ajuda a lembrar e preservar.'), no('Mostra que só existe uma cultura', 'Mostra a diversidade.')] },
      review: { type: 'mc', prompt: 'O livro cita o Brazilian Day em quais lugares?', options: [ok('Nova York e Japão'), no('Salvador e Recife', 'O livro cita Nova York e Japão.'), no('Somente em Brasília', 'O livro cita Nova York e Japão.')] },
      where: 'Fase 2-1 • Altar das Origens (3º conjunto)', effect: 'Um balão do Brazilian Day sobe no labirinto.'
    },

    /* ------------------------------------------------ Fase 2-2 Cordel em Movimento */
    {
      id: 'GEO-C2-Q01', chapter: 2, stage: 'c2s2', concept: 'Características do cordel', book: true,
      title: 'Características do cordel',
      prompt: 'Quais diferenças existem entre o cordel e outros textos?',
      pre: ['O **cordel** faz parte da cultura **nordestina**. O nome vem dos **folhetos expostos em cordas** nas feiras.', 'Ele registra **histórias populares em versos**, com **rima** e **linguagem simples**, e pode retratar **mitos e folclore**.'],
      visual: 'cordel', visualLabel: 'Ver o varal de cordel',
      type: 'multi',
      spec: { min: 3, options: [ok('É um folheto que era exposto em cordas nas feiras'), ok('É escrito em versos'), ok('Tem rimas'), ok('Usa linguagem simples'), ok('Registra histórias populares, mitos e folclore'), ok('A capa pode ter xilogravura'), no('É sempre um livro grosso, sem rimas', 'O cordel é um folheto, em versos com rima.'), no('Só traz notícias de outros países', 'O cordel registra histórias populares e folclore.')] },
      answer: 'Folheto ligado às feiras/cordas, versos, rimas, linguagem simples e registro de histórias populares/folclore.',
      ok: 'Mandou bem, cordelista!',
      why: 'O cordel é um **folheto** exposto em **cordas nas feiras**, escrito em **versos**, com **rimas** e **linguagem simples**, registrando **histórias populares**, **mitos e folclore**. A capa pode ter **xilogravura**.',
      recap: 'Lembre de onde vem o nome “cordel” e como ele é escrito.', hint1: 'Olhe o varal: onde ficam os folhetos?', hint2: 'Folheto em cordas, versos, rimas, linguagem simples.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O cordel é um {0} exposto em {1} nas feiras, escrito em {2} com {3} e linguagem simples.', answers: ['folheto', 'cordas', 'versos', 'rimas'], bank: ['e-mail', 'prosa longa'] },
      confirm: { type: 'mc', prompt: 'Por que o cordel tem esse nome?', options: [ok('Porque os folhetos eram expostos em cordas nas feiras'), no('Porque fala de cordas de violão', 'O nome vem das cordas onde os folhetos ficavam.'), no('Porque é escrito com cordas', 'O nome vem das cordas onde os folhetos ficavam.')] },
      review: { type: 'multi', prompt: 'Marque características do cordel.', min: 2, options: [ok('Versos com rima'), ok('Linguagem simples'), no('Texto sem rima e difícil', 'O cordel tem rima e linguagem simples.')] },
      where: 'Fase 2-2 • Feira do Cordel (1º folheto)', effect: 'Os folhetos do varal balançam e mostram suas capas.'
    },
    {
      id: 'GEO-C2-Q02', chapter: 2, stage: 'c2s2', concept: 'Caipora, protetor da fauna', book: true,
      title: 'Caipora protetor da fauna',
      prompt: 'O que significa dizer que o Caipora é protetor da fauna?',
      pre: ['No cordel apresentado, o **Caipora** é **guardião da fauna**. Leia os versos da Gaia no folheto.'],
      visual: 'versosCaipora', visualLabel: 'Ler o folheto do Caipora',
      type: 'mc',
      spec: { options: [ok('Que ele protege e cuida dos animais da mata'), no('Que ele caça os animais da mata', 'É o contrário: ele protege os animais.'), no('Que ele cuida de um jardim na cidade', 'Fauna são os animais, e o Caipora é da mata.')] },
      answer: 'Ele protege/cuida dos animais da mata.',
      ok: 'Isso! O Caipora protege os animais.',
      why: 'Ser **protetor da fauna** significa **proteger e cuidar dos animais da mata**.',
      recap: 'Fauna são os animais. O que um protetor faz?', hint1: 'Protetor = quem cuida. Fauna = animais.', hint2: 'Ele cuida dos animais da mata.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Ser protetor da fauna quer dizer {0} os {1} da mata.', answers: ['proteger', 'animais'], bank: ['caçar', 'carros'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'No cordel, quem cuida dos animais da mata?', options: [ok('O Caipora'), no('O caçador', 'O caçador precisa pedir autorização ao Caipora.'), no('Ninguém', 'O Caipora é o guardião da fauna.')] },
      review: { type: 'mc', prompt: 'No cordel, o Caipora é…', options: [ok('guardião e protetor da fauna'), no('um caçador', 'Ele protege os animais.'), no('um vendedor da feira', 'Ele é guardião da mata.')] },
      where: 'Fase 2-2 • Entrada da Mata do Cordel', effect: 'Animais aparecem tranquilos nas árvores.'
    },
    {
      id: 'GEO-C2-Q03', chapter: 2, stage: 'c2s2', concept: 'Leitura do cordel', book: true,
      title: 'Caçador na mata',
      prompt: 'Segundo o cordel, o que o caçador precisa fazer antes de entrar na mata?',
      pre: ['Releia os versos do folheto: eles contam uma **regra** da mata do Caipora.'],
      visual: 'versosCaipora',
      type: 'mc',
      spec: { options: [ok('Pedir autorização ao Caipora'), no('Entrar correndo sem avisar', 'O cordel diz que é preciso pedir autorização.'), no('Levar mais armadilhas', 'O cordel diz que é preciso pedir autorização ao Caipora.')] },
      answer: 'Pedir autorização ao Caipora.',
      ok: 'Certo! Antes de entrar, o caçador pede autorização.',
      why: 'No cordel, o caçador deve **pedir autorização ao Caipora** antes de entrar na mata.',
      recap: 'Procure nos versos o que vem “antes de entrar”.', hint1: 'O Caipora é o dono da regra. O que se pede a ele?', hint2: 'É um pedido: pedir…',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Antes de entrar na mata, o caçador deve pedir {0} ao {1}.', answers: ['autorização', 'Caipora'], bank: ['desculpas', 'prefeito'], prefill: 0 },
      confirm: { type: 'mc', prompt: 'Por que o caçador pede autorização ao Caipora?', options: [ok('Porque o Caipora é o guardião dos animais da mata'), no('Porque o Caipora vende ingressos', 'O Caipora protege a fauna.'), no('Porque o caçador é o dono da mata', 'No cordel, o guardião é o Caipora.')] },
      review: { type: 'mc', prompt: 'Segundo o cordel, o caçador precisa…', options: [ok('pedir autorização ao Caipora antes de entrar'), no('entrar à noite sem ninguém ver', 'Ele deve pedir autorização.'), no('caçar quantos animais quiser', 'O Caipora protege a fauna.')] },
      where: 'Fase 2-2 • Portão da Mata', effect: 'O portão da mata se abre com respeito.'
    },
    {
      id: 'GEO-C2-Q16', chapter: 2, stage: 'c2s2', concept: 'Xilogravura', book: true,
      title: 'Como fazer xilogravura',
      prompt: 'Explique como é feita uma impressão utilizando xilogravura. Coloque as etapas na ordem.',
      pre: ['Capas de cordel podem usar **xilogravura**.', 'Na xilogravura, o desenho em **relevo** é **esculpido na madeira**, recebe **tinta** e é **prensado** no papel.'],
      visual: 'xilo', visualLabel: 'Ver a oficina de xilogravura',
      type: 'order',
      spec: { items: ['Esculpir o desenho em relevo na madeira', 'Passar tinta na madeira', 'Prensar a madeira sobre o papel'], note: 'Toque nas etapas na ordem em que acontecem.' },
      answer: 'Esculpe-se o desenho em relevo na madeira, passa-se tinta e prensa-se a madeira sobre o papel.',
      ok: 'Impressão perfeita!',
      why: 'Primeiro **esculpe-se o desenho em relevo na madeira**; depois **passa-se tinta**; por fim, **prensa-se a madeira sobre o papel**.',
      recap: 'Dá para passar tinta num desenho que ainda não foi esculpido?', hint1: 'A madeira precisa estar pronta antes da tinta.', hint2: 'Esculpir → tinta → prensar.',
      guided: { type: 'fill', prompt: 'Complete as etapas:', text: 'Primeiro, {0} o desenho em relevo na madeira. Depois, passa-se {1}. Por fim, {2} a madeira sobre o papel.', answers: ['esculpe-se', 'tinta', 'prensa-se'], bank: ['apaga-se', 'água'] },
      confirm: { type: 'mc', prompt: 'Na xilogravura, onde o desenho é esculpido?', options: [ok('Na madeira'), no('No papel', 'O papel recebe a impressão.'), no('Na tinta', 'A tinta vai sobre a madeira esculpida.')] },
      review: { type: 'order', prompt: 'Ordene as etapas da xilogravura.', items: ['Esculpir o desenho em relevo na madeira', 'Passar tinta', 'Prensar sobre o papel'] },
      where: 'Fase 2-2 • Oficina do Xilogravador', effect: 'A prensa imprime a capa de um novo cordel.'
    },
    {
      id: 'GEO-C2-Q17', chapter: 2, stage: 'c2s2', concept: 'Criar uma xilogravura da diversidade', book: true, personal: true,
      title: 'Xilogravura da diversidade',
      prompt: 'O que você desenharia numa xilogravura para representar a diversidade brasileira? Por quê?',
      pre: ['Agora é sua vez de **criar**! Escolha elementos que mostrem a **variedade de pessoas, costumes e manifestações** do Brasil.'],
      visual: 'xiloBoard',
      type: 'personal',
      spec: {
        min: 3, need: ['Pessoas com diferentes tons de pele', 'Pessoas com cabelos diferentes', 'Uma roda de capoeira', 'A Festa do Divino', 'O toré', 'Uma rede para descansar', 'Pratos como tapioca e acarajé', 'Pessoas convivendo numa feira'],
        needMsg: 'Escolha pelo menos 3 elementos que mostrem pessoas, costumes ou manifestações diferentes.',
        choices: ['Pessoas com diferentes tons de pele', 'Pessoas com cabelos diferentes', 'Uma roda de capoeira', 'A Festa do Divino', 'O toré', 'Uma rede para descansar', 'Pratos como tapioca e acarajé', 'Pessoas convivendo numa feira', 'A mesma pessoa repetida igual várias vezes'],
        avoid: ['A mesma pessoa repetida igual várias vezes'], avoidMsg: { 'A mesma pessoa repetida igual várias vezes': 'Isso não mostra diversidade: as pessoas são diferentes!' },
        reasons: ['porque o Brasil é formado por muitos povos', 'porque as diferenças são uma riqueza', 'porque todos convivem e se respeitam'], reasonsTitle: 'Por quê?',
        judge: true, placeholder: 'Se quiser, descreva seu desenho (sem julgamentos).', note: 'Criação pessoal: escolha pelo menos 3 elementos variados e um porquê.'
      },
      answer: 'Criação pessoal com variedade de pessoas/costumes/manifestações e justificativa respeitosa.',
      ok: 'Que xilogravura bonita! Ela mostra a diversidade com respeito.',
      why: 'Uma boa xilogravura da diversidade mostra **pessoas diferentes**, **costumes** e **manifestações** de várias origens, com uma **justificativa respeitosa**.',
      recap: 'Escolha elementos variados e um porquê.', hint1: 'Misture pessoas, uma festa e uma comida.', hint2: 'Escolha 3 elementos diferentes e um porquê.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Eu desenharia pessoas {0}, uma roda de {1} e o {2}, porque as diferenças são uma {3}.', answers: ['diferentes', 'capoeira', 'toré', 'riqueza'], bank: ['iguais', 'problema'] },
      confirm: null,
      review: { type: 'mc', prompt: 'Qual desenho representa melhor a diversidade brasileira?', options: [ok('Pessoas diferentes numa feira, com capoeira, toré e comidas variadas'), no('A mesma pessoa repetida várias vezes', 'Isso não mostra diversidade.'), no('Um único prato de comida', 'Mostra pouca diversidade.')] },
      where: 'Fase 2-2 • Prensa gigante no fim da fase', effect: 'Sua xilogravura é impressa na capa do cordel da fase.'
    },

    /* ------------------------------------------------ Fase 2-3 Ritmos do Brasil */
    {
      id: 'GEO-C2-Q04', chapter: 2, stage: 'c2s3', concept: 'Festas, ritmos e influências', book: true,
      title: 'Festas e ritmos',
      prompt: 'Reconheça as manifestações e os povos que as influenciaram. Separe cada item no grupo certo.',
      pre: ['**Festa do Divino**: origem **portuguesa**; celebração religiosa com grupos, dança, tambores, bandeiras e roupas especiais.', '**Samba de roda**: surgiu na **Bahia** com forte influência **africana**; dança, canto, palmas, chocalho, pandeiro, tambor, viola e berimbau.', '**Toré**: manifestação de comunidades **indígenas**; rituais, danças, cantos, chocalhos e brincadeiras.'],
      type: 'classify',
      spec: { bins: ORIG, items: [
        { t: 'Festa do Divino', bin: 'port', fb: 'A Festa do Divino tem origem portuguesa.' }, { t: 'Samba de roda', bin: 'afr', fb: 'O samba de roda tem forte influência africana.' }, { t: 'Toré', bin: 'ind', fb: 'O toré é das comunidades indígenas.' },
        { t: 'Bandeiras e roupas especiais', bin: 'port', fb: 'Bandeiras e roupas especiais são da Festa do Divino (portuguesa).' }, { t: 'Palmas, pandeiro e berimbau', bin: 'afr', fb: 'Palmas, pandeiro e berimbau são do samba de roda (africana).' }, { t: 'Rituais, cantos e chocalhos', bin: 'ind', fb: 'Rituais, cantos e chocalhos são do toré (indígena).' }
      ] },
      answer: 'Festa do Divino – portuguesa; samba de roda – africana; toré – indígena (com suas características).',
      ok: 'No ritmo certo!',
      why: '**Festa do Divino** (portuguesa): bandeiras, tambores e roupas especiais. **Samba de roda** (africana, Bahia): palmas, pandeiro, berimbau. **Toré** (indígena): rituais, cantos e chocalhos.',
      recap: 'Lembre das três músicas que você tocou e de quem veio cada uma.', hint1: 'Bandeiras → Divino; berimbau → samba de roda; chocalhos e rituais → toré.', hint2: 'Divino = portuguesa; samba de roda = africana; toré = indígena.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'A Festa do Divino tem origem {0}; o samba de roda, influência {1}; o toré é das comunidades {2}.', answers: ['portuguesa', 'africana', 'indígenas'], bank: ['japonesa'] },
      confirm: { type: 'mc', prompt: 'Uma celebração religiosa tem bandeiras, tambores, danças e roupas especiais, com origem portuguesa. Qual é?', options: [ok('Festa do Divino'), no('Toré', 'O toré é indígena.'), no('Samba de roda', 'O samba de roda é de influência africana.')] },
      review: { type: 'classify', prompt: 'Ligue cada manifestação à sua influência.', bins: ORIG, items: [{ t: 'Toré', bin: 'ind' }, { t: 'Samba de roda', bin: 'afr' }, { t: 'Festa do Divino', bin: 'port' }] },
      where: 'Fase 2-3 • Palco final dos Ritmos', effect: 'Os três grupos tocam juntos no palco.'
    },

    /* ------------------------------------------------ Fase 2-4 Cozinha dos Povos */
    {
      id: 'GEO-C2-Q12', chapter: 2, stage: 'c2s4', concept: 'Culinária africana', book: true,
      title: 'Enigma do acarajé',
      prompt: 'Monte A + CA + RA + JÉ e indique a origem do prato.',
      pre: ['O livro mostra um **quadro de culinária** com pratos de origem **portuguesa**, **africana** e **indígena**.'],
      type: 'syllables',
      spec: { pieces: ['A', 'CA', 'RA', 'JÉ'], extra: ['TA', 'PO'], word: 'ACARAJÉ', origin: { prompt: 'Qual é a origem do **acarajé** no quadro?', options: [ok('Culinária africana'), no('Culinária indígena', 'No quadro, tapioca e farofa é que são indígenas.'), no('Culinária portuguesa', 'No quadro, buchada e sarapatel é que são portugueses.')] } },
      answer: 'ACARAJÉ — culinária africana.',
      ok: 'Acarajé montado!', why: 'No quadro, **vatapá e acarajé** são da **culinária africana**.',
      recap: 'Leia as sílabas em voz alta: A-CA-RA-JÉ.', hint1: 'Começa com A.', hint2: 'Acarajé está junto com o vatapá no quadro.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O prato {0} é da culinária {1}.', answers: ['ACARAJÉ', 'africana'], bank: ['indígena', 'portuguesa'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Qual prato aparece junto com o acarajé na culinária africana?', options: [ok('Vatapá'), no('Tapioca', 'Tapioca é indígena no quadro.'), no('Buchada', 'Buchada é portuguesa no quadro.')] },
      review: { type: 'mc', prompt: 'No quadro do livro, o acarajé é da culinária…', options: [ok('africana'), no('indígena', 'Indígenas: tapioca e farofa.'), no('portuguesa', 'Portugueses: buchada e sarapatel.')] },
      where: 'Fase 2-4 • Panela Africana', effect: 'A panela africana solta vapor dourado.'
    },
    {
      id: 'GEO-C2-Q13', chapter: 2, stage: 'c2s4', concept: 'Culinária indígena', book: true,
      title: 'Enigma da tapioca',
      prompt: 'Monte TA + PI + O + CA e indique a origem do prato.',
      type: 'syllables',
      spec: { pieces: ['TA', 'PI', 'O', 'CA'], extra: ['RA', 'JÉ'], word: 'TAPIOCA', origin: { prompt: 'Qual é a origem da **tapioca** no quadro?', options: [ok('Culinária indígena'), no('Culinária africana', 'No quadro, vatapá e acarajé é que são africanos.'), no('Culinária portuguesa', 'No quadro, buchada e sarapatel é que são portugueses.')] } },
      answer: 'TAPIOCA — culinária indígena.',
      ok: 'Tapioca pronta!', why: 'No quadro, **tapioca e farofa** são da **culinária indígena**.',
      recap: 'Leia: TA-PI-O-CA.', hint1: 'Começa com TA.', hint2: 'A tapioca está junto com a farofa.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O prato {0} é da culinária {1}.', answers: ['TAPIOCA', 'indígena'], bank: ['africana', 'portuguesa'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Qual prato aparece junto com a tapioca na culinária indígena?', options: [ok('Farofa'), no('Sarapatel', 'Sarapatel é português no quadro.'), no('Acarajé', 'Acarajé é africano no quadro.')] },
      review: { type: 'mc', prompt: 'No quadro do livro, a tapioca é da culinária…', options: [ok('indígena'), no('africana', 'Africanos: vatapá e acarajé.'), no('portuguesa', 'Portugueses: buchada e sarapatel.')] },
      where: 'Fase 2-4 • Panela Indígena', effect: 'A panela indígena solta vapor verde.'
    },
    {
      id: 'GEO-C2-Q14', chapter: 2, stage: 'c2s4', concept: 'Culinária portuguesa', book: true,
      title: 'Enigma do sarapatel',
      prompt: 'Monte SA + RA + PA + TEL e indique a origem do prato.',
      type: 'syllables',
      spec: { pieces: ['SA', 'RA', 'PA', 'TEL'], extra: ['CA', 'PI'], word: 'SARAPATEL', origin: { prompt: 'Qual é a origem do **sarapatel** no quadro?', options: [ok('Culinária portuguesa'), no('Culinária indígena', 'No quadro, tapioca e farofa é que são indígenas.'), no('Culinária africana', 'No quadro, vatapá e acarajé é que são africanos.')] } },
      answer: 'SARAPATEL — culinária portuguesa.',
      ok: 'Sarapatel servido!', why: 'No quadro, **buchada e sarapatel** são da **culinária portuguesa**.',
      recap: 'Leia: SA-RA-PA-TEL.', hint1: 'Termina com TEL.', hint2: 'O sarapatel está junto com a buchada.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'O prato {0} é da culinária {1}.', answers: ['SARAPATEL', 'portuguesa'], bank: ['indígena', 'africana'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Qual prato aparece junto com o sarapatel na culinária portuguesa?', options: [ok('Buchada'), no('Farofa', 'Farofa é indígena no quadro.'), no('Vatapá', 'Vatapá é africano no quadro.')] },
      review: { type: 'mc', prompt: 'No quadro do livro, o sarapatel é da culinária…', options: [ok('portuguesa'), no('indígena', 'Indígenas: tapioca e farofa.'), no('africana', 'Africanos: vatapá e acarajé.')] },
      where: 'Fase 2-4 • Panela Portuguesa', effect: 'A panela portuguesa solta vapor azul.'
    },
    {
      id: 'GEO-C2-Q15', chapter: 2, stage: 'c2s4', concept: 'Quadro da culinária', book: true,
      title: 'Classificação da culinária',
      prompt: 'Separe os seis pratos conforme o quadro do livro.',
      type: 'classify',
      spec: { bins: ORIG, items: [
        { t: 'Buchada', bin: 'port', icon: '🍲', fb: 'Buchada é portuguesa no quadro.' }, { t: 'Sarapatel', bin: 'port', icon: '🥘', fb: 'Sarapatel é português no quadro.' },
        { t: 'Vatapá', bin: 'afr', icon: '🍛', fb: 'Vatapá é africano no quadro.' }, { t: 'Acarajé', bin: 'afr', icon: '🧆', fb: 'Acarajé é africano no quadro.' },
        { t: 'Tapioca', bin: 'ind', icon: '🫓', fb: 'Tapioca é indígena no quadro.' }, { t: 'Farofa', bin: 'ind', icon: '🥣', fb: 'Farofa é indígena no quadro.' }
      ] },
      answer: 'Portuguesa: buchada e sarapatel; africana: vatapá e acarajé; indígena: tapioca e farofa.',
      ok: 'Quadro completo!', why: '**Portuguesa**: buchada e sarapatel. **Africana**: vatapá e acarajé. **Indígena**: tapioca e farofa.',
      recap: 'Lembre das três panelas da cozinha.', hint1: 'Cada origem tem dois pratos.', hint2: 'Tapioca e farofa ficam juntas; vatapá e acarajé também.',
      guided: { type: 'fill', prompt: 'Complete o quadro:', text: 'Portuguesa: buchada e {0}. Africana: vatapá e {1}. Indígena: tapioca e {2}.', answers: ['sarapatel', 'acarajé', 'farofa'], bank: ['pizza'] },
      confirm: { type: 'mc', prompt: 'Qual par é da culinária indígena no quadro?', options: [ok('Tapioca e farofa'), no('Buchada e sarapatel', 'Esses são portugueses.'), no('Vatapá e acarajé', 'Esses são africanos.')] },
      review: { type: 'classify', prompt: 'Separe os pratos pelo quadro.', bins: ORIG, items: [{ t: 'Farofa', bin: 'ind' }, { t: 'Vatapá', bin: 'afr' }, { t: 'Buchada', bin: 'port' }] },
      where: 'Fase 2-4 • Mesa do Banquete', effect: 'O banquete dos povos fica pronto.'
    },

    /* ------------------------------------------------ Fase 2-5 Chefe: Sombra do Preconceito */
    {
      id: 'GEO-C2-Q05', chapter: 2, stage: 'c2s5', concept: 'Descrever sem julgar', book: true,
      title: 'Descrição sem julgamento',
      prompt: 'Descreva a personagem Lia (fictícia) pelo tom de voz, alimentação, interesses e preferências, sem julgamentos como feio, bonito, ruim ou legal.',
      pre: ['Descrever alguém com **respeito** é **observar características sem julgamentos** como “feio”, “bonito”, “ruim” ou “legal”.'],
      visual: 'lia', visualLabel: 'Ver o cartão da Lia',
      type: 'personal',
      spec: {
        min: 3, need: ['Fala com tom de voz baixo', 'Gosta de comer tapioca', 'Adora jogar futebol', 'Prefere ler histórias de cordel', 'Tem cabelo cacheado', 'Usa óculos'],
        needMsg: 'Escolha pelo menos 3 características observáveis do cartão.',
        choices: ['Fala com tom de voz baixo', 'Gosta de comer tapioca', 'Adora jogar futebol', 'Prefere ler histórias de cordel', 'Tem cabelo cacheado', 'Usa óculos', 'É feia', 'É bonita', 'É chata', 'É legal'],
        avoid: ['É feia', 'É bonita', 'É chata', 'É legal'], avoidMsg: { 'É feia': '“Feia” é um julgamento. Observe sem julgar.', 'É bonita': '“Bonita” também é julgamento. Descreva o que se observa.', 'É chata': '“Chata” é julgamento. Descreva o que se observa.', 'É legal': '“Legal” é julgamento. Descreva o que se observa.' },
        judge: true, judgeMsg: 'Evite julgamentos como feio, bonito, ruim ou legal. Descreva o que se observa.', placeholder: 'Se quiser, escreva sua descrição.', note: 'Escolha características observáveis — sem julgamentos.'
      },
      answer: 'Descrição observável e respeitosa (tom de voz, alimentação, interesses, preferências), sem julgamentos.',
      ok: 'Descrição respeitosa! Você observou sem julgar.',
      why: 'Uma descrição respeitosa fala do que se **observa**: **tom de voz, alimentação, interesses e preferências** — sem “feio”, “bonito”, “ruim” ou “legal”.',
      recap: 'Julgamentos são opiniões sobre a pessoa. Descrição é o que dá para observar.', hint1: 'Use as informações do cartão da Lia.', hint2: 'Voz baixa, tapioca, cordel… são observações.',
      guided: { type: 'fill', prompt: 'Complete sem julgar:', text: 'Lia fala com tom de voz {0}, gosta de comer {1} e prefere ler {2}.', answers: ['baixo', 'tapioca', 'cordel'], bank: ['feia', 'chata'], prefill: 1 },
      confirm: { type: 'mc', prompt: 'Qual frase descreve sem julgar?', options: [ok('Ele usa óculos e gosta de desenhar'), no('Ele é esquisito', 'Isso é um julgamento.'), no('Ela é a mais bonita da sala', 'Isso é um julgamento.')] },
      review: { type: 'mc', prompt: 'Qual frase é uma descrição respeitosa?', options: [ok('Ela fala baixinho e gosta de futebol'), no('Ela é feia', 'Julgamento.'), no('Ela é legal', 'Também é julgamento.')] },
      where: 'Fase 2-5 • Escudo 1 da Sombra', effect: 'A primeira camada de sombra vira luz.'
    },
    {
      id: 'GEO-C2-Q06', chapter: 2, stage: 'c2s5', concept: 'Respeito e combate à discriminação', book: true,
      title: 'Reação diante de zombaria',
      prompt: 'Como você reagiria se alguém fosse alvo de risos por ter nome, origem, cor ou costumes diferentes?',
      pre: ['Todos são **iguais perante a lei**. Ninguém deve sofrer **discriminação** por cor, religião, gênero ou outras diferenças.'],
      type: 'multi',
      spec: { min: 2, note: 'Marque pelo menos 2 atitudes respeitosas.', options: [ok('Não rir junto'), ok('Respeitar a pessoa'), ok('Apoiar e defender quem foi alvo'), ok('Conversar com quem zombou'), ok('Procurar um adulto quando necessário'), no('Rir junto para fazer parte do grupo', 'Rir junto também machuca quem é alvo.'), no('Espalhar a piada', 'Espalhar aumenta o desrespeito.')] },
      answer: 'Não rir, respeitar, apoiar, defender, conversar e procurar um adulto quando necessário.',
      ok: 'Atitude de Guardião!', why: 'Diante de zombaria: **não rir**, **respeitar**, **apoiar e defender** quem é alvo, **conversar** e **procurar um adulto** quando necessário.',
      recap: 'Pense: como a pessoa alvo se sente? O que ajudaria?', hint1: 'Uma atitude é “não rir”. Qual outra ajuda?', hint2: 'Não rir, apoiar, procurar um adulto.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Eu não iria {0}; iria {1} a pessoa e procurar um {2} se fosse preciso.', answers: ['rir', 'apoiar', 'adulto'], bank: ['zombar', 'espalhar'] },
      confirm: { type: 'mc', prompt: 'Riram do nome diferente de um colega. Qual atitude ajuda?', options: [ok('Apoiar o colega e não rir'), no('Inventar um apelido', 'Isso é mais zombaria.'), no('Rir mais alto', 'Isso machuca.')] },
      review: { type: 'multi', prompt: 'Marque atitudes respeitosas diante de uma zombaria.', min: 2, options: [ok('Não rir'), ok('Procurar um adulto'), no('Espalhar a piada', 'Aumenta o desrespeito.')] },
      where: 'Fase 2-5 • Escudo 2 da Sombra', effect: 'A segunda camada de sombra vira luz.'
    },
    {
      id: 'GEO-C2-Q07', chapter: 2, stage: 'c2s5', concept: 'Empatia', book: true,
      title: 'Colocar-se no lugar do outro',
      prompt: 'O que significa colocar-se no lugar do outro?',
      pre: ['**Empatia** é compreender o que outras pessoas **pensam, sentem ou precisam** e **mudar atitudes** para melhorar a convivência.'],
      type: 'open',
      spec: {
        placeholder: 'Ex.: É tentar entender…', min: 2,
        groups: [
          { label: 'Tentar compreender a outra pessoa', kw: ['entend', 'compreend', 'perceb', 'imagin'] },
          { label: 'O que ela pensa', kw: ['pensa', 'pensamento', 'opiniao'] },
          { label: 'O que ela sente', kw: ['sente', 'sentimento', 'sentir', 'triste', 'feliz'] },
          { label: 'O que ela precisa', kw: ['precis', 'necessid'] },
          { label: 'Agir com empatia', kw: ['empatia', 'empatic', 'respeit', 'cuidar', 'ajudar', 'gentil', 'mudar atitude', 'mudar'] }
        ],
        distractors: ['Ocupar a cadeira de outra pessoa', 'Pensar só em si mesmo']
      },
      answer: 'Tentar compreender o que a pessoa pensa, sente ou precisa e agir com empatia.',
      ok: 'Isso é empatia!', why: 'Colocar-se no lugar do outro é **tentar compreender** o que a pessoa **pensa, sente ou precisa** e **agir com empatia**.',
      recap: 'Não é trocar de lugar de verdade: é entender o outro.', hint1: 'Pense em pensamentos e sentimentos.', hint2: 'Entender o que a pessoa sente ou precisa.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Colocar-se no lugar do outro é tentar {0} o que a pessoa {1}, {2} ou precisa, e agir com {3}.', answers: ['compreender', 'pensa', 'sente', 'empatia'], bank: ['ignorar', 'raiva'] },
      confirm: { type: 'mc', prompt: 'Um colega novo está sozinho no recreio. Colocar-se no lugar dele é…', options: [ok('Imaginar como ele se sente e convidar para brincar'), no('Ignorar, pois não é problema seu', 'Empatia é perceber o outro.'), no('Rir dele', 'Isso é desrespeito.')] },
      review: { type: 'mc', prompt: 'Empatia é…', options: [ok('compreender o que o outro pensa, sente ou precisa'), no('fazer tudo o que o outro manda', 'Não é obedecer: é compreender.'), no('pensar só em si', 'É o contrário.')] },
      where: 'Fase 2-5 • Escudo 3 da Sombra', effect: 'A terceira camada de sombra vira luz.'
    },
    {
      id: 'GEO-C2-Q08', chapter: 2, stage: 'c2s5', concept: 'Respeito a costumes diferentes', book: true,
      title: 'Costumes diferentes',
      prompt: 'Como reagir ao encontrar pessoas com costumes diferentes dos seus?',
      pre: ['**Diferenças físicas e culturais** devem ser vistas como **riqueza**. Sotaques, hábitos alimentares e costumes **variam** entre as regiões.'],
      type: 'multi',
      spec: { min: 2, options: [ok('Respeitar'), ok('Ouvir'), ok('Procurar compreender'), ok('Não discriminar nem julgar'), no('Dizer que o costume dela é errado', 'Costumes diferentes não são errados.'), no('Afastar a pessoa do grupo', 'Isso é discriminação.')] },
      answer: 'Respeitar, ouvir, procurar compreender, não discriminar nem julgar.',
      ok: 'Muito bem!', why: 'Diante de costumes diferentes: **respeitar**, **ouvir**, **procurar compreender** e **não discriminar nem julgar**.',
      recap: 'Diferenças são riqueza, não erro.', hint1: 'Uma atitude começa com “ouvir”.', hint2: 'Respeitar, ouvir e compreender.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Devo {0}, {1} e procurar {2}, sem discriminar.', answers: ['respeitar', 'ouvir', 'compreender'], bank: ['julgar'] },
      confirm: { type: 'mc', prompt: 'Uma colega come um prato que você não conhece. O que fazer?', options: [ok('Perguntar com respeito e procurar conhecer'), no('Dizer que é nojento', 'Isso é desrespeito.'), no('Mandar ela comer outra coisa', 'Isso é julgar o costume dela.')] },
      review: { type: 'multi', prompt: 'Marque atitudes diante de costumes diferentes.', min: 2, options: [ok('Ouvir'), ok('Respeitar'), no('Julgar', 'Não devemos julgar.')] },
      where: 'Fase 2-5 • Escudo 4 da Sombra', effect: 'A quarta camada de sombra vira luz.'
    },
    {
      id: 'GEO-C2-Q09', chapter: 2, stage: 'c2s5', concept: 'Atitudes empáticas', book: true,
      title: 'Ser mais empático',
      prompt: 'Como podemos ser mais empáticos?',
      pre: ['Empatia também é **atitude**: dá para praticar no dia a dia, na escola e em casa.'],
      type: 'open',
      spec: {
        placeholder: 'Ex.: Podemos ouvir…', min: 2,
        groups: [
          { label: 'Observar', kw: ['observ', 'prestar atencao', 'perceb'] },
          { label: 'Ouvir', kw: ['ouvir', 'ouvindo', 'escut'] },
          { label: 'Oferecer ajuda', kw: ['ajud', 'ajuda', 'apoi'] },
          { label: 'Respeitar sentimentos e diferenças', kw: ['respeit', 'sentiment', 'diferenc'] },
          { label: 'Mudar atitudes que prejudicam alguém', kw: ['mudar', 'atitude', 'parar de', 'nao zombar', 'desculpa'] }
        ],
        distractors: ['Pensar só em mim', 'Rir de quem é diferente']
      },
      answer: 'Observar, ouvir, oferecer ajuda, respeitar sentimentos/diferenças e mudar atitudes que prejudiquem alguém.',
      ok: 'A Sombra do Preconceito se desfez!', why: 'Somos mais empáticos quando **observamos**, **ouvimos**, **oferecemos ajuda**, **respeitamos sentimentos e diferenças** e **mudamos atitudes** que prejudicam alguém.',
      recap: 'Pense em ações: o que você pode fazer por alguém?', hint1: 'Uma ação usa os ouvidos; outra, as mãos.', hint2: 'Ouvir e oferecer ajuda.',
      guided: { type: 'fill', prompt: 'Complete:', text: 'Podemos ser mais empáticos quando {0} com atenção, {1} ajuda, {2} as diferenças e {3} atitudes que prejudicam alguém.', answers: ['ouvimos', 'oferecemos', 'respeitamos', 'mudamos'], bank: ['zombamos'] },
      confirm: { type: 'mc', prompt: 'Qual atitude é empática?', options: [ok('Oferecer ajuda a um colega com dificuldade'), no('Fingir que não viu', 'Empatia é perceber e agir.'), no('Rir do erro do colega', 'Isso machuca.')] },
      review: { type: 'multi', prompt: 'Marque atitudes empáticas.', min: 2, options: [ok('Ouvir com atenção'), ok('Oferecer ajuda'), no('Ignorar sentimentos', 'O contrário da empatia.')] },
      where: 'Fase 2-5 • Escudo final da Sombra', effect: 'A Sombra do Preconceito se transforma em luz.'
    }
  );

  GEO.data.statements = GEO.data.statements || {};
  GEO.data.statements[2] = [
    { t: 'Miscigenação é a convivência, influência e geração de descendentes entre pessoas de origens diversas.', v: true },
    { t: 'Diferenças físicas e culturais são um problema.', v: false, fb: 'Diferenças devem ser vistas como riqueza.' },
    { t: 'Todos são iguais perante a lei.', v: true },
    { t: 'Pode-se discriminar alguém pela religião.', v: false, fb: 'Ninguém deve sofrer discriminação por cor, religião, gênero ou outras diferenças.' },
    { t: 'Empatia é compreender o que o outro pensa, sente ou precisa.', v: true },
    { t: 'Descrever com respeito é dizer se alguém é feio ou bonito.', v: false, fb: 'Descrever com respeito é observar sem julgar.' },
    { t: 'A rede para descansar é uma influência indígena.', v: true },
    { t: 'Os balangandãs são uma influência africana.', v: true },
    { t: 'O toré é uma festa de origem portuguesa.', v: false, fb: 'O toré é uma manifestação de comunidades indígenas.' },
    { t: 'O samba de roda surgiu na Bahia com forte influência africana.', v: true },
    { t: 'A Festa do Divino tem origem indígena.', v: false, fb: 'A Festa do Divino tem origem portuguesa.' },
    { t: 'No quadro, vatapá e acarajé são da culinária africana.', v: true },
    { t: 'No quadro, tapioca e farofa são da culinária portuguesa.', v: false, fb: 'No quadro, tapioca e farofa são da culinária indígena.' },
    { t: 'O cordel faz parte da cultura nordestina.', v: true },
    { t: 'O cordel é escrito sem rimas e com linguagem difícil.', v: false, fb: 'O cordel tem versos com rima e linguagem simples.' },
    { t: 'A influência alemã se destaca no Sul, a africana no Nordeste e a indígena no Norte.', v: true },
    { t: 'Sotaques e costumes são iguais em todas as regiões.', v: false, fb: 'Sotaques, hábitos alimentares e costumes variam entre regiões.' },
    { t: 'As três refeições principais são uma influência portuguesa/europeia, segundo o livro.', v: true },
    { t: 'Na xilogravura, o desenho é esculpido em relevo na madeira.', v: true },
    { t: 'Os balangandãs são uma comida indígena.', v: false, fb: 'Balangandãs são adornos usados no corpo, de influência africana.' }
  ];
})();
