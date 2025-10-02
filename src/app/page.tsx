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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}