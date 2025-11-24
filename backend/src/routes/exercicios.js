import express from 'express';
import ExercicioBiblioteca from '../models/ExercicioBiblioteca.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const exercicios = await ExercicioBiblioteca.findAll({
      order: [['nome', 'ASC']]
    });
    res.json(exercicios);
  } catch (error) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({ error: 'Erro ao listar exercícios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exercicio = await ExercicioBiblioteca.findByPk(req.params.id);
    
    if (!exercicio) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }
    
    res.json(exercicio);
  } catch (error) {
    console.error('Erro ao buscar exercício:', error);
    res.status(500).json({ error: 'Erro ao buscar exercício' });
  }
});

router.post('/', async (req, res) => {
  try {
    const exercicio = await ExercicioBiblioteca.create(req.body);
    res.status(201).json(exercicio);
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    res.status(500).json({ error: 'Erro ao criar exercício' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const exercicio = await ExercicioBiblioteca.findByPk(req.params.id);
    
    if (!exercicio) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }
    
    await exercicio.update(req.body);
    res.json(exercicio);
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    res.status(500).json({ error: 'Erro ao atualizar exercício' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const exercicio = await ExercicioBiblioteca.findByPk(req.params.id);
    
    if (!exercicio) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }
    
    await exercicio.destroy();
    res.json({ success: true, message: 'Exercício deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    res.status(500).json({ error: 'Erro ao deletar exercício' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { grupo_muscular, tipo_execucao, categoria } = req.body;
    const where = {};
    
    if (grupo_muscular) where.grupo_muscular = grupo_muscular;
    if (tipo_execucao) where.tipo_execucao = tipo_execucao;
    if (categoria) where.categoria = categoria;
    
    const exercicios = await ExercicioBiblioteca.findAll({ 
      where, 
      order: [['nome', 'ASC']] 
    });
    res.json(exercicios);
  } catch (error) {
    console.error('Erro ao filtrar exercícios:', error);
    res.status(500).json({ error: 'Erro ao filtrar exercícios' });
  }
});

export default router;



