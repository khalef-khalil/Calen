'use client'

import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useCategories } from '@/contexts/CategoryContext'
import { RotateCcw, Save, Plus, Edit, Trash2, Settings as SettingsIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaults } = useSettings()
  const { categories, updateCategory, deleteCategory } = useCategories()
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState<number>(0)

  const handleGoalUpdate = async (categoryId: string, newGoal: number) => {
    // Calculate what the total would be with this change
    const otherCategoriesTotal = categories
      .filter(cat => cat.id !== categoryId)
      .reduce((sum, cat) => sum + cat.weeklyGoal, 0)
    const newTotal = otherCategoriesTotal + newGoal

    // Validate that total doesn't exceed 120 hours
    if (newTotal > 120) {
      alert(`Total weekly hours cannot exceed 120. Current total would be ${newTotal}h. Please reduce the goal or other categories first.`)
      return
    }

    try {
      setIsSaving(true)
      await updateCategory(categoryId, { weeklyGoal: newGoal })
      setEditingCategory(null)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'objectif:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action ne peut pas être annulée.')) {
      try {
        await deleteCategory(categoryId)
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error)
      }
    }
  }

  const totalHours = categories.reduce((sum, category) => sum + category.weeklyGoal, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your life categories and configure your goals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Categories</h2>
              <Link
                href="/setup"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Link>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {editingCategory === category.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newGoal}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            const otherCategoriesTotal = categories
                              .filter(cat => cat.id !== categoryId)
                              .reduce((sum, cat) => sum + cat.weeklyGoal, 0)
                            const maxAllowed = 120 - otherCategoriesTotal
                            setNewGoal(Math.min(value, maxAllowed))
                          }}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                          min="0"
                          max={120 - categories.filter(cat => cat.id !== categoryId).reduce((sum, cat) => sum + cat.weeklyGoal, 0)}
                        />
                        <button
                          onClick={() => handleGoalUpdate(category.id, newGoal)}
                          disabled={isSaving}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {category.weeklyGoal}h/week
                        </span>
                        <button
                          onClick={() => {
                            setEditingCategory(category.id)
                            setNewGoal(category.weeklyGoal)
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-8">
                  <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first category to start organizing your life.
                  </p>
                  <Link
                    href="/setup"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create a category
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {categories.length > 0 && (
            <div className={`rounded-lg p-4 ${
              totalHours > 120 
                ? 'bg-red-50 border border-red-200' 
                : totalHours > 100 
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    totalHours > 120 ? 'text-red-900' : 'text-blue-900'
                  }`}>
                    Weekly Total
                  </h3>
                  <p className={`text-sm ${
                    totalHours > 120 ? 'text-red-700' : 'text-blue-700'
                  }`}>
                    {totalHours} hours per week
                    {totalHours > 120 && (
                      <span className="text-red-600 ml-2 font-semibold">
                        (Exceeds 120h limit!)
                      </span>
                    )}
                    {totalHours <= 120 && totalHours > 100 && (
                      <span className="text-yellow-600 ml-2">
                        (Close to 120h limit)
                      </span>
                    )}
                  </p>
                </div>
                <div className={`text-2xl font-bold ${
                  totalHours > 120 ? 'text-red-900' : 'text-blue-900'
                }`}>
                  {totalHours}h
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      totalHours > 120 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((totalHours / 120) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {120 - totalHours} hours remaining
                </p>
              </div>
            </div>
          )}
        </div>

        {/* App Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Minimum data days</h3>
                  <p className="text-sm text-gray-600">
                    Number of days of data required before showing alerts
                  </p>
                </div>
                <input
                  type="number"
                  value={settings.minimumDataDays}
                  onChange={(e) => updateSettings({ minimumDataDays: parseInt(e.target.value) || 1 })}
                  className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                  min="1"
                  max="30"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Completion threshold</h3>
                  <p className="text-sm text-gray-600">
                    Minimum completion rate for passed tasks to avoid alerts (0-100%)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    value={settings.completionThreshold}
                    onChange={(e) => updateSettings({ completionThreshold: parseInt(e.target.value) })}
                    className="w-32"
                    min="0"
                    max="100"
                  />
                  <span className="w-12 text-center font-medium text-gray-900">
                    {settings.completionThreshold}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable alerts</h3>
                  <p className="text-sm text-gray-600">
                    Show imbalance alerts in the dashboard
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ showAlerts: !settings.showAlerts })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showAlerts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link
                href="/setup"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Add a category</h3>
                  <p className="text-sm text-gray-600">Create a new life category</p>
                </div>
              </Link>

              <Link
                href="/calendar"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <SettingsIcon className="w-5 h-5 mr-3 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage tasks</h3>
                  <p className="text-sm text-gray-600">Create and organize your tasks</p>
                </div>
              </Link>

              <button
                onClick={resetToDefaults}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <RotateCcw className="w-5 h-5 mr-3 text-orange-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Reset settings</h3>
                  <p className="text-sm text-gray-600">Reset to default settings</p>
                </div>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">About the application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Calen helps you organize and balance different aspects of your life 
              by allowing you to create custom categories and track your goals.
            </p>
            <div className="text-xs text-gray-500">
              Version 1.0.0 • Built with Next.js and Prisma
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}