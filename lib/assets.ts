// Asset definitions — Yahoo Finance symbols
export type Asset = {
  id: string;
  name: string;
  symbol: string;        // Yahoo Finance ticker
  category: "Crypto" | "Equity" | "Index" | "Commodity" | "Rates" | "FX";
  unit?: string;         // e.g. "%" for treasury yield, "USD" default
  decimals?: number;     // price display precision
};

export const ASSETS: Asset[] = [
  { id: "btc",    name: "Bitcoin",        symbol: "BTC-USD",   category: "Crypto",    decimals: 0 },
  { id: "eth",    name: "Ethereum",       symbol: "ETH-USD",   category: "Crypto",    decimals: 0 },
  { id: "sol",    name: "Solana",         symbol: "SOL-USD",   category: "Crypto",    decimals: 2 },
  { id: "spx",    name: "S&P 500",        symbol: "^GSPC",     category: "Index",     decimals: 2 },
  { id: "ndx",    name: "NASDAQ 100",     symbol: "^NDX",      category: "Index",     decimals: 2 },
  { id: "ibit",   name: "iShares Bitcoin ETF", symbol: "IBIT", category: "Equity",    decimals: 2 },
  { id: "gold",   name: "Gold",           symbol: "GC=F",      category: "Commodity", decimals: 2 },
  { id: "tnx",    name: "10Y Treasury Yield", symbol: "^TNX",  category: "Rates",     unit: "%", decimals: 2 },
  { id: "dxy",    name: "US Dollar Index", symbol: "DX-Y.NYB", category: "FX",        decimals: 2 },
];

export type PeriodKey = "daily" | "weekly" | "monthly" | "ytd";

export type AssetData = {
  asset: Asset;
  price: number | null;
  prevClose: number | null;
  changes: Record<PeriodKey, number | null>;
  // sparkline series (close prices, oldest -> newest) for ~3 months
  spark: { t: number; v: number }[];
  sparkChange: number | null; // change of spark window
  asOf: number | null;        // last quote epoch seconds
  error?: string;
};

const YF = "https://query1.finance.yahoo.com/v8/finance/chart";

function pct(now: number | null, base: number | null): number | null {
  if (now == null || base == null || base === 0) return null;
  return (now - base) / base * 100;
}

function ytdBase(closes: { t: number; v: number }[]): number | null {
  // find first close of current calendar year
  if (closes.length === 0) return null;
  const now = new Date();
  const year = now.getUTCFullYear();
  let base: number | null = null;
  for (const c of closes) {
    const d = new Date(c.t * 1000);
    if (d.getUTCFullYear() === year) { base = c.v; break; }
  }
  if (base == null) base = closes[0].v;
  return base;
}

async function fetchChart(symbol: string, range: string, interval: string): Promise<any> {
  const url = `${YF}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    // cache at edge for 5 min
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status} for ${symbol}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No result for ${symbol}`);
  return result;
}

// Convert any timestamp to seconds
function toSec(t: any): number {
  return typeof t === "number" ? t : Math.floor(Number(t) / 1000);
}

export async function fetchAssetData(asset: Asset): Promise<AssetData> {
  try {
    // 1mo daily for daily/weekly, 1y daily for monthly/ytd base + spark
    const [short, long] = await Promise.all([
      fetchChart(asset.symbol, "1mo", "1d"),
      fetchChart(asset.symbol, "1y", "1d"),
    ]);

    const meta = long.meta || short.meta;
    const price = meta?.regularMarketPrice ?? null;
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;
    const asOf = meta?.regularMarketTime ? toSec(meta.regularMarketTime) : null;

    // Build long daily closes
    const lT: number[] = long.timestamp || [];
    const lQ: any[] = long.indicators?.quote?.[0]?.close || [];
    const longCloses: { t: number; v: number }[] = [];
    for (let i = 0; i < lT.length; i++) {
      const v = lQ[i];
      if (v != null && Number.isFinite(v)) longCloses.push({ t: lT[i], v });
    }

    // spark: last ~90 trading days
    const spark = longCloses.slice(-90).map(c => ({ t: c.t, v: c.v }));
    const sparkChange = spark.length >= 2 ? pct(spark[spark.length - 1].v, spark[0].v) : null;

    // DAILY: price vs prevClose
    const daily = pct(price, prevClose);

    // WEEKLY: price vs close 5 trading days ago (or chartPreviousClose fallback)
    const weeklyBase = longCloses.length >= 6 ? longCloses[longCloses.length - 6].v : prevClose;
    const weekly = pct(price, weeklyBase);

    // MONTHLY: price vs close ~21 trading days ago
    const monthlyBase = longCloses.length >= 22 ? longCloses[longCloses.length - 22].v : null;
    const monthly = pct(price, monthlyBase);

    // YTD
    const ytd = pct(price, ytdBase(longCloses));

    return {
      asset,
      price,
      prevClose,
      changes: { daily, weekly, monthly, ytd },
      spark,
      sparkChange,
      asOf,
    };
  } catch (e: any) {
    return {
      asset,
      price: null,
      prevClose: null,
      changes: { daily: null, weekly: null, monthly: null, ytd: null },
      spark: [],
      sparkChange: null,
      asOf: null,
      error: e?.message || "fetch failed",
    };
  }
}

export async function fetchAllAssets(): Promise<AssetData[]> {
  // serialize to avoid rate limiting
  const out: AssetData[] = [];
  for (const a of ASSETS) {
    out.push(await fetchAssetData(a));
  }
  return out;
}
