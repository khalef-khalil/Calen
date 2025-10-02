'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Category, Subcategory, CreateCategoryData, CreateSubcategoryData, UpdateCategoryData, UpdateSubcategoryData } from '@/types/category'

interface CategoryContextType {
  categories: Category[]
  subcategories: Subcategory[]
  loading: boolean
  createCategory: (data: CreateCategoryData) => Promise<Category>
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  createSubcategory: (data: CreateSubcategoryData) => Promise<Subcategory>
  updateSubcategory: (id: string, data: UpdateSubcategoryData) => Promise<Subcategory>
  deleteSubcategory: (id: string) => Promise<void>
  refreshCategories: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories')
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error)
    }
  }

  useEffect(() => {
    loadCategories()
    loadSubcategories()
  }, [])

  const createCategory = async (data: CreateCategoryData): Promise<Category> => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Category creation failed:', errorData)
      throw new Error(`Erreur lors de la création de la catégorie: ${errorData.error || 'Unknown error'}`)
    }

    const newCategory = await response.json()
    setCategories(prev => [...prev, newCategory])
    return newCategory
  }

  const updateCategory = async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la catégorie')
    }

    const updatedCategory = await response.json()
    setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
    return updatedCategory
  }

  const deleteCategory = async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la catégorie')
    }

    setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  const createSubcategory = async (data: CreateSubcategoryData): Promise<Subcategory> => {
    const response = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la sous-catégorie')
    }

    const newSubcategory = await response.json()
    setSubcategories(prev => [...prev, newSubcategory])
    return newSubcategory
  }

  const updateSubcategory = async (id: string, data: UpdateSubcategoryData): Promise<Subcategory> => {
    const response = await fetch(`/api/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la sous-catégorie')
    }

    const updatedSubcategory = await response.json()
    setSubcategories(prev => prev.map(sub => sub.id === id ? updatedSubcategory : sub))
    return updatedSubcategory
  }

  const deleteSubcategory = async (id: string): Promise<void> => {
    const response = await fetch(`/api/subcategories/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la sous-catégorie')
    }

    setSubcategories(prev => prev.filter(sub => sub.id !== id))
  }

  const refreshCategories = async () => {
    await loadCategories()
    await loadSubcategories()
  }

  return (
    <CategoryContext.Provider value={{
      categories,
      subcategories,
      loading,
      createCategory,
      updateCategory,
      deleteCategory,
      createSubcategory,
      updateSubcategory,
      deleteSubcategory,
      refreshCategories
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}
