// Newsletter article generation via OpenAI — called CLIENT-SIDE to bypass
// Vercel's serverless function timeout (Hobby = 10s, too short for LLM calls).
// The API key is exposed in the client bundle via NEXT_PUBLIC_OPENAI_API_KEY.
// This is acceptable for a read-only dashboard but NOT for sensitive apps.

export type Article = {
  id: string;
  title: string;
  date: string;
  author: string;
  overview: string[];
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

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export function hasApiKey(): boolean {
  return typeof process.env.NEXT_PUBLIC_OPENAI_API_KEY === "string"
    && process.env.NEXT_PUBLIC_OPENAI_API_KEY.length > 10;
}

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

function buildPrompt(snaps: MarketSnapshot[]): string {
  const movers = snaps.filter(s => s.daily != null).slice(0, 6);
  const movesText = movers.map(s => `${s.asset} ${s.daily! >= 0 ? "+" : ""}${s.daily!.toFixed(2)}%`).join(", ");
  const today = new Date().toDateString();

  return `You are the editorial desk at BNY (The Bank of New York Mellon Corporation), the world's largest custodian bank and a major global financial services firm. Today is ${today}.

Here is the LIVE market snapshot you are covering:
${snapshotToText(snaps)}

Write a daily strategy briefing with TWO sections, 3 articles each (6 total).

SECTION 1 — "market_briefing": 3 distinct articles grounded in the market moves above. Interpret what is actually driving the moves and tie analysis specifically to BNY's business: custody, asset servicing, collateral management, treasury services, investment management (BNY Investment), and capital markets. Vary across asset classes (crypto, rates, equities, FX, macro) — do NOT make all three about crypto.

SECTION 2 — "clients_and_competitors": 3 articles about BNY's CLIENTS and COMPETITORS. Cover firms such as State Street, JPMorgan, Citi, BlackRock, Northern Trust, Goldman Sachs Asset Management, Apollo, Franklin Templeton, and major BNY custody/servicing clients (asset managers, sovereign wealth funds, pension funds). Tie stories plausibly to the market backdrop (${movesText}) — e.g. asset managers repositioning after crypto/rate moves, ETF issuers, collateral needs, tokenization initiatives, fund admin mandates.

For EACH article object use EXACTLY these keys:
{"title","author","overview_p1","overview_p2","bny_impact","why_it_matters","bny_response","economic_implications","category"}

- title: a real news-style headline
- author: a plausible analyst byline (e.g. "BNY Markets Strategy Desk")
- overview_p1: 4-5 sentences, factual summary of what happened in markets
- overview_p2: 4-5 sentences, context / why it matters in markets
- bny_impact: 3-4 sentences analyzing how this directly affects BNY's business lines
- why_it_matters: 3-4 sentences on strategic relevance to BNY specifically
- bny_response: 3-4 sentences on what BNY is doing / positioned to do (custody scale, tech platform, collateral infrastructure, etc.)
- economic_implications: 3-4 sentences on broader macro / economic implications
- category: e.g. "Crypto", "Rates", "Equities", "Macro", "FX", "Client", "Competitor"

Make the BNY analysis genuinely analytical — synthesize the market move with BNY's business model, don't just restate generic custody talking points. Keep paragraphs solid but tight: important information, minimal fluff.

Return ONLY this JSON shape, no markdown fences, no commentary:
{"market_briefing":[3 article objects],"clients_and_competitors":[3 article objects]}`;
}

function extractJsonObject(content: string): any {
  let s = content.replace(/```(?:json)?/gi, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(s.slice(start, end + 1));
}

function mapArticle(raw: any, fallbackId: string, source: string): Article {
  return {
    id: fallbackId,
    title: String(raw.title ?? "Untitled"),
    date: new Date().toISOString(),
    author: String(raw.author ?? "BNY Strategy Desk"),
    overview: [
      String(raw.overview_p1 ?? ""),
      String(raw.overview_p2 ?? ""),
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

// -------- Client-side generation (no server function involved) --------
export async function generateNewsletterClient(snaps: MarketSnapshot[]): Promise<Newsletter> {
  const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_OPENAI_API_KEY not set");

  const res = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a financial editorial system. You output ONLY valid JSON, no markdown, no prose around it.",
        },
        { role: "user", content: buildPrompt(snaps) },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI API ${res.status}: ${txt.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("OpenAI returned empty content");

  const parsed = extractJsonObject(content);
  const mbRaw = Array.isArray(parsed?.market_briefing) ? parsed.market_briefing : [];
  const ccRaw = Array.isArray(parsed?.clients_and_competitors) ? parsed.clients_and_competitors : [];

  return {
    generatedAt: Date.now(),
    marketBriefing: mbRaw.map((r: any, i: number) => mapArticle(r, `mb-${i}`, "BNY Strategy · OpenAI")),
    clientsAndCompetitors: ccRaw.map((r: any, i: number) => mapArticle(r, `cc-${i}`, "BNY Intelligence · OpenAI")),
  };
}
