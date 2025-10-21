@echo off
echo ========================================
echo    DataSalon - Sistema de Gestion
echo ========================================
echo.
echo Iniciando la aplicacion...
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm esta disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.
echo npm version:
npm --version
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias
        pause
        exit /b 1
    )
    echo.
    echo Dependencias instaladas correctamente!
    echo.
)

REM Iniciar la aplicacion
echo Iniciando el servidor de desarrollo...
echo.
echo La aplicacion estara disponible en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev

pause
