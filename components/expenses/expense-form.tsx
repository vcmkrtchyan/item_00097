"use client"

import type React from "react"

import { useState } from "react"
import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "@/lib/utils"

interface ExpenseFormProps {
  expenseId?: string
  tripId?: string
  onCancel: () => void
  onSuccess?: () => void
}

const EXPENSE_CATEGORIES = ["Accommodation", "Transportation", "Food", "Activities", "Shopping", "Other"]

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
]

export function ExpenseForm({ expenseId, tripId, onCancel, onSuccess }: ExpenseFormProps) {
  const { trips, expenses, addExpense, updateExpense } = useTravel()

  const expense = expenseId ? expenses.find((e) => e.id === expenseId) : undefined
  const isEditing = !!expense

  const [formData, setFormData] = useState({
    tripId: expense?.tripId || tripId || (trips.length > 0 ? trips[0].id : ""),
    amount: expense?.amount.toString() || "",
    category: expense?.category || EXPENSE_CATEGORIES[0],
    description: expense?.description || "",
    date: expense?.date || format(new Date()),
    currency: expense?.currency || "USD",
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

    const expenseData = {
      tripId: formData.tripId,
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      currency: formData.currency,
    }

    if (isEditing && expenseId) {
      updateExpense(expenseId, expenseData)
    } else {
      addExpense(expenseData)
    }

    onSuccess?.()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!tripId && (
        <div className="grid gap-2">
          <Label htmlFor="tripId">Trip</Label>
          <Select
            name="tripId"
            value={formData.tripId}
            onValueChange={(value) => handleSelectChange("tripId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trip" />
            </SelectTrigger>
            <SelectContent>
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No trips available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            name="currency"
            value={formData.currency}
            onValueChange={(value) => handleSelectChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What was this expense for?"
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update Expense" : "Add Expense"}</Button>
      </div>
    </form>
  )
}

