import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { ListChecks } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/_authenticated/tools/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Neptune" }] }),
  component: PlannerTool,
});

function PlannerTool() {
  const [prompt, setPrompt] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();
  const trigger = (p: string) => {
    setPrompt(p);
    setKey(`${Date.now()}`);
  };

  return (
    <AppShell title="AI Task Planner">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="planner"
          placeholder="What do you need to accomplish this week?"
          initialPrompt={prompt}
          autoSubmitKey={key}
          emptyState={
            <ToolHero
              icon={ListChecks}
              title="AI Task Planner"
              subtitle="Turn goals into a prioritized Mon–Fri plan with estimates."
              onExample={trigger}
              examples={[
                "Plan a product launch across marketing, ops, and support.",
                "Balance deep work and meetings this week.",
                "Break down a Q4 roadmap into weekly milestones.",
              ]}
            />
          }
        />
      </div>
    </AppShell>
  );
}
