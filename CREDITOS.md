# Créditos e licenças

Todos os recursos externos foram baixados e ficam guardados dentro do projeto. O jogo funciona sem internet.

| Recurso | Onde é usado | Autor | Link | Licença | Arquivo de licença |
|---|---|---|---|---|---|
| Pixel Platformer (+ Farm e Food Expansion) | Fases de plataforma, torre, chefes e corrida (blocos, moedas, bandeiras, placas) | Kenney | https://kenney.nl/assets/pixel-platformer | CC0 1.0 (domínio público) | `src/assets/shared/licencas/Kenney-CC0.txt` |
| Pixel Shmup | Ilhas e itens da fase de nave | Kenney | https://kenney.nl/assets/pixel-shmup | CC0 1.0 | idem |
| Tiny Town | Atlas, exploração, cidade (grama, caminhos, árvores, casas) | Kenney | https://kenney.nl/assets/tiny-town | CC0 1.0 | idem |
| Tiny Dungeon | Reserva de sprites (paredes/itens) | Kenney | https://kenney.nl/assets/tiny-dungeon | CC0 1.0 | idem |
| RPG Urban Pack | Prédios/pessoas de referência na cidade | Kenney | https://kenney.nl/assets/rpg-urban-pack | CC0 1.0 | idem |
| Mapa do Brasil por estados (SVG) | Todos os mapas do módulo de Geografia | Victor Cazanave (`@svg-maps/brazil` 2.0.0) | https://www.npmjs.com/package/@svg-maps/brazil | CC BY 4.0 (atribuição obrigatória — feita aqui e no jogo) | `src/assets/shared/licencas/svg-maps-brazil-CC-BY-4.0.md` |
| Fluent Emoji 3D (230 ilustrações) + bandeiras de Portugal, Alemanha e Brasil (Kenney Flag Pack, CC0) + "rede de descanso" (desenho original) | Geografia: ícones do HUD e do Atlas, fases, cartões, Parque do Atlas (comidas, instrumentos, bichos, casas, medalhas) | Microsoft | https://github.com/microsoft/fluentui-emoji | MIT | `src/assets/shared/licencas/Fluent-Emoji-MIT.txt` |
| Background Elements Remastered, Particle Pack, Smoke Particles | Geografia: cenários em camadas (morros, montanhas, nuvens, árvores, casas, cactos), brilhos, estrelinhas e poeira | Kenney | https://kenney.nl/assets | CC0 1.0 | `src/assets/shared/licencas/Kenney-CC0.txt` |
| Texturas da Terra de dia e de noite | Geografia: fundo do Atlas com foto de satélite da América do Sul, "Brasil à noite" (página 3), globo girando, Quebra-cabeça | Solar System Scope (com dados da NASA) | https://www.solarsystemscope.com/textures/ | CC BY 4.0 (atribuição no jogo, no Parque → "Créditos das imagens") | `src/assets/shared/licencas/Solar-System-Scope-CC-BY-4.0.txt` |
| Fonte Press Start 2P | Títulos e textos de jogo | CodeMan38 / The Press Start 2P Project Authors | https://fontsource.org/fonts/press-start-2p | SIL Open Font License 1.1 | `src/assets/shared/licencas/OFL-press-start-2p.txt` |
| Fonte Nunito | Textos longos e perguntas | Vernon Adams e colaboradores | https://fontsource.org/fonts/nunito | SIL Open Font License 1.1 | `src/assets/shared/licencas/OFL-nunito.txt` |

Os arquivos de Kenney foram obtidos pelo espelho público `github.com/shorepine/kenney` (licença CC0 original preservada no arquivo acima).

## Criado especialmente para este projeto

- Personagens em pixel art desenhados por código: Gabriel, Gaia (bússola), GeoBot, pessoas diversas, Névoas da Confusão, Blocos do Erro, Sombras da Generalização, Robôs do Preconceito, Vírus do Mapa e os chefes (`src/core/pixel.js`).
- Mapas, plantas, tabelas, gráficos e ilustrações da Geografia (`src/modules/geografia/content/visuais.js`), incluindo a planta inspirada em Salvador (1631) e a cena inspirada em temas de Carybé (não é a obra original).
- Músicas chiptune e efeitos sonoros gerados na hora pelo navegador (`src/core/audio.js`).
- Versos de cordel do Caipora usados na fase 2-2.

As imagens novas de Geografia (setembro de 2026) foram baixadas do espelho público `github.com/shorepine/kenney`, do repositório `microsoft/fluentui-emoji` e das texturas do repositório `mrdoob/three.js`. Ficam em `src/modules/geografia/assets/` (ilustrações num único arquivo `ilustracoes/fluent3d.png` com o índice `fluent3d.js`).

Nenhuma imagem de busca aleatória, de bancos de imagem ou de jogos comerciais foi usada. Não há sprites, músicas, nomes ou fases de Mario, Sonic, Mega Man, Pac-Man ou outras franquias.

## Módulo de Ciências (versão 1.0)

O módulo de Ciências usa apenas desenhos e sons feitos por código no próprio projeto (ver `README.md` e `docs/ENTREGA.md`), sem alterações nesta atualização.

## Gabriel Nexus (jogo central)

| Recurso | Onde é usado | Origem | Observação |
|---|---|---|---|
| 21 Nexóticos (PNG transparentes) | Coleção, Parque, Loja, equipe, jogos recreativos | Fornecidos pelo responsável do projeto (pacote “Gabriel Nexus”) | Apenas redimensionados para 512 px (`src/modules/*/nexoticos/`); nomes e desenhos originais do projeto, sem cópia de franquias |
| Cenários 01–06 (arte principal, Praça, Parque, Fliperama, Casa, Entrada) | Hub, áreas e tela de entrada | Fornecidos pelo responsável do projeto | Convertidos para JPEG, sem deformar (`src/nexus/assets/cenarios/`) |
| Referência do Gabriel | Avatar no hub, HUD e jogos | Fornecida pelo responsável do projeto | Recortada e redimensionada (`src/nexus/assets/gabriel.png`) |
| Logo do Colégio Kodomo | Tela de entrada | Arquivo original fornecido | Usado **sem alteração** (mesmo arquivo, byte a byte): `src/assets/shared/kodomo/logo_colegio_kodomo.png` |
| Catálogo aprovado | Fonte de dados dos Nexóticos | Fornecido | `src/nexus/catalogo/catalogo_nexoticos.json` |
| Músicas “nexus”, “parque”, “fliperama”, “base” | Hub e áreas | Compostas para o projeto e sintetizadas no navegador | `src/nexus/core.js` |
| Melodias curtas de cada Nexótico | Fichas e comemorações | Criadas para o projeto | campo `sound` dos pacotes |

O mockup da Área dos Pais (07) foi usado só como referência visual; a interface é HTML acessível.

## Inglês — Gabriel e o Expresso dos Sonhos (24/09/2026)

As ilustrações ficam em `src/modules/ingles/assets/img/` (PNG de 128 px, salvos no projeto: nada é carregado da internet). Acesso em 24/09/2026.

- **Fluent Emoji 3D** — Microsoft, licença **MIT** (`src/assets/shared/licencas/Fluent-Emoji-MIT.txt`). Baixadas uma a uma do repositório oficial e reduzidas para 128 px, sem outras alterações. Cada figura ilustra uma palavra que está no `ingles.pdf` (ex.: `banco.png` → *bank*; `microscopio.png` → *biology*); o texto da questão continua sendo o do livro, e cada imagem tem texto alternativo.
- **`avental.png`** (*apron*, pág. 8) — desenho original feito para o projeto, porque não existe emoji de avental.
- Nenhuma foto, personagem protegido, marca ou arte de outro jogo. As imagens do livro (escaneadas) **não** foram copiadas para o jogo.
- Voz em inglês: leitura do próprio navegador (Web Speech), só com frases do livro; não é o áudio oficial do livro, que não está no projeto.

| Arquivo | Fluent Emoji | Origem |
|---|---|---|
| `aeroporto.png` | Airplane departure | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Airplane%20departure |
| `alambique.png` | Alembic | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Alembic |
| `atomo.png` | Atom symbol | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Atom%20symbol |
| `aviao.png` | Airplane | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Airplane |
| `bairro.png` | Houses | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Houses |
| `balao_fala.png` | Speech balloon | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Speech%20balloon |
| `banco.png` | Bank | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Bank |
| `bilhete.png` | Ticket | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Ticket |
| `bolhas.png` | Bubbles | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Bubbles |
| `cachorro.png` | Dog | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Dog |
| `carro_voador.png` | Flying saucer | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Flying%20saucer |
| `cart.png` | Racing car | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Racing%20car |
| `check.png` | Check mark button | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Check%20mark%20button |
| `cometa.png` | Comet | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Comet |
| `coracoes.png` | Two hearts | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Two%20hearts |
| `correio.png` | Post office | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Post%20office |
| `cozinheiro.png` | Cook | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Cook |
| `curativo.png` | Adhesive bandage | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Adhesive%20bandage |
| `dente.png` | Tooth | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Tooth |
| `enfermeira.png` | Woman health worker | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Woman%20health%20worker |
| `engenheiro.png` | Construction worker | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Construction%20worker |
| `entrevista.png` | Microphone | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Microphone |
| `escritorio.png` | Office building | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Office%20building |
| `estetoscopio.png` | Stethoscope | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Stethoscope |
| `estrela.png` | Glowing star | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Glowing%20star |
| `galaxia.png` | Milky way | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Milky%20way |
| `gaveta.png` | File cabinet | https://github.com/microsoft/fluentui-emoji/tree/main/assets/File%20cabinet |
| `guia.png` | Triangular flag | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Triangular%20flag |
| `lavanderia.png` | Basket | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Basket |
| `locomotiva.png` | Locomotive | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Locomotive |
| `lupa.png` | Magnifying glass tilted left | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Magnifying%20glass%20tilted%20left |
| `microscopio.png` | Microscope | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Microscope |
| `missao.png` | Bullseye | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Bullseye |
| `mulher.png` | Woman | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Woman |
| `musculo.png` | Flexed biceps | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Flexed%20biceps |
| `museu.png` | Classical building | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Classical%20building |
| `nervoso.png` | Anxious face with sweat | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Anxious%20face%20with%20sweat |
| `parque_aquatico.png` | Playground slide | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Playground%20slide |
| `passaro.png` | Bird | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Bird |
| `piloto.png` | Pilot | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Pilot |
| `policial.png` | Police officer | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Police%20officer |
| `profissional_saude.png` | Health worker | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Health%20worker |
| `relogio.png` | Hourglass done | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Hourglass%20done |
| `rua.png` | Motorway | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Motorway |
| `sonhos.png` | Thought balloon | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Thought%20balloon |
| `taxi.png` | Oncoming taxi | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Oncoming%20taxi |
| `trofeu.png` | Trophy | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Trophy |
| `tubo.png` | Test tube | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Test%20tube |
| `tv.png` | Television | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Television |
| `x.png` | Cross mark | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Cross%20mark |

**Arcade do Expresso (jogos bônus de Inglês):** usa, só para leitura, as mesmas imagens de Geografia já creditadas acima (Fluent Emoji MIT no atlas `fluent3d.png`, Kenney CC0 em cenários e efeitos). Os jogos são adaptações do código do próprio projeto.
