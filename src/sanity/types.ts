import type { PortableTextBlock } from 'sanity'

export type SanityImage = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  alt?: string
}

export type SanityCategory = {
  _id: string
  title: string
  slug: string
}

export type SanityArea = {
  _id: string
  title: string
  slug: string
}

export type SanityEvent = {
  _id: string
  title: string
  slug: string
  image?: SanityImage
  category?: SanityCategory
  areas?: SanityArea[]
  startDate: string
  endDate: string
  location?: string
  organizer?: string
  introText?: string
  ticketLink?: string
  ticketLinkText?: string
  content?: PortableTextBlock[]
}
