'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, TrendingUp, BarChart3, Plus, Edit, Trash2, Settings } from 'lucide-react'
import Link from 'next/link'
import { useCategories } from '@/contexts/CategoryContext'
import { Task, Subcategory } from '@/types/category'
import DualProgressRing from '@/components/DualProgressRing'
import { getCategoryColor, COMPLETION_COLOR } from '@/lib/category-colors'

interface CategoryStats {
  totalHours: number
  completedHours: number
  weeklyGoal: number
  percentage: number
  completionRate: number
  status: 'good' | 'warning' | 'critical'
  tasksThisWeek: Task[]
  subcategoryStats: Array<{
    subcategoryId: string
    subcategoryName: string
    hours: number
    completedHours: number
    taskCount: number
  }>
}

export default function CategoryDashboard() {
  const params = useParams()
  const categoryId = params.id as string
  const { categories, subcategories, createSubcategory, updateSubcategory, deleteSubcategory } = useCategories()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')

  const category = categories.find(cat => cat.id === categoryId)
  const categorySubcategories = subcategories.filter(sub => sub.categoryId === categoryId)

  useEffect(() => {
    if (categoryId) {
      loadTasks()
    }
  }, [categoryId])

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) return
    
    try {
      await createSubcategory({
        name: newSubcategoryName,
        description: '',
        categoryId: categoryId,
        order: categorySubcategories.length
      })
      setNewSubcategoryName('')
      setShowSubcategoryModal(false)
    } catch (error) {
      console.error('Error creating subcategory:', error)
    }
  }

  const handleUpdateSubcategory = async (subcategoryId: string, name: string) => {
    try {
      await updateSubcategory(subcategoryId, { name })
    } catch (error) {
      console.error('Error updating subcategory:', error)
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory(subcategoryId)
      } catch (error) {
        console.error('Error deleting subcategory:', error)
      }
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Lundi
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Dimanche
      endOfWeek.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/tasks?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}&categoryId=${categoryId}`
      )
      
      if (response.ok) {
        const data = await response.json()
        const tasksWithDates = data.map((task: Task) => ({
          ...task,
          startTime: new Date(task.startTime),
          endTime: task.endTime ? new Date(task.endTime) : null,
          date: new Date(task.date),
          isCompleted: task.isCompleted ?? false,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }))
        setTasks(tasksWithDates)
        calculateStats(tasksWithDates)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tasks: Task[]) => {
    if (!category) return

    const totalHours = tasks.reduce((total, task) => {
      if (task.endTime) {
        const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
        return total + duration
      }
      return total + 1 // Si pas d'heure de fin, compter 1 heure
    }, 0)

    const completedHours = tasks
      .filter(task => task.isCompleted)
      .reduce((total, task) => {
        if (task.endTime) {
          const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
          return total + duration
        }
        return total + 1
      }, 0)

    const weeklyGoal = category.weeklyGoal
    const percentage = weeklyGoal > 0 ? (totalHours / weeklyGoal) * 100 : 0
    const completionRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0

    let status: 'good' | 'warning' | 'critical' = 'good'
    if (weeklyGoal > 0) {
      if (percentage < 50) status = 'critical'
      else if (percentage < 80) status = 'warning'
    }

    // Calculate subcategory stats
    const subcategoryStats = subcategories
      .filter(sub => sub.categoryId === categoryId)
      .map(sub => {
        const subTasks = tasks.filter(task => task.subcategoryId === sub.id)
        const hours = subTasks.reduce((total, task) => {
          if (task.endTime) {
            const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
            return total + duration
          }
          return total + 1
        }, 0)
        
        const subCompletedHours = subTasks
          .filter(task => task.isCompleted)
          .reduce((total, task) => {
            if (task.endTime) {
              const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
              return total + duration
            }
            return total + 1
          }, 0)
        
        return {
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          hours: Math.round(hours * 10) / 10,
          completedHours: Math.round(subCompletedHours * 10) / 10,
          taskCount: subTasks.length
        }
      })

    setStats({
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      weeklyGoal,
      percentage: Math.round(percentage),
      completionRate: Math.round(completionRate),
      status,
      tasksThisWeek: tasks,
      subcategoryStats
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catégorie non trouvée</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSubcategoryModal(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subcategory
          </button>
          <Link
            href="/calendar"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Link>
        </div>
      </div>

      {/* Main Progress Ring */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Weekly Progress</h2>
          <p className="text-gray-600">Track your {category?.name.toLowerCase()} progress this week</p>
        </div>
        
        <div className="flex justify-center">
          <DualProgressRing
            size={280}
            strokeWidth={16}
            plannedProgress={stats ? Math.min(stats.percentage, 100) : 0}
            completedProgress={stats ? stats.completionRate : 0}
            plannedColor={getCategoryColor(category?.color || 'gray')}
            completedColor={COMPLETION_COLOR}
            label={category?.name || 'Category'}
            plannedValue={stats ? `${stats.totalHours}h` : '0h'}
            completedValue={stats ? `${stats.completedHours}h` : ''}
            icon={category?.icon}
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Additional stats below main ring */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalHours || 0}h
            </div>
            <div className="text-sm text-gray-600">Planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedHours || 0}h
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.weeklyGoal || 0}h
            </div>
            <div className="text-sm text-gray-600">Weekly goal</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              stats?.completionRate >= 80 ? 'text-green-600' :
              stats?.completionRate >= 50 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {stats?.completionRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Completion rate</div>
          </div>
        </div>
      </div>

      {/* Subcategories Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subcategories</h2>
          <button
            onClick={() => setShowSubcategoryModal(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subcategory
          </button>
        </div>

        {categorySubcategories.length > 0 ? (
          <div className="space-y-3">
            {categorySubcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600">{subcategory.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingSubcategory(subcategory)
                      setNewSubcategoryName(subcategory.name)
                      setShowSubcategoryModal(true)
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories</h3>
            <p className="text-gray-600 mb-4">
              Create subcategories to better organize your {category?.name.toLowerCase()} tasks.
            </p>
            <button
              onClick={() => setShowSubcategoryModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create first subcategory
            </button>
          </div>
        )}
      </div>

      {/* Subcategories Stats - Rings Layout */}
      {stats && stats.subcategoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Subcategory Progress</h2>
            <p className="text-gray-600">Track progress across your {category?.name.toLowerCase()} subcategories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
            {stats.subcategoryStats.map((sub) => {
              const subcategory = categorySubcategories.find(s => s.id === sub.subcategoryId)
              const subcategoryProgress = sub.hours > 0 ? Math.min((sub.hours / 10) * 100, 100) : 0 // Assuming 10h as max for subcategories
              const subcategoryCompletionRate = sub.hours > 0 ? (sub.completedHours / sub.hours) * 100 : 0
              
              return (
                <div key={sub.subcategoryId} className="group cursor-pointer">
                  <DualProgressRing
                    size={140}
                    strokeWidth={8}
                    plannedProgress={subcategoryProgress}
                    completedProgress={subcategoryCompletionRate}
                    plannedColor={getCategoryColor(category?.color || 'gray')}
                    completedColor={COMPLETION_COLOR}
                    label={sub.subcategoryName}
                    plannedValue={`${sub.hours}h`}
                    completedValue={sub.hours > 0 ? `${sub.completedHours}h` : ''}
                    className="group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Additional info below ring */}
                  <div className="text-center mt-3">
                    <div className="text-sm text-gray-600">
                      {sub.taskCount} task{sub.taskCount > 1 ? 's' : ''}
                    </div>
                    {sub.hours > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(subcategoryCompletionRate)}% completed
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tasks</h2>
        {stats && stats.tasksThisWeek.length > 0 ? (
          <div className="space-y-3">
            {stats.tasksThisWeek.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600">
                    {task.startTime.toLocaleDateString('fr-FR')} - 
                    {task.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {task.endTime && ` - ${task.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {task.subcategory?.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tasks this week</p>
            <Link
              href="/calendar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create a task
            </Link>
          </div>
        )}
      </div>

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subcategory name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSubcategoryModal(false)
                  setEditingSubcategory(null)
                  setNewSubcategoryName('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingSubcategory) {
                    handleUpdateSubcategory(editingSubcategory.id, newSubcategoryName)
                    setEditingSubcategory(null)
                  } else {
                    handleCreateSubcategory()
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingSubcategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
