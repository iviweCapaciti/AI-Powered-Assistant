import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { creditsStore, useCredits } from "@/lib/credits-store";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — Neptune" }] }),
  component: Billing,
});

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "forever",
    features: ["100 AI credits / mo", "All 5 AI tools", "1 workspace", "Community support"],
    cta: "Current plan",
    credits: 100,
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    per: "per month",
    features: ["Unlimited AI credits", "Priority responses", "Shared templates", "Email support"],
    cta: "Upgrade to Pro",
    credits: 9999,
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    per: "per 5 seats / mo",
    features: ["Everything in Pro", "Shared chats", "Role management", "SSO + audit logs"],
    cta: "Start team trial",
    credits: 9999,
    highlighted: false,
  },
];

function Billing() {
  const credits = useCredits();
  const handleSelect = (p: (typeof plans)[number]) => {
    if (p.id === "free") {
      toast.info("You're on the Free plan.");
      return;
    }
    creditsStore.set(p.credits);
    toast.success(`${p.name} plan activated — credits topped up!`);
  };

  return (
    <AppShell title="Billing">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Pick your plan</h1>
          <p className="text-muted-foreground mt-2">
            Unlock unlimited AI for you and your team. You have <b>{credits}</b> credits remaining.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={cn(
                "glass-card p-6 flex flex-col",
                p.highlighted && "ring-2 ring-primary shadow-xl",
              )}
            >
              {p.highlighted && (
                <span className="self-start rounded-full gradient-brand text-white text-xs px-2.5 py-0.5 mb-2">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSelect(p)}
                className={cn("mt-6 w-full", p.highlighted && "gradient-brand text-white hover:opacity-90")}
                variant={p.highlighted ? "default" : "outline"}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
