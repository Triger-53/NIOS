'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import StyledMarkdown from '@/components/StyledMarkdown';

// --- Type Definitions ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; page: number }[];
}

interface Conversation {
  id: string;
  title: string;
}

// --- Main Chat Component ---
export default function PremiumChatPage() {
  // --- State Management ---
  const [_user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, _setSidebarOpen] = useState(true);

  const supabase = createClient();

  // --- Effects ---
  // Fetch user and check premium status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        setIsPremium(profile?.plan === 'premium');
      } else {
        setIsPremium(false);
      }
    };
    checkUser();
  }, [supabase]);

  // Fetch conversations when user is premium
  useEffect(() => {
    if (isPremium) {
      fetchConversations();
    }
  }, [isPremium]);

  // --- Data Fetching ---
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat-history');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat-history/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setActiveConversationId(conversationId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // --- Event Handlers ---
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setUserInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send question to AI Teacher API
      const aiResponse = await fetch('/api/ask-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get response from AI teacher.');
      }

      const aiData = await aiResponse.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiData.answer,
        sources: aiData.sources,
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save conversation to database
      let conversationIdToSave = activeConversationId;
      if (!conversationIdToSave) {
        // Create new conversation
        const firstTitle = userInput.substring(0, 30);
        const saveResponse = await fetch('/api/chat-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: firstTitle, messages: updatedMessages }),
        });
        const savedData = await saveResponse.json();
        conversationIdToSave = savedData.id;
        setActiveConversationId(conversationIdToSave);
        fetchConversations(); // Refresh list
      } else {
        // Update existing conversation
        await fetch('/api/chat-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: conversationIdToSave, messages: updatedMessages }),
        });
      }
    } catch (error) {
      console.error('Error during chat submission:', error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  // --- Render Logic ---
  if (isPremium === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>This is a premium feature. Please upgrade your plan to access the AI Teacher.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className={`bg-gray-100 p-4 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">History</h2>
          <button onClick={handleNewConversation} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            New Chat
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {conversations.map(convo => (
            <div
              key={convo.id}
              onClick={() => fetchConversationMessages(convo.id)}
              className={`p-2 my-1 rounded-md cursor-pointer ${activeConversationId === convo.id ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            >
              {convo.title}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`my-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow-md'}`}>
                {msg.role === 'assistant' ? (
                    <StyledMarkdown content={msg.content} />
                ) : (
                    <p>{msg.content}</p>
                )}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-gray-300">
                    <h4 className="font-semibold text-sm">Sources:</h4>
                    <ul className="text-xs list-disc list-inside">
                        {msg.sources.map((source, idx) => (
                        <li key={idx}>Book: {source.title}, Page: {source.page}</li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>
            </div>
          ))}
          {isLoading && <div className="text-center">Assistant is thinking...</div>}
        </div>

        {/* User Input Form */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Ask your AI teacher a question..."
              className="flex-1 p-2 border rounded-l-md"
              disabled={isLoading}
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600" disabled={isLoading}>
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
