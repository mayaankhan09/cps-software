// This file lists the URLs (routes) for the staff module and points each
// one at the controller function that handles it. It gets mounted at
// /api/staff in src/routes/index.js.
//
// On purpose, there is NO delete route here — staff records are never
// hard-deleted, only marked "resigned" via PATCH /:id/status.

import { Router } from "express";
import * as staffController from "./staff.controller.js";

const router = Router();

router.post("/", staffController.createStaff);
router.get("/", staffController.listStaff);
router.get("/:id", staffController.getStaff);
router.put("/:id", staffController.updateStaff);
router.patch("/:id/status", staffController.updateStatus);

export default router;
