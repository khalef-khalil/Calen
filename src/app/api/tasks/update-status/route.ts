import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/tasks/update-status - Update scheduled tasks to pending for the current day
export async function POST(request: NextRequest) {
  try {
    // Use host system's current date and time (no timezone conversion)
    const now = new Date()
    
    // Get the current date (YYYY-MM-DD format)
    const currentDate = now.toISOString().split('T')[0]
    console.log('Current date:', currentDate)
    
    // Create start and end of current day (00:00:00 to 23:59:59)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    
    console.log('Start of day:', startOfDay.toISOString())
    console.log('End of day:', endOfDay.toISOString())
    
    // Find all scheduled tasks that fall within today's date range
    const tasksToUpdate = await prisma.task.findMany({
      where: {
        status: 'scheduled',
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    console.log(`Found ${tasksToUpdate.length} tasks to update from scheduled to pending`)
    
    if (tasksToUpdate.length === 0) {
      return NextResponse.json({ 
        message: 'No tasks to update',
        updatedCount: 0 
      })
    }
    
    // Update all scheduled tasks to pending
    const updateResult = await prisma.task.updateMany({
      where: {
        status: 'scheduled',
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      data: {
        status: 'pending'
      }
    })
    
    console.log(`Updated ${updateResult.count} tasks from scheduled to pending`)
    
    return NextResponse.json({ 
      message: `Updated ${updateResult.count} tasks from scheduled to pending`,
      updatedCount: updateResult.count,
      systemDate: currentDate
    })
    
  } catch (error) {
    console.error('Error updating task statuses:', error)
    return NextResponse.json({ 
      error: 'Failed to update task statuses',
      details: error.message 
    }, { status: 500 })
  }
}

// GET /api/tasks/update-status - Check what tasks would be updated (dry run)
export async function GET(request: NextRequest) {
  try {
    // Use host system's current date and time (no timezone conversion)
    const now = new Date()
    
    // Get the current date (YYYY-MM-DD format)
    const currentDate = now.toISOString().split('T')[0]
    console.log('GET - Current date:', currentDate)
    
    // Create start and end of current day (00:00:00 to 23:59:59)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    
    console.log('GET - Start of day:', startOfDay.toISOString())
    console.log('GET - End of day:', endOfDay.toISOString())
    
    // Find all scheduled tasks that would be updated
    const tasksToUpdate = await prisma.task.findMany({
      where: {
        status: 'scheduled',
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        id: true,
        title: true,
        date: true,
        status: true
      }
    })
    
    return NextResponse.json({ 
      message: `Found ${tasksToUpdate.length} tasks that would be updated`,
      tasksToUpdate,
      systemDate: currentDate
    })
    
  } catch (error) {
    console.error('Error checking task statuses:', error)
    return NextResponse.json({ 
      error: 'Failed to check task statuses',
      details: error.message 
    }, { status: 500 })
  }
}
