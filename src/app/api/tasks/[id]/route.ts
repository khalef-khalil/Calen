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
    const { title, description, startTime, endTime, date, isRecurring, recurringId } = body

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : null,
        date: date ? new Date(date) : undefined,
        isRecurring,
        recurringId,
      },
      include: {
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
