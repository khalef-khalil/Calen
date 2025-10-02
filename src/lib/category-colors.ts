export const getCategoryColor = (colorName: string): string => {
  const colorMap = {
    blue: '#3b82f6',      // blue-500
    green: '#10b981',     // green-500
    purple: '#8b5cf6',    // purple-500
    orange: '#f59e0b',    // orange-500
    pink: '#ec4899',      // pink-500
    red: '#ef4444',       // red-500
    indigo: '#6366f1',    // indigo-500
    teal: '#14b8a6',      // teal-500
  }
  return colorMap[colorName as keyof typeof colorMap] || '#6b7280' // gray-500
}

export const COMPLETION_COLOR = '#000000' // black
