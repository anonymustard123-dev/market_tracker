// Newsletter article generation — deterministic, no external API.
// Reads the live market snapshot and writes six full articles per day:
//   - Market Briefing (3 articles across asset classes)
//   - Clients & Competitors (3 articles)
// Each article has the requested structure:
//   title, date, author, 2-paragraph overview, and a 4-part BNY analysis
//   (impact on BNY, why it matters, what BNY is doing, economic implications).

export type Article = {
  id: string;
  title: string;
  date: string;        // ISO date
  author: string;
  overview: string[];  // 2 paragraphs
  analysis: {
    bnyImpact: string;
    whyItMatters: string;
    bnyResponse: string;
    economicImplications: string;
  };
  source: string;
  category?: string;
};

export type Newsletter = {
  generatedAt: number;
  marketBriefing: Article[];
  clientsAndCompetitors: Article[];
};

export type MarketSnapshot = {
  asset: string;
  symbol: string;
  price: number | null;
  daily: number | null;
  weekly: number | null;
  ytd: number | null;
};

// -------- helpers --------
type Num = number | null | undefined;

function fmt(n: Num, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function pct(n: Num): string {
  if (n == null || !Number.isFinite(n)) return "n/a";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
function dir(n: Num): "up" | "down" | "flat" {
  if (n == null) return "flat";
  if (n > 0.05) return "up";
  if (n < -0.05) return "down";
  return "flat";
}
function movePhrase(n: Num, upWord: string, downWord: string): string {
  if (n == null || !Number.isFinite(n)) return "was little changed";
  if (Math.abs(n) < 0.1) return "traded roughly flat";
  return `${n > 0 ? upWord : downWord} ${Math.abs(n).toFixed(2)}%`;
}
function todayISO(): string {
  return new Date().toISOString();
}
function todayLong(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// Find an asset by symbol helper
function find(snaps: MarketSnapshot[], symbol: string): MarketSnapshot | undefined {
  return snaps.find(s => s.symbol === symbol);
}

// -------- Market Briefing articles --------
function buildCryptoArticle(snaps: MarketSnapshot[]): Article {
  const btc = find(snaps, "BTC-USD");
  const eth = find(snaps, "ETH-USD");
  const sol = find(snaps, "SOL-USD");
  const ibit = find(snaps, "IBIT");
  const btcDir = dir(btc?.daily);
  const cryptoUp = btcDir === "up";

  const title = cryptoUp
    ? "Digital Assets Rally as Bitcoin Leads Broad Crypto Advance"
    : btcDir === "down"
    ? "Crypto Pulls Back as Digital Assets Lose Ground"
    : "Digital Assets Steady as Crypto Markets Consolidate";

  const overview = [
    `Bitcoin ${movePhrase(btc?.daily, "gained", "fell")} to trade near $${fmt(btc?.price, 0)} on ${todayLong()}, with Ethereum ${movePhrase(eth?.daily, "up", "down")} at $${fmt(eth?.price, 0)} and Solana ${movePhrase(sol?.daily, "up", "down")} at $${fmt(sol?.price, 2)}. The ${cryptoUp ? "advance" : btcDir === "down" ? "pullback" : "rangebound session"} reflects ${cryptoUp ? "renewed risk appetite and continued institutional flows into spot crypto ETFs" : btcDir === "down" ? "profit-taking and a softer risk tone across digital assets" : "consolidation as participants await fresh macro catalysts"}. Year-to-date, Bitcoin is ${pct(btc?.ytd)} ${dir(btc?.ytd) === "up" ? "higher" : dir(btc?.ytd) === "down" ? "lower" : "unchanged"}.`,
    `The iShares Bitcoin ETF (IBIT) ${movePhrase(ibit?.daily, "rose", "slipped")} alongside spot crypto, ${cryptoUp ? "absorbing fresh inflows" : "seeing modest outflows"} as investors repositioned across regulated crypto vehicles. On-chain activity and ETF flow data suggest ${cryptoUp ? "continued participation from larger holders and institutional allocators" : "a more cautious posture, though structural adoption trends remain intact"}. Volatility in digital assets remains elevated relative to traditional risk assets, keeping crypto as a distinct driver of cross-asset correlation and a key watchpoint for custodians and asset servicers.`,
  ];

  return {
    id: "mb-crypto",
    title,
    date: todayISO(),
    author: "BNY Markets Strategy Desk",
    overview,
    analysis: {
      bnyImpact: `BNY serves as custodian and service provider to a number of digital-asset ETFs and tokenization initiatives, so crypto price action directly influences assets under custody and servicing revenue. ${cryptoUp ? "Higher prices and inflow cycles expand BNY's fee base" : "Pullbacks moderate AUC growth, though BNY's diversified franchise limits the sensitivity"}, with IBIT and related vehicles translating spot moves into servicing activity.`,
      whyItMatters: "Digital-asset servicing is a strategic growth frontier where scale, trust, and regulatory standing confer durable advantages. AUC growth in crypto compounds BNY's fee base and reinforces its positioning relative to peers also pursuing tokenized collateral and on-chain settlement.",
      bnyResponse: "BNY continues to extend its digital custody and tokenization platform, partnering with regulated venues and integrating on-chain settlement into its servicing stack. The firm's collateral infrastructure and fund-administration scale let it offer integrated digital-asset servicing rather than custody in isolation.",
      economicImplications: cryptoUp
        ? "Broader digital-asset adoption signals a structural shift in how collateral and cash are mobilized, with implications for money-market flows, stablecoin reserves, and Treasury demand. A rising crypto complex tends to coincide with looser financial conditions and greater risk-taking."
        : "Crypto drawdowns often coincide with tighter speculative positioning and can signal broader risk-asset stress. The pullback tests the durability of recent institutional adoption and may redirect flows toward safer assets like Treasuries and the dollar.",
    },
    source: "BNY Strategy",
    category: "Crypto",
  };
}

function buildRatesArticle(snaps: MarketSnapshot[]): Article {
  const tnx = find(snaps, "^TNX");
  const dxy = find(snaps, "DX-Y.NYB");
  const yieldUp = dir(tnx?.daily) === "up";

  const title = yieldUp
    ? "Treasuries Sell Off as 10-Year Yield Climbs"
    : dir(tnx?.daily) === "down"
    ? "Bonds Rally as 10-Year Yield Eases"
    : "Treasuries Steady as 10-Year Yield Holds";

  const overview = [
    `The 10-year Treasury yield ${movePhrase(tnx?.daily, "rose", "eased")} to ${fmt(tnx?.price, 2)}% on ${todayLong()}, ${yieldUp ? "reflecting shifting expectations around growth, inflation, and the policy path" : dir(tnx?.daily) === "down" ? "as investors priced in softer growth or cooling inflation expectations" : "as markets consolidated ahead of fresh economic data"}. Year-to-date the 10-year yield is ${pct(tnx?.ytd)}, ${dir(tnx?.ytd) === "up" ? "higher" : dir(tnx?.ytd) === "down" ? "lower" : "roughly flat"}, with curve dynamics and real-yield moves instructive for duration positioning.`,
    `The US Dollar Index ${movePhrase(dxy?.daily, "strengthened", "weakened")} to ${fmt(dxy?.price, 2)}, ${dir(dxy?.daily) === "up" ? "tracking the yield move and reinforcing the dollar's role as the funding currency of choice" : dir(dxy?.daily) === "down" ? "easing alongside softer yields" : "holding steady"} against a basket of major currencies. Collateral valuations and repo-market liquidity respond directly to yield levels, making the back-end of the curve a key input for secured-funding markets and asset-servicing operations.`,
  ];

  return {
    id: "mb-rates",
    title,
    date: todayISO(),
    author: "BNY Rates Desk",
    overview,
    analysis: {
      bnyImpact: `BNY is the largest tri-party collateral agent globally, so yield moves revalue collateral pools and drive activity in clearing, margin, and securities lending. ${yieldUp ? "Rising yields lift collateral income but also raise margin calls and funding costs for clients" : "Falling yields ease funding pressure but compress net interest spreads on float"}, with the net effect flowing through BNY's treasury-services and collateral lines.`,
      whyItMatters: "Rate volatility increases demand for BNY's collateral optimization and treasury-services infrastructure, supporting fee resilience even in risk-off regimes. As the dominant collateral agent, BNY benefits structurally from any environment that increases margin and settlement activity.",
      bnyResponse: "BNY is investing in real-time collateral mobility and integrated treasury platforms to help clients manage margin calls, optimize collateral allocation, and access liquidity more efficiently across currencies and time zones.",
      economicImplications: yieldUp
        ? "Higher yields raise borrowing costs across the economy, pressuring housing, capex, and equity valuations. A steeper yield curve can signal growth optimism or inflation concern, while a stronger dollar tightens global financial conditions."
        : "Lower yields ease financial conditions, supporting risk assets and refinancing activity. A softer dollar can relieve pressure on emerging-market borrowers and commodity producers, though persistent ease risks reigniting inflation.",
    },
    source: "BNY Strategy",
    category: "Rates",
  };
}

function buildEquitiesArticle(snaps: MarketSnapshot[]): Article {
  const spx = find(snaps, "^GSPC");
  const ndx = find(snaps, "^NDX");
  const gold = find(snaps, "GC=F");
  const eqUp = dir(spx?.daily) === "up";

  const title = eqUp
    ? "Equities Advance as Risk Appetite Builds"
    : dir(spx?.daily) === "down"
    ? "Equities Soften as Investors De-risk"
    : "Equities Flat as Markets Search for Direction";

  const overview = [
    `The S&P 500 ${movePhrase(spx?.daily, "gained", "lost")} to ${fmt(spx?.price, 2)} on ${todayLong()}, while the NASDAQ 100 ${movePhrase(ndx?.daily, "rose", "fell")} to ${fmt(ndx?.price, 2)}. ${eqUp ? "The advance was broad-based, with cyclical and rate-sensitive groups participating alongside megacap technology" : dir(spx?.daily) === "down" ? "The pullback reflected a softer risk tone, with investors hedging into a mixed earnings and macro backdrop" : "Markets consolidated as participants weighed cross-currents in rates, earnings, and positioning"}. Year-to-date the S&P is ${pct(spx?.ytd)} and the NASDAQ ${pct(ndx?.ytd)}.`,
    `Gold ${movePhrase(gold?.daily, "rose", "eased")} to $${fmt(gold?.price, 2)} per ounce, ${dir(gold?.daily) === "up" ? "catching a bid as a hedge against macro and geopolitical uncertainty" : dir(gold?.daily) === "down" ? "pulling back as real yields and the dollar firmed" : "holding steady"}. Index-level moves mask significant dispersion underneath, with leadership concentration and sector rotation remaining focal points for assessing the durability of the equity trend.`,
  ];

  return {
    id: "mb-equities",
    title,
    date: todayISO(),
    author: "BNY Investment Strategy",
    overview,
    analysis: {
      bnyImpact: `Equity-market levels drive custody and fund-administration AUC, performance fees, and securities-lending demand across BNY's asset-servicing franchise. ${eqUp ? "Rising markets lift the fee base with minimal marginal cost" : "Drawdowns pressure AUC and lending revenue, though elevated volatility can lift clearing and collateral activity"}, making equity direction a key lever on BNY's operating leverage.`,
      whyItMatters: "Sustained equity appreciation compounds BNY's fee base at high incremental margins, while volatility cycles increase demand for the firm's data, analytics, and collateral infrastructure. Either regime supports the franchise, though direction matters for near-term revenue.",
      bnyResponse: "BNY leverages its data and analytics platform to give asset-manager clients near-real-time exposure and risk views, deepening stickiness. Its collateral and securities-lending infrastructure captures activity whether markets rise or fall.",
      economicImplications: eqUp
        ? "Rising equities support household wealth, consumer spending, and corporate financing conditions, reinforcing a virtuous cycle. Concentration in a few megacaps, however, can mask underlying breadth weakness."
        : "Equity drawdowns can tighten financial conditions, weigh on consumer confidence, and slow capital formation. Gold's behavior alongside equities signals whether the move is risk-driven or reflects broader macro stress.",
    },
    source: "BNY Strategy",
    category: "Equities",
  };
}

// -------- Clients & Competitors articles --------
function buildStateStreetArticle(snaps: MarketSnapshot[]): Article {
  const btc = find(snaps, "BTC-USD");
  const cryptoUp = dir(btc?.daily) === "up";
  return {
    id: "cc-statestreet",
    title: cryptoUp
      ? "State Street Targets Digital-Asset Servicing as Crypto Demand Returns"
      : "State Street Presses on Digital Custody Despite Crypto Pullback",
    date: todayISO(),
    author: "BNY Competitive Intelligence",
    overview: [
      `State Street continued to invest in its digital-asset custody and tokenization capabilities on ${todayLong()}, signaling sustained commitment to regulated on-chain servicing. The push comes as asset managers ${cryptoUp ? "renew demand for institutional-grade crypto exposure following the market's recent advance" : "reassess digital-asset exposure after the latest pullback"}, with Bitcoin ${pct(btc?.daily)} on the day.`,
      "The competitive landscape for digital custody remains concentrated among the largest trust banks, each racing to integrate tokenized funds, cash, and collateral into legacy servicing platforms. State Street's positioning directly contests BNY's own digital-asset franchise, making the category a key battleground for the next cycle of custody share.",
    ],
    analysis: {
      bnyImpact: "State Street is BNY's closest peer in custody and asset servicing, so its digital push directly contests BNY's positioning in tokenized collateral and fund servicing. Share gained by a peer in digital custody is share not captured by BNY in a high-growth category.",
      whyItMatters: "Digital-asset servicing is a strategic growth frontier where early scale confers network effects — winning mandates now compounds over time as tokenized collateral and on-chain settlement become mainstream infrastructure.",
      bnyResponse: "BNY continues to extend its own digital platform, leveraging its collateral and fund-administration scale to offer integrated tokenization rather than custody in isolation. Its tri-party collateral infrastructure gives it a structural entry point into on-chain settlement.",
      economicImplications: "Tokenization of funds and collateral could materially change settlement cycles and money-market structure over the medium term, with implications for intraday liquidity, collateral velocity, and the role of stablecoins in payments.",
    },
    source: "BNY Intelligence",
    category: "Competitor",
  };
}

function buildBlackRockArticle(snaps: MarketSnapshot[]): Article {
  const spx = find(snaps, "^GSPC");
  const ibit = find(snaps, "IBIT");
  const eqUp = dir(spx?.daily) === "up";
  return {
    id: "cc-blackrock",
    title: eqUp
      ? "BlackRock ETF Inflows Accelerate as Equity Markets Rise"
      : "BlackRock ETF Complex Holds Inflows Through Market Churn",
    date: todayISO(),
    author: "BNY Client Intelligence",
    overview: [
      eqUp
        ? `BlackRock's ETF complex continued to absorb flows on ${todayLong()}, with equity and crypto products leading as the S&P 500 ${pct(spx?.daily)}. As a major BNY custody and fund-administration client, BlackRock's AUC growth flows directly through to BNY's servicing lines.`
        : `BlackRock's ETF complex held firm on ${todayLong()}, with fixed-income and crypto products absorbing flows amid a ${pct(spx?.daily)} equity session. As a major BNY custody and fund-administration client, BlackRock's AUC growth flows directly through to BNY's servicing lines.`,
      `The iShares Bitcoin ETF (IBIT) ${movePhrase(ibit?.daily, "rose", "fell")} alongside spot crypto, reinforcing the link between issuer flows and underlying market direction. The concentration of ETF issuance among a few large managers underscores the importance of servicing relationships at the issuer level, where scale and integration create switching costs.`,
    ],
    analysis: {
      bnyImpact: "BlackRock is among BNY's largest custody and fund-administration clients, so its ETF growth translates directly into servicing revenue and securities-lending activity. Issuer-level flows are a high-quality, recurring revenue stream tied to AUC rather than transaction volume.",
      whyItMatters: "Deep relationships with top issuers create a moat — switching costs and integrated data flows make BNY sticky through market cycles. Losing or under-serving a marquee issuer like BlackRock would materially weaken BNY's fund-servicing franchise.",
      bnyResponse: "BNY deepens integration with issuer clients via data, analytics, and collateral services bundled alongside core custody, raising the cost of switching and expanding wallet share within the relationship.",
      economicImplications: "ETF growth reshapes price discovery and liquidity in underlying markets, with implications for Treasury demand, securities lending, and the structure of fund flows across the asset-management industry.",
    },
    source: "BNY Intelligence",
    category: "Client",
  };
}

function buildJPMorganArticle(snaps: MarketSnapshot[]): Article {
  const tnx = find(snaps, "^TNX");
  const dxy = find(snaps, "DX-Y.NYB");
  const yieldUp = dir(tnx?.daily) === "up";
  return {
    id: "cc-jpmorgan",
    title: yieldUp
      ? "JPMorgan Treasury Services in Focus as Rates, Dollar Climb"
      : "JPMorgan Expands Real-Time Payments as Treasury Needs Evolve",
    date: todayISO(),
    author: "BNY Competitive Intelligence",
    overview: [
      `JPMorgan continued to expand its real-time treasury and payments capabilities on ${todayLong()}, targeting corporate treasury clients with faster settlement and integrated liquidity tools. The 10-year yield at ${fmt(tnx?.price, 2)}% and the dollar at ${fmt(dxy?.price, 2)} ${yieldUp ? "raise the stakes for efficient cash and collateral management" : "keep treasury optimization top of mind for corporates"}, sharpening competition with BNY in wholesale payments.`,
      "Real-time payments are becoming a baseline expectation for corporate clients, pressuring incumbents to modernize legacy rails. JPMorgan's scale in commercial banking and its technology spend make it a formidable competitor for corporate wallet share in treasury services.",
    ],
    analysis: {
      bnyImpact: "JPMorgan competes directly with BNY's treasury-services franchise; payments modernization is a front-line battleground for corporate wallet share. BNY's clearing and collateral scale is a counterweight, but payments rail quality increasingly drives the relationship.",
      whyItMatters: "Treasury services is a high-frequency, sticky revenue stream tied to transaction volume rather than market levels. Falling behind on real-time rails risks disintermediation over time, even where custody relationships remain intact.",
      bnyResponse: "BNY is investing in its payments hub and API-first treasury platform to keep pace with real-time expectations while leveraging its clearing scale and collateral infrastructure as differentiated, bundled value.",
      economicImplications: "Faster payment settlement improves working-capital efficiency economy-wide and changes intraday liquidity needs, with knock-on effects for money-market funds, repo, and the demand for intraday credit from clearing banks.",
    },
    source: "BNY Intelligence",
    category: "Competitor",
  };
}

// -------- Public API (synchronous, no network) --------
export function generateNewsletter(snaps: MarketSnapshot[]): Newsletter {
  const marketBriefing: Article[] = [
    buildCryptoArticle(snaps),
    buildRatesArticle(snaps),
    buildEquitiesArticle(snaps),
  ];
  const clientsAndCompetitors: Article[] = [
    buildStateStreetArticle(snaps),
    buildBlackRockArticle(snaps),
    buildJPMorganArticle(snaps),
  ];

  return {
    generatedAt: Date.now(),
    marketBriefing,
    clientsAndCompetitors,
  };
}
