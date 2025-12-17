import { create } from "zustand"

interface SearchStore {
  searchQuery: string
  searchMode: "movie" | "song"
  submittedMode: "movie" | "song"
  submittedQuery: string
  setSearchQuery: (query: string) => void
  setSearchMode: (mode: "movie" | "song") => void
  setSubmittedMode: (mode: "movie" | "song") => void
  setSubmittedQuery: (query: string) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: "",
  searchMode: "movie",
  submittedMode: "movie",
  submittedQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchMode: (mode) => set({ searchMode: mode }),
  setSubmittedMode: (mode) => set({ submittedMode: mode }),
  setSubmittedQuery: (query) => set({ submittedQuery: query }),
}))
