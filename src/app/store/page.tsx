import { Suspense } from "react"
import NavbarComponent from "@/components/NavbarComponent"
import StoreComponent from "@/components/StoreComponent"
import StoreSkeleton from "@/components/StoreSkeleton"
import { getStore } from "@/lib/storeActions"
import React from "react"

// Separate async component that fetches data INSIDE Suspense boundary
async function StoreContent() {
  const store = await getStore()

  console.log("data", store)
  return (
    <div className="w-100vh h-100vh">
      <StoreComponent store={store} />
    </div>
  )
}

const page = async () => {
  return (
    <Suspense fallback={<StoreSkeleton />}>
      <StoreContent />
    </Suspense>
  )
}

export default page
