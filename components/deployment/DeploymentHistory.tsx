"use client";

import { formatDistanceToNow } from "date-fns";

interface DeploymentHistoryProps {
  deployments: Array<{
    id: string;
    status: string;
    url: string | null;
    created_at: string;
  }>;
}

export function DeploymentHistory({ deployments }: DeploymentHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "building":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "canceled":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Deployment History</h3>
      </div>
      <div className="divide-y divide-slate-700">
        {deployments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>No deployments yet</p>
          </div>
        ) : (
          deployments.map((deployment) => (
            <div key={deployment.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                  {deployment.status}
                </span>
                <div>
                  <p className="text-sm text-white">Deployment #{deployment.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(deployment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View Live
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
