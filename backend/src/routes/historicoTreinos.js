import express from 'express';
import HistoricoTreino from '../models/HistoricoTreino.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-data_execucao' 
      ? [['data_execucao', 'DESC']] 
      : [['data_execucao', 'DESC']];
    
    const historicos = await HistoricoTreino.findAll({ order });
    res.json(historicos);
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({ error: 'Erro ao listar histórico' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const historico = await HistoricoTreino.findByPk(req.params.id);
    
    if (!historico) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    
    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

router.post('/', async (req, res) => {
  try {
    const historico = await HistoricoTreino.create(req.body);
    res.status(201).json(historico);
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    res.status(500).json({ error: 'Erro ao criar histórico' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const historico = await HistoricoTreino.findByPk(req.params.id);
    
    if (!historico) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    
    await historico.update(req.body);
    res.json(historico);
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
    res.status(500).json({ error: 'Erro ao atualizar histórico' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const historico = await HistoricoTreino.findByPk(req.params.id);
    
    if (!historico) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    
    await historico.destroy();
    res.json({ success: true, message: 'Histórico deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar histórico:', error);
    res.status(500).json({ error: 'Erro ao deletar histórico' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { treino_id, cliente_id } = req.body;
    const where = {};
    
    if (treino_id) where.treino_id = treino_id;
    if (cliente_id) where.cliente_id = cliente_id;
    
    const historicos = await HistoricoTreino.findAll({ 
      where, 
      order: [['data_execucao', 'DESC']] 
    });
    res.json(historicos);
  } catch (error) {
    console.error('Erro ao filtrar histórico:', error);
    res.status(500).json({ error: 'Erro ao filtrar histórico' });
  }
});

export default router;



