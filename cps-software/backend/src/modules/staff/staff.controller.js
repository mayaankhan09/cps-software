// This file is the bridge between HTTP requests and the staff business
// logic in staff.service.js. Each function here reads the request, calls a
// service function, and sends back a JSON response.

import * as staffService from "./staff.service.js";
import {
  validateStaffInput,
  validateStaffUpdate,
  validateStatusChange,
} from "./staff.validation.js";

function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

export async function createStaff(req, res) {
  const errors = validateStaffInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const staff = await staffService.createStaff(req.body);
    res.status(201).json(staff);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listStaff(req, res) {
  try {
    const staff = await staffService.listStaff({
      staffType: req.query.staffType,
      department: req.query.department,
      status: req.query.status,
    });
    res.json(staff);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getStaff(req, res) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    res.json(staff);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateStaff(req, res) {
  const errors = validateStaffUpdate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    res.json(staff);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateStatus(req, res) {
  const errors = validateStatusChange(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const staff = await staffService.updateStatus(req.params.id, req.body.status);
    res.json(staff);
  } catch (err) {
    sendError(res, err);
  }
}
