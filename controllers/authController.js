const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

passport.use(User.createStrategy());

function login(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ Error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    res.status(200).json({ message: "User logged in successfully", token });
  })(req, res, next);
}

function register(req, res) {
  const { username, password } = req.body;
  User.register({ username }, password, (err, user) => {
    if (err) {
      console.error("Error registering user:", err);
      return res.status(500).json({ error: "Error registering user" });
    }
    res.status(200).json({ message: "User registered successfully" });
  });
}

function status(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "User is not logged in" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(200).json({ message: "Valid token", userId: decoded.id });
  });
}

function logout(req, res) {
  // delete / blacklist JWT issued to user
  res.status(200).send("User Logout");
}

module.exports = {
  login,
  register,
  status,
  logout,
};
