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
          .populate("owner")
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

  Mutation: {
    // add user
    addUser: async (_, { newUser }) => {
      const user = await User.create(newUser);
      const token = signToken(user);
      return { token, user };
    },
    // login user
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email: email });
      if (!user) throw new AuthenticationError("Incorrect login credentials!");
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) throw new AuthenticationError("Incorrect password!");
      const token = signToken(user);
      return { token, user };
    },
    // update user
    updateUser: async (_, { userInputs }, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, userInputs, {
          new: true,
          runValidators: true,
        });
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete user
    deleteUser: async (_, { password }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id);
        const correctPw = await user.isCorrectPassword(password);
        if (correctPw) {
          return await User.findByIdAndDelete(user._id);
        }
        throw new AuthenticationError("Incorrect password!");
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add a new brand
    addBrand: async (_, { brandInputs }, context) => {
      if (context.user) {
        const newBrand = await Brand.create(brandInputs);
        // create new owner
        await Owner.create({ userId: context.user._id, brandId: newBrand._id });
        // add brand to user
        await User.findByIdAndUpdate(context.user._id, {
          $addToSet: { brands: newBrand._id },
        });
        return await Brand.findById(newBrand._id)
          .populate("owner")
          .populate("socials")
          .populate("affiliates");
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update brand name
    updateBrandName: async (_, { brandId, name }, context) => {
      if (context.user) {
        const brandData = await Project.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Brand.findByIdAndUpdate(
            brandId,
            { name: name },
            { new: true, runValidators: true }
          )
            .populate("owner")
            .populate("socials")
            .populate("affiliates");
        }
        throw new AuthenticationError(
          "Not authorized to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update brand website
    updateBrandWebsite: async (_, { brandId, website }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Brand.findByIdAndUpdate(
            brandId,
            { website: website },
            { new: true, runValidators: true }
          )
            .populate("owner")
            .populate("socials")
            .populate("affiliates");
        }
        throw new AuthenticationError(
          "Not authorized to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update brand logo
    updateBrandLogo: async (_, { brandId, logo }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Brand.findByIdAndUpdate(
            brandId,
            { logo: logo },
            { new: true, runValidators: true }
          )
            .populate("owner")
            .populate("socials")
            .populate("affiliates");
        }
        throw new AuthenticationError(
          "Not authorized to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete a brand
    deleteBrand: async (_, { brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Brand.findByIdAndDelete(brandId);
        }
        throw new AuthenticationError("Not authorized to delete this brand!");
      }
      throw new AuthenticationError("Not logged in!");
    },
  },
};
