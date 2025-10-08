'use client'

import { Plus, X } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { format } from 'date-fns'
import { Task } from '@/types/category'
import { useCategories } from '@/contexts/CategoryContext'
import { getTaskStatusBadge, getTaskOpacity, shouldStrikethrough } from '@/lib/task-utils'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onTaskClick: (task: Task, event?: React.MouseEvent) => void
  onAddTask: (date: Date, event?: React.MouseEvent, time?: string) => void
  onClose: () => void
}

export default function DayView({ date, tasks, onTaskClick, onAddTask, onClose }: DayViewProps) {
  const { categories } = useCategories()
  
  // Generate time slots from 6 AM to 11 PM with 5-minute intervals (12 slots per hour)
  const timeSlots = Array.from({ length: 204 }, (_, i) => { // 17 hours * 12 slots = 204 slots
    const hour = Math.floor(i / 12) + 6
    const minute = (i % 12) * 5
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    return {
      hour,
      minute,
      time: timeString,
      displayTime: minute === 0 ? (hour < 10 ? `0${hour}:00` : `${hour}:00`) : '', // Only show hour labels
      isHourMark: minute === 0 // Mark the start of each hour
    }
  })

  // Helper function to get absolute position from the top of the timeline (5-minute precision)
  const getAbsoluteTaskPosition = (task: Task): number => {
    const startHour = task.startTime.getHours()
    const startMinutes = task.startTime.getMinutes()
    
    // Calculate total minutes from 6:00 AM (start of timeline)
    const totalMinutesFromStart = (startHour - 6) * 60 + startMinutes
    
    // Convert to percentage of the timeline (17 hours = 1020 minutes)
    return (totalMinutesFromStart / 1020) * 100
  }

  // Helper function to get absolute height based on duration (5-minute precision)
  const getAbsoluteTaskHeight = (task: Task): number => {
    const startTime = task.startTime.getTime()
    const endTime = task.endTime ? task.endTime.getTime() : startTime + 60 * 60 * 1000
    const durationMinutes = (endTime - startTime) / (60 * 1000)
    
    // Convert to percentage of the timeline (17 hours = 1020 minutes)
    return (durationMinutes / 1020) * 100
  }

  // Helper function to check if a task overlaps with a time slot (5-minute precision)
  const getTasksInTimeSlot = (slot: { hour: number; minute: number }) => {
    return tasks.filter(task => {
      const taskStart = task.startTime.getTime()
      const taskEnd = task.endTime ? task.endTime.getTime() : taskStart + 60 * 60 * 1000
      
      const slotStartTime = new Date(date)
      slotStartTime.setHours(slot.hour, slot.minute, 0, 0)
      
      const slotEndTime = new Date(slotStartTime)
      slotEndTime.setMinutes(slotEndTime.getMinutes() + 5)
      
      // Check if this time slot overlaps with the task's time range
      return slotStartTime.getTime() < taskEnd && slotEndTime.getTime() > taskStart
    })
  }

  const getCategoryColor = (categoryId: string, status: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    const opacity = getTaskOpacity(status as any)
    const strikethrough = shouldStrikethrough(status as any)
    const colorMap = {
      blue: `bg-blue-100 border-blue-200 text-blue-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      green: `bg-green-100 border-green-200 text-green-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      purple: `bg-purple-100 border-purple-200 text-purple-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      orange: `bg-orange-100 border-orange-200 text-orange-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      pink: `bg-pink-100 border-pink-200 text-pink-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      red: `bg-red-100 border-red-200 text-red-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      indigo: `bg-indigo-100 border-indigo-200 text-indigo-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      teal: `bg-teal-100 border-teal-200 text-teal-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      yellow: `bg-yellow-100 border-yellow-200 text-yellow-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      lime: `bg-lime-100 border-lime-200 text-lime-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      emerald: `bg-emerald-100 border-emerald-200 text-emerald-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      cyan: `bg-cyan-100 border-cyan-200 text-cyan-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      sky: `bg-sky-100 border-sky-200 text-sky-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      violet: `bg-violet-100 border-violet-200 text-violet-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      fuchsia: `bg-fuchsia-100 border-fuchsia-200 text-fuchsia-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      rose: `bg-rose-100 border-rose-200 text-rose-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      slate: `bg-slate-100 border-slate-200 text-slate-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      gray: `bg-gray-100 border-gray-200 text-gray-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      zinc: `bg-zinc-100 border-zinc-200 text-zinc-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      neutral: `bg-neutral-100 border-neutral-200 text-neutral-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      stone: `bg-stone-100 border-stone-200 text-stone-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
      amber: `bg-amber-100 border-amber-200 text-amber-800 ${opacity} ${strikethrough ? 'line-through' : ''}`,
    }
    return colorMap[category?.color as keyof typeof colorMap] || `bg-gray-100 border-gray-200 text-gray-800 ${opacity} ${strikethrough ? 'line-through' : ''}`
  }

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

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Timeline container with absolute positioning for tasks */}
          <div className="relative">
            {/* Time slots background */}
            <div className="space-y-0">
              {timeSlots.map((slot) => (
                <div key={slot.time} className="flex items-start">
                  {/* Time Label - only show for hour marks */}
                  <div 
                    className="w-20 text-sm text-gray-500 font-medium cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex-shrink-0"
                    onClick={(e) => onAddTask(date, e, slot.time)}
                    title={`Add at ${slot.time}`}
                  >
                    {slot.displayTime}
                  </div>
                  
                  {/* Timeline Column */}
                  <div className="flex-1 relative min-h-[8px] border-l border-gray-200 ml-2">
                    {/* Time slot background - darker for hour marks */}
                    <div 
                      className={`absolute inset-0 cursor-pointer transition-colors ${
                        slot.isHourMark ? 'hover:bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => onAddTask(date, e, slot.time)}
                    />
                    {/* Hour separator line */}
                    {slot.isHourMark && (
                      <div className="absolute left-0 right-0 top-0 h-px bg-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tasks positioned absolutely over the timeline */}
            <div className="absolute top-0 left-0 right-0 h-full">
              <div className="ml-20 mr-4 h-full relative">
                {tasks.map((task) => {
                  const category = categories.find(cat => cat.id === task.categoryId)
                  const statusInfo = getTaskStatusBadge(task.status)
                  const absolutePosition = getAbsoluteTaskPosition(task)
                  const absoluteHeight = getAbsoluteTaskHeight(task)
                  
                  return (
                    <div
                      key={task.id}
                      className={`absolute left-1 right-1 rounded-md border text-xs cursor-pointer transition-all hover:shadow-sm ${getCategoryColor(task.categoryId, task.status)}`}
                      style={{
                        top: `${absolutePosition}%`,
                        height: `${absoluteHeight}%`,
                        minHeight: '20px',
                        zIndex: 10
                      }}
                      onClick={(e) => onTaskClick(task, e)}
                    >
                      <div className="p-1 h-full flex flex-col justify-center">
                        <div className="font-medium truncate">
                          {statusInfo.icon} {category?.icon} {task.title}
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
          </div>
        </div>
      </div>
    </div>
  )
}