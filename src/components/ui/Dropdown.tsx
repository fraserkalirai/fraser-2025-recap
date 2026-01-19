'use client'

import { useState, useRef, useEffect } from 'react'

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
  minWidth?: number
  id?: string
}

export default function Dropdown({ 
  value, 
  onChange, 
  options, 
  className = '',
  minWidth,
  id 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={dropdownRef} className="relative" style={{ minWidth: minWidth ? `${minWidth}px` : undefined }}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 20 20"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1 bg-blue-50 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
          style={{ width: buttonRef.current?.offsetWidth }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${
                option.value === value ? 'bg-blue-50 dark:bg-blue-900/50 font-semibold' : ''
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}