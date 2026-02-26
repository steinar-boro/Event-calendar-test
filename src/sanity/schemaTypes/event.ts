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
      name: 'imageUrl',
      title: 'Bilde (URL)',
      type: 'url',
    }),
    defineField({
      name: 'imageAlt',
      title: 'Bildetekst (alt)',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Tema',
      type: 'string',
      options: {
        list: [
          { title: 'Konferanse', value: 'konferanse' },
          { title: 'Seminar', value: 'seminar' },
          { title: 'Webinar', value: 'webinar' },
          { title: 'Fagdag', value: 'fagdag' },
          { title: 'Forum', value: 'forum' },
          { title: 'Workshop', value: 'workshop' },
          { title: 'Forretningsutvikling', value: 'forretningsutvikling' },
        ],
      },
    }),
    defineField({
      name: 'areas',
      title: 'Områder',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'ÅKP', value: 'aakp' },
              { title: 'Blue Maritime Cluster', value: 'blue-maritime-cluster' },
              { title: 'Blue Legasea', value: 'blue-legasea' },
              { title: 'Norsk Katapult Digital', value: 'norsk-katapult-digital' },
              { title: 'Mafoss', value: 'mafoss' },
              { title: 'Samarbeidspartnere', value: 'samarbeidspartnere' },
            ],
          },
        },
      ],
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
      name: 'htmlContent',
      title: 'Innhold (HTML)',
      type: 'text',
      description: 'Importert HTML-innhold',
    }),
    defineField({
      name: 'content',
      title: 'Innhold (riktekst)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Bruk dette for innhold laget direkte i Studio',
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
