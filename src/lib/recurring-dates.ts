import { addDays, addWeeks, addMonths, getDay, getDate } from 'date-fns'

export interface RecurringTaskSettings {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  dayOfWeek?: number // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number // 1-31
  duration: number // Duration in months
  startDate: Date
  startTime: string // HH:MM format
  endTime?: string // HH:MM format
}

/**
 * Generates all dates for a recurring task based on its settings
 * @param settings The recurring task settings
 * @returns Array of dates when the task should occur
 */
export function generateRecurringDates(settings: RecurringTaskSettings): Date[] {
  const dates: Date[] = []
  const { frequency, dayOfWeek, dayOfMonth, duration, startDate, startTime, endTime } = settings
  
  // Calculate end date based on duration
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + duration)
  
  let currentDate = new Date(startDate)
  let occurrenceCount = 0
  const maxOccurrences = 1000 // Safety limit to prevent infinite loops
  
  while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
    let shouldIncludeDate = false
    
    switch (frequency) {
      case 'daily':
        shouldIncludeDate = true
        break
        
      case 'weekly':
        if (dayOfWeek !== undefined && getDay(currentDate) === dayOfWeek) {
          shouldIncludeDate = true
        }
        break
        
      case 'biweekly':
        if (dayOfWeek !== undefined && getDay(currentDate) === dayOfWeek) {
          shouldIncludeDate = true
        }
        break
        
      case 'monthly':
        if (dayOfMonth !== undefined && getDate(currentDate) === dayOfMonth) {
          shouldIncludeDate = true
        }
        break
    }
    
    if (shouldIncludeDate) {
      dates.push(new Date(currentDate))
      occurrenceCount++
    }
    
    // Move to next day for daily, or next occurrence for others
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1)
        break
      case 'weekly':
        // For weekly, find the next occurrence of the same day of week
        if (dayOfWeek !== undefined) {
          const daysUntilNext = (dayOfWeek - getDay(currentDate) + 7) % 7
          currentDate = addDays(currentDate, daysUntilNext === 0 ? 7 : daysUntilNext)
        } else {
          currentDate = addWeeks(currentDate, 1)
        }
        break
      case 'biweekly':
        // For biweekly, find the next occurrence of the same day of week (2 weeks later)
        if (dayOfWeek !== undefined) {
          const daysUntilNext = (dayOfWeek - getDay(currentDate) + 7) % 7
          currentDate = addDays(currentDate, daysUntilNext === 0 ? 14 : daysUntilNext)
        } else {
          currentDate = addWeeks(currentDate, 2)
        }
        break
      case 'monthly':
        // For monthly, find the next occurrence of the same day of month
        if (dayOfMonth !== undefined) {
          currentDate = addMonths(currentDate, 1)
        } else {
          currentDate = addMonths(currentDate, 1)
        }
        break
    }
  }
  
  return dates
}

/**
 * Creates task data for a specific date
 * @param baseTask The base task data
 * @param date The date for this instance
 * @returns Task data for the specific date
 */
export function createTaskInstance(
  baseTask: {
    title: string
    description?: string | null
    startTime: string
    endTime?: string | null
    categoryId: string
    subcategoryId?: string | null
  },
  date: Date
) {
  const [hours, minutes] = baseTask.startTime.split(':').map(Number)
  const startDateTime = new Date(date)
  startDateTime.setHours(hours, minutes, 0, 0)
  
  let endDateTime: Date | null = null
  if (baseTask.endTime) {
    const [endHours, endMinutes] = baseTask.endTime.split(':').map(Number)
    endDateTime = new Date(date)
    endDateTime.setHours(endHours, endMinutes, 0, 0)
  }
  
  return {
    title: baseTask.title,
    description: baseTask.description,
    startTime: startDateTime,
    endTime: endDateTime,
    date: new Date(date),
    categoryId: baseTask.categoryId,
    subcategoryId: baseTask.subcategoryId,
    isRecurring: true,
    recurringId: null, // We'll set this after creating the recurring task definition
    status: 'scheduled' as const, // All new recurring tasks start as scheduled
    isCompleted: false,
    completedAt: null,
  }
}
