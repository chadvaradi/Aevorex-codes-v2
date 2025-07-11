#!/usr/bin/env python3
"""Prune deprecated endpoints helper.

Iterates Redis keys `deprecated:<path>:<date>` and prints candidates that
haven't been called for the last 30 days.
Run manually by ops before removing alias routes.
"""
import asyncio
from datetime import datetime
from modules.financehub.backend.utils.cache_service import CacheService

TTL_DAYS = 30

async def main():
    cache = await CacheService.create("memory")  # adjust to Redis in prod
    keys = await cache.keys("deprecated:*")
    now = datetime.utcnow().date()
    inactive = {}
    for k in keys:
        *_, date_str = k.split(":")
        last = datetime.strptime(date_str, "%Y-%m-%d").date()
        days = (now - last).days
        if days >= TTL_DAYS:
            path = k.split(":")[1]
            inactive.setdefault(path, []).append(days)

    if not inactive:
        print("No endpoints qualify for prune.")
        return

    print("Endpoints eligible for removal (no hits ≥30d):")
    for path, days_list in inactive.items():
        print(f" • {path}  (last hit {min(days_list)} days ago)")

if __name__ == "__main__":
    asyncio.run(main()) 