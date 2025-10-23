-- This SQL script creates the 'chat_conversations' table and sets up
-- Row-Level Security (RLS) to ensure users can only access their own data.

-- 1. Create the table
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment for clarity
COMMENT ON TABLE public.chat_conversations IS 'Stores the chat history for the AI Teacher feature.';

-- 2. Enable Row-Level Security (RLS) on the table
-- This is a crucial security step. It ensures that the policies below are enforced.
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies
-- This policy allows users to perform any action (SELECT, INSERT, UPDATE, DELETE)
-- on conversations that belong to them. The `auth.uid()` function returns the
-- ID of the currently logged-in user.
CREATE POLICY "Allow users to manage their own conversations"
ON public.chat_conversations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: This schema assumes you have a 'profiles' table with a 'plan' column
-- to check for premium status. The access control is handled in the API routes,
-- but you could add an additional layer of security here with another policy if needed.
