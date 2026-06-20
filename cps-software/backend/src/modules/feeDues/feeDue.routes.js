// This file lists the URLs (routes) for the fee dues module and points
// each one at the controller function that handles it. It gets mounted at
// /api/fee-dues in src/routes/index.js.
//
// Specific paths (/generate, /unpaid, /paid, /overdue, /student/:id) are
// listed before the generic "/" list route — not strictly required since
// they're different paths, but keeps the most-specific routes up top.

import { Router } from "express";
import * as feeDueController from "./feeDue.controller.js";

const router = Router();

router.post("/generate", feeDueController.generateDues);
router.get("/unpaid", feeDueController.listUnpaid);
router.get("/paid", feeDueController.listPaid);
router.get("/overdue", feeDueController.listOverdue);
router.get("/student/:studentId", feeDueController.listForStudent);
router.get("/", feeDueController.listFeeDues);

export default router;
