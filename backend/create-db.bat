@echo off
echo Criando banco de dados fittrainer no PostgreSQL...
echo.
echo Por favor, digite a senha do usuario postgres quando solicitado.
echo.

psql -U postgres -c "CREATE DATABASE fittrainer;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Banco de dados 'fittrainer' criado com sucesso!
    echo.
    echo Próximo passo: Configure o arquivo .env e execute 'npm run seed'
) else (
    echo.
    echo ❌ Erro ao criar banco de dados.
    echo.
    echo Possíveis causas:
    echo - PostgreSQL não está instalado
    echo - psql não está no PATH
    echo - Senha incorreta
    echo.
    echo Tente criar manualmente via pgAdmin ou SQL Shell (psql)
)

pause



