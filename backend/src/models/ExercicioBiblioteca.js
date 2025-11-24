import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExercicioBiblioteca = sequelize.define('ExercicioBiblioteca', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  grupo_muscular: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_execucao: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['repeticao', 'tempo', 'distancia', 'peso']]
    }
  },
  instrucoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagem_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'exercicios_biblioteca',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ExercicioBiblioteca;



