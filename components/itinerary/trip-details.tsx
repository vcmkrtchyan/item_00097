"use client"

import { useState } from "react"
import { useTravel, type Trip } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Edit, MapPin, Trash2 } from "lucide-react"
import { TripForm } from "./trip-form"
import { formatDate } from "@/lib/utils"
import { ExpenseList } from "../expenses/expense-list"
import { ExpenseForm } from "../expenses/expense-form"
import { BookmarkList } from "../bookmarks/bookmark-list"
import { BookmarkForm } from "../bookmarks/bookmark-form"
import { TravelFlowDiagram } from "../travel-flow-diagram"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TripDetailsProps {
  trip: Trip
  onBack: () => void
}

export function TripDetails({ trip, onBack }: TripDetailsProps) {
  const { deleteTrip, getExpensesByTripId, getBookmarksByTripId } = useTravel()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddingBookmark, setIsAddingBookmark] = useState(false)

  const expenses = getExpensesByTripId(trip.id)
  const bookmarks = getBookmarksByTripId(trip.id)

  const handleDelete = () => {
    deleteTrip(trip.id)
    onBack()
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Trip</CardTitle>
          <CardDescription>Update your trip details</CardDescription>
        </CardHeader>
        <CardContent>
          <TripForm trip={trip} onCancel={() => setIsEditing(false)} onSuccess={() => setIsEditing(false)} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trips
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this trip and all associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{trip.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center mt-2">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trip.description && <p className="text-muted-foreground mb-4">{trip.description}</p>}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {trip.destinations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Travel Flow</CardTitle>
                <CardDescription>Visualization of your trip</CardDescription>
              </CardHeader>
              <CardContent>
                <TravelFlowDiagram trip={trip} />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Destinations</CardTitle>
                <CardDescription>Places you'll visit</CardDescription>
              </CardHeader>
              <CardContent>
                {trip.destinations.length > 0 ? (
                  <div className="space-y-4">
                    {trip.destinations.map((destination, index) => (
                      <div key={destination.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{destination.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(destination.startDate)} - {formatDate(destination.endDate)}
                            </p>
                          </div>
                          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                        </div>
                        {destination.notes && <p className="text-sm mt-2">{destination.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No destinations added</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  Manage Destinations
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
                <CardDescription>Key information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Duration</h4>
                  <p>
                    {Math.ceil(
                      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Total Expenses</h4>
                  <p>${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Saved Locations</h4>
                  <p>{bookmarks.length} bookmarks</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Destinations</CardTitle>
              <CardDescription>Places you'll visit on this trip</CardDescription>
            </CardHeader>
            <CardContent>
              {trip.destinations.length > 0 ? (
                <div className="space-y-6">
                  {trip.destinations.map((destination, index) => (
                    <div key={destination.id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{destination.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(destination.startDate)} - {formatDate(destination.endDate)}
                          </p>
                        </div>
                      </div>
                      {destination.notes && (
                        <div className="ml-11">
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          <p className="text-sm">{destination.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground mb-4">No destinations added yet</p>
                  <Button onClick={() => setIsEditing(true)}>Add Destinations</Button>
                </div>
              )}
            </CardContent>
            {trip.destinations.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  Edit Destinations
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          {isAddingExpense ? (
            <Card>
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
                <CardDescription>Record a new expense for this trip</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm
                  tripId={trip.id}
                  onCancel={() => setIsAddingExpense(false)}
                  onSuccess={() => setIsAddingExpense(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Track your spending for this trip</CardDescription>
                </div>
                <Button onClick={() => setIsAddingExpense(true)}>Add Expense</Button>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={expenses} tripId={trip.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          {isAddingBookmark ? (
            <Card>
              <CardHeader>
                <CardTitle>Add Bookmark</CardTitle>
                <CardDescription>Save a location for this trip</CardDescription>
              </CardHeader>
              <CardContent>
                <BookmarkForm
                  tripId={trip.id}
                  onCancel={() => setIsAddingBookmark(false)}
                  onSuccess={() => setIsAddingBookmark(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bookmarks</CardTitle>
                  <CardDescription>Saved locations for this trip</CardDescription>
                </div>
                <Button onClick={() => setIsAddingBookmark(true)}>Add Bookmark</Button>
              </CardHeader>
              <CardContent>
                <BookmarkList bookmarks={bookmarks} tripId={trip.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

