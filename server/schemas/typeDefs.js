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
    brands: [Brand]
  }
  type Owner {
    _id: ID!
    userId: String!
    brandId: String
    products: [Product]
    campaigns: [Campaign]
  }
  type Affiliate {
    _id: ID!
    user: String
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
    user: User
    brand: Brand
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
    brand: Brand
  }
  type Ad {
    _id: ID!
    title: String!
    description: String
    image: String
    product: Product
    brand: Brand
  }
  type Campaign {
    _id: ID!
    title: String!
    description: String!
    image: String
    posts: [Post]
    brand: Brand
  }
  type Post {
    _id: ID!
    title: String!
    description: String
    link: String
    brand: Brand
  }
  type Look {
    _id: ID!
    title: String!
    description: String
    image: String
    link: String
    brand: Brand
  }
  input InputUser {
    userId: String
    firstName: String
    lastName: String
    email: String
    password: String
    role: String
    avatar: String
    website: String
  }
  input InputBrand {
    brandId: String
    name: String
    website: String
    logo: String
  }
  input InputSocial {
    socialId: String
    type: String
    userName: String
    link: String
    userId: String
    brandId: String
  }
  input InputAffiliate {
    affiliateId: String
    userId: String
  }
  input InputProduct {
    productId: String
    name: String
    description: String
    link: String
    brandId: String
  }
  type Auth {
    token: ID!
    user: User
  }
  type Query {
    me: User
    myBrands: [Brand]
    brand(_id: ID!): Brand
    owner(_id: ID!): Owner
    affiliate(_id: ID!): Affiliate
    mySocialMedia: [SocialMedia]
    product(_id: ID!): Product
    ad(_id: ID!): Ad
    campaign(_id: ID!): Campaign
    post(_id: ID!): Post
    look(_id: ID!): Look
  }
  type Mutation {
    addUser(newUser: InputUser!): Auth
    login(email: String!, password: String!): Auth
    updateUser(userInput: InputUser!): User
    deleteUser(password: String!): User
    addBrand(brandInputs: InputBrand!): Brand
    updateBrandName(brandId: ID!, name: String!): Brand
    updateBrandWebsite(brandId: ID!, website: String!): Brand
    updateBrandLogo(brandId: ID!, logo: String!): Brand
    addAffiliateToBrand(brandId: ID!, affiliateInputs: InputAffiliate!): Brand
    deleteAffiliateFromBrand(
      brandId: ID!
      affiliateInputs: InputAffiliate!
    ): Brand
    deleteBrand(brandId: ID!): Brand
    addSocialToUser(userSocial: InputSocial!): SocialMedia
    addSocialToBrand(brandSocial: InputSocial!): SocialMedia
    deleteSocial(socialId: String!): SocialMedia
    addAffiliateProfile(newAffiliate: InputAffiliate!): Affiliate
    deleteAffiliateProfile(affiliateId: ID!): Affiliate
    addProduct(productInputs: InputProduct!): Product
    updateProductName(productId: ID!, name: String!, brandId: String): Product
    updateProductDescription(
      productId: ID!
      description: String!
      brandId: String
    ): Product
    updateProductLink(
      productId: ID!
      description: String!
      brandId: String
    ): Product
    deleteProduct(productId: ID!, brandId: String): Product
  }
`;

module.exports = typeDefs;
