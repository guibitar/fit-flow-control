import express from 'express';
import Avaliacao from '../models/Avaliacao.js';
import Cliente from '../models/Cliente.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-data_avaliacao' 
      ? [['data_avaliacao', 'DESC']] 
      : [['data_avaliacao', 'DESC']];
    
    // Buscar IDs dos clientes do treinador logado
    const clientesDoTreinador = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id']
    });
    const clienteIds = clientesDoTreinador.map(c => c.id);

    if (clienteIds.length === 0) {
      return res.json([]); // Se não há clientes, não há avaliações para mostrar
    }

    const avaliacoes = await Avaliacao.findAll({ 
      where: { cliente_id: clienteIds },
      order 
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ error: 'Erro ao listar avaliações' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findByPk(req.params.id);
    
    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(avaliacao.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    res.json(avaliacao);
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliação' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cliente_id } = req.body;

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findOne({
      where: {
        id: cliente_id,
        treinador_id: req.user.id
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao treinador' });
    }

    const avaliacao = await Avaliacao.create(req.body);
    res.status(201).json(avaliacao);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar avaliação' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findByPk(req.params.id);
    
    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(avaliacao.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    await avaliacao.update(req.body);
    res.json(avaliacao);
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar avaliação' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findByPk(req.params.id);
    
    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(avaliacao.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    await avaliacao.destroy();
    res.json({ success: true, message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ error: 'Erro ao deletar avaliação' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { cliente_id } = req.body;

    // Buscar IDs dos clientes do treinador logado
    const clientesDoTreinador = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id']
    });
    const clienteIds = clientesDoTreinador.map(c => c.id);

    if (clienteIds.length === 0) {
      return res.json([]);
    }

    const where = { cliente_id: clienteIds }; // Sempre filtrar por clientes do treinador
    
    if (cliente_id) {
      // Garantir que o cliente_id solicitado pertence ao treinador
      if (!clienteIds.includes(parseInt(cliente_id))) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao treinador' });
      }
      where.cliente_id = parseInt(cliente_id);
    }
    
    const avaliacoes = await Avaliacao.findAll({ 
      where, 
      order: [['data_avaliacao', 'DESC']] 
    });
    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao filtrar avaliações:', error);
    res.status(500).json({ error: 'Erro ao filtrar avaliações' });
  }
});

export default router;

