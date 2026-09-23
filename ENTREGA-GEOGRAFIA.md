# Entrega — Versão 2.0: plataforma modular + módulo de Geografia “Brasil em Movimento”

## 1. Auditoria resumida da versão 1.0

- **Ciências — Missão EcoNexus**: jogo em HTML/CSS/JS puros, aberto por `index.html`, com scripts clássicos no namespace `EN` (`js/core`, `js/data`, `js/systems`, `js/ui`, `js/main.js`). Motor 2D em canvas com mapas de tiles vista de cima, 43 questões, loja, caderno, área do responsável e testes em `tools/`.
- **Save**: chave `econexus_guardioes_save_v1` no `localStorage`.
- **Reutilizável sem editar Ciências**: apenas ideias (fluxo pedagógico, economia com valores fixos, portão de multiplicação, exportação .txt/.json). O motor antigo é acoplado ao namespace `EN` e aos mapas de Ciências. Para não arriscar regressão, **nada foi importado de Ciências**: a plataforma v2 tem núcleo próprio em `src/`.
- Ciências foi tratado como **legado congelado**: nenhum arquivo foi apagado, movido, renomeado ou editado (prova na seção 6).

## 2. Arquitetura modular e decisões de compatibilidade

```text
inicio.html                  ← NOVO lançador: “Qual missão você quer jogar?”
index.html, css/, js/, docs/, tools/, README.md   ← Ciências 1.0, intocado
src/
  core/        util, storage (saves isolados), input (teclado remapeável, toque, gamepad),
               audio (músicas/efeitos originais + voz pt-BR), engine (canvas 400x225), pixel (sprites originais)
  ui/          ui (janelas, diálogos, acessibilidade), maps (mapa do Brasil), ui.css, quiz.css
  systems/     quiz.js — motor de questões reutilizável (10 tipos, fluxo de erro em 3 níveis)
  launcher/    lançador
  assets/shared/  sprites CC0, fontes OFL embutidas, mapa CC BY, licencas/
  modules/
    registry.js, modulos.js        ← registro central (1 linha por matéria)
    ciencias-legacy-adapter/       ← só aponta para index.html e LÊ o save antigo
    geografia/                     ← módulo novo completo
      manifest.js, jogar.html, main.js, geografia.css
      content/   capítulos/fases/falas, glossário, loja e recompensas, visuais (mapas, tabelas, gráficos)
      questions/ c1.js (15), c2.js (17), c3.js (13)
      systems/   save.js (ecoNexus.geografia.v1), economy.js, campaign.js
      scenes/    stage (runtime comum), atlas, platform, topdown, shmup, race, boss, maze, rhythm, kitchen, city, tower
      tests/     e2e.cjs, features.cjs, layouts.cjs
    exemplo-vazio/                 ← módulo de exemplo desativado
  tests/       ciencias-regressao.cjs, ciencias-baseline.sha256, gen-tabela-geografia.cjs
```

Decisões:
- **O lançador é um arquivo novo (`inicio.html`)**. Mover o `index.html` de Ciências para liberar o nome violaria a regra de não mover arquivos. `index.html` continua abrindo Ciências exatamente como antes. Na página publicada (link de compartilhamento), o lançador é a página principal e Ciências é servido como cópia idêntica chamada `ciencias.html`.
- **Economia, loja, inventário, conquistas, conteúdo e save ficam por módulo.** Controles, áudio, voz, acessibilidade, mapas e o motor de questões são compartilhados, porque não têm estado de matéria.
- O código novo **recusa gravar** a chave de Ciências (`GG.store` lança erro se alguém tentar).

## 3. Arquivos criados e modificados

**Modificados: nenhum arquivo existente.** Criados: `inicio.html`, `COMECE-AQUI.md`, `COMO-ADICIONAR-MATERIA.md`, `CREDITOS.md`, `ENTREGA-GEOGRAFIA.md` e toda a pasta `src/` (lista na seção 2; cerca de 7.300 linhas de código novo, mais os sprites e licenças).

## 4. Implementação

Completa no projeto, sem pseudocódigo:
- **Campanha**: 3 capítulos, 16 fases, final com resumo, troféu “Guardião da Diversidade Brasileira”, EcoMoedas e item “Atlas Vivo Dourado”, e Revisão da Prova liberada.
- **Estilos de jogo**: plataforma lateral, exploração com quebra-cabeça de mapa, nave-cartográfica, corrida contra o GeoBot, labirinto de coleta, ritmo, cozinha de sílabas, cidade de ação e construção, torre vertical, e 3 chefes.
- **Personagens**: Gaia (bússola digital) e GeoBot (rival amistoso). Os adversários são só abstratos: Névoas da Confusão, Blocos do Erro, Sombras da Generalização, Robôs do Preconceito, Vírus do Mapa e chefes feitos de afirmações erradas. No trecho sobre a escravidão, a nave desacelera, os disparos são desligados, não há alvos e a música fica calma.
- **Modos**: Aventura completa, Estudo rápido (vai direto aos pontos de conteúdo, com as mesmas explicações e questões) e Revisão da prova (prioriza erros).
- **Ritmo**: o primeiro conteúdo aparece em cerca de 5 s (limite 30 s). Os pontos de conteúdo ficam a poucos segundos de caminhada, há checkpoints frequentes com retomada imediata, portais de viagem rápida e, no Atlas, viagem direta para fases já liberadas. Os diálogos têm no máximo 3 balões.
- **Recompensas**: XP, EcoMoedas de Geografia, Fragmentos do Atlas, estrelas, medalhas bronze/prata/ouro/diamante e recorde pessoal. Repetir uma fase rende 30% no máximo 2 vezes por dia. Há 11 itens com benefícios permitidos, molduras por desempenho e 3 salas bônus liberadas por medalhas de ouro.
- **Acessibilidade**: voz pt-BR com botão Ouvir e Repetir fala, texto em 3 tamanhos, alto contraste, reduzir movimento/paralaxe/partículas, volumes separados de música, efeitos e voz, nenhum som antes de interação, teclas remapeáveis, toque, gamepad, e mapas e gráficos sempre com texto e padrões (não só cor).
- **Painel do responsável** (conta de multiplicação): mostra progresso total e por capítulo, cobertura 45/45, acertos de primeira, tentativas, questões corrigidas com ajuda, conceitos com dificuldade, tempo de estudo e de ação, Estudo rápido e Revisão, medalhas, recordes contra o GeoBot, moedas, última sessão e uma recomendação automática. Exporta .txt e .json, sem enviar nada a servidor.

## 5. Como executar e gerar build

Não há build: abra `inicio.html` (detalhes em `COMECE-AQUI.md`). Os testes precisam de Node 18+ e Playwright.

## 6. Isolamento dos saves e prova de que Ciências não foi alterado

- Ciências: `econexus_guardioes_save_v1`, lido **somente para exibição** pelo lançador (`src/modules/ciencias-legacy-adapter/manifest.js`). Nunca é gravado, migrado nem apagado.
- Geografia: `ecoNexus.geografia.v1` (perfil, XP, moedas, inventário, configurações, fases, desempenho, questões erradas, recordes e desbloqueios). Reiniciar Geografia apaga só essa chave.
- Lançador: `ecoNexus.launcher.v1` (apenas a última matéria escolhida).
- Prova automática (`src/tests/ciencias-regressao.cjs`):
  1. SHA-256 dos 32 arquivos de Ciências igual à linha de base tirada antes da atualização;
  2. os testes originais de Ciências (`tools/audit.cjs` e `tools/features.cjs`, 74 verificações) passam como antes;
  3. um save real de Ciências permanece **idêntico byte a byte** depois de usar o lançador, jogar Geografia e reiniciar Geografia; Ciências continua oferecendo “Continuar”.

## 7. As 45 questões: fase, mecânica e ponto de aparição

Todas aparecem na campanha principal (uma vez cada) e de novo como variação na Revisão da Prova. Questões pessoais têm rubrica, “Não sei ainda” quando cabe, e as respostas não são gravadas.

| # | ID | Título | Fase (estilo) | Interação | Onde aparece |
|---|---|---|---|---|---|
| 1 | GEO-C1-Q01 | Diversidade no cartaz | 1-1 Festival da Diversidade (Plataforma lateral) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 1-1 • Totem da Gaia no palco do festival |
| 2 | GEO-C1-Q02 | Pessoas semelhantes | 1-1 Festival da Diversidade (Plataforma lateral) | Pessoal/rubrica (sem dados sensíveis) | Fase 1-1 • Conversa com o público do festival |
| 3 | GEO-C1-Q03 | Diversidade na sala | 1-1 Festival da Diversidade (Plataforma lateral) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 1-1 • Barraca da escola no festival |
| 4 | GEO-C1-Q04 | Povos citados pelo ISA | 1-1 Festival da Diversidade (Plataforma lateral) | Várias respostas | Fase 1-1 • Placa do Instituto no fim do festival |
| 5 | GEO-C1-Q05 | Os povos indígenas são iguais? | 1-2 Mapa dos Povos Originários (Exploração e quebra-cabeça de mapa) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 1-2 • Roda de conversa na praça dos cartões |
| 6 | GEO-C1-Q08 | Palavras de origem indígena | 1-2 Mapa dos Povos Originários (Exploração e quebra-cabeça de mapa) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 1-2 • Varal de Palavras |
| 7 | GEO-C1-Q07 | Povos indígenas em São Paulo | 1-2 Mapa dos Povos Originários (Exploração e quebra-cabeça de mapa) | Múltipla escolha | Fase 1-2 • Mesa do Mapa Histórico |
| 8 | GEO-C1-Q06 | Origens da família | 1-2 Mapa dos Povos Originários (Exploração e quebra-cabeça de mapa) | Pessoal/rubrica (sem dados sensíveis) | Fase 1-2 • Árvore das Famílias |
| 9 | GEO-C1-Q09 | Planta de Salvador | 1-3 Rotas pelo Atlântico (Nave-cartográfica) | Várias respostas | Fase 1-3 • Ilha-Atlas da Planta |
| 10 | GEO-C1-Q10 | Planta do município | 1-3 Rotas pelo Atlântico (Nave-cartográfica) | Montar planta | Fase 1-3 • Porto do Cartógrafo |
| 11 | GEO-C1-Q11 | Obra de Carybé | 1-3 Rotas pelo Atlântico (Nave-cartográfica) | Pessoal/rubrica (sem dados sensíveis) | Fase 1-3 • Galeria da Ilha da Arte |
| 12 | GEO-C1-Q12 | Influência africana na arte | 1-3 Rotas pelo Atlântico (Nave-cartográfica) | Várias respostas | Fase 1-3 • Galeria da Ilha da Arte |
| 13 | GEO-C1-Q14 | Imigração entre 1822 e 1900 | 1-4 Caminhos da Imigração (Corrida contra o GeoBot) | Várias respostas | Fase 1-4 • Posto da Gaia no meio da corrida |
| 14 | GEO-C1-Q15 | Imigração atual | 1-4 Caminhos da Imigração (Corrida contra o GeoBot) | Várias respostas | Fase 1-4 • Linha de chegada da corrida |
| 15 | GEO-C1-Q13 | Importância da terra | 1-5 Chefe: Generalizador (Batalha de chefe) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 1-5 • Escudo do Generalizador |
| 16 | GEO-C2-Q10 | Festa brasileira fora do país | 2-1 Labirinto das Culturas (Labirinto de coleta) | Pessoal/rubrica (sem dados sensíveis) | Fase 2-1 • Altar das Origens (2º conjunto) |
| 17 | GEO-C2-Q11 | Cultura brasileira em outros países | 2-1 Labirinto das Culturas (Labirinto de coleta) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 2-1 • Altar das Origens (3º conjunto) |
| 18 | GEO-C2-Q01 | Características do cordel | 2-2 Cordel em Movimento (Plataforma em xilogravura) | Várias respostas | Fase 2-2 • Feira do Cordel (1º folheto) |
| 19 | GEO-C2-Q02 | Caipora protetor da fauna | 2-2 Cordel em Movimento (Plataforma em xilogravura) | Múltipla escolha | Fase 2-2 • Entrada da Mata do Cordel |
| 20 | GEO-C2-Q03 | Caçador na mata | 2-2 Cordel em Movimento (Plataforma em xilogravura) | Múltipla escolha | Fase 2-2 • Portão da Mata |
| 21 | GEO-C2-Q16 | Como fazer xilogravura | 2-2 Cordel em Movimento (Plataforma em xilogravura) | Ordenar etapas | Fase 2-2 • Oficina do Xilogravador |
| 22 | GEO-C2-Q17 | Xilogravura da diversidade | 2-2 Cordel em Movimento (Plataforma em xilogravura) | Pessoal/rubrica (sem dados sensíveis) | Fase 2-2 • Prensa gigante no fim da fase |
| 23 | GEO-C2-Q04 | Festas e ritmos | 2-3 Ritmos do Brasil (Jogo de ritmo) | Classificar em grupos | Fase 2-3 • Palco final dos Ritmos |
| 24 | GEO-C2-Q12 | Enigma do acarajé | 2-4 Cozinha dos Povos (Quebra-cabeça de sílabas) | Montar sílabas + origem | Fase 2-4 • Panela Africana |
| 25 | GEO-C2-Q13 | Enigma da tapioca | 2-4 Cozinha dos Povos (Quebra-cabeça de sílabas) | Montar sílabas + origem | Fase 2-4 • Panela Indígena |
| 26 | GEO-C2-Q14 | Enigma do sarapatel | 2-4 Cozinha dos Povos (Quebra-cabeça de sílabas) | Montar sílabas + origem | Fase 2-4 • Panela Portuguesa |
| 27 | GEO-C2-Q15 | Classificação da culinária | 2-4 Cozinha dos Povos (Quebra-cabeça de sílabas) | Classificar em grupos | Fase 2-4 • Mesa do Banquete |
| 28 | GEO-C2-Q05 | Descrição sem julgamento | 2-5 Chefe: Sombra do Preconceito (Batalha de chefe) | Pessoal/rubrica (sem dados sensíveis) | Fase 2-5 • Escudo 1 da Sombra |
| 29 | GEO-C2-Q06 | Reação diante de zombaria | 2-5 Chefe: Sombra do Preconceito (Batalha de chefe) | Várias respostas | Fase 2-5 • Escudo 2 da Sombra |
| 30 | GEO-C2-Q07 | Colocar-se no lugar do outro | 2-5 Chefe: Sombra do Preconceito (Batalha de chefe) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 2-5 • Escudo 3 da Sombra |
| 31 | GEO-C2-Q08 | Costumes diferentes | 2-5 Chefe: Sombra do Preconceito (Batalha de chefe) | Várias respostas | Fase 2-5 • Escudo 4 da Sombra |
| 32 | GEO-C2-Q09 | Ser mais empático | 2-5 Chefe: Sombra do Preconceito (Batalha de chefe) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 2-5 • Escudo final da Sombra |
| 33 | GEO-C3-Q04 | Faixa leste mais povoada | 3-1 Do Litoral ao Interior (Corrida com mapa animado) | Múltipla escolha | Fase 3-1 • 1º Posto da corrida |
| 34 | GEO-C3-Q05 | Ocupação do interior | 3-1 Do Litoral ao Interior (Corrida com mapa animado) | Várias respostas | Fase 3-1 • 2º Posto da corrida |
| 35 | GEO-C3-Q06 | Por que o Sudeste atraiu migrantes? | 3-1 Do Litoral ao Interior (Corrida com mapa animado) | Múltipla escolha | Fase 3-1 • Chegada da corrida |
| 36 | GEO-C3-Q07 | Crescimento das cidades e periferias | 3-2 Cidade em Transformação (Ação e construção) | Várias respostas | Fase 3-2 • Praça Central da cidade |
| 37 | GEO-C3-Q08 | O que é infraestrutura? | 3-2 Cidade em Transformação (Ação e construção) | Múltipla escolha | Fase 3-2 • Central de Serviços |
| 38 | GEO-C3-Q09 | O que é pobreza energética? | 3-3 Energia para Todos (Labirinto de rede elétrica) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 3-3 • Casa da periferia no labirinto |
| 39 | GEO-C3-Q10 | Tabela de rendimentos | 3-3 Energia para Todos (Labirinto de rede elétrica) | Várias etapas (tabela/mapa + escolha) | Fase 3-3 • Painel da Usina |
| 40 | GEO-C3-Q01 | População desde 1970 | 3-4 Torre da População (Plataforma vertical) | Várias etapas (tabela/mapa + escolha) | Fase 3-4 • Andar 1970 → 2022 da Torre |
| 41 | GEO-C3-Q11 | Envelhecimento da população | 3-4 Torre da População (Plataforma vertical) | Várias respostas | Fase 3-4 • Andar das Faixas Etárias |
| 42 | GEO-C3-Q12 | Gráfico de 2022 | 3-4 Torre da População (Plataforma vertical) | Ordenar etapas | Fase 3-4 • Topo da Torre |
| 43 | GEO-C3-Q03 | Terras regularizadas | 3-5 Territórios e Direitos (Mapa e demarcação) | Várias etapas (tabela/mapa + escolha) | Fase 3-5 • Mesa dos Mapas de Territórios |
| 44 | GEO-C3-Q13 | Por que demarcar terras? | 3-5 Territórios e Direitos (Mapa e demarcação) | Resposta aberta (palavras-chave) ou blocos de ideias | Fase 3-5 • Marco final dos Territórios |
| 45 | GEO-C3-Q02 | União fora da Copa | 3-6 Chefe Final: Vírus da Desigualdade (Batalha final) | Pessoal/rubrica (sem dados sensíveis) | Fase 3-6 • Golpe final no Vírus da Desigualdade |


## 8. Checklist dos capítulos e fases

**Capítulo 1 — O Mosaico do Povo Brasileiro**
- [x] 1-1 Festival da Diversidade: plataforma lateral com molas, plataformas móveis, Blocos do Erro e totens (Q01–Q04)
- [x] 1-2 Mapa dos Povos Originários: exploração vista de cima com peças do mapa histórico e portais (Q05–Q08)
- [x] 1-3 Rotas pelo Atlântico: nave-cartográfica com Ilhas-Atlas e trecho de memória respeitoso (Q09–Q12)
- [x] 1-4 Caminhos da Imigração: corrida contra o GeoBot com portais de rota e rota de recuperação (Q14, Q15)
- [x] 1-5 Chefe Generalizador: placas falsas, escudo e segunda aplicação (Q13)

**Capítulo 2 — Culturas que se Encontram**
- [x] 2-1 Labirinto das Culturas: altares das origens, poder Empatia e Sombras (Q10, Q11)
- [x] 2-2 Cordel em Movimento: plataforma em estilo xilogravura, versos do Caipora e prensa (Q01–Q03, Q16, Q17)
- [x] 2-3 Ritmos do Brasil: Festa do Divino, samba de roda e toré (Q04)
- [x] 2-4 Cozinha dos Povos: sílabas caindo, origens e quadro da culinária (Q12–Q15)
- [x] 2-5 Chefe Sombra do Preconceito: 5 camadas vencidas por empatia (Q05–Q09)

**Capítulo 3 — O Brasil que Muda**
- [x] 3-1 Do Litoral ao Interior: corrida com mapa animado da ocupação (Q04–Q06)
- [x] 3-2 Cidade em Transformação: quebra-cabeça de planejamento, entregas de serviços e “antes e depois” (Q07, Q08)
- [x] 3-3 Energia para Todos: labirinto da rede elétrica e quebra-cabeça de infraestrutura (Q09, Q10)
- [x] 3-4 Torre da População: plataforma vertical com a tabela de 1950 a 2022, faixas etárias e gráfico (Q01, Q11, Q12)
- [x] 3-5 Territórios e Direitos: mapas, marcos de demarcação e proteção (Q03, Q13)
- [x] 3-6 Chefe final Vírus da Desigualdade: placas, reflexão sobre união e restauração de serviços (Q02)

**Final**: resumo dos 3 capítulos, Revisão da Prova, troféu, EcoMoedas, item temático e repetição em Estudo rápido.

## 9. Recursos externos

Lista completa, com link, autor e licença, em `CREDITOS.md`:
- Kenney (CC0): Pixel Platformer, Pixel Shmup, Tiny Town, Tiny Dungeon e RPG Urban Pack.
- `@svg-maps/brazil` de Victor Cazanave (CC BY 4.0).
- Fontes Press Start 2P e Nunito (OFL 1.1).
- Personagens, músicas, efeitos, mapas temáticos, planta e ilustrações foram criados para o projeto. Nada foi copiado de franquias comerciais nem de buscas de imagens.

## 10. Resultado dos testes

| Teste | Resultado |
|---|---|
| `src/tests/ciencias-regressao.cjs` | 32/32 arquivos de Ciências idênticos; `tools/audit.cjs` sem problemas; `tools/features.cjs` 74 verificações ✓; save de Ciências idêntico byte a byte; “Continuar” funciona — **Ciências intacta** |
| `e2e.cjs otimo` (Aventura, acerta de primeira) | 45/45 questões, 16/16 fases, final e troféu; 959 EcoMoedas, nível 10; medalhas prata/ouro/diamante; 0 erros no console — **OK** |
| `e2e.cjs erros` (erra 2 vezes antes de acertar) | 45/45 questões; as 38 não pessoais passam por pista, redução de alternativas e versão guiada e são registradas “com ajuda”; campanha concluída com 683 EcoMoedas (desempenho mínimo não bloqueia) — **OK** |
| `e2e.cjs rapido` (Estudo rápido) | 45/45 questões pelo modo Estudo rápido, 16/16 fases — **OK** |
| `features.cjs` | 45 IDs exatas e cada uma em uma fase; modelo pedagógico completo; primeira questão em ~5 s; pergunta pausa a ação e o tempo; voz; fluxo de 3 erros; respostas abertas com variações; perguntas pessoais sem dados guardados; acessibilidade e remapeamento; loja persiste; painel e exportação .txt/.json; revisão; retomada de checkpoint; pausa; módulo vazio; isolamento de chaves — **todos passaram** |
| `layouts.cjs` | 1366x768 (16 fases + telas), 1920x1080 e 390x844 sem rolagem horizontal e sem erros no console — **OK** |

## 11. Limitações reais restantes

- A leitura em voz alta depende das vozes pt-BR instaladas no aparelho/navegador. Sem voz disponível, o botão avisa.
- No celular em pé, a tela de ação fica pequena. O jogo sugere girar o aparelho; as perguntas e painéis se adaptam bem aos 390 px.
- Os mapas de terras indígenas e quilombolas e o de rotas são **esquemáticos** (feitos a partir da leitura orientada do material), não cartografia oficial com limites exatos.
- A cena “inspirada em Carybé” é uma ilustração própria. A pintura original não está no jogo por questão de direitos autorais; a pergunta pessoal Q11 se baseia nessa ilustração.
- Os testes automáticos usam atalhos para percorrer as fases rapidamente. A jogabilidade manual (pular, desviar, tocar no ritmo) foi verificada por testes de teclado e capturas de tela, não por uma pessoa jogando do começo ao fim.
