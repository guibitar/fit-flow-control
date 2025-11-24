import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário
    const usuario = await Usuario.findByPk(decoded.userId);
    
    if (!usuario || usuario.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    // Adicionar usuário à requisição
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Erro ao autenticar' });
  }
};

// Middleware para verificar se é admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer permissão de administrador.' });
  }
  next();
};


