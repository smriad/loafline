"use client";

import { useEffect, useState } from "react";
import type { LoafRecord, SlothStats } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<LoafRecord[]>([]);
  const [stats, setStats] = useState<SlothStats | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const runDigest = async () => {
    setLoadingDigest(true);
    try {
      const res = await fetch("/api/digest", { method: "POST" });
      const data = await res.json();
      setDigest(data.digest);
    } finally {
      setLoadingDigest(false);
    }
  };

  return (
    <main>
      <h1>Sloth ledger</h1>
      <p className="sub">Every defer decision TabPFN scored, stored on MongoDB, echoed in Tiger.</p>

      {stats && (
        <div className="card stats-row">
          <div><strong>{stats.total}</strong><span>checks</span></div>
          <div><strong>{Math.round(stats.loafRate * 100)}%</strong><span>safe to loaf</span></div>
          <div><strong>{stats.minutesSavedTotal}</strong><span>min saved (est.)</span></div>
          <div><strong>{stats.byLabel.today}</strong><span>act today</span></div>
        </div>
      )}

      <div className="actions">
        <button type="button" onClick={runDigest} disabled={loadingDigest}>
          {loadingDigest ? "Gemma is napping on your stats…" : "Generate morning digest (Gemma)"}
        </button>
      </div>
      {digest && <div className="card digest">{digest}</div>}

      {items.length === 0 ? (
        <p className="muted">No saved loafs yet — run a check on the home page.</p>
      ) : (
        items.map((item) => (
          <article key={item._id ?? item.createdAt} className={`card verdict ${item.verdict.label}`}>
            <span className="pill">{new Date(item.createdAt).toLocaleString()}</span>
            <p>{item.extract.summary}</p>
            <p className="muted-sm">{item.verdict.verdictLine}</p>
            {item.lazyPayoffMinutes != null && (
              <p className="payoff">~{item.lazyPayoffMinutes} min saved vs. spiraling</p>
            )}
          </article>
        ))
      )}
    </main>
  );
}
