import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Récupérer une tâche spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        recurringTask: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Mettre à jour une tâche
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, date, categoryId, subcategoryId, isRecurring, recurringId, isCompleted, completedAt, status, editAllFuture } = body

    // First, get the current task to check if it's a recurring task
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { recurringTask: true }
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    // If this is a recurring task and editAllFuture is true, update the recurring task template
    if (currentTask.recurringId && editAllFuture) {
      const { frequency, dayOfWeek, dayOfMonth, duration, endDate } = body
      
      // Update the recurring task template with all recurring settings
      await prisma.recurringTask.update({
        where: { id: currentTask.recurringId },
        data: {
          title,
          description,
          startTime: startTime ? new Date(startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
          endTime: endTime ? new Date(endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
          categoryId,
          subcategoryId,
          frequency: frequency || 'daily',
          dayOfWeek: dayOfWeek || 1,
          dayOfMonth: dayOfMonth || 1,
          duration: duration || 12,
          endDate: endDate ? new Date(endDate) : null,
        }
      })

      // Update all future instances of this recurring task
      const futureDate = new Date(date || currentTask.date)
      futureDate.setHours(0, 0, 0, 0)
      
      await prisma.task.updateMany({
        where: {
          recurringId: currentTask.recurringId,
          date: {
            gte: futureDate
          }
        },
        data: {
          title,
          description,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : null,
          categoryId,
          subcategoryId,
          status: status || 'scheduled',
          isCompleted: status === 'completed',
          completedAt: status === 'completed' ? new Date() : null,
        }
      })
    }

    // Update the current task instance
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : null,
        date: date ? new Date(date) : undefined,
        categoryId,
        subcategoryId,
        isRecurring,
        recurringId,
        status: status || 'scheduled',
        isCompleted: status === 'completed',
        completedAt: status === 'completed' ? new Date() : null,
      },
      include: {
        category: true,
        subcategory: true,
        recurringTask: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Supprimer une tâche
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tâche supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
