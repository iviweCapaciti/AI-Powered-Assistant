import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowUp, Copy, Sparkles, Square, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { creditsStore, useCredits } from "@/lib/credits-store";
import { Markdown, stripMarkdown } from "@/components/markdown";

type Props = {
  mode?: "chat" | "email" | "meeting" | "planner" | "research";
  placeholder?: string;
  hint?: string;
  initialPrompt?: string;
  emptyState?: React.ReactNode;
  autoSubmitKey?: string; // when this changes and initialPrompt set, auto-submit
};

function messageToText(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function AiPanel({
  mode = "chat",
  placeholder = "Ask anything — Cmd+K for actions",
  hint,
  initialPrompt,
  emptyState,
  autoSubmitKey,
}: Props) {
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const credits = useCredits();

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { mode },
    }),
    onError: (e) => toast.error(e.message || "AI request failed"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (creditsStore.get() <= 0) {
      toast.error("Not enough credits. Upgrade to Pro");
      return false;
    }
    sendMessage({ text });
    creditsStore.decrement(1);
    return true;
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  // Auto-submit initial prompt when key changes
  useEffect(() => {
    if (initialPrompt && autoSubmitKey) {
      setInput("");
      send(initialPrompt);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmitKey]);

  const submit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (send(text)) setInput("");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const saveEdit = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, parts: [{ type: "text", text: editValue }] } : m,
      ),
    );
    setEditing(null);
    toast.success("Edited output saved");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && emptyState}

          {messages.map((m) => {
            const text = messageToText(m);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("group flex gap-3", isUser && "flex-row-reverse")}>
                <div
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-medium",
                    isUser ? "bg-secondary" : "gradient-brand text-white",
                  )}
                >
                  {isUser ? "You" : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn("flex-1 min-w-0", isUser && "flex justify-end")}>
                  <div
                    className={cn(
                      "inline-block max-w-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-foreground",
                    )}
                  >
                    {editing === m.id ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-w-[280px] md:min-w-[500px] min-h-32"
                      />
                    ) : text ? (
                      isUser ? (
                        text
                      ) : (
                        <Markdown>{text}</Markdown>
                      )
                    ) : (
                      <Skeleton className="h-4 w-40" />
                    )}
                  </div>
                  {!isUser && text && (
                    <div className="mt-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {editing === m.id ? (
                        <Button size="sm" variant="ghost" onClick={() => saveEdit(m.id)}>
                          <Check className="h-3.5 w-3.5 mr-1" />Save
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => copy(text)}>
                            <Copy className="h-3.5 w-3.5 mr-1" />Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(m.id);
                              setEditValue(text);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background/70 backdrop-blur-xl px-4 md:px-8 py-4">
        <div className="mx-auto max-w-3xl">
          {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
          <div className="glass-card flex items-end gap-2 p-2 focus-within:ring-2 focus-within:ring-primary/40 transition">
            <Textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={placeholder}
              rows={1}
              className="min-h-10 max-h-48 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            {isLoading ? (
              <Button variant="secondary" onClick={stop} aria-label="Stop">
                <Square className="h-4 w-4 mr-1.5" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={!input.trim() || credits <= 0}
                className="gradient-brand text-white hover:opacity-90"
                aria-label="Generate"
              >
                <ArrowUp className="h-4 w-4 mr-1.5" />
                Generate
              </Button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            AI can make mistakes — verify important outputs. No training on your data.
          </p>
        </div>
      </div>
    </div>
  );
}
