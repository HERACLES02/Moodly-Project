"use client"

import "./dashboard-skeleton.css"

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex flex-col">
        <main className="magazine-layout">
          <div className="magazine-content">
            {/* Hero Section Skeleton */}
            <section className="magazine-hero-wrapper">
              <div className="magazine-hero-background skeleton-hero-bg"></div>

              <div className="magazine-hero">
                {/* Left side - Title tabs */}
                <div className="magazine-hero-left">
                  <div className="magazine-toggle">
                    <p className="magazine-label skeleton-text skeleton-text-sm"></p>
                    <div className="skeleton-titles">
                      <h2 className="magazine-title skeleton-text skeleton-text-lg"></h2>
                      <h2 className="magazine-title skeleton-text skeleton-text-lg"></h2>
                    </div>
                    <div className="magazine-indicators">
                      <span className="indicator skeleton-indicator"></span>
                      <span className="indicator skeleton-indicator"></span>
                    </div>
                  </div>
                </div>

                {/* Right side - Play button */}
                <div className="magazine-hero-right">
                  <div className="magazine-featured">
                    <button className="theme-button-variant-1 skeleton-button">
                      <span></span>
                      <span></span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Grid Section Skeleton */}
            <section className="magazine-rows w-full max-w-5xl">
              <div className="skeleton-grid">
                {/* 8 Skeleton Cards */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-card-image"></div>
                    <div className="skeleton-card-content">
                      <div className="skeleton-text skeleton-text-sm"></div>
                      <div className="skeleton-text skeleton-text-xs"></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
