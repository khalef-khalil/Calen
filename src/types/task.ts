import { Category, Subcategory } from './category'

export interface Task {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date | null
  date: Date
  categoryId: string
  subcategoryId: string | null
  isRecurring: boolean
  recurringId: string | null
  isCompleted: boolean
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  category?: Category
  subcategory?: Subcategory | null
  recurringTask?: RecurringTask | null
  editAllFuture?: boolean // For editing recurring tasks
}

export interface RecurringTask {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string | null
  dayOfWeek: number | null
  dayOfMonth: number | null
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  duration: number | null // Duration in months (1, 3, 6, 12)
  endDate: Date | null // Calculated end date based on duration
  categoryId: string
  subcategoryId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category
  subcategory?: Subcategory | null
  tasks?: Task[]
}
