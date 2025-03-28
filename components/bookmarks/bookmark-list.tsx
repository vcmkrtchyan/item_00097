"use client"

import { useState } from "react"
import { useTravel, type Bookmark } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, MapPin, Trash2 } from "lucide-react"
import { BookmarkForm } from "./bookmark-form"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  tripId?: string
}

export function BookmarkList({ bookmarks, tripId }: BookmarkListProps) {
  const { deleteBookmark, trips } = useTravel()
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null)
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null)

  // Group bookmarks by category
  const bookmarksByCategory = bookmarks.reduce(
    (acc, bookmark) => {
      const { category } = bookmark
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(bookmark)
      return acc
    },
    {} as Record<string, Bookmark[]>,
  )

  // Sort categories alphabetically
  const sortedCategories = Object.keys(bookmarksByCategory).sort()

  const getTripTitle = (tripId?: string) => {
    if (!tripId) return "Unassigned"
    const trip = trips.find((t) => t.id === tripId)
    return trip ? trip.title : "Unknown Trip"
  }

  const handleDeleteBookmark = () => {
    if (bookmarkToDelete) {
      const bookmark = bookmarks.find((b) => b.id === bookmarkToDelete)
      if (bookmark) {
        deleteBookmark(bookmarkToDelete)
        toast.success("Bookmark deleted", {
          description: `"${bookmark.name}" has been deleted.`,
        })
      }
      setBookmarkToDelete(null)
    }
  }

  if (editingBookmarkId) {
    const bookmark = bookmarks.find((b) => b.id === editingBookmarkId)
    if (!bookmark) return null

    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Edit Bookmark</h3>
        <BookmarkForm
          bookmarkId={editingBookmarkId}
          tripId={tripId}
          onCancel={() => setEditingBookmarkId(null)}
          onSuccess={() => setEditingBookmarkId(null)}
        />
      </Card>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No bookmarks saved yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="font-medium text-lg mb-3">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {bookmarksByCategory[category].map((bookmark) => (
              <Card key={bookmark.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{bookmark.name}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {bookmark.latitude.toFixed(4)}, {bookmark.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingBookmarkId(bookmark.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setBookmarkToDelete(bookmark.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {bookmark.notes && <p className="text-sm mt-2">{bookmark.notes}</p>}

                    {!tripId && bookmark.tripId && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {getTripTitle(bookmark.tripId)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!bookmarkToDelete}
        onClose={() => setBookmarkToDelete(null)}
        onConfirm={handleDeleteBookmark}
        title="Delete Bookmark"
        description="Are you sure you want to delete this bookmark? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

