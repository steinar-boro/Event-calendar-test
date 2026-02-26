/**
 * Reads HTML content from CSV, converts to Portable Text,
 * and patches Sanity events that are missing content.
 *
 * Usage: node scripts/fix-missing-content.mjs <csv-file> <sanity-write-token>
 */

import { htmlToBlocks } from '@sanity/block-tools'
import { Schema } from '@sanity/schema'
import { createClient } from '@sanity/client'
import { JSDOM } from 'jsdom'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'

const [, , csvFile, token] = process.argv
if (!csvFile || !token) {
  console.error('Bruk: node scripts/fix-missing-content.mjs <csv-fil> <sanity-write-token>')
  process.exit(1)
}

const client = createClient({
  projectId: 'ye1wdgkp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

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

/**
 * Robust CSV parser that handles embedded newlines and unescaped quotes.
 * Returns array of objects keyed by header row.
 */
function parseCSV(raw) {
  const rows = []
  let headers = null
  let field = ''
  let fields = []
  let inQuotes = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const next = raw[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote inside field
        field += '"'
        i++
      } else if (ch === '"' && (next === ',' || next === '\n' || next === '\r' || next === undefined)) {
        // Closing quote
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(field)
        field = ''
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++ // skip \n in \r\n
        fields.push(field)
        field = ''
        if (!headers) {
          headers = fields
        } else if (fields.length === headers.length) {
          const obj = {}
          headers.forEach((h, idx) => { obj[h] = fields[idx] })
          rows.push(obj)
        }
        fields = []
      } else {
        field += ch
      }
    }
  }

  // Last row without trailing newline
  if (field || fields.length) {
    fields.push(field)
    if (headers && fields.length === headers.length) {
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = fields[idx] })
      rows.push(obj)
    }
  }

  return rows
}

async function main() {
  // Parse CSV
  const raw = readFileSync(csvFile, 'utf-8')
  const rows = parseCSV(raw)
  console.log(`CSV: ${rows.length} rader lest\n`)

  // Build title → html map
  const contentByTitle = new Map()
  for (const row of rows) {
    const title = row['Title']?.trim()
    const html = row['Content']?.trim()
    if (title && html) {
      contentByTitle.set(title, html)
    }
  }
  console.log(`${contentByTitle.size} rader med HTML-innhold\n`)

  // Fetch all Sanity events without content
  const events = await client.fetch(
    `*[_type == "event"] { _id, title, "hasContent": defined(content) && length(content) > 0 }`
  )
  const missing = events.filter((e) => !e.hasContent)
  console.log(`Sanity: ${events.length} events totalt, ${missing.length} mangler innhold\n`)

  let success = 0, notFound = 0, failed = 0

  for (const event of missing) {
    const html = contentByTitle.get(event.title)
    if (!html) {
      console.log(`  ~ Ingen CSV-treff: ${event.title.slice(0, 60)}`)
      notFound++
      continue
    }

    try {
      process.stdout.write(`  Konverterer: ${event.title.slice(0, 60)}... `)

      const blocks = htmlToBlocks(html, blockContentType, {
        parseHtml: (html) => new JSDOM(html).window.document,
      })
      const blocksWithKeys = addKeys(blocks)

      await client.patch(event._id).set({ content: blocksWithKeys }).commit()

      console.log(`✓ (${blocksWithKeys.length} blokker)`)
      success++
    } catch (err) {
      console.log(`✗ ${err.message}`)
      failed++
    }
  }

  console.log(`\nFullført: ${success} konvertert, ${notFound} ingen CSV-treff, ${failed} feilet`)
}

main()
