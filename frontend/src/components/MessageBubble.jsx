import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, RefreshCw, Trash2 } from "lucide-react";

function MessageBubble({ role, content, images, messageId, isLast, onRegenerate, onDelete }) {
  const isUser = role === "user";
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [hovered, setHovered] = useState(false);

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(content || "");
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const markdown = (content || "")
    .replace(/```review/gi, "```")
    .replace(/```text/gi, "```")
    .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col gap-1 max-w-[92vw] md:max-w-[72%]">
        <div
          className={`w-fit max-w-full px-4 py-2.5 rounded-2xl break-words overflow-hidden leading-relaxed
          ${
            isUser
              ? "bg-gradient-to-br from-[#14b4dc] to-[#0d9488] text-white rounded-tr-sm"
              : " text-slate-200 rounded-tl-sm"
          }`}
        >
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  loading="lazy"
                  onClick={() => setLightboxSrc(img)}
                  onError={(e) => e.currentTarget.remove()}
                  className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              ))}
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 whitespace-pre-wrap break-words">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-white/10">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-white/10 px-3 py-2">{children}</td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#14b4dc] underline inline-flex items-center gap-1"
                >
                  {children}
                  <FiExternalLink size={11} />
                </a>
              ),
              img: ({ src }) => {
                if (!src) return null;
                return (
                  <img
                    src={src}
                    loading="lazy"
                    onClick={() => setLightboxSrc(src)}
                    onError={(e) => e.currentTarget.remove()}
                    className="w-40 h-28 rounded-xl object-cover cursor-pointer"
                  />
                );
              },
              code({ className, children }) {
                const value = String(children)
                  .replace(/^\s*```[^\n]*\n/, "")
                  .replace(/\n```\s*$/, "")
                  .trim();

                if (!className) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400">{value}</code>
                  );
                }

                const language = className.replace("language-", "");

                return (
                  <div className="my-4 overflow-hidden rounded-xl border border-[rgba(20,180,220,0.12)] bg-[#0b1621]">
                    <div className="flex items-center justify-between bg-[#0f1e2e] border-b border-[rgba(20,180,220,0.12)] px-4 py-2">
                      <span className="uppercase text-xs text-slate-400">{language}</span>
                      <button
                        onClick={() => copyCode(value)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {copiedCode === value ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={language}
                      style={oneDark}
                      wrapLongLines
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        padding: "16px",
                        background: "#07111a",
                        fontSize: "13px",
                      }}
                    >
                      {value}
                    </SyntaxHighlighter>
                  </div>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>

        {hovered && (
          <div className={`flex items-center gap-1 ${isUser ? "justify-end" : "justify-start"} pl-1`}>
            <button
              onClick={copyMessage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-150 bg-transparent border-none cursor-pointer"
            >
              {copiedMsg ? (
                <>
                  <Check size={12} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>

            {!isUser && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-[#14b4dc] hover:bg-white/[0.06] transition-all duration-150 bg-transparent border-none cursor-pointer"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
            )}

            {messageId && onDelete && (
              <button
                onClick={() => onDelete(messageId)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-red-400 hover:bg-white/[0.06] transition-all duration-150 bg-transparent border-none cursor-pointer"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
          >
            <FiX size={20} />
          </button>
          <img
            src={lightboxSrc}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;