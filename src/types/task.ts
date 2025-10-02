export interface Task {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date | null
  date: Date
  category: string
  isRecurring: boolean
  recurringId: string | null
  createdAt: Date
  updatedAt: Date
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
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
}
