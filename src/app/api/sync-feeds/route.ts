import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { syncAllFeeds } from "../../../../scripts/sync-feeds.mjs";

const LIVE_FEED_PATH = path.join(process.cwd(), "src/data/live-feed.json");

export async function GET() {
  try {
    const raw = await fs.readFile(LIVE_FEED_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({
      lastSyncedAt: null,
      totalItems: 0,
      sources: [],
      items: [],
    });
  }
}

export async function POST() {
  try {
    const payload = await syncAllFeeds();
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to sync feeds",
      },
      { status: 500 }
    );
  }
}
