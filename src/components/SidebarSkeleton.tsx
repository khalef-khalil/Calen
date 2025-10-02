'use client'

export default function SidebarSkeleton() {
  return (
    <>
      {/* Mobile menu button skeleton */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Desktop sidebar skeleton */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-gray-900 pt-5 pb-4 overflow-y-auto">
          {/* Header skeleton - Calen */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="ml-3">
              <div className="w-24 h-5 bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="w-32 h-3 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Navigation skeleton */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {/* NAVIGATION label skeleton */}
            <div className="px-2 mb-4">
              <div className="w-20 h-3 bg-gray-600 rounded animate-pulse mb-3"></div>
            </div>

            {/* Dashboard link skeleton */}
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md mb-2">
              <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
              <div className="ml-3 w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Calendar link skeleton (active state) */}
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-800 mb-2">
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="ml-3 w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="ml-auto w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>

            {/* Settings link skeleton */}
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6">
              <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
              <div className="ml-3 w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Categories section skeleton */}
            <div className="px-2 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-20 h-3 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                {/* Category items skeleton */}
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                    <div className="ml-3 flex-1">
                      <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom info box skeleton */}
            <div className="px-2 mt-auto">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="w-full h-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar skeleton */}
      <div className="lg:hidden fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Header skeleton */}
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="ml-3">
                <div className="w-24 h-5 bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="w-32 h-3 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <nav className="px-2 space-y-1">
              {/* NAVIGATION label */}
              <div className="mb-4">
                <div className="w-20 h-3 bg-gray-600 rounded animate-pulse mb-3"></div>
              </div>
              
              {/* Navigation items */}
              <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md mb-2">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                <div className="ml-3 w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-800 mb-2">
                <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                <div className="ml-3 w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="ml-auto w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                <div className="ml-3 w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>

              {/* Categories section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-20 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex items-center px-2 py-2 text-sm font-medium rounded-md">
                      <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                      <div className="ml-3 flex-1">
                        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
                        <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom info box */}
              <div className="mt-auto">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="w-full h-12 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
