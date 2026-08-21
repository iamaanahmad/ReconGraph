# Threat model

## Assets and trust assumptions

The protected assets are reconciliation correctness, event idempotency, and the operator’s ability to distinguish accepted edges from unresolved ones. The shipped demo trusts only repository-owned synthetic fixtures after schema validation. It has no credentials, production data, writable backend, or payment action.

## Reviewed threats

| Threat | Control in this prototype | Residual risk |
|---|---|---|
| Malformed or oversized input | Strict Zod schemas, bounded arrays, constrained IDs and amounts | A future file-upload path needs streaming and resource quotas |
| Duplicate webhook delivery | Deduplicate by stable `eventId` before totals or state update | A production event store needs transactional uniqueness |
| Out-of-order delivery | Monotonic state rank prevents captured-to-authorized regression | More lifecycle states need a formal transition table |
| Ambiguous relationship | Minimum score and runner-up margin; unsafe ties abstain | Thresholds need external calibration |
| Script or HTML injection | IDs accept only letters, digits, underscore, and hyphen; React escapes output | Future free-text fields need their own validation policy |
| Prompt/tool injection | No model, prompt, tool call, or untrusted instruction channel exists | A future model-assisted explanation layer must remain read-only |
| Secret exposure | No runtime secrets; `.env.example` is empty by design; repository scan required before submission | Deployment account metadata stays outside the repo |
| PII exposure | Synthetic references only; no names, emails, phone numbers, or card data | Real adapters need minimization, retention, and deletion controls |

## Security verification

Run `npm audit --audit-level=high`, the unit adversarial-input tests, browser flow tests, and repository/history secret scans before release. These checks establish the prototype boundary; they are not a certification or a production security claim.

