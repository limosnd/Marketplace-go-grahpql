package services

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/limosnd/marketplace-go-graphql/internal/database"
	"github.com/limosnd/marketplace-go-graphql/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CarService struct {
	collection *mongo.Collection
}

// NewCarService creates a new car service
func NewCarService() *CarService {
	return &CarService{
		collection: database.GetCollection("cars"),
	}
}

// GetCars retrieves cars with pagination and filtering
func (s *CarService) GetCars(ctx context.Context, filter *CarFilterInput, page, limit int) (*CarsResponse, error) {
	// Build MongoDB filter
	mongoFilter := bson.M{}
	
	if filter != nil {
		if filter.Brand != nil {
			mongoFilter["brand"] = bson.M{"$regex": primitive.Regex{Pattern: *filter.Brand, Options: "i"}}
		}
		if filter.Model != nil {
			mongoFilter["model"] = bson.M{"$regex": primitive.Regex{Pattern: *filter.Model, Options: "i"}}
		}
		if filter.MinYear != nil {
			mongoFilter["year"] = bson.M{"$gte": *filter.MinYear}
		}
		if filter.MaxYear != nil {
			if mongoFilter["year"] == nil {
				mongoFilter["year"] = bson.M{}
			}
			mongoFilter["year"].(bson.M)["$lte"] = *filter.MaxYear
		}
		if filter.MinPrice != nil {
			mongoFilter["price"] = bson.M{"$gte": *filter.MinPrice}
		}
		if filter.MaxPrice != nil {
			if mongoFilter["price"] == nil {
				mongoFilter["price"] = bson.M{}
			}
			mongoFilter["price"].(bson.M)["$lte"] = *filter.MaxPrice
		}
		if filter.FuelType != nil {
			mongoFilter["fuelType"] = string(*filter.FuelType)
		}
		if filter.Transmission != nil {
			mongoFilter["transmission"] = string(*filter.Transmission)
		}
		if filter.City != nil {
			mongoFilter["location.city"] = bson.M{"$regex": primitive.Regex{Pattern: *filter.City, Options: "i"}}
		}
		if filter.State != nil {
			mongoFilter["location.state"] = bson.M{"$regex": primitive.Regex{Pattern: *filter.State, Options: "i"}}
		}
	}

	// Only show available cars by default
	mongoFilter["status"] = string(models.CarStatusAvailable)

	// Calculate skip
	skip := (page - 1) * limit

	// Get total count
	total, err := s.collection.CountDocuments(ctx, mongoFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to count cars: %v", err)
	}

	// Find cars with pagination
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.D{{Key: "createdAt", Value: -1}}) // Sort by newest first

	cursor, err := s.collection.Find(ctx, mongoFilter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to find cars: %v", err)
	}
	defer cursor.Close(ctx)

	var cars []*models.Car
	if err = cursor.All(ctx, &cars); err != nil {
		return nil, fmt.Errorf("failed to decode cars: %v", err)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &CarsResponse{
		Cars:       cars,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetCarByID retrieves a car by its ID
func (s *CarService) GetCarByID(ctx context.Context, id string) (*models.Car, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid car ID: %v", err)
	}

	var car models.Car
	err = s.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&car)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("car not found")
		}
		return nil, fmt.Errorf("failed to find car: %v", err)
	}

	return &car, nil
}

// CreateCar creates a new car
func (s *CarService) CreateCar(ctx context.Context, input *CarInput) (*models.Car, error) {
	now := time.Now()

	// Create seller user
	seller := models.User{
		ID:        primitive.NewObjectID(),
		Name:      input.SellerName,
		Email:     input.SellerEmail,
		Phone:     &input.SellerPhone,
		Role:      models.UserRoleSeller,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Create location
	location := models.Location{
		City:    input.Location.City,
		State:   input.Location.State,
		Country: input.Location.Country,
		Lat:     input.Location.Lat,
		Lng:     input.Location.Lng,
	}

	// Create car
	car := models.Car{
		ID:           primitive.NewObjectID(),
		Title:        input.Title,
		Description:  input.Description,
		Brand:        input.Brand,
		Model:        input.Model,
		Year:         input.Year,
		Price:        input.Price,
		Mileage:      input.Mileage,
		Color:        input.Color,
		FuelType:     models.FuelType(input.FuelType),
		Transmission: models.TransmissionType(input.Transmission),
		Status:       models.CarStatusAvailable,
		Images:       input.Images,
		Seller:       seller,
		Location:     location,
		Features:     input.Features,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	// Insert into database
	result, err := s.collection.InsertOne(ctx, car)
	if err != nil {
		return nil, fmt.Errorf("failed to create car: %v", err)
	}

	// Set the inserted ID
	car.ID = result.InsertedID.(primitive.ObjectID)

	log.Printf("Created new car: %s", car.Title)
	return &car, nil
}

// UpdateCar updates an existing car
func (s *CarService) UpdateCar(ctx context.Context, input *UpdateCarInput) (*models.Car, error) {
	objectID, err := primitive.ObjectIDFromHex(input.ID)
	if err != nil {
		return nil, fmt.Errorf("invalid car ID: %v", err)
	}

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	if input.Title != nil {
		update["$set"].(bson.M)["title"] = *input.Title
	}
	if input.Description != nil {
		update["$set"].(bson.M)["description"] = *input.Description
	}
	if input.Brand != nil {
		update["$set"].(bson.M)["brand"] = *input.Brand
	}
	if input.Model != nil {
		update["$set"].(bson.M)["model"] = *input.Model
	}
	if input.Year != nil {
		update["$set"].(bson.M)["year"] = *input.Year
	}
	if input.Price != nil {
		update["$set"].(bson.M)["price"] = *input.Price
	}
	if input.Mileage != nil {
		update["$set"].(bson.M)["mileage"] = *input.Mileage
	}
	if input.Color != nil {
		update["$set"].(bson.M)["color"] = *input.Color
	}
	if input.FuelType != nil {
		update["$set"].(bson.M)["fuelType"] = string(*input.FuelType)
	}
	if input.Transmission != nil {
		update["$set"].(bson.M)["transmission"] = string(*input.Transmission)
	}
	if input.Status != nil {
		update["$set"].(bson.M)["status"] = string(*input.Status)
	}
	if input.Images != nil {
		update["$set"].(bson.M)["images"] = input.Images
	}
	if input.Features != nil {
		update["$set"].(bson.M)["features"] = input.Features
	}
	if input.Location != nil {
		location := models.Location{
			City:    input.Location.City,
			State:   input.Location.State,
			Country: input.Location.Country,
			Lat:     input.Location.Lat,
			Lng:     input.Location.Lng,
		}
		update["$set"].(bson.M)["location"] = location
	}

	// Update the car
	_, err = s.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update car: %v", err)
	}

	// Return updated car
	return s.GetCarByID(ctx, input.ID)
}

// DeleteCar deletes a car by ID
func (s *CarService) DeleteCar(ctx context.Context, id string) (bool, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return false, fmt.Errorf("invalid car ID: %v", err)
	}

	result, err := s.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return false, fmt.Errorf("failed to delete car: %v", err)
	}

	return result.DeletedCount > 0, nil
}

// SearchCars searches cars by text
func (s *CarService) SearchCars(ctx context.Context, query string, page, limit int) (*CarsResponse, error) {
	// Build text search filter
	mongoFilter := bson.M{
		"$text": bson.M{"$search": query},
		"status": string(models.CarStatusAvailable),
	}

	// Calculate skip
	skip := (page - 1) * limit

	// Get total count
	total, err := s.collection.CountDocuments(ctx, mongoFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to count cars: %v", err)
	}

	// Find cars with pagination
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.D{{Key: "score", Value: bson.M{"$meta": "textScore"}}}) // Sort by relevance

	cursor, err := s.collection.Find(ctx, mongoFilter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to search cars: %v", err)
	}
	defer cursor.Close(ctx)

	var cars []*models.Car
	if err = cursor.All(ctx, &cars); err != nil {
		return nil, fmt.Errorf("failed to decode cars: %v", err)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &CarsResponse{
		Cars:       cars,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// Input and Response types for the service

type CarFilterInput struct {
	Brand        *string                   `json:"brand"`
	Model        *string                   `json:"model"`
	MinYear      *int                      `json:"minYear"`
	MaxYear      *int                      `json:"maxYear"`
	MinPrice     *float64                  `json:"minPrice"`
	MaxPrice     *float64                  `json:"maxPrice"`
	MinMileage   *int                      `json:"minMileage"`
	MaxMileage   *int                      `json:"maxMileage"`
	FuelType     *models.FuelType          `json:"fuelType"`
	Transmission *models.TransmissionType  `json:"transmission"`
	City         *string                   `json:"city"`
	State        *string                   `json:"state"`
}

type LocationInput struct {
	City    string   `json:"city"`
	State   string   `json:"state"`
	Country string   `json:"country"`
	Lat     *float64 `json:"lat"`
	Lng     *float64 `json:"lng"`
}

type CarInput struct {
	Title        string                   `json:"title"`
	Description  string                   `json:"description"`
	Brand        string                   `json:"brand"`
	Model        string                   `json:"model"`
	Year         int                      `json:"year"`
	Price        float64                  `json:"price"`
	Mileage      int                      `json:"mileage"`
	Color        string                   `json:"color"`
	FuelType     models.FuelType          `json:"fuelType"`
	Transmission models.TransmissionType  `json:"transmission"`
	Images       []string                 `json:"images"`
	Location     LocationInput            `json:"location"`
	Features     []string                 `json:"features"`
	SellerName   string                   `json:"sellerName"`
	SellerEmail  string                   `json:"sellerEmail"`
	SellerPhone  string                   `json:"sellerPhone"`
}

type UpdateCarInput struct {
	ID           string                    `json:"id"`
	Title        *string                   `json:"title"`
	Description  *string                   `json:"description"`
	Brand        *string                   `json:"brand"`
	Model        *string                   `json:"model"`
	Year         *int                      `json:"year"`
	Price        *float64                  `json:"price"`
	Mileage      *int                      `json:"mileage"`
	Color        *string                   `json:"color"`
	FuelType     *models.FuelType          `json:"fuelType"`
	Transmission *models.TransmissionType  `json:"transmission"`
	Status       *models.CarStatus         `json:"status"`
	Images       []string                  `json:"images"`
	Location     *LocationInput            `json:"location"`
	Features     []string                  `json:"features"`
}

type CarsResponse struct {
	Cars       []*models.Car `json:"cars"`
	Total      int           `json:"total"`
	Page       int           `json:"page"`
	Limit      int           `json:"limit"`
	TotalPages int           `json:"totalPages"`
}
