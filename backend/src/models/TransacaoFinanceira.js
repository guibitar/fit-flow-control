import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TransacaoFinanceira = sequelize.define('TransacaoFinanceira', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_transacao: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['aula_realizada', 'pagamento', 'reembolso', 'outro']]
    }
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  data_transacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // cliente_nome removido - não existe no banco, é populado dinamicamente
  aula_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metodo_pagamento: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'transacoes_financeiras',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default TransacaoFinanceira;

