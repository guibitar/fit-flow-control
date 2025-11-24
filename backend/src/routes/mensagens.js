import express from 'express';
import Mensagem from '../models/Mensagem.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const mensagens = await Mensagem.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(mensagens);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mensagem = await Mensagem.findByPk(req.params.id);
    
    if (!mensagem) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    res.json(mensagem);
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagem' });
  }
});

router.post('/', async (req, res) => {
  try {
    const mensagem = await Mensagem.create(req.body);
    res.status(201).json(mensagem);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const mensagem = await Mensagem.findByPk(req.params.id);
    
    if (!mensagem) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    await mensagem.update(req.body);
    res.json(mensagem);
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    res.status(500).json({ error: 'Erro ao atualizar mensagem' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mensagem = await Mensagem.findByPk(req.params.id);
    
    if (!mensagem) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    await mensagem.destroy();
    res.json({ success: true, message: 'Mensagem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({ error: 'Erro ao deletar mensagem' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { remetente_id, destinatario_id, cliente_id, tipo, lida } = req.body;
    const where = {};
    
    if (remetente_id) where.remetente_id = remetente_id;
    if (destinatario_id) where.destinatario_id = destinatario_id;
    if (cliente_id) where.cliente_id = cliente_id;
    if (tipo) where.tipo = tipo;
    if (lida !== undefined) where.lida = lida;
    
    const mensagens = await Mensagem.findAll({ 
      where, 
      order: [['created_at', 'DESC']] 
    });
    res.json(mensagens);
  } catch (error) {
    console.error('Erro ao filtrar mensagens:', error);
    res.status(500).json({ error: 'Erro ao filtrar mensagens' });
  }
});

export default router;



