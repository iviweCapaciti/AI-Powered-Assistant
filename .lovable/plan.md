Big scope — here's the plan before I start burning credits.

## Phase 1 — Foundation
1. **Enable Lovable Cloud** (database + auth + email).
2. **Add email/password auth**: `/auth` page (sign in / sign up), managed `_authenticated` gate. Move all app routes (`/dashboard`, `/tools/*`, `/workspace*`, `/analytics`, `/billing`, `/settings`) under `_authenticated/`. Public `/` landing stays public with a "Sign in" CTA.
3. **Profiles table** (id → auth.users, display_name, email, avatar_url) with auto-create trigger.

## Phase 2 — Multi-workspace data model (one migration)
- `workspaces` (id, name, plan enum: free/pro/team, created_by, created_at)
- `workspace_members` (workspace_id, user_id, role enum: owner/admin/member, PK composite)
- `workspace_invites` (id, workspace_id, email, role, status, invited_by, token, created_at)
- `prompt_templates` (id, workspace_id, name, category enum, content, created_by, created_at)
- `shared_chats` (id, workspace_id, title, started_by, created_at, is_shared bool)
- `shared_chat_messages` (id, chat_id, role, content, created_by, created_at)
- `activity_log` (id, user_id, workspace_id, tool, title, created_at) — powers Recent Activity
- Enum `app_role` on membership; security-definer `has_workspace_role(_user, _ws, _role)` + `is_workspace_member(_user, _ws)` to avoid recursive RLS
- Grants + RLS for authenticated on every table

## Phase 3 — Current workspace state
- `useCurrentWorkspace` hook (localStorage-persisted current workspace id, falls back to first membership)
- On signup: create default "Personal" workspace + owner membership via trigger
- All tool pages log activity rows on generate

## Phase 4 — UI wiring
1. **Header workspace switcher**: dropdown showing all user's workspaces (name, plan, member count) + "+ New Workspace" at bottom → opens create modal.
2. **`/workspace` (index)** redirects to `/workspace/$id` for current workspace.
3. **`/workspace/$id`** page:
   - Editable name, plan badge, member count
   - Working **"+ New Workspace"** modal (Name + Plan dropdown, calls server fn, navigates to new id, toast)
   - **Invite form**: zod-validated email → creates `workspace_invites` row + sends email via Lovable Emails (scaffold transactional template `workspace-invite`) → toast
   - Members list (from DB)
   - **Tabs: Shared Chats | Prompt Templates**
     - **Prompt Templates**: card grid, "+ New Template" modal (Name / Category / Content), "Use Template" navigates to `/tools/chat?prefill=...`, delete/edit visible only to owner/admin
     - **Shared Chats**: list of `is_shared=true` chats, click → read-only view with messages, "Continue Chat" button appends via chat UI; add "Share with workspace" toggle in AiPanel chat mode
4. **Recent Activity sidebar**: pulls last 5 `activity_log` rows for current user; empty state text as specified.

## Phase 5 — Permissions
- RLS enforces server-side (owner/admin can delete/edit templates; members read-only)
- UI hides destructive buttons based on `useMyRole(workspaceId)` hook

## Phase 6 — Email invite
- Requires an email domain — I'll scaffold the transactional template and send helper. If no domain is configured, the invite still creates the DB row + toast, and I'll prompt you to set up your sender domain (one-click) so real emails start flowing.

## Technical notes
- Server fns in `src/lib/*.functions.ts` using `requireSupabaseAuth`
- Chat streaming route (`/api/chat`) stays as-is; sharing writes final assistant message to `shared_chat_messages` when toggle is on
- Existing `credits-store` stays in-memory for now (out of scope to persist)

## Out of scope (call out if you want them)
- Persisting credits per-user in DB
- Real-time updates on shared chats (would need Supabase Realtime)
- Accepting invites via emailed link (I'll create the accept route/flow only if you confirm)

Reply "go" and I'll execute. If you want to trim (e.g. skip auth, skip email sending, skip shared chats read-only viewer), say what to cut.