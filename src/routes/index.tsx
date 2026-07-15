import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiPanel } from "@/components/ai-panel";
import { Mail, FileText, BarChart3, Search, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neptune Copilot — AI Workplace Productivity Hub" },
      { name: "description", content: "Your AI teammate for work. Draft emails, summarize meetings, plan your week, and research topics — all in one place." },
      { property: "og:title", content: "Neptune Copilot" },
      { property: "og:description", content: "Your AI teammate for work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CopilotPage,
});

const CARDS = [
  {
    icon: Mail,
    label: "Draft Email",
    emoji: "📧",
    prompt:
      "Draft a professional follow-up email after a client meeting. The client is interested in CHULUMANCO LUXE luxury perfumes. Keep the tone premium and friendly. Include a call to action.",
  },
  {
    icon: FileText,
    label: "Meeting Notes",
    emoji: "📝",
    prompt:
      "Summarize these meeting notes into action items with owners and deadlines. Format it as a clean checklist.\n\n[Paste your meeting transcript below]",
  },
  {
    icon: BarChart3,
    label: "Plan Week",
    emoji: "📊",
    prompt:
      "Help me plan my week as the owner of CHULUMANCO LUXE. I need to focus on marketing, product listings, and customer service. Create a prioritized task list for Mon-Fri.",
  },
  {
    icon: Search,
    label: "Research Topic",
    emoji: "🔍",
    prompt:
      "Research the latest trends in luxury perfumes and smartwatches for 2026. Give me 5 key insights I can use for marketing.",
  },
];

const INTEGRATIONS = ["Gmail", "Slack", "Google Calendar", "Notion"];

function CopilotPage() {
  const [prompt, setPrompt] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();

  const trigger = (p: string) => {
    setPrompt(p);
    setKey(`${Date.now()}-${p.slice(0, 8)}`);
  };

  const empty = (
    <div className="pt-8 pb-4 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        <span className="gradient-text">Neptune Copilot</span>
      </h1>
      <p className="mt-2 text-muted-foreground">Your AI teammate for work. Ask me anything.</p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span>You saved <b>2.5 hours</b> this week with AI</span>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {CARDS.map((c) => (
          <button
            key={c.label}
            onClick={() => trigger(c.prompt)}
            className={cn(
              "group relative glass-card p-4 text-left transition-all",
              "hover:-translate-y-0.5 hover:border-primary hover:shadow-lg",
            )}
          >
            <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{c.emoji}</span>
              <span className="font-medium text-sm">{c.label}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{c.prompt}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Connects with</span>
        {INTEGRATIONS.map((i) => (
          <span key={i} className="rounded-full border px-2.5 py-1 bg-background/50">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

  return (
    <AppShell title="Copilot">
      <div className="h-[calc(100vh-3.5rem-2.75rem)]">
        <AiPanel
          mode="chat"
          emptyState={empty}
          initialPrompt={prompt}
          autoSubmitKey={key}
        />
      </div>
    </AppShell>
  );
}
