"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, Plus } from "lucide-react"
import { TripCard } from "./trip-card"
import { TripForm } from "./trip-form"
import { TripDetails } from "./trip-details"

export function ItineraryManager() {
  const searchParams = useSearchParams()
  const { trips } = useTravel()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isAddingTrip, setIsAddingTrip] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Check for tripId in URL params when component mounts
  useEffect(() => {
    const tripId = searchParams.get("tripId")
    if (tripId && trips.some((trip) => trip.id === tripId)) {
      setSelectedTripId(tripId)
    }
  }, [searchParams, trips])

  // Filter trips based on active tab
  const today = new Date()
  const filteredTrips = trips.filter((trip) => {
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)

    switch (activeTab) {
      case "upcoming":
        return startDate > today
      case "past":
        return endDate < today
      case "current":
        return startDate <= today && endDate >= today
      default:
        return true
    }
  })

  // Sort trips by start date (most recent first)
  const sortedTrips = [...filteredTrips].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Itinerary</h1>
        <Button
          onClick={() => {
            setSelectedTripId(null)
            setIsAddingTrip(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {isAddingTrip ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Trip</CardTitle>
            <CardDescription>Fill in the details for your new trip</CardDescription>
          </CardHeader>
          <CardContent>
            <TripForm onCancel={() => setIsAddingTrip(false)} />
          </CardContent>
        </Card>
      ) : selectedTrip ? (
        <TripDetails trip={selectedTrip} onBack={() => setSelectedTripId(null)} />
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Trips</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {sortedTrips.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedTrips.map((trip) => (
                  <div key={trip.id} onClick={() => setSelectedTripId(trip.id)}>
                    <TripCard trip={trip} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No trips found in this category</p>
                <p className="text-muted-foreground mt-1">Use the "New Trip" button above to create one</p>
                <div className="mt-2 text-primary">
                  <ArrowUp className="h-5 w-5 mx-auto animate-bounce" />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

