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
    console.log('Received recurring task data:', body)
    
    const { title, description, startTime, endTime, dayOfWeek, dayOfMonth, frequency, duration, endDate, categoryId, subcategoryId } = body

    if (!title || !startTime || !frequency || !categoryId) {
      console.log('Validation failed:', { title: !!title, startTime: !!startTime, frequency: !!frequency, categoryId: !!categoryId })
      return NextResponse.json({ error: 'Title, start time, frequency and category required' }, { status: 400 })
    }

    console.log('Creating recurring task in database...')
    const recurringTask = await prisma.recurringTask.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        dayOfWeek,
        dayOfMonth,
        frequency,
        duration: duration || 12, // Default to 1 year
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        subcategoryId,
      },
    })

    console.log('Recurring task created successfully:', recurringTask.id)
    return NextResponse.json(recurringTask, { status: 201 })
  } catch (error) {
    console.error('Error creating recurring task:', error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
