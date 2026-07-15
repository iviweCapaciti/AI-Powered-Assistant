import { type LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolHero({
  icon: Icon,
  title,
  subtitle,
  examples,
  onExample,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  examples: string[];
  onExample?: (text: string) => void;
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
          <button
            key={e}
            type="button"
            onClick={() => onExample?.(e)}
            className={cn(
              "glass-card px-3 py-2.5 text-sm flex items-start gap-2 text-left w-full transition-all",
              "hover:border-primary hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>{e}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
