import { describe, expect, it } from "vitest";
import batch from "../data/recon-batch.v1.json";
import { runReconciliation } from "./reconcile";

describe("runReconciliation", () => {
  it("reconciles the complete versioned fixture deterministically", () => {
    const first = runReconciliation(batch);
    const second = runReconciliation(batch);

    expect(first).toEqual(second);
    expect(first.recordsProcessed).toBe(127);
    expect(first.matchedCount).toBe(49);
    expect(first.hardMatchCount).toBe(45);
    expect(first.adjudicatedCount).toBe(4);
    expect(first.unresolvedCount).toBe(5);
  });

  it("accepts a bounded ambiguous match only with evidence and a safe lead", () => {
    const result = runReconciliation(batch);
    const decision = result.decisions.find(({ sourceId }) => sourceId === "pay_025");

    expect(decision).toMatchObject({
      targetId: "ord_025",
      status: "adjudicated",
      confidence: 1,
    });
    expect(decision?.candidates.map(({ score }) => score)).toEqual([1, 0.8]);
    expect(decision?.evidence.map(({ signal }) => signal)).toEqual([
      "amount",
      "currency",
      "customer_ref",
      "time_window",
    ]);
  });

  it("refuses a perfectly tied match instead of inventing certainty", () => {
    const decision = runReconciliation(batch).decisions.find(
      ({ sourceId }) => sourceId === "pay_027",
    );

    expect(decision).toMatchObject({
      targetId: null,
      status: "review_required",
      confidence: 1,
    });
    expect(decision?.candidates).toHaveLength(2);
    expect(decision?.candidates[0]?.score).toBe(decision?.candidates[1]?.score);
    expect(decision?.rationale).toContain("margin 0.00");
  });

  it("deduplicates webhook retries and prevents state regression", () => {
    const recovery = runReconciliation(batch).eventRecovery;

    expect(recovery.duplicatesSuppressed).toBe(4);
    expect(recovery.outOfOrderRegressionsPrevented).toBe(1);
    expect(recovery.grossCapturedPaise).toBe(4_457_000);
    expect(recovery.naiveGrossCapturedPaise).toBe(5_020_800);
    expect(recovery.finalPaymentStates.pay_001).toBe("captured");
  });

  it("rejects malformed and hostile input before any decision is made", () => {
    const malformed = structuredClone(batch);
    const firstPayment = malformed.records.payments[0];
    if (!firstPayment) throw new Error("Fixture must contain a payment");
    firstPayment.id = "<script>alert(1)</script>";
    expect(() => runReconciliation(malformed)).toThrow();

    const oversized = structuredClone(batch);
    const firstOrder = batch.records.orders[0];
    if (!firstOrder) throw new Error("Fixture must contain an order");
    oversized.records.orders = Array.from({ length: 1_001 }, () => firstOrder);
    expect(() => runReconciliation(oversized)).toThrow();
  });
});
