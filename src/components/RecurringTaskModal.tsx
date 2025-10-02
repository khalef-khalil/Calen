'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { RecurringTask } from '@/types/task'
import { getDayName } from '@/lib/recurring-tasks'

interface RecurringTaskModalProps {
  task?: RecurringTask | null
  onSave: (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

export default function RecurringTaskModal({ task, onSave, onDelete, onClose }: RecurringTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    dayOfWeek: 1, // Lundi par défaut
    dayOfMonth: 1,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        startTime: task.startTime,
        endTime: task.endTime || '',
        frequency: task.frequency,
        dayOfWeek: task.dayOfWeek || 1,
        dayOfMonth: task.dayOfMonth || 1,
      })
    }
  }, [task])

  // Fermer avec la touche ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave({
        title: formData.title,
        description: formData.description || null,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        frequency: formData.frequency,
        dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : null,
        dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : null,
        isActive: true,
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (onDelete && confirm('Êtes-vous sûr de vouloir supprimer cette tâche récurrente ?')) {
      await onDelete()
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Modifier la tâche récurrente' : 'Nouvelle tâche récurrente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fréquence *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="daily">Tous les jours</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jour de la semaine *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 7 }, (_, i) => (
                  <option key={i} value={i}>
                    {getDayName(i)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jour du mois *
              </label>
              <select
                value={formData.dayOfMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {task && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
