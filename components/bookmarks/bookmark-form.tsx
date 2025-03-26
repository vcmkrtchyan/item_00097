"use client"

import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookmarkFormProps {
  bookmarkId?: string
  tripId?: string
  onCancel: () => void
  onSuccess?: () => void
}

const BOOKMARK_CATEGORIES = ["Restaurant", "Hotel", "Attraction", "Shopping", "Beach", "Museum", "Park", "Other"]

// Define the Zod schema for the form
const formSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  latitude: z.string().refine((val) => !isNaN(Number.parseFloat(val)), { message: "Latitude must be a valid number" }),
  longitude: z
    .string()
    .refine((val) => !isNaN(Number.parseFloat(val)), { message: "Longitude must be a valid number" }),
  notes: z.string(),
  category: z.string().min(1, "Category is required"),
  tripId: z.string().optional(),
})

export function BookmarkForm({ bookmarkId, tripId, onCancel, onSuccess }: BookmarkFormProps) {
  const { trips, bookmarks, addBookmark, updateBookmark } = useTravel()

  const bookmark = bookmarkId ? bookmarks.find((b) => b.id === bookmarkId) : undefined
  const isEditing = !!bookmark

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bookmark?.name || "",
      latitude: bookmark?.latitude.toString() || "",
      longitude: bookmark?.longitude.toString() || "",
      notes: bookmark?.notes || "",
      category: bookmark?.category || BOOKMARK_CATEGORIES[0],
      tripId: bookmark?.tripId || tripId || "",
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const bookmarkData = {
      name: data.name,
      latitude: Number.parseFloat(data.latitude),
      longitude: Number.parseFloat(data.longitude),
      notes: data.notes,
      category: data.category,
      tripId: data.tripId || undefined,
    }

    if (isEditing && bookmarkId) {
      updateBookmark(bookmarkId, bookmarkData)
      toast.success("Bookmark updated", {
        description: `"${data.name}" has been updated.`,
      })
    } else {
      addBookmark(bookmarkData)
      toast.success("Bookmark added", {
        description: `"${data.name}" has been added to your bookmarks.`,
      })
    }

    onSuccess?.()
    onCancel()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Location Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Eiffel Tower" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Latitude <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="48.8584" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Longitude <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="2.2945" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BOOKMARK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Why you want to visit this place" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!tripId && (
          <FormField
            control={form.control}
            name="tripId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Trip (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trip (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="none" value="none">
                      None
                    </SelectItem>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update Bookmark" : "Add Bookmark"}</Button>
        </div>
      </form>
    </Form>
  )
}

