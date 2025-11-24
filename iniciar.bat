@echo off
echo ========================================
echo   FIT TRAINER PRO - INICIANDO SISTEMA
echo ========================================
echo.

REM Verificar se já existem processos Node rodando
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [AVISO] Processos Node ja estao rodando!
    echo Deseja parar os processos existentes e reiniciar? (S/N)
    set /p resposta=
    if /i "%resposta%"=="S" (
        echo.
        echo Parando processos Node existentes...
        taskkill /F /IM node.exe >NUL 2>&1
        timeout /t 2 >NUL
    ) else (
        echo Cancelado. Use parar.bat para parar os processos.
        pause
        exit /b
    )
)

echo.
echo [1/2] Iniciando Backend (porta 3001)...
start "FitTrainer Backend" cmd /k "cd backend && node src/server.js"

REM Aguardar backend iniciar
echo Aguardando backend iniciar...
timeout /t 5 >NUL

REM Verificar se backend está respondendo
echo Verificando backend...
powershell -Command "$response = try { Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -Method GET -TimeoutSec 3 -UseBasicParsing | Out-Null; 'OK' } catch { 'ERRO' }; if ($response -eq 'OK') { Write-Host '[OK] Backend respondendo!' -ForegroundColor Green } else { Write-Host '[AVISO] Backend ainda iniciando...' -ForegroundColor Yellow }"

echo.
echo [2/2] Iniciando Frontend (porta 5173)...
start "FitTrainer Frontend" cmd /k "npm run dev"

echo.
echo Aguardando frontend iniciar...
timeout /t 5 >NUL

REM Verificar se frontend está respondendo
powershell -Command "$frontend = try { Invoke-WebRequest -Uri 'http://localhost:5173' -Method GET -TimeoutSec 3 -UseBasicParsing | Out-Null; 'OK' } catch { try { Invoke-WebRequest -Uri 'http://localhost:5174' -Method GET -TimeoutSec 3 -UseBasicParsing | Out-Null; 'OK_5174' } catch { 'ERRO' } }; if ($frontend -eq 'OK') { Write-Host '[OK] Frontend respondendo na porta 5173!' -ForegroundColor Green } elseif ($frontend -eq 'OK_5174') { Write-Host '[OK] Frontend respondendo na porta 5174!' -ForegroundColor Green } else { Write-Host '[AVISO] Frontend ainda iniciando...' -ForegroundColor Yellow }"

echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173 (ou 5174)
echo.
echo IMPORTANTE: Mantenha as janelas abertas!
echo Para parar o sistema, execute: parar.bat
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >NUL

