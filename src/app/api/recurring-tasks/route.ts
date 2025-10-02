import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/recurring-tasks - Récupérer toutes les tâches récurrentes
export async function GET() {
  try {
    const recurringTasks = await prisma.recurringTask.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(recurringTasks)
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches récurrentes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/recurring-tasks - Créer une nouvelle tâche récurrente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, dayOfWeek, dayOfMonth, frequency, categoryId, subcategoryId } = body

    if (!title || !startTime || !frequency || !categoryId) {
      return NextResponse.json({ error: 'Titre, heure de début, fréquence et catégorie requis' }, { status: 400 })
    }

    const recurringTask = await prisma.recurringTask.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        dayOfWeek,
        dayOfMonth,
        frequency,
        categoryId,
        subcategoryId,
      },
    })

    return NextResponse.json(recurringTask, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la tâche récurrente:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
