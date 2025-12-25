import { Button } from "@/components/ui/button"
import React from "react"

const page = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10 w-full max-w-3xl p-5 justify-center items-center">
        <h1 className="text-3xl font-bold italic">
          Watch with 3,412 others who are restless
        </h1>
        <div className="flex flex-1 gap-2 ">
          <Button className="theme-button-variant-3" size={"lg"}>
            Yes
          </Button>
          <Button size={"lg"} className="theme-button-variant-1">
            No
          </Button>
        </div>
      </div>
    </div>
  )
}

export default page
