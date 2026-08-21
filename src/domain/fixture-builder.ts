import type {
  FixtureBatch,
  GroundTruth,
  OrderRecord,
  PaymentRecord,
  RefundRecord,
  SettlementRecord,
  WebhookRecord,
} from "./types";

const BASE_TIME = Date.parse("2026-08-18T09:00:00.000Z");
const minute = 60_000;
const hour = 60 * minute;

function at(offsetMs: number): string {
  return new Date(BASE_TIME + offsetMs).toISOString();
}

function number(value: number): string {
  return String(value).padStart(3, "0");
}

export function buildFixture(): { batch: FixtureBatch; truth: GroundTruth } {
  const orders: OrderRecord[] = [];
  const payments: PaymentRecord[] = [];
  const refunds: RefundRecord[] = [];
  const settlements: SettlementRecord[] = [];
  const webhooks: WebhookRecord[] = [];
  const decisions: GroundTruth["decisions"] = [];

  for (let index = 1; index <= 28; index += 1) {
    const id = number(index);
    let amount = 100_000 + index * 11_700;
    let customerRef = `cust_${number(((index - 1) % 11) + 1)}`;
    let createdAt = at(index * 2 * hour);

    if (index === 25 || index === 26) {
      amount = 438_500;
      customerRef = "cust_amb_2526";
      createdAt = at((50 + (index - 25) * 6) * hour);
    }
    if (index === 27 || index === 28) {
      amount = 612_400;
      customerRef = "cust_amb_2728";
      createdAt = at(68 * hour + (index - 27) * 4 * minute);
    }

    const order: OrderRecord = {
      type: "order",
      id: `ord_${id}`,
      amount,
      currency: "INR",
      customerRef,
      receipt: `rcpt_${id}`,
      createdAt,
    };
    orders.push(order);

    const needsAdjudication = index === 25 || index === 26 || index === 27;
    const payment: PaymentRecord = {
      type: "payment",
      id: `pay_${id}`,
      orderId: needsAdjudication ? null : order.id,
      amount,
      currency: "INR",
      status: "captured",
      customerRef,
      bankReference: `bank_${id}`,
      createdAt:
        index === 27
          ? at(68 * hour + 2 * minute)
          : new Date(Date.parse(createdAt) + 3 * minute).toISOString(),
    };
    payments.push(payment);
    decisions.push({ sourceId: payment.id, targetId: order.id });
  }

  for (const index of [29, 30]) {
    const id = number(index);
    const payment: PaymentRecord = {
      type: "payment",
      id: `pay_${id}`,
      orderId: null,
      amount: index === 29 ? 999_900 : 777_700,
      currency: "INR",
      status: "failed",
      customerRef: null,
      bankReference: null,
      createdAt: at((80 + index) * hour),
    };
    payments.push(payment);
    decisions.push({ sourceId: payment.id, targetId: null });
  }

  for (let index = 1; index <= 10; index += 1) {
    const id = number(index);
    const targetPayment = payments[index - 1];
    if (!targetPayment) throw new Error(`Missing payment fixture ${index}`);
    const isBankReferenceMatch = index === 9;
    const isUnsafe = index === 10;
    const refund: RefundRecord = {
      type: "refund",
      id: `rfnd_${id}`,
      paymentId: isBankReferenceMatch || isUnsafe ? null : targetPayment.id,
      amount: Math.round(targetPayment.amount * 0.25),
      currency: "INR",
      status: "processed",
      bankReference: isBankReferenceMatch
        ? targetPayment.bankReference
        : isUnsafe
          ? null
          : `rfbank_${id}`,
      createdAt: new Date(Date.parse(targetPayment.createdAt) + 12 * hour).toISOString(),
    };
    refunds.push(refund);
    decisions.push({ sourceId: refund.id, targetId: isUnsafe ? null : targetPayment.id });
  }

  for (let index = 1; index <= 14; index += 1) {
    const id = number(index);
    const target = index <= 10 ? payments[index - 1] : refunds[index - 11];
    if (!target) throw new Error(`Missing settlement source fixture ${index}`);
    const isBankReferenceMatch = index === 13;
    const isUnsafe = index === 14;
    const amount = "amount" in target ? target.amount : 0;
    const settlement: SettlementRecord = {
      type: "settlement",
      id: `stl_${id}`,
      sourceId: isBankReferenceMatch || isUnsafe ? null : target.id,
      amount: Math.max(0, amount - 280),
      fee: 237,
      tax: 43,
      currency: "INR",
      bankReference: isBankReferenceMatch
        ? "bankReference" in target
          ? target.bankReference
          : null
        : isUnsafe
          ? null
          : `stlbank_${id}`,
      settledAt: at((100 + index) * hour),
    };
    settlements.push(settlement);
    decisions.push({ sourceId: settlement.id, targetId: isUnsafe ? null : target.id });
  }

  for (let index = 1; index <= 20; index += 1) {
    const id = number(index);
    const payment = payments[index - 1];
    if (!payment) throw new Error(`Missing webhook payment fixture ${index}`);
    webhooks.push({
      type: "webhook",
      id: `wh_pay_${id}`,
      eventId: `evt_pay_${id}_captured`,
      eventType: "payment.captured",
      entityId: payment.id,
      occurredAt: new Date(Date.parse(payment.createdAt) + minute).toISOString(),
      receivedAt: new Date(Date.parse(payment.createdAt) + 2 * minute).toISOString(),
    });
  }

  const firstPayment = payments[0];
  if (!firstPayment) throw new Error("Missing first payment fixture");
  webhooks.push({
    type: "webhook",
    id: "wh_pay_001_late_authorized",
    eventId: "evt_pay_001_authorized",
    eventType: "payment.authorized",
    entityId: firstPayment.id,
    occurredAt: firstPayment.createdAt,
    receivedAt: new Date(Date.parse(firstPayment.createdAt) + 15 * minute).toISOString(),
  });

  for (let index = 1; index <= 8; index += 1) {
    const id = number(index);
    const refund = refunds[index - 1];
    if (!refund) throw new Error(`Missing refund webhook fixture ${index}`);
    webhooks.push({
      type: "webhook",
      id: `wh_refund_${id}`,
      eventId: `evt_refund_${id}`,
      eventType: "refund.processed",
      entityId: refund.id,
      occurredAt: refund.createdAt,
      receivedAt: new Date(Date.parse(refund.createdAt) + minute).toISOString(),
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = number(index);
    const settlement = settlements[index - 1];
    if (!settlement) throw new Error(`Missing settlement webhook fixture ${index}`);
    webhooks.push({
      type: "webhook",
      id: `wh_settlement_${id}`,
      eventId: `evt_settlement_${id}`,
      eventType: "settlement.processed",
      entityId: settlement.id,
      occurredAt: settlement.settledAt,
      receivedAt: new Date(Date.parse(settlement.settledAt) + minute).toISOString(),
    });
  }

  for (let index = 1; index <= 4; index += 1) {
    const original = webhooks[index];
    if (!original) throw new Error(`Missing duplicate webhook source ${index}`);
    webhooks.push({
      ...original,
      id: `${original.id}_retry`,
      receivedAt: new Date(Date.parse(original.receivedAt) + 30 * minute).toISOString(),
    });
  }

  return {
    batch: {
      schemaVersion: "recon-batch-v1",
      label: "Synthetic Razorpay-shaped close batch v1",
      proofStrength: "SIMULATED",
      presentationMedium: "LIVE SEEDED REPLAY",
      generatedBy: "scripts/generate-fixture.ts",
      records: { orders, payments, refunds, settlements, webhooks },
    },
    truth: {
      schemaVersion: "recon-ground-truth-v1",
      batchVersion: "recon-batch-v1",
      decisions,
    },
  };
}
