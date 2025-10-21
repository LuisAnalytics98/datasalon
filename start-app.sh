#!/bin/bash

echo "========================================"
echo "   DataSalon - Sistema de Gestion"
echo "========================================"
echo ""
echo "Iniciando la aplicacion..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está disponible"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""
echo "npm version:"
npm --version
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Fallo al instalar dependencias"
        exit 1
    fi
    echo ""
    echo "Dependencias instaladas correctamente!"
    echo ""
fi

# Iniciar la aplicación
echo "Iniciando el servidor de desarrollo..."
echo ""
echo "La aplicación estará disponible en: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""
npm run dev
