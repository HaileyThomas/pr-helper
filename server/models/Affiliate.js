const { Schema, model } = require("mongoose");

const affiliateSchema = new Schema({
  userId: {
    type: String,
    trim: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  looks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Look",
    },
  ],
  brands: [
    {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
  ],
});

// TODO add virtuals for counting

const Affiliate = model("Affiliate", affiliateSchema);

module.exports = Affiliate;
