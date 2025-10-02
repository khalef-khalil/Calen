'use client'

export default function CategorySkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Progress ring section skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Stats below ring skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories section skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Progress bar skeleton */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                <div className="w-1/3 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent tasks section skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions section skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
