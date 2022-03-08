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
});

const SocialMedia = model("SocialMedia", socialMediaSchema);

module.exports = SocialMedia;
