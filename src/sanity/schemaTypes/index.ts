import { SchemaTypeDefinition } from 'sanity'
import { eventType } from './event'
import { categoryType } from './category'
import { areaType } from './area'

export const schemaTypes: SchemaTypeDefinition[] = [eventType, categoryType, areaType]
