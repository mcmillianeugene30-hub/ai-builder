"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { useEffect } from "react";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

function ErrorFallback({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="max-w-md p-8 bg-red-900/50 border border-red-700 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
          <p className="text-red-300 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}

export default function GlobalError({ error }: { error: Error; reset: () => void }) {
  return (
    <ReactErrorBoundary fallback={<ErrorFallback error={error} />}>
      <ErrorFallback error={error} />
    </ReactErrorBoundary>
  );
}
