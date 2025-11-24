import { Usuario } from './entities';
import { hashPassword, verifyPassword, generateSessionToken } from '@/utils/auth';

/**
 * Autenticação própria do sistema
 * Não usa base44.auth, usa nossa entidade Usuario
 */

/**
 * Faz login com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha em texto plano
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function login(email, password) {
  try {
    // Busca usuário por email
    const usuarios = await Usuario.filter({ email: email.toLowerCase().trim() });
    
    if (!usuarios || usuarios.length === 0) {
      return {
        success: false,
        error: 'Email ou senha incorretos'
      };
    }

    const usuario = usuarios[0];

    // Verifica se o usuário está ativo
    if (usuario.status !== 'ativo') {
      return {
        success: false,
        error: 'Usuário inativo. Entre em contato com o administrador.'
      };
    }

    // Verifica a senha
    const senhaValida = await verifyPassword(password, usuario.senha_hash);
    
    if (!senhaValida) {
      return {
        success: false,
        error: 'Email ou senha incorretos'
      };
    }

    // Remove a senha do objeto antes de retornar
    const { senha_hash, ...userData } = usuario;

    // Gera token de sessão
    const sessionToken = generateSessionToken();
    
    // Atualiza último login
    await Usuario.update(usuario.id, {
      ultimo_login: new Date().toISOString(),
      session_token: sessionToken
    });

    return {
      success: true,
      user: {
        ...userData,
        session_token: sessionToken
      }
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer login. Tente novamente.'
    };
  }
}

/**
 * Verifica se o usuário está autenticado através do token de sessão
 * @param {string} sessionToken - Token de sessão
 * @returns {Promise<{success: boolean, user?: object}>}
 */
export async function verifySession(sessionToken) {
  try {
    if (!sessionToken) {
      return { success: false };
    }

    const usuarios = await Usuario.filter({ session_token: sessionToken });
    
    if (!usuarios || usuarios.length === 0) {
      return { success: false };
    }

    const usuario = usuarios[0];

    // Verifica se o usuário ainda está ativo
    if (usuario.status !== 'ativo') {
      return { success: false };
    }

    // Remove a senha do objeto
    const { senha_hash, ...userData } = usuario;

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return { success: false };
  }
}

/**
 * Faz logout (limpa o token de sessão)
 * @param {string} userId - ID do usuário
 */
export async function logout(userId) {
  try {
    if (userId) {
      await Usuario.update(userId, {
        session_token: null
      });
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

/**
 * Cria um novo usuário
 * @param {object} userData - Dados do usuário
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function createUser(userData) {
  try {
    const { email, senha, nome, role = 'user', tipo_perfil, status = 'ativo' } = userData;

    // Verifica se o email já existe
    const usuariosExistentes = await Usuario.filter({ email: email.toLowerCase().trim() });
    if (usuariosExistentes && usuariosExistentes.length > 0) {
      return {
        success: false,
        error: 'Email já cadastrado'
      };
    }

    // Gera hash da senha
    const senhaHash = await hashPassword(senha);

    // Cria o usuário
    const novoUsuario = await Usuario.create({
      email: email.toLowerCase().trim(),
      senha_hash: senhaHash,
      nome: nome,
      full_name: nome,
      role: role,
      tipo_perfil: tipo_perfil || 'personal_trainer',
      status: status,
      created_date: new Date().toISOString()
    });

    // Remove a senha do objeto antes de retornar
    const { senha_hash, ...userDataReturn } = novoUsuario;

    return {
      success: true,
      user: userDataReturn
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar usuário'
    };
  }
}

/**
 * Cria usuários iniciais do sistema
 * Esta função deve ser chamada uma vez para inicializar o sistema
 */
export async function createInitialUsers() {
  const usuariosIniciais = [
    {
      email: 'admin@fittrainer.com',
      senha: 'admin123',
      nome: 'Administrador',
      role: 'admin',
      tipo_perfil: 'personal_trainer',
      status: 'ativo'
    },
    {
      email: 'trainer@fittrainer.com',
      senha: 'trainer123',
      nome: 'Personal Trainer',
      role: 'user',
      tipo_perfil: 'personal_trainer',
      status: 'ativo'
    },
    {
      email: 'cliente@fittrainer.com',
      senha: 'cliente123',
      nome: 'Cliente Teste',
      role: 'user',
      tipo_perfil: 'cliente',
      status: 'ativo'
    }
  ];

  const resultados = [];

  for (const userData of usuariosIniciais) {
    // Verifica se o usuário já existe
    const usuariosExistentes = await Usuario.filter({ email: userData.email });
    
    if (usuariosExistentes && usuariosExistentes.length > 0) {
      resultados.push({
        email: userData.email,
        status: 'já existe',
        message: `Usuário ${userData.email} já existe`
      });
      continue;
    }

    const resultado = await createUser(userData);
    resultados.push({
      email: userData.email,
      status: resultado.success ? 'criado' : 'erro',
      message: resultado.success ? 'Usuário criado com sucesso' : resultado.error
    });
  }

  return resultados;
}


