// components/StoreComponent.tsx
"use client"
import { Store } from "@/lib/fetchStore"
import React from "react"
import StoreCardComponent from "./StoreCardComponent"

interface StoreProps {
  store: Store
}

const StoreComponent = ({ store }: StoreProps) => {
  if (!store) return null

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-10 overflow-x-hidden">
      {/* ✨ Minimalist Hero Section */}
      <header className="relative w-full pt-16 pb-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract Background Glow (Uses your accent color variable) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-primary)] opacity-10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-center">
            <span className="theme-text-contrast">Moodly</span>
            <span className="theme-text-accent ml-2 drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
              Store
            </span>
          </h1>

          <div className="flex items-center gap-4 w-full justify-center">
            <div className="h-[1px] flex-1 max-w-[50px] bg-gradient-to-r from-transparent to-[var(--text-muted)] opacity-30" />

            <div className="h-[1px] flex-1 max-w-[50px] bg-gradient-to-l from-transparent to-[var(--text-muted)] opacity-30" />
          </div>
        </div>
      </header>

      {/* Themes Section */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="theme-text-accent text-sm font-black uppercase tracking-widest">
            Exclusive Themes
          </h2>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
          <StoreCardComponent
            product={{
              id: "t1",
              name: "Vangogh",
              pointsCost: 10,
              imagePath: "/images/themes/vangogh/vangogh_bg.jpg",
            }}
          />
          <StoreCardComponent
            product={{
              id: "t2",
              name: "Cat",
              pointsCost: 10,
              imagePath: "/images/themes/cat/cat_bg.jpg",
            }}
          />
        </div>
      </section>

      {/* Avatars Section */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="theme-text-accent text-sm font-black uppercase tracking-widest">
            Avatars
          </h2>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
          {store.items.map((item, i) => (
            <StoreCardComponent
              key={item.id || i}
              product={item}
              onRedeem={(id) => console.log("Redeeming:", id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default StoreComponent
