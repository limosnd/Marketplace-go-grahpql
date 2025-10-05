import { inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

export function provideApollo() {
  const apollo = inject(Apollo);
  const httpLink = inject(HttpLink);

  apollo.create({
    link: httpLink.create({
      uri: 'http://localhost:8080/query',
    }),
    cache: new InMemoryCache(),
  });
}
