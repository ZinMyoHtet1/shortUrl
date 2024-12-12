import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidatePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return error;
  }
};

export default new mongoose.model("User", userSchema);
