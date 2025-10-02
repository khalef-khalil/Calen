#!/bin/bash

# Script pour arrêter le serveur de développement
echo "🛑 Arrêt du serveur de développement..."

# Tuer les processus sur le port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Tuer les processus Next.js
pkill -f "next dev" 2>/dev/null || true

echo "✅ Serveur arrêté avec succès"
