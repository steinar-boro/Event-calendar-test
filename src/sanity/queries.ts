export const eventsQuery = `
  *[_type == "event"] | order(startDate asc) {
    _id,
    title,
    "slug": slug.current,
    category,
    area,
    startDate,
    endDate,
    location
  }
`

export const eventBySlugQuery = `
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    area,
    startDate,
    endDate,
    location,
    content
  }
`
