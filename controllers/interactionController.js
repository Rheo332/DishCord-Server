const User = require("../models/user");
const Recipe = require("../models/recipe");
const jwt = require("jsonwebtoken");

async function bookmarkRecipe(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No valid token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const userId = decoded.id;
    const { recipeId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      user.favoriteRecipes.push(recipeId);
      await user.save();
      return res.status(200).json({ message: "Recipe bookmarked successfully" });
    } catch (error) {
      return res.status(500).json({ message: "internal server error: ", error });
    }
  });
}

module.exports = {
  bookmarkRecipe,
};
