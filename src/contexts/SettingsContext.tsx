'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppSettings, LifeAspectGoals, loadSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/settings'

interface SettingsContextType {
  settings: AppSettings
  updateGoals: (goals: Partial<LifeAspectGoals>) => void
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetToDefaults: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const loadedSettings = loadSettings()
    setSettings(loadedSettings)
  }, [])

  const updateGoals = (goals: Partial<LifeAspectGoals>) => {
    const newSettings = {
      ...settings,
      weeklyGoals: { ...settings.weeklyGoals, ...goals }
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateGoals, updateSettings, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
