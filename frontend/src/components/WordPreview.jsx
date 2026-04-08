import ReactMarkdown from 'react-markdown';

export default function WordPreview({ text }) {
  return (
    <div className="bg-white text-[#1a1a1a] font-['Calibri',_'Georgia',_serif] text-[15px] leading-7 px-12 py-10 rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.10)] border border-[#e0e0e0] min-h-32">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-[17px] font-bold text-[#1a1a1a] mt-5 mb-2 border-b border-[#2563EB] pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-bold text-[#1a1a1a] mt-4 mb-1">{children}</h2>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-[15px] leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 pl-6 list-disc space-y-1">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-7">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#1a1a1a]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#555]">{children}</em>
          ),
          hr: () => (
            <hr className="my-4 border-t border-[#cbd5e1]" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#2563EB] pl-4 italic text-[#555] my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
