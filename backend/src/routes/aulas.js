import express from 'express';
import Aula from '../models/Aula.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-data' 
      ? [['data', 'DESC'], ['horario', 'DESC']] 
      : [['data', 'DESC'], ['horario', 'DESC']];
    
    const aulas = await Aula.findAll({ order });
    res.json(aulas);
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({ error: 'Erro ao listar aulas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);
    
    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    
    res.json(aula);
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    res.status(500).json({ error: 'Erro ao buscar aula' });
  }
});

router.post('/', async (req, res) => {
  try {
    const aula = await Aula.create(req.body);
    res.status(201).json(aula);
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);
    
    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    
    await aula.update(req.body);
    res.json(aula);
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({ error: 'Erro ao atualizar aula' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);
    
    if (!aula) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    
    await aula.destroy();
    res.json({ success: true, message: 'Aula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    res.status(500).json({ error: 'Erro ao deletar aula' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { status, data, cliente_id } = req.body;
    const where = {};
    
    if (status) where.status = status;
    if (data) where.data = data;
    
    const aulas = await Aula.findAll({ 
      where, 
      order: [['data', 'DESC'], ['horario', 'DESC']] 
    });
    
    // Filtrar por cliente_id se fornecido (busca nos alunos JSON)
    let filteredAulas = aulas;
    if (cliente_id) {
      filteredAulas = aulas.filter(aula => 
        aula.alunos?.some(aluno => aluno.cliente_id === parseInt(cliente_id))
      );
    }
    
    res.json(filteredAulas);
  } catch (error) {
    console.error('Erro ao filtrar aulas:', error);
    res.status(500).json({ error: 'Erro ao filtrar aulas' });
  }
});

export default router;



