"use client"

import "./store-skeleton.css"

export default function StoreSkeleton() {
  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-10 overflow-x-hidden">
      {/* Hero Section Skeleton */}
      <header className="relative w-full pt-16 pb-8 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="skeleton-title skeleton-text-xl"></div>
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="h-[1px] flex-1 max-w-[50px] bg-gradient-to-r from-transparent to-[var(--text-muted)] opacity-30" />
            <div className="h-[1px] flex-1 max-w-[50px] bg-gradient-to-l from-transparent to-[var(--text-muted)] opacity-30" />
          </div>
        </div>
      </header>

      {/* Themes Section Skeleton */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="skeleton-section-title"></div>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        {/* Grid of skeleton cards */}
        <div className="store-skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="store-skeleton-card">
              <div className="store-skeleton-card-image"></div>
              <div className="store-skeleton-card-button"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Avatars Section Skeleton */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="skeleton-section-title"></div>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        {/* Grid of skeleton cards */}
        <div className="store-skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="store-skeleton-card">
              <div className="store-skeleton-card-image"></div>
              <div className="store-skeleton-card-button"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
