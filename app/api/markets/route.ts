import { NextResponse } from "next/server";
import { fetchAllAssets } from "@/lib/assets";

// Vercel edge function caching: revalidate every 5 min via lib fetch next.revalidate.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchAllAssets();
  return NextResponse.json(
    { asOf: Date.now(), data },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
