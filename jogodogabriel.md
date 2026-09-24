# Jogo do Gabriel: mapa da franquia

Memória oficial e cumulativa do projeto. Leia inteira antes de planejar ou mudar qualquer coisa.
Estado conferido nos arquivos em 24/09/2026 (etapa **Gabriel Nexus** concluída).
Repositório: `mauricioweb007-collab/jogogabriel`, branch de trabalho `claude/adoring-galileo-w55t2f`.
Marcações: **[não confirmado]** indica algo não verificado; **[pendente]** indica algo não feito.

---

## 1. Visão da franquia e decisões permanentes

**Visão**
- Cada matéria é um **jogo próprio da franquia**, como os jogos diferentes de uma série.
- Cada jogo pode ter história, cenário, fases, atividades, mecânicas e identidade visual próprias.
- Um jogo novo **não precisa** continuar o enredo anterior nem repetir formatos de fase.
- Jogos anteriores são **referência** e fonte opcional de código, arte e soluções.
- Cada módulo novo busca uma experiência própria e sobe o nível de qualidade.
- **Gabriel Nexus** (seção 7) é o **jogo central permanente**: recebe pontos e desbloqueios das matérias e vira coleção, casa e diversão. Ele **não é matéria**: não tem questões escolares novas.

**Regras pedagógicas (permanentes)**
- Jogador: Gabriel, 9 anos, 4º ano do Ensino Fundamental.
- O conteúdo de cada matéria segue **só o material de estudo entregue para aquele módulo**, no nível do 4º ano.
- **Nunca** levar questões, conteúdos ou objetivos de uma matéria para outra automaticamente.
- Cada questão do material entregue precisa aparecer no jogo. Os módulos atuais cobrem 100%.
- Errar nunca pune; pergunta não tem cronômetro; toda questão tem explicação, pista e versão guiada.

**Regras de projeto (permanentes)**
- **Módulos antigos ficam congelados.** Só mudam com pedido expresso do usuário.
- **Ciências está congelada.** Não alterar arquivos, save, economia nem dificuldade. Na etapa Nexus, **nenhum arquivo de Ciências foi alterado**: a integração é feita por adaptador e páginas novas.
- Cada módulo tem save, moedas, loja, inventário e conquistas **isolados**, com chave própria no localStorage.
- HTML/CSS/JS puros, sem build, offline e abrindo o arquivo direto (`file://`) em Chrome, Edge ou Firefox.
- Não coleta dados pessoais. Não há compras reais, anúncios, assinatura nem loot box paga.
- Arte e música são originais, fornecidas pelo responsável ou de licença livre, registradas em `CREDITOS.md`.
- **Gabriel Nexus OCULTO para a criança (decisão do usuário, 24/09/2026):** `GG.FR.nexusVisible = false` em `src/franchise/config.js`. O lançador não mostra o cartão/toasts do Nexus e o resultado de fase de Geografia não mostra a linha do Nexus. Os pontos continuam sendo guardados em segundo plano, a Área dos Pais funciona e, no modo de teste dos pais, o Nexus aparece. Para reativar: mudar para `true`.
- **Um único save infantil por navegador.** O nome é só personalização: não existe conta, senha ou seleção de perfis para a criança.

**Regras de git (permanentes)**
- Só fazer push em `claude/adoring-galileo-w55t2f` do repositório `jogogabriel`.
- O repositório `diario` foi a "pasta errada": nada vai para ele.
- Não abrir PR sem pedido. Não citar identificador de modelo em commits nem arquivos.
- **Nunca** gravar a senha dos pais em texto puro no repositório.
- **Link para jogar:** sempre atualizar o MESMO artifact (https://claude.ai/artifact/5G4dYdvU9XW6oNCWXvPV7i), aberto a quem tem o link — decisão do usuário. Publicar com `inicio.html` como página, todos os arquivos de jogo (sem testes/ferramentas) e `ciencias.html` = cópia de `index.html` (o artifact não aceita o caminho `index.html`).

---

## 2. Módulos existentes

| Módulo | Proposta | Estado | Entrada e arquivos principais |
|---|---|---|---|
| **Ciências: Missão EcoNexus** (v1.0) | Aventura 2D em vista de cima com a guia Lumi, vila hub, 6 regiões e Arena. **43 questões** (L1-Q1 … L6-Q7). 7 minijogos. | Concluído e **congelado**. | `index.html`, `css/`, `js/`, `tools/`, `docs/ENTREGA.md`, `README.md`. Save `econexus_guardioes_save_v1`. Adaptador (não é arquivo de Ciências): `src/modules/ciencias-legacy-adapter/`. |
| **Geografia: Brasil em Movimento** (`geografia_2026_09`) | Gaia e o rival GeoBot. 3 capítulos, **16 fases** de estilos diferentes e 3 salas bônus. **45 questões**. | Concluído. Congelado exceto os ganchos mínimos do Nexus (seção 7.2). | `src/modules/geografia/jogar.html`, `main.js` (`GEO.app`), `content/`, `questions/`, `systems/`, `scenes/`, `ENTREGA-GEOGRAFIA.md`. Save `ecoNexus.geografia.v1`. |
| **Gabriel Nexus** (jogo central) | Hub 2.5D na Praça dos Mundos, 21 Nexóticos, Parque, Fliperama, Galeria, Oficina, Casa, Loja e Terminal dos Pais. | Concluído (seção 7). | `src/nexus/nexus.html`, serviços em `src/franchise/`, Área dos Pais em `src/pais/pais.html`. Perfil `ecoNexus.franchise.v1`. |
| **Matemática** | — | **[pendente] O jogo NÃO existe.** Só há o mundo "em breve" com o pacote do Gato Gráfico. | `src/modules/matematica/manifest.js` (`enabled:false`, `comingSoon`), `nexoticos.js`. |
| Exemplo vazio | Registro mínimo (`enabled:false`); cartão "Novas missões chegarão". | Modelo. | `src/modules/exemplo-vazio/manifest.js` |
| Inglês e outras | — | **[pendente]** Nenhum material entregue. | — |

**Fases de Geografia** (`content/capitulos.js`)

| Capítulo | Fases e estilos |
|---|---|
| 1. O Mosaico do Povo Brasileiro | Festival da Diversidade (platform), Mapa dos Povos Originários (topdown), Rotas pelo Atlântico (shmup), Caminhos da Imigração (race), Chefe Generalizador (boss) |
| 2. Culturas que se Encontram | Labirinto das Culturas (maze), Cordel em Movimento (platform/xilogravura), Ritmos do Brasil (rhythm), Cozinha dos Povos (kitchen), Chefe Sombra do Preconceito (boss) |
| 3. O Brasil que Muda | Do Litoral ao Interior (race), Cidade em Transformação (city), Energia para Todos (maze), Torre da População (tower), Territórios e Direitos (topdown), Chefe Final Vírus da Desigualdade (boss) |
| Bônus (sem questões) | b1 Corrida Relâmpago, b2 Ritmo Livre, b3 Labirinto Relâmpago |

**Entrada e lançador**
- `inicio.html`: tela de entrada (**só o nome**, sobre o cenário `06_cenario_login` e o logo **original** do Colégio Kodomo). Depois vem "Qual missão você quer jogar?", com o cartão do Nexus e um cartão por matéria.
- O nome fica em `sessionStorage['ecoNexus.entrou']` durante a aba, para não pedir de novo.
- **Prompts originais** não estão no repositório. O do Nexus veio num pacote zip (prompt, catálogo, personagens e cenários); os assets usados estão no repo.

---

## 3. Estrutura técnica, como rodar e testar

```
index.html                  Ciências (congelado) · inicio.html = entrada + lançador
css/ js/ tools/ docs/       Ciências (congelado)
src/core/                   plataforma (GG): util, storage, input, audio (+addSong/jingle), engine, pixel
src/ui/                     ui.js (modal, say, toast, gate, ajustes, acessibilidade), maps.js, ui.css, quiz.css
src/systems/quiz.js         motor de questões reutilizável
src/launcher/               launcher.js (entrada + central), launcher.css
src/franchise/              serviços da franquia (seção 7.3) + franchise.css
src/nexus/                  Gabriel Nexus (seção 7) — assets/, data/itens.js, catalogo/
src/pais/                   Área dos Pais (pais.html, pais.js, pais.css)
src/modules/                registry.js, modulos.js, um diretório por matéria (manifest + nexoticos)
src/tools/nexus-senha.cjs   gera o hash da senha dos pais
src/tests/                  regressão de Ciências, testes do Nexus, tabela de Geografia
```

**Namespaces:** `EN` Ciências · `GG` plataforma e franquia · `GEO` Geografia · `NX` Gabriel Nexus.

**Motor:** canvas lógico 400x225 pixel-perfect, 60 Hz, pausa com `GG.ui.blocking()`. O Nexus usa um desenho próprio em alta resolução (DOM e canvas), não o motor pixel. `GG.store` recusa gravar a chave de Ciências.

**Rodar:** abrir `inicio.html`. Online, o lançador usa `ciencias.html` se existir (cópia só no artifact publicado). Artifact publicado: **v5 (24/09/2026), já com o Nexus**, em https://claude.ai/artifact/5G4dYdvU9XW6oNCWXvPV7i.

**Testes** (Node 18+ e Playwright; aqui: `/opt/node22/lib/node_modules/playwright`, Chromium em `/opt/pw-browsers`; use `NODE_PATH=/opt/node22/lib/node_modules`). A senha vem da variável de ambiente, nunca do repositório:

```
node src/tests/ciencias-regressao.cjs                          # Ciências: 32 arquivos por sha256, audit, 74 checagens, save byte a byte
PARENT_ACCESS_PASSWORD=… node src/tests/nexus-unit.cjs         # 467 checagens sem navegador (ponte, livro-razão, migração, catálogo, loja, cápsula, senha, sandbox)
PARENT_ACCESS_PASSWORD=… node src/tests/nexus-e2e.cjs          # 43 checagens no navegador (entrada, Nexus, Fliperama, loja, Área dos Pais, sandbox, regressão, desempenho)
node src/modules/geografia/tests/features.cjs                  # Geografia: 45 questões, acessibilidade, loja, painel, isolamento
node src/modules/geografia/tests/e2e.cjs otimo|erros|rapido    # campanha inteira
node src/modules/geografia/tests/layouts.cjs <pasta>           # 1366x768, 1920x1080, 390x844
node src/tests/gen-tabela-geografia.cjs                        # tabela das 45 questões
```

**Últimos resultados (24/09/2026):**
- Regressão de Ciências: 32/32 arquivos idênticos, audit limpo, 74 checagens ✓, save idêntico.
- `nexus-unit` 467/467 e `nexus-e2e` 43/43.
- Geografia: `features` ✓; e2e nos 3 perfis com 45/45 questões, 16/16 fases, final e troféu, 0 erro; `layouts` OK nas 3 resoluções.

**Lições de ambiente:** `pkill -f` mata o próprio shell (use PID). Não passe testes longos por `| tail` (a saída fica presa); grave em log.

---

## 4. Recursos reutilizáveis (todos **opcionais**)

| Recurso | Onde está | Observação |
|---|---|---|
| Motor 2D, entrada (teclado remapeável, toque, gamepad), pixel art | `src/core/engine.js`, `input.js`, `pixel.js` | Sprites originais. |
| Áudio chiptune e voz pt-BR | `src/core/audio.js` | `addSong(nome, def)` e `jingle(notas)` acrescentados para o Nexus. |
| Janelas, diálogos, toasts, ajustes, acessibilidade | `src/ui/ui.js`, `ui.css` | `UI.settings` já traz volumes separados, texto grande, contraste, movimento reduzido e teclas. |
| Motor de questões | `src/systems/quiz.js` | Tipos mc, multi, open, classify, order, syllables, mappick, builder, personal, steps, fill. |
| Mapa do Brasil | `src/ui/maps.js`, `src/assets/shared/brasil-mapa.js` | CC BY 4.0. |
| Cenas de fase (10 estilos) | `src/modules/geografia/scenes/` | Presas ao `GEO`; copie e adapte. |
| Serviços da franquia | `src/franchise/*` | Obrigatórios só para integrar um módulo ao Nexus (contrato 7.4). |
| Jogos recreativos com poderes | `src/nexus/games.js` | Modelo de jogo canvas com teclado, toque e pausa. |
| Testes modelo | `src/modules/geografia/tests/`, `src/tests/nexus-*.cjs` | Copie e adapte. |

---

## 5. Decisões que valem só para o módulo em que foram tomadas

- **Ciências:** guia Lumi; vila com 6 regiões e arena; 3 folhas de energia; XP, EcoMoedas e loja de 58 itens; caderno com 24 fichas; área do responsável com conta de multiplicação.
- **Geografia:** Gaia e GeoBot (falas de até 3 balões); tema "Atlas Vivo"; 16 fases arcade e 3 chefes; modo estudo rápido; a cena de Carybé é ilustração original.
- **Gabriel Nexus:** narrador Micróbio Miojo; hub na arte da Praça dos Mundos; áreas liberadas por Nível do Nexus; Moedas Nexus separadas das moedas de cada matéria; Cristais de Decoração só da coleta e das expedições.
- **Próximo módulo:** tudo em aberto (história, guia, mecânicas, visual), conforme o material entregue.

---

## 6. Feito, em andamento, problemas conhecidos e próximos passos

**Feito**
- Ciências v1.0 (43 questões).
- Plataforma v2 (lançador, registro, core, motor de questões).
- Geografia (45 questões, 16 fases).
- **Gabriel Nexus completo** (seção 7): entrada pelo nome, perfil global, ponte de pontuação, 21 Nexóticos, hub e 8 áreas, 4 jogos recreativos, Fliperama com replays das matérias e torneios, Área dos Pais com sandbox.
- Documentos atualizados: `COMECE-AQUI.md`, `COMO-ADICIONAR-MATERIA.md`, `CREDITOS.md`.

**Em andamento:** nada.

**Problemas conhecidos e limitações**
- **Sem teste com uma pessoa real.** Só testes automáticos. **[não confirmado]** ritmo, dificuldade, preços e textos na prática.
- **Senha dos pais no navegador = barreira familiar**, não segurança forte (o projeto é estático, sem servidor).
- O modo de teste vive no `sessionStorage` **da aba**: abrir outra aba não carrega o modo de teste.
- **Ciências não mostra o resumo de Moedas Nexus ao concluir missão**, porque isso exigiria mudar arquivos congelados. As moedas aparecem no lançador e no Nexus, que sincronizam ao abrir. Ciências também não ganhou botão de voltar ao Nexus (usa-se o voltar do navegador).
- **Bug antigo em Geografia** (`systems/save.js`, `SV.load`): um save sem alguma questão (por exemplo, se uma versão futura acrescentar questões) quebra ao carregar, porque `base.q` já foi sobrescrito por `Object.assign`. Não afeta saves reais atuais. Não foi corrigido por estar fora do escopo autorizado **[pendente se houver nova versão de Geografia]**.
- No modo de teste, o inspetor de questões **responde de verdade** só as questões de Geografia (via `jogar.html?teste=1&questao=…`). As de Ciências são inspecionadas e simuladas; no jogo, abre-se a região certa com o preset "tudo concluído" (a revisão de Ciências também fica disponível).
- Um torneio com replays das matérias sai do Nexus e volta a cada jogo (a partida fica salva no perfil).
- O hub mede cerca de 33 quadros/s no Chromium sem GPU dos testes; **[não confirmado]** em celulares reais.
- Itens herdados: voz (TTS) depende do aparelho; celular em pé fica pequeno nas fases de ação; mapas esquemáticos; estudo rápido rende um pouco mais de moedas que a Aventura em Geografia; recordes contra o GeoBot aparecem como 0:00 nos testes **[não confirmado no jogo real]**; a lista `files` do manifesto de Geografia é informativa (os scripts ficam fixos no `jogar.html`); o `README.md` de Ciências cita caminhos `econexus/…`.
- A branch `main` só tem o "Initial commit". Não há GitHub Pages.

**Próximos passos (só quando o usuário pedir)**
1. Jogo de **Matemática** com o material da prova. Depois, preencher o manifesto (7.4) e criar o pacote `matematica-v2` com os outros Nexóticos.
2. Outras matérias pelo mesmo contrato.
3. PR para `main`; GitHub Pages (só com pedido).

---

## 7. Gabriel Nexus — O Mundo dos Nexóticos

### 7.1 Objetivo e funcionamento
- Jogo central da franquia. Cada estudo nas matérias gera **energia** (Pontuação de Carreira) e **Moedas Nexus**. Com elas, o Nexus cresce, chegam Nexóticos, a casa é decorada e o Fliperama enche.
- O Nexus **não** tem questões novas, **não** altera questões e **não** é obrigatório para avançar nas matérias.
- **Fluxo:** `inicio.html` (nome) → lançador → `src/nexus/nexus.html`.
  - Na 1ª visita há história com o narrador Micróbio Miojo, o resumo "Suas aventuras anteriores trouxeram X pontos e Y moedas" (lido das marcas de migração) e o presente de boas-vindas: um Nexótico Comum ainda não conquistado, ou 10 fragmentos.
- **Hub 2.5D** na arte `02_cenario_praca_dos_mundos` (sem esticar: escala "cover" com arraste). O código fica em `src/nexus/hub.js`.
  - Os portais desenhados viraram portais reais: Ciências (folha), Geografia (globo), Matemática (cubos, em breve) e Mundos futuros (espiral).
  - Lugares: Coração do Nexus (fonte), Parque, Fliperama, Casa, Loja, Oficina, Galeria e Terminal dos Pais.
  - Gabriel usa a arte de referência e anda por uma rede de caminhos com escala por profundidade. A equipe o segue.
  - Acesso rápido: barra de áreas (teclas 1–9), mapa rápido (M) e equipe (T).
  - Crescimento visual: saturação e faíscas aumentam com o nível; áreas "despertam" por nível.
- **Áreas:** o código fica em `src/nexus/areas.js` e, para o Fliperama, em `arcade.js`.

  | Área | Nível | Arte | O que tem |
  |---|---|---|---|
  | Coração | 1 | — | Nível, energia por mundo, o que desperta em cada nível, história |
  | Parque | 1 | 03 | Nexóticos passeando; fala e ficha ao tocar; escolher quem aparece; expedições; 6 cenas desbloqueáveis entre pares |
  | Galeria | 1 | — | Carreira, mundos, missões e chefes, coleção por raridade, medalhas; **nenhuma resposta escolar** |
  | Casa | 1 | 05 | Decorações arrastáveis, modelos prontos grátis, troféus reais das matérias, equipe passeando |
  | Loja | 1 | — | Nexóticos, cápsula, fragmentos, roupas, efeitos, decoração, extras; "Provar" antes de comprar; confirmação a partir de 100 moedas |
  | Terminal | 1 | — | Link para a Área dos Pais e configurações |
  | Oficina | 2 | — | Avatar e efeitos, equipe de 3, acessórios de Nexótico, criar decorações com 💎 |
  | Fliperama | 2 | 04 | Seção 7.6 |

- **Níveis do Nexus** (`GG.FR.nexusLevels`): 0, 300, 900, 1800, 3000, 4500, 6500, 9000, 12000 e 15500 pontos de carreira.
- **Acessibilidade:** teclado, mouse e toque; textos grandes; raridade com ícone, nome e moldura além da cor; volumes separados (música, efeitos, voz); movimento reduzido; legendas de sons (`NX.caption`); texto alternativo nos Nexóticos. As preferências ficam no perfil. Não há música antes de uma interação.
- **Retenção saudável:** aviso gentil de pausa após 15 min (sem bloquear); sem punição por ausência, sequências, contagem regressiva ou ofertas urgentes; sem chat nem ranking online.

### 7.2 Arquivos criados e alterados
**Criados**
- `src/franchise/`:
  - `config.js`: todas as regras numéricas.
  - `sha256.js`, `store.js`: gravação segura, com `GG.errlog`.
  - `parent-auth.js`: senha, sessão e modo de teste.
  - `profile.js`, `catalog.js`, `modules.js`, `bridge.js`, `replay.js`, `franchise.css`.
- `src/nexus/`:
  - Páginas e código: `nexus.html`, `nexus.css`, `core.js`, `hub.js`, `areas.js`, `arcade.js`, `games.js`, `main.js`, `economy.js`, `data/itens.js`.
  - Assets: `assets/cenarios/01–06*.jpg`, `assets/gabriel.png`, `catalogo/catalogo_nexoticos.json` (fonte aprovada).
- `src/pais/`: `pais.html`, `pais.js`, `pais.css`.
- Módulos:
  - `src/modules/ciencias-legacy-adapter/`: `nexoticos.js`, `nexoticos/*.png`, `shim.js`, `replay.html`, `teste.html`.
  - `src/modules/geografia/`: `nexoticos.js`, `nexoticos/*.png`, `systems/mode.js`.
  - `src/modules/matematica/`: `manifest.js`, `nexoticos.js`, `nexoticos/21_gato_grafico.png`.
- Outros:
  - `src/assets/shared/kodomo/logo_colegio_kodomo.png` (idêntico ao original).
  - `src/tools/nexus-senha.cjs`.
  - `src/tests/nexus-unit.cjs`, `nexus-e2e.cjs`.
  - `jogodogabriel.md`.

**Alterados**
- `inicio.html`, `src/launcher/launcher.js`, `launcher.css`: entrada pelo nome e cartão do Nexus.
- `src/core/audio.js`: `addSong`, `songs`, `jingle` (só acréscimos).
- `src/modules/modulos.js`: linha da Matemática.
- `src/modules/ciencias-legacy-adapter/manifest.js`: bloco `franchise`. Não é arquivo de Ciências.
- Geografia, com os ganchos mínimos autorizados:
  - `manifest.js`: bloco `franchise`.
  - `jogar.html`: scripts da franquia e `mode.js`.
  - `systems/save.js`: `SV.KEY` vem do modo.
  - `systems/campaign.js`: `unlocked()` libera tudo em replay e teste.
  - `main.js`: `replayStart`, `testStart`, `testQuestion`; `toLauncher` volta ao Fliperama no replay.
  - `scenes/stage.js`: linha "🌀 Gabriel Nexus" no resultado, `replayResults`, e sair do replay volta ao Nexus.
  - História, questões, dificuldade, mapas e economia não mudaram.
- Testes de Geografia e regressão (`features.cjs`, `layouts.cjs`, `ciencias-regressao.cjs`): passam pela tela de nome.
- Docs: `COMECE-AQUI.md`, `COMO-ADICIONAR-MATERIA.md`, `CREDITOS.md`.
- **Ciências: nenhum arquivo** (confirmado pelo hash dos 32 arquivos).

### 7.3 Arquitetura: perfil global e ponte de pontuação
**Perfil (`GG.profile`, chave `ecoNexus.franchise.v1`)**
- Um por navegador.
- Campos principais:
  - Identidade: `schemaVersion`, `profileId`, `displayNameUppercase`.
  - Pontos e moedas: `careerPoints`, `nexusCoins`, `conversionRemainder`, `coinsEarnedTotal`, `coinsSpentTotal`, `nexusLevel`.
  - Livros-razão: `moduleSummaries`, `scoreLedger` + `appliedEvents`, `transactionLedger` + `appliedTxns`.
  - Conquistas e coleção: `unlockedMinigames`, `collectibles`, `fragments`, `materials`.
  - Personalização: `inventory`, `equipped`, `team`, `companion`, `parkVisible`, `decorations`, `charAcc`.
  - Outros: `arcade`, `hub`, `migrationMarkers`, `settings`, `seen`, `time`.
- O nome é normalizado com NFC, espaços aparados e reduzidos e `toLocaleUpperCase('pt-BR')` (JOÃO continua JOÃO). Trocar o nome **não** cria outro perfil.
- A senha dos pais **não** fica no perfil.

**Gravação segura (`GG.fstore`)**
- Grava primeiro em `<chave>.tmp` e confere a leitura.
- Guarda a versão anterior em `<chave>.bak`, depois grava a chave principal.
- Na leitura, se a principal estiver corrompida, recupera de `.bak` e depois de `.tmp`.

**Migrações de schema:** `GG.profile.migrations[n]` guarda um backup `<chave>.pre-vN` antes de cada passo. Hoje o schema está em 1 e só completa campos novos com valores padrão.

**Ponte (`GG.bridge`)**
- Evento no formato `{schemaVersion:1, eventId, moduleId, profileId, sourceType: mission|question|boss|achievement, sourceId, runId, scoreEarned (inteiro 0–2000), occurredAt, testMode}`.
- Validação: um módulo não registrado, um `profileId` diferente ou um valor não inteiro são **recusados**. `testMode:true` é recusado no perfil real, e evento real é recusado no sandbox.
- É **idempotente**: o mesmo `eventId` nunca soma duas vezes.
- Conversão: `nexusCoins += floor((resto + pontos) / 10)`, e o resto fica em `conversionRemainder`.
- `spend` nunca deixa saldo negativo e é idempotente por `txnId`. `credit` só funciona no sandbox.
- `audit(p)` recalcula tudo a partir dos livros-razão.
- Fila local `ecoNexus.franchise.outbox.v1` (`GG.bridge.submit`) para jogos futuros que prefiram enviar eventos.
- `sync()` lê os saves pelos adaptadores, aplica os eventos, processa a fila, libera minigames e Nexóticos automáticos e grava.
- Quem chama `sync()`: o lançador, o Nexus e o resultado de fase de Geografia.

**Pontos por conquista (`GG.FR.points`)**

| Conquista | Pontos |
|---|---|
| Questão concluída | 40 |
| Bônus: questão sem versão guiada | +30 |
| Bônus: questão correta de primeira | +30 |
| Missão ou fase | 200 |
| Chefe ou arena | 500 |
| Capítulo | 150 |
| História ou campanha completa | 300 |

- Os `eventId`s são estáveis, no formato `ciencias:question:L1-Q1:primeira`. Por isso, melhorar o desempenho depois soma só a parte que faltava, e reiniciar a matéria **não** soma de novo.
- Uma matéria completa rende por volta de 6.300 pontos em Ciências e 9.350 em Geografia.

**Replay:** o resultado vai para a caixa `ecoNexus.nexus.inbox.v1` (`GG.replay`). Só vale recorde e medalha, **nunca** pontos de estudo.

### 7.4 Contrato para matérias futuras (bloco `franchise` no manifesto)
- **Identificação e entrada:** `moduleId` (único, também é o prefixo dos Nexóticos), `title`, `version` ('1.0.0'), `color`, `icon`, `world`, `entryRoute`, `saveNamespace` (chave real; o sandbox é derivado dela).
- **Funções de leitura do save:**
  - `scoreAdapter(save)` → lista de `{sourceType, sourceId, variant?, scoreEarned, occurredAt}`. Precisa ser estável e sem duplicar.
  - `stats(save)` → `{percent, questionsDone, questionsTotal, firstTry, missionsDone, missionsTotal, bossesDone, bossesTotal, worldDone, lastPlace, timeSec}`.
  - `unlockedMinigames(save)` → ids.
- **Metadados:**
  - `minigames`: lista com `minigameId, title, description, genre, controls, icon, entry{type:'page', url, params}, unlockText, freePlay, parentTest, records, assets, deps`.
  - `collectiblePacks`: caminhos dos pacotes.
- **Área dos Pais:** `questionBank: {scripts, prepare(), build() → [{id, module, group, title, prompt, type, concept, where, answer, model, why, err, hint1, hint2, spec, guided, raw}], statsFor(save,id), concepts(save)}`.
- **Modo de teste:** `testEntry(opts)` → URL do jogo em sandbox; `testTargets` → fases para ir direto.
- O Nexus, a Galeria, os portais, o Fliperama e a Área dos Pais leem tudo pelo registro. **Não há `if` por matéria no núcleo.**
- Um módulo sem jogo (como Matemática) pode registrar só `comingSoon` e o pacote.

### 7.5 Moedas e regras econômicas
- Taxa central: `GG.FR.pointsPerCoin = 10`. Todos os valores são inteiros.
- Moedas Nexus vêm **só** de pontos de estudo. O Fliperama não gera moedas.
- Loja (`src/nexus/data/itens.js`):
  - 50 itens entre roupas (chapéu, rosto, costas), molduras, títulos, rastros, efeitos de entrada e vitória, paletas do hub, trilhas, decorações pequenas e grandes, acessórios de Nexótico, 3 modelos de base grátis e pacote de 10 fragmentos (50).
  - Preços de 15 a 220 moedas.
- Nexóticos à venda: Comum 40, Raro 100, Épico 180, Mítico 300, Lendário 450 moedas.
- Fragmentos para troca (`GG.FR.rarities`): Comum 12, Raro 25, Épico 45, Mítico 70. Lendários não são trocados.
- **Cápsula-surpresa** (30 moedas):
  - 60% de chance de sair um Nexótico e 40% de sair 6 fragmentos.
  - O sorteio só inclui Nexóticos marcados com `capsule` no pacote (hoje, os 13 Comuns, Raros e Épicos), com pesos Comum 50, Raro 30, Épico 15.
  - Repetido vira fragmentos (3, 5, 8, 12 ou 20, conforme a raridade).
  - A cada 3 cápsulas sem novidade, a próxima garante um Nexótico novo.
  - O resultado é determinístico pelo `txnId`, então recarregar não muda nada. As regras ficam sempre visíveis.
- **Cristais de Decoração 💎** vêm da coleta no hub (5 por dia, +1 com o Mochilango) e de expedições de 45 s (até 6 por dia). Só servem para criar decorações na Oficina.
- **Fliperama:** recordes 0–100 e medalhas bronze/prata/ouro (40, 65, 85). Recompensas cosméticas únicas aos 3, 8, 15 e 20 medalhas, mais a Taça do Torneio.
- Toda compra pede um `txnId` e fica registrada. Recarregar não repete nem desfaz. Não existe dívida nem perda aleatória.

### 7.6 Catálogo e raridades
- Fonte aprovada: `src/nexus/catalogo/catalogo_nexoticos.json`. Os pacotes JS trazem a ficha completa: visual, personalidade, animações ociosa e de comemoração, som, desbloqueio, poder com parâmetros, asset e texto alternativo.
- O teste de unidade confere cada personagem contra o JSON.
- **IDs e assets imutáveis.** O catálogo só cresce (novo pacote versionado, sem editar os anteriores).
- Raridades: Comum ● prata · Raro ◆ azul · Épico ⬟ roxa · Mítico ✦ magenta · Lendário ♛ dourada, com brilho especial.

**Ciências** (`ciencias-v1`)

| Nexótico | Raridade | Poder | Como conseguir sem comprar |
|---|---|---|---|
| Micróbio Miojo | Comum | combo +2 s | 1 questão |
| Capivara Tubinho | Comum | bolha protetora | 5 questões |
| Queijossauro | Raro | lupa (destaque) | 1 cristal |
| Folhinha Foguete | Raro | +15% velocidade | 15 questões |
| Bactéria Batucada | Épico | ímã de coleta | 15 de primeira |
| Macaco Microscópio | Épico | superzoom | 3 cristais |
| Onça Oxigênio | Mítico | salto extra | vencer a Arena |
| Vulcão Gelatina | Mítico | +35% no impulso da gelatina | 6 cristais |
| Dragão DNA | Lendário | fantasma do recorde | 43/43 questões |
| Astro Axolote | Lendário | desacelera obstáculos | 8 Nexóticos de Ciências |

**Geografia** (`geografia-v1`)

| Nexótico | Raridade | Poder | Como conseguir sem comprar |
|---|---|---|---|
| Mochilango | Comum | +1 na bolsa de coleta | 1 questão |
| Bússola Biscoito | Comum | bússola no hub | 5 questões |
| Capimapa | Raro | rota no hub | 2 fases |
| Tucano Trânsito | Raro | contagem mais curta | 15 questões |
| Crocodilo Cartógrafo | Épico | marcador no mapa | 15 de primeira |
| Montanha Patins | Épico | +30% de aceleração | 8 fases |
| Globo Gorilão | Mítico | mover decorações grandes | 2 chefes |
| Rio Robozão | Mítico | dash na água | 16 fases |
| Atlas Alado | Lendário | voo direto | 45/45 questões |
| Tempestade Totem | Lendário | clima e paleta do hub | 8 Nexóticos de Geografia |

**Matemática** (`matematica-v1`)

| Nexótico | Raridade | Poder | Como conseguir sem comprar |
|---|---|---|---|
| Gato Gráfico | Comum | barra de combo clara com comemoração | Nível 2 do Nexus (ainda não há jogo) |

**Formas de conseguir:**
- Conquista automática.
- Loja: todos têm preço, então sempre há caminho garantido.
- Fragmentos, exceto Lendários.
- Cápsula: só Comuns, Raros e Épicos (Míticos e Lendários nunca saem).

**Poderes:**
- São declarativos (`power.type` + `params`), validados por `GG.catalog.POWER_TYPES`, e somados só da **equipe** (até 3) por `GG.powers`.
- Só valem no Nexus e nos jogos recreativos. Nos replays das matérias não mudam nada.
- **Nunca** revelam respostas.
- Se um asset faltar, aparece uma silhueta com as iniciais.

### 7.7 Minigames e desbloqueio
- **Ciências:** 7 minijogos reais (`js/systems/minigames.js`); o Jardim é um painel, não entra.
  - Liberação: jogado em Ciências (`save.mg[id].plays>0`) ou cristal da região restaurado. O Relâmpago precisa ter sido jogado.
  - Replay em `ciencias-legacy-adapter/replay.html?mg=…&token=…`. O `shim.js` redireciona o save para `ecoNexus.replay.ciencias.v1`. O minijogo roda sem alteração e o resultado vem de `minigameReward(score)`.
- **Geografia:** 16 fases e 3 bônus.
  - Liberação: fase concluída; bônus liberado.
  - Replay em `jogar.html?replay=<fase>&token=…`, com save temporário `ecoNexus.replay.geografia.v1`. O resultado é o aproveitamento.
- **Nexus:** Corrida Nexótica (nível 1), Chuva de Estrelas (2), Pula-Gelatina (3), Rali das Montanhas (4), em `games.js`.
- Metadados completos ficam no manifesto ou em `GG.unlocks.registerNative`. A liberação é permanente (`profile.unlockedMinigames`).
- Fliperama: filtros por matéria, gênero e favoritos; treino livre; recordes; medalhas.
- Torneio relâmpago: 3 a 5 jogos alternando mundos contra 3 pilotos fictícios do computador (pontuação determinística). Não há ranking online.
- No modo de teste, todos aparecem.

### 7.8 Área dos Pais e segurança
- Acesso: `src/pais/pais.html`, por botões discretos na entrada, no lançador, no Terminal do Nexus e nas configurações. Pede **só a senha**.
- A senha foi definida no prompt do Nexus e **não está no repositório**. Em `src/franchise/parent-auth.js` ficam só `SALT`, `ITER` (12000) e `HASH` (SHA-256 iterado).
- **Trocar a senha:** rode `PARENT_ACCESS_PASSWORD='nova' node src/tools/nexus-senha.cjs` e cole as 3 linhas impressas em `parent-auth.js`. Nos testes, a senha vem da variável de ambiente.
- 5 erros seguidos travam a entrada por 30 s.
- A sessão fica em `sessionStorage` e expira por inatividade (5, 10, 15 ou 30 min; padrão 10), com botão de sair.
- É uma **barreira familiar**; sem servidor, não há segurança forte.
- Seções do painel, todas lendo **só** os saves reais:
  - Visão geral: progresso, versões, sincronização, integridade e migrações.
  - Matérias e questões: tentativas, erros, pistas, guiada, de primeira, conceitos dominados ou a revisar, gabarito e critérios.
  - Pontos e moedas: livros-razão.
  - Coleção e itens; Minigames.
  - Dados locais: todas as chaves, visualizar e baixar.
  - Backup: exportar, restaurar, apagar.
  - Erros técnicos (`ecoNexus.erros.v1`) e Configurações.
- **Modo de teste:** faixa permanente "MODO DE TESTE DOS PAIS".
  - O sandbox usa as chaves `ecoNexus.teste.<chave real>` e tem tudo liberado.
  - Atalhos para o Nexus (hub, Fliperama, Loja, Parque, Casa, Oficina, Galeria), Ciências (jogo novo, tudo concluído, região direta), Geografia (atlas, fase direta, questão direta) e todos os minigames.
  - Inspetor de questões com anterior/próxima, gabarito, critérios, metadados, simulação de acerto, erro, pista e conclusão, e estados bloqueado/liberado/concluído/dominado.
  - Pontos e saldo simulados só com `testMode:true`; alternar "tudo liberado" e "como aluno"; rever as boas-vindas.
  - Teste de teclado, toque, áudio e acessibilidade.
  - Botão para reiniciar só o sandbox.
  - Ao sair, o perfil real continua idêntico byte a byte (testado).
- **Operações sensíveis:**
  - Backup, restauração e exclusão pedem a senha de novo e a digitação do alvo ("RESTAURAR" ou "APAGAR NEXUS/CIENCIAS/…").
  - Antes de restaurar ou apagar, uma cópia fica em `ecoNexus.backup.antes-restauracao` ou `ecoNexus.backup.antes-exclusao`.
  - Não existe botão único de "apagar tudo".

### 7.9 Migrações realizadas
- **Não há migração destrutiva.** Os saves de Ciências e Geografia são **só lidos**.
- Na 1ª sincronização (no lançador ou no Nexus), cada módulo importa uma vez **cada conquista como evento próprio**. Fica registrada a marca `migrationMarkers['<moduleId>@<versão>'] = {at, source, events, points, coins}`.
- Não foi preciso registrar uma entrada única com o total, porque os saves permitem identificar cada conquista.
- A chave antiga `ecoNexus.launcher.v1` segue igual.
- O nome é sugerido a partir dos saves existentes.

### 7.10 Pendências reais do Nexus
- **[pendente]** Jogo de Matemática e os outros 9 Nexóticos de Matemática (pacote futuro).
- **[não confirmado]** Balanceamento de preços, níveis e desempenho em aparelhos reais: falta uma sessão de jogo com o Gabriel.
