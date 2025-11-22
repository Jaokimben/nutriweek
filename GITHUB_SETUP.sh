#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║           🚀 SCRIPT DE CONFIGURATION GITHUB + VERCEL                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Demander le nom d'utilisateur GitHub
read -p "Entrez votre nom d'utilisateur GitHub: " github_username

echo ""
echo "📋 Instructions:"
echo "1. Allez sur https://github.com/new"
echo "2. Créez un repository nommé 'nutrition-app'"
echo "3. Appuyez sur Entrée pour continuer..."
read

echo ""
echo "🔧 Configuration de Git..."

# Configurer le remote
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$github_username/nutrition-app.git

echo "✅ Remote configuré: https://github.com/$github_username/nutrition-app.git"
echo ""

# Push vers GitHub
echo "📤 Push du code vers GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         ✅ CODE POUSSÉ SUR GITHUB !                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo ""
echo "1. Allez sur: https://vercel.com/signup"
echo "2. Connectez-vous avec GitHub"
echo "3. Cliquez 'New Project'"
echo "4. Sélectionnez 'nutrition-app'"
echo "5. Cliquez 'Deploy'"
echo ""
echo "⏱️  Temps estimé: 2 minutes"
echo ""
echo "🌐 Votre app sera accessible sur: https://nutrition-app-xxxxx.vercel.app"
echo ""
