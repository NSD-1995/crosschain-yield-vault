const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:address/position", async (req, res, next) => {
  try {
    const address = req.params.address.toLowerCase();

    const result = await db.query(
      "SELECT * FROM user_positions WHERE user_address = $1",
      [address],
    );

    res.json(
      result.rows[0] || {
        user_address: address,
        asset_balance: "0",
        share_balance: "0",
      },
    );
  } catch (err) {
    next(err);
  }
});

router.get("/:address/transactions", async (req, res, next) => {
  try {
    const address = req.params.address.toLowerCase();

    const result = await db.query(
      "SELECT * FROM transactions WHERE user_address = $1 ORDER BY created_at DESC",
      [address],
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:address/summary", async (req, res, next) => {
  try {
    const address = req.params.address.toLowerCase();

    const positionResult = await db.query(
      "SELECT * FROM user_positions WHERE user_address = $1",
      [address],
    );

    const txResult = await db.query(
      "SELECT * FROM transactions WHERE user_address = $1 ORDER BY created_at DESC LIMIT 5",
      [address],
    );

    res.json({
      user: positionResult.rows[0] || {
        user_address: address,
        asset_balance: "0",
        share_balance: "0",
      },
      recentTransactions: txResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
