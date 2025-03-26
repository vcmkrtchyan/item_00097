"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTravel, type Trip, type Destination } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { format } from "@/lib/utils"

interface TripFormProps {
  trip?: Trip
  onCancel: () => void
  onSuccess?: () => void
}

export function TripForm({ trip, onCancel, onSuccess }: TripFormProps) {
  const { addTrip, updateTrip } = useTravel()
  const isEditing = !!trip

  const [formData, setFormData] = useState<{
    title: string
    description: string
    startDate: string
    endDate: string
    destinations: Destination[]
  }>({
    title: trip?.title || "",
    description: trip?.description || "",
    startDate: trip?.startDate || format(new Date()),
    endDate: trip?.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    destinations: trip?.destinations || [],
  })

  const [errors, setErrors] = useState<{
    endDate?: string
    destinations?: Record<number, { startDate?: string; endDate?: string }>
  }>({})

  // Validate trip dates
  useEffect(() => {
    const newErrors = { ...errors }

    // Check if end date is after start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date"
    } else {
      delete newErrors.endDate
    }

    setErrors(newErrors)
  }, [formData.startDate, formData.endDate])

  // Validate destination dates when trip dates change
  useEffect(() => {
    validateDestinationDates()
  }, [formData.startDate, formData.endDate, formData.destinations.length])

  const validateDestinationDates = () => {
    const newErrors = { ...errors }
    const destinationErrors: Record<number, { startDate?: string; endDate?: string }> = {}
    let hasErrors = false

    formData.destinations.forEach((destination, index) => {
      const destErrors: { startDate?: string; endDate?: string } = {}

      // Check if destination start date is within trip dates
      if (new Date(destination.startDate) < new Date(formData.startDate)) {
        destErrors.startDate = "Arrival date cannot be before trip start date"
        hasErrors = true
      }

      // Check if destination end date is within trip dates
      if (new Date(destination.endDate) > new Date(formData.endDate)) {
        destErrors.endDate = "Departure date cannot be after trip end date"
        hasErrors = true
      }

      // Check if destination end date is after start date
      if (new Date(destination.endDate) < new Date(destination.startDate)) {
        destErrors.endDate = "Departure date must be after arrival date"
        hasErrors = true
      }

      if (Object.keys(destErrors).length > 0) {
        destinationErrors[index] = destErrors
      }
    })

    if (hasErrors) {
      newErrors.destinations = destinationErrors
    } else {
      delete newErrors.destinations
    }

    setErrors(newErrors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDestinationChange = (index: number, field: keyof Destination, value: string) => {
    setFormData((prev) => {
      const updatedDestinations = [...prev.destinations]
      updatedDestinations[index] = {
        ...updatedDestinations[index],
        [field]: value,
      }
      return { ...prev, destinations: updatedDestinations }
    })

    // Validate after change
    setTimeout(validateDestinationDates, 0)
  }

  const addDestination = () => {
    const lastDestEndDate =
      formData.destinations.length > 0
        ? formData.destinations[formData.destinations.length - 1].endDate
        : formData.startDate

    const newDestination: Destination = {
      id: crypto.randomUUID(),
      name: "",
      startDate: lastDestEndDate,
      endDate: formData.endDate,
      notes: "",
    }

    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, newDestination],
    }))
  }

  const removeDestination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index),
    }))

    // Update errors after removing a destination
    if (errors.destinations) {
      const newDestErrors = { ...errors.destinations }
      delete newDestErrors[index]

      // Adjust indices for destinations after the removed one
      const adjustedErrors: Record<number, { startDate?: string; endDate?: string }> = {}
      Object.keys(newDestErrors).forEach((key) => {
        const keyNum = Number.parseInt(key)
        if (keyNum > index) {
          adjustedErrors[keyNum - 1] = newDestErrors[keyNum]
        } else {
          adjustedErrors[keyNum] = newDestErrors[keyNum]
        }
      })

      setErrors((prev) => ({
        ...prev,
        destinations: Object.keys(adjustedErrors).length > 0 ? adjustedErrors : undefined,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check for errors before submitting
    if (errors.endDate || errors.destinations) {
      return
    }

    if (isEditing && trip) {
      updateTrip(trip.id, formData)
    } else {
      addTrip(formData)
    }

    onSuccess?.()
    onCancel()
  }

  // Check if form has any errors
  const hasErrors = !!errors.endDate || !!errors.destinations

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Trip Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summer Vacation"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief description of your trip"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={errors.endDate ? "border-destructive" : ""}
            />
            {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
          </div>
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

        {formData.destinations.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">No destinations added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.destinations.map((destination, index) => (
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
                    <Label htmlFor={`destination-${index}-name`}>Location Name</Label>
                    <Input
                      id={`destination-${index}-name`}
                      value={destination.name}
                      onChange={(e) => handleDestinationChange(index, "name", e.target.value)}
                      placeholder="Paris, France"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`destination-${index}-startDate`}>Arrival</Label>
                      <Input
                        id={`destination-${index}-startDate`}
                        type="date"
                        value={destination.startDate}
                        onChange={(e) => handleDestinationChange(index, "startDate", e.target.value)}
                        min={formData.startDate}
                        max={formData.endDate}
                        required
                        className={errors.destinations?.[index]?.startDate ? "border-destructive" : ""}
                      />
                      {errors.destinations?.[index]?.startDate && (
                        <p className="text-sm text-destructive">{errors.destinations[index].startDate}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`destination-${index}-endDate`}>Departure</Label>
                      <Input
                        id={`destination-${index}-endDate`}
                        type="date"
                        value={destination.endDate}
                        onChange={(e) => handleDestinationChange(index, "endDate", e.target.value)}
                        min={destination.startDate}
                        max={formData.endDate}
                        required
                        className={errors.destinations?.[index]?.endDate ? "border-destructive" : ""}
                      />
                      {errors.destinations?.[index]?.endDate && (
                        <p className="text-sm text-destructive">{errors.destinations[index].endDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`destination-${index}-notes`}>Notes</Label>
                    <Textarea
                      id={`destination-${index}-notes`}
                      value={destination.notes}
                      onChange={(e) => handleDestinationChange(index, "notes", e.target.value)}
                      placeholder="Activities, accommodations, etc."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please fix the errors above before submitting the form.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={hasErrors}>
          {isEditing ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  )
}

