// components/StoreCardComponent.tsx
import Image from "next/image"
import { Check } from "lucide-react"
import React from "react"
import MoodCurrencyIcon from "./icons/MoodCurrencyIcon"

interface StoreCardProps {
  product: {
    id?: string
    name: string
    createdAt?: Date
    pointsCost: number
    imagePath: string
    isRedeemed?: boolean
  }
  onRedeem?: (productId: string) => void
}

const StoreCardComponent: React.FC<StoreCardProps> = ({
  product,
  onRedeem,
}) => {
  const { id, name, pointsCost, imagePath, isRedeemed } = product

  const buttonClassName = isRedeemed
    ? "theme-button-variant-3-no-hover opacity-60 cursor-not-allowed"
    : "theme-button-variant-2"

  return (
    /* w-48 keeps the card small and uniform in the grid */
    <div className="theme-card-variant-1-no-hover w-48 p-3 flex flex-col items-center text-center space-y-3 shrink-0">
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
      </div>

      {/* 🏷️ Product Name - Compact text */}
      <div className="w-full">
        <h3 className="theme-text-contrast text-sm font-bold truncate">
          {name}
        </h3>
      </div>

      {/* 🎁 Redeem Button - Scaled down for the small card */}
      <button
        onClick={() => !isRedeemed && id && onRedeem?.(id)}
        disabled={isRedeemed}
        className={`w-full py-2 px-2 rounded-lg transition-all duration-300 ${buttonClassName}`}
      >
        <span className="flex items-center justify-center gap-1 text-md font-bold tracking-tight">
          {isRedeemed ? (
            <>
              <Check className="w-3 h-3" />
              Redeemed
            </>
          ) : (
            <>
              Redeem With
              <span>{pointsCost}</span>
              <MoodCurrencyIcon size={25} className="shrink-0" />
            </>
          )}
        </span>
      </button>
    </div>
  )
}

export default StoreCardComponent
