import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fristname: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    required: true,
    unique: true,
    type: String,
    index: true,
  },
  lastname: {
    type: String,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    select: false,
  },
  refreshtoken: {
    type: String,
    default: undefined,
    select: false,
  },
});

const User=mongoose.models.User||mongoose.model("User",userSchema);
export default User;