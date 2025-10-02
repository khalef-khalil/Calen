'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowRight, Check } from 'lucide-react'
import { useCategories } from '@/contexts/CategoryContext'
import { CreateCategoryData } from '@/types/category'

const COLOR_OPTIONS = [
  { name: 'Bleu', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-700' },
  { name: 'Vert', value: 'green', bg: 'bg-green-500', text: 'text-green-700' },
  { name: 'Violet', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-700' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-700' },
  { name: 'Rose', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-700' },
  { name: 'Rouge', value: 'red', bg: 'bg-red-500', text: 'text-red-700' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-700' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-500', text: 'text-teal-700' },
]

const ICON_OPTIONS = [
  '📚', '💪', '💼', '🏠', '😴', '🎨', '🎵', '🏃', '🧘', '🍳',
  '📖', '🎯', '⚽', '🎮', '🎬', '🛠️', '🌱', '🎪', '🔬', '✈️'
]

export default function SetupPage() {
  const router = useRouter()
  const { createCategory, categories } = useCategories()
  const [currentStep, setCurrentStep] = useState(1)
  const [newCategory, setNewCategory] = useState<CreateCategoryData>({
    name: '',
    description: '',
    icon: '📚',
    color: 'blue',
    weeklyGoal: 0
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      setIsCreating(true)
      await createCategory(newCategory)
      setNewCategory({
        name: '',
        description: '',
        icon: '📚',
        color: 'blue',
        weeklyGoal: 0
      })
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  const canProceed = categories.length >= 2

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Configuration initiale</h1>
            <span className="text-sm text-gray-500">Étape {currentStep}/2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Create Categories */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Créez vos catégories de vie
            </h2>
            <p className="text-gray-600 mb-6">
              Définissez les aspects de votre vie que vous souhaitez suivre. 
              Vous devez créer au moins 2 catégories pour commencer.
            </p>

            {/* Category Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Travail, Études, Sport..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description de cette catégorie..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_OPTIONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                        className={`p-2 text-2xl rounded-lg border-2 transition-colors ${
                          newCategory.icon === icon 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          newCategory.color === color.value 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.bg} mx-auto`} />
                        <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectif hebdomadaire (heures)
                </label>
                <input
                  type="number"
                  value={newCategory.weeklyGoal}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="168"
                />
              </div>

              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name.trim() || isCreating}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? 'Création...' : 'Ajouter la catégorie'}
              </button>
            </div>

            {/* Created Categories */}
            {categories.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Catégories créées ({categories.length})</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          COLOR_OPTIONS.find(c => c.value === category.color)?.text
                        } ${
                          COLOR_OPTIONS.find(c => c.value === category.color)?.bg
                        } bg-opacity-20`}>
                          {category.weeklyGoal}h/semaine
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceed}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Configuration terminée !
              </h2>
              <p className="text-gray-600">
                Vous avez créé {categories.length} catégorie{categories.length > 1 ? 's' : ''} pour organiser votre vie.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {category.weeklyGoal}h/semaine
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleFinish}
                className="flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
              >
                Commencer à utiliser l'application
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
