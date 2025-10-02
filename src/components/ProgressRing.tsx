'use client'

import { useEffect, useState } from 'react'

interface ProgressRingProps {
  size: number
  strokeWidth: number
  progress: number // 0-100
  color: string
  backgroundColor?: string
  label?: string
  value?: string
  icon?: string
  className?: string
  animated?: boolean
}

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = '#e5e7eb',
  label,
  value,
  icon,
  className = '',
  animated = true
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(progress)
    }
  }, [progress, animated])

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />
        
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && (
          <div className="text-2xl mb-1">{icon}</div>
        )}
        {value && (
          <div className="text-lg font-semibold text-gray-900">{value}</div>
        )}
        {label && (
          <div className="text-xs text-gray-600 text-center px-2">{label}</div>
        )}
      </div>
    </div>
  )
}
