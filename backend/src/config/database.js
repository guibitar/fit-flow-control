import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco de dados
const config = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

// Se for SQLite (desenvolvimento)
if (config.dialect === 'sqlite') {
  config.storage = process.env.DB_STORAGE || './database.sqlite';
}

// Se for PostgreSQL (produção)
if (config.dialect === 'postgres') {
  config.host = process.env.DB_HOST || 'localhost';
  config.port = process.env.DB_PORT || 5432;
  config.database = process.env.DB_NAME || 'fittrainer';
  config.username = process.env.DB_USER || 'postgres';
  config.password = process.env.DB_PASSWORD || '';
}

// Criar instância do Sequelize
const sequelize = new Sequelize(
  config.database || 'fittrainer',
  config.username || '',
  config.password || '',
  config
);

// Testar conexão
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

// Sincronizar modelos (criar tabelas)
export async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ Banco de dados sincronizado.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    return false;
  }
}

export default sequelize;


