"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import type { SanityEvent } from "@/sanity/types"
import { urlFor } from "@/sanity/image"

export function EventCard({ event }: { event: SanityEvent }) {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const day = format(startDate, "d.")
  const month = format(startDate, "MMM", { locale: nb })

  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <article className="flex gap-4 py-6 border-b border-border last:border-b-0 group-hover:bg-accent/30 -mx-4 px-4 rounded-lg transition-colors">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-lg">
          <span className="text-lg font-bold leading-tight">{day}</span>
          <span className="text-sm leading-tight">{month}</span>
        </div>
        <div className="flex gap-4 min-w-0 flex-1">
          {event.image && (
            <div className="hidden sm:block flex-shrink-0 w-24 h-16 rounded-md overflow-hidden relative">
              <Image
                src={urlFor(event.image).width(200).height(128).url()}
                alt={event.image.alt ?? event.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap gap-1 text-sm">
              {event.category && (
                <span className="font-medium text-primary">{event.category.title}</span>
              )}
              {event.areas && event.areas.length > 0 && (
                <span className="text-muted-foreground">
                  {event.category && "· "}
                  {event.areas.map((a) => a.title).join(", ")}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground leading-snug text-pretty group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            {event.introText && (
              <p className="text-sm text-muted-foreground line-clamp-2">{event.introText}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {format(startDate, "d. MMMM yyyy", { locale: nb })} kl. {format(startDate, "HH:mm")} –{" "}
              {format(endDate, "d. MMMM yyyy", { locale: nb })} kl. {format(endDate, "HH:mm")}
            </p>
            {event.location && (
              <p className="text-sm text-muted-foreground">• {event.location}</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
