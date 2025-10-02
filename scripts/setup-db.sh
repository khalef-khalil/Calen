#!/bin/bash

# Script de configuration de la base de données
echo "🔧 Configuration de la base de données..."

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
npm run db:generate

# Pousser le schéma vers la base de données
echo "🚀 Synchronisation du schéma avec la base de données..."
npm run db:push

echo "✅ Configuration terminée !"
echo "💡 N'oubliez pas de configurer votre DATABASE_URL dans le fichier .env"
