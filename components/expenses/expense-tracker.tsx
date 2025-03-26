"use client"

import { useState } from "react"
import { useTravel } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { ExpenseForm } from "./expense-form"
import { ExpenseList } from "./expense-list"
import { ExpenseSummary } from "./expense-summary"

export function ExpenseTracker() {
  const { expenses, trips } = useTravel()
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | "all">("all")

  const filteredExpenses =
    selectedTripId === "all" ? expenses : expenses.filter((expense) => expense.tripId === selectedTripId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button onClick={() => setIsAddingExpense(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {isAddingExpense ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
            <CardDescription>Record a new expense</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onCancel={() => setIsAddingExpense(false)} onSuccess={() => setIsAddingExpense(false)} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
              <CardDescription>Overview of your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseSummary expenses={filteredExpenses} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense List</CardTitle>
              <CardDescription>Detailed list of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={selectedTripId} onValueChange={setSelectedTripId}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Trips</TabsTrigger>
                  {trips.map((trip) => (
                    <TabsTrigger key={trip.id} value={trip.id}>
                      {trip.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={selectedTripId}>
                  <ExpenseList
                    expenses={filteredExpenses}
                    tripId={selectedTripId === "all" ? undefined : selectedTripId}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

