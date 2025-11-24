/**
 * Novas entidades usando nosso backend próprio
 * Substitui base44.entities
 */

import { clientesAPI } from './client.js';

// Compatibilidade com código existente
export const Cliente = {
  list: (orderBy) => clientesAPI.list(orderBy),
  get: (id) => clientesAPI.get(id),
  create: (data) => clientesAPI.create(data),
  update: (id, data) => clientesAPI.update(id, data),
  delete: (id) => clientesAPI.delete(id),
  filter: (filters) => clientesAPI.filter(filters),
};

// Adicionar outras entidades conforme forem implementadas no backend
// export const Treino = { ... };
// export const Aula = { ... };
// etc...


