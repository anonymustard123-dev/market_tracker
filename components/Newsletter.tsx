"use client";

import { useState } from "react";
import { NEWSLETTER, type Article } from "@/lib/articles";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  ETFs: "#4da3ff",
  Stablecoins: "#2ee6a6",
  Staking: "#b388ff",
  Tokenization: "#e8b339",
  Custody: "#ff8a65",
  Crypto: "#4da3ff",
  Rates: "#2ee6a6",
  Client: "#7c9cff",
  Competitor: "#ff5c7a",
};

function catColor(cat: string): string {
  return CATEGORY_COLORS[cat] || "#9fb0d4";
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const [expanded, setExpanded] = useState(index < 2); // first two expanded by default
  const color = catColor(article.category);

  return (
    <article
      className="nl-card fade"
      style={{ animationDelay: `${index * 70}ms`, "--accent-c": color } as React.CSSProperties}
    >
      <div className="nl-card-rail" style={{ background: color }} />
      <div className="nl-card-body">
        <div className="nl-card-top">
          <span className="nl-cat-chip" style={{ color, borderColor: `${color}55`, background: `${color}1a` }}>
            {article.category}
          </span>
          <span className="nl-tag">{article.tag}</span>
          <span className="nl-readtime">{article.readTime}</span>
        </div>

        <h2 className="nl-card-title" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
          {article.title}
        </h2>

        <div className="nl-card-byline">
          <span className="nl-byline-author">{article.author}</span>
          <span className="nl-byline-sep">·</span>
          <span className="nl-byline-date">{fmtDate(article.date)}</span>
        </div>

        <div className="nl-card-overview">
          {article.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <button className="nl-expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide BNY analysis ▲" : "BNY analysis ▼"}
        </button>

        {expanded && (
          <div className="nl-analysis-block">
            <div className="nl-analysis-header">
              <span className="nl-analysis-icon">◆</span>
              BNY Strategic Analysis
            </div>
            <div className="nl-analysis-grid">
              <div className="nl-analysis-cell">
                <div className="nl-cell-label">Impact on BNY</div>
                <div className="nl-cell-text">{article.analysis.bnyImpact}</div>
              </div>
              <div className="nl-analysis-cell">
                <div className="nl-cell-label">Why It Matters</div>
                <div className="nl-cell-text">{article.analysis.whyItMatters}</div>
              </div>
              <div className="nl-analysis-cell">
                <div className="nl-cell-label">What BNY Is Doing</div>
                <div className="nl-cell-text">{article.analysis.bnyResponse}</div>
              </div>
              <div className="nl-analysis-cell">
                <div className="nl-cell-label">Economic Implications</div>
                <div className="nl-cell-text">{article.analysis.economicImplications}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ArticleRow({ article, index }: { article: Article; index: number }) {
  const color = catColor(article.category);
  return (
    <div className="nl-row fade" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="nl-row-dot" style={{ background: color }} />
      <div className="nl-row-content">
        <div className="nl-row-meta">
          <span style={{ color }}>{article.category}</span>
          <span className="nl-row-sep">·</span>
          <span>{fmtDateShort(article.date)}</span>
        </div>
        <div className="nl-row-title">{article.title}</div>
      </div>
      <div className="nl-row-read">{article.readTime}</div>
    </div>
  );
}

export default function NewsletterView() {
  const nl = NEWSLETTER;
  const allArticles = [...nl.marketBriefing, ...nl.clientsAndCompetitors];
  const editionDate = fmtDate(nl.edition);

  return (
    <div className="nl-wrap fade">
      {/* Masthead */}
      <div className="nl-masthead">
        <div className="nl-masthead-left">
          <div className="nl-edition-label">Daily Edition · {editionDate}</div>
          <h1 className="nl-masthead-title">Digital Assets Briefing</h1>
          <p className="nl-masthead-sub">
            Institutional intelligence on digital-asset markets, tokenization, and the
            competitive landscape — with BNY's strategic angle on every story.
          </p>
        </div>
        <div className="nl-masthead-stats">
          <div className="nl-stat">
            <div className="nl-stat-num">{allArticles.length}</div>
            <div className="nl-stat-label">Articles</div>
          </div>
          <div className="nl-stat">
            <div className="nl-stat-num">{nl.marketBriefing.length}</div>
            <div className="nl-stat-label">Market</div>
          </div>
          <div className="nl-stat">
            <div className="nl-stat-num">{nl.clientsAndCompetitors.length}</div>
            <div className="nl-stat-label">Clients &amp; Competitors</div>
          </div>
        </div>
      </div>

      {/* Featured article (first) */}
      <div className="nl-featured">
        <div className="nl-featured-tag">★ Featured</div>
        <FeaturedArticle article={nl.marketBriefing[0]} />
      </div>

      {/* Market Briefing */}
      <div className="nl-section-head">
        <span className="nl-section-num">01</span>
        <span className="nl-section-name">Market Briefing</span>
        <span className="nl-section-line" />
      </div>
      <div className="nl-grid">
        {nl.marketBriefing.slice(1).map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} />
        ))}
      </div>

      {/* Clients & Competitors */}
      <div className="nl-section-head">
        <span className="nl-section-num">02</span>
        <span className="nl-section-name">Clients &amp; Competitors</span>
        <span className="nl-section-line" />
      </div>
      <div className="nl-grid">
        {nl.clientsAndCompetitors.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} />
        ))}
      </div>

      {/* Index / quick scan */}
      <div className="nl-section-head">
        <span className="nl-section-num">03</span>
        <span className="nl-section-name">Index</span>
        <span className="nl-section-line" />
      </div>
      <div className="nl-index-list">
        {allArticles.map((a, i) => (
          <ArticleRow key={a.id} article={a} index={i} />
        ))}
      </div>

      <div className="nl-footer-note">
        BNY Digital Assets Strategy · Internal Briefing · {editionDate}
      </div>
    </div>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  const color = catColor(article.category);
  return (
    <article
      className="nl-card nl-card-featured"
      style={{ "--accent-c": color } as React.CSSProperties}
    >
      <div className="nl-card-rail" style={{ background: color, width: 4 }} />
      <div className="nl-card-body">
        <div className="nl-card-top">
          <span className="nl-cat-chip" style={{ color, borderColor: `${color}55`, background: `${color}1a` }}>
            {article.category}
          </span>
          <span className="nl-tag">{article.tag}</span>
          <span className="nl-readtime">{article.readTime}</span>
        </div>
        <h2 className="nl-card-title nl-title-lg">{article.title}</h2>
        <div className="nl-card-byline">
          <span className="nl-byline-author">{article.author}</span>
          <span className="nl-byline-sep">·</span>
          <span className="nl-byline-date">{fmtDate(article.date)}</span>
        </div>
        <div className="nl-card-overview">
          {article.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="nl-analysis-block">
          <div className="nl-analysis-header">
            <span className="nl-analysis-icon">◆</span>
            BNY Strategic Analysis
          </div>
          <div className="nl-analysis-grid">
            <div className="nl-analysis-cell">
              <div className="nl-cell-label">Impact on BNY</div>
              <div className="nl-cell-text">{article.analysis.bnyImpact}</div>
            </div>
            <div className="nl-analysis-cell">
              <div className="nl-cell-label">Why It Matters</div>
              <div className="nl-cell-text">{article.analysis.whyItMatters}</div>
            </div>
            <div className="nl-analysis-cell">
              <div className="nl-cell-label">What BNY Is Doing</div>
              <div className="nl-cell-text">{article.analysis.bnyResponse}</div>
            </div>
            <div className="nl-analysis-cell">
              <div className="nl-cell-label">Economic Implications</div>
              <div className="nl-cell-text">{article.analysis.economicImplications}</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
