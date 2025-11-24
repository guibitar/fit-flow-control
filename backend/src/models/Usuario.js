import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['admin', 'user']]
    }
  },
  tipo_perfil: {
    type: DataTypes.STRING,
    defaultValue: 'personal_trainer',
    validate: {
      isIn: [['administrador', 'personal_trainer', 'cliente']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ativo',
    validate: {
      isIn: [['ativo', 'inativo']]
    }
  },
  session_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Usuario;

