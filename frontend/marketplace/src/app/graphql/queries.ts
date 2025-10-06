import { gql } from 'apollo-angular';

// Get all cars query
export const GET_CARS = gql`
  query GetCars($filter: CarFilterInput, $page: Int, $limit: Int) {
    cars(filter: $filter, page: $page, limit: $limit) {
      cars {
        id
        title
        description
        brand
        model
        year
        price
        mileage
        color
        fuelType
        transmission
        status
        images
        seller {
          id
          name
          email
          phone
        }
        location {
          city
          state
          country
          lat
          lng
        }
        features
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// Get single car query
export const GET_CAR = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      title
      description
      brand
      model
      year
      price
      mileage
      color
      fuelType
      transmission
      status
      images
      seller {
        id
        name
        email
        phone
      }
      location {
        city
        state
        country
        lat
        lng
      }
      features
      createdAt
      updatedAt
    }
  }
`;

// Create car mutation
export const CREATE_CAR = gql`
  mutation CreateCar($input: CarInput!) {
    createCar(input: $input) {
      id
      title
      description
      brand
      model
      year
      price
      mileage
      color
      fuelType
      transmission
      status
      images
      seller {
        id
        name
        email
        phone
      }
      location {
        city
        state
        country
        lat
        lng
      }
      features
      createdAt
      updatedAt
    }
  }
`;

// Delete car mutation
export const DELETE_CAR = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id)
  }
`;

// Update car mutation
export const UPDATE_CAR = gql`
  mutation UpdateCar($input: UpdateCarInput!) {
    updateCar(input: $input) {
      id
      title
      description
      brand
      model
      year
      price
      mileage
      color
      fuelType
      transmission
      status
      images
      seller {
        id
        name
        email
        phone
      }
      location {
        city
        state
        country
        lat
        lng
      }
      features
      createdAt
      updatedAt
    }
  }
`;

// Search cars query
export const SEARCH_CARS = gql`
  query SearchCars($query: String!, $page: Int, $limit: Int) {
    searchCars(query: $query, page: $page, limit: $limit) {
      cars {
        id
        title
        description
        brand
        model
        year
        price
        mileage
        color
        fuelType
        transmission
        status
        images
        seller {
          id
          name
          email
          phone
        }
        location {
          city
          state
          country
          lat
          lng
        }
        features
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// Get my publications query - uses current user from authentication context
export const GET_MY_CARS = gql`
  query GetMyCars($page: Int, $limit: Int) {
    cars(page: $page, limit: $limit) {
      cars {
        id
        title
        description
        brand
        model
        year
        price
        mileage
        color
        fuelType
        transmission
        status
        images
        seller {
          id
          name
          email
          phone
        }
        location {
          city
          state
          country
          lat
          lng
        }
        features
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// Health check query
export const HEALTH_CHECK = gql`
  query Health {
    health
  }
`;
