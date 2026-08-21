import { fixtureBatchSchema } from "./schema";
import type {
  CandidateMatch,
  EvidenceSignal,
  FixtureBatch,
  MatchDecision,
  OrderRecord,
  PaymentRecord,
  ReconciliationResult,
} from "./types";

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

function recordCount(batch: FixtureBatch): number {
  return Object.values(batch.records).reduce((sum, records) => sum + records.length, 0);
}

function scoreOrderCandidate(payment: PaymentRecord, order: OrderRecord): CandidateMatch | null {
  const timeDistanceMs = Math.abs(Date.parse(payment.createdAt) - Date.parse(order.createdAt));
  if (
    payment.amount !== order.amount ||
    payment.currency !== order.currency ||
    timeDistanceMs > 86_400_000
  ) {
    return null;
  }

  const evidence: EvidenceSignal[] = [
    { signal: "amount", observation: `Exact INR ${payment.amount} paise`, weight: 0.45 },
    { signal: "currency", observation: "INR on both records", weight: 0.05 },
  ];

  if (payment.customerRef && payment.customerRef === order.customerRef) {
    evidence.push({ signal: "customer_ref", observation: payment.customerRef, weight: 0.25 });
  }

  const minutes = Math.round(timeDistanceMs / 60_000);
  if (minutes <= 10) {
    evidence.push({ signal: "time_window", observation: `${minutes} minutes apart`, weight: 0.25 });
  } else if (minutes <= 60) {
    evidence.push({ signal: "time_window", observation: `${minutes} minutes apart`, weight: 0.12 });
  } else {
    evidence.push({ signal: "time_window", observation: `${minutes} minutes apart`, weight: 0.05 });
  }

  return {
    targetId: order.id,
    score: roundScore(evidence.reduce((sum, signal) => sum + signal.weight, 0)),
    evidence,
  };
}

function decidePayment(payment: PaymentRecord, orders: OrderRecord[]): MatchDecision {
  const explicitOrder = payment.orderId
    ? orders.find((order) => order.id === payment.orderId)
    : undefined;
  if (explicitOrder) {
    return {
      sourceId: payment.id,
      sourceType: "payment",
      targetId: explicitOrder.id,
      status: "hard_match",
      confidence: 1,
      rationale: "The payment carries a valid order_id foreign key.",
      evidence: [{ signal: "order_id", observation: explicitOrder.id, weight: 1 }],
      candidates: [],
    };
  }

  const candidates = orders
    .map((order) => scoreOrderCandidate(payment, order))
    .filter((candidate): candidate is CandidateMatch => candidate !== null)
    .sort((a, b) => b.score - a.score || a.targetId.localeCompare(b.targetId));
  const best = candidates[0];
  const runnerUp = candidates[1];

  if (!best) {
    return {
      sourceId: payment.id,
      sourceType: "payment",
      targetId: null,
      status: "unmatched",
      confidence: 0,
      rationale: "No order passed amount, currency, and 24-hour candidate validation.",
      evidence: [],
      candidates: [],
    };
  }

  const margin = best.score - (runnerUp?.score ?? 0);
  if (best.score >= 0.85 && margin >= 0.12) {
    return {
      sourceId: payment.id,
      sourceType: "payment",
      targetId: best.targetId,
      status: "adjudicated",
      confidence: best.score,
      rationale: `Bounded adjudication accepted the top candidate with a ${roundScore(margin)} margin.`,
      evidence: best.evidence,
      candidates: candidates.slice(0, 3),
    };
  }

  return {
    sourceId: payment.id,
    sourceType: "payment",
    targetId: null,
    status: "review_required",
    confidence: best.score,
    rationale: `Refused: top candidate score ${best.score.toFixed(2)} and margin ${roundScore(margin).toFixed(2)} do not clear both safety gates.`,
    evidence: best.evidence,
    candidates: candidates.slice(0, 3),
  };
}

function recoverEvents(batch: FixtureBatch) {
  const received = [...batch.records.webhooks].sort(
    (a, b) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt) || a.id.localeCompare(b.id),
  );
  const seen = new Set<string>();
  const finalPaymentStates: Record<string, string> = {};
  let duplicatesSuppressed = 0;
  let outOfOrderRegressionsPrevented = 0;
  let grossCapturedPaise = 0;
  let naiveGrossCapturedPaise = 0;
  const paymentById = new Map(batch.records.payments.map((payment) => [payment.id, payment]));
  const rank: Record<string, number> = { authorized: 1, captured: 2 };

  for (const event of received) {
    if (event.eventType === "payment.captured") {
      naiveGrossCapturedPaise += paymentById.get(event.entityId)?.amount ?? 0;
    }
    if (seen.has(event.eventId)) {
      duplicatesSuppressed += 1;
      continue;
    }
    seen.add(event.eventId);

    if (event.eventType === "payment.captured") {
      grossCapturedPaise += paymentById.get(event.entityId)?.amount ?? 0;
    }
    if (event.eventType.startsWith("payment.")) {
      const next = event.eventType.split(".")[1] ?? "unknown";
      const current = finalPaymentStates[event.entityId];
      if (current && (rank[next] ?? 0) < (rank[current] ?? 0)) {
        outOfOrderRegressionsPrevented += 1;
      } else {
        finalPaymentStates[event.entityId] = next;
      }
    }
  }

  return {
    uniqueEvents: seen.size,
    duplicatesSuppressed,
    outOfOrderRegressionsPrevented,
    grossCapturedPaise,
    naiveGrossCapturedPaise,
    finalPaymentStates,
  };
}

export function runReconciliation(input: unknown): ReconciliationResult {
  const batch = fixtureBatchSchema.parse(input) as FixtureBatch;
  const paymentDecisions = batch.records.payments.map((payment) =>
    decidePayment(payment, batch.records.orders),
  );
  const paymentById = new Map(batch.records.payments.map((payment) => [payment.id, payment]));
  const refundById = new Map(batch.records.refunds.map((refund) => [refund.id, refund]));

  const refundDecisions: MatchDecision[] = batch.records.refunds.map((refund) => {
    const explicit = refund.paymentId ? paymentById.get(refund.paymentId) : undefined;
    const bankMatches = refund.bankReference
      ? batch.records.payments.filter((payment) => payment.bankReference === refund.bankReference)
      : [];
    const inferred = bankMatches.length === 1 ? bankMatches[0] : undefined;
    const target = explicit ?? inferred;
    if (!target) {
      return {
        sourceId: refund.id,
        sourceType: "refund",
        targetId: null,
        status: refund.bankReference ? "review_required" : "unmatched",
        confidence: 0,
        rationale: "No unique payment reference passed validation.",
        evidence: [],
        candidates: [],
      };
    }
    const inferredMatch = !explicit;
    return {
      sourceId: refund.id,
      sourceType: "refund",
      targetId: target.id,
      status: inferredMatch ? "adjudicated" : "hard_match",
      confidence: inferredMatch ? 0.98 : 1,
      rationale: inferredMatch
        ? "A unique bank reference links this refund to one payment."
        : "The refund carries a valid payment_id foreign key.",
      evidence: [
        {
          signal: inferredMatch ? "bank_reference" : "payment_id",
          observation: inferredMatch ? (refund.bankReference ?? "") : target.id,
          weight: inferredMatch ? 0.98 : 1,
        },
      ],
      candidates: [],
    };
  });

  const settlementDecisions: MatchDecision[] = batch.records.settlements.map((settlement) => {
    const explicit = settlement.sourceId
      ? (paymentById.get(settlement.sourceId) ?? refundById.get(settlement.sourceId))
      : undefined;
    const bankMatches = settlement.bankReference
      ? [...batch.records.payments, ...batch.records.refunds].filter(
          (source) => source.bankReference === settlement.bankReference,
        )
      : [];
    const inferred = bankMatches.length === 1 ? bankMatches[0] : undefined;
    const target = explicit ?? inferred;
    if (!target) {
      return {
        sourceId: settlement.id,
        sourceType: "settlement",
        targetId: null,
        status: settlement.bankReference ? "review_required" : "unmatched",
        confidence: 0,
        rationale: "No unique source record passed settlement validation.",
        evidence: [],
        candidates: [],
      };
    }
    const inferredMatch = !explicit;
    return {
      sourceId: settlement.id,
      sourceType: "settlement",
      targetId: target.id,
      status: inferredMatch ? "adjudicated" : "hard_match",
      confidence: inferredMatch ? 0.98 : 1,
      rationale: inferredMatch
        ? "A unique bank reference links this settlement to one source record."
        : "The settlement carries a valid source_id foreign key.",
      evidence: [
        {
          signal: inferredMatch ? "bank_reference" : "source_id",
          observation: inferredMatch ? (settlement.bankReference ?? "") : target.id,
          weight: inferredMatch ? 0.98 : 1,
        },
      ],
      candidates: [],
    };
  });

  const decisions = [...paymentDecisions, ...refundDecisions, ...settlementDecisions];
  return {
    runId: "run_recon_batch_v1",
    batchVersion: batch.schemaVersion,
    recordsProcessed: recordCount(batch),
    decisions,
    matchedCount: decisions.filter((decision) => decision.targetId !== null).length,
    hardMatchCount: decisions.filter((decision) => decision.status === "hard_match").length,
    adjudicatedCount: decisions.filter((decision) => decision.status === "adjudicated").length,
    unresolvedCount: decisions.filter((decision) => decision.targetId === null).length,
    eventRecovery: recoverEvents(batch),
  };
}
