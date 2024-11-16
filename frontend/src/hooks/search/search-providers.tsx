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
      setError(err instanceof Error ? err : new Error('Search failed'))
    } finally {
      setLoading(false)
    }
  }

  async function searchTavily(query: string): Promise<SearchResults> {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) throw new Error('TAVILY_API_KEY is not set')

    const response = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query,
      max_results: options.maxResults || 10,
      search_depth: options.searchDepth || 'basic',
      include_domains: options.includeDomains,
      exclude_domains: options.excludeDomains
    })

    return {
      results: response.data.results,
      images: response.data.images || [],
      query,
      number_of_results: response.data.results.length
    }
  }

  async function searchSsare(query: string): Promise<SearchResults> {
    const response = await axios.get('/api/v1/search/contents', {
      params: {
        search_query: query,
        limit: options.maxResults || 20,
        skip: 0
      }
    })

    return {
      results: response.data.map((article: any): SearchResultItem => ({
        title: article.title,
        url: article.url,
        content: article.content || article.paragraphs || ''
      })),
      images: [],
      query,
      number_of_results: response.data.length
    }
  }

  async function searchSearxng(query: string): Promise<SearchResults> {
    const apiUrl = process.env.SEARXNG_API_URL
    if (!apiUrl) throw new Error('SEARXNG_API_URL is not set')

    const url = new URL(`${apiUrl}/search`)
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    url.searchParams.append('categories', 'general,images')

    if (options.searchDepth === 'advanced') {
      url.searchParams.append('engines', 'google,bing,duckduckgo,wikipedia')
    } else {
      url.searchParams.append('engines', 'google,bing')
    }

    const response = await axios.get(url.toString())
    const data = response.data

    return {
      results: data.results.map((result: any): SearchResultItem => ({
        title: result.title,
        url: result.url,
        content: result.content
      })),
      images: data.results
        .filter((result: any) => result.img_src)
        .map((result: any) => result.img_src),
      query,
      number_of_results: data.number_of_results
    }
  }

  return { search, results, loading, error }
}