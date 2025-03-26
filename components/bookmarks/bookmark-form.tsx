"use client"

import type React from "react"

import { useState } from "react"
import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookmarkFormProps {
  bookmarkId?: string
  tripId?: string
  onCancel: () => void
  onSuccess?: () => void
}

const BOOKMARK_CATEGORIES = ["Restaurant", "Hotel", "Attraction", "Shopping", "Beach", "Museum", "Park", "Other"]

export function BookmarkForm({ bookmarkId, tripId, onCancel, onSuccess }: BookmarkFormProps) {
  const { trips, bookmarks, addBookmark, updateBookmark } = useTravel()

  const bookmark = bookmarkId ? bookmarks.find((b) => b.id === bookmarkId) : undefined
  const isEditing = !!bookmark

  const [formData, setFormData] = useState({
    name: bookmark?.name || "",
    latitude: bookmark?.latitude.toString() || "",
    longitude: bookmark?.longitude.toString() || "",
    notes: bookmark?.notes || "",
    category: bookmark?.category || BOOKMARK_CATEGORIES[0],
    tripId: bookmark?.tripId || tripId || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const bookmarkData = {
      name: formData.name,
      latitude: Number.parseFloat(formData.latitude),
      longitude: Number.parseFloat(formData.longitude),
      notes: formData.notes,
      category: formData.category,
      tripId: formData.tripId || undefined,
    }

    if (isEditing && bookmarkId) {
      updateBookmark(bookmarkId, bookmarkData)
    } else {
      addBookmark(bookmarkData)
    }

    onSuccess?.()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Location Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Eiffel Tower"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="48.8584"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="2.2945"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          name="category"
          value={formData.category}
          onValueChange={(value) => handleSelectChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {BOOKMARK_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Why you want to visit this place"
          rows={3}
        />
      </div>

      {!tripId && (
        <div className="grid gap-2">
          <Label htmlFor="tripId">Associated Trip (Optional)</Label>
          <Select name="tripId" value={formData.tripId} onValueChange={(value) => handleSelectChange("tripId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a trip (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update Bookmark" : "Add Bookmark"}</Button>
      </div>
    </form>
  )
}

