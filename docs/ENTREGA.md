# Missão EcoNexus: Guardiões dos Biomas — Documento de entrega

> Gerado automaticamente por `tools/gen-docs.cjs` a partir dos dados do jogo. Todo o código está nos arquivos do projeto (pasta `econexus/`).

## 1. Resumo da arquitetura

- **Tecnologia:** HTML + CSS + JavaScript puro com **Canvas 2D**. Sem frameworks, sem CDN, sem internet, sem login, sem build. Os scripts são “clássicos” (não usam módulos ES), por isso o jogo abre com **duplo clique no `index.html`** (protocolo `file://`).
- **Motor 2D** (`js/core/engine.js`): ciclo de jogo com `requestAnimationFrame`, mapas em tiles pré-desenhados (cache em canvas), colisão por caixas (AABB) com tiles e entidades sólidas, câmera suave com limites, NPCs que andam e param para olhar o jogador, indicador de interação, seguidores (Lumi e mascote), partículas, névoa por região, rota “mostrar caminho” (BFS), seta da Bússola, lanterna na caverna, joystick virtual e teclado.
- **Arte** (`js/core/sprites.js`): tudo desenhado por código (personagens em 4 direções com animação de parado/andando/comemorando, itens equipados refletidos no avatar, Lumi, mascotes, objetos, tiles) + emojis do sistema.
- **Dados das regiões** (`js/data/maps.js` + `mapkit.js`): 15 mapas construídos por código (sempre consistentes), entidades com posição, condições de visibilidade e “patches” que mudam o cenário conforme o progresso.
- **Dados pedagógicos:** `questions.js` (matriz das 43 questões do livro), `lessons.js` (lições, regiões, missões secundárias, Arena), `glossary.js` (16 palavras clicáveis + 24 fichas do Caderno), `characters.js` (elenco).
- **Sistemas:** `learning.js` (12 tipos de atividade + 3 pré-atividades, 3 folhas, pista, versão guiada, microexplicação, anti-chute, questão semelhante de confirmação, desafios, recuperação, revisão), `quests.js` (missão principal por etapas, desbloqueio linear, objetivo e rota, secundárias, domínio), `economy.js` (XP/níveis, EcoMoedas, loja, inventário, equipamentos, efeitos, limite dos minijogos), `minigames.js` (7 minijogos + 1 desafio cronometrado opcional), `save.js` (salvamento automático no `localStorage`).
- **Interface** (`js/ui/ui.js`): pilha de janelas, diálogo com retrato/nome/ouvir/voltar/continuar, cartões de explicação, HUD, menu, loja, inventário, Caderno, área do responsável (conta de multiplicação), mural, portal das regiões, jardim, troféus, certificado, tela inicial.
- **Fachada do jogo** (`js/main.js`): liga tudo — interação com entidades, lições, altares, Arena, viagens entre mapas, coletáveis, tempo por região e salvamento.
- **Ferramentas de teste** (`tools/`): `audit.cjs` (auditoria lógica sem navegador), `economy-sim.cjs`, `e2e.cjs` + `autoplayer.js` (joga a campanha inteira pela interface real), `features.cjs` (testes funcionais), `gen-docs.cjs`.

## 2. Árvore de arquivos

```
econexus/
  README.md  (4 KB)
  css/
    style.css  (34 KB)
  docs/
  index.html  (4 KB)
  js/
    core/
      audio.js  (4 KB)
      engine.js  (26 KB)
      sprites.js  (48 KB)
      util.js  (6 KB)
    data/
      characters.js  (5 KB)
      glossary.js  (20 KB)
      items.js  (16 KB)
      lessons.js  (77 KB)
      mapkit.js  (3 KB)
      maps.js  (61 KB)
      questions.js  (114 KB)
    main.js  (30 KB)
    systems/
      economy.js  (6 KB)
      learning.js  (61 KB)
      minigames.js  (26 KB)
      quests.js  (8 KB)
      save.js  (3 KB)
    ui/
      ui.js  (54 KB)
  tools/
    audit.cjs  (7 KB)
    autoplayer.js  (13 KB)
    e2e.cjs  (6 KB)
    economy-sim.cjs  (4 KB)
    features.cjs  (27 KB)
    gen-docs.cjs  (14 KB)
```

## 3. Conteúdo dos arquivos

O conteúdo integral de cada arquivo está no próprio projeto (nenhum trecho foi omitido ou resumido). Para ler, abra os arquivos listados acima em qualquer editor de texto.

## 4. Como executar no Windows

1. Baixe a pasta `econexus` (por exemplo, “Code → Download ZIP” no GitHub) e **extraia** o ZIP.
2. Abra a pasta `econexus` e dê **duplo clique em `index.html`**. O jogo abre no navegador (Chrome, Edge ou Firefox) e funciona **sem internet**.
3. Clique em **Novo jogo**, confirme o nome (já vem “Gabriel”) e jogue. O progresso salva sozinho neste computador. Na próxima vez, use **Continuar**.
4. (Opcional) Para tela cheia, use o botão ⛶. No celular/tablet, os controles de toque aparecem automaticamente.

## 5. Checklist das 43 questões do livro

Cada questão aparece **dentro da campanha**, numa lição ligada a um NPC/objeto do mapa. Depois de respondida, o cenário muda. Na revisão final (Desafio da Região, Arena e “Revisão antes da prova”) ela volta como **variação**; se foi errada, volta no formato original.

| ID | Região / mapa | Onde aparece (NPC/objeto) | Lição | Interação | Conceito | Mudança no cenário |
|---|---|---|---|---|---|---|
| L1-Q1 | Trilha dos Animais Livres (`r1`) | Clareira dos Tocos — macaco Tico (com a Guardiã Nara) | O macaco sem floresta | Resposta aberta (palavras-chave + autoavaliação) | habitat | Mudas aparecem ao redor dos tocos da clareira. |
| L1-Q2 | Trilha dos Animais Livres (`r1`) | Clareira dos Tocos — Guardiã Nara | O macaco sem floresta | Marcar várias | habitat | As mudas viram árvores jovens e o macaco Tico volta a subir nelas. |
| L1-Q3 | Trilha dos Animais Livres (`r1`) | Posto da Guarda — placa “Animais Silvestres” (com o cachorro Pipoca) | Silvestre ou doméstico? | Escolha + justificativa | silvestre | A placa “Animais Silvestres: observe de longe” acende e uma família de macacos aparece nas árvores. |
| L1-Q4 | Trilha dos Animais Livres (`r1`) | Mirante do Pantanal | Vida no Pantanal | Desenhar setas (origem → destino) | cadeia | Capivaras pastam no alagado e uma onça aparece ao longe. |
| L1-Q5 | Trilha dos Animais Livres (`r1`) | Mirante do Pantanal — painel de populações | Vida no Pantanal | Marcar várias + simulação +/− de populações | teia | O painel de equilíbrio do mirante fica verde. |
| L1-Q6 | Trilha dos Animais Livres (`r1`) | Ateliê da Pesquisadora Aurora | Fotografia e desenho | Resposta aberta (palavras-chave + autoavaliação) | biodiversidade | O cavalete da Aurora mostra o desenho científico da capivara. |
| L2-Q1 | Vale das Cadeias Alimentares (`r2`) | Horta do Professor Broto | Quem produz, quem consome | Classificar cartões (arrastar/tocar) | produtores | Plaquinhas “produtor” e “consumidor” brotam na horta. |
| L2-Q2 | Vale das Cadeias Alimentares (`r2`) | Painel das Setas (Vale) | O sentido da seta | Contar (+/−) | niveis | Degraus numerados aparecem no Painel das Setas. |
| L2-Q3 | Vale das Cadeias Alimentares (`r2`) | Painel das Setas (Vale) | O sentido da seta | Classificar cartões (arrastar/tocar) | consumidores | As setas do Painel ficam douradas. |
| L2-Q4 | Vale das Cadeias Alimentares (`r2`) | Sítio da Agricultora Maru — paisagem rural | Cadeias da paisagem rural | Montar cadeias na cena | cadeia | Na paisagem da Maru, os animais aparecem nos lugares certos. |
| L2-Q5 | Vale das Cadeias Alimentares (`r2`) | Clareira da Floresta — Quadro da Floresta | Os decompositores | Classificar cartões (arrastar/tocar) | decompositores | A legenda da clareira aparece e os cogumelos do tronco brilham. |
| L2-Q6 | Vale das Cadeias Alimentares (`r2`) | Ponte das Setas Invertidas | A ponte das setas invertidas | Ordenar (arrastar/tocar) | seta | As setas da ponte se desviram e a passagem para a floresta se abre. |
| L2-Q7 | Vale das Cadeias Alimentares (`r2`) | Lago do Vale — Pescadora Iná e o Painel da Teia | A teia do lago | Marcar várias + simulação +/− de populações | teia | O Painel da Teia acende as setas dos camundongos. |
| L2-Q8 | Vale das Cadeias Alimentares (`r2`) | Lago do Vale — Painel da Teia | A teia do lago | Múltipla escolha | decompositores | Os cogumelos da teia brilham e o solo do Vale fica mais escuro e fértil. |
| L2-Q9 | Vale das Cadeias Alimentares (`r2`) | Lago do Vale — Painel da Teia | A teia do lago | Múltipla escolha + seguir o caminho das setas na teia | teia | A teia inteira acende e o Lago do Vale fica cheio de vida. |
| L3-Q1 | Laboratório dos Ciclos (`r3`) | Sala do Carbono — Dra. Cicla | Onde está o carbono | Marcar várias | carbono | Os frascos da Sala do Carbono acendem. |
| L3-Q2 | Laboratório dos Ciclos (`r3`) | Medidor de Pegada Ecológica | A pegada ecológica | Múltipla escolha | pegada | O Medidor de Pegada acende a tela. |
| L3-Q3 | Laboratório dos Ciclos (`r3`) | Medidor de Pegada Ecológica | A pegada ecológica | Resposta aberta (palavras-chave + autoavaliação) | pegada | As lâmpadas desnecessárias do laboratório se apagam sozinhas. |
| L3-Q4 | Laboratório dos Ciclos (`r3`) | Medidor de Pegada Ecológica | A pegada ecológica | Marcar várias | pegada | O ponteiro do Medidor volta para a zona verde. |
| L3-Q5 | Laboratório dos Ciclos (`r3`) | Sala do Nitrogênio — Robô Bip | O ciclo do nitrogênio | Completar frase com blocos | nitrogenio | Bip fecha o saco de fertilizante e mede só o necessário. |
| L3-Q6 | Laboratório dos Ciclos (`r3`) | Sala do Nitrogênio — Robô Bip | O ciclo do nitrogênio | Classificar cartões (arrastar/tocar) | nitrogenio | As plantas da estufa perdem o amarelado e ficam verdes. |
| L3-Q7 | Laboratório dos Ciclos (`r3`) | Sala do Oxigênio — Máquina dos Gases | A Máquina dos Gases | Desenhar setas (origem → destino) | oxigenio | A Máquina dos Gases liga e as tubulações coloridas brilham. |
| L3-Q8 | Laboratório dos Ciclos (`r3`) | Composteira — Seu Composto | A composteira | Ordenar (arrastar/tocar) | compostagem | A composteira gera adubo e a estufa floresce. |
| L3-Q9 | Laboratório dos Ciclos (`r3`) | Sala do Carbono — Telão do Clima | Efeito estufa e aquecimento | Resposta aberta (palavras-chave + autoavaliação) | estufa | O termômetro do Telão do Clima baixa um pouco. |
| L3-Q10 | Laboratório dos Ciclos (`r3`) | Sala do Oxigênio — Janela de Observação | A Máquina dos Gases | Cena: tocar nos itens certos | carbono | A janela de observação mostra os gases coloridos em movimento. |
| L3-Q11 | Laboratório dos Ciclos (`r3`) | Salão Central — Grande Diagrama dos Ciclos | O Grande Diagrama | Colorir setas por ciclo | carbono | O Grande Diagrama se ilumina em azul, vermelho e preto; todas as máquinas funcionam. |
| L4-Q1 | Lago Esverdeado (`r4`) | Margem do Lago — Ribeirinho Téo (após investigar as três entradas) | As entradas de nutrientes | Cena: tocar nos itens certos | eutrofizacao | Placas de aviso aparecem nas três entradas de nutrientes. |
| L4-Q2 | Lago Esverdeado (`r4`) | Horta do Agricultor Dito — Quadro das Etapas | As etapas da eutrofização | Múltipla escolha | eutrofizacao | Aeradores ligam e bolhas de oxigênio sobem no lago. |
| L4-Q3 | Lago Esverdeado (`r4`) | Estação de Tratamento — Engenheira Clara | Recuperar o lago | Marcar várias | eutrofizacao | A estação de tratamento funciona e a água do lago começa a clarear. |
| L5-Q1 | Torre da Energia e dos Ecossistemas (`r5`) | Topo da Torre — Sala da Pirâmide | A Sala da Pirâmide | Contar (+/−) | piramide | A pirâmide do topo acende em cores, da base verde ao topo vermelho. |
| L5-Q2 | Torre da Energia e dos Ecossistemas (`r5`) | Área Queimada — Guarda Jatobá | Ecossistema em desequilíbrio | Classificar cartões (arrastar/tocar) | desequilibrio | Brotos verdes surgem na área queimada. |
| L5-Q3 | Torre da Energia e dos Ecossistemas (`r5`) | Jardim da Garrafa — Tuane | O ecossistema na garrafa | Múltipla escolha + observação (tempo passando) | ecossistema | Gotinhas aparecem na garrafa gigante do jardim. |
| L5-Q4 | Torre da Energia e dos Ecossistemas (`r5`) | Jardim da Garrafa — Tuane | O ecossistema na garrafa | Resposta aberta (palavras-chave + autoavaliação) | ecossistema | Setas de água e de gases giram ao redor da garrafa. |
| L5-Q5 | Torre da Energia e dos Ecossistemas (`r5`) | Jardim da Garrafa — Tuane | O ecossistema na garrafa | Marcar várias | ecossistema | A garrafa gigante mostra a planta e o solo cheio de vida microscópica. |
| L5-Q6 | Torre da Energia e dos Ecossistemas (`r5`) | Jardim da Garrafa — Tuane | O ecossistema na garrafa | Marcar várias | niveis | Etiquetas “produtor” e “decompositores” aparecem na garrafa. |
| L5-Q7 | Torre da Energia e dos Ecossistemas (`r5`) | Jardim da Garrafa — Tuane | O ecossistema na garrafa | Classificar cartões (arrastar/tocar) | decompositores | O Jardim da Garrafa floresce ao redor. |
| L6-Q1 | Portal dos Biomas Brasileiros (`r6`) | Posto de Resgate — Gaiola 1 (Agente Iara) | Gaiola 1: o crime | Escolha + justificativa | desequilibrio | A primeira gaiola se abre e um grupo de aves voa para a reserva. |
| L6-Q2 | Portal dos Biomas Brasileiros (`r6`) | Posto de Resgate — Gaiola 2 (Agente Iara) | Gaiola 2: a denúncia | Marcar várias | desequilibrio | A segunda gaiola se abre e mais aves voam livres. |
| L6-Q3 | Portal dos Biomas Brasileiros (`r6`) | Posto de Resgate — Gaiola 4 (Agente Iara) | Gaiola 4: o desequilíbrio | Resposta aberta (palavras-chave + autoavaliação) | desequilibrio | A última gaiola se abre: todas as aves voam para a reserva. |
| L6-Q4 | Portal dos Biomas Brasileiros (`r6`) | Portal do Cerrado — Totem | O Cerrado | Múltipla escolha | biomas | O totem do Cerrado acende e flores aparecem entre as árvores retorcidas. |
| L6-Q5 | Portal dos Biomas Brasileiros (`r6`) | Portal da Mata Atlântica — Totem | A Mata Atlântica | Múltipla escolha | biomas | O totem da Mata Atlântica acende e aves coloridas aparecem. |
| L6-Q6 | Portal dos Biomas Brasileiros (`r6`) | Portal do Cerrado — Guia Jurema | Queimadas no Cerrado | Marcar várias | desequilibrio | Jurema instala placas “Previna queimadas” no Cerrado. |
| L6-Q7 | Portal dos Biomas Brasileiros (`r6`) | Portal do Cerrado — Guia Jurema (trecho queimado) | Queimadas no Cerrado | Resposta aberta (palavras-chave + autoavaliação) | nitrogenio | O trecho queimado do Cerrado começa a se recuperar. |

Recompensas por questão: de primeira **100 XP + 12 🪙**; na 2ª tentativa/com pista **70 XP + 8 🪙**; após explicação guiada **40 XP + 5 🪙**; bônus de recuperação ao acertar depois de ter errado **20 XP + 3 🪙** (uma vez por questão).

## 6. Tabela completa da economia

Raridades: **Comum** 15–35 (libera no nível 1) • **Incomum** 40–75 (libera no nível 2) • **Raro** 80–140 (libera no nível 4) • **Épico** 150–240 (libera no nível 6) • **Lendário** 280+ (libera no nível 9). XP nunca é gasto; EcoMoedas são gastas na loja. Não há sorteios, caixas ou dinheiro real.

| ID | Item | Categoria | Raridade | Preço | Efeito | Requisito | Área bônus |
|---|---|---|---|---|---|---|---|
| `uni_classico` | 👕 Uniforme Clássico | Skins e roupas | Comum | inicial | Uniforme inicial do Guardião. | — | — |
| `uni_verde` | 🟩 Uniforme Verde-Floresta | Skins e roupas | Comum | 15 | Visual: uniforme verde. | Nível 1 | — |
| `uni_azul` | 🟦 Uniforme Azul-Rio | Skins e roupas | Comum | 20 | Visual: uniforme azul. | Nível 1 | — |
| `uni_sol` | 🟨 Uniforme Amarelo-Sol | Skins e roupas | Comum | 25 | Visual: uniforme amarelo. | Nível 1 | — |
| `uni_folhas` | 🍃 Camiseta Estampa de Folhas | Skins e roupas | Incomum | 45 | Visual: camiseta com folhas. | Nível 2 | — |
| `uni_crepusculo` | 🟪 Uniforme Crepúsculo | Skins e roupas | Incomum | 60 | Visual: uniforme roxo listrado. | Nível 2 | — |
| `set_cerrado` | 🌾 Conjunto Guardião do Cerrado | Skins e roupas | Épico | 180 | Conjunto completo: roupa, chapéu de palha e capa dourada. | Nível 6 | — |
| `set_arcoiris` | 🌈 Traje Arco-Íris do Pantanal | Skins e roupas | Lendário | 300 | Conjunto lendário com capa e brilho. | Nível 9 | — |
| `chapeu_explorador` | 🤠 Chapéu de Explorador | Skins e roupas | Comum | 30 | Visual: chapéu de aba larga. | Nível 1 | — |
| `bone_folha` | 🧢 Boné Folhinha | Skins e roupas | Comum | 20 | Visual: boné com uma folha. | Nível 1 | — |
| `gorro_rio` | 🧶 Gorro Correnteza | Skins e roupas | Comum | 25 | Visual: gorro azul. | Nível 1 | — |
| `coroa_folhas` | 🌿 Coroa de Folhas | Skins e roupas | Raro | 110 | Visual: coroa de folhas com semente dourada. | Nível 4 | — |
| `chapeu_sol` | ☀️ Chapéu Raios de Sol | Skins e roupas | Épico | 170 | Visual: chapéu com raios solares. | Nível 6 | — |
| `capa_folhas` | 🟢 Capa de Folhas | Skins e roupas | Incomum | 60 | Visual: capa verde. | Nível 2 | — |
| `capa_rio` | 🔵 Capa Correnteza | Skins e roupas | Raro | 95 | Visual: capa azul-rio. | Nível 4 | — |
| `capa_estelar` | 🌌 Capa Noite Estrelada | Skins e roupas | Épico | 210 | Visual: capa roxa que deixa estrelinhas. | Nível 6 | — |
| `mochila_lona` | 🎒 Mochila de Lona | Acessórios | Comum | 20 | Visual: mochila marrom. | Nível 1 | — |
| `oculos_sol` | 🕶️ Óculos de Sol | Acessórios | Comum | 25 | Visual: óculos escuros. | Nível 1 | — |
| `oculos_cientista` | 👓 Óculos de Cientista | Acessórios | Incomum | 45 | Visual: óculos redondos. | Nível 2 | — |
| `botas_trilha` | 🥾 Botas Vermelhas de Trilha | Acessórios | Comum | 30 | Visual: botas vermelhas. | Nível 1 | — |
| `aura_folhas` | 💚 Aura de Folhas | Acessórios | Raro | 120 | Visual: brilho verde ao redor. | Nível 4 | — |
| `aura_gotas` | 💙 Aura de Gotas | Acessórios | Raro | 130 | Visual: brilho azul ao redor. | Nível 4 | — |
| `aura_solar` | 💛 Aura Solar Dourada | Acessórios | Épico | 200 | Visual: brilho dourado ao redor. | Nível 6 | — |
| `rastro_flores` | 🌸 Rastro de Flores | Acessórios | Incomum | 70 | Visual: pétalas ao caminhar. | Nível 2 | — |
| `rastro_bolhas` | 🫧 Rastro de Bolhas | Acessórios | Raro | 90 | Visual: bolhinhas ao caminhar. | Nível 4 | — |
| `rastro_estrelas` | ⭐ Rastro de Estrelas | Acessórios | Épico | 220 | Visual: estrelinhas ao caminhar. | Nível 6 | — |
| `lumi_classica` | 💧 Lumi Clássica | Companheiros | Comum | inicial | A Lumi de sempre: folha, gota e luz. | — | — |
| `lumi_orvalho` | 💠 Lumi Orvalho | Companheiros | Incomum | 50 | Visual: Lumi azul-orvalho. | Nível 2 | — |
| `lumi_ipe` | 🌼 Lumi Ipê | Companheiros | Raro | 100 | Visual: Lumi rosa com folha amarela. | Nível 4 | — |
| `lumi_aurora` | 🌅 Lumi Amanhecer | Companheiros | Épico | 190 | Visual: Lumi verde-clara com folha laranja. | Nível 6 | — |
| `lumi_cristal` | 💎 Lumi Cristal | Companheiros | Lendário | 320 | Visual lendário: Lumi de cristal brilhante. | Nível 9 | — |
| `pet_joaninha` | 🐞 Joaninha Pontinho | Companheiros | Comum | 30 | Mascote que segue você. | Nível 1 | — |
| `pet_peixe` | 🐟 Peixinho Bolha | Companheiros | Comum | 35 | Mascote que flutua numa bolha. | Nível 1 | — |
| `pet_tatu` | 🪨 Tatuzinho Bolinha | Companheiros | Incomum | 60 | Mascote que rola atrás de você. | Nível 2 | — |
| `pet_arara` | 🦜 Ararinha Brisa | Companheiros | Raro | 120 | Mascote colorida que acompanha você. | Nível 4 | — |
| `pet_lobo` | 🐺 Lobinho Brasa | Companheiros | Épico | 240 | Mascote de pernas longas e pelo laranja. | Nível 6 | — |
| `botas_explorador` | 👢 Botas do Explorador | Melhorias de exploração | Incomum | 45 | Anda 15% mais rápido pelos mapas (não afeta atividades nem perguntas). | Nível 2 | — |
| `mochila_ampliada` | 🎒 Mochila Ampliada | Melhorias de exploração | Incomum | 55 | Mostra no HUD quantos EcoFragmentos faltam no mapa e libera a aba “Lembranças” no inventário. | Nível 2 | — |
| `lupa_ecologica` | 🔍 Lupa Ecológica | Melhorias de exploração | Incomum | 50 | Destaca baús e pontos secretos próximos com um círculo brilhante. | Nível 2 | — |
| `bussola_lumi` | 🧭 Bússola de Lumi | Melhorias de exploração | Comum | 35 | Mostra uma seta dourada até o próximo objetivo. | Nível 1 | — |
| `medalhao_solar` | 🏅 Medalhão Solar | Melhorias de exploração | Raro | 90 | +2 EcoMoedas extras ao acertar uma questão de primeira (limite total: 40 moedas). | Nível 4 | — |
| `cantil` | 🧴 Cantil Restaurador | Melhorias de exploração | Incomum | 40 | Recupera 1 folha de energia, uma vez por missão. | Nível 2 | — |
| `caderno_melhorado` | 📘 Caderno Melhorado | Melhorias de exploração | Comum | 30 | Adiciona busca no Caderno e a aba “Questões estudadas”, com as explicações já vistas. | Nível 1 | — |
| `ima_fragmentos` | 🧲 Ímã de EcoFragmentos | Melhorias de exploração | Incomum | 60 | Atrai EcoFragmentos próximos (raio de 3 passos e meio). | Nível 2 | — |
| `mascara_mergulho` | 🤿 Máscara de Mergulho | Chaves e ferramentas | Incomum | 60 | Abre o Mergulho do Lago: coleta de bolhas de oxigênio (área bônus). | Nível 2 | Mergulho do Lago (bônus) |
| `corda_escalada` | 🪢 Corda de Escalada | Chaves e ferramentas | Incomum | 55 | Abre a Copa da Floresta: observação de biodiversidade (área bônus). | Nível 2 | Copa da Floresta (bônus) |
| `chave_lab` | 🗝️ Chave do Laboratório | Chaves e ferramentas | Raro | 85 | Abre a Sala Bônus de Montagem dos Ciclos. | Nível 4 | Sala Bônus dos Ciclos |
| `lanterna` | 🔦 Lanterna Ecológica | Chaves e ferramentas | Raro | 90 | Abre a Caverna dos Decompositores e ilumina mais longe. | Nível 4 | Caverna dos Decompositores (bônus) |
| `passe_biomas` | 🎫 Passe dos Biomas | Chaves e ferramentas | Épico | 160 | Abre as Trilhas Extras dos seis biomas. | Nível 6 | Trilhas Extras dos Biomas (bônus) |
| `semente_rara` | 🌰 Semente Rara | Chaves e ferramentas | Incomum | 40 | Abre o Canteiro Secreto do Jardim da Vila e libera plantas raras para decorar. | Nível 2 | Canteiro Secreto (Vila) |
| `deco_samambaia` | 🪴 Vaso de Samambaia | Decorações | Comum | 15 | Decora o quarto do Guardião. | Nível 1 | — |
| `deco_placa` | 🪧 Placa “Guardião em Ação” | Decorações | Comum | 20 | Decora o quarto do Guardião. | Nível 1 | — |
| `deco_tapete` | 🟫 Tapete de Folhas | Decorações | Comum | 25 | Decora o quarto do Guardião. | Nível 1 | — |
| `deco_estante` | 🗄️ Estante de Troféus | Decorações | Incomum | 50 | Mostra suas medalhas no quarto. | Nível 2 | — |
| `deco_mapa` | 🗺️ Mapa dos Biomas | Decorações | Incomum | 65 | Quadro com os seis biomas brasileiros. | Nível 2 | — |
| `deco_luminaria` | 🏮 Luminária de Vaga-lumes | Decorações | Raro | 85 | Luz suave no quarto. | Nível 4 | — |
| `deco_aquario` | 🐠 Aquário Virtual | Decorações | Raro | 110 | Aquário com peixinhos animados. | Nível 4 | — |
| `deco_poltrona` | 🪑 Poltrona de Raízes | Decorações | Épico | 170 | Poltrona especial no quarto. | Nível 6 | — |
| `deco_trofeu` | 🏆 Troféu Dourado do Guardião | Decorações | Lendário | 280 | Troféu lendário para exibir. | Nível 9 | — |
| `deco_arvore` | 🌳 Árvore da Vida em Miniatura | Decorações | Lendário | 350 | Arvorezinha brilhante no quarto. | Nível 9 | — |

Baús de conteúdo conhecido (sem sorteio): Trilha dos Animais Livres: 15 🪙 + Chapéu de Explorador; Vale das Cadeias Alimentares: 15 🪙 + Mochila de Lona; Laboratório dos Ciclos: 15 🪙 + Óculos de Cientista; Lago Esverdeado: 15 🪙 + Peixinho Bolha; Torre da Energia e dos Ecossistemas: 15 🪙 + Estante de Troféus; Portal dos Biomas Brasileiros: 20 🪙 + Capa de Folhas; Arena ≥ 70%: 40 🪙 + Coroa de Folhas + medalha Mestre da Restauração (abaixo de 70%: 15 🪙 após revisão guiada).

## 7. Checklist de cada mapa

| Mapa | NPCs | Pontos de interação | Missão principal (etapas) | Secundárias | Minijogo | Segredo | Saída | Transformação visual |
|---|---|---|---|---|---|---|---|---|
| Trilha dos Animais Livres | Guia Kauã, Guardiã Nara, Pesquisadora Aurora | 22 | Preparar a investigação → Do que os animais precisam → O macaco sem floresta → Silvestre ou doméstico? → Vida no Pantanal → Fotografia e desenho → Desafio da Região | Trilha limpa; Pegadas do Pantanal | Pista: Trilha Segura | baú secreto + 5 EcoFragmentos | Portal para a Vila | 2 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Vale das Cadeias Alimentares | Professor Broto, Professor Broto, Agricultora Maru, Professor Broto, Pescadora Iná | 17 | Quem produz, quem consome → O sentido da seta → Cadeias da paisagem rural → A ponte das setas invertidas → Os decompositores → A teia do lago → Desafio da Região | Sementes perdidas; Caderno de campo | Corredor da Cadeia | baú secreto + 5 EcoFragmentos | Portal para a Vila | 2 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Laboratório dos Ciclos | Dra. Cicla, Robô Bip, Seu Composto | 20 | Onde está o carbono → A Máquina dos Gases → Efeito estufa e aquecimento → A pegada ecológica → O ciclo do nitrogênio → A composteira → O Grande Diagrama → Desafio da Região | Restos para a composteira; Economia de energia | Coleta Solar | baú secreto + 5 EcoFragmentos | Portal para a Vila | 1 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Lago Esverdeado | Ribeirinho Téo, Agricultor Dito, Engenheira Clara | 13 | O lago verde → As entradas de nutrientes → As etapas da eutrofização → Recuperar o lago → Desafio da Região | Margem sem resíduos; Proteger as margens | Salve o Lago | baú secreto + 5 EcoFragmentos | Portal para a Vila | 2 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Torre da Energia e dos Ecossistemas | Mestre Solar, Guarda Jatobá, Tuane | 17 | Matéria e energia → Os andares fora de ordem → A Sala da Pirâmide → Ecossistema em desequilíbrio → O ecossistema na garrafa → Desafio da Região | Sementes nativas; Visita aos andares | Torre dos Níveis | baú secreto + 5 EcoFragmentos | Portal para a Vila | 2 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Portal dos Biomas Brasileiros | Bia Bioma, Guia Jurema, Agente Iara | 23 | A Praça dos Portais → O Cerrado → Queimadas no Cerrado → A Mata Atlântica → Os outros quatro biomas → A notícia das aves → Gaiola 1: o crime → Gaiola 2: a denúncia → Gaiola 3: o destino das aves → Gaiola 4: o desequilíbrio → Desafio da Região | Penas perdidas; Álbum dos biomas | Corrida dos Biomas | baú secreto + 5 EcoFragmentos | Portal para a Vila | 3 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |
| Arena Final: Restauração do EcoNexus | Mestre Solar, Guardiã Nara, Bia Bioma | 10 | Reconhecer → Construir → Explicar → Chefão da Névoa | Os seis pilares; Estilhaços de Névoa | Desafio Relâmpago (opcional) | baú secreto + 5 EcoFragmentos (arena: baú) | Portal para a Vila | 4 mudanças de tiles + entidades que aparecem/somem + névoa que se dissipa |

Vila EcoNexus (base): Loja do Guardião (prédio explorável com Nino Mercador e 6 setores), Casa de Lumi (armário de skins, sala de troféus, vitrine dos cristais, Caderno, decorações), Mural de Missões, Portal das Regiões, Portal da Arena, Jardim da Vila e Canteiro Secreto. A vila ganha bandeiras, flores, fonte limpa, balão e estátua conforme os cristais voltam. Áreas bônus: Copa da Floresta, Caverna dos Decompositores (escura, com lanterna), Sala Bônus dos Ciclos, Mergulho do Lago, Trilhas Extras dos Biomas.

## 8. Simulações da economia (mínimo, médio e ótimo)

**Simulação real no navegador** (`tools/e2e.cjs`): o jogador automático jogou a campanha inteira pela interface. No perfil mínimo ele erra de propósito até cair na versão guiada em todas as atividades; no médio erra uma vez em ~35% delas; no ótimo acerta tudo de primeira.

| Perfil | História concluída | Cobertura | Arena | Domínio | XP (nível) | EcoMoedas ganhas | Compras feitas com o saldo (em ordem de utilidade) | Sobra |
|---|---|---|---|---|---|---|---|---|
| minimo | sim | 43/43 | 0% (revisão guiada) | 40% | 3925 (10) | 538 | 11 itens: botas_explorador(45), bussola_lumi(35), lupa_ecologica(50), cantil(40), mochila_ampliada(55), caderno_melhorado(30), ima_fragmentos(60), medalhao_solar(90), mascara_mergulho(60), corda_escalada(55), uni_verde(15) | 3 |
| medio | sim | 43/43 | 76% (prêmio raro) | 92% | 7050 (14) | 884 | 15 itens: botas_explorador(45), bussola_lumi(35), lupa_ecologica(50), cantil(40), mochila_ampliada(55), caderno_melhorado(30), ima_fragmentos(60), medalhao_solar(90), mascara_mergulho(60), corda_escalada(55), chave_lab(85), lanterna(90), passe_biomas(160), uni_verde(15), bone_folha(20) | 2 |
| otimo | sim | 43/43 | 100% (prêmio raro) | 100% | 7425 (15) | 931 | 16 itens: botas_explorador(45), bussola_lumi(35), lupa_ecologica(50), cantil(40), mochila_ampliada(55), caderno_melhorado(30), ima_fragmentos(60), medalhao_solar(90), mascara_mergulho(60), corda_escalada(55), chave_lab(85), lanterna(90), passe_biomas(160), semente_rara(40), uni_verde(15), bone_folha(20) | 9 |

**Simulação estática** (`tools/economy-sim.cjs`, roda sem navegador junto com a auditoria):

| Perfil | EcoMoedas | XP (nível) | Itens comprados | Sobra |
|---|---|---|---|---|
| minimo | 576 | 3905 (10) | 13: Botas do Explorador (Incomum, 45); Bússola de Lumi (Comum, 35); Lupa Ecológica (Incomum, 50); Cantil Restaurador (Incomum, 40); Caderno Melhorado (Comum, 30); Uniforme Verde-Floresta (Comum, 15); Boné Folhinha (Comum, 20); Joaninha Pontinho (Comum, 30); Mochila Ampliada (Incomum, 55); Ímã de EcoFragmentos (Incomum, 60); Medalhão Solar (Raro, 90); Máscara de Mergulho (Incomum, 60); Semente Rara (Incomum, 40) | 6 |
| medio | 873 | 6646 (14) | 16: Botas do Explorador (Incomum, 45); Bússola de Lumi (Comum, 35); Lupa Ecológica (Incomum, 50); Cantil Restaurador (Incomum, 40); Caderno Melhorado (Comum, 30); Uniforme Verde-Floresta (Comum, 15); Boné Folhinha (Comum, 20); Joaninha Pontinho (Comum, 30); Mochila Ampliada (Incomum, 55); Ímã de EcoFragmentos (Incomum, 60); Medalhão Solar (Raro, 90); Máscara de Mergulho (Incomum, 60); Corda de Escalada (Incomum, 55); Semente Rara (Incomum, 40); Chave do Laboratório (Raro, 85); Lanterna Ecológica (Raro, 90) | 73 |
| otimo | 1042 | 7685 (15) | 17: Botas do Explorador (Incomum, 45); Bússola de Lumi (Comum, 35); Lupa Ecológica (Incomum, 50); Cantil Restaurador (Incomum, 40); Caderno Melhorado (Comum, 30); Uniforme Verde-Floresta (Comum, 15); Boné Folhinha (Comum, 20); Joaninha Pontinho (Comum, 30); Mochila Ampliada (Incomum, 55); Ímã de EcoFragmentos (Incomum, 60); Medalhão Solar (Raro, 90); Máscara de Mergulho (Incomum, 60); Corda de Escalada (Incomum, 55); Semente Rara (Incomum, 40); Chave do Laboratório (Raro, 85); Lanterna Ecológica (Raro, 90); Aura de Folhas (Raro, 120) | 122 |

Conclusões: **todos os perfis concluem a história** e as 43 questões (nada obrigatório depende de moeda, item, nível ou nota); **todos compram melhorias úteis** (Botas, Bússola, Lupa, Cantil…); o desempenho melhor rende mais moedas, mais estrelas, níveis maiores (prateleiras raras) e o prêmio raro da Arena. Minijogos rendem 1 a 5 moedas e **zeram após 3 jogadas** até a próxima lição; revisões só pagam moedas na **primeira** revisão correta de cada questão (evita “farm”).

## 9. Testes realizados e limitações reais

Comandos (na pasta do repositório):

```
node econexus/tools/audit.cjs        # cobertura 43/43, mapas, requisitos, economia (sem navegador)
node econexus/tools/e2e.cjs otimo    # campanha completa pela interface (requer Playwright)
node econexus/tools/e2e.cjs medio
node econexus/tools/e2e.cjs minimo
node econexus/tools/features.cjs     # movimento, toque, loja, minijogos, relatório, layouts…
```

Saída do último `features.cjs`:

```
[1] Movimento, colisão, câmera e interação (teclado)
  ✓ setas movem o personagem (y 1188 → 1083)
  ✓ direção do sprite acompanha o movimento
  ✓ WASD também move
  ✓ colisão: portão fechado bloqueia a passagem (y=916)
  ✓ colisão com a borda de árvores (x=60)
  ✓ câmera acompanha (cam.y 814 → 805)
  ✓ indicador de interação aparece perto do NPC (kaua)
  ✓ NPC do objetivo mostra “!” dourado
  ✓ tecla E abre o diálogo com retrato e nome (Guia Kauã)
  ✓ Espaço avança o diálogo (2/3 ▼)
  ✓ lição concluída abre o portão (mudança no cenário)
  ✓ “mostrar caminho” calcula a rota até o objetivo (15 passos)
  ✓ recarregar a página e “Continuar” restaura mapa, lições e moedas ({"map":"r1","lessons":1,"coins":4})
  ✓ sem erros no console 

[2] Feedback de erro em 3 níveis, folhas e anti-chute
  ✓ 1º erro: feedback específico + explicação reapresentada
  ✓ 1º erro remove 1 folha
  ✓ 2ª tentativa mostra a pista
  ✓ chutes rápidos repetidos: “Pare um pouquinho e procure a pista na explicação” (bloqueio de 4 s)
  ✓ 3ª tentativa: versão guiada (alternativas reduzidas a 2)
  ✓ sem folhas: microexplicação e folhas recuperadas
  ✓ acerto sempre mostra o porquê
  ✓ resultado registrado como “após explicação guiada” (tier 3)
  ✓ alternativas embaralhadas a cada tentativa (5 ordens diferentes em 6)
  ✓ resposta aberta aceita variações (ok, ok, nenhuma ideia, parcial→autoavaliação): ok, ok, none, partial
  ✓ sem erros no console 

[3] Loja, confirmação, inventário, equipar, efeitos e áreas bônus
  ✓ andar até o pedestal da loja e interagir abre a Loja no setor certo
  ✓ confirmação antes de gastar
  ✓ desconto exato das moedas e item no inventário (saldo 355)
  ✓ efeito real: +15% de velocidade e visual das botas no avatar
  ✓ compra sem saldo é recusada (nunca saldo negativo)
  ✓ raridade lendária bloqueada por nível (Libera no nível 9 de Guardião.)
  ✓ melhorias ativas: bússola, lupa, ímã, cantil, caderno, mochila, medalhão (+2)
  ✓ avatar reflete chapéu, capa, aura, rastro, mascote e variante da Lumi
  ✓ desequipar mantém o item no inventário
  ✓ área bônus aberta pelo item: bonus_copa
  ✓ área bônus aberta pelo item: bonus_caverna
  ✓ área bônus aberta pelo item: bonus_lab
  ✓ área bônus aberta pelo item: bonus_mergulho
  ✓ área bônus aberta pelo item: bonus_biomas
  ✓ estação de revisão bônus jogada até o fim
  ✓ decorações compradas aparecem no quarto (aquário e tapete)
  ✓ Jardim: plantar gasta sementes e salva
  ✓ sem erros no console 

[4] Minijogos (jogados até o fim)
  ✓ Corredor da Cadeia concluído
  ✓ Torre dos Níveis concluída
  ✓ Coleta Solar concluída (3 fotossínteses)
  ✓ Salve o Lago concluído (oxigênio 100%)
  ✓ Corrida dos Biomas concluída
  ✓ Trilha Segura concluída (percurso completo, sem cronômetro)
  ✓ Desafio Relâmpago mostra cronômetro (único opcional cronometrado)
  ✓ Desafio Relâmpago termina ao fim dos 60 s
  ✓ recompensa dos minijogos limitada: 3, 1, 2, 0, 0, 0, 0 moedas (zera após 3 jogadas até a próxima lição)
  ✓ sem erros no console 

[5] Área do responsável, exportação, reiniciar e leitura em voz alta
  ✓ conta errada não abre a área do responsável
  ✓ conta correta abre o relatório (cobertura 0/43 no início)
  ✓ exporta .txt e .json (UTF-8, acentos preservados)
  ✓ Web Speech detectado: true
  ✓ leitura em voz alta não gera erro (e some quando não há suporte)
  ✓ reiniciar progresso apaga o salvamento e volta à tela inicial
  ✓ nenhum link, anúncio ou recurso externo
  ✓ sem erros no console 

[6] Layouts (1366×768, 1920×1080, 390×844) e controles de toque
  ✓ 1366×768: nenhuma janela vaza horizontalmente
  ✓ 1366×768: nenhum texto menor que 10,5 px
  ✓ sem erros no console 
  ✓ 1920×1080: nenhuma janela vaza horizontalmente
  ✓ 1920×1080: nenhum texto menor que 10,5 px
  ✓ sem erros no console 
  ✓ celular: direcional e botão de interação visíveis
  ✓ celular: joystick virtual move o personagem (y 948 → 858)
  ✓ 390×844: nenhuma janela vaza horizontalmente
  ✓ 390×844: nenhum texto menor que 10,5 px
  ✓ sem erros no console 

Resultado: todos os testes passaram
```

Checklist dos critérios de aceite: ver README (seção “Testes”) e as saídas acima. Limitações reais:

- A **leitura em voz alta** depende das vozes em português instaladas no sistema/navegador; sem suporte, os botões “Ouvir” somem automaticamente.
- **Emojis** usam a fonte do sistema: a aparência de alguns ícones varia entre Windows, Android e iOS (o significado é sempre acompanhado de texto).
- O salvamento fica no **localStorage do navegador**: limpar os dados do navegador apaga o progresso; outro navegador/aparelho começa do zero (por privacidade, nada é enviado para fora).
- Abrir pelo `file://` funciona em Chrome, Edge e Firefox atuais. Navegadores muito antigos (sem ES2017) não são suportados.
- A avaliação de respostas abertas usa palavras-chave: quando a confiança é baixa, o jogo mostra a resposta-modelo e pede a autoavaliação (como pedido), mas não “entende” frases como uma pessoa.
