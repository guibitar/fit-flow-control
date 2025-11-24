# FitTrainer Pro - Backend API

Backend completo para o sistema FitTrainer Pro, construído com Node.js + Express + Sequelize + PostgreSQL.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fittrainer_pro
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Criar Banco de Dados PostgreSQL

```sql
CREATE DATABASE fittrainer_pro;
```

### 4. Iniciar Servidor

```bash
node src/server.js
```

O servidor irá:
- Conectar ao banco de dados
- Sincronizar as tabelas automaticamente (criar se não existirem)
- Iniciar na porta 3001

O servidor estará disponível em `http://localhost:3001`

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── database.js        # Configuração do banco
│   ├── models/                # Modelos Sequelize
│   │   ├── Usuario.js
│   │   ├── Cliente.js
│   │   ├── Treino.js
│   │   ├── Aula.js
│   │   ├── Avaliacao.js
│   │   ├── TransacaoFinanceira.js
│   │   ├── ProgressoCliente.js
│   │   └── index.js
│   ├── controllers/           # Lógica de negócio
│   │   └── authController.js
│   ├── routes/                # Rotas da API
│   │   ├── auth.js
│   │   ├── clientes.js
│   │   ├── treinos.js
│   │   ├── aulas.js
│   │   ├── avaliacoes.js
│   │   ├── transacoes.js
│   │   ├── progressos.js
│   │   └── ...
│   ├── middleware/            # Middlewares
│   │   └── auth.js
│   ├── utils/                 # Utilitários
│   │   └── auth.js
│   └── server.js              # Servidor Express
├── .env                       # Variáveis de ambiente (criar)
└── package.json
```

## 🔌 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Fazer login
- `GET /api/auth/verify` - Verificar sessão (requer token)
- `POST /api/auth/logout` - Fazer logout (requer token)
- `GET /api/auth/users` - Listar usuários (requer admin)
- `POST /api/auth/users` - Criar usuário (requer admin)
- `PUT /api/auth/users/:id` - Atualizar usuário (requer admin)
- `PUT /api/auth/me` - Atualizar próprio perfil (requer token)

### Clientes

- `GET /api/clientes` - Listar clientes do treinador (requer token)
- `GET /api/clientes/:id` - Buscar cliente (requer token)
- `POST /api/clientes` - Criar cliente (requer token)
- `PUT /api/clientes/:id` - Atualizar cliente (requer token)
- `DELETE /api/clientes/:id` - Deletar cliente (requer token)

### Treinos

- `GET /api/treinos` - Listar treinos do treinador (requer token)
- `GET /api/treinos/:id` - Buscar treino (requer token)
- `POST /api/treinos` - Criar treino (requer token)
- `PUT /api/treinos/:id` - Atualizar treino (requer token)
- `DELETE /api/treinos/:id` - Deletar treino (requer token)

### Aulas

- `GET /api/aulas` - Listar aulas (requer token)
- `GET /api/aulas/:id` - Buscar aula (requer token)
- `POST /api/aulas` - Criar aula (requer token)
- `PUT /api/aulas/:id` - Atualizar aula (requer token)
- `DELETE /api/aulas/:id` - Deletar aula (requer token)

### Financeiro

- `GET /api/transacoes` - Listar transações (requer token)
- `GET /api/transacoes/:id` - Buscar transação (requer token)
- `POST /api/transacoes` - Criar transação (requer token)
- `PUT /api/transacoes/:id` - Atualizar transação (requer token)
- `DELETE /api/transacoes/:id` - Deletar transação (requer token)
- `POST /api/transacoes/filter` - Filtrar transações (requer token)

### Progresso

- `GET /api/progressos` - Listar progressos (requer token)
- `GET /api/progressos/:id` - Buscar progresso (requer token)
- `POST /api/progressos` - Criar progresso (requer token)
- `PUT /api/progressos/:id` - Atualizar progresso (requer token)
- `DELETE /api/progressos/:id` - Deletar progresso (requer token)

### Avaliações

- `GET /api/avaliacoes` - Listar avaliações (requer token)
- `GET /api/avaliacoes/:id` - Buscar avaliação (requer token)
- `POST /api/avaliacoes` - Criar avaliação (requer token)
- `PUT /api/avaliacoes/:id` - Atualizar avaliação (requer token)
- `DELETE /api/avaliacoes/:id` - Deletar avaliação (requer token)

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer <token>
```

O token é retornado no login e expira em 7 dias.

## 🗄️ Banco de Dados

### PostgreSQL

O sistema utiliza PostgreSQL como banco de dados principal. As tabelas são criadas automaticamente quando o servidor inicia.

**Modelos principais:**
- `usuarios` - Usuários do sistema (treinadores, admins)
- `clientes` - Clientes dos treinadores
- `treinos` - Treinos personalizados
- `aulas` - Agendamentos de aulas
- `avaliacoes` - Avaliações físicas
- `transacoes_financeiras` - Transações financeiras
- `progresso_clientes` - Registros de progresso
- `historico_treinos` - Histórico de execução de treinos
- `exercicios_biblioteca` - Biblioteca de exercícios

### Isolamento de Dados

Todos os dados são isolados por `treinador_id`, garantindo que cada treinador só acesse seus próprios dados.

## 📝 Scripts Disponíveis

- `node src/server.js` - Inicia o servidor

## 🔧 Troubleshooting

### Erro de conexão com banco

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env`
3. Verifique se o banco de dados foi criado

### Porta já em uso

```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
```

### Erros de CORS

Certifique-se de que `CORS_ORIGIN` no `.env` corresponde à URL do frontend.
