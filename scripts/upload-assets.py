#!/usr/bin/env python3
"""Upload game assets to Supabase Storage bucket 'game-assets'."""

import os
import sys
import urllib.request
import json
import glob

SUPABASE_URL = "https://ufmwnqllgqrfkdfahptv.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbXducWxsZ3FyZmtkZmFocHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTMxMzcsImV4cCI6MjA1ODI4OTEzN30.y7I-1R_YycMdBwldUfMw1YiKszkLIXnLgBR-32ZVbL0"
BUCKET = "game-assets"
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "game")

def upload(filepath, storage_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    with open(filepath, "rb") as f:
        data = f.read()

    ext = os.path.splitext(filepath)[1].lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".ogg": "audio/ogg",
        ".js": "application/javascript",
        ".html": "text/html",
    }.get(ext, "application/octet-stream")

    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {ANON_KEY}")
    req.add_header("apikey", ANON_KEY)
    req.add_header("Content-Type", mime)

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f"OK: {storage_path} ({len(data)} bytes)")
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "Duplicate" in body or "already exists" in body:
            print(f"EXISTS: {storage_path}")
            return True
        print(f"FAIL({e.code}): {storage_path} - {body[:100]}")
        return False

def main():
    base = os.path.abspath(BASE_DIR)
    success = 0
    fail = 0

    # Upload sprites
    for pattern in [
        "sprites/characters/*.png",
        "sprites/npcs/*.png",
        "sprites/mobs/*.png",
    ]:
        for f in sorted(glob.glob(os.path.join(base, pattern))):
            rel = os.path.relpath(f, base)
            if upload(f, rel):
                success += 1
            else:
                fail += 1

    # Upload tilesets
    for name in ["pc-floors.png", "pc-walls.png", "roguelike-interior.png", "roguelike-base.png"]:
        f = os.path.join(base, "tilesets", name)
        if os.path.exists(f) and upload(f, f"tilesets/{name}"):
            success += 1
        else:
            fail += 1

    # Upload props
    for name in ["furniture.png", "vegetation.png", "tree-01.png", "tree-02.png", "tree-03.png", "rocks.png"]:
        f = os.path.join(base, "props", name)
        if os.path.exists(f) and upload(f, f"props/{name}"):
            success += 1
        else:
            fail += 1

    # Upload structures
    for name in ["walls.png", "floors.png"]:
        f = os.path.join(base, "structures", name)
        if os.path.exists(f) and upload(f, f"structures/{name}"):
            success += 1
        else:
            fail += 1

    print(f"\nDone: {success} uploaded, {fail} failed")

if __name__ == "__main__":
    main()
