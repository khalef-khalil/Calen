import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateSubcategoryData } from '@/types/category'

// GET /api/subcategories/[id] - Récupérer une sous-catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!subcategory) {
      return NextResponse.json({ error: 'Sous-catégorie non trouvée' }, { status: 404 })
    }

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/subcategories/[id] - Mettre à jour une sous-catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body: UpdateSubcategoryData = await request.json()

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: body,
      include: {
        category: true
      }
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/subcategories/[id] - Supprimer une sous-catégorie (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Soft delete: set isActive to false
    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Sous-catégorie supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la sous-catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
