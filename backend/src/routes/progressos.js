import express from 'express';
import ProgressoCliente from '../models/ProgressoCliente.js';
import Cliente from '../models/Cliente.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Helper para transformar dados do banco para o formato do frontend
function transformProgressoForFrontend(progresso) {
  const dados = progresso.dados || {};
  const progressoJSON = progresso.toJSON();
  
  // Formatar data_registro para string ISO se for Date
  let dataRegistro = progressoJSON.data_registro;
  if (dataRegistro instanceof Date) {
    dataRegistro = dataRegistro.toISOString();
  } else if (dataRegistro && typeof dataRegistro === 'string') {
    // Se já é string, garantir formato ISO
    if (!dataRegistro.includes('T')) {
      dataRegistro = new Date(dataRegistro).toISOString();
    }
  }
  
  return {
    ...progressoJSON,
    data_registro: dataRegistro,
    // Extrair campos do JSONB para o formato esperado pelo frontend
    peso: dados.peso || progressoJSON.peso || null,
    percentual_gordura: dados.percentual_gordura || progressoJSON.percentual_gordura || null,
    massa_magra: dados.massa_magra || progressoJSON.massa_magra || null,
    medidas_corporais: dados.medidas_corporais || progressoJSON.medidas_corporais || {},
    desempenho_exercicios: dados.desempenho_exercicios || progressoJSON.desempenho_exercicios || [],
    fotos_progresso: dados.fotos_progresso || progressoJSON.fotos_progresso || [],
    feedback_subjetivo: dados.feedback_subjetivo || progressoJSON.feedback_subjetivo || {},
    observacoes_personal: dados.observacoes_personal || progressoJSON.observacoes_personal || null,
    metas_proxima_avaliacao: dados.metas_proxima_avaliacao || progressoJSON.metas_proxima_avaliacao || null,
  };
}

// Função auxiliar para verificar se um valor é um número válido
function isNumberValue(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') return !isNaN(val) && isFinite(val);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return false;
    const parsed = parseFloat(trimmed);
    return !isNaN(parsed) && isFinite(parsed);
  }
  return false;
}

// Helper para transformar dados do frontend para o formato do banco
function transformProgressoForBackend(data) {
  console.log('🔍 transformProgressoForBackend - dados recebidos:', Object.keys(data));
  
  const {
    peso,
    percentual_gordura,
    massa_magra,
    medidas_corporais,
    desempenho_exercicios,
    fotos_progresso,
    feedback_subjetivo,
    observacoes_personal,
    metas_proxima_avaliacao,
    tipo_medicao,
    data_registro,
    cliente_id,
    observacoes,
    ...rest
  } = data;

  console.log('🔍 Valores extraídos:', {
    peso,
    percentual_gordura,
    massa_magra,
    temMedidas: medidas_corporais && Object.keys(medidas_corporais || {}).length > 0,
    temDesempenho: desempenho_exercicios && Array.isArray(desempenho_exercicios) && desempenho_exercicios.length > 0,
    tipo_medicao_recebido: tipo_medicao
  });

  // Determinar tipo_medicao se não fornecido
  let tipo = tipo_medicao;
  
  // Se tipo não foi fornecido ou é inválido, determinar automaticamente
  if (!tipo || !['peso', 'medidas', 'avaliacao_fisica', 'performance'].includes(tipo)) {
    // Verificar se há dados para determinar o tipo
    const temPeso = isNumberValue(peso);
    const temGordura = isNumberValue(percentual_gordura);
    const temMassaMagra = isNumberValue(massa_magra);
    const temMedidas = medidas_corporais && typeof medidas_corporais === 'object' && Object.keys(medidas_corporais).length > 0 && Object.values(medidas_corporais).some(v => isNumberValue(v));
    const temDesempenho = desempenho_exercicios && Array.isArray(desempenho_exercicios) && desempenho_exercicios.length > 0;
    const temFeedback = feedback_subjetivo && (
      (feedback_subjetivo.dores_desconfortos && feedback_subjetivo.dores_desconfortos.trim() !== '') ||
      (feedback_subjetivo.comentarios_gerais && feedback_subjetivo.comentarios_gerais.trim() !== '')
    );
    const temObservacoes = observacoes_personal && observacoes_personal.trim() !== '';
    const temMetas = metas_proxima_avaliacao && metas_proxima_avaliacao.trim() !== '';
    
    console.log('🔍 Verificação de dados:', {
      temPeso,
      temGordura,
      temMassaMagra,
      temMedidas,
      temDesempenho,
      temFeedback,
      temObservacoes,
      temMetas
    });
    
    if (temPeso || temGordura || temMassaMagra) {
      tipo = 'peso';
      console.log('✅ Tipo determinado: peso');
    } else if (temMedidas) {
      tipo = 'medidas';
      console.log('✅ Tipo determinado: medidas');
    } else if (temDesempenho) {
      tipo = 'performance';
      console.log('✅ Tipo determinado: performance');
    } else if (temFeedback || temObservacoes || temMetas) {
      tipo = 'avaliacao_fisica';
      console.log('✅ Tipo determinado: avaliacao_fisica (feedback/observações)');
    } else {
      // Default: avaliacao_fisica se não houver dados específicos
      tipo = 'avaliacao_fisica';
      console.log('✅ Tipo determinado: avaliacao_fisica (default)');
    }
  }
  
  // Garantir que sempre temos um tipo válido (última verificação de segurança)
  if (!tipo || !['peso', 'medidas', 'avaliacao_fisica', 'performance'].includes(tipo)) {
    console.warn('⚠️ Tipo de medição inválido ou ausente, usando default: avaliacao_fisica');
    tipo = 'avaliacao_fisica'; // Fallback seguro
  }
  
  console.log('🎯 Tipo final determinado:', tipo);

  // Consolidar todos os dados no campo JSONB
  // Converter valores numéricos corretamente
  const dados = {
    peso: isNumberValue(peso) ? (typeof peso === 'number' ? peso : parseFloat(peso)) : null,
    percentual_gordura: isNumberValue(percentual_gordura) ? (typeof percentual_gordura === 'number' ? percentual_gordura : parseFloat(percentual_gordura)) : null,
    massa_magra: isNumberValue(massa_magra) ? (typeof massa_magra === 'number' ? massa_magra : parseFloat(massa_magra)) : null,
    medidas_corporais: medidas_corporais || {},
    desempenho_exercicios: desempenho_exercicios || [],
    fotos_progresso: fotos_progresso || [],
    feedback_subjetivo: feedback_subjetivo || {},
    observacoes_personal: observacoes_personal || null,
    metas_proxima_avaliacao: metas_proxima_avaliacao || null,
  };

  // Converter data_registro para Date se for string
  let dataRegistro = data_registro;
  if (data_registro) {
    if (typeof data_registro === 'string') {
      // Se for string no formato YYYY-MM-DD, converter para Date
      dataRegistro = new Date(data_registro);
    }
  } else {
    dataRegistro = new Date();
  }

  // Validação final - garantir que tipo_medicao não seja null
  if (!tipo || tipo === null || tipo === undefined) {
    console.warn('⚠️ tipo_medicao ainda é null após processamento, forçando default');
    tipo = 'avaliacao_fisica';
  }
  
  // Garantir que tipo é uma string válida
  if (typeof tipo !== 'string' || !['peso', 'medidas', 'avaliacao_fisica', 'performance'].includes(tipo)) {
    console.warn('⚠️ tipo_medicao inválido, forçando default');
    tipo = 'avaliacao_fisica';
  }
  
  const resultado = {
    cliente_id: parseInt(cliente_id) || null,
    data_registro: dataRegistro,
    tipo_medicao: tipo, // Sempre tem valor agora
    dados,
    observacoes: observacoes || null,
  };
  
  // Validação final ABSOLUTA - garantir que tipo_medicao não seja null
  if (!resultado.tipo_medicao || resultado.tipo_medicao === null || resultado.tipo_medicao === undefined) {
    console.error('❌ ERRO CRÍTICO: tipo_medicao ainda é null após todas as verificações!');
    resultado.tipo_medicao = 'avaliacao_fisica'; // Fallback final
  }
  
  console.log('✅ Resultado final antes de retornar:', {
    tipo_medicao: resultado.tipo_medicao,
    cliente_id: resultado.cliente_id,
    data_registro: resultado.data_registro
  });

  return resultado;
}

// Listar progressos dos clientes do treinador logado
router.get('/', async (req, res) => {
  try {
    // Buscar IDs dos clientes do treinador
    const clientes = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id']
    });
    const clienteIds = clientes.map(c => c.id);

    if (clienteIds.length === 0) {
      return res.json([]);
    }

    const progressos = await ProgressoCliente.findAll({
      where: {
        cliente_id: clienteIds
      },
      order: [['data_registro', 'DESC']]
    });

    // Transformar para formato do frontend
    const progressosTransformados = progressos.map(transformProgressoForFrontend);
    res.json(progressosTransformados);
  } catch (error) {
    console.error('Erro ao listar progressos:', error);
    res.status(500).json({ error: 'Erro ao listar progressos' });
  }
});

// Buscar progresso por ID (apenas se for de cliente do treinador logado)
router.get('/:id', async (req, res) => {
  try {
    const progresso = await ProgressoCliente.findByPk(req.params.id);
    
    if (!progresso) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(progresso.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }
    
    res.json(transformProgressoForFrontend(progresso));
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
});

// Criar progresso (apenas para clientes do treinador logado)
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

    // Log dos dados recebidos do frontend
    console.log('📥 Dados recebidos do frontend:', JSON.stringify(req.body, null, 2));
    
    // Transformar dados do frontend para o formato do banco
    const dadosBackend = transformProgressoForBackend(req.body);
    
    // Log dos dados transformados
    console.log('🔄 Dados transformados para backend:', JSON.stringify(dadosBackend, null, 2));
    console.log('✅ tipo_medicao:', dadosBackend.tipo_medicao);
    console.log('✅ tipo de tipo_medicao:', typeof dadosBackend.tipo_medicao);
    
    // Garantir que tipo_medicao está presente e é válido
    if (!dadosBackend.tipo_medicao || dadosBackend.tipo_medicao === null || dadosBackend.tipo_medicao === undefined) {
      console.error('❌ tipo_medicao ausente após transformação, usando default');
      dadosBackend.tipo_medicao = 'avaliacao_fisica';
    }
    
    // Garantir que é uma string válida
    if (typeof dadosBackend.tipo_medicao !== 'string' || !['peso', 'medidas', 'avaliacao_fisica', 'performance'].includes(dadosBackend.tipo_medicao)) {
      console.error('❌ tipo_medicao inválido, usando default');
      dadosBackend.tipo_medicao = 'avaliacao_fisica';
    }
    
    // Validação final ABSOLUTA antes de criar
    if (!dadosBackend.tipo_medicao || dadosBackend.tipo_medicao === null || dadosBackend.tipo_medicao === undefined) {
      console.error('❌ ERRO CRÍTICO: tipo_medicao ainda é null após todas as verificações!');
      return res.status(400).json({ error: 'Erro ao determinar tipo de medição. Por favor, preencha pelo menos um campo de dados.' });
    }
    
    console.log('🎯 Criando progresso com tipo_medicao:', dadosBackend.tipo_medicao);
    
    const progresso = await ProgressoCliente.create(dadosBackend);
    res.status(201).json(transformProgressoForFrontend(progresso));
  } catch (error) {
    console.error('Erro ao criar progresso:', error);
    console.error('Dados recebidos:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ error: error.message || 'Erro ao criar progresso' });
  }
});

// Atualizar progresso (apenas se for de cliente do treinador logado)
router.put('/:id', async (req, res) => {
  try {
    const progresso = await ProgressoCliente.findByPk(req.params.id);
    
    if (!progresso) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(progresso.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    // Transformar dados do frontend para o formato do banco
    const dadosBackend = transformProgressoForBackend(req.body);
    
    await progresso.update(dadosBackend);
    res.json(transformProgressoForFrontend(progresso));
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar progresso' });
  }
});

// Deletar progresso (apenas se for de cliente do treinador logado)
router.delete('/:id', async (req, res) => {
  try {
    const progresso = await ProgressoCliente.findByPk(req.params.id);
    
    if (!progresso) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    // Verificar se o cliente pertence ao treinador
    const cliente = await Cliente.findByPk(progresso.cliente_id);
    if (!cliente || cliente.treinador_id !== req.user.id) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }
    
    await progresso.destroy();
    res.json({ success: true, message: 'Progresso deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar progresso:', error);
    res.status(500).json({ error: 'Erro ao deletar progresso' });
  }
});

// Filtrar progressos (apenas de clientes do treinador logado)
router.post('/filter', async (req, res) => {
  try {
    const { cliente_id, tipo_medicao } = req.body;
    
    // Buscar IDs dos clientes do treinador
    const clientes = await Cliente.findAll({
      where: { treinador_id: req.user.id },
      attributes: ['id']
    });
    const clienteIds = clientes.map(c => c.id);

    if (clienteIds.length === 0) {
      return res.json([]);
    }

    const where = {
      cliente_id: clienteIds // Sempre filtrar por clientes do treinador
    };
    
    // Se cliente_id específico foi fornecido, verificar se pertence ao treinador
    if (cliente_id) {
      if (!clienteIds.includes(parseInt(cliente_id))) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao treinador' });
      }
      where.cliente_id = parseInt(cliente_id);
    }
    
    if (tipo_medicao) where.tipo_medicao = tipo_medicao;
    
    const progressos = await ProgressoCliente.findAll({ 
      where, 
      order: [['data_registro', 'DESC']] 
    });

    // Transformar para formato do frontend
    const progressosTransformados = progressos.map(transformProgressoForFrontend);
    res.json(progressosTransformados);
  } catch (error) {
    console.error('Erro ao filtrar progressos:', error);
    res.status(500).json({ error: 'Erro ao filtrar progressos' });
  }
});

export default router;

