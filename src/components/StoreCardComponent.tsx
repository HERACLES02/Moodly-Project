"use client"
import Image from "next/image"

import React, { useEffect, useState } from "react"
import MoodCurrencyIcon from "./icons/MoodCurrencyIcon"
import { Spinner } from "./ui/spinner"
import { User } from "@/contexts/UserContext"
import { Store } from "@/lib/storeActions"

interface StoreCardProps {
  user: User
  itemType: "avatar" | "theme"
  product: {
    id?: string
    name: string
    createdAt?: Date
    pointsCost: number
    imagePath: string
    isRedeemed?: boolean
  }
  onRedeem: (
    itemId: string | undefined,
    cost: number,
    itemType: "avatar" | "theme",

    setLoading: (b: boolean) => void,
  ) => void
  onApply: (
    itemId: string,
    type: "avatar" | "theme",
    setLoading: (b: boolean) => void,
  ) => Promise<void>
  store: Store
}

const StoreCardComponent: React.FC<StoreCardProps> = ({
  user,
  product,
  onRedeem,
  itemType,
  onApply,
  store,
}) => {
  const { id, name, pointsCost, imagePath, isRedeemed } = product

  const [loading, setLoading] = useState<boolean>(false)
  const [applied, setApplied] = useState<boolean>(() => {
    if (itemType === "theme") {
      return user?.currentTheme === id
    }

    return user?.currentAvatar?.name === name
  })

  useEffect(() => {
    if (itemType === "avatar") {
      setApplied(user?.currentAvatarId === id)
    }
    if (itemType === "theme") {
      setApplied(user?.currentTheme === id)
    }
  }, [user?.currentTheme, user?.currentAvatarId])

  const buttonClassName = isRedeemed
    ? "theme-button-variant-3-no-hover opacity-60 cursor-not-allowed"
    : "theme-button-variant-2"

  return (
    /* w-48 keeps the card small and uniform in the grid */
    <div className="theme-card-variant-1-no-hover rounded-b-none w-48 p-0 border-b-0 flex flex-col items-center text-center shrink-0 overflow-hidden">
      {/* 🖼️ Square Image Container */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white shadow-inner">
        <Image
          src={imagePath}
          alt={name}
          fill
          priority={false}
          style={{ objectFit: "cover" }}
          className="block"
        />

        <div className="absolute bottom-4 right-0 bg-black/80 backdrop-blur-lg border-y border-l border-white/20 px-4 py-2 rounded-l-md shadow-2xl">
          <h3 className="text-white text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
            {name}
          </h3>
        </div>
      </div>

      {/* 💰 Floating Points Badge (Top Left) */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
        <span className="text-[11px] font-bold text-white tracking-tight">
          {pointsCost}
        </span>
        <MoodCurrencyIcon size={24} className="text-[var(--accent)]" />
      </div>

      {/* 🏷️ Product Name - Compact text */}

      {/* 🎁 Redeem Button - Scaled down for the small card */}
      {isRedeemed && applied ? (
        <div className="w-full py-2 px-2 h-fit rounded-lg  transition-all duration-300 overflow-hidden theme-button-variant-3-no-hover">
          Applied
        </div>
      ) : isRedeemed ? (
        <button
          className="w-full py-2 px-2 h-fit rounded-lg  transition-all duration-300 overflow-hidden theme-button flex justify-center items-center"
          disabled={applied}
          onClick={() => id && onApply(id, itemType, setLoading)}
        >
          {loading ? <Spinner /> : "Apply"}
        </button>
      ) : (
        <button
          onClick={() => onRedeem(id, pointsCost, itemType, setLoading)}
          disabled={isRedeemed}
          className={`w-full py-2 px-2 rounded-lg transition-all duration-300 overflow-hidden h-fit ${buttonClassName}`}
        >
          <span className="flex items-center justify-center gap-1 text-md font-black tracking-tight min-h-5">
            {!loading ? (
              <>Redeem</>
            ) : (
              <>
                <Spinner />
              </>
            )}
          </span>
        </button>
      )}
    </div>
  )
}

export default StoreCardComponent
