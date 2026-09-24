/* =====================================================================
   systems/checker.js — CORREÇÃO DAS RESPOSTAS ESCRITAS DE INGLÊS.
   Regras (pedido do responsável):
     • ignora maiúsculas/minúsculas, espaços extras e a pontuação final;
     • aceita “wouldn't” = “would not”, “don't” = “do not” etc.;
     • tolerância de 1 letra SÓ em vocabulário (q.tol), quando a
       intenção é inequívoca (palavra com 5+ letras e nenhuma outra
       resposta tão parecida) — e avisa a grafia certa;
     • nunca aceita a falta de palavras essenciais (would, like, to,
       wouldn't, do, is, are…): mostra gentilmente o que falta;
     • respostas pessoais: avalia a estrutura e a coerência com a
       pergunta, não a resposta manuscrita do livro.
   Funções puras (também rodam no Node, nos testes).
   ===================================================================== */
(function (root) {
  'use strict';
  const C = {};

  /* ------------------------------------------------------------ normalização */
  C.norm = function (s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[‘’´`]/g, "'").replace(/[“”]/g, '"')
      .replace(/\bwould not\b/g, "wouldn't").replace(/\bdo not\b/g, "don't").replace(/\bis not\b/g, "isn't").replace(/\bare not\b/g, "aren't")
      .replace(/\bi am\b/g, "i'm").replace(/\bhe is\b/g, "he's").replace(/\bshe is\b/g, "she's")
      .replace(/[.,!?;:"()]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  /** Versão “de exibição” sem as contrações trocadas (para comparar posição de palavras). */
  C.tokens = (s) => C.norm(s).split(' ').filter(Boolean);
  C.lev = function (a, b) {
    if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    return prev[n];
  };
  const ESSENTIAL = ['would', "wouldn't", 'like', 'love', 'to', 'do', "don't", 'is', 'are', 'be', 'go', 'the', 'a', 'an', 'up', 'you', 'she', 'he', 'they', 'i'];

  /* ------------------------------------------------------------ comparação de uma resposta com uma lista */
  /** Retorna {ok, typo?, want} comparando value com as aceitas. tol = vocabulário. */
  C.matchList = function (value, accept, tol) {
    const v = C.norm(value), acc = accept.map(C.norm);
    if (!v) return { ok: false, empty: true };
    if (acc.includes(v)) return { ok: true };
    if (tol && v.replace(/ /g, '').length >= 5) {
      const d = acc.map((a) => C.lev(v, a));
      const best = Math.min.apply(null, d), idx = d.indexOf(best);
      // inequívoca: distância 1, a resposta alvo tem 5+ letras e nenhuma outra aceita/opção empata
      if (best === 1 && acc[idx].replace(/ /g, '').length >= 5 && d.filter((x) => x === best).length === 1) return { ok: true, typo: accept[idx] };
    }
    return { ok: false };
  };

  /** Explica gentilmente a diferença entre a resposta e o modelo (palavra essencial faltando, ordem…). */
  C.diff = function (value, model) {
    const v = C.tokens(value), m = C.tokens(model);
    if (!v.length) return 'Escreva a resposta no espaço.';
    for (let i = 0; i < m.length; i++) {
      if (!v.includes(m[i])) {
        const w = m[i];
        if (w === "wouldn't" && v.includes('would')) return 'Quase! Na negativa, troque **would** por **wouldn’t** (= would not).';
        if (w === 'would' && v.includes("wouldn't")) return 'Quase! Aqui é **would** (sem “n’t”).';
        const before = i > 0 ? m[i - 1] : null, after = i < m.length - 1 ? m[i + 1] : null;
        if (ESSENTIAL.includes(w)) return 'Quase! Falta a palavra **' + w + '**' + (before ? ' depois de **' + before + '**.' : after ? ' antes de **' + after + '**.' : '.');
        return 'Quase! Falta a palavra **' + w + '**' + (before ? ' depois de **' + before + '**.' : '.');
      }
    }
    const extra = v.filter((w) => !m.includes(w));
    if (extra.length) return 'Quase! A palavra **' + extra[0] + '** não faz parte desta resposta.';
    if (v.join(' ') !== m.join(' ')) {
      if (m[0] === 'would' && v[0] !== 'would') return 'Quase! Na pergunta, **Would** vai para o **começo**.';
      return 'As palavras estão certas, mas a **ordem** não. Confira a posição de cada uma.';
    }
    return '';
  };

  /* ------------------------------------------------------------ respostas pessoais */
  const R = (re) => (v) => re.test(v);
  const PROF = '(a|an) [a-z]+( [a-z]+)?';
  C.PERSONAL = {
    'yn-would': { test: R(/^(yes i would|no i wouldn't)( .*)?$/), models: ['Yes, I would.', "No, I wouldn't."], need: 'Comece com **Yes, I would.** ou **No, I wouldn’t.**' },
    'yn-would-they': { test: R(/^(yes they would|no they wouldn't)( .*)?$/), models: ['Yes, they would.', "No, they wouldn't."], need: 'A pergunta é sobre **they**: **Yes, they would.** ou **No, they wouldn’t.**' },
    'yn-do': { test: R(/^(yes i do|no i don't)( .*)?$/), models: ['Yes, I do.', "No, I don't."], need: 'Pergunta com **Do you**: **Yes, I do.** ou **No, I don’t.**' },
    'yn-am': { test: R(/^(yes i'm|no i'm not)( .*)?$/), models: ['Yes, I am.', "No, I'm not."], need: 'Pergunta com **Are you**: **Yes, I am.** ou **No, I’m not.**' },
    'yn-is-he': { test: R(/^(yes he's|no he isn't|no he's not|i don't have a (brother|dad))( .*)?$/), models: ['Yes, he is.', "No, he isn't."], need: 'Pergunta com **Is your…**: **Yes, he is.** ou **No, he isn’t.**' },
    'want-be': { test: R(new RegExp("^(i would (like|love) to be|i want to be|i'd (like|love) to be) " + PROF + '$')), models: ['I would like to be a pilot.', 'I would like to be a veterinarian.'], need: 'Use **I would like to be a/an** + profissão.' },
    'want-go': { test: R(/^(i would (like|love) to go|i want to go|i'd (like|love) to go) to( the)? [a-z]+( [a-z]+){0,3}$/), models: ['I would like to go to the space museum.', 'I would like to go to the water park.'], need: 'Use **I would like to go to** + lugar.' },
    'want-study': { test: R(/^(i would (like|love) to study|i want to study|i'd (like|love) to study) [a-z]+( and [a-z]+)?$/), models: ['I would love to study biology.', 'I would love to study chemistry.'], need: 'Use **I would love to study** + matéria.' },
    'job-she': { test: R(new RegExp("^(she's|my mom is|she works as) " + PROF + '$')), models: ['She is a doctor.', 'She is a nurse.'], need: 'Use **She is a/an** + profissão.' },
    'job-he': { test: R(new RegExp("^(he's|my dad is|he works as) " + PROF + '$')), models: ['He is a taxi driver.', 'He is an engineer.'], need: 'Use **He is a/an** + profissão.' },
    'prefer-air': { test: R(/^(i prefer )?(airplanes|spaceships|airplane|spaceship)$/), models: ['I prefer airplanes.', 'I prefer spaceships.'], need: 'Escolha um: **I prefer airplanes.** ou **I prefer spaceships.**' },
    'prefer-subject': { test: R(/^(i prefer )?(math|portuguese)$/), models: ['I prefer math.', 'I prefer Portuguese.'], need: 'Escolha um: **I prefer math.** ou **I prefer Portuguese.**' },
    'dream': { test: R(/^(my (big )?dream is( to be)? .+|i would (like|love) to .+|i dream about .+|to be (a|an) .+)$/), models: ['My big dream is to be a pilot.', 'I would like to be a baseball player.'], need: 'Use **My big dream is to be a/an…** ou **I would like to…**' },
    'dream-about': { test: R(/^i dream about [a-z]+( [a-z]+){0,4}$/), models: ['I dream about superheroes.', 'I dream about space.'], need: 'Use **I dream about** + assunto.' },
    'drawer': { test: R(/^((there (is|are)|in my drawer (there (is|are) )?|i have|my|a|an|some|the)\b.*|(pencils?|paper|papers|books?|toys?)( and .+)?|nothing)$/), models: ['A pencil and paper.', 'My pencil.'], need: 'Diga o que tem na gaveta. Ex.: **A pencil and paper.**' }
  };
  C.personal = function (q, value) {
    const P = C.PERSONAL[q.personal]; const v = C.norm(value);
    if (!v) return { ok: false, empty: true, msg: 'Escreva a sua resposta.' };
    if (P && P.test(v)) return { ok: true };
    let msg = P ? P.need : 'Responda com uma frase curta em inglês.';
    if (/^(yes|no)$/.test(v)) msg = 'Quase! Não responda só **' + v + '**. ' + msg;
    else if (/^yes i would|^no i wouldn't/.test(v) && q.personal === 'yn-do') msg = 'A pergunta começa com **Do**, então a resposta usa **do**: **Yes, I do.** / **No, I don’t.**';
    else if (/^yes i do|^no i don't/.test(v) && /would/.test(q.personal)) msg = 'A pergunta começa com **Would**, então a resposta usa **would**: ' + P.models.join(' / ');
    else if (/^(i would|i'd) (like|love) (be|go|study)\b/.test(v)) msg = 'Quase! Falta a palavra **to**: **would like to** + ação.';
    else if (/^(i would|i'd) (be|go|study)\b/.test(v)) msg = 'Quase! Falta **like to**: **I would like to** + ação.';
    else if (/^i (like|love) to (be|go|study)/.test(v) && /want/.test(q.personal)) msg = 'Quase! Falta a palavra **would**: **I would like to**…';
    else if (/^(i would like to be|she's|he's|my (mom|dad) is) [a-z]+$/.test(v) && /want-be|job/.test(q.personal)) msg = 'Quase! Antes da profissão vem **a** ou **an**: ' + P.models[0];
    return { ok: false, msg };
  };

  /* ------------------------------------------------------------ frase livre com uma palavra */
  C.sentence = function (q, value) {
    const v = C.norm(value), t = C.tokens(value);
    if (!v) return { ok: false, empty: true, msg: 'Escreva uma frase.' };
    const has = q.target.some((w) => (' ' + v + ' ').includes(' ' + C.norm(w) + ' '));
    if (!has) return { ok: false, msg: 'A frase precisa ter a palavra **' + q.target[0] + '**.' };
    if (t.length < 3) return { ok: false, msg: 'Escreva uma **frase** (com pelo menos 3 palavras), não só a palavra.' };
    const tw = C.tokens(q.target[0]).length;
    if (t.length <= tw + 1 && !/^(i|you|he|she|it|we|they|my|the|a|an)$/.test(t[0])) return { ok: false, msg: 'Escreva uma frase completa. Ex.: ' + String(q.why || '').split('Ex.: ')[1] };
    if (/^(would|like|to) /.test(v) && t.length < 5) return { ok: false, msg: 'Comece a frase com quem faz a ação: **I**, **She**, **They**…' };
    return { ok: true };
  };

  /* ------------------------------------------------------------ correção principal */
  /** value: string (text) | array de strings (fill) | array (order). Retorna {ok, msg?, typo?, parts?}. */
  C.check = function (q, value) {
    if (q.input === 'order') {
      const ok = Array.isArray(value) && value.length === q.order.length && value.every((x, i) => x === q.order[i]);
      if (ok) return { ok: true };
      const firstBad = Array.isArray(value) ? value.findIndex((x, i) => x !== q.order[i]) : 0;
      return { ok: false, msg: 'A frase número **' + (firstBad + 1) + '** ainda não está no lugar certo.', firstBad };
    }
    if (q.input === 'fill') {
      const vals = Array.isArray(value) ? value : [value];
      const parts = q.blanks.map((acc, i) => C.matchList(vals[i], acc, !!q.tol));
      if (parts.every((p) => p.ok)) return { ok: true, parts, typo: parts.filter((p) => p.typo).map((p) => p.typo).join(', ') || null };
      const bi = parts.findIndex((p) => !p.ok);
      if (parts[bi].empty) return { ok: false, parts, msg: q.blanks.length > 1 ? 'Preencha a lacuna ' + (bi + 1) + '.' : 'Escreva a palavra que falta.' };
      const want = q.blanks[bi][0], got = vals[bi] || '';
      let msg = C.tokens(want).length > 1 ? C.diff(got, want) : '';
      if (!msg || /não faz parte/.test(msg)) msg = (q.blanks.length > 1 ? 'A lacuna ' + (bi + 1) + ' ainda não está certa. ' : 'Ainda não. ') + 'Leia a frase inteira de novo.';
      return { ok: false, parts, msg };
    }
    if (q.personal) return C.personal(q, value);
    if (q.target) return C.sentence(q, value);
    const r = C.matchList(value, q.accept, !!q.tol);
    if (r.ok) return r;
    if (r.empty) return { ok: false, empty: true, msg: 'Escreva a resposta.' };
    const multi = C.tokens(q.accept[0]).length > 1;
    return { ok: false, msg: multi ? C.diff(value, q.accept[0]) || 'Ainda não.' : 'Ainda não. Confira a escrita.' };
  };

  /* ------------------------------------------------------------ dicas progressivas */
  const firstLetters = (s) => s.split(' ').map((w) => w[0] + '_'.repeat(Math.max(0, w.length - 1)).split('').join(' ')).join('   ');
  C.model = function (q) {
    if (q.input === 'fill') return q.blanks.map((b) => b[0]);
    if (q.input === 'order') return q.order;
    if (q.personal) return C.PERSONAL[q.personal].models[0];
    if (q.target) return String(q.why || '').split('Ex.: ')[1] || q.target[0];
    return q.accept[0];
  };
  /** Dica de nível 1 a 3 (sem revelar a resposta de uma vez). */
  C.hint = function (q, level, rnd) {
    rnd = rnd || Math.random;
    if (q.personal) {
      const P = C.PERSONAL[q.personal];
      if (level <= 1) return P.need;
      return 'Modelo: **' + P.models.join('** ou **') + '** (troque pela sua resposta, se quiser).';
    }
    if (q.target) return level <= 1 ? 'Comece com **I**, **She** ou **They** e use **' + q.target[0] + '**.' : 'Exemplo: **' + C.model(q) + '**';
    if (q.input === 'order') return level <= 1 ? 'A primeira frase é: **' + q.order[0] + '**' : 'As duas primeiras: **' + q.order[0] + '** e **' + q.order[1] + '**';
    const ans = q.input === 'fill' ? q.blanks.map((b) => b[0]) : [q.accept[0]];
    const one = (a) => {
      const w = a.split(' ');
      if (level <= 1) return w.length + (w.length > 1 ? ' palavras' : ' palavra') + ', começa com **' + a[0].toUpperCase() + '**';
      if (level === 2) {
        if (w.length === 1) {
          const up = a.toUpperCase(); let s = up;
          for (let k = 0; k < 8 && (s === up || a.length < 2); k++) s = up.split('').map((x) => [rnd(), x]).sort((p, r) => p[0] - r[0]).map((x) => x[1]).join('');
          return 'letras embaralhadas: **' + s.split('').join(' ') + '**';
        }
        return 'estrutura: **' + firstLetters(a) + '**';
      }
      return 'estrutura: **' + firstLetters(a) + '**';
    };
    return (ans.length > 1 ? ans.map((a, i) => 'Lacuna ' + (i + 1) + ': ' + one(a)).join(' • ') : one(ans[0])) + '.';
  };
  /** Alternativas (só depois de erros repetidos ou pedido de ajuda): a certa + até 3 da mesma seção. */
  C.options = function (q, rnd) {
    rnd = rnd || Math.random;
    const sh = (a) => a.map((x) => [rnd(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    if (q.personal) return C.PERSONAL[q.personal].models.slice();
    if (q.target) return null;
    if (q.input === 'order') return null;
    if (q.input === 'fill' && q.blanks.length > 1) return q.blanks.map((b) => sh([b[0]].concat(sh((q.options || []).filter((o) => C.norm(o) !== C.norm(b[0]) && !b.map(C.norm).includes(C.norm(o)))).slice(0, 2))));
    const right = C.model(q); const r0 = Array.isArray(right) ? right[0] : right;
    const acc = (q.input === 'fill' ? q.blanks[0] : q.accept).map(C.norm);
    const others = sh((q.options || []).filter((o) => !acc.includes(C.norm(o))));
    if (C.tokens(r0).length > 3) return null; // frases longas: cartões de palavras em vez de alternativas
    return [sh([r0].concat(others.slice(0, 3)))];
  };
  /** Cartões de palavras (Oficina de frases) para montar frases longas depois de erros. */
  C.cards = function (q, rnd) {
    rnd = rnd || Math.random;
    const m = C.model(q); const s = Array.isArray(m) ? m.join(' ') : m;
    const w = String(s).replace(/[.?!]$/, '').split(' ');
    return { words: w.map((x, i) => [rnd(), x, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]), end: (String(s).match(/[.?!]$/) || [''])[0] };
  };

  if (root && root.ING) root.ING.check = C; else if (root) { root.ING = root.ING || {}; root.ING.check = C; }
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
})(typeof window !== 'undefined' ? window : null);
