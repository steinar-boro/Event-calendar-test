import { client } from "@/sanity/client"
import { eventsQuery } from "@/sanity/queries"
import type { SanityEvent } from "@/sanity/types"
import { EventCalendar } from "@/components/event-calendar"

export default async function Page() {
  const events = await client.fetch<SanityEvent[]>(eventsQuery)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Kalender</h1>
        <EventCalendar events={events} />
      </div>
    </main>
  )
}
