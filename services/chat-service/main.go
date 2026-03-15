package main

import (
	"log"
	"net/http"
	"os"

	"github.com/HritikGupta22/AI_MarketPlace/chat-service/database"
	"github.com/HritikGupta22/AI_MarketPlace/chat-service/handlers"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect DB
	database.Connect()

	// Start hub
	go handlers.GlobalHub.Run()

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handlers.ServeWS)
	mux.HandleFunc("/health", handlers.HealthCheck)

	// CORS middleware
	handler := corsMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Chat server running on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server error:", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
