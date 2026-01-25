#!/bin/bash

echo "=========================================="
echo "🚀 INSTALLATION BACKEND NUTRIWEEK"
echo "=========================================="
echo ""

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

echo "✅ npm détecté: $(npm --version)"
echo ""

# Naviguer vers le dossier du projet
cd /home/user/webapp

echo "📦 Installation des dépendances backend..."
npm install --no-save express cors helmet compression multer dotenv node-json-db
npm install --no-save --save-dev nodemon

echo ""
echo "📁 Création des dossiers nécessaires..."
mkdir -p server/uploads/versions
mkdir -p server/db

echo ""
echo "🔧 Copie de la configuration..."
if [ -f ".env.backend" ]; then
    cp .env.backend .env
    echo "✅ Fichier .env créé"
fi

echo ""
echo "=========================================="
echo "✅ INSTALLATION TERMINÉE"
echo "=========================================="
echo ""
echo "📍 Commandes disponibles:"
echo ""
echo "   Démarrer le backend (dev):"
echo "   $ node server/index.js"
echo ""
echo "   OU avec auto-reload:"
echo "   $ npx nodemon server/index.js"
echo ""
echo "   Tester le backend:"
echo "   $ curl http://localhost:3001/api/health"
echo ""
echo "=========================================="
