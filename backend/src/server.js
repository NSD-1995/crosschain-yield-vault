const express = require("express");
const cors = require("cors");
const config = require("./config");
const logger = require("./logger");
const rateLimiter = require("./middleware/ratelimit");
const { startIndexer } = require("./indexer/indexer");

const vaultRoutes = require("./routes/vault");
const userRoutes = require("./routes/user");
const bridgeRoutes = require("./routes/bridge");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/vault", vaultRoutes);
app.use("/user", userRoutes);
app.use("/bridge", bridgeRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  logger.info(`Backend running on port ${config.port}`);
  startIndexer();
});
