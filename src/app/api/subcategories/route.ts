import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateSubcategoryData } from '@/types/category'

// GET /api/subcategories - Récupérer toutes les sous-catégories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const whereClause = categoryId 
      ? { categoryId, isActive: true }
      : { isActive: true }

    const subcategories = await prisma.subcategory.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/subcategories - Créer une nouvelle sous-catégorie
export async function POST(request: NextRequest) {
  try {
    const body: CreateSubcategoryData = await request.json()
    const { name, description, categoryId } = body

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId, isActive: true }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Get the next order value for this category
    const lastSubcategory = await prisma.subcategory.findFirst({
      where: { categoryId },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastSubcategory?.order || 0) + 1

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        description,
        categoryId,
        order: nextOrder
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la sous-catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
