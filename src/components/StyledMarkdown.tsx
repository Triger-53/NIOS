// src/components/StyledMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <article className="prose prose-zinc dark:prose-invert lg:prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-li:text-base prose-strong:text-foreground prose-a:text-primary prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-muted/50 prose-pre:text-foreground prose-ol:list-decimal prose-ul:list-disc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default StyledMarkdown;
