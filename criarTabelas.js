const knex = require('./db');

async function criarTabelas() {
  try {
    console.log("Verificando tabela 'usuarios'...");
    const existeUsuarios = await knex.schema.hasTable('usuarios');
    if (!existeUsuarios) {
      console.log("Criando tabela 'usuarios'...");
      await knex.schema.createTable('usuarios', table => {
        table.increments('id');
        table.string('nome');
        table.string('email').unique();
        table.string('senha');
      });
    } else {
      console.log("Tabela 'usuarios' já existe.");
    }

    console.log("Verificando tabela 'mensagens'...");
    const existeMensagens = await knex.schema.hasTable('mensagens');
    if (!existeMensagens) {
      console.log("Criando tabela 'mensagens'...");
      await knex.schema.createTable('mensagens', table => {
        table.increments('id');
        table.integer('usuario_id').references('id').inTable('usuarios');
        table.text('texto');
        table.timestamp('data_postagem').defaultTo(knex.fn.now());
      });
    } else {
      console.log("Tabela 'mensagens' já existe.");
    }

    console.log("Tabelas verificadas/criadas com sucesso!");
    process.exit(); // Encerra o processo manualmente
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
    process.exit(1); // Encerra com erro
  }
}

criarTabelas();
