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
  type: "message" | "typing" | "stop_typing" | "history";
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  messages?: ChatMessage[];
};

const CHAT_SERVER = process.env.NEXT_PUBLIC_CHAT_SERVER_URL ?? "ws://localhost:8080";

export function useChat(roomId: string, userId: string, userName: string) {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
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
      }
    };

    return () => ws.current?.close();
  }, [roomId, userId, userName]);

  const sendMessage = useCallback((content: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({
      type: "message",
      roomId,
      senderId: userId,
      senderName: userName,
      content,
    }));
  }, [roomId, userId, userName]);

  const sendTyping = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "typing", roomId, senderId: userId, senderName: userName }));
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      ws.current?.send(JSON.stringify({ type: "stop_typing", roomId, senderId: userId, senderName: userName }));
    }, 2000);
  }, [roomId, userId, userName]);

  return { messages, connected, typingUser, sendMessage, sendTyping };
}
