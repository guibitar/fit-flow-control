/**
 * Cliente API para substituir Base44 SDK
 * Faz requisições HTTP para nosso backend próprio
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função auxiliar para fazer requisições
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Se não autorizado, limpar token e redirecionar
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
      throw new Error('Não autorizado');
    }

    const data = await response.json();
    
    // Se não for ok, lançar erro (será capturado no try/catch)
    if (!response.ok) {
      const error = new Error(data.error || 'Erro na requisição');
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// API de Autenticação
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      
      // O backend retorna { success: true, token, user }
      if (response.success && response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
      }
      
      return response;
    } catch (error) {
      // Se der erro, retornar no formato esperado
      return {
        success: false,
        error: error.message || 'Erro ao fazer login'
      };
    }
  },

  verify: async () => {
    return request('/auth/verify', {
      method: 'GET',
    });
  },

  logout: async () => {
    await request('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  },

  createUser: async (userData) => {
    return request('/auth/users', {
      method: 'POST',
      body: userData,
    });
  },

  listUsers: async (orderBy) => {
    const query = orderBy ? `?orderBy=${orderBy}` : '';
    return request(`/auth/users${query}`, {
      method: 'GET',
    });
  },

  updateUser: async (id, userData) => {
    return request(`/auth/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  },

  updateMe: async (userData) => {
    return request('/auth/me', {
      method: 'PUT',
      body: userData,
    });
  },

  me: async () => {
    return request('/auth/verify', {
      method: 'GET',
    });
  },
};

// Função auxiliar para criar APIs CRUD
function createCRUDAPI(endpoint) {
  return {
    list: async (orderBy) => {
      const query = orderBy ? `?orderBy=${orderBy}` : '';
      return request(`${endpoint}${query}`);
    },
    get: async (id) => {
      return request(`${endpoint}/${id}`);
    },
    create: async (data) => {
      return request(endpoint, {
        method: 'POST',
        body: data,
      });
    },
    update: async (id, data) => {
      return request(`${endpoint}/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete: async (id) => {
      return request(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
    filter: async (filters) => {
      return request(`${endpoint}/filter`, {
        method: 'POST',
        body: filters,
      });
    },
  };
}

// API de Clientes
export const clientesAPI = {
  list: async (orderBy = '-created_at') => {
    return request('/clientes');
  },
  get: async (id) => {
    return request(`/clientes/${id}`);
  },
  create: async (data) => {
    return request('/clientes', {
      method: 'POST',
      body: data,
    });
  },
  update: async (id, data) => {
    return request(`/clientes/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  delete: async (id) => {
    return request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  },
  filter: async (filters) => {
    const all = await request('/clientes');
    // Filtrar no cliente se necessário
    if (filters && Object.keys(filters).length > 0) {
      return all.filter(item => {
        return Object.keys(filters).every(key => item[key] === filters[key]);
      });
    }
    return all;
  },
};

// API de Treinos
export const treinosAPI = createCRUDAPI('/treinos');

// API de Avaliações
export const avaliacoesAPI = createCRUDAPI('/avaliacoes');

// API de Aulas
export const aulasAPI = createCRUDAPI('/aulas');

// API de Transações Financeiras
export const transacoesAPI = createCRUDAPI('/transacoes');

// API de Histórico de Treinos
export const historicoTreinosAPI = createCRUDAPI('/historico-treinos');

// API de Exercícios (Biblioteca)
export const exerciciosAPI = createCRUDAPI('/exercicios');

// API de Progressos
export const progressosAPI = createCRUDAPI('/progressos');

// API de Mensagens
export const mensagensAPI = createCRUDAPI('/mensagens');

// Exportar API completa (compatível com estrutura antiga)
export const api = {
  auth: authAPI,
  clientes: clientesAPI,
  treinos: treinosAPI,
  avaliacoes: avaliacoesAPI,
  aulas: aulasAPI,
  transacoes: transacoesAPI,
  historicoTreinos: historicoTreinosAPI,
  exercicios: exerciciosAPI,
  progressos: progressosAPI,
  mensagens: mensagensAPI,
};

export default api;

