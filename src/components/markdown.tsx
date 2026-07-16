import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Strip stray asterisks/hashes that aren't valid markdown pairs
function preprocess(text: string) {
  let t = text;
  // Normalize "* item" bullets that have surrounding spaces like "* Hi *"
  t = t.replace(/^\s*\*\s+(.*?)\s*\*?\s*$/gm, (_m, inner) => `- ${inner.trim()}`);
  // Remove standalone leading/trailing asterisk lines
  t = t.replace(/^\s*\*+\s*$/gm, "");
  return t;
}

export function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)")
    .trim();
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-p:my-2 prose-p:leading-relaxed",
        "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:mt-4 prose-headings:mb-2",
        "prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h4:text-sm",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:marker:text-primary",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-lg prose-pre:p-3",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{preprocess(children)}</ReactMarkdown>
    </div>
  );
}
