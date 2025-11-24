@echo off
echo Iniciando servidor FitTrainer Pro Backend (modo desenvolvimento)...
cd /d %~dp0
node --watch src/server.js
pause



