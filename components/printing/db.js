const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',                 // O usuário padrão é postgres
  host: 'localhost',                // host de teste
  database: 'foodsystem', // Nome 
  password: 'Mh135790',             // senha
  port: 5432,                       // Porta padrão do Postgres
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar no banco:', err.stack);
  }
  console.log('Conectado ao Banco de Dados com sucesso!');
  release();
});

module.exports = pool;