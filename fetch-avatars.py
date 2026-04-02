#!/usr/bin/env python3
"""
Fetch Twitter/X avatars for all booths and save to frontend/public/avatars/
Run from the repo root: python3 fetch-avatars.py
""" 

import json
import urllib.request
import os
import time

# ── 設定 ────────────────────────────────────────────────────────────────────────
UNAVATAR_API_KEY = ""  # 填入 unavatar.io API key（留空則不使用）
# ────────────────────────────────────────────────────────────────────────────────

with open("frontend/app/data/booths.json") as f:
    booths = json.load(f)

usernames = []
seen = set()
for b in booths:
    if b["twitter"]:
        u = b["twitter"].rstrip("/").split("/")[-1].lower()
        if u and u not in seen:
            seen.add(u)
            usernames.append(u)

out_dir = "frontend/public/avatars"
os.makedirs(out_dir, exist_ok=True)

total = len(usernames)
done = 0
failed = 0

print(f"Fetching avatars for {total} accounts...")

for i, username in enumerate(usernames):
    dest = f"{out_dir}/{username}.jpg"
    if os.path.exists(dest):
        done += 1
        continue

    url = f"https://unavatar.io/x/{username}?size=64"
    headers = {"User-Agent": "Mozilla/5.0"}
    if UNAVATAR_API_KEY:
        headers["x-api-key"] = UNAVATAR_API_KEY
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read()
        with open(dest, "wb") as f:
            f.write(data)
        done += 1
        print(f"  [{i + 1}/{total}] OK: {username}")
        time.sleep(0.4)
    except Exception as e:
        print(f"  [{i + 1}/{total}] FAILED: {username} ({e})")
        failed += 1
        time.sleep(1)

print(f"\nDone: {done} saved, {failed} failed")
