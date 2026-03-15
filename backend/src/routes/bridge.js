const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:address/position", async (req, res) => {
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
});

router.get("/transactions/:address", async (req, res) => {
  const address = req.params.address.toLowerCase();

  const result = await db.query(
    "SELECT * FROM transactions WHERE user_address = $1 ORDER BY created_at DESC",
    [address],
  );

  res.json(result.rows);
});

module.exports = router;
