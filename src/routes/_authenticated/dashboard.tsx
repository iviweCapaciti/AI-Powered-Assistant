import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessageSquare, TrendingUp, Zap, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Neptune" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Hours saved this week", value: "2.5h", icon: Clock },
  { label: "AI credits used", value: "68 / 500", icon: Zap },
  { label: "Docs generated", value: "24", icon: FileText },
  { label: "Productivity trend", value: "+18%", icon: TrendingUp },
];

const tools = [
  { title: "Smart Email Generator", icon: Mail, url: "/tools/email", desc: "Draft polished emails in seconds." },
  { title: "Meeting Notes Summarizer", icon: FileText, url: "/tools/meeting", desc: "Turn transcripts into action items." },
  { title: "AI Task Planner", icon: ListChecks, url: "/tools/planner", desc: "Prioritized weekly plans." },
  { title: "AI Research Assistant", icon: Search, url: "/tools/research", desc: "Structured insights on any topic." },
  { title: "AI Chatbot", icon: MessageSquare, url: "/tools/chat", desc: "General-purpose AI teammate." },
];

function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome back, Iviwe</h1>
          <p className="text-muted-foreground mt-1">Here's what Neptune has done for you this week.</p>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-4">
              <s.icon className="h-4 w-4 text-primary mb-2" />
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">AI Tools</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <Link key={t.url} to={t.url} className="glass-card p-5 hover:-translate-y-0.5 hover:border-primary transition-all">
                <t.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-medium">{t.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Security & Compliance</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs">
            {["SOC 2 Compliant", "End-to-end Encrypted", "GDPR Ready", "No training on your data"].map((b) => (
              <span key={b} className="rounded-full border px-3 py-1 bg-background/50">{b}</span>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
