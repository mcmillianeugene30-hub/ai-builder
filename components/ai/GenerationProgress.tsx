"use client";

interface GenerationProgressProps {
  step: number;
  totalSteps: number;
  currentTask: string;
}

export function GenerationProgress({ step, totalSteps, currentTask }: GenerationProgressProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Generating App</h3>
        <span className="text-sm text-slate-400">
          {step} of {totalSteps}
        </span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {step >= 1 ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
            </div>
          )}
          <span className={`text-sm ${step >= 1 ? "text-white" : "text-slate-500"}`}>
            Analyzing requirements
          </span>
        </div>

        <div className="flex items-center gap-3">
          {step >= 2 ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
            </div>
          )}
          <span className={`text-sm ${step >= 2 ? "text-white" : "text-slate-500"}`}>
            Generating frontend code
          </span>
        </div>

        <div className="flex items-center gap-3">
          {step >= 3 ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
            </div>
          )}
          <span className={`text-sm ${step >= 3 ? "text-white" : "text-slate-500"}`}>
            Generating backend code
          </span>
        </div>

        <div className="flex items-center gap-3">
          {step >= 4 ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
            </div>
          )}
          <span className={`text-sm ${step >= 4 ? "text-white" : "text-slate-500"}`}>
            Creating database schema
          </span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <p className="text-sm text-cyan-400">
          <span className="font-medium">Currently:</span> {currentTask}
        </p>
      </div>
    </div>
  );
}
