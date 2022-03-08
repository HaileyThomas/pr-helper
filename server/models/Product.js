const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product Name is required!"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    ads: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ad",
      },
    ],
    looks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Look",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Product = model("Product", productSchema);

module.exports = Product;
