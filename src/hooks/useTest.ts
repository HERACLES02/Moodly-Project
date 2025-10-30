import { useEffect, useState } from "react"

export function useTest() {
  console.log("🧪 useTest hook is running")

  const [testValue, setTestValue] = useState("initial")

  useEffect(() => {
    console.log("🚀 useTest useEffect is running!")
    setTestValue("updated")
  }, [])

  console.log("🧪 useTest returning:", testValue)
  return { testValue }
}
