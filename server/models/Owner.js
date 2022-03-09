const { Schema, model } = require("mongoose");

const ownerSchema = new Schema({
  brand: {
    type: String,
    trim: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  campaigns: [
    {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
    },
  ],
});

// TODO add getters for counting products and campaigns

const Owner = model("Owner", ownerSchema);

module.exports = Owner;
