export const eventsQuery = `
  *[_type == "event"] | order(startDate asc) {
    _id,
    title,
    "slug": slug.current,
    image { ..., asset-> },
    category,
    areas,
    startDate,
    endDate,
    location,
    organizer,
    introText,
    ticketLink,
    ticketLinkText
  }
`

export const eventBySlugQuery = `
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    image { ..., asset-> },
    category,
    areas,
    startDate,
    endDate,
    location,
    organizer,
    introText,
    ticketLink,
    ticketLinkText,
    content
  }
`
