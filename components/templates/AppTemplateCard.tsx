"use client";

import type { ReactNode } from "react";

interface AppTemplateCardProps {
  name: string;
  description: string;
  icon: string;
  features: string[];
  onClick: () => void;
}

export function AppTemplateCard({ name, description, icon, features, onClick }: AppTemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-6 text-left hover:border-cyan-500 hover:bg-slate-750 transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-xs text-slate-300">
            <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}
