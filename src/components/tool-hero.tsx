import { type LucideIcon, Sparkles } from "lucide-react";

export function ToolHero({
  icon: Icon,
  title,
  subtitle,
  examples,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  examples: string[];
}) {
  return (
    <div className="pt-8 pb-2 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="mt-2 text-muted-foreground max-w-lg mx-auto">{subtitle}</p>
      <div className="mt-6 grid gap-2 max-w-xl mx-auto text-left">
        {examples.map((e) => (
          <div
            key={e}
            className="glass-card px-3 py-2.5 text-sm flex items-start gap-2 hover:border-primary transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
