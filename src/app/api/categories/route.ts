import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateCategoryData } from '@/types/category'

// GET /api/categories - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryData = await request.json()
    const { name, description, icon, color, weeklyGoal = 0 } = body

    if (!name || !icon || !color) {
      return NextResponse.json({ error: 'Nom, icône et couleur requis' }, { status: 400 })
    }

    // Get the next order value
    const lastCategory = await prisma.category.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastCategory?.order || 0) + 1

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        color,
        weeklyGoal,
        order: nextOrder
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
