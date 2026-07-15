import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { MessageSquare } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/tools/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Neptune" }] }),
  component: () => (
    <AppShell title="AI Chatbot">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="chat"
          emptyState={
            <ToolHero
              icon={MessageSquare}
              title="Neptune Chatbot"
              subtitle="A general-purpose AI teammate. Ask anything, brainstorm, iterate."
              examples={[
                "Explain quantum computing like I'm 12.",
                "Help me name a new product line.",
                "Rewrite this paragraph to be more concise.",
              ]}
            />
          }
        />
      </div>
    </AppShell>
  ),
});
