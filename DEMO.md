# Demo script and recovery runbook

## Control sheet

| Field | Value |
|---|---|
| Project | ReconGraph v1 |
| Hackathon / track | Razorpay AI Buildathon / 04 AI Finance Controller |
| Official demo limit | 5-minute pitch video; [official event page](https://razorpay.com/buildathon/), accessed 2026-08-21 |
| Target duration / buffer | 3:00 / 2:00 |
| Environment | Static production build or local `npm run dev` |
| Magic moment | A `1.00` top score is refused because its lead is `0.00` |
| Outcome verification | FACT for run behavior; SIMULATED data; MEASURED benchmark; LIVE SEEDED REPLAY |
| Last successful rehearsal | 2026-08-21 04:20 UTC |

## Promise and path

```text
Finance operator → one seeded run → schema, hard matches, bounded adjudication,
and webhook recovery → evidence-backed matches plus an honest exception queue.
```

## Preflight

| Check | Acceptance criterion | Evidence | Status |
|---|---|---|---|
| Build | Exact version loads | `npm run build` | VERIFIED |
| Data | Synthetic label is visible | Header and README | VERIFIED |
| Secrets / PII | None visible or committed | Security scan | VERIFIED |
| Reset | Known initial state restored | Reset control and E2E | VERIFIED |
| Network | Core result remains usable offline | `/?state=offline` | VERIFIED |
| Display | Keyboard, focus, desktop, and mobile readable | Playwright + Lighthouse | VERIFIED |

## Word-for-word runbook

| # | Time | Presenter says | Presenter does | Expected visible result |
|---:|---:|---|---|---|
| 1 | 0:00–0:20 | “Finance teams can join most records with IDs. The dangerous part is the last few ambiguous edges, because an eager agent can put the wrong relationship in the books.” | Show initial screen and synthetic label. | Clear problem, one action, honest data boundary. |
| 2 | 0:20–0:45 | “ReconGraph runs hard evidence first, then allows bounded judgment only inside a validated candidate set.” | Select **Run seeded reconciliation**. | Three visible stages, then measured result strip. |
| 3 | 0:45–1:15 | “Across 127 synthetic records, it got 53 of 54 held-out decisions right, matched 49, suppressed four duplicate deliveries, and blocked one late state regression.” | Point to the metric strip and recovery summary. | 98.1% accuracy, five exceptions, zero duplicate inflation. |
| 4 | 1:15–1:45 | “This payment has two plausible orders, but customer and time evidence give the winner a 0.20 lead. The controller accepts it and cites every weight.” | Select `pay_025`. | Accepted edge with evidence and candidate spread. |
| 5 | 1:45–2:20 | “Now the safety test. Both candidates score a perfect 1.00. A system optimized only for confidence would guess. ReconGraph also requires a 0.12 lead, sees zero, and refuses.” | Select `pay_027`. | **MAGIC MOMENT:** refusal panel and safety gate. |
| 6 | 2:20–2:45 | “Replay safety is separate: event IDs remove retries, and monotonic state prevents captured from regressing to authorized.” | Point to webhook recovery. | Four duplicates removed; one regression blocked. |
| 7 | 2:45–3:00 | “The product is not a production finance system. It is a measurable controller design: hard evidence first, bounded judgment second, and no unsafe edge in the books.” | Reset to initial state. | Known state returns immediately. |

## Evidence callouts

| Claim | Verification | Proof strength | Medium | Source / caveat |
|---|---|---|---|---|
| 127 records | FACT | SIMULATED | LIVE SEEDED REPLAY | Versioned fixture; not production traffic |
| 98.1% held-out accuracy | FACT | MEASURED | LIVE SEEDED REPLAY | 53/54 decisions, Node 22, 2026-08-21 |
| 100% accepted-match precision | FACT | MEASURED | DOCUMENTED | Synthetic fixture only |
| Zero duplicate inflation | FACT | MEASURED | LIVE SEEDED REPLAY | Four duplicate deliveries suppressed |

## Fallback matrix

| ID | Failure | Switch action | Presenter line | Recovery target |
|---|---|---|---|---|
| F1 | Deployment unavailable | Run local build | “I’m switching to the same commit locally; this path has no external dependency.” | Initial screen |
| F2 | Network unavailable | Open `/?state=offline` | “The seeded replay is versioned and offline-capable, so the proof remains the same.” | Offline banner plus runnable flow |
| F3 | Navigation error | Open `/?state=success` | “I’m opening the deterministic result checkpoint.” | Full result workspace |
| F4 | Invalid state | Open `/?state=error`, then select safe replay | “Validation stopped before changing any result. I’m loading the signed v1 fixture.” | Loading then success |
| F5 | Live screen unavailable | Show `docs/images/recongraph-overview.png` | “This is the verified screenshot from the submitted commit.” | Recorded proof of result screen |

## Reset and recovery

Select **Reset demo** or load `/`. This changes only in-memory UI state; it does not alter fixtures, ground truth, external systems, or customer records. Expected recovery is under one second.

## Rehearsal log

| Run/date | Environment | Duration | Failure injected | Result | Status |
|---|---|---:|---|---|---|
| 1 / 2026-08-21 | Chromium, production preview | 2.3s operator path | None | Accepted and refusal states verified | PASS |
| 2 / 2026-08-21 | Chromium, production preview | 2.5s operator path | Offline path checked in full E2E suite | Same seeded result remains available | PASS |
| 3 / 2026-08-21 | Chromium, production preview | 2.4s operator path | Error checkpoint checked in full E2E suite | Safe replay recovers to result | PASS |

## Final sign-off

The product demo is **READY**: three consecutive core browser runs passed, fallback checkpoints passed, reset passed, and the screenshot was visually reviewed. Submission remains blocked on a public repository, final video recording, and public link checks.
