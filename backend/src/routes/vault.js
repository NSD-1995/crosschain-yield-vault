const express = require("express");
const { vaultRead } = require("../Contract");

const router = express.Router();

router.get("/stats", async (req, res, next) => {
  try {
    const totalAssets = await vaultRead.totalAssets();
    const totalSupply = await vaultRead.totalSupply();

    res.json({
      tvl: totalAssets.toString(),
      totalShares: totalSupply.toString(),
      apy: 12.5,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/tvl", async (req, res, next) => {
  try {
    const totalAssets = await vaultRead.totalAssets();
    res.json({ tvl: totalAssets.toString() });
  } catch (err) {
    next(err);
  }
});

router.get("/shares", async (req, res, next) => {
  try {
    const totalSupply = await vaultRead.totalSupply();
    res.json({ totalShares: totalSupply.toString() });
  } catch (err) {
    next(err);
  }
});

router.get("/apy", async (req, res) => {
  res.json({ apy: 12.5 });
});

router.post("/deposit", async (req, res) => {
  try {
    const { amount } = req.body;

    const tx = await vaultWrite.deposit(amount);

    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
