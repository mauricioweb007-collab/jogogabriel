# Missão EcoNexus: Guardiões dos Biomas

Jogo educativo de Ciências (4º ano) em forma de **aventura 2D explorável**: o jogador anda pelos mapas, conversa com NPCs, investiga objetos, cumpre missões, joga minijogos e responde às **43 questões do livro** dentro da história. Feito para o Gabriel se preparar para a prova, sem sair do conteúdo do material didático.

## Como jogar (Windows, sem instalar nada)

1. Baixe a pasta `econexus` (no GitHub: **Code → Download ZIP**) e **extraia** o arquivo.
2. Abra a pasta `econexus` e dê **duplo clique em `index.html`**.
3. Clique em **Novo jogo**, confirme o nome (já vem “Gabriel”) e divirta-se!

Funciona **sem internet** no Chrome, Edge ou Firefox. O progresso salva sozinho no próprio computador; da próxima vez, use **Continuar**. Nenhum dado sai do aparelho.

**Controles:** `WASD` ou setas para andar • `E`/`Espaço` para interagir • `Esc` menu • `I` inventário • `C` caderno • `M` mostrar caminho. No celular/tablet aparecem um direcional e o botão ✋.

## O que tem no jogo

- **Vila EcoNexus** (base): Loja do Guardião, Casa de Lumi/quarto com troféus e decorações, Mural de Missões, Portal das Regiões, Jardim e Portal da Arena.
- **6 regiões + Arena Final**, desbloqueadas em ordem: Trilha dos Animais Livres, Vale das Cadeias Alimentares, Laboratório dos Ciclos, Lago Esverdeado, Torre da Energia e dos Ecossistemas, Portal dos Biomas Brasileiros e Arena da Restauração.
- Cada lição segue: cena → explicação (uma ideia por cartão, palavras novas clicáveis) → exemplo guiado da Lumi → checagem de leitura → treino → **questão do livro** → explicação da resposta → mudança no cenário → desafio da região → recompensa e resumo.
- Erros nunca punem: 3 folhas de energia, pista na 2ª tentativa, versão guiada na 3ª, microexplicação se as folhas acabarem, questão semelhante para confirmar e revisão espaçada.
- **Caderno do Guardião** (24 fichas + glossário), **Revisão antes da prova** (liberada ao final), **Área do Responsável/Professor** (conta de multiplicação para entrar; relatório exportável em `.txt`/`.json`).
- XP (níveis, títulos, molduras) e **EcoMoedas** (loja com 58 itens: roupas, acessórios, companheiros, melhorias com efeito real, chaves de áreas bônus e decorações). Sem compras reais, sem sorteios.

## Estrutura

```
econexus/
  index.html            página do jogo
  css/style.css         visual e layout responsivo
  js/core/              motor 2D (util, áudio/voz, sprites, engine)
  js/data/              dados pedagógicos (questões, lições, glossário, personagens) e dos mapas
  js/systems/           salvamento, economia, missões, motor pedagógico, minijogos
  js/ui/ui.js           interface (diálogos, painéis, loja, caderno, relatório…)
  js/main.js            liga tudo (fachada do jogo)
  tools/                auditoria, simulação da economia e testes automáticos
  docs/ENTREGA.md       checklists: 43 questões, economia, mapas, simulações e testes
```

## Testes

Na raiz do repositório:

```
node econexus/tools/audit.cjs          # sem navegador: cobertura 43/43, mapas alcançáveis, requisitos por mapa, economia
node econexus/tools/e2e.cjs otimo      # joga a campanha inteira pela interface (precisa de Playwright + Chromium)
node econexus/tools/e2e.cjs medio
node econexus/tools/e2e.cjs minimo
node econexus/tools/features.cjs       # movimento, colisão, toque, loja, minijogos, relatório, layouts
node econexus/tools/gen-docs.cjs       # regenera docs/ENTREGA.md a partir dos dados
```

(Os testes usam a extensão `.cjs` porque o `package.json` da raiz do repositório declara `"type": "module"`.)
