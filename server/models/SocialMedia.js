const { Schema, model } = require("mongoose");

const socialMediaSchema = new Schema({
  type: {
    type: String,
    enum: ["FACEBOOK", "INSTAGRAM", "TWITTER", "TIKTOK", "YOUTUBE", "OTHER"],
    trim: true,
    default: "OTHER",
  },
  userName: {
    type: String,
    required: [true, "Username is required!"],
    trim: true,
  },
  link: {
    type: String,
    required: [true, "Link is required!"],
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: "Brand",
  },
});

const SocialMedia = model("SocialMedia", socialMediaSchema);

module.exports = SocialMedia;
