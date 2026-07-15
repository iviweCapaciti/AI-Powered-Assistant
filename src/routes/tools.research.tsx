import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { Search } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/tools/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Neptune" }] }),
  component: () => (
    <AppShell title="AI Research Assistant">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="research"
          placeholder="What topic should I research?"
          emptyState={
            <ToolHero
              icon={Search}
              title="AI Research Assistant"
              subtitle="Get structured insights, trends, and briefings on any topic."
              examples={[
                "Summarize the state of luxury e-commerce in 2026.",
                "Compare top CRM platforms for a 20-person sales team.",
                "Give me 5 marketing angles for a new perfume launch.",
              ]}
            />
          }
        />
      </div>
    </AppShell>
  ),
});
