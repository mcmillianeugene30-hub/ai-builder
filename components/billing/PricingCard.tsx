"use client";

import type { PlanName } from "@/lib/pricing";

interface PricingCardProps {
  plan: PlanName;
  price: { monthly: number; annual: number };
  cycle: "monthly" | "annual";
  features: {
    projectsLimit: number;
    aiGenerationsPerMonth: number;
    mobileBuildsPerMonth: number;
    customDomains: number;
    realtimeCollaborators: number;
    prioritySupport: boolean;
    advancedModels: boolean;
  };
  description: string;
  isCurrent?: boolean;
  onSelect: (plan: PlanName) => void;
}

export function PricingCard({ plan, price, cycle, features, description, isCurrent = false, onSelect }: PricingCardProps) {
  const displayPrice = price[cycle] / 100;
  const isPopular = plan === "pro";
  const isEnterprise = plan === "enterprise";

  return (
    <div className={`relative bg-slate-800 border-2 rounded-2xl p-6 transition-all ${
      isPopular ? "border-cyan-500 shadow-lg shadow-cyan-500/10" : "border-slate-700 hover:border-slate-600"
    } ${isCurrent ? "border-green-500" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
            Current
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2 capitalize">{plan}</h3>
        <p className="text-slate-400 text-sm mb-4">{description}</p>

        {!isEnterprise ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">${displayPrice.toFixed(2)}</span>
            <span className="text-slate-400">/{cycle}</span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-white">Custom</div>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        <FeatureItem
          label="Projects"
          value={features.projectsLimit === -1 ? "Unlimited" : `${features.projectsLimit}`}
        />
        <FeatureItem
          label="AI Generations"
          value={features.aiGenerationsPerMonth === -1 ? "Unlimited" : `${features.aiGenerationsPerMonth}/mo`}
        />
        <FeatureItem
          label="Mobile Builds"
          value={features.mobileBuildsPerMonth === -1 ? "Unlimited" : `${features.mobileBuildsPerMonth}/mo`}
        />
        <FeatureItem
          label="Custom Domains"
          value={features.customDomains === -1 ? "Unlimited" : features.customDomains}
        />
        <FeatureItem
          label="Real-time Collaborators"
          value={features.realtimeCollaborators === -1 ? "Unlimited" : features.realtimeCollaborators}
        />
        <FeatureItem label="Priority Support" value={features.prioritySupport} />
        <FeatureItem label="Advanced AI Models" value={features.advancedModels} />
      </ul>

      {!isEnterprise && (
        <button
          onClick={() => onSelect(plan)}
          disabled={isCurrent}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isCurrent
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : isPopular
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
        >
          {isCurrent ? "Current Plan" : `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
        </button>
      )}

      {isEnterprise && (
        <button
          onClick={() => onSelect(plan)}
          className="w-full py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          Contact Sales
        </button>
      )}
    </div>
  );
}

interface FeatureItemProps {
  label: string;
  value: string | number | boolean;
}

function FeatureItem({ label, value }: FeatureItemProps) {
  const isBoolean = typeof value === "boolean";
  const isEnabled = isBoolean && value;

  return (
    <li className="flex items-center gap-3">
      {isBoolean ? (
        <div className={`w-5 h-5 rounded flex items-center justify-center ${isEnabled ? "bg-green-500/20" : "bg-slate-700"}`}>
          {isEnabled ? (
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      ) : (
        <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <span className="text-slate-300 text-sm flex-1">{label}</span>
      <span className={`text-sm font-medium ${isBoolean ? (isEnabled ? "text-green-400" : "text-slate-500") : "text-slate-400"}`}>
        {isBoolean ? (isEnabled ? "Yes" : "No") : value}
      </span>
    </li>
  );
}
