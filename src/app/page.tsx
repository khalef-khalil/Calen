'use client'

import { useState, useEffect, useCallback } from 'react'
import Calendar from '@/components/Calendar'
import { Task, RecurringTask } from '@/types/task'
import { generateRecurringTasks } from '@/lib/recurring-tasks'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les tâches au montage du composant
  useEffect(() => {
    loadTasks()
    loadRecurringTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const response = await fetch(
        `/api/tasks?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      )
      
      if (response.ok) {
        const data = await response.json()
        // Convertir les dates string en objets Date
        const tasksWithDates = data.map((task: Task) => ({
          ...task,
          startTime: new Date(task.startTime),
          endTime: task.endTime ? new Date(task.endTime) : null,
          date: new Date(task.date),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }))
        setTasks(tasksWithDates)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecurringTasks = async () => {
    try {
      const response = await fetch('/api/recurring-tasks')
      if (response.ok) {
        const data = await response.json()
        setRecurringTasks(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches récurrentes:', error)
    }
  }

  const handleTaskCreate = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks(prev => [...prev, {
          ...newTask,
          startTime: new Date(newTask.startTime),
          endTime: newTask.endTime ? new Date(newTask.endTime) : null,
          date: new Date(newTask.date),
          createdAt: new Date(newTask.createdAt),
          updatedAt: new Date(newTask.updatedAt),
        }])
      } else {
        throw new Error('Erreur lors de la création de la tâche')
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      throw error
    }
  }, [])

  const generateRecurringTasksForMonth = useCallback(async () => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // Générer les tâches récurrentes pour le mois
      const generatedTasks = []
      for (const recurringTask of recurringTasks) {
        const tasks = generateRecurringTasks(recurringTask, startOfMonth, endOfMonth)
        generatedTasks.push(...tasks)
      }

      // Créer les tâches générées en base
      for (const taskData of generatedTasks) {
        // Vérifier si la tâche n'existe pas déjà
        const existingTask = tasks.find(t => 
          t.recurringId === taskData.recurringId && 
          t.date.toDateString() === taskData.date.toDateString()
        )

        if (!existingTask) {
          await handleTaskCreate(taskData)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération des tâches récurrentes:', error)
    }
  }, [recurringTasks, tasks, handleTaskCreate])

  // Générer les tâches récurrentes quand les tâches récurrentes changent
  useEffect(() => {
    if (recurringTasks.length > 0) {
      generateRecurringTasksForMonth()
    }
  }, [recurringTasks, generateRecurringTasksForMonth])

  const handleTaskUpdate = async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prev => prev.map(task => 
          task.id === id 
            ? {
                ...updatedTask,
                startTime: new Date(updatedTask.startTime),
                endTime: updatedTask.endTime ? new Date(updatedTask.endTime) : null,
                date: new Date(updatedTask.date),
                createdAt: new Date(updatedTask.createdAt),
                updatedAt: new Date(updatedTask.updatedAt),
              }
            : task
        ))
      } else {
        throw new Error('Erreur lors de la mise à jour de la tâche')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      throw error
    }
  }

  const handleTaskDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression de la tâche')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
      <div className="relative z-10">
        <Calendar
          tasks={tasks}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      </div>
    </div>
  )
}