import type { PortableTextBlock } from 'sanity'

export type SanityImage = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  alt?: string
}

export type SanityEvent = {
  _id: string
  title: string
  slug: string
  image?: SanityImage
  imageUrl?: string
  category?: string
  areas?: string[]
  startDate: string
  endDate: string
  location?: string
  organizer?: string
  introText?: string
  ticketLink?: string
  ticketLinkText?: string
  htmlContent?: string
  content?: PortableTextBlock[]
}

export const categoryDisplayMap: Record<string, string> = {
  konferanse: 'Konferanse',
  seminar: 'Seminar',
  webinar: 'Webinar',
  fagdag: 'Fagdag',
  forum: 'Forum',
  workshop: 'Workshop',
  forretningsutvikling: 'Forretningsutvikling',
}

export const areaDisplayMap: Record<string, string> = {
  aakp: 'ÅKP',
  'blue-maritime-cluster': 'Blue Maritime Cluster',
  'blue-legasea': 'Blue Legasea',
  'norsk-katapult-digital': 'Norsk Katapult Digital',
  mafoss: 'Mafoss',
  samarbeidspartnere: 'Samarbeidspartnere',
}

// Keep for backward compat
export const categoryLabelMap = categoryDisplayMap
