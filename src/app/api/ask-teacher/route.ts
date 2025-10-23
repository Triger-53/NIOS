import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'premium') {
      return NextResponse.json({ error: 'Requires premium plan' }, { status: 403 });
    }

    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // 1. Embed the User Question
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResult = await embeddingModel.embedContent(question);
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. Retrieve Relevant Context from Supabase
    const { data: retrieved_chunks, error: rpcError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.78,
        match_count: 4,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return NextResponse.json({ error: 'Error retrieving context from Supabase.' }, { status: 500 });
    }

    if (!retrieved_chunks || retrieved_chunks.length === 0) {
      return NextResponse.json({
        answer: "I could not find any relevant information in your book data to answer that question.",
        sources: [],
      });
    }

    interface DocumentChunk {
      content: string;
      book_title: string;
      page_number: number;
    }
    const context = retrieved_chunks.map((chunk: DocumentChunk) => chunk.content).join('\n---\n');
    const sources = retrieved_chunks.map((chunk: DocumentChunk) => ({
      title: chunk.book_title,
      page: chunk.page_number,
    }));


    // 3. Construct the RAG Prompt and Generate Answer with Gemini
    const llm = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const system_instruction =
      "You are an expert, patient, and thorough teacher. " +
      "Use ONLY the following context to teach the student and answer their question. " +
      "If the information to answer the question is not available in the context, " +
      "politely state that the information is outside the provided material. " +
      "Always structure your answer clearly and concisely.";

    const augmented_prompt =
      `${system_instruction}\n\n` +
      `--- CONTEXT ---\n` +
      `${context}\n\n` +
      `--- STUDENT QUESTION ---\n` +
      `${question}`;

    const result = await llm.generateContent(augmented_prompt);
    const response = result.response;
    const answer = response.text();

    return NextResponse.json({
      answer,
      sources,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
