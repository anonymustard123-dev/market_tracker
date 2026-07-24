import { NextResponse } from "next/server";
import { fetchAllAssets } from "@/lib/assets";
import { generateNewsletter, type MarketSnapshot } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
// Two serial GLM calls can take 60-90s total. Allow up to 120s (Vercel Pro).
// On hobby tier this caps at 60s and one call may fall back to canned content.
export const maxDuration = 120;

export async function GET() {
  // Fetch live market data to feed the newsletter context
  const assets = await fetchAllAssets();
  const snaps: MarketSnapshot[] = assets.map(a => ({
    asset: a.asset.name,
    symbol: a.asset.symbol,
    price: a.price,
    daily: a.changes.daily,
    weekly: a.changes.weekly,
    ytd: a.changes.ytd,
  }));

  const newsletter = await generateNewsletter(snaps);

  return NextResponse.json(
    { newsletter },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
