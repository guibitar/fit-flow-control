import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sexo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['masculino', 'feminino', 'outro']]
    }
  },
  altura: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  peso_atual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  objetivo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ativo',
    validate: {
      isIn: [['ativo', 'inativo']]
    }
  },
  valor_aula: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  local_aula_padrao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  treinador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references será definido nas associações
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Cliente;

