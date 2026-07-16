
-- ENUMS
CREATE TYPE public.workspace_plan AS ENUM ('free','pro','team');
CREATE TYPE public.workspace_role AS ENUM ('owner','admin','member');
CREATE TYPE public.invite_status AS ENUM ('pending','accepted','revoked');
CREATE TYPE public.template_category AS ENUM ('email','meeting','research','other');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read all authed" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- WORKSPACES
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan public.workspace_plan NOT NULL DEFAULT 'free',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- MEMBERS
CREATE TABLE public.workspace_members (
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helpers
CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.workspace_role_of(_ws uuid, _user uuid)
RETURNS public.workspace_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user;
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_ws uuid, _user uuid, _roles public.workspace_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _ws AND user_id = _user AND role = ANY(_roles));
$$;

-- Workspaces policies
CREATE POLICY "ws select members" ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));
CREATE POLICY "ws insert self" ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "ws update admins" ON public.workspaces FOR UPDATE TO authenticated
  USING (public.has_workspace_role(id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "ws delete owner" ON public.workspaces FOR DELETE TO authenticated
  USING (public.has_workspace_role(id, auth.uid(), ARRAY['owner']::public.workspace_role[]));

-- Members policies
CREATE POLICY "wm select members" ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "wm insert self as owner (bootstrap)" ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "wm admin manage" ON public.workspace_members FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- Auto-add creator as owner
CREATE OR REPLACE FUNCTION public.add_creator_as_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER ws_add_owner AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_creator_as_owner();

-- INVITES
CREATE TABLE public.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  status public.invite_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_invites TO authenticated;
GRANT ALL ON public.workspace_invites TO service_role;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites admin manage" ON public.workspace_invites FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- PROMPT TEMPLATES
CREATE TABLE public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category public.template_category NOT NULL DEFAULT 'other',
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_templates TO authenticated;
GRANT ALL ON public.prompt_templates TO service_role;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tpl select members" ON public.prompt_templates FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "tpl admin write" ON public.prompt_templates FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "tpl admin update" ON public.prompt_templates FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "tpl admin delete" ON public.prompt_templates FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- SHARED CHATS
CREATE TABLE public.shared_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  started_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_shared boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_chats TO authenticated;
GRANT ALL ON public.shared_chats TO service_role;
ALTER TABLE public.shared_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat select members if shared" ON public.shared_chats FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()) AND (is_shared OR started_by = auth.uid()));
CREATE POLICY "chat insert member" ON public.shared_chats FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()) AND started_by = auth.uid());
CREATE POLICY "chat update starter or admin" ON public.shared_chats FOR UPDATE TO authenticated
  USING (started_by = auth.uid() OR public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "chat delete starter or admin" ON public.shared_chats FOR DELETE TO authenticated
  USING (started_by = auth.uid() OR public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- SHARED CHAT MESSAGES
CREATE TABLE public.shared_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.shared_chats(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.shared_chat_messages TO authenticated;
GRANT ALL ON public.shared_chat_messages TO service_role;
ALTER TABLE public.shared_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg select via chat" ON public.shared_chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shared_chats c
                 WHERE c.id = chat_id
                   AND public.is_workspace_member(c.workspace_id, auth.uid())
                   AND (c.is_shared OR c.started_by = auth.uid())));
CREATE POLICY "msg insert via chat" ON public.shared_chat_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shared_chats c
                      WHERE c.id = chat_id
                        AND public.is_workspace_member(c.workspace_id, auth.uid())));

-- ACTIVITY LOG
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  tool text NOT NULL,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity own read" ON public.activity_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "activity own insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "activity own delete" ON public.activity_log FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE INDEX activity_user_created_idx ON public.activity_log (user_id, created_at DESC);

-- Auto profile + default workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ws_id uuid;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.workspaces (name, plan, created_by)
  VALUES ('Personal Workspace', 'free', NEW.id)
  RETURNING id INTO ws_id;
  -- trigger add_creator_as_owner fires automatically
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
