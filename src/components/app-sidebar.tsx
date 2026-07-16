import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  Users,
  Mail,
  ListChecks,
} from "lucide-react";
import { NeptuneLogo } from "@/components/neptune-logo";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRecentActivity } from "@/lib/workspace.functions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const workspace = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
];

const tools = [
  { title: "Email Generator", url: "/tools/email", icon: Mail },
  { title: "Meeting Notes", url: "/tools/meeting", icon: FileText },
  { title: "Task Planner", url: "/tools/planner", icon: ListChecks },
  { title: "Research", url: "/tools/research", icon: Search },
  { title: "Chatbot", url: "/tools/chat", icon: MessageSquare },
];

const team = [
  { title: "Workspace", url: "/workspace", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  const renderGroup = (label: string, items: typeof workspace) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
                className="data-[active=true]:bg-[#0EA5E9] data-[active=true]:text-white data-[active=true]:hover:bg-[#0EA5E9] data-[active=true]:hover:text-white"
              >
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <NeptuneLogo size={30} />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-tight">Neptune</span>
              <span className="text-[10px] text-muted-foreground">AI Workplace Hub</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Workspace", workspace)}
        {renderGroup("AI Tools", tools)}
        {renderGroup("Team", team)}

        {!collapsed && <RecentActivity />}
      </SidebarContent>



      <SidebarFooter>
        {!collapsed ? (
          <div className="glass-card p-3 text-xs">
            <p className="font-medium mb-1">Unlock Pro</p>
            <p className="text-muted-foreground mb-2">Unlimited AI for your team.</p>
            <Link
              to="/billing"
              className="block w-full text-center rounded-md gradient-brand text-white py-1.5 text-xs font-medium hover:opacity-90 transition"
            >
              Upgrade
            </Link>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
