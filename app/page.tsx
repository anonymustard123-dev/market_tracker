"use client";

import { useEffect, useState, useCallback } from "react";
import Sparkline from "@/components/Sparkline";
import type { AssetData, PeriodKey } from "@/lib/assets";

type ApiResponse = { asOf: number; data: AssetData[] };

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "ytd", label: "YTD" },
];

function fmtPrice(v: number | null, decimals = 2, unit?: string): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const s = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return unit === "%" ? `${s}%` : `$${s}`;
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function cls(v: number | null): string {
  if (v == null) return "flat";
  if (v > 0.001) return "up";
  if (v < -0.001) return "down";
  return "flat";
}

function fmtClock(epochMs: number): string {
  const d = new Date(epochMs);
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

export default function Home() {
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/markets", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json: ApiResponse = await r.json();
      setResp(json);
      setLastFetch(Date.now());
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load market data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(id);
  }, [load]);

  if (loading && !resp) {
    return (
      <div className="app loading">
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 14px" }} />
          <div>Loading live market data…</div>
        </div>
      </div>
    );
  }

  const data = resp?.data ?? [];
  const valid = data.filter(d => d.price != null);

  // Summary aggregates (use daily for the headline breadth, ytd for the strip)
  const breadth = (p: PeriodKey) => {
    const ups = valid.filter(d => (d.changes[p] ?? 0) > 0).length;
    const downs = valid.filter(d => (d.changes[p] ?? 0) < 0).length;
    const total = ups + downs || 1;
    return { ups, downs, upPct: (ups / total) * 100, downPct: (downs / total) * 100 };
  };

  const dailyB = breadth("daily");
  const weeklyB = breadth("weekly");
  const monthlyB = breadth("monthly");
  const ytdB = breadth("ytd");

  // Movers by daily
  const gainers = [...valid].sort((a, b) => (b.changes.daily ?? -Infinity) - (a.changes.daily ?? -Infinity)).slice(0, 5);
  const losers = [...valid].sort((a, b) => (a.changes.daily ?? Infinity) - (b.changes.daily ?? Infinity)).slice(0, 5);
  const maxAbsDaily = Math.max(1, ...valid.map(d => Math.abs(d.changes.daily ?? 0)));

  return (
    <div className="app fade">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="logo">M</div>
          <div>
            <h1 className="title">Markets Strategy Dashboard</h1>
            <div className="subtitle">Cross-Asset Performance · Real-Time</div>
          </div>
        </div>
        <div className="header-meta">
          <div className="live"><span className="dot" />Live</div>
          <div className="timestamp">{fmtClock(lastFetch)}</div>
        </div>
      </header>

      {error && (
        <div className="error-box" style={{ marginBottom: 18 }}>
          ⚠ {error} — retrying shortly.
        </div>
      )}

      {/* Summary breadth strip */}
      <div className="summary">
        {[
          { label: "Daily Breadth", b: dailyB },
          { label: "Weekly Breadth", b: weeklyB },
          { label: "Monthly Breadth", b: monthlyB },
          { label: "YTD Breadth", b: ytdB },
        ].map(({ label, b }) => (
          <div className="sum-card" key={label}>
            <div className="sum-label">{label}</div>
            <div className="sum-bar">
              <div className="seg-up" style={{ width: `${b.upPct}%` }} />
              <div className="seg-down" style={{ width: `${b.downPct}%` }} />
            </div>
            <div className="sum-counts">
              <span className="up">▲ <b>{b.ups}</b> up</span>
              <span className="down"><b>{b.downs}</b> down ▼</span>
            </div>
          </div>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid">
        {data.map((d) => {
          const daily = d.changes.daily;
          const positive = (d.sparkChange ?? daily ?? 0) >= 0;
          const decimals = d.asset.decimals ?? 2;
          return (
            <div className="card" key={d.asset.id}>
              <div className="card-head">
                <div className="asset-id">
                  <span className="asset-name">{d.asset.name}</span>
                  <span className="asset-sym">{d.asset.symbol}</span>
                </div>
                <span className="badge">{d.asset.category}</span>
              </div>

              <div className="price-row">
                <span className="price mono">
                  {d.price != null ? fmtPrice(d.price, decimals, d.asset.unit) : "—"}
                </span>
                {d.asset.unit !== "%" && d.price != null && (
                  <span className="price-unit">USD</span>
                )}
              </div>

              <div className="spark-wrap">
                <Sparkline data={d.spark} positive={positive} />
              </div>

              <div className="changes">
                {PERIODS.map(({ key, label }) => {
                  const v = d.changes[key];
                  return (
                    <div className="chg" key={key}>
                      <span className="chg-label">{label}</span>
                      <span className={`chg-val ${cls(v)} mono`}>{fmtPct(v)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Movers */}
      <div className="section-title">Daily Movers</div>
      <div className="movers">
        <div className="mover-card">
          <h3 style={{ color: "var(--up)" }}>▲ Top Gainers</h3>
          {gainers.map((d) => {
            const v = d.changes.daily ?? 0;
            return (
              <div className="mover-row" key={`g-${d.asset.id}`}>
                <span className="mover-name">{d.asset.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(Math.abs(v) / maxAbsDaily) * 100}%`, background: "var(--up)" }} />
                </div>
                <span className="mover-pct up mono">{fmtPct(v)}</span>
              </div>
            );
          })}
        </div>
        <div className="mover-card">
          <h3 style={{ color: "var(--down)" }}>▼ Top Losers</h3>
          {losers.map((d) => {
            const v = d.changes.daily ?? 0;
            return (
              <div className="mover-row" key={`l-${d.asset.id}`}>
                <span className="mover-name">{d.asset.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(Math.abs(v) / maxAbsDaily) * 100}%`, background: "var(--down)" }} />
                </div>
                <span className="mover-pct down mono">{fmtPct(v)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="footer">
        <span>Data: Yahoo Finance · auto-refresh every 5 min</span>
        <span>{valid.length}/{data.length} instruments live</span>
      </footer>
    </div>
  );
}
