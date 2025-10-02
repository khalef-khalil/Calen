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
    yellow: '#eab308',    // yellow-500
    lime: '#84cc16',      // lime-500
    emerald: '#10b981',   // emerald-500
    cyan: '#06b6d4',      // cyan-500
    sky: '#0ea5e9',       // sky-500
    violet: '#8b5cf6',    // violet-500
    fuchsia: '#d946ef',   // fuchsia-500
    rose: '#f43f5e',      // rose-500
    slate: '#64748b',     // slate-500
    gray: '#6b7280',      // gray-500
    zinc: '#71717a',      // zinc-500
    neutral: '#737373',   // neutral-500
    stone: '#78716c',     // stone-500
    amber: '#f59e0b',     // amber-500
  }
  return colorMap[colorName as keyof typeof colorMap] || '#6b7280' // gray-500
}

export const COMPLETION_COLOR = '#000000' // black
