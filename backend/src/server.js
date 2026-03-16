const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config");
const logger = require("./logger");
const rateLimiter = require("./middleware/ratelimit");
const authVerification = require("./middleware/auth");
const roles = require("./middleware/roles");
const { startIndexer } = require("./indexer/indexer");

const vaultRoutes = require("./routes/vault");
const userRoutes = require("./routes/user");
const bridgeRoutes = require("./routes/bridge");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.use("/auth", authRoutes);
app.use("/vault", authVerification, roles(["user", "admin"]), vaultRoutes);
app.use("/user", authVerification, roles(["user", "admin"]), userRoutes);
app.use("/bridge", authVerification, roles(["user", "admin"]), bridgeRoutes);

// protect admin routes with JWT + admin role
app.use("/admin", authVerification, roles("admin", "user"), adminRoutes);

app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  logger.info(`Backend running on port ${config.port}`);
  startIndexer();
});
