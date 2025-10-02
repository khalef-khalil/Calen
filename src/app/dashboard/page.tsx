'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle, Settings, Calendar, ArrowRight } from 'lucide-react'
import { Task } from '@/types/category'
import { useSettings } from '@/contexts/SettingsContext'
import { useCategories } from '@/contexts/CategoryContext'
import Link from 'next/link'
import DualProgressRing from '@/components/DualProgressRing'
import { getCategoryColor, COMPLETION_COLOR } from '@/lib/category-colors'
import DashboardSkeleton from '@/components/DashboardSkeleton'

interface TimeStats {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  hours: number
  completedHours: number
  recommended: number
  percentage: number
  completionRate: number
  status: 'good' | 'warning' | 'critical'
}

export default function Dashboard() {
  const { settings } = useSettings()
  const { categories } = useCategories()
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeStats, setTimeStats] = useState<TimeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [hasEnoughData, setHasEnoughData] = useState(false)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)

  useEffect(() => {
    loadTasks()
    
    // Set minimum loading duration
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 1000)
    
    return () => clearTimeout(minLoadingTimer)
  }, [])

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
        `/api/tasks?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}`
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
        calculateTimeStats(tasksWithDates)
        checkDataAvailability(tasksWithDates)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDataAvailability = (tasks: Task[]) => {
    // Compter le nombre de jours uniques avec des tâches
    const uniqueDays = new Set(tasks.map(task => task.date.toDateString())).size
    setHasEnoughData(uniqueDays >= settings.minimumDataDays)
  }

  const calculateTimeStats = (tasks: Task[]) => {
    const now = new Date()
    const stats: TimeStats[] = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category.id)
      
      // Filter to only tasks that have passed their scheduled time
      const passedTasks = categoryTasks.filter(task => {
        const taskEndTime = task.endTime || new Date(task.startTime.getTime() + 60 * 60 * 1000) // Default 1 hour if no end time
        return taskEndTime <= now
      })
      
      // Calculate total planned hours for passed tasks only
      const totalHours = passedTasks.reduce((total, task) => {
        if (task.endTime) {
          const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
          return total + duration
        }
        return total + 1 // If no end time, count 1 hour
      }, 0)

      // Calculate completed hours for passed tasks only
      const completedHours = passedTasks
        .filter(task => task.isCompleted)
        .reduce((total, task) => {
          if (task.endTime) {
            const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
            return total + duration
          }
          return total + 1 // If no end time, count 1 hour
        }, 0)

      const recommended = category.weeklyGoal
      const percentage = recommended > 0 ? (totalHours / recommended) * 100 : 0
      const completionRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0

      let status: 'good' | 'warning' | 'critical' = 'good'
      // New logic: Alert based on completion rate, not weekly goals
      if (totalHours > 0) {
        if (completionRate < settings.completionThreshold) {
          status = 'critical'
        }
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        hours: Math.round(totalHours * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10,
        recommended,
        percentage: Math.round(percentage),
        completionRate: Math.round(completionRate),
        status
      }
    })

    setTimeStats(stats)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
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

  if (loading || !minLoadingComplete) {
    return <DashboardSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your life balance - manage categories and their subcategories</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
      </div>

      {/* Data Availability Warning */}
      {!hasEnoughData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Insufficient data</h3>
              <p className="text-sm text-blue-600 mt-1">
                You need at least {settings.minimumDataDays} days of data to see detailed analysis. 
                Start by adding some tasks in the calendar.
              </p>
              <Link
                href="/calendar"
                className="inline-flex items-center mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Go to calendar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Categories Overview - Rings Layout */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Weekly Progress</h2>
          <p className="text-gray-600">Track your life balance with these progress rings</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
          {timeStats.map((stat) => {

            return (
              <Link key={stat.categoryId} href={`/category/${stat.categoryId}`}>
                <div className="group cursor-pointer">
                  <DualProgressRing
                    size={180}
                    strokeWidth={12}
                    plannedProgress={stat.recommended > 0 ? Math.min(stat.percentage, 100) : 0}
                    completedProgress={stat.hours > 0 ? stat.completionRate : 0}
                    plannedColor={getCategoryColor(stat.categoryColor)}
                    completedColor={COMPLETION_COLOR}
                    label={stat.categoryName}
                    plannedValue={stat.recommended > 0 ? `${stat.hours}h` : '--'}
                    completedValue={stat.hours > 0 ? `${stat.completedHours}h` : ''}
                    icon={stat.categoryIcon}
                    className="group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Additional info below ring */}
                  <div className="text-center mt-3">
                    <div className="text-sm text-gray-600">
                      {stat.recommended > 0 ? `of ${stat.recommended}h` : 'Not set'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.completedHours}h completed
                    </div>
                    {stat.recommended > 0 && (
                      <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                        stat.status === 'good' ? 'bg-green-100 text-green-700' :
                        stat.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {stat.percentage}% planned
                      </div>
                    )}
                    {stat.hours > 0 && (
                      <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                        stat.completionRate >= 80 ? 'bg-green-100 text-green-700' :
                        stat.completionRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {stat.completionRate}% completed
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {timeStats.reduce((sum, stat) => sum + stat.hours, 0)}h
              </div>
              <div className="text-sm text-gray-600">Total planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {timeStats.reduce((sum, stat) => sum + stat.completedHours, 0)}h
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {timeStats.filter(stat => stat.status === 'good').length}
              </div>
              <div className="text-sm text-gray-600">Categories on track</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {timeStats.filter(stat => stat.recommended > 0).length}
              </div>
              <div className="text-sm text-gray-600">Categories configured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights - Only show if we have enough data and alerts are enabled */}
      {hasEnoughData && settings.showAlerts && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Insights et recommandations
          </h2>
          
        <div className="space-y-4">
          {timeStats.map((stat) => {
            if (stat.hours === 0) return null // Skip if no tasks allocated
            
            if (stat.status === 'critical') {
              return (
                <div key={stat.categoryId} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Low completion rate: {stat.categoryName}
                    </p>
                    <p className="text-sm text-red-600">
                      You completed only {stat.completionRate}% of your passed {stat.categoryName.toLowerCase()} tasks 
                      ({stat.completedHours}h out of {stat.hours}h that have already occurred). 
                      Your threshold is {settings.completionThreshold}%.
                    </p>
                  </div>
                </div>
              )
            }
            return null
          })}

            {timeStats.every(stat => stat.status === 'good' || stat.hours === 0) && timeStats.some(stat => stat.hours > 0) && (
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Excellent completion rates!
                  </p>
                  <p className="text-sm text-green-600">
                    All your categories are meeting the {settings.completionThreshold}% completion threshold for passed tasks.
                  </p>
                </div>
              </div>
            )}

            {timeStats.every(stat => stat.recommended === 0) && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configure your goals</h3>
                <p className="text-gray-600 mb-4">
                  Set your weekly goals for each aspect of your life to see personalized insights.
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to settings
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}