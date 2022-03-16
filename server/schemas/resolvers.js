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
    },
  },
};
