/* =====================================================================
   content/capitulos.js — campanha "Brasil em Movimento".
   3 capítulos, 16 fases, cada fase com estilo de jogo próprio, as
   questões que hospeda (ordem de aparição), falas curtas da Gaia
   (máx. 3 balões, ~25 palavras) e desafios do GeoBot.
   engine: platform | topdown | shmup | race | boss | maze | rhythm |
           kitchen | city | tower
   ===================================================================== */
(function () {
  'use strict';
  const D = GEO.data;

  D.chapters = [
    { n: 1, id: 'c1', title: 'O Mosaico do Povo Brasileiro', page: 'Página 1 do Atlas', color: '#f39c12', icon: '🧩', summary: 'Diversidade do povo brasileiro, povos indígenas, portugueses, povos africanos, quilombos e imigração.' },
    { n: 2, id: 'c2', title: 'Culturas que se Encontram', page: 'Página 2 do Atlas', color: '#e84393', icon: '🎭', summary: 'Miscigenação, direito à diferença, cordel e Caipora, festas, ritmos, culinária, empatia e xilogravura.' },
    { n: 3, id: 'c3', title: 'O Brasil que Muda', page: 'Página 3 do Atlas', color: '#3ec1ff', icon: '🏙️', summary: 'Ocupação do território, urbanização, infraestrutura, desigualdades, população e terras indígenas e quilombolas.' }
  ];

  D.stages = [
    /* ---------------------------------------------------------------- CAPÍTULO 1 */
    { id: 'c1s1', ch: 1, n: 1, title: 'Festival da Diversidade', engine: 'platform', theme: 'festival', music: 'festa', style: 'Plataforma lateral',
      questions: ['GEO-C1-Q01', 'GEO-C1-Q02', 'GEO-C1-Q03', 'GEO-C1-Q04'], node: { x: 470, y: 250 },
      intro: ['Gabriel! A **Névoa da Generalização** embaralhou o Atlas Vivo do Brasil. Vamos recuperar os fragmentos!', 'Corra, pule e quebre os **Blocos do Erro** escolhendo a frase certa. Nos **totens**, eu explico e pergunto.'],
      cards: {
        palco: ['Bem-vindo ao Festival! Repare nas pessoas: cada uma tem seu jeito, sua cor de pele, seu cabelo e suas roupas.'],
        mistura: ['O povo brasileiro é diverso porque **diferentes povos** conviveram e se misturaram.'],
        leis: ['Apesar das diferenças, todos **compartilham o território brasileiro**, seguem **as mesmas leis** e devem se **respeitar**.']
      },
      goal: 'Chegue ao palco final recuperando o mosaico.', par: 240 },
    { id: 'c1s2', ch: 1, n: 2, title: 'Mapa dos Povos Originários', engine: 'topdown', theme: 'aldeia', music: 'atlas', style: 'Exploração e quebra-cabeça de mapa',
      questions: ['GEO-C1-Q05', 'GEO-C1-Q08', 'GEO-C1-Q07', 'GEO-C1-Q06'], node: { x: 300, y: 330 },
      intro: ['Antes de o Brasil existir como país, **muitos povos indígenas** viviam aqui.', 'As **Sombras da Generalização** querem apagar as diferenças. Visite as estações e conserte o mapa!'],
      cards: {
        doencas: ['A população e o número de povos **diminuíram** por **doenças trazidas da Europa**, **conflitos por terras** e **resistência à escravidão**.'],
        hoje: ['Hoje usamos “**indígena**” para integrantes dos **povos originários**. Indígenas também **vivem, estudam e trabalham nas cidades**.']
      },
      goal: 'Visite as 4 estações e monte o mapa histórico.', par: 240 },
    { id: 'c1s3', ch: 1, n: 3, title: 'Rotas pelo Atlântico', engine: 'shmup', theme: 'oceano', music: 'oceano', style: 'Nave-cartográfica',
      questions: ['GEO-C1-Q09', 'GEO-C1-Q10', 'GEO-C1-Q11', 'GEO-C1-Q12'], node: { x: 560, y: 300 },
      intro: ['Pilote a **nave-cartográfica**! Os pulsos de conhecimento só atingem **névoas, documentos falsos e correntes simbólicas** — nunca pessoas.', 'Pouse nas **Ilhas-Atlas** para estudar.'],
      cards: {
        colonia: ['A colonização portuguesa começou no **litoral**. O **português** tornou-se o idioma oficial.', 'Colonizadores exploraram recursos, criaram **áreas de cultivo, vilas e cidades**. Houve **conflitos** com povos indígenas, **escravização** e **imposição de costumes**.'],
        memoria: ['Aqui a nave desacelera. Pessoas de **diferentes regiões da África** foram **trazidas à força** e **escravizadas**.', 'Eram tratadas como mercadoria e obrigadas a trabalhar na **agricultura**, na **mineração** e em **atividades domésticas**. As condições eram **desumanas**; muitas pessoas fugiam.', 'A fuga ajudou a formar **quilombos**. Comunidades **quilombolas** atuais descendem dessas populações.'],
        portugal: ['Influências **portuguesas** aparecem na **culinária**, na **arquitetura**, na **religiosidade** e nos **costumes**.']
      },
      goal: 'Visite as Ilhas-Atlas e chegue ao porto.', par: 200 },
    { id: 'c1s4', ch: 1, n: 4, title: 'Caminhos da Imigração', engine: 'race', theme: 'estrada', music: 'corrida', style: 'Corrida contra o GeoBot',
      questions: ['GEO-C1-Q14', 'GEO-C1-Q15'], node: { x: 420, y: 470 },
      intro: ['GeoBot te desafiou para uma **corrida**! Respostas certas nos portais dão **turbo**.', 'Errar não acaba a corrida: eu explico e mostro uma **rota de recuperação**.'],
      cards: {
        escravidao: ['O livro explica que **trabalho semelhante à escravidão** ainda ocorre, com **promessas falsas**, **dívidas** e **impedimento de saída**.', 'Isso deve ser combatido com **denúncia** e **consumo responsável**.']
      },
      geobot: { start: ['Eu sou o GeoBot! Topa uma corrida pelos caminhos da imigração? Que vença quem aprender mais rápido!'], win: ['Você foi muito bem! Na próxima eu treino mais.'], lose: ['Cheguei primeiro desta vez, mas você aprendeu muito. Revanche quando quiser!'] },
      goal: 'Chegue antes do GeoBot usando os portais certos.', par: 110 },
    { id: 'c1s5', ch: 1, n: 5, title: 'Chefe: Generalizador', engine: 'boss', theme: 'mosaico', music: 'chefe', style: 'Batalha de chefe', boss: 'generalizador',
      questions: ['GEO-C1-Q13'], node: { x: 380, y: 380 },
      intro: ['O **Generalizador** quer colocar todo mundo no mesmo rótulo!', 'Acerte as **placas falsas** com pulsos e responda para quebrar o escudo.'],
      bossName: 'Generalizador', bossLine: 'TODOS IGUAIS! TODOS IGUAIS!',
      goal: 'Quebre o escudo de conceitos errados.', par: 180 },

    /* ---------------------------------------------------------------- CAPÍTULO 2 */
    { id: 'c2s1', ch: 2, n: 1, title: 'Labirinto das Culturas', engine: 'maze', theme: 'culturas', music: 'labirinto', style: 'Labirinto de coleta',
      questions: ['GEO-C2-Q10', 'GEO-C2-Q11'], node: { x: 460, y: 230 },
      intro: ['Leve cada **símbolo** ao **Altar da Origem** certo: indígena, africana ou portuguesa.', 'Pegue o poder **Empatia** para atravessar as Sombras e revelar pistas!'],
      cards: {
        set1: ['**Rede** para descansar: influência **indígena**. **Balangandãs**: adornos de influência **africana**. **Três refeições**: influência **portuguesa/europeia**.'],
        miscig: ['**Miscigenação**: convivência, influência e geração de descendentes entre pessoas de **origens diversas**.', 'Todos são **iguais perante a lei**; ninguém deve sofrer discriminação por cor, religião, gênero ou outras diferenças.']
      },
      goal: 'Leve os símbolos aos Altares das Origens.', par: 240 },
    { id: 'c2s2', ch: 2, n: 2, title: 'Cordel em Movimento', engine: 'platform', theme: 'cordel', music: 'cordel', style: 'Plataforma em xilogravura',
      questions: ['GEO-C2-Q01', 'GEO-C2-Q02', 'GEO-C2-Q03', 'GEO-C2-Q16', 'GEO-C2-Q17'], node: { x: 520, y: 330 },
      intro: ['Bem-vindo à **feira do cordel**! Tudo aqui parece **xilogravura**.', 'Suba nas cordas, pule nas molas e colete as **páginas** do folheto.'],
      cards: { folclore: ['O cordel pode retratar **mitos e folclore**, como o **Caipora**.'] },
      goal: 'Atravesse a feira e imprima sua xilogravura.', par: 260 },
    { id: 'c2s3', ch: 2, n: 3, title: 'Ritmos do Brasil', engine: 'rhythm', theme: 'ritmos', music: null, style: 'Batalha de ritmo',
      questions: ['GEO-C2-Q04'], node: { x: 380, y: 420 },
      intro: ['Três ritmos, três influências — numa **batalha de ritmo** contra o GeoBot! Use **← ↓ ↑ →** (ou tocando as pistas).', 'Antes de cada música, conheça a festa.'],
      cards: {
        divino: ['**Festa do Divino**: origem **portuguesa**. Celebração religiosa com grupos, **dança, tambores, bandeiras** e **roupas especiais**.'],
        samba: ['**Samba de roda**: surgiu na **Bahia**, com forte influência **africana**. Dança, canto, **palmas, chocalho, pandeiro, tambor, viola e berimbau**.'],
        tore: ['**Toré**: manifestação cultural de comunidades **indígenas**. **Rituais, danças, cantos, chocalhos** e brincadeiras.']
      },
      goal: 'Toque as três músicas e classifique as festas.', par: 200 },
    { id: 'c2s4', ch: 2, n: 4, title: 'Cozinha dos Povos', engine: 'kitchen', theme: 'cozinha', music: 'festa', style: 'Quebra-cabeça de sílabas',
      questions: ['GEO-C2-Q12', 'GEO-C2-Q13', 'GEO-C2-Q14', 'GEO-C2-Q15'], node: { x: 280, y: 300 },
      intro: ['As sílabas estão caindo do céu! Mova a **panela** e pegue as sílabas **na ordem certa**.', 'Depois diga a **origem** de cada prato, conforme o quadro do livro.'],
      cards: { quadro: ['Quadro do livro: **portuguesa** — buchada e sarapatel; **africana** — vatapá e acarajé; **indígena** — tapioca e farofa.'] },
      goal: 'Monte os três pratos e organize o quadro.', par: 220 },
    { id: 'c2s5', ch: 2, n: 5, title: 'Chefe: Sombra do Preconceito', engine: 'boss', theme: 'sombra', music: 'chefe', style: 'Batalha de chefe', boss: 'sombra',
      questions: ['GEO-C2-Q05', 'GEO-C2-Q06', 'GEO-C2-Q07', 'GEO-C2-Q08', 'GEO-C2-Q09'], node: { x: 420, y: 520 },
      intro: ['A **Sombra do Preconceito** tem cinco camadas. Ela não é vencida com força, mas com **empatia e respeito**.', 'Acerte as placas falsas e responda para transformar cada camada em luz.'],
      bossName: 'Sombra do Preconceito', bossLine: 'Diferente é esquisito! Hahaha!',
      goal: 'Transforme as cinco camadas em luz.', par: 260 },

    /* ---------------------------------------------------------------- CAPÍTULO 3 */
    { id: 'c3s1', ch: 3, n: 1, title: 'Do Litoral ao Interior', engine: 'race', theme: 'interior', music: 'corrida', style: 'Corrida com mapa animado',
      questions: ['GEO-C3-Q04', 'GEO-C3-Q05', 'GEO-C3-Q06'], node: { x: 540, y: 250 },
      intro: ['Nova corrida contra o GeoBot, do **litoral** ao **interior**! O mapa no alto mostra a ocupação acontecendo.'],
      cards: {},
      geobot: { start: ['Revanche! Desta vez eu vou pelo litoral e você pelo interior? Brincadeira, vamos juntos!'], win: ['Uau, você correu como uma estrada nova!'], lose: ['Ganhei por pouco! Mas o que importa é que você entendeu a ocupação do território.'] },
      goal: 'Chegue ao interior antes do GeoBot.', par: 120 },
    { id: 'c3s2', ch: 3, n: 2, title: 'Cidade em Transformação', engine: 'city', theme: 'cidade', music: 'cidade', style: 'Ação e construção',
      questions: ['GEO-C3-Q07', 'GEO-C3-Q08'], node: { x: 470, y: 400 },
      intro: ['A cidade cresceu **sem planejamento**. Colete os recursos e leve aos bairros: **moradia, saneamento, transporte e energia**.', 'Os moradores **não têm culpa**: a cidade não estava preparada para todos.'],
      cards: { segregar: ['**Segregar** significa **separar** ou **isolar**. **Serviços básicos são direitos**, mas nem todos conseguem pagar por eles.'] },
      goal: 'Restaure moradia, saneamento, transporte e energia.', par: 240 },
    { id: 'c3s3', ch: 3, n: 3, title: 'Energia para Todos', engine: 'maze', theme: 'energia', music: 'labirinto', style: 'Labirinto de rede elétrica',
      questions: ['GEO-C3-Q09', 'GEO-C3-Q10'], node: { x: 330, y: 360 },
      intro: ['Os **Vírus do Mapa** cortaram a rede. Leve energia às casas da periferia e conserte a **usina**!'],
      cards: { desig: ['O Brasil tem **grandes desigualdades** entre ricos e pobres. Há desigualdades de **gênero** e de **cor/raça**.'] },
      goal: 'Acenda as casas e ligue a usina.', par: 240 },
    { id: 'c3s4', ch: 3, n: 4, title: 'Torre da População', engine: 'tower', theme: 'torre', music: 'torre', style: 'Plataforma vertical',
      questions: ['GEO-C3-Q01', 'GEO-C3-Q11', 'GEO-C3-Q12'], node: { x: 420, y: 250 },
      intro: ['Cada andar desta Torre é um **ano da tabela**, de **1950 a 2022**. Suba e veja a população crescer!'],
      cards: {},
      goal: 'Suba até o topo da Torre.', par: 220 },
    { id: 'c3s5', ch: 3, n: 5, title: 'Territórios e Direitos', engine: 'topdown', theme: 'territorio', music: 'atlas', style: 'Mapa e demarcação',
      questions: ['GEO-C3-Q03', 'GEO-C3-Q13'], node: { x: 260, y: 220 },
      intro: ['O **crescimento urbano** e a **expansão agropecuária** avançaram sobre territórios. Vamos ler os mapas e ajudar a **proteger os direitos**.'],
      cards: { luta: ['**Indígenas, quilombolas e ribeirinhos** lutam pelo **direito à terra**. O **governo deve demarcar** os territórios.'] },
      goal: 'Leia os mapas e coloque os marcos de proteção.', par: 220 },
    { id: 'c3s6', ch: 3, n: 6, title: 'Chefe Final: Vírus da Desigualdade', engine: 'boss', theme: 'virus', music: 'chefe', style: 'Batalha final', boss: 'virus',
      questions: ['GEO-C3-Q02'], node: { x: 380, y: 480 },
      intro: ['O **Vírus da Desigualdade** espalhou informações falsas e desligou serviços.', 'Corrija as placas e restaure os **direitos** — juntos somos mais fortes!'],
      bossName: 'Vírus da Desigualdade', bossLine: 'Serviço básico é luxo! Hahaha!',
      goal: 'Restaure serviços e direitos.', par: 240 }
  ];
  D.stageById = {}; D.stages.forEach((s) => { D.stageById[s.id] = s; });

  /** Salas bônus (opcionais) liberadas por medalhas de ouro no capítulo. */
  D.bonus = [
    { id: 'b1', ch: 1, title: 'Corrida Relâmpago', engine: 'race', theme: 'estrada', music: 'corrida', style: 'Desafio opcional contra o GeoBot', need: 3, bonus: true, questions: [] },
    { id: 'b2', ch: 2, title: 'Ritmo Livre', engine: 'ritmolivre', theme: 'ritmos', music: null, style: 'Batalha de ritmo contra o GeoBot', need: 3, bonus: true, questions: [] },
    { id: 'b3', ch: 3, title: 'Labirinto Relâmpago', engine: 'maze', theme: 'energia', music: 'labirinto', style: 'Desafio opcional de labirinto', need: 3, bonus: true, questions: [] }
  ];
  D.bonus.forEach((b) => { D.stageById[b.id] = b; });

  D.story = {
    opening: ['Oi, Gabriel! Eu sou a **Gaia**, uma bússola digital. O **Atlas Vivo do Brasil** foi dividido em **três páginas** pela Névoa da Generalização.', 'Vamos recuperar os fragmentos **sem apagar as diferenças entre as pessoas**. Pronto?'],
    geobotHello: ['E aí, Gabriel! Sou o **GeoBot**, explorador também. Vou te desafiar em corridas e duelos — sempre no respeito!'],
    chapterDone: {
      1: ['Página 1 recuperada: **O Mosaico do Povo Brasileiro**! O mosaico voltou a ter todas as cores.'],
      2: ['Página 2 recuperada: **Culturas que se Encontram**! As festas, os ritmos e os sabores voltaram ao Atlas.'],
      3: ['Página 3 recuperada: **O Brasil que Muda**! Você reconstruiu o Atlas Vivo.']
    },
    final: ['Você reuniu as três páginas do **Atlas Vivo do Brasil**! Aprendeu sobre povos, culturas e as mudanças do país — sempre respeitando as diferenças.', 'Você é um **Guardião da Diversidade Brasileira**! A **Revisão da Prova** está liberada.']
  };
})();
