"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type WSMessage = {
  type: "message" | "typing" | "stop_typing" | "history" | "ai_disabled" | "ai_enabled";
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  messages?: ChatMessage[];
};

type ProductContext = {
  productTitle: string;
  productPrice: string;
  productDescription: string;
};

const CHAT_SERVER = process.env.NEXT_PUBLIC_CHAT_SERVER_URL ?? "ws://localhost:8080";
const BOT_ID = "ai-bot";
const BOT_NAME = "AI Assistant";

export function useChat(
  roomId: string,
  userId: string,
  userName: string,
  productContext?: ProductContext
) {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiDisabled, setAiDisabled] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!roomId || !userId) return;

    const url = `${CHAT_SERVER}/ws?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(userName)}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => setConnected(true);
    ws.current.onclose = () => setConnected(false);

    ws.current.onmessage = (event) => {
      const data: WSMessage = JSON.parse(event.data);

      switch (data.type) {
        case "history":
          setMessages(data.messages ?? []);
          break;
        case "message":
          if (data.messages?.[0]) {
            setMessages((prev) => [...prev, data.messages![0]]);
          }
          break;
        case "typing":
          if (data.senderId !== userId) setTypingUser(data.senderName);
          break;
        case "stop_typing":
          if (data.senderId !== userId) setTypingUser(null);
          break;
        case "ai_disabled":
          setAiDisabled(true);
          break;
        case "ai_enabled":
          setAiDisabled(false);
          break;
      }
    };

    return () => ws.current?.close();
  }, [roomId, userId, userName]);

  const sendBotMessage = useCallback((content: string) => {
    // Send AI reply through WebSocket so seller sees it too
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "message",
        roomId,
        senderId: BOT_ID,
        senderName: BOT_NAME,
        content,
      }));
    }
  }, [roomId]);

  const triggerAIReply = useCallback(async (userMessage: string) => {
    if (!productContext || aiDisabled) return;
    setAiTyping(true);
    try {
      const res = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          productTitle: productContext.productTitle,
          productPrice: productContext.productPrice,
          productDescription: productContext.productDescription,
        }),
      });
      const data = await res.json();
      if (data.reply) sendBotMessage(data.reply);
      else {
        console.error("[AI Reply Error]", data.error);
        sendBotMessage("I'll get back to you shortly!");
      }
    } catch (err) {
      console.error("[AI Fetch Error]", err);
      sendBotMessage("Sorry, I'm having trouble responding right now.");
    } finally {
      setAiTyping(false);
    }
  }, [productContext, sendBotMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({
      type: "message",
      roomId,
      senderId: userId,
      senderName: userName,
      content,
    }));
    // Trigger AI reply only for buyers (not the seller/bot)
    triggerAIReply(content);
  }, [roomId, userId, userName, triggerAIReply]);

  const sendTyping = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "typing", roomId, senderId: userId, senderName: userName }));
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      ws.current?.send(JSON.stringify({ type: "stop_typing", roomId, senderId: userId, senderName: userName }));
    }, 2000);
  }, [roomId, userId, userName]);

  const sendTakeover = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "takeover", roomId, senderId: userId, senderName: userName }));
    setAiDisabled(true);
  }, [roomId, userId, userName]);

  const sendHandback = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "handback", roomId, senderId: userId, senderName: userName }));
    setAiDisabled(false);
  }, [roomId, userId, userName]);

  return { messages, connected, typingUser, aiTyping, aiDisabled, sendMessage, sendTyping, sendTakeover, sendHandback };
}
