import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { ListChecks } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/tools/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Neptune" }] }),
  component: () => (
    <AppShell title="AI Task Planner">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="planner"
          placeholder="What do you need to accomplish this week?"
          emptyState={
            <ToolHero
              icon={ListChecks}
              title="AI Task Planner"
              subtitle="Turn goals into a prioritized Mon–Fri plan with estimates."
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
  ),
});
