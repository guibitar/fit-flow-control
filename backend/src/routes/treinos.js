import express from 'express';
import Treino from '../models/Treino.js';
import Cliente from '../models/Cliente.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os treinos (apenas dos clientes do treinador logado)
router.get('/', async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-created_date' || orderBy === '-created_at' 
      ? [['created_at', 'DESC']] 
      : [['created_at', 'DESC']];
    
    // Buscar IDs dos clientes do treinador logado
    const clientes = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id']
    });
    const clienteIds = clientes.map(c => c.id);
    
    // Se o treinador não tem clientes, retornar array vazio
    if (clienteIds.length === 0) {
      return res.json([]);
    }
    
    // Filtrar treinos apenas dos clientes do treinador
    const treinos = await Treino.findAll({ 
      where: { cliente_id: clienteIds },
      order 
    });
    
    console.log(`✅ Listando ${treinos.length} treino(s) do treinador ${req.user.id} (${clienteIds.length} cliente(s))`);
    
    res.json(treinos);
  } catch (error) {
    console.error('Erro ao listar treinos:', error);
    res.status(500).json({ error: 'Erro ao listar treinos' });
  }
});

// Buscar treino por ID
router.get('/:id', async (req, res) => {
  try {
    const treino = await Treino.findByPk(req.params.id);
    
    if (!treino) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    res.json(treino);
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({ error: 'Erro ao buscar treino' });
  }
});

// Criar treino
router.post('/', async (req, res) => {
  try {
    console.log('📥 Dados recebidos para criar treino:', JSON.stringify(req.body, null, 2));
    
    // Garantir que cliente_id seja um número
    const dadosTreino = {
      ...req.body,
      cliente_id: req.body.cliente_id ? parseInt(req.body.cliente_id) : null
    };
    
    console.log('🔄 Dados normalizados:', JSON.stringify(dadosTreino, null, 2));
    
    const treino = await Treino.create(dadosTreino);
    
    console.log('✅ Treino criado com sucesso:', {
      id: treino.id,
      cliente_id: treino.cliente_id,
      titulo: treino.titulo
    });
    
    res.status(201).json(treino);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro ao criar treino' });
  }
});

// Atualizar treino
router.put('/:id', async (req, res) => {
  try {
    const treino = await Treino.findByPk(req.params.id);
    
    if (!treino) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    await treino.update(req.body);
    res.json(treino);
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ error: 'Erro ao atualizar treino' });
  }
});

// Deletar treino
router.delete('/:id', async (req, res) => {
  try {
    const treino = await Treino.findByPk(req.params.id);
    
    if (!treino) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    await treino.destroy();
    res.json({ success: true, message: 'Treino deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar treino:', error);
    res.status(500).json({ error: 'Erro ao deletar treino' });
  }
});

// Filtrar treinos
router.post('/filter', async (req, res) => {
  try {
    const { cliente_id, tipo, status } = req.body;
    const where = {};
    
    console.log('🔍 Filtro de treinos recebido:', { cliente_id, tipo, status });
    
    if (cliente_id) {
      // Garantir que cliente_id seja um número
      where.cliente_id = parseInt(cliente_id);
      console.log('✅ Filtrando por cliente_id:', where.cliente_id);
    }
    if (tipo) where.tipo = tipo;
    
    console.log('🔍 Where clause:', where);
    
    const treinos = await Treino.findAll({ where, order: [['created_at', 'DESC']] });
    
    console.log(`✅ Encontrados ${treinos.length} treino(s) para cliente_id: ${where.cliente_id || 'todos'}`);
    
    res.json(treinos);
  } catch (error) {
    console.error('Erro ao filtrar treinos:', error);
    res.status(500).json({ error: 'Erro ao filtrar treinos' });
  }
});

export default router;

