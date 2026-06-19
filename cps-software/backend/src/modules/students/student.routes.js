// This file lists the URLs (routes) for the students module and points each
// one at the controller function that handles it. It gets mounted at
// /api/students in src/routes/index.js.

import { Router } from "express";
import * as studentController from "./student.controller.js";

const router = Router();

// Listed before "/:id" so the word "resort-rolls" is never mistaken for a
// student's id — though since this is a POST and the others are GET/PUT/PATCH,
// they wouldn't actually collide anyway.
router.post("/resort-rolls", studentController.resortRolls);

router.get("/", studentController.listStudents);
router.get("/:id", studentController.getStudent);
router.put("/:id", studentController.updateStudent);
router.patch("/:id/status", studentController.updateStatus);

export default router;
