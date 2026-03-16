const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/initiate", async (req, res, next) => {
  try {
    const {
      tx_hash,
      user_address,
      amount,
      nonce,
      source_chain,
      destination_chain,
    } = req.body;

    if (!tx_hash || !user_address || !amount || nonce === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO bridge_status
        (tx_hash, user_address, amount, nonce, status, source_chain, destination_chain, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (tx_hash)
       DO UPDATE SET
         user_address = EXCLUDED.user_address,
         amount = EXCLUDED.amount,
         nonce = EXCLUDED.nonce,
         status = EXCLUDED.status,
         source_chain = EXCLUDED.source_chain,
         destination_chain = EXCLUDED.destination_chain,
         updated_at = NOW()
       RETURNING *`,
      [
        tx_hash,
        user_address.toLowerCase(),
        amount,
        nonce,
        "pending",
        source_chain || null,
        destination_chain || null,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/status/:txHash", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM bridge_status WHERE tx_hash = $1",
      [req.params.txHash],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Bridge transaction not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/history/:address", async (req, res, next) => {
  try {
    const address = req.params.address.toLowerCase();

    const result = await db.query(
      "SELECT * FROM bridge_status WHERE user_address = $1 ORDER BY updated_at DESC",
      [address],
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
