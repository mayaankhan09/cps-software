// This file collects all the API routes for the app in one place.
// Right now it only has a simple health check route so we can confirm the
// server is running. As we build real features (students, staff, fees,
// attendance...), each module's routes will get mounted here too.

import { Router } from "express";

const router = Router();

// GET /api/health - a simple route to check that the server is alive.
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Future module routes (students, staff, fees, attendance, etc.) get added here.

export default router;
