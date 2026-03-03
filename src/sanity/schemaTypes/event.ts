import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Arrangement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Bildetekst (alt)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Tema',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'areas',
      title: 'Områder',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'area' }] }],
    }),
    defineField({
      name: 'startDate',
      title: 'Startdato og -tid',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Sluttdato og -tid',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Sted',
      type: 'string',
    }),
    defineField({
      name: 'organizer',
      title: 'Arrangør',
      type: 'string',
    }),
    defineField({
      name: 'introText',
      title: 'Ingress',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ticketLink',
      title: 'Påmeldingslenke',
      type: 'url',
    }),
    defineField({
      name: 'ticketLinkText',
      title: 'Tekst på påmeldingsknapp',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Innhold',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  orderings: [
    {
      title: 'Startdato',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
})
