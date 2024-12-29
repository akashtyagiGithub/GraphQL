import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
    token: String
  }

  type Query {
    hello: String
    getUser(id: ID!): User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): User
  }
`);

export default schema;
