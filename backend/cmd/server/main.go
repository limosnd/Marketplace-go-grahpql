package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/limosnd/marketplace-go-graphql/internal/database"
	"github.com/limosnd/marketplace-go-graphql/internal/resolvers"
	"github.com/limosnd/marketplace-go-graphql/schemas"
)

func main() {
	// Conectar a MongoDB
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Disconnect()

	// Configurar GraphQL
	resolver := &resolvers.Resolver{DB: db}
	srv := handler.NewDefaultServer(schemas.NewExecutableSchema(schemas.Config{Resolvers: resolver}))

	// Configurar Gin
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.Status(200)
			return
		}
		c.Next()
	})

	// GraphQL endpoints
	r.POST("/query", gin.WrapH(srv))
	r.GET("/playground", gin.WrapH(playground.Handler("GraphQL playground", "/query")))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("GraphQL playground: http://localhost:%s/playground", port)
	
	log.Fatal(http.ListenAndServe(":"+port, r))
}