'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react'
import { getCalendarDays, getPreviousMonth, getNextMonth, formatDate } from '@/lib/date-utils'
import { Task } from '@/types/category'
import { Settings } from '@/types/task'
import { useCategories } from '@/contexts/CategoryContext'
import { getTaskStatusBadge, getTaskOpacity, shouldStrikethrough } from '@/lib/task-utils'
import DayView from './DayView'
import WeekView from './WeekView'
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
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [clickedTime, setClickedTime] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  // Load completion settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  const calendarDays = getCalendarDays(currentDate)

  // Calculate day background color based on completion rate
  const getDayBackgroundColor = (date: Date, dayTasks: Task[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayDate = new Date(date)
    dayDate.setHours(0, 0, 0, 0)
    
    // Only color past days (not today or future)
    if (dayDate >= today) {
      return 'bg-white'
    }
    
    // If no tasks, use default white
    if (dayTasks.length === 0) {
      return 'bg-white'
    }
    
    // Calculate completion rate based on status
    const completedCount = dayTasks.filter(task => task.status === 'completed').length
    const completionRate = (completedCount / dayTasks.length) * 100
    
    // Use thresholds from settings (default to 50/100 if not loaded)
    const thresholdLow = settings?.completionThresholdLow ?? 50
    const thresholdHigh = settings?.completionThresholdHigh ?? 100
    
    // Color logic:
    // - Below thresholdLow: Red
    // - Between thresholdLow and thresholdHigh: Green
    // - At thresholdHigh (100%): Golden
    if (completionRate >= thresholdHigh) {
      return 'bg-yellow-100 border-yellow-400' // Golden
    } else if (completionRate >= thresholdLow) {
      return 'bg-green-100 border-green-300' // Green
    } else {
      return 'bg-red-100 border-red-300' // Red
    }
  }

  // Grouper les tâches par date (timezone-safe)
  const tasksByDate = tasks.reduce((acc, task) => {
    // Use local date components to avoid timezone issues
    const year = task.date.getFullYear()
    const month = String(task.date.getMonth() + 1).padStart(2, '0')
    const day = String(task.date.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    
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

  const handleAddTask = (date: Date, event?: React.MouseEvent, time?: string) => {
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
    // Store the clicked time for the modal to use
    if (time) {
      setClickedTime(time)
    }
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
              {viewMode === 'month' 
                ? formatDate(currentDate, 'MMMM yyyy')
                : `Week of ${formatDate(currentDate, 'MMM d, yyyy')}`
              }
            </h1>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Month</span>
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Week</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(viewMode === 'month' ? getPreviousMonth(currentDate) : new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(viewMode === 'month' ? getNextMonth(currentDate) : new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          {viewMode === 'month' ? (
            <div className="p-6">
              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Jours du mois */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  // Use local date components to match the task grouping
                  const year = day.date.getFullYear()
                  const month = String(day.date.getMonth() + 1).padStart(2, '0')
                  const dayNum = String(day.date.getDate()).padStart(2, '0')
                  const dateKey = `${year}-${month}-${dayNum}`
                  const dayTasks = tasksByDate[dateKey] || []
                  const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()
                  const dayBgColor = getDayBackgroundColor(day.date, dayTasks)

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[120px] p-2 border cursor-pointer hover:opacity-90 transition-all group
                        ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400 border-gray-200' : dayBgColor}
                        ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
                        ${isSelected ? 'ring-2 ring-blue-400' : ''}
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
                          const statusInfo = getTaskStatusBadge(task.status)
                          const opacity = getTaskOpacity(task.status)
                          const strikethrough = shouldStrikethrough(task.status)
                          
                          const colorClasses = {
                            blue: `bg-blue-100 text-blue-800 hover:bg-blue-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            green: `bg-green-100 text-green-800 hover:bg-green-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            purple: `bg-purple-100 text-purple-800 hover:bg-purple-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            orange: `bg-orange-100 text-orange-800 hover:bg-orange-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            pink: `bg-pink-100 text-pink-800 hover:bg-pink-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            red: `bg-red-100 text-red-800 hover:bg-red-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            indigo: `bg-indigo-100 text-indigo-800 hover:bg-indigo-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            teal: `bg-teal-100 text-teal-800 hover:bg-teal-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            yellow: `bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            lime: `bg-lime-100 text-lime-800 hover:bg-lime-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            emerald: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            cyan: `bg-cyan-100 text-cyan-800 hover:bg-cyan-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            sky: `bg-sky-100 text-sky-800 hover:bg-sky-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            violet: `bg-violet-100 text-violet-800 hover:bg-violet-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            fuchsia: `bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            rose: `bg-rose-100 text-rose-800 hover:bg-rose-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            slate: `bg-slate-100 text-slate-800 hover:bg-slate-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            gray: `bg-gray-100 text-gray-800 hover:bg-gray-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            zinc: `bg-zinc-100 text-zinc-800 hover:bg-zinc-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            neutral: `bg-neutral-100 text-neutral-800 hover:bg-neutral-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            stone: `bg-stone-100 text-stone-800 hover:bg-stone-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                            amber: `bg-amber-100 text-amber-800 hover:bg-amber-200 ${opacity} ${strikethrough ? 'line-through' : ''}`,
                          }
                          return (
                            <div
                              key={task.id}
                              onClick={(e) => handleTaskClick(task, e)}
                              className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${colorClasses[category?.color as keyof typeof colorClasses] || `bg-gray-100 text-gray-800 hover:bg-gray-200 ${opacity} ${strikethrough ? 'line-through' : ''}`}`}
                            >
                              {statusInfo.icon} {category?.icon} {task.title}
                            </div>
                          )
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <WeekView
              tasks={tasks}
              onTaskCreate={onTaskCreate}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          )}
        </div>
      </div>

      {/* Vue détaillée du jour */}
      {selectedDate && (
        <div className="w-96 border-l bg-white">
          <DayView
            date={selectedDate}
            tasks={(() => {
              // Use local date components to match the task grouping
              const year = selectedDate.getFullYear()
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
              const day = String(selectedDate.getDate()).padStart(2, '0')
              const dateKey = `${year}-${month}-${day}`
              return tasksByDate[dateKey] || []
            })()}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}

      {/* Modal de création/édition de tâche */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          selectedDate={selectedDate}
          clickedTime={clickedTime}
          triggerPosition={triggerPosition}
          onSave={handleTaskSave}
          onDelete={editingTask ? () => handleTaskDelete(editingTask.id) : undefined}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
            setTriggerPosition(undefined)
            setClickedTime(null)
          }}
        />
      )}
    </div>
  )
}
