# Timed pitch script

## Pitch control

| Field | Value |
|---|---|
| Project | ReconGraph v1 |
| Track | 04 AI Finance Controller |
| Official limit | 5-minute video; [official event page](https://razorpay.com/buildathon/), accessed 2026-08-21 |
| Target / buffer | 4:15 / 0:45 |
| Core differentiator | A second safety gate measures certainty relative to alternatives, so a perfect tie is refused |
| Final line | “Hard evidence first. Bounded judgment second. No unsafe edge in the books.” |

## Claim ledger

| Claim | Verification | Proof | Medium | Evidence / safe wording |
|---|---|---|---|---|
| 127 records processed | FACT | SIMULATED | LIVE SEEDED REPLAY | Versioned synthetic fixture |
| 98.1% accuracy | FACT | MEASURED | DOCUMENTED + LIVE | 53/54 held-out decisions; not production generalization |
| Duplicate-safe total | FACT | MEASURED | LIVE | Four replayed deliveries suppressed |
| Production readiness | UNVERIFIED | ASSERTED | N/A | Do not claim; production adapter is roadmap only |

## Script

### 0:00–0:25 — Problem

“Most finance reconciliation is easy until it isn’t. IDs join the obvious records. Missing references, duplicate webhooks, late delivery, and two nearly identical orders create the handful of decisions where one confident mistake can corrupt the books.”

### 0:25–0:55 — Solution and differentiator

“We built ReconGraph, an AI finance controller for Razorpay-shaped records. It applies hard evidence first. When a reference is missing, it scores only a bounded candidate set. Then it asks two questions: is the best candidate strong enough, and is it clearly stronger than the alternative? If either answer is no, ReconGraph refuses.”

Transition: “Here is why that second question matters.”

### 0:55–2:30 — Live proof

“This is a versioned seeded replay with 127 synthetic records. No keys, no customer data, and no hidden network dependency.”

Select **Run seeded reconciliation**.

“The run gets 53 of 54 held-out decisions right, matches 49, and leaves five unresolved. It also suppresses four duplicate deliveries and blocks one late event from regressing a captured payment.”

Select `pay_025`.

“Here, two orders share the same amount. Customer reference and time proximity give the leading candidate a 0.20 margin, above our 0.12 gate. The accepted edge cites every evidence weight.”

Select `pay_027`.

“Now both candidates score a perfect 1.00. Confidence alone is useless because the margin is zero. ReconGraph refuses the edge and keeps it out of the books. This is the product’s magic moment: uncertainty is a visible result, not a hidden failure.”

### 2:30–3:20 — Technical credibility

“The boundary is deliberately small. Zod rejects malformed and oversized batches. Exact foreign keys resolve first. Candidate generation requires exact amount and currency within 24 hours. Scoring is fixed and explainable. Webhook IDs make replay idempotent, and payment state moves only forward. Separate ground truth measures the outcome, including correct abstentions.”

### 3:20–3:50 — Sponsor fit

“Razorpay defines the loop we close: order, payment, refund, settlement, and webhook state. The buildathon asks Track 4 teams to close a finance-ops loop over more than 50 synthetic records and report both match rate and exceptions. ReconGraph does that across 127 records and makes its exception policy the centerpiece.”

### 3:50–4:15 — Impact and close

“These results are measured on a synthetic fixture, not production traffic. The next production step is a signature-verifying Razorpay adapter plus maker-checker approval and an append-only audit store. Today, the working claim is narrower and testable: hard evidence first, bounded judgment second, and no unsafe edge in the books.”

Emergency close: “ReconGraph reconciles 127 synthetic finance records at 98.1% held-out accuracy and refuses a perfect tie instead of guessing.”

## Challenge prep

| Judge question | Answer |
|---|---|
| What is novel? | Confidence is not enough; acceptance also requires separation from the runner-up, and abstention is first-class output. |
| Where is AI? | Bounded multi-signal adjudication applies judgment only after rules narrow the action space. We intentionally did not add an LLM where deterministic evidence is safer. |
| What is real vs mocked? | The product, controller, failure states, tests, and benchmark execution are real. Every financial record is synthetic. |
| Why no live Razorpay account? | Track 4 explicitly asks for a 50+ synthetic batch. Avoiding keys and money movement makes the proof deterministic; a signed adapter is clearly roadmap. |
| What broke? | Duplicate and out-of-order webhook delivery broke naive totals/state. Idempotency keys and monotonic state recovery fixed it. |

## Rehearsal log

The core browser path passed three consecutive rehearsals in 2.3s, 2.5s, and 2.4s. The spoken script is 430 words, approximately 2:50 at 150 words per minute before screen pauses, leaving buffer inside five minutes. Pitch readiness remains **NOT READY** until the submitter records and reviews the final video.
