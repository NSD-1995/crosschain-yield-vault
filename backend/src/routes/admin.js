const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const validate = require("../middleware/validate");
const {
  pauseSchema,
  capUpdateSchema,
  yieldUpdateSchema,
} = require("../validators/adminValidators");
const { vault } = require("../Contract");

const router = express.Router();

router.post(
  "/pause",
  auth,
  requireRole("admin"),
  validate(pauseSchema),
  async (req, res) => {
    const tx = await vault.pause();
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  },
);

router.post(
  "/cap-update",
  auth,
  requireRole("admin"),
  validate(capUpdateSchema),
  async (req, res) => {
    const { newCap } = req.validatedBody;

    const tx = await vault.updateDepositCap(newCap);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash, newCap });
  },
);

router.post(
  "/yield-update",
  auth,
  requireRole("admin"),
  validate(yieldUpdateSchema),
  async (req, res) => {
    const { amount } = req.validatedBody;

    const tx = await vault.simulateYield(amount);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash, amount });
  },
);

module.exports = router;
