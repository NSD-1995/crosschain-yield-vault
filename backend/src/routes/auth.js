const jwt = require("jsonwebtoken");
const config = require("../config");
const express = require("express");

const router = express.Router();

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  email = email.trim().toLowerCase();
  password = password.trim();

  let user = null;

  if (email === "admin@test.com" && password === "admin123") {
    user = { id: 1, role: "admin", email };
  }

  if (email === "user@test.com" && password === "user123") {
    user = { id: 2, role: "user", email };
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(user, config.jwtSecret, {
    expiresIn: "1d",
  });

  res.json({
    ok: true,
    token,
    user,
  });
});

module.exports = router;
