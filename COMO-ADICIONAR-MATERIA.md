# Como adicionar uma matéria nova (Matemática, Português, História, Inglês…)

Regra: **cada matéria nova é uma missão independente**. As novidades de uma versão entram só na matéria nova; as anteriores ficam congeladas (salvo pedido expresso de correção).

## Passo a passo

1. **Copie** a pasta `src/modules/geografia/` para `src/modules/<nova>/` (ela serve de modelo completo).
2. No `manifest.js` da cópia, troque `id`, `subject`, `title`, `theme`, `entry`, `reviewEntry` e **`saveKey`** (ex.: `ecoNexus.matematica.v1`) — nunca reutilize a chave de outra matéria.
3. Em `systems/save.js`, troque `SV.KEY` pela mesma chave nova.
4. Troque o conteúdo: `content/capitulos.js` (capítulos, fases e falas), `questions/*.js` (questões no mesmo formato), `content/glossario.js`, `content/visuais.js`, `content/loja.js`.
5. Reaproveite ou crie cenas em `scenes/`. Cada fase escolhe o estilo pelo campo `engine` (`platform`, `topdown`, `shmup`, `race`, `boss`, `maze`, `rhythm`, `kitchen`, `city`, `tower`).
6. **Registre** a matéria acrescentando UMA linha em `src/modules/modulos.js`:
   ```js
   'src/modules/<nova>/manifest.js',
   ```
7. **Gabriel Nexus:** preencha o bloco `franchise` do manifesto (contrato completo em `src/franchise/modules.js` e em `jogodogabriel.md`): `moduleId`, `title`, `version`, `entryRoute`, `saveNamespace`, `scoreAdapter(save)` (eventos estáveis, sem repetir), `stats(save)`, `unlockedMinigames(save)`, `minigames` (metadados), `collectiblePacks` (novo pacote de Nexóticos em `src/modules/<nova>/nexoticos.js`, IDs começando com `<moduleId>_`), `questionBank` (Área dos Pais) e `testEntry` (modo de teste). O Nexus descobre tudo sozinho — nenhum `if` por matéria.
8. Rode os testes (`e2e.cjs`, `features.cjs` da nova pasta), `src/tests/nexus-unit.cjs`, `src/tests/nexus-e2e.cjs` e `src/tests/ciencias-regressao.cjs`.

Nenhum arquivo de outra matéria precisa ser editado. O módulo `src/modules/exemplo-vazio/` mostra um registro mínimo (desativado), que aparece no lançador apenas como “Novas missões chegarão”.

## Formato de uma questão

```js
{ id: 'MAT-C1-Q01', chapter: 1, stage: 'c1s1', concept: '...', book: true, title: '...', prompt: '...',
  pre: ['bloco 1 (até ~25 palavras)', 'bloco 2', 'bloco 3'],      // explicação curta
  visual: 'idDoVisual', type: 'mc' | 'multi' | 'open' | 'classify' | 'order' | 'syllables' | 'mappick' | 'builder' | 'personal' | 'steps',
  spec: { ... },                         // alternativas, palavras-chave, grupos...
  answer: '...', ok: '...', why: '...', recap: '...', hint1: '...', hint2: '...',
  guided: { type: 'fill', text: '... {0} ...', answers: [...], bank: [...] },   // 3º erro
  confirm: { type: 'mc', prompt: '...', options: [...] },                         // nova aplicação
  review: { type: 'mc', prompt: '...', options: [...] },                          // revisão da prova
  where: 'Fase 1-1 • ...', effect: '...' }
```

O motor de questões (`src/systems/quiz.js`) aplica sozinho o fluxo: explicação → questão → 1º erro (explicação específica) → 2º erro (pista 2 e menos alternativas) → 3º erro (versão guiada, o aluno completa a última etapa) → nova aplicação → volta ao jogo. Não há cronômetro nas perguntas.

## Partes compartilhadas (seguras para reutilizar)

`src/core/` (motor, entrada teclado/toque/gamepad, áudio e voz, pixel art), `src/ui/` (janelas, diálogos, acessibilidade, mapas), `src/systems/quiz.js` e `src/assets/shared/`. Economia, loja, inventário, conquistas, conteúdo e save ficam **dentro de cada módulo**.
