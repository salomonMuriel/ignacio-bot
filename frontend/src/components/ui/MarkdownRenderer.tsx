import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  children: string;
  isUserMessage?: boolean;
}

export default function MarkdownRenderer({ children, isUserMessage = false }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headers
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-2 mt-3" style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold mb-2 mt-3" style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1 mt-2" style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </h3>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="leading-relaxed mb-2 last:mb-0" style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.9)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </p>
        ),

        // Links
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline transition-all duration-200"
            style={{
              color: isUserMessage ? '#fbbf24' : 'var(--ig-text-accent)'
            }}
            {...props}
          >
            {children}
          </a>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc ml-4 mb-2 space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-4 mb-2 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.9)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </li>
        ),

        // Emphasis
        strong: ({ children }) => (
          <strong className="font-semibold" style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-primary)'
          }}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.9)' : 'var(--ig-text-secondary)'
          }}>
            {children}
          </em>
        ),

        // Code
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');

          if (!inline && match) {
            // Code block with syntax highlighting
            return (
              <div className="my-3 rounded-lg overflow-hidden" style={{
                background: isUserMessage ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.8)',
                border: `1px solid ${isUserMessage ? 'rgba(255, 255, 255, 0.2)' : 'var(--ig-border-glass)'}`,
              }}>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    background: 'transparent',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          } else {
            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{
                  background: isUserMessage ? 'rgba(0, 0, 0, 0.3)' : 'var(--ig-surface-glass-light)',
                  color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-accent)',
                  border: `1px solid ${isUserMessage ? 'rgba(255, 255, 255, 0.2)' : 'var(--ig-border-glass)'}`,
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
        },

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote
            className="border-l-3 pl-4 py-2 my-3 italic"
            style={{
              borderColor: isUserMessage ? 'rgba(255, 255, 255, 0.3)' : 'var(--ig-border-accent)',
              background: isUserMessage ? 'rgba(0, 0, 0, 0.2)' : 'var(--ig-surface-glass-light)',
              color: isUserMessage ? 'rgba(255, 255, 255, 0.8)' : 'var(--ig-text-secondary)'
            }}
          >
            {children}
          </blockquote>
        ),

        // Tables (GitHub Flavored Markdown)
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table
              className="w-full text-sm border-collapse"
              style={{
                background: isUserMessage ? 'rgba(0, 0, 0, 0.2)' : 'var(--ig-surface-glass-light)',
                border: `1px solid ${isUserMessage ? 'rgba(255, 255, 255, 0.2)' : 'var(--ig-border-glass)'}`,
                borderRadius: '0.5rem'
              }}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className="border px-3 py-2 text-left font-semibold"
            style={{
              borderColor: isUserMessage ? 'rgba(255, 255, 255, 0.2)' : 'var(--ig-border-glass)',
              background: isUserMessage ? 'rgba(0, 0, 0, 0.3)' : 'var(--ig-surface-glass-dark)',
              color: isUserMessage ? 'rgba(255, 255, 255, 0.95)' : 'var(--ig-text-primary)'
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="border px-3 py-2"
            style={{
              borderColor: isUserMessage ? 'rgba(255, 255, 255, 0.2)' : 'var(--ig-border-glass)',
              color: isUserMessage ? 'rgba(255, 255, 255, 0.9)' : 'var(--ig-text-primary)'
            }}
          >
            {children}
          </td>
        ),

        // Horizontal rules
        hr: () => (
          <hr
            className="my-4"
            style={{
              border: 'none',
              height: '1px',
              background: isUserMessage ? 'rgba(255, 255, 255, 0.3)' : 'var(--ig-border-glass)'
            }}
          />
        ),

        // Strikethrough (GFM)
        del: ({ children }) => (
          <del style={{
            color: isUserMessage ? 'rgba(255, 255, 255, 0.7)' : 'var(--ig-text-muted)'
          }}>
            {children}
          </del>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}