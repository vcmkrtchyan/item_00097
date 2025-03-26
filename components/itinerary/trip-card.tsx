"use client"

import type { Trip } from "@/context/travel-context"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TripCardProps {
  trip: Trip
  onClick?: () => void
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const today = new Date()
  const startDate = new Date(trip.startDate)
  const endDate = new Date(trip.endDate)

  let status: "upcoming" | "current" | "past" = "upcoming"
  if (endDate < today) {
    status = "past"
  } else if (startDate <= today && endDate >= today) {
    status = "current"
  }

  const statusColors = {
    upcoming: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    current: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    past: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  }

  const statusLabels = {
    upcoming: "Upcoming",
    current: "Current",
    past: "Past",
  }

  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg truncate max-w-[70%]">{trip.title}</h3>
          <Badge className={`${statusColors[status]} whitespace-nowrap flex-shrink-0`}>{statusLabels[status]}</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          {trip.destinations.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{trip.destinations.map((d) => d.name).join(" → ")}</span>
            </div>
          )}

          {trip.description && (
            <div className="mt-2 h-10 overflow-hidden">
              <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 border-t bg-muted/50">
        <div className="text-sm truncate w-full">
          {duration} {duration === 1 ? "day" : "days"} • {trip.destinations.length}{" "}
          {trip.destinations.length === 1 ? "destination" : "destinations"}
        </div>
      </CardFooter>
    </Card>
  )
}

