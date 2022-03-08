const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Owner {
    _id: ID!
    type: UserType
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    avatar: String
    website: String
    socials: [SocialMedia]
    brandName: String!
    products: [Product]
    campaigns: [Campaign]
    affiliates: [Affiliate]
  }
  type Affiliate {
    _id: ID!
    type: UserType
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    avatar: String
    website: String
    socials: [SocialMedia]
    posts: [Post]
    looks: [Look]
  }
`;

module.exports = typeDefs;
