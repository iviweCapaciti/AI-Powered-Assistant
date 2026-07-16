import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentWorkspace } from "@/lib/use-workspace";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workspace/")({
  component: WorkspaceIndex,
});

function WorkspaceIndex() {
  const { workspace, workspaces } = useCurrentWorkspace();
  const navigate = useNavigate();
  useEffect(() => {
    if (workspace) navigate({ to: "/workspace/$id", params: { id: workspace.id }, replace: true });
  }, [workspace, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm gap-2">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace{workspaces.length === 0 ? "…" : ""}
    </div>
  );
}
