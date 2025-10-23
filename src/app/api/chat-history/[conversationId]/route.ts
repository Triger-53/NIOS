import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = req.nextUrl.pathname.split('/').pop();

    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .select('messages')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching conversation details:', error);
      return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
