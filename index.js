require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const passport = require("passport");

const authController = require("./controllers/authController");
const recipeController = require("./controllers/recipeController");
const serviceStatusController = require("./controllers/serviceStatusController");
const userController = require("./controllers/userController");
const interactionController = require("./controllers/interactionController");

const app = express();
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(cors());

app.use("/uploads", express.static("public/uploads"));
app.use(express.json());

app.use(passport.initialize());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB could not connect:", err);
  });

app.get("/", (req, res) => {
  res.status(200).send("Connected to the server");
});

app.post("/auth/login", (req, res) => {
  authController.login(req, res);
});

app.post("/auth/register", (req, res) => {
  authController.register(req, res);
});

app.post("/auth/status", (req, res) => {
  authController.status(req, res);
});

app.get("/auth/logout", (req, res) => {
  authController.logout(req, res);
});

app.post("/recipes/bookmark", (req, res) => {
  interactionController.bookmarkRecipe(req, res);
});

app.post("/recipes/sentiment", (req, res) => {
  interactionController.sentimentRecipe(req, res);
});

app.post("/recipes/comment", (req, res) => {
  interactionController.createComment(req, res);
});

app.get("/recipes/comments", (req, res) => {
  interactionController.getAllComments(req, res);
});

app.post("/recipes", upload.array("images", 5), (req, res) => {
  recipeController.createRecipe(req, res);
});

app.get("/recipes/filter/author", (req, res) => {
  recipeController.filterRecipesByAuthor(req, res);
});

app.get("/recipes/random", (req, res) => {
  recipeController.getRandomRecipe(req, res);
});

app.get("/recipes/search", (req, res) => {
  recipeController.searchRecipes(req, res);
});

app.get("/recipes/:id", (req, res) => {
  recipeController.getRecipeById(req, res);
});

app.get("/recipes", (req, res) => {
  recipeController.getAllRecipes(req, res);
});

app.delete("/recipes/:recipeId/:commentId", (req, res) => {
  interactionController.deleteComment(req, res);
});

app.delete("/recipes/:id", (req, res) => {
  recipeController.deleteRecipe(req, res);
});

app.get("/service-status", (req, res) => {
  serviceStatusController.getServiceStatus(req, res);
});

app.get("/user-context/", (req, res) => {
  userController.getUserContext(req, res);
});
