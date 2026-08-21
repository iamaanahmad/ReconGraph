const PUBLIC_INGESTION_KEY = "phc_oKFoUwuen9ACEaseQGD8vDjSVs2nJYAJpLS88CwHanyF";
const INGEST_HOST = "https://us.i.posthog.com";

type PostHogClient = typeof import("posthog-js")["default"];

let clientPromise: Promise<PostHogClient> | null = null;

function getPostHog(): Promise<PostHogClient> {
  if (!clientPromise) {
    clientPromise = import("posthog-js").then(({ default: posthog }) => {
      posthog.init(PUBLIC_INGESTION_KEY, {
        api_host: INGEST_HOST,
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        person_profiles: "identified_only",
      });
      return posthog;
    });
  }

  return clientPromise;
}

function withPostHog(callback: (posthog: PostHogClient) => void): void {
  void getPostHog()
    .then(callback)
    .catch(() => {
      // Analytics must never block the deterministic replay when the network is unavailable.
    });
}

export interface ReconciliationCompletedProperties {
  batchVersion: string;
  recordsProcessed: number;
  matchedCount: number;
  unresolvedCount: number;
  duplicatesSuppressed: number;
}

export function initializeAnalytics(): void {
  withPostHog(() => {});
}

export function captureReconciliationStarted(batchVersion: string, recordCount: number): void {
  withPostHog((posthog) => {
    posthog.capture("reconciliation_started", {
      batch_version: batchVersion,
      record_count: recordCount,
    });
  });
}

export function captureReconciliationCompleted(
  properties: ReconciliationCompletedProperties,
): void {
  withPostHog((posthog) => {
    posthog.capture("reconciliation_completed", {
      batch_version: properties.batchVersion,
      record_count: properties.recordsProcessed,
      matched_count: properties.matchedCount,
      unresolved_count: properties.unresolvedCount,
      duplicates_suppressed: properties.duplicatesSuppressed,
    });
  });
}
