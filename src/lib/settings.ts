export interface LifeAspectGoals {
  studies: number
  fitness: number
  work: number
  housework: number
  recovery: number
}

export interface AppSettings {
  weeklyGoals: LifeAspectGoals
  minimumDataDays: number // Minimum days of data before showing alerts
  showAlerts: boolean
  completionThreshold: number // Minimum completion rate to avoid alerts (0-100)
}

export const DEFAULT_GOALS: LifeAspectGoals = {
  studies: 20,
  fitness: 5,
  work: 40,
  housework: 10,
  recovery: 15,
}

export const DEFAULT_SETTINGS: AppSettings = {
  weeklyGoals: DEFAULT_GOALS,
  minimumDataDays: 3,
  showAlerts: true,
  completionThreshold: 80,
}

export const saveSettings = (settings: AppSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lifeFlowSettings', JSON.stringify(settings))
  }
}

export const loadSettings = (): AppSettings => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lifeFlowSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...DEFAULT_SETTINGS, ...parsed }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      }
    }
  }
  return DEFAULT_SETTINGS
}
