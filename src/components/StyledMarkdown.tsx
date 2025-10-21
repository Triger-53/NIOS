// src/components/StyledMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: (props) => <h1 className="text-4xl font-bold my-4" {...props} />,
        h2: (props) => <h2 className="text-3xl font-bold my-3" {...props} />,
        h3: (props) => <h3 className="text-2xl font-bold my-2" {...props} />,
        p: (props) => <p className="my-4" {...props} />,
        ul: (props) => <ul className="list-disc list-inside my-4" {...props} />,
        ol: (props) => <ol className="list-decimal list-inside my-4" {...props} />,
        li: (props) => <li className="my-2" {...props} />,
        table: (props) => <table className="table-auto my-4 w-full" {...props} />,
        thead: (props) => <thead className="bg-gray-200" {...props} />,
        th: (props) => <th className="px-4 py-2" {...props} />,
        td: (props) => <td className="border px-4 py-2" {...props} />,
        blockquote: (props) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-4" {...props} />,
        code: (props) => <code className="bg-gray-100 rounded px-1" {...props} />,
        pre: (props) => <pre className="bg-gray-100 rounded p-4 my-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default StyledMarkdown;
