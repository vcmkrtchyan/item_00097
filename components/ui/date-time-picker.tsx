"use client"

import * as React from "react"
import { format, startOfDay } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date
  setDate: (date: Date) => void
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DateTimePicker({ date, setDate, disabled, minDate, maxDate }: DateTimePickerProps) {
  const minuteOptions = React.useMemo(() => {
    const options = []
    for (let i = 0; i < 60; i += 15) {
      options.push(i)
    }
    return options
  }, [])

  const hourOptions = React.useMemo(() => {
    const options = []
    for (let i = 0; i < 24; i++) {
      options.push(i)
    }
    return options
  }, [])

  // Determine if the current hour is disabled based on min/max dates
  const isHourDisabled = React.useCallback(
    (hour: number) => {
      if (!minDate && !maxDate) return false

      const newDate = new Date(date)
      newDate.setHours(hour)

      // Check if this would make the date invalid
      if (minDate && isSameDay(newDate, minDate) && hour < minDate.getHours()) {
        return true
      }

      if (maxDate && isSameDay(newDate, maxDate) && hour > maxDate.getHours()) {
        return true
      }

      return false
    },
    [date, minDate, maxDate],
  )

  // Determine if the current minute is disabled based on min/max dates
  const isMinuteDisabled = React.useCallback(
    (minute: number) => {
      if (!minDate && !maxDate) return false

      const newDate = new Date(date)
      newDate.setMinutes(minute)

      // Check if this would make the date invalid
      if (
        minDate &&
        isSameDay(newDate, minDate) &&
        newDate.getHours() === minDate.getHours() &&
        minute < minDate.getMinutes()
      ) {
        return true
      }

      if (
        maxDate &&
        isSameDay(newDate, maxDate) &&
        newDate.getHours() === maxDate.getHours() &&
        minute > maxDate.getMinutes()
      ) {
        return true
      }

      return false
    },
    [date, minDate, maxDate],
  )

  // Helper function to check if two dates are the same day
  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Get today's date at the start of the day
  const today = startOfDay(new Date())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              // Preserve the time when changing the date
              const updatedDate = new Date(newDate)
              updatedDate.setHours(date.getHours(), date.getMinutes())

              // Ensure the time is valid with the new date
              if (minDate && updatedDate < minDate) {
                updatedDate.setHours(minDate.getHours(), minDate.getMinutes())
              }
              if (maxDate && updatedDate > maxDate) {
                updatedDate.setHours(maxDate.getHours(), maxDate.getMinutes())
              }

              setDate(updatedDate)
            }
          }}
          disabled={(date) => {
            // Disable dates in the past
            if (date < today) {
              return true
            }

            // Disable dates outside the min/max range
            if (minDate && date < startOfDay(new Date(minDate))) {
              return true
            }
            if (maxDate && date > startOfDay(new Date(maxDate))) {
              return true
            }
            return false
          }}
          initialFocus
        />
        <div className="border-t border-border p-3 flex flex-wrap items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select
            value={date.getHours().toString()}
            onValueChange={(value) => {
              const newDate = new Date(date)
              newDate.setHours(Number.parseInt(value))
              setDate(newDate)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((hour) => (
                <SelectItem key={hour} value={hour.toString()} disabled={isHourDisabled(hour)}>
                  {hour.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={
              Math.floor(date.getMinutes() / 15) * 15 === 60
                ? "0"
                : (Math.floor(date.getMinutes() / 15) * 15).toString()
            }
            onValueChange={(value) => {
              const newDate = new Date(date)
              newDate.setMinutes(Number.parseInt(value))
              setDate(newDate)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map((minute) => (
                <SelectItem key={minute} value={minute.toString()} disabled={isMinuteDisabled(minute)}>
                  {minute.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

