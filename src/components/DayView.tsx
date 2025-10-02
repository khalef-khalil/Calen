'use client'

import { Plus } from 'lucide-react'
import { formatDate, getDayHours } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onTaskClick: (task: Task, event?: React.MouseEvent) => void
  onAddTask: (event?: React.MouseEvent) => void
}

export default function DayView({ date, tasks, onTaskClick, onAddTask }: DayViewProps) {
  const { categories } = useCategories()
  const dayHours = getDayHours()

  // Grouper les tâches par heure
  const tasksByHour = tasks.reduce((acc, task) => {
    const hour = task.startTime.getHours()
    if (!acc[hour]) {
      acc[hour] = []
    }
    acc[hour].push(task)
    return acc
  }, {} as Record<number, Task[]>)

  return (
    <div className="h-full flex flex-col">
      {/* En-tête du jour */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(date, 'EEEE d MMMM yyyy')}
            </h2>
            <p className="text-sm text-gray-500">
              {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Liste des heures */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {dayHours.map(({ hour, label }) => {
            const hourTasks = tasksByHour[hour] || []
            
            return (
              <div key={hour} className="flex items-start space-x-3 py-2">
                {/* Heure */}
                <div className="w-16 text-sm text-gray-500 font-medium">
                  {label}
                </div>
                
                {/* Tâches de cette heure */}
                <div className="flex-1 space-y-1">
                  {hourTasks.map((task) => {
                    const category = categories.find(cat => cat.id === task.categoryId)
                    const colorClasses = {
                      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900',
                      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900',
                      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900',
                      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900',
                      pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-900',
                      red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-900',
                      indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900',
                      teal: 'bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-900',
                    }
                    const textColorClasses = {
                      blue: 'text-blue-700',
                      green: 'text-green-700',
                      purple: 'text-purple-700',
                      orange: 'text-orange-700',
                      pink: 'text-pink-700',
                      red: 'text-red-700',
                      indigo: 'text-indigo-700',
                      teal: 'text-teal-700',
                    }
                    const badgeColorClasses = {
                      blue: 'bg-blue-200 text-blue-800',
                      green: 'bg-green-200 text-green-800',
                      purple: 'bg-purple-200 text-purple-800',
                      orange: 'bg-orange-200 text-orange-800',
                      pink: 'bg-pink-200 text-pink-800',
                      red: 'bg-red-200 text-red-800',
                      indigo: 'bg-indigo-200 text-indigo-800',
                      teal: 'bg-teal-200 text-teal-800',
                    }
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${colorClasses[category?.color as keyof typeof colorClasses] || 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium flex items-center">
                            {category?.icon} {task.title}
                          </h3>
                          <span className={`text-xs ${textColorClasses[category?.color as keyof typeof textColorClasses] || 'text-gray-600'}`}>
                            {task.endTime 
                              ? `${task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${task.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                              : task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                        </div>
                        {task.description && (
                          <p className={`text-sm mt-1 ${textColorClasses[category?.color as keyof typeof textColorClasses] || 'text-gray-700'}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${badgeColorClasses[category?.color as keyof typeof badgeColorClasses] || 'bg-gray-200 text-gray-800'}`}>
                            {category?.name}
                          </span>
                          {task.subcategory && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                              {task.subcategory.name}
                            </span>
                          )}
                          {task.isRecurring && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                              Récurrent
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Ligne de l'heure si pas de tâches */}
                  {hourTasks.length === 0 && (
                    <div className="h-12 border-l-2 border-gray-200 border-dashed"></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
