import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Aula = sequelize.define('Aula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: false
  },
  tipo_aula: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'presencial',
    validate: {
      isIn: [['presencial', 'online']]
    }
  },
  alunos: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'agendada',
    validate: {
      isIn: [['agendada', 'realizada', 'cancelada', 'falta']]
    }
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 60
  },
  local: {
    type: DataTypes.STRING,
    allowNull: true
  },
  link_online: {
    type: DataTypes.STRING,
    allowNull: true
  },
  treino_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'aulas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Aula;

