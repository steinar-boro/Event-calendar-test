# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Sanity CMS v3** via `next-sanity`

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```

Sanity Studio is embedded at `http://localhost:3000/studio`.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
```

Create a new Sanity project at [sanity.io/manage](https://sanity.io/manage).

## Architecture

- `src/app/` — Next.js App Router pages and layouts
- `src/app/studio/[[...tool]]/page.tsx` — Embedded Sanity Studio
- `src/sanity/client.ts` — Sanity client (used in server components for data fetching)
- `src/sanity/schemaTypes/` — Content schemas; export all types from `index.ts`
- `sanity.config.ts` — Sanity Studio configuration

## Adding content schemas

Define schemas in `src/sanity/schemaTypes/` and register them in `src/sanity/schemaTypes/index.ts`:

```ts
export const schemaTypes: SchemaTypeDefinition[] = [mySchema]
```

## Fetching data from Sanity

Use the client directly in server components:

```ts
import { client } from '@/sanity/client'
const data = await client.fetch(`*[_type == "post"]`)
```
