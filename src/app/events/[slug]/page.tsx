import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { PortableText } from "@portabletext/react"
import { client } from "@/sanity/client"
import { eventBySlugQuery } from "@/sanity/queries"
import type { SanityEvent } from "@/sanity/types"
import { categoryDisplayMap, areaDisplayMap } from "@/sanity/types"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const event = await client.fetch<SanityEvent | null>(eventBySlugQuery, { slug })

  if (!event) notFound()

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const categoryLabel = event.category ? (categoryDisplayMap[event.category] ?? event.category) : null
  const areaLabels = event.areas?.map((a) => areaDisplayMap[a] ?? a) ?? []

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Tilbake til kalender
        </Link>

        {event.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={event.imageUrl}
              alt={event.imageAlt ?? event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          {categoryLabel && (
            <span className="font-medium text-primary">{categoryLabel}</span>
          )}
          {areaLabels.length > 0 && (
            <>
              {categoryLabel && <span className="text-muted-foreground">·</span>}
              <span className="text-muted-foreground">{areaLabels.join(", ")}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">{event.title}</h1>

        {event.introText && (
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{event.introText}</p>
        )}

        <div className="flex flex-col gap-2 mb-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Dato: </span>
            {format(startDate, "d. MMMM yyyy", { locale: nb })} kl.{" "}
            {format(startDate, "HH:mm")} – {format(endDate, "d. MMMM yyyy", { locale: nb })} kl.{" "}
            {format(endDate, "HH:mm")}
          </p>
          {event.location && (
            <p>
              <span className="font-medium text-foreground">Sted: </span>
              {event.location}
            </p>
          )}
          {event.organizer && (
            <p>
              <span className="font-medium text-foreground">Arrangør: </span>
              {event.organizer}
            </p>
          )}
        </div>

        {event.ticketLink && (
          <a
            href={event.ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {event.ticketLinkText ?? "Meld deg på"}
          </a>
        )}

        {event.htmlContent ? (
          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: event.htmlContent }}
          />
        ) : event.content && event.content.length > 0 ? (
          <div className="prose prose-neutral max-w-none">
            <PortableText value={event.content} />
          </div>
        ) : null}
      </div>
    </main>
  )
}
