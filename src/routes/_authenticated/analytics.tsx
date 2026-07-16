import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Neptune" }] }),
  component: Analytics,
});

const data = [
  { day: "Mon", v: 42 },
  { day: "Tue", v: 68 },
  { day: "Wed", v: 55 },
  { day: "Thu", v: 91 },
  { day: "Fri", v: 74 },
  { day: "Sat", v: 22 },
  { day: "Sun", v: 15 },
];

function Analytics() {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <AppShell title="Analytics">
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">AI credit usage over the last 7 days.</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-end justify-between h-56 gap-3">
            {data.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full gradient-brand rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(d.v / max) * 100}%` }}
                    title={`${d.v} credits`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { l: "Total credits", v: "367" },
            { l: "Avg / day", v: "52" },
            { l: "Peak day", v: "Thursday" },
          ].map((s) => (
            <div key={s.l} className="glass-card p-4">
              <p className="text-2xl font-semibold">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
