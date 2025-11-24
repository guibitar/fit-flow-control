import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Treino = sequelize.define('Treino', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
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
  tipo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'forca'
  },
  duracao_estimada: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 60
  },
  exercicios: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  data_envio: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'treinos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Treino;

