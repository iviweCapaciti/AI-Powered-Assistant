import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Neptune" }] }),
  component: Settings,
});

const integrations = [
  { name: "Gmail", connected: true },
  { name: "Slack", connected: true },
  { name: "Google Calendar", connected: false },
  { name: "Notion", connected: false },
];

function Settings() {
  const [conns, setConns] = useState(integrations);
  return (
    <AppShell title="Settings">
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <form
              className="glass-card p-6 space-y-4"
              onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved"); }}
            >
              <div className="space-y-2"><Label>Name</Label><Input defaultValue="Iviwe Bakaqana" /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue="iviwe@neptune.app" type="email" /></div>
              <div className="space-y-2"><Label>Avatar</Label><Input type="file" accept="image/*" /></div>
              <Button type="submit" className="gradient-brand text-white">Save changes</Button>
            </form>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <div className="glass-card divide-y">
              {conns.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.connected ? "Connected" : "Not connected"}</p>
                  </div>
                  <Switch
                    checked={c.connected}
                    onCheckedChange={(v) => {
                      setConns((prev) => prev.map((p, j) => j === i ? { ...p, connected: v } : p));
                      toast.success(`${c.name} ${v ? "connected" : "disconnected"}`);
                    }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <div className="glass-card p-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                {["SOC 2 Compliant", "End-to-end Encrypted", "Data Export", "GDPR Ready"].map((b) => (
                  <span key={b} className="rounded-full border px-3 py-1 text-xs bg-background/50">{b}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Neptune uses responsible AI practices. Your prompts and data are never used for training.
                You can export or delete your workspace data at any time.
              </p>
              <Button variant="outline" onClick={() => toast.success("Export requested — check your email")}>
                Request data export
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
