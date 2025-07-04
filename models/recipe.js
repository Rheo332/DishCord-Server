const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  id: String,
  name: String,
  ingredients: [{ name: String, amount: String }],
  preparation: String,
  category: String,
  tags: [String],
  author: String,
  imageUrls: [String],
  likeCount: Number,
  dislikeCount: Number,
  comments: [{ author: String, timestamp: String, commentText: String }],
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
