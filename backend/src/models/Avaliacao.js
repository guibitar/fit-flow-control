import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Avaliacao = sequelize.define('Avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cliente_nome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data_avaliacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  sexo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['M', 'F', 'masculino', 'feminino']]
    }
  },
  idade: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  altura: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  percentual_gordura: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  medidas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  dobras_cutaneas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  composicao_corporal: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'avaliacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Avaliacao;

