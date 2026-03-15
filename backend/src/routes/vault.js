const express = require("express");
const db = require("../db");
const { vaultRead } = require("../Contract");

const router = express.Router();

router.get("/stats", async (req, res) => {
  const totalAssets = await vaultRead.totalAssets();
  const totalSupply = await vaultRead.totalSupply();

  res.json({
    tvl: totalAssets.toString(),
    totalShares: totalSupply.toString(),
    apy: 12.5,
  });
});

module.exports = router;
