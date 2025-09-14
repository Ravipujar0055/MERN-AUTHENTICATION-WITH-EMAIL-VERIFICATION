import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyotp: { type: String, default: "" },
  verifyotpexpireAt: { type: Number, default: 0 },
  isaccountverified: { type: Boolean, default: false }, // should be Boolean not string
  resetotp: { type: String, default: "" },
  resetotpexpireat: { type: Number, default: 0 }
});

// If model already exists (hot-reload), reuse it
const userModel = mongoose.models.user || mongoose.model("user", userschema);

export default userModel;
