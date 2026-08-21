# Benchmark method and results

## Method

`npm run benchmark` runs the deterministic engine against `src/data/recon-batch.v1.json`, then compares 54 source-to-target decisions with the separately stored `ground-truth.v1.json`. A correct abstention counts as correct. Precision and recall apply to accepted matches. The event-recovery assertions compare deduplicated captured value with the naive total from every received capture delivery.

The fixture contains 127 synthetic records: 28 orders, 30 payments, 10 refunds, 14 settlements, and 45 webhook deliveries. It includes missing foreign keys, unique bank references, near-identical candidates, a perfect candidate tie, four duplicate deliveries, and one late state-regression attempt.

## Results

Measured on 2026-08-21 with Node.js 22, locally, without network or model calls:

| Metric | Result |
|---|---:|
| Exact held-out decisions | 53 / 54 |
| Accuracy, including correct abstentions | 98.1% |
| Accepted matches | 49 / 54 |
| Precision on accepted matches | 100% |
| Recall on expected matches | 98.0% |
| Unresolved | 5 |
| Duplicate deliveries suppressed | 4 |
| Late regressions prevented | 1 |
| Verified captured total | ₹44,570 |
| Naive duplicate-inflated total | ₹50,208 |

## Limitations

The fixture is authored, synthetic, and small. It proves deterministic behavior on documented cases, not real-world generalization, fraud detection, regulatory compliance, or production scalability. One held-out decision is intentionally missed; that makes the reported accuracy a real evaluation result rather than a hard-coded perfect score.

