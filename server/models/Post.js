const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Post Title is required!"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      required: [true, "Link to post is required!"],
      trim: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
