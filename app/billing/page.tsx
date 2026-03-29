"use client";

import { useEffect, useState } from "react";
import { BillingPage } from "@/components/billing/BillingPage";
import { getSubscription } from "@/lib/billing";
import type { Subscription } from "@/lib/types";

export default function BillingRoute() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const data = await getSubscription("user-id");
        setSubscription(data);
      } catch (err) {
        console.error("Failed to load subscription:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscription();
  }, []);

  const handleUpgrade = async (plan: string, cycle: "monthly" | "annual") => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, cycle }),
    });

    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    } else {
      const error = await response.json();
      alert(error.error || "Failed to create checkout session");
    }
  };

  return <BillingPage subscription={subscription} onUpgrade={handleUpgrade} isLoading={isLoading} />;
}
