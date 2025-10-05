package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	client   *mongo.Client
	database *mongo.Database
)

// Connect establishes connection to MongoDB
func Connect() (*mongo.Database, error) {
	// Get MongoDB URI from environment variable or use default
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	// Get database name from environment variable or use default
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "marketplace"
	}

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Check the connection
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	database = client.Database(dbName)
	log.Println("Connected to MongoDB!")

	// Create indexes
	if err := createIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to create indexes: %v", err)
	}

	return database, nil
}

// Disconnect closes the MongoDB connection
func Disconnect() {
	if client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := client.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		} else {
			log.Println("Disconnected from MongoDB!")
		}
	}
}

// GetDatabase returns the database instance
func GetDatabase() *mongo.Database {
	return database
}

// GetCollection returns a collection from the database
func GetCollection(name string) *mongo.Collection {
	if database == nil {
		log.Fatal("Database not initialized. Call Connect() first.")
	}
	return database.Collection(name)
}

// createIndexes creates necessary indexes for the collections
func createIndexes(ctx context.Context) error {
	// Create index for cars collection
	carsCollection := GetCollection("cars")
	
	// Index for text search
	textIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"title":       "text",
			"description": "text",
			"brand":       "text",
			"model":       "text",
		},
	}
	
	// Index for filtering
	filterIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"brand":        1,
			"model":        1,
			"year":         1,
			"price":        1,
			"fuelType":     1,
			"transmission": 1,
			"status":       1,
		},
	}

	// Index for location
	locationIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"location.city":    1,
			"location.state":   1,
			"location.country": 1,
		},
	}

	indexModels := []mongo.IndexModel{textIndexModel, filterIndexModel, locationIndexModel}
	
	_, err := carsCollection.Indexes().CreateMany(ctx, indexModels)
	if err != nil {
		return fmt.Errorf("failed to create indexes for cars collection: %v", err)
	}

	log.Println("Database indexes created successfully!")
	return nil
}
