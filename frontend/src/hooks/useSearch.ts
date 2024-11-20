import { useState } from 'react'
import axios from 'axios'
import { SearchResults, SearchResultItem } from '@/lib/types'

export type SearchProvider = 'tavily' | 'ssare' | 'searxng'
export type SearchDepth = 'basic' | 'advanced'

interface SearchOptions {
  provider: SearchProvider
  maxResults?: number
  searchDepth?: SearchDepth
  includeDomains?: string[]
  excludeDomains?: string[]
}

interface UseSearchReturn {
  search: (query: string) => Promise<void>
  results: SearchResults | null
  loading: boolean
  error: Error | null
}

export function useSearch(options: SearchOptions): UseSearchReturn {
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let searchResults: SearchResults

      switch (options.provider) {
        case 'tavily':
          searchResults = await searchTavily(query)
          break
        case 'ssare':
          searchResults = await searchSsare(query)
          break
        case 'searxng':
          searchResults = await searchSearxng(query)
          break
        default:
          throw new Error(`Unsupported search provider: ${options.provider}`)
      }

      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err : new Error('Search failed'))
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of the search implementation remains the same ...

  return { search, results, loading, error }
} 