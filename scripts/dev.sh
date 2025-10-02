#!/bin/bash

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt du serveur..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

# Capturer Ctrl+C et autres signaux
trap cleanup SIGINT SIGTERM

# Nettoyer les processus existants
echo "🧹 Nettoyage des processus existants..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Attendre un moment
sleep 1

# Détecter l'adresse IP locale automatiquement
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Lancer le serveur de développement sur le port 8000
echo "🚀 Lancement du serveur de développement..."
echo "📱 Application accessible sur: http://$LOCAL_IP:8000"
echo "💻 Application accessible sur: http://localhost:8000"
echo "🛑 Appuyez sur Ctrl+C pour arrêter le serveur"

npm run dev
