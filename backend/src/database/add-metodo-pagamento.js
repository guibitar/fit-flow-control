/**
 * Script para adicionar coluna metodo_pagamento na tabela transacoes_financeiras
 */

import sequelize from '../config/database.js';

async function addMetodoPagamentoColumn() {
  try {
    console.log('🔄 Iniciando migração: adicionar metodo_pagamento...');

    // Verificar se a coluna já existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transacoes_financeiras' 
      AND column_name = 'metodo_pagamento'
    `);

    if (results.length > 0) {
      console.log('✅ Coluna metodo_pagamento já existe!');
      return;
    }

    // Adicionar coluna
    console.log('📝 Adicionando coluna metodo_pagamento...');
    await sequelize.query(`
      ALTER TABLE transacoes_financeiras 
      ADD COLUMN metodo_pagamento VARCHAR(255)
    `);

    console.log('✅ Coluna metodo_pagamento adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error);
    throw error;
  }
}

// Executar migração
addMetodoPagamentoColumn()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });

