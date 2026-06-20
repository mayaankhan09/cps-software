// This file collects all the API routes for the app in one place.
// Right now it only has a simple health check route so we can confirm the
// server is running. As we build real features (students, staff, fees,
// attendance...), each module's routes will get mounted here too.

import { Router } from "express";
import registrationRoutes from "../modules/registrations/registration.routes.js";
import studentRoutes from "../modules/students/student.routes.js";
import staffRoutes from "../modules/staff/staff.routes.js";
import feeStructureRoutes from "../modules/feeStructures/feeStructure.routes.js";
import feeDueRoutes from "../modules/feeDues/feeDue.routes.js";
import paymentRoutes from "../modules/payments/payment.routes.js";

const router = Router();

// GET /api/health - a simple route to check that the server is alive.
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/registrations", registrationRoutes);
router.use("/students", studentRoutes);
router.use("/staff", staffRoutes);
router.use("/fee-structures", feeStructureRoutes);
router.use("/fee-dues", feeDueRoutes);
router.use("/payments", paymentRoutes);

// Future module routes (attendance, etc.) get added here.

export default router;
