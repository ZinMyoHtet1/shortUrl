import mongoose from "mongoose";

const Schema = mongoose.Schema;

const urlSchema = new Schema(
  {
    urlID: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default new mongoose.model("Url", urlSchema);
