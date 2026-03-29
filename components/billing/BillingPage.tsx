"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import { Button } from "../ui/Button";
import { PLAN_PRICES, PLAN_FEATURES, PLAN_DESCRIPTIONS, type PlanName } from "@/lib/pricing";
import type { Subscription } from "@/lib/types";

interface BillingPageProps {
  subscription: Subscription | null;
  onUpgrade: (plan: PlanName, cycle: "monthly" | "annual") => Promise<void>;
  isLoading?: boolean;
}

export function BillingPage({ subscription, onUpgrade, isLoading }: BillingPageProps) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const currentPlan = subscription?.plan as PlanName | null;

  const handleUpgrade = async (plan: PlanName) => {
    if (plan === "enterprise") {
      alert("Enterprise plans require custom pricing. Please contact sales.");
      return;
    }
    await onUpgrade(plan, cycle);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-850 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">AI App Builder</h1>
            </div>
            <Button variant="ghost" size="sm">Back to Projects</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-400">Choose the plan that fits your needs</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm ${cycle === "monthly" ? "text-white font-medium" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setCycle(cycle === "monthly" ? "annual" : "monthly")}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              cycle === "annual" ? "bg-cyan-600" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                cycle === "annual" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm ${cycle === "annual" ? "text-white font-medium" : "text-slate-400"}`}>
            Annual
            <span className="ml-1 text-xs text-green-400 font-medium">-20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(Object.keys(PLAN_PRICES) as PlanName[]).map((plan) => (
            <PricingCard
              key={plan}
              plan={plan}
              price={PLAN_PRICES[plan]}
              cycle={cycle}
              features={PLAN_FEATURES[plan]}
              description={PLAN_DESCRIPTIONS[plan]}
              isCurrent={currentPlan === plan}
              onSelect={handleUpgrade}
            />
          ))}
        </div>

        {subscription && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Current Subscription</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Plan</p>
                <p className="text-lg font-medium text-white capitalize">{subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Status</p>
                <p className={`text-lg font-medium ${
                  subscription.status === "active" ? "text-green-400" : "text-amber-400"
                }`}>
                  {subscription.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Next Billing</p>
                <p className="text-lg font-medium text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="sm">
                Manage Subscription
              </Button>
              <Button variant="danger" size="sm">
                Cancel Plan
              </Button>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">Need Help Choosing?</h3>
          <p className="text-slate-400 mb-6">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <Button size="lg">Contact Sales</Button>
        </div>
      </main>
    </div>
  );
}
