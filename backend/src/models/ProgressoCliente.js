import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProgressoCliente = sequelize.define('ProgressoCliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo_medicao: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['peso', 'medidas', 'avaliacao_fisica', 'performance']]
    }
  },
  dados: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'progresso_clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ProgressoCliente;

