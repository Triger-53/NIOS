import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Check for GEMINI_API_KEY
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const llm = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const history_string = messages
      .map((msg: { role: string; content: string }) =>
        msg.role === "user"
          ? `Student: ${msg.content}`
          : `Teacher: ${msg.content}`
      )
      .join("\n");

    const prompt =
      `Please provide a concise summary of the following conversation between a student and a teacher:\n\n` +
      `${history_string}\n\n` +
      `Summary:`;

    const result = await llm.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('[/api/summarize] API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
