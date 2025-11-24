/**
 * Script para verificar se a coluna treinador_id foi adicionada corretamente
 */

import sequelize from '../config/database.js';
import Cliente from '../models/Cliente.js';
import Usuario from '../models/Usuario.js';
import { initModels } from '../models/index.js';

// Inicializar associações
initModels();

async function verificarTreinadorId() {
  try {
    console.log('🔍 Verificando estrutura da tabela clientes...\n');

    // Verificar se a coluna existe
    const [colunas] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clientes' 
      AND column_name = 'treinador_id'
    `);

    if (colunas.length === 0) {
      console.log('❌ Coluna treinador_id NÃO existe!');
      return;
    }

    console.log('✅ Coluna treinador_id existe!');
    console.log('   Tipo:', colunas[0].data_type);
    console.log('   Permite NULL:', colunas[0].is_nullable);
    console.log('   Default:', colunas[0].column_default || 'nenhum');
    console.log('');

    // Verificar foreign keys
    const [fks] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'clientes'
        AND kcu.column_name = 'treinador_id'
    `);

    if (fks.length > 0) {
      console.log('✅ Foreign key encontrada!');
      console.log('   Nome:', fks[0].constraint_name);
      console.log('   Referencia:', `${fks[0].foreign_table_name}.${fks[0].foreign_column_name}`);
    } else {
      console.log('⚠️  Foreign key NÃO encontrada!');
    }
    console.log('');

    // Verificar clientes e seus treinadores
    const clientes = await Cliente.findAll({
      include: [{
        model: Usuario,
        as: 'treinador',
        attributes: ['id', 'nome', 'email']
      }],
      limit: 10
    });

    console.log(`📊 Total de clientes: ${await Cliente.count()}`);
    console.log(`📋 Primeiros ${clientes.length} clientes:\n`);

    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nome}`);
      console.log(`   ID: ${cliente.id}`);
      console.log(`   Treinador ID: ${cliente.treinador_id}`);
      if (cliente.treinador) {
        console.log(`   Treinador: ${cliente.treinador.nome} (${cliente.treinador.email})`);
      } else {
        console.log(`   ⚠️  Treinador não encontrado!`);
      }
      console.log('');
    });

    // Verificar clientes sem treinador
    const clientesSemTreinador = await Cliente.count({
      where: {
        treinador_id: null
      }
    });

    if (clientesSemTreinador > 0) {
      console.log(`⚠️  ${clientesSemTreinador} clientes sem treinador associado!`);
    } else {
      console.log('✅ Todos os clientes têm treinador associado!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar:', error);
    throw error;
  }
}

// Executar verificação
verificarTreinadorId()
  .then(() => {
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar verificação:', error);
    process.exit(1);
  });

