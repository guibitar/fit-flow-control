# Scripts de Gerenciamento - FitTrainer Pro

Scripts para facilitar o início e encerramento do sistema.

## 🚀 Iniciar Sistema

Execute o arquivo `iniciar.bat` na raiz do projeto:

```bash
iniciar.bat
```

**O que o script faz:**
1. Verifica se há processos Node já rodando
2. Inicia o Backend na porta 3001 (em janela separada)
3. Aguarda o backend iniciar
4. Inicia o Frontend na porta 5173 (em janela separada)
5. Exibe os endereços dos servidores

**Janelas abertas:**
- `FitTrainer Backend` - Terminal do backend
- `FitTrainer Frontend` - Terminal do frontend

## 🛑 Parar Sistema

Execute o arquivo `parar.bat` na raiz do projeto:

```bash
parar.bat
```

**O que o script faz:**
1. Para todos os processos Node em execução
2. Verifica se os servidores foram parados corretamente
3. Confirma o status de cada servidor

## 📋 Uso Diário

### Início do Dia
1. Abra o terminal na raiz do projeto
2. Execute: `iniciar.bat`
3. Aguarde os servidores iniciarem
4. Acesse: http://localhost:5173

### Fim do Dia
1. Execute: `parar.bat`
2. Confirme que todos os processos foram parados
3. Feche as janelas do terminal se necessário

## ⚠️ Observações

- Os scripts abrem janelas separadas para backend e frontend
- Você pode fechar as janelas manualmente se necessário
- O script `parar.bat` força o encerramento de todos os processos Node
- Se houver processos Node de outros projetos, eles também serão parados

## 🔧 Troubleshooting

### Erro: "Porta já em uso"
- Execute `parar.bat` primeiro
- Aguarde alguns segundos
- Execute `iniciar.bat` novamente

### Processos não param
- Feche manualmente as janelas do terminal
- Execute `parar.bat` novamente
- Verifique no Gerenciador de Tarefas se há processos Node

### Backend não inicia
- Verifique se o PostgreSQL está rodando (se usar PostgreSQL)
- Verifique o arquivo `.env` no backend
- Veja os logs na janela "FitTrainer Backend"

