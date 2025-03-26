"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useTravel } from "@/context/travel-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, MapPin } from "lucide-react"
import Link from "next/link"
import { TripCard } from "@/components/itinerary/trip-card"
import { ExpenseSummary } from "@/components/expenses/expense-summary"

export function Dashboard() {
  const router = useRouter()
  const { trips, expenses, bookmarks } = useTravel()

  // Get upcoming trips (sorted by start date)
  const upcomingTrips = [...trips]
    .filter((trip) => new Date(trip.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)

  // Get all current trips
  const today = new Date()
  const currentTrips = trips.filter((trip) => new Date(trip.startDate) <= today && new Date(trip.endDate) >= today)

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const navigateToTrip = (tripId: string) => {
    router.push(`/itinerary?tripId=${tripId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Trips"
          value={trips.length.toString()}
          description="Planned journeys"
          icon={Calendar}
          href="/itinerary"
        />
        <StatsCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          description="Across all trips"
          icon={DollarSign}
          href="/expenses"
        />
        <StatsCard
          title="Saved Locations"
          value={bookmarks.length.toString()}
          description="Bookmarked places"
          icon={MapPin}
          href="/bookmarks"
        />
      </div>

      {/* Current Trips */}
      {currentTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{currentTrips.length === 1 ? "Current Trip" : "Current Trips"}</CardTitle>
            <CardDescription>
              {currentTrips.length === 1
                ? "You are currently on this trip"
                : `You are currently on ${currentTrips.length} trips`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTrips.map((trip) => (
                <div key={trip.id} onClick={() => navigateToTrip(trip.id)}>
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Your next adventures</CardDescription>
          </div>
          {upcomingTrips.length > 0 && (
            <Link href="/itinerary">
              <Button variant="outline">View All</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} onClick={() => navigateToTrip(trip.id)}>
                  <TripCard trip={trip} />
                </div>
              ))}
              {upcomingTrips.length < trips.filter((trip) => new Date(trip.startDate) > today).length && (
                <Link href="/itinerary">
                  <Button variant="outline" className="w-full">
                    View All Trips
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No upcoming trips planned</p>
              <Link href="/itinerary">
                <Button>Plan a Trip</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Summary */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
            <CardDescription>Overview of your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseSummary expenses={expenses} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  href: string
}

function StatsCard({ title, value, description, icon: Icon, href }: StatsCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

