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
    brands: [Owner]
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
`;

module.exports = typeDefs;
