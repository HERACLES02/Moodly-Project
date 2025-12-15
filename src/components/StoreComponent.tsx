"use client"
import { Store, StoreObject } from "@/lib/fetchStore"
import React from "react"
import ItemCard from "./ItemCard"
interface StoreProps {
  store: Store
}
const StoreComponent = ({ store }: StoreProps) => {
  if (!store) {
    return
  }

  return (
    <div className="min-h-full w-full p-2 flex flex-col justify-start gap-2">
      {store.items.map((item, i) => {
        return (
          <div key={i}>
            <ItemCard
              name={item.name}
              cost={item.pointsCost}
              type="avatars"
              purchased={false}
              imagePath={item.imagePath}
            />
          </div>
        )
      })}
    </div>
  )
}

export default StoreComponent
