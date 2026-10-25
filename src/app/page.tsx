"use client";

import { useCallback, useRef, useState } from "react";
import { PartnerWall } from "@/components/PartnerWall";
import { SAMPLE_COMMITMENTS } from "@/lib/samples";
import type { LoafRecord } from "@/lib/types";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const base64 = data.split(",")[1];
      if (!base64) reject(new Error("Could not encode audio"));
      else resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export default function Home() {
  const [text, setText] = useState(SAMPLE_COMMITMENTS[0]);
  const [batchMode, setBatchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoafRecord | null>(null);
  const [batchResults, setBatchResults] = useState<LoafRecord[] | null>(null);
  const [batchSaved, setBatchSaved] = useState(0);
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const analyze = useCallback(async (body: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setBatchResults(null);
    try {
      const res = await fetch("/api/loaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as LoafRecord);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = async () => {
    if (batchMode) {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/loaf/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Batch failed");
        setBatchResults(data.results as LoafRecord[]);
        setBatchSaved(data.minutesSaved as number);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Batch failed");
      } finally {
        setLoading(false);
      }
      return;
    }
    analyze({ text });
  };

  const toggleRecord = async () => {
    if (recording && mediaRef.current) {
      mediaRef.current.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const b64 = await blobToBase64(blob);
      await analyze({ audioBase64: b64, audioMime: "audio/webm" });
    };
    mediaRef.current = rec;
    rec.start(250);
    setRecording(true);
  };

  const playBrief = async () => {
    if (!result?.verdict.verdictLine) return;
    const res = await fetch("/api/brief-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result.verdict.verdictLine }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  };

  const copySlip = async () => {
    if (!result?.permissionSlip) return;
    await navigator.clipboard.writeText(result.permissionSlip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <h1>Permission to loaf</h1>
      <p className="sub">
        Slow and Steady for Hacktoberfest: open-weight <strong>Gemma</strong> understands the promise,{" "}
        <strong>TabPFN</strong> scores defer risk from tabular features, and eleven partner services
        turn guilt into a two-minute ritual — on <strong>Render</strong>, not a closed guilt API.
      </p>

      <PartnerWall />

      <div className="card">
        <div className="row-between">
          <label htmlFor="commit">{batchMode ? "Brain dump (one promise per line)" : "What did you promise?"}</label>
          <button type="button" className="linkish" onClick={() => setBatchMode(!batchMode)}>
            {batchMode ? "Single mode" : "Batch mode (up to 5)"}
          </button>
        </div>
        <div className="chips">
          {SAMPLE_COMMITMENTS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setText(s)} title={s}>
              {s.slice(0, 28)}…
            </button>
          ))}
        </div>
        <textarea
          id="commit"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I said I'd…"
        />
        <div className="actions">
          <button type="button" onClick={onSubmit} disabled={loading}>
            {loading ? "Thinking slowly…" : batchMode ? "Batch loaf check" : "Loaf check"}
          </button>
          {!batchMode && (
            <button type="button" className="secondary" onClick={toggleRecord} disabled={loading}>
              {recording ? "Stop & analyze" : "Voice memo"}
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className={`card verdict ${result.verdict.label}`}>
          <span className="pill">
            {result.verdict.label.replace("_", " ")} ·{" "}
            {(result.verdict.probability * 100).toFixed(0)}% TabPFN confidence
          </span>
          {result.lazyPayoffMinutes != null && (
            <p className="payoff">
              Lazy payoff: ~<strong>{result.lazyPayoffMinutes} minutes</strong> of rumination avoided
              {result.pipelineMs != null && ` · pipeline ${(result.pipelineMs / 1000).toFixed(1)}s`}
            </p>
          )}
          <p><strong>Verdict:</strong> {result.verdict.verdictLine}</p>
          <p><strong>Tiny action:</strong> {result.verdict.tinyAction}</p>
          <p><strong>Safe until:</strong> {result.verdict.safeUntil}</p>
          {result.tabpfnFeatures && (
            <p className="muted-sm">
              TabPFN features: {Object.entries(result.tabpfnFeatures)
                .map(([k, v]) => `${k}=${v}`)
                .join(", ")}
            </p>
          )}
          {result.verdict.echoFromPast && <p><strong>Echo (Tiger):</strong> {result.verdict.echoFromPast}</p>}
          {result.verdict.groundingSnippet && <p><strong>Ground (SerpApi):</strong> {result.verdict.groundingSnippet}</p>}
          {result.verdict.memorySnippet && <p><strong>Memory (Backboard):</strong> {result.verdict.memorySnippet}</p>}
          <div className="actions">
            <button type="button" className="secondary" onClick={playBrief}>
              Hear verdict (ElevenLabs)
            </button>
            <button type="button" className="secondary" onClick={copySlip}>
              {copied ? "Copied!" : "Copy permission slip"}
            </button>
          </div>
          <p className="partners">Partners this run: {result.partnersUsed.join(" · ")}</p>
        </div>
      )}

      {batchResults && (
        <div className="card">
          <h2 className="section-title">Monday brain dump — {batchSaved} min saved total</h2>
          {batchResults.map((r, i) => (
            <div key={i} className="batch-line">
              <strong>{r.verdict.label}</strong> — {r.extract.summary} ({r.lazyPayoffMinutes} min)
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
