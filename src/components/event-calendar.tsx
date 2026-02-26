"use client"

import * as React from "react"
import { isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { SanityEvent } from "@/sanity/types"
import { EventCard } from "@/components/event-card"
import { FilterChips } from "@/components/filter-chips"
import { DateRangeFilter } from "@/components/date-range-filter"

const EVENTS_PER_PAGE = 6

type EventCalendarProps = {
  events: SanityEvent[]
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [selectedArea, setSelectedArea] = React.useState("All")
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [visibleCount, setVisibleCount] = React.useState(EVENTS_PER_PAGE)

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(events.map((e) => e.category)))
    return ["All", ...unique]
  }, [events])

  const areas = React.useMemo(() => {
    const unique = Array.from(new Set(events.map((e) => e.area)))
    return ["All", ...unique]
  }, [events])

  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)

      if (dateRange?.from && dateRange?.to) {
        const inRange =
          isWithinInterval(startDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          }) ||
          isWithinInterval(endDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          })
        if (!inRange) return false
      } else if (dateRange?.from) {
        if (startDate < startOfDay(dateRange.from) && endDate < startOfDay(dateRange.from)) {
          return false
        }
      }

      if (selectedArea !== "All" && event.area !== selectedArea) return false
      if (selectedCategory !== "All" && event.category !== selectedCategory) return false

      return true
    })
  }, [dateRange, selectedArea, selectedCategory, events])

  React.useEffect(() => {
    setVisibleCount(EVENTS_PER_PAGE)
  }, [dateRange, selectedArea, selectedCategory])

  const visibleEvents = filteredEvents.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEvents.length

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left side: Event list */}
      <div className="flex-1 min-w-0">
        {visibleEvents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">Ingen arrangementer funnet</p>
            <p className="text-sm mt-1">Prøv å endre filtrene</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visibleEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-6">
            <button
              onClick={() => setVisibleCount((c) => c + EVENTS_PER_PAGE)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Last inn flere
            </button>
          </div>
        )}
      </div>

      {/* Right side: Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="lg:sticky lg:top-8 flex flex-col gap-8">
          <button
            onClick={() => {
              setDateRange(undefined)
              setSelectedArea("All")
              setSelectedCategory("All")
            }}
            className="self-start px-5 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Reset filter
          </button>

          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            events={events}
          />

          <FilterChips
            label="Område"
            options={areas}
            selected={selectedArea}
            onSelect={setSelectedArea}
          />

          <FilterChips
            label="Kategori"
            options={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </aside>
    </div>
  )
}
