'use client'

import { Plus } from 'lucide-react'
import { formatDate, getDayHours } from '@/lib/date-utils'
import { Task } from '@/types/task'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onTaskClick: (task: Task, event?: React.MouseEvent) => void
  onAddTask: (event?: React.MouseEvent) => void
}

export default function DayView({ date, tasks, onTaskClick, onAddTask }: DayViewProps) {
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
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-900">{task.title}</h3>
                        <span className="text-xs text-blue-600">
                          {task.endTime 
                            ? `${task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${task.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                            : task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          }
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-blue-700 mt-1">{task.description}</p>
                      )}
                      {task.isRecurring && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
                          Récurrent
                        </span>
                      )}
                    </div>
                  ))}
                  
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
