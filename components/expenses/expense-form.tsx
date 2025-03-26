"use client"

import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Define the Zod schema for the form
const formSchema = z.object({
  tripId: z.string().min(1, "Trip is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  description: z.string(),
  date: z.string().min(1, "Date is required"),
  currency: z.string().min(1, "Currency is required"),
})

export function ExpenseForm({ expenseId, tripId, onCancel, onSuccess }: ExpenseFormProps) {
  const { trips, expenses, addExpense, updateExpense } = useTravel()

  const expense = expenseId ? expenses.find((e) => e.id === expenseId) : undefined
  const isEditing = !!expense

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripId: expense?.tripId || tripId || (trips.length > 0 ? trips[0].id : ""),
      amount: expense?.amount.toString() || "",
      category: expense?.category || EXPENSE_CATEGORIES[0],
      description: expense?.description || "",
      date: expense?.date || format(new Date()),
      currency: expense?.currency || "USD",
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const expenseData = {
      tripId: data.tripId,
      amount: Number.parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: data.date,
      currency: data.currency,
    }

    if (isEditing && expenseId) {
      updateExpense(expenseId, expenseData)
      toast.success("Expense updated", {
        description: `${data.currency} ${Number.parseFloat(data.amount).toFixed(2)} expense has been updated.`,
      })
    } else {
      addExpense(expenseData)
      toast.success("Expense added", {
        description: `${data.currency} ${Number.parseFloat(data.amount).toFixed(2)} expense has been added.`,
      })
    }

    onSuccess?.()
    onCancel()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!tripId && (
          <FormField
            control={form.control}
            name="tripId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trip <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trip" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Amount <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Currency <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {EXPENSE_CATEGORIES.map((category) => (
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What was this expense for?" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update Expense" : "Add Expense"}</Button>
        </div>
      </form>
    </Form>
  )
}

