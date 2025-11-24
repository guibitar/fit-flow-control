@echo off
echo ========================================
echo   CONECTAR COM GITHUB - FitTrainer Pro
echo ========================================
echo.

REM Verificar se URL foi fornecida
if "%1"=="" (
    echo [ERRO] URL do repositorio nao fornecida!
    echo.
    echo USO:
    echo   conectar-github.bat URL_DO_REPOSITORIO
    echo.
    echo EXEMPLO:
    echo   conectar-github.bat https://github.com/guibitar/fit-flow-control.git
    echo.
    echo OU informe a URL agora:
    set /p REPO_URL="URL do repositorio GitHub: "
    if "!REPO_URL!"=="" (
        echo Cancelado.
        pause
        exit /b 1
    )
) else (
    set "REPO_URL=%1"
)

echo.
echo Conectando com GitHub...
echo Repositorio: %REPO_URL%
echo.

REM Verificar se já existe remote
git remote -v >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Ja existe um remote configurado.
    echo Deseja substituir? (S/N)
    set /p resposta=
    if /i not "!resposta!"=="S" (
        echo Cancelado.
        pause
        exit /b 0
    )
    git remote remove origin >NUL 2>&1
)

REM Adicionar remote
echo Adicionando remote...
git remote add origin %REPO_URL%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao adicionar remote.
    pause
    exit /b 1
)

echo [OK] Remote adicionado com sucesso!
echo.

REM Renomear branch para main (se necessário)
git branch --show-current >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
    if not "!CURRENT_BRANCH!"=="main" (
        echo Renomeando branch para 'main'...
        git branch -M main
    )
)

echo.
echo Enviando codigo para o GitHub...
echo.

REM Fazer push
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCESSO! Codigo enviado para GitHub!
    echo ========================================
    echo.
    echo Repositorio: %REPO_URL%
    echo.
) else (
    echo.
    echo [ERRO] Falha ao enviar codigo.
    echo.
    echo Possiveis causas:
    echo - Repositorio nao existe ou URL incorreta
    echo - Problemas de autenticacao
    echo - Repositorio nao esta vazio
    echo.
    echo Para autenticar no GitHub:
    echo - Use GitHub CLI: gh auth login
    echo - Ou configure credenciais: git config --global credential.helper
    echo.
)

pause

