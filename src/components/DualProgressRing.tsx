'use client'

import { useEffect, useState } from 'react'

interface DualProgressRingProps {
  size: number
  strokeWidth: number
  plannedProgress: number // 0-100 (how much of allocated time is planned)
  completedProgress: number // 0-100 (how much of planned time is completed)
  plannedColor: string
  completedColor: string
  backgroundColor?: string
  label?: string
  plannedValue?: string
  completedValue?: string
  icon?: string
  className?: string
  animated?: boolean
}

export default function DualProgressRing({
  size,
  strokeWidth,
  plannedProgress,
  completedProgress,
  plannedColor,
  completedColor,
  backgroundColor = '#e5e7eb',
  label,
  plannedValue,
  completedValue,
  icon,
  className = '',
  animated = true
}: DualProgressRingProps) {
  const [animatedPlanned, setAnimatedPlanned] = useState(0)
  const [animatedCompleted, setAnimatedCompleted] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  
  // Outer ring (planned) - slightly larger radius
  const outerRadius = radius + strokeWidth * 0.2
  const outerCircumference = outerRadius * 2 * Math.PI
  const outerStrokeDasharray = outerCircumference
  const outerStrokeDashoffset = outerCircumference - (animatedPlanned / 100) * outerCircumference
  
  // Inner ring (completed) - slightly smaller radius
  // Completion should be scaled by the planned progress
  const scaledCompletedProgress = (animatedPlanned / 100) * (animatedCompleted / 100) * 100
  const innerRadius = radius - strokeWidth * 0.2
  const innerCircumference = innerRadius * 2 * Math.PI
  const innerStrokeDasharray = innerCircumference
  const innerStrokeDashoffset = innerCircumference - (scaledCompletedProgress / 100) * innerCircumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedPlanned(plannedProgress)
        setAnimatedCompleted(completedProgress)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedPlanned(plannedProgress)
      setAnimatedCompleted(completedProgress)
    }
  }, [plannedProgress, completedProgress, animated])

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
          className="opacity-20"
        />
        
        {/* Outer ring - Planned progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          stroke={plannedColor}
            strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeDasharray={outerStrokeDasharray}
          strokeDashoffset={outerStrokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))'
          }}
        />
        
        {/* Inner ring - Completed progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          stroke={completedColor}
            strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeDasharray={innerStrokeDasharray}
          strokeDashoffset={innerStrokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && (
          <div className="text-2xl mb-1">{icon}</div>
        )}
        {plannedValue && (
          <div className="text-lg font-semibold text-gray-900">{plannedValue}</div>
        )}
        {completedValue && (
          <div className="text-sm text-gray-600">{completedValue}</div>
        )}
        {label && (
          <div className="text-xs text-gray-600 text-center px-2 mt-1">{label}</div>
        )}
      </div>
    </div>
  )
}
