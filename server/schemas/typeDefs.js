const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String!
    avatar: String
    website: String
    socials: [SocialMedia]
  }
  type Owner {
    _id: ID!
    brand: Brand
    products: [Product]
    campaigns: [Campaign]
  }
  type Affiliate {
    _id: ID!
    posts: [Post]
    looks: [Look]
    brands: [Brand]
  }
  type Brand {
    _id: ID!
    name: String!
    website: String
    logo: String
    owner: Owner
    socials: [SocialMedia]
    affiliates: [Affiliate]
  }
  type SocialMedia {
    _id: ID!
    type: MediaTypes
    userName: String!
    link: String!
  }
  enum MediaTypes {
    FACEBOOK
    INSTAGRAM
    TWITTER
    TIKTOK
    YOUTUBE
    OTHER
  }
  type Product {
    _id: ID!
    name: String!
    description: String
    link: String
    ads: [Ad]
    looks: [Look]
  }
  type Ad {
    _id: ID!
    title: String!
    description: String
    image: String
    product: Product
  }
  type Campaign {
    _id: ID!
    title: String!
    description: String!
    image: String
    posts: [Post]
  }
  type Post {
    _id: ID!
    title: String!
    description: String
    link: String
  }
  type Look {
    _id: ID!
    title: String!
    description: String
    image: String
    link: String
  }
  type Auth {
      token: ID!
      user: User
  }
  type Query {
      me: User
  }
  type Mutation {
      addOwner(newOwner: ): Auth
  } 
`;

module.exports = typeDefs;
