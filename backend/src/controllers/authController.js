import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { hashPassword } from '../utils/auth.js';

// Função auxiliar para gerar token JWT
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar status
    if (usuario.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo. Entre em contato com o administrador.' });
    }

    // Verificar senha (comparar hash)
    const passwordHash = await hashPassword(password);
    const senhaValida = passwordHash === usuario.senha_hash;

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = generateToken(usuario.id);

    // Atualizar último login
    await usuario.update({
      ultimo_login: new Date(),
      session_token: token
    });

    // Retornar dados do usuário (sem senha)
    const { senha_hash, ...userData } = usuario.toJSON();

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Verificar sessão
export const verifySession = async (req, res) => {
  try {
    // O middleware authenticateToken já adicionou req.user
    const { senha_hash, session_token, ...userData } = req.user.toJSON();
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({ error: 'Erro ao verificar sessão' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    await req.user.update({
      session_token: null
    });

    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

// Criar usuário (apenas admin)
export const createUser = async (req, res) => {
  try {
    const { email, senha, nome, role = 'user', tipo_perfil, status = 'ativo' } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário
    const novoUsuario = await Usuario.create({
      email: email.toLowerCase().trim(),
      senha_hash: senhaHash,
      nome,
      full_name: nome,
      role,
      tipo_perfil: tipo_perfil || 'personal_trainer',
      status
    });

    const { senha_hash, ...userData } = novoUsuario.toJSON();

    res.status(201).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Listar todos os usuários (apenas admin)
export const listUsers = async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-created_date' || orderBy === '-created_at'
      ? [['created_at', 'DESC']]
      : [['created_at', 'DESC']];

    const usuarios = await Usuario.findAll({
      order,
      attributes: { exclude: ['senha_hash', 'session_token'] }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

// Atualizar usuário (apenas admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Não permitir atualizar senha por esta rota
    delete updateData.senha;
    delete updateData.senha_hash;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await usuario.update(updateData);

    const { senha_hash, session_token, ...userData } = usuario.toJSON();

    res.json(userData);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Atualizar próprio perfil
export const updateMe = async (req, res) => {
  try {
    const updateData = req.body;

    // Não permitir atualizar senha por esta rota
    delete updateData.senha;
    delete updateData.senha_hash;
    // Não permitir atualizar role ou tipo_perfil por esta rota (apenas admin pode)
    delete updateData.role;
    delete updateData.tipo_perfil;

    await req.user.update(updateData);

    const { senha_hash, session_token, ...userData } = req.user.toJSON();

    res.json(userData);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

