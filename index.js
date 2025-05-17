const express = require('express');
const knex = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const SEGREDO = "minhasecretkey"; // segredo para JWT

// Rota de cadastro
app.post('/signup', async (req, res) => {
  const { nome, email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  await knex('usuarios').insert({ nome, email, senha: hash });
  res.status(201).json({ mensagem: "Usuário cadastrado!" });
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await knex('usuarios').where({ email }).first();
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }
  const token = jwt.sign({ id: usuario.id }, SEGREDO);
  res.json({ token });
});

// Middleware de autenticação
function autenticar(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: "Token não enviado" });
  try {
    const [, token] = auth.split(" ");
    const payload = jwt.verify(token, SEGREDO);
    req.usuario_id = payload.id;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido" });
  }
}

// Criar mensagem (protegida)
app.post('/mensagens', autenticar, async (req, res) => {
  const { texto } = req.body;
  await knex('mensagens').insert({
    usuario_id: req.usuario_id,
    texto
  });
  res.status(201).json({ mensagem: "Mensagem criada" });
});

// Listar mensagens (pública)
app.get('/mensagens', async (req, res) => {
  const mensagens = await knex('mensagens')
    .join('usuarios', 'usuarios.id', '=', 'mensagens.usuario_id')
    .select('mensagens.id', 'usuarios.nome', 'mensagens.texto', 'mensagens.data_postagem');
  res.json(mensagens);
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
