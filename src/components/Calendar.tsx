'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getCalendarDays, getPreviousMonth, getNextMonth, formatDate } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'
import DayView from './DayView'
import TaskModal from './TaskModal'

interface CalendarProps {
  tasks: Task[]
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onTaskUpdate: (id: string, task: Partial<Task>) => Promise<void>
  onTaskDelete: (id: string) => Promise<void>
}

export default function Calendar({ tasks, onTaskCreate, onTaskUpdate, onTaskDelete }: CalendarProps) {
  const { categories } = useCategories()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [triggerPosition, setTriggerPosition] = useState<{ x: number; y: number } | undefined>(undefined)

  const calendarDays = getCalendarDays(currentDate)

  // Grouper les tâches par date
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateKey = task.date.toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTaskClick = (task: Task, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setTriggerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleAddTask = (date: Date, event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setTriggerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }
    setSelectedDate(date)
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await onTaskUpdate(editingTask.id, taskData)
    } else {
      await onTaskCreate(taskData)
    }
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleTaskDelete = async (id: string) => {
    await onTaskDelete(id)
    setShowTaskModal(false)
    setEditingTask(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Calendrier principal */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* En-tête du calendrier */}
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">
              {formatDate(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentDate(getPreviousMonth(currentDate))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setCurrentDate(getNextMonth(currentDate))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Grille du calendrier */}
          <div className="p-6">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dateKey = day.date.toISOString().split('T')[0]
                const dayTasks = tasksByDate[dateKey] || []
                const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
                      ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                    `}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddTask(day.date, e)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <Plus className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Tâches du jour */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const category = categories.find(cat => cat.id === task.categoryId)
                        const colorClasses = {
                          blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                          green: 'bg-green-100 text-green-800 hover:bg-green-200',
                          purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
                          orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
                          pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
                          red: 'bg-red-100 text-red-800 hover:bg-red-200',
                          indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
                          teal: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
                        }
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => handleTaskClick(task, e)}
                            className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${colorClasses[category?.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                          >
                            {category?.icon} {task.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayTasks.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vue détaillée du jour */}
      {selectedDate && (
        <div className="w-96 border-l bg-white">
          <DayView
            date={selectedDate}
            tasks={tasksByDate[selectedDate.toISOString().split('T')[0]] || []}
            onTaskClick={handleTaskClick}
            onAddTask={(e) => handleAddTask(selectedDate, e)}
          />
        </div>
      )}

      {/* Modal de création/édition de tâche */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          selectedDate={selectedDate}
          triggerPosition={triggerPosition}
          onSave={handleTaskSave}
          onDelete={editingTask ? () => handleTaskDelete(editingTask.id) : undefined}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
            setTriggerPosition(undefined)
          }}
        />
      )}
    </div>
  )
}
