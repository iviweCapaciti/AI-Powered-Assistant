import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles, MessageSquare, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getWorkspace,
  inviteToWorkspace,
  listTemplates,
  createTemplate,
  deleteTemplate,
  listSharedChats,
  createWorkspace,
} from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/workspace/$id")({
  head: () => ({ meta: [{ title: "Workspace — Neptune" }] }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const getWs = useServerFn(getWorkspace);
  const invite = useServerFn(inviteToWorkspace);
  const listTpls = useServerFn(listTemplates);
  const createTpl = useServerFn(createTemplate);
  const delTpl = useServerFn(deleteTemplate);
  const listChats = useServerFn(listSharedChats);
  const createWs = useServerFn(createWorkspace);

  const wsQuery = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => getWs({ data: { id } }),
  });
  const tplQuery = useQuery({
    queryKey: ["templates", id],
    queryFn: () => listTpls({ data: { workspaceId: id } }),
  });
  const chatQuery = useQuery({
    queryKey: ["shared-chats", id],
    queryFn: () => listChats({ data: { workspaceId: id } }),
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newWsOpen, setNewWsOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsPlan, setWsPlan] = useState<"free" | "pro" | "team">("free");

  const [tplOpen, setTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState<"email" | "meeting" | "research" | "other">("email");
  const [tplContent, setTplContent] = useState("");

  const canAdmin = wsQuery.data?.myRole === "owner" || wsQuery.data?.myRole === "admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = z.string().email().safeParse(inviteEmail);
    if (!parse.success) return toast.error("Enter a valid email");
    setInviteLoading(true);
    try {
      await invite({ data: { workspaceId: id, email: inviteEmail, role: "member" } });
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleNewWorkspace = async () => {
    if (wsName.trim().length < 2) return toast.error("Name too short");
    try {
      const ws = await createWs({ data: { name: wsName.trim(), plan: wsPlan } });
      toast.success("Workspace created successfully");
      qc.invalidateQueries({ queryKey: ["my-workspaces"] });
      localStorage.setItem("neptune.currentWorkspaceId", ws!.id);
      window.dispatchEvent(new Event("neptune:ws-change"));
      setNewWsOpen(false);
      setWsName("");
      navigate({ to: "/workspace/$id", params: { id: ws!.id } });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create workspace");
    }
  };

  const handleCreateTemplate = async () => {
    if (tplName.trim().length < 2 || tplContent.trim().length < 5) return toast.error("Fill all fields");
    try {
      await createTpl({ data: { workspaceId: id, name: tplName.trim(), category: tplCategory, content: tplContent.trim() } });
      toast.success("Template created");
      qc.invalidateQueries({ queryKey: ["templates", id] });
      setTplOpen(false);
      setTplName("");
      setTplContent("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    }
  };

  const useTemplate = (content: string) => {
    sessionStorage.setItem("neptune.prefillPrompt", content);
    navigate({ to: "/tools/chat" });
  };

  const roleColor: Record<string, string> = {
    owner: "gradient-brand text-white",
    admin: "bg-teal/20",
    member: "bg-secondary",
  };

  return (
    <AppShell title="Team Workspace">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {wsQuery.data?.workspace?.name ?? "Workspace"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {wsQuery.data ? `${wsQuery.data.members.length} member${wsQuery.data.members.length === 1 ? "" : "s"} · ${wsQuery.data.workspace.plan} plan` : "Loading…"}
            </p>
          </div>
          <Dialog open={newWsOpen} onOpenChange={setNewWsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-brand text-white"><Plus className="h-4 w-4 mr-1" /> New Workspace</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Workspace</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Workspace Name</Label>
                  <Input value={wsName} onChange={(e) => setWsName(e.target.value)} placeholder="Acme Marketing" autoFocus />
                </div>
                <div className="space-y-1.5">
                  <Label>Plan</Label>
                  <Select value={wsPlan} onValueChange={(v: any) => setWsPlan(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewWsOpen(false)}>Cancel</Button>
                <Button onClick={handleNewWorkspace} className="gradient-brand text-white">Create Workspace</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-medium mb-3">Invite team members</h2>
          <form className="flex gap-2" onSubmit={handleInvite}>
            <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Button type="submit" disabled={inviteLoading}>
              {inviteLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Send invite
            </Button>
          </form>
        </div>

        <div className="glass-card divide-y">
          {wsQuery.data?.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 p-4">
              <Avatar className="h-9 w-9"><AvatarFallback>{m.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              <Badge className={roleColor[m.role]}>{m.role}</Badge>
            </div>
          ))}
        </div>

        <Tabs defaultValue="templates">
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="chats"><MessageSquare className="h-4 w-4 mr-1.5" />Shared Chats</TabsTrigger>
              <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1.5" />Prompt Templates</TabsTrigger>
            </TabsList>
            <Dialog open={tplOpen} onOpenChange={setTplOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!canAdmin} title={canAdmin ? "" : "Admins only"}>
                  <Plus className="h-4 w-4 mr-1" />New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Prompt Template</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Template Name</Label>
                    <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Follow-up email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={tplCategory} onValueChange={(v: any) => setTplCategory(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prompt Content</Label>
                    <Textarea value={tplContent} onChange={(e) => setTplContent(e.target.value)} rows={6} placeholder="Draft a polite follow-up email…" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTplOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateTemplate} className="gradient-brand text-white">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="templates">
            {tplQuery.isLoading ? (
              <div className="text-sm text-muted-foreground p-6 text-center">Loading templates…</div>
            ) : (tplQuery.data ?? []).length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">No templates yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create a reusable prompt so your team can reuse it.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {tplQuery.data!.map((t) => (
                  <div key={t.id} className="glass-card p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{t.name}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{t.category} · {t.createdBy}</p>
                      </div>
                      {canAdmin && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={async () => {
                          await delTpl({ data: { id: t.id } });
                          qc.invalidateQueries({ queryKey: ["templates", id] });
                          toast.success("Deleted");
                        }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 flex-1">{t.content}</p>
                    <Button size="sm" className="mt-3 gradient-brand text-white" onClick={() => useTemplate(t.content)}>Use Template</Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats">
            {chatQuery.isLoading ? (
              <div className="text-sm text-muted-foreground p-6 text-center">Loading…</div>
            ) : (chatQuery.data ?? []).length === 0 ? (
              <div className="glass-card p-8 text-center">
                <MessageSquare className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">No shared chats yet</p>
                <p className="text-xs text-muted-foreground mt-1">In the Chatbot, toggle "Share with workspace" to publish a chat here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatQuery.data!.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toast.info("Shared chat viewer coming soon")}
                    className="w-full glass-card p-4 text-left hover:border-primary/40 transition"
                  >
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Started by {c.startedBy} · {new Date(c.updatedAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
