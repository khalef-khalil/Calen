'use client'

import { useState, useEffect, useCallback } from 'react'
import Calendar from '@/components/Calendar'
import CalendarSkeleton from '@/components/CalendarSkeleton'
import { Task } from '@/types/task'
// Removed recurring task generation - now handled upfront in TaskModal

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)

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
          isCompleted: newTask.isCompleted ?? false,
          completedAt: newTask.completedAt ? new Date(newTask.completedAt) : null,
          createdAt: new Date(newTask.createdAt),
          updatedAt: new Date(newTask.updatedAt),
        }])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Task creation failed:', errorData)
        throw new Error(`Erreur lors de la création de la tâche: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      throw error
    }
  }, [])

  // Removed recurring task generation - now handled upfront in TaskModal

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
          isCompleted: task.isCompleted ?? false,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
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

  // Removed loadRecurringTasks - no longer needed

  // Charger les tâches au montage du composant
  useEffect(() => {
    loadTasks()
    
    // Set minimum loading duration
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 1000)
    
    return () => clearTimeout(minLoadingTimer)
  }, [])

  // Removed automatic recurring task generation - now handled upfront in TaskModal

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
        
        // If this was a recurring task update that affects all future instances,
        // reload all tasks to show the changes
        if (taskData.editAllFuture && taskData.recurringId) {
          await loadTasks()
        } else {
          // Otherwise, just update the single task in state
          setTasks(prev => prev.map(task => 
            task.id === id 
              ? {
                  ...updatedTask,
                  startTime: new Date(updatedTask.startTime),
                  endTime: updatedTask.endTime ? new Date(updatedTask.endTime) : null,
                  date: new Date(updatedTask.date),
                  isCompleted: updatedTask.isCompleted ?? false,
                  completedAt: updatedTask.completedAt ? new Date(updatedTask.completedAt) : null,
                  createdAt: new Date(updatedTask.createdAt),
                  updatedAt: new Date(updatedTask.updatedAt),
                }
              : task
          ))
        }
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

  if (loading || !minLoadingComplete) {
    return <CalendarSkeleton />
  }

  return (
    <div className="h-screen bg-gray-50">
      <Calendar
        tasks={tasks}
        onTaskCreate={handleTaskCreate}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  )
}