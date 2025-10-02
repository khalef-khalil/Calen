import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/recurring-tasks/[id] - Récupérer une tâche récurrente spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const recurringTask = await prisma.recurringTask.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    })

    if (!recurringTask) {
      return NextResponse.json({ error: 'Tâche récurrente non trouvée' }, { status: 404 })
    }

    return NextResponse.json(recurringTask)
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche récurrente:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/recurring-tasks/[id] - Mettre à jour une tâche récurrente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
        const { title, description, startTime, endTime, dayOfWeek, dayOfMonth, frequency, duration, endDate, categoryId, subcategoryId, isActive } = body

        const recurringTask = await prisma.recurringTask.update({
          where: { id },
          data: {
            title,
            description,
            startTime,
            endTime,
            dayOfWeek,
            dayOfMonth,
            frequency,
            duration,
            endDate: endDate ? new Date(endDate) : null,
            categoryId,
            subcategoryId,
            isActive,
          },
        })

    return NextResponse.json(recurringTask)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche récurrente:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/recurring-tasks/[id] - Supprimer une tâche récurrente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Désactiver la tâche récurrente au lieu de la supprimer
    await prisma.recurringTask.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Tâche récurrente désactivée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche récurrente:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
