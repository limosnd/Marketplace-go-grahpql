package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Car represents a car in the marketplace
type Car struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title        string             `bson:"title" json:"title"`
	Description  string             `bson:"description" json:"description"`
	Brand        string             `bson:"brand" json:"brand"`
	Model        string             `bson:"model" json:"model"`
	Year         int                `bson:"year" json:"year"`
	Price        float64            `bson:"price" json:"price"`
	Mileage      int                `bson:"mileage" json:"mileage"`
	Color        string             `bson:"color" json:"color"`
	FuelType     FuelType           `bson:"fuelType" json:"fuelType"`
	Transmission TransmissionType   `bson:"transmission" json:"transmission"`
	Status       CarStatus          `bson:"status" json:"status"`
	Images       []string           `bson:"images" json:"images"`
	Seller       User               `bson:"seller" json:"seller"`
	Location     Location           `bson:"location" json:"location"`
	Features     []string           `bson:"features" json:"features"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// User represents a user in the system
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"` // Never return password in JSON
	Phone     *string            `bson:"phone,omitempty" json:"phone"`
	Avatar    *string            `bson:"avatar,omitempty" json:"avatar"`
	Role      UserRole           `bson:"role" json:"role"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// Location represents a geographical location
type Location struct {
	City    string   `bson:"city" json:"city"`
	State   string   `bson:"state" json:"state"`
	Country string   `bson:"country" json:"country"`
	Lat     *float64 `bson:"lat,omitempty" json:"lat"`
	Lng     *float64 `bson:"lng,omitempty" json:"lng"`
}

// FuelType represents the fuel type of a car
type FuelType string

const (
	FuelTypeGasoline FuelType = "GASOLINE"
	FuelTypeDiesel   FuelType = "DIESEL"
	FuelTypeElectric FuelType = "ELECTRIC"
	FuelTypeHybrid   FuelType = "HYBRID"
)

// TransmissionType represents the transmission type of a car
type TransmissionType string

const (
	TransmissionTypeManual    TransmissionType = "MANUAL"
	TransmissionTypeAutomatic TransmissionType = "AUTOMATIC"
)

// CarStatus represents the status of a car
type CarStatus string

const (
	CarStatusAvailable CarStatus = "AVAILABLE"
	CarStatusSold      CarStatus = "SOLD"
	CarStatusPending   CarStatus = "PENDING"
)

// UserRole represents the role of a user
type UserRole string

const (
	UserRoleBuyer  UserRole = "BUYER"
	UserRoleSeller UserRole = "SELLER"
	UserRoleAdmin  UserRole = "ADMIN"
)

// CartItem represents an item in a user's shopping cart
type CartItem struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID   primitive.ObjectID `bson:"userId" json:"userId"`
	CarID    primitive.ObjectID `bson:"carId" json:"carId"`
	Car      *Car               `bson:"car,omitempty" json:"car"`
	Quantity int                `bson:"quantity" json:"quantity"`
	AddedAt  time.Time          `bson:"addedAt" json:"addedAt"`
}

// Cart represents a user's shopping cart
type Cart struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID primitive.ObjectID `bson:"userId" json:"userId"`
	Items  []CartItem         `bson:"items" json:"items"`
	Total  float64            `bson:"total" json:"total"`
}

// LoginInput represents login credentials
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterInput represents registration data
type RegisterInput struct {
	Name     string  `json:"name"`
	Email    string  `json:"email"`
	Password string  `json:"password"`
	Phone    *string `json:"phone,omitempty"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}
