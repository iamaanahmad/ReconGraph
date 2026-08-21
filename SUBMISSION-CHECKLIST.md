# Submission readiness checklist

## Submission control

| Field | Value |
|---|---|
| Project | ReconGraph v1 |
| Track | 04 AI Finance Controller |
| Deadline | Applications close 5 September; official time zone/year not printed |
| Rules | [Razorpay AI Buildathon](https://razorpay.com/buildathon/), accessed 2026-08-21 |
| Portal | [Official application form](https://forms.gle/d9r2gvxp8cmoZhon9) |
| Readiness | NOT READY: founder-owned submission gates remain |

## Official requirements ledger

| Requirement | Verification | Acceptance | Status |
|---|---|---|---|
| Student-only | FACT | Submitter confirms eligibility and supplies accurate college/year | BLOCKED |
| Track 4 scope | FACT | 50+ synthetic records, match rate, exception list | VERIFIED |
| Repository visibility | FACT | Public URL opens logged out | BLOCKED: private |
| Pitch video | FACT | Five-minute video link plays; unlisted is allowed | BLOCKED |
| What broke | FACT | Honest failure/recovery answer | VERIFIED in `docs/VERIFICATION.md` |
| Internship logistics | FACT | In-person Bangalore from September; 6 or 12 months | Submitter confirmation BLOCKED |
| Deadline | FACT / incomplete metadata | Reverify exact cutoff before submission | BLOCKED REVERIFY |

## Judge-facing package

| Item | Evidence | Status |
|---|---|---|
| Problem, thesis, innovation | `README.md`, `SUBMISSION.md` | VERIFIED |
| Architecture and trust boundaries | `docs/ARCHITECTURE.md`, `docs/THREAT-MODEL.md` | VERIFIED |
| Setup and demo | `README.md`, `DEMO.md` | VERIFIED |
| Screenshot | `docs/images/recongraph-overview.png` | VERIFIED |
| Benchmark | `benchmarks/README.md`, versioned JSON | VERIFIED |
| Pitch and Q&A | `PITCH.md` | READY FOR RECORDING |
| Team information | Official form | BLOCKED |

## Build and trust gate

| Check | Result | Status |
|---|---|---|
| Clean build, lint, types, unit tests | Pass | VERIFIED |
| Core, error, empty, offline, reset, mobile flows | 4/4 E2E pass | VERIFIED |
| Three consecutive core rehearsals | 2.3s / 2.5s / 2.4s | VERIFIED |
| Dependencies | 0 vulnerabilities; pinned lockfile | VERIFIED |
| Secrets / PII | Targeted tree and history scans pass | VERIFIED |
| Accessibility / display | Desktop and mobile Lighthouse all 100 | VERIFIED |
| Production action | No money movement, customer contact, or customer data | VERIFIED |
| Health helper | All 13 checks accepted; auth and external API controls carry specific N/A rationales | VERIFIED |

## Portal and link verification

| Item | Status |
|---|---|
| Public repository | BLOCKED |
| Deployment URL | PENDING |
| Video URL | BLOCKED |
| Final form preview | BLOCKED |
| Screenshot and local links | README and SUBMISSION validators pass with local-link checks | VERIFIED |

## Red-team closure

| Finding | Severity | Resolution | Status |
|---|---|---|---|
| Perfect-score tie could be accepted by score-only policy | HIGH | Added runner-up margin gate and refusal test | CLOSED |
| Duplicate captures inflate gross amount | HIGH | Event-ID dedupe before totals | CLOSED |
| Late authorized event regresses captured state | HIGH | Monotonic state transition | CLOSED |
| Malformed or oversized records | HIGH | Zod boundary and adversarial tests | CLOSED |
| Footer contrast below WCAG AA | MEDIUM | Darkened footer; audits rerun | CLOSED |
| No live signature-verifying adapter | MEDIUM | Explicit prototype limitation and roadmap | ACCEPTED RISK |

## Final sign-off

G0 is **PASS WITH REVERIFY**, G3 is **PASS**, G4 is **PASS FOR RECORDING**, and G5 is **FAIL** until the founder confirms eligibility, makes the repository public, records the pitch, verifies the links, and submits the form.
