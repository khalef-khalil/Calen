'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle, Settings, Calendar, ArrowRight } from 'lucide-react'
import { Task } from '@/types/category'
import { useSettings } from '@/contexts/SettingsContext'
import { useCategories } from '@/contexts/CategoryContext'
import Link from 'next/link'

interface TimeStats {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  hours: number
  recommended: number
  percentage: number
  status: 'good' | 'warning' | 'critical'
}

export default function Dashboard() {
  const { settings } = useSettings()
  const { categories } = useCategories()
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeStats, setTimeStats] = useState<TimeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [hasEnoughData, setHasEnoughData] = useState(false)

  useEffect(() => {
    loadTasks()
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
    const stats: TimeStats[] = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category.id)
      const totalHours = categoryTasks.reduce((total, task) => {
        if (task.endTime) {
          const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
          return total + duration
        }
        return total + 1 // Si pas d'heure de fin, compter 1 heure
      }, 0)

      const recommended = category.weeklyGoal
      const percentage = recommended > 0 ? (totalHours / recommended) * 100 : 0

      let status: 'good' | 'warning' | 'critical' = 'good'
      if (recommended > 0) {
        if (percentage < 50) status = 'critical'
        else if (percentage < 80) status = 'warning'
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        hours: Math.round(totalHours * 10) / 10,
        recommended,
        percentage: Math.round(percentage),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Vue d'ensemble de votre équilibre de vie</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </Link>
      </div>

      {/* Data Availability Warning */}
      {!hasEnoughData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Données insuffisantes</h3>
              <p className="text-sm text-blue-600 mt-1">
                Vous avez besoin d'au moins {settings.minimumDataDays} jours de données pour voir les analyses détaillées. 
                Commencez par ajouter quelques tâches dans le calendrier.
              </p>
              <Link
                href="/calendar"
                className="inline-flex items-center mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Aller au calendrier
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeStats.map((stat) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            orange: 'text-orange-600 bg-orange-100',
            pink: 'text-pink-600 bg-pink-100',
            red: 'text-red-600 bg-red-100',
            indigo: 'text-indigo-600 bg-indigo-100',
            teal: 'text-teal-600 bg-teal-100',
          }
          
          return (
            <Link key={stat.categoryId} href={`/category/${stat.categoryId}`}>
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{stat.categoryIcon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {stat.categoryName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stat.recommended > 0 ? `${stat.recommended}h/semaine` : 'Non configuré'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stat.recommended > 0 && getStatusIcon(stat.status)}
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cette semaine</span>
                    <span className="font-medium">
                      {stat.hours}h {stat.recommended > 0 && `/ ${stat.recommended}h`}
                    </span>
                  </div>

                  {stat.recommended > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            stat.status === 'good' ? 'bg-green-500' :
                            stat.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(stat.status)}`}>
                          {stat.percentage}% de l'objectif
                        </span>
                        <span className="text-sm text-gray-500">
                          {stat.hours < stat.recommended ? `-${Math.round(stat.recommended - stat.hours)}h` : `+${Math.round(stat.hours - stat.recommended)}h`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">
                        <Link href="/settings" className="text-blue-600 hover:text-blue-800">
                          Configurez vos objectifs
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
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
            if (stat.recommended === 0) return null // Skip if no goal set
            
            if (stat.status === 'critical') {
              return (
                <div key={stat.categoryId} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Attention: {stat.categoryName} négligé
                    </p>
                    <p className="text-sm text-red-600">
                      Vous n'avez consacré que {stat.hours}h à {stat.categoryName.toLowerCase()} cette semaine. 
                      L'objectif recommandé est de {stat.recommended}h.
                    </p>
                  </div>
                </div>
              )
            } else if (stat.status === 'warning') {
              return (
                <div key={stat.categoryId} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Attention: {stat.categoryName} sous-représenté
                    </p>
                    <p className="text-sm text-yellow-600">
                      Vous êtes à {stat.percentage}% de votre objectif pour {stat.categoryName.toLowerCase()}. 
                      Essayez d'ajouter {Math.ceil(stat.recommended - stat.hours)}h cette semaine.
                    </p>
                  </div>
                </div>
              )
            }
            return null
          })}

            {timeStats.every(stat => stat.status === 'good' || stat.recommended === 0) && timeStats.some(stat => stat.recommended > 0) && (
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Excellent équilibre de vie !
                  </p>
                  <p className="text-sm text-green-600">
                    Vous maintenez un bon équilibre entre tous les aspects de votre vie cette semaine.
                  </p>
                </div>
              </div>
            )}

            {timeStats.every(stat => stat.recommended === 0) && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configurez vos objectifs</h3>
                <p className="text-gray-600 mb-4">
                  Définissez vos objectifs hebdomadaires pour chaque aspect de votre vie pour voir des insights personnalisés.
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Aller aux paramètres
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}