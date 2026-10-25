"use client";

import { useEffect, useState } from "react";

type Partner = {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  role: string;
};

export function PartnerWall() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [ratio, setRatio] = useState("");
  const [missingEnv, setMissingEnv] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((d) => {
        setPartners(d.partners ?? []);
        setRatio(`${d.configured}/${d.total}`);
        setMissingEnv(d.missingEnv ?? []);
      })
      .catch(() => undefined);
  }, []);

  if (!partners.length) return null;

  return (
    <div className="card partner-wall">
      <h2 className="section-title">Partner stack ({ratio} live)</h2>
      {missingEnv.length > 0 && (
        <p className="env-hint">
          Secrets not set on this server — add in Render → <strong>Environment</strong>, then redeploy:{" "}
          <code>{missingEnv.join(", ")}</code>
        </p>
      )}
      <ul className="partner-grid">
        {partners.map((p) => (
          <li key={p.id} className={p.configured ? "on" : "off"}>
            <strong>{p.name}</strong>
            <span>{p.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
