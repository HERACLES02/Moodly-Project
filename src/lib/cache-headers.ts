export const CacheHeaders = {
  /**
   * User-specific data that changes occasionally
   * Examples: User profile, preferences, points
   *
   * - private: Only user's browser caches (not CDN)
   * - max-age=30: Reuse for 30 seconds
   */
  UserData: {
    "Cache-Control": "private, max-age=30",
  },

  /**
   * Static data shared by all users
   * Examples: Avatar list, theme list, available moods
   *
   * - public: CDN can cache
   * - s-maxage=3600: CDN caches 1 hour
   * - stale-while-revalidate=86400: Serve stale while fetching fresh (24 hours)
   */
  StaticData: {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  },

  /**
   * Recommendations and content that changes frequently but staleness is OK
   * Examples: Movie recommendations, song suggestions
   *
   * - public: CDN can cache
   * - s-maxage=300: CDN caches 5 minutes
   * - stale-while-revalidate=3600: Serve stale while fetching (1 hour)
   */
  Recommendations: {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
  },

  /**
   * Data that should NEVER be cached
   * Examples: Login endpoints, sensitive operations
   */
  NoCache: {
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  },
}
