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

  // Generate time slots from 6 AM to 11 PM with 30-minute intervals
  const timeSlots = Array.from({ length: 36 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6
    const minute = (i % 2) * 30
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    return {
      hour,
      minute,
      time: timeString,
      displayTime: hour < 10 ? `0${hour}:00` : `${hour}:00`, // Keep 1-hour display
      isFirstHalf: minute === 0 // First 30 minutes of the hour
    }
  })

  // Get week days (Monday to Sunday)
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Start on Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const weekDays = getWeekDays(currentWeek)

  // Filter tasks to only include those within the current week
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]
  const weekTasks = tasks.filter(task => {
    const taskDate = new Date(task.date)
    // Set time to start/end of day for proper comparison
    const taskDateStart = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
    const weekStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
    const weekEndDate = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate())
    
    return taskDateStart >= weekStartDate && taskDateStart <= weekEndDate
  })

  // Group tasks by date and time (timezone-safe)
  const tasksByDateAndTime = weekTasks.reduce((acc, task) => {
    // Use local date components to avoid timezone issues
    const year = task.date.getFullYear()
    const month = String(task.date.getMonth() + 1).padStart(2, '0')
    const day = String(task.date.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    
    const hour = task.startTime.getHours()
    const minute = task.startTime.getMinutes()
    const timeSlotKey = `${hour}:${minute < 30 ? '00' : '30'}`
    
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][timeSlotKey]) {
      acc[dateKey][timeSlotKey] = []
    }
    acc[dateKey][timeSlotKey].push(task)
    return acc
  }, {} as Record<string, Record<string, Task[]>>)

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
    if (!task.endTime) return 2 // 1 hour = 2 slots of 30 minutes
    const durationInMinutes = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60)
    const durationInSlots = Math.max(2, Math.ceil(durationInMinutes / 30)) // Each slot is 30 minutes
    return durationInSlots
  }

  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours()
    const startMinute = task.startTime.getMinutes()
    const position = startMinute / 60 * 100 // Percentage within the hour
    return position
  }

  // Check if a time slot is occupied by a multi-hour task
  const isTimeSlotOccupied = (day: Date, timeSlot: { hour: number; minute: number }) => {
    // Use local date components to match the task grouping
    const year = day.getFullYear()
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const dayNum = String(day.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${dayNum}`
    const dayTasks = tasksByDateAndTime[dateKey] || {}
    
    // Check all tasks for this day to see if any span over this time slot
    const allDayTasks = Object.values(dayTasks).flat()
    
    return allDayTasks.some(task => {
      const startTime = task.startTime.getTime()
      const endTime = task.endTime ? task.endTime.getTime() : startTime + (60 * 60 * 1000) // Default 1 hour
      const slotStartTime = new Date(day)
      slotStartTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0)
      const slotEndTime = new Date(slotStartTime.getTime() + (30 * 60 * 1000)) // 30 minutes
      
      // Check if this time slot overlaps with the task's time range
      return slotStartTime.getTime() < endTime && slotEndTime.getTime() > startTime
    })
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
      yellow: isCompleted ? 'bg-yellow-200 border-yellow-300 text-yellow-900 line-through opacity-75' : 'bg-yellow-100 border-yellow-200 text-yellow-800',
      lime: isCompleted ? 'bg-lime-200 border-lime-300 text-lime-900 line-through opacity-75' : 'bg-lime-100 border-lime-200 text-lime-800',
      emerald: isCompleted ? 'bg-emerald-200 border-emerald-300 text-emerald-900 line-through opacity-75' : 'bg-emerald-100 border-emerald-200 text-emerald-800',
      cyan: isCompleted ? 'bg-cyan-200 border-cyan-300 text-cyan-900 line-through opacity-75' : 'bg-cyan-100 border-cyan-200 text-cyan-800',
      sky: isCompleted ? 'bg-sky-200 border-sky-300 text-sky-900 line-through opacity-75' : 'bg-sky-100 border-sky-200 text-sky-800',
      violet: isCompleted ? 'bg-violet-200 border-violet-300 text-violet-900 line-through opacity-75' : 'bg-violet-100 border-violet-200 text-violet-800',
      fuchsia: isCompleted ? 'bg-fuchsia-200 border-fuchsia-300 text-fuchsia-900 line-through opacity-75' : 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-800',
      rose: isCompleted ? 'bg-rose-200 border-rose-300 text-rose-900 line-through opacity-75' : 'bg-rose-100 border-rose-200 text-rose-800',
      slate: isCompleted ? 'bg-slate-200 border-slate-300 text-slate-900 line-through opacity-75' : 'bg-slate-100 border-slate-200 text-slate-800',
      gray: isCompleted ? 'bg-gray-200 border-gray-300 text-gray-900 line-through opacity-75' : 'bg-gray-100 border-gray-200 text-gray-800',
      zinc: isCompleted ? 'bg-zinc-200 border-zinc-300 text-zinc-900 line-through opacity-75' : 'bg-zinc-100 border-zinc-200 text-zinc-800',
      neutral: isCompleted ? 'bg-neutral-200 border-neutral-300 text-neutral-900 line-through opacity-75' : 'bg-neutral-100 border-neutral-200 text-neutral-800',
      stone: isCompleted ? 'bg-stone-200 border-stone-300 text-stone-900 line-through opacity-75' : 'bg-stone-100 border-stone-200 text-stone-800',
      amber: isCompleted ? 'bg-amber-200 border-amber-300 text-amber-900 line-through opacity-75' : 'bg-amber-100 border-amber-200 text-amber-800',
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
              {timeSlots.map((slot, index) => (
                <div key={`${slot.hour}-${slot.minute}`} className="h-8 border-b border-gray-100 flex items-center justify-center">
                  {/* Only show hour label for the first 30-minute slot of each hour */}
                  {slot.isFirstHalf && (
                    <span className="text-xs text-gray-500">{slot.displayTime}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => {
              // Use local date components to match the task grouping
              const year = day.getFullYear()
              const month = String(day.getMonth() + 1).padStart(2, '0')
              const dayNum = String(day.getDate()).padStart(2, '0')
              const dateKey = `${year}-${month}-${dayNum}`
              const dayTasks = tasksByDateAndTime[dateKey] || {}
              const isToday = isSameDay(day, new Date())

              return (
                <div key={dayIndex} className="border-r last:border-r-0 relative">
                  {timeSlots.map((slot) => {
                    const timeSlotKey = `${slot.hour}:${slot.minute < 30 ? '00' : '30'}`
                    const slotTasks = dayTasks[timeSlotKey] || []
                    const currentTime = new Date()
                    const isCurrentSlot = currentTime.getHours() === slot.hour && 
                                       Math.floor(currentTime.getMinutes() / 30) * 30 === slot.minute && 
                                       isToday
                    const isOccupied = isTimeSlotOccupied(day, slot)

                    return (
                      <div
                        key={`${slot.hour}-${slot.minute}`}
                        className={`h-8 border-b border-gray-100 relative group ${
                          isOccupied 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : `cursor-pointer ${isCurrentSlot ? 'bg-blue-50' : 'hover:bg-gray-50'}`
                        }`}
                        onClick={isOccupied ? undefined : (e) => onAddTask(day, e, slot.time)}
                      >
                        {/* Add Button - only show if not occupied */}
                        {!isOccupied && (
                          <button
                            className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddTask(day, e, slot.time)
                            }}
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </button>
                        )}

                        {/* Tasks in this time slot */}
                        <div className="absolute inset-0 p-0.5 space-y-0.5">
                          {slotTasks.map((task) => {
                            const category = categories.find(cat => cat.id === task.categoryId)
                            const duration = getTaskDuration(task)
                            const position = getTaskPosition(task)
                            
                            // Calculate height based on duration (each 30-min slot is 32px)
                            const height = `${duration * 32}px`
                            const top = `${position}%`

                            return (
                              <div
                                key={task.id}
                                className={`absolute left-0.5 right-0.5 rounded-md border text-xs cursor-pointer transition-all hover:shadow-sm ${getCategoryColor(task.categoryId, task.isCompleted)}`}
                                style={{
                                  top,
                                  height,
                                  minHeight: '16px',
                                  zIndex: 10 // Ensure tasks appear above the background
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
