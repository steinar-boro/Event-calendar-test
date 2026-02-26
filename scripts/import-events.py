#!/usr/bin/env python3
"""
Import events from CSV to Sanity CMS.
Usage: python3 scripts/import-events.py <csv-file> <sanity-write-token>
"""

import csv
import json
import sys
import re
import urllib.request
import urllib.error

PROJECT_ID = "ye1wdgkp"
DATASET = "production"
API_VERSION = "2024-01-01"


def slugify(text: str) -> str:
    text = text.lower().strip()
    replacements = {'æ': 'ae', 'ø': 'o', 'å': 'a', 'é': 'e', 'è': 'e', 'ü': 'u', 'ö': 'o', 'ä': 'a'}
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text[:96]


def parse_areas(value: str) -> list[str]:
    return [a.strip() for a in value.split(',') if a.strip()]


def build_document(row: dict) -> dict:
    slug_value = row.get('Slug', '').strip()
    if not slug_value:
        slug_value = slugify(row.get('Title', ''))

    # Clean up slug: remove problematic characters
    slug_value = slug_value.strip('"').strip()

    doc = {
        '_type': 'event',
        '_id': f"imported-{slugify(slug_value)}",
        'title': row.get('Title', '').strip(),
        'slug': {'_type': 'slug', 'current': slug_value},
        'startDate': row.get('Start date', '').strip(),
        'endDate': row.get('End date', '').strip(),
    }

    if row.get('Image', '').strip():
        doc['imageUrl'] = row['Image'].strip()
    if row.get('Image:alt', '').strip():
        doc['imageAlt'] = row['Image:alt'].strip()
    if row.get('Theme Filter', '').strip():
        doc['category'] = row['Theme Filter'].strip()
    if row.get('Area Filter', '').strip():
        doc['areas'] = parse_areas(row['Area Filter'])
    if row.get('Place', '').strip():
        doc['location'] = row['Place'].strip()
    if row.get('Organizer', '').strip():
        doc['organizer'] = row['Organizer'].strip()
    if row.get('Intro text', '').strip():
        doc['introText'] = row['Intro text'].strip()
    if row.get('Ticket link', '').strip():
        doc['ticketLink'] = row['Ticket link'].strip()
    if row.get('Ticket link button text', '').strip():
        doc['ticketLinkText'] = row['Ticket link button text'].strip()
    if row.get('Content', '').strip():
        doc['htmlContent'] = row['Content'].strip()

    return doc


def import_to_sanity(documents: list[dict], token: str) -> None:
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"

    mutations = [{'createOrReplace': doc} for doc in documents]
    payload = json.dumps({'mutations': mutations}).encode('utf-8')

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            results = result.get('results', [])
            created = sum(1 for r in results if r.get('operation') == 'create')
            updated = sum(1 for r in results if r.get('operation') == 'update')
            print(f"✓ Importert: {created} nye, {updated} oppdatert")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"✗ HTTP-feil {e.code}: {error_body}")
        sys.exit(1)


def main():
    if len(sys.argv) < 3:
        print("Bruk: python3 scripts/import-events.py <csv-fil> <sanity-write-token>")
        sys.exit(1)

    csv_file = sys.argv[1]
    token = sys.argv[2]

    documents = []
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            doc = build_document(row)
            documents.append(doc)

    print(f"Leser {len(documents)} arrangementer fra {csv_file}...")
    import_to_sanity(documents, token)


if __name__ == '__main__':
    main()
