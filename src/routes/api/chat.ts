import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: "You are Neptune Copilot, an AI teammate for professionals. Be concise, structured, and actionable. Use markdown lists and headings where helpful.",
  email:
    "You are an expert email writer. Produce clear, professional emails with subject line, greeting, body, and sign-off. Keep tone appropriate to the request.",
  meeting:
    "You are a meeting notes summarizer. Extract action items with owners and deadlines as clean markdown checklists. Group by theme when useful.",
  planner:
    "You are a productivity coach. Break work into prioritized daily task lists (Mon–Fri), each item with time estimate and priority (P1/P2/P3).",
  research:
    "You are a research assistant. Provide well-structured, cited-sounding insights using bullet points and short paragraphs. Note when info may be time-sensitive.",
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; mode?: string };
        if (!Array.isArray(body.messages))
          return new Response("Messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const system = SYSTEM_PROMPTS[body.mode ?? "chat"] ?? SYSTEM_PROMPTS.chat;

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: body.messages });
      },
    },
  },
});
