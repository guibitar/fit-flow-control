# 📦 Guia de Uso do Git - FitTrainer Pro

Este documento descreve como usar o Git para versionamento do código do FitTrainer Pro.

## 🚀 Configuração Inicial

### 1. Configurar Git (primeira vez apenas)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 2. Conectar com Repositório Remoto (GitHub, GitLab, etc.)

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/seu-usuario/fit-flow-control.git

# Ou se já existe, verificar:
git remote -v
```

### 3. Primeiro Commit

```bash
# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Commit inicial - FitTrainer Pro"

# Enviar para o repositório remoto
git push -u origin main
```

---

## 📝 Fluxo de Trabalho Diário

### Início do Dia
1. Execute `iniciar.bat` para iniciar os servidores
2. Faça suas alterações no código

### Final do Dia
1. Execute `parar.bat` - o script irá:
   - Parar os servidores
   - **Automaticamente salvar todas as alterações no Git**
   - Criar um commit com timestamp
   - Tentar enviar para o repositório remoto (se configurado)

---

## 🔧 Comandos Git Úteis

### Ver Status das Alterações
```bash
git status
```

### Ver Histórico de Commits
```bash
git log --oneline
```

### Adicionar Arquivos Manualmente
```bash
# Adicionar arquivo específico
git add caminho/do/arquivo.js

# Adicionar todos os arquivos modificados
git add -A
```

### Criar Commit Manual
```bash
git commit -m "Descrição das alterações"
```

### Enviar para Repositório Remoto
```bash
git push
```

### Atualizar do Repositório Remoto
```bash
git pull
```

### Ver Diferenças
```bash
# Ver diferenças não commitadas
git diff

# Ver diferenças de um arquivo específico
git diff caminho/do/arquivo.js
```

---

## 📋 Estrutura de Commits

O script `parar.bat` cria commits automáticos com o formato:
```
Salvamento automatico - YYYY-MM-DD HH:MM
```

Para commits manuais, use mensagens descritivas:
```
feat: Adiciona funcionalidade de relatórios financeiros
fix: Corrige erro no cálculo de saldo pendente
docs: Atualiza documentação de requisitos de negócio
refactor: Melhora estrutura do componente de calendário
```

---

## 🚨 Resolução de Problemas

### Erro: "Git não configurado"
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### Erro: "Não foi possível enviar para o repositório remoto"
1. Verifique se o remote está configurado:
   ```bash
   git remote -v
   ```
2. Se não estiver, adicione:
   ```bash
   git remote add origin URL_DO_REPOSITORIO
   ```
3. Se já estiver, verifique suas credenciais

### Erro: "Conflitos de merge"
Se houver conflitos ao fazer `git pull`:
1. Resolva os conflitos manualmente nos arquivos
2. Adicione os arquivos resolvidos:
   ```bash
   git add .
   ```
3. Complete o merge:
   ```bash
   git commit -m "Resolve conflitos de merge"
   ```

---

## 📚 Documentação Relacionada

- **Requisitos de Negócio:** `REQUISITOS_NEGOCIO.md`
- **Scripts de Início/Parada:** `README_SCRIPTS.md`
- **README Principal:** `README.md`

---

## 💡 Dicas

1. **Sempre execute `parar.bat` ao final do dia** - isso garante que suas alterações sejam salvas
2. **Faça commits frequentes** - não espere muito tempo entre commits
3. **Use mensagens descritivas** - facilita entender o histórico depois
4. **Mantenha o repositório atualizado** - faça `git pull` antes de começar a trabalhar se estiver em equipe

---

## 🔐 Segurança

⚠️ **IMPORTANTE:** Nunca commite arquivos sensíveis:
- `.env` (variáveis de ambiente)
- Credenciais de banco de dados
- Chaves de API
- Senhas

Esses arquivos estão no `.gitignore` e não serão commitados automaticamente.

