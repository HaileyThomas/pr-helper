const { Schema, model } = require("mongoose");
const { hash, compare } = require("bcrypt");

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
    role: {
      type: String,
      enum: ["OWNER", "AFFILIATE"],
      trim: true,
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
    brands: [
      {
        type: Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
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

const User = model("User", userSchema);

module.exports = User;
