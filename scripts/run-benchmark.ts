import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runReconciliation } from "../src/domain/reconcile";
import type { BenchmarkResult, FixtureBatch, GroundTruth } from "../src/domain/types";

const root = resolve(import.meta.dirname, "..");
const batch = JSON.parse(
  await readFile(resolve(root, "src/data/recon-batch.v1.json"), "utf8"),
) as FixtureBatch;
const truth = JSON.parse(
  await readFile(resolve(root, "benchmarks/ground-truth.v1.json"), "utf8"),
) as GroundTruth;
const result = runReconciliation(batch);
const predictions = new Map(
  result.decisions.map((decision) => [decision.sourceId, decision.targetId]),
);
const correctDecisions = truth.decisions.filter(
  (decision) => predictions.get(decision.sourceId) === decision.targetId,
).length;
const truthPositive = truth.decisions.filter((decision) => decision.targetId !== null).length;
const predictedPositive = result.decisions.filter((decision) => decision.targetId !== null);
const truePositive = predictedPositive.filter(
  (decision) =>
    truth.decisions.find((item) => item.sourceId === decision.sourceId)?.targetId ===
    decision.targetId,
).length;

const benchmark: BenchmarkResult = {
  batchVersion: batch.schemaVersion,
  measuredAt: "2026-08-21",
  environment: "Node.js 22, deterministic local fixture, no network or model calls",
  method:
    "Exact source-to-target classification against separately stored held-out ground truth, including correct abstentions.",
  records: result.recordsProcessed,
  decisions: truth.decisions.length,
  correctDecisions,
  matched: result.matchedCount,
  unresolved: result.unresolvedCount,
  accuracy: correctDecisions / truth.decisions.length,
  matchRate: result.matchedCount / truth.decisions.length,
  precision: truePositive / Math.max(1, predictedPositive.length),
  recall: truePositive / Math.max(1, truthPositive),
  duplicatesSuppressed: result.eventRecovery.duplicatesSuppressed,
  outOfOrderRegressionsPrevented: result.eventRecovery.outOfOrderRegressionsPrevented,
  grossCapturedPaise: result.eventRecovery.grossCapturedPaise,
  naiveGrossCapturedPaise: result.eventRecovery.naiveGrossCapturedPaise,
  noDoubleCounting:
    result.eventRecovery.grossCapturedPaise < result.eventRecovery.naiveGrossCapturedPaise,
};

await writeFile(
  resolve(root, "public/benchmark-results.v1.json"),
  `${JSON.stringify(benchmark, null, 2)}\n`,
);
await writeFile(
  resolve(root, "src/data/benchmark-results.v1.json"),
  `${JSON.stringify(benchmark, null, 2)}\n`,
);
console.log(JSON.stringify(benchmark, null, 2));
