require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const passport = require("passport");

const authController = require("./controllers/authController");
const recipeController = require("./controllers/recipeController");

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
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // z.B. 1716312345678.jpg
  },
});
const upload = multer({ storage });

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

app.post("/recipes", upload.array("images", 5), (req, res) => {
  recipeController.createRecipe(req, res);
});

app.get("/recipes/:id", (req, res) => {
  recipeController.getRecipeById(req, res);
});

app.get("/recipes", (req, res) => {
  recipeController.getAllRecipes(req, res);
});
