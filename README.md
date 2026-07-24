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
