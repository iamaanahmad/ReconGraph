import { z } from "zod";

const isoDate = z.string().datetime({ offset: true });
const id = z
  .string()
  .regex(/^[a-z0-9_-]+$/i)
  .max(80);
const money = z.number().int().nonnegative().max(100_000_000);

const orderSchema = z.object({
  type: z.literal("order"),
  id,
  amount: money.positive(),
  currency: z.literal("INR"),
  customerRef: id,
  receipt: id,
  createdAt: isoDate,
});

const paymentSchema = z.object({
  type: z.literal("payment"),
  id,
  orderId: id.nullable(),
  amount: money.positive(),
  currency: z.literal("INR"),
  status: z.enum(["authorized", "captured", "failed"]),
  customerRef: id.nullable(),
  bankReference: id.nullable(),
  createdAt: isoDate,
});

const refundSchema = z.object({
  type: z.literal("refund"),
  id,
  paymentId: id.nullable(),
  amount: money.positive(),
  currency: z.literal("INR"),
  status: z.enum(["processed", "failed"]),
  bankReference: id.nullable(),
  createdAt: isoDate,
});

const settlementSchema = z.object({
  type: z.literal("settlement"),
  id,
  sourceId: id.nullable(),
  amount: money,
  fee: money,
  tax: money,
  currency: z.literal("INR"),
  bankReference: id.nullable(),
  settledAt: isoDate,
});

const webhookSchema = z.object({
  type: z.literal("webhook"),
  id,
  eventId: id,
  eventType: z.enum([
    "payment.authorized",
    "payment.captured",
    "refund.processed",
    "settlement.processed",
  ]),
  entityId: id,
  occurredAt: isoDate,
  receivedAt: isoDate,
});

export const fixtureBatchSchema = z.object({
  schemaVersion: z.literal("recon-batch-v1"),
  label: z.string().min(1).max(120),
  proofStrength: z.literal("SIMULATED"),
  presentationMedium: z.literal("LIVE SEEDED REPLAY"),
  generatedBy: z.string().min(1).max(120),
  records: z.object({
    orders: z.array(orderSchema).max(1_000),
    payments: z.array(paymentSchema).max(1_000),
    refunds: z.array(refundSchema).max(1_000),
    settlements: z.array(settlementSchema).max(1_000),
    webhooks: z.array(webhookSchema).max(2_000),
  }),
});
