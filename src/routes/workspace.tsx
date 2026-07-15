import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Team Workspace — Neptune" }] }),
  component: Workspace,
});

const members = [
  { name: "Iviwe Bakaqana", email: "iviwe@neptune.app", role: "Owner" as const },
  { name: "Sam Cole", email: "sam@neptune.app", role: "Admin" as const },
  { name: "Priya Naidoo", email: "priya@neptune.app", role: "Member" as const },
];

const roleColor: Record<string, string> = {
  Owner: "gradient-brand text-white",
  Admin: "bg-teal/20 text-teal-foreground",
  Member: "bg-secondary",
};

function Workspace() {
  const [email, setEmail] = useState("");
  return (
    <AppShell title="Team Workspace">
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Chulumanco Luxe Workspace</h1>
            <p className="text-sm text-muted-foreground">3 members · Team plan</p>
          </div>
          <Button className="gradient-brand text-white">
            <Plus className="h-4 w-4 mr-1" /> New Workspace
          </Button>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-medium mb-3">Invite team members</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              toast.success(`Invitation sent to ${email}`);
              setEmail("");
            }}
          >
            <Input placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit">Send invite</Button>
          </form>
        </div>

        <div className="glass-card divide-y">
          {members.map((m) => (
            <div key={m.email} className="flex items-center gap-3 p-4">
              <Avatar className="h-9 w-9"><AvatarFallback>{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              <Badge className={roleColor[m.role]}>{m.role}</Badge>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 text-center">
          <Users className="h-8 w-8 mx-auto text-primary mb-2" />
          <h3 className="font-medium">Shared chats & prompt templates</h3>
          <p className="text-sm text-muted-foreground mt-1">Save prompts your team can reuse and continue AI conversations together. Coming soon.</p>
        </div>
      </div>
    </AppShell>
  );
}
