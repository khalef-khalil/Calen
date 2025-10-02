'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WeekViewProps {
  tasks: Task[]
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onTaskUpdate: (id: string, task: Partial<Task>) => Promise<void>
  onTaskDelete: (id: string) => Promise<void>
  onTaskClick: (task: Task, event?: React.MouseEvent) => void
  onAddTask: (date: Date, event?: React.MouseEvent, time?: string) => void
}

export default function WeekView({ 
  tasks, 
  onTaskCreate, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskClick, 
  onAddTask 
}: WeekViewProps) {
  const { categories } = useCategories()
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Generate time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6
    return {
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: hour < 10 ? `0${hour}:00` : `${hour}:00`
    }
  })

  // Get week days (Monday to Sunday)
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Start on Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const weekDays = getWeekDays(currentWeek)

  // Group tasks by date and time
  const tasksByDateAndTime = tasks.reduce((acc, task) => {
    const dateKey = task.date.toISOString().split('T')[0]
    const hour = task.startTime.getHours()
    
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][hour]) {
      acc[dateKey][hour] = []
    }
    acc[dateKey][hour].push(task)
    return acc
  }, {} as Record<string, Record<number, Task[]>>)

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7))
  }

  const handleToday = () => {
    setCurrentWeek(new Date())
  }

  const getTaskDuration = (task: Task) => {
    if (!task.endTime) return 1
    const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
    return Math.max(1, Math.ceil(duration))
  }

  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours()
    const startMinute = task.startTime.getMinutes()
    const position = startMinute / 60 * 100 // Percentage within the hour
    return position
  }

  const getCategoryColor = (categoryId: string, isCompleted: boolean) => {
    const category = categories.find(cat => cat.id === categoryId)
    const colorMap = {
      blue: isCompleted ? 'bg-blue-200 border-blue-300 text-blue-900 line-through opacity-75' : 'bg-blue-100 border-blue-200 text-blue-800',
      green: isCompleted ? 'bg-green-200 border-green-300 text-green-900 line-through opacity-75' : 'bg-green-100 border-green-200 text-green-800',
      purple: isCompleted ? 'bg-purple-200 border-purple-300 text-purple-900 line-through opacity-75' : 'bg-purple-100 border-purple-200 text-purple-800',
      orange: isCompleted ? 'bg-orange-200 border-orange-300 text-orange-900 line-through opacity-75' : 'bg-orange-100 border-orange-200 text-orange-800',
      pink: isCompleted ? 'bg-pink-200 border-pink-300 text-pink-900 line-through opacity-75' : 'bg-pink-100 border-pink-200 text-pink-800',
      red: isCompleted ? 'bg-red-200 border-red-300 text-red-900 line-through opacity-75' : 'bg-red-100 border-red-200 text-red-800',
      indigo: isCompleted ? 'bg-indigo-200 border-indigo-300 text-indigo-900 line-through opacity-75' : 'bg-indigo-100 border-indigo-200 text-indigo-800',
      teal: isCompleted ? 'bg-teal-200 border-teal-300 text-teal-900 line-through opacity-75' : 'bg-teal-100 border-teal-200 text-teal-800',
    }
    return colorMap[category?.color as keyof typeof colorMap] || (isCompleted ? 'bg-gray-200 border-gray-300 text-gray-900 line-through opacity-75' : 'bg-gray-100 border-gray-200 text-gray-800')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[6], 'd MMM yyyy', { locale: fr })}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            This Week
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 text-sm font-medium text-gray-500 border-r">
              Time
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-4 text-center border-r last:border-r-0">
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(day, 'd MMM', { locale: fr })}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-8">
            {/* Time Column */}
            <div className="border-r">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="h-16 border-b border-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{slot.displayTime}</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => {
              const dateKey = day.toISOString().split('T')[0]
              const dayTasks = tasksByDateAndTime[dateKey] || {}
              const isToday = isSameDay(day, new Date())

              return (
                <div key={dayIndex} className="border-r last:border-r-0 relative">
                  {timeSlots.map((slot) => {
                    const slotTasks = dayTasks[slot.hour] || []
                    const isCurrentHour = new Date().getHours() === slot.hour && isToday

                    return (
                      <div
                        key={slot.hour}
                        className={`h-16 border-b border-gray-100 relative group cursor-pointer ${
                          isCurrentHour ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={(e) => onAddTask(day, e, slot.time)}
                      >
                        {/* Add Task Button */}
                        <button
                          className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddTask(day, e, slot.time)
                          }}
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Tasks in this time slot */}
                        <div className="absolute inset-0 p-1 space-y-1">
                          {slotTasks.map((task) => {
                            const category = categories.find(cat => cat.id === task.categoryId)
                            const duration = getTaskDuration(task)
                            const position = getTaskPosition(task)
                            const height = `${(duration * 100) / 1}%` // 100% per hour
                            const top = `${position}%`

                            return (
                              <div
                                key={task.id}
                                className={`absolute left-1 right-1 rounded-md border text-xs cursor-pointer transition-all hover:shadow-sm ${getCategoryColor(task.categoryId, task.isCompleted)}`}
                                style={{
                                  top,
                                  height: height === '100%' ? 'calc(100% - 4px)' : height,
                                  minHeight: '20px'
                                }}
                                onClick={(e) => onTaskClick(task, e)}
                              >
                                <div className="p-1 truncate">
                                  <div className="font-medium truncate">
                                    {task.isCompleted && '✓ '}{category?.icon} {task.title}
                                  </div>
                                  {task.endTime && (
                                    <div className="text-xs opacity-75 truncate">
                                      {format(task.startTime, 'HH:mm')} - {format(task.endTime, 'HH:mm')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
