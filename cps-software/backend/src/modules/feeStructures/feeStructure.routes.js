// This file lists the URLs (routes) for the fee structures module and
// points each one at the controller function that handles it. It gets
// mounted at /api/fee-structures in src/routes/index.js.
//
// On purpose, there is NO delete route here — fee structures are never
// hard-deleted, only deactivated via PATCH /:id/status, since past dues may
// still reference one.

import { Router } from "express";
import * as feeStructureController from "./feeStructure.controller.js";

const router = Router();

router.post("/", feeStructureController.createFeeStructure);
router.get("/", feeStructureController.listFeeStructures);
router.get("/:id", feeStructureController.getFeeStructure);
router.put("/:id", feeStructureController.updateFeeStructure);
router.patch("/:id/status", feeStructureController.updateStatus);

export default router;
