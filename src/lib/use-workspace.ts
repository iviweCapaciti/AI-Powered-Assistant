import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyWorkspaces } from "@/lib/workspace.functions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "neptune.currentWorkspaceId";

export type WorkspaceSummary = {
  id: string;
  name: string;
  plan: "free" | "pro" | "team";
  role: "owner" | "admin" | "member";
  memberCount: number;
};

export function useMyWorkspaces() {
  const fn = useServerFn(listMyWorkspaces);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setReady(!!data.user));
  }, []);
  return useQuery({
    queryKey: ["my-workspaces"],
    queryFn: () => fn() as Promise<WorkspaceSummary[]>,
    enabled: ready,
    staleTime: 30_000,
  });
}

export function useCurrentWorkspaceId(): [string | null, (id: string) => void] {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setId(localStorage.getItem(STORAGE_KEY));
  }, []);
  const set = (v: string) => {
    localStorage.setItem(STORAGE_KEY, v);
    setId(v);
    window.dispatchEvent(new Event("neptune:ws-change"));
  };
  useEffect(() => {
    const handler = () => setId(localStorage.getItem(STORAGE_KEY));
    window.addEventListener("neptune:ws-change", handler);
    return () => window.removeEventListener("neptune:ws-change", handler);
  }, []);
  return [id, set];
}

export function useCurrentWorkspace() {
  const { data: workspaces } = useMyWorkspaces();
  const [current, setCurrent] = useCurrentWorkspaceId();
  useEffect(() => {
    if (!current && workspaces && workspaces.length > 0) {
      setCurrent(workspaces[0].id);
    }
  }, [current, workspaces, setCurrent]);
  const ws = workspaces?.find((w) => w.id === current) ?? workspaces?.[0] ?? null;
  return { workspace: ws, setCurrent, workspaces: workspaces ?? [] };
}
