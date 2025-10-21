@echo off
title DataSalon - Iniciando...
echo.
echo ========================================
echo    DataSalon - Sistema de Gestion
echo ========================================
echo.
echo Iniciando aplicacion...
echo.

REM Verificar si existe node_modules
if not exist "node_modules" (
    echo Instalando dependencias por primera vez...
    npm install
    echo.
)

REM Iniciar la aplicacion
echo Iniciando servidor de desarrollo...
echo.
echo La aplicacion estara disponible en:
echo http://localhost:5173
echo.
echo Presiona Ctrl+C para detener
echo.
npm run dev
