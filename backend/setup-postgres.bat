@echo off
echo ========================================
echo Setup PostgreSQL - FitTrainer Pro
echo ========================================
echo.

REM Verificar se PostgreSQL está instalado
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL não encontrado no PATH
    echo.
    echo Por favor:
    echo 1. Instale o PostgreSQL: https://www.postgresql.org/download/windows/
    echo 2. Adicione o PostgreSQL ao PATH do sistema
    echo 3. Ou use o pgAdmin para criar o banco manualmente
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado!
echo.

REM Solicitar informações
set /p DB_PASSWORD="Digite a senha do usuario postgres: "
set /p DB_NAME="Nome do banco (padrão: fittrainer): "
if "%DB_NAME%"=="" set DB_NAME=fittrainer

echo.
echo Criando banco de dados '%DB_NAME'...

psql -U postgres -c "CREATE DATABASE %DB_NAME%;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Banco '%DB_NAME' criado com sucesso!
    echo.
    
    REM Criar arquivo .env
    echo Criando arquivo .env...
    (
        echo PORT=3001
        echo NODE_ENV=development
        echo JWT_SECRET=fittrainer_pro_secret_key_2024_change_in_production
        echo.
        echo # PostgreSQL
        echo DB_DIALECT=postgres
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=%DB_NAME%
        echo DB_USER=postgres
        echo DB_PASSWORD=%DB_PASSWORD%
        echo.
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    
    echo ✅ Arquivo .env criado!
    echo.
    echo Próximo passo: Execute 'npm run seed' para criar as tabelas
) else (
    echo.
    echo ❌ Erro ao criar banco de dados.
    echo Verifique se:
    echo - A senha está correta
    echo - O PostgreSQL está rodando
    echo - Você tem permissões
)

echo.
pause



