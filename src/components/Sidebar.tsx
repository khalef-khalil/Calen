'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  BarChart3, 
  Menu,
  X,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useCategories } from '@/contexts/CategoryContext'
import SidebarSkeleton from './SidebarSkeleton'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)
  const pathname = usePathname()
  const { categories, loading } = useCategories()

  // Set minimum loading duration
  useEffect(() => {
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 1000)
    
    return () => clearTimeout(minLoadingTimer)
  }, [])

  // Show skeleton while loading
  if (loading || !minLoadingComplete) {
    return <SidebarSkeleton />
  }

  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-300 hover:bg-gray-800 hover:text-blue-200',
      green: 'text-green-300 hover:bg-gray-800 hover:text-green-200',
      purple: 'text-purple-300 hover:bg-gray-800 hover:text-purple-200',
      orange: 'text-orange-300 hover:bg-gray-800 hover:text-orange-200',
      pink: 'text-pink-300 hover:bg-gray-800 hover:text-pink-200',
      red: 'text-red-300 hover:bg-gray-800 hover:text-red-200',
      indigo: 'text-indigo-300 hover:bg-gray-800 hover:text-indigo-200',
      teal: 'text-teal-300 hover:bg-gray-800 hover:text-teal-200',
      yellow: 'text-yellow-300 hover:bg-gray-800 hover:text-yellow-200',
      lime: 'text-lime-300 hover:bg-gray-800 hover:text-lime-200',
      emerald: 'text-emerald-300 hover:bg-gray-800 hover:text-emerald-200',
      cyan: 'text-cyan-300 hover:bg-gray-800 hover:text-cyan-200',
      sky: 'text-sky-300 hover:bg-gray-800 hover:text-sky-200',
      violet: 'text-violet-300 hover:bg-gray-800 hover:text-violet-200',
      fuchsia: 'text-fuchsia-300 hover:bg-gray-800 hover:text-fuchsia-200',
      rose: 'text-rose-300 hover:bg-gray-800 hover:text-rose-200',
      slate: 'text-slate-300 hover:bg-gray-800 hover:text-slate-200',
      gray: 'text-gray-300 hover:bg-gray-800 hover:text-gray-200',
      zinc: 'text-zinc-300 hover:bg-gray-800 hover:text-zinc-200',
      neutral: 'text-neutral-300 hover:bg-gray-800 hover:text-neutral-200',
      stone: 'text-stone-300 hover:bg-gray-800 hover:text-stone-200',
      amber: 'text-amber-300 hover:bg-gray-800 hover:text-amber-200',
    }
    return colorMap[color as keyof typeof colorMap] || 'text-gray-300 hover:bg-gray-800 hover:text-gray-200'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-5 border-b border-gray-800">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Life Manager</h1>
              <p className="text-xs text-gray-400">Life Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Navigation
              </h3>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group mb-2
                      ${isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    {item.name}
                    {isActive && <ArrowRight className="w-4 h-4 ml-auto" />}
                  </Link>
                )
              })}
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3 px-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Categories
                </h3>
                <Link
                  href="/setup"
                  className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
                  title="Add a category"
                >
                  <Plus className="w-4 h-4 text-gray-400 hover:text-white" />
                </Link>
              </div>
              
              {categories.length > 0 ? (
                <div>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group mb-2
                        ${getCategoryColorClasses(category.color)}
                      `}
                    >
                      <span className="text-lg mr-3">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{category.name}</div>
                        {category.weeklyGoal > 0 && (
                          <div className="text-xs opacity-75">
                            {category.weeklyGoal}h/week
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-center">
                  <div className="text-gray-500 mb-2">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No categories</p>
                  </div>
                  <Link
                    href="/setup"
                    className="inline-flex items-center px-3 py-2 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create categories
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-800">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                Manage categories from the main dashboard. Each category manages its own subcategories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}