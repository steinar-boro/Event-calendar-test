"use client"

import * as React from "react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import type { SanityEvent } from "@/sanity/types"

type DateRangeFilterProps = {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  events: SanityEvent[]
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  events,
}: DateRangeFilterProps) {
  const eventDates = React.useMemo(() => {
    const dates = new Set<string>()
    events.forEach((event) => {
      dates.add(format(new Date(event.startDate), "yyyy-MM-dd"))
    })
    return dates
  }, [events])

  const modifiers = React.useMemo(() => {
    return {
      hasEvent: (date: Date) => eventDates.has(format(date, "yyyy-MM-dd")),
    }
  }, [eventDates])

  const firstEventDate = events.length > 0 ? new Date(events[0].startDate) : new Date()

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={onDateRangeChange}
        locale={nb}
        defaultMonth={firstEventDate}
        modifiers={modifiers}
        modifiersClassNames={{
          hasEvent: "has-event-dot",
        }}
        className="w-full p-0 [--cell-size:--spacing(9)]"
        classNames={{
          month_caption: "flex items-center justify-between h-10 w-full px-1",
          caption_label: "text-sm font-semibold text-foreground",
          nav: "flex items-center gap-1 absolute right-0 top-0",
          table: "w-full border-collapse",
          weekday: "text-muted-foreground text-xs font-normal w-9 pb-2",
          day: "relative w-full h-full p-0 text-center group/day aspect-square select-none",
        }}
      />
    </div>
  )
}
