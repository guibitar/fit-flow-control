import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Mensagem = sequelize.define('Mensagem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  remetente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  destinatario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  assunto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'mensagem',
    validate: {
      isIn: [['mensagem', 'notificacao', 'lembrete']]
    }
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_leitura: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mensagens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Mensagem;

