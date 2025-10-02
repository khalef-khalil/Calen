import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - Récupérer toutes les tâches pour une période donnée
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Dates de début et de fin requises' }, { status: 400 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        recurringTask: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/tasks - Créer une nouvelle tâche
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, date, isRecurring, recurringId } = body

    if (!title || !startTime || !date) {
      return NextResponse.json({ error: 'Titre, heure de début et date requis' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        date: new Date(date),
        isRecurring,
        recurringId,
      },
      include: {
        recurringTask: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
