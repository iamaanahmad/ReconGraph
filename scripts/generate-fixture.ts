import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildFixture } from "../src/domain/fixture-builder";

const root = resolve(import.meta.dirname, "..");
const { batch, truth } = buildFixture();

await mkdir(resolve(root, "src/data"), { recursive: true });
await mkdir(resolve(root, "benchmarks"), { recursive: true });
await writeFile(
  resolve(root, "src/data/recon-batch.v1.json"),
  `${JSON.stringify(batch, null, 2)}\n`,
);
await writeFile(
  resolve(root, "benchmarks/ground-truth.v1.json"),
  `${JSON.stringify(truth, null, 2)}\n`,
);

const records = Object.values(batch.records).reduce((sum, items) => sum + items.length, 0);
console.log(
  `Generated ${records} synthetic records and ${truth.decisions.length} held-out decisions.`,
);
