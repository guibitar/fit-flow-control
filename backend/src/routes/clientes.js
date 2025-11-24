import express from 'express';
import Cliente from '../models/Cliente.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os clientes do treinador logado
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: {
        treinador_id: req.user.id
      },
      order: [['created_at', 'DESC']]
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Buscar cliente por ID (apenas se for do treinador logado)
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        treinador_id: req.user.id
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar cliente (associado ao treinador logado)
router.post('/', async (req, res) => {
  try {
    // Limpar campos vazios e converter para null
    const cleanedData = { ...req.body };
    
    // Associar ao treinador logado
    cleanedData.treinador_id = req.user.id;
    
    // Converter strings vazias para null nos campos opcionais
    if (cleanedData.data_nascimento === '' || cleanedData.data_nascimento === null) {
      cleanedData.data_nascimento = null;
    }
    if (cleanedData.email === '') cleanedData.email = null;
    if (cleanedData.telefone === '') cleanedData.telefone = null;
    if (cleanedData.altura === '' || cleanedData.altura === null) cleanedData.altura = null;
    if (cleanedData.peso_atual === '' || cleanedData.peso_atual === null) cleanedData.peso_atual = null;
    if (cleanedData.objetivo === '') cleanedData.objetivo = null;
    if (cleanedData.observacoes === '') cleanedData.observacoes = null;
    if (cleanedData.valor_aula === '' || cleanedData.valor_aula === null) cleanedData.valor_aula = null;
    if (cleanedData.local_aula_padrao === '') cleanedData.local_aula_padrao = null;
    
    const cliente = await Cliente.create(cleanedData);
    res.status(201).json(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error.errors && error.errors.length > 0
      ? error.errors.map(e => e.message).join(', ')
      : error.message || 'Erro ao criar cliente';
    res.status(500).json({ error: errorMessage });
  }
});

// Atualizar cliente (apenas se for do treinador logado)
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        treinador_id: req.user.id
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Limpar campos vazios e converter para null
    const cleanedData = { ...req.body };
    
    // Não permitir alterar o treinador_id
    delete cleanedData.treinador_id;
    
    // Converter strings vazias para null nos campos opcionais
    if (cleanedData.data_nascimento === '' || cleanedData.data_nascimento === null) {
      cleanedData.data_nascimento = null;
    }
    if (cleanedData.email === '') cleanedData.email = null;
    if (cleanedData.telefone === '') cleanedData.telefone = null;
    if (cleanedData.altura === '' || cleanedData.altura === null) cleanedData.altura = null;
    if (cleanedData.peso_atual === '' || cleanedData.peso_atual === null) cleanedData.peso_atual = null;
    if (cleanedData.objetivo === '') cleanedData.objetivo = null;
    if (cleanedData.observacoes === '') cleanedData.observacoes = null;
    if (cleanedData.valor_aula === '' || cleanedData.valor_aula === null) cleanedData.valor_aula = null;
    if (cleanedData.local_aula_padrao === '') cleanedData.local_aula_padrao = null;
    
    await cliente.update(cleanedData);
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error.errors && error.errors.length > 0
      ? error.errors.map(e => e.message).join(', ')
      : error.message || 'Erro ao atualizar cliente';
    res.status(500).json({ error: errorMessage });
  }
});

// Deletar cliente (apenas se for do treinador logado)
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        id: req.params.id,
        treinador_id: req.user.id
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    await cliente.destroy();
    res.json({ success: true, message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Filtrar clientes (apenas do treinador logado)
router.post('/filter', async (req, res) => {
  try {
    const filters = req.body;
    const where = {
      treinador_id: req.user.id // Sempre filtrar por treinador
    };
    
    if (filters.status) where.status = filters.status;
    if (filters.objetivo) where.objetivo = filters.objetivo;
    if (filters.cliente_id) where.id = filters.cliente_id;
    
    const clientes = await Cliente.findAll({ 
      where, 
      order: [['created_at', 'DESC']] 
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao filtrar clientes:', error);
    res.status(500).json({ error: 'Erro ao filtrar clientes' });
  }
});

export default router;

