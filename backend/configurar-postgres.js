/**
 * Script interativo para configurar PostgreSQL
 * Execute: node configurar-postgres.js
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function main() {
  console.log('🐘 Configuração PostgreSQL - FitTrainer Pro\n');
  console.log('Este script vai criar o arquivo .env configurado para PostgreSQL.\n');

  const dbName = await question('Nome do banco de dados (padrão: fittrainer): ') || 'fittrainer';
  const dbHost = await question('Host (padrão: localhost): ') || 'localhost';
  const dbPort = await question('Porta (padrão: 5432): ') || '5432';
  const dbUser = await question('Usuário (padrão: postgres): ') || 'postgres';
  const dbPassword = await question('Senha do PostgreSQL: ');
  
  if (!dbPassword) {
    console.log('\n❌ Senha é obrigatória!');
    rl.close();
    process.exit(1);
  }

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
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Arquivo .env criado com sucesso!');
    console.log(`\n📝 Localização: ${envPath}`);
    console.log('\n📋 Próximos passos:');
    console.log('1. Certifique-se de que o banco de dados "' + dbName + '" foi criado no PostgreSQL');
    console.log('2. Execute: npm run seed');
    console.log('3. Execute: npm run dev');
  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env:', error.message);
  }

  rl.close();
}

main();



