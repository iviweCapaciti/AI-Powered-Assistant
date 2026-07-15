import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { FileText } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/tools/meeting")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Neptune" }] }),
  component: () => (
    <AppShell title="Meeting Notes Summarizer">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="meeting"
          placeholder="Paste your meeting transcript or notes…"
          hint="Paste your meeting transcript below — we'll extract action items, owners, and deadlines."
          emptyState={
            <ToolHero
              icon={FileText}
              title="Meeting Notes Summarizer"
              subtitle="Turn messy transcripts into crisp action-item checklists with owners and dates."
              examples={[
                "Summarize a 30-min product sync into decisions and next steps.",
                "Extract action items from a sales call transcript.",
                "Turn my raw notes into an email recap.",
              ]}
            />
          }
        />
      </div>
    </AppShell>
  ),
});
