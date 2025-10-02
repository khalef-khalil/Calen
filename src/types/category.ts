export interface Category {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  weeklyGoal: number
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  subcategories?: Subcategory[]
  tasks?: Task[]
  recurringTasks?: RecurringTask[]
}

export interface Subcategory {
  id: string
  name: string
  description: string | null
  categoryId: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  category?: Category
  tasks?: Task[]
  recurringTasks?: RecurringTask[]
}

// Re-export Task and RecurringTask with updated category references
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
  subcategory?: Subcategory
  recurringTask?: RecurringTask
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
  categoryId: string
  subcategoryId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category
  subcategory?: Subcategory
  tasks?: Task[]
}

export interface CreateCategoryData {
  name: string
  description?: string
  icon: string
  color: string
  weeklyGoal?: number
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  icon?: string
  color?: string
  weeklyGoal?: number
  isActive?: boolean
  order?: number
}

export interface CreateSubcategoryData {
  name: string
  description?: string
  categoryId: string
}

export interface UpdateSubcategoryData {
  name?: string
  description?: string
  isActive?: boolean
  order?: number
}
