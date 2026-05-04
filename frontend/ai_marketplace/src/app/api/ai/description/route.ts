import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_TITLE_LEN = 200;
const MAX_CAT_LEN = 100;

type SafeInput = { readonly value: string };

function validateAndClean(val: unknown, maxLen: number): SafeInput {
  if (typeof val !== "string") return Object.freeze({ value: "" });
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
  return Object.freeze({ value: cleaned });
}

function buildPromptLines(title: SafeInput, category: SafeInput): string[] {
  const lines = [
    "Write a product description for the following item.",
    "Item name: " + title.value,
  ];
  if (category.value) lines.push("Category: " + category.value);
  return lines;
}

function getUserContent(lines: string[]): string {
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const title = validateAndClean(body.title, MAX_TITLE_LEN);
  const category = validateAndClean(body.category, MAX_CAT_LEN);

  if (!title.value) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const chatMessages: { role: "system" | "user"; content: string }[] = [
    {
      role: "system",
      content:
        "You are a product copywriter for an Indian e-commerce marketplace. Write compelling, honest product descriptions. Be concise (2-4 sentences). No bullet points. No markdown.",
    },
    { role: "user", content: getUserContent(buildPromptLines(title, category)) },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: chatMessages,
    max_tokens: 120,
    temperature: 0.8,
  });

  const description = completion.choices[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ description });
}
