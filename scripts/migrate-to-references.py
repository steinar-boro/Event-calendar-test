#!/usr/bin/env python3
"""
Creates category and area documents in Sanity, then patches all events
to use references instead of string values.

Usage: python3 scripts/migrate-to-references.py <sanity-write-token>
"""

import json
import sys
import urllib.request
import urllib.parse
import urllib.error

PROJECT_ID = "ye1wdgkp"
DATASET = "production"
API_VERSION = "2024-01-01"
BASE_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}"

CATEGORIES = [
    {"slug": "konferanse",          "title": "Konferanse"},
    {"slug": "seminar",             "title": "Seminar"},
    {"slug": "webinar",             "title": "Webinar"},
    {"slug": "fagdag",              "title": "Fagdag"},
    {"slug": "forum",               "title": "Forum"},
    {"slug": "workshop",            "title": "Workshop"},
    {"slug": "forretningsutvikling","title": "Forretningsutvikling"},
]

AREAS = [
    {"slug": "aakp",                   "title": "ÅKP"},
    {"slug": "blue-maritime-cluster",  "title": "Blue Maritime Cluster"},
    {"slug": "blue-legasea",           "title": "Blue Legasea"},
    {"slug": "norsk-katapult-digital", "title": "Norsk Katapult Digital"},
    {"slug": "mafoss",                 "title": "Mafoss"},
    {"slug": "samarbeidspartnere",     "title": "Samarbeidspartnere"},
]


def mutate(mutations: list, token: str) -> dict:
    url = f"{BASE_URL}/data/mutate/{DATASET}"
    payload = json.dumps({"mutations": mutations}).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def query(groq: str, token: str) -> list:
    encoded = urllib.parse.quote(groq)
    url = f"{BASE_URL}/data/query/{DATASET}?query={encoded}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["result"]


def main():
    if len(sys.argv) < 2:
        print("Bruk: python3 scripts/migrate-to-references.py <sanity-write-token>")
        sys.exit(1)
    token = sys.argv[1]

    # 1. Create category documents
    print("Oppretter tema-dokumenter...")
    category_mutations = [
        {"createOrReplace": {
            "_type": "category",
            "_id": f"category-{c['slug']}",
            "title": c["title"],
            "slug": {"_type": "slug", "current": c["slug"]},
        }}
        for c in CATEGORIES
    ]
    mutate(category_mutations, token)
    print(f"  ✓ {len(CATEGORIES)} temaer opprettet")

    # 2. Create area documents
    print("Oppretter område-dokumenter...")
    area_mutations = [
        {"createOrReplace": {
            "_type": "area",
            "_id": f"area-{a['slug']}",
            "title": a["title"],
            "slug": {"_type": "slug", "current": a["slug"]},
        }}
        for a in AREAS
    ]
    mutate(area_mutations, token)
    print(f"  ✓ {len(AREAS)} områder opprettet")

    # 3. Fetch all events with string category/areas
    print("\nHenter events...")
    events = query(
        '*[_type == "event"] { _id, title, category, areas }',
        token
    )
    print(f"  Fant {len(events)} events\n")

    # 4. Patch each event
    success = 0
    skipped = 0
    for event in events:
        patch_set = {}
        patch_unset = []

        cat = event.get("category")
        areas = event.get("areas", [])

        # Category: only migrate if it's a string (not yet a reference)
        if isinstance(cat, str) and cat:
            patch_set["category"] = {
                "_type": "reference",
                "_ref": f"category-{cat}",
            }
        elif isinstance(cat, dict) and cat.get("_ref"):
            pass  # already a reference

        # Areas: only migrate if they are strings
        if areas and isinstance(areas[0], str):
            patch_set["areas"] = [
                {"_type": "reference", "_ref": f"area-{a}", "_key": a}
                for a in areas if a
            ]
        elif areas and isinstance(areas[0], dict) and areas[0].get("_ref"):
            pass  # already references

        if not patch_set and not patch_unset:
            skipped += 1
            continue

        patch = {"id": event["_id"], "set": patch_set}
        if patch_unset:
            patch["unset"] = patch_unset

        mutate([{"patch": patch}], token)
        print(f"  ✓ {event['title'][:60]}")
        success += 1

    print(f"\nFullført: {success} migrert, {skipped} allerede oppdatert")


if __name__ == "__main__":
    main()
