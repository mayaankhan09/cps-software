// This file lists the URLs (routes) for the payments module and points
// each one at the controller function that handles it. It gets mounted at
// /api/payments in src/routes/index.js.
//
// On purpose, there is NO delete route here, and no edit route either —
// payments are permanent. Correcting one happens through POST /:id/reverse,
// which creates a new linked record instead of touching the original.

import { Router } from "express";
import * as paymentController from "./payment.controller.js";

const router = Router();

router.post("/", paymentController.recordPayment);
router.get("/", paymentController.listPayments);
router.get("/:id", paymentController.getPayment);
router.post("/:id/reverse", paymentController.reversePayment);

export default router;
