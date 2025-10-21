// src/components/StyledMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
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
