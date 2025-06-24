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
    const { query } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recipe = await Recipe.findById(query);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const isAlreadyBookmarked = user.favoriteRecipes.some((id) => id.toString() === query);
      if (isAlreadyBookmarked) {
        user.favoriteRecipes.pull(query);
        await user.save();
        return res.status(200).json({ message: "Recipe removed from bookmarks" });
      } else {
        user.favoriteRecipes.addToSet(query);
        await user.save();
        return res.status(200).json({ message: "Recipe bookmarked successfully" });
      }
    } catch (error) {
      return res.status(500).json({ message: "internal server error: ", error });
    }
  });
}

async function sentimentRecipe(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No valid token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id;
    const { query, sentiment } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recipe = await Recipe.findById(query);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const isLiked = user.likedRecipes.some((id) => id.toString() === query);
      const isDisliked = user.dislikedRecipes.some((id) => id.toString() === query);
      if (sentiment === "like") {
        if (isLiked) {
          user.likedRecipes.pull(query);
          recipe.likeCount -= 1;
          await user.save();
          await recipe.save();
          return res.status(200).json({ message: "Recipe like removed successfully" });
        }
        user.likedRecipes.addToSet(query);
        recipe.likeCount += 1;
        if (isDisliked) {
          user.dislikedRecipes.pull(query);
          recipe.dislikeCount -= 1;
        }
        await user.save();
        await recipe.save();
        return res.status(200).json({ message: "Recipe liked successfully" });
      } else if (sentiment === "dislike") {
        if (isDisliked) {
          user.dislikedRecipes.pull(query);
          recipe.dislikeCount -= 1;
          await user.save();
          await recipe.save();
          return res.status(200).json({ message: "Recipe dislike removed successfully" });
        }
        user.dislikedRecipes.addToSet(query);
        recipe.dislikeCount += 1;
        if (isLiked) {
          user.likedRecipes.pull(query);
          recipe.likeCount -= 1;
        }
        await user.save();
        await recipe.save();
        return res.status(200).json({ message: "Recipe disliked successfully" });
      } else {
        return res.status(400).json({ message: "Invalid sentiment value" });
      }
    } catch (error) {
      return res.status(500).json({ message: "internal server error: ", error });
    }
  });
}

async function getAllComments(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Cannot find recipe" });
    }
    const allComments = await Recipe.findById(query).select("comments");
    if (!allComments) {
      return res.status(400).json({ message: "Could not find comments" });
    }
    return res.status(200).json({ message: "Success", allComments });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

async function createComment(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No valid token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id;
    const { recipeId, commentText, timestamp } = req.body;

    try {
      const user = await User.findById(userId).select("username");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recipe = await Recipe.findById({ _id: recipeId });
      console.log("Recipe ID:", recipeId);
      console.log("Recipe found:", recipe);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const newComment = { author: user.username, timestamp: timestamp, commentText: commentText };
      recipe.comments.push(newComment);
      await recipe.save();

      return res.status(200).json({ message: "Comment saved" });
    } catch (error) {
      console.error(error);
      return res.status(500).json("Internal Server Error");
    }
  });
}

async function deleteComment(req, res) {
  const token = req.headers.authorization;
  const { recipeId, commentId } = req.params;
  if (!token) {
    return res.status(401).json({ message: "No valid token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      const comment = recipe.comments.findIndex((c) => c._id.toString() === commentId);
      if (comment === -1) {
        return res.status(404).json({ message: "Comment not found" });
      }
      recipe.comments.splice(comment, 1);
      await recipe.save();
      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  });
}

module.exports = {
  bookmarkRecipe,
  sentimentRecipe,
  getAllComments,
  createComment,
  deleteComment,
};
