import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database.js';
import { initModels } from './models/index.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import treinosRoutes from './routes/treinos.js';
import avaliacoesRoutes from './routes/avaliacoes.js';
import aulasRoutes from './routes/aulas.js';
import transacoesRoutes from './routes/transacoes.js';
import historicoTreinosRoutes from './routes/historicoTreinos.js';
import exerciciosRoutes from './routes/exercicios.js';
import progressosRoutes from './routes/progressos.js';
import mensagensRoutes from './routes/mensagens.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - aceitar múltiplas origens
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas as origens em desenvolvimento
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar modelos
initModels();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/treinos', treinosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/historico-treinos', historicoTreinosRoutes);
app.use('/api/exercicios', exerciciosRoutes);
app.use('/api/progressos', progressosRoutes);
app.use('/api/mensagens', mensagensRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API FitTrainer Pro está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'FitTrainer Pro API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clientes: '/api/clientes',
      treinos: '/api/treinos',
      avaliacoes: '/api/avaliacoes',
      aulas: '/api/aulas',
      transacoes: '/api/transacoes',
      historicoTreinos: '/api/historico-treinos',
      exercicios: '/api/exercicios',
      progressos: '/api/progressos',
      mensagens: '/api/mensagens'
    }
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados. Encerrando...');
      process.exit(1);
    }

    // Sincronizar banco (criar tabelas se não existirem)
    await syncDatabase(false); // false = não recriar tabelas existentes

    // Iniciar servidor (0.0.0.0 para aceitar conexões de todas as interfaces)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

