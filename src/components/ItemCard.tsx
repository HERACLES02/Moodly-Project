import Image from "next/image"
import React from "react"

interface ItemCardProps {
  type: string
  name: string
  cost: number
  purchased: boolean
  imagePath: string
  callback?: () => void
}

const ItemCard = ({
  type,
  name,
  cost,
  purchased,
  imagePath,
  callback,
}: ItemCardProps) => {
  return (
    <div className="theme-card max-w-fit">
      <div className="relative w-45 h-40">
        <Image src={imagePath} alt="name" fill />
      </div>

      {name}
    </div>
  )
}

export default ItemCard
