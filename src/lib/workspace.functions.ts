import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const planEnum = z.enum(["free", "pro", "team"]);
const roleEnum = z.enum(["owner", "admin", "member"]);
const categoryEnum = z.enum(["email", "meeting", "research", "other"]);

// LIST workspaces the user belongs to, with member count
export const listMyWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: memberships, error } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, plan, created_by, created_at)")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const ids = (memberships ?? []).map((m: any) => m.workspace_id);
    let counts: Record<string, number> = {};
    if (ids.length) {
      const { data: allMembers } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .in("workspace_id", ids);
      counts = (allMembers ?? []).reduce((acc: any, r: any) => {
        acc[r.workspace_id] = (acc[r.workspace_id] ?? 0) + 1;
        return acc;
      }, {});
    }
    return (memberships ?? []).map((m: any) => ({
      id: m.workspaces.id,
      name: m.workspaces.name,
      plan: m.workspaces.plan,
      role: m.role,
      memberCount: counts[m.workspace_id] ?? 1,
    }));
  });

export const createWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: z.string().min(2).max(60), plan: planEnum }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ws, error } = await supabase
      .from("workspaces")
      .insert({ name: data.name, plan: data.plan, created_by: userId })
      .select("id, name, plan")
      .single();
    if (error) throw new Error(error.message);
    return ws;
  });

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ws, error } = await supabase
      .from("workspaces")
      .select("id, name, plan, created_by, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ws) throw new Error("Workspace not found");

    const [{ data: members }, { data: me }] = await Promise.all([
      supabase
        .from("workspace_members")
        .select("user_id, role, created_at, profiles(display_name, email, avatar_url)")
        .eq("workspace_id", data.id),
      supabase.from("workspace_members").select("role").eq("workspace_id", data.id).eq("user_id", userId).maybeSingle(),
    ]);
    return {
      workspace: ws,
      members: (members ?? []).map((m: any) => ({
        userId: m.user_id,
        role: m.role,
        name: m.profiles?.display_name ?? m.profiles?.email ?? "Member",
        email: m.profiles?.email ?? "",
      })),
      myRole: (me?.role ?? "member") as "owner" | "admin" | "member",
    };
  });

export const inviteToWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ workspaceId: z.string().uuid(), email: z.string().email(), role: roleEnum.default("member") }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: data.workspaceId,
      email: data.email.toLowerCase(),
      role: data.role,
      invited_by: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// TEMPLATES
export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("prompt_templates")
      .select("id, name, description, category, content, created_by, created_at, profiles:created_by(display_name)")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      content: r.content,
      createdBy: r.profiles?.display_name ?? "Member",
    }));
  });

export const createTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      workspaceId: z.string().uuid(),
      name: z.string().min(2).max(80),
      description: z.string().max(200).optional(),
      category: categoryEnum,
      content: z.string().min(5).max(4000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("prompt_templates").insert({
      workspace_id: data.workspaceId,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      content: data.content,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("prompt_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// SHARED CHATS
export const listSharedChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("shared_chats")
      .select("id, title, started_by, created_at, updated_at, profiles:started_by(display_name)")
      .eq("workspace_id", data.workspaceId)
      .eq("is_shared", true)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      startedBy: r.profiles?.display_name ?? "Member",
      updatedAt: r.updated_at,
    }));
  });

export const getSharedChat = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: chat, error: e1 }, { data: msgs, error: e2 }] = await Promise.all([
      context.supabase.from("shared_chats").select("id, title, workspace_id, started_by").eq("id", data.id).maybeSingle(),
      context.supabase.from("shared_chat_messages").select("id, role, content, created_at").eq("chat_id", data.id).order("created_at"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return { chat, messages: msgs ?? [] };
  });

export const createSharedChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      workspaceId: z.string().uuid(),
      title: z.string().min(1).max(120),
      messages: z.array(z.object({ role: z.string(), content: z.string() })),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: chat, error } = await context.supabase
      .from("shared_chats")
      .insert({ workspace_id: data.workspaceId, title: data.title, started_by: context.userId, is_shared: true })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (data.messages.length) {
      const { error: mErr } = await context.supabase.from("shared_chat_messages").insert(
        data.messages.map((m) => ({ chat_id: chat.id, role: m.role, content: m.content, created_by: context.userId })),
      );
      if (mErr) throw new Error(mErr.message);
    }
    return { id: chat.id };
  });

export const appendSharedChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ chatId: z.string().uuid(), role: z.string(), content: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("shared_chat_messages").insert({
      chat_id: data.chatId,
      role: data.role,
      content: data.content,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await context.supabase.from("shared_chats").update({ updated_at: new Date().toISOString() }).eq("id", data.chatId);
    return { ok: true };
  });

// ACTIVITY
export const logActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ tool: z.string(), title: z.string().max(200), workspaceId: z.string().uuid().nullable().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("activity_log").insert({
      user_id: context.userId,
      tool: data.tool,
      title: data.title,
      workspace_id: data.workspaceId ?? null,
    });
    return { ok: true };
  });

export const listRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("activity_log")
      .select("id, tool, title, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
