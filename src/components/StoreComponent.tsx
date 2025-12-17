// components/StoreComponent.tsx
"use client"
import {
  applySelection,
  redeemItem,
  Store,
  StoreObject,
} from "@/lib/storeActions"
import React, { useState } from "react"
import StoreCardComponent from "./StoreCardComponent"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"
import { taintObjectReference } from "next/dist/server/app-render/entry-base"
import { objectEnumValues } from "@prisma/client/runtime/library"
import { useTheme } from "next-themes"
import { STORE_EXTRAS } from "@/lib/storeItems"

const themes = [
  {
    id: "vangogh",
    name: "Vangogh",
    pointsCost: 10,
    imagePath: "/images/themes/vangogh/vangogh_bg.jpg",
  },
  {
    id: "cat",
    name: "Cat",
    pointsCost: 10,
    imagePath: "/images/themes/cat/cat_bg.jpg",
  },
]

interface StoreProps {
  store: Store
}

const StoreComponent = ({ store }: StoreProps) => {
  const { user, updateUserAvatar, updateUserPoints, updateUserTheme } =
    useUser()
  const { setTheme } = useTheme()

  if (!store || !user) return null

  const onRedeem = async (
    itemId: string | undefined,
    cost: number,
    itemType: "avatar" | "theme",

    setLoading: (b: boolean) => void,
  ) => {
    console.log("Redeeming")
    setLoading(true)
    try {
      if (!user?.id || !itemId) return
      const response = await redeemItem(user?.id, itemId, itemType, cost)
      console.log("Redeemed")

      if (response.success && user?.points) {
        updateUserPoints(user?.points - cost)
      } else {
        console.log("Redeem Failed")
        console.log(response)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false)
    }
  }
  const getIsRedeemed = (theme: string) => {
    return store?.user?.unlockedThemes?.includes(theme)
  }
  const onApply = async (
    itemId: string,
    type: "avatar" | "theme",
    setLoading: (b: boolean) => void,
  ) => {
    if (!user?.id) return
    setLoading(true)

    try {
      const response = await applySelection(user.id, itemId, type)

      if (response.success) {
        if (type === "theme") {
          // 🚀 THE SPECIAL TRANSITION
          // Check if the browser supports the View Transition API

          // Fallback for browsers that don't support it (still slow via CSS)
          updateUserTheme(itemId)
          setTheme(itemId)
          toast.success("Theme Applied")
        } else {
          updateUserAvatar(itemId)
          toast.success("Avatar Applied")
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-10 overflow-x-hidden">
      {/* ✨ Minimalist Hero Section */}
      <header className="relative w-full pt-16 pb-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract Background Glow (Uses your accent color variable) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-primary)] opacity-10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-center">
            <span className="theme-text-foreground">Moodly</span>
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
          {themes.map((t, i) => {
            const item = { ...t, isRedeemed: getIsRedeemed(t.id) }
            return (
              <StoreCardComponent
                key={i}
                product={item}
                itemType="theme"
                onRedeem={onRedeem}
                user={user}
                onApply={onApply}
                store={store}
              />
            )
          })}
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
          {store.items.map((item, i) => {
            return (
              <StoreCardComponent
                key={item.id || i}
                product={item}
                onRedeem={onRedeem}
                itemType="avatar"
                user={user}
                onApply={onApply}
                store={store}
              />
            )
          })}
        </div>
      </section>
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="theme-text-accent text-sm font-black uppercase tracking-widest">
            Badges
          </h2>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
          {STORE_EXTRAS.badges.map((e, i) => {
            return (
              <StoreCardComponent
                key={e.id || i}
                product={e}
                onRedeem={onRedeem}
                itemType="avatar"
                user={user}
                onApply={onApply}
                store={store}
              />
            )
          })}
        </div>
      </section>
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="theme-text-accent text-sm font-black uppercase tracking-widest">
            Stickers
          </h2>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
          {STORE_EXTRAS.stickers.map((e, i) => {
            return (
              <StoreCardComponent
                key={e.id || i}
                product={e}
                onRedeem={onRedeem}
                itemType="avatar"
                user={user}
                onApply={onApply}
                store={store}
              />
            )
          })}
        </div>
      </section>
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="theme-text-accent text-sm font-black uppercase tracking-widest">
            Filters
          </h2>
          <div className="h-[2px] flex-1 ml-4 bg-[var(--glass-border)] opacity-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
          {STORE_EXTRAS.filters.map((e, i) => {
            return (
              <StoreCardComponent
                key={e.id || i}
                product={e}
                onRedeem={onRedeem}
                itemType="avatar"
                user={user}
                onApply={onApply}
                store={store}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default StoreComponent
