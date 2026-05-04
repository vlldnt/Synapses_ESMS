import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Rendu Markdown "style Word" dans le navigateur.
 * Supporte : titres, paragraphes, listes, gras/italique, hr, et tableaux GFM.
 */
export default function WordPreview({ text }) {
  return (
    <div className="bg-white text-[#1a1a1a] font-['Calibri','Georgia',serif] text-[15px] leading-7 px-8 md:px-12 py-8 md:py-10 rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.10)] border border-[#e0e0e0] min-h-32">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[18px] font-bold text-[#0D66D4] mt-6 mb-2 border-b-2 border-[#0D66D4] pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[16px] font-bold text-[#1a1a1a] mt-5 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] font-semibold text-[#374151] mt-4 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-[15px] leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 pl-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 pl-6 list-decimal space-y-1">{children}</ol>
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
            <hr className="my-5 border-t-2 border-[#0D66D4] opacity-40" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#0D66D4] pl-4 italic text-[#555] my-3 bg-[#f0f7ff] py-2 pr-3 rounded-r-md">
              {children}
            </blockquote>
          ),

          // ── Tables GFM ────────────────────────────────────────────────
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-[#C8D9EF]">
              <table className="w-full text-[13px] md:text-[14px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#DBEAFE]">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#E5EDF8]">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-[#F8FAFC]">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 text-left font-semibold text-[#0D66D4] border-b border-[#C8D9EF] whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-[#374151] align-top leading-snug">
              {children}
            </td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
