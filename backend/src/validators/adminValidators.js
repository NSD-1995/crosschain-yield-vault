const { z } = require("zod");

const pauseSchema = z.object({});

const capUpdateSchema = z.object({
  newCap: z.string().min(1),
});

const yieldUpdateSchema = z.object({
  amount: z.string().min(1),
});

module.exports = {
  pauseSchema,
  capUpdateSchema,
  yieldUpdateSchema,
};
