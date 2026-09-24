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
