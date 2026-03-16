const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  console.log("Authorization header:", header);

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    console.log("Decoded user:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT verify error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};
