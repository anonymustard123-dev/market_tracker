# Markets Strategy Dashboard

A sleek, BNY-inspired dark-navy dashboard tracking daily, weekly, monthly, and YTD
percent changes across crypto, equities, indices, commodities, rates, and FX — with
live data and sparkline visualizations.

## Tracked assets
- **Crypto:** Bitcoin, Ethereum, Solana
- **Indices:** S&P 500, NASDAQ 100
- **Equities:** iShares Bitcoin ETF (IBIT)
- **Commodities:** Gold
- **Rates:** 10-Year Treasury Yield
- **FX:** US Dollar Index

## Features
- Live data via Yahoo Finance (auto-refresh every 5 minutes)
- Per-asset sparklines (≈90-day close history)
- Daily / Weekly / Monthly / YTD % change pills
- Cross-asset breadth bars (up vs. down counts per period)
- Top daily gainers & losers with proportional bars
- **Daily Briefing tab**: market newsletter generated from live data with
  BNY-focused analysis + clients & competitors section

## Tabs
1. **Markets Dashboard** — live cross-asset performance grid
2. **Daily Briefing** — AI-generated newsletter (OpenAI) analyzing the day's
   live market data:
   - *Market Briefing*: 3 articles covering crypto, rates, and equities, each
     with a 2-paragraph overview and a 4-part BNY analysis (impact, why it
     matters, what BNY is doing, economic implications)
   - *Clients & Competitors*: 3 articles on BNY's clients and competitors tied
     to the day's market backdrop

## Environment variables
The newsletter calls OpenAI **directly from the browser** to bypass Vercel's
serverless function timeout (Hobby tier caps functions at ~10s, too short for
LLM generation). This requires a public key:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_OPENAI_API_KEY` | Yes (for briefing) | OpenAI API key. Exposed in client bundle — acceptable for a read-only dashboard. |

⚠ **Security note:** Because the key is `NEXT_PUBLIC_`, it is visible in the
browser. Use a key with spending limits set in OpenAI's dashboard. Get one at
[platform.openai.com/api-keys](https://platform.openai.com/api-keys).

Market data (Yahoo Finance) requires no key.

## Data source
Yahoo Finance public chart API (`query1.finance.yahoo.com/v8/finance/chart`).
No API key required. Data is cached at the edge for 5 minutes.

## Develop
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy on Vercel
1. Push this repo to GitHub.
2. Import the repo at [vercel.com](https://vercel.com/new).
3. Framework preset: **Next.js**. No environment variables needed.
4. Deploy.
