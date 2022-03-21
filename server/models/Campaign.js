const { Schema, model } = require("mongoose");

const campaignSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Campaign title is required!"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Campaign = model("Campaign", campaignSchema);

module.exports = Campaign;
