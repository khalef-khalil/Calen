'use client'

export default function CalendarSkeleton() {
  return (
    <div className="h-screen bg-gray-50">
      {/* Calendar main area skeleton - full width */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header skeleton */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center space-x-4">
              {/* View toggle skeleton */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <div className="w-20 h-8 bg-white rounded-md shadow-sm animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded-md animate-pulse ml-1"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Calendar content skeleton */}
          <div className="p-6">
            {/* Days of week header skeleton */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="p-3 text-center">
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => {
                const isCurrentMonth = index >= 0 && index < 35
                const isToday = index === 1 // Simulate October 2nd being highlighted
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[120px] p-2 border border-gray-200 rounded ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-4 rounded animate-pulse ${
                        isToday ? 'bg-blue-200' : 'bg-gray-200'
                      }`}></div>
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
