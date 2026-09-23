# Central de Missões — como jogar

O projeto agora tem **várias matérias**. Cada matéria é uma missão independente, com progresso, moedas e itens próprios.

## Jogar no computador (sem instalar nada)

1. No GitHub: **Code → Download ZIP** e extraia a pasta.
2. Dê dois cliques em **`inicio.html`** → tela “**Qual missão você quer jogar?**”.
3. Escolha:
   - **Ciências — Missão EcoNexus** (versão 1.0, igual a antes; também abre direto por `index.html`);
   - **Geografia — Brasil em Movimento** (novo módulo).

Funciona sem internet no Chrome, Edge ou Firefox. O progresso fica salvo só no próprio navegador.

**Controles de Geografia:** setas/WASD andam • Espaço/K pula e confirma • E/J/X interage e dispara pulsos • Esc pausa. As teclas podem ser trocadas em ⚙️ Ajustes. Controle (gamepad) funciona. No celular aparecem direcional e botões A/B (jogar com o celular deitado fica maior).

## Não há build

É HTML, CSS e JavaScript puros. Não há etapa de compilação: basta abrir `inicio.html`. Para publicar num site (ex.: GitHub Pages), envie a pasta inteira.

## Testes (opcional, para quem desenvolve)

Precisam de Node.js 18+ e Playwright (`npm i -D playwright` e `npx playwright install chromium`).

```
node src/tests/ciencias-regressao.cjs                 # prova que Ciências não mudou (arquivos, testes antigos e save)
node src/modules/geografia/tests/features.cjs         # 45 questões, ritmo, acessibilidade, loja, painel, revisão, isolamento
node src/modules/geografia/tests/e2e.cjs otimo        # joga a campanha inteira (também: erros, rapido)
node src/modules/geografia/tests/layouts.cjs pasta    # capturas em 1366x768, 1920x1080 e 390x844
node src/tests/gen-tabela-geografia.cjs               # tabela das 45 questões
```

Documentos: `ENTREGA-GEOGRAFIA.md` (entrega completa), `COMO-ADICIONAR-MATERIA.md` (novas matérias) e `CREDITOS.md` (licenças). A documentação da versão 1.0 de Ciências continua em `README.md` e `docs/ENTREGA.md`.
