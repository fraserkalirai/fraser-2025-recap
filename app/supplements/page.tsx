'use client'

import { useState, useEffect, useMemo } from 'react'
import { Supplement } from '@/src/types'
import { fetchSupplements } from '@/src/lib/queries'
import PageHeader from '@/src/components/ui/PageHeader'
import BaseCard from '@/src/components/ui/BaseCard'
import NoDataCard from '@/src/components/ui/NoDataCard'

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)

  useEffect(() => {
    async function loadSupplements() {
      try {
        const data = await fetchSupplements()
        setSupplements(data)
        
        if (data.length > 0) {
          const uniqueTypes = [...new Set(data.map(item => item.type))]
          setActiveTab(uniqueTypes[0])
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadSupplements()
  }, [])

  const types = useMemo(() => 
    [...new Set(supplements.map(item => item.type))],
    [supplements]
  )

  const filteredSupplements = useMemo(() => 
    supplements.filter(item => item.type === activeTab),
    [supplements, activeTab]
  )

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader header={"Supplements"} />
      
      <div className="flex-shrink-0">
        {isLoading ? (
          <nav className="flex flex-wrap gap-2">
              <div className="h-8 sm:h-10 w-20 sm:w-32 animate-pulse"/>
          </nav>
        ) : (
          <nav className="flex flex-wrap">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 md:px-6 pb-2 md:pb-3 font-medium text-sm md:text-lg transition-all ${
                  activeTab === type
                    ? 'text-blue-900 dark:text-white'
                    : 'text-blue-900 dark:text-white opacity-60 hover:text-blue-900 hover:dark:text-white hover:opacity-100'
                }`}
              >
                {type}
              </button>
            ))}
          </nav>
        )}
      </div>
      
      <BaseCard type='table' isLoading={isLoading} isError={isError}>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full overflow-auto flex-1">
            <thead className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-950 border-b-2 border-blue-900/60 dark:border-white/60">
              <tr>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-sm font-medium sm:font-semibold text-blue-900 dark:text-white uppercase tracking-wider">
                  Supplement
                </th>
                <th className="pr-2 sm:pr-6 py-3 sm:py-4 text-left text-[10px] sm:text-sm font-medium sm:font-semibold text-blue-900 dark:text-white uppercase tracking-wider">
                  Dosage
                </th>
                <th className="pr-2 sm:pr-6 py-3 sm:py-4 text-left text-[10px] sm:text-sm font-medium sm:font-semibold text-blue-900 dark:text-white uppercase tracking-wider">
                  Increased
                </th>
                <th className="pr-2 sm:pr-6 py-3 sm:py-4 text-left text-[10px] sm:text-sm font-medium sm:font-semibold text-blue-900 dark:text-white uppercase tracking-wider">
                  Increase Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/60 dark:divide-white/60">
              {filteredSupplements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 sm:px-6 py-4 sm:py-8 h-32">
                    <NoDataCard />
                  </td>
                </tr>
              ) : (
                filteredSupplements.map((item) => (
                  <tr key={item.id} className="transition-colors text-blue-900 dark:text-white">
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[9px] sm:text-sm font-medium">
                      {item.supplement}
                    </td>
                    <td className="pr-2 sm:pr-6 py-3 sm:py-4 whitespace-nowrap text-[9px] sm:text-sm">
                      {item.dosage}
                    </td>
                    <td className="pr-2 sm:pr-6 py-3 sm:py-4 whitespace-nowrap text-[9px] sm:text-sm">
                      {item.increasedDosage || '—'}
                    </td>
                    <td className="pr-2 sm:pr-6 py-3 sm:py-4 whitespace-nowrap text-[9px] sm:text-sm">
                      {item.dateOfIncrease 
                        ? new Date(item.dateOfIncrease).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  )
}