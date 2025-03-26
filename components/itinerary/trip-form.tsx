"use client"

import { useState } from "react"
import { useTravel, type Trip, type Destination } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { format } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format as formatDate, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface TripFormProps {
  trip?: Trip
  onCancel: () => void
  onSuccess?: () => void
}

// Define the Zod schema for the form
const formSchema = z
  .object({
    title: z.string().min(1, "Trip title is required"),
    description: z.string(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
  })
  .refine(
    (data) => {
      // Validate that end date is after start date
      return data.endDate >= data.startDate
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

export function TripForm({ trip, onCancel, onSuccess }: TripFormProps) {
  const { addTrip, updateTrip } = useTravel()
  const isEditing = !!trip
  const today = startOfDay(new Date())

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: trip?.title || "",
      description: trip?.description || "",
      startDate: trip ? new Date(trip.startDate) : today,
      endDate: trip ? new Date(trip.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // Track destinations separately to handle adding/removing
  const [destinations, setDestinations] = useState<Destination[]>(
    trip?.destinations.map((dest) => ({
      ...dest,
      startDate: dest.startDate,
      endDate: dest.endDate,
    })) || [],
  )

  // Track destination errors
  const [destinationErrors, setDestinationErrors] = useState<{
    [key: number]: { name?: string; startDate?: string; endDate?: string }
  }>({})

  const validateDestinations = () => {
    const formValues = form.getValues()
    const errors: {
      [key: number]: { name?: string; startDate?: string; endDate?: string }
    } = {}
    let hasErrors = false

    destinations.forEach((destination, index) => {
      const destErrors: { name?: string; startDate?: string; endDate?: string } = {}

      if (!destination.name) {
        destErrors.name = "Location name is required"
        hasErrors = true
      }

      // Check if destination start date is within trip dates
      if (new Date(destination.startDate) < formValues.startDate) {
        destErrors.startDate = "Arrival date cannot be before trip start date"
        hasErrors = true
      }

      // Check if destination end date is within trip dates
      if (new Date(destination.endDate) > formValues.endDate) {
        destErrors.endDate = "Departure date cannot be after trip end date"
        hasErrors = true
      }

      // Check if destination end date is after start date
      if (new Date(destination.endDate) < new Date(destination.startDate)) {
        destErrors.endDate = "Departure date must be after arrival date"
        hasErrors = true
      }

      if (Object.keys(destErrors).length > 0) {
        errors[index] = destErrors
      }
    })

    setDestinationErrors(errors)
    return !hasErrors
  }

  const addDestination = () => {
    const formValues = form.getValues()
    const lastDestEndDate =
      destinations.length > 0 ? destinations[destinations.length - 1].endDate : format(formValues.startDate)

    const newDestination: Destination = {
      id: crypto.randomUUID(),
      name: "",
      startDate: lastDestEndDate,
      endDate: format(formValues.endDate),
      notes: "",
    }

    setDestinations([...destinations, newDestination])
  }

  const removeDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index)
    setDestinations(newDestinations)

    // Update errors after removing a destination
    const newErrors = { ...destinationErrors }
    delete newErrors[index]

    // Adjust indices for destinations after the removed one
    const adjustedErrors: {
      [key: number]: { name?: string; startDate?: string; endDate?: string }
    } = {}

    Object.keys(newErrors).forEach((key) => {
      const keyNum = Number.parseInt(key)
      if (keyNum > index) {
        adjustedErrors[keyNum - 1] = newErrors[keyNum]
      } else {
        adjustedErrors[keyNum] = newErrors[keyNum]
      }
    })

    setDestinationErrors(adjustedErrors)
  }

  const updateDestination = (index: number, field: keyof Destination, value: string) => {
    const newDestinations = [...destinations]
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: value,
    }
    setDestinations(newDestinations)

    // Validate after change
    setTimeout(validateDestinations, 0)
  }

  const updateDestinationDate = (index: number, field: "startDate" | "endDate", date: Date) => {
    const newDestinations = [...destinations]
    newDestinations[index] = {
      ...newDestinations[index],
      [field]: format(date),
    }
    setDestinations(newDestinations)

    // Validate after change
    setTimeout(validateDestinations, 0)
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Validate destinations before submitting
    if (!validateDestinations() || destinations.length === 0) {
      if (destinations.length === 0) {
        toast.error("Error", {
          description: "Please add at least one destination.",
        })
      }
      return
    }

    const formData = {
      ...data,
      startDate: format(data.startDate),
      endDate: format(data.endDate),
      destinations,
    }

    if (isEditing && trip) {
      updateTrip(trip.id, formData)
      toast.success("Trip updated", {
        description: `"${data.title}" has been successfully updated.`,
      })
    } else {
      addTrip(formData)
      toast.success("Trip created", {
        description: `"${data.title}" has been successfully created.`,
      })
    }

    onSuccess?.()
    onCancel()
  }

  // Get the current trip start and end dates from the form
  const tripStartDate = form.watch("startDate")
  const tripEndDate = form.watch("endDate")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trip Title <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Summer Vacation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="A brief description of your trip" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Start Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? formatDate(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    End Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? formatDate(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < tripStartDate || date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Destinations</h3>
            <Button type="button" variant="outline" size="sm" onClick={addDestination}>
              <Plus className="mr-2 h-4 w-4" />
              Add Destination
            </Button>
          </div>

          {destinations.length === 0 ? (
            <div className="text-center py-4 border rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">No destinations added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {destinations.map((destination, index) => {
                // For each destination, determine the min and max dates
                // Min date is either the trip start date or the previous destination's end date
                const prevDestEndDate = index > 0 ? new Date(destinations[index - 1].endDate) : null

                const minArrivalDate =
                  prevDestEndDate && prevDestEndDate > tripStartDate ? prevDestEndDate : tripStartDate

                // Max date for arrival is either the current destination's end date or the trip end date
                const maxArrivalDate =
                  new Date(destination.endDate) < tripEndDate ? new Date(destination.endDate) : tripEndDate

                // Min date for departure is the current destination's start date
                const minDepartureDate = new Date(destination.startDate)

                // Max date for departure is either the next destination's start date or the trip end date
                const nextDestStartDate =
                  index < destinations.length - 1 ? new Date(destinations[index + 1].startDate) : null

                const maxDepartureDate =
                  nextDestStartDate && nextDestStartDate < tripEndDate ? nextDestStartDate : tripEndDate

                return (
                  <Card key={destination.id}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Destination {index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDestination(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`destination-${index}-name`}>
                          Location Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`destination-${index}-name`}
                          value={destination.name}
                          onChange={(e) => updateDestination(index, "name", e.target.value)}
                          placeholder="Paris, France"
                          className={destinationErrors[index]?.name ? "border-destructive" : ""}
                        />
                        {destinationErrors[index]?.name && (
                          <p className="text-sm text-destructive">{destinationErrors[index].name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid gap-2 w-full">
                          <Label>
                            Arrival <span className="text-destructive">*</span>
                          </Label>
                          <DateTimePicker
                            date={new Date(destination.startDate)}
                            setDate={(date) => updateDestinationDate(index, "startDate", date)}
                            disabled={false}
                            minDate={minArrivalDate < today ? today : minArrivalDate}
                            maxDate={maxArrivalDate}
                          />
                          {destinationErrors[index]?.startDate && (
                            <p className="text-sm text-destructive">{destinationErrors[index].startDate}</p>
                          )}
                        </div>

                        <div className="grid gap-2 w-full">
                          <Label>
                            Departure <span className="text-destructive">*</span>
                          </Label>
                          <DateTimePicker
                            date={new Date(destination.endDate)}
                            setDate={(date) => updateDestinationDate(index, "endDate", date)}
                            disabled={false}
                            minDate={minDepartureDate < today ? today : minDepartureDate}
                            maxDate={maxDepartureDate}
                          />
                          {destinationErrors[index]?.endDate && (
                            <p className="text-sm text-destructive">{destinationErrors[index].endDate}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`destination-${index}-notes`}>Notes</Label>
                        <Textarea
                          id={`destination-${index}-notes`}
                          value={destination.notes}
                          onChange={(e) => updateDestination(index, "notes", e.target.value)}
                          placeholder="Activities, accommodations, etc."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update Trip" : "Create Trip"}</Button>
        </div>
      </form>
    </Form>
  )
}

