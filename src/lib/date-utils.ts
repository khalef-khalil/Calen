import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

// Formater une date en français
export const formatDate = (date: Date, formatStr: string = 'PPP') => {
  return format(date, formatStr, { locale: fr })
}

// Obtenir les jours du mois pour l'affichage du calendrier
export const getCalendarDays = (date: Date) => {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Commencer le lundi
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = []
  let current = startDate

  while (current <= endDate) {
    days.push({
      date: new Date(current),
      isCurrentMonth: isSameMonth(current, date),
      isToday: isSameDay(current, new Date()),
    })
    current = addDays(current, 1)
  }

  return days
}

// Obtenir le mois précédent
export const getPreviousMonth = (date: Date) => {
  return subMonths(date, 1)
}

// Obtenir le mois suivant
export const getNextMonth = (date: Date) => {
  return addMonths(date, 1)
}

// Obtenir les heures de la journée (6h à 23h)
export const getDayHours = () => {
  const hours = []
  for (let i = 6; i <= 23; i++) {
    hours.push({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
    })
  }
  return hours
}

// Formater l'heure pour l'affichage
export const formatTime = (date: Date) => {
  return format(date, 'HH:mm')
}

// Créer une date avec l'heure spécifiée
export const createDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const newDate = new Date(date)
  newDate.setHours(hours, minutes, 0, 0)
  return newDate
}

// Créer une date à midi local (pour éviter les problèmes de timezone UTC+1)
export const createLocalDate = (date: Date) => {
  const localDate = new Date(date)
  localDate.setHours(12, 0, 0, 0) // Use noon instead of midnight to avoid timezone issues
  return localDate
}

// Créer une date à partir d'une chaîne de date (YYYY-MM-DD) en local
export const createLocalDateFromString = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0) // Use noon to avoid timezone issues
  return localDate
}
