#!/usr/bin/env python3
"""
Download images from external URLs and upload them to Sanity,
then patch each event document with the new asset reference.

Usage: python3 scripts/upload-images.py <sanity-write-token>
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

MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
}


def get_mime_type(url: str) -> str:
    path = urllib.parse.urlparse(url).path.lower()
    for ext, mime in MIME_TYPES.items():
        if path.endswith(ext):
            return mime
    return "image/jpeg"


def fetch_events(token: str) -> list[dict]:
    query = urllib.parse.quote('*[_type == "event" && defined(imageUrl)] { _id, title, imageUrl }')
    url = f"{BASE_URL}/data/query/{DATASET}?query={query}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["result"]


def download_image(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def upload_to_sanity(image_bytes: bytes, mime_type: str, filename: str, token: str) -> str:
    url = f"{BASE_URL}/assets/images/{DATASET}?filename={urllib.parse.quote(filename)}"
    req = urllib.request.Request(
        url,
        data=image_bytes,
        headers={
            "Content-Type": mime_type,
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        return result["document"]["_id"]


def patch_event(event_id: str, asset_id: str, alt: str, token: str) -> None:
    url = f"{BASE_URL}/data/mutate/{DATASET}"
    mutations = [{
        "patch": {
            "id": event_id,
            "set": {
                "image": {
                    "_type": "image",
                    "asset": {"_type": "reference", "_ref": asset_id},
                    "alt": alt,
                }
            },
            "unset": ["imageUrl"],
        }
    }]
    payload = json.dumps({"mutations": mutations}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        resp.read()


def main():
    if len(sys.argv) < 2:
        print("Bruk: python3 scripts/upload-images.py <sanity-write-token>")
        sys.exit(1)

    token = sys.argv[1]

    print("Henter events med imageUrl...")
    events = fetch_events(token)
    print(f"Fant {len(events)} events med bilder\n")

    success, failed = 0, 0

    for event in events:
        title = event["title"]
        image_url = event["imageUrl"]
        event_id = event["_id"]

        try:
            print(f"  ↓ Laster ned: {title[:50]}")
            image_bytes = download_image(image_url)

            mime = get_mime_type(image_url)
            ext = mime.split("/")[-1].replace("jpeg", "jpg")
            filename = f"{event_id}.{ext}"

            print(f"  ↑ Laster opp til Sanity ({len(image_bytes) // 1024} KB)...")
            asset_id = upload_to_sanity(image_bytes, mime, filename, token)

            patch_event(event_id, asset_id, title, token)
            print(f"  ✓ Ferdig: {asset_id}\n")
            success += 1

        except Exception as e:
            print(f"  ✗ Feil: {e}\n")
            failed += 1

    print(f"Fullført: {success} lastet opp, {failed} feilet")


if __name__ == "__main__":
    main()
