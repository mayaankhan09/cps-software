// This file is the bridge between HTTP requests and the dues business logic
// in feeDue.service.js. Each function here reads the request, calls a
// service function, and sends back a JSON response.

import * as feeDueService from "./feeDue.service.js";
import { validateGenerateRequest } from "./feeDue.validation.js";

function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

// Manual trigger — runs the same generation logic the scheduled job uses,
// for whichever academicYear/month you ask for. Mainly here so you don't
// have to wait for the 5th of the month to test this.
export async function generateDues(req, res) {
  const errors = validateGenerateRequest(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const summary = await feeDueService.generateMonthlyDues(req.body.academicYear, req.body.month);
    res.json(summary);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listFeeDues(req, res) {
  try {
    const dues = await feeDueService.listFeeDues({
      status: req.query.status,
      className: req.query.className,
      month: req.query.month,
      student: req.query.student,
    });
    res.json(dues);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listUnpaid(req, res) {
  try {
    const dues = await feeDueService.listFeeDues({
      status: "unpaid",
      className: req.query.className,
      month: req.query.month,
      student: req.query.student,
    });
    res.json(dues);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listPaid(req, res) {
  try {
    const dues = await feeDueService.listFeeDues({
      status: "paid",
      className: req.query.className,
      month: req.query.month,
      student: req.query.student,
    });
    res.json(dues);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listOverdue(req, res) {
  try {
    const dues = await feeDueService.listOverdueDues();
    res.json(dues);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listForStudent(req, res) {
  try {
    const dues = await feeDueService.listDuesForStudent(req.params.studentId);
    res.json(dues);
  } catch (err) {
    sendError(res, err);
  }
}
