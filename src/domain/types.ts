export type MoneyRecordType = "order" | "payment" | "refund" | "settlement" | "webhook";

export interface OrderRecord {
  type: "order";
  id: string;
  amount: number;
  currency: "INR";
  customerRef: string;
  receipt: string;
  createdAt: string;
}

export interface PaymentRecord {
  type: "payment";
  id: string;
  orderId: string | null;
  amount: number;
  currency: "INR";
  status: "authorized" | "captured" | "failed";
  customerRef: string | null;
  bankReference: string | null;
  createdAt: string;
}

export interface RefundRecord {
  type: "refund";
  id: string;
  paymentId: string | null;
  amount: number;
  currency: "INR";
  status: "processed" | "failed";
  bankReference: string | null;
  createdAt: string;
}

export interface SettlementRecord {
  type: "settlement";
  id: string;
  sourceId: string | null;
  amount: number;
  fee: number;
  tax: number;
  currency: "INR";
  bankReference: string | null;
  settledAt: string;
}

export interface WebhookRecord {
  type: "webhook";
  id: string;
  eventId: string;
  eventType:
    | "payment.authorized"
    | "payment.captured"
    | "refund.processed"
    | "settlement.processed";
  entityId: string;
  occurredAt: string;
  receivedAt: string;
}

export interface FixtureBatch {
  schemaVersion: "recon-batch-v1";
  label: string;
  proofStrength: "SIMULATED";
  presentationMedium: "LIVE SEEDED REPLAY";
  generatedBy: string;
  records: {
    orders: OrderRecord[];
    payments: PaymentRecord[];
    refunds: RefundRecord[];
    settlements: SettlementRecord[];
    webhooks: WebhookRecord[];
  };
}

export interface GroundTruthDecision {
  sourceId: string;
  targetId: string | null;
}

export interface GroundTruth {
  schemaVersion: "recon-ground-truth-v1";
  batchVersion: "recon-batch-v1";
  decisions: GroundTruthDecision[];
}

export interface EvidenceSignal {
  signal: string;
  observation: string;
  weight: number;
}

export interface CandidateMatch {
  targetId: string;
  score: number;
  evidence: EvidenceSignal[];
}

export interface MatchDecision {
  sourceId: string;
  sourceType: "payment" | "refund" | "settlement";
  targetId: string | null;
  status: "hard_match" | "adjudicated" | "review_required" | "unmatched";
  confidence: number;
  rationale: string;
  evidence: EvidenceSignal[];
  candidates: CandidateMatch[];
}

export interface EventRecovery {
  uniqueEvents: number;
  duplicatesSuppressed: number;
  outOfOrderRegressionsPrevented: number;
  grossCapturedPaise: number;
  naiveGrossCapturedPaise: number;
  finalPaymentStates: Record<string, string>;
}

export interface ReconciliationResult {
  runId: string;
  batchVersion: string;
  recordsProcessed: number;
  decisions: MatchDecision[];
  matchedCount: number;
  hardMatchCount: number;
  adjudicatedCount: number;
  unresolvedCount: number;
  eventRecovery: EventRecovery;
}

export interface BenchmarkResult {
  batchVersion: string;
  measuredAt: string;
  environment: string;
  method: string;
  records: number;
  decisions: number;
  correctDecisions: number;
  matched: number;
  unresolved: number;
  accuracy: number;
  matchRate: number;
  precision: number;
  recall: number;
  duplicatesSuppressed: number;
  outOfOrderRegressionsPrevented: number;
  grossCapturedPaise: number;
  naiveGrossCapturedPaise: number;
  noDoubleCounting: boolean;
}
