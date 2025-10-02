'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, TrendingUp, BarChart3, Plus } from 'lucide-react'
import Link from 'next/link'
import { useCategories } from '@/contexts/CategoryContext'
import { Task } from '@/types/category'

interface CategoryStats {
  totalHours: number
  weeklyGoal: number
  percentage: number
  status: 'good' | 'warning' | 'critical'
  tasksThisWeek: Task[]
  subcategoryStats: Array<{
    subcategoryId: string
    subcategoryName: string
    hours: number
    taskCount: number
  }>
}

export default function CategoryDashboard() {
  const params = useParams()
  const categoryId = params.id as string
  const { categories, subcategories } = useCategories()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)

  const category = categories.find(cat => cat.id === categoryId)

  useEffect(() => {
    if (categoryId) {
      loadTasks()
    }
  }, [categoryId])

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

    const weeklyGoal = category.weeklyGoal
    const percentage = weeklyGoal > 0 ? (totalHours / weeklyGoal) * 100 : 0

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
        
        return {
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          hours: Math.round(hours * 10) / 10,
          taskCount: subTasks.length
        }
      })

    setStats({
      totalHours: Math.round(totalHours * 10) / 10,
      weeklyGoal,
      percentage: Math.round(percentage),
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
        <Link
          href="/calendar"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une tâche
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Hours */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cette semaine</h3>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.totalHours || 0}h
          </div>
          {stats && category.weeklyGoal > 0 && (
            <div className="text-sm text-gray-600">
              sur {category.weeklyGoal}h prévues
            </div>
          )}
        </div>

        {/* Progress */}
        {stats && category.weeklyGoal > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.percentage}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.status === 'good' ? 'bg-green-500' :
                  stats.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          {stats && (
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.status)}`}>
              {stats.status === 'good' && 'En bonne voie'}
              {stats.status === 'warning' && 'Attention'}
              {stats.status === 'critical' && 'Critique'}
            </div>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {stats && stats.subcategoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Par sous-catégorie</h2>
          <div className="space-y-4">
            {stats.subcategoryStats.map((sub) => (
              <div key={sub.subcategoryId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{sub.subcategoryName}</h3>
                  <p className="text-sm text-gray-600">{sub.taskCount} tâche{sub.taskCount > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{sub.hours}h</div>
                  <div className="text-sm text-gray-600">cette semaine</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tâches récentes</h2>
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
            <p className="text-gray-500 mb-4">Aucune tâche cette semaine</p>
            <Link
              href="/calendar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une tâche
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
