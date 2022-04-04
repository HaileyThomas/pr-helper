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
          "Must be the brand owner to change this brands data!"
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
          "Must be the brand owner to change this brands data!"
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
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add an affiliate to brand
    addAffiliateToBrand: async (_, { brandId, affiliateInputs }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          await Affiliate.findByIdAndUpdate(
            affiliateInputs.affiliateId,
            { $addToSet: { brands: brandId } },
            { new: true, runValidators: true }
          )
            .populate("looks")
            .populate("posts")
            .populate("brands");

          return await Brand.findByIdAndUpdate(
            brandId,
            { $addToSet: { affiliates: affiliateInputs.affiliateId } },
            { new: true, runValidators: true }
          )
            .populate("socials")
            .populate("affiliates");
        }
        throw new AuthenticationError(
          "Must be the brand owner to add an affiliate!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete affiliate from brand
    deleteAffiliateFromBrand: async (_, { brandId, affiliateInputs }) => {
      // TODO delete affiliate from both affiliate data and brand data
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          await Affiliate.findByIdAndUpdate(affiliateInputs.affiliateId, {
            $pull: { brands: brandId },
          });
          return await Brand.findByIdAndUpdate(brandId, {
            $pull: { affiliates: affiliateInputs.affiliateId },
          })
            .populate("socials")
            .populate("affiliates");
        }
        throw new AuthenticationError(
          "Must be the brand owner to delete an affiliate!"
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
        throw new AuthenticationError(
          "Must be the brand owner to delete this brand!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add social media to user
    addSocialToUser: async (_, { userSocial }, context) => {
      if (context.user) {
        const newSocial = await SocialMedia.create(userSocial);
        await newSocial.update(
          { $addToSet: { user: context.user._id } },
          { new: true }
        );
        await User.findByIdAndUpdate(userSocial.userId, {
          $push: { socials: newSocial._id },
        });
        return newSocial;
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add social media to brand
    addSocialToBrand: async (_, { brandSocial }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(brandSocial.brandId).select(
          "owner"
        );
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          const newSocial = await SocialMedia.create(brandSocial);
          await newSocial.update(
            { $addToSet: { brand: brandSocial.brandId } },
            { new: true }
          );
          await Brand.findByIdAndUpdate(brandSocial.brandId, {
            $push: { socials: newSocial._id },
          });
          return newSocial;
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete social media
    deleteSocial: async (_, { socialId, brandId }, context) => {
      if (context.user) {
        const socialData = await SocialMedia.findById(socialId);
        if (
          socialData.user.includes(context.user._id) ||
          socialData.brand.includes(brandId)
        ) {
          return SocialMedia.findByIdAndDelete(socialId);
        }
        throw new AuthenticationError("Not authorized to delete this data!");
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add an affiliate profile
    addAffiliateProfile: async (_, __, context) => {
      if (context.user) {
        return Affiliate.create({
          affiliateId: _id,
          userId: context.user._id,
        });
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete affiliate profile
    deleteAffiliateProfile: async (_, { affiliateId }, context) => {
      if (context.user) {
        return await Affiliate.findByIdAndDelete(affiliateId);
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add product
    addProduct: async (_, { productInputs }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(productInputs.brandId).select(
          "owner"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          const newProduct = await Product.create(productInputs);

          await Owner.findByIdAndUpdate(
            brandData.owner._id,
            { $addToSet: { products: newProduct._id } },
            { new: true }
          );

          return newProduct.populate("ads").populate("looks");
        }
        throw new AuthenticationError(
          "Must be the brand owner to add a product!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update product name
    updateProductName: async (_, { productId, name, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Product.findByIdAndUpdate(
            productId,
            { name: name },
            { new: true, runValidators: true }
          )
            .populate("ads")
            .populate("looks");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this products data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update product description
    updateProductDescription: async (
      _,
      { productId, description, brandId },
      context
    ) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Product.findByIdAndUpdate(
            productId,
            { description: description },
            { new: true, runValidators: true }
          )
            .populate("ads")
            .populate("looks");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update product link
    updateProductLink: async (_, { productId, link, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Product.findByIdAndUpdate(
            productId,
            { link: lin },
            { new: true, runValidators: true }
          )
            .populate("ads")
            .populate("looks");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this products data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete a product
    deleteProduct: async (_, { productId, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Product.findByIdAndDelete(productId);
        }
        throw new AuthenticationError(
          "Must be the brand owner to delete a product!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add an ad to a product
    addAd: async (_, { adInputs }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(adInputs.brandId).select(
          "owner"
        );
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          const newAd = await Ad.create({
            ...adInputs,
            product: taskInputs.productId,
            brand: adInputs.brandId,
          });
          await Product.findByIdAndUpdate(adInputs.productId, {
            $push: { ads: newAd._id },
          });
          return newAd;
        }
        throw new AuthenticationError("Must be the brand owner to add an Ad!");
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update ad title
    updateAdTitle: async (_, { adId, title, brandId }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(brandId).select("owner");
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user_id)) {
          return Ad.findByIdAndUpdate(
            adId,
            { title: title },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner to update brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update ad description
    updateAdDescription: async (_, { adId, description, brandId }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(brandId).select("owner");
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          return await Ad.findByIdAndUpdate(
            adId,
            { description: description },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update ad image
    updateAdImage: async (_, { adId, image, brandId }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(brandId).select("owner");
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          return await Ad.findByIdAndUpdate(
            adId,
            { image: image },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete ad
    deleteAd: async (_, { adId, brandId }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(brandId);
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          return Ad.findByIdAndDelete(adId);
        }
        throw new AuthenticationError(
          "Must be the brands owner to delete an ad!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add a post to an ad
    addPostToAd: async (_, { adId, brandId, postId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Ad.findByIdAndUpdate(
            adId,
            { $addToSet: { posts: postId } },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner or and affiliate of this brand to add a post to an ad!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add a campaign
    addCampaign: async (_, { campaignInputs }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(campaignInputs.brandId).select(
          "owner"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          const newCampaign = await Campaign.create({
            ...campaignInputs,
            brand: campaignInputs.brandId,
          });
          await Owner.findByIdAndUpdate(brandData.owner, {
            $push: { campaigns: newCampaign._id },
          });
          return newCampaign;
        }
        throw new AuthenticationError(
          "Must be brand owner to create a campaign!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update campaign title
    updateCampaignTitle: async (_, { campaignId, title, brandId }, context) => {
      if (context.user) {
        const brandUsers = await brand.findById(brandId).select("owner");
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.owner.includes(context.user._id)) {
          return await Campaign.findByIdAndUpdate(
            campaignId,
            { title: title },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update campaign description
    updateCampaignDescription: async (
      _,
      { campaignId, description, brandId },
      context
    ) => {
      if (context.user) {
        const brandData = await brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Campaign.findByIdAndUpdate(
            campaignId,
            { description: description },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brands owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update campaign image
    updateCampaignImage: async (_, { campaignId, image, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findByIdAndUpdate(brandId).select(
          "owner"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Campaign.findByIdAndUpdate(
            campaignId,
            { image: image },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brands owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update campaign length
    updateCampaignLength: async (
      _,
      { campaignId, length, brandId },
      context
    ) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Campaign.findByIdAndUpdate(
            campaignId,
            { length: length },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner to change this brands data!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete a campaign
    deleteCampaign: async (_, { campaignId, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("owner");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.owner.includes(context.user._id)) {
          return await Campaign.findByIdAndDelete(campaignId);
        }
        throw new AuthenticationError(
          "Must be the brands owner to delete a campaign!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add post to a campaign
    addPostToCampaign: async (_, { campaignId, brandId, postId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Campaign.findByIdAndUpdate(
            campaignId,
            { $addToSet: { posts: postId } },
            { new: true, runValidators: true }
          ).populate("posts");
        }
        throw new AuthenticationError(
          "Must be the brand owner or a brand affiliate to add a post to a campaign!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add a post
    addPost: async (_, { postInputs }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(postInputs.brandId).select(
          "affiliates"
        );
        if (!brandUsers) {
          throw new Error("Brand not found!");
        }
        if (brandUsers.affiliates.includes(context.user._id)) {
          const newPost = await Post.create({
            ...postInputs,
            brand: postInputs.brandId,
            postedBy: context.user._id,
          });
          const filter = { userId: postInputs.postedBy };
          const update = { $push: { posts: newPost._id } };
          await Affiliate.findOneAndUpdate(filter, update);
          return newPost;
        }
        throw new AuthenticationError(
          "Must be an affiliate of this brand to create a post!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update post title
    updatePostTitle: async (_, { postId, title, brandId }, context) => {
      if (context.user) {
        const brandData = await brand
          .findById(brandId)
          .select("owner affiliates");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Post.findByIdAndUpdate(
            postId,
            { title: title },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be the owner or an affiliate of this brand to update a post!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update post description
    updatePostDescription: async (
      _,
      { postId, description, brandId },
      context
    ) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Post.findByIdAndUpdate(
            postId,
            { description: description },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be the owner or an affiliate of this brand to update a post!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update post link
    updatePostLink: async (_, { postId, link, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Post.findByIdAndUpdate(
            postId,
            { link: link },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be the owner or an affiliate of this brand to update a post!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete a post
    deletePost: async (_, { postId, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Post.findByIdAndDelete(postId);
        }
        throw new AuthenticationError(
          "Must be the owner or an affiliate of this brand to delete a post!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // add a look
    addLook: async (_, { lookInputs }, context) => {
      if (context.user) {
        const brandUsers = await Brand.findById(lookInputs.brandId).select(
          "affiliates"
        );
        if (brandUsers.affiliates.includes(context.user._id)) {
          const newLook = await Look.create({
            ...taskInputs,
            brand: lookInputs.brandId,
            postedBy: context.user._id,
          });
          const filter = { userId: lookInputs.postedBy };
          const update = { $push: { looks: newLook._id } };
          await Affiliate.findOneAndUpdate(filter, update);
          return newLook;
        }
        throw new AuthenticationError(
          "Must be an affiliate of this brand to add a look!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update look title
    updateLookTitle: async (_, { lookId, title, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("affiliates");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        // TODO: check into changing this to referencing the posted by?
        if (brandData.affiliates.includes(context.user._id)) {
          return await Look.findByIdAndUpdate(
            lookId,
            { title: title },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be an affiliate of this brand to change a look title!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update look description
    updateLookDescription: async (
      _,
      { lookId, description, brandId },
      context
    ) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("affiliates");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.affiliates.includes(context.user._id)) {
          return await Look.findByIdAndUpdate(
            lookId,
            { description: description },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be a brand affiliate to update this looks description!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update look image
    updateLookImage: async (_, { lookId, image, brandId }, context) => {
      if (context.user) {
        const brandData = await brand.findBId(brandId).select("affiliates");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.affiliates.includes(context.user._id)) {
          return await Look.findByIdAndUpdate(
            lookId,
            { image: image },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be an affiliate of this brand to update a looks image!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // update look link
    updateLookLink: async (_, { lookId, link, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select("affiliates");
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (brandData.affiliates.includes(context.user._id)) {
          return await Look.findByIdAndUpdate(
            lookId,
            { link: link },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError(
          "Must be an affiliate of this brand to update a looks link!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
    // delete a look
    deleteLook: async (_, { lookId, brandId }, context) => {
      if (context.user) {
        const brandData = await Brand.findById(brandId).select(
          "owner affiliates"
        );
        if (!brandData) {
          throw new Error("Brand not found!");
        }
        if (
          brandData.owner.includes(context.user._id) ||
          brandData.affiliates.includes(context.user._id)
        ) {
          return await Look.findByIdAndDelete(lookId);
        }
        throw new AuthenticationError(
          "Must be the brand owner or an affiliate of this brand to delete a  look!"
        );
      }
      throw new AuthenticationError("Not logged in!");
    },
  },
};
