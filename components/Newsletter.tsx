"use client";

import { useEffect, useState } from "react";
import {
  generateNewsletterClient,
  hasApiKey,
  type Article,
  type Newsletter as NL,
  type MarketSnapshot,
} from "@/lib/newsletter";

type MarketsResponse = { asOf: number; data: any[] };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <article className="nl-article fade" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="nl-article-head">
        {article.category && <span className="nl-cat">{article.category}</span>}
        <h2 className="nl-title">{article.title}</h2>
        <div className="nl-byline">
          <span className="nl-author">{article.author}</span>
          <span className="nl-dot">·</span>
          <span className="nl-date">{fmtDate(article.date)}</span>
        </div>
      </div>

      <div className="nl-overview">
        {article.overview.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="nl-analysis">
        <div className="nl-analysis-label">BNY Analysis</div>
        <div className="nl-analysis-grid">
          <div className="nl-analysis-item">
            <div className="nl-analysis-key">Impact on BNY</div>
            <div className="nl-analysis-val">{article.analysis.bnyImpact}</div>
          </div>
          <div className="nl-analysis-item">
            <div className="nl-analysis-key">Why It Matters to BNY</div>
            <div className="nl-analysis-val">{article.analysis.whyItMatters}</div>
          </div>
          <div className="nl-analysis-item">
            <div className="nl-analysis-key">What BNY Is Doing</div>
            <div className="nl-analysis-val">{article.analysis.bnyResponse}</div>
          </div>
          <div className="nl-analysis-item">
            <div className="nl-analysis-key">Economic Implications</div>
            <div className="nl-analysis-val">{article.analysis.economicImplications}</div>
          </div>
        </div>
      </div>

      <div className="nl-source">{article.source}</div>
    </article>
  );
}

export default function NewsletterView() {
  const [nl, setNl] = useState<NL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noKey, setNoKey] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    if (!hasApiKey()) {
      setNoKey(true);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch live market data
      const mr = await fetch("/api/markets", { cache: "no-store" });
      if (!mr.ok) throw new Error(`Markets fetch failed: HTTP ${mr.status}`);
      const mjson: MarketsResponse = await mr.json();

      const snaps: MarketSnapshot[] = mjson.data.map((a: any) => ({
        asset: a.asset.name,
        symbol: a.asset.symbol,
        price: a.price,
        daily: a.changes.daily,
        weekly: a.changes.weekly,
        ytd: a.changes.ytd,
      }));

      // 2. Generate the newsletter client-side via OpenAI (no server function
      //    timeout involved — the browser has no execution time limit).
      const newsletter = await generateNewsletterClient(snaps);
      setNl(newsletter);
      setNoKey(false);
    } catch (e: any) {
      setError(e?.message || "Failed to generate newsletter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 14px" }} />
          <div>Generating today's briefing with OpenAI…</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-faint)" }}>
            Analyzing live market data — this takes 10-20 seconds.
          </div>
        </div>
      </div>
    );
  }

  if (noKey) {
    return (
      <div className="nl-wrap fade">
        <div className="error-box" style={{ maxWidth: 600, margin: "40px auto" }}>
          <strong>OpenAI API key not configured.</strong>
          <p style={{ margin: "10px 0 0", color: "var(--text-dim)", lineHeight: 1.6 }}>
            Add <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_OPENAI_API_KEY</code> in
            Vercel → Settings → Environment Variables, then redeploy to enable AI-generated briefing articles.
          </p>
        </div>
      </div>
    );
  }

  if (error && !nl) {
    return (
      <div className="nl-wrap fade">
        <div className="error-box" style={{ maxWidth: 600, margin: "40px auto" }}>
          ⚠ {error}
          <button
            onClick={load}
            style={{
              display: "block", marginTop: 12, cursor: "pointer",
              background: "var(--accent)", color: "#06122c", border: "none",
              padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!nl) return null;

  return (
    <div className="nl-wrap fade">
      <div className="nl-header">
        <div>
          <h1 className="nl-h1">Daily Strategy Briefing</h1>
          <div className="nl-sub">
            AI-generated market intelligence · {new Date(nl.generatedAt).toLocaleString("en-US", {
              month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div className="nl-section-title">Market Briefing</div>
      <div className="nl-grid">
        {nl.marketBriefing.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} />
        ))}
      </div>

      <div className="nl-section-title">Clients &amp; Competitors</div>
      <div className="nl-grid">
        {nl.clientsAndCompetitors.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} />
        ))}
      </div>
    </div>
  );
}
