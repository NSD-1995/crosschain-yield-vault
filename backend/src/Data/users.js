// backend/src/data/users.js
const bcrypt = require("bcryptjs");

const users = [
  {
    id: "1",
    email: "admin@test.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    name: "Admin User",
  },
  {
    id: "2",
    email: "user@test.com",
    passwordHash: bcrypt.hashSync("user123", 10),
    role: "user",
    name: "Normal User",
  },
];

module.exports = users;
