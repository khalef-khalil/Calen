import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateCategoryData } from '@/types/category'

// GET /api/categories/[id] - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/categories/[id] - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body: UpdateCategoryData = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: body,
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Soft delete: set isActive to false
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false }
    })

    // Also deactivate all subcategories
    await prisma.subcategory.updateMany({
      where: { categoryId: id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
