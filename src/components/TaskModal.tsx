'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { createDateTime } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'
import { generateRecurringDates, createTaskInstance } from '@/lib/recurring-dates'

interface TaskModalProps {
  task?: Task | null
  selectedDate?: Date | null
  clickedTime?: string | null
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  triggerPosition?: { x: number; y: number }
}

export default function TaskModal({ task, selectedDate, clickedTime, onSave, onDelete, onClose, triggerPosition }: TaskModalProps) {
  const { categories, subcategories } = useCategories()
  
  const durationOptions = [
    { value: 1, label: '1 month' },
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '1 year' },
  ]
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: clickedTime || '09:00',
    endTime: '',
    date: selectedDate || new Date(),
    categoryId: '',
    subcategoryId: '',
    isRecurring: false,
    isCompleted: false,
    // Recurring task fields
    frequency: 'daily' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    dayOfWeek: 1, // Monday by default
    dayOfMonth: 1,
    duration: 12, // Default to 1 year
  })

  // State for recurring task editing options
  const [isRecurringTask, setIsRecurringTask] = useState(false)
  const [editAllFuture, setEditAllFuture] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (task) {
      // Load recurring task data if available
      const recurringData = task.recurringTask
      
      setFormData({
        title: task.title,
        description: task.description || '',
        startTime: task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endTime: task.endTime ? task.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        date: task.date,
        categoryId: task.categoryId || '',
        subcategoryId: task.subcategoryId || '',
        isRecurring: task.isRecurring,
        isCompleted: task.isCompleted ?? false,
        // Load recurring task fields from the recurring task template if available
        frequency: recurringData?.frequency || 'daily',
        dayOfWeek: recurringData?.dayOfWeek || 1,
        dayOfMonth: recurringData?.dayOfMonth || 1,
        duration: recurringData?.duration || 12,
      })
      
      // Check if this is a recurring task instance
      console.log('Task being edited:', task)
      console.log('Task recurringId:', task.recurringId)
      console.log('Recurring task data:', recurringData)
      console.log('Is recurring task:', !!task.recurringId)
      // For now, also check the isRecurring flag as a fallback
      setIsRecurringTask(!!task.recurringId || task.isRecurring)
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        startTime: clickedTime || prev.startTime,
        categoryId: categories[0]?.id || '',
      }))
      setIsRecurringTask(false)
    }
    
    // Only set default category for new tasks, not when editing existing tasks
    if (!task && categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({
        ...prev,
        categoryId: categories[0].id
      }))
    }
  }, [task, selectedDate, clickedTime, categories])

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
      console.log('Form submission - formData:', formData)
      console.log('Available categories:', categories)
      console.log('Editing task:', task)
      
      // Validate required fields
      if (!formData.categoryId) {
        throw new Error('Please select a category')
      }

      // If editing an existing task, handle recurring task logic
      if (task) {
        const startDateTime = createDateTime(formData.date, formData.startTime)
        const endDateTime = formData.endTime ? createDateTime(formData.date, formData.endTime) : null

        // Prepare the task data
        const taskData = {
          title: formData.title,
          description: formData.description || null,
          startTime: startDateTime,
          endTime: endDateTime,
          date: formData.date,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId || null,
          isRecurring: formData.isRecurring,
          recurringId: task.recurringId || null,
          isCompleted: formData.isCompleted,
          completedAt: formData.isCompleted ? new Date() : null,
        }

        // Add recurring task editing options if this is a recurring task
        if (isRecurringTask) {
          taskData.editAllFuture = editAllFuture
          // Include recurring task fields for updating the template
          taskData.frequency = formData.frequency
          taskData.dayOfWeek = formData.dayOfWeek
          taskData.dayOfMonth = formData.dayOfMonth
          taskData.duration = formData.duration
          taskData.endDate = (() => {
            const endDate = new Date(formData.date)
            endDate.setMonth(endDate.getMonth() + formData.duration)
            return endDate
          })()
          
        }

        await onSave(taskData)
      } else if (formData.isRecurring) {
        // For new recurring tasks, generate all instances upfront
        const recurringSettings = {
          frequency: formData.frequency,
          dayOfWeek: (formData.frequency === 'weekly' || formData.frequency === 'biweekly') ? formData.dayOfWeek : undefined,
          dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : undefined,
          duration: formData.duration,
          startDate: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime || undefined,
        }

        console.log('Generating recurring dates with settings:', recurringSettings)
        
        // Generate all dates for the recurring task
        const recurringDates = generateRecurringDates(recurringSettings)
        console.log(`Generated ${recurringDates.length} recurring dates`)

        // Create base task data
        const baseTask = {
          title: formData.title,
          description: formData.description || null,
          startTime: formData.startTime,
          endTime: formData.endTime || null,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId || null,
        }

        // First, create a RecurringTask record
        const recurringTaskData = {
          title: formData.title,
          description: formData.description || null,
          startTime: formData.startTime,
          endTime: formData.endTime || null,
          dayOfWeek: (formData.frequency === 'weekly' || formData.frequency === 'biweekly') ? formData.dayOfWeek : null,
          dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : null,
          frequency: formData.frequency,
          duration: formData.duration,
          endDate: (() => {
            const endDate = new Date(formData.date)
            endDate.setMonth(endDate.getMonth() + formData.duration)
            return endDate
          })(),
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId || null,
        }

        // Create the recurring task first
        const recurringTaskResponse = await fetch('/api/recurring-tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recurringTaskData),
        })

        if (!recurringTaskResponse.ok) {
          throw new Error('Failed to create recurring task template')
        }

        const recurringTask = await recurringTaskResponse.json()
        console.log('Created recurring task:', recurringTask)

        // Create all task instances with the recurringId
        const taskInstances = recurringDates.map(date => ({
          ...createTaskInstance(baseTask, date),
          recurringId: recurringTask.id
        }))

        console.log(`Creating ${taskInstances.length} task instances`)

        // Save all task instances with error handling
        const results = []
        for (const taskInstance of taskInstances) {
          try {
            await onSave(taskInstance)
            results.push({ success: true, task: taskInstance })
          } catch (error) {
            console.error('Failed to create task instance:', error)
            results.push({ success: false, task: taskInstance, error })
          }
        }

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length
        
        console.log(`Recurring task creation completed: ${successCount} successful, ${failCount} failed`)
        
        if (failCount > 0) {
          console.warn(`${failCount} task instances failed to create, but ${successCount} were successful`)
        }

        console.log('Successfully created all recurring task instances')
      } else {
        // Regular single new task
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
          isRecurring: false,
          recurringId: null,
          isCompleted: formData.isCompleted,
          completedAt: formData.isCompleted ? new Date() : null,
        })
      }
      
      // Close with animation after saving
      handleClose()
    } catch (error) {
      console.error('Error saving task:', error)
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

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                checked={formData.isCompleted}
                onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.checked }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isCompleted" className="ml-2 text-sm text-gray-700">
                Mark as completed
              </label>
            </div>

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
          </div>

          {/* Recurring Task Options */}
          {formData.isRecurring && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Recurring Options</h3>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                    Day of the week *
                  </label>
                  <select
                    id="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-1">
                    Day of the month *
                  </label>
                  <input
                    type="number"
                    id="dayOfMonth"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (optional)
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How long should this task repeat? Defaults to 1 year if not specified.
                </p>
              </div>
            </div>
          )}

          {/* Recurring Task Editing Options */}
          {isRecurringTask && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900">Edit Recurring Task</h3>
              <p className="text-xs text-blue-700">
                This task is part of a recurring series. Choose how to apply your changes:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="editThisInstance"
                    name="editScope"
                    checked={!editAllFuture}
                    onChange={() => setEditAllFuture(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="editThisInstance" className="ml-2 text-sm text-blue-800">
                    Edit only this instance
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="editAllFuture"
                    name="editScope"
                    checked={editAllFuture}
                    onChange={() => setEditAllFuture(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="editAllFuture" className="ml-2 text-sm text-blue-800">
                    Edit this and all future instances
                  </label>
                </div>
              </div>
              
              {editAllFuture && (
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  ⚠️ This will update the recurring task template and affect all future occurrences.
                </div>
              )}
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
                disabled={isSubmitting || categories.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : categories.length === 0 ? 'No categories available' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
