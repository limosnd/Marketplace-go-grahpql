package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"github.com/limosnd/marketplace-go-graphql/internal/database"
	"github.com/limosnd/marketplace-go-graphql/internal/models"
)

type UserService struct {
	collection *mongo.Collection
}

// NewUserService creates a new user service
func NewUserService() *UserService {
	return &UserService{
		collection: database.GetCollection("users"),
	}
}

// Register creates a new user account
func (s *UserService) Register(ctx context.Context, input *models.RegisterInput) (*models.User, error) {
	// Check if user already exists
	existing := &models.User{}
	err := s.collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(existing)
	if err == nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	// Create user
	user := &models.User{
		ID:        primitive.NewObjectID(),
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Phone:     input.Phone,
		Role:      models.UserRoleBuyer,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = s.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	// Don't return password
	user.Password = ""
	return user, nil
}

// Login authenticates a user
func (s *UserService) Login(ctx context.Context, input *models.LoginInput) (*models.User, error) {
	user := &models.User{}
	err := s.collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("invalid email or password")
		}
		return nil, fmt.Errorf("failed to find user: %v", err)
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Don't return password
	user.Password = ""
	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	user := &models.User{}
	err = s.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %v", err)
	}

	// Don't return password
	user.Password = ""
	return user, nil
}

// UpdateUser updates user profile
func (s *UserService) UpdateUser(ctx context.Context, userID string, update bson.M) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	update["updatedAt"] = time.Now()

	_, err = s.collection.UpdateOne(
		ctx,
		bson.M{"_id": objectID},
		bson.M{"$set": update},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %v", err)
	}

	return s.GetUserByID(ctx, userID)
}
