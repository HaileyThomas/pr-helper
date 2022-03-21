const { Schema, model } = require("mongoose");

const adSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
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
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
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

const Ad = model("Ad", adSchema);

module.exports = Ad;
