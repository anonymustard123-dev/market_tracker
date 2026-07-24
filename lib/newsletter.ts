// Newsletter article generation via GLM 5.2 (Z.ai)
// Uses ZAI_API_KEY env var. If unset, falls back to canned sample articles
// so the dashboard still renders in preview/dev.

export type Article = {
  id: string;
  title: string;
  date: string;        // ISO date
  author: string;
  overview: string[];  // 2 paragraphs
  analysis: {
    bnyImpact: string;       // how this affects BNY
    whyItMatters: string;    // why it matters to BNY
    bnyResponse: string;     // what BNY is doing to combat/work with this
    economicImplications: string; // broader economic implications
  };
  source: string;
  category?: string;
};

export type Newsletter = {
  generatedAt: number;
  marketBriefing: Article[];
  clientsAndCompetitors: Article[];
};

const ZAI_ENDPOINT = "https://api.z.ai/api/paas/v4/chat/completions";
const MODEL = process.env.ZAI_MODEL || "glm-5.2";

// -------- Market context feeding the prompt --------
export type MarketSnapshot = {
  asset: string;
  symbol: string;
  price: number | null;
  daily: number | null;
  weekly: number | null;
  ytd: number | null;
};

function snapshotToText(snaps: MarketSnapshot[]): string {
  return snaps
    .filter(s => s.price != null)
    .map(s => {
      const d = s.daily != null ? `${s.daily >= 0 ? "+" : ""}${s.daily.toFixed(2)}%` : "n/a";
      const w = s.weekly != null ? `${s.weekly >= 0 ? "+" : ""}${s.weekly.toFixed(2)}%` : "n/a";
      const y = s.ytd != null ? `${s.ytd >= 0 ? "+" : ""}${s.ytd.toFixed(2)}%` : "n/a";
      return `- ${s.asset} (${s.symbol}): price ${s.price?.toLocaleString("en-US")} | daily ${d} | weekly ${w} | YTD ${y}`;
    })
    .join("\n");
}

// -------- Prompt builder --------
function buildBriefingPrompt(snaps: MarketSnapshot[]): string {
  return `You are the editorial desk at BNY (The Bank of New York Mellon Corporation), the world's largest custodian bank and a major global financial services firm. Today is ${new Date().toDateString()}.

Here is the live market snapshot you are covering:
${snapshotToText(snaps)}

Write 3 distinct news articles for a daily internal strategy briefing targeted at BNY leadership and portfolio managers. Each article should be grounded in the market movements shown above (interpret what is driving them — e.g. crypto rallies, rate moves, dollar strength, equity rotations) and tie the analysis specifically to BNY's business: custody, asset servicing, collateral management, treasury services, investment management (BNY Investment), and capital markets.

For EACH article return STRICT JSON with this exact shape:
{
  "title": string,
  "author": string,            // a plausible analyst byline, e.g. "BNY Markets Strategy Desk"
  "overview_p1": string,       // ~4-5 sentences, factual summary of what happened in markets
  "overview_p2": string,       // ~4-5 sentences, context / why it matters in markets
  "bny_impact": string,        // ~3-4 sentences: how this directly affects BNY's business lines
  "why_it_matters": string,    // ~3-4 sentences: strategic relevance to BNY specifically
  "bny_response": string,      // ~3-4 sentences: what BNY is doing / positioned to do (custody scale, tech platform, collateral, etc.)
  "economic_implications": string, // ~3-4 sentences: broader macro / economic implications
  "category": string            // e.g. "Crypto", "Rates", "Equities", "Macro", "FX"
}

Keep paragraphs solid but tight — important information only, minimal fluff. Vary the three articles across asset classes (do not make all three about crypto).

Return ONLY a JSON array of exactly 3 objects. No markdown fences, no commentary.`;
}

function buildClientsCompetitorsPrompt(snaps: MarketSnapshot[]): string {
  const movers = snaps.filter(s => s.daily != null).slice(0, 6);
  const movesText = movers.map(s => `${s.asset} ${s.daily! >= 0 ? "+" : ""}${s.daily!.toFixed(2)}%`).join(", ");

  return `You are the BNY competitive intelligence desk. Today is ${new Date().toDateString()}. Market backdrop: ${movesText}.

Write 3 news articles focused on BNY's CLIENTS and COMPETITORS. Cover firms such as: State Street, JPMorgan, Citi, BlackRock, Northern Trust, Goldman Sachs Asset Management, Apollo, Franklin Templeton, and major BNY custody/servicing clients (asset managers, sovereign wealth funds, pension funds). Tie stories plausibly to the market backdrop (e.g. asset managers repositioning after crypto/rate moves, ETF issuers, collateral needs, tokenization initiatives, fund admin mandates).

For EACH article return STRICT JSON with this exact shape:
{
  "title": string,
  "author": string,
  "overview_p1": string,       // ~4-5 sentences
  "overview_p2": string,       // ~4-5 sentences
  "bny_impact": string,        // ~3-4 sentences: how this client/competitor move affects BNY
  "why_it_matters": string,    // ~3-4 sentences
  "bny_response": string,      // ~3-4 sentences: how BNY is responding or positioned
  "economic_implications": string, // ~3-4 sentences
  "category": string            // e.g. "Client", "Competitor", "Partnership", "Product"
}

Return ONLY a JSON array of exactly 3 objects. No markdown fences, no commentary.`;
}

// -------- API call --------
async function callGLM(prompt: string): Promise<any[]> {
  const key = process.env.ZAI_API_KEY;
  if (!key) throw new Error("ZAI_API_KEY not set");

  const res = await fetch(ZAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GLM API ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  // strip markdown fences if present
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("GLM returned non-array");
  return parsed;
}

function mapArticle(raw: any, fallbackId: string, source: string): Article {
  return {
    id: fallbackId,
    title: String(raw.title ?? "Untitled"),
    date: new Date().toISOString(),
    author: String(raw.author ?? "BNY Strategy Desk"),
    overview: [
      String(raw.overview_p1 ?? raw.overview?.[0] ?? ""),
      String(raw.overview_p2 ?? raw.overview?.[1] ?? ""),
    ].filter(Boolean),
    analysis: {
      bnyImpact: String(raw.bny_impact ?? ""),
      whyItMatters: String(raw.why_it_matters ?? ""),
      bnyResponse: String(raw.bny_response ?? ""),
      economicImplications: String(raw.economic_implications ?? ""),
    },
    source,
    category: String(raw.category ?? ""),
  };
}

// -------- Fallback canned content (no API key) --------
function fallbackBriefing(snaps: MarketSnapshot[]): Article[] {
  const btc = snaps.find(s => s.symbol === "BTC-USD");
  const tnx = snaps.find(s => s.symbol === "^TNX");
  const spx = snaps.find(s => s.symbol === "^GSPC");
  return [
    {
      id: "fb-1",
      title: btc && (btc.daily ?? 0) > 0 ? "Digital Assets Rally as Bitcoin Reclaims Upside" : "Crypto Volatility Weighs on Sentiment",
      date: new Date().toISOString(),
      author: "BNY Markets Strategy Desk",
      overview: [
        `Bitcoin ${btc ? `traded near $${btc.price?.toLocaleString("en-US")} ${btc.daily != null ? `(${btc.daily >= 0 ? "+" : ""}${btc.daily.toFixed(2)}% on the day)` : ""}` : "moved sharply"}, with Ethereum and Solana tracking the broader crypto complex. The move reflects positioning shifts ahead of macro catalysts and continued institutional flows into digital-asset products.`,
        "Spot crypto ETFs have absorbed meaningful inflows in recent sessions, and on-chain activity suggests renewed participation from larger holders. Volatility remains elevated relative to traditional risk assets, keeping crypto as a distinct driver of cross-asset correlation.",
      ],
      analysis: {
        bnyImpact: "As custodian for a number of digital-asset ETFs and tokenization initiatives, BNY is directly exposed to growth in regulated crypto vehicles. Higher prices and inflows expand assets under custody and servicing revenue.",
        whyItMatters: "Crypto AUC growth compounds BNY's fee base and reinforces its positioning in digital-asset servicing — a strategic frontier where scale and trust matter most.",
        bnyResponse: "BNY continues to extend its digital custody and tokenization platform capabilities, partnering with regulated venues and integrating on-chain settlement into its servicing stack.",
        economicImplications: "Broader digital-asset adoption signals a structural shift in how collateral and cash are mobilized, with implications for money-market flows, stablecoin reserves, and Treasury demand.",
      },
      source: "BNY Strategy",
      category: "Crypto",
    },
    {
      id: "fb-2",
      title: tnx && (tnx.daily ?? 0) > 0 ? "Treasuries Sell Off as 10-Year Yield Rises" : "Yields Ease as Bonds Catch a Bid",
      date: new Date().toISOString(),
      author: "BNY Rates Desk",
      overview: [
        `The 10-year Treasury yield ${tnx ? `sat near ${tnx.price?.toFixed(2)}%` : "moved"} ${tnx?.daily != null ? `(${tnx.daily >= 0 ? "+" : ""}${tnx.daily.toFixed(2)} bps equiv.)` : ""}, reflecting shifting expectations around growth, inflation, and the policy path. Curve dynamics and real-yield moves are instructive for duration positioning.`,
        "Collateral valuations and repo market liquidity respond directly to yield levels, making the back-end of the curve a key input for secured-funding markets and asset-servicing operations.",
      ],
      analysis: {
        bnyImpact: "BNY is the largest tri-party collateral agent globally; yield moves revalue collateral pools and drive activity in clearing, margin, and securities lending.",
        whyItMatters: "Higher realized volatility in rates increases demand for BNY's collateral optimization and treasury-services infrastructure, supporting fee resilience even in risk-off regimes.",
        bnyResponse: "BNY is investing in real-time collateral mobility and integrated treasury platforms to help clients manage margin calls and liquidity more efficiently.",
        economicImplications: "Yield levels shape borrowing costs across the economy, influence equity risk premia, and inform the trajectory of capex and housing.",
      },
      source: "BNY Strategy",
      category: "Rates",
    },
    {
      id: "fb-3",
      title: spx && (spx.daily ?? 0) > 0 ? "Equities Advance as Risk Appetite Builds" : "Equities Soften as Investors Hedge",
      date: new Date().toISOString(),
      author: "BNY Investment Strategy",
      overview: [
        `The S&P 500 ${spx && spx.daily != null ? `${spx.daily >= 0 ? "gained" : "lost"} ${Math.abs(spx.daily).toFixed(2)}%` : "moved"} amid a mixed tape across sectors. Breadth and leadership concentration remain focal points for assessing the durability of the move.`,
        "Index-level positioning masks significant dispersion underneath, with rate-sensitive and cyclical groups diverging from megacap technology.",
      ],
      analysis: {
        bnyImpact: "Equity-market levels drive custody and fund-administration AUC, performance fees, and securities-lending demand across BNY's asset-servicing franchise.",
        whyItMatters: "Sustained equity appreciation lifts the fee base with minimal marginal cost, making equity direction a lever on BNY's operating leverage.",
        bnyResponse: "BNY leverages its data and analytics platform to give asset-manager clients near-real-time exposure and risk views, deepening stickiness.",
        economicImplications: "Equity performance influences household wealth, consumer spending, and corporate financing conditions.",
      },
      source: "BNY Strategy",
      category: "Equities",
    },
  ];
}

function fallbackClientsCompetitors(): Article[] {
  return [
    {
      id: "fc-1",
      title: "State Street Expands Digital Custody Mandate",
      date: new Date().toISOString(),
      author: "BNY Competitive Intelligence",
      overview: [
        "State Street announced further investment in its digital-asset custody capabilities, signaling continued commitment to regulated tokenization and on-chain servicing. The move comes as asset managers seek institutional-grade rails for exposure to digital assets.",
        "The competitive landscape for digital custody remains concentrated among the largest trust banks, each racing to integrate tokenized funds, cash, and collateral into legacy servicing platforms.",
      ],
      analysis: {
        bnyImpact: "State Street is BNY's closest peer in custody and asset servicing; its digital push directly contests BNY's positioning in tokenized collateral and fund servicing.",
        whyItMatters: "Digital-asset servicing is a strategic growth frontier where early scale confers network effects — losing share here compounds over time.",
        bnyResponse: "BNY continues to extend its own digital platform, leveraging its collateral and fund-admin scale to offer integrated tokenization rather than custody in isolation.",
        economicImplications: "Tokenization of funds and collateral could materially change settlement cycles and money-market structure over the medium term.",
      },
      source: "BNY Intelligence",
      category: "Competitor",
    },
    {
      id: "fc-2",
      title: "BlackRock ETF Inflows Drive Servicing Volumes",
      date: new Date().toISOString(),
      author: "BNY Client Intelligence",
      overview: [
        "BlackRock's ETF complex continued to absorb inflows, with crypto and core fixed-income products leading. As a major BNY client, BlackRock's AUC growth flows through to BNY's fund-administration and custody lines.",
        "The concentration of ETF issuance among a few large managers underscores the importance of servicing relationships at the issuer level.",
      ],
      analysis: {
        bnyImpact: "BlackRock is among BNY's largest custody and fund-admin clients; its ETF growth translates directly into servicing revenue and securities-lending activity.",
        whyItMatters: "Deep relationships with top issuers create a moat — switching costs and integrated data flows make BNY sticky through market cycles.",
        bnyResponse: "BNY deepens integration with issuer clients via data, analytics, and collateral services bundled alongside core custody.",
        economicImplications: "ETF growth reshapes price discovery and liquidity, with implications for underlying markets and Treasury demand.",
      },
      source: "BNY Intelligence",
      category: "Client",
    },
    {
      id: "fc-3",
      title: "JPMorgan Treasury Services Pushes Real-Time Payments",
      date: new Date().toISOString(),
      author: "BNY Competitive Intelligence",
      overview: [
        "JPMorgan continued to expand its real-time treasury and payments capabilities, targeting corporate treasury clients with faster settlement and integrated liquidity tools. The bank competes with BNY in wholesale payments and treasury services.",
        "Real-time payments are becoming a baseline expectation for corporate clients, pressuring incumbents to modernize legacy rails.",
      ],
      analysis: {
        bnyImpact: "JPMorgan competes with BNY's treasury-services franchise; payments modernization is a direct battleground for corporate wallet share.",
        whyItMatters: "Treasury services is a high-frequency, sticky revenue stream; falling behind on real-time rails risks disintermediation over time.",
        bnyResponse: "BNY is investing in its payments hub and API-first treasury platform to keep pace with real-time expectations while leveraging its clearing scale.",
        economicImplications: "Faster payment settlement improves working-capital efficiency economy-wide and changes intraday liquidity needs.",
      },
      source: "BNY Intelligence",
      category: "Competitor",
    },
  ];
}

// -------- Public API --------
export async function generateNewsletter(snaps: MarketSnapshot[]): Promise<Newsletter> {
  const key = process.env.ZAI_API_KEY;

  if (!key) {
    // No key — return fallback content so the dashboard still works.
    return {
      generatedAt: Date.now(),
      marketBriefing: fallbackBriefing(snaps),
      clientsAndCompetitors: fallbackClientsCompetitors(),
    };
  }

  try {
    const [briefRaw, ccRaw] = await Promise.all([
      callGLM(buildBriefingPrompt(snaps)),
      callGLM(buildClientsCompetitorsPrompt(snaps)),
    ]);

    const marketBriefing = briefRaw.map((r, i) => mapArticle(r, `mb-${i}`, "BNY Strategy · GLM 5.2"));
    const clientsAndCompetitors = ccRaw.map((r, i) => mapArticle(r, `cc-${i}`, "BNY Intelligence · GLM 5.2"));

    return { generatedAt: Date.now(), marketBriefing, clientsAndCompetitors };
  } catch (e: any) {
    // On API failure, degrade to fallback so the UI never breaks.
    console.error("Newsletter generation failed:", e?.message);
    return {
      generatedAt: Date.now(),
      marketBriefing: fallbackBriefing(snaps),
      clientsAndCompetitors: fallbackClientsCompetitors(),
    };
  }
}
