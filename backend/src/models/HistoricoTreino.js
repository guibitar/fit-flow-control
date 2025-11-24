import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistoricoTreino = sequelize.define('HistoricoTreino', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  treino_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  treino_titulo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cliente_nome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data_execucao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  duracao_total_segundos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'completo',
    validate: {
      isIn: [['completo', 'incompleto', 'cancelado']]
    }
  },
  exercicios_executados: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  percepcao_geral: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  observacoes_cliente: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'historico_treinos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default HistoricoTreino;

