/**
 * Converts htmlContent (HTML string) to Portable Text and saves to content field.
 * Usage: node scripts/html-to-richtext.mjs <sanity-write-token>
 */

import { htmlToBlocks } from '@sanity/block-tools'
import { Schema } from '@sanity/schema'
import { createClient } from '@sanity/client'
import { JSDOM } from 'jsdom'
import { randomBytes } from 'crypto'

const PROJECT_ID = 'ye1wdgkp'
const DATASET = 'production'
const API_VERSION = '2024-01-01'

const token = process.argv[2]
if (!token) {
  console.error('Bruk: node scripts/html-to-richtext.mjs <sanity-write-token>')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
})

// Minimal schema to give block-tools what it needs
const schema = Schema.compile({
  name: 'default',
  types: [
    {
      type: 'object',
      name: 'event',
      fields: [
        {
          name: 'content',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'H5', value: 'h5' },
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                  { title: 'Underline', value: 'underline' },
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [{ name: 'href', type: 'url', title: 'URL' }],
                  },
                ],
              },
              lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Numbered', value: 'number' },
              ],
            },
          ],
        },
      ],
    },
  ],
})

const blockContentType = schema
  .get('event')
  .fields.find((f) => f.name === 'content').type

function key() {
  return randomBytes(6).toString('hex')
}

function addKeys(blocks) {
  return blocks.map((block) => ({
    ...block,
    _key: block._key || key(),
    children: (block.children || []).map((child) => ({
      ...child,
      _key: child._key || key(),
    })),
  }))
}

async function main() {
  const events = await client.fetch(
    `*[_type == "event" && defined(htmlContent)] { _id, title, htmlContent }`
  )

  console.log(`Fant ${events.length} events med HTML-innhold\n`)

  let success = 0
  let failed = 0

  for (const event of events) {
    try {
      process.stdout.write(`  Konverterer: ${event.title.slice(0, 60)}... `)

      const blocks = htmlToBlocks(event.htmlContent, blockContentType, {
        parseHtml: (html) => new JSDOM(html).window.document,
      })

      const blocksWithKeys = addKeys(blocks)

      await client
        .patch(event._id)
        .set({ content: blocksWithKeys })
        .unset(['htmlContent'])
        .commit()

      console.log(`✓ (${blocksWithKeys.length} blokker)`)
      success++
    } catch (err) {
      console.log(`✗ ${err.message}`)
      failed++
    }
  }

  console.log(`\nFullført: ${success} konvertert, ${failed} feilet`)
}

main()
