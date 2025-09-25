package graph

import (
	"sync"
	"marketplace/backend/graph/model"
	"strconv"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	users     []*model.User
	products  []*model.Product
	cartItems []*model.CartItem
	orders    []*model.Order
	userMux   sync.RWMutex
	productMux sync.RWMutex
	cartMux   sync.RWMutex
	orderMux  sync.RWMutex
	idCounter int64
}

func (r *Resolver) NextID() string {
	r.idCounter++
	return strconv.FormatInt(r.idCounter, 10)
}

func (r *Resolver) GetUserByID(id string) *model.User {
	r.userMux.RLock()
	defer r.userMux.RUnlock()
	
	for _, user := range r.users {
		if user.ID == id {
			return user
		}
	}
	return nil
}

func (r *Resolver) GetProductByID(id string) *model.Product {
	r.productMux.RLock()
	defer r.productMux.RUnlock()
	
	for _, product := range r.products {
		if product.ID == id {
			return product
		}
	}
	return nil
}
