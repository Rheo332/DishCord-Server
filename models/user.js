const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  username: String,
  likedRecipes: [String],
  dislikedRecipes: [String],
  favoriteRecipes: [String],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
