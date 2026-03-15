package handlers

import (
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/HritikGupta22/AI_MarketPlace/chat-service/database"
	"github.com/HritikGupta22/AI_MarketPlace/chat-service/models"
	"github.com/gorilla/websocket"
)

type Client struct {
	ID     string
	Name   string
	RoomID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	rooms      map[string]map[*Client]bool
	aiDisabled map[string]bool
	broadcast  chan *RoomMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type RoomMessage struct {
	RoomID  string
	Message []byte
}

var GlobalHub = NewHub()

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		aiDisabled: make(map[string]bool),
		broadcast:  make(chan *RoomMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.RoomID] == nil {
				h.rooms[client.RoomID] = make(map[*Client]bool)
			}
			h.rooms[client.RoomID][client] = true
			h.mu.Unlock()
			log.Printf("Client %s joined room %s", client.ID, client.RoomID)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.RoomID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.rooms, client.RoomID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Client %s left room %s", client.ID, client.RoomID)

		case msg := <-h.broadcast:
			h.mu.RLock()
			clients := h.rooms[msg.RoomID]
			h.mu.RUnlock()
			for client := range clients {
				select {
				case client.Send <- msg.Message:
				default:
					close(client.Send)
					h.mu.Lock()
					delete(h.rooms[msg.RoomID], client)
					h.mu.Unlock()
				}
			}
		}
	}
}

func (c *Client) ReadPump(h *Hub) {
	defer func() {
		h.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(4096)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, msgBytes, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var wsMsg models.WSMessage
		if err := json.Unmarshal(msgBytes, &wsMsg); err != nil {
			continue
		}

		switch wsMsg.Type {
		case "message":
			var response []byte
			if wsMsg.SenderID == "ai-bot" {
				// Check if seller has taken over
				h.mu.RLock()
				disabled := h.aiDisabled[c.RoomID]
				h.mu.RUnlock()
				if disabled {
					break // drop bot message silently
				}
				// Bot message — save with sellerId as sender (parsed from roomId)
				parts := strings.Split(c.RoomID, "_") // buyerId_sellerId_productId
				sellerID := ""
				if len(parts) >= 2 {
					sellerID = parts[1]
				}
				savedMsg := saveMessage(wsMsg.RoomID, sellerID, "AI Assistant", wsMsg.Content)
				savedMsg.SenderID = "ai-bot" // keep ai-bot id for frontend rendering
				savedMsg.SenderName = "AI Assistant"
				response, _ = json.Marshal(models.WSMessage{
					Type:       "message",
					RoomID:     wsMsg.RoomID,
					SenderID:   "ai-bot",
					SenderName: "AI Assistant",
					Content:    wsMsg.Content,
					Messages:   []models.Message{savedMsg},
				})
			} else {
				// Regular message — save to DB
				savedMsg := saveMessage(wsMsg.RoomID, c.ID, c.Name, wsMsg.Content)
				response, _ = json.Marshal(models.WSMessage{
					Type:       "message",
					RoomID:     wsMsg.RoomID,
					SenderID:   c.ID,
					SenderName: c.Name,
					Content:    wsMsg.Content,
					Messages:   []models.Message{savedMsg},
				})
			}
			h.broadcast <- &RoomMessage{RoomID: c.RoomID, Message: response}

		case "typing", "stop_typing":
			response, _ := json.Marshal(models.WSMessage{
				Type:       wsMsg.Type,
				RoomID:     c.RoomID,
				SenderID:   c.ID,
				SenderName: c.Name,
			})
			h.broadcast <- &RoomMessage{RoomID: c.RoomID, Message: response}

		case "takeover":
			h.mu.Lock()
			h.aiDisabled[c.RoomID] = true
			h.mu.Unlock()
			response, _ := json.Marshal(models.WSMessage{
				Type:   "ai_disabled",
				RoomID: c.RoomID,
			})
			h.broadcast <- &RoomMessage{RoomID: c.RoomID, Message: response}
			log.Printf("Seller took over room %s — AI disabled", c.RoomID)

		case "handback":
			h.mu.Lock()
			h.aiDisabled[c.RoomID] = false
			h.mu.Unlock()
			response, _ := json.Marshal(models.WSMessage{
				Type:   "ai_enabled",
				RoomID: c.RoomID,
			})
			h.broadcast <- &RoomMessage{RoomID: c.RoomID, Message: response}
			log.Printf("Seller handed back room %s — AI enabled", c.RoomID)
		}
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Conn.WriteMessage(websocket.TextMessage, msg)

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func saveMessage(roomID, senderID, senderName, content string) models.Message {
	msg := models.Message{
		RoomID:     roomID,
		SenderID:   senderID,
		SenderName: senderName,
		Content:    content,
		CreatedAt:  time.Now(),
	}

	parts := strings.Split(roomID, "_") // buyerId_sellerId_productId
	receiverID := parts[0]
	if len(parts) >= 2 && senderID == parts[0] {
		receiverID = parts[1]
	}

	row := database.DB.QueryRow(
		`INSERT INTO "Message" (id, content, "roomId", "senderId", "senderName", "receiverId", "createdAt")
		 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())
		 RETURNING id`,
		content, roomID, senderID, senderName, receiverID,
	)
	row.Scan(&msg.ID)
	return msg
}

func GetHistory(roomID string) []models.Message {
	rows, err := database.DB.Query(
		`SELECT id, content, "senderId", "senderName", "createdAt" FROM "Message"
		 WHERE "roomId" = $1
		 ORDER BY "createdAt" ASC LIMIT 50`,
		roomID,
	)
	if err != nil {
		return []models.Message{}
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var m models.Message
		rows.Scan(&m.ID, &m.Content, &m.SenderID, &m.SenderName, &m.CreatedAt)
		// Restore ai-bot senderId for messages saved as AI Assistant
		if m.SenderName == "AI Assistant" {
			m.SenderID = "ai-bot"
		}
		messages = append(messages, m)
	}
	return messages
}
