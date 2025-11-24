import express from 'express';
import { login, verifySession, logout, createUser, listUsers, updateUser, updateMe } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);

// Rotas protegidas
router.get('/verify', authenticateToken, verifySession);
router.post('/logout', authenticateToken, logout);
router.put('/me', authenticateToken, updateMe);

// Rotas de administração (apenas admin)
// IMPORTANTE: /users/:id deve vir DEPOIS de /users para evitar conflitos
router.get('/users', authenticateToken, requireAdmin, listUsers);
router.post('/users', authenticateToken, requireAdmin, createUser);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);

export default router;

