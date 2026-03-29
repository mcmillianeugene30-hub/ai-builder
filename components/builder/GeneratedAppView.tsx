import type { GeneratedApp, GenerationMeta } from "@/lib/types";

interface GeneratedAppViewProps {
  data: GeneratedApp;
  meta: GenerationMeta | null;
}

export function GeneratedAppView({ data, meta }: GeneratedAppViewProps) {
  const frontendFiles = Object.keys(data.frontend.files);
  const backendFiles = Object.keys(data.backend.files);

  return (
    <div className="space-y-6">
      {meta && (
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-sm text-slate-200">
          <h3 className="font-semibold text-cyan-300 mb-2">Generation Details</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <p>
              <span className="text-slate-400">Model:</span> {meta.model}
            </p>
            <p>
              <span className="text-slate-400">Provider:</span> {meta.provider}
            </p>
            <p>
              <span className="text-slate-400">Attempt:</span> {meta.attempt}
            </p>
          </div>
          {meta.usage?.total_tokens ? (
            <p className="mt-2 text-slate-300">
              Tokens: {meta.usage.prompt_tokens ?? 0} prompt + {meta.usage.completion_tokens ?? 0} output ={" "}
              {meta.usage.total_tokens} total
            </p>
          ) : null}
        </div>
      )}

      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Frontend</h3>
        <p>
          <span className="text-slate-400">Framework:</span> {data.frontend.framework}
        </p>
        <p>
          <span className="text-slate-400">Files ({frontendFiles.length}):</span> {frontendFiles.slice(0, 5).join(", ")}
          {frontendFiles.length > 5 ? "…" : ""}
        </p>
      </div>

      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Backend</h3>
        <p>
          <span className="text-slate-400">Framework:</span> {data.backend.framework}
        </p>
        <p>
          <span className="text-slate-400">Files ({backendFiles.length}):</span> {backendFiles.slice(0, 5).join(", ")}
          {backendFiles.length > 5 ? "…" : ""}
        </p>
      </div>

      {data.database && (
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Database</h3>
          <p>
            <span className="text-slate-400">Schema:</span> {data.database.schema ?? "None"}
          </p>
          <p>
            <span className="text-slate-400">Migrations ({data.database.migrations?.length ?? 0}):</span>{" "}
            {(data.database.migrations ?? []).slice(0, 3).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
