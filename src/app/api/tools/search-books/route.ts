import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Embed the query
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResult = await embeddingModel.embedContent(query);
    const queryEmbedding = embeddingResult.embedding.values;

    // Search using RPC
    const { data: retrieved_chunks, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5, // Fetch top 5 chunks
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json({ error: 'Database search failed' }, { status: 500 });
    }

    // Format results for the tool
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = retrieved_chunks.map((chunk: any) => ({
      content: chunk.content,
      book: chunk.book_title,
      page: chunk.page_number
    }));

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in search-books tool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
