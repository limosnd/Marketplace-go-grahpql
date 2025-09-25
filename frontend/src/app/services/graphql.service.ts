import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  constructor(private apollo: Apollo, private httpLink: HttpLink) {
    this.configureApollo();
  }

  private configureApollo() {
    const uri = 'http://localhost:8080/query';
    
    this.apollo.create({
      link: this.httpLink.create({ uri }),
      cache: new InMemoryCache()
    });
  }
}