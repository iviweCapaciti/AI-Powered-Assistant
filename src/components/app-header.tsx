import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap, LogOut, User, CreditCard, Settings, ChevronDown, Plus, Check } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCredits } from "@/lib/credits-store";
import { useCurrentWorkspace } from "@/lib/use-workspace";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AppHeader({ title }: { title?: string }) {
  const credits = useCredits();
  const navigate = useNavigate();
  const { workspace, workspaces, setCurrent } = useCurrentWorkspace();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("You");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setEmail(u.email ?? "");
        setName((u.user_metadata as any)?.display_name ?? u.email?.split("@")[0] ?? "You");
      }
    });
  }, []);

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "N";

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/70 backdrop-blur-xl px-4">
      <SidebarTrigger />
      {title && <h1 className="text-sm font-semibold tracking-tight hidden md:block">{title}</h1>}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="ml-2 gap-1.5 h-8 px-2">
            <span className="text-sm font-medium truncate max-w-[140px]">{workspace?.name ?? "Workspace"}</span>
            {workspace && <Badge variant="secondary" className="text-[10px] capitalize font-normal">{workspace.plan}</Badge>}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Your workspaces</DropdownMenuLabel>
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => { setCurrent(w.id); navigate({ to: "/workspace/$id", params: { id: w.id } }); }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{w.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{w.plan} · {w.memberCount} member{w.memberCount === 1 ? "" : "s"}</p>
              </div>
              {workspace?.id === w.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/workspace/$id", params: { id: workspace?.id ?? "" } })}>
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary" className="gap-1 font-normal">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-xs">{credits} credits</span>
        </Badge>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="gradient-brand text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{name}</span>
                <span className="text-xs text-muted-foreground font-normal">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/billing"><CreditCard className="mr-2 h-4 w-4" />Billing</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
