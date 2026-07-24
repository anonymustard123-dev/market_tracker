import { NextResponse } from "next/server";
import { fetchAllAssets } from "@/lib/assets";
import { generateNewsletter, type MarketSnapshot } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const assets = await fetchAllAssets();
  const snaps: MarketSnapshot[] = assets.map(a => ({
    asset: a.asset.name,
    symbol: a.asset.symbol,
    price: a.price,
    daily: a.changes.daily,
    weekly: a.changes.weekly,
    ytd: a.changes.ytd,
  }));

  const newsletter = generateNewsletter(snaps);

  return NextResponse.json(
    { newsletter },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
