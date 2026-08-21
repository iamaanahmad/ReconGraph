# Verification record

## Final checks

| Check | Result | Evidence |
|---|---|---|
| Format and lint | Pass | Biome, zero warnings |
| Types | Pass | TypeScript project build |
| Unit and adversarial input | 5 / 5 pass | Determinism, acceptance, refusal, replay safety, malformed/oversized input |
| Browser flows | 4 / 4 pass | Desktop core flow, degraded states, reset, 390px layout |
| Repeatability | 3 / 3 pass | Core flow with refusal repeated in fresh Chromium contexts |
| Production build | Pass | Vite bundle generated |
| Dependencies | 0 vulnerabilities | `npm audit --audit-level=high`, 2026-08-21 |
| Secrets | No credential-shaped assignments or high-confidence history patterns | Targeted working-tree and git-history scan |
| PII | No email or Indian phone patterns in tracked product files | Targeted working-tree scan |
| Lighthouse desktop | 100 / 100 / 100 / 100 | Accessibility / best practices / SEO / agentic browsing |
| Lighthouse mobile | 100 / 100 / 100 / 100 | Accessibility / best practices / SEO / agentic browsing |
| Performance trace | LCP 2.04s; CLS 0.01 | Local dev server, unthrottled lab run |

## What broke and how we got out

The first end-to-end run failed before it reached the product because Playwright had downloaded Chrome but not its separate headless-shell binary. All four tests failed at browser launch with the same missing-executable message. Inspection confirmed this was an isolated runner dependency, not an app path. Installing `chromium-headless-shell` and rerunning the unchanged suite produced 4/4 passing flows; the core demo then passed three more fresh Chromium runs.

Lighthouse also found two presentation issues: the 11px footer text had a 3.39:1 contrast ratio, and `llms.txt` lacked links. The footer color was darkened to reach WCAG AA, the machine-readable file gained canonical links, and both desktop and mobile audits then passed every checked category at 100.

## Evidence boundary

All records are synthetic and all financial results are measured only on the repository fixture. This record does not claim production safety, external validity, regulatory compliance, or real merchant impact.

