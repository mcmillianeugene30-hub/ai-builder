import * as Sentry from "@sentry/nextjs";

const isInitialized = Sentry.isInitialized();

export function initMonitoring() {
  if (isInitialized) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export async function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error("[Error]", context, error);

  if (isInitialized) {
    Sentry.captureException(error, { extra: context });
    await Sentry.flush(2000);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  console.log(`[${level}] ${message}`);

  if (isInitialized) {
    Sentry.captureMessage(message, level);
  }
}
