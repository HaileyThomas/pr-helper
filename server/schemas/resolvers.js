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
    // get product by id
    product: async (_, { _id }, context) => {
      if (context.user) {
        const productData = await Product.findById(_id);
        if (!productData) {
          throw new Error("Product not found!");
        }
        const brandUsers = await Brand.findById(productData.brand).select(
          "owner affiliates"
        );
        if (
          brandUsers.owner.includes(context.user._id) ||
          brandUsers.affiliates.includes(context.user._id)
        ) {
          return productData;
        }
        throw new AuthenticationError(
          "Not authorized to view this brand's data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get ad by id
    ad: async (_, { _id }, context) => {
      if (context.user) {
        const adData = await Ad.findById(_id);
        if (!adData) {
          throw new Error("Ad not found!");
        }
        const brandUsers = await Brand.findById(adData.brand).select(
          "owner affiliates"
        );
        if (
          brandUsers.owner.includes(context.user._id) ||
          brandUsers.affiliates.includes(context.user._id)
        ) {
          return adData;
        }
        throw new AuthenticationError(
          "Not authorized to view this brand's data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get campaign by id
    campaign: async (_, { _id }, context) => {
      if (context.user) {
        const campaignData = await Campaign.findById(_id);
        if (!campaignData) {
          throw new Error("Campaign not found!");
        }
        const brandUsers = await Brand.findById(campaignData.brand).select(
          "owner affiliates"
        );
        if (
          brandUsers.owner.includes(context.user._id) ||
          brandUsers.affiliates.includes(context.user._id)
        ) {
          return campaignData;
        }
        throw new AuthenticationError(
          "Not authorized to view this brand's data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get post by id
    post: async (_, { _id }, context) => {
      if (context.user) {
        const postData = await Post.findById(_id);
        if (!postData) {
          throw new Error("Post not found!");
        }
        const brandUsers = await Brand.findById(postData.brand).select(
          "owner affiliates"
        );
        if (
          brandUsers.owner.includes(context.user._id) ||
          brandUsers.affiliates.includes(context.user._id)
        ) {
          return postData;
        }
        throw new AuthenticationError(
          "Not authorized to view this brand's data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // get look by id
    look: async (_, { _id }, context) => {
      if (context.user) {
        const lookData = await Look.findById(_id);
        if (!lookData) {
          throw new Error("Look not found!");
        }
        const brandUsers = await Brand.findById(lookData.brand).select(
          "owner affiliates"
        );
        if (
          brandUsers.owner.includes(context.user._id) ||
          brandUsers.affiliates.includes(context.user._id)
        ) {
          return lookData;
        }
        throw new AuthenticationError(
          "Not authorized to view this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
  },

  Mutation: {},
};
