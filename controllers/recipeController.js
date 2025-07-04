const Recipe = require("../models/recipe");
const User = require("../models/user");

async function getAllRecipes(req, res) {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getRecipeById(req, res) {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findOne({ id: id });
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createRecipe(req, res) {
  try {
    const imageUrls = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
    const newRecipe = new Recipe({
      ...req.body,
      imageUrls,
      ingredients,
    });
    console.log("New Recipe:", newRecipe);
    await Recipe.insertOne(newRecipe);
    return res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return res.status(500).json({ error: "Error creating recipe" });
  }
}

async function deleteRecipe(req, res) {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: id });
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    const users = await User.find();
    for (const user of users) {
      user.ownRecipes.pull(id);
      user.favoriteRecipes.pull(id);
      user.likedRecipes.pull(id);
      user.dislikedRecipes.pull(id);
      user.save();
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function searchRecipes(req, res) {
  const { query } = req.query;
  try {
    const recipes = await Recipe.find({ name: new RegExp(query, "i") });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function filterRecipesByAuthor(req, res) {
  const { query } = req.query;
  try {
    const recipes = await Recipe.find({ author: new RegExp(query, "i") });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getRandomRecipe(req, res) {
  try {
    const randomRecipe = (await Recipe.aggregate([{ $sample: { size: 1 } }]).exec())[0];
    if (!randomRecipe) return res.status(404).json({ error: "No recipes found" });
    res.status(200).json(randomRecipe);
  } catch (error) {
    console.error("Error fetching random recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  searchRecipes,
  filterRecipesByAuthor,
  deleteRecipe,
  getRandomRecipe,
};
