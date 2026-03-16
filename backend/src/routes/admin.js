const express = require("express");
const db = require("../db");
const router = express.Router();

let adminState = {
  paused: false,
  depositCap: "1000000000000",
};

router.get("/status", async (req, res) => {
  res.json(adminState);
});

router.post("/pause", async (req, res) => {
  adminState.paused = true;
  res.json({ ok: true, paused: true });
});

router.post("/unpause", async (req, res) => {
  adminState.paused = false;
  res.json({ ok: true, paused: false });
});

router.post("/deposit-cap", async (req, res) => {
  const { depositCap } = req.body;

  if (!depositCap) {
    return res.status(400).json({ error: "depositCap is required" });
  }

  adminState.depositCap = depositCap;
  res.json({ ok: true, depositCap });
});

router.get("/events", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
        event_name,
        contract_address,
        tx_hash,
        block_number,
        payload,
        created_at
      FROM processed_events
      ORDER BY created_at DESC
      LIMIT 50`,
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/suspicious-transactions", async (req, res, next) => {
  try {
    const threshold = req.query.threshold || "500000000";

    const result = await db.query(
      `SELECT
        id,
        user_address,
        tx_hash,
        type,
        amount,
        chain_name,
        status,
        metadata,
        created_at
       FROM transactions
       WHERE amount >= $1
          OR status != 'confirmed'
          OR type IN ('bridge', 'bridge_initiate', 'bridge_claim')
       ORDER BY created_at DESC
       LIMIT 100`,
      [threshold],
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/yield-update", async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }

    const result = await db.query(
      `UPDATE vault_stats
       SET tvl = tvl + $1,
           updated_at = NOW()
       RETURNING *`,
      [amount],
    );

    res.json({
      ok: true,
      message: "Yield simulated",
      vault: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
