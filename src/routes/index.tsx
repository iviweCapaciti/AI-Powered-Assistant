import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NeptuneLogo } from "@/components/neptune-logo";
import { Mail, FileText, ListChecks, Search, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neptune — AI Workplace Productivity Hub" },
      { name: "description", content: "Neptune is your AI teammate for work. Draft emails, summarize meetings, plan your week, and research — all in one clean workspace." },
      { property: "og:title", content: "Neptune — AI Workplace Productivity Hub" },
      { property: "og:description", content: "Your AI teammate for work." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator" },
  { icon: FileText, title: "Meeting Notes Summarizer" },
  { icon: ListChecks, title: "AI Task Planner" },
  { icon: Search, title: "AI Research Assistant" },
  { icon: MessageSquare, title: "AI Chatbot" },
];

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <NeptuneLogo size={28} />
            <span className="font-semibold tracking-tight">Neptune</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="gradient-brand text-white">Get started</Button></Link>
          </div>
        </div>
      </header>
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/50 px-3 py-1 text-xs mb-6">
            <Sparkles className="h-3 w-3 text-primary" /> AI Workplace Productivity
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Your AI teammate <br className="hidden md:block" />for work that matters
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Draft emails, summarize meetings, plan your week, and research topics — all in one clean, secure workspace for you and your team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="gradient-brand text-white">
                Start free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-4 text-center">
                <f.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">{f.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        AI outputs may be inaccurate. Review before sharing. Neptune uses responsible AI practices — no training on your data.
      </footer>
    </div>
  );
}
