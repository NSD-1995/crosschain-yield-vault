require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const token = jwt.sign(
  {
    id: "admin-1",
    role: "admin",
  },
  process.env.JWT_SECRET || "supersecretjwt",
  { expiresIn: "1d" },
);

const filePath = path.join(__dirname, "../admin_token.txt");

fs.writeFileSync(filePath, token);

console.log("\nAdmin JWT Token generated and saved to:");
console.log(filePath);
