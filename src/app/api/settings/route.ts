import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET settings (create default if doesn't exist)
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          completionThresholdLow: 50,
          completionThresholdHigh: 100,
        },
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update settings
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Get existing settings or create new
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          completionThresholdLow: data.completionThresholdLow ?? 50,
          completionThresholdHigh: data.completionThresholdHigh ?? 100,
        },
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          completionThresholdLow: data.completionThresholdLow,
          completionThresholdHigh: data.completionThresholdHigh,
        },
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

