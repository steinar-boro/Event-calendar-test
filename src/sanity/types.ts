import type { PortableTextBlock } from 'sanity'

export type SanityEvent = {
  _id: string
  title: string
  slug: string
  category: string
  area: string
  startDate: string
  endDate: string
  location: string
  content?: PortableTextBlock[]
}

export const categoryLabelMap: Record<string, string> = {
  Conference: 'Konferanse',
  Seminar: 'Seminar',
  Webinar: 'Webinar',
  'Professional Development Day': 'Fagdag',
  Forum: 'Forum',
  Workshop: 'Workshop',
  'Business development': 'Forretningsutvikling',
}
