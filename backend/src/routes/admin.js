const express = require("express");

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

module.exports = router;
