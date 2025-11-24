@echo off
echo ========================================
echo   FIT TRAINER PRO - PARANDO SISTEMA
echo ========================================
echo.

REM Verificar se existem processos Node rodando
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Parando processos Node...
    taskkill /F /IM node.exe >NUL 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Todos os processos Node foram parados.
    ) else (
        echo [AVISO] Nenhum processo Node encontrado ou erro ao parar.
    )
) else (
    echo [INFO] Nenhum processo Node encontrado rodando.
)

echo.
echo Verificando se os servidores foram parados...
timeout /t 2 >NUL

REM Verificar backend
powershell -Command "$backend = try { Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -Method GET -TimeoutSec 2 -UseBasicParsing | Out-Null; 'RODANDO' } catch { 'PARADO' }; if ($backend -eq 'RODANDO') { Write-Host '[AVISO] Backend ainda pode estar rodando!' -ForegroundColor Yellow } else { Write-Host '[OK] Backend parado.' -ForegroundColor Green }"

REM Verificar frontend
powershell -Command "$frontend = try { Invoke-WebRequest -Uri 'http://localhost:5173' -Method GET -TimeoutSec 2 -UseBasicParsing | Out-Null; 'RODANDO' } catch { 'PARADO' }; if ($frontend -eq 'RODANDO') { Write-Host '[AVISO] Frontend ainda pode estar rodando!' -ForegroundColor Yellow } else { Write-Host '[OK] Frontend parado.' -ForegroundColor Green }"

echo.
echo Verificando se os servidores foram parados...
timeout /t 2 >NUL

REM Verificar backend
powershell -Command "$backend = try { Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -Method GET -TimeoutSec 2 -UseBasicParsing | Out-Null; 'RODANDO' } catch { 'PARADO' }; if ($backend -eq 'RODANDO') { Write-Host '[AVISO] Backend ainda pode estar rodando!' -ForegroundColor Yellow } else { Write-Host '[OK] Backend parado.' -ForegroundColor Green }"

REM Verificar frontend
powershell -Command "$frontend = try { Invoke-WebRequest -Uri 'http://localhost:5173' -Method GET -TimeoutSec 2 -UseBasicParsing | Out-Null; 'RODANDO' } catch { try { Invoke-WebRequest -Uri 'http://localhost:5174' -Method GET -TimeoutSec 2 -UseBasicParsing | Out-Null; 'RODANDO' } catch { 'PARADO' } }; if ($frontend -eq 'RODANDO') { Write-Host '[AVISO] Frontend ainda pode estar rodando!' -ForegroundColor Yellow } else { Write-Host '[OK] Frontend parado.' -ForegroundColor Green }"

echo.
echo ========================================
echo   SISTEMA PARADO COM SUCESSO!
echo ========================================
echo.

REM Verificar se Git está configurado
git config user.name >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Git nao configurado. Configure com:
    echo   git config --global user.name "Seu Nome"
    echo   git config --global user.email "seu.email@exemplo.com"
    echo.
    goto :SKIP_GIT
)

REM Verificar se há mudanças para commitar
git diff --quiet
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   SALVANDO ALTERACOES NO GIT
    echo ========================================
    echo.
    
    REM Adicionar todos os arquivos modificados
    echo Adicionando arquivos ao Git...
    git add -A
    
    REM Criar commit com data e hora
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set "timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%"
    
    echo Criando commit...
    git commit -m "Salvamento automatico - %timestamp%" >NUL 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Alteracoes salvas localmente.
        
        REM Tentar fazer push (se houver remote configurado)
        git remote -v >NUL 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Enviando para o repositorio remoto...
            git push >NUL 2>&1
            if %ERRORLEVEL% EQU 0 (
                echo [OK] Alteracoes enviadas para o repositorio remoto.
            ) else (
                echo [AVISO] Nao foi possivel enviar para o repositorio remoto.
                echo          Verifique se o remote esta configurado: git remote -v
            )
        ) else (
            echo [INFO] Nenhum repositorio remoto configurado.
            echo        Para configurar: git remote add origin URL_DO_REPOSITORIO
        )
    ) else (
        echo [AVISO] Nao foi possivel criar commit. Verifique o status: git status
    )
) else (
    echo [INFO] Nenhuma alteracao para salvar.
)

:SKIP_GIT
echo.
echo ========================================
echo   FINALIZACAO CONCLUIDA!
echo ========================================
echo.
echo Para iniciar novamente, execute: iniciar.bat
echo.
pause

