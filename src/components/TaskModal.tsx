'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { createDateTime } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'

interface TaskModalProps {
  task?: Task | null
  selectedDate?: Date | null
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  triggerPosition?: { x: number; y: number }
}

export default function TaskModal({ task, selectedDate, onSave, onDelete, onClose, triggerPosition }: TaskModalProps) {
  const { categories, subcategories } = useCategories()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '',
    date: selectedDate || new Date(),
    categoryId: '',
    subcategoryId: '',
    isRecurring: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        startTime: task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endTime: task.endTime ? task.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        date: task.date,
        categoryId: task.categoryId || '',
        subcategoryId: task.subcategoryId || '',
        isRecurring: task.isRecurring,
      })
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        categoryId: categories[0]?.id || '',
      }))
    }
  }, [task, selectedDate, categories])

  // Animation d'ouverture
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Fonction de fermeture avec animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Durée de l'animation
  }

  // Fermer avec la touche ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const startDateTime = createDateTime(formData.date, formData.startTime)
      const endDateTime = formData.endTime ? createDateTime(formData.date, formData.endTime) : null

              await onSave({
                title: formData.title,
                description: formData.description || null,
                startTime: startDateTime,
                endTime: endDateTime,
                date: formData.date,
                categoryId: formData.categoryId,
                subcategoryId: formData.subcategoryId || null,
                isRecurring: formData.isRecurring,
                recurringId: null,
              })
      
      // Fermer avec animation après sauvegarde
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (onDelete && confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await onDelete()
      handleClose()
    }
  }

  // Calculer la position de départ pour l'animation
  const getInitialTransform = () => {
    if (triggerPosition) {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const deltaX = triggerPosition.x - centerX
      const deltaY = triggerPosition.y - centerY
      return `translate(${deltaX}px, ${deltaY}px) scale(0.3)`
    }
    return 'translate(0, 0) scale(0.8)'
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: isVisible && !isClosing ? 1 : 0
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out"
        style={{
          transform: isClosing 
            ? getInitialTransform()
            : isVisible 
              ? 'translate(0, 0) scale(1)' 
              : getInitialTransform(),
          opacity: isVisible && !isClosing ? 1 : 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {task ? 'Edit Task' : 'New Task'}
                  </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
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
                Start Time *
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
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            categoryId: e.target.value,
                            subcategoryId: '' // Reset subcategory when category changes
                          }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subcategory Selection */}
                  {formData.categoryId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory (optional)
                      </label>
                      <select
                        value={formData.subcategoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">No subcategory</option>
                        {subcategories
                          .filter(sub => sub.categoryId === formData.categoryId)
                          .map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                      Recurring task
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {task && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
              </button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
