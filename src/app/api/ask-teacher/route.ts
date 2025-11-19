import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  console.log('[/api/ask-teacher] POST request received');
  try {
    // Check for GEMINI_API_KEY
    if (!process.env.GEMINI_API_KEY) {
      console.error('[/api/ask-teacher] GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }
    console.log('[/api/ask-teacher] GEMINI_API_KEY is present');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('[/api/ask-teacher] Unauthorized access: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[/api/ask-teacher] User authenticated:', user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'premium') {
      console.log('[/api/ask-teacher] User is not on premium plan:', user.id);
      return NextResponse.json({ error: 'Requires premium plan' }, { status: 403 });
    }
    console.log('[/api/ask-teacher] User has premium plan');

    const { question, history, summary } = await req.json();

    if (!question) {
      console.log('[/api/ask-teacher] Bad request: No question provided');
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    console.log('[/api/ask-teacher] Question received:', question);

    // 1. Embed the User Question
    console.log('[/api/ask-teacher] Embedding user question...');
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResult = await embeddingModel.embedContent(question);
    const queryEmbedding = embeddingResult.embedding.values;
    console.log('[/api/ask-teacher] Question embedded successfully');

    // 2. Retrieve Relevant Context from Supabase
    console.log('[/api/ask-teacher] Retrieving relevant context from Supabase...');
    const { data: retrieved_chunks, error: rpcError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 7,
    });

    if (rpcError) {
      console.error('[/api/ask-teacher] Supabase RPC error:', rpcError);
      return NextResponse.json({ error: 'Error retrieving context from Supabase.' }, { status: 500 });
    }
    console.log('[/api/ask-teacher] Supabase RPC call successful');

    if (!retrieved_chunks || retrieved_chunks.length === 0) {
      console.log('[/api/ask-teacher] No relevant chunks found');
      return NextResponse.json({
        answer: "I could not find any relevant information in your book data to answer that question.",
        sources: [],
      });
    }
    console.log('[/api/ask-teacher] Retrieved', retrieved_chunks.length, 'chunks');

    interface DocumentChunk {
      content: string;
      book_title: string;
      page_number: number;
    }
    const context = retrieved_chunks.map((chunk: DocumentChunk) => chunk.content).join('\n---\n');

    // 3. Construct the RAG Prompt and Generate Answer with Gemini
    console.log('[/api/ask-teacher] Generating answer with Gemini...');
    const llm = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const system_instruction =
      "You are an expert, patient, and thorough teacher. " +
      "Answer the student's question based on your knowledge. Your knowledge is derived from the context provided below. " +
      "Do not mention the context or that your knowledge is limited. Speak as if you know this information innately. " +
      "If the information to answer the question is not available, politely state that you cannot answer that question without providing a reason. " +
      "Always structure your answer clearly and concisely.";

    const history_string =
      history && history.length > 0
        ? "--- CHAT HISTORY ---\n" +
          history
            .map((msg: { role: string; content: string }) =>
              msg.role === "user"
                ? `Student: ${msg.content}`
                : `Teacher: ${msg.content}`
            )
            .join("\n") +
          "\n\n"
        : "";

    const summary_string = summary
      ? `--- PREVIOUSLY SUMMARIZED CHAT ---\n${summary}\n\n`
      : "";

    const augmented_prompt =
      `${system_instruction}\n\n` +
      `${summary_string}` +
      `${history_string}` +
      `--- CONTEXT ---\n` +
      `${context}\n\n` +
      `--- STUDENT QUESTION ---\n` +
      `${question}`;

    const result = await llm.generateContent(augmented_prompt);
    const response = result.response;
    const answer = response.text();
    console.log('[/api/ask-teacher] Gemini answer generated successfully');

    return NextResponse.json({
      answer,
    });

  } catch (error) {
    console.error('[/api/ask-teacher] API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
