'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Activity, 
  Dumbbell, 
  Trophy,
  Pill,
  Moon,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Biometrics', href: '/biometrics', icon: Activity },
  { name: 'Max Lifts', href: '/max-lifts', icon: Trophy },
  { name: 'Exercises', href: '/exercises', icon: Dumbbell },
  { name: 'Supplements', href: '/supplements', icon: Pill },
  { name: 'Sleep', href: '/sleep', icon: Moon },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className="shadow-lg bg-blue-50 dark:bg-blue-950">
        <div className="max-w-7xl px-4 md:px-8">
          <div className="flex justify-between h-16">
            {/* Desktop layout */}
            <div className="hidden md:flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-900 dark:text-white">Fraser 2025</h1>
              </div>
              <div className="ml-6 flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-blue-900 dark:text-white'
                          : 'text-blue-900 dark:text-white opacity-60 hover:text-blue-900 hover:dark:text-white hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex items-center justify-between w-full">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-blue-900 dark:text-white p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-3xl font-bold text-blue-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
                {navItems.find(item => item.href === pathname)?.name || 'Fraser 2025'}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-blue-900">
          <div className="flex justify-between items-center h-16 px-4">
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-900 dark:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
              Fraser 2025
            </h1>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] space-y-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col items-center text-center transition-colors ${
                    isActive
                      ? 'text-blue-900 dark:text-white'
                      : 'text-blue-900 dark:text-white opacity-60 hover:opacity-100'
                  }`}
                >
                  <Icon className="w-7 h-7 mb-2" />
                  <span className="text-lg font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}