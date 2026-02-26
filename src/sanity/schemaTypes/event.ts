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
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Konferanse', value: 'Conference' },
          { title: 'Seminar', value: 'Seminar' },
          { title: 'Webinar', value: 'Webinar' },
          { title: 'Fagdag', value: 'Professional Development Day' },
          { title: 'Forum', value: 'Forum' },
          { title: 'Workshop', value: 'Workshop' },
          { title: 'Forretningsutvikling', value: 'Business development' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'area',
      title: 'Område',
      type: 'string',
      options: {
        list: [
          { title: 'ÅKP', value: 'ÅKP' },
          { title: 'Blue Maritime Cluster', value: 'Blue Maritime Cluster' },
          { title: 'Blue Legasea', value: 'Blue Legasea' },
          { title: 'Norwegian Catapult Digital', value: 'Norwegian Catapult Digital' },
          { title: 'Mafoss', value: 'Mafoss' },
          { title: 'Collaborators', value: 'Collaborators' },
        ],
      },
      validation: (Rule) => Rule.required(),
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
