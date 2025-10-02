'use client'

import { Plus, X } from 'lucide-react'
import { formatDate, getDayHours } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onTaskClick: (task: Task, event?: React.MouseEvent) => void
  onAddTask: (date: Date, event?: React.MouseEvent, time?: string) => void
  onClose: () => void
}

export default function DayView({ date, tasks, onTaskClick, onAddTask, onClose }: DayViewProps) {
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
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => onAddTask(date, e)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des heures */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {dayHours.map(({ hour, label }) => {
            const hourTasks = tasksByHour[hour] || []
            
            return (
              <div key={hour} className="flex items-start space-x-3 py-2">
                {/* Heure - Clickable */}
                <div 
                  className="w-16 text-sm text-gray-500 font-medium cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  onClick={(e) => onAddTask(date, e, label)}
                  title={`Add at ${label}`}
                >
                  {label}
                </div>
                
                {/* Tâches de cette heure */}
                <div className="flex-1 space-y-1">
                  {hourTasks.map((task) => {
                    const category = categories.find(cat => cat.id === task.categoryId)
                    const colorClasses = {
                      blue: task.isCompleted ? 'bg-blue-100 border-blue-300 text-blue-900 line-through opacity-75' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900',
                      green: task.isCompleted ? 'bg-green-100 border-green-300 text-green-900 line-through opacity-75' : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900',
                      purple: task.isCompleted ? 'bg-purple-100 border-purple-300 text-purple-900 line-through opacity-75' : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900',
                      orange: task.isCompleted ? 'bg-orange-100 border-orange-300 text-orange-900 line-through opacity-75' : 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900',
                      pink: task.isCompleted ? 'bg-pink-100 border-pink-300 text-pink-900 line-through opacity-75' : 'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-900',
                      red: task.isCompleted ? 'bg-red-100 border-red-300 text-red-900 line-through opacity-75' : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-900',
                      indigo: task.isCompleted ? 'bg-indigo-100 border-indigo-300 text-indigo-900 line-through opacity-75' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900',
                      teal: task.isCompleted ? 'bg-teal-100 border-teal-300 text-teal-900 line-through opacity-75' : 'bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-900',
                      yellow: task.isCompleted ? 'bg-yellow-100 border-yellow-300 text-yellow-900 line-through opacity-75' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-900',
                      lime: task.isCompleted ? 'bg-lime-100 border-lime-300 text-lime-900 line-through opacity-75' : 'bg-lime-50 border-lime-200 hover:bg-lime-100 text-lime-900',
                      emerald: task.isCompleted ? 'bg-emerald-100 border-emerald-300 text-emerald-900 line-through opacity-75' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900',
                      cyan: task.isCompleted ? 'bg-cyan-100 border-cyan-300 text-cyan-900 line-through opacity-75' : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-900',
                      sky: task.isCompleted ? 'bg-sky-100 border-sky-300 text-sky-900 line-through opacity-75' : 'bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-900',
                      violet: task.isCompleted ? 'bg-violet-100 border-violet-300 text-violet-900 line-through opacity-75' : 'bg-violet-50 border-violet-200 hover:bg-violet-100 text-violet-900',
                      fuchsia: task.isCompleted ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900 line-through opacity-75' : 'bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100 text-fuchsia-900',
                      rose: task.isCompleted ? 'bg-rose-100 border-rose-300 text-rose-900 line-through opacity-75' : 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-900',
                      slate: task.isCompleted ? 'bg-slate-100 border-slate-300 text-slate-900 line-through opacity-75' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900',
                      gray: task.isCompleted ? 'bg-gray-100 border-gray-300 text-gray-900 line-through opacity-75' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900',
                      zinc: task.isCompleted ? 'bg-zinc-100 border-zinc-300 text-zinc-900 line-through opacity-75' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900',
                      neutral: task.isCompleted ? 'bg-neutral-100 border-neutral-300 text-neutral-900 line-through opacity-75' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-900',
                      stone: task.isCompleted ? 'bg-stone-100 border-stone-300 text-stone-900 line-through opacity-75' : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-900',
                      amber: task.isCompleted ? 'bg-amber-100 border-amber-300 text-amber-900 line-through opacity-75' : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900',
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
                      yellow: 'text-yellow-700',
                      lime: 'text-lime-700',
                      emerald: 'text-emerald-700',
                      cyan: 'text-cyan-700',
                      sky: 'text-sky-700',
                      violet: 'text-violet-700',
                      fuchsia: 'text-fuchsia-700',
                      rose: 'text-rose-700',
                      slate: 'text-slate-700',
                      gray: 'text-gray-700',
                      zinc: 'text-zinc-700',
                      neutral: 'text-neutral-700',
                      stone: 'text-stone-700',
                      amber: 'text-amber-700',
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
                      yellow: 'bg-yellow-200 text-yellow-800',
                      lime: 'bg-lime-200 text-lime-800',
                      emerald: 'bg-emerald-200 text-emerald-800',
                      cyan: 'bg-cyan-200 text-cyan-800',
                      sky: 'bg-sky-200 text-sky-800',
                      violet: 'bg-violet-200 text-violet-800',
                      fuchsia: 'bg-fuchsia-200 text-fuchsia-800',
                      rose: 'bg-rose-200 text-rose-800',
                      slate: 'bg-slate-200 text-slate-800',
                      gray: 'bg-gray-200 text-gray-800',
                      zinc: 'bg-zinc-200 text-zinc-800',
                      neutral: 'bg-neutral-200 text-neutral-800',
                      stone: 'bg-stone-200 text-stone-800',
                      amber: 'bg-amber-200 text-amber-800',
                    }
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${colorClasses[category?.color as keyof typeof colorClasses] || 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium flex items-center">
                            {task.isCompleted && '✓ '}{category?.icon} {task.title}
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
                  
                  {/* Ligne de l'heure si pas de tâches - Clickable */}
                  {hourTasks.length === 0 && (
                    <div 
                      className="h-12 border-l-2 border-gray-200 border-dashed cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      onClick={(e) => onAddTask(date, e, label)}
                      title={`Add at ${label}`}
                    ></div>
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
