// src/components/StyledMarkdown.tsx
"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="relative my-6 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-zinc-700">
        <span className="text-xs font-medium text-zinc-400 lowercase">
          {match[1]}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-700/50"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4 prose-headings:mt-6
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
      prose-p:leading-relaxed prose-p:text-base prose-p:mb-4 prose-p:text-zinc-800 dark:prose-p:text-zinc-200
      prose-li:text-zinc-800 dark:prose-li:text-zinc-200 prose-li:my-1.5
      prose-strong:font-bold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:text-sm prose-code:font-mono prose-code:text-pink-600 dark:prose-code:text-pink-400
      prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
      prose-ol:list-decimal prose-ul:list-disc prose-ul:pl-6 prose-ol:pl-6
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default StyledMarkdown;
