# Grand prize scorecard

## Snapshot

| Field | Value |
|---|---|
| Project | ReconGraph v1, `feat/recongraph-build` |
| Hackathon / track | Razorpay AI Buildathon / 04 AI Finance Controller |
| Scored by / date | Build agent / 2026-08-21 |
| Deadline | Applications close 5 September; time zone and year are not printed on the event page |
| Official source | [Razorpay AI Buildathon](https://razorpay.com/buildathon/), accessed 2026-08-21 |
| Evidence cutoff | 2026-08-21 04:25 UTC |

## Official-rule verification

| Material fact | Verification | Official source | Status |
|---|---|---|---|
| Student-only eligibility | FACT | Event page | Submitter confirmation BLOCKED |
| Track 4 requires 50+ synthetic records, match rate, and exceptions | FACT | Event page | VERIFIED |
| Public GitHub URL | FACT | Event page | Repository currently private: BLOCKED |
| Five-minute pitch video | FACT | Event page | Recording/link BLOCKED |
| Judging | FACT | Event page: problem taste, build quality, AI judgment, failure recovery | VERIFIED |
| Deadline | FACT with missing year/time zone | Event page footer says applications close 5 September | Reverify before submission |

## Scoring evidence

Equal internal weights are used because official numeric weights are unpublished.

| Criterion | Weight | Score | Confidence | Evidence | Status |
|---|---:|---:|---|---|---|
| Problem | 1.0 | 8.5 | H | Specific dangerous exception workflow | VERIFIED |
| Innovation | 1.0 | 8.5 | H | Score-plus-margin refusal is visible | VERIFIED |
| Technical execution | 1.0 | 9.0 | H | Typed engine, schemas, tests, CI, held-out benchmark | VERIFIED |
| Sponsor integration | 1.0 | 7.0 | H | Razorpay lifecycle is central; live adapter intentionally absent | ACCEPTED RISK |
| UX / design | 1.0 | 9.0 | H | Reviewed screenshot and perfect audits | VERIFIED |
| Demo | 1.0 | 9.0 | H | Deterministic checkpoints and 3/3 repeat runs | VERIFIED |
| Real-world impact | 1.0 | 7.5 | M | Measured synthetic evidence only | ACCEPTED RISK |
| Completeness | 1.0 | 9.0 | H | Code, docs, CI, demo, pitch, fallback, security | VERIFIED |
| Reliability | 1.0 | 9.0 | H | Replay safety and degraded paths tested | VERIFIED |
| Pitch | 1.0 | 8.5 | M | 430-word timed structure; video not recorded | IN PROGRESS |
| Memorability | 1.0 | 9.0 | M | “Perfect score, zero lead, refuse” moment | VERIFIED |

## Normalized result

| Field | Result |
|---|---|
| Weighted overall | 85.5 / 100 |
| Classification | Strong finalist potential |
| Script | `score-project.py`, equal weights |
| Run date | 2026-08-21 |

## Gate overlay

| Gate | Evidence | Status |
|---|---|---|
| G0 Rules known | Official page inspected; deadline time zone/year absent | PASS WITH REVERIFY |
| G1 Direction chosen | Track 4 fit and stopping rule | PASS |
| G2 Design ready | Architecture, threat model, fixture, demo | PASS |
| G3 Build healthy | Check suite, browser, audits, scans | PASS |
| G4 Presentation ready | Script, screenshot, fallbacks, repeat runs | PASS FOR RECORDING |
| G5 Submission ready | Public repo, participant eligibility, video, portal | BLOCKED |

## Priority actions

1. Founder confirms student eligibility and availability.
2. Founder approves making the repository public; then verify the URL logged out.
3. Record, review, and link the five-minute pitch video, then submit before the official cutoff.

## Verdict

**STRONG**, not yet submission-ready. The strongest proven advantage is the observable refusal of a perfect-score tie. The weakest critical evidence is sponsor depth: the prototype uses Razorpay’s lifecycle but not a signed live adapter. The open critical blockers are eligibility, public repository visibility, and the final video.

