import NavbarComponent from "@/components/NavbarComponent"
import StoreComponent from "@/components/StoreComponent"
import { getStore } from "@/lib/fetchStore"
import React from "react"

const page = async () => {
  const store = await getStore()

  console.log("data", store)
  return (
    <div className="w-100vh h-100vh">
      <StoreComponent store={store} />
    </div>
  )
}

export default page
