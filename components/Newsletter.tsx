"use client";

import { useEffect, useState } from "react";
import type { Article, Newsletter as NL } from "@/lib/newsletter";

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

  const load = async () => {
    // Hard client-side timeout so we never spin forever. Streaming generation
    // can legitimately take 60-90s.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 110 * 1000);
    try {
      const r = await fetch("/api/newsletter", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      setNl(json.newsletter as NL);
      setError(null);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("The briefing is taking longer than expected. Showing cached content if available.");
      } else {
        setError(e?.message || "Failed to load newsletter");
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60 * 60 * 1000); // refresh hourly
    return () => clearInterval(id);
  }, []);

  if (loading && !nl) {
    return (
      <div className="loading">
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 14px" }} />
          <div>Generating today's briefing with GLM…</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-faint)" }}>
            Live AI generation — this can take up to a minute.
          </div>
        </div>
      </div>
    );
  }

  if (error && !nl) {
    return <div className="error-box">⚠ {error}</div>;
  }

  if (!nl) return null;

  return (
    <div className="nl-wrap fade">
      <div className="nl-header">
        <div>
          <h1 className="nl-h1">Daily Strategy Briefing</h1>
          <div className="nl-sub">
            Auto-generated market intelligence · {new Date(nl.generatedAt).toLocaleString("en-US", {
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
