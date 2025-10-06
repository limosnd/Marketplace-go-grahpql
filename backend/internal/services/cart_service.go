package services

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/limosnd/marketplace-go-graphql/internal/database"
	"github.com/limosnd/marketplace-go-graphql/internal/models"
)

type CartService struct {
	collection    *mongo.Collection
	carService    *CarService
}

// NewCartService creates a new cart service
func NewCartService() *CartService {
	return &CartService{
		collection: database.GetCollection("cart_items"),
		carService: NewCarService(),
	}
}

// GetUserCart retrieves the user's cart
func (s *CartService) GetUserCart(ctx context.Context, userID string) (*models.Cart, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	// Find all cart items for the user
	cursor, err := s.collection.Find(ctx, bson.M{"userId": objectID})
	if err != nil {
		return nil, fmt.Errorf("failed to find cart items: %v", err)
	}
	defer cursor.Close(ctx)

	var items []models.CartItem
	var total float64

	for cursor.Next(ctx) {
		var item models.CartItem
		if err := cursor.Decode(&item); err != nil {
			return nil, fmt.Errorf("failed to decode cart item: %v", err)
		}

		// Get car details
		car, err := s.carService.GetCarByID(ctx, item.CarID.Hex())
		if err != nil {
			continue // Skip if car not found
		}
		
		item.Car = car
		total += car.Price * float64(item.Quantity)
		items = append(items, item)
	}

	cart := &models.Cart{
		ID:     primitive.NewObjectID(),
		UserID: objectID,
		Items:  items,
		Total:  total,
	}

	return cart, nil
}

// AddToCart adds an item to the user's cart
func (s *CartService) AddToCart(ctx context.Context, userID, carID string, quantity int) (*models.Cart, error) {
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	carObjectID, err := primitive.ObjectIDFromHex(carID)
	if err != nil {
		return nil, fmt.Errorf("invalid car ID: %v", err)
	}

	// Check if item already exists in cart
	existingItem := &models.CartItem{}
	err = s.collection.FindOne(ctx, bson.M{
		"userId": userObjectID,
		"carId":  carObjectID,
	}).Decode(existingItem)

	if err == nil {
		// Update quantity if item exists
		_, err = s.collection.UpdateOne(
			ctx,
			bson.M{"_id": existingItem.ID},
			bson.M{"$set": bson.M{"quantity": existingItem.Quantity + quantity}},
		)
		if err != nil {
			return nil, fmt.Errorf("failed to update cart item: %v", err)
		}
	} else if err == mongo.ErrNoDocuments {
		// Create new cart item
		newItem := &models.CartItem{
			ID:       primitive.NewObjectID(),
			UserID:   userObjectID,
			CarID:    carObjectID,
			Quantity: quantity,
			AddedAt:  time.Now(),
		}

		_, err = s.collection.InsertOne(ctx, newItem)
		if err != nil {
			return nil, fmt.Errorf("failed to add item to cart: %v", err)
		}
	} else {
		return nil, fmt.Errorf("failed to check existing cart item: %v", err)
	}

	return s.GetUserCart(ctx, userID)
}

// RemoveFromCart removes an item from the user's cart
func (s *CartService) RemoveFromCart(ctx context.Context, userID, carID string) (*models.Cart, error) {
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	carObjectID, err := primitive.ObjectIDFromHex(carID)
	if err != nil {
		return nil, fmt.Errorf("invalid car ID: %v", err)
	}

	_, err = s.collection.DeleteOne(ctx, bson.M{
		"userId": userObjectID,
		"carId":  carObjectID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to remove item from cart: %v", err)
	}

	return s.GetUserCart(ctx, userID)
}

// ClearCart removes all items from the user's cart
func (s *CartService) ClearCart(ctx context.Context, userID string) error {
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %v", err)
	}

	_, err = s.collection.DeleteMany(ctx, bson.M{"userId": userObjectID})
	if err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}

	return nil
}
