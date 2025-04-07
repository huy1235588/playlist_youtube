import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_SERVER_URL + '/graphql', // Update this with your GraphQL server URL
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default client; 