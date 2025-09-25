# Marketplace-go-grahpql

A full-stack marketplace application built with Go/Golang backend using GraphQL and Angular frontend.

## Architecture

- **Backend**: Go/Golang with GraphQL (using gqlgen)
- **Frontend**: Angular 18 with Apollo GraphQL Client
- **Communication**: GraphQL API over HTTP
- **Style**: Client-Server Web Service Architecture

## Technologies Used

### Backend
- Go 1.21
- GraphQL (gqlgen)
- gorilla/mux for HTTP routing
- CORS support for cross-origin requests
- In-memory storage for simplicity

### Frontend
- Angular 18
- Apollo GraphQL Client
- TypeScript
- CSS for styling
- Standalone components

## Features

✅ **User Management**
- Create users with username and email
- View all users
- User validation

✅ **Product Catalog**
- Display products with name, description, price, category
- Create new products
- Category filtering support
- Product-seller relationships

✅ **GraphQL API**
- Complete CRUD operations
- Relationships between entities
- Type-safe queries and mutations

✅ **Modern Frontend**
- Responsive design
- Real-time updates via GraphQL subscriptions
- Form validation
- Navigation between views

## Screenshots

### Product Catalog
![Product Catalog](https://github.com/user-attachments/assets/bf0245eb-eae8-43a4-826c-6efcf82fafe5)

### User Management
![User Management](https://github.com/user-attachments/assets/c156b9a1-5560-4987-af3c-48393bc16279)

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- npm

### Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd Marketplace-go-grahpql
   ```

2. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

3. **Build and run the backend:**
   ```bash
   go run backend/main.go
   ```
   
   Or compile and run:
   ```bash
   go build -o marketplace backend/main.go
   ./marketplace
   ```

4. **Backend will be available at:**
   - GraphQL API: `http://localhost:8080/query`
   - GraphQL Playground: `http://localhost:8080/`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Frontend will be available at:**
   - Application: `http://localhost:4200/`

## API Usage

### GraphQL Queries

**Get all products:**
```graphql
query {
  products {
    id
    name
    description
    price
    category
    sellerId
    createdAt
  }
}
```

**Get all users:**
```graphql
query {
  users {
    id
    username
    email
    createdAt
  }
}
```

### GraphQL Mutations

**Create a user:**
```graphql
mutation {
  createUser(input: {
    username: "john_doe"
    email: "john@example.com"
  }) {
    id
    username
    email
    createdAt
  }
}
```

**Create a product:**
```graphql
mutation {
  createProduct(input: {
    name: "Laptop"
    description: "High performance laptop"
    price: 999.99
    category: "Electronics"
    sellerId: "1"
  }) {
    id
    name
    description
    price
    category
    sellerId
    createdAt
  }
}
```

## Testing the Application

1. **Start both servers** (backend on :8080, frontend on :4200)

2. **Create some test data:**
   - Use GraphQL Playground at `http://localhost:8080/` to create users and products
   - Or use the frontend forms to create users

3. **View the data:**
   - Navigate between Products and Users tabs in the frontend
   - See real-time updates as you create new entities

## Project Structure

```
Marketplace-go-grahpql/
├── backend/
│   ├── graph/
│   │   ├── generated/     # Generated GraphQL code
│   │   ├── model/         # GraphQL models
│   │   ├── schema.graphqls # GraphQL schema
│   │   ├── resolver.go    # Main resolver
│   │   └── schema.resolvers.go # Resolver implementations
│   └── main.go           # Backend entry point
├── frontend/
│   └── src/
│       └── app/
│           ├── components/    # Angular components
│           ├── models/       # TypeScript models
│           ├── services/     # GraphQL services
│           └── ...          # Angular app files
├── go.mod
├── go.sum
├── gqlgen.yml           # GraphQL generator config
└── README.md
```

## Development

### Adding New Features

1. **GraphQL Schema**: Update `backend/graph/schema.graphqls`
2. **Generate Code**: Run `gqlgen generate` 
3. **Implement Resolvers**: Add logic in `backend/graph/schema.resolvers.go`
4. **Frontend Models**: Update TypeScript interfaces in `frontend/src/app/models/`
5. **Services**: Add GraphQL queries/mutations in services
6. **Components**: Create/update Angular components

### Available Scripts

**Backend:**
- `go run backend/main.go` - Start development server
- `go build backend/main.go` - Build for production
- `gqlgen generate` - Regenerate GraphQL code

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Shopping cart functionality with persistence
- [ ] Order management system
- [ ] Product images upload
- [ ] Search and filtering
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time notifications
- [ ] Payment integration
- [ ] Admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).