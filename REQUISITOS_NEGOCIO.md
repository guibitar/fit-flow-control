# 📋 Requisitos de Negócio - FitTrainer Pro

## 🎯 Visão Geral do Sistema

O **FitTrainer Pro** é um sistema de gestão completo para personal trainers, desenvolvido para facilitar o gerenciamento de clientes, treinos, avaliações físicas, agendamentos e controle financeiro.

---

## 👥 Perfis de Usuário

### 1. Administrador
- **Responsabilidades:**
  - Gerenciar usuários do sistema
  - Criar e editar perfis de treinadores
  - Visualizar relatórios gerais
  - Configurar permissões e acessos

### 2. Personal Trainer
- **Responsabilidades:**
  - Gerenciar seus próprios clientes
  - Criar e enviar treinos personalizados
  - Realizar avaliações físicas
  - Agendar aulas e controlar presenças
  - Gerenciar finanças (recebimentos e pagamentos)
  - Acompanhar progresso dos clientes

---

## 📦 Módulos e Funcionalidades

### 1. **Dashboard** 📊
**Objetivo:** Visão geral do negócio do treinador

**Funcionalidades:**
- Estatísticas de clientes ativos
- Resumo financeiro (a receber, recebido, pendente)
- Próximas aulas agendadas
- Últimas avaliações realizadas
- Ações rápidas (check-in de aulas, criar treino, etc.)

**Regras de Negócio:**
- Apenas dados do treinador logado são exibidos
- Valores financeiros são calculados em tempo real
- Aulas do dia atual são destacadas

---

### 2. **Clientes** 👥
**Objetivo:** Gerenciamento completo da base de clientes

**Funcionalidades:**
- Cadastro de novos clientes
- Edição de dados pessoais e objetivos
- Visualização de histórico completo
- Ativação/desativação de clientes
- Definição de valor de aula por cliente

**Regras de Negócio:**
- Cada cliente pertence a um único treinador
- Clientes inativos não aparecem em listagens principais
- Valor de aula é usado para cálculos financeiros
- Campos obrigatórios: Nome, Email (validação de formato)

---

### 3. **Avaliações Físicas** 📏
**Objetivo:** Registrar e acompanhar evolução física dos clientes

**Funcionalidades:**
- Criação de avaliações com múltiplas métricas:
  - Peso, altura, idade, sexo
  - Percentual de gordura
  - Medidas corporais (circunferências)
  - Dobras cutâneas (7 pontos)
  - Composição corporal calculada automaticamente
- Histórico de avaliações por cliente
- Comparação entre avaliações
- Exportação de dados

**Regras de Negócio:**
- Cada avaliação está vinculada a um cliente específico
- Data da avaliação é obrigatória
- Cálculos de composição corporal são automáticos
- Histórico ordenado por data (mais recente primeiro)

---

### 4. **Treinos** 💪
**Objetivo:** Criar e gerenciar programas de treinamento

**Funcionalidades:**
- Criação de treinos personalizados
- Biblioteca de exercícios
- Estruturação de treinos por grupos musculares
- Envio de treinos para clientes
- Histórico de treinos enviados
- Edição e atualização de treinos

**Regras de Negócio:**
- Cada treino pertence a um cliente
- Treinos podem ser reutilizados (cópia)
- Histórico mantém versões anteriores
- Treinos podem ter status: rascunho, enviado, concluído

---

### 5. **Calendário** 📅
**Objetivo:** Agendamento e controle de aulas

**Funcionalidades:**
- Visualização de aulas em calendário mensal/semanal
- Agendamento de novas aulas
- Edição de aulas existentes
- Check-in de presença
- Cancelamento de aulas
- Filtros por cliente, tipo de aula, status
- Detalhes da aula (local, horário, alunos, observações)

**Regras de Negócio:**
- Aulas podem ser presenciais ou online (com link)
- Check-in gera transação financeira automaticamente
- Aulas canceladas não geram cobrança
- Cada aula pode ter múltiplos alunos (mesmo treinador)
- Status: agendada, realizada, cancelada

---

### 6. **Financeiro** 💰
**Objetivo:** Controle completo de receitas e despesas

**Funcionalidades:**
- **Transações:**
  - Registro de aulas realizadas (débito)
  - Registro de pagamentos recebidos (crédito)
  - Métodos de pagamento: PIX, Dinheiro, Cartão (Crédito/Débito), Transferência
  - Histórico completo de transações
- **Relatórios:**
  - Total a receber
  - Total recebido
  - Saldo pendente
  - Relatório por período
  - Agrupamento por método de pagamento
  - Detalhamento por cliente
- **Clientes com Débito:**
  - Lista de clientes em atraso
  - Valor devido por cliente
  - Histórico de transações por cliente

**Regras de Negócio:**
- Aulas realizadas geram débito automático (valor da aula do cliente)
- Pagamentos são registrados como crédito (valor negativo)
- Saldo = Total de aulas - Total de pagamentos
- Transações são vinculadas a cliente e aula (quando aplicável)
- Método de pagamento é obrigatório para pagamentos
- Valores são sempre em R$ (Real Brasileiro)
- Histórico ordenado por data (mais recente primeiro)

---

### 7. **Progresso** 📈
**Objetivo:** Acompanhar evolução dos clientes

**Funcionalidades:**
- Visualização de progresso por cliente
- Gráficos de evolução (peso, medidas, etc.)
- Comparação entre avaliações
- Registro de medições intermediárias
- Histórico de treinos realizados

**Regras de Negócio:**
- Dados são exibidos apenas para clientes do treinador logado
- Progresso é calculado com base em avaliações
- Gráficos mostram tendências ao longo do tempo

---

### 8. **Administração** ⚙️
**Objetivo:** Gerenciamento de usuários e configurações (apenas para administradores)

**Funcionalidades:**
- Listagem de todos os usuários
- Criação de novos usuários (treinadores)
- Edição de perfis
- Ativação/desativação de usuários
- Visualização de último acesso

**Regras de Negócio:**
- Apenas administradores têm acesso
- Usuários podem ser do tipo: personal_trainer ou administrador
- Senhas são criptografadas (bcrypt)
- Email deve ser único no sistema
- Último acesso é atualizado automaticamente

---

## 🔐 Segurança e Autenticação

**Regras de Negócio:**
- Sistema requer autenticação para todas as rotas (exceto login)
- Tokens JWT são usados para autenticação
- Sessões expiram após período de inatividade
- Senhas devem ter no mínimo 6 caracteres
- Cada treinador só acessa seus próprios dados
- Administradores têm acesso a todos os dados

---

## 📊 Regras de Negócio Gerais

### Isolamento de Dados
- Cada treinador vê apenas seus próprios clientes, treinos, aulas e transações
- Administradores veem todos os dados do sistema
- Dados são filtrados automaticamente por `treinador_id`

### Integridade de Dados
- Clientes não podem ser deletados, apenas desativados
- Transações financeiras são imutáveis (não podem ser editadas após criação)
- Avaliações podem ser editadas apenas pelo treinador responsável

### Cálculos Financeiros
- Valor de aula é definido por cliente
- Aulas realizadas geram débito no valor da aula do cliente
- Pagamentos reduzem o saldo pendente
- Saldo pendente = Total de aulas - Total de pagamentos

### Datas e Horários
- Todas as datas são armazenadas em UTC
- Exibição de datas no formato brasileiro (DD/MM/YYYY)
- Horários são exibidos no formato 24h

---

## 🚀 Fluxos de Trabalho Principais

### 1. Fluxo de Nova Aula
1. Treinador agenda aula no calendário
2. Define cliente, data, horário, local
3. Aula aparece no calendário
4. No dia da aula, treinador faz check-in
5. Sistema gera transação financeira (débito)
6. Cliente aparece com saldo pendente

### 2. Fluxo de Pagamento
1. Cliente realiza pagamento
2. Treinador registra pagamento no financeiro
3. Informa valor, data e método de pagamento
4. Sistema registra como crédito
5. Saldo pendente do cliente é reduzido
6. Relatórios são atualizados automaticamente

### 3. Fluxo de Avaliação
1. Treinador cria nova avaliação para cliente
2. Preenche dados físicos (peso, altura, medidas, etc.)
3. Sistema calcula composição corporal automaticamente
4. Avaliação é salva e aparece no histórico
5. Progresso do cliente é atualizado

---

## 📝 Notas Técnicas

### Tecnologias Utilizadas
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL
- **ORM:** Sequelize
- **Autenticação:** JWT (JSON Web Tokens)

### Estrutura de Dados
- Cada entidade principal tem timestamps (`created_at`, `updated_at`)
- Soft deletes são usados quando apropriado
- Relacionamentos são mantidos via foreign keys

---

## 🔄 Atualizações e Manutenção

**Última Atualização:** 24/11/2025

**Versão Atual:** 1.0.0

**Próximas Funcionalidades Planejadas:**
- [ ] Notificações push
- [ ] App mobile
- [ ] Integração com pagamentos online
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Chat entre treinador e cliente

---

## 📞 Suporte

Para dúvidas sobre requisitos de negócio ou sugestões de melhorias, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

