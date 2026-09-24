/* Gera o hash salgado da senha da Área dos Pais (nunca grave a senha em texto puro no repositório).
   Uso:  PARENT_ACCESS_PASSWORD='nova-senha' node src/tools/nexus-senha.cjs
   Copie as três linhas impressas para src/franchise/parent-auth.js (SALT, ITER, HASH). */
const crypto = require('crypto');
const pw = process.env.PARENT_ACCESS_PASSWORD;
if (!pw) { console.error('Defina PARENT_ACCESS_PASSWORD no ambiente.'); process.exit(1); }
const sha = (t) => crypto.createHash('sha256').update(Buffer.from(t, 'utf8')).digest('hex');
const salt = crypto.randomBytes(16).toString('hex');
const iter = 12000;
let h = sha(salt + '|' + pw);
for (let i = 1; i < iter; i++) h = sha(h + '|' + salt);
console.log("  const SALT = '" + salt + "';");
console.log('  const ITER = ' + iter + ';');
console.log("  const HASH = '" + h + "';");
