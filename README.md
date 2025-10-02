# Calendrier de Productivité

Une application de gestion du temps et de planification des tâches construite avec Next.js, TypeScript et Prisma.

## Fonctionnalités

- 📅 **Vue calendrier mensuelle** - Visualisez tous vos jours du mois actuel
- ⏰ **Planification avancée** - Planifiez des tâches pour n'importe quelle période
- 🔄 **Tâches récurrentes** - Configurez des tâches qui se répètent automatiquement
- 📋 **Vue détaillée du jour** - Cliquez sur une date pour voir les tâches organisées par heures
- ✏️ **Gestion complète** - Créez, modifiez et supprimez vos tâches facilement

## Technologies

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: API Routes Next.js
- **Base de données**: PlanetScale (MySQL) avec Prisma ORM
- **Déploiement**: Vercel (gratuit)

## Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd calendar
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   - Créez un compte gratuit sur [PlanetScale](https://planetscale.com)
   - Créez une nouvelle base de données
   - Copiez l'URL de connexion
   - Mettez à jour le fichier `.env` avec votre `DATABASE_URL`

4. **Configurer Prisma**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

L'application sera disponible sur [http://localhost:8000](http://localhost:8000)

## Déploiement sur Vercel

1. **Connecter à Vercel**
   ```bash
   npx vercel
   ```

2. **Configurer les variables d'environnement**
   - Ajoutez `DATABASE_URL` dans les paramètres Vercel
   - Utilisez votre URL PlanetScale

3. **Déployer**
   ```bash
   npx vercel --prod
   ```

## Structure du projet

```
src/
├── app/
│   ├── api/           # Routes API
│   ├── globals.css    # Styles globaux
│   ├── layout.tsx     # Layout principal
│   └── page.tsx       # Page d'accueil
├── components/        # Composants React
├── lib/              # Utilitaires et configuration
└── types/            # Types TypeScript
```

## Base de données

### Modèles

- **Task**: Tâches individuelles avec date et heure
- **RecurringTask**: Tâches récurrentes avec fréquence configurable

### Relations

- Une tâche récurrente peut avoir plusieurs tâches associées
- Les tâches peuvent être liées à une tâche récurrente

## API Endpoints

- `GET /api/tasks` - Récupérer les tâches pour une période
- `POST /api/tasks` - Créer une nouvelle tâche
- `PUT /api/tasks/[id]` - Modifier une tâche
- `DELETE /api/tasks/[id]` - Supprimer une tâche
- `GET /api/recurring-tasks` - Récupérer les tâches récurrentes
- `POST /api/recurring-tasks` - Créer une tâche récurrente

## Coûts

- **PlanetScale**: Gratuit jusqu'à 1 milliard de lectures/mois
- **Vercel**: Gratuit pour les projets personnels
- **Total**: 0€/mois pour un usage personnel normal

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.