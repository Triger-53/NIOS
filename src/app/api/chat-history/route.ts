import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET handler to fetch conversation list
export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// POST handler to create or update a conversation
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check for premium plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'premium') {
      return NextResponse.json({ error: 'Requires premium plan' }, { status: 403 });
    }

    const { conversationId, messages, title } = await req.json();

    if (conversationId) {
      // Update existing conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .update({ messages })
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
      }
      return NextResponse.json(data);
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: title,
          messages,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
