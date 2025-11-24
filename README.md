# FitTrainer Pro - Sistema de Gestão de Treinos

Sistema completo de gestão para personal trainers, desenvolvido com React + Vite e backend próprio em Node.js + Express + PostgreSQL.

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)

## 🔧 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
  - Verificar: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
  
- **npm** (geralmente vem com Node.js)
  - Verificar: `npm --version`
  
- **PostgreSQL** (versão 12 ou superior)
  - Download: [postgresql.org](https://www.postgresql.org/download/)
  
- **Git** (para clonar o repositório, se necessário)
  - Verificar: `git --version`

## 📦 Instalação

### 1. Clone o repositório (ou navegue até a pasta do projeto):
```bash
cd fit-flow-control
```

### 2. Instale as dependências do frontend:
```bash
npm install
```

### 3. Instale as dependências do backend:
```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuração

### Backend - Banco de Dados PostgreSQL

1. **Crie um banco de dados PostgreSQL**:
   ```sql
   CREATE DATABASE fittrainer_pro;
   ```

2. **Configure as variáveis de ambiente**:
   
   Crie um arquivo `.env` na pasta `backend/`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fittrainer_pro
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   PORT=3001
   JWT_SECRET=seu_jwt_secret_aqui
   CORS_ORIGIN=http://localhost:5173
   ```

3. **O banco será sincronizado automaticamente** quando o servidor iniciar (tabelas serão criadas se não existirem).

### Frontend

O frontend está configurado para se conectar ao backend em `http://localhost:3001/api` por padrão.

Se necessário, você pode criar um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Executando o Projeto

### Método Rápido (Recomendado)

Use os scripts de gerenciamento para iniciar e parar o sistema facilmente:

**Iniciar sistema:**
```bash
iniciar.bat
```

**Parar sistema:**
```bash
parar.bat
```

Os scripts abrem janelas separadas para backend e frontend automaticamente.

### Método Manual

**Backend:**

Em um terminal, execute:
```bash
cd backend
node src/server.js
```

O servidor iniciará na porta 3001 (ou a porta configurada no `.env`).

**Frontend:**

Em outro terminal, execute:
```bash
npm run dev
```

O Vite irá iniciar o servidor e você verá algo como:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra seu navegador em `http://localhost:5173/`

> 💡 **Dica:** Para mais detalhes sobre os scripts, consulte `README_SCRIPTS.md`

### Build para Produção

**Frontend:**
```bash
npm run build
```

**Backend:**
O backend já está pronto para produção. Certifique-se de configurar as variáveis de ambiente adequadamente.

## 📁 Estrutura do Projeto

```
fit-flow-control/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuração do banco de dados
│   │   ├── controllers/    # Controladores (lógica de negócio)
│   │   ├── middleware/     # Middlewares (autenticação, etc.)
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rotas da API
│   │   ├── utils/          # Utilitários
│   │   └── server.js       # Servidor Express
│   ├── .env                # Variáveis de ambiente (criar)
│   └── package.json
│
├── src/                    # Frontend React
│   ├── api/                # Cliente API
│   │   ├── client.js       # Cliente HTTP para backend
│   │   └── entities.js    # Entidades (Cliente, Treino, etc.)
│   ├── components/         # Componentes React
│   │   ├── agenda/        # Componentes de agenda
│   │   ├── avaliacoes/    # Componentes de avaliações
│   │   ├── calendario/    # Componentes de calendário
│   │   ├── clientes/      # Componentes de clientes
│   │   ├── financeiro/    # Componentes financeiros
│   │   ├── progresso/    # Componentes de progresso
│   │   ├── treinos/       # Componentes de treinos
│   │   └── ui/            # Componentes UI (shadcn/ui)
│   ├── contexts/          # Contextos React (AuthContext)
│   ├── pages/             # Páginas principais
│   └── ...
│
├── package.json           # Dependências do frontend
└── README.md              # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **Vite 6** - Build tool e dev server
- **React Router 7** - Roteamento
- **React Query (TanStack Query)** - Gerenciamento de estado servidor e cache
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **React Hook Form + Zod** - Formulários e validação
- **date-fns** - Manipulação de datas
- **recharts** - Gráficos

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **CORS** - Configuração de CORS

## ✨ Funcionalidades

### Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Filtros e busca avançada
- ✅ Status (ativo/inativo)
- ✅ Informações pessoais e objetivos
- ✅ Relacionamento com treinador (isolamento de dados)

### Treinos
- ✅ Criação e edição de treinos personalizados
- ✅ Exercícios com séries, repetições e descanso
- ✅ Grupos de exercícios
- ✅ Visualização e compartilhamento
- ✅ Biblioteca de exercícios
- ✅ Execução de treinos com histórico

### Calendário
- ✅ Agendamento de aulas
- ✅ Aulas presenciais e online
- ✅ Check-in de alunos
- ✅ Status (agendada/realizada/cancelada)
- ✅ Múltiplos alunos por aula

### Financeiro
- ✅ Controle de pagamentos
- ✅ Registro de aulas realizadas
- ✅ Saldos por cliente
- ✅ Relatórios financeiros
- ✅ Transações com descrição e método de pagamento

### Progresso
- ✅ Registro de evolução
- ✅ Gráficos de progresso
- ✅ Comparação de metas
- ✅ Timeline de evolução
- ✅ Múltiplos tipos de medição

### Avaliações
- ✅ Avaliações físicas completas
- ✅ Medidas corporais
- ✅ Dobras cutâneas
- ✅ Composição corporal

### Administração
- ✅ Gestão de usuários
- ✅ Controle de permissões (admin/treinador)
- ✅ Convites de usuários

## 🔐 Autenticação

O sistema utiliza autenticação JWT (JSON Web Tokens):

1. **Login**: Faça login com email e senha
2. **Token**: Um token JWT é gerado e armazenado no localStorage
3. **Requisições**: O token é enviado automaticamente em todas as requisições
4. **Proteção**: Rotas protegidas verificam o token antes de permitir acesso

## 🐛 Troubleshooting

### Erro ao conectar ao banco de dados

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env` do backend
3. Verifique se o banco de dados foi criado

### Porta já em uso

**Backend (porta 3001):**
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
```

**Frontend (porta 5173):**
O Vite tentará usar outra porta automaticamente, ou você pode especificar:
```bash
npm run dev -- --port 3000
```

### Erros de CORS

Certifique-se de que a `CORS_ORIGIN` no `.env` do backend corresponde à URL do frontend.

## 📝 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o linter

### Backend
- `node src/server.js` - Inicia o servidor

### Scripts de Gerenciamento
- `iniciar.bat` - Inicia backend e frontend automaticamente
- `parar.bat` - Para os servidores e salva alterações no Git automaticamente

> 💡 **Dica:** Para mais detalhes sobre os scripts, consulte `README_SCRIPTS.md`

## 📦 Versionamento com Git

O projeto utiliza Git para controle de versão. O script `parar.bat` salva automaticamente todas as alterações ao final do dia.

### Configuração Inicial do Git

```bash
# Configurar usuário (primeira vez apenas)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Conectar com repositório remoto (GitHub, GitLab, etc.)
git remote add origin URL_DO_SEU_REPOSITORIO
```

> 📚 **Documentação completa:** Consulte `README_GIT.md` para guia detalhado de uso do Git

## 📋 Documentação de Requisitos

O projeto inclui documentação completa de requisitos de negócio e regras funcionais:

- **`REQUISITOS_NEGOCIO.md`** - Documentação completa de requisitos, regras de negócio e funcionalidades do sistema

Esta documentação é mantida atualizada junto com o código e deve ser consultada para entender as regras e funcionalidades do sistema.

## 📄 Licença

Este projeto é privado e de uso interno.

---

**Desenvolvido com ❤️ usando React + Vite + Node.js + PostgreSQL**
