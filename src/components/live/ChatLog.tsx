
import React, { useEffect, useRef } from 'react';
import { LogMessage } from '@/types/live-types';

interface ChatLogProps {
  messages: LogMessage[];
}

const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-6 w-full max-w-3xl mx-auto px-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] animate-pulse">
          <div className="text-slate-400 font-light text-sm tracking-widest uppercase opacity-50">
            Awaiting Input
          </div>
        </div>
      )}

      {messages.map((msg, _index) => (
        <div
          key={msg.id}
          className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`relative max-w-[85%] px-6 py-4 text-[15px] leading-relaxed backdrop-blur-xl shadow-sm transition-all duration-500 ease-out ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                : msg.role === 'system'
                ? 'w-full text-center bg-transparent text-slate-400 text-xs font-mono py-2'
                : 'bg-slate-600 text-slate-50 rounded-2xl rounded-tl-sm'
            }`}
          >
            {msg.text}

            {/* Tiny timestamp or indicator could go here */}
            <div className={`absolute top-0 ${msg.role === 'user' ? '-right-2' : '-left-2'} w-2 h-2 rounded-full ${
                 msg.role === 'user' ? 'bg-blue-400' : msg.role === 'model' ? 'bg-purple-400' : 'hidden'
            } opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatLog;
