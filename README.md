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
- **Daily Briefing tab**: AI-generated market newsletter (GLM 5.2) with
  BNY-focused analysis + clients & competitors section

## Tabs
1. **Markets Dashboard** — live cross-asset performance grid
2. **Daily Briefing** — auto-generated newsletter:
   - *Market Briefing*: 3 articles covering the day's market moves, each with
     a 2-paragraph overview and a 4-part BNY analysis (impact, why it matters,
     what BNY is doing, economic implications)
   - *Clients & Competitors*: 3 articles on BNY's clients and competitors

## Environment variables (optional)
The newsletter uses OpenAI for article generation. **If no key is set,
the dashboard falls back to canned sample articles** so it always renders.

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | No | OpenAI API key. Enables live AI-generated newsletter. |
| `OPENAI_MODEL` | No | Model name (default `gpt-4o-mini`). |

To enable live generation, add `OPENAI_API_KEY` in Vercel → Project → Settings →
Environment Variables, then redeploy. Get a key at
[platform.openai.com/api-keys](https://platform.openai.com/api-keys).

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
