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

    // 1. Classify User Intent
    console.log('[/api/ask-teacher] Classifying user intent...');
    const classificationModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const classification_prompt = `
      You are an expert at classifying user intent. Please classify the following user question into one of three categories:
      1. small_talk: The user is making a simple greeting, thank you, or other conversational filler.
      2. contextual_query: The user is asking a question about the current conversation.
      3. general_query: The user is asking a general question that may or may not be related to the NIOS books.

      Please respond with a JSON object with a single key "intent" and one of the three categories as the value.

      User question: "${question}"
    `;
    const classificationResult = await classificationModel.generateContent(classification_prompt);
    const rawText = classificationResult.response.text();
    console.log('[/api/ask-teacher] Raw classification response:', rawText);

    let intent = 'general_query';
    try {
      // Helper to clean JSON string (remove markdown code blocks if present)
      const cleanJson = (text: string) => {
        return text.replace(/```json\n?|\n?```/g, '').trim();
      };

      const parsed = JSON.parse(cleanJson(rawText));
      if (parsed.intent) {
        intent = parsed.intent;
      }
    } catch (e) {
      console.error('[/api/ask-teacher] Failed to parse classification JSON:', e);
      // Fallback to general_query is already set
    }

    console.log('[/api/ask-teacher] User intent classified as:', intent);

    if (intent === 'small_talk') {
      console.log('[/api/ask-teacher] Handling small talk...');
      const smallTalkModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const small_talk_prompt = `
        You are a friendly and helpful NIOS teacher. The user has engaged in small talk. Please provide a brief, friendly, and conversational response.

        User's message: "${question}"

        Response:
      `;
      const smallTalkResult = await smallTalkModel.generateContent(small_talk_prompt);
      const answer = smallTalkResult.response.text();
      return NextResponse.json({ answer });
    }


    // 2. Embed the User Question
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
      if (intent === 'contextual_query') {
        console.log('[/api/ask-teacher] Handling contextual query with no new context...');
        const contextualModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const contextual_prompt = `
          You are a helpful NIOS teacher. The user has asked a question about the current conversation, but there is no new information in the NIOS books to answer it. Please answer the user's question based on the provided chat history and summary.

          Chat History:
          ${history}

          Summary:
          ${summary}

          User's question: "${question}"

          Answer:
        `;
        const contextualResult = await contextualModel.generateContent(contextual_prompt);
        const answer = contextualResult.response.text();
        return NextResponse.json({ answer });
      } else {
        console.log('[/api/ask-teacher] Handling general query with no new context...');
        return NextResponse.json({
          answer: "My apologies, but I can only answer questions based on the content of your selected NIOS books.",
          sources: [],
        });
      }
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

    const system_instruction = "You are an expert, patient, and thorough teacher. " +
      "Answer the student's question based on your knowledge. Your knowledge is derived from the context provided below. " +
      "Do not mention the context or that your knowledge is limited. Speak as if you know this information innately. " +
      "If the information to answer the question is not available, politely state that you cannot answer that question without providing a reason. " +
      "Always structure your answer clearly using Markdown.\n\n" +
      "**formatting guidelines:**\n" +
      "- Use **Bold** for key terms and important concepts.\n" +
      "- Use **Headings (##, ###)** to break down complex topics.\n" +
      "- Use **Lists (bulleted or numbered)** for steps, features, or examples.\n" +
      "- Use **Emojis** 📚✨💡 to make the content engaging and friendly. Use them as bullet points or in headers where appropriate.\n" +
      "- Use `Code Blocks` for technical terms or definitions if needed.\n" +
      "- Keep paragraphs concise and easy to read.\n" +
      "- Use a friendly and encouraging tone.";

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
