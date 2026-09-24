# Jogo do Gabriel: mapa da franquia

Memória oficial e cumulativa do projeto. Leia inteira antes de planejar ou mudar qualquer coisa.
Estado conferido nos arquivos em 24/09/2026 (Gabriel Nexus construído e **oculto para a criança**; Geografia com a **camada gráfica nova e o Parque do Atlas**, seção 8).
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
- Código e recursos de módulos anteriores podem ser reaproveitados ou melhorados quando fizer sentido, **sem obrigar** os jogos a seguir o mesmo formato.
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
- **Um único save infantil por navegador.** O nome é só personalização: não existe conta, senha ou seleção de perfis para a criança.

- **Área dos Pais sempre em dia (regra permanente, pedido do usuário em 24/09/2026):** **todo conteúdo novo** (fase, minijogo, menu, tela de recompensa, loja, item, modo de jogo) precisa entrar **na mesma entrega** no **modo de teste da Área dos Pais**, com acesso direto e tudo liberado, para o responsável poder testar. Uma entrega **só está pronta** quando:
  - o conteúdo aparece em "🧪 Modo de teste → 🎮 Abrir jogos (sandbox)" (em Geografia: `franchise.testTargets` para fases e `franchise.testExtras` para minijogos, menus e telas, no `manifest.js`);
  - o link abre o conteúdo no sandbox (o save real não muda);
  - o teste automático da Área dos Pais do módulo passa (Geografia: `src/modules/geografia/tests/pais-teste.cjs`, que falha se um minijogo registrado não estiver na lista).

**Regras de git (permanentes)**
- Só fazer push em `claude/adoring-galileo-w55t2f` do repositório `jogogabriel`.
- O repositório `diario` foi a "pasta errada": nada vai para ele.
- Não abrir PR sem pedido. Não citar identificador de modelo em commits nem arquivos.
- **Nunca** gravar a senha dos pais em texto puro no repositório.
- **Link para jogar (decisão e autorização permanente do usuário, 24/09/2026):** o usuário **autorizou de forma permanente** a atualização do link. Ao fim de **toda** alteração no jogo (código, imagens, fases, minijogos, textos), republicar no **MESMO** artifact, sem perguntar de novo: https://claude.ai/artifact/5G4dYdvU9XW6oNCWXvPV7i (aberto a quem tem o link). Nunca criar um link novo.
  - **Arquivos publicados:**
    - A página é `inicio.html`.
    - Vão também `css/`, `js/` e `src/`, sem testes, ferramentas nem licenças `.md`.
    - Vão ainda `ciencias.html` (cópia de `index.html`, porque o artifact não aceita o caminho `index.html`) e `src/modules/geografia/assets/`.
  - **Como atualizar:**
    - Faça antes `read` e `list` com `scope: "files"`.
    - Depois publique com `url` do artifact, `file_path` = `inicio.html` e `files` só com os arquivos alterados. O limite é de 255 arquivos por envio; se passar disso, mande em lotes.
    - Registre a nova versão aqui.
  - **Versão publicada:** **12** (24/09/2026): minijogos mais desafiadores e tudo livre depois do estudo concluído (seção 8.5).
    - v11: Área dos Pais com Parque, Arcade e telas de recompensa no modo de teste (seção 8.4).
    - v10: Arcade dos Mundos e regras de entrada dos minijogos (seção 8.3).
    - v9: Geografia arcade (seção 8.2).
    - Labirintos no estilo Pac-Man.
    - Chefes novos.
    - Ritmo Livre refeito.
    - Cidade 3-2 com mais desafio.
  - **Histórico de versões:**
    - v8: correções das fases 3-2 e 3-4 (seção 8.1).
    - v7: gráficos novos e Parque do Atlas (commit `b0f3e3e`, 72 arquivos).
    - v6: Nexus oculto.
  - **Permissão:** o usuário liberou a ferramenta Artifact nas configurações da sessão. Se um envio for bloqueado de novo, peça ao usuário para liberar a permissão; não contorne o bloqueio.

---

## 2. Módulos existentes

| Módulo | Proposta | Estado | Entrada e arquivos principais |
|---|---|---|---|
| **Ciências: Missão EcoNexus** (v1.0) | Aventura 2D em vista de cima com a guia Lumi, vila hub, 6 regiões e Arena. **43 questões** (L1-Q1 … L6-Q7). 7 minijogos. | Concluído e **congelado**. | `index.html`, `css/`, `js/`, `tools/`, `docs/ENTREGA.md`, `README.md`. Save `econexus_guardioes_save_v1`. Adaptador (não é arquivo de Ciências): `src/modules/ciencias-legacy-adapter/`. |
| **Geografia: Brasil em Movimento** (`geografia_2026_09`) | Gaia e o rival GeoBot. 3 capítulos, **16 fases** de estilos diferentes, 3 salas bônus e **Parque do Atlas com 4 minijogos**. **45 questões**. | Concluído. Melhoria gráfica e Parque feitos a pedido do usuário (seção 8). Questões, economia e dificuldade das fases não mudaram. | `src/modules/geografia/jogar.html`, `main.js` (`GEO.app`), `content/`, `questions/`, `systems/`, `scenes/`, `ENTREGA-GEOGRAFIA.md`. Save `ecoNexus.geografia.v1`. |
| **Gabriel Nexus** (jogo central) | Hub 2.5D na Praça dos Mundos, 21 Nexóticos, Parque, Fliperama, Galeria, Oficina, Casa, Loja e Terminal dos Pais. | Construído e testado (seção 7), mas **oculto para a criança** (seção 5). Os pontos continuam sendo guardados. | `src/nexus/nexus.html`, serviços em `src/franchise/`, Área dos Pais em `src/pais/pais.html`. Perfil `ecoNexus.franchise.v1`. |
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
- `inicio.html`: tela de entrada (**só o nome**, sobre o cenário `06_cenario_login` e o logo **original** do Colégio Kodomo). Depois vem "Qual missão você quer jogar?", só com as matérias (Ciências, Geografia, Matemática "em breve", "Novas missões chegarão") e o botão discreto "Área dos Pais". O cartão do Nexus só aparece se `GG.FR.nexusVisible` for `true` ou no modo de teste dos pais.
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

**Rodar:** abrir `inicio.html`. Online, o lançador usa `ciencias.html` se existir (cópia só no artifact publicado). Artifact publicado: versão 6 (Nexus oculto), ver regra na seção 1.

**Testes** (Node 18+ e Playwright; aqui: `/opt/node22/lib/node_modules/playwright`, Chromium em `/opt/pw-browsers`; use `NODE_PATH=/opt/node22/lib/node_modules`). A senha vem da variável de ambiente, nunca do repositório:

```
node src/tests/ciencias-regressao.cjs                          # Ciências: 32 arquivos por sha256, audit, 74 checagens, save byte a byte
PARENT_ACCESS_PASSWORD=… node src/tests/nexus-unit.cjs         # 467 checagens sem navegador (ponte, livro-razão, migração, catálogo, loja, cápsula, senha, sandbox)
PARENT_ACCESS_PASSWORD=… node src/tests/nexus-e2e.cjs          # 43 checagens no navegador (entrada, Nexus, Fliperama, loja, Área dos Pais, sandbox, regressão, desempenho)
node src/modules/geografia/tests/features.cjs                  # Geografia: 45 questões, acessibilidade, loja, painel, isolamento
node src/modules/geografia/tests/e2e.cjs otimo|erros|rapido    # campanha inteira
node src/modules/geografia/tests/layouts.cjs <pasta>           # 1366x768, 1920x1080, 390x844
node src/modules/geografia/tests/parque.cjs                    # camada gráfica + Parque do Atlas (19 checagens)
node src/modules/geografia/tests/pais-teste.cjs                # Área dos Pais: todo minijogo/menu/tela de Geografia abre no modo de teste (sandbox)
node src/tests/gen-tabela-geografia.cjs                        # tabela das 45 questões
```

**Últimos resultados (24/09/2026):**
- Regressão de Ciências: 32/32 arquivos idênticos, audit limpo, 74 checagens ✓, save idêntico.
- `nexus-unit` 467/467 e `nexus-e2e` 43/43 (o e2e agora confere que o Nexus está **oculto** no lançador).
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
- **Gabriel Nexus:** **oculto para a criança por enquanto** (decisão do usuário: a tela com tudo junto não ficou boa). Chave única: `GG.FR.nexusVisible = false` em `src/franchise/config.js`; ela esconde o cartão e os avisos do Nexus no lançador e a linha "🌀 Gabriel Nexus" no resultado das fases de Geografia. Os pontos seguem sendo registrados em segundo plano, e o Nexus continua acessível no modo de teste dos pais. Para liberar: `true` e republicar. Outras escolhas: narrador Micróbio Miojo; hub na arte da Praça dos Mundos; áreas liberadas por Nível do Nexus; Moedas Nexus separadas das moedas de cada matéria; Cristais de Decoração só da coleta e das expedições.
- **Próximo módulo:** tudo em aberto (história, guia, mecânicas, visual), conforme o material entregue.

---

## 6. Feito, em andamento, problemas conhecidos e próximos passos

**Feito**
- Ciências v1.0 (43 questões).
- Plataforma v2 (lançador, registro, core, motor de questões).
- Geografia (45 questões, 16 fases).
- **Gabriel Nexus** (seção 7): entrada pelo nome, perfil global, ponte de pontuação, 21 Nexóticos, hub e 8 áreas, 4 jogos recreativos, Fliperama com replays das matérias e torneios, Área dos Pais com sandbox. Depois, **ocultado para a criança** a pedido do usuário.
- Link único publicado (**versão 10**: Geografia gráfica, Parque, modo arcade e Arcade dos Mundos com entrada por moedas ou perguntas).
- Documentos atualizados: `COMECE-AQUI.md`, `COMO-ADICIONAR-MATERIA.md`, `CREDITOS.md`.

- **Geografia — melhoria gráfica e Parque do Atlas** (seção 8), a pedido do usuário.

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
- Geografia gráfica: mede de 38 a 58 quadros/s no Chromium sem GPU dos testes (antes, 61). Há **modo leve automático** (abaixo de 34 quadros/s). **[não confirmado]** em tablet e celular reais.
- Ainda não há **fotos reais** de comidas, festas e lugares (Wikimedia e bancos de imagens estão bloqueados na rede desta sessão). **[pendente]** pedir ao usuário as fotos que ele quiser, ou baixar numa sessão com acesso.
- Os minijogos do Parque **não** estão no Fliperama do Nexus (o manifesto não os lista), porque o Nexus está oculto.

**Próximo passo concreto**
- Aguardar o usuário. O mais provável é o **jogo de Matemática**: pedir o material da prova, criar um jogo próprio (novo enredo, ambientes e fases) em `src/modules/matematica/`, preencher o bloco `franchise` do manifesto (7.4) e manter o Nexus oculto até o usuário decidir.

**Depois (só com pedido)**
- Redesenhar e liberar o Nexus (`nexusVisible: true`); pacote `matematica-v2` com os outros Nexóticos; outras matérias; PR para `main`; GitHub Pages.

---

## 7. Gabriel Nexus — O Mundo dos Nexóticos

### 7.1 Objetivo e funcionamento
- Jogo central da franquia. Cada estudo nas matérias gera **energia** (Pontuação de Carreira) e **Moedas Nexus**. Com elas, o Nexus cresce, chegam Nexóticos, a casa é decorada e o Fliperama enche.
- O Nexus **não** tem questões novas, **não** altera questões e **não** é obrigatório para avançar nas matérias.
- **Fluxo (quando visível):** `inicio.html` (nome) → lançador → `src/nexus/nexus.html`. Hoje a criança não vê o cartão; o endereço direto continua funcionando.
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
- `inicio.html`, `src/launcher/launcher.js`, `launcher.css`: entrada pelo nome e cartão do Nexus (oculto por `nexusVisible`).
- `src/core/audio.js`: `addSong`, `songs`, `jingle` (só acréscimos).
- `src/modules/modulos.js`: linha da Matemática.
- `src/modules/ciencias-legacy-adapter/manifest.js`: bloco `franchise`. Não é arquivo de Ciências.
- Geografia, com os ganchos mínimos autorizados:
  - `manifest.js`: bloco `franchise`.
  - `jogar.html`: scripts da franquia e `mode.js`.
  - `systems/save.js`: `SV.KEY` vem do modo.
  - `systems/campaign.js`: `unlocked()` libera tudo em replay e teste.
  - `main.js`: `replayStart`, `testStart`, `testQuestion`; `toLauncher` volta ao Fliperama no replay.
  - `scenes/stage.js`: linha "🌀 Gabriel Nexus" no resultado (escondida enquanto `nexusVisible` for `false`), `replayResults`, e sair do replay volta ao Nexus.
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
- **Modo de teste:** `testEntry(opts)` → URL do jogo em sandbox; `testTargets` → fases para ir direto; `testExtras` (opcional) → `[{group, items:[{t, p}]}]`, em que `p` são os parâmetros passados para `testEntry`. A Área dos Pais mostra `testExtras` numa lista agrupada com o botão "Abrir" (minijogos, menus e telas especiais). **Todo conteúdo novo entra aqui** (seção 1).
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
  - Atalhos para o Nexus (hub, Fliperama, Loja, Parque, Casa, Oficina, Galeria), Ciências (jogo novo, tudo concluído, região direta), Geografia (atlas, fase direta, questão direta, **Parque, Arcade dos Mundos, os 13 minijogos e as telas de recompensa dos chefes**, seção 8.4) e todos os minigames.
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
- **[pendente]** Nexus oculto: falta o usuário decidir como deve ficar a tela antes de liberar.
- **[pendente]** Jogo de Matemática e os outros 9 Nexóticos de Matemática (pacote futuro).
- **[não confirmado]** Balanceamento de preços, níveis e desempenho em aparelhos reais: falta uma sessão de jogo com o Gabriel.

---

## 8. Geografia: camada gráfica e Parque do Atlas (24/09/2026)

**Pedido do usuário:** melhorar só Geografia, com imagens e ilustrações reais da internet, gráficos, sprites, animações e efeitos com estilo de jogo profissional, e mais minijogos para a criança.

**O que mudou (só em `src/modules/geografia/`; núcleo `src/core`, Ciências, lançador e Nexus intactos)**
- **Arquivos novos:**
  - `gfx/gfx.js` (`GEO.gfx`) e `gfx/gfx.css`.
  - `scenes/parque.js` (`GEO.parque`).
  - `tests/parque.cjs`.
  - `assets/` com `ilustracoes/fluent3d.png` + `fluent3d.js` (índice de 210 nomes), `cenario/*.png`, `efeitos/*.png` e `fotos/sat_dia.jpg`, `sat_noite.jpg`, `terra_1024.jpg`.
  - Licenças em `src/assets/shared/licencas/`.
- **Ganchos:** `gfx.js` envolve `GG.engine.start` e `E.fx` **só na página de Geografia**. Toda cena ganha:
  - vinheta nos cantos;
  - cartão de abertura animado;
  - transição em íris;
  - partículas com brilho;
  - textos que "saltam".
- **Cenários pintados em camadas** (`GEO.gfx.sky`, 11 temas):
  - Silhuetas da Kenney tingidas por tema, com paralaxe.
  - Sol ou lua com brilho e raios.
  - Estrelas, aurora, névoa e horizonte de cidade.
  - Partículas de ambiente: confete e balões, poeira, neve, esporos, borboletas, folhas e pássaros.
  - Usados por `C.sky` (plataforma, corrida, torre e chefes) e pelos minijogos.
- **Atlas:**
  - Fundo com **foto de satélite real** da América do Sul. Na página 3, a **foto noturna** mostra o litoral mais iluminado (decoração, não é questão).
  - **Globo terrestre girando**.
  - Fases com **ilustração 3D** (cinza quando bloqueadas).
  - Brilho e estrelinhas na fase escolhida.
  - Painel da fase com ilustração grande.
  - Botão **🎡 Parque** e ícones 3D nos botões e nos contadores.
- **Fases:**
  - HUD com corações, estrela, mapa e cronômetro em 3D, que "pulam" ou tremem ao mudar.
  - Gabriel com sombra, esticar e amassar, e poeira ao pular e pousar.
  - Fragmento com estrelinhas e anel; dano com flash vermelho.
  - Resultado com medalha 3D girando com brilho e 1 a 3 estrelas animadas.
- **Por estilo de fase:**
  - Nave: sol, reflexo no mar, nuvens, coqueiros e ilhas com cabana.
  - Cozinha: janela, prateleiras de ingredientes, panelas 3D e vapor.
  - Ritmo: holofotes no compasso, cortina e notas com instrumentos 3D.
  - Labirintos: paredes neon pré-desenhadas, casas que acendem e raios 3D.
  - Exploração: brilho na água, estações com livro flutuando, portal com raios e vaga-lumes.
  - Cidade: ícones 3D das necessidades, carros, árvores e bairro pronto iluminado.
  - Sala de estudo: foto de satélite e globo.
- **Parque do Atlas** (minijogos **sem questões**, sem EcoMoedas e sem XP; recorde e medalha em `S().parque`):

  | Minijogo | Libera com | Como é |
  |---|---|---|
  | Memória das Culturas | já liberado | 3 tabuleiros (6, 8 e 10 pares) de instrumentos, comidas, bichos e festas; pontuação em % de aproveitamento |
  | Voo da Arara | 1 fase | Voo tipo "Flappy" pelas 5 regiões (Norte, Nordeste, Centro-Oeste, Sudeste, Sul), cada uma com cenário próprio; 3 vidas com invencibilidade; frutas e fragmentos |
  | Cesta da Feira | 3 fases | 60 s pegando comidas; estrela vale mais; nuvem de chuva deixa a cesta lenta; combo até x5 |
  | Quebra-cabeça do Brasil | 5 fases | Arrastar as 5 regiões (mouse, toque ou teclado: E troca a peça, setas movem, Espaço solta); bônus de rapidez |

  - No modo de teste dos pais, tudo fica liberado.
  - Os créditos das imagens aparecem no Parque, em "Créditos das imagens".
- **Desempenho:**
  - Camadas redimensionadas uma vez para o tamanho da tela.
  - Raios de sol e vinheta pré-desenhados.
  - Ícones cinza feitos uma vez.
  - Foto de fundo guardada em cache.
  - **Modo leve automático** (`GEO.gfx.lite`) abaixo de 34 quadros/s.
  - "Reduzir movimento" desliga paralaxe, raios, ambiente e transições.
- **Não mudou:** questões, textos pedagógicos, economia das fases, dificuldade, mapas das fases e chave do save. O save só ganhou o campo `parque`, que o `SV.load` preenche com `{}` em saves antigos.

**Testes (24/09/2026):**
- `features` ✓.
- `e2e` otimo, erros e rapido: 45/45 questões, 16/16 fases, 0 erro.
- `layouts` OK nas 3 resoluções.
- `parque` 19/19.
- Regressão de Ciências idêntica.

**Ideias para depois (só com pedido):**
- Fotos reais de comidas e festas (o usuário pode enviar).
- Minijogos no Fliperama do Nexus.
- Recompensas cosméticas por medalhas do Parque.
- Mais tabuleiros e temas na Memória.
- Modo "estados" no Quebra-cabeça.

### 8.1 Correções pedidas pelo usuário (24/09/2026)
**3-2 Cidade em Transformação travava**
- **Causa:** a entrega de recurso rodava a **cada quadro** enquanto o Gabriel estava dentro de um bairro.
  - Entrar no **Centro** carregando um recurso reabria a fala da Gaia sem parar, e a fase ficava presa.
  - Num bairro errado, os avisos se acumulavam.
- **Correção** (`scenes/city.js`): a reação acontece **só ao entrar** num bairro, guardada em `p.zone`.
- **Verificação:** reproduzido no navegador antes e depois; a fase segue até as questões.

**3-4 Torre da População: dinâmica refeita** (`scenes/tower.js`)
- **Problemas:**
  - Os degraus tinham vãos de 5 blocos, mas o pulo alcança uns 3.
  - O altímetro cobria o lado direito da torre.
  - Os painéis dos anos cobriam os degraus.
  - Os 9 andares eram iguais.
- **Torre nova:**
  - Tem 19 colunas e foi deslocada (`CAMX`); a torre inteira aparece ao lado de um altímetro mais estreito, que mostra onde o Gabriel está.
  - A câmera fica mais baixa, para mostrar o que vem por cima.
- **9 andares, cada um com um desafio próprio** (tabela `DESIGN`), com degraus a cada 3 blocos e vãos de no máximo 2:

  | Andar | Desafio |
  |---|---|
  | 1 | Escadinha |
  | 2 | Zigue-zague |
  | 3 | Plataforma que anda |
  | 4 | Mola |
  | 5 | Degraus estreitos |
  | 6 | Elevador |
  | 7 | Ponte partida |
  | 8 | Plataforma rápida + mola |
  | 9 | Reta final |

- **Também:**
  - Moedas-guia mostram o caminho.
  - Fragmentos opcionais ficam em pulos mais difíceis.
  - As Névoas ficam mais rápidas conforme a torre sobe.
  - Os painéis dos anos ficam no vão livre, atrás das plataformas.
  - O totem do andar 8 foi para x=14.
- **Não mudou:** questões, textos e dados da tabela.
- **Verificação:** um robô subiu os andares 1 e 2 pelo teclado, pulando degrau por degrau. Testes `features`, `e2e` nos 3 perfis, `layouts` e `parque` OK.

### 8.2 Geografia no modo arcade (24/09/2026, pedido do usuário)
**Cartão de leitura** (`GEO.gfx.readCard`, em `gfx/gfx.js` + `gfx.css`)
- Janela que **pausa o jogo** com desenho grande, nome e texto.
- Continua com **qualquer tecla**, com um toque fora da janela ou com o botão "Continuar ▶". Tem também o botão "Ouvir".
- Usada nos labirintos (item coletado) e nos chefes (placas).

**Labirintos estilo Pac-Man** (`scenes/maze.js`: fases 2-1 e 3-3 e sala bônus b3)
- **Monstro encosta no Gabriel:**
  - aparece "PEGO!" e o Gabriel gira;
  - Gabriel e monstros **voltam ao início**, sem perder item, carga nem pontos;
  - depois vem "PRONTO? / VAI!".
- **4 poderes por conjunto** (Empatia ou Escudo, 7 s):
  - a música troca para `labirinto_poder` (bem mais rápida);
  - os monstros ficam **azuis**, fogem e piscam no fim do poder;
  - comido, o monstro vira **olhos**, que voltam à **base** (casa 12,5) pelo menor caminho e renascem depois de 2,5 s;
  - os pontos dobram a cada monstro comido.
- **Monstros com jeito próprio:** um persegue direto, outro corta o caminho à frente e o terceiro é tímido.
- **Itens e altares com desenho + nome:**
  - itens: rede (desenho próprio), balangandãs (joia), refeição, pomba do Divino, samba (dançarina), toré (maracá), pena, atabaque e bandeira da Alemanha;
  - altares: pena (indígena), globo com a África, bandeira de Portugal e **mini mapas** destacando Norte, Nordeste e Sul;
  - na fase 3-3: raio e casas.
- **Pegar item** abre o cartão "ITEM COLETADO!" com o nome e os altares possíveis.
- **Extras:** "chomp" ao comer pontinhos e bônus "LIMPOU TUDO!".

**Chefes** (`scenes/boss.js`)
- **Leitura:** as placas surgem e o jogo **pausa no cartão** com as 3 frases. O botão "📜 Reler placas" reabre o cartão.
- **Posição das placas:**
  - ficam **na frente do chefe**, uma em cada altura (chão, meio e alto), alinhadas com os níveis das plataformas;
  - ao **mirar**, a frase aparece numa faixa embaixo da tela.
- **Ataques com aviso vermelho:** tiro triplo mirado, chuva, onda no chão ("PULE!") e investida.
- **Fase final:** vida do chefe com "FÚRIA" abaixo de 50%.
- **Surpresas:** cada placa **verdadeira** atingida por engano causa uma surpresa em rodízio, sem fazer perder a fase:
  - chuva de rótulos;
  - chefe furioso (disparos em círculo);
  - terremoto (ondas);
  - apagão (só a luz do Gabriel);
  - placas embaralhadas.
- **Faixas de anúncio:** SOBREVIVA, ESCUDO QUEBRADO, ATAQUE FINAL e as surpresas.

**Ritmo Livre** (sala bônus b2; `scenes/ritmolivre.js`, motor `ritmolivre`)
- **Batalha de ritmo contra o GeoBot**, inspirada nos jogos de ritmo de sucesso:
  - 4 setas (← ↓ ↑ → ou A S W D);
  - "vez do GeoBot / sua vez";
  - barra de disputa;
  - notas longas e notas douradas;
  - combo com multiplicador até x4;
  - **Modo Carnaval** no combo 25.
- **3 rodadas:** Frevo (118 bpm), Samba (132) e Carnaval (146), com músicas originais.
- **Resultado:** nota S/A/B/C e medalha pelo aproveitamento.
- **A fase 2-3 (Ritmos do Brasil) não mudou.**

**Cidade 3-2** (`scenes/city.js`)
- **Trânsito:**
  - carros, ônibus e caminhão nas duas mãos;
  - **semáforo** (os carros param no vermelho);
  - o trânsito acelera 12% a cada entrega, até +60%.
- **Obstáculos:**
  - **cones de obra** que bloqueiam a rua;
  - **batida derruba o recurso** (é preciso pegá-lo de novo).
- **Bônus:**
  - **entrega expressa** (14 s, barra sobre o Gabriel);
  - moedas;
  - **bicicleta turbo**.
- **Animações:**
  - pedestres e faixas de pedestre;
  - **obra animada** em cada entrega: andaime subindo, poeira e corações dos moradores.
- **O Gabriel começa na calçada.**

**Arquivos:**
- **Novos:**
  - `scenes/ritmolivre.js`.
  - Ilustrações adicionadas ao atlas (`fluent3d.png`/`.js`, 236): pomba, refeição, pena, África, escudo, caixa de som, globo de discoteca, cone, caminhão, bandeiras (Kenney), rede e outras.
- **Alterados:**
  - `scenes/maze.js`, `boss.js`, `city.js`.
  - `gfx/gfx.js`, `gfx.css`.
  - `content/capitulos.js` (b2 usa `ritmolivre`).
  - `manifest.js` (texto de b2) e `jogar.html`.
- **Questões e textos pedagógicos não mudaram.**

**Testes:**
- `features` ✓.
- `e2e` otimo, erros e rapido: 45/45 questões e 16/16 fases.
- `layouts` OK.
- `parque` ✓.
- Regressão de Ciências idêntica.
- Scripts no navegador confirmaram:
  - cartão do item + qualquer tecla;
  - morte e volta ao início mantendo o item;
  - poder, música rápida e "olhos" voltando à base;
  - cartão das placas e as surpresas;
  - robô tocando as 3 rodadas do Ritmo Livre;
  - b2 e b3 chegando ao resultado.

### 8.3 Arcade dos Mundos e entrada dos minijogos (24/09/2026, pedido do usuário)
**9 minijogos de recompensa, 3 por mundo** (`scenes/arcade1.js`, `arcade2.js` e `arcade3.js`, registrados com `GEO.parque.register`)
- **Regras gerais:**
  - duram de 2 a 3 minutos e **não têm perguntas** durante o jogo;
  - têm 3 vidas ou meta, recorde e medalha;
  - usam referências de jogos clássicos sem copiar sprites, nomes ou fases.

  | Mundo | Jogo | Estilo | Como é |
  |---|---|---|---|
  | 1 | Jangada Radical | Donkey Kong Country (carrinho de mina) / Sonic | Corrida automática no mar com pulo duplo; pedras, troncos, ondas e gaivotas; estrela de invencibilidade |
  | 1 | Colunas do Mosaico | Columns (Mega Drive) / Puyo Puyo | Peças de 3 caem; 3 iguais em linha ou diagonal; correntes e estrela mágica |
  | 1 | Quebra-Mosaico | Arkanoid | Mosaicos (bandeira, colorido, coração); poderes: prancha grande, 3 bolinhas, bola lenta e vida |
  | 2 | Feira Ninja | Fruit Ninja | Cortar frutas deslizando o dedo ou com o facão no teclado; pimenta tira vida; combo e frenesi |
  | 2 | Quermesse Tiro ao Alvo | Duck Hunt / Yoshi's Safari | Esteiras de alvos, 8 rolhas por carga, meta por rodada; não acertar a placa da Gaia |
  | 2 | Pega-Névoa no Arraial | acerte a toupeira | Névoas saem das panelas de barro; teclas Q W E / A S D / Z X C; névoa dourada vale mais; não acertar os amigos |
  | 3 | Estrada Brasil | Road Fighter (NES) | Corrida vista de cima pelo litoral, cerrado e cidade; combustível no lugar do tempo; carros que mudam de faixa, óleo e batida na beira (refeita na seção 8.5) |
  | 3 | Invasores da Poluição | Galaga / Space Invaders | Nave solar contra fumaças em formação que mergulham; o céu fica mais azul a cada fumaça limpa |
  | 3 | Empilha-Prédios | Tower Bloxx / Stack | O guindaste balança; solte na hora certa; PERFEITO faz combo; a parte que fica para fora cai |

**Liberação: só passando pelo mundo** (pedido do usuário)
- **Mundo 1** (chefe c1s5): Arcade 1 + Memória das Culturas + Voo da Arara.
- **Mundo 2** (c2s5): Arcade 2 + Cesta da Feira.
- **Mundo 3** (c3s6): Arcade 3 + Quebra-cabeça do Brasil.
- **No começo nada está liberado.** No modo de teste dos pais, tudo fica liberado (a tela de entrada aparece, com o botão "Entrar grátis (teste)").
- **Estudo concluído** (`S().finalDone`, os 3 mundos e o final): todos os minijogos ficam **livres para sempre**, sem moedas nem perguntas (seção 8.5).

**Entrada de cada partida** (`GEO.parque.enter`)
- **Chefe vencido:** aparece "🕹️ Arcade do Mundo n liberado!", que dá **1 bilhete grátis** (`S().flags.arcadeTickets[n]`) para escolher 1 dos 3 jogos. O bilhete pode ficar guardado para depois.
- **Demais partidas:** **70 EcoMoedas** (`GEO.parque.COST`) **ou 2 perguntas rápidas** (afirmações do capítulo do mundo; nos jogos do Parque, de um capítulo já estudado).
- **Por que 70:** uma fase nova rende entre ~40 e ~60 EcoMoedas (testes: 683 a 1010 moedas em 16 fases), então 70 equivale a cerca de 2 fases. Sem moedas, a opção de responder perguntas fica em destaque.
- **"Jogar de novo"** também passa pela entrada.
- **Carteira:** o menu do Parque mostra as moedas e os bilhetes.

**Arquivos:**
- **Novos:** `scenes/arcade1.js`, `arcade2.js`, `arcade3.js`.
- **Alterados:**
  - `scenes/parque.js`: registro, seções por mundo, liberação por chefe, entrada, bilhetes e carteira.
  - `main.js`: `A.arcadeUnlocked` depois de `chapterComplete`.
  - `jogar.html` e `gfx/gfx.css`.
  - `tests/parque.cjs`: liberação por mundo, entrada paga (70 × 4), bilhete grátis, entrada por 2 perguntas e os 9 jogos.

**Testes:**
- `features` ✓.
- `e2e` nos 3 perfis ✓.
- `layouts` ✓.
- `parque` ✓.
- Regressão de Ciências ✓.
- Um script abriu os 9 jogos, jogou com teclas e chegou à tela de fim sem erros.

**Ideias futuras para o usuário decidir:**
- Placar de recordes da família.
- Missões diárias do Arcade.
- Um jogo de pinball (estilo Sonic Spinball).
- Um jogo estilo Frogger ("Travessia do Rio").

### 8.4 Área dos Pais com todo o Parque e o Arcade (24/09/2026, pedido do usuário)
**Problema:** o Arcade dos Mundos (8.3) entrou no jogo, mas não aparecia no modo de teste da Área dos Pais. Daí nasceu a regra permanente da seção 1: todo conteúdo novo entra na Área dos Pais na mesma entrega.

**O que o responsável tem agora** em "🧪 Modo de teste → 🎮 Abrir jogos (sandbox) → Geografia":
- lista "Minijogos, Parque e Arcade", agrupada, com botão **Abrir**:
  - **Menus e telas:** Parque + Arcade (menu completo), Arcade de cada mundo e a tela "Arcade liberado" de cada chefe (com o bilhete grátis);
  - **Parque do Atlas:** Memória das Culturas, Voo da Arara, Cesta da Feira e Quebra-cabeça do Brasil;
  - **Arcade do Mundo 1, 2 e 3:** os 9 jogos da seção 8.3.
- Cada item abre direto no **sandbox**, com tudo liberado.
- **Entrada testável:** no teste, a tela de entrada aparece como para a criança (pagar 70 EcoMoedas ou responder 2 perguntas), com o botão extra **"🧪 Entrar grátis (teste)"**. Moedas e respostas ficam só no sandbox.
- **Ferramentas de teste no menu do Parque** (só no modo de teste): +100 🪙, zerar 🪙, +1 🎟️ em cada mundo, tirar 🎟️ e abrir a tela de recompensa do chefe.

**Como funciona:**
- `manifest.js`: `franchise.testExtras` (lista) e `testEntry` aceita `minijogo`, `parque` (`todos`, `1`, `2` ou `3`) e `recompensa` (`1`, `2` ou `3`).
- `systems/mode.js`: valida esses parâmetros só com o modo de teste ativo; `main.js` (`A.testStart`) confere o id do jogo em `GEO.parque.GAMES` antes de abrir.
- `src/pais/pais.js`: mostra `testExtras` de **qualquer** matéria que declarar a lista (sem `if` por matéria).
- `scenes/parque.js`: entrada com "Entrar grátis (teste)" e ferramentas de teste; `gfx/gfx.css`: `.pq-test`.

**Teste novo:** `node src/modules/geografia/tests/pais-teste.cjs`, que confere:
- que todo jogo de `GEO.parque.GAMES` está em `testExtras` (e o contrário);
- que o painel lista os 20 itens, agrupados;
- que o botão "Abrir" leva ao jogo e que os 20 atalhos abrem o conteúdo certo;
- as ferramentas de teste e a entrada paga no sandbox;
- que o save real fica intacto byte a byte;
- que não há erros no console.

A sessão dos pais é simulada no `sessionStorage`; a senha não é usada nem guardada.

### 8.5 Minijogos mais desafiadores e liberação total no fim do estudo (24/09/2026, pedido do usuário)
**Liberação total:** quando a criança **termina o estudo** (`S().finalDone`), `GEO.parque.allFree()` fica verdadeiro e **todos** os minijogos (Parque e Arcade) entram direto, sem moedas e sem perguntas. O menu mostra "🏆 Estudo concluído!". Antes disso, continuam valendo as regras da seção 8.3. No modo de teste, o menu do Parque tem o botão "Simular / Desfazer estudo concluído".

**Ajustes por jogo:**

| Jogo | Problema relatado | O que mudou |
|---|---|---|
| Memória das Culturas | Nunca perdia | **4 corações.** Erro = errar quando uma das cartas **já tinha sido vista** (a criança deveria lembrar); errar com duas cartas novas é só tentativa e aparece "Cartas novas — memorize!". Com **4 erros**, o jogo acaba. A pontuação virou pontos (par +20, tabuleiro +50, corações que sobraram +40 cada); medalhas 200/420/620. |
| Cesta da Feira | Sem objetivo, fácil demais | **Pedidos da banca** (ex.: 3 cocos e 2 milhos): as comidas do pedido têm um contorno verde, e cada pedido entregue enche a banca e dá bônus. Comida fora do pedido vale pouco e quebra o combo. **3 vidas:** **fruta estragada** (micróbio) e **raio** tiram vida; chuva deixa a cesta lenta; coisas erradas podem cair em diagonal. Dura 90 s e acelera a cada pedido e com o tempo. |
| Jangada Radical | Barco sumia com a invencibilidade | O barco fica sempre visível, com **anel arco-íris** e brilhos. **Acelera sem parar**, como o dinossauro do Chrome (140 → 360), com "MAIS RÁPIDO!" a cada 20 s. **Abaixar** (↓ ou toque na parte de baixo): a **rede de pesca** do píer só passa abaixado, e a gaivota em rasante também. Um aviso "↓ ABAIXE!" pisca antes. |
| Colunas do Mosaico | Ficou bom; faltava subir a dificuldade | Como no Tetris: a cada **400 pontos** sobe o **nível** e a peça cai 12% mais rápido (mínimo de 0,14 s), com o aviso "NÍVEL n! MAIS RÁPIDO". |
| Quermesse Tiro ao Alvo | Muito fácil | Rodada de **25 s** (antes 30). A meta começa em **7 e sobe 1 por rodada**. Os alvos na esteira sobem **+1 por rodada**, e ficam mais rápidos. Alvos errados (**placa da Gaia, presente, pomba**) ficam cada vez mais comuns (16% + 6% por rodada, até 45%), e **cada erro tira 2 s** (e 30 pontos). As rodadas não têm fim: o jogo acaba quando uma meta não é batida. |
| Estrada Brasil | Checkpoint toda hora, impossível perder | **Refeita no estilo Road Fighter (NES)**, vista de cima. **Combustível** no lugar do tempo: gasta sempre, e mais na marcha rápida (↑/Espaço). Bater num carro ou **na beira da pista** faz o carro rodar e explodir: −10 de combustível e recomeça parado. **Carros amarelos** mudam de faixa na sua frente ("!"), caminhões são largos e **óleo** faz rodar. **Galões** dão +18. Cada zona (litoral, cerrado, cidade) dá só +12 de combustível e +250 pontos; depois das 3 zonas vem outra volta, mais estreita e com mais trânsito. Um robô de teste simples fez cerca de 21 km e 1800 a 2100 pontos, batendo 15 a 18 vezes; sem controle, o jogo acaba em cerca de 50 s. Medalhas 900/1900/3200. |

**Arquivos:** `scenes/parque.js` (liberação total, Memória, Cesta, ferramenta de teste), `scenes/arcade1.js` (Jangada, Colunas), `scenes/arcade2.js` (Quermesse), `scenes/arcade3.js` (Estrada) e `tests/parque.cjs` (estudo concluído = entrada direta).

