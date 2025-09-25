import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, User, CreateProductInput, CreateUserInput } from '../models/marketplace.model';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      imageUrl
      category
      sellerId
      createdAt
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      createdAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
      createdAt
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      imageUrl
      category
      sellerId
      createdAt
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  constructor(private apollo: Apollo) {}

  getProducts(): Observable<Product[]> {
    return this.apollo.watchQuery<{products: Product[]}>({
      query: GET_PRODUCTS
    }).valueChanges.pipe(
      map(result => result.data.products)
    );
  }

  getUsers(): Observable<User[]> {
    return this.apollo.watchQuery<{users: User[]}>({
      query: GET_USERS
    }).valueChanges.pipe(
      map(result => result.data.users)
    );
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.apollo.mutate<{createUser: User}>({
      mutation: CREATE_USER,
      variables: { input },
      refetchQueries: [{ query: GET_USERS }]
    }).pipe(
      map(result => result.data!.createUser)
    );
  }

  createProduct(input: CreateProductInput): Observable<Product> {
    return this.apollo.mutate<{createProduct: Product}>({
      mutation: CREATE_PRODUCT,
      variables: { input },
      refetchQueries: [{ query: GET_PRODUCTS }]
    }).pipe(
      map(result => result.data!.createProduct)
    );
  }
}