const { Schema, model } = require("mongoose");

const brandSchema = new Schema({
  name: {
    type: String,
    required: [true, "Brand name is required!"],
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
  },
  socials: [
    {
      type: Schema.Types.ObjectId,
      ref: "SocialMedia",
    },
  ],
  affiliates: [
    {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
    },
  ],
});

const Brand = model("Brand", brandSchema);

module.exports = Brand;
