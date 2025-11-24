import express from 'express';
import TransacaoFinanceira from '../models/TransacaoFinanceira.js';
import Cliente from '../models/Cliente.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { orderBy } = req.query;
    const order = orderBy === '-data_transacao' 
      ? [['data_transacao', 'DESC']] 
      : [['data_transacao', 'DESC']];
    
    // Buscar IDs dos clientes do treinador logado
    const clientesDoTreinador = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id', 'nome']
    });
    const clienteIds = clientesDoTreinador.map(c => c.id);
    const clientesMap = new Map(clientesDoTreinador.map(c => [c.id, c.nome]));

    if (clienteIds.length === 0) {
      return res.json([]); // Se não há clientes, não há transações para mostrar
    }

    const transacoes = await TransacaoFinanceira.findAll({ 
      where: { cliente_id: clienteIds },
      order
    });

    // Popular cliente_nome se não estiver presente
    const transacoesComNome = transacoes.map(t => {
      const transacao = t.toJSON();
      if (!transacao.cliente_nome && transacao.cliente_id) {
        transacao.cliente_nome = clientesMap.get(transacao.cliente_id) || 'Cliente não encontrado';
      }
      return transacao;
    });

    res.json(transacoesComNome);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transacao = await TransacaoFinanceira.findByPk(req.params.id);
    
    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    if (transacao.cliente_id) {
      const cliente = await Cliente.findByPk(transacao.cliente_id);
      if (!cliente || cliente.treinador_id !== req.user.id) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Popular cliente_nome
      const transacaoJSON = transacao.toJSON();
      transacaoJSON.cliente_nome = cliente.nome;
      return res.json(transacaoJSON);
    }
    
    res.json(transacao);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cliente_id } = req.body;

    // Verificar se o cliente pertence ao treinador e obter nome
    let clienteNome = req.body.cliente_nome;
    if (cliente_id) {
      const cliente = await Cliente.findOne({
        where: {
          id: cliente_id,
          treinador_id: req.user.id
        }
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao treinador' });
      }

      // Usar nome do cliente se não foi fornecido
      if (!clienteNome) {
        clienteNome = cliente.nome;
      }
    }

    // Criar transação sem cliente_nome (coluna não existe no banco, é populado dinamicamente)
    const { cliente_nome, ...dadosTransacao } = req.body;
    const transacao = await TransacaoFinanceira.create(dadosTransacao);
    
    // Adicionar cliente_nome ao JSON de resposta
    const transacaoJSON = transacao.toJSON();
    transacaoJSON.cliente_nome = clienteNome;
    
    res.status(201).json(transacaoJSON);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar transação' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const transacao = await TransacaoFinanceira.findByPk(req.params.id);
    
    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    if (transacao.cliente_id) {
      const cliente = await Cliente.findByPk(transacao.cliente_id);
      if (!cliente || cliente.treinador_id !== req.user.id) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
    }
    
    // Remover apenas cliente_nome (não existe no banco, é populado dinamicamente)
    const { cliente_nome, ...dadosAtualizacao } = req.body;
    await transacao.update(dadosAtualizacao);
    res.json(transacao);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar transação' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const transacao = await TransacaoFinanceira.findByPk(req.params.id);
    
    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Verificar se o cliente pertence ao treinador
    if (transacao.cliente_id) {
      const cliente = await Cliente.findByPk(transacao.cliente_id);
      if (!cliente || cliente.treinador_id !== req.user.id) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
    }
    
    await transacao.destroy();
    res.json({ success: true, message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const { tipo_transacao, cliente_id, data_inicio, data_fim } = req.body;

    // Buscar IDs e nomes dos clientes do treinador logado
    const clientesDoTreinador = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id', 'nome']
    });
    const clienteIds = clientesDoTreinador.map(c => c.id);
    const clientesMap = new Map(clientesDoTreinador.map(c => [c.id, c.nome]));

    if (clienteIds.length === 0) {
      return res.json([]);
    }

    const where = { cliente_id: clienteIds }; // Sempre filtrar por clientes do treinador
    
    if (tipo_transacao) where.tipo_transacao = tipo_transacao;
    if (cliente_id) {
      // Garantir que o cliente_id solicitado pertence ao treinador
      if (!clienteIds.includes(parseInt(cliente_id))) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao treinador' });
      }
      where.cliente_id = parseInt(cliente_id);
    }
    
    const transacoes = await TransacaoFinanceira.findAll({ 
      where, 
      order: [['data_transacao', 'DESC']]
    });

    // Filtrar por data se fornecido e popular cliente_nome
    let filtered = transacoes.map(t => {
      const transacao = t.toJSON();
      if (!transacao.cliente_nome && transacao.cliente_id) {
        transacao.cliente_nome = clientesMap.get(transacao.cliente_id) || 'Cliente não encontrado';
      }
      return transacao;
    });

    if (data_inicio || data_fim) {
      filtered = filtered.filter(t => {
        const data = new Date(t.data_transacao);
        if (data_inicio && data < new Date(data_inicio)) return false;
        if (data_fim && data > new Date(data_fim)) return false;
        return true;
      });
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Erro ao filtrar transações:', error);
    res.status(500).json({ error: 'Erro ao filtrar transações' });
  }
});

export default router;

