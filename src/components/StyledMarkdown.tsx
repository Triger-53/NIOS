"use client";
import React, { useState, ReactNode } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Info, AlertTriangle, Octagon, Lightbulb, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Custom Components ---

const Alert = ({ type, title, children }: { type: 'note' | 'tip' | 'important' | 'warning' | 'caution'; title?: string; children: ReactNode }) => {
  const styles = {
    note: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', icon: Info },
    tip: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', icon: Lightbulb },
    important: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-300', icon: Octagon },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle },
    caution: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', icon: Octagon },
  };

  const style = styles[type] || styles.note;
  const Icon = style.icon;

  return (
    <div className={cn("my-6 rounded-lg border p-4", style.bg, style.border)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-5 h-5", style.text)} />
        <span className={cn("font-semibold capitalize", style.text)}>{title || type}</span>
      </div>
      <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pl-7">
        {children}
      </div>
    </div>
  );
};

// Handle GitHub specific alerts in blockquotes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Blockquote = ({ children, ...props }: any) => {
  // Check if children content matches alert pattern like [!NOTE]
  const content = React.Children.toArray(children);
  const firstChild = content[0] as React.ReactElement;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (React.isValidElement(firstChild) && (firstChild.props as any).node?.tagName === 'p') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (firstChild.props as any).children?.[0];
    if (typeof text === 'string') {
      const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
      if (match) {
        const type = match[1].toLowerCase() as 'note' | 'tip' | 'important' | 'warning' | 'caution';
        // Remove the [!TYPE] text from the first paragraph
        const newFirstChild = React.cloneElement(firstChild, {
          ...firstChild.props,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children: [text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/, '').trim(), ...(firstChild.props as any).children.slice(1)]
        });

        return <Alert type={type}>{newFirstChild}{content.slice(1)}</Alert>;
      }
    }
  }

  return (
    <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 my-6 italic text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 py-3 rounded-r-lg" {...props}>
      {children}
    </blockquote>
  );
};

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

  if (!inline && match) {
    return (
      <div className="relative my-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md bg-[#1e1e1e] group">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-zinc-400" />
            <span className="text-xs font-medium text-zinc-300 lowercase font-mono">
              {match[1]}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-green-400 transition-colors rounded-md hover:bg-zinc-700/50"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: 'transparent',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code
      className={cn(
        "px-1.5 py-0.5 rounded-md font-mono text-[0.9em]",
        "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
        "border border-zinc-200 dark:border-zinc-700",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
};

// --- Main Component ---

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <div className="w-full text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock,
          blockquote: Blockquote,
          // Headings
          h1: ({ node, ...props }) => <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-6 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-10 mb-5 text-zinc-800 dark:text-zinc-100" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-zinc-800 dark:text-zinc-100" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-lg sm:text-xl font-semibold tracking-tight mt-6 mb-3 text-zinc-800 dark:text-zinc-100" {...props} />,

          // Paragraphs & Lists
          p: ({ node, ...props }) => <p className="leading-7 text-base sm:text-lg mb-5 text-zinc-700 dark:text-zinc-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2 marker:text-zinc-400 dark:marker:text-zinc-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 marker:font-medium marker:text-zinc-500 dark:marker:text-zinc-400" {...props} />,
          li: ({ node, ...props }) => <li className="leading-7 text-base sm:text-lg text-zinc-700 dark:text-zinc-300 pl-1" {...props} />,

          // Interactive & Media
          a: ({ node, ...props }) => (
            <a
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline decoration-blue-300 dark:decoration-blue-700 underline-offset-4 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => <hr className="my-8 border-zinc-200 dark:border-zinc-800" {...props} />,
          img: ({ node, ...props }) => (
            <div className="my-8">
              <img
                className="rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
                {...props}
              />
              {props.alt && (
                <span className="block mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
                  {props.alt}
                </span>
              )}
            </div>
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="my-8 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left" {...props} />
              </div>
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent" {...props} />,
          tr: ({ node, ...props }) => <tr className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10" {...props} />,
          th: ({ node, ...props }) => <th className="px-6 py-3 font-semibold whitespace-nowrap" {...props} />,
          td: ({ node, ...props }) => <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default StyledMarkdown;
