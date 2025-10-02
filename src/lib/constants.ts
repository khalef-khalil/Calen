// Catégories de vie
export const LIFE_ASPECTS = {
  STUDIES: 'studies',
  FITNESS: 'fitness', 
  WORK: 'work',
  HOUSEWORK: 'housework',
  RECOVERY: 'recovery'
} as const

export type LifeAspect = typeof LIFE_ASPECTS[keyof typeof LIFE_ASPECTS]

// Configuration des catégories
export const CATEGORY_CONFIG = {
  [LIFE_ASPECTS.STUDIES]: {
    name: 'Études',
    icon: '📚',
    color: 'blue',
    description: 'Apprentissage et formation'
  },
  [LIFE_ASPECTS.FITNESS]: {
    name: 'Fitness',
    icon: '💪',
    color: 'green',
    description: 'Sport et santé physique'
  },
  [LIFE_ASPECTS.WORK]: {
    name: 'Travail',
    icon: '💼',
    color: 'purple',
    description: 'Activité professionnelle'
  },
  [LIFE_ASPECTS.HOUSEWORK]: {
    name: 'Ménage',
    icon: '🏠',
    color: 'orange',
    description: 'Tâches domestiques'
  },
  [LIFE_ASPECTS.RECOVERY]: {
    name: 'Récupération',
    icon: '😴',
    color: 'pink',
    description: 'Repos et bien-être'
  }
} as const

// Objectifs de temps recommandés par semaine (en heures)
export const RECOMMENDED_WEEKLY_HOURS = {
  [LIFE_ASPECTS.STUDIES]: 20,
  [LIFE_ASPECTS.FITNESS]: 5,
  [LIFE_ASPECTS.WORK]: 40,
  [LIFE_ASPECTS.HOUSEWORK]: 10,
  [LIFE_ASPECTS.RECOVERY]: 15
} as const
