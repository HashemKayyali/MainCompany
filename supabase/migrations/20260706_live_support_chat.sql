-- ============================================================================
-- Eventies live support chat
-- ============================================================================
-- Human-only live chat between authenticated customers and superadmins.
-- Regular admins have zero access to conversations/messages at the database
-- layer. Quick questions are message templates only; they never auto-reply.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  context_type text CHECK (context_type IS NULL OR char_length(context_type) <= 50),
  context_ref text CHECK (context_ref IS NULL OR char_length(context_ref) <= 200),
  context_label text CHECK (context_label IS NULL OR char_length(context_label) <= 300),
  context_url text CHECK (context_url IS NULL OR char_length(context_url) <= 500),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_one_open_per_customer_idx
  ON public.chat_conversations(customer_id)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS chat_conversations_last_message_idx
  ON public.chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS chat_conversations_status_last_message_idx
  ON public.chat_conversations(status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_quick_questions (
  id text PRIMARY KEY,
  text_en text NOT NULL,
  text_ar text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'superadmin')),
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'quick_question', 'system')),
  quick_question_id text REFERENCES public.chat_quick_questions(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_created_idx
  ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_sender_created_idx
  ON public.chat_messages(sender_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_read_states (
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_read_states_user_idx
  ON public.chat_read_states(user_id, last_read_at DESC);

INSERT INTO public.chat_quick_questions (id, text_en, text_ar, sort_order, is_active)
VALUES
  ('product_availability', 'I would like to check product availability for my event date.', 'أود التحقق من توفر المنتج في تاريخ فعاليتي.', 10, true),
  ('delivery_setup', 'I have a question about delivery and setup.', 'لدي سؤال حول التوصيل والتركيب.', 20, true),
  ('request_status', 'I would like to ask about the status of my request.', 'أود الاستفسار عن حالة طلبي.', 30, true),
  ('customization', 'Can this service or product be customized for my event?', 'هل يمكن تخصيص هذه الخدمة أو المنتج لفعاليتي؟', 40, true)
ON CONFLICT (id) DO UPDATE SET
  text_en = EXCLUDED.text_en,
  text_ar = EXCLUDED.text_ar,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.chat_set_message_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer_id uuid;
  v_status text;
  v_recent_count bigint;
  v_daily_count bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT customer_id, status
  INTO v_customer_id, v_status
  FROM public.chat_conversations
  WHERE id = NEW.conversation_id;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Conversation is resolved';
  END IF;

  NEW.sender_id := v_uid;
  NEW.body := btrim(NEW.body);

  IF NEW.body = '' OR char_length(NEW.body) > 4000 THEN
    RAISE EXCEPTION 'Message must contain between 1 and 4000 characters';
  END IF;

  IF v_customer_id = v_uid AND NOT public.is_admin() THEN
    NEW.sender_type := 'customer';
    IF NEW.kind = 'system' THEN NEW.kind := 'text'; END IF;

    SELECT count(*) INTO v_recent_count
    FROM public.chat_messages m
    WHERE m.sender_id = v_uid
      AND m.created_at > now() - interval '1 minute';

    IF v_recent_count >= 20 THEN
      RAISE EXCEPTION 'Too many chat messages. Please wait a moment before sending more.'
        USING ERRCODE = 'P0001';
    END IF;

    SELECT count(*) INTO v_daily_count
    FROM public.chat_messages m
    WHERE m.sender_id = v_uid
      AND m.created_at > now() - interval '24 hours';

    IF v_daily_count >= 500 THEN
      RAISE EXCEPTION 'Daily chat message limit reached. Please try again later.'
        USING ERRCODE = 'P0001';
    END IF;
  ELSIF public.is_superadmin() THEN
    NEW.sender_type := 'superadmin';
    IF NEW.kind = 'quick_question' THEN NEW.kind := 'text'; END IF;
    NEW.quick_question_id := NULL;
  ELSE
    RAISE EXCEPTION 'You do not have access to this conversation' USING ERRCODE = '42501';
  END IF;

  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_message_identity_before_insert ON public.chat_messages;
CREATE TRIGGER chat_message_identity_before_insert
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.chat_set_message_identity();

CREATE OR REPLACE FUNCTION public.chat_touch_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_touch_conversation_after_message ON public.chat_messages;
CREATE TRIGGER chat_touch_conversation_after_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.chat_touch_conversation();

CREATE OR REPLACE FUNCTION public.chat_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.chat_touch_updated_at();

DROP TRIGGER IF EXISTS chat_quick_questions_updated_at ON public.chat_quick_questions;
CREATE TRIGGER chat_quick_questions_updated_at
  BEFORE UPDATE ON public.chat_quick_questions
  FOR EACH ROW EXECUTE FUNCTION public.chat_touch_updated_at();

DROP TRIGGER IF EXISTS chat_read_states_updated_at ON public.chat_read_states;
CREATE TRIGGER chat_read_states_updated_at
  BEFORE UPDATE ON public.chat_read_states
  FOR EACH ROW EXECUTE FUNCTION public.chat_touch_updated_at();

CREATE OR REPLACE FUNCTION public.get_or_create_chat_conversation(
  p_context_type text DEFAULT NULL,
  p_context_ref text DEFAULT NULL,
  p_context_label text DEFAULT NULL,
  p_context_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF public.is_admin() THEN
    RAISE EXCEPTION 'Staff accounts cannot start customer chats' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_id
  FROM public.chat_conversations
  WHERE customer_id = v_uid AND status = 'open'
  ORDER BY last_message_at DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  BEGIN
    INSERT INTO public.chat_conversations (
      customer_id, context_type, context_ref, context_label, context_url
    ) VALUES (
      v_uid,
      NULLIF(left(btrim(p_context_type), 50), ''),
      NULLIF(left(btrim(p_context_ref), 200), ''),
      NULLIF(left(btrim(p_context_label), 300), ''),
      NULLIF(left(btrim(p_context_url), 500), '')
    ) RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_id
    FROM public.chat_conversations
    WHERE customer_id = v_uid AND status = 'open'
    ORDER BY last_message_at DESC
    LIMIT 1;
  END;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;

  SELECT customer_id INTO v_customer_id
  FROM public.chat_conversations
  WHERE id = p_conversation_id;

  IF v_customer_id IS NULL THEN RETURN false; END IF;
  IF public.is_superadmin() THEN
    NULL;
  ELSIF v_customer_id = v_uid AND NOT public.is_admin() THEN
    NULL;
  ELSE
    RETURN false;
  END IF;

  INSERT INTO public.chat_read_states (conversation_id, user_id, last_read_at)
  VALUES (p_conversation_id, v_uid, now())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET last_read_at = EXCLUDED.last_read_at, updated_at = now();

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_chat_unread_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_super boolean;
  v_count bigint;
BEGIN
  IF v_uid IS NULL THEN RETURN 0; END IF;
  v_is_super := public.is_superadmin();

  IF v_is_super THEN
    SELECT count(*) INTO v_count
    FROM public.chat_messages m
    JOIN public.chat_conversations c ON c.id = m.conversation_id
    LEFT JOIN public.chat_read_states rs
      ON rs.conversation_id = c.id AND rs.user_id = v_uid
    WHERE m.sender_type = 'customer'
      AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz);
    RETURN COALESCE(v_count, 0);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid AND p.role = 'admin') THEN
    RETURN 0;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  LEFT JOIN public.chat_read_states rs
    ON rs.conversation_id = c.id AND rs.user_id = v_uid
  WHERE c.customer_id = v_uid
    AND m.sender_type = 'superadmin'
    AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz);

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_superadmin_chat_inbox(
  p_status text DEFAULT 'all',
  p_search text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  customer_id uuid,
  customer_name text,
  customer_email text,
  status text,
  context_type text,
  context_ref text,
  context_label text,
  context_url text,
  last_message_at timestamptz,
  created_at timestamptz,
  resolved_at timestamptz,
  last_message_body text,
  last_message_sender_type text,
  unread_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.customer_id,
    COALESCE(p.name, ''),
    COALESCE(p.email, ''),
    c.status,
    c.context_type,
    c.context_ref,
    c.context_label,
    c.context_url,
    c.last_message_at,
    c.created_at,
    c.resolved_at,
    COALESCE(last_msg.body, ''),
    COALESCE(last_msg.sender_type, ''),
    COALESCE(unread.cnt, 0)
  FROM public.chat_conversations c
  JOIN public.profiles p ON p.id = c.customer_id
  LEFT JOIN LATERAL (
    SELECT m.body, m.sender_type
    FROM public.chat_messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.chat_messages m
    LEFT JOIN public.chat_read_states rs
      ON rs.conversation_id = c.id AND rs.user_id = auth.uid()
    WHERE m.conversation_id = c.id
      AND m.sender_type = 'customer'
      AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz)
  ) unread ON true
  WHERE public.is_superadmin()
    AND (COALESCE(NULLIF(p_status, ''), 'all') = 'all' OR c.status = p_status)
    AND (
      COALESCE(NULLIF(btrim(p_search), ''), '') = ''
      OR lower(COALESCE(p.name, '')) LIKE '%' || lower(btrim(p_search)) || '%'
      OR lower(COALESCE(p.email, '')) LIKE '%' || lower(btrim(p_search)) || '%'
      OR lower(COALESCE(last_msg.body, '')) LIKE '%' || lower(btrim(p_search)) || '%'
    )
  ORDER BY (COALESCE(unread.cnt, 0) > 0) DESC, c.last_message_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.set_chat_conversation_status(
  p_conversation_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RETURN false;
  END IF;
  IF p_status NOT IN ('open', 'resolved') THEN
    RETURN false;
  END IF;

  UPDATE public.chat_conversations
  SET status = p_status,
      resolved_at = CASE WHEN p_status = 'resolved' THEN now() ELSE NULL END,
      resolved_by = CASE WHEN p_status = 'resolved' THEN auth.uid() ELSE NULL END,
      updated_at = now()
  WHERE id = p_conversation_id;

  RETURN FOUND;
END;
$$;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_quick_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_read_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_conversations_select ON public.chat_conversations;
CREATE POLICY chat_conversations_select ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (
    public.is_superadmin()
    OR (customer_id = (select auth.uid()) AND NOT public.is_admin())
  );


DROP POLICY IF EXISTS chat_messages_select ON public.chat_messages;
CREATE POLICY chat_messages_select ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    public.is_superadmin()
    OR (
      NOT public.is_admin()
      AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.customer_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS chat_messages_insert ON public.chat_messages;
CREATE POLICY chat_messages_insert ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND (
      (
        sender_type = 'customer'
        AND NOT public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.chat_conversations c
          WHERE c.id = chat_messages.conversation_id
            AND c.customer_id = (select auth.uid())
            AND c.status = 'open'
        )
      )
      OR (sender_type = 'superadmin' AND public.is_superadmin())
    )
  );

DROP POLICY IF EXISTS chat_quick_questions_anon_select ON public.chat_quick_questions;
CREATE POLICY chat_quick_questions_anon_select ON public.chat_quick_questions
  FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS chat_quick_questions_authenticated_select ON public.chat_quick_questions;
CREATE POLICY chat_quick_questions_authenticated_select ON public.chat_quick_questions
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_superadmin());

DROP POLICY IF EXISTS chat_read_states_select ON public.chat_read_states;
CREATE POLICY chat_read_states_select ON public.chat_read_states
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    AND (
      public.is_superadmin()
      OR (
        NOT public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.chat_conversations c
          WHERE c.id = chat_read_states.conversation_id
            AND c.customer_id = (select auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS chat_read_states_insert ON public.chat_read_states;
CREATE POLICY chat_read_states_insert ON public.chat_read_states
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND (
      public.is_superadmin()
      OR (
        NOT public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.chat_conversations c
          WHERE c.id = chat_read_states.conversation_id
            AND c.customer_id = (select auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS chat_read_states_update ON public.chat_read_states;
CREATE POLICY chat_read_states_update ON public.chat_read_states
  FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid())
    AND (
      public.is_superadmin()
      OR (
        NOT public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.chat_conversations c
          WHERE c.id = chat_read_states.conversation_id
            AND c.customer_id = (select auth.uid())
        )
      )
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    AND (
      public.is_superadmin()
      OR (
        NOT public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.chat_conversations c
          WHERE c.id = chat_read_states.conversation_id
            AND c.customer_id = (select auth.uid())
        )
      )
    )
  );

GRANT SELECT ON public.chat_quick_questions TO anon, authenticated;
GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
-- Read-state writes and conversation status changes are RPC-only.
-- No direct DML privileges are granted for these operations.

REVOKE EXECUTE ON FUNCTION public.get_or_create_chat_conversation(text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_chat_conversation_read(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_chat_unread_count() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_superadmin_chat_inbox(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_chat_conversation_status(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_or_create_chat_conversation(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_chat_conversation_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_unread_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_superadmin_chat_inbox(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_chat_conversation_status(uuid, text) TO authenticated;

-- Trigger functions are not public RPC endpoints.
REVOKE EXECUTE ON FUNCTION public.chat_set_message_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.chat_touch_conversation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.chat_touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Realtime publication: only conversation/message changes are needed by clients.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_conversations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
  END IF;
END $$;
