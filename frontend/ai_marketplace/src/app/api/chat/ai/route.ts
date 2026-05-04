import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_MSG_LEN = 500;
const MAX_FIELD_LEN = 300;

type SafeInput = { readonly value: string };

function validateAndClean(val: unknown, maxLen: number): SafeInput {
  if (typeof val !== "string") return Object.freeze({ value: "" });
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLen);
  return Object.freeze({ value: cleaned });
}

function getSystemContent(title: SafeInput, price: SafeInput, desc: SafeInput): string {
  return [
    "You are a helpful seller assistant for an online marketplace.",
    "Represent the product below and help buyers with their questions.",
    "Be friendly, concise, and keep replies under 3 sentences.",
    "Never invent information not listed here.",
    "If asked about negotiation, say the seller will respond.",
    "---",
    "Product: " + (title.value || "Unknown"),
    "Price: " + (price.value || "N/A") + " INR",
    "Details: " + (desc.value || "Not provided"),
  ].join("\n");
}

function getUserContent(msg: SafeInput): string {
  return msg.value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = validateAndClean(body.message, MAX_MSG_LEN);
    if (!message.value) return NextResponse.json({ error: "No message" }, { status: 400 });

    const title = validateAndClean(body.productTitle, MAX_FIELD_LEN);
    const price = validateAndClean(body.productPrice, 50);
    const desc = validateAndClean(body.productDescription, MAX_FIELD_LEN);

    const chatMessages: { role: "system" | "user"; content: string }[] = [
      { role: "system", content: getSystemContent(title, price, desc) },
      { role: "user", content: getUserContent(message) },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'll get back to you shortly!";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
