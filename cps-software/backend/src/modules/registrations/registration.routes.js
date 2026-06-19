// This file lists the URLs (routes) for the registrations module and points
// each one at the controller function that handles it. It gets mounted at
// /api/registrations in src/routes/index.js.

import { Router } from "express";
import * as registrationController from "./registration.controller.js";

const router = Router();

router.post("/", registrationController.createRegistration);
router.get("/", registrationController.listRegistrations);
router.get("/:id", registrationController.getRegistration);
router.put("/:id", registrationController.updateRegistration);
router.patch("/:id/approve", registrationController.approveRegistration);
router.patch("/:id/reject", registrationController.rejectRegistration);

export default router;
