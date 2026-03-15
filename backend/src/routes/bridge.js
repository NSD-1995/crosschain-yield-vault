const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/status/:txHash", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM bridge_status WHERE tx_hash = $1",
    [req.params.txHash],
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "Bridge transaction not found" });
  }

  res.json(result.rows[0]);
});

module.exports = router;
