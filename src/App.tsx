import { useEffect, useMemo, useState } from "react";
import benchmarkJson from "./data/benchmark-results.v1.json";
import batchJson from "./data/recon-batch.v1.json";
import { runReconciliation } from "./domain/reconcile";
import type {
  BenchmarkResult,
  FixtureBatch,
  MatchDecision,
  ReconciliationResult,
} from "./domain/types";

type ViewState = "initial" | "loading" | "success" | "empty" | "error";

const batch = batchJson as FixtureBatch;
const benchmark = benchmarkJson as BenchmarkResult;

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value === 1 ? 0 : 1)}%`;
}

function formatMoney(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function Icon({ name }: { name: "arrow" | "check" | "shield" | "warning" | "refresh" }) {
  const paths = {
    arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    shield: <path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    warning: <path d="M12 4 3 20h18L12 4Zm0 6v4m0 3h.01" />,
    refresh: <path d="M20 6v5h-5M4 18v-5h5m10.2-2A8 8 0 0 0 6.7 7M4.8 14A8 8 0 0 0 17.3 17" />,
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function ProofLabel() {
  return (
    <span className="proof-label">
      <span className="proof-dot" /> Synthetic data · live seeded replay
    </span>
  );
}

function HeroGraph({ active = false }: { active?: boolean }) {
  return (
    <figure
      className={`hero-graph ${active ? "is-active" : ""}`}
      aria-label="Transaction graph preview"
    >
      <svg viewBox="0 0 540 260" role="img" aria-labelledby="graph-title graph-description">
        <title id="graph-title">ReconGraph transaction flow</title>
        <desc id="graph-description">
          Orders connect to payments, refunds, settlements, and webhook events. One weak edge is
          held for review.
        </desc>
        <g className="graph-lines">
          <path d="M94 79 C150 79 155 66 206 66" />
          <path d="M94 79 C150 79 155 140 206 140" />
          <path d="M304 66 C358 66 360 42 414 42" />
          <path d="M304 66 C360 66 360 126 414 126" />
          <path d="M304 140 C358 140 362 210 414 210" className="review-line" />
          <path d="M470 57v48" />
        </g>
        <g className="graph-node order-node" transform="translate(22 55)">
          <rect width="72" height="48" rx="8" />
          <text x="36" y="20">
            ORDER
          </text>
          <text x="36" y="36">
            #025
          </text>
        </g>
        <g className="graph-node payment-node" transform="translate(206 42)">
          <rect width="98" height="48" rx="8" />
          <text x="49" y="20">
            PAYMENT
          </text>
          <text x="49" y="36">
            ₹4,385
          </text>
        </g>
        <g className="graph-node payment-node muted-node" transform="translate(206 116)">
          <rect width="98" height="48" rx="8" />
          <text x="49" y="20">
            PAYMENT
          </text>
          <text x="49" y="36">
            candidate
          </text>
        </g>
        <g className="graph-node webhook-node" transform="translate(414 18)">
          <rect width="104" height="48" rx="8" />
          <text x="52" y="20">
            WEBHOOK
          </text>
          <text x="52" y="36">
            captured
          </text>
        </g>
        <g className="graph-node settlement-node" transform="translate(414 102)">
          <rect width="104" height="48" rx="8" />
          <text x="52" y="20">
            SETTLED
          </text>
          <text x="52" y="36">
            verified
          </text>
        </g>
        <g className="graph-node review-node" transform="translate(414 186)">
          <rect width="104" height="48" rx="8" />
          <text x="52" y="20">
            REFUSED
          </text>
          <text x="52" y="36">
            needs review
          </text>
        </g>
      </svg>
      <div className="graph-caption">
        <span>Hard evidence</span>
        <span>Bounded judgment</span>
        <span>Human gate</span>
      </div>
    </figure>
  );
}

function Metric({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}

function DecisionBadge({ status }: { status: MatchDecision["status"] }) {
  const labels = {
    hard_match: "Hard match",
    adjudicated: "Adjudicated",
    review_required: "Review required",
    unmatched: "Unmatched",
  };
  return <span className={`decision-badge ${status}`}>{labels[status]}</span>;
}

function DecisionRow({
  decision,
  active,
  onSelect,
}: {
  decision: MatchDecision;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={`decision-row ${active ? "active" : ""}`} onClick={onSelect} type="button">
      <span>
        <strong>{decision.sourceId}</strong>
        <small>{decision.targetId ? `→ ${decision.targetId}` : "→ held for review"}</small>
      </span>
      <DecisionBadge status={decision.status} />
    </button>
  );
}

function EvidencePanel({ decision }: { decision: MatchDecision }) {
  const isRefused = decision.status === "review_required";
  return (
    <section className="evidence-panel" aria-labelledby="evidence-title">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">Decision trace</span>
          <h3 id="evidence-title">
            {isRefused ? "The controller refused this edge" : "Why this edge was accepted"}
          </h3>
        </div>
        <div className={`confidence ${isRefused ? "unsafe" : "safe"}`}>
          <span>{Math.round(decision.confidence * 100)}%</span>
          <small>top score</small>
        </div>
      </div>
      <p className="decision-rationale">{decision.rationale}</p>
      <div className="evidence-list">
        {decision.evidence.length > 0 ? (
          decision.evidence.map((signal) => (
            <div className="evidence-item" key={`${decision.sourceId}-${signal.signal}`}>
              <span className="signal-check">
                <Icon name={isRefused ? "warning" : "check"} />
              </span>
              <span>
                <strong>{signal.signal.replace("_", " ")}</strong>
                <small>{signal.observation}</small>
              </span>
              <code>+{signal.weight.toFixed(2)}</code>
            </div>
          ))
        ) : (
          <p className="no-evidence">No trustworthy candidate evidence was found.</p>
        )}
      </div>
      {decision.candidates.length > 1 && (
        <div className="candidate-comparison">
          <span>Candidate spread</span>
          <div>
            {decision.candidates.map((candidate) => (
              <span key={candidate.targetId}>
                {candidate.targetId} <strong>{candidate.score.toFixed(2)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={`policy-note ${isRefused ? "warning" : "success"}`}>
        <Icon name={isRefused ? "shield" : "check"} />
        <span>
          {isRefused
            ? "Safety gate: score ≥ 0.85 and lead ≥ 0.12. This edge stays out of the books."
            : "Verified against prevalidated candidates. No open-ended generation or fabricated IDs."}
        </span>
      </div>
    </section>
  );
}

function LoadingState({ stage }: { stage: number }) {
  const stages = ["Validating 127 records", "Building candidate graph", "Verifying totals"];
  return (
    <section className="loading-state" aria-live="polite" aria-label="Reconciliation progress">
      <div className="loading-orbit" aria-hidden="true">
        <span />
      </div>
      <div>
        <span className="panel-kicker">Controller running</span>
        <h2>{stages[Math.min(stage, stages.length - 1)]}</h2>
        <p>Rules establish certainty first. Judgment only touches bounded ambiguity.</p>
        <div className="progress-track">
          <span style={{ width: `${33 + stage * 33}%` }} />
        </div>
      </div>
    </section>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <section className="state-panel" aria-labelledby="empty-title">
      <span className="state-icon">
        <Icon name="refresh" />
      </span>
      <div>
        <span className="panel-kicker">Empty batch</span>
        <h2 id="empty-title">There’s nothing to reconcile yet.</h2>
        <p>Load the versioned synthetic close batch to restore the deterministic demo.</p>
      </div>
      <button className="button button-primary" type="button" onClick={onReset}>
        Load seeded batch <Icon name="arrow" />
      </button>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="state-panel error-panel" aria-labelledby="error-title" role="alert">
      <span className="state-icon">
        <Icon name="warning" />
      </span>
      <div>
        <span className="panel-kicker">Validation stopped safely</span>
        <h2 id="error-title">The batch shape didn’t pass schema checks.</h2>
        <p>No records were matched and no totals changed. Retry with the signed v1 fixture.</p>
      </div>
      <button className="button button-primary" type="button" onClick={onRetry}>
        Use safe replay <Icon name="arrow" />
      </button>
    </section>
  );
}

function Results({ result }: { result: ReconciliationResult }) {
  const interesting = useMemo(() => {
    const accepted = result.decisions.find((decision) => decision.sourceId === "pay_025");
    const refused = result.decisions.find((decision) => decision.sourceId === "pay_027");
    const orphan = result.decisions.find((decision) => decision.sourceId === "stl_014");
    return [accepted, refused, orphan].filter((decision): decision is MatchDecision =>
      Boolean(decision),
    );
  }, [result]);
  const [selectedId, setSelectedId] = useState("pay_025");
  const selected =
    interesting.find((decision) => decision.sourceId === selectedId) ?? interesting[0];

  if (!selected) return null;

  return (
    <div className="results" id="results">
      <section className="metrics-strip" aria-label="Measured benchmark results">
        <Metric
          value={formatPercent(benchmark.accuracy)}
          label="Held-out accuracy"
          detail={`${benchmark.correctDecisions}/${benchmark.decisions} decisions`}
        />
        <Metric
          value={String(benchmark.matched)}
          label="Records matched"
          detail={`${benchmark.unresolved} unresolved`}
        />
        <Metric
          value="0"
          label="Duplicate inflation"
          detail={`${benchmark.duplicatesSuppressed} deliveries suppressed`}
        />
        <Metric
          value={formatMoney(benchmark.grossCapturedPaise)}
          label="Captured total"
          detail="verified after replay"
        />
      </section>

      <div className="workspace-grid">
        <section className="decision-list" aria-labelledby="queue-title">
          <div className="panel-heading compact">
            <div>
              <span className="panel-kicker">Controller queue</span>
              <h2 id="queue-title">Three decisions worth seeing</h2>
            </div>
            <span className="queue-count">3 / 54</span>
          </div>
          <p className="queue-intro">
            A confident edge, a deliberate refusal, and a record with no evidence.
          </p>
          <div className="decision-rows">
            {interesting.map((decision) => (
              <DecisionRow
                key={decision.sourceId}
                decision={decision}
                active={decision.sourceId === selected.sourceId}
                onSelect={() => setSelectedId(decision.sourceId)}
              />
            ))}
          </div>
          <div className="recovery-summary">
            <span className="recovery-icon">
              <Icon name="shield" />
            </span>
            <span>
              <strong>Webhook recovery held.</strong>
              <small>
                {result.eventRecovery.duplicatesSuppressed} duplicates removed ·{" "}
                {result.eventRecovery.outOfOrderRegressionsPrevented} late regression blocked
              </small>
            </span>
          </div>
        </section>
        <EvidencePanel decision={selected} />
      </div>
    </div>
  );
}

export function App() {
  const queryState = new URLSearchParams(window.location.search).get("state");
  const initialState: ViewState =
    queryState === "empty"
      ? "empty"
      : queryState === "error"
        ? "error"
        : queryState === "success"
          ? "success"
          : "initial";
  const [view, setView] = useState<ViewState>(initialState);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ReconciliationResult | null>(() =>
    initialState === "success" ? runReconciliation(batch) : null,
  );
  const [offline, setOffline] = useState(!navigator.onLine || queryState === "offline");

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  function runDemo() {
    setView("loading");
    setStage(0);
    const first = window.setTimeout(() => setStage(1), 350);
    const second = window.setTimeout(() => setStage(2), 700);
    const finish = window.setTimeout(() => {
      try {
        setResult(runReconciliation(batch));
        setView("success");
        window.requestAnimationFrame(() =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      } catch {
        setView("error");
      }
    }, 1_050);
    return () => [first, second, finish].forEach(window.clearTimeout);
  }

  function resetDemo() {
    window.history.replaceState({}, "", window.location.pathname);
    setResult(null);
    setView("initial");
    setStage(0);
  }

  return (
    <div className="app-shell">
      {offline && (
        <div className="offline-banner" role="status">
          <Icon name="shield" /> Offline mode. The versioned seeded replay remains fully usable.
        </div>
      )}
      <header className="site-header">
        <a className="brand" href="/" aria-label="ReconGraph home">
          <BrandMark />
          <span>ReconGraph</span>
        </a>
        <div className="header-meta">
          <ProofLabel />
          {view === "success" && (
            <button className="reset-link" type="button" onClick={resetDemo}>
              <Icon name="refresh" /> Reset demo
            </button>
          )}
        </div>
      </header>

      <main id="main">
        <section className={`hero ${view === "success" ? "compact-hero" : ""}`}>
          <div className="hero-copy">
            <span className="context-line">AI finance controller · Track 4</span>
            <h1>
              Reconcile every record. <span>Refuse the unsafe ones.</span>
            </h1>
            <p>
              ReconGraph closes a Razorpay-shaped finance loop with hard evidence first and bounded
              judgment only where records are ambiguous.
            </p>
            {view === "initial" && (
              <div className="hero-action">
                <button className="button button-primary" type="button" onClick={runDemo}>
                  Run seeded reconciliation <Icon name="arrow" />
                </button>
                <span>
                  <strong>127</strong> records · no keys · deterministic reset
                </span>
              </div>
            )}
            {view === "success" && (
              <div className="run-complete" role="status">
                <Icon name="check" /> Run complete. Results are measured against separate held-out
                truth.
              </div>
            )}
          </div>
          <HeroGraph active={view === "loading" || view === "success"} />
        </section>

        <div className="content-wrap">
          {view === "loading" && <LoadingState stage={stage} />}
          {view === "empty" && <EmptyState onReset={resetDemo} />}
          {view === "error" && <ErrorState onRetry={runDemo} />}
          {view === "success" && result && <Results result={result} />}
          {view === "initial" && (
            <section className="before-run" aria-label="Batch contents">
              <span>28 orders</span>
              <span>30 payments</span>
              <span>10 refunds</span>
              <span>14 settlements</span>
              <span>45 webhook deliveries</span>
            </section>
          )}
        </div>
      </main>

      <footer>
        <span>ReconGraph · Buildathon prototype · synthetic finance records only</span>
        <a className="tin-credit" href="https://tin.computer">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" fill="#66DC9D" />
          </svg>
          Growth by Tin
        </a>
      </footer>
    </div>
  );
}
