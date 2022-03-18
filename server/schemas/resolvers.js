const {
  User,
  Owner,
  Affiliate,
  Brand,
  SocialMedia,
  Product,
  Ad,
  Campaign,
  Post,
  Look,
} = require("../models");
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    // get current user
    me: async (_, __, context) => {
      if (context.user) {
        const currentUserData = await User.findById(context.user._id).select(
          "-__v, -password"
        );
        return currentUserData;
      }
      throw new AuthenticationError("You are not logged in!");
    },
    // get user's brands
    myBrands: async (_, __, context) => {
      if (context.user) {
        const { brands } = await User.findById(context.user._id)
          .select("brands")
          .populate("brands");
        return brands;
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get a brand by id
    brand: async (_, { _id }, context) => {
      // check if user is logged in
      if (context.user) {
        const brandData = await Brand.findById(_id);
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        return await Brand.findById(_id)
          .populate("affiliates")
          .populate("socials");
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get owner by id
    owner: async (_, { _id }, context) => {
      if (context.user) {
        const ownerData = await Owner.findById(_id);
        if (!ownerData) {
          throw new Error("Owner not found!");
        }
        return ownerData;
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get affiliate by id
    affiliate: async (_, { _id }, context) => {
      if (context.user) {
        const affiliateData = await Affiliate.findById(_id);
        if (!affiliate) {
          throw new Error("Affiliate not found!");
        }
        return affiliateData;
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get my social media
    mySocialMedia: async (_, __, context) => {
      if (context.user) {
        const { socials } = await User.findById(context.user._id)
          .select("socials")
          .populate("socials");
        return socials;
      }
      throw new AuthenticationError("Not logged in!");
    },
  },
};
