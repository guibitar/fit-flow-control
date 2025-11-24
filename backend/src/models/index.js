import Usuario from './Usuario.js';
import Cliente from './Cliente.js';
import Treino from './Treino.js';
import Avaliacao from './Avaliacao.js';
import Aula from './Aula.js';
import TransacaoFinanceira from './TransacaoFinanceira.js';
import HistoricoTreino from './HistoricoTreino.js';
import ExercicioBiblioteca from './ExercicioBiblioteca.js';
import ProgressoCliente from './ProgressoCliente.js';
import Mensagem from './Mensagem.js';

// Exportar todos os modelos
export {
  Usuario,
  Cliente,
  Treino,
  Avaliacao,
  Aula,
  TransacaoFinanceira,
  HistoricoTreino,
  ExercicioBiblioteca,
  ProgressoCliente,
  Mensagem
};

// Função para inicializar todos os modelos e associações
export function initModels() {
  // Associações Usuario (Treinador) -> Cliente
  Usuario.hasMany(Cliente, { foreignKey: 'treinador_id', as: 'clientes' });
  Cliente.belongsTo(Usuario, { foreignKey: 'treinador_id', as: 'treinador' });

  // Associações Cliente
  Cliente.hasMany(Treino, { foreignKey: 'cliente_id', as: 'treinos' });
  Cliente.hasMany(Avaliacao, { foreignKey: 'cliente_id', as: 'avaliacoes' });
  Cliente.hasMany(TransacaoFinanceira, { foreignKey: 'cliente_id', as: 'transacoes' });
  Cliente.hasMany(HistoricoTreino, { foreignKey: 'cliente_id', as: 'historico_treinos' });
  Cliente.hasMany(ProgressoCliente, { foreignKey: 'cliente_id', as: 'progressos' });
  Cliente.hasMany(Mensagem, { foreignKey: 'cliente_id', as: 'mensagens' });

  // Associações Treino
  Treino.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
  Treino.hasMany(Aula, { foreignKey: 'treino_id', as: 'aulas' });
  Treino.hasMany(HistoricoTreino, { foreignKey: 'treino_id', as: 'historico' });

  // Associações Avaliacao
  Avaliacao.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

  // Associações Aula
  Aula.belongsTo(Treino, { foreignKey: 'treino_id', as: 'treino' });
  Aula.hasMany(TransacaoFinanceira, { foreignKey: 'aula_id', as: 'transacoes' });

  // Associações TransacaoFinanceira
  TransacaoFinanceira.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
  TransacaoFinanceira.belongsTo(Aula, { foreignKey: 'aula_id', as: 'aula' });

  // Associações HistoricoTreino
  HistoricoTreino.belongsTo(Treino, { foreignKey: 'treino_id', as: 'treino' });
  HistoricoTreino.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

  // Associações ProgressoCliente
  ProgressoCliente.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

  // Associações Mensagem
  Mensagem.belongsTo(Usuario, { foreignKey: 'remetente_id', as: 'remetente' });
  Mensagem.belongsTo(Usuario, { foreignKey: 'destinatario_id', as: 'destinatario' });
  Mensagem.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
  Usuario.hasMany(Mensagem, { foreignKey: 'remetente_id', as: 'mensagens_enviadas' });
  Usuario.hasMany(Mensagem, { foreignKey: 'destinatario_id', as: 'mensagens_recebidas' });
}

