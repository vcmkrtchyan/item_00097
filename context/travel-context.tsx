"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

// Types
export type Trip = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  destinations: Destination[]
}

export type Destination = {
  id: string
  name: string
  startDate: string
  endDate: string
  notes: string
}

export type Expense = {
  id: string
  tripId: string
  amount: number
  category: string
  description: string
  date: string
  currency: string
}

export type Bookmark = {
  id: string
  name: string
  latitude: number
  longitude: number
  notes: string
  category: string
  tripId?: string
}

type TravelContextType = {
  trips: Trip[]
  expenses: Expense[]
  bookmarks: Bookmark[]
  addTrip: (trip: Omit<Trip, "id">) => void
  updateTrip: (id: string, trip: Partial<Trip>) => void
  deleteTrip: (id: string) => void
  addExpense: (expense: Omit<Expense, "id">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addBookmark: (bookmark: Omit<Bookmark, "id">) => void
  updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void
  deleteBookmark: (id: string) => void
  getTripById: (id: string) => Trip | undefined
  getExpensesByTripId: (tripId: string) => Expense[]
  getBookmarksByTripId: (tripId: string) => Bookmark[]
}

const TravelContext = createContext<TravelContextType | undefined>(undefined)

export function TravelProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTrips = localStorage.getItem("trips")
      const savedExpenses = localStorage.getItem("expenses")
      const savedBookmarks = localStorage.getItem("bookmarks")

      if (savedTrips) setTrips(JSON.parse(savedTrips))
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))

      setIsLoaded(true)
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("trips", JSON.stringify(trips))
      localStorage.setItem("expenses", JSON.stringify(expenses))
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    }
  }, [trips, expenses, bookmarks, isLoaded])

  // Trip functions
  const addTrip = (trip: Omit<Trip, "id">) => {
    const newTrip = { ...trip, id: crypto.randomUUID() }
    setTrips([...trips, newTrip])
  }

  const updateTrip = (id: string, updatedTrip: Partial<Trip>) => {
    setTrips(trips.map((trip) => (trip.id === id ? { ...trip, ...updatedTrip } : trip)))
  }

  const deleteTrip = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id))
    // Also delete related expenses and bookmarks
    setExpenses(expenses.filter((expense) => expense.tripId !== id))
    setBookmarks(bookmarks.map((bookmark) => (bookmark.tripId === id ? { ...bookmark, tripId: undefined } : bookmark)))
  }

  // Expense functions
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: crypto.randomUUID() }
    setExpenses([...expenses, newExpense])
  }

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(expenses.map((expense) => (expense.id === id ? { ...expense, ...updatedExpense } : expense)))
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  // Bookmark functions
  const addBookmark = (bookmark: Omit<Bookmark, "id">) => {
    const newBookmark = { ...bookmark, id: crypto.randomUUID() }
    setBookmarks([...bookmarks, newBookmark])
  }

  const updateBookmark = (id: string, updatedBookmark: Partial<Bookmark>) => {
    setBookmarks(bookmarks.map((bookmark) => (bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark)))
  }

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id))
  }

  // Helper functions
  const getTripById = (id: string) => {
    return trips.find((trip) => trip.id === id)
  }

  const getExpensesByTripId = (tripId: string) => {
    return expenses.filter((expense) => expense.tripId === tripId)
  }

  const getBookmarksByTripId = (tripId: string) => {
    return bookmarks.filter((bookmark) => bookmark.tripId === tripId)
  }

  return (
    <TravelContext.Provider
      value={{
        trips,
        expenses,
        bookmarks,
        addTrip,
        updateTrip,
        deleteTrip,
        addExpense,
        updateExpense,
        deleteExpense,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        getTripById,
        getExpensesByTripId,
        getBookmarksByTripId,
      }}
    >
      {children}
    </TravelContext.Provider>
  )
}

export function useTravel() {
  const context = useContext(TravelContext)
  if (context === undefined) {
    throw new Error("useTravel must be used within a TravelProvider")
  }
  return context
}

