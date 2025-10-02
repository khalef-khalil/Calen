'use client'

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Data availability warning skeleton */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-200 rounded animate-pulse mt-0.5"></div>
          <div className="flex-1">
            <div className="w-32 h-5 bg-blue-200 rounded animate-pulse mb-2"></div>
            <div className="w-full h-4 bg-blue-200 rounded animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-blue-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Categories Overview skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
        
        {/* Progress rings skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="group cursor-pointer">
              {/* Ring skeleton */}
              <div className="w-44 h-44 bg-gray-200 rounded-full animate-pulse mb-3"></div>
              
              {/* Additional info skeleton */}
              <div className="text-center mt-3 space-y-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats skeleton */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts section skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-5 h-5 bg-red-200 rounded animate-pulse mt-0.5"></div>
              <div className="flex-1">
                <div className="w-32 h-5 bg-red-200 rounded animate-pulse mb-2"></div>
                <div className="w-full h-4 bg-red-200 rounded animate-pulse mb-1"></div>
                <div className="w-3/4 h-4 bg-red-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
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
