-- ==============================================================================
-- AI Content Creator Studio - Production Database Schema & RLS Policies
-- Target: PostgreSQL / Supabase
-- Description: Multi-tenant, role-isolated schema for 20 modules
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles & Users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  country TEXT,
  bio TEXT,
  creator_type TEXT,
  industry TEXT,
  preferred_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'agency_owner', 'superadmin')),
  credits_balance INT DEFAULT 50 CHECK (credits_balance >= 0),
  credits_total_used INT DEFAULT 0,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'creator', 'pro', 'agency')),
  plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'past_due', 'cancelled')),
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'system')),
  default_language TEXT DEFAULT 'English',
  default_tone TEXT DEFAULT 'engaging',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup and admin searches
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. Workspaces & Team Members (Multi-Tenancy)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  plan_tier TEXT DEFAULT 'free',
  credits_pool INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Brand Voices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brand_voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  personality TEXT,
  tone TEXT NOT NULL DEFAULT 'Professional yet accessible',
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  forbidden_words TEXT[] DEFAULT ARRAY[]::TEXT[],
  example_writing TEXT,
  preferred_language TEXT DEFAULT 'English',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Projects & Folders
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  brand_voice_id UUID REFERENCES public.brand_voices(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT,
  client_name TEXT,
  color_code TEXT DEFAULT '#06b6d4',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Saved Content & Versions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  brand_voice_id UUID REFERENCES public.brand_voices(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  generated_output TEXT NOT NULL,
  prompt_params JSONB DEFAULT '{}'::JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  word_count INT DEFAULT 0,
  character_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  output TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Content Calendar
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  campaign TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '10:00:00',
  timezone TEXT DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Idea', 'Draft', 'Ready', 'Published')),
  published_at TIMESTAMPTZ,
  notes TEXT,
  in_app_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Content Plans (7/14/30 Days)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_days INT NOT NULL CHECK (duration_days IN (7, 14, 30)),
  industry TEXT,
  goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  plan_matrix JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Templates & Favorites
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  category TEXT NOT NULL,
  sample_input JSONB NOT NULL DEFAULT '{}'::JSONB,
  sample_output TEXT NOT NULL,
  is_global BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.template_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- ------------------------------------------------------------------------------
-- 9. AI Generation Logs & Credit Transactions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  tool_id TEXT NOT NULL,
  model_used TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'groq',
  credits_deducted INT NOT NULL DEFAULT 1,
  execution_ms INT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL, -- positive for grants, negative for spend
  reason TEXT NOT NULL,
  reference_id TEXT,
  balance_after INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. Support Tickets & Messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. Admin Audit Logs & System Settings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: is superadmin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read & update their own; admins read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Brand voices: user or workspace member access
CREATE POLICY "Brand voices workspace access" ON public.brand_voices
  FOR ALL USING (
    auth.uid() = user_id OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members WHERE workspace_id = brand_voices.workspace_id AND user_id = auth.uid()
    ))
  );

-- Projects: user or workspace member access
CREATE POLICY "Projects access" ON public.projects
  FOR ALL USING (
    auth.uid() = user_id OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members WHERE workspace_id = projects.workspace_id AND user_id = auth.uid()
    ))
  );

-- Content items: user or workspace member access
CREATE POLICY "Content items access" ON public.content_items
  FOR ALL USING (
    auth.uid() = user_id OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members WHERE workspace_id = content_items.workspace_id AND user_id = auth.uid()
    ))
  );

-- Calendar items: user or workspace member access
CREATE POLICY "Calendar items access" ON public.content_calendar
  FOR ALL USING (
    auth.uid() = user_id OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members WHERE workspace_id = content_calendar.workspace_id AND user_id = auth.uid()
    ))
  );

-- Templates: everyone can view global templates; admins can manage
CREATE POLICY "Templates viewable by all" ON public.templates
  FOR SELECT USING (is_global = TRUE OR created_by = auth.uid());

CREATE POLICY "Templates editable by admin or creator" ON public.templates
  FOR ALL USING (public.is_admin() OR created_by = auth.uid());

-- Support tickets: user views own; admin views all
CREATE POLICY "Support tickets policy" ON public.support_tickets
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Support messages policy" ON public.support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR public.is_admin())
    )
  );

-- Admin logs: only superadmins can read
CREATE POLICY "Admin logs policy" ON public.admin_audit_logs
  FOR ALL USING (public.is_admin());
