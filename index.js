const recipes = require("./cooldatabase");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.post("/auth/login", (req, res) => {
  res.status(200).send("User Login");
});

app.post("/auth/register", (req, res) => {
  res.status(200).send("User Registration");
});

app.get("/auth/logout", (req, res) => {
  res.status(200).send("User Logout");
});

app.post("/recipes", (req, res) => {
  res.status(200).send("Create a new Recipe");
});

app.get("/recipes/:id", (req, res) => {
  const id = req.params.id;
  const recipe = recipes.find((r) => r.id === id);

  if (recipe) {
    res.status(200).json(recipe);
  } else {
    res.status(404).json("This is not the recipe you are looking for 👻");
  }
});

app.get("/recipes", (req, res) => {
  if (recipes) {
    res.status(200).json(recipes);
  } else {
    res.status(500).json("Database gone");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
