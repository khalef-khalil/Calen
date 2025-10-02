import { RecurringTask } from '@/types/task'
import { addDays, addWeeks, addMonths, getDay, getDate } from 'date-fns'

// Générer des tâches récurrentes pour une période donnée
export const generateRecurringTasks = (
  recurringTask: RecurringTask,
  startDate: Date,
  endDate: Date
) => {
  const tasks = []
  let currentDate = new Date(startDate)

  // Check if the recurring task has an end date and respect it
  const effectiveEndDate = recurringTask.endDate 
    ? new Date(Math.min(endDate.getTime(), recurringTask.endDate.getTime()))
    : endDate

  while (currentDate <= effectiveEndDate) {
    let shouldCreateTask = false

    switch (recurringTask.frequency) {
      case 'daily':
        shouldCreateTask = true
        break

      case 'weekly':
        if (recurringTask.dayOfWeek !== null && getDay(currentDate) === recurringTask.dayOfWeek) {
          shouldCreateTask = true
        }
        break

      case 'monthly':
        if (recurringTask.dayOfMonth !== null && getDate(currentDate) === recurringTask.dayOfMonth) {
          shouldCreateTask = true
        }
        break
    }

    if (shouldCreateTask) {
      const [hours, minutes] = recurringTask.startTime.split(':').map(Number)
      const startDateTime = new Date(currentDate)
      startDateTime.setHours(hours, minutes, 0, 0)

      let endDateTime = null
      if (recurringTask.endTime) {
        const [endHours, endMinutes] = recurringTask.endTime.split(':').map(Number)
        endDateTime = new Date(currentDate)
        endDateTime.setHours(endHours, endMinutes, 0, 0)
      }

      tasks.push({
        title: recurringTask.title,
        description: recurringTask.description,
        startTime: startDateTime,
        endTime: endDateTime,
        date: new Date(currentDate),
        categoryId: recurringTask.categoryId,
        subcategoryId: recurringTask.subcategoryId,
        isRecurring: true,
        recurringId: recurringTask.id,
      })
    }

    // Passer à la prochaine occurrence
    switch (recurringTask.frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, 1)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, 1)
        break
    }
  }

  return tasks
}

// Obtenir le nom du jour de la semaine en français
export const getDayName = (dayOfWeek: number) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[dayOfWeek]
}

// Obtenir la description de la fréquence
export const getFrequencyDescription = (recurringTask: RecurringTask) => {
  switch (recurringTask.frequency) {
    case 'daily':
      return 'Tous les jours'
    case 'weekly':
      return `Tous les ${getDayName(recurringTask.dayOfWeek || 0)}`
    case 'monthly':
      return `Le ${recurringTask.dayOfMonth} de chaque mois`
    default:
      return 'Inconnu'
  }
}
