'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/src/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  }))

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-screen w-screen flex flex-col bg-white dark:bg-blue-950`}>
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <main className="w-full flex-1 overflow-auto mx-auto p-4 lg:p-8 bg-white dark:bg-blue-900">
            {children}
          </main>
        </QueryClientProvider>
      </body>
    </html>
  )
}