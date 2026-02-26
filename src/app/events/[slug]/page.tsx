import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { PortableText } from "@portabletext/react"
import { client } from "@/sanity/client"
import { eventBySlugQuery } from "@/sanity/queries"
import type { SanityEvent } from "@/sanity/types"
import { categoryLabelMap } from "@/sanity/types"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const event = await client.fetch<SanityEvent | null>(eventBySlugQuery, { slug })

  if (!event) notFound()

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const categoryLabel = categoryLabelMap[event.category] || event.category

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Tilbake til kalender
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-primary">{categoryLabel}</span>
          {event.area && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{event.area}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-6">{event.title}</h1>

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
        </div>

        {event.content && event.content.length > 0 ? (
          <div className="prose prose-neutral max-w-none">
            <PortableText value={event.content} />
          </div>
        ) : (
          <p className="text-muted-foreground italic">Ingen beskrivelse lagt til ennå.</p>
        )}
      </div>
    </main>
  )
}
