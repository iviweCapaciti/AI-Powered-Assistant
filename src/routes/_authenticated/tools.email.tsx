import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { Mail } from "lucide-react";
import { ToolHero } from "@/components/tool-hero";

export const Route = createFileRoute("/_authenticated/tools/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Neptune" }] }),
  component: EmailTool,
});

function EmailTool() {
  const [prompt, setPrompt] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();
  const trigger = (p: string) => {
    setPrompt(p);
    setKey(`${Date.now()}`);
  };

  return (
    <AppShell title="Smart Email Generator">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="email"
          placeholder="Describe the email you want to send…"
          hint="Include recipient, purpose, tone, and any details."
          initialPrompt={prompt}
          autoSubmitKey={key}
          emptyState={
            <ToolHero
              icon={Mail}
              title="Smart Email Generator"
              subtitle="Draft polished, on-brand emails in seconds. Follow-ups, outreach, replies — all editable."
              onExample={trigger}
              examples={[
                "Write a warm re-engagement email to a lapsed customer.",
                "Draft a concise status update to my team for this week.",
                "Reply politely declining a meeting invite for next Tuesday.",
              ]}
            />
          }
        />
      </div>
    </AppShell>
  );
}
