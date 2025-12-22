// src/hooks/useUserPageData.ts
"use client"

import { useState, useEffect, useCallback } from "react"

interface CachedData<T> {
  data: T | null
  loading: boolean
  error: string | null
  timestamp: number
}

// In-memory cache that persists during the session
const dataCache = new Map<string, CachedData<any>>()

// Cache duration: 5 minutes (you can adjust this)
const CACHE_DURATION = 5 * 60 * 1000

export function useUserPageData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { skipCache?: boolean }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    const cached = dataCache.get(key)

    // Use cache if available and not expired
    if (
      !forceRefresh &&
      !options?.skipCache &&
      cached &&
      now - cached.timestamp < CACHE_DURATION
    ) {
      setData(cached.data)
      setLoading(false)
      setError(null)
      return
    }

    // Fetch fresh data
    setLoading(true)
    try {
      const result = await fetcher()
      
      // Update cache
      dataCache.set(key, {
        data: result,
        loading: false,
        error: null,
        timestamp: now,
      })

      setData(result)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      console.error(`Error fetching ${key}:`, err)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, options?.skipCache])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refresh function that bypasses cache
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Clear cache for this key
  const clearCache = useCallback(() => {
    dataCache.delete(key)
  }, [key])

  return { data, loading, error, refresh, clearCache }
}

// Clear all cache on page unload (optional)
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    dataCache.clear()
  })
}

// Export cache control functions
export const clearAllCache = () => dataCache.clear()
export const clearCacheByKey = (key: string) => dataCache.delete(key)