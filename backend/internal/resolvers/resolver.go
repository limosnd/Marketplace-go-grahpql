package resolvers

import (
	"go.mongodb.org/mongo-driver/mongo"
	"github.com/limosnd/marketplace-go-graphql/internal/services"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB          *mongo.Database
	CarService  *services.CarService
	UserService *services.UserService
	CartService *services.CartService
}

// NewResolver creates a new resolver with all necessary services
func NewResolver(db *mongo.Database) *Resolver {
	return &Resolver{
		DB:          db,
		CarService:  services.NewCarService(),
		UserService: services.NewUserService(),
		CartService: services.NewCartService(),
	}
}
