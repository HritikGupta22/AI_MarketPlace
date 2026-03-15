"use client";

import { useChat } from "@/hooks/useChat";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Circle, Bot, UserCheck } from "lucide-react";

function ChatRoom() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.roomId as string;
  const sellerName = searchParams.get("sellerName") ?? "Seller";
  const productTitle = searchParams.get("productTitle") ?? "";
  const productPrice = searchParams.get("productPrice") ?? "";
  const productDescription = searchParams.get("productDescription") ?? "";

  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? "User";

  // Only pass product context if user is a buyer (not the seller)
  const isSeller = roomId.split("_")[1] === userId;
  const productContext = !isSeller && productTitle
    ? { productTitle, productPrice, productDescription }
    : undefined;

  const { messages, connected, typingUser, aiTyping, aiDisabled, sendMessage, sendTyping, sendTakeover, sendHandback } = useChat(
    roomId, userId, userName, productContext
  );
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser, aiTyping]);

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <div>
          <h1 className="font-bold">{isSeller ? "Buyer Chat" : sellerName}</h1>
          {productTitle && <p className="text-xs text-muted-foreground">Re: {productTitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Circle className={`size-2 fill-current ${connected ? "text-green-500" : "text-red-400"}`} />
          <span className="text-muted-foreground">{connected ? "Connected" : "Connecting..."}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isBot = msg.senderId === "ai-bot";
          const isMe = msg.senderId === userId || (isSeller && isBot);
          return (
            <div key={msg.id ?? i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] space-y-1">
                {!isMe && (
                  <p className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                    {isBot && <Bot className="size-3" />}
                    {msg.senderName}
                  </p>
                )}
                {isMe && isBot && (
                  <p className="text-xs text-muted-foreground px-1 flex items-center justify-end gap-1">
                    <Bot className="size-3" /> AI Assistant
                  </p>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  isBot
                    ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 " + (isSeller ? "rounded-br-sm" : "rounded-bl-sm")
                    : isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                <p className="text-[10px] text-muted-foreground px-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Human typing indicator */}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="text-xs text-muted-foreground">{typingUser} is typing</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI typing indicator */}
        {aiTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <Bot className="size-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">AI Assistant is typing</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 rounded-full bg-blue-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t mt-3">
        {isSeller && (
          <button
            onClick={aiDisabled ? sendHandback : sendTakeover}
            title={aiDisabled ? "Hand back to AI" : "Take over from AI"}
            className={`flex items-center justify-center size-9 rounded-lg border transition-colors shrink-0 ${
              aiDisabled
                ? "bg-green-50 border-green-300 text-green-600 hover:bg-green-100"
                : "bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100"
            }`}
          >
            {aiDisabled ? <UserCheck className="size-4" /> : <Bot className="size-4" />}
          </button>
        )}
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => { setInput(e.target.value); sendTyping(); }}
          onKeyDown={handleKeyDown}
          disabled={!connected}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!connected || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
      <ChatRoom />
    </Suspense>
  );
}
