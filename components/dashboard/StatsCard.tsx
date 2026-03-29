import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  icon: ReactNode;
  description?: string;
}

export function StatsCard({ title, value, change, icon, description }: StatsCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-slate-700 rounded-lg">{icon}</div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change.trend === "up" ? "text-green-400" : "text-red-400"
          }`}>
            <svg
              className={`w-4 h-4 ${change.trend === "up" ? "rotate-0" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {change.value}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-slate-400">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-2">{description}</p>}
    </div>
  );
}
