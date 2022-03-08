const { Schema, model } = require("mongoose");
const { hash, compare } = require("bcrypt");

const options = { discriminatorKey: "kind" };

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required!"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required!"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: 5,
      maxlength: 50,
    },
    avatar: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    socials: [
      {
        type: Schema.Types.ObjectId,
        ref: "SocialMedia",
      },
    ],
    profile: { type: ObjectID, refPath: "role" },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
  options
);

// middleware for password
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await hash(this.password, saltRounds);
  }
  next();
});

// compares the incoming password to the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
  return compare(password, this.password);
};

const Owner = User.discriminator(
  "Owner",
  new Schema(
    {
      brandName: {
        type: String,
        required: [true, "Brand Name is required!"],
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
      affiliates: [
        {
          type: ObjectID,
          ref: "Affiliate",
        },
      ],
    },
    {
      toJSON: {
        virtuals: true,
      },
    },
    options
  )
);

const Affiliate = User.discriminator(
  "Affiliate",
  new Schema(
    {
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
    },
    {
      toJSON: {
        virtuals: true,
      },
    },
    options
  )
);

// TODO virtuals
// get product count
Owner.virtual("productCount").get(function () {
  return this.product.length;
});
// get campaign count
Owner.virtual("campaignCount").get(function () {
  return this.campaign.length;
});
// get post count
Affiliate.virtual("postCount").get(function () {
  return this.post.length;
});
// get look count
Affiliate.virtual("lookCount").get(function () {
  return this.look.length;
});

module.exports = { Owner, Affiliate };
