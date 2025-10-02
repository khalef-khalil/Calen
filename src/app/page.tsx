'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCategories } from '@/contexts/CategoryContext'

export default function Home() {
  const router = useRouter()
  const { categories, loading } = useCategories()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (categories.length === 0) {
        router.push('/setup')
      } else {
        router.push('/dashboard')
      }
      setIsChecking(false)
    }
  }, [categories, loading, router])

  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return null
}