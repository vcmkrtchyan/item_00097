"use client"

import { useState } from "react"
import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { BookmarkForm } from "./bookmark-form"
import { BookmarkList } from "./bookmark-list"

export function BookmarkManager() {
  const { bookmarks, trips } = useTravel()
  const [isAddingBookmark, setIsAddingBookmark] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | "all" | "unassigned">("all")

  const filteredBookmarks =
    selectedTripId === "all"
      ? bookmarks
      : selectedTripId === "unassigned"
        ? bookmarks.filter((bookmark) => !bookmark.tripId)
        : bookmarks.filter((bookmark) => bookmark.tripId === selectedTripId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <Button onClick={() => setIsAddingBookmark(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>

      {isAddingBookmark ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Bookmark</CardTitle>
            <CardDescription>Save a location for your travels</CardDescription>
          </CardHeader>
          <CardContent>
            <BookmarkForm onCancel={() => setIsAddingBookmark(false)} onSuccess={() => setIsAddingBookmark(false)} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Saved Locations</CardTitle>
            <CardDescription>Your bookmarked places</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={selectedTripId} onValueChange={setSelectedTripId}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Bookmarks</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                {trips.map((trip) => (
                  <TabsTrigger key={trip.id} value={trip.id}>
                    {trip.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={selectedTripId}>
                <BookmarkList
                  bookmarks={filteredBookmarks}
                  tripId={selectedTripId === "all" || selectedTripId === "unassigned" ? undefined : selectedTripId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

