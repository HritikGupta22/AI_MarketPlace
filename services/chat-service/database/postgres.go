package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	var err error
	connStr := os.Getenv("DIRECT_URL")
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatal("Database unreachable:", err)
	}
	log.Println("✅ Database connected")
}
