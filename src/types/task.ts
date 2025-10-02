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
  createdAt: Date
  updatedAt: Date
  category?: Category
  subcategory?: Subcategory | null
  recurringTask?: RecurringTask | null
}

export interface RecurringTask {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string | null
  dayOfWeek: number | null
  dayOfMonth: number | null
  frequency: 'daily' | 'weekly' | 'monthly'
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
