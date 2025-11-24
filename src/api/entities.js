// Usando nosso backend próprio ao invés do Base44
import { clientesAPI } from './client.js';

// Cliente - usando novo backend
export const Cliente = {
  list: (orderBy) => clientesAPI.list(orderBy),
  get: (id) => clientesAPI.get(id),
  create: (data) => clientesAPI.create(data),
  update: (id, data) => clientesAPI.update(id, data),
  delete: (id) => clientesAPI.delete(id),
  filter: (filters) => clientesAPI.filter(filters),
};

// Importar todas as APIs do novo backend
import { 
  treinosAPI, 
  avaliacoesAPI, 
  exerciciosAPI, 
  aulasAPI, 
  transacoesAPI, 
  progressosAPI, 
  historicoTreinosAPI, 
  mensagensAPI 
} from './client.js';

// Todas as entidades agora usam o novo backend
export const Treino = treinosAPI;
export const Avaliacao = avaliacoesAPI;
export const ExercicioBiblioteca = exerciciosAPI;
export const Aula = aulasAPI;
export const TransacaoFinanceira = transacoesAPI;
export const ProgressoCliente = progressosAPI;
export const HistoricoTreino = historicoTreinosAPI;
export const Mensagem = mensagensAPI;

// Usuário - usando novo backend (via authAPI)
import { authAPI } from './client.js';
export const Usuario = {
  list: (orderBy) => authAPI.listUsers(orderBy),
  create: (data) => authAPI.createUser(data),
  update: (id, data) => authAPI.updateUser(id, data),
  delete: () => Promise.resolve({}),
  filter: () => Promise.resolve([]),
};

// auth - usando novo backend
export const User = {
  ...authAPI,
  list: (orderBy) => authAPI.listUsers(orderBy),
  update: (id, data) => authAPI.updateUser(id, data),
};