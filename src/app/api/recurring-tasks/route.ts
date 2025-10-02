import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/recurring-tasks - Create a new recurring task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      dayOfWeek, 
      dayOfMonth, 
      frequency, 
      duration, 
      endDate, 
      categoryId, 
      subcategoryId 
    } = body

    const recurringTask = await prisma.recurringTask.create({
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
      },
      include: {
        category: true,
        subcategory: true,
      },
    })

    return NextResponse.json(recurringTask)
  } catch (error) {
    console.error('Error creating recurring task:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET /api/recurring-tasks - Get all recurring tasks
export async function GET() {
  try {
    const recurringTasks = await prisma.recurringTask.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        subcategory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(recurringTasks)
  } catch (error) {
    console.error('Error fetching recurring tasks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}