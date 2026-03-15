package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/HritikGupta22/AI_MarketPlace/chat-service/models"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (restrict in production)
	},
}

// GET /ws?roomId=xxx&userId=xxx&userName=xxx
func ServeWS(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("roomId")
	userID := r.URL.Query().Get("userId")
	userName := r.URL.Query().Get("userName")

	if roomID == "" || userID == "" {
		http.Error(w, "roomId and userId required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	client := &Client{
		ID:     userID,
		Name:   userName,
		RoomID: roomID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	GlobalHub.register <- client

	// Send chat history on connect
	history := GetHistory(roomID)
	if len(history) > 0 {
		historyMsg, _ := json.Marshal(models.WSMessage{
			Type:     "history",
			RoomID:   roomID,
			Messages: history,
		})
		client.Send <- historyMsg
	}

	go client.WritePump()
	go client.ReadPump(GlobalHub)
}

// GET /health
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
