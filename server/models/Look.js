const { Schema, model } = require("mongoose");

const lookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Look Title is required!"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Look = model("Look", lookSchema);

module.exports = Look;
