import { type ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <AppHeader title={title} />
          <main className="flex-1 min-w-0">{children}</main>
          <footer className="border-t px-6 py-3 text-[11px] text-muted-foreground">
            AI outputs may be inaccurate. Review before sharing. Neptune uses responsible AI practices — no training on your data. SOC2 compliant · End-to-end encrypted.
          </footer>
        </SidebarInset>
      </div>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
