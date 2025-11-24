/**
 * Script para criar banco de dados PostgreSQL automaticamente
 * Execute: node criar-banco-postgres.js
 */

import pg from 'pg';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createDatabase() {
  console.log('🐘 Criador de Banco PostgreSQL - FitTrainer Pro\n');

  // Solicitar informações
  const dbHost = await question('Host (padrão: localhost): ') || 'localhost';
  const dbPort = await question('Porta (padrão: 5432): ') || '5432';
  const dbUser = await question('Usuário (padrão: postgres): ') || 'postgres';
  const dbPassword = await question('Senha do PostgreSQL: ');
  
  if (!dbPassword) {
    console.log('\n❌ Senha é obrigatória!');
    rl.close();
    process.exit(1);
  }

  const dbName = await question('Nome do banco (padrão: fittrainer): ') || 'fittrainer';

  // Conectar ao PostgreSQL (banco padrão 'postgres')
  const adminClient = new Client({
    host: dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPassword,
    database: 'postgres' // Conecta ao banco padrão para criar o novo
  });

  try {
    console.log('\n🔌 Conectando ao PostgreSQL...');
    await adminClient.connect();
    console.log('✅ Conectado!');

    // Verificar se banco já existe
    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`\n⚠️  Banco '${dbName}' já existe!`);
      const overwrite = await question('Deseja continuar mesmo assim? (s/N): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('❌ Operação cancelada.');
        await adminClient.end();
        rl.close();
        process.exit(0);
      }
    } else {
      // Criar banco
      console.log(`\n📦 Criando banco '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Banco '${dbName}' criado com sucesso!`);
    }

    await adminClient.end();

    // Criar arquivo .env
    console.log('\n📝 Criando arquivo .env...');
    const jwtSecret = await question('JWT Secret (Enter para usar padrão): ') || 'fittrainer_pro_secret_key_2024_change_in_production';

    const envContent = `PORT=3001
NODE_ENV=development
JWT_SECRET=${jwtSecret}

# PostgreSQL
DB_DIALECT=postgres
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

CORS_ORIGIN=http://localhost:5173
`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado!');

    console.log('\n🎉 Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm run seed');
    console.log('2. Execute: npm run dev');
    console.log('\n✅ Pronto para usar PostgreSQL!');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o PostgreSQL está rodando.');
    } else if (error.code === '28P01') {
      console.log('\n💡 Dica: Verifique se a senha está correta.');
    } else if (error.code === '3D000') {
      console.log('\n💡 Dica: O banco padrão "postgres" não existe. Isso é incomum.');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

createDatabase();



