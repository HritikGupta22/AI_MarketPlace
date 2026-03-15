package models

import "time"

type Message struct {
	ID         string    `json:"id"`
	RoomID     string    `json:"roomId"`
	SenderID   string    `json:"senderId"`
	SenderName string    `json:"senderName"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"createdAt"`
}

type WSMessage struct {
	Type       string    `json:"type"` // "message" | "typing" | "stop_typing" | "history" | "takeover" | "ai_disabled"
	RoomID     string    `json:"roomId"`
	SenderID   string    `json:"senderId"`
	SenderName string    `json:"senderName"`
	Content    string    `json:"content"`
	Messages   []Message `json:"messages,omitempty"`
}
